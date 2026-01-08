import { cache } from '../lib/redis';
import { rapidApiScraper, ScraperResult } from './platforms/rapidapi.scraper';

/**
 * Central Scraper Service
 * Manages platform-specific scrapers with caching and rate limiting
 * Architecture: routes → controllers → services (this file) → platform scrapers
 */

type Platform = 'instagram' | 'youtube' | 'twitter' | 'tiktok';

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

  constructor() {
    // No platform-specific scrapers needed; using unified RapidAPI service
  }

  /**
   * Main entry point for scraping a social media profile
   * Uses RapidAPI endpoints for all platforms
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

    // Perform scraping via RapidAPI
    try {
      const data = await rapidApiScraper.scrape(platform, username);
      
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
      } else if (errorCode === 'YOUTUBE_ENDPOINT_PENDING' || errorCode === 'TIKTOK_ENDPOINT_PENDING' || errorCode === 'TWITTER_ENDPOINT_PENDING') {
        userMessage = `${platform} integration is pending RapidAPI endpoint configuration`;
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
      } else if (hostname.includes('twitter.com') || hostname.includes('x.com')) {
        platform = 'twitter';
        const match = urlObj.pathname.match(/^\/([^\/]+)/);
        username = match ? match[1] : null;
      } else if (hostname.includes('tiktok.com')) {
        platform = 'tiktok';
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
