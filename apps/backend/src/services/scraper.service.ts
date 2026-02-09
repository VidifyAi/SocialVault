import { cache } from '../lib/redis';
import { ScraperResult } from './platforms/types';
import { scrapeInstagram } from './platforms/instagram.scraper';
import { scrapeYouTube } from './platforms/youtube.scraper';

/**
 * Central Scraper Service
 * Manages platform-specific scrapers with caching and rate limiting
 * Architecture: routes → controllers → services (this file) → platform scrapers
 */

type Platform = 'instagram' | 'youtube';

interface ScraperResponse {
  success: boolean;
  platform: Platform;
  username: string;
  data?: ScraperResult;
  error?: string;
  message?: string;
  source: 'cache' | 'public';
  cached: boolean;
  timestamp: string;
}

class ScraperService {
  private readonly CACHE_TTL = 48 * 60 * 60; // 48 hours

  /**
   * Main entry point for scraping a social media profile
   * Uses official YouTube API and Instagram HTML scraping
   * @param platform - Social media platform
   * @param username - Username/handle (without @)
   * @param useCache - Whether to use cached results (default: true)
   */
  async scrapeProfile(
    platform: Platform,
    username: string,
    useCache = true
  ): Promise<ScraperResponse> {
    const cacheKey = `scraper:${platform}:${username.toLowerCase()}`;
    const timestamp = new Date().toISOString();

    // Check cache first
    if (useCache) {
      try {
        const cached = await cache.get(cacheKey);
        if (cached) {
          const data = JSON.parse(cached);
          return {
            success: true,
            platform,
            username,
            data,
            source: 'cache',
            cached: true,
            timestamp: data.cachedAt || timestamp,
          };
        }
      } catch (e) {
        // Cache miss or parse error, proceed to scraping
      }
    }

    // Perform scraping
    try {
      let data: ScraperResult;
      switch (platform) {
        case 'instagram':
          data = await scrapeInstagram(username);
          break;
        case 'youtube':
          data = await scrapeYouTube(username);
          break;
        default:
          throw new Error('UNSUPPORTED_PLATFORM');
      }

      // Add timestamp to cached data
      const cacheData = { ...data, cachedAt: timestamp };

      // Store in cache
      try {
        await cache.set(cacheKey, JSON.stringify(cacheData), this.CACHE_TTL);
      } catch (e) {
        // Cache write failed, but scraping succeeded
      }

      return {
        success: true,
        platform,
        username,
        data,
        source: 'public',
        cached: false,
        timestamp,
      };
    } catch (error: any) {
      const errorCode = error.message || 'UNKNOWN_ERROR';

      let userMessage = 'Failed to fetch profile data';
      if (errorCode === 'USER_NOT_FOUND') {
        userMessage = 'Profile does not exist or is private';
      } else if (errorCode === 'TIMEOUT') {
        userMessage = 'Request timed out';
      } else if (errorCode.startsWith('HTTP_')) {
        userMessage = `Platform returned status ${errorCode.replace('HTTP_', '')}`;
      }

      return {
        success: false,
        platform,
        username,
        error: errorCode,
        message: userMessage,
        source: 'public',
        cached: false,
        timestamp,
      };
    }
  }

  /**
   * Invalidate cache for a specific profile
   */
  async invalidateCache(platform: Platform, username: string): Promise<void> {
    const cacheKey = `scraper:${platform}:${username.toLowerCase()}`;
    await cache.del(cacheKey);
  }

  /**
   * Get cached result without triggering a new scrape
   */
  async getCachedProfile(platform: Platform, username: string): Promise<ScraperResult | null> {
    const cacheKey = `scraper:${platform}:${username.toLowerCase()}`;
    try {
      const cached = await cache.get(cacheKey);
      return cached ? JSON.parse(cached) : null;
    } catch (e) {
      return null;
    }
  }

  /**
   * Legacy adapter for existing listing service
   * Converts new scraper result to old format
   */
  async getProfilePreview(profileUrl: string): Promise<{
    title?: string;
    bio?: string;
    image?: string;
    followers?: number;
  }> {
    // Parse platform and username from URL
    const { platform, username } = this.parseProfileUrl(profileUrl);

    if (!platform || !username) {
      throw new Error('Invalid profile URL format');
    }

    const result = await this.scrapeProfile(platform, username);

    if (!result.success || !result.data) {
      throw new Error(result.message || 'Failed to fetch profile');
    }

    return {
      title: result.data.displayName,
      bio: result.data.bio,
      image: result.data.profilePicture,
      followers: result.data.followers,
    };
  }

  private parseProfileUrl(url: string): { platform: Platform | null; username: string | null } {
    try {
      const urlObj = new URL(url);
      const hostname = urlObj.hostname.replace(/^www\./, '');

      let platform: Platform | null = null;
      let username: string | null = null;

      if (hostname.includes('instagram.com')) {
        platform = 'instagram';
        const match = urlObj.pathname.match(/^\/([^\/]+)/);
        username = match ? match[1] : null;
      } else if (hostname.includes('youtube.com')) {
        platform = 'youtube';
        const match = urlObj.pathname.match(/^\/@?([^\/]+)/);
        username = match ? match[1] : null;
      }

      return { platform, username: username?.replace(/^@/, '') || null };
    } catch (e) {
      return { platform: null, username: null };
    }
  }
}

export const scraperService = new ScraperService();
export type { ScraperResult };
