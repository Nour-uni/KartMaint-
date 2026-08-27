import { Request, Response, NextFunction } from 'express';
import { verifyAccessToken, JwtPayload } from '../utils/jwt';

// Extend Express Request so req.user is typed throughout the app
declare global {
  namespace Express {
    interface Request {
      user?: JwtPayload;
    }
  }
}

/**
 * Middleware: extracts and verifies Bearer token from Authorization header.
 * On success, attaches decoded payload to req.user.
 */
export async function authenticate(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  const authHeader = req.headers['authorization'];

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({ success: false, message: 'No token provided' });
    return;
  }

  const token = authHeader.slice(7); // strip "Bearer "

  try {
    const payload = await verifyAccessToken(token);
    req.user = payload;
    next();
  } catch (err: any) {
    res.status(401).json({ success: false, message: err.message });
  }
}

/**
 * Middleware factory: restricts route access to specific roles.
 * Must be used AFTER `authenticate`.
 *
 * Usage: router.get('/admin', authenticate, requireRole('admin'), handler)
 */
export function requireRole(...roles: Array<'admin' | 'controller' | 'mechanic'>) {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Not authenticated' });
      return;
    }
    if (!roles.includes(req.user.role)) {
      res.status(403).json({
        success: false,
        message: `Access denied. Required role: ${roles.join(' or ')}`,
      });
      return;
    }
    next();
  };
}
