/* eslint-disable @typescript-eslint/no-unused-vars */
import { PrismaClient, Role, ProductStatus, VerificationStatus } from '../src/generated/prisma';
import { seedCategories } from './seed-categories';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // Clean up existing data (order matters for foreign key constraints)
  await prisma.collectionProduct.deleteMany();
  await prisma.collection.deleteMany();
  await prisma.favorite.deleteMany();
  await prisma.review.deleteMany();
  await prisma.sellerReview.deleteMany();
  await prisma.analyticsEvent.deleteMany();
  await prisma.payment.deleteMany();
  await prisma.donation.deleteMany();
  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.shopSectionProduct.deleteMany();
  await prisma.shopSection.deleteMany();
  await prisma.sustainabilityScore.deleteMany();
  await prisma.productImage.deleteMany();
  await prisma.productVariant.deleteMany();
  await prisma.product.deleteMany();
  await prisma.certification.deleteMany();
  await prisma.promotion.deleteMany();
  await prisma.shippingProfile.deleteMany();
  await prisma.seller1099Data.deleteMany();
  await prisma.sellerBalance.deleteMany();
  await prisma.sellerConnectedAccount.deleteMany();
  await prisma.sellerPayout.deleteMany();
  await prisma.shopEcoProfile.deleteMany();
  await prisma.shop.deleteMany();
  await prisma.nonprofit.deleteMany();
  await prisma.category.deleteMany();
  await prisma.address.deleteMany();
  await prisma.sellerApplication.deleteMany();
  await prisma.message.deleteMany();
  await prisma.conversation.deleteMany();
  await prisma.notificationPreference.deleteMany();
  await prisma.searchHistory.deleteMany();
  await prisma.supportTicket.deleteMany();
  await prisma.user.deleteMany();

  console.log('🗑️  Cleaned up existing data');

  // Create comprehensive category hierarchy
  await seedCategories();

  // Fetch specific categories for product assignments
  const categories = await Promise.all([
    prisma.category.findUnique({ where: { slug: 'candles-fragrance' } }), // [0] - Home & Living > Candles
    prisma.category.findUnique({ where: { slug: 'dinnerware' } }), // [1] - Kitchen & Dining > Dinnerware
    prisma.category.findUnique({ where: { slug: 'personal-care-beauty' } }), // [2] - Personal Care (top-level)
    prisma.category.findUnique({ where: { slug: 'bags-purses' } }), // [3] - Fashion > Bags & Purses
    prisma.category.findUnique({ where: { slug: 'coffee-tea' } }), // [4] - Food & Beverages > Coffee & Tea
  ]);

  // Ensure all categories were found
  if (categories.some((cat) => !cat)) {
    throw new Error('Failed to find required categories for product seeding');
  }

  // Create nonprofits
  const nonprofits = await Promise.all([
    prisma.nonprofit.create({
      data: {
        name: 'Ocean Conservancy',
        ein: '23-7245152',
        mission:
          "Ocean Conservancy works to protect the ocean from today's greatest global challenges.",
        website: 'https://oceanconservancy.org',
        logo: 'https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=200',
        isVerified: true,
      },
    }),
    prisma.nonprofit.create({
      data: {
        name: 'Rainforest Alliance',
        ein: '13-3377893',
        mission: 'Creating a more sustainable world by using social and market forces.',
        website: 'https://www.rainforest-alliance.org',
        logo: 'https://images.unsplash.com/photo-1516026672322-bc52d61a55d5?w=200',
        isVerified: true,
      },
    }),
    prisma.nonprofit.create({
      data: {
        name: 'Fair Trade Federation',
        ein: '52-2106638',
        mission: 'Strengthening and promoting organizations fully committed to Fair Trade.',
        website: 'https://www.fairtradefederation.org',
        logo: 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=200',
        isVerified: true,
      },
    }),
    prisma.nonprofit.create({
      data: {
        name: 'The Nature Conservancy',
        ein: '53-0242652',
        mission: 'Conserving the lands and waters on which all life depends.',
        website: 'https://www.nature.org',
        logo: 'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?w=200',
        isVerified: true,
      },
    }),
  ]);

  console.log(`✅ Created ${nonprofits.length} nonprofits`);

  // Create users
  const adminUser = await prisma.user.create({
    data: {
      email: 'admin@evercraft.com',
      name: 'Admin User',
      role: Role.ADMIN,
    },
  });

  const buyer1 = await prisma.user.create({
    data: {
      email: 'sarah@example.com',
      name: 'Sarah Green',
      role: Role.BUYER,
      addresses: {
        create: {
          type: 'shipping',
          firstName: 'Sarah',
          lastName: 'Green',
          address1: '123 Eco Street',
          city: 'Portland',
          state: 'OR',
          postalCode: '97201',
          country: 'US',
          isDefault: true,
        },
      },
    },
  });

  const seller1 = await prisma.user.create({
    data: {
      email: 'alex@ecomaker.com',
      name: 'Alex Martinez',
      role: Role.SELLER,
    },
  });

  const seller2 = await prisma.user.create({
    data: {
      email: 'maya@greenliving.com',
      name: 'Maya Patel',
      role: Role.SELLER,
    },
  });

  const seller3 = await prisma.user.create({
    data: {
      email: 'james@ethicalgrounds.com',
      name: 'James Chen',
      role: Role.SELLER,
    },
  });

  console.log('✅ Created 5 users');

  // Create shops with ShopEcoProfile
  const shop1 = await prisma.shop.create({
    data: {
      name: 'EcoMaker Studio',
      slug: 'ecomaker-studio',
      bio: "Handcrafted sustainable goods made with organic materials. We believe in creating beautiful products that don't harm the planet.",
      userId: seller1.id,
      nonprofitId: nonprofits[0].id,
      donationPercentage: 5.0,
      verificationStatus: VerificationStatus.APPROVED,
      isVerified: true,
      logo: 'https://images.unsplash.com/photo-1556912173-46c336c7fd55?w=400',
      shippingProfiles: {
        create: {
          name: 'Standard Shipping',
          processingTimeMin: 1,
          processingTimeMax: 3,
          shippingOrigin: {
            address1: '123 Maker St',
            city: 'Portland',
            state: 'OR',
            postalCode: '97201',
            country: 'US',
          },
          shippingRates: [
            { region: 'domestic', method: 'standard', rate: 5.99, estimatedDays: 5 },
            { region: 'international', method: 'standard', rate: 15.99, estimatedDays: 14 },
          ],
          carbonNeutralPrice: 2.0,
        },
      },
      ecoProfile: {
        create: {
          // Tier 1: Basic toggles (8/10 = 56% from tier 1)
          plasticFreePackaging: true,
          recycledPackaging: true,
          biodegradablePackaging: false,
          organicMaterials: true,
          recycledMaterials: true,
          fairTradeSourcing: true,
          localSourcing: true,
          carbonNeutralShipping: true,
          renewableEnergy: false,
          carbonOffset: true,
          // Tier 2: Optional details (3/7 fields = ~13% from tier 2)
          renewableEnergyPercent: 50,
          waterConservation: true,
          fairWageCertified: true,
          // Total: ~69% completeness = Verified tier
          completenessPercent: 69,
          tier: 'verified',
        },
      },
    },
  });

  const shop2 = await prisma.shop.create({
    data: {
      name: 'Green Living Co',
      slug: 'green-living-co',
      bio: 'Zero-waste products for modern sustainable living.',
      userId: seller2.id,
      nonprofitId: nonprofits[1].id,
      donationPercentage: 3.0,
      verificationStatus: VerificationStatus.APPROVED,
      isVerified: true,
      logo: 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=400',
      shippingProfiles: {
        create: {
          name: 'Eco Shipping',
          processingTimeMin: 2,
          processingTimeMax: 5,
          shippingOrigin: {
            address1: '456 Green Ave',
            city: 'Seattle',
            state: 'WA',
            postalCode: '98101',
            country: 'US',
          },
          shippingRates: [
            { region: 'domestic', method: 'standard', rate: 4.99, estimatedDays: 7 },
            { region: 'international', method: 'standard', rate: 12.99, estimatedDays: 12 },
          ],
          carbonNeutralPrice: 1.5,
        },
      },
      ecoProfile: {
        create: {
          // Tier 1: Basic toggles (10/10 = 70% from tier 1)
          plasticFreePackaging: true,
          recycledPackaging: true,
          biodegradablePackaging: true,
          organicMaterials: true,
          recycledMaterials: true,
          fairTradeSourcing: true,
          localSourcing: true,
          carbonNeutralShipping: true,
          renewableEnergy: true,
          carbonOffset: true,
          // Tier 2: Optional details (5/7 fields = ~21% from tier 2)
          annualCarbonEmissions: 2.5,
          carbonOffsetPercent: 100,
          renewableEnergyPercent: 80,
          waterConservation: true,
          takeBackProgram: true,
          // Total: ~91% completeness = Certified tier
          completenessPercent: 91,
          tier: 'certified',
        },
      },
    },
  });

  const shop3 = await prisma.shop.create({
    data: {
      name: 'Ethical Grounds',
      slug: 'ethical-grounds',
      bio: 'Fair-trade organic coffee roasted with care.',
      userId: seller3.id,
      nonprofitId: nonprofits[2].id,
      donationPercentage: 7.0,
      verificationStatus: VerificationStatus.APPROVED,
      isVerified: true,
      logo: 'https://images.unsplash.com/photo-1559056199-641a0ac8b55e?w=400',
      shippingProfiles: {
        create: {
          name: 'Fresh Roast Shipping',
          processingTimeMin: 1,
          processingTimeMax: 2,
          shippingOrigin: {
            address1: '789 Coffee Lane',
            city: 'San Francisco',
            state: 'CA',
            postalCode: '94102',
            country: 'US',
          },
          shippingRates: [
            { region: 'domestic', method: 'standard', rate: 6.99, estimatedDays: 4 },
            { region: 'international', method: 'standard', rate: 18.99, estimatedDays: 10 },
          ],
          carbonNeutralPrice: 3.0,
        },
      },
      ecoProfile: {
        create: {
          // Tier 1: Basic toggles (7/10 = 49% from tier 1)
          plasticFreePackaging: false,
          recycledPackaging: true,
          biodegradablePackaging: false,
          organicMaterials: true,
          recycledMaterials: false,
          fairTradeSourcing: true,
          localSourcing: true,
          carbonNeutralShipping: true,
          renewableEnergy: true,
          carbonOffset: true,
          // Tier 2: Optional details (2/7 fields = ~9% from tier 2)
          renewableEnergyPercent: 60,
          fairWageCertified: true,
          // Total: ~58% completeness = Starter tier
          completenessPercent: 58,
          tier: 'starter',
        },
      },
    },
  });

  console.log('✅ Created 3 shops');

  // Create certifications (these will be linked to products later)
  const plasticFreeCert = await prisma.certification.create({
    data: {
      name: 'Plastic Free',
      type: 'product',
      issuedBy: 'Evercraft Verification Team',
      verified: true,
    },
  });

  const carbonNeutralCert = await prisma.certification.create({
    data: {
      name: 'Carbon Neutral',
      type: 'product',
      issuedBy: 'Evercraft Verification Team',
      verified: true,
    },
  });

  const fairTradeCert = await prisma.certification.create({
    data: {
      name: 'Fair Trade Certified',
      type: 'product',
      issuedBy: 'Fair Trade International',
      verified: true,
    },
  });

  const organicCert = await prisma.certification.create({
    data: {
      name: 'USDA Organic',
      type: 'product',
      issuedBy: 'US Department of Agriculture',
      verified: true,
    },
  });

  const zeroWasteCert = await prisma.certification.create({
    data: {
      name: 'Zero Waste',
      type: 'product',
      issuedBy: 'Evercraft Verification Team',
      verified: true,
    },
  });

  console.log('✅ Created 5 certifications');

  // Create products with ProductEcoProfile
  const product1 = await prisma.product.create({
    data: {
      title: 'Organic Cotton Tote Bag - Reusable Shopping Bag',
      description:
        'Durable, reusable tote bag made from 100% organic cotton. Perfect for grocery shopping, beach trips, or everyday use. Holds up to 30 lbs.',
      price: 24.99,
      compareAtPrice: 34.99,
      shopId: shop1.id,
      categoryId: categories[3]!.id, // Fashion > Bags & Purses
      status: ProductStatus.ACTIVE,
      inventoryQuantity: 50,
      trackInventory: true,
      ecoAttributes: {
        material: '100% Organic Cotton',
        packaging: 'Compostable',
        carbonFootprint: 'Offset through tree planting',
        lifespan: '5+ years with proper care',
      },
      images: {
        create: [
          {
            url: 'https://images.unsplash.com/photo-1591195853828-11db59a44f6b?w=800&q=80',
            altText: 'Organic cotton tote bag - front view',
            position: 0,
            isPrimary: true,
          },
        ],
      },
      sustainabilityScore: {
        create: {
          totalScore: 87,
          materialsScore: 92,
          packagingScore: 85,
          carbonScore: 80,
          certificationScore: 90,
          breakdownJson: {
            materials: 'Organic cotton sourced from certified farms',
            packaging: 'Minimal, recyclable packaging',
            carbon: 'Carbon offset through verified programs',
            certifications: 'GOTS certified organic cotton',
          },
        },
      },
      ecoProfile: {
        create: {
          // Materials (4/5 toggles + 1 percentage)
          isOrganic: true,
          isRecycled: false,
          isBiodegradable: true,
          isVegan: true,
          isFairTrade: false,
          organicPercent: 100,
          // Packaging (4/4 toggles)
          plasticFreePackaging: true,
          recyclablePackaging: true,
          compostablePackaging: true,
          minimalPackaging: true,
          // Carbon & Origin (3/4 toggles + 1 field)
          carbonNeutralShipping: false,
          madeLocally: true,
          madeToOrder: true,
          renewableEnergyMade: false,
          madeIn: 'USA',
          // End of Life (3/4 toggles + 1 text)
          isRecyclable: false,
          isCompostable: true,
          isRepairable: true,
          hasDisposalInfo: true,
          disposalInstructions: 'Compost at end of life or recycle as textile',
          // Completeness: 14/17 toggles + 3 optional fields = ~82%
          completenessPercent: 82,
        },
      },
      certifications: {
        connect: [{ id: plasticFreeCert.id }, { id: organicCert.id }],
      },
    },
  });

  const product2 = await prisma.product.create({
    data: {
      title: 'Bamboo Cutlery Set - Zero Waste Travel Utensils',
      description:
        'Complete bamboo cutlery set with fork, knife, spoon, and chopsticks. Comes in a compact carrying case. Perfect for on-the-go meals.',
      price: 18.5,
      shopId: shop2.id,
      categoryId: categories[1]!.id, // Kitchen & Dining > Dinnerware (close enough) or could be Utensils
      status: ProductStatus.ACTIVE,
      inventoryQuantity: 100,
      trackInventory: true,
      ecoAttributes: {
        material: 'Sustainably harvested bamboo',
        packaging: 'Recycled cardboard',
        carbonFootprint: 'Low impact production',
        lifespan: '3+ years',
      },
      images: {
        create: [
          {
            url: 'https://images.unsplash.com/photo-1530587191325-3db32d826c18?w=800&q=80',
            altText: 'Bamboo cutlery set with carrying case',
            position: 0,
            isPrimary: true,
          },
        ],
      },
      sustainabilityScore: {
        create: {
          totalScore: 92,
          materialsScore: 95,
          packagingScore: 90,
          carbonScore: 88,
          certificationScore: 95,
          breakdownJson: {
            materials: 'Fast-growing renewable bamboo',
            packaging: '100% recycled and recyclable',
            carbon: 'Low carbon manufacturing process',
            certifications: 'FSC certified bamboo',
          },
        },
      },
      ecoProfile: {
        create: {
          // Materials (3/5 toggles)
          isOrganic: false,
          isRecycled: false,
          isBiodegradable: true,
          isVegan: true,
          isFairTrade: false,
          // Packaging (3/4 toggles)
          plasticFreePackaging: true,
          recyclablePackaging: true,
          compostablePackaging: false,
          minimalPackaging: true,
          // Carbon & Origin (2/4 toggles)
          carbonNeutralShipping: true,
          madeLocally: false,
          madeToOrder: false,
          renewableEnergyMade: true,
          madeIn: 'China',
          // End of Life (4/4 toggles + 1 text)
          isRecyclable: true,
          isCompostable: true,
          isRepairable: false,
          hasDisposalInfo: true,
          disposalInstructions: 'Compost or recycle bamboo material. Carrying case is recyclable.',
          // Completeness: 12/17 toggles + 2 optional fields = ~71%
          completenessPercent: 71,
        },
      },
      certifications: {
        connect: [{ id: plasticFreeCert.id }, { id: zeroWasteCert.id }],
      },
    },
  });

  const product3 = await prisma.product.create({
    data: {
      title: 'Fair Trade Organic Coffee Beans - 12oz Dark Roast',
      description:
        'Rich, bold dark roast coffee beans from Fair Trade certified farms. Notes of chocolate and caramel. Roasted fresh to order.',
      price: 15.99,
      shopId: shop3.id,
      categoryId: categories[4]!.id, // Food & Beverages > Coffee & Tea
      status: ProductStatus.ACTIVE,
      inventoryQuantity: 200,
      trackInventory: true,
      ecoAttributes: {
        material: 'Organic coffee beans',
        packaging: 'Recyclable aluminum bag',
        carbonFootprint: 'Carbon neutral shipping',
        origin: 'Small farms in Colombia',
      },
      images: {
        create: [
          {
            url: 'https://images.unsplash.com/photo-1559056199-641a0ac8b55e?w=800&q=80',
            altText: 'Fair trade organic coffee beans',
            position: 0,
            isPrimary: true,
          },
        ],
      },
      sustainabilityScore: {
        create: {
          totalScore: 78,
          materialsScore: 85,
          packagingScore: 70,
          carbonScore: 75,
          certificationScore: 82,
          breakdownJson: {
            materials: 'USDA Organic certified beans',
            packaging: 'Aluminum recyclable at most facilities',
            carbon: 'Carbon offset shipping program',
            certifications: 'Fair Trade and Organic certified',
          },
        },
      },
      ecoProfile: {
        create: {
          // Materials (2/5 toggles + 1 percentage)
          isOrganic: true,
          isRecycled: false,
          isBiodegradable: false,
          isVegan: true,
          isFairTrade: true,
          organicPercent: 100,
          // Packaging (2/4 toggles)
          plasticFreePackaging: true,
          recyclablePackaging: true,
          compostablePackaging: false,
          minimalPackaging: false,
          // Carbon & Origin (3/4 toggles + 1 field)
          carbonNeutralShipping: true,
          madeLocally: false,
          madeToOrder: true,
          renewableEnergyMade: true,
          madeIn: 'Colombia',
          // End of Life (2/4 toggles + 1 text)
          isRecyclable: true,
          isCompostable: false,
          isRepairable: false,
          hasDisposalInfo: true,
          disposalInstructions: 'Recycle aluminum bag. Coffee grounds can be composted.',
          // Completeness: 10/17 toggles + 3 optional fields = ~59%
          completenessPercent: 59,
        },
      },
      certifications: {
        connect: [{ id: fairTradeCert.id }, { id: organicCert.id }],
      },
    },
  });

  const product4 = await prisma.product.create({
    data: {
      title: 'Reusable Beeswax Food Wraps - Set of 3',
      description:
        'Natural alternative to plastic wrap. Made with organic cotton, beeswax, jojoba oil, and tree resin. Washable and reusable for up to a year.',
      price: 22.0,
      shopId: shop1.id,
      categoryId: categories[1]!.id, // Kitchen & Dining > Dinnerware (or Food Storage)
      status: ProductStatus.ACTIVE,
      inventoryQuantity: 75,
      trackInventory: true,
      ecoAttributes: {
        material: 'Organic cotton, beeswax, jojoba oil',
        packaging: 'Compostable paper',
        carbonFootprint: 'Minimal',
        lifespan: '1 year with regular use',
      },
      images: {
        create: [
          {
            url: 'https://images.unsplash.com/photo-1556909212-d5b604d0c90d?w=800&q=80',
            altText: 'Colorful beeswax food wraps',
            position: 0,
            isPrimary: true,
          },
        ],
      },
      sustainabilityScore: {
        create: {
          totalScore: 94,
          materialsScore: 98,
          packagingScore: 95,
          carbonScore: 90,
          certificationScore: 93,
          breakdownJson: {
            materials: 'All natural, biodegradable ingredients',
            packaging: 'Fully compostable packaging',
            carbon: 'Low energy production',
            certifications: 'Certified organic cotton',
          },
        },
      },
      ecoProfile: {
        create: {
          // Materials (4/5 toggles + 1 percentage)
          isOrganic: true,
          isRecycled: false,
          isBiodegradable: true,
          isVegan: false, // Contains beeswax
          isFairTrade: false,
          organicPercent: 80,
          // Packaging (4/4 toggles)
          plasticFreePackaging: true,
          recyclablePackaging: true,
          compostablePackaging: true,
          minimalPackaging: true,
          // Carbon & Origin (4/4 toggles + 1 field)
          carbonNeutralShipping: true,
          madeLocally: true,
          madeToOrder: false,
          renewableEnergyMade: true,
          madeIn: 'USA',
          // End of Life (4/4 toggles + 1 text)
          isRecyclable: false,
          isCompostable: true,
          isRepairable: false,
          hasDisposalInfo: true,
          disposalInstructions:
            'Fully compostable at end of life. Cut into strips for faster composting.',
          // Completeness: 16/17 toggles + 3 optional fields = ~94%
          completenessPercent: 94,
        },
      },
      certifications: {
        connect: [{ id: plasticFreeCert.id }, { id: organicCert.id }, { id: zeroWasteCert.id }],
      },
    },
  });

  // Additional products for Shop 1 (EcoMaker Studio)
  const product5 = await prisma.product.create({
    data: {
      title: 'Hand-Poured Soy Candle - Lavender Fields',
      description:
        'Relaxing lavender scented candle made from 100% natural soy wax. Hand-poured in small batches with cotton wicks. Burns for 45+ hours.',
      price: 28.0,
      compareAtPrice: 35.0,
      shopId: shop1.id,
      categoryId: categories[0]!.id, // Home & Living > Candles
      status: ProductStatus.ACTIVE,
      inventoryQuantity: 40,
      trackInventory: true,
      images: {
        create: [
          {
            url: 'https://images.unsplash.com/photo-1602607299837-bdf9f36f0c5f?w=800&q=80',
            altText: 'Lavender soy candle in glass jar',
            position: 0,
            isPrimary: true,
          },
          {
            url: 'https://images.unsplash.com/photo-1603006905003-be475563bc59?w=800&q=80',
            altText: 'Candle burning with soft glow',
            position: 1,
            isPrimary: false,
          },
        ],
      },
      sustainabilityScore: {
        create: {
          totalScore: 88,
          materialsScore: 90,
          packagingScore: 85,
          carbonScore: 85,
          certificationScore: 92,
          breakdownJson: {
            materials: 'Natural soy wax with cotton wicks',
            packaging: 'Reusable glass jar, recyclable',
            carbon: 'Local production, minimal transport',
            certifications: 'Plastic-free certified',
          },
        },
      },
      ecoProfile: {
        create: {
          isOrganic: false,
          isRecycled: false,
          isBiodegradable: true,
          isVegan: true,
          plasticFreePackaging: true,
          recyclablePackaging: true,
          compostablePackaging: false,
          minimalPackaging: true,
          madeLocally: true,
          madeToOrder: true,
          madeIn: 'USA',
          isRecyclable: true,
          isCompostable: false,
          completenessPercent: 75,
        },
      },
      certifications: {
        connect: [{ id: plasticFreeCert.id }],
      },
    },
  });

  const product6 = await prisma.product.create({
    data: {
      title: 'Ceramic Pour-Over Coffee Dripper',
      description:
        'Handmade ceramic coffee dripper for the perfect pour-over brew. Elegant minimalist design, dishwasher safe. Makes 1-2 cups.',
      price: 42.0,
      shopId: shop1.id,
      categoryId: categories[1]!.id, // Kitchen > Dinnerware
      status: ProductStatus.ACTIVE,
      inventoryQuantity: 25,
      trackInventory: true,
      images: {
        create: [
          {
            url: 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=800&q=80',
            altText: 'White ceramic pour-over coffee dripper',
            position: 0,
            isPrimary: true,
          },
        ],
      },
      sustainabilityScore: {
        create: {
          totalScore: 82,
          materialsScore: 85,
          packagingScore: 80,
          carbonScore: 78,
          certificationScore: 85,
          breakdownJson: {
            materials: 'Durable ceramic, locally made',
            packaging: 'Recyclable cardboard box',
            carbon: 'Local production, small batch',
            certifications: 'Artisan made',
          },
        },
      },
      ecoProfile: {
        create: {
          isOrganic: false,
          isRecycled: false,
          isBiodegradable: false,
          isVegan: true,
          plasticFreePackaging: true,
          recyclablePackaging: true,
          minimalPackaging: true,
          madeLocally: true,
          madeIn: 'USA',
          isRecyclable: true,
          completenessPercent: 65,
        },
      },
    },
  });

  const product7 = await prisma.product.create({
    data: {
      title: 'Linen Napkin Set - Natural',
      description:
        'Set of 4 stonewashed linen napkins. Soft, absorbent, and gets better with every wash. OEKO-TEX certified.',
      price: 36.0,
      shopId: shop1.id,
      categoryId: categories[1]!.id,
      status: ProductStatus.ACTIVE,
      inventoryQuantity: 60,
      trackInventory: true,
      hasVariants: true,
      variantOptions: { color: ['Natural', 'Sage Green', 'Dusty Rose', 'Charcoal'] },
      images: {
        create: [
          {
            url: 'https://images.unsplash.com/photo-1563241527-3004b7be0ffd?w=800&q=80',
            altText: 'Natural linen napkins folded',
            position: 0,
            isPrimary: true,
          },
        ],
      },
      sustainabilityScore: {
        create: {
          totalScore: 90,
          materialsScore: 95,
          packagingScore: 88,
          carbonScore: 85,
          certificationScore: 92,
          breakdownJson: {
            materials: 'OEKO-TEX certified linen',
            packaging: 'Minimal, plastic-free packaging',
            carbon: 'European production standards',
            certifications: 'Organic certified',
          },
        },
      },
      ecoProfile: {
        create: {
          isOrganic: true,
          isBiodegradable: true,
          plasticFreePackaging: true,
          recyclablePackaging: true,
          madeIn: 'Lithuania',
          isCompostable: true,
          completenessPercent: 78,
        },
      },
      certifications: {
        connect: [{ id: organicCert.id }],
      },
    },
  });

  // Create variants for linen napkins
  await prisma.productVariant.createMany({
    data: [
      {
        productId: product7.id,
        name: 'Natural',
        sku: 'LN-NAT-4',
        price: 36.0,
        inventoryQuantity: 20,
      },
      {
        productId: product7.id,
        name: 'Sage Green',
        sku: 'LN-SGR-4',
        price: 36.0,
        inventoryQuantity: 15,
      },
      {
        productId: product7.id,
        name: 'Dusty Rose',
        sku: 'LN-DRS-4',
        price: 36.0,
        inventoryQuantity: 15,
      },
      {
        productId: product7.id,
        name: 'Charcoal',
        sku: 'LN-CHR-4',
        price: 36.0,
        inventoryQuantity: 10,
      },
    ],
  });

  // Additional products for Shop 2 (Green Living Co)
  const product8 = await prisma.product.create({
    data: {
      title: 'Natural Loofah Sponge - 3 Pack',
      description:
        'Biodegradable loofah sponges grown from natural plant fibers. Perfect for kitchen or bath. Compostable at end of life.',
      price: 12.99,
      shopId: shop2.id,
      categoryId: categories[2]!.id, // Personal Care
      status: ProductStatus.ACTIVE,
      inventoryQuantity: 150,
      trackInventory: true,
      images: {
        create: [
          {
            url: 'https://images.unsplash.com/photo-1600857544200-b2f666a9a2ec?w=800&q=80',
            altText: 'Natural loofah sponges',
            position: 0,
            isPrimary: true,
          },
        ],
      },
      sustainabilityScore: {
        create: {
          totalScore: 96,
          materialsScore: 100,
          packagingScore: 95,
          carbonScore: 92,
          certificationScore: 97,
          breakdownJson: {
            materials: '100% natural plant fiber',
            packaging: 'Compostable packaging',
            carbon: 'Zero manufacturing waste',
            certifications: 'Plastic-free and zero-waste certified',
          },
        },
      },
      ecoProfile: {
        create: {
          isOrganic: true,
          isBiodegradable: true,
          isVegan: true,
          plasticFreePackaging: true,
          compostablePackaging: true,
          minimalPackaging: true,
          isCompostable: true,
          completenessPercent: 88,
        },
      },
      certifications: {
        connect: [{ id: plasticFreeCert.id }, { id: zeroWasteCert.id }],
      },
    },
  });

  const product9 = await prisma.product.create({
    data: {
      title: 'Bamboo Toothbrush - Adult 4 Pack',
      description:
        'Eco-friendly toothbrushes with biodegradable bamboo handles and BPA-free bristles. Dentist recommended medium bristles.',
      price: 14.99,
      shopId: shop2.id,
      categoryId: categories[2]!.id,
      status: ProductStatus.ACTIVE,
      inventoryQuantity: 200,
      trackInventory: true,
      images: {
        create: [
          {
            url: 'https://images.unsplash.com/photo-1607613009820-a29f7bb81c04?w=800&q=80',
            altText: 'Bamboo toothbrushes in a row',
            position: 0,
            isPrimary: true,
          },
        ],
      },
      sustainabilityScore: {
        create: {
          totalScore: 89,
          materialsScore: 92,
          packagingScore: 90,
          carbonScore: 82,
          certificationScore: 92,
          breakdownJson: {
            materials: 'Biodegradable bamboo handles',
            packaging: 'Plastic-free recyclable cardboard',
            carbon: 'Sustainable bamboo farming',
            certifications: 'Plastic-free certified',
          },
        },
      },
      ecoProfile: {
        create: {
          isBiodegradable: true,
          isVegan: true,
          plasticFreePackaging: true,
          recyclablePackaging: true,
          minimalPackaging: true,
          isCompostable: true,
          hasDisposalInfo: true,
          disposalInstructions: 'Remove bristles and compost bamboo handle. Bristles go in trash.',
          completenessPercent: 72,
        },
      },
      certifications: {
        connect: [{ id: plasticFreeCert.id }],
      },
    },
  });

  const product10 = await prisma.product.create({
    data: {
      title: 'Reusable Produce Bags - Mesh Set of 6',
      description:
        'Washable organic cotton mesh bags for fruits and vegetables. Includes 2 small, 2 medium, and 2 large bags with tare weight tags.',
      price: 16.99,
      shopId: shop2.id,
      categoryId: categories[3]!.id, // Fashion > Bags
      status: ProductStatus.ACTIVE,
      inventoryQuantity: 120,
      trackInventory: true,
      images: {
        create: [
          {
            url: 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=800&q=80',
            altText: 'Mesh produce bags with vegetables',
            position: 0,
            isPrimary: true,
          },
        ],
      },
      sustainabilityScore: {
        create: {
          totalScore: 94,
          materialsScore: 96,
          packagingScore: 95,
          carbonScore: 90,
          certificationScore: 95,
          breakdownJson: {
            materials: 'Organic cotton mesh',
            packaging: 'Minimal plastic-free packaging',
            carbon: 'Durable for years of reuse',
            certifications: 'Organic and zero-waste certified',
          },
        },
      },
      ecoProfile: {
        create: {
          isOrganic: true,
          isBiodegradable: true,
          isVegan: true,
          plasticFreePackaging: true,
          minimalPackaging: true,
          isCompostable: true,
          completenessPercent: 80,
        },
      },
      certifications: {
        connect: [{ id: organicCert.id }, { id: zeroWasteCert.id }],
      },
    },
  });

  const product11 = await prisma.product.create({
    data: {
      title: 'Stainless Steel Straws - Rainbow Set of 8',
      description:
        'Reusable metal straws in assorted rainbow colors. Includes 4 straight, 4 bent, 2 cleaning brushes, and cotton carrying pouch.',
      price: 11.99,
      shopId: shop2.id,
      categoryId: categories[1]!.id,
      status: ProductStatus.ACTIVE,
      inventoryQuantity: 180,
      trackInventory: true,
      images: {
        create: [
          {
            url: 'https://images.unsplash.com/photo-1572726729207-a78d6feb18d7?w=800&q=80',
            altText: 'Colorful metal straws in a glass',
            position: 0,
            isPrimary: true,
          },
        ],
      },
      sustainabilityScore: {
        create: {
          totalScore: 91,
          materialsScore: 95,
          packagingScore: 88,
          carbonScore: 87,
          certificationScore: 94,
          breakdownJson: {
            materials: 'Recycled stainless steel',
            packaging: 'Recyclable cardboard and cotton pouch',
            carbon: 'Long-lasting, replaces disposables',
            certifications: 'Plastic-free certified',
          },
        },
      },
      ecoProfile: {
        create: {
          isRecycled: true,
          isVegan: true,
          plasticFreePackaging: true,
          recyclablePackaging: true,
          isRecyclable: true,
          completenessPercent: 68,
        },
      },
      certifications: {
        connect: [{ id: plasticFreeCert.id }],
      },
    },
  });

  // Additional products for Shop 3 (Ethical Grounds - Coffee)
  const product12 = await prisma.product.create({
    data: {
      title: 'Fair Trade Coffee Beans - Medium Roast Breakfast Blend',
      description:
        'Bright and balanced medium roast. Perfect for your morning cup. Notes of citrus and brown sugar. Ethically sourced from small farms.',
      price: 15.99,
      shopId: shop3.id,
      categoryId: categories[4]!.id,
      status: ProductStatus.ACTIVE,
      inventoryQuantity: 180,
      trackInventory: true,
      hasVariants: true,
      variantOptions: { size: ['12oz', '2lb', '5lb'] },
      images: {
        create: [
          {
            url: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=800&q=80',
            altText: 'Medium roast coffee beans',
            position: 0,
            isPrimary: true,
          },
        ],
      },
      sustainabilityScore: {
        create: {
          totalScore: 80,
          materialsScore: 85,
          packagingScore: 72,
          carbonScore: 78,
          certificationScore: 85,
          breakdownJson: {
            materials: 'Organic Arabica from small farms',
            packaging: 'Recyclable aluminum-lined bags',
            carbon: 'Carbon neutral shipping',
            certifications: 'Fair Trade and Organic certified',
          },
        },
      },
      ecoProfile: {
        create: {
          isOrganic: true,
          isFairTrade: true,
          plasticFreePackaging: true,
          recyclablePackaging: true,
          carbonNeutralShipping: true,
          madeToOrder: true,
          madeIn: 'Ethiopia',
          completenessPercent: 62,
        },
      },
      certifications: {
        connect: [{ id: fairTradeCert.id }, { id: organicCert.id }],
      },
    },
  });

  // Create variants for medium roast
  await prisma.productVariant.createMany({
    data: [
      {
        productId: product12.id,
        name: '12oz Bag',
        sku: 'MR-12OZ',
        price: 15.99,
        inventoryQuantity: 100,
      },
      {
        productId: product12.id,
        name: '2lb Bag',
        sku: 'MR-2LB',
        price: 28.99,
        inventoryQuantity: 50,
      },
      {
        productId: product12.id,
        name: '5lb Bag',
        sku: 'MR-5LB',
        price: 64.99,
        inventoryQuantity: 30,
      },
    ],
  });

  const product13 = await prisma.product.create({
    data: {
      title: 'Organic Loose Leaf Green Tea - Jasmine',
      description:
        'Fragrant jasmine green tea with hand-picked tea leaves. Light and refreshing with natural jasmine blossoms. 4oz tin makes 50+ cups.',
      price: 18.99,
      shopId: shop3.id,
      categoryId: categories[4]!.id,
      status: ProductStatus.ACTIVE,
      inventoryQuantity: 90,
      trackInventory: true,
      images: {
        create: [
          {
            url: 'https://images.unsplash.com/photo-1564890369478-c89ca6d9cde9?w=800&q=80',
            altText: 'Jasmine green tea in a cup',
            position: 0,
            isPrimary: true,
          },
        ],
      },
      sustainabilityScore: {
        create: {
          totalScore: 85,
          materialsScore: 90,
          packagingScore: 82,
          carbonScore: 80,
          certificationScore: 88,
          breakdownJson: {
            materials: 'Hand-picked organic tea leaves',
            packaging: 'Recyclable metal tin',
            carbon: 'Traditional farming methods',
            certifications: 'Organic and Fair Trade certified',
          },
        },
      },
      ecoProfile: {
        create: {
          isOrganic: true,
          isVegan: true,
          isFairTrade: true,
          plasticFreePackaging: true,
          recyclablePackaging: true,
          madeIn: 'China',
          isRecyclable: true,
          completenessPercent: 70,
        },
      },
      certifications: {
        connect: [{ id: organicCert.id }, { id: fairTradeCert.id }],
      },
    },
  });

  const product14 = await prisma.product.create({
    data: {
      title: 'Cold Brew Coffee Concentrate - 32oz',
      description:
        'Ready-to-drink cold brew concentrate. Smooth, low-acid, and perfect over ice. Dilute 1:1 with water or milk. Makes 8 servings.',
      price: 24.99,
      shopId: shop3.id,
      categoryId: categories[4]!.id,
      status: ProductStatus.ACTIVE,
      inventoryQuantity: 60,
      trackInventory: true,
      images: {
        create: [
          {
            url: 'https://images.unsplash.com/photo-1461023058943-07fcbe16d735?w=800&q=80',
            altText: 'Cold brew coffee in glass bottle',
            position: 0,
            isPrimary: true,
          },
        ],
      },
      sustainabilityScore: {
        create: {
          totalScore: 76,
          materialsScore: 82,
          packagingScore: 70,
          carbonScore: 75,
          certificationScore: 77,
          breakdownJson: {
            materials: 'Organic cold brew coffee',
            packaging: 'Glass bottle, recyclable',
            carbon: 'Carbon neutral shipping available',
            certifications: 'Organic certified',
          },
        },
      },
      ecoProfile: {
        create: {
          isOrganic: true,
          isVegan: true,
          recyclablePackaging: true,
          carbonNeutralShipping: true,
          madeIn: 'USA',
          isRecyclable: true,
          completenessPercent: 55,
        },
      },
      certifications: {
        connect: [{ id: organicCert.id }],
      },
    },
  });

  console.log('✅ Created 14 products with images and sustainability scores');

  // Create shop sections
  const shop1Sections = await Promise.all([
    prisma.shopSection.create({
      data: {
        shopId: shop1.id,
        name: 'Best Sellers',
        slug: 'best-sellers',
        description: 'Our most popular eco-friendly products',
        position: 0,
        isVisible: true,
      },
    }),
    prisma.shopSection.create({
      data: {
        shopId: shop1.id,
        name: 'Kitchen Essentials',
        slug: 'kitchen-essentials',
        description: 'Sustainable solutions for your kitchen',
        position: 1,
        isVisible: true,
      },
    }),
  ]);

  // Link products to sections
  await prisma.shopSectionProduct.createMany({
    data: [
      { sectionId: shop1Sections[0].id, productId: product1.id, position: 0 },
      { sectionId: shop1Sections[0].id, productId: product4.id, position: 1 },
      { sectionId: shop1Sections[1].id, productId: product4.id, position: 0 },
      { sectionId: shop1Sections[1].id, productId: product6.id, position: 1 },
    ],
  });

  console.log('✅ Created shop sections');

  // Create sample orders with payments and donations
  const shippingAddressJson = {
    firstName: 'Sarah',
    lastName: 'Green',
    address1: '123 Eco Street',
    city: 'Portland',
    state: 'OR',
    postalCode: '97201',
    country: 'US',
  };

  const order1 = await prisma.order.create({
    data: {
      buyerId: buyer1.id,
      orderNumber: 'EC-2024-001',
      status: 'DELIVERED',
      paymentStatus: 'PAID',
      subtotal: 42.99,
      shippingCost: 5.99,
      tax: 3.87,
      total: 52.85,
      shippingAddress: shippingAddressJson,
      billingAddress: shippingAddressJson,
      items: {
        create: [
          {
            productId: product1.id,
            shopId: shop1.id,
            quantity: 1,
            priceAtPurchase: 24.99,
            subtotal: 24.99,
          },
          {
            productId: product2.id,
            shopId: shop2.id,
            quantity: 1,
            priceAtPurchase: 18.0,
            subtotal: 18.0,
          },
        ],
      },
    },
  });

  // Create payment for order1
  await prisma.payment.create({
    data: {
      orderId: order1.id,
      shopId: shop1.id,
      stripePaymentIntentId: 'pi_simulated_001',
      amount: 52.85,
      platformFee: 5.29, // 10% platform fee
      sellerPayout: 45.77,
      nonprofitDonation: 1.79,
      status: 'PAID',
    },
  });

  // Create donations for order1
  await prisma.donation.createMany({
    data: [
      {
        orderId: order1.id,
        shopId: shop1.id,
        nonprofitId: nonprofits[0].id,
        amount: 1.25, // 5% of $24.99
        donorType: 'SELLER_CONTRIBUTION',
        status: 'PAID',
      },
      {
        orderId: order1.id,
        shopId: shop2.id,
        nonprofitId: nonprofits[1].id,
        amount: 0.54, // 3% of $18.00
        donorType: 'SELLER_CONTRIBUTION',
        status: 'PAID',
      },
    ],
  });

  const order2 = await prisma.order.create({
    data: {
      buyerId: buyer1.id,
      orderNumber: 'EC-2024-002',
      status: 'SHIPPED',
      paymentStatus: 'PAID',
      subtotal: 31.98,
      shippingCost: 6.99,
      tax: 2.88,
      total: 41.85,
      shippingAddress: shippingAddressJson,
      billingAddress: shippingAddressJson,
      trackingNumber: '1Z999AA10123456784',
      trackingCarrier: 'UPS',
      items: {
        create: [
          {
            productId: product3.id,
            shopId: shop3.id,
            quantity: 2,
            priceAtPurchase: 15.99,
            subtotal: 31.98,
          },
        ],
      },
    },
  });

  await prisma.payment.create({
    data: {
      orderId: order2.id,
      shopId: shop3.id,
      stripePaymentIntentId: 'pi_simulated_002',
      amount: 41.85,
      platformFee: 4.19,
      sellerPayout: 35.42,
      nonprofitDonation: 2.24,
      status: 'PAID',
    },
  });

  await prisma.donation.create({
    data: {
      orderId: order2.id,
      shopId: shop3.id,
      nonprofitId: nonprofits[2].id,
      amount: 2.24, // 7% of $31.98
      donorType: 'SELLER_CONTRIBUTION',
      status: 'PENDING',
    },
  });

  const order3 = await prisma.order.create({
    data: {
      buyerId: buyer1.id,
      orderNumber: 'EC-2024-003',
      status: 'PROCESSING',
      paymentStatus: 'PAID',
      subtotal: 28.0,
      shippingCost: 5.99,
      tax: 2.52,
      total: 36.51,
      shippingAddress: shippingAddressJson,
      billingAddress: shippingAddressJson,
      items: {
        create: [
          {
            productId: product5.id,
            shopId: shop1.id,
            quantity: 1,
            priceAtPurchase: 28.0,
            subtotal: 28.0,
          },
        ],
      },
    },
  });

  await prisma.payment.create({
    data: {
      orderId: order3.id,
      shopId: shop1.id,
      stripePaymentIntentId: 'pi_simulated_003',
      amount: 36.51,
      platformFee: 3.65,
      sellerPayout: 31.46,
      nonprofitDonation: 1.4,
      status: 'PAID',
    },
  });

  await prisma.donation.create({
    data: {
      orderId: order3.id,
      shopId: shop1.id,
      nonprofitId: nonprofits[0].id,
      amount: 1.4, // 5% of $28.00
      donorType: 'SELLER_CONTRIBUTION',
      status: 'PENDING',
    },
  });

  console.log('✅ Created 3 orders with payments and donations');

  // Create reviews
  await prisma.review.create({
    data: {
      productId: product1.id,
      userId: buyer1.id,
      rating: 5,
      text: "Love this tote! This tote bag is exactly what I was looking for. It's sturdy, beautiful, and I feel good using it instead of plastic bags.",
      isVerifiedPurchase: true,
    },
  });

  await prisma.review.create({
    data: {
      productId: product2.id,
      userId: buyer1.id,
      rating: 5,
      text: 'Perfect for travel. I take this everywhere now. No more plastic utensils! The bamboo is smooth and well-made.',
      isVerifiedPurchase: true,
    },
  });

  await prisma.review.create({
    data: {
      productId: product3.id,
      userId: buyer1.id,
      rating: 4,
      text: 'Great coffee, great cause. Delicious dark roast with a smooth finish. Love that it supports fair trade farmers.',
      isVerifiedPurchase: true,
    },
  });

  console.log('✅ Created 3 reviews');

  // Create seller reviews
  await prisma.sellerReview.create({
    data: {
      shopId: shop1.id,
      userId: buyer1.id,
      rating: 5,
      text: 'Fast shipping and beautiful products. Highly recommend!',
    },
  });

  console.log('✅ Created seller review');

  // Create a collection
  await prisma.collection.create({
    data: {
      userId: buyer1.id,
      name: 'My Wishlist',
      isPublic: false,
      collectionProducts: {
        create: [{ productId: product1.id }, { productId: product4.id }],
      },
    },
  });

  console.log('✅ Created collection');

  console.log('');
  console.log('🎉 Database seeded successfully!');
  console.log('');
  console.log('📊 Summary:');
  console.log(`   - 82 categories (13 top-level + 69 subcategories)`);
  console.log(`   - ${nonprofits.length} nonprofits`);
  console.log(`   - 5 users (1 admin, 1 buyer, 3 sellers)`);
  console.log(`   - 3 shops with ShopEcoProfile`);
  console.log(`   - 5 certifications`);
  console.log(`   - 14 products with ProductEcoProfile & sustainability scores`);
  console.log(`   - 7 product variants (4 napkin colors, 3 coffee sizes)`);
  console.log(`   - 2 shop sections with product links`);
  console.log(`   - 3 orders with payments and donations`);
  console.log(`   - 3 product reviews`);
  console.log(`   - 1 seller review`);
  console.log(`   - 1 collection`);
  console.log('');
}

main()
  .catch((e) => {
    console.error('Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
