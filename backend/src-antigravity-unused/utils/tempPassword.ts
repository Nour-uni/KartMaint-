import crypto from 'crypto';

const CHARSET =
  'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789!@#$%';

/**
 * Generates a cryptographically random temporary password.
 * 12 characters, mix of upper/lower/digits/symbols.
 * Excludes ambiguous chars like 0, O, I, l to avoid copy errors.
 */
export function generateTempPassword(length = 12): string {
  const bytes = crypto.randomBytes(length);
  let password = '';
  for (let i = 0; i < length; i++) {
    password += CHARSET[bytes[i] % CHARSET.length];
  }
  return password;
}
