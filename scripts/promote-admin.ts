/**
 * Admin Promotion Script
 *
 * Promotes a user to ADMIN role in both Prisma database and Clerk.
 *
 * Usage:
 *   npx tsx scripts/promote-admin.ts <clerk_user_id>
 *
 * Example:
 *   npx tsx scripts/promote-admin.ts user_2abc123xyz
 */

import { promoteToAdmin } from '../src/lib/user-roles';
import { db } from '../src/lib/db';

async function main() {
  const userId = process.argv[2];

  if (!userId) {
    console.error('❌ Error: Please provide a Clerk user ID');
    console.log('\nUsage:');
    console.log('  npx tsx scripts/promote-admin.ts <clerk_user_id>');
    console.log('\nExample:');
    console.log('  npx tsx scripts/promote-admin.ts user_2abc123xyz');
    process.exit(1);
  }

  console.log(`\n🔍 Checking user: ${userId}`);

  // Check if user exists
  const user = await db.user.findUnique({
    where: { id: userId },
    select: { id: true, email: true, role: true },
  });

  if (!user) {
    console.error(`❌ Error: User ${userId} not found in database`);
    console.log('\nMake sure:');
    console.log('  1. The user has logged in at least once (to create database record)');
    console.log('  2. You are using the correct Clerk user ID (starts with "user_")');
    process.exit(1);
  }

  console.log(`✅ Found user: ${user.email}`);
  console.log(`   Current role: ${user.role}`);

  if (user.role === 'ADMIN') {
    console.log('\n⚠️  User is already an ADMIN. No changes needed.');
    process.exit(0);
  }

  console.log(`\n🚀 Promoting ${user.email} to ADMIN...`);

  try {
    await promoteToAdmin(userId);
    console.log('✅ Successfully promoted user to ADMIN!');
    console.log('\nChanges made:');
    console.log('  • Prisma database User.role → ADMIN');
    console.log('  • Clerk publicMetadata.role → "admin"');
    console.log('\n💡 The user will see the "Admin" link in navigation on their next page load.');
  } catch (error) {
    console.error('❌ Error promoting user:', error);
    process.exit(1);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('❌ Fatal error:', error);
    process.exit(1);
  });
