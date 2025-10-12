/**
 * Category Taxonomy Seed Data
 *
 * Comprehensive 2-level category hierarchy optimized for sustainable marketplace.
 * Structure: 13 top-level categories → ~75 subcategories
 *
 * Based on industry standards from Etsy and Faire.
 */

import { PrismaClient } from '../src/generated/prisma';

const prisma = new PrismaClient();

export async function seedCategories() {
  console.log('🌳 Seeding category hierarchy...');

  // Delete existing categories
  await prisma.category.deleteMany();

  // 1. HOME & LIVING
  const homeLiving = await prisma.category.create({
    data: {
      name: 'Home & Living',
      slug: 'home-living',
      description: 'Sustainable home goods, decor, and living essentials',
      position: 0,
    },
  });

  await Promise.all([
    prisma.category.create({
      data: {
        name: 'Decor & Accents',
        slug: 'decor-accents',
        description: 'Wall art, sculptures, decorative objects',
        parentId: homeLiving.id,
        position: 0,
      },
    }),
    prisma.category.create({
      data: {
        name: 'Lighting',
        slug: 'lighting',
        description: 'Lamps, candles, light fixtures',
        parentId: homeLiving.id,
        position: 1,
      },
    }),
    prisma.category.create({
      data: {
        name: 'Bedding & Linens',
        slug: 'bedding-linens',
        description: 'Sheets, pillowcases, duvet covers, blankets',
        parentId: homeLiving.id,
        position: 2,
      },
    }),
    prisma.category.create({
      data: {
        name: 'Storage & Organization',
        slug: 'storage-organization',
        description: 'Baskets, bins, shelving, organizers',
        parentId: homeLiving.id,
        position: 3,
      },
    }),
    prisma.category.create({
      data: {
        name: 'Candles & Home Fragrance',
        slug: 'candles-fragrance',
        description: 'Scented candles, diffusers, incense',
        parentId: homeLiving.id,
        position: 4,
      },
    }),
    prisma.category.create({
      data: {
        name: 'Rugs & Flooring',
        slug: 'rugs-flooring',
        description: 'Area rugs, floor mats, runners',
        parentId: homeLiving.id,
        position: 5,
      },
    }),
  ]);

  // 2. KITCHEN & DINING
  const kitchenDining = await prisma.category.create({
    data: {
      name: 'Kitchen & Dining',
      slug: 'kitchen-dining',
      description: 'Eco-friendly kitchenware and dining essentials',
      position: 1,
    },
  });

  await Promise.all([
    prisma.category.create({
      data: {
        name: 'Cookware & Bakeware',
        slug: 'cookware-bakeware',
        description: 'Pots, pans, baking dishes, dutch ovens',
        parentId: kitchenDining.id,
        position: 0,
      },
    }),
    prisma.category.create({
      data: {
        name: 'Dinnerware',
        slug: 'dinnerware',
        description: 'Plates, bowls, serving dishes',
        parentId: kitchenDining.id,
        position: 1,
      },
    }),
    prisma.category.create({
      data: {
        name: 'Drinkware & Glassware',
        slug: 'drinkware-glassware',
        description: 'Cups, mugs, glasses, water bottles',
        parentId: kitchenDining.id,
        position: 2,
      },
    }),
    prisma.category.create({
      data: {
        name: 'Kitchen Linens',
        slug: 'kitchen-linens',
        description: 'Dish towels, aprons, napkins, tablecloths',
        parentId: kitchenDining.id,
        position: 3,
      },
    }),
    prisma.category.create({
      data: {
        name: 'Food Storage & Containers',
        slug: 'food-storage-containers',
        description: 'Jars, tins, reusable bags, beeswax wraps',
        parentId: kitchenDining.id,
        position: 4,
      },
    }),
    prisma.category.create({
      data: {
        name: 'Utensils & Gadgets',
        slug: 'utensils-gadgets',
        description: 'Cutlery, wooden spoons, kitchen tools',
        parentId: kitchenDining.id,
        position: 5,
      },
    }),
  ]);

  // 3. PERSONAL CARE & BEAUTY
  const personalCare = await prisma.category.create({
    data: {
      name: 'Personal Care & Beauty',
      slug: 'personal-care-beauty',
      description: 'Natural and organic personal care products',
      position: 2,
    },
  });

  await Promise.all([
    prisma.category.create({
      data: {
        name: 'Skincare',
        slug: 'skincare',
        description: 'Cleansers, moisturizers, serums, masks',
        parentId: personalCare.id,
        position: 0,
      },
    }),
    prisma.category.create({
      data: {
        name: 'Haircare',
        slug: 'haircare',
        description: 'Shampoo, conditioner, hair treatments',
        parentId: personalCare.id,
        position: 1,
      },
    }),
    prisma.category.create({
      data: {
        name: 'Bath & Shower',
        slug: 'bath-shower',
        description: 'Body wash, soap bars, bath accessories',
        parentId: personalCare.id,
        position: 2,
      },
    }),
    prisma.category.create({
      data: {
        name: 'Oral Care',
        slug: 'oral-care',
        description: 'Toothpaste, toothbrushes, mouthwash, floss',
        parentId: personalCare.id,
        position: 3,
      },
    }),
    prisma.category.create({
      data: {
        name: 'Makeup & Cosmetics',
        slug: 'makeup-cosmetics',
        description: 'Natural makeup, lip balm, nail care',
        parentId: personalCare.id,
        position: 4,
      },
    }),
    prisma.category.create({
      data: {
        name: "Men's Grooming",
        slug: 'mens-grooming',
        description: 'Beard care, shaving, cologne',
        parentId: personalCare.id,
        position: 5,
      },
    }),
  ]);

  // 4. FASHION & ACCESSORIES
  const fashion = await prisma.category.create({
    data: {
      name: 'Fashion & Accessories',
      slug: 'fashion-accessories',
      description: 'Sustainable clothing and accessories',
      position: 3,
    },
  });

  await Promise.all([
    prisma.category.create({
      data: {
        name: "Women's Clothing",
        slug: 'womens-clothing',
        description: 'Tops, dresses, bottoms, outerwear',
        parentId: fashion.id,
        position: 0,
      },
    }),
    prisma.category.create({
      data: {
        name: "Men's Clothing",
        slug: 'mens-clothing',
        description: 'Shirts, pants, jackets, sweaters',
        parentId: fashion.id,
        position: 1,
      },
    }),
    prisma.category.create({
      data: {
        name: 'Bags & Purses',
        slug: 'bags-purses',
        description: 'Tote bags, backpacks, handbags, clutches',
        parentId: fashion.id,
        position: 2,
      },
    }),
    prisma.category.create({
      data: {
        name: 'Jewelry',
        slug: 'jewelry',
        description: 'Necklaces, earrings, bracelets, rings',
        parentId: fashion.id,
        position: 3,
      },
    }),
    prisma.category.create({
      data: {
        name: 'Scarves & Wraps',
        slug: 'scarves-wraps',
        description: 'Scarves, shawls, bandanas',
        parentId: fashion.id,
        position: 4,
      },
    }),
    prisma.category.create({
      data: {
        name: 'Hats & Caps',
        slug: 'hats-caps',
        description: 'Beanies, sun hats, baseball caps',
        parentId: fashion.id,
        position: 5,
      },
    }),
  ]);

  // 5. BABY & KIDS
  const babyKids = await prisma.category.create({
    data: {
      name: 'Baby & Kids',
      slug: 'baby-kids',
      description: 'Safe, natural products for children',
      position: 4,
    },
  });

  await Promise.all([
    prisma.category.create({
      data: {
        name: 'Baby Clothing',
        slug: 'baby-clothing',
        description: 'Onesies, sleepers, organic baby clothes',
        parentId: babyKids.id,
        position: 0,
      },
    }),
    prisma.category.create({
      data: {
        name: 'Toys & Games',
        slug: 'toys-games',
        description: 'Wooden toys, puzzles, educational games',
        parentId: babyKids.id,
        position: 1,
      },
    }),
    prisma.category.create({
      data: {
        name: 'Nursery Decor',
        slug: 'nursery-decor',
        description: 'Wall art, mobiles, room accessories',
        parentId: babyKids.id,
        position: 2,
      },
    }),
    prisma.category.create({
      data: {
        name: 'Baby Care Products',
        slug: 'baby-care-products',
        description: 'Diaper cream, baby lotion, wipes',
        parentId: babyKids.id,
        position: 3,
      },
    }),
    prisma.category.create({
      data: {
        name: "Kids' Clothing",
        slug: 'kids-clothing',
        description: 'Sustainable clothing for toddlers and children',
        parentId: babyKids.id,
        position: 4,
      },
    }),
  ]);

  // 6. FOOD & BEVERAGES
  const foodBeverages = await prisma.category.create({
    data: {
      name: 'Food & Beverages',
      slug: 'food-beverages',
      description: 'Organic and fair-trade food products',
      position: 5,
    },
  });

  await Promise.all([
    prisma.category.create({
      data: {
        name: 'Coffee & Tea',
        slug: 'coffee-tea',
        description: 'Organic coffee beans, loose leaf tea, herbal blends',
        parentId: foodBeverages.id,
        position: 0,
      },
    }),
    prisma.category.create({
      data: {
        name: 'Snacks & Treats',
        slug: 'snacks-treats',
        description: 'Organic snacks, chocolates, granola bars',
        parentId: foodBeverages.id,
        position: 1,
      },
    }),
    prisma.category.create({
      data: {
        name: 'Pantry Staples',
        slug: 'pantry-staples',
        description: 'Grains, flours, oils, spices',
        parentId: foodBeverages.id,
        position: 2,
      },
    }),
    prisma.category.create({
      data: {
        name: 'Condiments & Sauces',
        slug: 'condiments-sauces',
        description: 'Hot sauce, jams, honey, spreads',
        parentId: foodBeverages.id,
        position: 3,
      },
    }),
    prisma.category.create({
      data: {
        name: 'Baking Ingredients',
        slug: 'baking-ingredients',
        description: 'Organic flours, sugars, extracts, mixes',
        parentId: foodBeverages.id,
        position: 4,
      },
    }),
  ]);

  // 7. BATH & BODY
  const bathBody = await prisma.category.create({
    data: {
      name: 'Bath & Body',
      slug: 'bath-body',
      description: 'Natural bath and body care essentials',
      position: 6,
    },
  });

  await Promise.all([
    prisma.category.create({
      data: {
        name: 'Bath Salts & Soaks',
        slug: 'bath-salts-soaks',
        description: 'Mineral bath salts, bath bombs, soaking salts',
        parentId: bathBody.id,
        position: 0,
      },
    }),
    prisma.category.create({
      data: {
        name: 'Soaps & Cleansers',
        slug: 'soaps-cleansers',
        description: 'Bar soap, liquid soap, body wash',
        parentId: bathBody.id,
        position: 1,
      },
    }),
    prisma.category.create({
      data: {
        name: 'Body Scrubs & Exfoliants',
        slug: 'body-scrubs-exfoliants',
        description: 'Sugar scrubs, salt scrubs, dry brushes',
        parentId: bathBody.id,
        position: 2,
      },
    }),
    prisma.category.create({
      data: {
        name: 'Lotions & Moisturizers',
        slug: 'lotions-moisturizers',
        description: 'Body butter, hand cream, body lotion',
        parentId: bathBody.id,
        position: 3,
      },
    }),
    prisma.category.create({
      data: {
        name: 'Essential Oils',
        slug: 'essential-oils',
        description: 'Pure essential oils, aromatherapy blends',
        parentId: bathBody.id,
        position: 4,
      },
    }),
  ]);

  // 8. WELLNESS & SELF-CARE
  const wellness = await prisma.category.create({
    data: {
      name: 'Wellness & Self-Care',
      slug: 'wellness-self-care',
      description: 'Holistic wellness and self-care products',
      position: 7,
    },
  });

  await Promise.all([
    prisma.category.create({
      data: {
        name: 'Aromatherapy',
        slug: 'aromatherapy',
        description: 'Diffusers, essential oil blends, room sprays',
        parentId: wellness.id,
        position: 0,
      },
    }),
    prisma.category.create({
      data: {
        name: 'Yoga & Meditation',
        slug: 'yoga-meditation',
        description: 'Yoga mats, meditation cushions, props',
        parentId: wellness.id,
        position: 1,
      },
    }),
    prisma.category.create({
      data: {
        name: 'Fitness & Exercise',
        slug: 'fitness-exercise',
        description: 'Resistance bands, weights, workout accessories',
        parentId: wellness.id,
        position: 2,
      },
    }),
    prisma.category.create({
      data: {
        name: 'Supplements & Vitamins',
        slug: 'supplements-vitamins',
        description: 'Natural supplements, herbal remedies, vitamins',
        parentId: wellness.id,
        position: 3,
      },
    }),
    prisma.category.create({
      data: {
        name: 'Sleep & Relaxation',
        slug: 'sleep-relaxation',
        description: 'Eye masks, lavender sachets, sleep aids',
        parentId: wellness.id,
        position: 4,
      },
    }),
  ]);

  // 9. OUTDOOR & GARDEN
  const outdoorGarden = await prisma.category.create({
    data: {
      name: 'Outdoor & Garden',
      slug: 'outdoor-garden',
      description: 'Sustainable gardening and outdoor living',
      position: 8,
    },
  });

  await Promise.all([
    prisma.category.create({
      data: {
        name: 'Planters & Pots',
        slug: 'planters-pots',
        description: 'Ceramic pots, hanging planters, plant stands',
        parentId: outdoorGarden.id,
        position: 0,
      },
    }),
    prisma.category.create({
      data: {
        name: 'Gardening Tools',
        slug: 'gardening-tools',
        description: 'Hand tools, gloves, watering cans',
        parentId: outdoorGarden.id,
        position: 1,
      },
    }),
    prisma.category.create({
      data: {
        name: 'Seeds & Plants',
        slug: 'seeds-plants',
        description: 'Heirloom seeds, seedlings, bulbs',
        parentId: outdoorGarden.id,
        position: 2,
      },
    }),
    prisma.category.create({
      data: {
        name: 'Outdoor Decor',
        slug: 'outdoor-decor',
        description: 'Garden statues, wind chimes, outdoor lighting',
        parentId: outdoorGarden.id,
        position: 3,
      },
    }),
    prisma.category.create({
      data: {
        name: 'Composting Supplies',
        slug: 'composting-supplies',
        description: 'Compost bins, worm farms, compost accessories',
        parentId: outdoorGarden.id,
        position: 4,
      },
    }),
  ]);

  // 10. OFFICE & STATIONERY
  const officeStationery = await prisma.category.create({
    data: {
      name: 'Office & Stationery',
      slug: 'office-stationery',
      description: 'Eco-friendly office and paper goods',
      position: 9,
    },
  });

  await Promise.all([
    prisma.category.create({
      data: {
        name: 'Notebooks & Journals',
        slug: 'notebooks-journals',
        description: 'Recycled paper notebooks, planners, journals',
        parentId: officeStationery.id,
        position: 0,
      },
    }),
    prisma.category.create({
      data: {
        name: 'Pens & Pencils',
        slug: 'pens-pencils',
        description: 'Recycled pens, wooden pencils, refillable pens',
        parentId: officeStationery.id,
        position: 1,
      },
    }),
    prisma.category.create({
      data: {
        name: 'Desk Organization',
        slug: 'desk-organization',
        description: 'Desk organizers, file holders, storage',
        parentId: officeStationery.id,
        position: 2,
      },
    }),
    prisma.category.create({
      data: {
        name: 'Greeting Cards',
        slug: 'greeting-cards',
        description: 'Handmade cards, plantable cards, stationery sets',
        parentId: officeStationery.id,
        position: 3,
      },
    }),
    prisma.category.create({
      data: {
        name: 'Gift Wrap & Packaging',
        slug: 'gift-wrap-packaging',
        description: 'Recycled wrapping paper, reusable bags, ribbons',
        parentId: officeStationery.id,
        position: 4,
      },
    }),
  ]);

  // 11. PET SUPPLIES
  const petSupplies = await prisma.category.create({
    data: {
      name: 'Pet Supplies',
      slug: 'pet-supplies',
      description: 'Eco-friendly products for pets',
      position: 10,
    },
  });

  await Promise.all([
    prisma.category.create({
      data: {
        name: 'Pet Toys',
        slug: 'pet-toys',
        description: 'Natural rubber toys, rope toys, interactive toys',
        parentId: petSupplies.id,
        position: 0,
      },
    }),
    prisma.category.create({
      data: {
        name: 'Pet Accessories',
        slug: 'pet-accessories',
        description: 'Collars, leashes, bowls, carriers',
        parentId: petSupplies.id,
        position: 1,
      },
    }),
    prisma.category.create({
      data: {
        name: 'Pet Grooming',
        slug: 'pet-grooming',
        description: 'Natural shampoos, brushes, grooming tools',
        parentId: petSupplies.id,
        position: 2,
      },
    }),
    prisma.category.create({
      data: {
        name: 'Pet Bedding',
        slug: 'pet-bedding',
        description: 'Organic pet beds, blankets, mats',
        parentId: petSupplies.id,
        position: 3,
      },
    }),
    prisma.category.create({
      data: {
        name: 'Pet Treats & Food',
        slug: 'pet-treats-food',
        description: 'Organic treats, natural pet food',
        parentId: petSupplies.id,
        position: 4,
      },
    }),
  ]);

  // 12. CRAFT SUPPLIES
  const craftSupplies = await prisma.category.create({
    data: {
      name: 'Craft Supplies',
      slug: 'craft-supplies',
      description: 'Sustainable crafting materials',
      position: 11,
    },
  });

  await Promise.all([
    prisma.category.create({
      data: {
        name: 'Fabrics & Textiles',
        slug: 'fabrics-textiles',
        description: 'Organic cotton, linen, wool fabrics',
        parentId: craftSupplies.id,
        position: 0,
      },
    }),
    prisma.category.create({
      data: {
        name: 'Yarns & Threads',
        slug: 'yarns-threads',
        description: 'Natural fiber yarns, embroidery thread',
        parentId: craftSupplies.id,
        position: 1,
      },
    }),
    prisma.category.create({
      data: {
        name: 'Natural Dyes',
        slug: 'natural-dyes',
        description: 'Plant-based dyes, fabric dye kits',
        parentId: craftSupplies.id,
        position: 2,
      },
    }),
    prisma.category.create({
      data: {
        name: 'Crafting Tools',
        slug: 'crafting-tools',
        description: 'Scissors, needles, knitting needles, hooks',
        parentId: craftSupplies.id,
        position: 3,
      },
    }),
    prisma.category.create({
      data: {
        name: 'Kits & Projects',
        slug: 'kits-projects',
        description: 'DIY craft kits, project bundles',
        parentId: craftSupplies.id,
        position: 4,
      },
    }),
  ]);

  // 13. ART & COLLECTIBLES
  const artCollectibles = await prisma.category.create({
    data: {
      name: 'Art & Collectibles',
      slug: 'art-collectibles',
      description: 'Original art and handmade collectibles',
      position: 12,
    },
  });

  await Promise.all([
    prisma.category.create({
      data: {
        name: 'Wall Art & Prints',
        slug: 'wall-art-prints',
        description: 'Paintings, prints, posters, framed art',
        parentId: artCollectibles.id,
        position: 0,
      },
    }),
    prisma.category.create({
      data: {
        name: 'Sculptures & Figurines',
        slug: 'sculptures-figurines',
        description: 'Wood carvings, clay sculptures, statues',
        parentId: artCollectibles.id,
        position: 1,
      },
    }),
    prisma.category.create({
      data: {
        name: 'Handmade Ceramics',
        slug: 'handmade-ceramics',
        description: 'Pottery, ceramic art, vases',
        parentId: artCollectibles.id,
        position: 2,
      },
    }),
    prisma.category.create({
      data: {
        name: 'Photography',
        slug: 'photography',
        description: 'Fine art photography, nature prints',
        parentId: artCollectibles.id,
        position: 3,
      },
    }),
    prisma.category.create({
      data: {
        name: 'Mixed Media',
        slug: 'mixed-media',
        description: 'Collage, assemblage, mixed media art',
        parentId: artCollectibles.id,
        position: 4,
      },
    }),
  ]);

  // Count results
  const topLevelCount = await prisma.category.count({
    where: { parentId: null },
  });

  const subCategoryCount = await prisma.category.count({
    where: { parentId: { not: null } },
  });

  console.log(`✅ Created ${topLevelCount} top-level categories`);
  console.log(`✅ Created ${subCategoryCount} subcategories`);
  console.log(`✅ Total: ${topLevelCount + subCategoryCount} categories`);

  return {
    topLevelCount,
    subCategoryCount,
    total: topLevelCount + subCategoryCount,
  };
}
