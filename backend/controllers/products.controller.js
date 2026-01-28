import { prisma } from '../prismaClient.js';
import { deleteFromCloudinary } from '../utils/cloudinary.js';

const parseIntSafe = (v, def) => {
  const n = Number.parseInt(String(v), 10);
  return Number.isFinite(n) ? n : def;
};

const normalizeSort = (sortBy, sortDir) => {
  const allowedSortBy = new Set(['createdAt', 'name', 'price', 'stock']);
  const by = allowedSortBy.has(sortBy) ? sortBy : 'createdAt';
  const dir = String(sortDir).toLowerCase() === 'asc' ? 'asc' : 'desc';
  return { by, dir };
};

const ensureStringArray = (value) => {
  if (Array.isArray(value))
    return value
      .map(String)
      .map((s) => s.trim())
      .filter(Boolean);
  if (typeof value === 'string') {
    return value
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);
  }
  return [];
};

const parseCompatibility = (raw) => {
  if (Array.isArray(raw)) return ensureStringArray(raw);
  if (typeof raw === 'string') {
    try {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return ensureStringArray(parsed);
    } catch {
      return ensureStringArray(raw);
    }
  }
  return [];
};

const parseImagesToRemove = (raw) => {
  if (!raw) return [];
  if (Array.isArray(raw))
    return raw
      .map(String)
      .map((s) => s.trim())
      .filter(Boolean);
  if (typeof raw === 'string') {
    try {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed))
        return parsed
          .map(String)
          .map((s) => s.trim())
          .filter(Boolean);
    } catch {
      return raw
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean);
    }
  }
  return [];
};

/**
 * POST /api/products
 * Admin-only
 * Content-Type: multipart/form-data
 * Fields: name, description, price, stock, category, compatibility (array or JSON string)
 * Files: images[] (at least 1)
 * isActive is default true
 */
export const createProduct = async (req, res) => {
  try {
    const { name, description, price, stock, category } = req.body;

    const uploadedImages = req.uploadedImages || [];
    const compatibility = parseCompatibility(req.body.compatibility);

    if (!name || !description || !price || !stock || !category) {
      return res.status(400).json({
        message: 'name, description, price, stock and category are required',
      });
    }

    if (uploadedImages.length < 1) {
      return res
        .status(400)
        .json({ message: 'At least one image is required' });
    }

    if (compatibility.length < 1) {
      return res
        .status(400)
        .json({ message: 'At least one compatibility value is required' });
    }

    const priceNum = Number(price);
    const stockNum = Number(stock);

    if (!Number.isFinite(priceNum) || priceNum <= 0) {
      return res.status(400).json({ message: 'price must be a number > 0' });
    }
    if (!Number.isInteger(stockNum) || stockNum <= 0) {
      return res.status(400).json({ message: 'stock must be an integer > 0' });
    }

    const product = await prisma.product.create({
      data: {
        name: String(name).trim(),
        description: String(description).trim(),
        price: priceNum,
        stock: stockNum,
        category: String(category).trim(),
        images: uploadedImages,
        compatibility,
      },
    });

    return res.status(201).json({ product });
  } catch (err) {
    if (err?.code === 'P2002') {
      return res.status(409).json({ message: 'Product name already exists' });
    }
    console.error(err);
    return res.status(500).json({ message: 'Create product failed' });
  }
};

/**
 * PUT /api/products/:id
 * Admin-only
 * Content-Type: multipart/form-data
 * Optional fields: name, description, price, stock, category, isActive, compatibility
 * Optional files: images[] (adds new images)
 * Optional: imagesToRemove (array or JSON string of publicIds)
 */
export const updateProduct = async (req, res) => {
  try {
    const id = parseIntSafe(req.params.id);
    if (!Number.isInteger(id)) {
      return res.status(400).json({ message: 'Invalid product id' });
    }

    const existing = await prisma.product.findUnique({ where: { id } });
    if (!existing)
      return res.status(404).json({ message: 'Product not found' });

    const uploadedImages = req.uploadedImages || [];
    const imagesToRemove = parseImagesToRemove(req.body.imagesToRemove);

    const data = {};

    if (typeof req.body.name !== 'undefined')
      data.name = String(req.body.name).trim();
    if (typeof req.body.description !== 'undefined')
      data.description = String(req.body.description).trim();

    if (typeof req.body.category !== 'undefined')
      data.category = String(req.body.category).trim();

    if (typeof req.body.isActive !== 'undefined') {
      const v = String(req.body.isActive).toLowerCase();
      data.isActive = v === 'true' || v === '1';
    }

    if (typeof req.body.price !== 'undefined') {
      const priceNum = Number(req.body.price);
      if (!Number.isFinite(priceNum) || priceNum <= 0) {
        return res.status(400).json({ message: 'price must be a number > 0' });
      }
      data.price = priceNum;
    }

    if (typeof req.body.stock !== 'undefined') {
      const stockNum = Number(req.body.stock);
      if (!Number.isInteger(stockNum) || stockNum < 0) {
        return res
          .status(400)
          .json({ message: 'stock must be an integer >= 0' });
      }
      data.stock = stockNum;
    }

    if (typeof req.body.compatibility !== 'undefined') {
      const comp = parseCompatibility(req.body.compatibility);
      if (comp.length < 1) {
        return res
          .status(400)
          .json({ message: 'compatibility must contain at least 1 value' });
      }
      data.compatibility = comp;
    }

    const currentImages = Array.isArray(existing.images) ? existing.images : [];
    let nextImages = currentImages;

    if (imagesToRemove.length > 0) {
      await Promise.allSettled(
        imagesToRemove.map((pid) => deleteFromCloudinary(pid)),
      );
      nextImages = nextImages.filter(
        (img) => !imagesToRemove.includes(img?.publicId),
      );
    }

    if (uploadedImages.length > 0) {
      nextImages = [...nextImages, ...uploadedImages];
    }

    if (imagesToRemove.length > 0 || uploadedImages.length > 0) {
      if (nextImages.length < 1) {
        return res
          .status(400)
          .json({ message: 'Product must have at least one image' });
      }
      data.images = nextImages;
    }

    const updated = await prisma.product.update({
      where: { id },
      data,
    });

    return res.json({ product: updated });
  } catch (err) {
    if (err?.code === 'P2002') {
      return res.status(409).json({ message: 'Product name already exists' });
    }
    console.error(err);
    return res.status(500).json({ message: 'Update product failed' });
  }
};

/**
 * DELETE /api/products/:id
 * Admin-only
 * Soft delete: isActive=false (keeps history)
 */
export const deleteProduct = async (req, res) => {
  try {
    const id = parseIntSafe(req.params.id);
    if (!Number.isInteger(id)) {
      return res.status(400).json({ message: 'Invalid product id' });
    }

    const existing = await prisma.product.findUnique({ where: { id } });
    if (!existing)
      return res.status(404).json({ message: 'Product not found' });

    await prisma.product.update({
      where: { id },
      data: { isActive: false },
    });

    return res.json({ message: 'Product deactivated' });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Delete product failed' });
  }
};

/**
 * GET /api/products
 * Public
 * Query:
 *  - page (default 1)
 *  - limit (default 12)
 *  - sortBy: createdAt|name|price|stock
 *  - sortDir: asc|desc
 *  - category: string
 *  - compatibility: string or comma-separated or repeated
 *  - q: search term (name/description/category)
 * Default: returns only isActive=true products
 */
export const listProducts = async (req, res) => {
  try {
    const page = Math.max(1, parseIntSafe(req.query.page, 1));
    const limit = Math.min(100, Math.max(1, parseIntSafe(req.query.limit, 12)));
    const skip = (page - 1) * limit;

    const { by: sortBy, dir: sortDir } = normalizeSort(
      req.query.sortBy,
      req.query.sortDir,
    );

    const where = {
      isActive: true,
    };

    if (req.query.category) {
      where.category = String(req.query.category).trim();
    }

    const q = req.query.q ? String(req.query.q).trim() : '';
    if (q) {
      where.OR = [
        { name: { contains: q } },
        { description: { contains: q } },
        { category: { contains: q } },
      ];
    }

    const compFilter = ensureStringArray(req.query.compatibility);

    const [total, items] = await Promise.all([
      prisma.product.count({ where }),
      prisma.product.findMany({
        where,
        orderBy: { [sortBy]: sortDir },
        skip,
        take: limit,
      }),
    ]);

    let products = items;

    if (compFilter.length > 0) {
      products = products.filter((p) => {
        const arr = Array.isArray(p.compatibility) ? p.compatibility : [];
        return compFilter.every((c) => arr.includes(c));
      });
    }

    return res.json({
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
      products,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Failed to list products' });
  }
};

/**
 * GET /api/products/:id
 * Public
 */
export const getProductById = async (req, res) => {
  try {
    const id = parseIntSafe(req.params.id);
    if (!Number.isInteger(id)) {
      return res.status(400).json({ message: 'Invalid product id' });
    }

    const product = await prisma.product.findUnique({ where: { id } });
    if (!product || product.isActive === false) {
      return res.status(404).json({ message: 'Product not found' });
    }

    return res.json({ product });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Failed to fetch product' });
  }
};