import { prisma } from '../prismaClient.js';

const toNumber = (v) => (v == null ? 0 : Number(v));

const pad2 = (n) => String(n).padStart(2, '0');

const monthKey = (d) => `${d.getFullYear()}-${pad2(d.getMonth() + 1)}`;

/**
 * GET /api/admin/stats
 * Admin-only
 *
 * Returns:
 *  - kpis (cards)
 *  - charts (datasets)
 */
export const getAdminStats = async (req, res) => {
  try {
    // KPI: users + roles
    const [
      totalUsers,
      totalCustomers,
      totalMechanics,
      totalAdmins,
      totalProducts,
      activeProducts,
      totalOrders,
      totalReviews,
      avgRatingAgg,
      revenueAggAllNonCancelled,
      revenueAggDelivered,
      lowStockProducts,
      ordersByStatusAgg,
      productsByCategoryAgg,
    ] = await Promise.all([
      prisma.user.count(),
      prisma.user.count({ where: { role: 'customer' } }),
      prisma.user.count({ where: { role: 'mechanic' } }),
      prisma.user.count({ where: { role: 'admin' } }),

      prisma.product.count(),
      prisma.product.count({ where: { isActive: true } }),

      prisma.order.count(),
      prisma.techReview.count(),

      prisma.techReview.aggregate({ _avg: { rating: true } }),

      // “Revenue” varijanta 1: sve osim cancelled
      prisma.order.aggregate({
        where: { status: { not: 'cancelled' } },
        _sum: { totalAmount: true },
        _avg: { totalAmount: true },
      }),

      // “Revenue” varijanta 2: samo delivered (realizovano)
      prisma.order.aggregate({
        where: { status: 'delivered' },
        _sum: { totalAmount: true },
      }),

      // Low stock (npr. <= 5)
      prisma.product.count({ where: { isActive: true, stock: { lte: 5 } } }),

      // Chart: orders by status
      prisma.order.groupBy({
        by: ['status'],
        _count: { _all: true },
      }),

      // Chart: products by category
      prisma.product.groupBy({
        by: ['category'],
        _count: { _all: true },
        where: { isActive: true },
      }),
    ]);

    const avgRating = avgRatingAgg?._avg?.rating ?? null;

    // --------- Chart: revenue by month (last 12 months) ----------
    const now = new Date();
    const start12 = new Date(now);
    start12.setMonth(start12.getMonth() - 11);
    start12.setDate(1);
    start12.setHours(0, 0, 0, 0);

    // Uzmi sve “non-cancelled” order-e u periodu i grupiši po mesecu u JS
    const orders12 = await prisma.order.findMany({
      where: {
        createdAt: { gte: start12 },
        status: { not: 'cancelled' },
      },
      select: { createdAt: true, totalAmount: true },
    });

    // pripremi mapu svih 12 meseci (da chart ne “puca” kad nema podataka)
    const months = [];
    const cursor = new Date(start12);
    for (let i = 0; i < 12; i++) {
      months.push(monthKey(cursor));
      cursor.setMonth(cursor.getMonth() + 1);
    }

    const revenueByMonthMap = new Map(months.map((m) => [m, 0]));
    for (const o of orders12) {
      const key = monthKey(o.createdAt);
      if (!revenueByMonthMap.has(key)) continue;
      revenueByMonthMap.set(
        key,
        revenueByMonthMap.get(key) + toNumber(o.totalAmount),
      );
    }

    const revenueByMonth = months.map((m) => ({
      month: m,
      revenue: Number(revenueByMonthMap.get(m).toFixed(2)),
    }));

    // --------- Chart: top products (by qty) last 30 days ----------
    const start30 = new Date();
    start30.setDate(start30.getDate() - 30);

    const topProductsAgg = await prisma.orderItem.groupBy({
      by: ['productId'],
      _sum: { quantity: true },
      _count: { _all: true },
      where: {
        order: {
          createdAt: { gte: start30 },
          status: { not: 'cancelled' },
        },
      },
      orderBy: { _sum: { quantity: 'desc' } },
      take: 5,
    });

    const topProductIds = topProductsAgg.map((x) => x.productId);
    const topProductsMeta = await prisma.product.findMany({
      where: { id: { in: topProductIds } },
      select: { id: true, name: true, category: true },
    });

    const topProductsByQty = topProductsAgg.map((row) => {
      const meta = topProductsMeta.find((p) => p.id === row.productId);
      return {
        productId: row.productId,
        name: meta?.name ?? `#${row.productId}`,
        category: meta?.category ?? 'unknown',
        quantity: row._sum.quantity ?? 0,
      };
    });

    // --------- Chart: rating distribution ----------
    const ratingDistAgg = await prisma.techReview.groupBy({
      by: ['rating'],
      _count: { _all: true },
      orderBy: { rating: 'asc' },
    });

    const ratingDistribution = [1, 2, 3, 4, 5].map((r) => {
      const hit = ratingDistAgg.find((x) => x.rating === r);
      return { rating: r, count: hit?._count?._all ?? 0 };
    });

    // --------- Normalize charts ----------
    const ordersByStatus = [
      'pending',
      'processing',
      'shipped',
      'delivered',
      'cancelled',
    ].map((st) => {
      const hit = ordersByStatusAgg.find((x) => x.status === st);
      return { status: st, count: hit?._count?._all ?? 0 };
    });

    const productsByCategory = productsByCategoryAgg
      .map((x) => ({ category: x.category, count: x._count._all }))
      .sort((a, b) => b.count - a.count);

    // --------- KPIs ----------
    const kpis = {
      users: {
        total: totalUsers,
        customers: totalCustomers,
        mechanics: totalMechanics,
        admins: totalAdmins,
      },
      products: {
        total: totalProducts,
        active: activeProducts,
        lowStockActive: lowStockProducts,
      },
      orders: {
        total: totalOrders,
      },
      reviews: {
        total: totalReviews,
        avgRating: avgRating == null ? null : Number(avgRating.toFixed(2)),
      },
      revenue: {
        nonCancelledTotal: Number(
          toNumber(revenueAggAllNonCancelled?._sum?.totalAmount).toFixed(2),
        ),
        deliveredTotal: Number(
          toNumber(revenueAggDelivered?._sum?.totalAmount).toFixed(2),
        ),
        avgOrderValueNonCancelled: Number(
          toNumber(revenueAggAllNonCancelled?._avg?.totalAmount).toFixed(2),
        ),
      },
    };

    const charts = {
      ordersByStatus,
      revenueByMonth,
      topProductsByQty,
      productsByCategory,
      ratingDistribution,
    };

    return res.json({ kpis, charts });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Failed to fetch admin stats' });
  }
};
