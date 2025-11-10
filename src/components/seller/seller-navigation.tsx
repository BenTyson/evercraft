'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Home,
  Package,
  Settings,
  BarChart3,
  ShoppingBag,
  LayoutList,
  DollarSign,
  Heart,
} from 'lucide-react';
import { cn } from '@/lib/utils';

const navigation = [
  { name: 'Dashboard', href: '/seller', icon: Home },
  { name: 'Products', href: '/seller/products', icon: Package },
  { name: 'Sections', href: '/seller/sections', icon: LayoutList },
  { name: 'Orders', href: '/seller/orders', icon: ShoppingBag },
  { name: 'Finance', href: '/seller/finance', icon: DollarSign },
  { name: 'Impact', href: '/seller/impact', icon: Heart },
  { name: 'Analytics', href: '/seller/analytics', icon: BarChart3 },
  { name: 'Settings', href: '/seller/settings', icon: Settings },
];

export function SellerNavigation() {
  const pathname = usePathname();

  const isActive = (href: string) => {
    if (href === '/seller') {
      return pathname === href;
    }
    return pathname?.startsWith(href);
  };

  return (
    <aside className="hidden lg:block">
      <nav className="bg-card sticky top-24 space-y-1 rounded-lg border border-gray-200 bg-white p-4">
        {navigation.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.href);
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                'flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors',
                active
                  ? 'bg-forest-dark/10 text-forest-dark'
                  : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
              )}
            >
              <Icon className="size-5" />
              {item.name}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
