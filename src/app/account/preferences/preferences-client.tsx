'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  ChevronLeft,
  Bell,
  Mail,
  MessageSquare,
  Star,
  Smartphone,
  Save,
  RotateCcw,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { updateNotificationPreferences, resetNotificationPreferences } from '@/actions/preferences';
import { useRouter } from 'next/navigation';

interface NotificationPreferences {
  id: string;
  userId: string;
  emailMarketing: boolean;
  emailOrderUpdates: boolean;
  emailMessages: boolean;
  emailReviews: boolean;
  pushNotifications: boolean;
  smsNotifications: boolean;
}

interface PreferencesClientProps {
  initialPreferences: NotificationPreferences;
}

export function PreferencesClient({ initialPreferences }: PreferencesClientProps) {
  const router = useRouter();
  const [preferences, setPreferences] = useState(initialPreferences);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleToggle = (field: keyof Omit<NotificationPreferences, 'id' | 'userId'>) => {
    setPreferences((prev) => ({
      ...prev,
      [field]: !prev[field],
    }));
    setError('');
    setSuccess('');
  };

  const handleSave = async () => {
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const result = await updateNotificationPreferences({
        emailMarketing: preferences.emailMarketing,
        emailOrderUpdates: preferences.emailOrderUpdates,
        emailMessages: preferences.emailMessages,
        emailReviews: preferences.emailReviews,
        pushNotifications: preferences.pushNotifications,
        smsNotifications: preferences.smsNotifications,
      });

      if (result.success) {
        setSuccess('Preferences saved successfully');
        router.refresh();
      } else {
        setError(result.error || 'Failed to save preferences');
      }
    } catch (err) {
      setError('An unexpected error occurred');
      console.error('Save preferences error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleReset = async () => {
    if (!confirm('Reset all preferences to defaults?')) {
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const result = await resetNotificationPreferences();

      if (result.success && result.preferences) {
        setPreferences(result.preferences);
        setSuccess('Preferences reset to defaults');
        router.refresh();
      } else {
        setError(result.error || 'Failed to reset preferences');
      }
    } catch (err) {
      setError('An unexpected error occurred');
      console.error('Reset preferences error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <Button asChild variant="ghost" size="sm" className="mb-4">
          <Link href="/account">
            <ChevronLeft className="mr-1 size-4" />
            Back to Account
          </Link>
        </Button>
        <h1 className="mb-2 text-3xl font-bold">Notification Preferences</h1>
        <p className="text-muted-foreground">Manage your email and notification settings</p>
      </div>

      <div className="mx-auto max-w-3xl space-y-6">
        {/* Status Messages */}
        {error && <div className="rounded-md bg-red-50 p-4 text-sm text-red-600">{error}</div>}
        {success && (
          <div className="rounded-md bg-green-50 p-4 text-sm text-green-600">{success}</div>
        )}

        {/* Email Notifications */}
        <Card className="p-6">
          <div className="mb-6 flex items-center gap-3">
            <div className="flex size-12 items-center justify-center rounded-lg bg-blue-100 text-blue-600">
              <Mail className="size-6" />
            </div>
            <div>
              <h2 className="text-lg font-semibold">Email Notifications</h2>
              <p className="text-muted-foreground text-sm">
                Choose what emails you receive from us
              </p>
            </div>
          </div>

          <div className="space-y-4">
            {/* Order Updates */}
            <div className="flex items-start justify-between border-b pb-4">
              <div className="flex-1">
                <div className="mb-1 flex items-center gap-2">
                  <Bell className="text-muted-foreground size-4" />
                  <span className="font-medium">Order Updates</span>
                </div>
                <p className="text-muted-foreground text-sm">
                  Order confirmations, shipping notifications, and delivery updates
                </p>
              </div>
              <label className="relative inline-flex cursor-pointer items-center">
                <input
                  type="checkbox"
                  checked={preferences.emailOrderUpdates}
                  onChange={() => handleToggle('emailOrderUpdates')}
                  className="peer sr-only"
                />
                <div className="peer peer-checked:bg-forest-dark peer-focus:ring-forest-light h-6 w-11 rounded-full bg-gray-300 peer-focus:ring-2 peer-focus:outline-none after:absolute after:top-[2px] after:left-[2px] after:size-5 after:rounded-full after:border after:border-gray-300 after:bg-white after:transition-all after:content-[''] peer-checked:after:translate-x-full peer-checked:after:border-white"></div>
              </label>
            </div>

            {/* Messages */}
            <div className="flex items-start justify-between border-b pb-4">
              <div className="flex-1">
                <div className="mb-1 flex items-center gap-2">
                  <MessageSquare className="text-muted-foreground size-4" />
                  <span className="font-medium">Messages</span>
                </div>
                <p className="text-muted-foreground text-sm">
                  Notifications when sellers or buyers send you a message
                </p>
              </div>
              <label className="relative inline-flex cursor-pointer items-center">
                <input
                  type="checkbox"
                  checked={preferences.emailMessages}
                  onChange={() => handleToggle('emailMessages')}
                  className="peer sr-only"
                />
                <div className="peer peer-checked:bg-forest-dark peer-focus:ring-forest-light h-6 w-11 rounded-full bg-gray-300 peer-focus:ring-2 peer-focus:outline-none after:absolute after:top-[2px] after:left-[2px] after:size-5 after:rounded-full after:border after:border-gray-300 after:bg-white after:transition-all after:content-[''] peer-checked:after:translate-x-full peer-checked:after:border-white"></div>
              </label>
            </div>

            {/* Reviews */}
            <div className="flex items-start justify-between border-b pb-4">
              <div className="flex-1">
                <div className="mb-1 flex items-center gap-2">
                  <Star className="text-muted-foreground size-4" />
                  <span className="font-medium">Review Reminders</span>
                </div>
                <p className="text-muted-foreground text-sm">
                  Reminders to review products you&apos;ve purchased
                </p>
              </div>
              <label className="relative inline-flex cursor-pointer items-center">
                <input
                  type="checkbox"
                  checked={preferences.emailReviews}
                  onChange={() => handleToggle('emailReviews')}
                  className="peer sr-only"
                />
                <div className="peer peer-checked:bg-forest-dark peer-focus:ring-forest-light h-6 w-11 rounded-full bg-gray-300 peer-focus:ring-2 peer-focus:outline-none after:absolute after:top-[2px] after:left-[2px] after:size-5 after:rounded-full after:border after:border-gray-300 after:bg-white after:transition-all after:content-[''] peer-checked:after:translate-x-full peer-checked:after:border-white"></div>
              </label>
            </div>

            {/* Marketing */}
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="mb-1 flex items-center gap-2">
                  <Mail className="text-muted-foreground size-4" />
                  <span className="font-medium">Marketing & Promotions</span>
                </div>
                <p className="text-muted-foreground text-sm">
                  New products, special offers, and eco-friendly tips
                </p>
              </div>
              <label className="relative inline-flex cursor-pointer items-center">
                <input
                  type="checkbox"
                  checked={preferences.emailMarketing}
                  onChange={() => handleToggle('emailMarketing')}
                  className="peer sr-only"
                />
                <div className="peer peer-checked:bg-forest-dark peer-focus:ring-forest-light h-6 w-11 rounded-full bg-gray-300 peer-focus:ring-2 peer-focus:outline-none after:absolute after:top-[2px] after:left-[2px] after:size-5 after:rounded-full after:border after:border-gray-300 after:bg-white after:transition-all after:content-[''] peer-checked:after:translate-x-full peer-checked:after:border-white"></div>
              </label>
            </div>
          </div>
        </Card>

        {/* Other Notifications */}
        <Card className="p-6">
          <div className="mb-6 flex items-center gap-3">
            <div className="flex size-12 items-center justify-center rounded-lg bg-purple-100 text-purple-600">
              <Smartphone className="size-6" />
            </div>
            <div>
              <h2 className="text-lg font-semibold">Other Notifications</h2>
              <p className="text-muted-foreground text-sm">Push and SMS notification settings</p>
            </div>
          </div>

          <div className="space-y-4">
            {/* Push Notifications */}
            <div className="flex items-start justify-between border-b pb-4">
              <div className="flex-1">
                <div className="mb-1 flex items-center gap-2">
                  <Bell className="text-muted-foreground size-4" />
                  <span className="font-medium">Push Notifications</span>
                </div>
                <p className="text-muted-foreground text-sm">
                  Real-time notifications on your device (coming soon)
                </p>
              </div>
              <label className="relative inline-flex cursor-pointer items-center">
                <input
                  type="checkbox"
                  checked={preferences.pushNotifications}
                  onChange={() => handleToggle('pushNotifications')}
                  className="peer sr-only"
                  disabled
                />
                <div className="peer peer-checked:bg-forest-dark h-6 w-11 rounded-full bg-gray-200 peer-disabled:cursor-not-allowed peer-disabled:opacity-50 after:absolute after:top-[2px] after:left-[2px] after:size-5 after:rounded-full after:border after:border-gray-300 after:bg-white after:transition-all after:content-[''] peer-checked:after:translate-x-full peer-checked:after:border-white"></div>
              </label>
            </div>

            {/* SMS Notifications */}
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="mb-1 flex items-center gap-2">
                  <MessageSquare className="text-muted-foreground size-4" />
                  <span className="font-medium">SMS Notifications</span>
                </div>
                <p className="text-muted-foreground text-sm">
                  Text message notifications for urgent updates (coming soon)
                </p>
              </div>
              <label className="relative inline-flex cursor-pointer items-center">
                <input
                  type="checkbox"
                  checked={preferences.smsNotifications}
                  onChange={() => handleToggle('smsNotifications')}
                  className="peer sr-only"
                  disabled
                />
                <div className="peer peer-checked:bg-forest-dark h-6 w-11 rounded-full bg-gray-200 peer-disabled:cursor-not-allowed peer-disabled:opacity-50 after:absolute after:top-[2px] after:left-[2px] after:size-5 after:rounded-full after:border after:border-gray-300 after:bg-white after:transition-all after:content-[''] peer-checked:after:translate-x-full peer-checked:after:border-white"></div>
              </label>
            </div>
          </div>
        </Card>

        {/* Action Buttons */}
        <div className="flex flex-wrap gap-3">
          <Button onClick={handleSave} disabled={loading} size="lg">
            <Save className="mr-2 size-4" />
            {loading ? 'Saving...' : 'Save Preferences'}
          </Button>
          <Button onClick={handleReset} disabled={loading} variant="outline" size="lg">
            <RotateCcw className="mr-2 size-4" />
            Reset to Defaults
          </Button>
        </div>
      </div>
    </div>
  );
}
