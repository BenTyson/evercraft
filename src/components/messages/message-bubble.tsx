'use client';

import { useState } from 'react';
import { formatDistanceToNow } from 'date-fns';
import { cn } from '@/lib/utils';
import Image from 'next/image';
import Link from 'next/link';
import { Package } from 'lucide-react';
import { ImageLightbox } from './image-lightbox';

interface MessageBubbleProps {
  message: {
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
  };
  currentUserId: string;
}

export function MessageBubble({ message, currentUserId }: MessageBubbleProps) {
  const isSent = message.fromUserId === currentUserId;
  const sender = message.User_Message_fromUserIdToUser;
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);

  const hasImages = message.attachments.length > 0;
  const hasText = message.body.trim().length > 0;

  const openLightbox = (index: number) => {
    setLightboxIndex(index);
    setLightboxOpen(true);
  };

  // Determine grid layout based on image count
  const getImageGridClass = (count: number, index: number) => {
    if (count === 1) {
      return 'col-span-2'; // Full width
    }
    if (count === 2) {
      return 'col-span-1'; // Side by side
    }
    if (count === 3) {
      if (index === 0) {
        return 'col-span-2'; // First image full width
      }
      return 'col-span-1'; // Next two side by side
    }
    return 'col-span-1';
  };

  return (
    <>
      <div className={cn('flex gap-3', isSent ? 'flex-row-reverse' : 'flex-row')}>
        {/* Avatar */}
        <div className="flex-shrink-0">
          {sender.avatar ? (
            <div className="relative size-8 overflow-hidden rounded-full">
              <Image
                src={sender.avatar}
                alt={sender.name || 'User'}
                fill
                className="object-cover"
              />
            </div>
          ) : (
            <div className="flex size-8 items-center justify-center rounded-full bg-gray-200 text-xs font-semibold text-gray-600">
              {sender.name?.[0]?.toUpperCase() || 'U'}
            </div>
          )}
        </div>

        {/* Message Content */}
        <div
          className={cn('flex max-w-[70%] flex-col gap-2', isSent ? 'items-end' : 'items-start')}
        >
          {/* Images (shown above text - best practice) */}
          {hasImages && (
            <div className="grid grid-cols-2 gap-2" style={{ width: '300px' }}>
              {message.attachments.map((url, index) => (
                <button
                  key={index}
                  onClick={() => openLightbox(index)}
                  className={cn(
                    'relative overflow-hidden rounded-lg transition-opacity hover:opacity-90',
                    getImageGridClass(message.attachments.length, index)
                  )}
                  style={{ aspectRatio: message.attachments.length === 1 ? '4/3' : '1/1' }}
                >
                  <Image src={url} alt={`Attachment ${index + 1}`} fill className="object-cover" />
                </button>
              ))}
            </div>
          )}

          {/* Text Message Bubble (optional if images are present) */}
          {hasText && (
            <div
              className={cn(
                'rounded-2xl px-4 py-3',
                isSent
                  ? 'bg-[#1B4332] text-white' // Forest green for sent messages
                  : 'bg-[#F1F3F5] text-[#212529]' // Neutral gray for received messages
              )}
            >
              <p className="text-sm leading-relaxed whitespace-pre-wrap">{message.body}</p>
            </div>
          )}

          {/* Order Link Badge */}
          {message.orderId && (
            <Link
              href={`/orders/${message.orderId}`}
              className="flex items-center gap-1.5 rounded-md bg-blue-50 px-2.5 py-1 text-xs text-blue-700 transition-colors hover:bg-blue-100"
            >
              <Package className="size-3" />
              <span>Order #{message.orderId.slice(0, 8)}</span>
            </Link>
          )}

          {/* Timestamp */}
          <span className="text-xs text-[#6C757D]">
            {formatDistanceToNow(new Date(message.createdAt), { addSuffix: true })}
          </span>
        </div>
      </div>

      {/* Lightbox */}
      {lightboxOpen && (
        <ImageLightbox
          images={message.attachments}
          initialIndex={lightboxIndex}
          onClose={() => setLightboxOpen(false)}
        />
      )}
    </>
  );
}
