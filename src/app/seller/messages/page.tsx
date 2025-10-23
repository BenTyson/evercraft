/**
 * Seller Messages Page
 *
 * Inbox for sellers to manage conversations with buyers
 */

import { redirect } from 'next/navigation';
import { auth } from '@clerk/nextjs/server';
import { MessageCircle } from 'lucide-react';
import { getConversations } from '@/actions/messages';
import { ConversationsList } from '@/components/messages/conversations-list';

export default async function SellerMessagesPage() {
  const { userId } = await auth();

  if (!userId) {
    redirect('/sign-in?redirect_url=/seller/messages');
  }

  const result = await getConversations();

  if (!result.success) {
    return (
      <div className="p-8">
        <div className="rounded-lg border border-red-200 bg-red-50 p-6">
          <p className="text-sm text-red-800">{result.error}</p>
        </div>
      </div>
    );
  }

  const conversations = result.conversations || [];

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-6">
        <h1 className="mb-2 text-3xl font-bold">Messages</h1>
        <p className="text-[#6C757D]">Manage conversations with your customers</p>
      </div>

      {/* Desktop: 2-column layout, Mobile: Single column */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[360px_1fr]">
        {/* Conversations List */}
        <div className="overflow-hidden rounded-lg border border-[#E9ECEF] bg-white shadow-sm">
          <div className="border-b border-[#E9ECEF] bg-[#FAFAF8] px-4 py-3">
            <div className="flex items-center gap-2">
              <MessageCircle className="size-5 text-[#1B4332]" />
              <span className="font-semibold text-[#212529]">Conversations</span>
              {conversations.length > 0 && (
                <span className="ml-auto rounded-full bg-[#E9ECEF] px-2 py-0.5 text-xs font-medium text-[#495057]">
                  {conversations.length}
                </span>
              )}
            </div>
          </div>

          <div className="h-[calc(100vh-280px)] overflow-y-auto">
            <ConversationsList conversations={conversations} basePath="/seller/messages" />
          </div>
        </div>

        {/* Thread View (desktop only - shows on mobile when conversation selected) */}
        <div className="hidden overflow-hidden rounded-lg border border-[#E9ECEF] bg-white shadow-sm lg:flex">
          <div className="flex size-full items-center justify-center text-center">
            <div className="max-w-md px-8">
              <MessageCircle className="mx-auto mb-4 size-16 text-[#ADB5BD]" />
              <h2 className="mb-2 text-xl font-bold text-[#212529]">Select a conversation</h2>
              <p className="text-sm text-[#6C757D]">
                Choose a conversation from the list to view and respond to customer messages
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
