import * as React from 'react';
import {
  FaInstagram,
  FaYoutube,
} from 'react-icons/fa';
import { cn } from '@/lib/utils';

export type Platform =
  | 'instagram'
  | 'youtube'
  | 'other';

interface PlatformIconProps {
  platform: Platform | string;
  className?: string;
  size?: number;
  colored?: boolean;
}

const platformConfig: Record<
  Platform,
  { icon: React.ComponentType<{ className?: string; size?: number }>; color: string }
> = {
  instagram: { icon: FaInstagram, color: '#E4405F' },
  youtube: { icon: FaYoutube, color: '#FF0000' },
  other: { icon: FaInstagram, color: '#6B7280' },
};

export function PlatformIcon({
  platform,
  className,
  size = 24,
  colored = true,
}: PlatformIconProps) {
  const normalizedPlatform = platform.toLowerCase() as Platform;
  const config = platformConfig[normalizedPlatform] || platformConfig.other;
  const Icon = config.icon;

  return (
    <span
      className={cn('inline-flex', className)}
      style={{ color: colored ? config.color : 'currentColor' }}
    >
      <Icon size={size} />
    </span>
  );
}

export function getPlatformName(platform: string): string {
  const names: Record<string, string> = {
    instagram: 'Instagram',
    youtube: 'YouTube',
    other: 'Other',
  };
  return names[platform.toLowerCase()] || platform;
}

export function getPlatformColor(platform: string): string {
  const normalizedPlatform = platform.toLowerCase() as Platform;
  return platformConfig[normalizedPlatform]?.color || platformConfig.other.color;
}
