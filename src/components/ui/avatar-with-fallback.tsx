/**
 * Avatar with Fallback Component
 *
 * Displays an image avatar with a fallback to initials or an icon.
 * Consolidates the avatar pattern used across admin and seller dashboards.
 */

import Image from 'next/image';
import { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface AvatarWithFallbackProps {
  /** Image URL (optional) */
  src?: string | null;
  /** Alt text for the image */
  alt: string;
  /** Name to generate initials from (used if no image) */
  name?: string;
  /** Optional icon to display instead of initials */
  icon?: LucideIcon;
  /** Size variant */
  size?: 'sm' | 'md' | 'lg' | 'xl';
  /** Shape variant */
  shape?: 'circle' | 'square' | 'rounded';
  /** Additional className */
  className?: string;
}

const sizeClasses = {
  sm: 'h-8 w-8 text-xs',
  md: 'h-12 w-12 text-lg',
  lg: 'h-16 w-16 text-xl',
  xl: 'h-24 w-24 text-3xl',
};

const shapeClasses = {
  circle: 'rounded-full',
  square: 'rounded-none',
  rounded: 'rounded-lg',
};

/**
 * Gets the initials from a name
 * @param name - Full name
 * @returns Up to 2 initials
 */
function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/);

  if (parts.length === 1) {
    return parts[0].charAt(0).toUpperCase();
  }

  return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
}

/**
 * AvatarWithFallback - Image avatar with automatic fallback
 *
 * Displays an image if provided, otherwise shows initials from name,
 * or an icon if provided. Handles missing images gracefully.
 *
 * @example
 * // With image
 * <AvatarWithFallback src="/avatar.jpg" alt="John Doe" name="John Doe" />
 *
 * @example
 * // With initials fallback
 * <AvatarWithFallback name="Jane Smith" alt="Jane Smith" />
 *
 * @example
 * // With icon fallback
 * <AvatarWithFallback icon={Store} alt="Shop" />
 */
export function AvatarWithFallback({
  src,
  alt,
  name,
  icon: Icon,
  size = 'md',
  shape = 'circle',
  className,
}: AvatarWithFallbackProps) {
  const sizeClass = sizeClasses[size];
  const shapeClass = shapeClasses[shape];

  // If image is provided, show image with fallback
  if (src) {
    return (
      <div className={cn('relative overflow-hidden', sizeClass, shapeClass, className)}>
        <Image src={src} alt={alt} fill className="object-cover" />
      </div>
    );
  }

  // Fallback: Show initials or icon
  return (
    <div
      className={cn(
        'flex items-center justify-center bg-gray-200',
        sizeClass,
        shapeClass,
        className
      )}
    >
      {Icon ? (
        <Icon className="text-gray-600" size={size === 'sm' ? 16 : size === 'md' ? 20 : 24} />
      ) : name ? (
        <span className="font-medium text-gray-600">{getInitials(name)}</span>
      ) : (
        <span className="font-medium text-gray-600">?</span>
      )}
    </div>
  );
}
