# Clerk Authentication Setup

This project uses [Clerk](https://clerk.com) for authentication. Follow these steps to set up your Clerk account and configure authentication.

## 1. Create a Clerk Account

1. Go to [https://dashboard.clerk.com/sign-up](https://dashboard.clerk.com/sign-up)
2. Sign up for a free account
3. Create a new application (choose "Next.js" as your framework)

## 2. Get Your API Keys

1. In your Clerk Dashboard, go to **API Keys**
2. Copy your **Publishable Key** and **Secret Key**
3. Add them to your `.env` file:

```bash
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY="pk_test_..."
CLERK_SECRET_KEY="sk_test_..."
```

## 3. Configure Sign-In/Sign-Up URLs (Optional)

The following URLs are already configured in `.env.example`:

```bash
NEXT_PUBLIC_CLERK_SIGN_IN_URL="/sign-in"
NEXT_PUBLIC_CLERK_SIGN_UP_URL="/sign-up"
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL="/"
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL="/"
```

You can customize these if needed.

## 4. Configure Allowed Redirect URLs (Important!)

In your Clerk Dashboard:

1. Go to **Paths** under **Account Portal**
2. Add your development URL: `http://localhost:4000`
3. Later, add your production URL when deploying

## 5. Enable Social Login (Optional)

In your Clerk Dashboard:

1. Go to **User & Authentication** → **Social Connections**
2. Enable providers like Google, GitHub, etc.
3. Follow Clerk's instructions for each provider

## 6. Customize User Profile Fields (Optional)

For Evercraft, we need to distinguish between buyers and sellers:

1. Go to **User & Authentication** → **Email, Phone, Username**
2. Consider enabling username for seller profiles
3. We'll use Clerk's `publicMetadata` to store the user role (buyer/seller/admin)

## User Roles

Evercraft uses three user roles:

- **buyer**: Default role, can browse and purchase products
- **seller**: Can create shops, list products, manage orders
- **admin**: Full access to platform management

These roles are stored in Clerk's `publicMetadata` and managed through our application logic.

## Testing Authentication

Once configured, you can test authentication:

1. Start the dev server: `npm run dev`
2. Navigate to `http://localhost:4000/sign-in`
3. Sign up for a new account
4. You should be redirected to the homepage as an authenticated user

## Troubleshooting

### "Invalid publishable key" error

- Make sure you copied the correct key from Clerk Dashboard
- Ensure the key starts with `pk_test_` for development

### Redirect loop

- Check that your redirect URLs in Clerk Dashboard match your `.env` configuration
- Ensure `http://localhost:4000` is added to allowed redirect URLs

### Session not persisting

- Clear your browser cookies and try again
- Check that middleware is properly configured in `middleware.ts`

## Next Steps

After authentication is set up:

1. Users can sign up and sign in
2. Protected routes will require authentication
3. User profiles can be accessed via Clerk's UserButton component
4. Role-based access control is enforced via middleware

For more information, see the [Clerk Next.js Documentation](https://clerk.com/docs/quickstarts/nextjs).
