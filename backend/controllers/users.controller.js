import { prisma } from '../prismaClient.js';

/**
 * GET /api/users
 * Admin-only
 * Returns list of all users (without passwordHash).
 */
export const getAllUsers = async (req, res) => {
  try {
    const users = await prisma.user.findMany({
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        fullName: true,
        email: true,
        role: true,
        deliveryAddress: true,
        createdAt: true,
      },
    });

    return res.json({ users });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Failed to fetch users' });
  }
};

/**
 * PUT /api/users/profile
 * Authenticated user updates own profile.
 * Body: { fullName?, deliveryAddress? }
 * Only these fields are allowed for now.
 */
export const updateMyProfile = async (req, res) => {
  try {
    const { fullName, deliveryAddress } = req.body;

    // At least one field must be provided
    if (
      typeof fullName === 'undefined' &&
      typeof deliveryAddress === 'undefined'
    ) {
      return res.status(400).json({
        message: 'Provide at least one field: fullName or deliveryAddress',
      });
    }

    if (typeof fullName !== 'undefined') {
      if (typeof fullName !== 'string' || fullName.trim().length < 2) {
        return res.status(400).json({ message: 'Invalid fullName' });
      }
    }

    if (typeof deliveryAddress !== 'undefined') {
      if (
        deliveryAddress !== null &&
        (typeof deliveryAddress !== 'string' ||
          deliveryAddress.trim().length < 3)
      ) {
        return res.status(400).json({ message: 'Invalid deliveryAddress' });
      }
    }

    const updated = await prisma.user.update({
      where: { id: req.user.id },
      data: {
        ...(typeof fullName !== 'undefined'
          ? { fullName: fullName.trim() }
          : {}),
        ...(typeof deliveryAddress !== 'undefined'
          ? {
              deliveryAddress:
                deliveryAddress === null ? null : deliveryAddress.trim(),
            }
          : {}),
      },
      select: {
        id: true,
        fullName: true,
        email: true,
        role: true,
        deliveryAddress: true,
        createdAt: true,
      },
    });

    return res.json({ user: updated });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Profile update failed' });
  }
};

/**
 * PUT /api/users/:id/role
 * Admin-only
 * Updates role of a user.
 * Body: { role }
 * role: 'customer' | 'mechanic' | 'admin'
 */
export const updateUserRole = async (req, res) => {
  try {
    const userId = Number(req.params.id);
    const { role } = req.body;

    if (!Number.isInteger(userId)) {
      return res.status(400).json({ message: 'Invalid user id' });
    }

    if (!role || typeof role !== 'string') {
      return res.status(400).json({ message: 'Role is required' });
    }

    const allowed = ['customer', 'mechanic', 'admin'];
    if (!allowed.includes(role)) {
      return res.status(400).json({ message: 'Invalid role' });
    }

    if (req.user.id === userId && role !== 'admin') {
      return res
        .status(400)
        .json({ message: 'You cannot change your own admin role' });
    }

    const updated = await prisma.user.update({
      where: { id: userId },
      data: { role },
      select: {
        id: true,
        fullName: true,
        email: true,
        role: true,
        deliveryAddress: true,
        createdAt: true,
      },
    });

    return res.json({ user: updated });
  } catch (err) {
    if (err?.code === 'P2025') {
      return res.status(404).json({ message: 'User not found' });
    }
    console.error(err);
    return res.status(500).json({ message: 'Role update failed' });
  }
};