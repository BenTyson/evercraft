'use server';

import { db } from '@/lib/db';
import { isAdmin } from '@/lib/auth';
import { Role } from '@/generated/prisma';

export interface UserFilters {
  search?: string; // Search by name or email
  role?: Role;
  sortBy?: 'createdAt' | 'name' | 'ordersCount' | 'revenue';
  sortOrder?: 'asc' | 'desc';
  page?: number;
  pageSize?: number;
}

export interface UserWithStats {
  id: string;
  email: string;
  name: string | null;
  avatar: string | null;
  role: Role;
  createdAt: Date;
  updatedAt: Date;
  ordersCount: number;
  totalSpent: number;
  shopName: string | null;
  shopId: string | null;
}

/**
 * Get all users with filtering and pagination
 */
export async function getAllUsers(filters: UserFilters = {}) {
  try {
    const admin = await isAdmin();

    if (!admin) {
      return { success: false, error: 'Unauthorized' };
    }

    const {
      search,
      role,
      sortBy = 'createdAt',
      sortOrder = 'desc',
      page = 1,
      pageSize = 50,
    } = filters;

    // Build where clause
    type WhereClause = {
      OR?: Array<{
        name?: { contains: string; mode: 'insensitive' };
        email?: { contains: string; mode: 'insensitive' };
      }>;
      role?: Role;
    };

    const where: WhereClause = {};

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (role) {
      where.role = role;
    }

    // Get total count for pagination
    const totalCount = await db.user.count({ where });

    // Get users with their related data
    const users = await db.user.findMany({
      where,
      skip: (page - 1) * pageSize,
      take: pageSize,
      orderBy:
        sortBy === 'ordersCount' || sortBy === 'revenue'
          ? { createdAt: sortOrder } // We'll sort these client-side after aggregation
          : sortBy === 'name'
            ? [{ name: sortOrder }, { email: sortOrder }]
            : { [sortBy]: sortOrder },
      select: {
        id: true,
        email: true,
        name: true,
        avatar: true,
        role: true,
        createdAt: true,
        updatedAt: true,
        shop: {
          select: {
            id: true,
            name: true,
          },
        },
        orders: {
          select: {
            id: true,
            total: true,
          },
        },
      },
    });

    // Transform data with stats
    const usersWithStats: UserWithStats[] = users.map((user) => {
      const ordersCount = user.orders.length;
      const totalSpent = user.orders.reduce((sum, order) => sum + order.total, 0);

      return {
        id: user.id,
        email: user.email,
        name: user.name,
        avatar: user.avatar,
        role: user.role,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
        ordersCount,
        totalSpent,
        shopName: user.shop?.name || null,
        shopId: user.shop?.id || null,
      };
    });

    // Sort by orders or revenue if requested
    if (sortBy === 'ordersCount' || sortBy === 'revenue') {
      usersWithStats.sort((a, b) => {
        const aValue = sortBy === 'ordersCount' ? a.ordersCount : a.totalSpent;
        const bValue = sortBy === 'ordersCount' ? b.ordersCount : b.totalSpent;
        return sortOrder === 'asc' ? aValue - bValue : bValue - aValue;
      });
    }

    return {
      success: true,
      users: usersWithStats,
      pagination: {
        page,
        pageSize,
        totalCount,
        totalPages: Math.ceil(totalCount / pageSize),
      },
    };
  } catch (error) {
    console.error('Error fetching users:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch users',
    };
  }
}

/**
 * Get detailed user information
 */
export async function getUserDetails(userId: string) {
  try {
    const admin = await isAdmin();

    if (!admin) {
      return { success: false, error: 'Unauthorized' };
    }

    const user = await db.user.findUnique({
      where: { id: userId },
      include: {
        shop: {
          include: {
            products: {
              select: {
                id: true,
                title: true,
                price: true,
                status: true,
              },
            },
          },
        },
        orders: {
          orderBy: { createdAt: 'desc' },
          take: 10,
          select: {
            id: true,
            orderNumber: true,
            total: true,
            status: true,
            createdAt: true,
          },
        },
        reviews: {
          orderBy: { createdAt: 'desc' },
          take: 10,
          select: {
            id: true,
            rating: true,
            text: true,
            createdAt: true,
            product: {
              select: {
                id: true,
                title: true,
              },
            },
          },
        },
        sellerApplications: {
          orderBy: { createdAt: 'desc' },
          select: {
            id: true,
            businessName: true,
            status: true,
            createdAt: true,
          },
        },
      },
    });

    if (!user) {
      return { success: false, error: 'User not found' };
    }

    // Calculate stats
    const totalSpent = user.orders.reduce((sum, order) => sum + order.total, 0);
    const averageOrderValue = user.orders.length > 0 ? totalSpent / user.orders.length : 0;

    return {
      success: true,
      user: {
        ...user,
        stats: {
          ordersCount: user.orders.length,
          totalSpent,
          averageOrderValue,
          reviewsCount: user.reviews.length,
          productsCount: user.shop?.products.length || 0,
        },
      },
    };
  } catch (error) {
    console.error('Error fetching user details:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch user details',
    };
  }
}

/**
 * Update user role (BUYER, SELLER, ADMIN)
 */
export async function updateUserRole(userId: string, newRole: Role) {
  try {
    const admin = await isAdmin();

    if (!admin) {
      return { success: false, error: 'Unauthorized' };
    }

    // Don't allow changing your own role
    const currentUser = await db.user.findFirst({
      where: { role: 'ADMIN' },
    });

    if (currentUser?.id === userId) {
      return {
        success: false,
        error: 'Cannot change your own role',
      };
    }

    const updatedUser = await db.user.update({
      where: { id: userId },
      data: { role: newRole },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
      },
    });

    return {
      success: true,
      user: updatedUser,
      message: `User role updated to ${newRole}`,
    };
  } catch (error) {
    console.error('Error updating user role:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to update user role',
    };
  }
}

/**
 * Get user statistics for admin dashboard
 */
export async function getUserStats() {
  try {
    const admin = await isAdmin();

    if (!admin) {
      return { success: false, error: 'Unauthorized' };
    }

    const [totalUsers, buyersCount, sellersCount, adminsCount, usersThisMonth] = await Promise.all([
      db.user.count(),
      db.user.count({ where: { role: 'BUYER' } }),
      db.user.count({ where: { role: 'SELLER' } }),
      db.user.count({ where: { role: 'ADMIN' } }),
      db.user.count({
        where: {
          createdAt: {
            gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
          },
        },
      }),
    ]);

    return {
      success: true,
      stats: {
        totalUsers,
        buyersCount,
        sellersCount,
        adminsCount,
        usersThisMonth,
      },
    };
  } catch (error) {
    console.error('Error fetching user stats:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch user stats',
    };
  }
}
