/**
 * Notification Preferences Server Actions
 *
 * Manage user email and notification preferences
 */

'use server';

import { auth } from '@clerk/nextjs/server';
import { revalidatePath } from 'next/cache';
import { db } from '@/lib/db';

export type NotificationPreferencesInput = {
  emailMarketing?: boolean;
  emailOrderUpdates?: boolean;
  emailMessages?: boolean;
  emailReviews?: boolean;
  pushNotifications?: boolean;
  smsNotifications?: boolean;
};

/**
 * Get notification preferences for the current user
 * Creates default preferences if none exist
 */
export async function getNotificationPreferences() {
  try {
    const { userId } = await auth();

    if (!userId) {
      return {
        success: false,
        error: 'Not authenticated',
      };
    }

    let preferences = await db.notificationPreference.findUnique({
      where: { userId },
    });

    // Create default preferences if none exist
    if (!preferences) {
      preferences = await db.notificationPreference.create({
        data: {
          userId,
          emailMarketing: false,
          emailOrderUpdates: true,
          emailMessages: true,
          emailReviews: true,
          pushNotifications: false,
          smsNotifications: false,
        },
      });
    }

    return {
      success: true,
      preferences,
    };
  } catch (error) {
    console.error('Error fetching notification preferences:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch preferences',
    };
  }
}

/**
 * Update notification preferences for the current user
 */
export async function updateNotificationPreferences(input: NotificationPreferencesInput) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return {
        success: false,
        error: 'Not authenticated',
      };
    }

    // Check if preferences exist
    const existing = await db.notificationPreference.findUnique({
      where: { userId },
    });

    let preferences;

    if (existing) {
      // Update existing preferences
      preferences = await db.notificationPreference.update({
        where: { userId },
        data: {
          emailMarketing: input.emailMarketing ?? existing.emailMarketing,
          emailOrderUpdates: input.emailOrderUpdates ?? existing.emailOrderUpdates,
          emailMessages: input.emailMessages ?? existing.emailMessages,
          emailReviews: input.emailReviews ?? existing.emailReviews,
          pushNotifications: input.pushNotifications ?? existing.pushNotifications,
          smsNotifications: input.smsNotifications ?? existing.smsNotifications,
        },
      });
    } else {
      // Create new preferences
      preferences = await db.notificationPreference.create({
        data: {
          userId,
          emailMarketing: input.emailMarketing ?? false,
          emailOrderUpdates: input.emailOrderUpdates ?? true,
          emailMessages: input.emailMessages ?? true,
          emailReviews: input.emailReviews ?? true,
          pushNotifications: input.pushNotifications ?? false,
          smsNotifications: input.smsNotifications ?? false,
        },
      });
    }

    revalidatePath('/account/preferences');
    revalidatePath('/account');

    return {
      success: true,
      preferences,
    };
  } catch (error) {
    console.error('Error updating notification preferences:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to update preferences',
    };
  }
}

/**
 * Reset notification preferences to defaults
 */
export async function resetNotificationPreferences() {
  try {
    const { userId } = await auth();

    if (!userId) {
      return {
        success: false,
        error: 'Not authenticated',
      };
    }

    const preferences = await db.notificationPreference.upsert({
      where: { userId },
      update: {
        emailMarketing: false,
        emailOrderUpdates: true,
        emailMessages: true,
        emailReviews: true,
        pushNotifications: false,
        smsNotifications: false,
      },
      create: {
        userId,
        emailMarketing: false,
        emailOrderUpdates: true,
        emailMessages: true,
        emailReviews: true,
        pushNotifications: false,
        smsNotifications: false,
      },
    });

    revalidatePath('/account/preferences');
    revalidatePath('/account');

    return {
      success: true,
      preferences,
    };
  } catch (error) {
    console.error('Error resetting notification preferences:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to reset preferences',
    };
  }
}
