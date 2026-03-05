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

router.get('/', listProducts);
router.get('/:id', getProductById);

router.post(
  '/',
  requireAuth,
  requireRole('admin'),
  upload.array('images', 10),
  uploadMultipleImages,
  createProduct,
);

router.put(
  '/:id',
  requireAuth,
  requireRole('admin'),
  upload.array('images', 10),
  uploadMultipleImages,
  updateProduct,
);

router.delete('/:id', requireAuth, requireRole('admin'), deleteProduct);

export default router;
