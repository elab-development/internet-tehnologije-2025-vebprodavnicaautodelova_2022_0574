import { prisma } from '../prismaClient.js';

const parseIntSafe = (v, def) => {
  const n = Number.parseInt(String(v), 10);
  return Number.isFinite(n) ? n : def;
};

/**
 * POST /api/tech-reviews
 * Role: mechanic
 * Body: { productId, text, rating }
 */
export const createTechReview = async (req, res) => {
  try {
    const { productId, text, rating } = req.body;

    const pid = Number(productId);
    const r = Number(rating);

    if (!Number.isInteger(pid) || pid <= 0) {
      return res.status(400).json({ message: 'Invalid productId' });
    }
    if (typeof text !== 'string' || text.trim().length < 5) {
      return res
        .status(400)
        .json({ message: 'text must be at least 5 characters' });
    }
    if (!Number.isInteger(r) || r < 1 || r > 5) {
      return res
        .status(400)
        .json({ message: 'rating must be an integer between 1 and 5' });
    }

    const product = await prisma.product.findUnique({
      where: { id: pid },
      select: { id: true, isActive: true },
    });

    if (!product || product.isActive === false) {
      return res.status(404).json({ message: 'Product not found' });
    }

    const review = await prisma.techReview.create({
      data: {
        userId: req.user.id,
        productId: pid,
        text: text.trim(),
        rating: r,
      },
      include: {
        user: { select: { id: true, fullName: true, role: true } },
        product: { select: { id: true, name: true, category: true } },
      },
    });

    return res.status(201).json({ review });
  } catch (err) {
    if (err?.code === 'P2002') {
      return res
        .status(409)
        .json({ message: 'You already reviewed this product' });
    }
    console.error(err);
    return res.status(500).json({ message: 'Create review failed' });
  }
};

/**
 * PUT /api/tech-reviews/:id
 * Role: mechanic
 * Body: { text?, rating? }
 * Only owner can update.
 */
export const updateTechReview = async (req, res) => {
  try {
    const id = parseIntSafe(req.params.id);
    if (!Number.isInteger(id)) {
      return res.status(400).json({ message: 'Invalid review id' });
    }

    const existing = await prisma.techReview.findUnique({ where: { id } });
    if (!existing) return res.status(404).json({ message: 'Review not found' });

    if (existing.userId !== req.user.id) {
      return res.status(403).json({ message: 'Forbidden' });
    }

    const data = {};

    if (typeof req.body.text !== 'undefined') {
      if (
        typeof req.body.text !== 'string' ||
        req.body.text.trim().length < 5
      ) {
        return res
          .status(400)
          .json({ message: 'text must be at least 5 characters' });
      }
      data.text = req.body.text.trim();
    }

    if (typeof req.body.rating !== 'undefined') {
      const r = Number(req.body.rating);
      if (!Number.isInteger(r) || r < 1 || r > 5) {
        return res
          .status(400)
          .json({ message: 'rating must be an integer between 1 and 5' });
      }
      data.rating = r;
    }

    if (Object.keys(data).length === 0) {
      return res
        .status(400)
        .json({ message: 'Provide text and/or rating to update' });
    }

    const updated = await prisma.techReview.update({
      where: { id },
      data,
      include: {
        user: { select: { id: true, fullName: true, role: true } },
        product: { select: { id: true, name: true, category: true } },
      },
    });

    return res.json({ review: updated });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Update review failed' });
  }
};

/**
 * DELETE /api/tech-reviews/:id
 * Role: mechanic
 * Only owner can delete.
 */
export const deleteTechReview = async (req, res) => {
  try {
    const id = parseIntSafe(req.params.id);
    if (!Number.isInteger(id)) {
      return res.status(400).json({ message: 'Invalid review id' });
    }

    const existing = await prisma.techReview.findUnique({ where: { id } });
    if (!existing) return res.status(404).json({ message: 'Review not found' });

    if (existing.userId !== req.user.id) {
      return res.status(403).json({ message: 'Forbidden' });
    }

    await prisma.techReview.delete({ where: { id } });
    return res.json({ message: 'Review deleted' });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Delete review failed' });
  }
};

/**
 * GET /api/tech-reviews
 * Public
 * Query: page, limit, productId(optional)
 */
export const listTechReviews = async (req, res) => {
  try {
    const page = Math.max(1, parseIntSafe(req.query.page, 1));
    const limit = Math.min(100, Math.max(1, parseIntSafe(req.query.limit, 10)));
    const skip = (page - 1) * limit;

    const where = {};

    if (req.query.productId) {
      const pid = Number(req.query.productId);
      if (!Number.isInteger(pid) || pid <= 0) {
        return res.status(400).json({ message: 'Invalid productId filter' });
      }
      where.productId = pid;
    }

    const [total, reviews] = await Promise.all([
      prisma.techReview.count({ where }),
      prisma.techReview.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
        include: {
          user: { select: { id: true, fullName: true, role: true } },
          product: { select: { id: true, name: true, category: true } },
        },
      }),
    ]);

    return res.json({
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
      reviews,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Failed to list reviews' });
  }
};

/**
 * GET /api/tech-reviews/:id
 * Public
 */
export const getTechReviewById = async (req, res) => {
  try {
    const id = parseIntSafe(req.params.id);
    if (!Number.isInteger(id)) {
      return res.status(400).json({ message: 'Invalid review id' });
    }

    const review = await prisma.techReview.findUnique({
      where: { id },
      include: {
        user: { select: { id: true, fullName: true, role: true } },
        product: { select: { id: true, name: true, category: true } },
      },
    });

    if (!review) return res.status(404).json({ message: 'Review not found' });
    return res.json({ review });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Failed to fetch review' });
  }
};

/**
 * GET /api/tech-reviews/product/:productId
 * Public
 * Query: page, limit
 */
export const listTechReviewsForProduct = async (req, res) => {
  try {
    const productId = parseIntSafe(req.params.productId);
    if (!Number.isInteger(productId)) {
      return res.status(400).json({ message: 'Invalid productId' });
    }

    const page = Math.max(1, parseIntSafe(req.query.page, 1));
    const limit = Math.min(100, Math.max(1, parseIntSafe(req.query.limit, 10)));
    const skip = (page - 1) * limit;

    const where = { productId };

    const [total, reviews] = await Promise.all([
      prisma.techReview.count({ where }),
      prisma.techReview.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
        include: {
          user: { select: { id: true, fullName: true, role: true } },
        },
      }),
    ]);

    return res.json({
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
      reviews,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Failed to list product reviews' });
  }
};