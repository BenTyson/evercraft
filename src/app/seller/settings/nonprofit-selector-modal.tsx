'use client';

import { useState, useEffect } from 'react';
import { getAvailableNonprofits } from '@/actions/seller-settings';
import { X, Search, ExternalLink, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Image from 'next/image';

interface Nonprofit {
  id: string;
  name: string;
  mission: string;
  logo: string | null;
  website: string | null;
  category: string[];
  ein: string | null;
}

interface NonprofitSelectorModalProps {
  onSelect: (nonprofit: Nonprofit) => void;
  onClose: () => void;
}

export default function NonprofitSelectorModal({ onSelect, onClose }: NonprofitSelectorModalProps) {
  const [nonprofits, setNonprofits] = useState<Nonprofit[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('');

  useEffect(() => {
    loadNonprofits();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedCategory]);

  const loadNonprofits = async () => {
    setLoading(true);
    const result = await getAvailableNonprofits({
      category: selectedCategory || undefined,
    });

    if (result.success && result.nonprofits) {
      setNonprofits(result.nonprofits);
    }
    setLoading(false);
  };

  const filteredNonprofits = nonprofits.filter((nonprofit) => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      nonprofit.name.toLowerCase().includes(query) ||
      nonprofit.mission.toLowerCase().includes(query)
    );
  });

  const categories = Array.from(
    new Set(nonprofits.flatMap((n) => n.category).filter(Boolean))
  ) as string[];

  return (
    <div className="bg-opacity-50 fixed inset-0 z-50 flex items-center justify-center bg-black p-4">
      <div className="max-h-[90vh] w-full max-w-4xl overflow-hidden rounded-lg bg-white shadow-xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b px-6 py-4">
          <div>
            <h2 className="text-xl font-bold text-gray-900">Select a Nonprofit</h2>
            <p className="mt-1 text-sm text-gray-600">
              Choose a nonprofit to partner with and support their mission
            </p>
          </div>
          <button
            onClick={onClose}
            className="rounded-md p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
          >
            <X className="size-5" />
          </button>
        </div>

        {/* Search and Filters */}
        <div className="border-b bg-gray-50 px-6 py-4">
          <div className="flex gap-4">
            {/* Search */}
            <div className="relative flex-1">
              <Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search by name or mission..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full rounded-md border border-gray-300 py-2 pr-4 pl-10 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none"
              />
            </div>

            {/* Category Filter */}
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="rounded-md border border-gray-300 px-4 py-2 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none"
            >
              <option value="">All Categories</option>
              {categories.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Nonprofit List */}
        <div className="max-h-96 overflow-y-auto px-6 py-4">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="size-8 animate-spin text-gray-400" />
            </div>
          ) : filteredNonprofits.length === 0 ? (
            <div className="py-12 text-center">
              <p className="text-gray-600">
                {searchQuery || selectedCategory
                  ? 'No nonprofits found matching your criteria'
                  : 'No nonprofits available'}
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredNonprofits.map((nonprofit) => (
                <div
                  key={nonprofit.id}
                  className="flex items-start gap-4 rounded-lg border border-gray-200 bg-white p-4 transition-shadow hover:shadow-md"
                >
                  {nonprofit.logo && (
                    <div className="relative size-16 flex-shrink-0 overflow-hidden rounded-lg bg-gray-100">
                      <Image
                        src={nonprofit.logo}
                        alt={nonprofit.name}
                        fill
                        className="object-cover"
                      />
                    </div>
                  )}
                  <div className="flex-1">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="font-semibold text-gray-900">{nonprofit.name}</h3>
                        {nonprofit.category && nonprofit.category.length > 0 && (
                          <span className="mt-1 inline-block rounded-full bg-blue-100 px-2 py-0.5 text-xs text-blue-800">
                            {nonprofit.category[0]}
                          </span>
                        )}
                      </div>
                      {nonprofit.website && (
                        <a
                          href={nonprofit.website}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1 text-sm text-blue-600 hover:text-blue-700"
                          onClick={(e) => e.stopPropagation()}
                        >
                          Website
                          <ExternalLink className="size-3" />
                        </a>
                      )}
                    </div>
                    <p className="mt-2 text-sm text-gray-600">{nonprofit.mission}</p>
                    {nonprofit.ein && (
                      <p className="mt-1 text-xs text-gray-500">EIN: {nonprofit.ein}</p>
                    )}
                    <Button
                      variant="outline"
                      size="sm"
                      className="mt-3"
                      onClick={() => onSelect(nonprofit)}
                    >
                      Select This Nonprofit
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t bg-gray-50 px-6 py-4">
          <div className="flex items-center justify-between text-sm text-gray-600">
            <p>
              {filteredNonprofits.length} nonprofit{filteredNonprofits.length !== 1 ? 's' : ''}{' '}
              available
            </p>
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
