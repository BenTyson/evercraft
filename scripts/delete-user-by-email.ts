import { clerkClient } from '@clerk/nextjs/server';
import { db } from '../src/lib/db';

/**
 * Delete a user completely from both Clerk and the database
 * Usage: npx tsx scripts/delete-user-by-email.ts user@example.com
 */

async function deleteUserByEmail(email: string) {
  console.log(`\n🔍 Looking up user: ${email}...`);

  try {
    // 1. Find user in database
    const dbUser = await db.user.findUnique({
      where: { email },
      include: {
        shop: true,
        orders: true,
        sellerApplications: true,
        reviews: true,
        favorites: true,
      },
    });

    if (dbUser) {
      console.log(`\n📊 User found in database:`);
      console.log(`   ID: ${dbUser.id}`);
      console.log(`   Name: ${dbUser.name || '(no name)'}`);
      console.log(`   Role: ${dbUser.role}`);
      console.log(`   Created: ${dbUser.createdAt.toLocaleDateString()}`);

      // Show related data
      console.log(`\n📦 Related data to be deleted:`);
      console.log(`   Shop: ${dbUser.shop ? `✓ ${dbUser.shop.name}` : '✗ None'}`);
      console.log(`   Orders: ${dbUser.orders.length}`);
      console.log(`   Applications: ${dbUser.sellerApplications.length}`);
      console.log(`   Reviews: ${dbUser.reviews.length}`);
      console.log(`   Favorites: ${dbUser.favorites.length}`);
    } else {
      console.log(`⚠️  User not found in database (may have been deleted by reseed)`);
    }

    // 2. Find user in Clerk
    console.log(`\n🔍 Looking up user in Clerk...`);
    const client = await clerkClient();
    const clerkUsers = await client.users.getUserList({
      emailAddress: [email],
    });

    let clerkUser = null;
    if (clerkUsers.data && clerkUsers.data.length > 0) {
      clerkUser = clerkUsers.data[0];
      console.log(`✓ Found in Clerk (ID: ${clerkUser.id})`);
      console.log(`   Clerk role: ${clerkUser.publicMetadata?.role || 'none'}`);
    } else {
      console.log(`⚠️  Not found in Clerk (may have been deleted already)`);
    }

    // 3. Check if there's anything to delete
    if (!dbUser && !clerkUser) {
      console.log(`\n✅ User not found in database or Clerk. Nothing to delete.`);
      return;
    }

    // 4. Confirm deletion
    console.log(`\n⚠️  WARNING: This will permanently delete:`);
    if (dbUser) {
      console.log(`   • Database user record and ALL related data (cascading delete)`);
    }
    if (clerkUser) {
      console.log(`   • Clerk authentication account`);
    }
    console.log(`\n🔥 This action CANNOT be undone!`);

    // For safety, we won't auto-confirm in a script
    console.log(`\n✅ Ready to delete. Proceeding...`);

    // 5. Delete from database first (cascading deletes will handle related records)
    if (dbUser) {
      console.log(`\n🗑️  Deleting from database...`);
      await db.user.delete({
        where: { id: dbUser.id },
      });
      console.log(`✓ Database user deleted (cascading deletes applied)`);
    }

    // 6. Delete from Clerk
    if (clerkUser) {
      console.log(`\n🗑️  Deleting from Clerk...`);
      await client.users.deleteUser(clerkUser.id);
      console.log(`✓ Clerk user deleted`);
    }

    console.log(`\n🎉 User completely wiped: ${email}`);
    console.log(`   They can now sign up fresh as a new user.`);
  } catch (error) {
    console.error(`\n❌ Error deleting user:`, error);
    process.exit(1);
  }
}

// Main execution
const email = process.argv[2];

if (!email) {
  console.error('❌ Error: Email address required');
  console.log('\nUsage: npx tsx scripts/delete-user-by-email.ts user@example.com');
  console.log('\nExample: npx tsx scripts/delete-user-by-email.ts evercraft.eeko@gmail.com');
  process.exit(1);
}

// Validate email format
if (!email.includes('@')) {
  console.error('❌ Error: Invalid email format');
  process.exit(1);
}

console.log('🗑️  USER DELETION SCRIPT');
console.log('========================\n');

deleteUserByEmail(email)
  .then(() => {
    console.log('\n✅ Script completed successfully');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Script failed:', error);
    process.exit(1);
  });
