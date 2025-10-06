import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';

// Define protected routes that require authentication
const isProtectedRoute = createRouteMatcher([
  '/account(.*)',
  '/cart',
  '/checkout(.*)',
  '/orders(.*)',
  '/seller(.*)', // Seller dashboard and management
  '/admin(.*)', // Admin panel
]);

// Define public routes that should bypass auth (even if user is signed in)
const isPublicRoute = createRouteMatcher([
  '/',
  '/browse',
  '/products(.*)',
  '/shop(.*)',
  '/categories',
  '/sign-in(.*)',
  '/sign-up(.*)',
  '/design-system',
]);

export default clerkMiddleware(async (auth, req) => {
  // Protect routes that require authentication
  if (isProtectedRoute(req)) {
    await auth.protect();
  }
});

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
  ],
};
