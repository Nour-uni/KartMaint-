import { Request, Response } from 'express';
import db from '../models';
import { logAudit } from '../utils/auditLogger';
import { generateTempPassword } from '../utils/tempPassword';
import { sendWelcomeEmail } from '../utils/mailer';

/**
 * POST /api/admin/users
 * Admin-only: creates a new controller or mechanic account.
 * Auto-generates a temporary password and sends a welcome email.
 */
export async function createUser(req: Request, res: Response): Promise<void> {
  const { fullName, email, role } = req.body;
  const adminId = req.user!.sub;

  // 1. Validate required fields
  if (!fullName || !email || !role) {
    res.status(400).json({ success: false, message: 'fullName, email, and role are required' });
    return;
  }

  // 2. Enforce role restriction — admin can only create controller or mechanic
  if (!['controller', 'mechanic'].includes(role)) {
    res.status(400).json({
      success: false,
      message: 'Invalid role. Admins can only create "controller" or "mechanic" accounts.',
    });
    return;
  }

  // 3. Check for duplicate email
  const existing = await db.User.findOne({
    where: { email: email.trim().toLowerCase() },
  });
  if (existing) {
    res.status(409).json({ success: false, message: 'An account with this email already exists' });
    return;
  }

  // 4. Generate a secure temporary password
  const tempPassword = generateTempPassword();

  // 5. Create the user (password virtual setter hashes it automatically)
  const newUser = await db.User.create({
    fullName: fullName.trim(),
    email: email.trim().toLowerCase(),
    password: tempPassword,
    passwordHash: '', // will be overwritten by virtual setter above
    role,
    mustChangePassword: true, // forces password change on first login
    isActive: true,
  });

  // 6. Audit log
  await logAudit({
    userId: adminId,
    action: 'USER_CREATED',
    entity: 'User',
    entityId: newUser.id,
    ipAddress: req.ip || 'unknown',
    changes: {
      createdBy: adminId,
      role,
      email: newUser.email,
      mustChangePassword: true,
    },
  });

  // 7. Send welcome email with temp credentials (logs to console if SMTP not configured)
  await sendWelcomeEmail(newUser.email, newUser.fullName, tempPassword);

  res.status(201).json({
    success: true,
    message: 'Account created successfully',
    user: {
      id: newUser.id,
      fullName: newUser.fullName,
      email: newUser.email,
      role: newUser.role,
      mustChangePassword: newUser.mustChangePassword,
    },
    // Return temp password in response so admin can share it manually if needed
    // In production, rely on the email instead
    tempPassword,
  });
}
