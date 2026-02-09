import { PrismaClient } from '@prisma/client';
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
    await prisma.auditLog.deleteMany();
    await prisma.user.deleteMany();
  }

  // Create admin user
  const admin = await prisma.user.create({
    data: {
      clerkId: 'clerk_admin_seed',
      email: 'admin@socialswapr.com',
      username: 'admin',
      role: 'admin',
      firstName: 'Admin',
      lastName: 'User',
      kycStatus: 'verified',
      trustScore: 10,
    },
  });
  console.log('✅ Created admin user');

  // Create test seller
  const seller = await prisma.user.create({
    data: {
      clerkId: 'clerk_seller_seed',
      email: 'seller@example.com',
      username: 'testseller',
      role: 'seller',
      firstName: 'Test',
      lastName: 'Seller',
      bio: 'Experienced social media account seller with 5+ years in the industry.',
      kycStatus: 'verified',
      trustScore: 8.5,
    },
  });
  console.log('✅ Created test seller');

  // Create test buyer
  const buyer = await prisma.user.create({
    data: {
      clerkId: 'clerk_buyer_seed',
      email: 'buyer@example.com',
      username: 'testbuyer',
      role: 'buyer',
      firstName: 'Test',
      lastName: 'Buyer',
      kycStatus: 'verified',
      trustScore: 7.0,
    },
  });
  console.log('✅ Created test buyer');

  // Create sample listings (Instagram + YouTube only, INR currency)
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
- Strong India and US audience
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
          topCountries: { India: 40, US: 25, UK: 10, Canada: 8, Other: 17 },
        },
        isMonetized: true,
        monthlyRevenue: 200000,
        price: 1250000,
        currency: 'INR',
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
- Monthly AdSense revenue: ₹3,00,000-₹3,75,000
- Strong affiliate relationships
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
          topCountries: { India: 45, US: 20, UK: 10, Canada: 8, Other: 17 },
        },
        isMonetized: true,
        monthlyRevenue: 350000,
        price: 7000000,
        currency: 'INR',
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
          topCountries: { India: 35, US: 20, UK: 12, Germany: 8, Other: 25 },
        },
        isMonetized: true,
        monthlyRevenue: 100000,
        price: 700000,
        currency: 'INR',
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
  console.log('\nTest accounts (use Clerk auth):');
  console.log('  Admin: admin@socialswapr.com');
  console.log('  Seller: seller@example.com');
  console.log('  Buyer: buyer@example.com');
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
