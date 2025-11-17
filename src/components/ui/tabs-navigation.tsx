/**
 * TabsNavigation Component
 *
 * Flexible tab navigation component supporting multiple layouts:
 * - Horizontal: Bottom-border tabs (analytics, finance pages)
 * - Vertical: Sidebar tabs with descriptions (settings pages)
 *
 * Features:
 * - Icon support
 * - Optional descriptions
 * - Keyboard navigation
 * - Active state management
 * - TypeScript generic for type-safe tab IDs
 */

'use client';

import { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface Tab<T extends string = string> {
  id: T;
  name: string;
  icon?: LucideIcon;
  description?: string;
}

interface TabsNavigationProps<T extends string> {
  tabs: Tab<T>[];
  activeTab: T;
  onTabChange: (tabId: T) => void;
  variant?: 'horizontal' | 'vertical';
  className?: string;
}

export function TabsNavigation<T extends string>({
  tabs,
  activeTab,
  onTabChange,
  variant = 'horizontal',
  className,
}: TabsNavigationProps<T>) {
  // Horizontal variant (Analytics, Finance)
  if (variant === 'horizontal') {
    return (
      <div className={cn('border-b border-gray-200', className)}>
        <nav className="-mb-px flex space-x-8 overflow-x-auto">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;

            return (
              <button
                key={tab.id}
                onClick={() => onTabChange(tab.id)}
                className={cn(
                  'flex items-center gap-2 border-b-2 px-1 py-4 text-sm font-medium whitespace-nowrap transition-colors',
                  isActive
                    ? 'border-forest-dark text-forest-dark'
                    : 'border-transparent text-gray-600 hover:border-gray-300 hover:text-gray-900'
                )}
                role="tab"
                aria-selected={isActive}
                aria-controls={`${tab.id}-panel`}
                id={`${tab.id}-tab`}
              >
                {Icon && <Icon className="size-5" />}
                {tab.name}
              </button>
            );
          })}
        </nav>
      </div>
    );
  }

  // Vertical variant (Settings)
  return (
    <nav className={cn('space-y-1', className)}>
      {tabs.map((tab) => {
        const Icon = tab.icon;
        const isActive = activeTab === tab.id;

        return (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={cn(
              'flex w-full items-start gap-3 rounded-lg px-4 py-3 text-left transition-colors',
              isActive ? 'bg-forest-dark/10 text-forest-dark' : 'text-gray-700 hover:bg-gray-100'
            )}
            role="tab"
            aria-selected={isActive}
            aria-controls={`${tab.id}-panel`}
            id={`${tab.id}-tab`}
          >
            {Icon && (
              <Icon
                className={cn(
                  'mt-0.5 size-5 flex-shrink-0',
                  isActive ? 'text-forest-dark' : 'text-gray-400'
                )}
              />
            )}
            <div className="flex-1">
              <p
                className={cn(
                  'text-sm font-medium',
                  isActive ? 'text-forest-dark' : 'text-gray-900'
                )}
              >
                {tab.name}
              </p>
              {tab.description && <p className="mt-0.5 text-xs text-gray-600">{tab.description}</p>}
            </div>
          </button>
        );
      })}
    </nav>
  );
}
