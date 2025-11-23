import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Settings, User, Bell } from 'lucide-react';
import { TabsNavigation, Tab } from './tabs-navigation';

// Sample tabs for testing
const basicTabs: Tab<'tab1' | 'tab2' | 'tab3'>[] = [
  { id: 'tab1', name: 'First Tab' },
  { id: 'tab2', name: 'Second Tab' },
  { id: 'tab3', name: 'Third Tab' },
];

const tabsWithIcons: Tab<'settings' | 'profile' | 'notifications'>[] = [
  { id: 'settings', name: 'Settings', icon: Settings },
  { id: 'profile', name: 'Profile', icon: User },
  { id: 'notifications', name: 'Notifications', icon: Bell },
];

const tabsWithDescriptions: Tab<'account' | 'security'>[] = [
  { id: 'account', name: 'Account', icon: User, description: 'Manage your account settings' },
  {
    id: 'security',
    name: 'Security',
    icon: Settings,
    description: 'Password and security options',
  },
];

describe('TabsNavigation', () => {
  describe('horizontal variant (default)', () => {
    it('renders all tabs', () => {
      render(<TabsNavigation tabs={basicTabs} activeTab="tab1" onTabChange={() => {}} />);

      expect(screen.getByText('First Tab')).toBeInTheDocument();
      expect(screen.getByText('Second Tab')).toBeInTheDocument();
      expect(screen.getByText('Third Tab')).toBeInTheDocument();
    });

    it('marks active tab with aria-selected', () => {
      render(<TabsNavigation tabs={basicTabs} activeTab="tab2" onTabChange={() => {}} />);

      const activeTab = screen.getByRole('tab', { name: 'Second Tab' });
      const inactiveTab = screen.getByRole('tab', { name: 'First Tab' });

      expect(activeTab).toHaveAttribute('aria-selected', 'true');
      expect(inactiveTab).toHaveAttribute('aria-selected', 'false');
    });

    it('calls onTabChange when tab is clicked', async () => {
      const user = userEvent.setup();
      const handleChange = vi.fn();

      render(<TabsNavigation tabs={basicTabs} activeTab="tab1" onTabChange={handleChange} />);

      await user.click(screen.getByText('Third Tab'));

      expect(handleChange).toHaveBeenCalledTimes(1);
      expect(handleChange).toHaveBeenCalledWith('tab3');
    });

    it('renders icons when provided', () => {
      render(<TabsNavigation tabs={tabsWithIcons} activeTab="settings" onTabChange={() => {}} />);

      // Icons render as SVG elements inside buttons
      const buttons = screen.getAllByRole('tab');
      buttons.forEach((button) => {
        expect(button.querySelector('svg')).toBeInTheDocument();
      });
    });

    it('has correct aria-controls attribute', () => {
      render(<TabsNavigation tabs={basicTabs} activeTab="tab1" onTabChange={() => {}} />);

      const tab = screen.getByRole('tab', { name: 'First Tab' });
      expect(tab).toHaveAttribute('aria-controls', 'tab1-panel');
      expect(tab).toHaveAttribute('id', 'tab1-tab');
    });

    it('applies custom className', () => {
      const { container } = render(
        <TabsNavigation
          tabs={basicTabs}
          activeTab="tab1"
          onTabChange={() => {}}
          className="custom-class"
        />
      );

      expect(container.firstChild).toHaveClass('custom-class');
    });
  });

  describe('vertical variant', () => {
    it('renders all tabs in vertical layout', () => {
      render(
        <TabsNavigation
          tabs={basicTabs}
          activeTab="tab1"
          onTabChange={() => {}}
          variant="vertical"
        />
      );

      expect(screen.getByText('First Tab')).toBeInTheDocument();
      expect(screen.getByText('Second Tab')).toBeInTheDocument();
      expect(screen.getByText('Third Tab')).toBeInTheDocument();
    });

    it('displays descriptions in vertical variant', () => {
      render(
        <TabsNavigation
          tabs={tabsWithDescriptions}
          activeTab="account"
          onTabChange={() => {}}
          variant="vertical"
        />
      );

      expect(screen.getByText('Manage your account settings')).toBeInTheDocument();
      expect(screen.getByText('Password and security options')).toBeInTheDocument();
    });

    it('calls onTabChange when vertical tab is clicked', async () => {
      const user = userEvent.setup();
      const handleChange = vi.fn();

      render(
        <TabsNavigation
          tabs={tabsWithDescriptions}
          activeTab="account"
          onTabChange={handleChange}
          variant="vertical"
        />
      );

      await user.click(screen.getByText('Security'));

      expect(handleChange).toHaveBeenCalledWith('security');
    });

    it('marks active tab with correct aria-selected', () => {
      render(
        <TabsNavigation
          tabs={tabsWithDescriptions}
          activeTab="security"
          onTabChange={() => {}}
          variant="vertical"
        />
      );

      const activeTab = screen.getByRole('tab', { name: /Security/ });
      const inactiveTab = screen.getByRole('tab', { name: /Account/ });

      expect(activeTab).toHaveAttribute('aria-selected', 'true');
      expect(inactiveTab).toHaveAttribute('aria-selected', 'false');
    });
  });

  describe('type safety', () => {
    it('works with generic tab IDs', () => {
      type CustomTabId = 'overview' | 'details' | 'history';
      const customTabs: Tab<CustomTabId>[] = [
        { id: 'overview', name: 'Overview' },
        { id: 'details', name: 'Details' },
        { id: 'history', name: 'History' },
      ];

      const handleChange = vi.fn<[CustomTabId], void>();

      render(
        <TabsNavigation<CustomTabId>
          tabs={customTabs}
          activeTab="overview"
          onTabChange={handleChange}
        />
      );

      expect(screen.getByText('Overview')).toBeInTheDocument();
    });
  });
});
