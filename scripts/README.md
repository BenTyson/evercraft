# Admin Scripts

One-time setup scripts for managing user roles in Evercraft.

## Scripts Available

### 1a. `promote-admin-by-email.ts` - Promote User to Admin (Easiest)

Promotes a user to ADMIN role using their email address.

**Usage:**

```bash
npx tsx scripts/promote-admin-by-email.ts <email>
```

**Example:**

```bash
npx tsx scripts/promote-admin-by-email.ts tyson.ben@gmail.com
```

**What it does:**

- Looks up user by email in database
- Updates Prisma `User.role` → `ADMIN`
- Updates Clerk `publicMetadata.role` → `"admin"`
- Shows "Admin" and "Seller Dashboard" links in navigation

**Recommended:** Use this instead of `promote-admin.ts` (easier, no need to find Clerk ID)

---

### 1b. `promote-admin.ts` - Promote User to Admin (By Clerk ID)

Same as above, but requires Clerk user ID instead of email.

**Usage:**

```bash
npx tsx scripts/promote-admin.ts <clerk_user_id>
```

**Example:**

```bash
npx tsx scripts/promote-admin.ts user_2abc123xyz
```

**To find Clerk user ID:**

1. Go to https://dashboard.clerk.com
2. Select your project → Users → Click user → Copy User ID

---

### 2. `sync-seller-roles.ts` - Sync Existing Sellers

One-time script to fix sellers who were approved before automatic role promotion was implemented.

**Usage:**

```bash
npx tsx scripts/sync-seller-roles.ts
```

**What it does:**

- Finds all users who have Shops but still have `BUYER` role
- Promotes each to `SELLER` role
- Updates both Prisma database and Clerk metadata
- Shows progress and results

**When to run:**

- After deploying the new role promotion system
- To fix evercraft.eeko@gmail.com and any other approved sellers
- Only needs to run once

**Safe to run multiple times** - Skips users who already have correct role

---

### 3. `delete-user-by-email.ts` - Delete User Completely

Completely removes a user from both Clerk and the database. Useful for cleanup after reseeding or testing.

**Usage:**

```bash
npx tsx scripts/delete-user-by-email.ts <email>
```

**Example:**

```bash
npx tsx scripts/delete-user-by-email.ts evercraft.eeko@gmail.com
```

**What it does:**

- Looks up user by email in both database and Clerk
- Deletes from database (cascading delete removes all related data)
- Deletes from Clerk (removes authentication account)
- Shows what data will be deleted before proceeding

**When to use:**

- After reseeding the database to clean up orphaned Clerk accounts
- Removing test users completely
- Allowing a user to sign up fresh (they'll start as BUYER with no history)

**⚠️ WARNING:** This action CANNOT be undone. The user will need to sign up again from scratch.

---

## Quick Setup

To fix the current issues:

1. **Promote yourself to admin:**

   ```bash
   npx tsx scripts/promote-admin-by-email.ts tyson.ben@gmail.com
   ```

2. **Fix existing approved sellers:**
   ```bash
   npx tsx scripts/sync-seller-roles.ts
   ```

That's it! After running these:

- ✅ Admin users see "Admin" and "Seller Dashboard" links in navigation
- ✅ Approved sellers (like evercraft.eeko@gmail.com) see "Seller Dashboard" link
- ✅ Future approvals work automatically (no manual sync needed)

---

## Troubleshooting

**"User not found in database"**

- User needs to log in at least once to create database record
- Check the Clerk user ID is correct (starts with `user_`)

**"Admin access required"**

- First run `promote-admin.ts` to promote yourself
- Then you can use the admin UI or run other scripts

**"Module not found"**

- Make sure you're running from the project root
- Install dependencies: `npm install`
