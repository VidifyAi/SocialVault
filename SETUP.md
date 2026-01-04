# SocialVault - Setup Guide

## Quick Start (No Docker Required!)

This project uses **MongoDB Atlas** (free tier) and **Clerk** for authentication - no local database setup needed.

### Prerequisites

- Node.js 18+ 
- npm or pnpm

### 1. Clone and Install

```bash
cd SocialVault
npm install
```

### 2. Set Up MongoDB Atlas (Free)

1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Sign up for a free account
3. Create a new **FREE** shared cluster
4. Click "Connect" → "Connect your application"
5. Copy the connection string

### 3. Set Up Clerk Authentication (Free)

1. Go to [Clerk](https://clerk.com)
2. Sign up and create a new application
3. Choose your preferred sign-in methods (Email, Google, GitHub, etc.)
4. Go to **API Keys** in the dashboard
5. Copy your Publishable Key and Secret Key

### 4. Configure Environment Variables

Copy the example env file and fill in your values:

```bash
cp .env.example .env
```

Edit `.env` with your keys:

```env
# MongoDB Atlas connection string
DATABASE_URL="mongodb+srv://YOUR_USERNAME:YOUR_PASSWORD@cluster.mongodb.net/socialvault?retryWrites=true&w=majority"

# Clerk keys
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY="pk_test_..."
CLERK_SECRET_KEY="sk_test_..."
```

### 5. Generate Prisma Client & Push Schema

```bash
cd apps/backend
npx prisma generate
npx prisma db push
```

### 6. Start Development Servers

From the root directory:

```bash
npm run dev
```

Or start individually:

```bash
# Terminal 1 - Backend
cd apps/backend
npm run dev

# Terminal 2 - Frontend
cd apps/frontend
npm run dev
```

### 7. Access the Application

- **Frontend:** http://localhost:3000
- **Backend API:** http://localhost:3001
- **Prisma Studio:** `cd apps/backend && npx prisma studio`

---

## Project Structure

```
SocialVault/
├── apps/
│   ├── backend/          # Express + Prisma + MongoDB
│   │   ├── prisma/       # Database schema
│   │   └── src/
│   │       ├── routes/   # API endpoints
│   │       ├── services/ # Business logic
│   │       └── middleware/ # Auth, validation
│   └── frontend/         # Next.js 14 + Clerk
│       └── src/
│           ├── app/      # Pages (App Router)
│           ├── components/
│           └── lib/      # API client, utilities
├── packages/
│   └── types/            # Shared TypeScript types
└── .env.example          # Environment template
```

---

## Authentication Flow

This project uses **Clerk** for authentication:

1. Users sign up/in via Clerk's hosted UI (`/sign-in`, `/sign-up`)
2. Clerk handles email verification, OAuth, MFA, etc.
3. Frontend gets a JWT token from Clerk
4. Backend verifies the token using `@clerk/backend`
5. On first API request, backend creates a user record in MongoDB

### Protected Routes

The middleware in `apps/frontend/src/middleware.ts` protects:
- `/dashboard/*` - User dashboard
- `/checkout/*` - Checkout flow
- `/listings/new` - Create listings

---

## Available Scripts

```bash
# Root level
npm run dev          # Start all apps in development
npm run build        # Build all apps
npm run lint         # Lint all apps

# Backend
cd apps/backend
npm run dev          # Start development server
npm run build        # Compile TypeScript
npx prisma studio    # Open database GUI
npx prisma db push   # Push schema changes

# Frontend  
cd apps/frontend
npm run dev          # Start Next.js dev server
npm run build        # Production build
```

---

## Optional: Additional Services

### Razorpay (Payments - Required for Transactions)

1. Go to [Razorpay Dashboard](https://dashboard.razorpay.com)
2. Sign up for a Razorpay account
3. Navigate to **Settings > API Keys**
4. Generate a new API Key pair
5. Add to `.env`:
   ```env
   RAZORPAY_KEY_ID="rzp_test_..."
   RAZORPAY_KEY_SECRET="..."
   RAZORPAY_WEBHOOK_SECRET="..."
   ```

#### Setting up Razorpay Webhooks:
1. Go to **Settings > Webhooks** in Razorpay Dashboard
2. Add a new webhook with URL: `https://your-domain.com/api/payments/webhook`
3. Select events: `payment.captured`, `payment.failed`, `refund.created`
4. Copy the webhook secret and add to `.env`

### AWS S3 (File Uploads - Required for Screenshots/Proofs)

1. Create an [AWS Account](https://aws.amazon.com) 
2. Go to S3 Console and create a bucket:
   - Bucket name: `socialvault-uploads`
   - Region: `ap-south-1` (or your preferred region)
   - Unblock public access if you need public URLs

3. Create an IAM User with S3 access:
   - Go to IAM > Users > Create User
   - Attach policy: `AmazonS3FullAccess` (or create a custom policy)
   - Generate Access Keys

4. Add to `.env`:
   ```env
   AWS_ACCESS_KEY_ID="AKIA..."
   AWS_SECRET_ACCESS_KEY="..."
   AWS_REGION="ap-south-1"
   S3_BUCKET="socialvault-uploads"
   ```

#### S3 Bucket Policy (for public read access to screenshots):
```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Principal": "*",
      "Action": "s3:GetObject",
      "Resource": "arn:aws:s3:::socialvault-uploads/listings/*"
    }
  ]
}
```

#### CORS Configuration:
```json
[
  {
    "AllowedHeaders": ["*"],
    "AllowedMethods": ["GET", "PUT", "POST"],
    "AllowedOrigins": ["http://localhost:3000", "https://your-domain.com"],
    "ExposeHeaders": ["ETag"]
  }
]
```

### Resend (Email Notifications - Required for Transactional Emails)

1. Go to [Resend](https://resend.com) and create an account (Free tier: 3000 emails/month)
2. Add a domain or use the sandbox for testing
3. Get your API key from the dashboard
4. Add to `.env`:
   ```env
   RESEND_API_KEY="re_..."
   EMAIL_FROM="SocialVault <noreply@yourdomain.com>"
   ```

#### For Production:
1. Add and verify your domain in Resend
2. Add the required DNS records (SPF, DKIM, DMARC)
3. Update `EMAIL_FROM` to use your verified domain

### Using S3-Compatible Services (Alternative to AWS S3)

You can use any S3-compatible service like MinIO, Cloudflare R2, or DigitalOcean Spaces:

**Cloudflare R2:**
```env
AWS_ACCESS_KEY_ID="your_r2_access_key"
AWS_SECRET_ACCESS_KEY="your_r2_secret_key"
AWS_REGION="auto"
S3_BUCKET="socialvault-uploads"
S3_ENDPOINT="https://your-account-id.r2.cloudflarestorage.com"
```

**DigitalOcean Spaces:**
```env
AWS_ACCESS_KEY_ID="your_spaces_key"
AWS_SECRET_ACCESS_KEY="your_spaces_secret"
AWS_REGION="nyc3"
S3_BUCKET="socialvault-uploads"
S3_ENDPOINT="https://nyc3.digitaloceanspaces.com"
```

---

## Troubleshooting

### "npm install fails due to proxy issues"
- The project includes `.npmrc` files that bypass proxy settings
- If you still face issues, try:
  ```bash
  npm config set strict-ssl false
  npm config set proxy false
  npm config set https-proxy false
  ```

### "Cannot connect to MongoDB"
- Check your connection string in `.env`
- Ensure your IP is whitelisted in MongoDB Atlas (Network Access)
- Try `0.0.0.0/0` for development to allow all IPs

### "Clerk authentication errors"
- Verify your keys match (Publishable = frontend, Secret = backend)
- Check that environment variables are loaded (restart dev servers)

### "Prisma errors"
- Run `npx prisma generate` after schema changes
- Run `npx prisma db push` to sync with database

### "Razorpay errors"
- Ensure you're using Test Mode keys during development
- Check that `RAZORPAY_KEY_ID` and `RAZORPAY_KEY_SECRET` are set
- For webhook testing, use ngrok to expose your local server

### "S3 upload errors"
- Check your AWS credentials and region
- Ensure the bucket exists and you have write permissions
- For CORS errors, configure the bucket's CORS policy
- For S3-compatible services, verify the endpoint URL

### "Email not sending"
- Verify your Resend API key is correct
- Check that your domain is verified (for production)
- Emails are logged to console in development if no API key is set

---

## Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | Next.js 14, React, Tailwind CSS |
| UI Components | Radix UI, Lucide Icons |
| Authentication | Clerk |
| Backend | Express.js, TypeScript |
| Database | MongoDB Atlas (Prisma ORM) |
| State | React Query, Zustand |
| Payments | Razorpay |
| File Storage | AWS S3 |
| Email | Resend |
