import { describe, it, expect, beforeEach, vi } from 'vitest';
import { mockDb, mockReset } from '@/test/mocks/db';
import * as sellerApplication from './seller-application';

// Mock Clerk auth - hoisted
const mockAuth = vi.hoisted(() => vi.fn());
vi.mock('@clerk/nextjs/server', () => ({
  auth: () => mockAuth(),
}));

// Mock auth utilities - hoisted
const mockSyncUserToDatabase = vi.hoisted(() => vi.fn());
const mockPromoteToSeller = vi.hoisted(() => vi.fn());

vi.mock('@/lib/auth', () => ({
  syncUserToDatabase: mockSyncUserToDatabase,
}));

vi.mock('@/lib/user-roles', () => ({
  promoteToSeller: mockPromoteToSeller,
}));

// Mock application scoring - hoisted
const mockScoreApplication = vi.hoisted(() => vi.fn());

vi.mock('@/lib/application-scoring', () => ({
  scoreApplication: mockScoreApplication,
}));

// Mock Next.js cache
const mockRevalidatePath = vi.hoisted(() => vi.fn());

vi.mock('next/cache', () => ({
  revalidatePath: mockRevalidatePath,
}));

// Sample test data
const mockApplicationInput = {
  businessName: 'Eco Crafts',
  businessEmail: 'hello@ecocrafts.com',
  businessWebsite: 'https://ecocrafts.com',
  businessDescription: 'Handmade sustainable crafts',
  businessAge: '1-4 years' as const,
  storefronts: {
    etsy: 'https://etsy.com/shop/ecocrafts',
  },
  shopEcoProfileData: {
    plasticFreePackaging: true,
    recycledPackaging: true,
    organicMaterials: true,
  },
  preferredNonprofit: 'nonprofit_123',
  donationPercentage: 5,
};

const mockApplication = {
  id: 'app_123',
  userId: 'user_123',
  businessName: 'Eco Crafts',
  businessEmail: 'hello@ecocrafts.com',
  businessWebsite: 'https://ecocrafts.com',
  businessDescription: 'Handmade sustainable crafts',
  businessAge: '1-4 years',
  storefronts: { etsy: 'https://etsy.com/shop/ecocrafts' },
  ecoQuestions: {},
  shopEcoProfileData: {
    plasticFreePackaging: true,
    recycledPackaging: true,
    organicMaterials: true,
  },
  ecoCommentary: null,
  preferredNonprofit: 'nonprofit_123',
  donationPercentage: 5,
  completenessScore: 75,
  tier: 'established',
  autoApprovalEligible: false,
  status: 'PENDING',
  reviewNotes: null,
  reviewedAt: null,
  createdAt: new Date('2024-01-15'),
  updatedAt: new Date('2024-01-15'),
};

const mockShop = {
  id: 'shop_123',
  userId: 'user_123',
  slug: 'eco-crafts-1234567890',
  name: 'Eco Crafts',
  bio: 'Handmade sustainable crafts',
  logo: null,
  banner: null,
  isVerified: false,
  verificationStatus: 'PENDING',
  donationPercentage: 5,
  nonprofitId: 'nonprofit_123',
  createdAt: new Date('2024-01-15'),
  updatedAt: new Date('2024-01-15'),
};

describe('Seller Application Actions', () => {
  beforeEach(() => {
    mockReset();
    vi.clearAllMocks();
    vi.spyOn(console, 'error').mockImplementation(() => {});
    vi.spyOn(Date, 'now').mockReturnValue(1234567890);
  });

  describe('createSellerApplication', () => {
    it('should create application with pending status when not auto-approved', async () => {
      mockAuth.mockResolvedValue({ userId: 'user_123' });
      mockSyncUserToDatabase.mockResolvedValue(undefined);
      mockDb.sellerApplication.findFirst.mockResolvedValue(null); // No existing application
      mockDb.shop.findUnique.mockResolvedValue(null); // No existing shop
      mockScoreApplication.mockReturnValue({
        completeness: 75,
        tier: 'established',
        autoApprovalEligible: false,
      });
      mockDb.sellerApplication.create.mockResolvedValue(mockApplication);

      const result = await sellerApplication.createSellerApplication(mockApplicationInput);

      expect(result.success).toBe(true);
      expect(result.application?.status).toBe('PENDING');
      expect(mockSyncUserToDatabase).toHaveBeenCalledWith('user_123');
      expect(mockScoreApplication).toHaveBeenCalledWith(
        mockApplicationInput.shopEcoProfileData,
        mockApplicationInput.businessDescription
      );
      expect(mockDb.sellerApplication.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          userId: 'user_123',
          businessName: 'Eco Crafts',
          status: 'PENDING',
          completenessScore: 75,
          tier: 'established',
          autoApprovalEligible: false,
        }),
      });
      expect(mockPromoteToSeller).not.toHaveBeenCalled(); // Not auto-approved
    });

    it('should auto-approve and create shop when eligibility score is high', async () => {
      mockAuth.mockResolvedValue({ userId: 'user_123' });
      mockSyncUserToDatabase.mockResolvedValue(undefined);
      mockDb.sellerApplication.findFirst.mockResolvedValue(null);
      mockDb.shop.findUnique.mockResolvedValue(null);
      mockScoreApplication.mockReturnValue({
        completeness: 95,
        tier: 'leader',
        autoApprovalEligible: true, // Auto-approval!
      });

      const autoApprovedApp = {
        ...mockApplication,
        status: 'APPROVED',
        completenessScore: 95,
        tier: 'leader',
        autoApprovalEligible: true,
        reviewedAt: new Date(),
        reviewNotes: 'Auto-approved: High completeness score and passed all checks',
      };

      mockDb.sellerApplication.create.mockResolvedValue(autoApprovedApp);
      mockDb.shop.create.mockResolvedValue(mockShop);
      mockDb.shopEcoProfile.create.mockResolvedValue({
        id: 'eco_123',
        shopId: 'shop_123',
        plasticFreePackaging: true,
        recycledPackaging: true,
      });
      mockPromoteToSeller.mockResolvedValue(undefined);

      const result = await sellerApplication.createSellerApplication(mockApplicationInput);

      expect(result.success).toBe(true);
      expect(result.application?.status).toBe('APPROVED');
      expect(mockDb.shop.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          userId: 'user_123',
          name: 'Eco Crafts',
          slug: 'eco-crafts-1234567890',
          donationPercentage: 5,
        }),
      });
      expect(mockDb.shopEcoProfile.create).toHaveBeenCalled();
      expect(mockPromoteToSeller).toHaveBeenCalledWith('user_123');
    });

    it('should prevent duplicate applications when pending', async () => {
      mockAuth.mockResolvedValue({ userId: 'user_123' });
      mockSyncUserToDatabase.mockResolvedValue(undefined);
      mockDb.sellerApplication.findFirst.mockResolvedValue({
        ...mockApplication,
        status: 'PENDING',
      });

      const result = await sellerApplication.createSellerApplication(mockApplicationInput);

      expect(result.success).toBe(false);
      expect(result.error).toBe('You already have a pending application');
      expect(mockDb.sellerApplication.create).not.toHaveBeenCalled();
    });

    it('should prevent duplicate applications when under review', async () => {
      mockAuth.mockResolvedValue({ userId: 'user_123' });
      mockSyncUserToDatabase.mockResolvedValue(undefined);
      mockDb.sellerApplication.findFirst.mockResolvedValue({
        ...mockApplication,
        status: 'UNDER_REVIEW',
      });

      const result = await sellerApplication.createSellerApplication(mockApplicationInput);

      expect(result.success).toBe(false);
      expect(result.error).toBe('You already have a pending application');
      expect(mockDb.sellerApplication.create).not.toHaveBeenCalled();
    });

    it('should prevent duplicate applications when already approved', async () => {
      mockAuth.mockResolvedValue({ userId: 'user_123' });
      mockSyncUserToDatabase.mockResolvedValue(undefined);
      mockDb.sellerApplication.findFirst.mockResolvedValue({
        ...mockApplication,
        status: 'APPROVED',
      });

      const result = await sellerApplication.createSellerApplication(mockApplicationInput);

      expect(result.success).toBe(false);
      expect(result.error).toBe('You are already an approved seller');
      expect(mockDb.sellerApplication.create).not.toHaveBeenCalled();
    });

    it('should prevent application if user already has a shop', async () => {
      mockAuth.mockResolvedValue({ userId: 'user_123' });
      mockSyncUserToDatabase.mockResolvedValue(undefined);
      mockDb.sellerApplication.findFirst.mockResolvedValue(null);
      mockDb.shop.findUnique.mockResolvedValue(mockShop); // Shop exists!

      const result = await sellerApplication.createSellerApplication(mockApplicationInput);

      expect(result.success).toBe(false);
      expect(result.error).toBe('You already have a shop');
      expect(mockDb.sellerApplication.create).not.toHaveBeenCalled();
    });

    it('should allow reapplication after rejection', async () => {
      mockAuth.mockResolvedValue({ userId: 'user_123' });
      mockSyncUserToDatabase.mockResolvedValue(undefined);
      mockDb.sellerApplication.findFirst.mockResolvedValue({
        ...mockApplication,
        status: 'REJECTED', // Rejected, can reapply
      });
      mockDb.shop.findUnique.mockResolvedValue(null);
      mockScoreApplication.mockReturnValue({
        completeness: 80,
        tier: 'established',
        autoApprovalEligible: false,
      });
      mockDb.sellerApplication.create.mockResolvedValue(mockApplication);

      const result = await sellerApplication.createSellerApplication(mockApplicationInput);

      expect(result.success).toBe(true);
      expect(mockDb.sellerApplication.create).toHaveBeenCalled();
    });

    it('should handle applications without eco profile data', async () => {
      mockAuth.mockResolvedValue({ userId: 'user_123' });
      mockSyncUserToDatabase.mockResolvedValue(undefined);
      mockDb.sellerApplication.findFirst.mockResolvedValue(null);
      mockDb.shop.findUnique.mockResolvedValue(null);
      mockDb.sellerApplication.create.mockResolvedValue({
        ...mockApplication,
        shopEcoProfileData: null,
        completenessScore: 0,
        tier: 'starter',
        autoApprovalEligible: false,
      });

      const inputWithoutEco = {
        ...mockApplicationInput,
        shopEcoProfileData: undefined,
      };

      const result = await sellerApplication.createSellerApplication(inputWithoutEco);

      expect(result.success).toBe(true);
      expect(mockScoreApplication).not.toHaveBeenCalled();
      expect(mockDb.sellerApplication.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          completenessScore: 0,
          tier: 'starter',
          autoApprovalEligible: false,
        }),
      });
    });

    it('should generate unique slug for shop', async () => {
      mockAuth.mockResolvedValue({ userId: 'user_123' });
      mockSyncUserToDatabase.mockResolvedValue(undefined);
      mockDb.sellerApplication.findFirst.mockResolvedValue(null);
      mockDb.shop.findUnique.mockResolvedValue(null);
      mockScoreApplication.mockReturnValue({
        completeness: 95,
        tier: 'leader',
        autoApprovalEligible: true,
      });
      mockDb.sellerApplication.create.mockResolvedValue({
        ...mockApplication,
        status: 'APPROVED',
      });
      mockDb.shop.create.mockResolvedValue(mockShop);
      mockPromoteToSeller.mockResolvedValue(undefined);

      await sellerApplication.createSellerApplication({
        ...mockApplicationInput,
        businessName: 'My Awesome Eco Shop!',
      });

      expect(mockDb.shop.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          slug: 'my-awesome-eco-shop-1234567890', // Normalized + timestamp
        }),
      });
    });

    it('should revalidate paths after application creation', async () => {
      mockAuth.mockResolvedValue({ userId: 'user_123' });
      mockSyncUserToDatabase.mockResolvedValue(undefined);
      mockDb.sellerApplication.findFirst.mockResolvedValue(null);
      mockDb.shop.findUnique.mockResolvedValue(null);
      mockScoreApplication.mockReturnValue({
        completeness: 75,
        tier: 'established',
        autoApprovalEligible: false,
      });
      mockDb.sellerApplication.create.mockResolvedValue(mockApplication);

      await sellerApplication.createSellerApplication(mockApplicationInput);

      expect(mockRevalidatePath).toHaveBeenCalledWith('/apply');
      expect(mockRevalidatePath).toHaveBeenCalledWith('/admin/applications');
    });

    it('should return error when not authenticated', async () => {
      mockAuth.mockResolvedValue({ userId: null });

      const result = await sellerApplication.createSellerApplication(mockApplicationInput);

      expect(result.success).toBe(false);
      expect(result.error).toBe('Not authenticated');
      expect(mockDb.sellerApplication.create).not.toHaveBeenCalled();
    });

    it('should handle database errors gracefully', async () => {
      mockAuth.mockResolvedValue({ userId: 'user_123' });
      mockSyncUserToDatabase.mockResolvedValue(undefined);
      mockDb.sellerApplication.findFirst.mockResolvedValue(null);
      mockDb.shop.findUnique.mockResolvedValue(null);
      mockScoreApplication.mockReturnValue({
        completeness: 75,
        tier: 'established',
        autoApprovalEligible: false,
      });
      mockDb.sellerApplication.create.mockRejectedValue(new Error('Database connection failed'));

      const result = await sellerApplication.createSellerApplication(mockApplicationInput);

      expect(result.success).toBe(false);
      expect(result.error).toBe('Database connection failed');
    });
  });

  describe('getUserApplication', () => {
    it('should return user application', async () => {
      mockAuth.mockResolvedValue({ userId: 'user_123' });
      mockDb.sellerApplication.findFirst.mockResolvedValue(mockApplication);

      const result = await sellerApplication.getUserApplication();

      expect(result.success).toBe(true);
      expect(result.application?.id).toBe('app_123');
      expect(mockDb.sellerApplication.findFirst).toHaveBeenCalledWith({
        where: { userId: 'user_123' },
        orderBy: { createdAt: 'desc' },
      });
    });

    it('should return null when no application exists', async () => {
      mockAuth.mockResolvedValue({ userId: 'user_123' });
      mockDb.sellerApplication.findFirst.mockResolvedValue(null);

      const result = await sellerApplication.getUserApplication();

      expect(result.success).toBe(true);
      expect(result.application).toBeNull();
    });

    it('should return error when not authenticated', async () => {
      mockAuth.mockResolvedValue({ userId: null });

      const result = await sellerApplication.getUserApplication();

      expect(result.success).toBe(false);
      expect(result.error).toBe('Not authenticated');
    });

    it('should handle database errors', async () => {
      mockAuth.mockResolvedValue({ userId: 'user_123' });
      mockDb.sellerApplication.findFirst.mockRejectedValue(new Error('Query timeout'));

      const result = await sellerApplication.getUserApplication();

      expect(result.success).toBe(false);
      expect(result.error).toBe('Query timeout');
    });
  });

  describe('getAllApplications', () => {
    it('should return all applications with user info', async () => {
      mockAuth.mockResolvedValue({ userId: 'admin_123' });

      const mockApplications = [
        {
          ...mockApplication,
          user: {
            id: 'user_123',
            name: 'John Doe',
            email: 'john@example.com',
          },
        },
        {
          ...mockApplication,
          id: 'app_456',
          userId: 'user_456',
          businessName: 'Green Goods',
          user: {
            id: 'user_456',
            name: 'Jane Smith',
            email: 'jane@example.com',
          },
        },
      ];

      mockDb.sellerApplication.findMany.mockResolvedValue(mockApplications);

      const result = await sellerApplication.getAllApplications();

      expect(result.success).toBe(true);
      expect(result.applications).toHaveLength(2);
      expect(result.applications?.[0].user.email).toBe('john@example.com');
      expect(mockDb.sellerApplication.findMany).toHaveBeenCalledWith({
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      });
    });

    it('should return error when not authenticated', async () => {
      mockAuth.mockResolvedValue({ userId: null });

      const result = await sellerApplication.getAllApplications();

      expect(result.success).toBe(false);
      expect(result.error).toBe('Not authenticated');
    });

    it('should handle database errors', async () => {
      mockAuth.mockResolvedValue({ userId: 'admin_123' });
      mockDb.sellerApplication.findMany.mockRejectedValue(new Error('Connection lost'));

      const result = await sellerApplication.getAllApplications();

      expect(result.success).toBe(false);
      expect(result.error).toBe('Connection lost');
    });
  });

  describe('updateApplicationStatus', () => {
    it('should approve application and create shop', async () => {
      mockAuth.mockResolvedValue({ userId: 'admin_123' });

      const updatedApp = {
        ...mockApplication,
        status: 'APPROVED',
        reviewNotes: 'Looks good!',
        reviewedAt: new Date(),
        user: {
          id: 'user_123',
          name: 'John Doe',
          email: 'john@example.com',
        },
      };

      mockDb.sellerApplication.update.mockResolvedValue(updatedApp);
      mockDb.shop.findUnique.mockResolvedValue(null); // No existing shop
      mockDb.shop.create.mockResolvedValue(mockShop);
      mockDb.shopEcoProfile.create.mockResolvedValue({
        id: 'eco_123',
        shopId: 'shop_123',
        plasticFreePackaging: true,
      });
      mockPromoteToSeller.mockResolvedValue(undefined);

      const result = await sellerApplication.updateApplicationStatus(
        'app_123',
        'APPROVED',
        'Looks good!'
      );

      expect(result.success).toBe(true);
      expect(result.application?.status).toBe('APPROVED');
      expect(mockDb.sellerApplication.update).toHaveBeenCalledWith({
        where: { id: 'app_123' },
        data: {
          status: 'APPROVED',
          reviewNotes: 'Looks good!',
          reviewedAt: expect.any(Date),
          updatedAt: expect.any(Date),
        },
        include: {
          user: true,
        },
      });
      expect(mockDb.shop.create).toHaveBeenCalled();
      expect(mockPromoteToSeller).toHaveBeenCalledWith('user_123');
    });

    it('should not create duplicate shop if already exists', async () => {
      mockAuth.mockResolvedValue({ userId: 'admin_123' });

      const updatedApp = {
        ...mockApplication,
        status: 'APPROVED',
        user: {
          id: 'user_123',
          name: 'John Doe',
          email: 'john@example.com',
        },
      };

      mockDb.sellerApplication.update.mockResolvedValue(updatedApp);
      mockDb.shop.findUnique.mockResolvedValue(mockShop); // Shop already exists!

      const result = await sellerApplication.updateApplicationStatus('app_123', 'APPROVED');

      expect(result.success).toBe(true);
      expect(mockDb.shop.create).not.toHaveBeenCalled(); // Don't create duplicate
      expect(mockPromoteToSeller).not.toHaveBeenCalled();
    });

    it('should reject application without creating shop', async () => {
      mockAuth.mockResolvedValue({ userId: 'admin_123' });

      const rejectedApp = {
        ...mockApplication,
        status: 'REJECTED',
        reviewNotes: 'Incomplete information',
        reviewedAt: new Date(),
        user: {
          id: 'user_123',
          name: 'John Doe',
          email: 'john@example.com',
        },
      };

      mockDb.sellerApplication.update.mockResolvedValue(rejectedApp);

      const result = await sellerApplication.updateApplicationStatus(
        'app_123',
        'REJECTED',
        'Incomplete information'
      );

      expect(result.success).toBe(true);
      expect(result.application?.status).toBe('REJECTED');
      expect(mockDb.shop.findUnique).not.toHaveBeenCalled();
      expect(mockDb.shop.create).not.toHaveBeenCalled();
    });

    it('should set status to under review', async () => {
      mockAuth.mockResolvedValue({ userId: 'admin_123' });

      const reviewApp = {
        ...mockApplication,
        status: 'UNDER_REVIEW',
        reviewNotes: 'Need more information',
        reviewedAt: new Date(),
        user: {
          id: 'user_123',
          name: 'John Doe',
          email: 'john@example.com',
        },
      };

      mockDb.sellerApplication.update.mockResolvedValue(reviewApp);

      const result = await sellerApplication.updateApplicationStatus(
        'app_123',
        'UNDER_REVIEW',
        'Need more information'
      );

      expect(result.success).toBe(true);
      expect(result.application?.status).toBe('UNDER_REVIEW');
      expect(mockDb.shop.create).not.toHaveBeenCalled();
    });

    it('should create shop eco-profile when approving with structured data', async () => {
      mockAuth.mockResolvedValue({ userId: 'admin_123' });

      const appWithEcoData = {
        ...mockApplication,
        status: 'APPROVED',
        shopEcoProfileData: {
          plasticFreePackaging: true,
          recycledPackaging: true,
          organicMaterials: true,
          annualCarbonEmissions: 1000,
          carbonOffsetPercent: 50,
        },
        completenessScore: 85,
        tier: 'established',
        user: {
          id: 'user_123',
          name: 'John Doe',
          email: 'john@example.com',
        },
      };

      mockDb.sellerApplication.update.mockResolvedValue(appWithEcoData);
      mockDb.shop.findUnique.mockResolvedValue(null);
      mockDb.shop.create.mockResolvedValue(mockShop);
      mockDb.shopEcoProfile.create.mockResolvedValue({
        id: 'eco_123',
        shopId: 'shop_123',
        plasticFreePackaging: true,
        recycledPackaging: true,
        organicMaterials: true,
        annualCarbonEmissions: 1000,
        carbonOffsetPercent: 50,
        completenessPercent: 85,
        tier: 'established',
      });
      mockPromoteToSeller.mockResolvedValue(undefined);

      const result = await sellerApplication.updateApplicationStatus('app_123', 'APPROVED');

      expect(result.success).toBe(true);
      expect(mockDb.shopEcoProfile.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          shopId: 'shop_123',
          plasticFreePackaging: true,
          recycledPackaging: true,
          organicMaterials: true,
          annualCarbonEmissions: 1000,
          carbonOffsetPercent: 50,
          completenessPercent: 85,
          tier: 'established',
        }),
      });
    });

    it('should handle approval without eco profile data', async () => {
      mockAuth.mockResolvedValue({ userId: 'admin_123' });

      const appWithoutEco = {
        ...mockApplication,
        status: 'APPROVED',
        shopEcoProfileData: null,
        user: {
          id: 'user_123',
          name: 'John Doe',
          email: 'john@example.com',
        },
      };

      mockDb.sellerApplication.update.mockResolvedValue(appWithoutEco);
      mockDb.shop.findUnique.mockResolvedValue(null);
      mockDb.shop.create.mockResolvedValue(mockShop);
      mockPromoteToSeller.mockResolvedValue(undefined);

      const result = await sellerApplication.updateApplicationStatus('app_123', 'APPROVED');

      expect(result.success).toBe(true);
      expect(mockDb.shopEcoProfile.create).not.toHaveBeenCalled();
    });

    it('should revalidate paths after status update', async () => {
      mockAuth.mockResolvedValue({ userId: 'admin_123' });

      mockDb.sellerApplication.update.mockResolvedValue({
        ...mockApplication,
        status: 'REJECTED',
        user: {
          id: 'user_123',
          name: 'John Doe',
          email: 'john@example.com',
        },
      });

      await sellerApplication.updateApplicationStatus('app_123', 'REJECTED');

      expect(mockRevalidatePath).toHaveBeenCalledWith('/admin/applications');
      expect(mockRevalidatePath).toHaveBeenCalledWith('/seller');
    });

    it('should return error when not authenticated', async () => {
      mockAuth.mockResolvedValue({ userId: null });

      const result = await sellerApplication.updateApplicationStatus('app_123', 'APPROVED');

      expect(result.success).toBe(false);
      expect(result.error).toBe('Not authenticated');
    });

    it('should handle database errors', async () => {
      mockAuth.mockResolvedValue({ userId: 'admin_123' });
      mockDb.sellerApplication.update.mockRejectedValue(new Error('Update failed'));

      const result = await sellerApplication.updateApplicationStatus('app_123', 'APPROVED');

      expect(result.success).toBe(false);
      expect(result.error).toBe('Update failed');
    });
  });
});
