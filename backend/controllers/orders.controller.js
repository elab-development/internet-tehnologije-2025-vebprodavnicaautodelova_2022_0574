import { prisma } from '../prismaClient.js';

const parseIntSafe = (v, def) => {
  const n = Number.parseInt(String(v), 10);
  return Number.isFinite(n) ? n : def;
};

const normalizeSort = (sortBy, sortDir) => {
  const allowed = new Set(['createdAt', 'totalAmount', 'status']);
  const by = allowed.has(String(sortBy)) ? String(sortBy) : 'createdAt';
  const dir = String(sortDir).toLowerCase() === 'asc' ? 'asc' : 'desc';
  return { by, dir };
};

const isAdmin = (user) => user?.role === 'admin';

/**
 * POST /api/orders
 * Role: customer | mechanic
 * Body:
 * {
 *   items: [{ productId: number, quantity: number }, ...],
 *   address?: string
 * }
 *
 * Rules:
 * - status = pending
 * - address: if user has deliveryAddress -> copy it, else must be provided
 * - price per item is copied from current product price
 * - totalAmount is calculated from items
 */
export const createOrder = async (req, res) => {
  try {
    const { items, address } = req.body;

    if (!Array.isArray(items) || items.length < 1) {
      return res
        .status(400)
        .json({ message: 'items must be a non-empty array' });
    }

    const normalizedItems = items.map((it) => ({
      productId: Number(it?.productId),
      quantity: Number(it?.quantity),
    }));

    for (const it of normalizedItems) {
      if (!Number.isInteger(it.productId) || it.productId <= 0) {
        return res.status(400).json({ message: 'Invalid productId in items' });
      }
      if (!Number.isInteger(it.quantity) || it.quantity <= 0) {
        return res
          .status(400)
          .json({ message: 'quantity must be an integer > 0' });
      }
    }

    const mergedMap = new Map();
    for (const it of normalizedItems) {
      mergedMap.set(
        it.productId,
        (mergedMap.get(it.productId) || 0) + it.quantity,
      );
    }
    const mergedItems = Array.from(mergedMap.entries()).map(
      ([productId, quantity]) => ({
        productId,
        quantity,
      }),
    );

    const finalAddress =
      req.user.deliveryAddress?.trim() ||
      (typeof address === 'string' ? address.trim() : '');

    if (!finalAddress) {
      return res.status(400).json({
        message: 'address is required when user has no deliveryAddress',
      });
    }

    const productIds = mergedItems.map((i) => i.productId);

    const created = await prisma.$transaction(async (tx) => {
      const products = await tx.product.findMany({
        where: {
          id: { in: productIds },
          isActive: true,
        },
        select: {
          id: true,
          price: true,
          stock: true,
          isActive: true,
        },
      });

      if (products.length !== productIds.length) {
        return {
          error: {
            status: 400,
            message: 'One or more products not found or inactive',
          },
        };
      }

      for (const it of mergedItems) {
        const p = products.find((x) => x.id === it.productId);
        if (!p) continue;
        if (p.stock < it.quantity) {
          return {
            error: {
              status: 400,
              message: `Insufficient stock for productId=${it.productId}`,
            },
          };
        }
      }

      const orderItemsData = mergedItems.map((it) => {
        const p = products.find((x) => x.id === it.productId);
        const price = p.price;
        return {
          productId: it.productId,
          quantity: it.quantity,
          price,
        };
      });

      const totalAmountNum = orderItemsData.reduce((sum, it) => {
        const priceNum = Number(it.price);
        return sum + priceNum * it.quantity;
      }, 0);

      const order = await tx.order.create({
        data: {
          userId: req.user.id,
          status: 'pending',
          address: finalAddress,
          totalAmount: totalAmountNum,
          items: {
            create: orderItemsData,
          },
        },
        include: {
          items: true,
        },
      });

      for (const it of mergedItems) {
        await tx.product.update({
          where: { id: it.productId },
          data: { stock: { decrement: it.quantity } },
        });
      }

      return { order };
    });

    if (created?.error) {
      return res
        .status(created.error.status)
        .json({ message: created.error.message });
    }

    return res.status(201).json({ order: created.order });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Create order failed' });
  }
};

/**
 * GET /api/orders
 * Authenticated
 * Query:
 *  - page (default 1)
 *  - limit (default 10)
 *  - sortBy: createdAt | totalAmount | status
 *  - sortDir: asc | desc
 *  - status: pending|processing|shipped|delivered|cancelled (optional)
 *
 * Rules:
 * - customer/mechanic -> only own orders
 * - admin -> all orders
 */
export const listOrders = async (req, res) => {
  try {
    const page = Math.max(1, parseIntSafe(req.query.page, 1));
    const limit = Math.min(100, Math.max(1, parseIntSafe(req.query.limit, 10)));
    const skip = (page - 1) * limit;

    const { by: sortBy, dir: sortDir } = normalizeSort(
      req.query.sortBy,
      req.query.sortDir,
    );

    const where = {};

    if (!isAdmin(req.user)) {
      where.userId = req.user.id;
    }

    if (req.query.status) {
      const st = String(req.query.status);
      const allowed = [
        'pending',
        'processing',
        'shipped',
        'delivered',
        'cancelled',
      ];
      if (!allowed.includes(st)) {
        return res.status(400).json({ message: 'Invalid status filter' });
      }
      where.status = st;
    }

    const [total, orders] = await Promise.all([
      prisma.order.count({ where }),
      prisma.order.findMany({
        where,
        orderBy: { [sortBy]: sortDir },
        skip,
        take: limit,
        select: {
          id: true,
          status: true,
          address: true,
          totalAmount: true,
          createdAt: true,
          updatedAt: true,
          userId: true,
        },
      }),
    ]);

    return res.json({
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
      orders,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Failed to list orders' });
  }
};

/**
 * GET /api/orders/:id
 * Authenticated
 * Rules:
 * - customer/mechanic -> only own order
 * - admin -> any order
 * Returns order + items + populated product.
 */
export const getOrderById = async (req, res) => {
  try {
    const id = parseIntSafe(req.params.id);
    if (!Number.isInteger(id)) {
      return res.status(400).json({ message: 'Invalid order id' });
    }

    const order = await prisma.order.findUnique({
      where: { id },
      include: {
        items: {
          include: {
            product: true,
          },
        },
      },
    });

    if (!order) return res.status(404).json({ message: 'Order not found' });

    if (!isAdmin(req.user) && order.userId !== req.user.id) {
      return res.status(403).json({ message: 'Forbidden' });
    }

    return res.json({ order });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Failed to fetch order' });
  }
};

/**
 * PUT /api/orders/:id/status
 * Authenticated
 * Body: { status }
 *
 * Rules:
 * - customer/mechanic: can set status to 'cancelled' only if current is 'pending' AND order is theirs
 * - admin: can set status to any value if order is NOT delivered (completed)
 * - No deletion route.
 */
export const updateOrderStatus = async (req, res) => {
  try {
    const id = parseIntSafe(req.params.id);
    const { status } = req.body;

    if (!Number.isInteger(id)) {
      return res.status(400).json({ message: 'Invalid order id' });
    }

    if (!status || typeof status !== 'string') {
      return res.status(400).json({ message: 'status is required' });
    }

    const allowed = [
      'pending',
      'processing',
      'shipped',
      'delivered',
      'cancelled',
    ];
    if (!allowed.includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }

    const order = await prisma.order.findUnique({ where: { id } });
    if (!order) return res.status(404).json({ message: 'Order not found' });

    const admin = isAdmin(req.user);

    if (!admin) {
      if (order.userId !== req.user.id) {
        return res.status(403).json({ message: 'Forbidden' });
      }

      if (order.status !== 'pending') {
        return res.status(400).json({
          message: 'You can cancel only pending orders',
        });
      }

      if (status !== 'cancelled') {
        return res.status(400).json({
          message: 'You can only change status to cancelled',
        });
      }
    } else {
      if (order.status === 'delivered') {
        return res.status(400).json({
          message: 'Delivered orders cannot be modified',
        });
      }
    }

    const updated = await prisma.order.update({
      where: { id },
      data: { status },
      include: {
        items: true,
      },
    });

    return res.json({ order: updated });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Status update failed' });
  }
};
