/**
 * Sign In Page
 *
 * Uses Clerk's pre-built SignIn component for authentication.
 */

import { SignIn } from '@clerk/nextjs';

export default function SignInPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-neutral-50 px-4 dark:bg-neutral-900">
      <SignIn
        appearance={{
          elements: {
            formButtonPrimary: 'bg-forest-dark hover:bg-forest text-white',
            card: 'shadow-lg',
          },
        }}
      />
    </div>
  );
}
