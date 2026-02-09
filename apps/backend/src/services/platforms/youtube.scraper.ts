import axios from 'axios';
import { ScraperResult } from './types';

/**
 * YouTube Data API v3 Scraper
 * Uses official Google API (free tier: 10,000 units/day)
 * Lookup cascade to minimize API units:
 *   1. channels.list?id={id} if input looks like a channel ID (1 unit)
 *   2. channels.list?forHandle=@{handle} for handle-based lookup (1 unit)
 *   3. search.list?q={handle}&type=channel as fallback (100 units)
 */

const YOUTUBE_API_BASE = 'https://www.googleapis.com/youtube/v3';
const TIMEOUT = 8000;

function getApiKey(): string {
  const key = process.env.YOUTUBE_API_KEY || '';
  if (!key) {
    console.warn('⚠️  YOUTUBE_API_KEY not set. YouTube scraper will fail.');
  }
  return key;
}

function looksLikeChannelId(input: string): boolean {
  // Channel IDs start with UC and are 24 chars long
  return /^UC[\w-]{22}$/.test(input);
}

async function lookupByChannelId(channelId: string, apiKey: string): Promise<any | null> {
  const res = await axios.get(`${YOUTUBE_API_BASE}/channels`, {
    params: {
      part: 'snippet,statistics',
      id: channelId,
      key: apiKey,
    },
    timeout: TIMEOUT,
  });
  return res.data.items?.[0] ?? null;
}

async function lookupByHandle(handle: string, apiKey: string): Promise<any | null> {
  const cleanHandle = handle.replace(/^@/, '');
  const res = await axios.get(`${YOUTUBE_API_BASE}/channels`, {
    params: {
      part: 'snippet,statistics',
      forHandle: cleanHandle,
      key: apiKey,
    },
    timeout: TIMEOUT,
  });
  return res.data.items?.[0] ?? null;
}

async function lookupBySearch(query: string, apiKey: string): Promise<any | null> {
  const searchRes = await axios.get(`${YOUTUBE_API_BASE}/search`, {
    params: {
      part: 'snippet',
      q: query,
      type: 'channel',
      maxResults: 1,
      key: apiKey,
    },
    timeout: TIMEOUT,
  });

  const channelId = searchRes.data.items?.[0]?.snippet?.channelId;
  if (!channelId) return null;

  return lookupByChannelId(channelId, apiKey);
}

export async function scrapeYouTube(username: string): Promise<ScraperResult> {
  const apiKey = getApiKey();
  if (!apiKey) throw new Error('YOUTUBE_API_KEY not configured');

  const clean = username.replace(/^@/, '').trim();
  let channel: any = null;

  try {
    // 1. Try as channel ID (1 unit)
    if (looksLikeChannelId(clean)) {
      channel = await lookupByChannelId(clean, apiKey);
    }

    // 2. Try as handle (1 unit)
    if (!channel) {
      channel = await lookupByHandle(clean, apiKey);
    }

    // 3. Fallback to search (100 units)
    if (!channel) {
      channel = await lookupBySearch(clean, apiKey);
    }
  } catch (error: any) {
    if (error.response?.status === 404) throw new Error('USER_NOT_FOUND');
    if (error.code === 'ECONNABORTED') throw new Error('TIMEOUT');
    throw error;
  }

  if (!channel) throw new Error('USER_NOT_FOUND');

  const snippet = channel.snippet;
  const stats = channel.statistics;

  return {
    username: channel.id,
    displayName: snippet.title,
    bio: snippet.description || undefined,
    profilePicture: snippet.thumbnails?.high?.url || snippet.thumbnails?.default?.url,
    followers: stats.hiddenSubscriberCount ? undefined : parseInt(stats.subscriberCount, 10),
    posts: parseInt(stats.videoCount, 10),
    isVerified: undefined, // YouTube API v3 doesn't expose verification status
    metadata: {
      viewCount: parseInt(stats.viewCount, 10),
      customUrl: snippet.customUrl,
      country: snippet.country,
    },
  };
}
