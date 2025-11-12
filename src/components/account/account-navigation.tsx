'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import {
  LayoutDashboard,
  Package,
  Heart,
  Star,
  MapPin,
  Leaf,
  Bell,
  Settings,
  Menu,
  X,
  MessageCircle,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export function AccountNavigation() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const pathname = usePathname();

  const navItems = [
    { href: '/account', icon: LayoutDashboard, label: 'Dashboard' },
    { href: '/account/orders', icon: Package, label: 'Orders' },
    { href: '/account/messages', icon: MessageCircle, label: 'Messages' },
    { href: '/account/favorites', icon: Heart, label: 'Favorites' },
    { href: '/account/reviews', icon: Star, label: 'Reviews' },
    { href: '/account/addresses', icon: MapPin, label: 'Addresses' },
    { href: '/account/impact', icon: Leaf, label: 'Impact' },
    { href: '/account/preferences', icon: Bell, label: 'Preferences' },
    { href: '/account/settings', icon: Settings, label: 'Settings' },
  ];

  const isActive = (href: string) => {
    if (href === '/account') {
      return pathname === href;
    }
    return pathname?.startsWith(href);
  };

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden w-64 border-r border-gray-200 bg-white md:block">
        <div className="p-4">
          <nav className="space-y-1">
            {navItems.map((item) => (
              <AccountNavLink
                key={item.href}
                href={item.href}
                icon={item.icon}
                isActive={isActive(item.href)}
              >
                {item.label}
              </AccountNavLink>
            ))}
          </nav>
        </div>
      </aside>

      {/* Mobile Menu Button */}
      <div className="fixed right-4 bottom-4 z-50 md:hidden">
        <Button
          onClick={() => setMobileMenuOpen(true)}
          size="lg"
          className="size-14 rounded-full shadow-lg"
        >
          <Menu className="size-6" />
        </Button>
      </div>

      {/* Mobile Drawer Overlay */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 md:hidden"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Mobile Drawer */}
      <aside
        className={cn(
          'fixed inset-y-0 right-0 z-50 w-64 transform border-l border-gray-200 bg-white transition-transform duration-300 ease-in-out md:hidden',
          mobileMenuOpen ? 'translate-x-0' : 'translate-x-full'
        )}
      >
        <div className="p-4">
          <div className="mb-4 flex justify-end">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setMobileMenuOpen(false)}
              className="size-8 p-0"
            >
              <X className="size-5" />
            </Button>
          </div>
          <nav className="space-y-1">
            {navItems.map((item) => (
              <AccountNavLink
                key={item.href}
                href={item.href}
                icon={item.icon}
                isActive={isActive(item.href)}
                onClick={() => setMobileMenuOpen(false)}
              >
                {item.label}
              </AccountNavLink>
            ))}
          </nav>
        </div>
      </aside>
    </>
  );
}

function AccountNavLink({
  href,
  icon: Icon,
  children,
  isActive,
  onClick,
}: {
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  children: React.ReactNode;
  isActive?: boolean;
  onClick?: () => void;
}) {
  return (
    <Link
      href={href}
      onClick={onClick}
      className={cn(
        'flex items-center gap-3 rounded-md px-3 py-2 transition-colors',
        isActive
          ? 'bg-forest-dark/10 text-forest-dark font-medium'
          : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
      )}
    >
      <Icon className="size-5" />
      <span>{children}</span>
    </Link>
  );
}
