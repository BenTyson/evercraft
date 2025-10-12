/* eslint-disable @typescript-eslint/no-unused-vars */
import { PrismaClient, Role, ProductStatus, VerificationStatus } from '../src/generated/prisma';
import { seedCategories } from './seed-categories';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // Clean up existing data
  await prisma.collectionProduct.deleteMany();
  await prisma.collection.deleteMany();
  await prisma.favorite.deleteMany();
  await prisma.review.deleteMany();
  await prisma.sellerReview.deleteMany();
  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.donation.deleteMany();
  await prisma.payment.deleteMany();
  await prisma.sustainabilityScore.deleteMany();
  await prisma.productImage.deleteMany();
  await prisma.productVariant.deleteMany();
  await prisma.product.deleteMany();
  await prisma.certification.deleteMany();
  await prisma.shippingProfile.deleteMany();
  await prisma.shop.deleteMany();
  await prisma.nonprofit.deleteMany();
  await prisma.category.deleteMany();
  await prisma.address.deleteMany();
  await prisma.sellerApplication.deleteMany();
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

  console.log('✅ Created 4 products with images and sustainability scores');

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
  console.log(`   - 4 products with ProductEcoProfile & sustainability scores`);
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
