/**
 * Admin Promotion Script (By Email)
 *
 * Promotes a user to ADMIN role using their email address.
 * More convenient than needing to look up the Clerk user ID.
 *
 * Usage:
 *   npx tsx scripts/promote-admin-by-email.ts <email>
 *
 * Example:
 *   npx tsx scripts/promote-admin-by-email.ts tyson.ben@gmail.com
 */

import { promoteToAdmin } from '../src/lib/user-roles';
import { db } from '../src/lib/db';

async function main() {
  const email = process.argv[2];

  if (!email) {
    console.error('❌ Error: Please provide an email address');
    console.log('\nUsage:');
    console.log('  npx tsx scripts/promote-admin-by-email.ts <email>');
    console.log('\nExample:');
    console.log('  npx tsx scripts/promote-admin-by-email.ts tyson.ben@gmail.com');
    process.exit(1);
  }

  // Validate email format
  if (!email.includes('@')) {
    console.error('❌ Error: Invalid email format');
    process.exit(1);
  }

  console.log(`\n🔍 Looking up user with email: ${email}`);

  // Find user by email
  const user = await db.user.findUnique({
    where: { email },
    select: { id: true, email: true, role: true },
  });

  if (!user) {
    console.error(`❌ Error: User with email ${email} not found in database`);
    console.log('\nMake sure:');
    console.log('  1. The email address is correct');
    console.log('  2. The user has logged in at least once (to create database record)');
    process.exit(1);
  }

  console.log(`✅ Found user`);
  console.log(`   Email: ${user.email}`);
  console.log(`   Clerk ID: ${user.id}`);
  console.log(`   Current role: ${user.role}`);

  if (user.role === 'ADMIN') {
    console.log('\n⚠️  User is already an ADMIN. No changes needed.');
    process.exit(0);
  }

  console.log(`\n🚀 Promoting ${user.email} to ADMIN...`);

  try {
    await promoteToAdmin(user.id);
    console.log('✅ Successfully promoted user to ADMIN!');
    console.log('\nChanges made:');
    console.log('  • Prisma database User.role → ADMIN');
    console.log('  • Clerk publicMetadata.role → "admin"');
    console.log(
      '\n💡 The user will see both "Admin" and "Seller Dashboard" links on their next page load.'
    );
    console.log('   (Admins automatically have seller access)');
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
