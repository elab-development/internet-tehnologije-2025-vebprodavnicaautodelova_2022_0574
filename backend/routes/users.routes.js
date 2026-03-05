import { Router } from 'express';
import { requireAuth, requireRole } from '../middlewares/auth.js';
import {
  getAllUsers,
  updateMyProfile,
  updateUserRole,
} from '../controllers/users.controller.js';

const router = Router();

router.get('/', requireAuth, requireRole('admin'), getAllUsers);
router.put('/:id/role', requireAuth, requireRole('admin'), updateUserRole);
router.put('/profile', requireAuth, updateMyProfile);

export default router;
