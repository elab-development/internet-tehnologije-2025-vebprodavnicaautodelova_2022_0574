import { Router } from 'express';
import { requireAuth, requireRole } from '../middlewares/auth.js';
import {
  createProduct,
  updateProduct,
  deleteProduct,
  listProducts,
  getProductById,
} from '../controllers/products.controller.js';
import { upload, uploadMultipleImages } from '../middlewares/uploadMultiple.js';

const router = Router();

/**
 * @openapi
 * /api/products:
 *   get:
 *     tags: [Products]
 *     summary: List products (public)
 *     parameters:
 *       - in: query
 *         name: page
 *         schema: { type: integer, example: 1 }
 *       - in: query
 *         name: limit
 *         schema: { type: integer, example: 12 }
 *       - in: query
 *         name: sortBy
 *         schema: { type: string, enum: [createdAt, name, price, stock], example: createdAt }
 *       - in: query
 *         name: sortDir
 *         schema: { type: string, enum: [asc, desc], example: desc }
 *       - in: query
 *         name: category
 *         schema: { type: string, example: Brakes }
 *       - in: query
 *         name: q
 *         schema: { type: string, example: brake }
 *       - in: query
 *         name: compatibility
 *         schema:
 *           oneOf:
 *             - type: string
 *             - type: array
 *               items: { type: string }
 *     responses:
 *       200:
 *         description: OK
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/ProductsListResponse' }
 */
router.get('/', listProducts);

/**
 * @openapi
 * /api/products/{id}:
 *   get:
 *     tags: [Products]
 *     summary: Get product by id (public)
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer, example: 10 }
 *     responses:
 *       200:
 *         description: OK
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 product: { $ref: '#/components/schemas/Product' }
 *       404:
 *         description: Not found
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Error' }
 */
router.get('/:id', getProductById);

/**
 * @openapi
 * /api/products:
 *   post:
 *     tags: [Products]
 *     summary: Create product (admin only)
 *     security:
 *       - cookieAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required: [name, description, price, stock, category, compatibility, images]
 *             properties:
 *               name: { type: string }
 *               description: { type: string }
 *               price: { type: number }
 *               stock: { type: integer }
 *               category: { type: string }
 *               compatibility:
 *                 description: JSON string or comma separated values
 *                 oneOf:
 *                   - type: string
 *                   - type: array
 *                     items: { type: string }
 *               images:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: binary
 *     responses:
 *       201:
 *         description: Created
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 product: { $ref: '#/components/schemas/Product' }
 */
router.post(
  '/',
  requireAuth,
  requireRole('admin'),
  upload.array('images', 10),
  uploadMultipleImages,
  createProduct,
);

/**
 * @openapi
 * /api/products/{id}:
 *   put:
 *     tags: [Products]
 *     summary: Update product (admin only)
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
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               name: { type: string }
 *               description: { type: string }
 *               price: { type: number }
 *               stock: { type: integer }
 *               category: { type: string }
 *               isActive: { type: boolean }
 *               compatibility:
 *                 oneOf:
 *                   - type: string
 *                   - type: array
 *                     items: { type: string }
 *               imagesToRemove:
 *                 description: JSON string array of Cloudinary publicIds
 *                 type: string
 *               images:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: binary
 *     responses:
 *       200:
 *         description: OK
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 product: { $ref: '#/components/schemas/Product' }
 */
router.put(
  '/:id',
  requireAuth,
  requireRole('admin'),
  upload.array('images', 10),
  uploadMultipleImages,
  updateProduct,
);

/**
 * @openapi
 * /api/products/{id}:
 *   delete:
 *     tags: [Products]
 *     summary: Soft delete product (admin only)
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
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message: { type: string, example: Product deactivated }
 */
router.delete('/:id', requireAuth, requireRole('admin'), deleteProduct);

export default router;
