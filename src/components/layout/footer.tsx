/**
 * Footer Component
 *
 * Site-wide footer with navigation links and copyright.
 */

import Link from 'next/link';
import { Leaf } from 'lucide-react';

export function Footer() {
  return (
    <footer className="border-t">
      <div className="container mx-auto px-4 py-12">
        <div className="grid gap-8 md:grid-cols-4">
          <div>
            <div className="mb-4 flex items-center gap-2">
              <Leaf className="text-forest-dark size-6" />
              <span className="text-lg font-bold">Evercraft</span>
            </div>
            <p className="text-muted-foreground text-sm">
              Marketplace for eco-conscious products and sustainable businesses.
            </p>
          </div>

          <div>
            <h4 className="mb-4 font-semibold">Shop</h4>
            <ul className="text-muted-foreground space-y-2 text-sm">
              <li>
                <Link href="/browse" className="hover:text-foreground transition-colors">
                  Browse Products
                </Link>
              </li>
              <li>
                <Link href="/categories" className="hover:text-foreground transition-colors">
                  Categories
                </Link>
              </li>
              <li>
                <Link href="/sellers" className="hover:text-foreground transition-colors">
                  Featured Sellers
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="mb-4 font-semibold">Company</h4>
            <ul className="text-muted-foreground space-y-2 text-sm">
              <li>
                <Link href="/about" className="hover:text-foreground transition-colors">
                  About Us
                </Link>
              </li>
              <li>
                <Link href="/impact" className="hover:text-foreground transition-colors">
                  Our Impact
                </Link>
              </li>
              <li>
                <Link href="/apply" className="hover:text-foreground transition-colors">
                  Sell on Evercraft
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="mb-4 font-semibold">Support</h4>
            <ul className="text-muted-foreground space-y-2 text-sm">
              <li>
                <Link href="/help" className="hover:text-foreground transition-colors">
                  Help Center
                </Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-foreground transition-colors">
                  Contact Us
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="hover:text-foreground transition-colors">
                  Privacy Policy
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="text-muted-foreground border-border mt-12 border-t pt-8 text-center text-sm">
          <p>&copy; {new Date().getFullYear()} Evercraft. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
