'use client';

import { useEffect, useState, useTransition, useCallback } from 'react';
import { formatDistanceToNow } from 'date-fns';
import Image from 'next/image';
import Link from 'next/link';
import {
  Search,
  Heart,
  CheckCircle,
  XCircle,
  DollarSign,
  Store,
  Calendar,
  ChevronLeft,
  ChevronRight,
  Plus,
  Pencil,
  Trash2,
  ShieldCheck,
  ShieldOff,
} from 'lucide-react';
import {
  getAllNonprofits,
  toggleNonprofitVerification,
  deleteNonprofit,
  type NonprofitWithStats,
} from '@/actions/admin-nonprofits';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

const VERIFICATION_OPTIONS = [
  { value: 'all', label: 'All Nonprofits' },
  { value: 'verified', label: 'Verified Only' },
  { value: 'unverified', label: 'Unverified Only' },
];

const SORT_OPTIONS = [
  { value: 'createdAt', label: 'Date Added' },
  { value: 'name', label: 'Name' },
  { value: 'donationsTotal', label: 'Total Donations' },
  { value: 'donationsCount', label: 'Donation Count' },
];

export function NonprofitsList() {
  const [nonprofits, setNonprofits] = useState<NonprofitWithStats[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  // Filters
  const [search, setSearch] = useState('');
  const [verificationFilter, setVerificationFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'name' | 'createdAt' | 'donationsTotal' | 'donationsCount'>(
    'createdAt'
  );
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({
    page: 1,
    pageSize: 50,
    totalCount: 0,
    totalPages: 0,
  });

  // Load nonprofits
  const loadNonprofits = useCallback(async () => {
    setLoading(true);
    setError(null);

    const result = await getAllNonprofits({
      search: search.trim() || undefined,
      isVerified:
        verificationFilter === 'verified'
          ? true
          : verificationFilter === 'unverified'
            ? false
            : undefined,
      sortBy,
      sortOrder,
      page,
      pageSize: 50,
    });

    if (result.success && result.nonprofits && result.pagination) {
      setNonprofits(result.nonprofits);
      setPagination(result.pagination);
    } else {
      setError(result.error || 'Failed to load nonprofits');
    }

    setLoading(false);
  }, [search, verificationFilter, sortBy, sortOrder, page]);

  // Load on mount and when filters change
  useEffect(() => {
    loadNonprofits();
  }, [loadNonprofits]);

  // Handle verification toggle
  const handleToggleVerification = async (nonprofitId: string, currentStatus: boolean) => {
    if (
      !confirm(`Are you sure you want to ${currentStatus ? 'unverify' : 'verify'} this nonprofit?`)
    ) {
      return;
    }

    startTransition(async () => {
      const result = await toggleNonprofitVerification(nonprofitId);

      if (result.success) {
        await loadNonprofits();
      } else {
        alert(result.error || 'Failed to update verification status');
      }
    });
  };

  // Handle delete
  const handleDelete = async (nonprofitId: string, nonprofitName: string) => {
    if (
      !confirm(`Are you sure you want to delete "${nonprofitName}"? This action cannot be undone.`)
    ) {
      return;
    }

    startTransition(async () => {
      const result = await deleteNonprofit(nonprofitId);

      if (result.success) {
        await loadNonprofits();
      } else {
        alert(result.error || 'Failed to delete nonprofit');
      }
    });
  };

  // Reset to first page when filters change
  useEffect(() => {
    setPage(1);
  }, [search, verificationFilter, sortBy]);

  return (
    <div className="space-y-6">
      {/* Filters Bar */}
      <div className="rounded-lg border border-gray-200 bg-white p-4">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute top-1/2 left-3 size-5 -translate-y-1/2 text-gray-400" />
            <Input
              type="text"
              placeholder="Search by name, EIN, or mission..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Verification Filter */}
          <Select value={verificationFilter} onValueChange={setVerificationFilter}>
            <SelectTrigger>
              <SelectValue placeholder="Filter by verification" />
            </SelectTrigger>
            <SelectContent>
              {VERIFICATION_OPTIONS.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Sort By */}
          <Select
            value={sortBy}
            onValueChange={(value) =>
              setSortBy(value as 'name' | 'createdAt' | 'donationsTotal' | 'donationsCount')
            }
          >
            <SelectTrigger>
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              {SORT_OPTIONS.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Sort Order */}
          <Select
            value={sortOrder}
            onValueChange={(value) => setSortOrder(value as 'asc' | 'desc')}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="desc">Descending</SelectItem>
              <SelectItem value="asc">Ascending</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Results Summary and Add Button */}
        <div className="mt-4 flex items-center justify-between">
          <div className="text-sm text-gray-600">
            Showing {nonprofits.length} of {pagination.totalCount} nonprofits
          </div>
          <Button asChild>
            <Link href="/admin/nonprofits/new">
              <Plus className="mr-2 size-4" />
              Add Nonprofit
            </Link>
          </Button>
        </div>
      </div>

      {/* Nonprofits Table */}
      <div className="overflow-hidden rounded-lg border border-gray-200 bg-white">
        {loading ? (
          <div className="p-12 text-center text-gray-500">Loading nonprofits...</div>
        ) : error ? (
          <div className="p-12 text-center text-red-600">{error}</div>
        ) : nonprofits.length === 0 ? (
          <div className="p-12 text-center text-gray-500">No nonprofits found</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="border-b border-gray-200 bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-semibold tracking-wider text-gray-600 uppercase">
                    Nonprofit
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold tracking-wider text-gray-600 uppercase">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold tracking-wider text-gray-600 uppercase">
                    Total Donations
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold tracking-wider text-gray-600 uppercase">
                    Donations Count
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold tracking-wider text-gray-600 uppercase">
                    Shops Supporting
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold tracking-wider text-gray-600 uppercase">
                    Added
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold tracking-wider text-gray-600 uppercase">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {nonprofits.map((nonprofit) => (
                  <tr key={nonprofit.id} className="hover:bg-gray-50">
                    {/* Nonprofit Info */}
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        {nonprofit.logo ? (
                          <Image
                            src={nonprofit.logo}
                            alt={nonprofit.name}
                            width={40}
                            height={40}
                            className="size-10 rounded-full object-cover"
                          />
                        ) : (
                          <div className="flex size-10 items-center justify-center rounded-full bg-pink-100">
                            <Heart className="size-5 text-pink-600" />
                          </div>
                        )}
                        <div className="max-w-xs">
                          <p className="font-medium text-gray-900">{nonprofit.name}</p>
                          <p className="truncate text-sm text-gray-600">{nonprofit.mission}</p>
                          <p className="text-xs text-gray-500">EIN: {nonprofit.ein}</p>
                        </div>
                      </div>
                    </td>

                    {/* Verification Status */}
                    <td className="px-6 py-4">
                      {nonprofit.isVerified ? (
                        <span className="inline-flex items-center gap-1.5 rounded-full bg-green-100 px-2.5 py-1 text-xs font-semibold text-green-800">
                          <CheckCircle className="size-3.5" />
                          Verified
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 rounded-full bg-gray-100 px-2.5 py-1 text-xs font-semibold text-gray-800">
                          <XCircle className="size-3.5" />
                          Unverified
                        </span>
                      )}
                    </td>

                    {/* Total Donations */}
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 text-sm">
                        <DollarSign className="size-4 text-gray-400" />
                        <span className="font-semibold text-gray-900">
                          $
                          {nonprofit.totalDonations.toLocaleString('en-US', {
                            minimumFractionDigits: 2,
                          })}
                        </span>
                      </div>
                    </td>

                    {/* Donation Count */}
                    <td className="px-6 py-4">
                      <div className="text-sm">
                        <span className="font-semibold text-gray-900">
                          {nonprofit.donationCount}
                        </span>
                      </div>
                    </td>

                    {/* Shops Supporting */}
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 text-sm">
                        <Store className="size-4 text-gray-400" />
                        <span className="text-gray-900">{nonprofit.shopsSupporting}</span>
                      </div>
                    </td>

                    {/* Added Date */}
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Calendar className="size-4 text-gray-400" />
                        <span>
                          {formatDistanceToNow(new Date(nonprofit.createdAt), {
                            addSuffix: true,
                          })}
                        </span>
                      </div>
                    </td>

                    {/* Actions */}
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        {/* Toggle Verification */}
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() =>
                            handleToggleVerification(nonprofit.id, nonprofit.isVerified)
                          }
                          disabled={isPending}
                          title={nonprofit.isVerified ? 'Unverify nonprofit' : 'Verify nonprofit'}
                        >
                          {nonprofit.isVerified ? (
                            <ShieldOff className="size-4" />
                          ) : (
                            <ShieldCheck className="size-4" />
                          )}
                        </Button>

                        {/* Edit */}
                        <Button variant="outline" size="sm" asChild title="Edit nonprofit">
                          <Link href={`/admin/nonprofits/${nonprofit.id}/edit`}>
                            <Pencil className="size-4" />
                          </Link>
                        </Button>

                        {/* Delete */}
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDelete(nonprofit.id, nonprofit.name)}
                          disabled={isPending}
                          title="Delete nonprofit"
                        >
                          <Trash2 className="size-4 text-red-600" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <div className="flex items-center justify-between rounded-lg border border-gray-200 bg-white px-6 py-4">
          <div className="text-sm text-gray-600">
            Page {pagination.page} of {pagination.totalPages}
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1 || loading}
            >
              <ChevronLeft className="mr-1 size-4" />
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((p) => Math.min(pagination.totalPages, p + 1))}
              disabled={page === pagination.totalPages || loading}
            >
              Next
              <ChevronRight className="ml-1 size-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
