import dotenv from 'dotenv';

dotenv.config({ path: '../../.env' });

export const config = {
  nodeEnv: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.PORT || '3001', 10),
  
  // Database (MongoDB - no Docker required)
  databaseUrl: process.env.DATABASE_URL || '',
  
  // Clerk Authentication
  clerkSecretKey: process.env.CLERK_SECRET_KEY || '',
  clerkPublishableKey: process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY || '',
  
  // Razorpay Payments
  razorpayKeyId: process.env.RAZORPAY_KEY_ID || '',
  razorpayKeySecret: process.env.RAZORPAY_KEY_SECRET || '',
  razorpayWebhookSecret: process.env.RAZORPAY_WEBHOOK_SECRET || '',
  
  // AWS S3 / Cloudflare R2
  awsAccessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
  awsSecretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || '',
  awsRegion: process.env.AWS_REGION || 'us-east-1',
  s3Bucket: process.env.S3_BUCKET || 'socialswapr-uploads',
  s3Endpoint: process.env.S3_ENDPOINT || '', // For R2/MinIO
  
  // Resend Email
  resendApiKey: process.env.RESEND_API_KEY || '',
  emailFrom: process.env.EMAIL_FROM || 'SocialSwapr <noreply@socialswapr.com>',
  
  // URLs
  frontendUrl: process.env.FRONTEND_URL || 'http://localhost:3000',
  backendUrl: process.env.BACKEND_URL || 'http://localhost:3001',
  
  // YouTube Data API v3
  youtubeApiKey: process.env.YOUTUBE_API_KEY || '',

  // Redis
  redisUrl: process.env.REDIS_URL || 'redis://localhost:6379',

  // Instagram Commercial Scraper (Apify)
  instagramScraperApiKey: process.env.INSTAGRAM_SCRAPER_API_KEY || '',
  instagramScraperBaseUrl: process.env.INSTAGRAM_SCRAPER_BASE_URL || 'https://api.apify.com/v2',

  // YouTube Quota
  youtubeQuotaLimit: parseInt(process.env.YOUTUBE_QUOTA_LIMIT || '10000', 10),

  // Fraud Guardrails
  maxListingsPerUser: parseInt(process.env.MAX_LISTINGS_PER_USER || '10', 10),
  maxTransactionsPerDay: parseInt(process.env.MAX_TRANSACTIONS_PER_DAY || '5', 10),

  // Platform Fees
  platformFeePercent: 5, // 5%
  minPlatformFee: 100,   // ₹100
  maxPlatformFee: 5000,  // ₹5000
};
