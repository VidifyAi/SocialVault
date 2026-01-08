import { z } from 'zod';

// Valid platforms
const validPlatforms = [
  'instagram', 'tiktok', 'youtube', 'twitter', 'twitch', 
  'facebook', 'linkedin', 'discord', 'telegram', 'reddit', 
  'snapchat', 'pinterest', 'onlyfans', 'other'
] as const;

// Mongo ObjectId matcher for resource ids
const objectId = z.string().regex(/^[a-fA-F0-9]{24}$/, 'Invalid object id');

// Auth schemas
export const registerSchema = z.object({
  body: z.object({
    email: z.string().email('Invalid email address'),
    username: z.string()
      .min(3, 'Username must be at least 3 characters')
      .max(30, 'Username must be at most 30 characters')
      .regex(/^[a-zA-Z0-9_]+$/, 'Username can only contain letters, numbers, and underscores'),
    password: z.string()
      .min(8, 'Password must be at least 8 characters')
      .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
      .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
      .regex(/[0-9]/, 'Password must contain at least one number'),
    role: z.enum(['buyer', 'seller']).optional().default('buyer'),
  }),
});

export const loginSchema = z.object({
  body: z.object({
    email: z.string().email('Invalid email address'),
    password: z.string().min(1, 'Password is required'),
  }),
});

export const refreshTokenSchema = z.object({
  body: z.object({
    refreshToken: z.string().min(1, 'Refresh token is required'),
  }),
});

// Listing schemas
// Accept form data format from frontend (simpler structure)
export const createListingSchema = z.object({
  body: z.object({
    // Frontend sends these fields
    title: z.string().min(10, 'Title must be at least 10 characters').optional(),
    platform: z.string().min(1, 'Platform is required'),
    category: z.string().min(1, 'Category is required').optional(),
    handle: z.string().optional(),
    description: z.string().min(50, 'Description must be at least 50 characters'),
    price: z.coerce.number().min(50, 'Minimum price is $50'),
    followers: z.coerce.number().min(100, 'Minimum 100 followers required').optional(),
    engagement: z.coerce.number().min(0).max(100).optional(),
    accountAge: z.coerce.number().min(1, 'Account age must be at least 1 month').optional(),
    monthlyRevenue: z.coerce.number().optional(),
    transferSteps: z.string().optional(), // JSON string
    profileUrl: z.string().url().optional(),
    verificationCode: z.string().optional(),
    verificationUrl: z.string().url().optional(),
    
    // Backend structured fields (for API clients)
    username: z.string().optional(),
    displayName: z.string().optional(),
    niche: z.string().optional(),
    accountType: z.enum(['personal', 'business', 'creator']).default('personal'),
    metrics: z.object({
      followers: z.number().min(100).optional(),
      following: z.number().optional(),
      posts: z.number().optional(),
      subscribers: z.number().optional(),
      views: z.number().optional(),
      engagementRate: z.number().min(0).max(100).optional(),
      averageLikes: z.number().optional(),
      averageComments: z.number().optional(),
      averageViews: z.number().optional(),
    }).optional(),
    demographics: z.object({
      ageGroups: z.record(z.number()).optional(),
      genderSplit: z.record(z.number()).optional(),
      topCountries: z.record(z.number()).optional(),
      topCities: z.record(z.number()).optional(),
    }).optional(),
    isMonetized: z.boolean().default(false),
    currency: z.string().default('USD'),
    negotiable: z.boolean().default(true),
    includesEmail: z.boolean().default(false),
    includesOriginalEmail: z.boolean().default(false),
    screenshots: z.array(z.string().url()).optional(),
  }),
});

export const updateListingSchema = z.object({
  params: z.object({
    id: z.string().uuid(),
  }),
  body: z.object({
    displayName: z.string().optional(),
    niche: z.string().optional(),
    description: z.string().min(50).optional(),
    metrics: z.object({
      followers: z.number().min(100).optional(),
      following: z.number().optional(),
      posts: z.number().optional(),
      engagementRate: z.number().min(0).max(100).optional(),
    }).optional(),
    price: z.number().min(100).optional(),
    negotiable: z.boolean().optional(),
    screenshots: z.array(z.string().url()).min(2).max(10).optional(),
  }),
});

export const listingQuerySchema = z.object({
  query: z.object({
    platform: z.enum(validPlatforms).optional(),
    niche: z.string().optional(),
    category: z.string().optional(), // Alias for niche
    minFollowers: z.coerce.number().optional(),
    maxFollowers: z.coerce.number().optional(),
    minPrice: z.coerce.number().optional(),
    maxPrice: z.coerce.number().optional(),
    minEngagement: z.coerce.number().optional(),
    maxEngagement: z.coerce.number().optional(),
    isMonetized: z.coerce.boolean().optional(),
    isVerified: z.coerce.boolean().optional(),
    sortBy: z.string().optional().default('newest'), // Accept any string, service will handle
    sortOrder: z.enum(['asc', 'desc']).optional().default('desc'),
    page: z.coerce.number().min(1).optional().default(1),
    limit: z.coerce.number().min(1).max(50).optional().default(20),
    search: z.string().optional(),
  }),
});

// Offer schemas
export const createOfferSchema = z.object({
  body: z.object({
    listingId: objectId,
    amount: z.number().min(1, 'Offer amount must be positive'),
    message: z.string().max(500).optional(),
    expiresInHours: z.number().min(1).max(168).default(48), // 1 hour to 7 days
  }),
});

export const offerResponseSchema = z.object({
  params: z.object({
    id: z.string().uuid(),
  }),
  body: z.object({
    action: z.enum(['accept', 'reject', 'counter']),
    counterAmount: z.number().optional(),
    message: z.string().max(500).optional(),
  }),
});

// Transaction schemas
export const initiateTransactionSchema = z.object({
  body: z.object({
    listingId: objectId,
    offerId: z.string().uuid().optional(), // If accepting an offer
  }),
});

export const updateTransferStepSchema = z.object({
  params: z.object({
    id: z.string().uuid(),
    stepNumber: z.coerce.number(),
  }),
  body: z.object({
    proofUrl: z.string().url().optional(),
    notes: z.string().max(500).optional(),
  }),
});

// Message schemas
export const sendMessageSchema = z.object({
  body: z.object({
    conversationId: z.string().uuid().optional(),
    recipientId: z.string().uuid().optional(),
    listingId: objectId.optional(),
    content: z.string().min(1, 'Message cannot be empty').max(2000),
    attachments: z.array(z.string().url()).max(5).optional(),
  }),
});

// User schemas
export const updateProfileSchema = z.object({
  body: z.object({
    firstName: z.string().max(50).optional(),
    lastName: z.string().max(50).optional(),
    bio: z.string().max(500).optional(),
    avatarUrl: z.string().url().optional(),
  }),
});

// Review schemas
export const createReviewSchema = z.object({
  body: z.object({
    transactionId: z.string().uuid(),
    rating: z.number().min(1).max(5),
    title: z.string().max(100).optional(),
    content: z.string().min(10).max(1000),
  }),
});

// Dispute schemas
export const createDisputeSchema = z.object({
  body: z.object({
    transactionId: z.string().uuid(),
    reason: z.enum([
      'account_not_as_described',
      'transfer_failed',
      'account_banned',
      'seller_unresponsive',
      'buyer_unresponsive',
      'fraud',
      'other',
    ]),
    description: z.string().min(50).max(2000),
    evidence: z.array(z.string().url()).max(10).optional(),
  }),
});
