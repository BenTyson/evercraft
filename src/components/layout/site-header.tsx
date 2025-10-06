/**
 * SiteHeader Component
 *
 * Main navigation header for Evercraft marketplace.
 * Sticky header with logo, search, and navigation links.
 *
 * Features:
 * - Sticky positioning on scroll
 * - Search bar (desktop)
 * - Primary navigation links
 * - Cart and account icons
 * - Responsive mobile menu
 */

'use client';

import * as React from 'react';
import Link from 'next/link';
import { Search, ShoppingCart, User, Menu, X, Leaf } from 'lucide-react';

import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export function SiteHeader() {
  const [isScrolled, setIsScrolled] = React.useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);

  React.useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header
      className={cn(
        'bg-background/95 supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50 w-full border-b backdrop-blur transition-shadow',
        isScrolled && 'shadow-sm'
      )}
    >
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2">
          <Leaf className="text-forest-dark size-7" />
          <span className="text-foreground text-xl font-bold">Evercraft</span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden items-center gap-6 md:flex">
          <Link
            href="/browse"
            className="text-muted-foreground hover:text-foreground text-sm font-medium transition-colors"
          >
            Browse
          </Link>
          <Link
            href="/categories"
            className="text-muted-foreground hover:text-foreground text-sm font-medium transition-colors"
          >
            Categories
          </Link>
          <Link
            href="/impact"
            className="text-eco-dark hover:text-forest-dark text-sm font-semibold transition-colors"
          >
            Impact
          </Link>
          <Link
            href="/sell"
            className="text-muted-foreground hover:text-foreground text-sm font-medium transition-colors"
          >
            Sell on Evercraft
          </Link>
        </nav>

        {/* Desktop Search */}
        <div className="relative hidden max-w-md flex-1 px-8 md:block">
          <Search className="text-muted-foreground absolute top-1/2 left-11 size-4 -translate-y-1/2" />
          <Input
            type="search"
            placeholder="Search eco-friendly products..."
            className="w-full pl-9"
          />
        </div>

        {/* Desktop Actions */}
        <div className="hidden items-center gap-3 md:flex">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/account">
              <User className="size-5" />
              <span className="sr-only">Account</span>
            </Link>
          </Button>
          <Button variant="ghost" size="icon" asChild className="relative">
            <Link href="/cart">
              <ShoppingCart className="size-5" />
              <span className="bg-eco-dark absolute -top-1 -right-1 flex size-5 items-center justify-center rounded-full text-[10px] font-bold text-white">
                2
              </span>
              <span className="sr-only">Shopping cart (2 items)</span>
            </Link>
          </Button>
        </div>

        {/* Mobile Menu Toggle */}
        <Button
          variant="ghost"
          size="icon"
          className="md:hidden"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        >
          {isMobileMenuOpen ? <X className="size-6" /> : <Menu className="size-6" />}
          <span className="sr-only">Toggle menu</span>
        </Button>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="border-t md:hidden">
          <div className="container mx-auto space-y-4 px-4 py-4">
            {/* Mobile Search */}
            <div className="relative">
              <Search className="text-muted-foreground absolute top-1/2 left-3 size-4 -translate-y-1/2" />
              <Input type="search" placeholder="Search products..." className="w-full pl-9" />
            </div>

            {/* Mobile Navigation Links */}
            <nav className="flex flex-col space-y-3">
              <Link
                href="/browse"
                className="text-foreground hover:text-forest-dark text-base font-medium transition-colors"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Browse
              </Link>
              <Link
                href="/categories"
                className="text-foreground hover:text-forest-dark text-base font-medium transition-colors"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Categories
              </Link>
              <Link
                href="/impact"
                className="text-eco-dark hover:text-forest-dark text-base font-semibold transition-colors"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Impact
              </Link>
              <Link
                href="/sell"
                className="text-foreground hover:text-forest-dark text-base font-medium transition-colors"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Sell on Evercraft
              </Link>
              <div className="border-border border-t pt-3" />
              <Link
                href="/account"
                className="text-foreground hover:text-forest-dark flex items-center gap-2 text-base font-medium transition-colors"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <User className="size-5" />
                Account
              </Link>
              <Link
                href="/cart"
                className="text-foreground hover:text-forest-dark flex items-center gap-2 text-base font-medium transition-colors"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <ShoppingCart className="size-5" />
                Cart (2)
              </Link>
            </nav>
          </div>
        </div>
      )}
    </header>
  );
}
