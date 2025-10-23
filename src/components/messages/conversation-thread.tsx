'use client';

import { useEffect, useRef } from 'react';
import { MessageBubble } from './message-bubble';
import { MessageComposer } from './message-composer';
import { OrderContextCard } from './order-context-card';
import { format, isToday, isYesterday, isSameDay } from 'date-fns';

interface ConversationThreadProps {
  messages: {
    id: string;
    body: string;
    createdAt: Date;
    fromUserId: string;
    orderId?: string | null;
    attachments: string[];
    User_Message_fromUserIdToUser: {
      id: string;
      name: string | null;
      avatar: string | null;
    };
  }[];
  currentUserId: string;
  otherUserId: string;
  order?: {
    id: string;
    orderNumber: string;
    status: string;
    total: number;
    items: {
      id: string;
      product: {
        title: string;
        images: {
          url: string;
          altText: string | null;
        }[];
      };
    }[];
  };
}

function formatMessageDate(date: Date): string {
  if (isToday(date)) {
    return 'Today';
  } else if (isYesterday(date)) {
    return 'Yesterday';
  } else {
    return format(date, 'MMMM d, yyyy');
  }
}

export function ConversationThread({
  messages,
  currentUserId,
  otherUserId,
  order,
}: ConversationThreadProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Group messages by date
  const groupedMessages: { date: Date; messages: typeof messages }[] = [];
  messages.forEach((message) => {
    const messageDate = new Date(message.createdAt);
    const lastGroup = groupedMessages[groupedMessages.length - 1];

    if (lastGroup && isSameDay(lastGroup.date, messageDate)) {
      lastGroup.messages.push(message);
    } else {
      groupedMessages.push({
        date: messageDate,
        messages: [message],
      });
    }
  });

  return (
    <div className="flex h-full flex-col">
      {/* Order Context (if any) */}
      {order && (
        <div className="border-b border-[#E9ECEF] p-4">
          <OrderContextCard order={order} />
        </div>
      )}

      {/* Messages Container */}
      <div ref={messagesContainerRef} className="flex-1 overflow-y-auto px-4 py-6">
        {groupedMessages.length === 0 ? (
          /* Empty State */
          <div className="flex h-full items-center justify-center text-center">
            <div className="max-w-md">
              <div className="mb-4 text-4xl">💬</div>
              <h3 className="mb-2 text-lg font-semibold text-[#212529]">No messages yet</h3>
              <p className="text-sm text-[#6C757D]">
                Start the conversation by sending a message below
              </p>
            </div>
          </div>
        ) : (
          /* Messages */
          <div className="space-y-6">
            {groupedMessages.map((group, groupIndex) => (
              <div key={groupIndex}>
                {/* Date Divider */}
                <div className="mb-4 flex items-center justify-center">
                  <span className="rounded-full bg-[#E9ECEF] px-3 py-1 text-xs font-medium text-[#495057]">
                    {formatMessageDate(group.date)}
                  </span>
                </div>

                {/* Messages in this date group */}
                <div className="space-y-4">
                  {group.messages.map((message) => (
                    <MessageBubble
                      key={message.id}
                      message={message}
                      currentUserId={currentUserId}
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Scroll anchor */}
        <div ref={messagesEndRef} />
      </div>

      {/* Message Composer */}
      <MessageComposer toUserId={otherUserId} orderId={order?.id} />
    </div>
  );
}
