import { SiteHeaderWrapper } from '@/components/layout/site-header-wrapper';
import { AccountNavigation } from '@/components/account/account-navigation';

export default function AccountLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="bg-gray-50">
      <SiteHeaderWrapper />

      <div className="flex">
        <AccountNavigation />

        {/* Main Content */}
        <main className="flex-1">{children}</main>
      </div>
    </div>
  );
}
