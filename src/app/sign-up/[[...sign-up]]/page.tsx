/**
 * Sign Up Page
 *
 * Uses Clerk's pre-built SignUp component for user registration.
 */

import { SignUp } from '@clerk/nextjs';

export default function SignUpPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-neutral-50 px-4 dark:bg-neutral-900">
      <SignUp
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
