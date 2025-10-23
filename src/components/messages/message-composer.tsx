'use client';

import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Send, Loader2, Image as ImageIcon, X } from 'lucide-react';
import { sendMessage } from '@/actions/messages';
import { useRouter } from 'next/navigation';
import { useUploadThing } from '@/lib/uploadthing';
import Image from 'next/image';

interface MessageComposerProps {
  toUserId: string;
  orderId?: string;
  onMessageSent?: () => void;
  placeholder?: string;
}

export function MessageComposer({
  toUserId,
  orderId,
  onMessageSent,
  placeholder = 'Type your message...',
}: MessageComposerProps) {
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [uploadedImages, setUploadedImages] = useState<string[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();
  const { startUpload } = useUploadThing('messageImage');

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [message]);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    // Check if we would exceed max images
    if (uploadedImages.length + files.length > 3) {
      setError('You can only upload up to 3 images per message');
      return;
    }

    setIsUploading(true);
    setError(null);

    try {
      const uploadedFiles = await startUpload(files);

      if (uploadedFiles) {
        const urls = uploadedFiles.map((file) => file.url);
        setUploadedImages((prev) => [...prev, ...urls]);
      }
    } catch (error) {
      console.error('Upload error:', error);
      setError('Failed to upload images. Please try again.');
    } finally {
      setIsUploading(false);
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleRemoveImage = (url: string) => {
    setUploadedImages((prev) => prev.filter((img) => img !== url));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Must have either message text or images
    if (!message.trim() && uploadedImages.length === 0) {
      return;
    }

    if (isLoading || isUploading) {
      return;
    }

    setIsLoading(true);
    setError(null);

    const result = await sendMessage({
      toUserId,
      body: message.trim() || '', // Allow empty text if images exist
      orderId,
      attachments: uploadedImages,
    });

    if (result.success) {
      setMessage('');
      setUploadedImages([]);
      if (onMessageSent) {
        onMessageSent();
      }
      router.refresh();
    } else {
      setError(result.error || 'Failed to send message');
    }

    setIsLoading(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    // Submit on Enter (without Shift)
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      void handleSubmit(e as unknown as React.FormEvent);
    }
  };

  const characterCount = message.length;
  const maxCharacters = 2000;
  const isOverLimit = characterCount > maxCharacters;

  return (
    <form onSubmit={handleSubmit} className="border-t border-[#E9ECEF] bg-white p-4">
      {error && (
        <div className="mb-3 rounded-md bg-red-50 px-3 py-2 text-sm text-red-800">{error}</div>
      )}

      {/* Image Preview Section */}
      {uploadedImages.length > 0 && (
        <div className="mb-3 flex flex-wrap gap-2">
          {uploadedImages.map((url, index) => (
            <div
              key={url}
              className="relative size-20 overflow-hidden rounded-lg border border-[#E9ECEF]"
            >
              <Image src={url} alt={`Upload ${index + 1}`} fill className="object-cover" />
              <button
                type="button"
                onClick={() => handleRemoveImage(url)}
                disabled={isLoading}
                className="absolute -top-1 -right-1 rounded-full bg-red-500 p-1 text-white shadow-sm hover:bg-red-600 disabled:opacity-50"
              >
                <X className="size-3" />
              </button>
            </div>
          ))}
        </div>
      )}

      <div className="flex gap-3">
        {/* Textarea */}
        <div className="flex-1">
          <Textarea
            ref={textareaRef}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            className="max-h-[200px] min-h-[44px] resize-none"
            disabled={isLoading || isUploading}
          />

          {/* Character Count */}
          {characterCount > 0 && (
            <div className="mt-1 text-right">
              <span
                className={cn(
                  'text-xs',
                  isOverLimit ? 'font-semibold text-red-600' : 'text-[#6C757D]'
                )}
              >
                {characterCount} / {maxCharacters}
              </span>
            </div>
          )}
        </div>

        {/* Upload Button */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple
          onChange={handleImageUpload}
          disabled={isLoading || isUploading || uploadedImages.length >= 3}
          className="hidden"
          id="message-image-upload"
        />
        <Button
          type="button"
          variant="outline"
          size="lg"
          disabled={isLoading || isUploading || uploadedImages.length >= 3}
          onClick={() => fileInputRef.current?.click()}
          className="h-11"
        >
          {isUploading ? (
            <Loader2 className="size-5 animate-spin" />
          ) : (
            <ImageIcon className="size-5" />
          )}
        </Button>

        {/* Send Button */}
        <Button
          type="submit"
          disabled={
            (!message.trim() && uploadedImages.length === 0) ||
            isLoading ||
            isUploading ||
            isOverLimit
          }
          size="lg"
          className="h-11 bg-[#1B4332] hover:bg-[#2D6A4F]"
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 size-4 animate-spin" />
              Sending
            </>
          ) : (
            <>
              <Send className="mr-2 size-4" />
              Send
            </>
          )}
        </Button>
      </div>
    </form>
  );
}

function cn(...inputs: (string | boolean | undefined)[]) {
  return inputs.filter(Boolean).join(' ');
}
