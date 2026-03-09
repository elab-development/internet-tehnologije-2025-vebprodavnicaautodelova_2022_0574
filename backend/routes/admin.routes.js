import { Router } from 'express';
import { requireAuth, requireRole } from '../middlewares/auth.js';
import { getAdminStats } from '../controllers/admin.controller.js';

const router = Router();

/**
 * @openapi
 * /api/admin/stats:
 *   get:
 *     tags: [Admin]
 *     summary: Admin dashboard stats (KPIs + charts)
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: OK
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AdminStatsResponse'
 *       401:
 *         description: Not authenticated
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Error' }
 *       403:
 *         description: Forbidden
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Error' }
 */
router.get('/stats', requireAuth, requireRole('admin'), getAdminStats);

export default router;
