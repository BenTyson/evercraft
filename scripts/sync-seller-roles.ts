/**
 * Seller Role Sync Script
 *
 * One-time script to sync roles for existing sellers.
 * Finds users with shops who still have BUYER role and promotes them to SELLER.
 *
 * This fixes users who were approved before the automatic role promotion was implemented.
 *
 * Usage:
 *   npx tsx scripts/sync-seller-roles.ts
 */

import { db } from '../src/lib/db';
import { promoteToSeller } from '../src/lib/user-roles';

async function main() {
  console.log('🔍 Checking for sellers needing role sync...\n');

  // Find all users who have shops (meaning they're approved sellers)
  const usersWithShops = await db.shop.findMany({
    select: {
      userId: true,
      name: true,
      user: {
        select: {
          id: true,
          email: true,
          role: true,
        },
      },
    },
  });

  console.log(`Found ${usersWithShops.length} total shop(s)`);

  // Filter to only those who still have BUYER role
  const usersNeedingSync = usersWithShops.filter((shop) => shop.user.role === 'BUYER');

  if (usersNeedingSync.length === 0) {
    console.log('✅ All sellers already have correct role. No sync needed!');
    process.exit(0);
  }

  console.log(`\n⚠️  Found ${usersNeedingSync.length} seller(s) with incorrect role:\n`);

  usersNeedingSync.forEach((shop, index) => {
    console.log(`  ${index + 1}. ${shop.user.email} (${shop.name})`);
    console.log(`     Current role: ${shop.user.role} → Should be: SELLER\n`);
  });

  console.log('🚀 Starting role sync...\n');

  // Promote each user to SELLER
  const results = await Promise.allSettled(
    usersNeedingSync.map(async (shop) => {
      try {
        await promoteToSeller(shop.userId);
        return {
          success: true,
          email: shop.user.email,
          shopName: shop.name,
        };
      } catch (error) {
        return {
          success: false,
          email: shop.user.email,
          shopName: shop.name,
          error: error instanceof Error ? error.message : 'Unknown error',
        };
      }
    })
  );

  // Report results
  const successful = results.filter((r) => r.status === 'fulfilled' && r.value.success);
  const failed = results.filter((r) => r.status === 'rejected' || !r.value.success);

  console.log('📊 Sync Results:\n');
  console.log(`  ✅ Successful: ${successful.length}`);

  successful.forEach((result) => {
    if (result.status === 'fulfilled') {
      const { email, shopName } = result.value;
      console.log(`     • ${email} (${shopName})`);
    }
  });

  if (failed.length > 0) {
    console.log(`\n  ❌ Failed: ${failed.length}`);
    failed.forEach((result) => {
      if (result.status === 'fulfilled') {
        const { email, shopName, error } = result.value;
        console.log(`     • ${email} (${shopName}): ${error}`);
      } else {
        console.log(`     • Error: ${result.reason}`);
      }
    });
  }

  console.log('\n✅ Role sync completed!');
  console.log('\nChanges made for each user:');
  console.log('  • Prisma database User.role → SELLER');
  console.log('  • Clerk publicMetadata.role → "seller"');
  console.log('\n💡 Users will see "Seller Dashboard" link on their next page load.');
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('❌ Fatal error:', error);
    process.exit(1);
  });
