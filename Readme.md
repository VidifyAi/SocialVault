# AccountBazaar - Social Media Account Marketplace
## Complete Technical Implementation Document

---

## Table of Contents
1. [Executive Summary](#executive-summary)
2. [Product Overview](#product-overview)
3. [System Architecture](#system-architecture)
4. [Technical Stack](#technical-stack)
5. [Database Schema](#database-schema)
6. [Core Modules](#core-modules)
7. [API Specifications](#api-specifications)
8. [Security Implementation](#security-implementation)
9. [Payment & Escrow System](#payment--escrow-system)
10. [Account Verification & Transfer](#account-verification--transfer)
11. [User Interface & Experience](#user-interface--experience)
12. [DevOps & Infrastructure](#devops--infrastructure)
13. [Testing Strategy](#testing-strategy)
14. [Legal & Compliance](#legal--compliance)
15. [Launch Roadmap](#launch-roadmap)
16. [Maintenance & Scaling](#maintenance--scaling)

---

## Executive Summary

**Product Name:** AccountBazaar

**Tagline:** "Where Digital Influence Changes Hands"

**Alternative Taglines:**
- "The Marketplace for Digital Influence"
- "Buy, Sell, Grow - Your Social Commerce Hub"
- "Trading Digital Success Stories"

**Mission:** To provide the most secure, transparent, and efficient marketplace for buying and selling established social media accounts while ensuring trust and legitimacy in every transaction.

**Target Market:**
- Digital marketing agencies
- Content creators looking to monetize
- Businesses entering new markets
- Influencers expanding their portfolio
- Media companies acquiring audiences

**Competitive Advantages:**
- Military-grade escrow system
- AI-powered fraud detection
- Real-time account analytics
- 24/7 white-glove transfer support
- Blockchain-based transaction records
- Insurance for high-value transactions

**Brand Identity:**
- **Color Scheme:** Deep purple & gold (luxury marketplace feel)
- **Visual Style:** Modern, trustworthy, premium
- **Voice:** Professional yet approachable, empowering
- **Logo Concept:** Stylized "AB" monogram with bazaar marketplace elements

---

## Product Overview

### Core Value Proposition

AccountBazaar eliminates the risk and complexity of social media account transactions by providing:

1. **Secure Escrow Service** - Funds held until successful transfer
2. **Account Verification** - AI-powered authenticity checks
3. **Transfer Assistance** - Expert support team guides every transfer
4. **Dispute Resolution** - Fair mediation with clear policies
5. **Analytics Dashboard** - Real-time metrics for informed decisions
6. **Legal Protection** - Transaction agreements and documentation

### Platform Supported Accounts

| Platform | Priority | Account Types | Verification Method |
|----------|----------|---------------|---------------------|
| Instagram | P0 | Personal, Business, Creator | API + Manual |
| YouTube | P0 | Channels, Brand Accounts | API + Manual |
| TikTok | P0 | Personal, Business | Manual + Scraping |
| Twitter/X | P1 | Personal, Business | API + Manual |
| Facebook | P1 | Pages, Groups | API + Manual |
| LinkedIn | P2 | Pages, Personal Profiles | Manual |
| Twitch | P2 | Streamer Accounts | API + Manual |
| Pinterest | P2 | Business, Creator | API + Manual |

### Key Metrics to Track

- Follower/Subscriber count
- Engagement rate (likes, comments, shares)
- Average views per post/video
- Audience demographics (age, location, gender)
- Growth trends (last 30/90/365 days)
- Content niche and categories
- Monetization status (verified, partner programs)
- Account age and history

---

## System Architecture

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     Client Layer                             │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │  Web App     │  │  Mobile App  │  │  Admin Panel │      │
│  │  (React)     │  │ (React Native)│  │   (React)    │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                     API Gateway (Kong/AWS API Gateway)        │
│                     - Rate Limiting                           │
│                     - Authentication                          │
│                     - Load Balancing                          │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                   Microservices Layer                         │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │   User       │  │   Listing    │  │   Payment    │      │
│  │   Service    │  │   Service    │  │   Service    │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │   Escrow     │  │   Messaging  │  │  Analytics   │      │
│  │   Service    │  │   Service    │  │   Service    │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │ Verification │  │   Transfer   │  │  Notification│      │
│  │   Service    │  │   Service    │  │   Service    │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                   Data Layer                                  │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │  PostgreSQL  │  │    Redis     │  │  MongoDB     │      │
│  │  (Primary DB)│  │   (Cache)    │  │ (Analytics)  │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │ Elasticsearch│  │      S3      │  │  Blockchain  │      │
│  │   (Search)   │  │   (Storage)  │  │   (Ledger)   │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                 External Services                             │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │   Stripe     │  │  Social APIs │  │   SendGrid   │      │
│  │   PayPal     │  │  (IG, YT, X) │  │    Twilio    │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │   Jumio      │  │  CloudFlare  │  │   Sentry     │      │
│  │   (KYC)      │  │    (CDN)     │  │(Monitoring)  │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
└─────────────────────────────────────────────────────────────┘
```

### Service Communication

**Synchronous Communication:**
- REST APIs for client-service communication
- gRPC for inter-service communication (high performance)

**Asynchronous Communication:**
- RabbitMQ/Kafka for event-driven architecture
- WebSocket for real-time notifications

**Event Bus Topics:**
- `user.registered`
- `listing.created`
- `listing.verified`
- `payment.received`
- `escrow.funded`
- `transfer.initiated`
- `transfer.completed`
- `dispute.opened`
- `message.sent`

---

## Technical Stack

### Frontend

**Web Application:**
```javascript
{
  "framework": "Next.js 14",
  "language": "TypeScript",
  "styling": "Tailwind CSS + shadcn/ui",
  "state": "Zustand + React Query",
  "forms": "React Hook Form + Zod",
  "charts": "Recharts",
  "auth": "NextAuth.js",
  "testing": "Jest + React Testing Library + Playwright"
}
```

**Mobile Application:**
```javascript
{
  "framework": "React Native + Expo",
  "language": "TypeScript",
  "navigation": "React Navigation",
  "state": "Zustand + React Query",
  "ui": "React Native Paper",
  "auth": "Expo Auth Session"
}
```

### Backend

**Core Services:**
```python
{
  "language": "Node.js (TypeScript) + Python",
  "framework": "Express.js / NestJS + FastAPI",
  "orm": "Prisma (Node) + SQLAlchemy (Python)",
  "validation": "Zod / Joi + Pydantic",
  "api_docs": "Swagger/OpenAPI",
  "testing": "Jest + Supertest (Node), Pytest (Python)"
}
```

**Why Hybrid Stack:**
- Node.js for real-time features (messaging, notifications)
- Python for AI/ML tasks (fraud detection, analytics)
- Microservices allow language flexibility per service

### Databases

**PostgreSQL (Primary):**
- Users, listings, transactions, escrow
- ACID compliance for financial transactions
- Version: 15+

**Redis:**
- Session management
- Rate limiting
- Real-time analytics cache
- Message queue
- Version: 7+

**MongoDB:**
- Analytics data
- Log aggregation
- Flexible schema for social media metrics
- Version: 6+

**Elasticsearch:**
- Full-text search for listings
- Advanced filtering
- Auto-complete suggestions
- Version: 8+

### Infrastructure

**Cloud Provider:** AWS (Primary)

**Core Services:**
- **Compute:** ECS (Fargate) for containers
- **Load Balancing:** Application Load Balancer
- **Storage:** S3 for files, EBS for databases
- **CDN:** CloudFront + CloudFlare
- **DNS:** Route 53
- **Secrets:** AWS Secrets Manager
- **Monitoring:** CloudWatch + Datadog
- **Logging:** CloudWatch Logs + ELK Stack

**Alternative:** Google Cloud Platform or Azure with equivalent services

### DevOps Tools

```yaml
version_control: GitHub
ci_cd: GitHub Actions + ArgoCD
containerization: Docker
orchestration: Kubernetes (EKS)
iac: Terraform
monitoring: Datadog + Prometheus + Grafana
error_tracking: Sentry
apm: New Relic / Datadog APM
testing: Selenium + Postman/Newman
security_scanning: Snyk + SonarQube
```

---

## Database Schema

### Core Entities

#### Users Table
```sql
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    username VARCHAR(50) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    phone_number VARCHAR(20),
    phone_verified BOOLEAN DEFAULT FALSE,
    email_verified BOOLEAN DEFAULT FALSE,
    
    -- Profile
    profile_photo_url TEXT,
    bio TEXT,
    country_code CHAR(2),
    timezone VARCHAR(50),
    language VARCHAR(10) DEFAULT 'en',
    
    -- KYC/Verification
    kyc_status ENUM('not_started', 'pending', 'verified', 'rejected') DEFAULT 'not_started',
    kyc_provider VARCHAR(50), -- jumio, onfido
    kyc_reference_id VARCHAR(255),
    kyc_verified_at TIMESTAMP,
    
    -- Account Status
    account_status ENUM('active', 'suspended', 'banned', 'deleted') DEFAULT 'active',
    account_type ENUM('buyer', 'seller', 'both') DEFAULT 'buyer',
    
    -- Trust Metrics
    trust_score DECIMAL(3,2) DEFAULT 0.00, -- 0.00 to 10.00
    completed_purchases INT DEFAULT 0,
    completed_sales INT DEFAULT 0,
    dispute_count INT DEFAULT 0,
    successful_dispute_resolutions INT DEFAULT 0,
    
    -- Security
    two_factor_enabled BOOLEAN DEFAULT FALSE,
    two_factor_secret VARCHAR(255),
    last_login_at TIMESTAMP,
    last_login_ip INET,
    failed_login_attempts INT DEFAULT 0,
    locked_until TIMESTAMP,
    
    -- Timestamps
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP,
    
    -- Indexes
    INDEX idx_email (email),
    INDEX idx_username (username),
    INDEX idx_kyc_status (kyc_status),
    INDEX idx_account_status (account_status),
    INDEX idx_created_at (created_at)
);
```

#### Listings Table
```sql
CREATE TABLE listings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    seller_id UUID NOT NULL REFERENCES users(id),
    
    -- Account Details
    platform ENUM('instagram', 'youtube', 'tiktok', 'twitter', 'facebook', 'linkedin', 'twitch', 'pinterest') NOT NULL,
    account_handle VARCHAR(255) NOT NULL,
    account_url TEXT NOT NULL,
    account_username VARCHAR(255),
    
    -- Metrics (current snapshot)
    followers_count BIGINT,
    following_count BIGINT,
    total_posts INT,
    avg_likes_per_post DECIMAL(10,2),
    avg_comments_per_post DECIMAL(10,2),
    avg_views_per_post BIGINT,
    engagement_rate DECIMAL(5,2), -- percentage
    
    -- Historical Data (JSON for flexibility)
    growth_data JSONB, -- last 30/90/365 days trends
    demographics JSONB, -- age, gender, location breakdown
    
    -- Monetization
    is_monetized BOOLEAN DEFAULT FALSE,
    monetization_details JSONB, -- partner program, ad revenue, etc.
    estimated_monthly_revenue DECIMAL(10,2),
    
    -- Content Details
    niche VARCHAR(100),
    sub_niche VARCHAR(100),
    content_language VARCHAR(10) DEFAULT 'en',
    content_type ENUM('photos', 'videos', 'mixed', 'text', 'live'),
    posting_frequency ENUM('daily', 'weekly', 'bi-weekly', 'monthly', 'irregular'),
    
    -- Listing Details
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    price DECIMAL(12,2) NOT NULL,
    currency CHAR(3) DEFAULT 'USD',
    
    -- Sale Options
    allow_offers BOOLEAN DEFAULT TRUE,
    minimum_offer DECIMAL(12,2),
    is_featured BOOLEAN DEFAULT FALSE,
    featured_until TIMESTAMP,
    
    -- Verification
    verification_status ENUM('pending', 'verified', 'rejected', 'flagged') DEFAULT 'pending',
    verified_at TIMESTAMP,
    verified_by UUID REFERENCES users(id),
    verification_notes TEXT,
    
    -- Fraud Detection
    fraud_score DECIMAL(3,2) DEFAULT 0.00, -- 0.00 to 1.00
    fraud_flags JSONB, -- reasons for suspicion
    bot_follower_percentage DECIMAL(5,2),
    
    -- Status
    listing_status ENUM('draft', 'active', 'sold', 'cancelled', 'suspended', 'expired') DEFAULT 'draft',
    visibility ENUM('public', 'private', 'unlisted') DEFAULT 'public',
    
    -- Media
    screenshots JSONB, -- array of S3 URLs
    verification_video_url TEXT,
    
    -- Stats
    views_count INT DEFAULT 0,
    favorites_count INT DEFAULT 0,
    offers_count INT DEFAULT 0,
    
    -- Transfer Info
    includes_email BOOLEAN DEFAULT TRUE,
    includes_phone BOOLEAN DEFAULT FALSE,
    transfer_method ENUM('email_change', 'phone_change', 'manual') DEFAULT 'email_change',
    estimated_transfer_time VARCHAR(50), -- "24-48 hours"
    
    -- Timestamps
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    published_at TIMESTAMP,
    sold_at TIMESTAMP,
    expires_at TIMESTAMP,
    deleted_at TIMESTAMP,
    
    -- Indexes
    INDEX idx_seller_id (seller_id),
    INDEX idx_platform (platform),
    INDEX idx_niche (niche),
    INDEX idx_price (price),
    INDEX idx_listing_status (listing_status),
    INDEX idx_verification_status (verification_status),
    INDEX idx_created_at (created_at),
    FULLTEXT INDEX idx_search (title, description, account_handle)
);
```

#### Transactions Table
```sql
CREATE TABLE transactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    listing_id UUID NOT NULL REFERENCES listings(id),
    buyer_id UUID NOT NULL REFERENCES users(id),
    seller_id UUID NOT NULL REFERENCES users(id),
    
    -- Financial Details
    amount DECIMAL(12,2) NOT NULL,
    currency CHAR(3) DEFAULT 'USD',
    platform_fee DECIMAL(12,2) NOT NULL,
    seller_payout DECIMAL(12,2) NOT NULL,
    
    -- Payment Info
    payment_method ENUM('stripe', 'paypal', 'crypto', 'wire_transfer'),
    payment_intent_id VARCHAR(255), -- Stripe payment intent
    payment_status ENUM('pending', 'authorized', 'captured', 'failed', 'refunded', 'cancelled') DEFAULT 'pending',
    
    -- Escrow
    escrow_status ENUM('not_started', 'funded', 'inspection', 'released', 'refunded', 'disputed') DEFAULT 'not_started',
    escrow_funded_at TIMESTAMP,
    escrow_released_at TIMESTAMP,
    inspection_period_days INT DEFAULT 3,
    inspection_deadline TIMESTAMP,
    
    -- Transfer
    transfer_status ENUM('not_started', 'in_progress', 'completed', 'failed') DEFAULT 'not_started',
    transfer_started_at TIMESTAMP,
    transfer_completed_at TIMESTAMP,
    transfer_method VARCHAR(50),
    
    -- Agreement
    buyer_agreed_to_terms BOOLEAN DEFAULT FALSE,
    seller_agreed_to_terms BOOLEAN DEFAULT FALSE,
    buyer_agreed_at TIMESTAMP,
    seller_agreed_at TIMESTAMP,
    transaction_agreement_url TEXT, -- PDF in S3
    
    -- Status
    transaction_status ENUM('initiated', 'pending_payment', 'payment_received', 'in_escrow', 'transferring', 'completed', 'cancelled', 'disputed', 'refunded') DEFAULT 'initiated',
    
    -- Dispute
    dispute_id UUID REFERENCES disputes(id),
    
    -- Blockchain Record (for transparency)
    blockchain_transaction_hash VARCHAR(255),
    blockchain_verified BOOLEAN DEFAULT FALSE,
    
    -- Metadata
    buyer_notes TEXT,
    seller_notes TEXT,
    admin_notes TEXT,
    
    -- Timestamps
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP,
    cancelled_at TIMESTAMP,
    
    -- Indexes
    INDEX idx_buyer_id (buyer_id),
    INDEX idx_seller_id (seller_id),
    INDEX idx_listing_id (listing_id),
    INDEX idx_transaction_status (transaction_status),
    INDEX idx_payment_status (payment_status),
    INDEX idx_escrow_status (escrow_status),
    INDEX idx_created_at (created_at)
);
```

#### Offers Table
```sql
CREATE TABLE offers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    listing_id UUID NOT NULL REFERENCES listings(id),
    buyer_id UUID NOT NULL REFERENCES users(id),
    
    -- Offer Details
    offer_amount DECIMAL(12,2) NOT NULL,
    currency CHAR(3) DEFAULT 'USD',
    message TEXT,
    
    -- Status
    offer_status ENUM('pending', 'accepted', 'rejected', 'countered', 'withdrawn', 'expired') DEFAULT 'pending',
    
    -- Counter Offer
    counter_offer_amount DECIMAL(12,2),
    counter_offer_message TEXT,
    counter_offered_at TIMESTAMP,
    
    -- Expiration
    expires_at TIMESTAMP,
    
    -- Response
    responded_at TIMESTAMP,
    response_message TEXT,
    
    -- Timestamps
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    -- Indexes
    INDEX idx_listing_id (listing_id),
    INDEX idx_buyer_id (buyer_id),
    INDEX idx_offer_status (offer_status),
    INDEX idx_created_at (created_at)
);
```

#### Messages Table
```sql
CREATE TABLE messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    conversation_id UUID NOT NULL,
    sender_id UUID NOT NULL REFERENCES users(id),
    recipient_id UUID NOT NULL REFERENCES users(id),
    
    -- Related Entity
    listing_id UUID REFERENCES listings(id),
    transaction_id UUID REFERENCES transactions(id),
    
    -- Content
    message_type ENUM('text', 'image', 'file', 'system') DEFAULT 'text',
    content TEXT NOT NULL,
    encrypted_content TEXT, -- E2E encrypted version
    
    -- Attachments
    attachments JSONB, -- array of file URLs and metadata
    
    -- Status
    is_read BOOLEAN DEFAULT FALSE,
    read_at TIMESTAMP,
    is_deleted_by_sender BOOLEAN DEFAULT FALSE,
    is_deleted_by_recipient BOOLEAN DEFAULT FALSE,
    
    -- Moderation
    flagged BOOLEAN DEFAULT FALSE,
    flagged_reason VARCHAR(255),
    moderation_status ENUM('pending', 'approved', 'removed') DEFAULT 'approved',
    
    -- Timestamps
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP,
    
    -- Indexes
    INDEX idx_conversation_id (conversation_id),
    INDEX idx_sender_id (sender_id),
    INDEX idx_recipient_id (recipient_id),
    INDEX idx_listing_id (listing_id),
    INDEX idx_created_at (created_at)
);
```

#### Disputes Table
```sql
CREATE TABLE disputes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    transaction_id UUID NOT NULL REFERENCES transactions(id),
    initiated_by UUID NOT NULL REFERENCES users(id),
    
    -- Dispute Details
    dispute_type ENUM('account_not_as_described', 'transfer_failed', 'account_banned', 'fake_followers', 'seller_unresponsive', 'buyer_unresponsive', 'other') NOT NULL,
    subject VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    
    -- Evidence
    evidence JSONB, -- screenshots, videos, documents
    
    -- Status
    dispute_status ENUM('open', 'under_review', 'awaiting_response', 'resolved', 'closed', 'escalated') DEFAULT 'open',
    
    -- Resolution
    resolved_by UUID REFERENCES users(id), -- admin
    resolution_type ENUM('refund_buyer', 'release_to_seller', 'partial_refund', 'no_action') ,
    resolution_notes TEXT,
    resolution_amount DECIMAL(12,2),
    
    -- Timeline
    response_required_by TIMESTAMP,
    seller_responded BOOLEAN DEFAULT FALSE,
    seller_response TEXT,
    seller_responded_at TIMESTAMP,
    
    -- Timestamps
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    resolved_at TIMESTAMP,
    closed_at TIMESTAMP,
    
    -- Indexes
    INDEX idx_transaction_id (transaction_id),
    INDEX idx_initiated_by (initiated_by),
    INDEX idx_dispute_status (dispute_status),
    INDEX idx_created_at (created_at)
);
```

#### Reviews Table
```sql
CREATE TABLE reviews (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    transaction_id UUID NOT NULL REFERENCES transactions(id),
    reviewer_id UUID NOT NULL REFERENCES users(id),
    reviewee_id UUID NOT NULL REFERENCES users(id),
    
    -- Review Content
    rating INT NOT NULL CHECK (rating >= 1 AND rating <= 5),
    review_text TEXT,
    
    -- Categories
    communication_rating INT CHECK (communication_rating >= 1 AND communication_rating <= 5),
    accuracy_rating INT CHECK (accuracy_rating >= 1 AND accuracy_rating <= 5),
    timeliness_rating INT CHECK (timeliness_rating >= 1 AND timeliness_rating <= 5),
    
    -- Response
    response_text TEXT,
    responded_at TIMESTAMP,
    
    -- Moderation
    is_verified_purchase BOOLEAN DEFAULT TRUE,
    flagged BOOLEAN DEFAULT FALSE,
    moderation_status ENUM('pending', 'approved', 'removed') DEFAULT 'approved',
    
    -- Timestamps
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    -- Indexes
    INDEX idx_transaction_id (transaction_id),
    INDEX idx_reviewer_id (reviewer_id),
    INDEX idx_reviewee_id (reviewee_id),
    INDEX idx_created_at (created_at),
    
    -- Constraints
    UNIQUE(transaction_id, reviewer_id)
);
```

#### Account Verification Logs
```sql
CREATE TABLE account_verification_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    listing_id UUID NOT NULL REFERENCES listings(id),
    
    -- Verification Type
    verification_type ENUM('initial', 'scheduled', 'manual_review', 'dispute_triggered') NOT NULL,
    
    -- Metrics Snapshot
    metrics_snapshot JSONB NOT NULL,
    
    -- Analysis
    fraud_indicators JSONB,
    bot_detection_results JSONB,
    engagement_authenticity_score DECIMAL(3,2),
    
    -- Results
    verification_passed BOOLEAN,
    issues_found TEXT[],
    
    -- Performed By
    verified_by_system BOOLEAN DEFAULT TRUE,
    verified_by_user UUID REFERENCES users(id),
    
    -- Timestamps
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    -- Indexes
    INDEX idx_listing_id (listing_id),
    INDEX idx_created_at (created_at)
);
```

#### Payment Methods Table
```sql
CREATE TABLE payment_methods (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id),
    
    -- Method Details
    method_type ENUM('credit_card', 'debit_card', 'paypal', 'bank_account', 'crypto_wallet') NOT NULL,
    provider VARCHAR(50), -- stripe, paypal
    provider_payment_method_id VARCHAR(255) NOT NULL,
    
    -- Card Info (if applicable, tokenized)
    last_four_digits CHAR(4),
    card_brand VARCHAR(50),
    expiry_month INT,
    expiry_year INT,
    
    -- Bank Info (if applicable)
    bank_name VARCHAR(255),
    account_type VARCHAR(50),
    
    -- Crypto (if applicable)
    crypto_currency VARCHAR(20),
    wallet_address VARCHAR(255),
    
    -- Verification
    is_verified BOOLEAN DEFAULT FALSE,
    is_default BOOLEAN DEFAULT FALSE,
    
    -- Timestamps
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP,
    
    -- Indexes
    INDEX idx_user_id (user_id),
    INDEX idx_is_default (is_default)
);
```

#### Notifications Table
```sql
CREATE TABLE notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id),
    
    -- Notification Details
    notification_type ENUM('message', 'offer', 'purchase', 'sale', 'review', 'dispute', 'system', 'verification') NOT NULL,
    title VARCHAR(255) NOT NULL,
    body TEXT NOT NULL,
    
    -- Related Entities
    related_entity_type VARCHAR(50), -- listing, transaction, message, etc.
    related_entity_id UUID,
    
    -- Action
    action_url TEXT,
    action_text VARCHAR(100),
    
    -- Status
    is_read BOOLEAN DEFAULT FALSE,
    read_at TIMESTAMP,
    
    -- Delivery
    sent_email BOOLEAN DEFAULT FALSE,
    sent_push BOOLEAN DEFAULT FALSE,
    sent_sms BOOLEAN DEFAULT FALSE,
    
    -- Timestamps
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    -- Indexes
    INDEX idx_user_id (user_id),
    INDEX idx_is_read (is_read),
    INDEX idx_created_at (created_at)
);
```

#### Activity Logs Table
```sql
CREATE TABLE activity_logs (
    id BIGSERIAL PRIMARY KEY,
    user_id UUID REFERENCES users(id),
    
    -- Activity Details
    activity_type VARCHAR(100) NOT NULL,
    entity_type VARCHAR(50),
    entity_id UUID,
    
    -- Details
    description TEXT,
    metadata JSONB,
    
    -- Context
    ip_address INET,
    user_agent TEXT,
    
    -- Timestamps
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    -- Indexes
    INDEX idx_user_id (user_id),
    INDEX idx_activity_type (activity_type),
    INDEX idx_created_at (created_at)
);
```

### Additional Supporting Tables

```sql
-- Favorites/Watchlist
CREATE TABLE favorites (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id),
    listing_id UUID NOT NULL REFERENCES listings(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, listing_id)
);

-- Platform Categories/Niches
CREATE TABLE niches (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL UNIQUE,
    slug VARCHAR(100) NOT NULL UNIQUE,
    parent_id UUID REFERENCES niches(id),
    platform ENUM('all', 'instagram', 'youtube', 'tiktok', 'twitter', 'facebook'),
    description TEXT,
    icon_url TEXT,
    is_active BOOLEAN DEFAULT TRUE
);

-- Feature Flags
CREATE TABLE feature_flags (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    flag_name VARCHAR(100) NOT NULL UNIQUE,
    is_enabled BOOLEAN DEFAULT FALSE,
    description TEXT,
    rollout_percentage INT DEFAULT 0,
    user_whitelist UUID[],
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Admin Roles & Permissions
CREATE TABLE admin_roles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    role_name VARCHAR(50) NOT NULL UNIQUE,
    permissions JSONB NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE admin_users (
    user_id UUID PRIMARY KEY REFERENCES users(id),
    role_id UUID NOT NULL REFERENCES admin_roles(id),
    assigned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    assigned_by UUID REFERENCES users(id)
);
```

---

## Core Modules

### 1. User Management Module

**Responsibilities:**
- User registration and authentication
- Profile management
- KYC/Identity verification
- Trust score calculation
- Password reset and account recovery
- Two-factor authentication

**Key Features:**

**Registration Flow:**
1. Email/password signup
2. Email verification (6-digit code, 15-min expiry)
3. Basic profile setup
4. Optional KYC immediately or later

**Authentication:**
```typescript
// JWT-based authentication
interface JWTPayload {
  userId: string;
  email: string;
  role: 'user' | 'admin';
  sessionId: string;
  iat: number;
  exp: number; // 7 days for refresh, 1 hour for access
}

// Session management
interface Session {
  sessionId: string;
  userId: string;
  deviceInfo: DeviceInfo;
  ipAddress: string;
  lastActivity: Date;
  expiresAt: Date;
}
```

**KYC Integration (Jumio):**
```typescript
interface KYCRequest {
  userId: string;
  documentType: 'passport' | 'drivers_license' | 'id_card';
  documentCountry: string;
  selfieRequired: boolean;
}

interface KYCResult {
  status: 'approved' | 'rejected' | 'review';
  confidence: number; // 0-100
  extractedData: {
    firstName: string;
    lastName: string;
    dateOfBirth: string;
    documentNumber: string;
    expiryDate: string;
  };
  fraudScore: number;
  rejectionReasons?: string[];
}
```

**Trust Score Algorithm:**
```typescript
function calculateTrustScore(user: User): number {
  let score = 5.0; // Start at 5/10
  
  // KYC verified: +2 points
  if (user.kycStatus === 'verified') score += 2.0;
  
  // Successful transactions: +0.1 per transaction (max 2 points)
  score += Math.min((user.completedPurchases + user.completedSales) * 0.1, 2.0);
  
  // Disputes: -0.5 per dispute
  score -= user.disputeCount * 0.5;
  
  // Positive reviews: +0.05 per positive review
  const positiveReviews = getPositiveReviewCount(user.id);
  score += positiveReviews * 0.05;
  
  // Account age: +0.5 after 6 months, +1 after 1 year
  const accountAgeMonths = getAccountAgeMonths(user.createdAt);
  if (accountAgeMonths >= 12) score += 1.0;
  else if (accountAgeMonths >= 6) score += 0.5;
  
  // 2FA enabled: +0.5
  if (user.twoFactorEnabled) score += 0.5;
  
  return Math.max(0, Math.min(10, score));
}
```

### 2. Listing Management Module

**Responsibilities:**
- Creating and editing listings
- Account verification
- Fraud detection
- Metrics collection
- Search and filtering
- Featured listings

**Listing Creation Flow:**

```typescript
// Step 1: Platform Selection
interface PlatformSelection {
  platform: Platform;
  accountUrl: string;
}

// Step 2: Account Connection & Verification
interface AccountVerification {
  method: 'screenshot' | 'video' | 'api_auth' | 'code_verification';
  proof: File | string;
}

// Step 3: Metrics Collection
async function collectMetrics(platform: Platform, accountUrl: string) {
  switch(platform) {
    case 'instagram':
      return await scrapeInstagramMetrics(accountUrl);
    case 'youtube':
      return await fetchYouTubeAPI(accountUrl);
    case 'tiktok':
      return await scrapeTikTokMetrics(accountUrl);
    // etc.
  }
}

// Step 4: Fraud Analysis
async function analyzeFraud(listing: Listing) {
  const checks = await Promise.all([
    checkBotFollowers(listing),
    checkEngagementAuthenticity(listing),
    checkGrowthPattern(listing),
    checkContentConsistency(listing),
    checkPreviousSales(listing.accountHandle)
  ]);
  
  return {
    fraudScore: calculateFraudScore(checks),
    flags: checks.filter(c => c.flagged),
    recommendation: fraudScore > 0.7 ? 'reject' : 'approve'
  };
}

// Step 5: Pricing & Details
interface ListingDetails {
  title: string;
  description: string;
  price: number;
  allowOffers: boolean;
  minimumOffer?: number;
  transferIncludes: {
    email: boolean;
    phone: boolean;
    originalCreationDate: boolean;
  };
}
```

**Fraud Detection Algorithms:**

```python
# Bot Follower Detection
def detect_bot_followers(followers: List[Follower]) -> float:
    """Returns percentage of likely bot followers"""
    bot_indicators = 0
    
    for follower in followers:
        score = 0
        
        # Generic username patterns
        if re.match(r'^[a-z]+\d{4,}, follower.username):
            score += 2
        
        # No profile picture
        if not follower.has_profile_picture:
            score += 1
        
        # No bio
        if not follower.bio:
            score += 1
        
        # Following way more than followers
        if follower.following > follower.followers * 10:
            score += 2
        
        # Zero or very few posts
        if follower.post_count < 3:
            score += 2
        
        # Account created recently but following thousands
        if follower.account_age_days < 30 and follower.following > 1000:
            score += 3
        
        if score >= 5:
            bot_indicators += 1
    
    return (bot_indicators / len(followers)) * 100

# Engagement Authenticity
def check_engagement_authenticity(posts: List[Post]) -> Dict:
    """Checks if engagement rates are organic"""
    
    # Sudden spikes in engagement
    engagement_rates = [p.engagement_rate for p in posts]
    mean_engagement = np.mean(engagement_rates)
    std_engagement = np.std(engagement_rates)
    
    spikes = sum(1 for rate in engagement_rates 
                 if rate > mean_engagement + (3 * std_engagement))
    
    # Like-to-comment ratio (bots often only like)
    avg_like_comment_ratio = np.mean([
        p.likes / max(p.comments, 1) for p in posts
    ])
    
    # Typical organic ratio is 10:1 to 30:1
    # Ratios > 50:1 suggest purchased likes
    suspicious_ratio = avg_like_comment_ratio > 50
    
    # Comment quality analysis
    generic_comments = sum(1 for p in posts for c in p.comments
                          if is_generic_comment(c.text))
    total_comments = sum(p.comments for p in posts)
    generic_percentage = (generic_comments / max(total_comments, 1)) * 100
    
    return {
        'has_suspicious_spikes': spikes > len(posts) * 0.1,
        'suspicious_like_ratio': suspicious_ratio,
        'generic_comment_percentage': generic_percentage,
        'authenticity_score': calculate_authenticity_score(...)
    }

def is_generic_comment(text: str) -> bool:
    """Detects generic bot-like comments"""
    generic_patterns = [
        r'^(nice|great|good|cool|awesome)!*,
        r'^❤️+,
        r'^🔥+,
        r'^(wow|amazing|love this)!*
    ]
    return any(re.match(pattern, text.lower()) for pattern in generic_patterns)
```

**Search & Filtering:**

```typescript
interface SearchParams {
  query?: string;
  platform?: Platform[];
  niche?: string[];
  minFollowers?: number;
  maxFollowers?: number;
  minPrice?: number;
  maxPrice?: number;
  minEngagementRate?: number;
  isMonetized?: boolean;
  isVerified?: boolean;
  sortBy: 'price_asc' | 'price_desc' | 'followers_desc' | 'engagement_desc' | 'newest';
  page: number;
  limit: number;
}

// Elasticsearch query builder
function buildElasticsearchQuery(params: SearchParams) {
  return {
    bool: {
      must: [
        params.query ? {
          multi_match: {
            query: params.query,
            fields: ['title^3', 'description^2', 'account_handle', 'niche'],
            fuzziness: 'AUTO'
          }
        } : { match_all: {} }
      ],
      filter: [
        { term: { listing_status: 'active' } },
        { term: { visibility: 'public' } },
        params.platform ? { terms: { platform: params.platform } } : null,
        params.niche ? { terms: { niche: params.niche } } : null,
        params.minFollowers ? { range: { followers_count: { gte: params.minFollowers } } } : null,
        params.maxFollowers ? { range: { followers_count: { lte: params.maxFollowers } } } : null,
        params.minPrice ? { range: { price: { gte: params.minPrice } } } : null,
        params.maxPrice ? { range: { price: { lte: params.maxPrice } } } : null,
        params.minEngagementRate ? { range: { engagement_rate: { gte: params.minEngagementRate } } } : null,
        params.isMonetized !== undefined ? { term: { is_monetized: params.isMonetized } } : null,
        params.isVerified !== undefined ? { term: { verification_status: 'verified' } } : null,
      ].filter(Boolean)
    }
  };
}
```

### 3. Payment & Escrow Module

**Responsibilities:**
- Payment processing
- Escrow management
- Fund holding and release
- Refund processing
- Multi-currency support
- Transaction fee calculation

**Payment Flow:**

```typescript
// 1. Create Payment Intent
async function createPaymentIntent(transaction: Transaction) {
  const platformFee = calculatePlatformFee(transaction.amount);
  const totalAmount = transaction.amount + platformFee;
  
  const paymentIntent = await stripe.paymentIntents.create({
    amount: Math.round(totalAmount * 100), // cents
    currency: transaction.currency.toLowerCase(),
    metadata: {
      transactionId: transaction.id,
      buyerId: transaction.buyerId,
      sellerId: transaction.sellerId,
      listingId: transaction.listingId
    },
    capture_method: 'manual', // Authorize only, capture later
    description: `Purchase of ${listing.title}`
  });
  
  return paymentIntent;
}

// 2. Authorize Payment (don't capture yet)
async function authorizePayment(paymentIntentId: string) {
  // Payment is authorized but not captured
  // Funds are held on buyer's card but not transferred
  await stripe.paymentIntents.confirm(paymentIntentId);
  
  // Update transaction status
  await updateTransaction({
    paymentStatus: 'authorized',
    escrowStatus: 'funded'
  });
}

// 3. Inspection Period
async function startInspectionPeriod(transactionId: string) {
  const inspectionDays = 3; // configurable
  const deadline = addDays(new Date(), inspectionDays);
  
  await updateTransaction({
    escrowStatus: 'inspection',
    inspectionDeadline: deadline
  });
  
  // Schedule automatic release if no issues reported
  await scheduleJob({
    type: 'auto_release_escrow',
    runAt: deadline,
    data: { transactionId }
  });
}

// 4. Release Escrow (successful transfer)
async function releaseEscrow(transactionId: string) {
  const transaction = await getTransaction(transactionId);
  
  // Capture the payment
  await stripe.paymentIntents.capture(transaction.paymentIntentId);
  
  // Calculate seller payout (amount minus platform fee)
  const platformFee = calculatePlatformFee(transaction.amount);
  const sellerPayout = transaction.amount - platformFee;
  
  // Create payout to seller
  await createSellerPayout(transaction.sellerId, sellerPayout);
  
  // Update transaction
  await updateTransaction({
    paymentStatus: 'captured',
    escrowStatus: 'released',
    escrowReleasedAt: new Date(),
    sellerPayout: sellerPayout
  });
  
  // Record on blockchain
  await recordOnBlockchain(transaction);
}

// 5. Refund (if issues arise)
async function refundEscrow(transactionId: string, reason: string) {
  const transaction = await getTransaction(transactionId);
  
  // Cancel/refund the payment intent
  await stripe.paymentIntents.cancel(transaction.paymentIntentId);
  
  await updateTransaction({
    paymentStatus: 'refunded',
    escrowStatus: 'refunded',
    transactionStatus: 'refunded'
  });
  
  // Notify both parties
  await notifyRefund(transaction, reason);
}
```

**Fee Structure:**

```typescript
interface FeeStructure {
  baseFeePercentage: number; // 5%
  minimumFee: number; // $10
  maximumFee: number; // $500
  featuredListingFee: number; // $50/week
  urgentVerificationFee: number; // $25
  premiumSupportFee: number; // $100/transaction
}

function calculatePlatformFee(amount: number, options?: {
  isFeatured?: boolean;
  urgentVerification?: boolean;
  premiumSupport?: boolean;
}): number {
  const basePercentage = 0.05; // 5%
  let fee = amount * basePercentage;
  
  // Apply min/max bounds
  fee = Math.max(fee, 10);
  fee = Math.min(fee, 500);
  
  // Add optional fees
  if (options?.isFeatured) fee += 50;
  if (options?.urgentVerification) fee += 25;
  if (options?.premiumSupport) fee += 100;
  
  return fee;
}
```

### 4. Transfer Management Module

**Responsibilities:**
- Coordinating account transfers
- Step-by-step transfer guides
- Credential exchange (secure)
- Transfer verification
- Support ticket escalation

**Transfer Process:**

```typescript
interface TransferStep {
  stepNumber: number;
  title: string;
  description: string;
  whoPerforms: 'buyer' | 'seller' | 'both';
  estimatedTime: string;
  instructions: string[];
  verification: {
    type: 'screenshot' | 'code' | 'confirmation';
    required: boolean;
  };
  status: 'pending' | 'in_progress' | 'completed' | 'failed';
}

// Instagram Transfer Process
const instagramTransferSteps: TransferStep[] = [
  {
    stepNumber: 1,
    title: 'Seller Prepares Account',
    whoPerforms: 'seller',
    estimatedTime: '5 minutes',
    instructions: [
      'Remove all linked Facebook pages',
      'Disable two-factor authentication temporarily',
      'Ensure email is accessible',
      'Note down current email and phone number'
    ],
    verification: { type: 'confirmation', required: true }
  },
  {
    stepNumber: 2,
    title: 'Email Change Initiated',
    whoPerforms: 'seller',
    estimatedTime: '10 minutes',
    instructions: [
      'Go to Settings > Account > Email',
      'Change email to buyer\'s provided email',
      'Confirm the change via current email'
    ],
    verification: { type: 'screenshot', required: true }
  },
  {
    stepNumber: 3,
    title: 'Buyer Confirms Email Access',
    whoPerforms: 'buyer',
    estimatedTime: '5 minutes',
    instructions: [
      'Check new email for Instagram confirmation',
      'Click confirmation link',
      'Take screenshot of successful confirmation'
    ],
    verification: { type: 'screenshot', required: true }
  },
  {
    stepNumber: 4,
    title: 'Password Reset',
    whoPerforms: 'buyer',
    estimatedTime: '5 minutes',
    instructions: [
      'Request password reset from Instagram',
      'Use new email to receive reset link',
      'Set new strong password',
      'Login to confirm access'
    ],
    verification: { type: 'confirmation', required: true }
  },
  {
    stepNumber: 5,
    title: 'Phone Number Change',
    whoPerforms: 'buyer',
    estimatedTime: '5 minutes',
    instructions: [
      'Go to Settings > Account > Phone Number',
      'Remove old phone number',
      'Add your phone number',
      'Verify with SMS code'
    ],
    verification: { type: 'screenshot', required: true }
  },
  {
    stepNumber: 6,
    title: 'Security Settings Update',
    whoPerforms: 'buyer',
    estimatedTime: '10 minutes',
    instructions: [
      'Enable two-factor authentication',
      'Review and remove any unknown login sessions',
      'Check connected apps and remove unnecessary ones',
      'Update recovery email if different'
    ],
    verification: { type: 'confirmation', required: true }
  },
  {
    stepNumber: 7,
    title: 'Final Verification',
    whoPerforms: 'buyer',
    estimatedTime: '5 minutes',
    instructions: [
      'Post a story or photo to confirm full access',
      'Check insights/analytics access',
      'Verify all features are working',
      'Confirm transfer completion in SocialVault'
    ],
    verification: { type: 'screenshot', required: true }
  }
];

// Transfer state machine
class TransferStateMachine {
  async initiateTransfer(transactionId: string) {
    const transfer = await createTransfer({
      transactionId,
      status: 'not_started',
      currentStep: 0,
      steps: getPlatformTransferSteps(transaction.listing.platform)
    });
    
    // Create private chat for transfer coordination
    await createTransferChat(transfer);
    
    // Send initial instructions
    await sendTransferInstructions(transfer);
    
    return transfer;
  }
  
  async completeStep(transferId: string, stepNumber: number, proof: File) {
    const transfer = await getTransfer(transferId);
    const step = transfer.steps[stepNumber - 1];
    
    // Upload proof
    const proofUrl = await uploadToS3(proof);
    
    // Mark step as completed
    step.status = 'completed';
    step.proof = proofUrl;
    step.completedAt = new Date();
    
    await updateTransfer(transfer);
    
    // Check if all steps completed
    if (transfer.steps.every(s => s.status === 'completed')) {
      await this.completeTransfer(transferId);
    } else {
      // Move to next step
      transfer.currentStep++;
      await sendNextStepInstructions(transfer);
    }
  }
  
  async completeTransfer(transferId: string) {
    const transfer = await getTransfer(transferId);
    
    // Mark transfer as completed
    await updateTransfer({
      status: 'completed',
      completedAt: new Date()
    });
    
    // Release escrow
    await releaseEscrow(transfer.transactionId);
    
    // Update transaction status
    await updateTransaction({
      transferStatus: 'completed',
      transactionStatus: 'completed',
      completedAt: new Date()
    });
    
    // Send completion notifications
    await notifyTransferComplete(transfer);
    
    // Request reviews
    await requestReviews(transfer.transactionId);
  }
}
```

**Responsibilities:**
- Real-time messaging between users
- Message encryption
- File attachments
- Message moderation
- Notification delivery

**Implementation:**

```typescript
// WebSocket server for real-time messaging
class MessagingService {
  private wss: WebSocketServer;
  private userConnections: Map<string, WebSocket[]>;
  
  async sendMessage(senderId: string, recipientId: string, content: string, attachments?: File[]) {
    // Encrypt message
    const encryptedContent = await encryptE2E(content, recipientId);
    
    // Upload attachments
    const attachmentUrls = attachments ? 
      await Promise.all(attachments.map(f => uploadToS3(f))) : [];
    
    // Save message
    const message = await createMessage({
      conversationId: getConversationId(senderId, recipientId),
      senderId,
      recipientId,
      content,
      encryptedContent,
      attachments: attachmentUrls,
      messageType: attachments?.length ? 'file' : 'text'
    });
    
    // Send via WebSocket if recipient is online
    await this.deliverMessage(recipientId, message);
    
    // Send push notification if offline
    if (!this.isUserOnline(recipientId)) {
      await sendPushNotification(recipientId, {
        title: `New message from ${getSenderName(senderId)}`,
        body: content.substring(0, 100),
        data: { messageId: message.id, conversationId: message.conversationId }
      });
    }
    
    return message;
  }
  
  private async deliverMessage(userId: string, message: Message) {
    const connections = this.userConnections.get(userId) || [];
    const payload = JSON.stringify({ type: 'new_message', data: message });
    
    connections.forEach(ws => {
      if (ws.readyState === WebSocket.OPEN) {
        ws.send(payload);
      }
    });
  }
}

// End-to-end encryption using libsodium
async function encryptE2E(content: string, recipientId: string): Promise<string> {
  // Get recipient's public key
  const recipientPublicKey = await getPublicKey(recipientId);
  
  // Encrypt using recipient's public key
  const encrypted = sodium.crypto_box_seal(
    sodium.from_string(content),
    recipientPublicKey
  );
  
  return sodium.to_base64(encrypted);
}

async function decryptE2E(encryptedContent: string, recipientId: string): Promise<string> {
  // Get recipient's key pair
  const { publicKey, privateKey } = await getKeyPair(recipientId);
  
  // Decrypt using private key
  const decrypted = sodium.crypto_box_seal_open(
    sodium.from_base64(encryptedContent),
    publicKey,
    privateKey
  );
  
  return sodium.to_string(decrypted);
}
```

### 6. Analytics & Reporting Module

**Responsibilities:**
- Platform analytics dashboard
- User behavior tracking
- Revenue reporting
- Fraud analytics
- Performance metrics

**Key Metrics:**

```typescript
interface PlatformMetrics {
  // User Metrics
  totalUsers: number;
  activeUsers: {
    daily: number;
    weekly: number;
    monthly: number;
  };
  newUsersToday: number;
  kycVerifiedUsers: number;
  
  // Listing Metrics
  totalListings: number;
  activeListings: number;
  soldListings: number;
  averageListingPrice: number;
  listingsByPlatform: Record<Platform, number>;
  listingsByNiche: Record<string, number>;
  
  // Transaction Metrics
  totalTransactions: number;
  completedTransactions: number;
  totalGMV: number; // Gross Merchandise Value
  averageTransactionValue: number;
  transactionSuccessRate: number;
  
  // Revenue Metrics
  totalRevenue: number;
  revenueByMonth: Record<string, number>;
  averageFeePerTransaction: number;
  
  // Escrow Metrics
  fundsInEscrow: number;
  averageEscrowDuration: number; // hours
  escrowReleaseRate: number;
  escrowRefundRate: number;
  
  // Dispute Metrics
  totalDisputes: number;
  openDisputes: number;
  disputeRate: number; // percentage of transactions
  averageDisputeResolutionTime: number; // hours
  
  // Trust & Safety
  flaggedListings: number;
  bannedUsers: number;
  fraudAttempts: number;
  averageFraudScore: number;
}

// Analytics queries
async function getAnalytics(timeRange: { start: Date; end: Date }): Promise<PlatformMetrics> {
  const [
    userMetrics,
    listingMetrics,
    transactionMetrics,
    revenueMetrics,
    escrowMetrics,
    disputeMetrics,
    trustMetrics
  ] = await Promise.all([
    getUserMetrics(timeRange),
    getListingMetrics(timeRange),
    getTransactionMetrics(timeRange),
    getRevenueMetrics(timeRange),
    getEscrowMetrics(timeRange),
    getDisputeMetrics(timeRange),
    getTrustMetrics(timeRange)
  ]);
  
  return {
    ...userMetrics,
    ...listingMetrics,
    ...transactionMetrics,
    ...revenueMetrics,
    ...escrowMetrics,
    ...disputeMetrics,
    ...trustMetrics
  };
}
```

---

## API Specifications

### REST API Endpoints

**Base URL:** `https://api.accountbazaar.com/v1`

**Authentication:** Bearer JWT tokens in Authorization header

#### User Endpoints

```
POST   /auth/register
POST   /auth/login
POST   /auth/logout
POST   /auth/refresh-token
POST   /auth/forgot-password
POST   /auth/reset-password
POST   /auth/verify-email
POST   /auth/resend-verification

GET    /users/me
PATCH  /users/me
DELETE /users/me
GET    /users/:id/profile
GET    /users/:id/reviews
GET    /users/:id/stats

POST   /users/me/kyc/initiate
GET    /users/me/kyc/status
POST   /users/me/2fa/enable
POST   /users/me/2fa/disable
POST   /users/me/2fa/verify

GET    /users/me/payment-methods
POST   /users/me/payment-methods
DELETE /users/me/payment-methods/:id
PATCH  /users/me/payment-methods/:id/default
```

#### Listing Endpoints

```
GET    /listings
GET    /listings/:id
POST   /listings
PATCH  /listings/:id
DELETE /listings/:id
POST   /listings/:id/publish
POST   /listings/:id/unpublish

POST   /listings/:id/favorite
DELETE /listings/:id/favorite
GET    /users/me/favorites

GET    /listings/:id/verification-status
POST   /listings/:id/request-verification

GET    /listings/search
GET    /listings/featured
GET    /listings/recommended
```

#### Offer Endpoints

```
GET    /listings/:id/offers
POST   /listings/:id/offers
GET    /offers/:id
PATCH  /offers/:id/accept
PATCH  /offers/:id/reject
PATCH  /offers/:id/counter
DELETE /offers/:id/withdraw
```

#### Transaction Endpoints

```
GET    /transactions
GET    /transactions/:id
POST   /transactions
PATCH  /transactions/:id/cancel

POST   /transactions/:id/payment/intent
POST   /transactions/:id/payment/confirm
GET    /transactions/:id/payment/status

GET    /transactions/:id/escrow/status
POST   /transactions/:id/escrow/release
POST   /transactions/:id/escrow/dispute

GET    /transactions/:id/transfer/steps
POST   /transactions/:id/transfer/steps/:stepId/complete
GET    /transactions/:id/transfer/status
```

#### Messaging Endpoints

```
GET    /conversations
GET    /conversations/:id
GET    /conversations/:id/messages
POST   /conversations/:id/messages
PATCH  /messages/:id/read
DELETE /messages/:id
```

#### Review Endpoints

```
GET    /reviews
GET    /reviews/:id
POST   /transactions/:id/review
PATCH  /reviews/:id/response
GET    /users/:id/reviews
```

#### Dispute Endpoints

```
GET    /disputes
GET    /disputes/:id
POST   /transactions/:id/dispute
POST   /disputes/:id/messages
PATCH  /disputes/:id/close
```

#### Admin Endpoints

```
GET    /admin/users
PATCH  /admin/users/:id/status
GET    /admin/listings
PATCH  /admin/listings/:id/verify
PATCH  /admin/listings/:id/reject
GET    /admin/transactions
GET    /admin/disputes
PATCH  /admin/disputes/:id/resolve
GET    /admin/analytics
GET    /admin/reports
```

### WebSocket Events

**Connection:** `wss://ws.accountbazaar.com?token=<jwt>`

**Client → Server Events:**
```typescript
// Authentication
{ type: 'auth', token: string }

// Messaging
{ type: 'message:send', data: { recipientId, content, attachments } }
{ type: 'message:read', data: { messageId } }
{ type: 'typing:start', data: { conversationId } }
{ type: 'typing:stop', data: { conversationId } }

// Presence
{ type: 'presence:online' }
{ type: 'presence:away' }
{ type: 'presence:offline' }
```

**Server → Client Events:**
```typescript
// Connection
{ type: 'connected', data: { userId, sessionId } }
{ type: 'error', data: { code, message } }

// Messaging
{ type: 'message:new', data: Message }
{ type: 'message:read', data: { messageId, readBy, readAt } }
{ type: 'typing:indicator', data: { conversationId, userId, isTyping } }

// Notifications
{ type: 'notification:new', data: Notification }

// Transaction Updates
{ type: 'transaction:status_changed', data: { transactionId, newStatus } }
{ type: 'escrow:status_changed', data: { transactionId, newStatus } }
{ type: 'transfer:step_completed', data: { transactionId, stepNumber } }

// Listing Updates
{ type: 'listing:sold', data: { listingId } }
{ type: 'offer:received', data: Offer }
{ type: 'offer:accepted', data: Offer }
{ type: 'offer:rejected', data: Offer }

// Presence
{ type: 'user:online', data: { userId } }
{ type: 'user:offline', data: { userId } }
```

### Example API Request/Response

**POST /listings**

Request:
```json
{
  "platform": "instagram",
  "accountUrl": "https://instagram.com/example_account",
  "accountHandle": "@example_account",
  "title": "Fitness & Wellness Instagram Account - 150K Followers",
  "description": "Established fitness account with highly engaged audience. Consistent posting schedule, high-quality content, verified by Instagram.",
  "price": 15000,
  "currency": "USD",
  "allowOffers": true,
  "minimumOffer": 12000,
  "niche": "fitness",
  "subNiche": "yoga",
  "includesEmail": true,
  "includesPhone": true,
  "transferMethod": "email_change",
  "screenshots": ["url1", "url2", "url3"]
}
```

Response:
```json
{
  "success": true,
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "sellerId": "user-id-here",
    "platform": "instagram",
    "accountHandle": "@example_account",
    "title": "Fitness & Wellness Instagram Account - 150K Followers",
    "price": 15000,
    "currency": "USD",
    "followersCount": 152430,
    "engagementRate": 4.2,
    "listingStatus": "draft",
    "verificationStatus": "pending",
    "createdAt": "2026-01-04T10:00:00Z",
    "estimatedVerificationTime": "2-4 hours"
  }
}
```

---

## Security Implementation

### 1. Authentication & Authorization

**JWT Token Structure:**
```typescript
interface AccessToken {
  userId: string;
  email: string;
  role: 'user' | 'admin';
  permissions: string[];
  exp: number; // 1 hour
}

interface RefreshToken {
  userId: string;
  sessionId: string;
  exp: number; // 7 days
}
```

**Token Refresh Flow:**
```typescript
// Refresh endpoint
POST /auth/refresh-token
Headers: {
  Authorization: "Bearer <refresh_token>"
}

Response: {
  accessToken: "new_access_token",
  expiresIn: 3600
}
```

### 2. Data Encryption

**At Rest:**
- Database: AES-256 encryption for sensitive fields
- Files: S3 server-side encryption (SSE-S3)
- Backups: Encrypted with AWS KMS

**In Transit:**
- TLS 1.3 for all API communications
- Certificate pinning for mobile apps
- HSTS headers enabled

**Sensitive Data Fields:**
```typescript
// Encrypted in database
const sensitiveFields = [
  'users.password_hash',
  'users.two_factor_secret',
  'users.kyc_reference_id',
  'messages.encrypted_content',
  'payment_methods.provider_payment_method_id',
  'transactions.blockchain_transaction_hash'
];

// Encryption helper
async function encryptField(data: string): Promise<string> {
  const key = await getEncryptionKey();
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv('aes-256-gcm', key, iv);
  
  let encrypted = cipher.update(data, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  
  const authTag = cipher.getAuthTag();
  
  return `${iv.toString('hex')}:${authTag.toString('hex')}:${encrypted}`;
}
```

### 3. Rate Limiting

```typescript
// Rate limit configurations
const rateLimits = {
  'auth/login': {
    window: '15m',
    max: 5,
    message: 'Too many login attempts'
  },
  'auth/register': {
    window: '1h',
    max: 3,
    message: 'Registration limit exceeded'
  },
  'listings': {
    window: '1m',
    max: 60
  },
  'messages': {
    window: '1m',
    max: 30
  },
  'api/*': {
    window: '15m',
    max: 100
  }
};

// Implementation using Redis
async function checkRateLimit(userId: string, endpoint: string): Promise<boolean> {
  const limit = rateLimits[endpoint] || rateLimits['api/*'];
  const key = `ratelimit:${userId}:${endpoint}`;
  
  const current = await redis.incr(key);
  
  if (current === 1) {
    await redis.expire(key, parseWindow(limit.window));
  }
  
  return current <= limit.max;
}
```

### 4. Input Validation & Sanitization

```typescript
// Using Zod for validation
import { z } from 'zod';

const createListingSchema = z.object({
  platform: z.enum(['instagram', 'youtube', 'tiktok', 'twitter', 'facebook']),
  accountUrl: z.string().url(),
  accountHandle: z.string().min(1).max(255),
  title: z.string().min(10).max(255),
  description: z.string().min(50).max(5000),
  price: z.number().positive().max(1000000),
  currency: z.enum(['USD', 'EUR', 'GBP']),
  allowOffers: z.boolean(),
  minimumOffer: z.number().positive().optional(),
  niche: z.string().min(1).max(100),
  includesEmail: z.boolean(),
  includesPhone: z.boolean(),
  screenshots: z.array(z.string().url()).min(2).max(10)
});

// Sanitization
import DOMPurify from 'isomorphic-dompurify';

function sanitizeUserInput(input: string): string {
  return DOMPurify.sanitize(input, {
    ALLOWED_TAGS: [],
    ALLOWED_ATTR: []
  });
}
```

### 5. SQL Injection Prevention

```typescript
// Always use parameterized queries
// Good (using Prisma ORM)
const user = await prisma.user.findUnique({
  where: { email: userEmail }
});

// Good (raw query with parameters)
const users = await prisma.$queryRaw`
  SELECT * FROM users WHERE email = ${userEmail}
`;

// Bad - NEVER do this
const users = await prisma.$queryRawUnsafe(
  `SELECT * FROM users WHERE email = '${userEmail}'`
);
```

### 6. XSS Protection

```typescript
// Content Security Policy headers
const cspDirectives = {
  defaultSrc: ["'self'"],
  scriptSrc: ["'self'", "'unsafe-inline'", "https://cdn.stripe.com"],
  styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
  imgSrc: ["'self'", "data:", "https:", "blob:"],
  fontSrc: ["'self'", "https://fonts.gstatic.com"],
  connectSrc: ["'self'", "https://api.socialvault.com", "wss://ws.socialvault.com"],
  frameSrc: ["https://js.stripe.com"],
  objectSrc: ["'none'"],
  upgradeInsecureRequests: []
};

// Express middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: cspDirectives
  }
}));
```

### 7. CSRF Protection

```typescript
// Using CSRF tokens
import csrf from 'csurf';

const csrfProtection = csrf({ 
  cookie: {
    httpOnly: true,
    secure: true,
    sameSite: 'strict'
  }
});

app.use(csrfProtection);

// Include token in forms
app.get('/form', (req, res) => {
  res.render('form', { csrfToken: req.csrfToken() });
});
```

### 8. Security Headers

```typescript
app.use(helmet({
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true
  },
  frameguard: {
    action: 'deny'
  },
  contentSecurityPolicy: cspDirectives,
  xssFilter: true,
  noSniff: true,
  referrerPolicy: {
    policy: 'strict-origin-when-cross-origin'
  }
}));
```

### 9. Secure File Upload

```typescript
// File upload validation
const fileUploadMiddleware = multer({
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB
    files: 10
  },
  fileFilter: (req, file, cb) => {
    const allowedMimes = [
      'image/jpeg',
      'image/png',
      'image/webp',
      'video/mp4',
      'application/pdf'
    ];
    
    if (allowedMimes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type'));
    }
  }
});

// Virus scanning with ClamAV
async function scanFile(filePath: string): Promise<boolean> {
  const clam = new NodeClam();
  const { isInfected, viruses } = await clam.isInfected(filePath);
  
  if (isInfected) {
    await fs.unlink(filePath);
    throw new Error(`File infected: ${viruses.join(', ')}`);
  }
  
  return true;
}

// Upload to S3 with sanitized filename
async function uploadFile(file: Express.Multer.File): Promise<string> {
  // Scan for viruses
  await scanFile(file.path);
  
  // Generate safe filename
  const ext = path.extname(file.originalname);
  const safeName = `${uuidv4()}${ext}`;
  
  // Upload to S3
  const result = await s3.upload({
    Bucket: process.env.S3_BUCKET,
    Key: `uploads/${safeName}`,
    Body: fs.createReadStream(file.path),
    ContentType: file.mimetype,
    ServerSideEncryption: 'AES256'
  }).promise();
  
  // Delete local file
  await fs.unlink(file.path);
  
  return result.Location;
}
```

### 10. Audit Logging

```typescript
interface AuditLog {
  id: string;
  userId: string;
  action: string;
  entityType: string;
  entityId: string;
  changes: Record<string, { old: any; new: any }>;
  ipAddress: string;
  userAgent: string;
  timestamp: Date;
}

async function logAudit(log: Omit<AuditLog, 'id' | 'timestamp'>) {
  await auditLogRepository.create({
    ...log,
    id: uuidv4(),
    timestamp: new Date()
  });
  
  // Also send to centralized logging (e.g., CloudWatch, Datadog)
  logger.info('audit', log);
}

// Usage
await logAudit({
  userId: req.user.id,
  action: 'transaction.created',
  entityType: 'transaction',
  entityId: transaction.id,
  changes: { status: { old: null, new: 'initiated' } },
  ipAddress: req.ip,
  userAgent: req.headers['user-agent']
});
```

---

## User Interface & Experience

### Design System

**Color Palette:**
```css
:root {
  /* Primary Colors */
  --primary-50: #f0f9ff;
  --primary-100: #e0f2fe;
  --primary-500: #0ea5e9;
  --primary-600: #0284c7;
  --primary-700: #0369a1;
  
  /* Success */
  --success-500: #22c55e;
  --success-600: #16a34a;
  
  /* Warning */
  --warning-500: #f59e0b;
  --warning-600: #d97706;
  
  /* Error */
  --error-500: #ef4444;
  --error-600: #dc2626;
  
  /* Neutral */
  --gray-50: #f9fafb;
  --gray-100: #f3f4f6;
  --gray-500: #6b7280;
  --gray-900: #111827;
}
```

**Typography:**
```css
/* Fonts */
--font-sans: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
--font-mono: 'JetBrains Mono', 'Courier New', monospace;

/* Scale */
--text-xs: 0.75rem;    /* 12px */
--text-sm: 0.875rem;   /* 14px */
--text-base: 1rem;     /* 16px */
--text-lg: 1.125rem;   /* 18px */
--text-xl: 1.25rem;    /* 20px */
--text-2xl: 1.5rem;    /* 24px */
--text-3xl: 1.875rem;  /* 30px */
--text-4xl: 2.25rem;   /* 36px */
```

### Key User Flows

**1. Buyer Journey:**
```
Home Page
  ↓
Browse Listings (with filters)
  ↓
View Listing Details
  ↓
[Optional] Send Message to Seller
  ↓
Make Offer / Buy Now
  ↓
Review Purchase Agreement
  ↓
Complete Payment
  ↓
Funds in Escrow
  ↓
Coordinate Transfer with Seller
  ↓
Verify Account Access
  ↓
Confirm Transfer Complete
  ↓
Escrow Released
  ↓
Leave Review
```

**2. Seller Journey:**
```
Dashboard
  ↓
Create New Listing
  ↓
Enter Account Details
  ↓
Upload Verification Screenshots
  ↓
Set Price & Terms
  ↓
Submit for Verification
  ↓
Listing Approved & Published
  ↓
Receive Offer/Purchase
  ↓
Accept Offer
  ↓
Buyer Pays (Funds in Escrow)
  ↓
Initiate Transfer Process
  ↓
Guide Buyer Through Transfer
  ↓
Buyer Confirms Transfer
  ↓
Receive Payment
  ↓
Leave Review
```

### Wireframes & Components

**Homepage:**
```
┌─────────────────────────────────────────────────┐
│  [Logo] AccountBazaar    [Search] 🔍  [Login/Signup]│
├─────────────────────────────────────────────────┤
│                                                 │
│    Where Digital Influence Changes Hands        │
│    Buy & Sell Social Media Accounts Safely      │
│                                                 │
│    [Browse Instagram] [Browse YouTube] [Browse TikTok]│
│                                                 │
├─────────────────────────────────────────────────┤
│  Featured Listings                              │
│  ┌─────────┐ ┌─────────┐ ┌─────────┐         │
│  │[Image]  │ │[Image]  │ │[Image]  │         │
│  │150K     │ │500K     │ │1.2M     │         │
│  │$15,000  │ │$45,000  │ │$120,000 │         │
│  └─────────┘ └─────────┘ └─────────┘         │
├─────────────────────────────────────────────────┤
│  How It Works                                   │
│  1. Browse → 2. Buy → 3. Transfer → 4. Own It  │
├─────────────────────────────────────────────────┤
│  Trust & Safety                                 │
│  ✓ Secure Escrow  ✓ Verified Accounts          │
│  ✓ Transfer Support  ✓ Buyer Protection        │
└─────────────────────────────────────────────────┘
```

**Listing Page:**
```
┌─────────────────────────────────────────────────┐
│ [Back to Search]                                │
├─────────────────────────────────────────────────┤
│  ┌───────────────┐  Fitness & Wellness Account  │
│  │               │  Platform: Instagram          │
│  │  Screenshot   │  Followers: 152,430           │
│  │               │  Engagement: 4.2%             │
│  │               │  ✓ Verified Account           │
│  └───────────────┘                               │
│  [Prev] [Next]     Price: $15,000                │
│                    [Make Offer] [Buy Now]        │
├─────────────────────────────────────────────────┤
│  Account Metrics                                │
│  📊 Followers Growth: +5.2% (30 days)           │
│  👥 Demographics: 65% Female, 25-34 age         │
│  📍 Top Locations: USA (45%), UK (15%)          │
│  💰 Monetized: Yes (Partner Program)            │
├─────────────────────────────────────────────────┤
│  Description                                    │
│  [Full account description...]                  │
├─────────────────────────────────────────────────┤
│  Seller Information                             │
│  Trust Score: 8.5/10                            │
│  Completed Sales: 12                            │
│  Response Time: < 2 hours                       │
│  [Message Seller]                               │
└─────────────────────────────────────────────────┘
```

**Transaction Dashboard:**
```
┌─────────────────────────────────────────────────┐
│  Transaction #12345                             │
│  Status: Transfer in Progress                   │
├─────────────────────────────────────────────────┤
│  Progress Timeline                              │
│  ✓ Payment Received                             │
│  ✓ Funds in Escrow                              │
│  ⟳ Account Transfer (Step 3 of 7)              │
│  ○ Transfer Complete                            │
│  ○ Payment Released                             │
├─────────────────────────────────────────────────┤
│  Current Step: Email Change                     │
│  Instructions:                                  │
│  1. Go to Instagram Settings                    │
│  2. Navigate to Account > Email                 │
│  3. Change email to: buyer@example.com          │
│  4. Upload screenshot when complete             │
│                                                 │
│  [Upload Screenshot]  [Need Help?]              │
├─────────────────────────────────────────────────┤
│  Messages with Seller                           │
│  [Chat interface]                               │
└─────────────────────────────────────────────────┘
```

### Mobile App Screens

**Key Features:**
- Push notifications for messages and updates
- Biometric authentication
- Document scanner for verification
- Real-time chat
- Transaction tracking
- Quick actions (accept offer, confirm transfer)

---

## DevOps & Infrastructure

### Deployment Strategy (Choose Based on Stage)

#### **Option A: Simple Start (No Docker) - Recommended for MVP**

**Stack:**
```yaml
Frontend:
  Platform: Vercel
  Cost: Free
  Deploy: git push (auto-deployment)
  
Backend API:
  Platform: Railway.app or Render.com
  Cost: $5-20/month
  Deploy: git push (auto-deployment)
  
Database:
  Platform: Supabase or Railway PostgreSQL
  Cost: Free tier available
  Backup: Automatic
  
Redis:
  Platform: Upstash
  Cost: Free tier (10k commands/day)
  
File Storage:
  Platform: Cloudflare R2 or AWS S3
  Cost: Free tier available
  
Email:
  Platform: Resend or SendGrid
  Cost: Free tier (100 emails/day)
```

**Deployment Steps:**

```bash
# 1. Frontend (Vercel)
npm install -g vercel
cd frontend
vercel login
vercel --prod

# 2. Backend (Railway)
npm install -g @railway/cli
cd backend
railway login
railway init
railway up

# 3. Database (Supabase)
# - Sign up at supabase.com
# - Create project
# - Copy connection string
# - Add to Railway environment variables

# 4. Done! Total time: ~30 minutes
```

**Environment Variables:**
```bash
# Backend (.env)
DATABASE_URL=postgresql://...
REDIS_URL=redis://...
JWT_SECRET=your-secret-key
STRIPE_SECRET_KEY=sk_test_...
AWS_S3_BUCKET=accountbazaar-uploads
FRONTEND_URL=https://accountbazaar.com
```

#### **Option B: Docker-based (For Growth Phase)**

Use Docker when you need:
- Multiple services coordination
- Complex local development
- Self-hosted deployment
- Team of 3+ developers

**docker-compose.yml:**
```yaml
version: '3.9'

services:
  # Web Frontend
  web:
    build: ./frontend
    ports:
      - "3000:3000"
    environment:
      - NEXT_PUBLIC_API_URL=http://localhost:4000
    depends_on:
      - api
  
  # API Backend
  api:
    build: ./backend
    ports:
      - "4000:4000"
    environment:
      - DATABASE_URL=postgresql://postgres:password@db:5432/accountbazaar
      - REDIS_URL=redis://redis:6379
    depends_on:
      - db
      - redis
  
  # PostgreSQL Database
  db:
    image: postgres:15-alpine
    ports:
      - "5432:5432"
    environment:
      - POSTGRES_DB=accountbazaar
      - POSTGRES_USER=postgres
      - POSTGRES_PASSWORD=password
    volumes:
      - postgres_data:/var/lib/postgresql/data
  
  # Redis Cache
  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"
    volumes:
      - redis_data:/data

volumes:
  postgres_data:
  redis_data:
```

**Quick Start:**
```bash
# Clone repo
git clone https://github.com/yourorg/accountbazaar
cd accountbazaar

# Start everything
docker-compose up -d

# Run migrations
docker-compose exec api npm run migrate

# View logs
docker-compose logs -f

# Stop everything
docker-compose down
```

### CI/CD Pipeline (Simple Version - No Docker)

```yaml
# .github/workflows/deploy.yml
name: Deploy to Production

on:
  push:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Run Unit Tests
        run: npm test
      
      - name: Run Integration Tests
        run: npm run test:integration
      
      - name: Run E2E Tests
        run: npm run test:e2e
      
      - name: Security Scan
        run: npm audit
      
      - name: Code Quality
        run: npm run lint
  
  build:
    needs: test
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Build Docker Images
        run: |
          docker build -t socialvault/web:${{ github.sha }} ./web
          docker build -t socialvault/api:${{ github.sha }} ./api
      
      - name: Push to ECR
        run: |
          aws ecr get-login-password | docker login --username AWS --password-stdin $ECR_REGISTRY
          docker push socialvault/web:${{ github.sha }}
          docker push socialvault/api:${{ github.sha }}
  
  deploy:
    needs: build
    runs-on: ubuntu-latest
    steps:
      - name: Deploy to ECS
        run: |
          aws ecs update-service --cluster prod --service web --force-new-deployment
          aws ecs update-service --cluster prod --service api --force-new-deployment
      
      - name: Run Database Migrations
        run: npm run migrate:prod
      
      - name: Warm Up Cache
        run: npm run cache:warm
      
      - name: Health Check
        run: ./scripts/health-check.sh
      
      - name: Notify Team
        run: ./scripts/notify-deploy.sh
```

### Infrastructure as Code (Terraform)

```hcl
# main.tf
terraform {
  required_version = ">= 1.0"
  
  backend "s3" {
    bucket = "accountbazaar-terraform-state"
    key    = "prod/terraform.tfstate"
    region = "us-east-1"
  }
}

provider "aws" {
  region = var.aws_region
}

# VPC
module "vpc" {
  source = "terraform-aws-modules/vpc/aws"
  
  name = "accountbazaar-vpc"
  cidr = "10.0.0.0/16"
  
  azs             = ["us-east-1a", "us-east-1b", "us-east-1c"]
  private_subnets = ["10.0.1.0/24", "10.0.2.0/24", "10.0.3.0/24"]
  public_subnets  = ["10.0.101.0/24", "10.0.102.0/24", "10.0.103.0/24"]
  
  enable_nat_gateway = true
  enable_vpn_gateway = false
  
  tags = {
    Environment = "production"
    Project     = "accountbazaar"
  }
}

# ECS Cluster
resource "aws_ecs_cluster" "main" {
  name = "accountbazaar-cluster"
  
  setting {
    name  = "containerInsights"
    value = "enabled"
  }
}

# RDS PostgreSQL
resource "aws_db_instance" "postgres" {
  identifier = "accountbazaar-db"
  
  engine         = "postgres"
  engine_version = "15.3"
  instance_class = "db.t3.large"
  
  allocated_storage     = 100
  max_allocated_storage = 1000
  storage_encrypted     = true
  
  db_name  = "accountbazaar"
  username = var.db_username
  password = var.db_password
  
  multi_az               = true
  backup_retention_period = 30
  backup_window          = "03:00-04:00"
  maintenance_window     = "mon:04:00-mon:05:00"
  
  vpc_security_group_ids = [aws_security_group.rds.id]
  db_subnet_group_name   = aws_db_subnet_group.main.name
  
  enabled_cloudwatch_logs_exports = ["postgresql"]
  
  tags = {
    Environment = "production"
  }
}

# ElastiCache Redis
resource "aws_elasticache_replication_group" "redis" {
  replication_group_id = "accountbazaar-redis"
  description          = "Redis for caching and sessions"
  
  engine               = "redis"
  engine_version       = "7.0"
  node_type            = "cache.t3.medium"
  number_cache_clusters = 3
  
  parameter_group_name = "default.redis7"
  port                 = 6379
  
  subnet_group_name    = aws_elasticache_subnet_group.main.name
  security_group_ids   = [aws_security_group.redis.id]
  
  at_rest_encryption_enabled = true
  transit_encryption_enabled = true
  
  automatic_failover_enabled = true
  multi_az_enabled          = true
  
  snapshot_retention_limit = 5
  snapshot_window         = "03:00-05:00"
  
  tags = {
    Environment = "production"
  }
}

# S3 Buckets
resource "aws_s3_bucket" "uploads" {
  bucket = "accountbazaar-uploads-prod"
  
  tags = {
    Environment = "production"
  }
}

resource "aws_s3_bucket_versioning" "uploads" {
  bucket = aws_s3_bucket.uploads.id
  
  versioning_configuration {
    status = "Enabled"
  }
}

resource "aws_s3_bucket_server_side_encryption_configuration" "uploads" {
  bucket = aws_s3_bucket.uploads.id
  
  rule {
    apply_server_side_encryption_by_default {
      sse_algorithm = "AES256"
    }
  }
}

# CloudFront CDN
resource "aws_cloudfront_distribution" "cdn" {
  enabled             = true
  is_ipv6_enabled     = true
  default_root_object = "index.html"
  
  origin {
    domain_name = aws_s3_bucket.uploads.bucket_regional_domain_name
    origin_id   = "S3-uploads"
    
    s3_origin_config {
      origin_access_identity = aws_cloudfront_origin_access_identity.main.cloudfront_access_identity_path
    }
  }
  
  default_cache_behavior {
    allowed_methods  = ["GET", "HEAD", "OPTIONS"]
    cached_methods   = ["GET", "HEAD"]
    target_origin_id = "S3-uploads"
    
    forwarded_values {
      query_string = false
      cookies {
        forward = "none"
      }
    }
    
    viewer_protocol_policy = "redirect-to-https"
    min_ttl                = 0
    default_ttl            = 86400
    max_ttl                = 31536000
    compress               = true
  }
  
  restrictions {
    geo_restriction {
      restriction_type = "none"
    }
  }
  
  viewer_certificate {
    acm_certificate_arn = var.acm_certificate_arn
    ssl_support_method  = "sni-only"
  }
}
```

### Monitoring & Alerting

**Datadog Configuration:**
```yaml
# datadog.yaml
api_key: ${DATADOG_API_KEY}
site: datadoghq.com

logs_enabled: true
apm_enabled: true

logs_config:
  container_collect_all: true

apm_config:
  enabled: true
  env: production

# Custom Metrics
custom_metrics:
  - metric_name: accountbazaar.transactions.created
    metric_type: count
    tags:
      - env:production
      - service:api
  
  - metric_name: accountbazaar.escrow.funds_held
    metric_type: gauge
    tags:
      - env:production
      - service:payment
  
  - metric_name: accountbazaar.fraud.score
    metric_type: gauge
    tags:
      - env:production
      - service:verification

# Alerts
monitors:
  - name: "High Error Rate"
    type: metric alert
    query: "avg(last_5m):sum:trace.express.request.errors{env:production} > 10"
    message: "@slack-alerts High error rate detected in API"
    
  - name: "Escrow Funds Threshold"
    type: metric alert
    query: "avg(last_1h):sum:accountbazaar.escrow.funds_held{env:production} > 1000000"
    message: "@team-finance Escrow funds exceed $1M threshold"
    
  - name: "Database Connection Pool"
    type: metric alert
    query: "avg(last_5m):postgresql.connections.active{env:production} > 80"
    message: "@team-backend Database connection pool near capacity"
```

**Prometheus Metrics:**
```typescript
// metrics.ts
import { Register, Counter, Histogram, Gauge } from 'prom-client';

const register = new Register();

// HTTP Metrics
export const httpRequestDuration = new Histogram({
  name: 'http_request_duration_seconds',
  help: 'Duration of HTTP requests in seconds',
  labelNames: ['method', 'route', 'status_code'],
  registers: [register]
});

export const httpRequestTotal = new Counter({
  name: 'http_requests_total',
  help: 'Total number of HTTP requests',
  labelNames: ['method', 'route', 'status_code'],
  registers: [register]
});

// Business Metrics
export const transactionsCreated = new Counter({
  name: 'transactions_created_total',
  help: 'Total number of transactions created',
  labelNames: ['platform'],
  registers: [register]
});

export const escrowFundsHeld = new Gauge({
  name: 'escrow_funds_held_usd',
  help: 'Total funds currently held in escrow (USD)',
  registers: [register]
});

export const fraudScore = new Histogram({
  name: 'fraud_score',
  help: 'Fraud detection score distribution',
  buckets: [0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1.0],
  registers: [register]
});

// Export metrics endpoint
app.get('/metrics', async (req, res) => {
  res.set('Content-Type', register.contentType);
  res.end(await register.metrics());
});
```

### Disaster Recovery

**Backup Strategy:**

1. **Database Backups:**
   - Automated daily snapshots with 30-day retention
   - Point-in-time recovery enabled (5-minute RPO)
   - Cross-region replication to secondary region
   - Weekly full backups stored in S3 Glacier
   - Monthly backup testing and restoration drills

2. **File Storage Backups:**
   - S3 versioning enabled on all buckets
   - Cross-region replication to backup region
   - Lifecycle policies for cost optimization
   - Immutable backups for compliance

3. **Application State:**
   - Redis persistence (RDB + AOF)
   - Configuration backups in version control
   - Infrastructure as Code in Git

**Recovery Time Objectives (RTO):**
- Critical services: 1 hour
- Database: 2 hours
- Full platform: 4 hours

**Recovery Point Objectives (RPO):**
- Database: 5 minutes
- File storage: Real-time (replication)
- Application state: 1 minute

---

## Testing Strategy

### 1. Unit Testing

```typescript
// Example: User service tests
import { describe, it, expect, beforeEach } from '@jest/globals';
import { UserService } from '../services/user.service';
import { mockUserRepository } from '../__mocks__/repositories';

describe('UserService', () => {
  let userService: UserService;
  
  beforeEach(() => {
    userService = new UserService(mockUserRepository);
  });
  
  describe('calculateTrustScore', () => {
    it('should calculate base score for new user', () => {
      const user = createMockUser({ completedSales: 0, kycStatus: 'not_started' });
      const score = userService.calculateTrustScore(user);
      expect(score).toBe(5.0);
    });
    
    it('should add 2 points for KYC verification', () => {
      const user = createMockUser({ kycStatus: 'verified' });
      const score = userService.calculateTrustScore(user);
      expect(score).toBeGreaterThanOrEqual(7.0);
    });
    
    it('should cap score at 10.0', () => {
      const user = createMockUser({
        kycStatus: 'verified',
        completedSales: 100,
        completedPurchases: 100,
        twoFactorEnabled: true
      });
      const score = userService.calculateTrustScore(user);
      expect(score).toBe(10.0);
    });
  });
  
  describe('register', () => {
    it('should create user with hashed password', async () => {
      const userData = { email: 'test@example.com', password: 'password123' };
      const user = await userService.register(userData);
      
      expect(user.passwordHash).not.toBe('password123');
      expect(user.email).toBe('test@example.com');
    });
    
    it('should throw error for duplicate email', async () => {
      await expect(
        userService.register({ email: 'existing@example.com', password: 'pass' })
      ).rejects.toThrow('Email already exists');
    });
  });
});
```

### 2. Integration Testing

```typescript
// Example: Transaction flow integration test
import { describe, it, expect, beforeAll, afterAll } from '@jest/globals';
import { testServer } from '../test-utils/server';
import { createTestUser, createTestListing } from '../test-utils/factories';

describe('Transaction Flow', () => {
  let buyer, seller, listing;
  let buyerToken, sellerToken;
  
  beforeAll(async () => {
    await testServer.start();
    buyer = await createTestUser({ role: 'buyer' });
    seller = await createTestUser({ role: 'seller' });
    listing = await createTestListing({ sellerId: seller.id });
    
    buyerToken = await testServer.login(buyer);
    sellerToken = await testServer.login(seller);
  });
  
  afterAll(async () => {
    await testServer.stop();
  });
  
  it('should complete full transaction flow', async () => {
    // Step 1: Buyer creates transaction
    const createResponse = await testServer
      .post('/transactions')
      .auth(buyerToken)
      .send({ listingId: listing.id })
      .expect(201);
    
    const transaction = createResponse.body.data;
    expect(transaction.status).toBe('initiated');
    
    // Step 2: Buyer makes payment
    const paymentResponse = await testServer
      .post(`/transactions/${transaction.id}/payment/confirm`)
      .auth(buyerToken)
      .send({ paymentMethodId: 'pm_test_123' })
      .expect(200);
    
    expect(paymentResponse.body.data.paymentStatus).toBe('authorized');
    expect(paymentResponse.body.data.escrowStatus).toBe('funded');
    
    // Step 3: Transfer process
    const transferResponse = await testServer
      .get(`/transactions/${transaction.id}/transfer/steps`)
      .auth(buyerToken)
      .expect(200);
    
    expect(transferResponse.body.data.steps).toHaveLength(7);
    
    // Step 4: Complete transfer steps
    for (let i = 0; i < 7; i++) {
      await testServer
        .post(`/transactions/${transaction.id}/transfer/steps/${i + 1}/complete`)
        .auth(i < 2 ? sellerToken : buyerToken)
        .attach('proof', `test-files/step-${i + 1}.png`)
        .expect(200);
    }
    
    // Step 5: Verify escrow release
    const finalTransaction = await testServer
      .get(`/transactions/${transaction.id}`)
      .auth(buyerToken)
      .expect(200);
    
    expect(finalTransaction.body.data.status).toBe('completed');
    expect(finalTransaction.body.data.escrowStatus).toBe('released');
    expect(finalTransaction.body.data.paymentStatus).toBe('captured');
  });
});
```

### 3. End-to-End Testing

```typescript
// Playwright E2E test
import { test, expect } from '@playwright/test';

test.describe('Buyer Purchase Flow', () => {
  test('should allow buyer to purchase listing', async ({ page }) => {
    // Login
    await page.goto('https://app.socialvault.com/login');
    await page.fill('input[name="email"]', 'buyer@example.com');
    await page.fill('input[name="password"]', 'password123');
    await page.click('button[type="submit"]');
    
    // Wait for dashboard
    await expect(page).toHaveURL(/.*dashboard/);
    
    // Search for listing
    await page.goto('https://app.socialvault.com/browse');
    await page.fill('input[placeholder="Search accounts"]', 'fitness');
    await page.click('button:has-text("Search")');
    
    // Select listing
    await page.click('.listing-card:first-child');
    await expect(page.locator('h1')).toContainText('Fitness');
    
    // Purchase
    await page.click('button:has-text("Buy Now")');
    await expect(page.locator('.modal-title')).toContainText('Confirm Purchase');
    await page.check('input[name="agreeToTerms"]');
    await page.click('button:has-text("Continue to Payment")');
    
    // Payment (Stripe test mode)
    await page.waitForSelector('iframe[name*="stripe"]');
    const stripeFrame = page.frameLocator('iframe[name*="stripe"]');
    await stripeFrame.fill('input[name="cardNumber"]', '4242424242424242');
    await stripeFrame.fill('input[name="cardExpiry"]', '12/30');
    await stripeFrame.fill('input[name="cardCvc"]', '123');
    await stripeFrame.fill('input[name="billingName"]', 'Test Buyer');
    
    await page.click('button:has-text("Complete Purchase")');
    
    // Verify success
    await expect(page.locator('.success-message')).toBeVisible();
    await expect(page).toHaveURL(/.*transactions\/[a-f0-9-]+/);
  });
});
```

### 4. Performance Testing

```javascript
// k6 load testing script
import http from 'k6/http';
import { check, sleep } from 'k6';
import { Rate } from 'k6/metrics';

export const errorRate = new Rate('errors');

export const options = {
  stages: [
    { duration: '2m', target: 100 },  // Ramp up to 100 users
    { duration: '5m', target: 100 },  // Stay at 100 users
    { duration: '2m', target: 200 },  // Ramp up to 200 users
    { duration: '5m', target: 200 },  // Stay at 200 users
    { duration: '2m', target: 0 },    // Ramp down
  ],
  thresholds: {
    http_req_duration: ['p(95)<500', 'p(99)<1000'],
    http_req_failed: ['rate<0.01'],
    errors: ['rate<0.1'],
  },
};

const BASE_URL = 'https://api.socialvault.com/v1';

export default function () {
  // List listings
  let response = http.get(`${BASE_URL}/listings?limit=20`);
  check(response, {
    'listing list status 200': (r) => r.status === 200,
    'listing list duration < 500ms': (r) => r.timings.duration < 500,
  }) || errorRate.add(1);
  
  sleep(1);
  
  // View listing details
  const listingId = JSON.parse(response.body).data[0].id;
  response = http.get(`${BASE_URL}/listings/${listingId}`);
  check(response, {
    'listing detail status 200': (r) => r.status === 200,
    'listing detail duration < 300ms': (r) => r.timings.duration < 300,
  }) || errorRate.add(1);
  
  sleep(2);
}
```

### 5. Security Testing

```bash
#!/bin/bash
# security-scan.sh

echo "Running security scans..."

# OWASP ZAP security scan
docker run -t owasp/zap2docker-stable zap-baseline.py \
  -t https://api.socialvault.com \
  -r zap-report.html

# Dependency vulnerability scan
npm audit --audit-level=moderate

# Secrets scanning
gitleaks detect --source . --verbose

# Container scanning
trivy image socialvault/api:latest

# SQL injection testing
sqlmap -u "https://api.socialvault.com/v1/listings?search=test" \
  --batch --random-agent

echo "Security scans complete"
```

---

## Legal & Compliance

### Terms of Service

**Key Sections:**

1. **Account Sales Prohibition Acknowledgment**
   - Users acknowledge that selling social media accounts may violate platform TOS
   - SocialVault is not liable for account bans or suspensions
   - Users assume all risks

2. **Buyer Protection**
   - 3-day inspection period after transfer
   - Right to dispute if account not as described
   - Refund policy for fraudulent listings

3. **Seller Obligations**
   - Must own the account being sold
   - Must provide accurate metrics
   - Must assist with transfer process
   - Liable for misrepresentation

4. **Platform Fees**
   - 5% transaction fee (min $10, max $500)
   - Payment processing fees
   - Optional feature fees

5. **Dispute Resolution**
   - 30-day window to file disputes
   - Mediation by platform
   - Binding arbitration clause
   - Class action waiver

6. **Intellectual Property**
   - Sellers guarantee they have rights to transfer accounts
   - No trademark infringement
   - No impersonation

### Privacy Policy

**Data Collection:**
- Personal information (name, email, phone)
- Identity verification documents (KYC)
- Transaction history
- Communication logs
- Device information
- Usage analytics

**Data Usage:**
- Account management
- Transaction processing
- Fraud prevention
- Customer support
- Legal compliance
- Marketing (with consent)

**Data Sharing:**
- Payment processors (Stripe, PayPal)
- KYC providers (Jumio)
- Cloud services (AWS)
- Analytics tools (Datadog)
- Law enforcement (when required)

**User Rights:**
- Access personal data
- Correct inaccurate data
- Delete account (GDPR right to be forgotten)
- Export data
- Opt-out of marketing

### GDPR Compliance

```typescript
// Data deletion implementation
async function deleteUserData(userId: string) {
  // Pseudonymize instead of hard delete for legal/audit purposes
  await prisma.$transaction([
    // Anonymize user
    prisma.user.update({
      where: { id: userId },
      data: {
        email: `deleted_${userId}@deleted.com`,
        username: `deleted_${userId}`,
        firstName: 'DELETED',
        lastName: 'DELETED',
        phoneNumber: null,
        profilePhotoUrl: null,
        bio: null,
        kycReferenceId: null,
        deletedAt: new Date()
      }
    }),
    
    // Delete personal messages (keep transaction-related)
    prisma.message.updateMany({
      where: { 
        senderId: userId,
        transactionId: null
      },
      data: { 
        content: '[DELETED]',
        encryptedContent: null,
        isDeletedBySender: true
      }
    }),
    
    // Remove payment methods
    prisma.paymentMethod.deleteMany({
      where: { userId }
    }),
    
    // Keep transaction records for legal compliance (7 years)
    // But anonymize personal details
    prisma.transaction.updateMany({
      where: { 
        OR: [
          { buyerId: userId },
          { sellerId: userId }
        ]
      },
      data: {
        buyerNotes: '[DELETED]',
        sellerNotes: '[DELETED]'
      }
    })
  ]);
  
  // Log deletion for audit
  await auditLog.create({
    action: 'user.data_deleted',
    userId,
    timestamp: new Date(),
    reason: 'GDPR request'
  });
}

// Data export implementation
async function exportUserData(userId: string): Promise<Buffer> {
  const [user, listings, transactions, messages, reviews] = await Promise.all([
    prisma.user.findUnique({ where: { id: userId } }),
    prisma.listing.findMany({ where: { sellerId: userId } }),
    prisma.transaction.findMany({ 
      where: { 
        OR: [{ buyerId: userId }, { sellerId: userId }]
      }
    }),
    prisma.message.findMany({
      where: {
        OR: [{ senderId: userId }, { recipientId: userId }]
      }
    }),
    prisma.review.findMany({
      where: {
        OR: [{ reviewerId: userId }, { revieweeId: userId }]
      }
    })
  ]);
  
  const exportData = {
    user,
    listings,
    transactions,
    messages,
    reviews,
    exportedAt: new Date().toISOString(),
    dataRetentionPolicy: '7 years for financial records, immediate deletion available for other data'
  };
  
  // Generate PDF or JSON
  return generatePDF(exportData);
}
```

### AML/KYC Compliance

```typescript
// Anti-Money Laundering checks
interface AMLCheck {
  userId: string;
  checkType: 'transaction' | 'withdrawal';
  amount: number;
  riskScore: number;
  flags: string[];
  requiresReview: boolean;
}

async function performAMLCheck(transaction: Transaction): Promise<AMLCheck> {
  const flags: string[] = [];
  let riskScore = 0;
  
  // Check 1: High-value transaction
  if (transaction.amount > 10000) {
    riskScore += 30;
    flags.push('high_value_transaction');
  }
  
  // Check 2: Unusual pattern
  const recentTransactions = await getRecentTransactions(transaction.userId);
  if (recentTransactions.length > 5 && recentTransactions.every(t => t.amount > 5000)) {
    riskScore += 40;
    flags.push('unusual_pattern');
  }
  
  // Check 3: New account
  const user = await getUser(transaction.userId);
  const accountAgeMonths = getAccountAgeMonths(user.createdAt);
  if (accountAgeMonths < 1) {
    riskScore += 20;
    flags.push('new_account');
  }
  
  // Check 4: Unverified KYC
  if (user.kycStatus !== 'verified') {
    riskScore += 50;
    flags.push('unverified_kyc');
  }
  
  // Check 5: Geographic risk
  if (isHighRiskCountry(user.countryCode)) {
    riskScore += 30;
    flags.push('high_risk_geography');
  }
  
  const requiresReview = riskScore > 70;
  
  // Log AML check
  await createAMLLog({
    userId: transaction.userId,
    transactionId: transaction.id,
    riskScore,
    flags,
    requiresReview
  });
  
  // Hold transaction if high risk
  if (requiresReview) {
    await holdTransaction(transaction.id, 'aml_review');
    await notifyComplianceTeam(transaction.id);
  }
  
  return {
    userId: transaction.userId,
    checkType: 'transaction',
    amount: transaction.amount,
    riskScore,
    flags,
    requiresReview
  };
}
```

---

## Launch Roadmap

### Phase 1: MVP (Months 1-4)

**Month 1-2: Foundation**
- [ ] Set up development infrastructure
- [ ] Database schema implementation
- [ ] Core API endpoints (auth, users, listings)
- [ ] Basic frontend (Next.js setup, component library)
- [ ] Payment integration (Stripe test mode)

**Month 3: Core Features**
- [ ] Listing creation and management
- [ ] Search and filtering
- [ ] Offer system
- [ ] Messaging system
- [ ] Basic escrow implementation

**Month 4: Launch Prep**
- [ ] KYC integration (Jumio)
- [ ] Transfer workflow implementation
- [ ] Admin dashboard
- [ ] Security hardening
- [ ] Beta testing with 50 users

**MVP Features:**
- User registration and authentication
- Instagram and YouTube listings only
- Basic verification (screenshot-based)
- Escrow system
- Messaging
- Simple transfer process

### Phase 2: Growth (Months 5-8)

**Month 5: Platform Expansion**
- [ ] Add TikTok and Twitter support
- [ ] Advanced fraud detection (AI-powered)
- [ ] Automated metrics collection
- [ ] Mobile app (iOS and Android)
- [ ] Referral program

**Month 6: Trust & Safety**
- [ ] Enhanced verification system
- [ ] Dispute resolution process
- [ ] Review and rating system
- [ ] Trust score algorithm
- [ ] Insurance for high-value transactions

**Month 7: Optimization**
- [ ] Performance optimization
- [ ] Advanced search filters
- [ ] Recommendation engine
- [ ] Analytics dashboard for users
- [ ] API for third-party integrations

**Month 8: Marketing Push**
- [ ] SEO optimization
- [ ] Content marketing
- [ ] Partnership with agencies
- [ ] Influencer outreach
- [ ] Paid advertising campaigns

### Phase 3: Scale (Months 9-12)

**Month 9-10: Enterprise Features**
- [ ] Bulk account purchases
- [ ] White-label solution for agencies
- [ ] Advanced analytics
- [ ] Custom verification services
- [ ] Dedicated account managers

**Month 11: International Expansion**
- [ ] Multi-currency support
- [ ] Localization (10+ languages)
- [ ] Region-specific payment methods
- [ ] International KYC providers
- [ ] Local support teams

**Month 12: Innovation**
- [ ] Blockchain-based transaction records
- [ ] NFT certificates of ownership
- [ ] AI-powered pricing recommendations
- [ ] Account valuation tool
- [ ] Marketplace API

### Success Metrics

**Month 1-4 (MVP):**
- 500 registered users
- 100 active listings
- 20 completed transactions
- $50K GMV

**Month 5-8 (Growth):**
- 5,000 registered users
- 1,000 active listings
- 200 completed transactions
- $500K GMV

**Month 9-12 (Scale):**
- 20,000 registered users
- 5,000 active listings
- 1,000 completed transactions
- $2M GMV

---

## Maintenance & Scaling

### Scaling Strategy

**Vertical Scaling:**
- Database: Start with db.t3.large, scale to db.r6g.xlarge
- Application: ECS tasks with 2GB RAM, scale to 8GB
- Redis: cache.t3.medium to cache.r6g.large

**Horizontal Scaling:**
- Auto-scaling groups for ECS tasks
- Read replicas for PostgreSQL (1-3 replicas)
- Redis cluster mode (3-6 nodes)
- CDN for static assets

**Database Sharding:**
```typescript
// Shard by user ID for horizontal scaling
function getUserShard(userId: string): string {
  const hash = murmurhash(userId);
  const shardNumber = hash % NUMBER_OF_SHARDS;
  return `shard_${shardNumber}`;
}

// Connection routing
function getDbConnection(userId: string): PrismaClient {
  const shard = getUserShard(userId);
  return shardConnections[shard];
}
```

**Caching Strategy:**
```typescript
// Multi-layer caching
class CacheManager {
  private l1Cache: Map<string, any>; // In-memory
  private l2Cache: Redis; // Redis
  private l3Cache: Database; // Database
  
  async get(key: string): Promise<any> {
    // L1: Check in-memory cache
    if (this.l1Cache.has(key)) {
      return this.l1Cache.get(key);
    }
    
    // L2: Check Redis
    const redisValue = await this.l2Cache.get(key);
    if (redisValue) {
      this.l1Cache.set(key, redisValue);
      return redisValue;
    }
    
    // L3: Fetch from database
    const dbValue = await this.l3Cache.get(key);
    if (dbValue) {
      await this.l2Cache.set(key, dbValue, 'EX', 3600);
      this.l1Cache.set(key, dbValue);
    }
    
    return dbValue;
  }
}
```

### Performance Optimization

**Database Query Optimization:**
```sql
-- Create indexes for common queries
CREATE INDEX CONCURRENTLY idx_listings_platform_status_price 
ON listings(platform, listing_status, price);

CREATE INDEX CONCURRENTLY idx_listings_created_at_desc 
ON listings(created_at DESC);

CREATE INDEX CONCURRENTLY idx_transactions_buyer_status 
ON transactions(buyer_id, transaction_status);

-- Materialized view for analytics
CREATE MATERIALIZED VIEW listing_stats AS
SELECT 
  platform,
  niche,
  COUNT(*) as total_listings,
  AVG(price) as avg_price,
  AVG(followers_count) as avg_followers,
  AVG(engagement_rate) as avg_engagement
FROM listings
WHERE listing_status = 'active'
GROUP BY platform, niche;

-- Refresh materialized view hourly
CREATE OR REPLACE FUNCTION refresh_listing_stats()
RETURNS void AS $
BEGIN
  REFRESH MATERIALIZED VIEW CONCURRENTLY listing_stats;
END;
$ LANGUAGE plpgsql;
```

**API Response Time Targets:**
- Authentication: < 200ms (p95)
- Listing search: < 500ms (p95)
- Listing details: < 300ms (p95)
- Transaction creation: < 1s (p95)
- Message send: < 200ms (p95)

### Monitoring Dashboards

**SRE Dashboard:**
- Request rate (req/s)
- Error rate (%)
- Response time (p50, p95, p99)
- Database connections
- Cache hit rate
- Queue depth

**Business Dashboard:**
- Active users (DAU, MAU)
- New registrations
- Active listings
- Transaction volume
- Revenue (daily, monthly)
- Conversion funnel

**Security Dashboard:**
- Failed login attempts
- Suspicious transactions
- Fraud detection alerts
- KYC verification rate
- Dispute rate

### Incident Response

**On-Call Rotation:**
- 24/7 coverage
- Primary and secondary on-call
- 15-minute SLA for P0 incidents
- 1-hour SLA for P1 incidents

**Incident Severity:**
- **P0 (Critical):** Platform down, payment processing broken, data breach
- **P1 (High):** Major feature broken, significant performance degradation
- **P2 (Medium):** Minor feature broken, moderate performance issues
- **P3 (Low):** UI issues, non-critical bugs

**Runbooks:**
- Database connection pool exhausted
- High memory usage
- Payment processor down
- Cache invalidation
- CDN issues
- DDoS attack mitigation

---

## Cost Estimation

### Infrastructure Costs (Monthly)

**AWS Services:**
- ECS (10 tasks): $150
- RDS PostgreSQL (db.t3.large): $180
- ElastiCache Redis (3 nodes): $120
- S3 Storage (500GB): $12
- CloudFront (1TB transfer): $85
- Load Balancer: $20
- Route 53: $5
- **Subtotal: $572/month**

**Third-Party Services:**
- Stripe (payment processing): 2.9% + $0.30 per transaction
- Jumio (KYC): $3-5 per verification
- SendGrid (email): $20/month
- Twilio (SMS): $50/month
- Datadog (monitoring): $150/month
- Sentry (error tracking): $30/month
- **Subtotal: ~$250/month + variable costs**

**Total Infrastructure: ~$800-1000/month** (scales with usage)

### Operational Costs (Monthly)

- Customer support (2 FTE): $12,000
- Development team (4 FTE): $40,000
- Legal/compliance: $5,000
- Marketing: $10,000
- **Total: ~$67,000/month**

### Revenue Projections

**Year 1:**
- Target GMV: $2M
- Platform fee (5%): $100K
- Break-even: Month 8-10

**Year 2:**
- Target GMV: $10M
- Platform fee (5%): $500K
- Profit margin: 40-50%

---

## Conclusion

AccountBazaar represents a comprehensive solution for the social media account marketplace. This implementation document provides a detailed roadmap for building a secure, scalable, and legally compliant platform.

**Key Success Factors:**
1. **Trust & Safety**: Robust verification and fraud detection
2. **User Experience**: Smooth onboarding and transfer process
3. **Legal Compliance**: Clear terms and proper KYC/AML
4. **Technical Excellence**: Scalable architecture and security
5. **Customer Support**: Dedicated team for transfer assistance

**Next Steps:**
1. Assemble core team (CTO, Lead Developer, Product Manager)
2. Secure initial funding ($500K-1M for MVP)
3. Set up development environment
4. Begin Phase 1 development
5. Beta launch with selected users

**Branding Assets Needed:**
- Logo design (bazaar-inspired marketplace icon)
- Color palette finalization (deep purple & gold recommended)
- Website design mockups
- Marketing materials
- Social media presence (@accountbazaar across platforms)

**Domain Strategy:**
- Primary: accountbazaar.com
- Alternatives: accountbazaar.io, accountbazaar.co
- Social handles: @accountbazaar (Instagram, Twitter, LinkedIn, TikTok)

**Contact:** 
For questions or clarifications about this implementation document, please reach out to the technical team.

---

*Document Version: 1.0*  
*Last Updated: January 4, 2026*  
*Prepared by: AccountBazaar Technical Team*