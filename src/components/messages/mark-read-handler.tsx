'use client';

import { useEffect } from 'react';
import { markConversationAsRead } from '@/actions/messages';
import { useRouter } from 'next/navigation';

interface MarkReadHandlerProps {
  conversationId: string;
}

/**
 * Client component to mark conversation as read after page load
 * This avoids calling revalidatePath during SSR
 */
export function MarkReadHandler({ conversationId }: MarkReadHandlerProps) {
  const router = useRouter();

  useEffect(() => {
    const markAsRead = async () => {
      await markConversationAsRead(conversationId);
      // Refresh to update unread counts in header
      router.refresh();
    };

    markAsRead();
  }, [conversationId, router]);

  return null; // This component doesn't render anything
}
