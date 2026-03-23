'use client';

import { Play, X } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { memo } from 'react';

import { Button } from '@/shared/components/ui/button';
import { cn } from '@/shared/lib/utils';

type MediaCardVariant = 'poster' | 'landscape' | 'channel';

interface MediaCardBase {
  src: string;
  alt: string;
  title: string;
  href?: string;
  onClick?: () => void;
  variant?: MediaCardVariant;
  className?: string;
  showProgress?: number;
  badge?: React.ReactNode;
  fallbackSrc?: string;
}

interface MediaCardWithRemove extends MediaCardBase {
  onRemove: () => void;
  removeLabel?: string;
}

type MediaCardProps = MediaCardBase | MediaCardWithRemove;

function isMediaCardWithRemove(props: MediaCardProps): props is MediaCardWithRemove {
  return 'onRemove' in props && typeof props.onRemove === 'function';
}

const variantStyles = {
  poster: {
    container: 'aspect-[2/3] w-48 lg:w-56',
    image: 'object-cover',
    sizes: '(1024px) 192px,max-width:  224px',
  },
  landscape: {
    container: 'aspect-video w-64 lg:w-72',
    image: 'object-cover',
    sizes: '(max-width: 1024px) 256px, 288px',
  },
  channel: {
    container: 'aspect-square w-32 sm:w-40',
    image: 'object-contain p-4',
    sizes: '(max-width: 640px) 128px, 160px',
  },
};

function MediaCardContent(props: MediaCardBase) {
  const { src, alt, title, href, onClick, variant = 'poster', className, showProgress, badge, fallbackSrc = '/icon.png' } = props;

  const variantStyle = variantStyles[variant];
  const Container = href ? Link : 'div';

  const content = (
    <>
      <div className={cn('group-hover:border-primary/50 relative overflow-hidden rounded-sm border border-white/5 bg-white/5 transition-all duration-500', variantStyle.container, className)}>
        <Image
          className={cn('h-full w-full transition-transform duration-700 group-hover:scale-110', variantStyle.image)}
          fill
          sizes={variantStyle.sizes}
          src={src}
          alt={alt}
          onError={(e) => {
            e.currentTarget.src = fallbackSrc;
          }}
        />

        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-linear-to-t from-black/90 via-black/20 to-transparent" />

        {/* Badge */}
        {badge && (
          <div className="absolute top-3 left-3">
            {badge}
          </div>
        )}

        {/* Progress Bar */}
        {showProgress !== undefined && showProgress > 0 && (
          <>
            <div className="absolute right-3 bottom-3 left-3 flex items-center justify-between">
              <div className="flex items-center gap-2 rounded-full border border-white/10 bg-black/40 px-2 py-1 text-[10px] font-bold text-white backdrop-blur-md">
                {Math.round(showProgress * 100)}% Complete
              </div>
            </div>
            <div className="absolute bottom-0 left-0 right-0 h-1.5 overflow-hidden rounded-full bg-white/10">
              <div
                className="bg-primary h-full rounded-full transition-all duration-1000 group-hover:brightness-125"
                style={{ width: `${Math.round(showProgress * 100)}%` }}
              />
            </div>
          </>
        )}

        {/* Hover Play Button */}
        <div className="absolute inset-0 flex items-center justify-center bg-black/20 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
          <div className={cn(
            'flex items-center justify-center rounded-full border border-white/20 bg-white/20 backdrop-blur-md',
            variant === 'channel' ? 'h-12 w-12' : 'h-12 w-12'
          )}>
            <Play className={cn('ml-1 fill-white text-white', variant === 'channel' ? 'h-6 w-6' : 'h-6 w-6')} />
          </div>
        </div>
      </div>

      {/* Title */}
      {variant !== 'channel' && (
        <div className="p-4">
          <p className="text-foreground group-hover:text-primary truncate text-sm font-bold transition-colors">
            {title}
          </p>
        </div>
      )}
      {variant === 'channel' && (
        <p className="group-hover:text-primary truncate text-center text-sm font-semibold transition-colors">
          {title}
        </p>
      )}
    </>
  );

  if (href) {
    return (
      <Link href={href} className="group relative cursor-pointer">
        {content}
      </Link>
    );
  }

  if (onClick) {
    return (
      <div
        className="group relative cursor-pointer"
        onClick={onClick}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            onClick();
          }
        }}
        role="button"
        tabIndex={0}
      >
        {content}
      </div>
    );
  }

  return <div className="group relative">{content}</div>;
}

const MediaCardComponent = (props: MediaCardProps) => {
  const baseProps: MediaCardBase = {
    src: props.src,
    alt: props.alt,
    title: props.title,
    href: props.href,
    onClick: props.onClick,
    variant: props.variant,
    className: props.className,
    showProgress: props.showProgress,
    badge: props.badge,
    fallbackSrc: props.fallbackSrc,
  };

  const content = <MediaCardContent {...baseProps} />;

  if (isMediaCardWithRemove(props)) {
    return (
      <div className="group relative">
        {content}
        <Button
          variant="ghost"
          size="icon"
          onClick={(e) => {
            e.preventDefault();
            props.onRemove();
          }}
          className="bg-background text-muted-foreground hover:text-destructive absolute -top-2 -right-2 h-8 w-8 rounded-full border border-white/10 opacity-0 transition-all duration-300 group-hover:opacity-100"
          aria-label={props.removeLabel || 'Remove'}
        >
          <X className="h-4 w-4" />
        </Button>
      </div>
    );
  }

  return content;
};

export const MediaCard = memo(MediaCardComponent);

export default MediaCard;
