'use server';

import { auth } from '@clerk/nextjs/server';
import { db } from '@/lib/db';
import { revalidatePath } from 'next/cache';
import { syncUserToDatabase } from '@/lib/auth';
import { promoteToSeller } from '@/lib/user-roles';
import { scoreApplication } from '@/lib/application-scoring';
import { ShopEcoProfileData } from '@/components/seller/shop-eco-profile-form';

export interface CreateSellerApplicationInput {
  businessName: string;
  businessEmail?: string;
  businessWebsite?: string;
  businessDescription: string;
  businessAge?: string; // "<1 year" | "1-4 years" | "5+ years"
  storefronts?: {
    etsy?: string;
    faire?: string;
    amazon?: string;
    other?: string;
  };
  // Legacy: unstructured text answers (deprecated, kept for backward compat)
  ecoQuestions?: {
    sustainabilityPractices: string;
    materialSourcing: string;
    packagingApproach: string;
    carbonFootprint: string;
  };
  // New: structured ShopEcoProfile data (Smart Gate)
  shopEcoProfileData?: ShopEcoProfileData;
  ecoCommentary?: Record<string, string>; // Optional commentary for each eco practice
  preferredNonprofit?: string;
  donationPercentage: number;
}

/**
 * Submit a seller application
 */
export async function createSellerApplication(input: CreateSellerApplicationInput) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return { success: false, error: 'Not authenticated' };
    }

    // Sync user to database (creates User record if it doesn't exist)
    await syncUserToDatabase(userId);

    // Check if user already has an application
    const existingApplication = await db.sellerApplication.findFirst({
      where: { userId },
    });

    if (existingApplication) {
      if (
        existingApplication.status === 'PENDING' ||
        existingApplication.status === 'UNDER_REVIEW'
      ) {
        return { success: false, error: 'You already have a pending application' };
      }
      if (existingApplication.status === 'APPROVED') {
        return { success: false, error: 'You are already an approved seller' };
      }
    }

    // Check if user already has a shop
    const existingShop = await db.shop.findUnique({
      where: { userId },
    });

    if (existingShop) {
      return { success: false, error: 'You already have a shop' };
    }

    // Calculate application score using Smart Gate system
    let completenessScore = 0;
    let tier = 'starter';
    let autoApprovalEligible = false;

    if (input.shopEcoProfileData) {
      const score = scoreApplication(input.shopEcoProfileData, input.businessDescription);
      completenessScore = score.completeness;
      tier = score.tier;
      autoApprovalEligible = score.autoApprovalEligible;
    }

    // Determine initial status based on auto-approval eligibility
    const initialStatus = autoApprovalEligible ? 'APPROVED' : 'PENDING';

    // Create the application
    const application = await db.sellerApplication.create({
      data: {
        userId,
        businessName: input.businessName,
        businessEmail: input.businessEmail,
        businessWebsite: input.businessWebsite,
        businessDescription: input.businessDescription,
        businessAge: input.businessAge,
        storefronts: input.storefronts ? JSON.parse(JSON.stringify(input.storefronts)) : undefined,
        // Store both old and new formats for backward compatibility
        ecoQuestions: input.ecoQuestions || {},
        shopEcoProfileData: input.shopEcoProfileData
          ? JSON.parse(JSON.stringify(input.shopEcoProfileData))
          : undefined,
        ecoCommentary: input.ecoCommentary
          ? JSON.parse(JSON.stringify(input.ecoCommentary))
          : undefined,
        preferredNonprofit: input.preferredNonprofit,
        donationPercentage: input.donationPercentage,
        // Smart Gate fields
        completenessScore,
        tier,
        autoApprovalEligible,
        status: initialStatus,
        reviewedAt: autoApprovalEligible ? new Date() : null,
        reviewNotes: autoApprovalEligible
          ? 'Auto-approved: High completeness score and passed all checks'
          : null,
        updatedAt: new Date(),
      },
    });

    // If auto-approved, create the shop immediately
    if (autoApprovalEligible) {
      const slug = input.businessName
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '');

      const newShop = await db.shop.create({
        data: {
          userId,
          slug: `${slug}-${Date.now()}`,
          name: input.businessName,
          bio: input.businessDescription,
          isVerified: false,
          verificationStatus: 'PENDING',
          donationPercentage: input.donationPercentage,
          nonprofitId: input.preferredNonprofit,
          updatedAt: new Date(),
        },
      });

      // Create shop eco-profile from application data
      if (input.shopEcoProfileData) {
        const ecoData = input.shopEcoProfileData;

        await db.shopEcoProfile.create({
          data: {
            shopId: newShop.id,
            // Tier 1: Basic practices
            plasticFreePackaging: ecoData.plasticFreePackaging || false,
            recycledPackaging: ecoData.recycledPackaging || false,
            biodegradablePackaging: ecoData.biodegradablePackaging || false,
            organicMaterials: ecoData.organicMaterials || false,
            recycledMaterials: ecoData.recycledMaterials || false,
            fairTradeSourcing: ecoData.fairTradeSourcing || false,
            localSourcing: ecoData.localSourcing || false,
            carbonNeutralShipping: ecoData.carbonNeutralShipping || false,
            renewableEnergy: ecoData.renewableEnergy || false,
            carbonOffset: ecoData.carbonOffset || false,
            // Tier 2: Optional details
            annualCarbonEmissions: ecoData.annualCarbonEmissions || null,
            carbonOffsetPercent: ecoData.carbonOffsetPercent || null,
            renewableEnergyPercent: ecoData.renewableEnergyPercent || null,
            waterConservation: ecoData.waterConservation || false,
            fairWageCertified: ecoData.fairWageCertified || false,
            takeBackProgram: ecoData.takeBackProgram || false,
            repairService: ecoData.repairService || false,
            // Store the completeness score and tier
            completenessPercent: completenessScore,
            tier: tier,
          },
        });
      }

      // Promote user to SELLER role in both database and Clerk
      await promoteToSeller(userId);
    }

    revalidatePath('/apply');
    revalidatePath('/admin/applications');

    return { success: true, application };
  } catch (error) {
    console.error('Error creating seller application:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to create application',
    };
  }
}

/**
 * Get the current user's seller application
 */
export async function getUserApplication() {
  try {
    const { userId } = await auth();

    if (!userId) {
      return { success: false, error: 'Not authenticated' };
    }

    const application = await db.sellerApplication.findFirst({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });

    return { success: true, application };
  } catch (error) {
    console.error('Error fetching user application:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch application',
    };
  }
}

/**
 * Get all seller applications (admin only)
 */
export async function getAllApplications() {
  try {
    const { userId } = await auth();

    if (!userId) {
      return { success: false, error: 'Not authenticated' };
    }

    // TODO: Check if user is admin
    // For now, we'll just fetch all applications

    const applications = await db.sellerApplication.findMany({
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

    return { success: true, applications };
  } catch (error) {
    console.error('Error fetching applications:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch applications',
    };
  }
}

/**
 * Update application status (admin only)
 */
export async function updateApplicationStatus(
  applicationId: string,
  status: 'APPROVED' | 'REJECTED' | 'UNDER_REVIEW',
  reviewNotes?: string
) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return { success: false, error: 'Not authenticated' };
    }

    // TODO: Check if user is admin

    const application = await db.sellerApplication.update({
      where: { id: applicationId },
      data: {
        status,
        reviewNotes,
        reviewedAt: new Date(),
        updatedAt: new Date(),
      },
      include: {
        user: true,
      },
    });

    // If approved, create the shop (if it doesn't already exist)
    if (status === 'APPROVED') {
      // Check if shop already exists
      const existingShop = await db.shop.findUnique({
        where: { userId: application.userId },
      });

      if (!existingShop) {
        const slug = application.businessName
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/^-|-$/g, '');

        const newShop = await db.shop.create({
          data: {
            userId: application.userId,
            slug: `${slug}-${Date.now()}`,
            name: application.businessName,
            bio: application.businessDescription,
            isVerified: false,
            verificationStatus: 'PENDING',
            donationPercentage: application.donationPercentage,
            nonprofitId: application.preferredNonprofit,
            updatedAt: new Date(),
          },
        });

        // If application has structured eco-profile data, create shop eco-profile
        if (application.shopEcoProfileData) {
          const ecoData = application.shopEcoProfileData as Record<string, unknown>;

          await db.shopEcoProfile.create({
            data: {
              shopId: newShop.id,
              // Tier 1: Basic practices
              plasticFreePackaging: Boolean(ecoData.plasticFreePackaging),
              recycledPackaging: Boolean(ecoData.recycledPackaging),
              biodegradablePackaging: Boolean(ecoData.biodegradablePackaging),
              organicMaterials: Boolean(ecoData.organicMaterials),
              recycledMaterials: Boolean(ecoData.recycledMaterials),
              fairTradeSourcing: Boolean(ecoData.fairTradeSourcing),
              localSourcing: Boolean(ecoData.localSourcing),
              carbonNeutralShipping: Boolean(ecoData.carbonNeutralShipping),
              renewableEnergy: Boolean(ecoData.renewableEnergy),
              carbonOffset: Boolean(ecoData.carbonOffset),
              // Tier 2: Optional details
              annualCarbonEmissions:
                typeof ecoData.annualCarbonEmissions === 'number'
                  ? ecoData.annualCarbonEmissions
                  : null,
              carbonOffsetPercent:
                typeof ecoData.carbonOffsetPercent === 'number'
                  ? ecoData.carbonOffsetPercent
                  : null,
              renewableEnergyPercent:
                typeof ecoData.renewableEnergyPercent === 'number'
                  ? ecoData.renewableEnergyPercent
                  : null,
              waterConservation: Boolean(ecoData.waterConservation),
              fairWageCertified: Boolean(ecoData.fairWageCertified),
              takeBackProgram: Boolean(ecoData.takeBackProgram),
              repairService: Boolean(ecoData.repairService),
              // Store the completeness score and tier from application
              completenessPercent: application.completenessScore,
              tier: application.tier,
            },
          });
        }

        // Promote user to SELLER role in both database and Clerk
        await promoteToSeller(application.userId);
      }
    }

    revalidatePath('/admin/applications');
    revalidatePath('/seller');

    return { success: true, application };
  } catch (error) {
    console.error('Error updating application status:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to update application',
    };
  }
}
