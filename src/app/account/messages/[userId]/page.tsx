/**
 * Buyer Message Thread Page
 *
 * Displays conversation with a specific seller
 */

import { redirect } from 'next/navigation';
import { auth } from '@clerk/nextjs/server';
import Link from 'next/link';
import Image from 'next/image';
import { ChevronLeft, Store } from 'lucide-react';
import { getConversation } from '@/actions/messages';
import { ConversationThread } from '@/components/messages/conversation-thread';
import { MarkReadHandler } from '@/components/messages/mark-read-handler';
import { Button } from '@/components/ui/button';

interface MessageThreadPageProps {
  params: Promise<{
    userId: string;
  }>;
}

export default async function MessageThreadPage({ params }: MessageThreadPageProps) {
  const { userId } = await auth();
  const { userId: otherUserId } = await params;

  if (!userId) {
    redirect('/sign-in?redirect_url=/account/messages');
  }

  const result = await getConversation(otherUserId);

  if (!result.success || !result.conversation) {
    return (
      <div className="px-6 py-8">
        <div className="rounded-lg border border-red-200 bg-red-50 p-6">
          <p className="text-sm text-red-800">{result.error || 'Failed to load conversation'}</p>
        </div>
      </div>
    );
  }

  const conversation = result.conversation;
  const otherParticipant = conversation.otherParticipant;
  const displayName =
    otherParticipant.shop?.name || otherParticipant.name || otherParticipant.email;

  return (
    <>
      {/* Mark conversation as read client-side */}
      {conversation.id && <MarkReadHandler conversationId={conversation.id} />}
      <div className="px-6 py-6">
        {/* Header */}
        <div className="mb-4 flex items-center gap-4">
          {/* Back Button */}
          <Button asChild variant="ghost" size="sm" className="lg:hidden">
            <Link href="/account/messages">
              <ChevronLeft className="mr-1 size-4" />
              Back
            </Link>
          </Button>

          {/* Participant Info */}
          <div className="flex flex-1 items-center gap-3">
            {/* Avatar */}
            {otherParticipant.shop?.logo || otherParticipant.avatar ? (
              <div className="relative size-10 overflow-hidden rounded-full">
                <Image
                  src={otherParticipant.shop?.logo || otherParticipant.avatar || ''}
                  alt={displayName}
                  fill
                  className="object-cover"
                />
              </div>
            ) : (
              <div className="flex size-10 items-center justify-center rounded-full bg-[#E9ECEF] font-semibold text-[#495057]">
                {displayName[0]?.toUpperCase() || 'U'}
              </div>
            )}

            {/* Name and Shop Link */}
            <div>
              <h1 className="text-lg font-semibold text-[#212529]">{displayName}</h1>
              {otherParticipant.shop && (
                <Link
                  href={`/shop/${otherParticipant.shop.slug}`}
                  className="flex items-center gap-1 text-sm text-[#1B4332] transition-colors hover:text-[#2D6A4F]"
                >
                  <Store className="size-3" />
                  View Shop
                </Link>
              )}
            </div>
          </div>
        </div>

        {/* Thread Container */}
        <div
          className="overflow-hidden rounded-lg border border-[#E9ECEF] bg-white shadow-sm"
          style={{ height: 'calc(100vh - 200px)' }}
        >
          <ConversationThread
            messages={conversation.messages}
            currentUserId={userId}
            otherUserId={otherUserId}
          />
        </div>
      </div>
    </>
  );
}
