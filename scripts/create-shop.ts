/**
 * Create Shop Script
 *
 * Creates a shop for a specific user
 */

/* eslint-disable */
import { db } from '../src/lib/db';

async function createShop() {
  const userId = 'user_33iWahuOgcoqSwOtrrKJHdj1z99';
  const email = 'seller@evercraft.com';

  // Check if user exists, create if not
  let user = await db.user.findUnique({
    where: { id: userId },
  });

  if (!user) {
    user = await db.user.create({
      data: {
        id: userId,
        email,
        name: 'Eco Seller',
      },
    });
    console.log('User created:', user);
  }

  // Check if shop already exists
  const existingShop = await db.shop.findUnique({
    where: { userId },
  });

  if (existingShop) {
    console.log('Shop already exists:', existingShop);
    return;
  }

  // Create new shop
  const shop = await db.shop.create({
    data: {
      userId,
      name: 'My Eco Shop',
      slug: 'my-eco-shop',
      bio: 'A sustainable shop selling eco-friendly products',
      isVerified: true,
      verificationStatus: 'APPROVED',
      donationPercentage: 5.0,
    },
  });

  console.log('Shop created successfully:', shop);
}

createShop()
  .then(() => {
    console.log('Done!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Error:', error);
    process.exit(1);
  });
