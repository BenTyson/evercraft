/**
 * Notification Preferences Page
 *
 * Manage email and notification settings
 */

import { redirect } from 'next/navigation';
import { auth } from '@clerk/nextjs/server';
import { SiteHeaderWrapper } from '@/components/layout/site-header-wrapper';
import { getNotificationPreferences } from '@/actions/preferences';
import { PreferencesClient } from './preferences-client';

export default async function PreferencesPage() {
  const { userId } = await auth();

  if (!userId) {
    redirect('/sign-in?redirect_url=/account/preferences');
  }

  const result = await getNotificationPreferences();

  if (!result.success || !result.preferences) {
    return (
      <>
        <SiteHeaderWrapper />
        <div className="container mx-auto px-4 py-16">
          <div className="mx-auto max-w-2xl text-center">
            <p className="text-muted-foreground mb-4">Failed to load preferences</p>
            <p className="text-sm text-red-600">{result.error}</p>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <SiteHeaderWrapper />
      <PreferencesClient initialPreferences={result.preferences} />
    </>
  );
}
