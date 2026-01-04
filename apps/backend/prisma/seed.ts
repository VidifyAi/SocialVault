import { PrismaClient, UserRole, Platform, ListingStatus } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seed...');

  // Clear existing data (in development only)
  if (process.env.NODE_ENV !== 'production') {
    console.log('Clearing existing data...');
    await prisma.message.deleteMany();
    await prisma.conversationParticipant.deleteMany();
    await prisma.conversation.deleteMany();
    await prisma.review.deleteMany();
    await prisma.dispute.deleteMany();
    await prisma.offer.deleteMany();
    await prisma.transaction.deleteMany();
    await prisma.favorite.deleteMany();
    await prisma.listing.deleteMany();
    await prisma.notification.deleteMany();
    await prisma.refreshToken.deleteMany();
    await prisma.auditLog.deleteMany();
    await prisma.user.deleteMany();
  }

  // Create admin user
  const adminPassword = await bcrypt.hash('Admin123!', 12);
  const admin = await prisma.user.create({
    data: {
      email: 'admin@socialswapr.com',
      username: 'admin',
      passwordHash: adminPassword,
      role: 'admin',
      firstName: 'Admin',
      lastName: 'User',
      emailVerified: true,
      kycStatus: 'verified',
      trustScore: 10,
    },
  });
  console.log('✅ Created admin user');

  // Create test seller
  const sellerPassword = await bcrypt.hash('Seller123!', 12);
  const seller = await prisma.user.create({
    data: {
      email: 'seller@example.com',
      username: 'testseller',
      passwordHash: sellerPassword,
      role: 'seller',
      firstName: 'Test',
      lastName: 'Seller',
      bio: 'Experienced social media account seller with 5+ years in the industry.',
      emailVerified: true,
      kycStatus: 'verified',
      trustScore: 8.5,
    },
  });
  console.log('✅ Created test seller');

  // Create test buyer
  const buyerPassword = await bcrypt.hash('Buyer123!', 12);
  const buyer = await prisma.user.create({
    data: {
      email: 'buyer@example.com',
      username: 'testbuyer',
      passwordHash: buyerPassword,
      role: 'buyer',
      firstName: 'Test',
      lastName: 'Buyer',
      emailVerified: true,
      kycStatus: 'verified',
      trustScore: 7.0,
    },
  });
  console.log('✅ Created test buyer');

  // Create sample listings
  const listings = await Promise.all([
    prisma.listing.create({
      data: {
        sellerId: seller.id,
        platform: 'instagram',
        username: 'fitness_lifestyle_daily',
        displayName: 'Fitness Lifestyle Daily',
        status: 'active',
        verificationStatus: 'verified',
        accountType: 'creator',
        niche: 'Fitness & Health',
        description: `Premium fitness and health Instagram account with highly engaged audience. 
        
This account has been carefully grown over 3 years with authentic followers interested in fitness, nutrition, and wellness content.

Key highlights:
- Consistent 4%+ engagement rate
- 65% female audience aged 25-34
- Strong US and UK audience
- Perfect for fitness brands, supplements, or personal trainers
- All content is original and can be included in sale

The account has never been penalized and has a clean history. Ready for immediate transfer.`,
        metrics: {
          followers: 152430,
          following: 892,
          posts: 1847,
          engagementRate: 4.2,
          averageLikes: 5200,
          averageComments: 180,
        },
        demographics: {
          ageGroups: { '18-24': 20, '25-34': 45, '35-44': 25, '45+': 10 },
          genderSplit: { female: 65, male: 35 },
          topCountries: { US: 45, UK: 15, Canada: 10, Australia: 8, Other: 22 },
        },
        isMonetized: true,
        monthlyRevenue: 2500,
        price: 15000,
        currency: 'USD',
        negotiable: true,
        includesEmail: true,
        includesOriginalEmail: false,
        accountAge: 36,
        screenshots: [
          'https://picsum.photos/seed/ig1/800/600',
          'https://picsum.photos/seed/ig2/800/600',
          'https://picsum.photos/seed/ig3/800/600',
        ],
        views: 1250,
        favoritesCount: 45,
      },
    }),
    prisma.listing.create({
      data: {
        sellerId: seller.id,
        platform: 'youtube',
        username: 'TechReviewsPro',
        displayName: 'Tech Reviews Pro',
        status: 'active',
        verificationStatus: 'verified',
        accountType: 'creator',
        niche: 'Technology',
        description: `Established tech review YouTube channel with monetization enabled and strong subscriber base.

This channel focuses on consumer electronics, smartphones, and gadget reviews. The audience is highly engaged and trusts the channel's honest reviews.

Highlights:
- YouTube Partner Program enabled
- Monthly AdSense revenue: $3,500-4,500
- Strong affiliate relationships with Amazon and Best Buy
- Over 500 videos in the library
- Professional intro/outro and branding included

The channel has excellent standing with YouTube and has never received strikes.`,
        metrics: {
          subscribers: 485000,
          views: 125000000,
          engagementRate: 5.8,
          averageViews: 45000,
          averageLikes: 2800,
          averageComments: 320,
        },
        demographics: {
          ageGroups: { '18-24': 30, '25-34': 40, '35-44': 20, '45+': 10 },
          genderSplit: { male: 78, female: 22 },
          topCountries: { US: 55, UK: 12, India: 10, Canada: 8, Other: 15 },
        },
        isMonetized: true,
        monthlyRevenue: 4000,
        price: 85000,
        currency: 'USD',
        negotiable: true,
        includesEmail: true,
        includesOriginalEmail: true,
        accountAge: 48,
        screenshots: [
          'https://picsum.photos/seed/yt1/800/600',
          'https://picsum.photos/seed/yt2/800/600',
          'https://picsum.photos/seed/yt3/800/600',
        ],
        views: 3200,
        favoritesCount: 128,
      },
    }),
    prisma.listing.create({
      data: {
        sellerId: seller.id,
        platform: 'tiktok',
        username: 'comedy_central_vibes',
        displayName: 'Comedy Central Vibes',
        status: 'active',
        verificationStatus: 'verified',
        accountType: 'creator',
        niche: 'Entertainment & Comedy',
        description: `Viral comedy TikTok account with massive reach and engagement. Multiple videos have hit 1M+ views.

This account specializes in relatable comedy content and skits. The audience is highly engaged and the account regularly lands on the For You Page.

What's included:
- TikTok Creator Fund enrollment
- Brand partnership history
- All original content
- Growth strategies and content calendar

The account is in perfect standing with no violations.`,
        metrics: {
          followers: 892000,
          following: 245,
          posts: 423,
          views: 89000000,
          engagementRate: 8.5,
          averageLikes: 45000,
          averageComments: 890,
          averageViews: 210000,
        },
        demographics: {
          ageGroups: { '13-17': 15, '18-24': 50, '25-34': 25, '35+': 10 },
          genderSplit: { female: 55, male: 45 },
          topCountries: { US: 60, UK: 12, Australia: 8, Canada: 7, Other: 13 },
        },
        isMonetized: true,
        monthlyRevenue: 3500,
        price: 45000,
        currency: 'USD',
        negotiable: true,
        includesEmail: true,
        includesOriginalEmail: true,
        accountAge: 24,
        screenshots: [
          'https://picsum.photos/seed/tt1/800/600',
          'https://picsum.photos/seed/tt2/800/600',
          'https://picsum.photos/seed/tt3/800/600',
        ],
        views: 2100,
        favoritesCount: 89,
      },
    }),
    prisma.listing.create({
      data: {
        sellerId: seller.id,
        platform: 'twitter',
        username: 'CryptoNewsDaily',
        displayName: 'Crypto News Daily',
        status: 'active',
        verificationStatus: 'verified',
        accountType: 'business',
        niche: 'Cryptocurrency & Finance',
        description: `Established cryptocurrency news and analysis Twitter account with strong following in the crypto community.

This account is known for breaking news, market analysis, and educational content about blockchain and cryptocurrencies.

Features:
- Twitter Blue verified
- Strong engagement from crypto community
- History of successful sponsored posts
- Connections with major crypto projects
- Clean account history

Perfect for crypto projects, exchanges, or financial influencers.`,
        metrics: {
          followers: 125000,
          following: 1200,
          posts: 28500,
          engagementRate: 3.8,
          averageLikes: 450,
          averageComments: 85,
        },
        demographics: {
          ageGroups: { '18-24': 25, '25-34': 45, '35-44': 20, '45+': 10 },
          genderSplit: { male: 82, female: 18 },
          topCountries: { US: 40, UK: 10, Singapore: 8, UAE: 7, Other: 35 },
        },
        isMonetized: false,
        price: 22000,
        currency: 'USD',
        negotiable: true,
        includesEmail: true,
        includesOriginalEmail: false,
        accountAge: 60,
        screenshots: [
          'https://picsum.photos/seed/tw1/800/600',
          'https://picsum.photos/seed/tw2/800/600',
        ],
        views: 890,
        favoritesCount: 34,
      },
    }),
    prisma.listing.create({
      data: {
        sellerId: seller.id,
        platform: 'instagram',
        username: 'travel_adventures_world',
        displayName: 'Travel Adventures World',
        status: 'active',
        verificationStatus: 'pending',
        accountType: 'creator',
        niche: 'Travel',
        description: `Beautiful travel photography Instagram account featuring destinations from around the world.

This account showcases stunning travel photography and has partnerships with hotels and tourism boards.

Includes:
- Library of original high-quality photos
- Active brand partnerships
- Engaged travel enthusiast audience
- Content calendar and posting schedule

The account is perfect for travel agencies, hotels, or travel content creators.`,
        metrics: {
          followers: 78500,
          following: 450,
          posts: 892,
          engagementRate: 5.1,
          averageLikes: 3200,
          averageComments: 95,
        },
        demographics: {
          ageGroups: { '18-24': 20, '25-34': 45, '35-44': 25, '45+': 10 },
          genderSplit: { female: 58, male: 42 },
          topCountries: { US: 35, UK: 15, Germany: 10, France: 8, Other: 32 },
        },
        isMonetized: true,
        monthlyRevenue: 1200,
        price: 8500,
        currency: 'USD',
        negotiable: true,
        includesEmail: true,
        includesOriginalEmail: true,
        accountAge: 42,
        screenshots: [
          'https://picsum.photos/seed/tr1/800/600',
          'https://picsum.photos/seed/tr2/800/600',
          'https://picsum.photos/seed/tr3/800/600',
        ],
        views: 560,
        favoritesCount: 22,
      },
    }),
  ]);
  console.log(`✅ Created ${listings.length} sample listings`);

  // Add some favorites
  await prisma.favorite.create({
    data: {
      userId: buyer.id,
      listingId: listings[0].id,
    },
  });
  console.log('✅ Added sample favorites');

  console.log('\n🎉 Database seeding completed!');
  console.log('\nTest accounts:');
  console.log('  Admin: admin@socialswapr.com / Admin123!');
  console.log('  Seller: seller@example.com / Seller123!');
  console.log('  Buyer: buyer@example.com / Buyer123!');
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
