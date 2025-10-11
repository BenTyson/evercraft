'use server';

import { auth } from '@clerk/nextjs/server';
import { db } from '@/lib/db';
import { revalidatePath } from 'next/cache';

export interface CreateSellerApplicationInput {
  businessName: string;
  businessWebsite?: string;
  businessDescription: string;
  ecoQuestions: {
    sustainabilityPractices: string;
    materialSourcing: string;
    packagingApproach: string;
    carbonFootprint: string;
  };
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

    // Create the application
    const application = await db.sellerApplication.create({
      data: {
        userId,
        businessName: input.businessName,
        businessWebsite: input.businessWebsite,
        businessDescription: input.businessDescription,
        ecoQuestions: input.ecoQuestions,
        preferredNonprofit: input.preferredNonprofit,
        donationPercentage: input.donationPercentage,
        status: 'PENDING',
        updatedAt: new Date(),
      },
    });

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

    // If approved, create the shop
    if (status === 'APPROVED') {
      const slug = application.businessName
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '');

      await db.shop.create({
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
