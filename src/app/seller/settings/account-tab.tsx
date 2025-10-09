'use client';

import { useState } from 'react';
import { useUser } from '@clerk/nextjs';
import { Button } from '@/components/ui/button';
import { User, Mail, Bell, ExternalLink } from 'lucide-react';

export default function AccountTab() {
  const { user } = useUser();
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [orderUpdates, setOrderUpdates] = useState(true);
  const [marketingEmails, setMarketingEmails] = useState(false);

  if (!user) {
    return (
      <div className="flex items-center justify-center py-12">
        <p className="text-gray-600">Loading account information...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-gray-900">Account Settings</h2>
        <p className="mt-1 text-sm text-gray-600">
          View your account information and manage preferences
        </p>
      </div>

      {/* Account Information */}
      <div className="rounded-lg border border-gray-200 bg-white p-6">
        <div className="flex items-center gap-3 border-b border-gray-200 pb-4">
          <div className="rounded-full bg-blue-100 p-3">
            <User className="size-6 text-blue-600" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">Account Information</h3>
            <p className="text-sm text-gray-600">Your account details from Clerk</p>
          </div>
        </div>

        <div className="mt-4 space-y-4">
          {/* Name */}
          <div className="flex items-center justify-between rounded-lg bg-gray-50 p-4">
            <div>
              <p className="text-sm font-medium text-gray-700">Full Name</p>
              <p className="mt-1 text-gray-900">{user.fullName || user.firstName || 'Not set'}</p>
            </div>
          </div>

          {/* Email */}
          <div className="flex items-center justify-between rounded-lg bg-gray-50 p-4">
            <div>
              <p className="text-sm font-medium text-gray-700">Email Address</p>
              <p className="mt-1 text-gray-900">{user.primaryEmailAddress?.emailAddress}</p>
            </div>
            {user.primaryEmailAddress?.verification?.status === 'verified' && (
              <span className="rounded-full bg-green-100 px-2 py-1 text-xs font-medium text-green-800">
                Verified
              </span>
            )}
          </div>

          {/* User ID */}
          <div className="flex items-center justify-between rounded-lg bg-gray-50 p-4">
            <div>
              <p className="text-sm font-medium text-gray-700">User ID</p>
              <p className="mt-1 font-mono text-sm text-gray-900">{user.id}</p>
            </div>
          </div>

          {/* Account Created */}
          <div className="flex items-center justify-between rounded-lg bg-gray-50 p-4">
            <div>
              <p className="text-sm font-medium text-gray-700">Member Since</p>
              <p className="mt-1 text-gray-900">
                {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}
              </p>
            </div>
          </div>
        </div>

        {/* Manage Account Link */}
        <div className="mt-4 border-t border-gray-200 pt-4">
          <a
            href="/user-profile"
            className="flex items-center gap-2 text-sm font-medium text-blue-600 hover:text-blue-700"
          >
            Manage account in Clerk
            <ExternalLink className="size-4" />
          </a>
          <p className="mt-1 text-xs text-gray-500">
            Update your name, email, password, and security settings
          </p>
        </div>
      </div>

      {/* Email Preferences */}
      <div className="rounded-lg border border-gray-200 bg-white p-6">
        <div className="flex items-center gap-3 border-b border-gray-200 pb-4">
          <div className="rounded-full bg-purple-100 p-3">
            <Bell className="size-6 text-purple-600" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">Email Preferences</h3>
            <p className="text-sm text-gray-600">Choose what emails you want to receive</p>
          </div>
        </div>

        <div className="mt-4 space-y-4">
          {/* Email Notifications */}
          <div className="flex items-center justify-between rounded-lg border border-gray-200 p-4">
            <div className="flex items-center gap-3">
              <Mail className="size-5 text-gray-400" />
              <div>
                <p className="font-medium text-gray-900">Email Notifications</p>
                <p className="text-sm text-gray-600">Receive all email notifications</p>
              </div>
            </div>
            <button
              onClick={() => setEmailNotifications(!emailNotifications)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                emailNotifications ? 'bg-blue-600' : 'bg-gray-200'
              }`}
            >
              <span
                className={`inline-block size-4 transform rounded-full bg-white transition-transform ${
                  emailNotifications ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>

          {/* Order Updates */}
          <div className="flex items-center justify-between rounded-lg border border-gray-200 p-4">
            <div className="flex items-center gap-3">
              <Mail className="size-5 text-gray-400" />
              <div>
                <p className="font-medium text-gray-900">Order Updates</p>
                <p className="text-sm text-gray-600">Get notified about new orders and updates</p>
              </div>
            </div>
            <button
              onClick={() => setOrderUpdates(!orderUpdates)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                orderUpdates ? 'bg-blue-600' : 'bg-gray-200'
              }`}
            >
              <span
                className={`inline-block size-4 transform rounded-full bg-white transition-transform ${
                  orderUpdates ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>

          {/* Marketing Emails */}
          <div className="flex items-center justify-between rounded-lg border border-gray-200 p-4">
            <div className="flex items-center gap-3">
              <Mail className="size-5 text-gray-400" />
              <div>
                <p className="font-medium text-gray-900">Marketing Emails</p>
                <p className="text-sm text-gray-600">
                  Receive tips, updates, and promotional content
                </p>
              </div>
            </div>
            <button
              onClick={() => setMarketingEmails(!marketingEmails)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                marketingEmails ? 'bg-blue-600' : 'bg-gray-200'
              }`}
            >
              <span
                className={`inline-block size-4 transform rounded-full bg-white transition-transform ${
                  marketingEmails ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>
        </div>

        <div className="mt-4 border-t border-gray-200 pt-4">
          <Button variant="outline" size="sm" disabled>
            Save Preferences
          </Button>
          <p className="mt-2 text-xs text-gray-500">
            Note: Email preference saving is not yet implemented
          </p>
        </div>
      </div>

      {/* Danger Zone */}
      <div className="rounded-lg border border-red-200 bg-red-50 p-6">
        <h3 className="font-semibold text-red-900">Danger Zone</h3>
        <div className="mt-4 space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-red-900">Close Shop</p>
              <p className="text-sm text-red-700">Temporarily close your shop to new orders</p>
            </div>
            <Button variant="outline" size="sm" disabled>
              Close Shop
            </Button>
          </div>
          <div className="flex items-center justify-between border-t border-red-200 pt-3">
            <div>
              <p className="text-sm font-medium text-red-900">Delete Shop</p>
              <p className="text-sm text-red-700">
                Permanently delete your shop and all associated data
              </p>
            </div>
            <Button variant="outline" size="sm" disabled>
              Delete Shop
            </Button>
          </div>
        </div>
        <p className="mt-3 text-xs text-red-600">Note: These actions are not yet implemented</p>
      </div>
    </div>
  );
}
