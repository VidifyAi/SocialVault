import * as React from 'react';
import {
  FaInstagram,
  FaTiktok,
  FaYoutube,
  FaTwitter,
  FaTwitch,
  FaSnapchatGhost,
  FaFacebook,
  FaLinkedin,
  FaPinterest,
  FaDiscord,
  FaTelegram,
  FaReddit,
} from 'react-icons/fa';
import { cn } from '@/lib/utils';

export type Platform =
  | 'instagram'
  | 'tiktok'
  | 'youtube'
  | 'twitter'
  | 'twitch'
  | 'snapchat'
  | 'facebook'
  | 'linkedin'
  | 'pinterest'
  | 'discord'
  | 'telegram'
  | 'reddit'
  | 'onlyfans'
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
  tiktok: { icon: FaTiktok, color: '#000000' },
  youtube: { icon: FaYoutube, color: '#FF0000' },
  twitter: { icon: FaTwitter, color: '#1DA1F2' },
  twitch: { icon: FaTwitch, color: '#9146FF' },
  snapchat: { icon: FaSnapchatGhost, color: '#FFFC00' },
  facebook: { icon: FaFacebook, color: '#1877F2' },
  linkedin: { icon: FaLinkedin, color: '#0A66C2' },
  pinterest: { icon: FaPinterest, color: '#E60023' },
  discord: { icon: FaDiscord, color: '#5865F2' },
  telegram: { icon: FaTelegram, color: '#26A5E4' },
  reddit: { icon: FaReddit, color: '#FF4500' },
  onlyfans: { icon: FaInstagram, color: '#00AFF0' }, // Using Instagram as fallback
  other: { icon: FaInstagram, color: '#6B7280' }, // Using Instagram as fallback with gray
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
    <Icon
      className={cn(className)}
      size={size}
      style={{ color: colored ? config.color : 'currentColor' }}
    />
  );
}

export function getPlatformName(platform: string): string {
  const names: Record<string, string> = {
    instagram: 'Instagram',
    tiktok: 'TikTok',
    youtube: 'YouTube',
    twitter: 'Twitter / X',
    twitch: 'Twitch',
    snapchat: 'Snapchat',
    facebook: 'Facebook',
    linkedin: 'LinkedIn',
    pinterest: 'Pinterest',
    discord: 'Discord',
    telegram: 'Telegram',
    reddit: 'Reddit',
    onlyfans: 'OnlyFans',
    other: 'Other',
  };
  return names[platform.toLowerCase()] || platform;
}

export function getPlatformColor(platform: string): string {
  const normalizedPlatform = platform.toLowerCase() as Platform;
  return platformConfig[normalizedPlatform]?.color || platformConfig.other.color;
}
