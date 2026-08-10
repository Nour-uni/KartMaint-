import { Request, Response, NextFunction } from 'express';

interface AttemptRecord {
  count: number;
  firstAttemptAt: number;
}

// In-memory store: ip -> attempt record
// Note: For multi-process/load-balanced deployments, replace with Redis.
const store = new Map<string, AttemptRecord>();

const MAX_ATTEMPTS = parseInt(process.env.LOCKOUT_ATTEMPTS || '5', 10);
const WINDOW_MS    = parseInt(process.env.LOCKOUT_DURATION_MINUTES || '15', 10) * 60 * 1000;

/**
 * Rate limiter middleware for the login endpoint.
 * Blocks an IP after MAX_ATTEMPTS failed requests within WINDOW_MS.
 */
export function loginRateLimiter(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  const ip = req.ip || req.socket.remoteAddress || 'unknown';
  const now = Date.now();

  const record = store.get(ip);

  if (record) {
    // Reset window if it has expired
    if (now - record.firstAttemptAt > WINDOW_MS) {
      store.set(ip, { count: 1, firstAttemptAt: now });
      return next();
    }

    if (record.count >= MAX_ATTEMPTS) {
      const retryAfterSeconds = Math.ceil(
        (WINDOW_MS - (now - record.firstAttemptAt)) / 1000
      );
      res.status(429).json({
        success: false,
        message: `Too many login attempts. Try again in ${Math.ceil(retryAfterSeconds / 60)} minute(s).`,
        retryAfterSeconds,
      });
      return;
    }

    record.count += 1;
  } else {
    store.set(ip, { count: 1, firstAttemptAt: now });
  }

  next();
}

/**
 * Call this after a successful login to reset the IP's attempt counter.
 */
export function resetLoginAttempts(ip: string): void {
  store.delete(ip);
}
