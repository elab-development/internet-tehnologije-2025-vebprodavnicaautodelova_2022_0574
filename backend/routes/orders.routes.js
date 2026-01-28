import { Router } from 'express';
import { requireAuth, requireRole } from '../middlewares/auth.js';
import {
  createOrder,
  listOrders,
  getOrderById,
  updateOrderStatus,
} from '../controllers/orders.controller.js';

const router = Router();

router.post('/', requireAuth, requireRole('customer', 'mechanic'), createOrder);
router.get('/', requireAuth, listOrders);
router.get('/:id', requireAuth, getOrderById);
router.put('/:id/status', requireAuth, updateOrderStatus);

export default router;