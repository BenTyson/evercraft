'use client';

import { useEffect, useState } from 'react';
import { formatDistanceToNow } from 'date-fns';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Heart,
  TrendingUp,
  DollarSign,
  Clock,
  Download,
  Loader2,
  ExternalLink,
  CheckCircle,
  Save,
  Search,
  X,
} from 'lucide-react';
import { getSellerImpact, exportSellerImpact } from '@/actions/seller-impact';
import { updateShopNonprofit, getAvailableNonprofits } from '@/actions/seller-settings';
import { Button } from '@/components/ui/button';

interface ImpactData {
  currentNonprofit: {
    id: string;
    name: string;
    logo: string | null;
    mission: string;
    website: string | null;
  } | null;
  donationPercentage: number;
  totalContributed: number;
  totalPaid: number;
  totalPending: number;
  donationCount: number;
  paidCount: number;
  pendingCount: number;
  nonprofitBreakdown: Array<{
    nonprofit: {
      id: string;
      name: string;
      logo: string | null;
    };
    totalAmount: number;
    donationCount: number;
    paidAmount: number;
    pendingAmount: number;
  }>;
  monthlyData: Array<{
    month: string;
    amount: number;
    count: number;
  }>;
  recentDonations: Array<{
    id: string;
    amount: number;
    status: string;
    createdAt: Date;
    orderNumber: string;
    nonprofit: {
      id: string;
      name: string;
      logo: string | null;
    };
  }>;
}

// Form validation schema
const nonprofitSchema = z.object({
  nonprofitId: z.string().nullable(),
  donationPercentage: z.number().min(0).max(100),
});

type NonprofitFormData = z.infer<typeof nonprofitSchema>;

// Nonprofit type for modal
interface Nonprofit {
  id: string;
  name: string;
  mission: string;
  logo: string | null;
  website: string | null;
  category: string[];
  ein: string | null;
}

// Nonprofit Selector Modal Component
function NonprofitSelectorModal({
  onSelect,
  onClose,
}: {
  onSelect: (nonprofit: Nonprofit) => void;
  onClose: () => void;
}) {
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

export function ImpactDashboard() {
  const router = useRouter();
  const [impact, setImpact] = useState<ImpactData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [exporting, setExporting] = useState(false);

  // Form states
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [selectedNonprofit, setSelectedNonprofit] = useState<{
    id: string;
    name: string;
    mission: string;
    logo: string | null;
    website: string | null;
  } | null>(null);

  // Initialize form with current nonprofit data
  const {
    register,
    handleSubmit,
    formState: { errors, isDirty },
    setValue,
    watch,
  } = useForm<NonprofitFormData>({
    resolver: zodResolver(nonprofitSchema),
    defaultValues: {
      nonprofitId: null,
      donationPercentage: 1.0,
    },
  });

  // Load impact data
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      setError(null);

      const result = await getSellerImpact();

      if (result.success && result.impact) {
        setImpact(result.impact);

        // Initialize form with current nonprofit data
        if (result.impact.currentNonprofit) {
          setSelectedNonprofit(result.impact.currentNonprofit);
          setValue('nonprofitId', result.impact.currentNonprofit.id);
        }
        setValue('donationPercentage', result.impact.donationPercentage);
      } else {
        setError(result.error || 'Failed to load impact data');
      }

      setLoading(false);
    };

    loadData();
  }, [setValue]);

  // Handle nonprofit selection from modal
  const handleSelectNonprofit = (nonprofit: Nonprofit) => {
    setSelectedNonprofit(nonprofit);
    setValue('nonprofitId', nonprofit.id, { shouldDirty: true });
    setShowModal(false);
  };

  // Handle removing nonprofit
  const handleRemoveNonprofit = () => {
    setSelectedNonprofit(null);
    setValue('nonprofitId', null, { shouldDirty: true });
  };

  // Handle form submission
  const onSubmit = async (data: NonprofitFormData) => {
    setIsSaving(true);
    setSaveError(null);
    setSuccessMessage(null);

    const result = await updateShopNonprofit({
      nonprofitId: data.nonprofitId,
      donationPercentage: data.donationPercentage,
    });

    setIsSaving(false);

    if (result.success) {
      setSuccessMessage('Nonprofit partnership updated successfully!');
      router.refresh();

      // Reload impact data to show updated nonprofit
      const impactResult = await getSellerImpact();
      if (impactResult.success && impactResult.impact) {
        setImpact(impactResult.impact);
      }

      setTimeout(() => setSuccessMessage(null), 3000);
    } else {
      setSaveError(result.error || 'Failed to update nonprofit partnership');
    }
  };

  const donationPercentage = watch('donationPercentage');

  // Handle export
  const handleExport = async () => {
    setExporting(true);

    try {
      const result = await exportSellerImpact();

      if (result.success && result.csvContent && result.filename) {
        // Create download link
        const blob = new Blob([result.csvContent], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = result.filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
      } else {
        alert(`Error: ${result.error || 'Failed to export'}`);
      }
    } catch (err) {
      alert(`Error: ${err instanceof Error ? err.message : 'Failed to export'}`);
    } finally {
      setExporting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="size-8 animate-spin text-gray-400" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 p-6 text-center">
        <p className="text-sm text-red-800">{error}</p>
      </div>
    );
  }

  if (!impact) {
    return (
      <div className="rounded-lg border border-gray-200 bg-white p-12 text-center">
        <p className="text-gray-600">No impact data available</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Nonprofit Configuration Form */}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="rounded-lg border border-gray-200 bg-white p-6">
          <div className="mb-4">
            <h2 className="text-xl font-bold text-gray-900">Nonprofit Partnership</h2>
            <p className="mt-1 text-sm text-gray-600">
              Partner with a nonprofit and donate a percentage of your sales to make a positive
              impact
            </p>
          </div>

          {/* Current Nonprofit Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700">Selected Nonprofit</label>

            {selectedNonprofit ? (
              <div className="mt-3 rounded-lg border border-gray-200 bg-gray-50 p-4">
                <div className="flex items-start gap-4">
                  {selectedNonprofit.logo && (
                    <div className="relative size-16 flex-shrink-0 overflow-hidden rounded-lg bg-gray-100">
                      <Image
                        src={selectedNonprofit.logo}
                        alt={selectedNonprofit.name}
                        fill
                        className="object-cover"
                      />
                    </div>
                  )}
                  <div className="flex-1">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="font-semibold text-gray-900">{selectedNonprofit.name}</h3>
                        <p className="mt-1 text-sm text-gray-600">{selectedNonprofit.mission}</p>
                      </div>
                      {selectedNonprofit.website && (
                        <a
                          href={selectedNonprofit.website}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1 text-sm text-blue-600 hover:text-blue-700"
                        >
                          Website
                          <ExternalLink className="size-3" />
                        </a>
                      )}
                    </div>
                    <div className="mt-3 flex gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => setShowModal(true)}
                      >
                        <Search className="mr-2 size-4" />
                        Change Nonprofit
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={handleRemoveNonprofit}
                      >
                        Remove
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="mt-3">
                <div className="rounded-lg border-2 border-dashed border-gray-300 bg-gray-50 p-8 text-center">
                  <Heart className="mx-auto size-12 text-gray-400" />
                  <h3 className="mt-2 text-sm font-medium text-gray-900">No nonprofit selected</h3>
                  <p className="mt-1 text-sm text-gray-500">
                    Choose a nonprofit to partner with and make a difference
                  </p>
                  <Button
                    type="button"
                    variant="outline"
                    className="mt-4"
                    onClick={() => setShowModal(true)}
                  >
                    <Search className="mr-2 size-4" />
                    Browse Nonprofits
                  </Button>
                </div>
              </div>
            )}
          </div>

          {/* Donation Percentage */}
          {selectedNonprofit && (
            <div className="mt-6">
              <label
                htmlFor="donationPercentage"
                className="block text-sm font-medium text-gray-700"
              >
                Donation Percentage
              </label>
              <p className="mt-1 text-xs text-gray-500">
                Percentage of each sale to donate to your selected nonprofit
              </p>

              <div className="mt-3">
                <div className="flex items-center gap-4">
                  <input
                    id="donationPercentage"
                    type="range"
                    min="0"
                    max="100"
                    step="1"
                    {...register('donationPercentage', { valueAsNumber: true })}
                    className="flex-1"
                  />
                  <div className="flex w-20 items-center gap-1">
                    <input
                      type="number"
                      min="0"
                      max="100"
                      {...register('donationPercentage', { valueAsNumber: true })}
                      className="w-full rounded-md border border-gray-300 px-2 py-1 text-center text-sm"
                    />
                    <span className="text-sm text-gray-600">%</span>
                  </div>
                </div>
                {errors.donationPercentage && (
                  <p className="mt-1 text-sm text-red-600">{errors.donationPercentage.message}</p>
                )}

                {/* Impact Preview */}
                <div className="mt-4 rounded-lg border border-pink-200 bg-pink-50 p-4">
                  <p className="text-sm font-medium text-pink-900">Impact Preview</p>
                  <div className="mt-2 space-y-1 text-sm text-pink-800">
                    <p>
                      On a <strong>$100 sale</strong>, you&apos;ll donate{' '}
                      <strong>${((donationPercentage / 100) * 100).toFixed(2)}</strong>
                    </p>
                    <p>
                      On a <strong>$1,000 sale</strong>, you&apos;ll donate{' '}
                      <strong>${((donationPercentage / 100) * 1000).toFixed(2)}</strong>
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Error Message */}
          {saveError && (
            <div className="mt-4 rounded-md bg-red-50 p-4">
              <p className="text-sm text-red-600">{saveError}</p>
            </div>
          )}

          {/* Success Message */}
          {successMessage && (
            <div className="mt-4 rounded-md bg-green-50 p-4">
              <p className="text-sm text-green-600">{successMessage}</p>
            </div>
          )}

          {/* Submit Button */}
          {selectedNonprofit && (
            <div className="mt-6 flex items-center justify-end">
              <Button type="submit" disabled={isSaving || !isDirty}>
                {isSaving ? (
                  <>
                    <Loader2 className="mr-2 size-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="mr-2 size-4" />
                    Save Changes
                  </>
                )}
              </Button>
            </div>
          )}
        </div>
      </form>

      {/* Summary Stats */}
      <div className="grid gap-6 md:grid-cols-3">
        {/* Total Contributed */}
        <div className="rounded-lg border border-gray-200 bg-white p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Contributed</p>
              <p className="mt-2 text-3xl font-bold text-gray-900">
                ${impact.totalContributed.toFixed(2)}
              </p>
              <p className="mt-1 text-xs text-gray-500">{impact.donationCount} donations</p>
            </div>
            <div className="rounded-full bg-gray-100 p-3">
              <DollarSign className="size-6 text-gray-600" />
            </div>
          </div>
        </div>

        {/* Paid Out */}
        <div className="rounded-lg border border-gray-200 bg-white p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Paid to Nonprofits</p>
              <p className="mt-2 text-3xl font-bold text-gray-900">
                ${impact.totalPaid.toFixed(2)}
              </p>
              <p className="mt-1 text-xs text-gray-500">{impact.paidCount} donations</p>
            </div>
            <div className="rounded-full bg-gray-100 p-3">
              <CheckCircle className="size-6 text-gray-600" />
            </div>
          </div>
        </div>

        {/* Pending */}
        <div className="rounded-lg border border-gray-200 bg-white p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Pending Payout</p>
              <p className="mt-2 text-3xl font-bold text-gray-900">
                ${impact.totalPending.toFixed(2)}
              </p>
              <p className="mt-1 text-xs text-gray-500">{impact.pendingCount} donations</p>
            </div>
            <div className="rounded-full bg-gray-100 p-3">
              <Clock className="size-6 text-gray-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Monthly Trend */}
      <div className="rounded-lg border border-gray-200 bg-white p-6">
        <div className="mb-6 flex items-center justify-between">
          <h3 className="text-lg font-bold text-gray-900">Monthly Contributions</h3>
          <TrendingUp className="size-5 text-gray-400" />
        </div>

        {/* Simple bar chart visualization */}
        <div className="space-y-3">
          {impact.monthlyData.map((month) => {
            const maxAmount = Math.max(...impact.monthlyData.map((m) => m.amount));
            const barWidth = maxAmount > 0 ? (month.amount / maxAmount) * 100 : 0;

            return (
              <div key={month.month}>
                <div className="mb-1 flex items-center justify-between text-sm">
                  <span className="font-medium text-gray-700">{month.month}</span>
                  <span className="font-semibold text-gray-900">${month.amount.toFixed(2)}</span>
                </div>
                <div className="h-2 w-full rounded-full bg-gray-100">
                  <div className="h-2 rounded-full bg-gray-400" style={{ width: `${barWidth}%` }} />
                </div>
                <p className="mt-1 text-xs text-gray-500">{month.count} donations</p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Nonprofit Breakdown (if multiple) */}
      {impact.nonprofitBreakdown.length > 1 && (
        <div className="rounded-lg border border-gray-200 bg-white p-6">
          <h3 className="mb-4 text-lg font-bold text-gray-900">Contributions by Nonprofit</h3>
          <div className="space-y-4">
            {impact.nonprofitBreakdown.map((breakdown) => (
              <div
                key={breakdown.nonprofit.id}
                className="flex items-center justify-between rounded-lg border border-gray-200 p-4"
              >
                <div className="flex items-center gap-3">
                  {breakdown.nonprofit.logo ? (
                    <Image
                      src={breakdown.nonprofit.logo}
                      alt={breakdown.nonprofit.name}
                      width={40}
                      height={40}
                      className="size-10 rounded-full object-cover"
                    />
                  ) : (
                    <div className="flex size-10 items-center justify-center rounded-full bg-gray-100">
                      <Heart className="size-5 text-gray-600" />
                    </div>
                  )}
                  <div>
                    <p className="font-semibold text-gray-900">{breakdown.nonprofit.name}</p>
                    <p className="text-sm text-gray-600">{breakdown.donationCount} donations</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-xl font-bold text-gray-900">
                    ${breakdown.totalAmount.toFixed(2)}
                  </p>
                  <p className="text-xs text-gray-500">
                    ${breakdown.paidAmount.toFixed(2)} paid · ${breakdown.pendingAmount.toFixed(2)}{' '}
                    pending
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recent Donations */}
      <div className="rounded-lg border border-gray-200 bg-white p-6">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-lg font-bold text-gray-900">Recent Donations</h3>
          <Button onClick={handleExport} disabled={exporting} variant="outline" size="sm">
            {exporting ? (
              <>
                <Loader2 className="mr-2 size-4 animate-spin" />
                Exporting...
              </>
            ) : (
              <>
                <Download className="mr-2 size-4" />
                Export CSV
              </>
            )}
          </Button>
        </div>

        {impact.recentDonations.length === 0 ? (
          <p className="py-8 text-center text-sm text-gray-500">
            No donations yet. Start selling to make an impact!
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="border-b border-gray-200 bg-gray-50 text-xs font-semibold tracking-wide text-gray-600 uppercase">
                <tr>
                  <th className="px-4 py-3 text-left">Date</th>
                  <th className="px-4 py-3 text-left">Order</th>
                  <th className="px-4 py-3 text-left">Nonprofit</th>
                  <th className="px-4 py-3 text-left">Status</th>
                  <th className="px-4 py-3 text-right">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {impact.recentDonations.map((donation) => (
                  <tr key={donation.id} className="text-sm">
                    <td className="px-4 py-3 text-gray-600">
                      {formatDistanceToNow(new Date(donation.createdAt), { addSuffix: true })}
                    </td>
                    <td className="px-4 py-3 font-medium text-gray-900">{donation.orderNumber}</td>
                    <td className="px-4 py-3 text-gray-700">{donation.nonprofit.name}</td>
                    <td className="px-4 py-3">
                      {donation.status === 'PAID' ? (
                        <span className="inline-flex items-center gap-1 rounded-full bg-green-100 px-2 py-1 text-xs font-semibold text-green-800">
                          <CheckCircle className="size-3" />
                          Paid
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 rounded-full bg-yellow-100 px-2 py-1 text-xs font-semibold text-yellow-800">
                          <Clock className="size-3" />
                          Pending
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-right font-semibold text-gray-900">
                      ${donation.amount.toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Impact Statement */}
      <div className="rounded-lg border border-gray-200 bg-gray-50 p-6">
        <h3 className="mb-2 font-bold text-gray-900">Impact Report Note</h3>
        <p className="text-sm text-gray-700">
          This report is for your records and marketing purposes. Evercraft facilitates your
          donations by consolidating contributions and distributing them to nonprofits on your
          behalf. Tax receipts are issued to Evercraft as the donor. You can use these metrics in
          your marketing materials to showcase your commitment to environmental causes.
        </p>
      </div>

      {/* Nonprofit Selector Modal */}
      {showModal && (
        <NonprofitSelectorModal
          onSelect={handleSelectNonprofit}
          onClose={() => setShowModal(false)}
        />
      )}
    </div>
  );
}
