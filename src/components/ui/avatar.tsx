'use client';

import * as React from 'react';
import Image from 'next/image';
import { cn } from '@/lib/cn';

const Avatar = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      'relative flex h-10 w-10 shrink-0 overflow-hidden rounded-full',
      className
    )}
    {...props}
  />
));
Avatar.displayName = 'Avatar';

interface AvatarImageProps extends React.ComponentPropsWithoutRef<typeof Image> {
  className?: string;
}

const AvatarImage = React.forwardRef<
  HTMLImageElement,
  AvatarImageProps
>(({ className, alt = '', src, ...props }, ref) => {
  // For avatar images, we typically want to fill the container
  // and maintain aspect ratio
  return (
    <Image
      ref={ref}
      className={cn('aspect-square h-full w-full object-cover', className)}
      alt={alt}
      src={src || ''}
      fill
      sizes="40px"
      {...props}
    />
  );
});
AvatarImage.displayName = 'AvatarImage';

const AvatarFallback = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      'flex h-full w-full items-center justify-center rounded-full bg-muted',
      className
    )}
    {...props}
  />
));
AvatarFallback.displayName = 'AvatarFallback';

export { Avatar, AvatarImage, AvatarFallback };