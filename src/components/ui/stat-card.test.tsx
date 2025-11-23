import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { StatCard } from './stat-card';

describe('StatCard', () => {
  describe('basic rendering', () => {
    it('renders title and value', () => {
      render(<StatCard title="Total Orders" value={150} />);

      expect(screen.getByText('Total Orders')).toBeInTheDocument();
      expect(screen.getByText('150')).toBeInTheDocument();
    });

    it('renders string values', () => {
      render(<StatCard title="Revenue" value="$12,345.67" />);

      expect(screen.getByText('$12,345.67')).toBeInTheDocument();
    });

    it('renders subtitle when provided', () => {
      render(<StatCard title="Active Users" value={500} subtitle="Last 7 days" />);

      expect(screen.getByText('Last 7 days')).toBeInTheDocument();
    });

    it('does not render subtitle section when not provided', () => {
      render(<StatCard title="Count" value={10} />);

      // Should not have subtitle text
      expect(screen.queryByText(/days|month|week/i)).not.toBeInTheDocument();
    });
  });

  describe('trend indicator', () => {
    it('renders upward trend with green color', () => {
      render(<StatCard title="Sales" value="$5,000" trend={{ direction: 'up', label: '+15%' }} />);

      const trendLabel = screen.getByText('+15%');
      expect(trendLabel).toBeInTheDocument();
      expect(trendLabel).toHaveClass('text-green-600');
    });

    it('renders downward trend with red color', () => {
      render(
        <StatCard title="Visitors" value={1200} trend={{ direction: 'down', label: '-8%' }} />
      );

      const trendLabel = screen.getByText('-8%');
      expect(trendLabel).toBeInTheDocument();
      expect(trendLabel).toHaveClass('text-red-600');
    });

    it('renders trend with subtitle together', () => {
      render(
        <StatCard
          title="Revenue"
          value="$10,000"
          subtitle="vs last month"
          trend={{ direction: 'up', label: '+20%' }}
        />
      );

      expect(screen.getByText('+20%')).toBeInTheDocument();
      expect(screen.getByText('vs last month')).toBeInTheDocument();
    });
  });

  describe('styling', () => {
    it('applies custom className', () => {
      const { container } = render(<StatCard title="Test" value={0} className="custom-class" />);

      expect(container.firstChild).toHaveClass('custom-class');
    });

    it('adds clickable styles when clickable is true', () => {
      const { container } = render(<StatCard title="Clickable Card" value={100} clickable />);

      expect(container.firstChild).toHaveClass('cursor-pointer');
    });

    it('does not add clickable styles by default', () => {
      const { container } = render(<StatCard title="Non-clickable" value={50} />);

      expect(container.firstChild).not.toHaveClass('cursor-pointer');
    });
  });

  describe('edge cases', () => {
    it('handles zero values', () => {
      render(<StatCard title="Pending" value={0} />);

      expect(screen.getByText('0')).toBeInTheDocument();
    });

    it('handles empty string values', () => {
      render(<StatCard title="Empty" value="" />);

      // Value container exists but is empty
      expect(screen.getByText('Empty')).toBeInTheDocument();
    });

    it('handles large numbers', () => {
      render(<StatCard title="Views" value={1000000} />);

      expect(screen.getByText('1000000')).toBeInTheDocument();
    });

    it('handles formatted currency strings', () => {
      render(<StatCard title="Balance" value="$1,234,567.89" />);

      expect(screen.getByText('$1,234,567.89')).toBeInTheDocument();
    });
  });
});
