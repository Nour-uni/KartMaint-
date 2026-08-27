import { Router } from 'express';
import { authenticate } from '../middleware/authenticate';
import { requireRole } from '../middleware/authenticate';
import { createUser } from '../controllers/adminController';

const router = Router();

// All admin routes require a valid token AND admin role
router.use(authenticate, requireRole('admin'));

/**
 * POST /api/admin/users
 * Body: { fullName, email, role: 'controller' | 'mechanic' }
 * Returns: { user, tempPassword }
 */
router.post('/users', createUser);

export default router;
