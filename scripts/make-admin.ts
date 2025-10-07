/**
 * Script to promote a Clerk user to ADMIN role
 *
 * Usage: tsx scripts/make-admin.ts <email>
 * Example: tsx scripts/make-admin.ts user@example.com
 */

import { config } from 'dotenv';
import { resolve } from 'path';

// Load environment variables from .env
config({ path: resolve(process.cwd(), '.env') });

import { clerkClient } from '@clerk/nextjs/server';

async function makeAdmin() {
  const email = process.argv[2];

  if (!email) {
    console.error('❌ Error: Please provide an email address');
    console.log('\nUsage: tsx scripts/make-admin.ts <email>');
    console.log('Example: tsx scripts/make-admin.ts user@example.com');
    process.exit(1);
  }

  try {
    console.log(`\n🔍 Looking up user with email: ${email}`);

    // Get the Clerk client
    const client = await clerkClient();

    // Find user by email
    const users = await client.users.getUserList({
      emailAddress: [email],
    });

    if (users.data.length === 0) {
      console.error(`\n❌ No user found with email: ${email}`);
      console.log('\nMake sure the user has signed up first via the app.');
      process.exit(1);
    }

    const user = users.data[0];
    console.log(`✅ Found user: ${user.firstName} ${user.lastName} (${user.id})`);

    // Update user's public metadata to include admin role
    await client.users.updateUser(user.id, {
      publicMetadata: {
        ...user.publicMetadata,
        role: 'ADMIN',
      },
    });

    console.log(`\n🎉 Successfully promoted ${email} to ADMIN!`);
    console.log('\n⚠️  Important: The user must sign out and sign back in for the change to take effect.');
    console.log('\nYou can now access the admin panel at: http://localhost:4000/admin');
  } catch (error) {
    console.error('\n❌ Error:', error);
    process.exit(1);
  }
}

makeAdmin();
