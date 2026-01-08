import axios, { AxiosError } from 'axios';

/**
 * Unified RapidAPI Scraper
 * Uses RapidAPI endpoints for Instagram, YouTube, TikTok, Twitter
 * All metrics are estimated from publicly available information and may not reflect real-time or exact values.
 */

export interface ScraperResult {
  username: string;
  displayName?: string;
  bio?: string;
  profilePicture?: string;
  followers?: number;
  following?: number;
  posts?: number;
  isVerified?: boolean;
  metadata?: Record<string, any>;
}

export interface RapidAPIResponse {
  result?: {
    username?: string;
    full_name?: string;
    biography?: string;
    profile_pic_url_hd?: string;
    profile_pic_url?: string;
    edge_followed_by?: { count: number };
    edge_follow?: { count: number };
    edge_owner_to_timeline_media?: { count: number };
    is_private?: boolean;
    is_verified?: boolean;
    subscriber_count?: number;
    video_count?: number;
    // YouTube
    title?: string;
    description?: string;
    // TikTok
    nickname?: string;
    signature?: string;
    avatarLarger?: string;
    followerCount?: number;
    followingCount?: number;
    videoCount?: number;
    heartCount?: number;
    // Twitter
    name?: string;
    screen_name?: string;
    followers_count?: number;
    friends_count?: number;
    statuses_count?: number;
    profile_image_url?: string;
    verified?: boolean;
  };
  error?: string;
  message?: string;
}

interface RapidAPIConfig {
  instagram: { endpoint: string; method: 'GET' | 'POST' };
  youtube: { endpoint: string; method: 'GET' | 'POST' };
  tiktok: { endpoint: string; method: 'GET' | 'POST' };
  twitter: { endpoint: string; method: 'GET' | 'POST' };
}

class RapidAPIScraper {
  private readonly apiKey: string;
  private readonly apiHost: string;
  private readonly baseUrl: string;
  private readonly timeout: number = 8000;

  // Platform-specific RapidAPI endpoints
  private readonly endpoints: RapidAPIConfig = {
    instagram: {
      endpoint: 'https://instagram120.p.rapidapi.com/api/instagram/profile',
      method: 'POST',
    },
    youtube: {
      endpoint: 'https://youtube-v2.p.rapidapi.com/channel/details',
      method: 'GET',
    },
    tiktok: {
      endpoint: 'https://tiktok-scraper-api.p.rapidapi.com/v1/user',
      method: 'GET',
    },
    twitter: {
      endpoint: 'https://twitter135.p.rapidapi.com/v2/UserByScreenName',
      method: 'GET',
    },
  };

  constructor() {
    this.apiKey = process.env.RAPIDAPI_KEY || '';
    this.apiHost = 'rapidapi.com';

    if (!this.apiKey) {
      console.warn('⚠️  RAPIDAPI_KEY not set in environment variables. Scraper will fail.');
    }
  }

  async scrapeInstagram(username: string): Promise<any> {
    const config = this.endpoints.instagram;

    try {
      const response = await axios.request<RapidAPIResponse>({
        method: config.method,
        url: config.endpoint,
        headers: {
          'x-rapidapi-key': this.apiKey,
          'x-rapidapi-host': 'instagram120.p.rapidapi.com',
          'Content-Type': 'application/json',
        },
        data: { username: username.replace(/^@/, '') },
        timeout: this.timeout,
      });

      if (!response.data.result) {
        throw new Error('USER_NOT_FOUND');
      }

      const result = response.data.result;
      return {
        username: result.username,
        displayName: result.full_name,
        bio: result.biography,
        profilePicture: result.profile_pic_url_hd || result.profile_pic_url,
        followers: result.edge_followed_by?.count,
        following: result.edge_follow?.count,
        posts: result.edge_owner_to_timeline_media?.count,
        isVerified: result.is_verified,
        isPrivate: result.is_private,
      };
    } catch (error: any) {
      if (error.response?.status === 404 || error.message === 'USER_NOT_FOUND') {
        throw new Error('USER_NOT_FOUND');
      }
      if (error.code === 'ECONNABORTED') {
        throw new Error('TIMEOUT');
      }
      throw error;
    }
  }

  async scrapeYouTube(username: string): Promise<any> {
    const config = this.endpoints.youtube;

    try {
      const response = await axios.request<any>({
        method: config.method,
        url: config.endpoint,
        params: {
          channel_id: username.replace(/^@/, ''),
        },
        headers: {
          'x-rapidapi-key': this.apiKey,
          'x-rapidapi-host': 'youtube-v2.p.rapidapi.com',
        },
        timeout: this.timeout,
      });

      if (!response.data.channel_id) {
        throw new Error('USER_NOT_FOUND');
      }

      const result = response.data;

      // Parse subscriber count from string format (e.g., "32 subscribers" -> 32)
      const parseCount = (countStr: string | null): number | undefined => {
        if (!countStr) return undefined;
        const match = countStr.match(/[\d.]+[KMB]?/);
        if (!match) return undefined;
        let count = parseFloat(match[0]);
        if (match[0].endsWith('K')) count *= 1000;
        else if (match[0].endsWith('M')) count *= 1000000;
        else if (match[0].endsWith('B')) count *= 1000000000;
        return Math.round(count);
      };

      // Get the largest avatar
      const profilePicture =
        result.avatar && result.avatar.length > 0
          ? result.avatar[result.avatar.length - 1].url
          : undefined;

      return {
        username: result.channel_id,
        displayName: result.title,
        bio: result.description || undefined,
        profilePicture,
        followers: parseCount(result.subscriber_count),
        posts: result.video_count,
        isVerified: result.verified,
      };
    } catch (error: any) {
      if (error.response?.status === 404 || error.message === 'USER_NOT_FOUND') {
        throw new Error('USER_NOT_FOUND');
      }
      if (error.code === 'ECONNABORTED') {
        throw new Error('TIMEOUT');
      }
      throw error;
    }
  }

  async scrapeTikTok(username: string): Promise<any> {
    // TikTok endpoint varies; this needs the actual RapidAPI TikTok endpoint you'll provide
    console.log('TikTok scraping via RapidAPI - awaiting endpoint details');
    throw new Error('TIKTOK_ENDPOINT_PENDING');
  }

  async scrapeTwitter(username: string): Promise<any> {
    // Twitter endpoint varies; this needs the actual RapidAPI Twitter endpoint you'll provide
    console.log('Twitter scraping via RapidAPI - awaiting endpoint details');
    throw new Error('TWITTER_ENDPOINT_PENDING');
  }

  /**
   * Main entry point for all platforms
   */
  async scrape(platform: string, username: string): Promise<any> {
    switch (platform.toLowerCase()) {
      case 'instagram':
        return this.scrapeInstagram(username);
      case 'youtube':
        return this.scrapeYouTube(username);
      case 'tiktok':
        return this.scrapeTikTok(username);
      case 'twitter':
        return this.scrapeTwitter(username);
      default:
        throw new Error('UNSUPPORTED_PLATFORM');
    }
  }
}

export const rapidApiScraper = new RapidAPIScraper();
