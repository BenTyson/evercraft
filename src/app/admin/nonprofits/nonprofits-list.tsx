'use client';

import { useEffect, useState, useTransition, useCallback } from 'react';
import { formatDistanceToNow } from 'date-fns';
import Link from 'next/link';
import {
  Search,
  Heart,
  CheckCircle,
  XCircle,
  DollarSign,
  Store,
  Calendar,
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
import { AvatarWithFallback } from '@/components/ui/avatar-with-fallback';
import {
  TableContainer,
  TableHeader,
  TableHeaderCell,
  TableBody,
  TableRow,
  TableCell,
  TablePagination,
} from '@/components/ui/table';
import { formatCurrency } from '@/lib/format';
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
          <TableContainer className="border-0">
            <table className="w-full">
              <TableHeader className="border-b border-gray-200">
                <tr>
                  <TableHeaderCell className="px-6 py-3 text-xs font-semibold tracking-wider uppercase">
                    Nonprofit
                  </TableHeaderCell>
                  <TableHeaderCell className="px-6 py-3 text-xs font-semibold tracking-wider uppercase">
                    Status
                  </TableHeaderCell>
                  <TableHeaderCell className="px-6 py-3 text-xs font-semibold tracking-wider uppercase">
                    Total Donations
                  </TableHeaderCell>
                  <TableHeaderCell className="px-6 py-3 text-xs font-semibold tracking-wider uppercase">
                    Donations Count
                  </TableHeaderCell>
                  <TableHeaderCell className="px-6 py-3 text-xs font-semibold tracking-wider uppercase">
                    Shops Supporting
                  </TableHeaderCell>
                  <TableHeaderCell className="px-6 py-3 text-xs font-semibold tracking-wider uppercase">
                    Added
                  </TableHeaderCell>
                  <TableHeaderCell className="px-6 py-3 text-xs font-semibold tracking-wider uppercase">
                    Actions
                  </TableHeaderCell>
                </tr>
              </TableHeader>
              <TableBody className="divide-y divide-gray-200">
                {nonprofits.map((nonprofit) => (
                  <TableRow key={nonprofit.id}>
                    {/* Nonprofit Info */}
                    <TableCell className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <AvatarWithFallback
                          src={nonprofit.logo}
                          alt={nonprofit.name}
                          name={nonprofit.name}
                          size="md"
                          icon={Heart}
                        />
                        <div className="max-w-xs">
                          <p className="font-medium text-gray-900">{nonprofit.name}</p>
                          <p className="truncate text-sm text-gray-600">{nonprofit.mission}</p>
                          <p className="text-xs text-gray-500">EIN: {nonprofit.ein}</p>
                        </div>
                      </div>
                    </TableCell>

                    {/* Verification Status */}
                    <TableCell className="px-6 py-4">
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
                    </TableCell>

                    {/* Total Donations */}
                    <TableCell className="px-6 py-4">
                      <div className="flex items-center gap-2 text-sm">
                        <DollarSign className="size-4 text-gray-400" />
                        <span className="font-semibold text-gray-900">
                          {formatCurrency(nonprofit.totalDonations)}
                        </span>
                      </div>
                    </TableCell>

                    {/* Donation Count */}
                    <TableCell className="px-6 py-4">
                      <div className="text-sm">
                        <span className="font-semibold text-gray-900">
                          {nonprofit.donationCount}
                        </span>
                      </div>
                    </TableCell>

                    {/* Shops Supporting */}
                    <TableCell className="px-6 py-4">
                      <div className="flex items-center gap-2 text-sm">
                        <Store className="size-4 text-gray-400" />
                        <span className="text-gray-900">{nonprofit.shopsSupporting}</span>
                      </div>
                    </TableCell>

                    {/* Added Date */}
                    <TableCell className="px-6 py-4">
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Calendar className="size-4 text-gray-400" />
                        <span>
                          {formatDistanceToNow(new Date(nonprofit.createdAt), {
                            addSuffix: true,
                          })}
                        </span>
                      </div>
                    </TableCell>

                    {/* Actions */}
                    <TableCell className="px-6 py-4">
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
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </table>
          </TableContainer>
        )}
      </div>

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <TablePagination
          currentPage={pagination.page}
          totalPages={pagination.totalPages}
          totalCount={pagination.totalCount}
          pageSize={pagination.pageSize}
          onPageChange={setPage}
          loading={loading}
        />
      )}
    </div>
  );
}
