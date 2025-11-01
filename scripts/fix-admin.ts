/**
 * Script to diagnose and fix admin role for a user
 *
 * Usage: npx tsx scripts/fix-admin.ts <email>
 */

import { promoteToAdmin } from '@/lib/user-roles';
import { db } from '@/lib/db';
import { clerkClient } from '@clerk/nextjs/server';

async function fixAdminRole(email: string) {
  console.log(`\n🔍 Checking admin status for: ${email}\n`);

  // 1. Check database
  const user = await db.user.findUnique({
    where: { email },
    select: { id: true, email: true, role: true },
  });

  if (!user) {
    console.error(`❌ User not found in database: ${email}`);
    process.exit(1);
  }

  console.log('📊 Database status:');
  console.log(`   User ID: ${user.id}`);
  console.log(`   Email: ${user.email}`);
  console.log(`   Database Role: ${user.role}`);

  // 2. Check Clerk
  const clerk = await clerkClient();
  const clerkUser = await clerk.users.getUser(user.id);
  const clerkRole = (clerkUser.publicMetadata as Record<string, unknown>)?.role;

  console.log('\n🔐 Clerk status:');
  console.log(`   Clerk Role (publicMetadata): ${clerkRole || 'NOT SET'}`);

  // 3. Determine if fix is needed
  const needsFix = user.role !== 'ADMIN' || clerkRole !== 'admin';

  if (!needsFix) {
    console.log('\n✅ User is already properly configured as admin!');
    console.log('   - Database role: ADMIN ✓');
    console.log('   - Clerk role: admin ✓');
    process.exit(0);
  }

  // 4. Fix the issue
  console.log('\n🔧 Fixing admin role...');

  try {
    await promoteToAdmin(user.id);
    console.log('\n✅ Successfully promoted user to admin!');
    console.log('   - Updated database role to ADMIN');
    console.log('   - Updated Clerk publicMetadata.role to admin');
    console.log('\n💡 Next steps:');
    console.log('   1. Sign out of Clerk in your browser');
    console.log('   2. Sign back in to refresh your session');
    console.log('   3. The admin link should now appear in the header');
  } catch (error) {
    console.error('\n❌ Error promoting user to admin:', error);
    process.exit(1);
  }
}

// Get email from command line args
const email = process.argv[2];

if (!email) {
  console.error('Usage: npx tsx scripts/fix-admin.ts <email>');
  process.exit(1);
}

fixAdminRole(email).catch(console.error);
