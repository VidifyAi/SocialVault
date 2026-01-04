import { prisma } from '../lib/prisma';
import { cache } from '../lib/redis';
import { NotFoundError, ForbiddenError, BadRequestError } from '../utils/errors';
import { Prisma } from '@prisma/client';
import { config } from '../config';
import { ListingStatus } from '@socialswapr/types';

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
}

export class ListingService {
  async create(data: CreateListingData) {
    // Transform frontend form data to database format
    // Frontend sends: title, platform, category, handle, followers, engagement, accountAge, monthlyRevenue
    // Database expects: username, niche, metrics (JSON), accountAge (number)
    
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
        currency: data.currency || 'USD',
        negotiable: data.negotiable ?? true,
        includesEmail: data.includesEmail || false,
        includesOriginalEmail: data.includesOriginalEmail || false,
        accountAge,
        screenshots: data.screenshots || [],
        status: 'pending_review', // Requires admin approval before going live
        verificationStatus: 'pending',
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
    const listing = await prisma.listing.findUnique({
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

    return {
      ...listing,
      isFavorited,
    };
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

    return {
      listings,
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

    return favorites.map((f) => ({
      ...f.listing,
      favoritedAt: f.createdAt,
    }));
  }

  // Admin functions
  async approveListing(id: string) {
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
