'use client';

import { useState } from 'react';
import Image from 'next/image';
import { X, Upload, Loader2 } from 'lucide-react';
import { useUploadThing } from '@/lib/uploadthing';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface ImageUploadProps {
  value: string[];
  onChange: (urls: string[]) => void;
  maxImages?: number;
  disabled?: boolean;
}

export function ImageUpload({ value, onChange, maxImages = 4, disabled }: ImageUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const { startUpload } = useUploadThing('productImage');

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    // Check if we would exceed max images
    if (value.length + files.length > maxImages) {
      alert(`You can only upload up to ${maxImages} images`);
      return;
    }

    setIsUploading(true);
    try {
      const uploadedFiles = await startUpload(files);

      if (uploadedFiles) {
        const urls = uploadedFiles.map((file) => file.url);
        onChange([...value, ...urls]);
      }
    } catch (error) {
      console.error('Upload error:', error);
      alert('Failed to upload images. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleRemove = (url: string) => {
    onChange(value.filter((current) => current !== url));
  };

  return (
    <div className="space-y-4">
      {/* Image Grid */}
      {value.length > 0 && (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          {value.map((url, index) => (
            <div
              key={url}
              className={cn(
                'relative aspect-square overflow-hidden rounded-lg border',
                index === 0 && 'ring-eco-dark ring-2 ring-offset-2'
              )}
            >
              <Image src={url} alt={`Product image ${index + 1}`} fill className="object-cover" />
              <button
                type="button"
                onClick={() => handleRemove(url)}
                disabled={disabled}
                className="absolute top-2 right-2 rounded-full bg-red-500 p-1 text-white shadow-sm hover:bg-red-600 disabled:opacity-50"
              >
                <X className="size-4" />
              </button>
              {index === 0 && (
                <div className="bg-eco-dark absolute bottom-2 left-2 rounded px-2 py-1 text-xs font-semibold text-white">
                  Primary
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Upload Button */}
      {value.length < maxImages && (
        <div>
          <input
            type="file"
            id="image-upload"
            accept="image/*"
            multiple
            onChange={handleUpload}
            disabled={disabled || isUploading}
            className="hidden"
          />
          <label htmlFor="image-upload">
            <Button
              type="button"
              variant="outline"
              disabled={disabled || isUploading}
              className="w-full cursor-pointer"
              onClick={() => document.getElementById('image-upload')?.click()}
            >
              {isUploading ? (
                <>
                  <Loader2 className="mr-2 size-4 animate-spin" />
                  Uploading...
                </>
              ) : (
                <>
                  <Upload className="mr-2 size-4" />
                  Upload Images ({value.length}/{maxImages})
                </>
              )}
            </Button>
          </label>
          <p className="text-muted-foreground mt-2 text-xs">
            Upload up to {maxImages} images. First image will be the primary image. Max 4MB per
            image.
          </p>
        </div>
      )}
    </div>
  );
}
