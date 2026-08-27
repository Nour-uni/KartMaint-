import { Router } from 'express';
import { authenticate } from '../middleware/authenticate';
import { loginRateLimiter } from '../middleware/rateLimiter';
import {
  login,
  refresh,
  logout,
  changePassword,
  forgotPassword,
  resetPassword,
} from '../controllers/authController';

const router = Router();

/**
 * POST /api/auth/login
 * Body: { email, password }
 * Returns: { accessToken, refreshToken, requiresPasswordChange, user }
 */
router.post('/login', loginRateLimiter, login);

/**
 * POST /api/auth/refresh
 * Body: { refreshToken }
 * Returns: { accessToken, refreshToken }
 */
router.post('/refresh', refresh);

/**
 * POST /api/auth/logout
 * Header: Authorization: Bearer <accessToken>
 * Body (optional): { refreshToken }
 */
router.post('/logout', authenticate, logout);

/**
 * POST /api/auth/change-password
 * Header: Authorization: Bearer <accessToken>
 * Body: { currentPassword, newPassword }
 */
router.post('/change-password', authenticate, changePassword);

/**
 * POST /api/auth/forgot-password
 * Body: { email }
 * Always returns 200 (no user enumeration)
 */
router.post('/forgot-password', forgotPassword);

/**
 * POST /api/auth/reset-password
 * Body: { token, newPassword }
 */
router.post('/reset-password', resetPassword);

export default router;
