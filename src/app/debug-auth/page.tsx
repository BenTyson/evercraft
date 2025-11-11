import { auth } from '@clerk/nextjs/server';
import { getUserRole, isAdmin } from '@/lib/auth';

export default async function DebugAuthPage() {
  const { userId, sessionClaims } = await auth();
  const userRole = await getUserRole();
  const adminStatus = await isAdmin();

  return (
    <div className="container mx-auto px-4 py-12">
      <h1 className="mb-8 text-3xl font-bold">Auth Debug Info</h1>

      <div className="space-y-4 rounded-lg border bg-white p-6">
        <div>
          <h2 className="font-bold">User ID:</h2>
          <p className="font-mono">{userId || 'Not authenticated'}</p>
        </div>

        <div>
          <h2 className="font-bold">Session Claims (Raw):</h2>
          <pre className="overflow-auto rounded bg-gray-100 p-4 font-mono">
            {JSON.stringify(sessionClaims, null, 2)}
          </pre>
        </div>

        <div>
          <h2 className="font-bold">Public Metadata:</h2>
          <pre className="overflow-auto rounded bg-gray-100 p-4 font-mono">
            {JSON.stringify(
              (sessionClaims as Record<string, unknown> | null)?.publicMetadata,
              null,
              2
            )}
          </pre>
        </div>

        <div>
          <h2 className="font-bold">User Role (from getUserRole()):</h2>
          <p className="font-mono">{userRole || 'null'}</p>
        </div>

        <div>
          <h2 className="font-bold">Is Admin (from isAdmin()):</h2>
          <p className="font-mono">{adminStatus ? 'true' : 'false'}</p>
        </div>
      </div>
    </div>
  );
}
