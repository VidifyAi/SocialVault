import http from 'http';
import https from 'https';
import { prisma } from '../lib/prisma';
import { cache } from '../lib/redis';
import { config } from '../config';
import { NotFoundError, ForbiddenError, BadRequestError } from '../utils/errors';
import { Prisma } from '@prisma/client';
import { ListingStatus } from '@socialswapr/types';
import { scraperService } from './scraper.service';

const generateVerificationCode = () => {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = 'SS-';
  for (let i = 0; i < 6; i += 1) {
    code += chars[Math.floor(Math.random() * chars.length)];
  }
  return code;
};

const fetchVerificationPage = (url: string, redirects = 0): Promise<string> =>
  new Promise<string>((resolve, reject) => {
    if (redirects > 5) {
      reject(new Error('Too many redirects'));
      return;
    }

    const client = url.startsWith('https') ? https : http;
    const options = {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.9',
      },
      timeout: 8000
    };

    const req = client.get(url, options, (res) => {
      // Handle redirects
      if (res.statusCode && [301, 302, 303, 307, 308].includes(res.statusCode) && res.headers.location) {
        let redirectUrl = res.headers.location;
        if (!redirectUrl.startsWith('http')) {
          const origin = new URL(url).origin;
          redirectUrl = origin + (redirectUrl.startsWith('/') ? '' : '/') + redirectUrl;
        }
        resolve(fetchVerificationPage(redirectUrl, redirects + 1));
        return;
      }

      if ((res.statusCode || 500) >= 400) {
        reject(new Error(`Verification URL responded with status ${res.statusCode}`));
        return;
      }

      const chunks: Buffer[] = [];
      res.on('data', (chunk) => {
        chunks.push(typeof chunk === 'string' ? Buffer.from(chunk) : chunk);
        const size = chunks.reduce((total, c) => total + c.length, 0);
        if (size > 1_000_000) {
          req.destroy();
          reject(new Error('Verification response too large'));
        }
      });

      res.on('end', () => {
        resolve(Buffer.concat(chunks).toString('utf8'));
      });
    });

    req.on('error', (err) => reject(err));
    req.on('timeout', () => {
      req.destroy();
      reject(new Error('Verification request timed out'));
    });
  });

const extractProfileInfo = (page: string) => {
  const info: {
    title?: string;
    bio?: string;
    image?: string;
    followers?: number;
  } = {};

  // 1. Better Title Extraction (Avoid generic platform names)
  const titleMatch = page.match(/<title[^>]*>([^<]+)<\/title>/i);
  let rawTitle = titleMatch ? titleMatch[1].trim() : '';

  const ogTitleMatch = page.match(/property=["']og:title["']\s+content=["']([^"']+)["']/i);
  if (ogTitleMatch) rawTitle = ogTitleMatch[1].trim();

  // If title is just a platform name, it's likely a redirect/login page
  const genericTitles = ['instagram', 'tiktok', 'youtube', 'twitter', 'x', 'facebook', 'snapchat'];
  if (genericTitles.includes(rawTitle.toLowerCase())) {
    rawTitle = ''; // Discard generic title
  }

  // 2. Bio/Description Extraction
  const ogDescMatch = page.match(/property=["']og:description["']\s+content=["']([^"']+)["']/i);
  const ogDesc = ogDescMatch ? ogDescMatch[1].trim() : '';

  // 3. Image Extraction
  const ogImage = page.match(/property=["']og:image["']\s+content=["']([^"']+)["']/i);
  if (ogImage) info.image = ogImage[1].trim();

  // 4. Platform-Specific JSON Extraction (Advanced)
  if (!rawTitle || !info.followers) {
    // Try to find common JSON keys in <script> tags for better accuracy
    const jsonMatch = page.match(/\{"subscriberCountText":\{"accessibility":\{"accessibilityData":\{"label":"([^"]+)"/i) || // YouTube
                      page.match(/"edge_followed_by":\{"count":(\d+)\}/i); // Instagram JSON
    
    if (jsonMatch) {
      if (jsonMatch[1] && isNaN(Number(jsonMatch[1]))) {
        // e.g. "1.23M subscribers"
        const numStr = jsonMatch[1].toLowerCase();
        let multiplier = 1;
        if (numStr.includes('m')) multiplier = 1000000;
        else if (numStr.includes('k')) multiplier = 1000;
        const parsed = parseFloat(numStr.replace(/[^0-9.]/g, ''));
        if (!isNaN(parsed)) info.followers = Math.floor(parsed * multiplier);
      } else if (jsonMatch[1]) {
        info.followers = parseInt(jsonMatch[1], 10);
      }
    }
  }

  // 5. Follower Parsing (Regex fallback)
  const followerPatterns = [
    /([0-9.,]+[kKmMbB]?)\s*(?:Followers|Follower|Subscribers|Subscriber|Fans)/i,
    /([0-9.]+[kKmMbB]?)\s*subscribers/i,
    /Followers:\s*([0-9.kKmMbB]+)/i
  ];

  if (!info.followers) {
    for (const pattern of followerPatterns) {
      const match = ogDesc.match(pattern) || page.match(pattern);
      if (match) {
        let numStr = match[1].toLowerCase().replace(/,/g, '');
        let multiplier = 1;
        if (numStr.endsWith('k')) { multiplier = 1000; numStr = numStr.slice(0, -1); }
        else if (numStr.endsWith('m')) { multiplier = 1000000; numStr = numStr.slice(0, -1); }
        else if (numStr.endsWith('b')) { multiplier = 1000000000; numStr = numStr.slice(0, -1); }
        const parsed = parseFloat(numStr);
        if (!Number.isNaN(parsed)) {
          info.followers = Math.floor(parsed * multiplier);
          break;
        }
      }
    }
  }

  // Final Cleanup
  info.title = rawTitle
    .replace(/\s*[•|\-|]\s*(Instagram|TikTok|YouTube|Twitter|X|Facebook|Snapchat).*/gi, '')
    .trim() || undefined;
  
  info.bio = ogDesc || undefined;

  // Don't return "Instagram" or other generic platform names as the profile title
  if (info.title && genericTitles.includes(info.title.toLowerCase())) {
     info.title = undefined;
  }

  return info;
};

// Accept both frontend form format and structured API format
interface CreateListingData {
  sellerId: string;
  // Frontend form fields
  title?: string;
  platform: string;
  category?: string;
  handle?: string;
  followers?: number;
  engagement?: number;
  transferSteps?: string;
  // Backend structured fields
  username?: string;
  displayName?: string;
  niche?: string;
  description: string;
  accountType?: 'personal' | 'business' | 'creator';
  metrics?: {
    followers?: number;
    following?: number;
    posts?: number;
    subscribers?: number;
    views?: number;
    engagementRate?: number;
    averageLikes?: number;
    averageComments?: number;
    averageViews?: number;
  };
  demographics?: Record<string, unknown>;
  isMonetized?: boolean;
  monthlyRevenue?: number;
  price: number;
  currency?: string;
  negotiable?: boolean;
  includesEmail?: boolean;
  includesOriginalEmail?: boolean;
  accountAge?: number;
  screenshots?: string[];
  verificationCode?: string;
  verificationUrl?: string;
}

interface ListingFilters {
  platform?: string;
  niche?: string;
  category?: string; // Alias for niche from frontend
  minFollowers?: number;
  maxFollowers?: number;
  minPrice?: number;
  maxPrice?: number;
  minEngagement?: number;
  maxEngagement?: number;
  isMonetized?: boolean;
  isVerified?: boolean;
  search?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  page?: number;
  limit?: number;
  requestingUserId?: string;
}

const maskHandle = (text: string): string => {
  if (!text) return '';
  if (text.length < 6) return '*'.repeat(text.length);
  return text.slice(0, 4) + '*'.repeat(5) + text.slice(-2);
};

const sanitizeListingForPublic = (
  listing: Record<string, any>,
  requestingUserId?: string
) => {
  // Skip masking for the listing owner
  if (requestingUserId && listing.sellerId === requestingUserId) {
    return listing;
  }

  const sanitized = { ...listing };
  // Mask account identity fields
  if (sanitized.username) sanitized.username = maskHandle(sanitized.username);
  if (sanitized.displayName) sanitized.displayName = maskHandle(sanitized.displayName);
  // Strip verification details
  delete sanitized.verificationUrl;
  delete sanitized.verificationCode;
  delete sanitized.verificationMethod;
  return sanitized;
};

const findDescriptionPolicyViolations = (text: string) => {
  const issues: string[] = [];
  if (/(https?:\/\/|www\.)/i.test(text)) issues.push('links');
  if (/\S+@\S+\.\S+/i.test(text)) issues.push('email addresses');
  if (/@[a-z0-9_.-]{2,}/i.test(text)) issues.push('usernames/handles');
  if (/(^|\s)[0-9][\s-()]{0,2}(?:[0-9][\s-()]{0,2}){6,}/.test(text)) issues.push('phone numbers');
  if (/(telegram|whatsapp|contact|gmail|email|phone|imessage|signal|snapchat|discord|t\.me)/i.test(text)) issues.push('contact information');
  return issues;
};

export class ListingService {
  async generateVerificationCode() {
    return generateVerificationCode();
  }

  async getProfilePreview(profileUrl: string) {
    // Use new scraper service for better reliability
    try {
      const preview = await scraperService.getProfilePreview(profileUrl);
      return preview;
    } catch (error: any) {
      // Fallback to legacy HTML scraping if scraper service fails
      const page = await fetchVerificationPage(profileUrl);
      return extractProfileInfo(page);
    }
  }

  async verifyProfile(verificationUrl: string, code: string) {
    const pageContent = await fetchVerificationPage(verificationUrl.trim());
    const verified = pageContent.toLowerCase().includes(code.toLowerCase());
    const profile = extractProfileInfo(pageContent);

    if (!verified) {
      throw new BadRequestError('Verification code not found on the provided profile. Add the code to your bio/story/link and try again.');
    }

    return { verified, profile };
  }

  async create(data: CreateListingData) {
    // Enforce listing limit per user
    const activeListingCount = await prisma.listing.count({
      where: { sellerId: data.sellerId, status: { in: ['active', 'pending_review', 'draft'] } },
    });
    if (activeListingCount >= config.maxListingsPerUser) {
      throw new BadRequestError(`You can have at most ${config.maxListingsPerUser} active listings`);
    }

    const violations = findDescriptionPolicyViolations(data.description || '');
    if (violations.length > 0) {
      throw new BadRequestError(
        `Description violates policy: ${violations.join(', ')} are not allowed. Remove contact details, usernames and links.`
      );
    }
    
    const verificationCode = data.verificationCode || generateVerificationCode();

    const username = data.username || data.handle || 'unknown';
    const niche = data.niche || data.category || 'other';
    const displayName = data.displayName || data.title || username;
    
    // Build metrics object
    const metrics = data.metrics || {
      followers: data.followers || 0,
      engagementRate: data.engagement || 0,
    };
    
    // Parse accountAge - could be string like "10" or number
    const accountAge = typeof data.accountAge === 'string' 
      ? parseInt(data.accountAge, 10) || 1 
      : data.accountAge || 1;
    
    let verifiedStatus: 'pending' | 'verified' = 'pending';

    if (data.verificationUrl && data.verificationCode) {
      await this.verifyProfile(data.verificationUrl, data.verificationCode);
      verifiedStatus = 'verified';
    }

    const listing = await prisma.listing.create({
      data: {
        sellerId: data.sellerId,
        platform: data.platform.toLowerCase(),
        username,
        displayName,
        niche,
        description: data.description,
        accountType: data.accountType || 'personal',
        metrics: metrics as Prisma.JsonObject,
        demographics: data.demographics as Prisma.JsonObject,
        isMonetized: data.isMonetized || (data.monthlyRevenue ? true : false),
        monthlyRevenue: data.monthlyRevenue,
        price: data.price,
        currency: 'INR',
        negotiable: data.negotiable ?? true,
        includesEmail: data.includesEmail || false,
        includesOriginalEmail: data.includesOriginalEmail || false,
        accountAge,
        screenshots: data.screenshots || [],
        status: 'pending_review', // Requires admin approval before going live
        verificationStatus: verifiedStatus,
        verificationCode,
        verificationMethod: 'platform_action',
        verificationUrl: data.verificationUrl,
      },
      include: {
        seller: {
          select: {
            id: true,
            username: true,
            avatarUrl: true,
            trustScore: true,
            kycStatus: true,
          },
        },
      },
    });

    // Invalidate cache
    await cache.delPattern('listings:*');

    return listing;
  }

  async getById(id: string, userId?: string) {
    let listing = await prisma.listing.findUnique({
      where: { id },
      include: {
        seller: {
          select: {
            id: true,
            username: true,
            avatarUrl: true,
            trustScore: true,
            kycStatus: true,
            createdAt: true,
            _count: {
              select: {
                soldTransactions: {
                  where: { status: 'completed' },
                },
                reviewsReceived: true,
              },
            },
          },
        },
        _count: {
          select: {
            favorites: true,
          },
        },
      },
    });

    if (!listing) {
      throw new NotFoundError('Listing');
    }

    // Backfill verification code for older listings
    if (!listing.verificationCode) {
      listing = await prisma.listing.update({
        where: { id },
        data: {
          verificationCode: generateVerificationCode(),
          verificationMethod: listing.verificationMethod || 'platform_action',
          verificationStatus: listing.verificationStatus || 'pending',
        },
        include: {
          seller: {
            select: {
              id: true,
              username: true,
              avatarUrl: true,
              trustScore: true,
              kycStatus: true,
              createdAt: true,
              _count: {
                select: {
                  soldTransactions: {
                    where: { status: 'completed' },
                  },
                  reviewsReceived: true,
                },
              },
            },
          },
          _count: {
            select: {
              favorites: true,
            },
          },
        },
      });
    }

    // Check if listing is accessible
    if (
      listing.status !== 'active' &&
      listing.sellerId !== userId
    ) {
      throw new ForbiddenError('This listing is not available');
    }

    // Increment view count (don't await for performance)
    prisma.listing.update({
      where: { id },
      data: { views: { increment: 1 } },
    }).catch(() => {}); // Ignore errors

    // Check if user has favorited
    let isFavorited = false;
    if (userId) {
      const favorite = await prisma.favorite.findUnique({
        where: {
          userId_listingId: { userId, listingId: id },
        },
      });
      isFavorited = !!favorite;
    }

    return sanitizeListingForPublic({
      ...listing,
      isFavorited,
    }, userId);
  }

  async search(filters: ListingFilters) {
    const {
      platform,
      niche,
      minFollowers,
      maxFollowers,
      minPrice,
      maxPrice,
      minEngagement,
      maxEngagement,
      isMonetized,
      isVerified,
      search,
      sortBy = 'newest',
      page = 1,
      limit = 20,
    } = filters;

    const skip = (page - 1) * limit;

    // Build where clause
    const where: Prisma.ListingWhereInput = {
      status: 'active',
    };

    if (platform) {
      where.platform = platform;
    }

    if (niche) {
      where.niche = { contains: niche, mode: 'insensitive' };
    }

    if (minPrice !== undefined || maxPrice !== undefined) {
      where.price = {};
      if (minPrice !== undefined) where.price.gte = minPrice;
      if (maxPrice !== undefined) where.price.lte = maxPrice;
    }

    if (isMonetized !== undefined) {
      where.isMonetized = isMonetized;
    }

    if (isVerified) {
      where.verificationStatus = 'verified';
    }

    // Search in username, displayName, description, niche
    if (search) {
      where.OR = [
        { username: { contains: search, mode: 'insensitive' } },
        { displayName: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
        { niche: { contains: search, mode: 'insensitive' } },
      ];
    }

    // Metrics filtering using JSON
    if (minFollowers !== undefined || maxFollowers !== undefined) {
      where.metrics = {
        ...(minFollowers !== undefined ? { path: ['followers'], gte: minFollowers } : {}),
        ...(maxFollowers !== undefined ? { path: ['followers'], lte: maxFollowers } : {}),
      } as any;
    }

    // Build order by
    let orderBy: Prisma.ListingOrderByWithRelationInput = { createdAt: 'desc' };
    
    // Handle various sort formats from frontend
    const sortOrder = filters.sortOrder || 'desc';
    
    switch (sortBy) {
      case 'price_asc':
        orderBy = { price: 'asc' };
        break;
      case 'price_desc':
        orderBy = { price: 'desc' };
        break;
      case 'price':
        orderBy = { price: sortOrder };
        break;
      case 'newest':
      case 'createdAt':
        orderBy = { createdAt: sortOrder };
        break;
      case 'followers_desc':
      case 'followers':
        // Can't sort by JSON field directly, default to newest
        orderBy = { createdAt: 'desc' };
        break;
      case 'engagement_desc':
      case 'engagement':
        orderBy = { createdAt: 'desc' };
        break;
      default:
        orderBy = { createdAt: 'desc' };
    }

    // Execute query
    const [listings, total] = await Promise.all([
      prisma.listing.findMany({
        where,
        orderBy,
        skip,
        take: limit,
        include: {
          seller: {
            select: {
              id: true,
              username: true,
              avatarUrl: true,
              trustScore: true,
              kycStatus: true,
            },
          },
          _count: {
            select: { favorites: true },
          },
        },
      }),
      prisma.listing.count({ where }),
    ]);

    const totalPages = Math.ceil(total / limit);

    const sanitizedListings = listings.map((l: any) =>
      sanitizeListingForPublic(l, filters.requestingUserId)
    );

    return {
      listings: sanitizedListings,
      meta: {
        page,
        limit,
        total,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1,
      },
    };
  }

  async update(id: string, userId: string, data: Partial<CreateListingData>) {
    const listing = await prisma.listing.findUnique({
      where: { id },
    });

    if (!listing) {
      throw new NotFoundError('Listing');
    }

    if (listing.sellerId !== userId) {
      throw new ForbiddenError('You can only edit your own listings');
    }

    if (listing.status === 'sold') {
      throw new BadRequestError('Cannot edit a sold listing');
    }

    const updatedListing = await prisma.listing.update({
      where: { id },
      data: {
        ...data,
        metrics: data.metrics as Prisma.JsonObject,
        demographics: data.demographics as Prisma.JsonObject,
        // Reset to pending review if significant changes
        status: listing.status === 'active' ? 'pending_review' : listing.status,
      },
      include: {
        seller: {
          select: {
            id: true,
            username: true,
            avatarUrl: true,
            trustScore: true,
          },
        },
      },
    });

    await cache.delPattern('listings:*');

    return updatedListing;
  }

  async delete(id: string, userId: string, isAdmin = false) {
    const listing = await prisma.listing.findUnique({
      where: { id },
    });

    if (!listing) {
      throw new NotFoundError('Listing');
    }

    if (listing.sellerId !== userId && !isAdmin) {
      throw new ForbiddenError('You can only delete your own listings');
    }

    if (listing.status === 'sold') {
      throw new BadRequestError('Cannot delete a sold listing');
    }

    await prisma.listing.delete({ where: { id } });
    await cache.delPattern('listings:*');

    return { message: 'Listing deleted successfully' };
  }

  async toggleFavorite(listingId: string, userId: string) {
    const existing = await prisma.favorite.findUnique({
      where: {
        userId_listingId: { userId, listingId },
      },
    });

    if (existing) {
      await prisma.$transaction([
        prisma.favorite.delete({ where: { id: existing.id } }),
        prisma.listing.update({
          where: { id: listingId },
          data: { favoritesCount: { decrement: 1 } },
        }),
      ]);
      return { isFavorited: false };
    } else {
      await prisma.$transaction([
        prisma.favorite.create({
          data: { userId, listingId },
        }),
        prisma.listing.update({
          where: { id: listingId },
          data: { favoritesCount: { increment: 1 } },
        }),
      ]);
      return { isFavorited: true };
    }
  }

  async getMyListings(userId: string, status?: ListingStatus) {
    const where: Prisma.ListingWhereInput = { sellerId: userId };
    if (status) where.status = status;

    return prisma.listing.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        _count: {
          select: { favorites: true, offers: true },
        },
      },
    });
  }

  async getFavorites(userId: string) {
    const favorites = await prisma.favorite.findMany({
      where: { userId },
      include: {
        listing: {
          include: {
            seller: {
              select: {
                id: true,
                username: true,
                avatarUrl: true,
                trustScore: true,
              },
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return favorites.map((f: any) => ({
      ...f.listing,
      favoritedAt: f.createdAt,
    }));
  }

  async verifyOwnership(
    listingId: string,
    userId: string,
    verificationUrl: string,
    method = 'platform_action'
  ) {
    if (!verificationUrl) {
      throw new BadRequestError('Verification URL is required');
    }

    if (!/^https?:\/\//i.test(verificationUrl)) {
      throw new BadRequestError('Verification URL must start with http or https');
    }

    const listing = await prisma.listing.findUnique({ where: { id: listingId } });

    if (!listing) {
      throw new NotFoundError('Listing');
    }

    if (listing.sellerId !== userId) {
      throw new ForbiddenError('You can only verify your own listings');
    }

    const code = listing.verificationCode || generateVerificationCode();

    let pageContent = '';
    try {
      pageContent = await fetchVerificationPage(verificationUrl.trim());
    } catch (error: any) {
      throw new BadRequestError(error.message || 'Could not fetch verification URL');
    }

    const verified = pageContent.toLowerCase().includes(code.toLowerCase());

    const updatedListing = await prisma.listing.update({
      where: { id: listingId },
      data: {
        verificationStatus: verified ? 'verified' : 'failed',
        verificationCode: code,
        verificationMethod: method,
        verificationUrl: verificationUrl.trim(),
        verificationCheckedAt: new Date(),
      },
    });

    await cache.delPattern('listings:*');

    if (!verified) {
      throw new BadRequestError(
        'Verification code not found on the provided profile. Add the code to your bio/story/link and try again.'
      );
    }

    return updatedListing;
  }

  // Admin functions
  async approveListing(id: string) {
    const listing = await prisma.listing.findUnique({ where: { id } });

    if (!listing) {
      throw new NotFoundError('Listing');
    }

    if (listing.verificationStatus !== 'verified') {
      throw new BadRequestError('Listing must be ownership verified before publishing');
    }

    return prisma.listing.update({
      where: { id },
      data: { status: 'active' },
    });
  }

  async rejectListing(id: string, reason: string) {
    // TODO: Send notification to seller with reason
    return prisma.listing.update({
      where: { id },
      data: { status: 'suspended' },
    });
  }

  async getPendingListings() {
    return prisma.listing.findMany({
      where: { status: 'pending_review' },
      orderBy: { createdAt: 'asc' },
      include: {
        seller: {
          select: {
            id: true,
            username: true,
            email: true,
            kycStatus: true,
            trustScore: true,
          },
        },
      },
    });
  }
}

export const listingService = new ListingService();
