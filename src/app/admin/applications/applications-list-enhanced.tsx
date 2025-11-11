'use client';

import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import {
  CheckCircle,
  XCircle,
  Eye,
  Loader2,
  Sparkles,
  AlertTriangle,
  Clock,
  Filter,
  ArrowUpDown,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { updateApplicationStatus } from '@/actions/seller-application';
import { getTierColor, getRedFlags } from '@/lib/application-scoring';
import type { ApplicationTier } from '@/lib/application-scoring';

interface Application {
  id: string;
  businessName: string;
  businessEmail?: string | null;
  businessWebsite?: string | null;
  businessDescription: string;
  businessAge?: string | null;
  storefronts?: Record<string, unknown> | null;
  ecoQuestions: Record<string, unknown>;
  shopEcoProfileData?: Record<string, unknown>;
  ecoCommentary?: Record<string, unknown> | null;
  donationPercentage: number;
  status: string;
  createdAt: Date;
  reviewNotes?: string | null;
  // Smart Gate fields
  completenessScore: number;
  tier: string; // Will be cast to ApplicationTier
  autoApprovalEligible: boolean;
  rejectionReason?: string | null;
  user: {
    id: string;
    name: string | null;
    email: string | null;
  };
}

interface ApplicationsListProps {
  applications: Application[];
}

type FilterType = 'all' | 'certified' | 'verified' | 'starter' | 'auto-approved';
type SortType = 'score-desc' | 'score-asc' | 'date-desc' | 'date-asc';

export function ApplicationsListEnhanced({
  applications: initialApplications,
}: ApplicationsListProps) {
  const router = useRouter();
  const [applications, setApplications] = useState(initialApplications);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [reviewNotes, setReviewNotes] = useState<Record<string, string>>({});
  const [filterType, setFilterType] = useState<FilterType>('all');
  const [sortType, setSortType] = useState<SortType>('score-desc');

  // Filter and sort applications
  const filteredAndSortedApps = useMemo(() => {
    const filtered = applications.filter((app) => {
      if (filterType === 'all') return true;
      if (filterType === 'auto-approved') return app.autoApprovalEligible;
      return app.tier === filterType;
    });

    return filtered.sort((a, b) => {
      switch (sortType) {
        case 'score-desc':
          return b.completenessScore - a.completenessScore;
        case 'score-asc':
          return a.completenessScore - b.completenessScore;
        case 'date-desc':
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        case 'date-asc':
          return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
        default:
          return 0;
      }
    });
  }, [applications, filterType, sortType]);

  // Group by status
  const pendingApplications = filteredAndSortedApps.filter((app) => app.status === 'PENDING');
  const reviewingApplications = filteredAndSortedApps.filter(
    (app) => app.status === 'UNDER_REVIEW'
  );
  const processedApplications = filteredAndSortedApps.filter(
    (app) => app.status === 'APPROVED' || app.status === 'REJECTED'
  );

  // Count by tier
  const tierCounts = {
    certified: applications.filter((a) => a.tier === 'certified').length,
    verified: applications.filter((a) => a.tier === 'verified').length,
    starter: applications.filter((a) => a.tier === 'starter').length,
    autoApproved: applications.filter((a) => a.autoApprovalEligible).length,
  };

  const handleApprove = async (applicationId: string) => {
    setProcessingId(applicationId);
    const result = await updateApplicationStatus(
      applicationId,
      'APPROVED',
      reviewNotes[applicationId]
    );

    if (result.success) {
      setApplications((prev) =>
        prev.map((app) => (app.id === applicationId ? { ...app, status: 'APPROVED' } : app))
      );
      router.refresh();
    }

    setProcessingId(null);
  };

  const handleReject = async (applicationId: string) => {
    if (!reviewNotes[applicationId]) {
      alert('Please provide review notes before rejecting');
      return;
    }

    setProcessingId(applicationId);
    const result = await updateApplicationStatus(
      applicationId,
      'REJECTED',
      reviewNotes[applicationId]
    );

    if (result.success) {
      setApplications((prev) =>
        prev.map((app) => (app.id === applicationId ? { ...app, status: 'REJECTED' } : app))
      );
      router.refresh();
    }

    setProcessingId(null);
  };

  const getStatusBadge = (status: string) => {
    const badges = {
      PENDING: 'bg-yellow-50 text-yellow-700 border-yellow-200',
      UNDER_REVIEW: 'bg-blue-50 text-blue-700 border-blue-200',
      APPROVED: 'bg-green-50 text-green-700 border-green-200',
      REJECTED: 'bg-red-50 text-red-700 border-red-200',
    };
    return badges[status as keyof typeof badges] || 'bg-gray-50 text-gray-700 border-gray-200';
  };

  return (
    <div className="space-y-6">
      {/* Filters and Sorting */}
      <div className="rounded-lg border border-gray-200 bg-white p-4">
        <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
          {/* Tier Filters */}
          <div className="flex flex-wrap gap-2">
            <Button
              variant={filterType === 'all' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilterType('all')}
              className={filterType === 'all' ? 'bg-gray-900 hover:bg-gray-800' : ''}
            >
              <Filter className="mr-2 size-4" />
              All ({applications.length})
            </Button>
            <Button
              variant={filterType === 'certified' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilterType('certified')}
              className={filterType === 'certified' ? 'bg-gray-900 hover:bg-gray-800' : ''}
            >
              Certified ({tierCounts.certified})
            </Button>
            <Button
              variant={filterType === 'verified' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilterType('verified')}
              className={filterType === 'verified' ? 'bg-gray-900 hover:bg-gray-800' : ''}
            >
              Verified ({tierCounts.verified})
            </Button>
            <Button
              variant={filterType === 'starter' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilterType('starter')}
              className={filterType === 'starter' ? 'bg-gray-900 hover:bg-gray-800' : ''}
            >
              Starter ({tierCounts.starter})
            </Button>
            <Button
              variant={filterType === 'auto-approved' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilterType('auto-approved')}
              className={filterType === 'auto-approved' ? 'bg-gray-900 hover:bg-gray-800' : ''}
            >
              <Sparkles className="mr-2 size-4" />
              Auto-Approved ({tierCounts.autoApproved})
            </Button>
          </div>

          {/* Sort Dropdown */}
          <div className="flex items-center gap-2">
            <ArrowUpDown className="size-4 text-gray-500" />
            <select
              value={sortType}
              onChange={(e) => setSortType(e.target.value as SortType)}
              className="focus:ring-forest-light rounded-md border border-gray-300 px-3 py-1.5 text-sm focus:ring-2 focus:outline-none"
            >
              <option value="score-desc">Score: High to Low</option>
              <option value="score-asc">Score: Low to High</option>
              <option value="date-desc">Date: Newest First</option>
              <option value="date-asc">Date: Oldest First</option>
            </select>
          </div>
        </div>
      </div>

      {/* Pending Applications */}
      {pendingApplications.length > 0 && (
        <div>
          <h2 className="mb-4 text-xl font-semibold text-gray-900">
            Pending Review ({pendingApplications.length})
          </h2>
          <div className="space-y-4">
            {pendingApplications.map((app) => (
              <ApplicationCard
                key={app.id}
                application={app}
                expanded={expandedId === app.id}
                onToggleExpand={() => setExpandedId(expandedId === app.id ? null : app.id)}
                onApprove={handleApprove}
                onReject={handleReject}
                processing={processingId === app.id}
                reviewNotes={reviewNotes[app.id] || ''}
                onReviewNotesChange={(notes) =>
                  setReviewNotes((prev) => ({ ...prev, [app.id]: notes }))
                }
                getStatusBadge={getStatusBadge}
              />
            ))}
          </div>
        </div>
      )}

      {/* Under Review */}
      {reviewingApplications.length > 0 && (
        <div>
          <h2 className="mb-4 text-xl font-semibold text-gray-900">
            Under Review ({reviewingApplications.length})
          </h2>
          <div className="space-y-4">
            {reviewingApplications.map((app) => (
              <ApplicationCard
                key={app.id}
                application={app}
                expanded={expandedId === app.id}
                onToggleExpand={() => setExpandedId(expandedId === app.id ? null : app.id)}
                onApprove={handleApprove}
                onReject={handleReject}
                processing={processingId === app.id}
                reviewNotes={reviewNotes[app.id] || ''}
                onReviewNotesChange={(notes) =>
                  setReviewNotes((prev) => ({ ...prev, [app.id]: notes }))
                }
                getStatusBadge={getStatusBadge}
              />
            ))}
          </div>
        </div>
      )}

      {/* Processed Applications */}
      {processedApplications.length > 0 && (
        <div>
          <h2 className="mb-4 text-xl font-semibold text-gray-900">
            Processed ({processedApplications.length})
          </h2>
          <div className="space-y-4">
            {processedApplications.map((app) => (
              <ApplicationCard
                key={app.id}
                application={app}
                expanded={expandedId === app.id}
                onToggleExpand={() => setExpandedId(expandedId === app.id ? null : app.id)}
                onApprove={handleApprove}
                onReject={handleReject}
                processing={processingId === app.id}
                reviewNotes={reviewNotes[app.id] || app.reviewNotes || ''}
                onReviewNotesChange={(notes) =>
                  setReviewNotes((prev) => ({ ...prev, [app.id]: notes }))
                }
                getStatusBadge={getStatusBadge}
              />
            ))}
          </div>
        </div>
      )}

      {filteredAndSortedApps.length === 0 && (
        <div className="py-12 text-center text-gray-500">No applications match your filters</div>
      )}
    </div>
  );
}

interface ApplicationCardProps {
  application: Application;
  expanded: boolean;
  onToggleExpand: () => void;
  onApprove: (id: string) => void;
  onReject: (id: string) => void;
  processing: boolean;
  reviewNotes: string;
  onReviewNotesChange: (notes: string) => void;
  getStatusBadge: (status: string) => string;
}

function ApplicationCard({
  application,
  expanded,
  onToggleExpand,
  onApprove,
  onReject,
  processing,
  reviewNotes,
  onReviewNotesChange,
  getStatusBadge,
}: ApplicationCardProps) {
  const tierColors = getTierColor(application.tier as ApplicationTier);
  const redFlags = getRedFlags(application.businessDescription);
  const hasEcoProfileData =
    application.shopEcoProfileData && Object.keys(application.shopEcoProfileData).length > 0;

  // Calculate estimated review time
  let estimatedTime = 'Standard review';
  if (application.autoApprovalEligible) estimatedTime = 'Instant approval';
  else if (application.tier === 'verified') estimatedTime = '24 hours';
  else if (application.tier === 'starter') estimatedTime = '3-5 days';

  return (
    <div className="overflow-hidden rounded-lg border border-gray-200 bg-white transition-shadow hover:shadow-md">
      {/* Score Banner */}
      <div className={`${tierColors.bg} border-b ${tierColors.border} px-6 py-3`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            {/* Score Circle */}
            <div className="flex items-center gap-3">
              <div className="relative size-14">
                <svg className="size-14 -rotate-90 transform">
                  <circle
                    cx="28"
                    cy="28"
                    r="24"
                    stroke="currentColor"
                    strokeWidth="4"
                    fill="none"
                    className="text-neutral-200"
                  />
                  <circle
                    cx="28"
                    cy="28"
                    r="24"
                    stroke="currentColor"
                    strokeWidth="4"
                    fill="none"
                    strokeDasharray={`${2 * Math.PI * 24}`}
                    strokeDashoffset={`${2 * Math.PI * 24 * (1 - application.completenessScore / 100)}`}
                    className={tierColors.text}
                    strokeLinecap="round"
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className={`text-sm font-bold ${tierColors.text}`}>
                    {application.completenessScore}%
                  </span>
                </div>
              </div>

              <div>
                <div className="flex items-center gap-2">
                  <span className="text-lg font-semibold text-gray-900">
                    {application.tier.charAt(0).toUpperCase() + application.tier.slice(1)} Tier
                  </span>
                  {application.autoApprovalEligible && (
                    <span className="rounded-full bg-slate-900 px-2 py-0.5 text-xs font-medium text-white">
                      <Sparkles className="mr-1 inline size-3" />
                      Auto-Approved
                    </span>
                  )}
                </div>
                <div className="mt-1 flex items-center gap-2 text-sm text-gray-600">
                  <Clock className="size-3.5" />
                  <span>{estimatedTime}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Red Flags Warning */}
          {redFlags.length > 0 && (
            <div className="flex items-center gap-2 rounded-md border border-red-200 bg-red-50 px-3 py-1.5">
              <AlertTriangle className="size-4 text-red-600" />
              <span className="text-xs font-medium text-red-700">
                {redFlags.length} Red Flag{redFlags.length > 1 ? 's' : ''}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="p-6">
        <div className="mb-4 flex items-start justify-between">
          <div className="flex-1">
            <div className="mb-2 flex items-center gap-3">
              <h3 className="text-xl font-semibold text-gray-900">{application.businessName}</h3>
              <span
                className={`inline-flex items-center rounded-full border px-3 py-0.5 text-xs font-medium ${getStatusBadge(application.status)}`}
              >
                {application.status.replace('_', ' ')}
              </span>
            </div>
            <p className="mb-1 text-sm text-gray-600">
              {application.user.name || application.user.email}
            </p>
            <p className="text-xs text-gray-500">
              Applied {new Date(application.createdAt).toLocaleDateString()}
            </p>
          </div>

          <Button variant="outline" size="sm" onClick={onToggleExpand}>
            <Eye className="mr-2 size-4" />
            {expanded ? 'Hide' : 'View'} Details
          </Button>
        </div>

        {/* Preview - Business Description */}
        {!expanded && (
          <p className="line-clamp-2 text-sm text-gray-700">{application.businessDescription}</p>
        )}

        {/* Expanded Details */}
        {expanded && (
          <div className="mt-6 space-y-6 border-t border-gray-200 pt-6">
            {/* Red Flags Detail */}
            {redFlags.length > 0 && (
              <div className="rounded-lg border border-red-200 bg-red-50 p-4">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="mt-0.5 size-5 text-red-600" />
                  <div className="flex-1">
                    <h4 className="mb-2 text-sm font-semibold text-red-900">Red Flags Detected</h4>
                    <ul className="space-y-1">
                      {redFlags.map((flag, idx) => (
                        <li key={idx} className="text-sm text-red-700">
                          • Contains &quot;{flag}&quot;
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            )}

            <div>
              <h4 className="mb-2 text-sm font-semibold text-gray-900">Business Description</h4>
              <p className="text-sm text-gray-700">{application.businessDescription}</p>
            </div>

            {application.businessEmail && (
              <div>
                <h4 className="mb-2 text-sm font-semibold text-gray-900">Business Email</h4>
                <a
                  href={`mailto:${application.businessEmail}`}
                  className="text-forest-dark text-sm hover:underline"
                >
                  {application.businessEmail}
                </a>
              </div>
            )}

            {application.businessAge && (
              <div>
                <h4 className="mb-2 text-sm font-semibold text-gray-900">Years in Business</h4>
                <p className="text-sm text-gray-700">{application.businessAge}</p>
              </div>
            )}

            {application.businessWebsite && (
              <div>
                <h4 className="mb-2 text-sm font-semibold text-gray-900">Website</h4>
                <a
                  href={application.businessWebsite}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-forest-dark text-sm hover:underline"
                >
                  {application.businessWebsite}
                </a>
              </div>
            )}

            {/* Other Storefronts */}
            {(() => {
              const storefronts = application.storefronts as Record<string, string> | null;
              if (!storefronts || !Object.values(storefronts).some((v) => v)) return null;

              return (
                <div>
                  <h4 className="mb-2 text-sm font-semibold text-gray-900">Other Storefronts</h4>
                  <div className="space-y-1">
                    {storefronts.etsy && (
                      <p className="text-sm text-gray-700">
                        <span className="font-medium">Etsy:</span> {storefronts.etsy}
                      </p>
                    )}
                    {storefronts.faire && (
                      <p className="text-sm text-gray-700">
                        <span className="font-medium">Faire:</span> {storefronts.faire}
                      </p>
                    )}
                    {storefronts.amazon && (
                      <p className="text-sm text-gray-700">
                        <span className="font-medium">Amazon:</span> {storefronts.amazon}
                      </p>
                    )}
                    {storefronts.other && (
                      <p className="text-sm text-gray-700">
                        <span className="font-medium">Other:</span> {storefronts.other}
                      </p>
                    )}
                  </div>
                </div>
              );
            })()}

            {/* Show structured eco-profile if available, otherwise legacy questions */}
            {hasEcoProfileData ? (
              <>
                <div>
                  <h4 className="mb-3 text-sm font-semibold text-gray-900">Eco-Practices</h4>
                  <div className="grid grid-cols-2 gap-2">
                    {Object.entries(application.shopEcoProfileData || {}).map(([key, value]) => {
                      if (typeof value === 'boolean' && value) {
                        const label = key
                          .replace(/([A-Z])/g, ' $1')
                          .replace(/^./, (str) => str.toUpperCase());
                        return (
                          <div key={key} className="flex items-center gap-2 text-sm text-gray-700">
                            <CheckCircle className="text-eco-dark size-4" />
                            <span>{label}</span>
                          </div>
                        );
                      }
                      return null;
                    })}
                  </div>
                </div>

                {/* Eco Commentary */}
                {application.ecoCommentary &&
                  Object.values(application.ecoCommentary).some((v) => v) && (
                    <div>
                      <h4 className="mb-3 text-sm font-semibold text-gray-900">
                        Additional Practice Details
                      </h4>
                      <div className="space-y-3">
                        {Object.entries(application.ecoCommentary).map(([key, value]) => {
                          if (value && String(value).trim()) {
                            const label = key
                              .replace(/([A-Z])/g, ' $1')
                              .replace(/^./, (str) => str.toUpperCase());
                            return (
                              <div
                                key={key}
                                className="rounded-lg border border-gray-200 bg-gray-50 p-3"
                              >
                                <p className="mb-1 text-sm font-medium text-gray-900">{label}</p>
                                <p className="text-sm text-gray-700">{String(value)}</p>
                              </div>
                            );
                          }
                          return null;
                        })}
                      </div>
                    </div>
                  )}
              </>
            ) : (
              application.ecoQuestions && (
                <>
                  {application.ecoQuestions.sustainabilityPractices && (
                    <div>
                      <h4 className="mb-2 text-sm font-semibold text-gray-900">
                        Sustainability Practices
                      </h4>
                      <p className="text-sm text-gray-700">
                        {String(application.ecoQuestions.sustainabilityPractices)}
                      </p>
                    </div>
                  )}
                </>
              )
            )}

            <div>
              <h4 className="mb-2 text-sm font-semibold text-gray-900">Donation Percentage</h4>
              <p className="text-sm text-gray-700">{application.donationPercentage}%</p>
            </div>

            {/* Review Notes */}
            <div>
              <label
                htmlFor={`notes-${application.id}`}
                className="mb-2 block text-sm font-semibold text-gray-900"
              >
                Review Notes
              </label>
              <textarea
                id={`notes-${application.id}`}
                value={reviewNotes}
                onChange={(e) => onReviewNotesChange(e.target.value)}
                placeholder="Add notes about this application..."
                rows={3}
                disabled={application.status === 'APPROVED' || application.status === 'REJECTED'}
                className="focus:ring-forest-light focus:border-forest-light flex min-h-[80px] w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:ring-2 focus:ring-offset-2 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50"
              />
            </div>

            {/* Action Buttons */}
            {application.status !== 'APPROVED' && application.status !== 'REJECTED' && (
              <div className="flex gap-3">
                <Button
                  variant="default"
                  onClick={() => onApprove(application.id)}
                  disabled={processing}
                  className="bg-eco-dark hover:bg-eco-dark/90"
                >
                  {processing ? (
                    <Loader2 className="mr-2 size-4 animate-spin" />
                  ) : (
                    <CheckCircle className="mr-2 size-4" />
                  )}
                  Approve
                </Button>

                <Button
                  variant="destructive"
                  onClick={() => onReject(application.id)}
                  disabled={processing}
                >
                  {processing ? (
                    <Loader2 className="mr-2 size-4 animate-spin" />
                  ) : (
                    <XCircle className="mr-2 size-4" />
                  )}
                  Reject
                </Button>
              </div>
            )}

            {application.reviewNotes && (
              <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
                <h4 className="mb-2 text-sm font-semibold text-gray-900">Admin Review Notes</h4>
                <p className="text-sm text-gray-700">{application.reviewNotes}</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
