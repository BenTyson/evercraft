import { describe, it, expect, beforeEach, vi } from 'vitest';
import { mockDb, mockReset } from '@/test/mocks/db';
import { getAllUsers, getUserDetails, updateUserRole, getUserStats } from './admin-users';

// Mock isAdmin - hoisted
const mockIsAdmin = vi.hoisted(() => vi.fn());

vi.mock('@/lib/auth', () => ({
  isAdmin: () => mockIsAdmin(),
}));

// Sample test data
const mockUsers = [
  {
    id: 'user_1',
    email: 'alice@example.com',
    name: 'Alice Johnson',
    avatar: 'alice.jpg',
    role: 'BUYER',
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-10'),
    shop: null,
    orders: [
      { id: 'order_1', total: 5000 },
      { id: 'order_2', total: 3000 },
    ],
  },
  {
    id: 'user_2',
    email: 'bob@example.com',
    name: 'Bob Smith',
    avatar: null,
    role: 'SELLER',
    createdAt: new Date('2024-01-05'),
    updatedAt: new Date('2024-01-15'),
    shop: {
      id: 'shop_1',
      name: 'Bob\'s Shop',
    },
    orders: [
      { id: 'order_3', total: 10000 },
    ],
  },
];

const mockUserDetails = {
  id: 'user_1',
  email: 'alice@example.com',
  name: 'Alice Johnson',
  avatar: 'alice.jpg',
  role: 'BUYER',
  createdAt: new Date('2024-01-01'),
  updatedAt: new Date('2024-01-10'),
  shop: null,
  orders: [
    {
      id: 'order_1',
      orderNumber: 'ORD-001',
      total: 5000,
      status: 'PAID',
      createdAt: new Date('2024-01-05'),
    },
  ],
  reviews: [
    {
      id: 'review_1',
      rating: 5,
      text: 'Great product!',
      createdAt: new Date('2024-01-10'),
    },
  ],
};

describe('Admin User Actions', () => {
  beforeEach(() => {
    mockReset();
    vi.clearAllMocks();
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  describe('getAllUsers', () => {
    it('should return all users with stats and pagination', async () => {
      mockIsAdmin.mockResolvedValue(true);
      mockDb.user.count.mockResolvedValue(2);
      mockDb.user.findMany.mockResolvedValue(mockUsers);

      const result = await getAllUsers();

      expect(result.success).toBe(true);
      expect(result.users).toHaveLength(2);
      expect(result.users?.[0]).toEqual({
        id: 'user_1',
        email: 'alice@example.com',
        name: 'Alice Johnson',
        avatar: 'alice.jpg',
        role: 'BUYER',
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-10'),
        ordersCount: 2,
        totalSpent: 8000, // 5000 + 3000
        shopName: null,
        shopId: null,
      });
      expect(result.users?.[1]).toEqual({
        id: 'user_2',
        email: 'bob@example.com',
        name: 'Bob Smith',
        avatar: null,
        role: 'SELLER',
        createdAt: new Date('2024-01-05'),
        updatedAt: new Date('2024-01-15'),
        ordersCount: 1,
        totalSpent: 10000,
        shopName: 'Bob\'s Shop',
        shopId: 'shop_1',
      });
      expect(result.pagination).toEqual({
        page: 1,
        pageSize: 50,
        totalCount: 2,
        totalPages: 1,
      });
    });

    it('should filter by search term (name or email)', async () => {
      mockIsAdmin.mockResolvedValue(true);
      mockDb.user.count.mockResolvedValue(1);
      mockDb.user.findMany.mockResolvedValue([mockUsers[0]]);

      await getAllUsers({ search: 'alice' });

      expect(mockDb.user.findMany).toHaveBeenCalledWith({
        where: {
          OR: [
            { name: { contains: 'alice', mode: 'insensitive' } },
            { email: { contains: 'alice', mode: 'insensitive' } },
          ],
        },
        skip: expect.any(Number),
        take: expect.any(Number),
        orderBy: expect.any(Object),
        select: expect.any(Object),
      });
    });

    it('should filter by role', async () => {
      mockIsAdmin.mockResolvedValue(true);
      mockDb.user.count.mockResolvedValue(1);
      mockDb.user.findMany.mockResolvedValue([mockUsers[1]]);

      await getAllUsers({ role: 'SELLER' });

      expect(mockDb.user.findMany).toHaveBeenCalledWith({
        where: {
          role: 'SELLER',
        },
        skip: expect.any(Number),
        take: expect.any(Number),
        orderBy: expect.any(Object),
        select: expect.any(Object),
      });
    });

    it('should sort by createdAt descending (default)', async () => {
      mockIsAdmin.mockResolvedValue(true);
      mockDb.user.count.mockResolvedValue(2);
      mockDb.user.findMany.mockResolvedValue(mockUsers);

      await getAllUsers();

      expect(mockDb.user.findMany).toHaveBeenCalledWith({
        where: {},
        skip: 0,
        take: 50,
        orderBy: { createdAt: 'desc' },
        select: expect.any(Object),
      });
    });

    it('should sort by name ascending', async () => {
      mockIsAdmin.mockResolvedValue(true);
      mockDb.user.count.mockResolvedValue(2);
      mockDb.user.findMany.mockResolvedValue(mockUsers);

      await getAllUsers({ sortBy: 'name', sortOrder: 'asc' });

      expect(mockDb.user.findMany).toHaveBeenCalledWith({
        where: {},
        skip: 0,
        take: 50,
        orderBy: [{ name: 'asc' }, { email: 'asc' }],
        select: expect.any(Object),
      });
    });

    it('should sort by ordersCount descending', async () => {
      mockIsAdmin.mockResolvedValue(true);
      mockDb.user.count.mockResolvedValue(2);
      mockDb.user.findMany.mockResolvedValue(mockUsers);

      const result = await getAllUsers({ sortBy: 'ordersCount', sortOrder: 'desc' });

      // Client-side sorting
      expect(result.users?.[0].ordersCount).toBe(2);
      expect(result.users?.[1].ordersCount).toBe(1);
    });

    it('should sort by revenue (totalSpent) ascending', async () => {
      mockIsAdmin.mockResolvedValue(true);
      mockDb.user.count.mockResolvedValue(2);
      mockDb.user.findMany.mockResolvedValue(mockUsers);

      const result = await getAllUsers({ sortBy: 'revenue', sortOrder: 'asc' });

      // Client-side sorting
      expect(result.users?.[0].totalSpent).toBe(8000);
      expect(result.users?.[1].totalSpent).toBe(10000);
    });

    it('should handle pagination correctly', async () => {
      mockIsAdmin.mockResolvedValue(true);
      mockDb.user.count.mockResolvedValue(100);
      mockDb.user.findMany.mockResolvedValue(mockUsers);

      const result = await getAllUsers({ page: 3, pageSize: 20 });

      expect(mockDb.user.findMany).toHaveBeenCalledWith({
        where: {},
        skip: 40, // (3 - 1) * 20
        take: 20,
        orderBy: expect.any(Object),
        select: expect.any(Object),
      });
      expect(result.pagination).toEqual({
        page: 3,
        pageSize: 20,
        totalCount: 100,
        totalPages: 5, // Math.ceil(100 / 20)
      });
    });

    it('should return unauthorized for non-admin', async () => {
      mockIsAdmin.mockResolvedValue(false);

      const result = await getAllUsers();

      expect(result.success).toBe(false);
      expect(result.error).toBe('Unauthorized');
      expect(mockDb.user.count).not.toHaveBeenCalled();
    });

    it('should handle database errors', async () => {
      mockIsAdmin.mockResolvedValue(true);
      mockDb.user.count.mockRejectedValue(new Error('Database connection failed'));

      const result = await getAllUsers();

      expect(result.success).toBe(false);
      expect(result.error).toBe('Database connection failed');
    });
  });

  describe('getUserDetails', () => {
    it('should return detailed user information', async () => {
      mockIsAdmin.mockResolvedValue(true);
      mockDb.user.findUnique.mockResolvedValue(mockUserDetails);

      const result = await getUserDetails('user_1');

      expect(result.success).toBe(true);
      expect(result.user?.id).toBe('user_1');
      expect(result.user?.email).toBe('alice@example.com');
      expect(result.user?.orders).toHaveLength(1);
      expect(result.user?.reviews).toHaveLength(1);
      expect(mockDb.user.findUnique).toHaveBeenCalledWith({
        where: { id: 'user_1' },
        include: expect.objectContaining({
          shop: expect.any(Object),
          orders: expect.any(Object),
          reviews: expect.any(Object),
        }),
      });
    });

    it('should return error when user not found', async () => {
      mockIsAdmin.mockResolvedValue(true);
      mockDb.user.findUnique.mockResolvedValue(null);

      const result = await getUserDetails('nonexistent');

      expect(result.success).toBe(false);
      expect(result.error).toBe('User not found');
    });

    it('should return unauthorized for non-admin', async () => {
      mockIsAdmin.mockResolvedValue(false);

      const result = await getUserDetails('user_1');

      expect(result.success).toBe(false);
      expect(result.error).toBe('Unauthorized');
    });

    it('should handle database errors', async () => {
      mockIsAdmin.mockResolvedValue(true);
      mockDb.user.findUnique.mockRejectedValue(new Error('Query timeout'));

      const result = await getUserDetails('user_1');

      expect(result.success).toBe(false);
      expect(result.error).toBe('Query timeout');
    });
  });

  describe('updateUserRole', () => {
    it('should update user role successfully', async () => {
      mockIsAdmin.mockResolvedValue(true);

      // Mock findFirst (to check not changing own role)
      mockDb.user.findFirst.mockResolvedValue({ id: 'admin_123' }); // Different user

      const updatedUser = {
        id: 'user_1',
        email: 'alice@example.com',
        name: 'Alice Johnson',
        role: 'SELLER',
      };

      mockDb.user.update.mockResolvedValue(updatedUser);

      const result = await updateUserRole('user_1', 'SELLER');

      expect(result.success).toBe(true);
      expect(result.user?.role).toBe('SELLER');
      expect(result.message).toBe('User role updated to SELLER');
      expect(mockDb.user.update).toHaveBeenCalledWith({
        where: { id: 'user_1' },
        data: { role: 'SELLER' },
        select: {
          id: true,
          email: true,
          name: true,
          role: true,
        },
      });
    });

    it('should return unauthorized for non-admin', async () => {
      mockIsAdmin.mockResolvedValue(false);

      const result = await updateUserRole('user_1', 'SELLER');

      expect(result.success).toBe(false);
      expect(result.error).toBe('Unauthorized');
      expect(mockDb.user.update).not.toHaveBeenCalled();
    });

    it('should handle user not found', async () => {
      mockIsAdmin.mockResolvedValue(true);
      mockDb.user.update.mockRejectedValue(new Error('Record not found'));

      const result = await updateUserRole('nonexistent', 'SELLER');

      expect(result.success).toBe(false);
      expect(result.error).toBe('Record not found');
    });

    it('should handle database errors', async () => {
      mockIsAdmin.mockResolvedValue(true);
      mockDb.user.update.mockRejectedValue(new Error('Update failed'));

      const result = await updateUserRole('user_1', 'SELLER');

      expect(result.success).toBe(false);
      expect(result.error).toBe('Update failed');
    });
  });

  describe('getUserStats', () => {
    it('should return comprehensive user statistics', async () => {
      mockIsAdmin.mockResolvedValue(true);

      mockDb.user.count
        .mockResolvedValueOnce(1000) // Total users
        .mockResolvedValueOnce(600) // Buyers
        .mockResolvedValueOnce(350) // Sellers
        .mockResolvedValueOnce(50) // Admins
        .mockResolvedValueOnce(100); // Users this month

      const result = await getUserStats();

      expect(result.success).toBe(true);
      expect(result.stats).toEqual({
        totalUsers: 1000,
        buyersCount: 600,
        sellersCount: 350,
        adminsCount: 50,
        usersThisMonth: 100,
      });
    });

    it('should return unauthorized for non-admin', async () => {
      mockIsAdmin.mockResolvedValue(false);

      const result = await getUserStats();

      expect(result.success).toBe(false);
      expect(result.error).toBe('Unauthorized');
    });

    it('should handle database errors', async () => {
      mockIsAdmin.mockResolvedValue(true);
      mockDb.user.count.mockRejectedValue(new Error('Database error'));

      const result = await getUserStats();

      expect(result.success).toBe(false);
      expect(result.error).toBe('Database error');
    });
  });
});
