import { Request, Response } from 'express';
import crypto from 'crypto';
import bcrypt from 'bcryptjs';
import db from '../models';
import { logAudit } from '../utils/auditLogger';
import {
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken,
} from '../utils/jwt';
import { sendPasswordResetEmail } from '../utils/mailer';
import { resetLoginAttempts } from '../middleware/rateLimiter';

const LOCKOUT_ATTEMPTS = parseInt(process.env.LOCKOUT_ATTEMPTS || '5', 10);
const LOCKOUT_MINUTES  = parseInt(process.env.LOCKOUT_DURATION_MINUTES || '15', 10);
const REFRESH_TTL_DAYS = 7;

// ─── Helper ───────────────────────────────────────────────────────────────────

function getIp(req: Request): string {
  return (req.ip || req.socket.remoteAddress || 'unknown').replace('::ffff:', '');
}

function tokenExpiryDate(days: number): Date {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d;
}

// ─── POST /api/auth/login ─────────────────────────────────────────────────────

export async function login(req: Request, res: Response): Promise<void> {
  const { email, password } = req.body;
  const ip = getIp(req);

  if (!email || !password) {
    res.status(400).json({ success: false, message: 'Email and password are required' });
    return;
  }

  // 1. Find user
  const user = await db.User.findOne({ where: { email: email.trim().toLowerCase() } });

  if (!user || !user.isActive) {
    res.status(401).json({ success: false, message: 'Invalid credentials' });
    return;
  }

  // 2. Check account lockout
  if (user.lockedUntil && new Date() < user.lockedUntil) {
    const minutesLeft = Math.ceil(
      (user.lockedUntil.getTime() - Date.now()) / 60000
    );
    res.status(423).json({
      success: false,
      message: `Account locked. Try again in ${minutesLeft} minute(s).`,
    });
    return;
  }

  // 3. Verify password
  const passwordValid = await bcrypt.compare(password, user.passwordHash);

  if (!passwordValid) {
    const attempts = user.failedLoginAttempts + 1;
    const updateData: any = { failedLoginAttempts: attempts };

    if (attempts >= LOCKOUT_ATTEMPTS) {
      const lockedUntil = new Date(Date.now() + LOCKOUT_MINUTES * 60 * 1000);
      updateData.lockedUntil = lockedUntil;

      await logAudit({
        userId: user.id,
        action: 'ACCOUNT_LOCKED',
        entity: 'User',
        entityId: user.id,
        ipAddress: ip,
        changes: { reason: 'Too many failed login attempts', lockedUntil },
      });
    }

    await user.update(updateData);

    res.status(401).json({
      success: false,
      message: 'Invalid credentials',
      attemptsRemaining: Math.max(0, LOCKOUT_ATTEMPTS - attempts),
    });
    return;
  }

  // 4. Successful login — reset lockout counters
  await user.update({ failedLoginAttempts: 0, lockedUntil: null });
  resetLoginAttempts(ip);

  // 5. Issue tokens
  const tokenPayload = { sub: user.id, email: user.email, role: user.role };
  const accessToken  = generateAccessToken(tokenPayload);
  const refreshToken = generateRefreshToken(tokenPayload);

  // 6. Persist refresh token in DB
  await db.RefreshToken.create({
    userId: user.id,
    token: refreshToken,
    expiresAt: tokenExpiryDate(REFRESH_TTL_DAYS),
    createdByIp: ip,
  });

  await logAudit({
    userId: user.id,
    action: 'LOGIN_SUCCESS',
    entity: 'User',
    entityId: user.id,
    ipAddress: ip,
  });

  res.json({
    success: true,
    accessToken,
    refreshToken,
    requiresPasswordChange: user.mustChangePassword,
    user: {
      id: user.id,
      fullName: user.fullName,
      email: user.email,
      role: user.role,
    },
  });
}

// ─── POST /api/auth/refresh ───────────────────────────────────────────────────

export async function refresh(req: Request, res: Response): Promise<void> {
  const { refreshToken } = req.body;

  if (!refreshToken) {
    res.status(400).json({ success: false, message: 'Refresh token is required' });
    return;
  }

  // 1. Verify JWT signature
  let decoded;
  try {
    decoded = verifyRefreshToken(refreshToken);
  } catch (err: any) {
    res.status(401).json({ success: false, message: err.message });
    return;
  }

  // 2. Check it exists in DB and is not revoked
  const storedToken = await db.RefreshToken.findOne({
    where: { token: refreshToken, userId: decoded.sub },
  });

  if (!storedToken || storedToken.revokedAt || new Date() > storedToken.expiresAt) {
    res.status(401).json({ success: false, message: 'Refresh token is invalid or expired' });
    return;
  }

  // 3. Rotate: revoke old token, issue new pair
  const ip = getIp(req);
  const newAccessToken  = generateAccessToken({ sub: decoded.sub, email: decoded.email, role: decoded.role });
  const newRefreshToken = generateRefreshToken({ sub: decoded.sub, email: decoded.email, role: decoded.role });

  await storedToken.update({
    revokedAt: new Date(),
    replacedByToken: newRefreshToken,
  });

  await db.RefreshToken.create({
    userId: decoded.sub,
    token: newRefreshToken,
    expiresAt: tokenExpiryDate(REFRESH_TTL_DAYS),
    createdByIp: ip,
  });

  res.json({ success: true, accessToken: newAccessToken, refreshToken: newRefreshToken });
}

// ─── POST /api/auth/logout ────────────────────────────────────────────────────

export async function logout(req: Request, res: Response): Promise<void> {
  const user    = req.user!;
  const { refreshToken } = req.body;
  const ip = getIp(req);

  // 1. Blacklist the current access token's jti so it can't be reused
  const accessToken = req.headers['authorization']?.slice(7) || '';
  // Decode without verify to get expiry (already verified by middleware)
  const parts = accessToken.split('.');
  let expiresAt = new Date(Date.now() + 15 * 60 * 1000); // fallback 15min
  try {
    const payload = JSON.parse(Buffer.from(parts[1], 'base64').toString());
    if (payload.exp) expiresAt = new Date(payload.exp * 1000);
  } catch {}

  await db.TokenBlacklist.create({
    jti: user.jti,
    expiresAt,
    reason: 'LOGOUT',
  });

  // 2. Revoke refresh token if provided
  if (refreshToken) {
    await db.RefreshToken.update(
      { revokedAt: new Date() },
      { where: { token: refreshToken, userId: user.sub } }
    );
  }

  await logAudit({
    userId: user.sub,
    action: 'LOGOUT',
    entity: 'User',
    entityId: user.sub,
    ipAddress: ip,
  });

  res.json({ success: true, message: 'Logged out successfully' });
}

// ─── POST /api/auth/change-password ──────────────────────────────────────────

export async function changePassword(req: Request, res: Response): Promise<void> {
  const { currentPassword, newPassword } = req.body;
  const userId = req.user!.sub;
  const ip = getIp(req);

  if (!currentPassword || !newPassword) {
    res.status(400).json({ success: false, message: 'currentPassword and newPassword are required' });
    return;
  }

  if (newPassword.length < 8) {
    res.status(400).json({ success: false, message: 'New password must be at least 8 characters' });
    return;
  }

  const user = await db.User.findByPk(userId);
  if (!user) {
    res.status(404).json({ success: false, message: 'User not found' });
    return;
  }

  const valid = await bcrypt.compare(currentPassword, user.passwordHash);
  if (!valid) {
    res.status(401).json({ success: false, message: 'Current password is incorrect' });
    return;
  }

  // Virtual setter hashes the password automatically (see User model)
  await user.update({ password: newPassword, mustChangePassword: false });

  await logAudit({
    userId,
    action: 'PASSWORD_CHANGED',
    entity: 'User',
    entityId: userId,
    ipAddress: ip,
  });

  res.json({ success: true, message: 'Password changed successfully' });
}

// ─── POST /api/auth/forgot-password ──────────────────────────────────────────

export async function forgotPassword(req: Request, res: Response): Promise<void> {
  const { email } = req.body;

  if (!email) {
    res.status(400).json({ success: false, message: 'Email is required' });
    return;
  }

  // Always return 200 to prevent user enumeration attacks
  const user = await db.User.findOne({
    where: { email: email.trim().toLowerCase(), isActive: true },
  });

  if (user) {
    // Generate a secure random token (raw) and store its hash
    const rawToken    = crypto.randomBytes(32).toString('hex');
    const hashedToken = crypto.createHash('sha256').update(rawToken).digest('hex');
    const expires     = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    await user.update({
      passwordResetToken: hashedToken,
      passwordResetExpires: expires,
    });

    await logAudit({
      userId: user.id,
      action: 'PASSWORD_RESET_REQUESTED',
      entity: 'User',
      entityId: user.id,
      ipAddress: getIp(req),
    });

  // Send email (or log to console in dev)
  try {
    await sendPasswordResetEmail(user.email, rawToken);
  } catch (emailErr: any) {
    console.warn('⚠️ Failed to send password reset email:', emailErr.message);
    // Non-fatal: reset token is still saved, user/admin can retry
  }
  }

  res.json({
    success: true,
    message: 'If that email is registered, a reset link has been sent.',
  });
}

// ─── POST /api/auth/reset-password ───────────────────────────────────────────

export async function resetPassword(req: Request, res: Response): Promise<void> {
  const { token, newPassword } = req.body;
  const ip = getIp(req);

  if (!token || !newPassword) {
    res.status(400).json({ success: false, message: 'token and newPassword are required' });
    return;
  }

  if (newPassword.length < 8) {
    res.status(400).json({ success: false, message: 'Password must be at least 8 characters' });
    return;
  }

  // Hash the incoming raw token and look it up
  const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

  const user = await db.User.findOne({
    where: { passwordResetToken: hashedToken },
  });

  if (!user || !user.passwordResetExpires || new Date() > user.passwordResetExpires) {
    res.status(400).json({ success: false, message: 'Reset token is invalid or has expired' });
    return;
  }

  // Apply new password and clear reset fields
  await user.update({
    password: newPassword,
    mustChangePassword: false,
    passwordResetToken: null,
    passwordResetExpires: null,
    failedLoginAttempts: 0,
    lockedUntil: null,
  });

  await logAudit({
    userId: user.id,
    action: 'PASSWORD_RESET_COMPLETED',
    entity: 'User',
    entityId: user.id,
    ipAddress: ip,
  });

  res.json({ success: true, message: 'Password has been reset. You can now log in.' });
}
