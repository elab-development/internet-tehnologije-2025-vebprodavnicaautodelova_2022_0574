import { Router } from 'express';
import { requireAuth, requireRole } from '../middlewares/auth.js';
import {
  createTechReview,
  updateTechReview,
  deleteTechReview,
  listTechReviews,
  getTechReviewById,
  listTechReviewsForProduct,
} from '../controllers/techReviews.controller.js';

const router = Router();

/**
 * @openapi
 * /api/tech-reviews/product/{productId}:
 *   get:
 *     tags: [TechReviews]
 *     summary: List reviews for a product (public)
 *     parameters:
 *       - in: path
 *         name: productId
 *         required: true
 *         schema: { type: integer, example: 10 }
 *       - in: query
 *         name: page
 *         schema: { type: integer, example: 1 }
 *       - in: query
 *         name: limit
 *         schema: { type: integer, example: 10 }
 *     responses:
 *       200:
 *         description: OK
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/TechReviewsListResponse' }
 */
router.get('/product/:productId', listTechReviewsForProduct);

/**
 * @openapi
 * /api/tech-reviews:
 *   get:
 *     tags: [TechReviews]
 *     summary: List reviews (public)
 *     parameters:
 *       - in: query
 *         name: page
 *         schema: { type: integer, example: 1 }
 *       - in: query
 *         name: limit
 *         schema: { type: integer, example: 10 }
 *       - in: query
 *         name: productId
 *         schema: { type: integer, example: 10 }
 *     responses:
 *       200:
 *         description: OK
 */
router.get('/', listTechReviews);

/**
 * @openapi
 * /api/tech-reviews/{id}:
 *   get:
 *     tags: [TechReviews]
 *     summary: Get review by id (public)
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer, example: 1 }
 *     responses:
 *       200:
 *         description: OK
 */
router.get('/:id', getTechReviewById);

/**
 * @openapi
 * /api/tech-reviews:
 *   post:
 *     tags: [TechReviews]
 *     summary: Create tech review (mechanic only)
 *     security:
 *       - cookieAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema: { $ref: '#/components/schemas/CreateTechReviewRequest' }
 *     responses:
 *       201:
 *         description: Created
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 review: { $ref: '#/components/schemas/TechReview' }
 */
router.post('/', requireAuth, requireRole('mechanic'), createTechReview);

/**
 * @openapi
 * /api/tech-reviews/{id}:
 *   put:
 *     tags: [TechReviews]
 *     summary: Update own review (mechanic only)
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema: { $ref: '#/components/schemas/UpdateTechReviewRequest' }
 *     responses:
 *       200:
 *         description: OK
 */
router.put('/:id', requireAuth, requireRole('mechanic'), updateTechReview);

/**
 * @openapi
 * /api/tech-reviews/{id}:
 *   delete:
 *     tags: [TechReviews]
 *     summary: Delete own review (mechanic only)
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200:
 *         description: OK
 */
router.delete('/:id', requireAuth, requireRole('mechanic'), deleteTechReview);

export default router;
