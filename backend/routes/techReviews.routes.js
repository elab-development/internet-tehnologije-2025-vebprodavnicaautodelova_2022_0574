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

router.get('/product/:productId', listTechReviewsForProduct);
router.get('/', listTechReviews);
router.get('/:id', getTechReviewById);

router.post('/', requireAuth, requireRole('mechanic'), createTechReview);
router.put('/:id', requireAuth, requireRole('mechanic'), updateTechReview);
router.delete('/:id', requireAuth, requireRole('mechanic'), deleteTechReview);

export default router;
