import { Router, Request, Response, NextFunction } from 'express';
import { scraperService } from '../services/scraper.service';
import { optionalAuth, AuthenticatedRequest } from '../middleware/auth';
import rateLimit from 'express-rate-limit';

/**
 * Scraper API Routes
 * Endpoint: GET /api/scrape/:platform/:username
 * 
 * All metrics are estimated from publicly available information and may not reflect real-time or exact values.
 */

const router: Router = Router();

// Rate limiting: 30 requests per minute per IP
const scraperLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 30,
  message: { success: false, error: 'RATE_LIMIT_EXCEEDED', message: 'Too many requests, please try again later' },
  standardHeaders: true,
  legacyHeaders: false,
});

/**
 * GET /scrape/:platform/:username
 * Fetch public metadata for a social media profile
 * 
 * @param platform - instagram | youtube | twitter | tiktok
 * @param username - Username/handle (with or without @)
 * @query refresh - Force refresh (bypass cache)
 */
router.get(
  '/:platform/:username',
  scraperLimiter,
  optionalAuth,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { platform, username } = req.params;
      const refresh = req.query.refresh === 'true';

      // Validate platform
      const supportedPlatforms = ['instagram', 'youtube', 'twitter', 'tiktok'];
      if (!supportedPlatforms.includes(platform.toLowerCase())) {
        return res.status(400).json({
          success: false,
          error: 'INVALID_PLATFORM',
          message: `Platform must be one of: ${supportedPlatforms.join(', ')}`,
        });
      }

      // Validate username
      if (!username || username.length < 1 || username.length > 30) {
        return res.status(400).json({
          success: false,
          error: 'INVALID_USERNAME',
          message: 'Username must be between 1 and 30 characters',
        });
      }

      const result = await scraperService.scrapeProfile(
        platform.toLowerCase() as any,
        username,
        !refresh
      );

      const statusCode = result.success ? 200 : result.error === 'USER_NOT_FOUND' ? 404 : 500;
      res.status(statusCode).json(result);
    } catch (error) {
      next(error);
    }
  }
);

/**
 * DELETE /scrape/:platform/:username/cache
 * Invalidate cached profile data (requires authentication)
 */
router.delete(
  '/:platform/:username/cache',
  scraperLimiter,
  optionalAuth,
  async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const { platform, username } = req.params;

      await scraperService.invalidateCache(platform as any, username);

      res.json({
        success: true,
        message: 'Cache invalidated',
      });
    } catch (error) {
      next(error);
    }
  }
);

export default router;
