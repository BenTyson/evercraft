'use client';

import Link from 'next/link';
import Image from 'next/image';
import { formatDistanceToNow } from 'date-fns';
import { cn } from '@/lib/utils';
import { MessageCircle, Store } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface ConversationsListProps {
  conversations: {
    id: string;
    otherParticipant: {
      id: string;
      name: string | null;
      email: string;
      avatar: string | null;
      shop: {
        id: string;
        name: string;
        logo: string | null;
        slug: string;
      } | null;
    };
    lastMessageAt: Date;
    lastMessagePreview: string | null;
    unreadCount: number;
  }[];
  basePath: string; // '/messages' or '/seller/messages'
  activeConversationId?: string;
}

export function ConversationsList({
  conversations,
  basePath,
  activeConversationId,
}: ConversationsListProps) {
  if (conversations.length === 0) {
    return (
      <div className="flex h-full items-center justify-center p-8 text-center">
        <div className="max-w-sm">
          <MessageCircle className="mx-auto mb-4 size-12 text-[#ADB5BD]" />
          <h3 className="mb-2 text-lg font-semibold text-[#212529]">No messages yet</h3>
          <p className="text-sm text-[#6C757D]">
            When you start a conversation, it will appear here
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="divide-y divide-[#E9ECEF]">
      {conversations.map((conversation) => {
        const otherUser = conversation.otherParticipant;
        const isActive = conversation.id === activeConversationId;
        const displayName = otherUser.shop?.name || otherUser.name || otherUser.email;
        const hasUnread = conversation.unreadCount > 0;

        return (
          <Link
            key={conversation.id}
            href={`${basePath}/${otherUser.id}`}
            className={cn(
              'block px-4 py-4 transition-colors hover:bg-[#FAFAF8]',
              isActive && 'bg-[#FAFAF8]',
              hasUnread && 'bg-blue-50/30'
            )}
          >
            <div className="flex gap-3">
              {/* Avatar */}
              <div className="flex-shrink-0">
                {otherUser.shop?.logo || otherUser.avatar ? (
                  <div className="relative size-12 overflow-hidden rounded-full">
                    <Image
                      src={otherUser.shop?.logo || otherUser.avatar || ''}
                      alt={displayName}
                      fill
                      className="object-cover"
                    />
                  </div>
                ) : (
                  <div className="flex size-12 items-center justify-center rounded-full bg-[#E9ECEF] font-semibold text-[#495057]">
                    {displayName[0]?.toUpperCase() || 'U'}
                  </div>
                )}
              </div>

              {/* Conversation Info */}
              <div className="min-w-0 flex-1">
                <div className="mb-1 flex items-start justify-between gap-2">
                  {/* Name/Shop */}
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span
                        className={cn(
                          'truncate text-sm',
                          hasUnread ? 'font-semibold text-[#212529]' : 'font-medium text-[#495057]'
                        )}
                      >
                        {displayName}
                      </span>
                      {otherUser.shop && <Store className="size-3 flex-shrink-0 text-[#1B4332]" />}
                    </div>
                  </div>

                  {/* Timestamp */}
                  <span className="flex-shrink-0 text-xs text-[#6C757D]">
                    {formatDistanceToNow(new Date(conversation.lastMessageAt), {
                      addSuffix: false,
                    }).replace('about ', '')}
                  </span>
                </div>

                {/* Last Message Preview */}
                <div className="flex items-center justify-between gap-2">
                  <p
                    className={cn(
                      'truncate text-sm',
                      hasUnread ? 'font-medium text-[#495057]' : 'text-[#6C757D]'
                    )}
                  >
                    {conversation.lastMessagePreview || 'No messages yet'}
                  </p>

                  {/* Unread Badge */}
                  {hasUnread && (
                    <Badge className="flex-shrink-0 bg-[#52B788] text-white hover:bg-[#52B788]">
                      {conversation.unreadCount}
                    </Badge>
                  )}
                </div>
              </div>
            </div>
          </Link>
        );
      })}
    </div>
  );
}
