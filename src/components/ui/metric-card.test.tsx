import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { DollarSign, Users, ShoppingCart, TrendingUp } from 'lucide-react';
import { MetricCard } from './metric-card';

describe('MetricCard', () => {
  describe('admin layout (default)', () => {
    it('renders title, value, and subtitle', () => {
      render(
        <MetricCard
          title="Total Revenue"
          value="$12,345"
          subtitle="Last 30 days"
          icon={DollarSign}
        />
      );

      expect(screen.getByText('Total Revenue')).toBeInTheDocument();
      expect(screen.getByText('$12,345')).toBeInTheDocument();
      expect(screen.getByText('Last 30 days')).toBeInTheDocument();
    });

    it('renders icon', () => {
      const { container } = render(
        <MetricCard title="Users" value={500} subtitle="Active users" icon={Users} />
      );

      expect(container.querySelector('svg')).toBeInTheDocument();
    });

    it('displays positive growth with up arrow', () => {
      render(
        <MetricCard
          title="Revenue"
          value="$10,000"
          subtitle="vs last month"
          icon={DollarSign}
          growth={15.5}
        />
      );

      expect(screen.getByText('+15.5%')).toBeInTheDocument();
      // Check for TrendingUp icon (green color indicator)
      expect(screen.getByText('+15.5%')).toHaveClass('text-green-600');
    });

    it('displays negative growth with down arrow', () => {
      render(
        <MetricCard
          title="Revenue"
          value="$8,000"
          subtitle="vs last month"
          icon={DollarSign}
          growth={-10.2}
        />
      );

      expect(screen.getByText('-10.2%')).toBeInTheDocument();
      expect(screen.getByText('-10.2%')).toHaveClass('text-red-600');
    });

    it('displays zero growth as positive', () => {
      render(
        <MetricCard
          title="Revenue"
          value="$5,000"
          subtitle="no change"
          icon={DollarSign}
          growth={0}
        />
      );

      expect(screen.getByText('+0.0%')).toBeInTheDocument();
      expect(screen.getByText('+0.0%')).toHaveClass('text-green-600');
    });

    it('applies custom icon colors', () => {
      const { container } = render(
        <MetricCard
          title="Orders"
          value={100}
          subtitle="Today"
          icon={ShoppingCart}
          iconColor="text-blue-600"
          iconBgColor="bg-blue-100"
        />
      );

      const iconWrapper = container.querySelector('.bg-blue-100');
      expect(iconWrapper).toBeInTheDocument();
    });

    it('adds clickable styles when clickable is true', () => {
      const { container } = render(
        <MetricCard
          title="Orders"
          value={100}
          subtitle="Click for details"
          icon={ShoppingCart}
          clickable
        />
      );

      expect(container.firstChild).toHaveClass('cursor-pointer');
    });

    it('applies custom className', () => {
      const { container } = render(
        <MetricCard
          title="Test"
          value={0}
          subtitle="Test"
          icon={DollarSign}
          className="custom-class"
        />
      );

      expect(container.firstChild).toHaveClass('custom-class');
    });
  });

  describe('seller layout', () => {
    it('renders with seller layout structure', () => {
      render(
        <MetricCard
          title="Total Sales"
          value="$5,000"
          subtitle="This month"
          icon={DollarSign}
          layout="seller"
        />
      );

      expect(screen.getByText('Total Sales')).toBeInTheDocument();
      expect(screen.getByText('$5,000')).toBeInTheDocument();
      expect(screen.getByText('This month')).toBeInTheDocument();
    });

    it('displays trend up indicator in seller layout', () => {
      render(
        <MetricCard
          title="Sales"
          value="$3,000"
          subtitle="+20% from last month"
          icon={TrendingUp}
          layout="seller"
          trend="up"
        />
      );

      expect(screen.getByText('+20% from last month')).toHaveClass('text-green-600');
    });

    it('displays trend down indicator in seller layout', () => {
      render(
        <MetricCard
          title="Sales"
          value="$2,000"
          subtitle="-10% from last month"
          icon={TrendingUp}
          layout="seller"
          trend="down"
        />
      );

      expect(screen.getByText('-10% from last month')).toHaveClass('text-red-600');
    });

    it('displays neutral subtitle without trend', () => {
      render(
        <MetricCard
          title="Sales"
          value="$2,500"
          subtitle="Steady performance"
          icon={DollarSign}
          layout="seller"
        />
      );

      expect(screen.getByText('Steady performance')).toHaveClass('text-gray-600');
    });
  });

  describe('numeric values', () => {
    it('renders numeric values correctly', () => {
      render(<MetricCard title="Items" value={1234} subtitle="In stock" icon={ShoppingCart} />);

      expect(screen.getByText('1234')).toBeInTheDocument();
    });

    it('handles zero values', () => {
      render(
        <MetricCard title="Pending" value={0} subtitle="No pending items" icon={ShoppingCart} />
      );

      expect(screen.getByText('0')).toBeInTheDocument();
    });
  });
});
