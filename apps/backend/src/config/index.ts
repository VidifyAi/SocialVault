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
  
  // Platform Fees
  platformFeePercent: 5, // 5%
  minPlatformFee: 10, // $10 or ₹100
  maxPlatformFee: 500, // $500 or ₹5000
};
