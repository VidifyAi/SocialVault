// User Types
export type UserRole = 'buyer' | 'seller' | 'admin' | 'moderator';
export type KYCStatus = 'not_started' | 'pending' | 'verified' | 'rejected';
export type UserStatus = 'active' | 'suspended' | 'banned';

export interface User {
  id: string;
  email: string;
  username: string;
  passwordHash?: string;
  role: UserRole;
  firstName?: string;
  lastName?: string;
  avatarUrl?: string;
  bio?: string;
  kycStatus: KYCStatus;
  kycVerifiedAt?: Date;
  status: UserStatus;
  trustScore: number;
  emailVerified: boolean;
  twoFactorEnabled: boolean;
  lastLoginAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface UserProfile extends Omit<User, 'passwordHash'> {
  completedSales: number;
  completedPurchases: number;
  totalListings: number;
  averageRating: number;
  responseTime: string;
}

// Platform Types
export type Platform = 'instagram' | 'youtube';

export interface PlatformMetrics {
  followers: number;
  following?: number;
  posts?: number;
  subscribers?: number;
  views?: number;
  engagementRate: number;
  averageLikes?: number;
  averageComments?: number;
  averageViews?: number;
}

export interface Demographics {
  ageGroups: Record<string, number>;
  genderSplit: Record<string, number>;
  topCountries: Record<string, number>;
  topCities?: Record<string, number>;
}

// Listing Types
export type ListingStatus = 'draft' | 'pending_review' | 'active' | 'sold' | 'suspended' | 'expired';
export type VerificationStatus = 'unverified' | 'pending' | 'verified' | 'failed';
export type AccountType = 'personal' | 'business' | 'creator';

export interface Listing {
  id: string;
  sellerId: string;
  platform: Platform;
  username: string;
  displayName?: string;
  status: ListingStatus;
  verificationStatus: VerificationStatus;
  accountType: AccountType;
  niche: string;
  description: string;
  metrics: PlatformMetrics;
  demographics?: Demographics;
  monetization: MonetizationInfo;
  price: number;
  currency: string;
  negotiable: boolean;
  includesEmail: boolean;
  includesOriginalEmail: boolean;
  accountAge: number; // in months
  screenshots: string[];
  verificationProof?: string[];
  views: number;
  favorites: number;
  createdAt: Date;
  updatedAt: Date;
  expiresAt?: Date;
}

export interface MonetizationInfo {
  isMonetized: boolean;
  monthlyRevenue?: number;
  revenueProof?: string[];
  partnerProgram?: boolean;
  sponsorships?: boolean;
  affiliateLinks?: boolean;
}

export interface ListingFilters {
  platform?: Platform;
  niche?: string;
  minFollowers?: number;
  maxFollowers?: number;
  minPrice?: number;
  maxPrice?: number;
  minEngagement?: number;
  maxEngagement?: number;
  isMonetized?: boolean;
  isVerified?: boolean;
  sortBy?: 'price_asc' | 'price_desc' | 'followers_desc' | 'engagement_desc' | 'newest' | 'relevance';
  page?: number;
  limit?: number;
}

// Transaction Types
export type TransactionStatus = 
  | 'initiated'
  | 'payment_pending'
  | 'payment_processing'
  | 'payment_failed'
  | 'escrow_funded'
  | 'transfer_in_progress'
  | 'transfer_completed'
  | 'verification_pending'
  | 'completed'
  | 'disputed'
  | 'cancelled'
  | 'refunded';

export type EscrowStatus = 'pending' | 'funded' | 'released' | 'refunded' | 'disputed';
export type PaymentStatus = 'pending' | 'authorized' | 'captured' | 'failed' | 'refunded';

export interface Transaction {
  id: string;
  listingId: string;
  buyerId: string;
  sellerId: string;
  status: TransactionStatus;
  escrowStatus: EscrowStatus;
  paymentStatus: PaymentStatus;
  amount: number;
  platformFee: number;
  sellerPayout: number;
  currency: string;
  transferProgress: TransferStep[];
  currentStep: number;
  disputeId?: string;
  completedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface TransferStep {
  stepNumber: number;
  title: string;
  description: string;
  instructions: string[];
  status: 'pending' | 'in_progress' | 'completed' | 'failed';
  completedAt?: Date;
  proofUrl?: string;
  notes?: string;
}

// Offer Types
export type OfferStatus = 'pending' | 'accepted' | 'rejected' | 'expired' | 'countered' | 'withdrawn';

export interface Offer {
  id: string;
  listingId: string;
  buyerId: string;
  sellerId: string;
  amount: number;
  currency: string;
  message?: string;
  status: OfferStatus;
  expiresAt: Date;
  counterOfferId?: string;
  createdAt: Date;
  updatedAt: Date;
}

// Message Types
export interface Conversation {
  id: string;
  participants: string[];
  listingId?: string;
  transactionId?: string;
  lastMessageAt: Date;
  createdAt: Date;
}

export interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  content: string;
  attachments?: string[];
  readBy: string[];
  createdAt: Date;
}

// Review Types
export interface Review {
  id: string;
  transactionId: string;
  reviewerId: string;
  revieweeId: string;
  rating: number; // 1-5
  title?: string;
  content: string;
  response?: string;
  isVerifiedPurchase: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// Notification Types
export type NotificationType = 
  | 'offer_received'
  | 'offer_accepted'
  | 'offer_rejected'
  | 'message_new'
  | 'transaction_update'
  | 'transfer_step'
  | 'payment_received'
  | 'review_received'
  | 'listing_sold'
  | 'listing_expired'
  | 'kyc_update'
  | 'system';

export interface Notification {
  id: string;
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  data?: Record<string, unknown>;
  read: boolean;
  createdAt: Date;
}

// Dispute Types
export type DisputeStatus = 'opened' | 'under_review' | 'resolved' | 'escalated' | 'closed';
export type DisputeReason = 
  | 'account_not_as_described'
  | 'transfer_failed'
  | 'account_banned'
  | 'seller_unresponsive'
  | 'buyer_unresponsive'
  | 'fraud'
  | 'other';

export interface Dispute {
  id: string;
  transactionId: string;
  initiatorId: string;
  reason: DisputeReason;
  description: string;
  evidence: string[];
  status: DisputeStatus;
  resolution?: string;
  resolvedBy?: string;
  resolvedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

// API Response Types
export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: ApiError;
  meta?: PaginationMeta;
}

export interface ApiError {
  code: string;
  message: string;
  details?: Record<string, string[]>;
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

// WebSocket Event Types
export type WebSocketEventType =
  | 'connection:established'
  | 'error'
  | 'message:new'
  | 'message:read'
  | 'typing:indicator'
  | 'notification:new'
  | 'transaction:status_changed'
  | 'escrow:status_changed'
  | 'transfer:step_completed'
  | 'listing:sold'
  | 'offer:received'
  | 'offer:accepted'
  | 'offer:rejected'
  | 'user:online'
  | 'user:offline';

export interface WebSocketEvent<T = unknown> {
  type: WebSocketEventType;
  data: T;
  timestamp: Date;
}

// Auth Types
export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  username: string;
  password: string;
  role?: 'buyer' | 'seller';
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

export interface JWTPayload {
  userId: string;
  email: string;
  role: UserRole;
  iat: number;
  exp: number;
}
