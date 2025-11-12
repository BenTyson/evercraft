/**
 * Account Settings Page
 *
 * Profile information and security settings
 */

import { redirect } from 'next/navigation';
import { User, Shield, Trash2, ExternalLink } from 'lucide-react';
import { auth, currentUser } from '@clerk/nextjs/server';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

export default async function AccountSettingsPage() {
  const { userId } = await auth();

  if (!userId) {
    redirect('/sign-in?redirect_url=/account/settings');
  }

  const user = await currentUser();

  return (
    <div>
      {/* Page Header Bar */}
      <div className="border-b border-gray-200 bg-gray-100 px-4 py-3">
        <div className="mx-auto max-w-7xl">
          <h1 className="text-sm font-medium tracking-[0.2em] text-gray-700 uppercase">
            Account Settings
          </h1>
        </div>
      </div>

      {/* Page Content */}
      <div className="px-6 py-8">
        <div className="mx-auto max-w-3xl space-y-6">
          {/* Profile Information */}
          <Card className="p-6">
            <div className="mb-6 flex items-center gap-3">
              <div className="flex size-12 items-center justify-center rounded-lg bg-gray-100 text-gray-600">
                <User className="size-6" />
              </div>
              <div>
                <h2 className="text-lg font-semibold">Profile Information</h2>
                <p className="text-muted-foreground text-sm">Your personal details</p>
              </div>
            </div>

            <div className="space-y-4">
              {/* Name */}
              <div className="flex items-center justify-between border-b pb-4">
                <div>
                  <div className="mb-1 font-medium">Name</div>
                  <p className="text-muted-foreground text-sm">
                    {user?.firstName || user?.username || 'Not set'} {user?.lastName || ''}
                  </p>
                </div>
              </div>

              {/* Email */}
              <div className="flex items-center justify-between border-b pb-4">
                <div>
                  <div className="mb-1 font-medium">Email</div>
                  <p className="text-muted-foreground text-sm">
                    {user?.emailAddresses[0]?.emailAddress || 'Not set'}
                  </p>
                </div>
              </div>

              {/* User ID */}
              <div className="flex items-center justify-between">
                <div>
                  <div className="mb-1 font-medium">User ID</div>
                  <p className="text-muted-foreground font-mono text-xs">{userId}</p>
                </div>
              </div>
            </div>
          </Card>

          {/* Security Settings */}
          <Card className="p-6">
            <div className="mb-6 flex items-center gap-3">
              <div className="flex size-12 items-center justify-center rounded-lg bg-gray-100 text-gray-600">
                <Shield className="size-6" />
              </div>
              <div>
                <h2 className="text-lg font-semibold">Security Settings</h2>
                <p className="text-muted-foreground text-sm">Manage your password and security</p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="rounded-lg bg-gray-50 p-4">
                <p className="mb-4 text-sm text-gray-700">
                  Account security is managed by Clerk, our trusted authentication provider. You can
                  update your password, enable two-factor authentication, and manage connected
                  accounts from your Clerk account settings.
                </p>
                <Button asChild size="sm">
                  <a
                    href="https://accounts.evercraft.com/user"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Manage Security Settings
                    <ExternalLink className="ml-2 size-4" />
                  </a>
                </Button>
              </div>

              {/* Quick Links */}
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="border-muted rounded-lg border p-4">
                  <div className="mb-2 font-medium">Password</div>
                  <p className="text-muted-foreground mb-3 text-sm">Change your password</p>
                  <Button variant="outline" size="sm" asChild>
                    <a
                      href="https://accounts.evercraft.com/user"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      Update
                      <ExternalLink className="ml-2 size-3" />
                    </a>
                  </Button>
                </div>

                <div className="border-muted rounded-lg border p-4">
                  <div className="mb-2 font-medium">Two-Factor Auth</div>
                  <p className="text-muted-foreground mb-3 text-sm">
                    Add an extra layer of security
                  </p>
                  <Button variant="outline" size="sm" asChild>
                    <a
                      href="https://accounts.evercraft.com/user"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      Configure
                      <ExternalLink className="ml-2 size-3" />
                    </a>
                  </Button>
                </div>
              </div>
            </div>
          </Card>

          {/* Danger Zone */}
          <Card className="border-red-200 p-6">
            <div className="mb-6 flex items-center gap-3">
              <div className="flex size-12 items-center justify-center rounded-lg bg-red-100 text-red-600">
                <Trash2 className="size-6" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-red-600">Danger Zone</h2>
                <p className="text-muted-foreground text-sm">Irreversible account actions</p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="mb-1 font-medium">Delete Account</div>
                  <p className="text-muted-foreground text-sm">
                    Permanently delete your account and all associated data. This action cannot be
                    undone.
                  </p>
                </div>
              </div>
              <Button
                variant="outline"
                size="sm"
                className="border-red-300 text-red-600 hover:bg-red-50"
                asChild
              >
                <a
                  href="https://accounts.evercraft.com/user"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Delete Account
                  <ExternalLink className="ml-2 size-3" />
                </a>
              </Button>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
