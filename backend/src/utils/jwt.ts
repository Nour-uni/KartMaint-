import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';
import db from '../models';

export interface JwtPayload {
  sub: string;        // user id
  email: string;
  role: 'admin' | 'controller' | 'mechanic';
  jti: string;        // unique token id — used for blacklisting
  type: 'access' | 'refresh';
}

const ACCESS_SECRET  = process.env.JWT_SECRET!;
const REFRESH_SECRET = process.env.JWT_REFRESH_SECRET!;
const ACCESS_TTL     = process.env.ACCESS_TOKEN_TTL  || '15m';
const REFRESH_TTL    = process.env.REFRESH_TOKEN_TTL || '7d';

/**
 * Issue a short-lived access token (default 15 min).
 */
export function generateAccessToken(payload: Omit<JwtPayload, 'jti' | 'type'>): string {
  const jti = uuidv4();
  return jwt.sign(
    { ...payload, jti, type: 'access' },
    ACCESS_SECRET,
    { expiresIn: ACCESS_TTL } as jwt.SignOptions
  );
}

/**
 * Issue a long-lived refresh token (default 7 days).
 */
export function generateRefreshToken(payload: Omit<JwtPayload, 'jti' | 'type'>): string {
  const jti = uuidv4();
  return jwt.sign(
    { ...payload, jti, type: 'refresh' },
    REFRESH_SECRET,
    { expiresIn: REFRESH_TTL } as jwt.SignOptions
  );
}

/**
 * Verify an access token and check it has not been blacklisted.
 * Throws if invalid, expired, or revoked.
 */
export async function verifyAccessToken(token: string): Promise<JwtPayload> {
  let decoded: JwtPayload;
  try {
    decoded = jwt.verify(token, ACCESS_SECRET) as JwtPayload;
  } catch (err: any) {
    throw new Error('Invalid or expired access token');
  }

  if (decoded.type !== 'access') {
    throw new Error('Token type mismatch');
  }

  // Check if this jti has been blacklisted (i.e. user logged out)
  const blacklisted = await db.TokenBlacklist.findOne({
    where: { jti: decoded.jti },
  });
  if (blacklisted) {
    throw new Error('Token has been revoked');
  }

  return decoded;
}

/**
 * Verify a refresh token (no blacklist check — handled via RefreshToken table).
 */
export function verifyRefreshToken(token: string): JwtPayload {
  try {
    const decoded = jwt.verify(token, REFRESH_SECRET) as JwtPayload;
    if (decoded.type !== 'refresh') throw new Error('Token type mismatch');
    return decoded;
  } catch (err: any) {
    throw new Error('Invalid or expired refresh token');
  }
}
