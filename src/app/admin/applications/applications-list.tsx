'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { CheckCircle, XCircle, Eye, FileText, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { updateApplicationStatus } from '@/actions/seller-application';

interface EcoQuestions {
  sustainabilityPractices: string;
  materialSourcing: string;
  packagingApproach?: string;
  carbonFootprint?: string;
}

interface Application {
  id: string;
  businessName: string;
  businessWebsite?: string | null;
  businessDescription: string;
  ecoQuestions: EcoQuestions;
  donationPercentage: number;
  status: string;
  createdAt: Date;
  reviewNotes?: string | null;
  user: {
    id: string;
    name: string | null;
    email: string | null;
  };
}

interface ApplicationsListProps {
  applications: Application[];
}

export function ApplicationsList({ applications: initialApplications }: ApplicationsListProps) {
  const router = useRouter();
  const [applications, setApplications] = useState(initialApplications);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [reviewNotes, setReviewNotes] = useState<Record<string, string>>({});

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

  const handleReview = async (applicationId: string) => {
    setProcessingId(applicationId);
    const result = await updateApplicationStatus(applicationId, 'UNDER_REVIEW');

    if (result.success) {
      setApplications((prev) =>
        prev.map((app) => (app.id === applicationId ? { ...app, status: 'UNDER_REVIEW' } : app))
      );
      router.refresh();
    }

    setProcessingId(null);
  };

  const getStatusBadge = (status: string) => {
    const badges = {
      PENDING: 'bg-yellow-100 text-yellow-800',
      UNDER_REVIEW: 'bg-blue-100 text-blue-800',
      APPROVED: 'bg-green-100 text-green-800',
      REJECTED: 'bg-red-100 text-red-800',
    };
    return badges[status as keyof typeof badges] || 'bg-gray-100 text-gray-800';
  };

  const pendingApplications = applications.filter((app) => app.status === 'PENDING');
  const reviewingApplications = applications.filter((app) => app.status === 'UNDER_REVIEW');
  const processedApplications = applications.filter(
    (app) => app.status === 'APPROVED' || app.status === 'REJECTED'
  );

  return (
    <div className="space-y-8">
      {/* Pending Applications */}
      {pendingApplications.length > 0 && (
        <div>
          <h2 className="mb-4 text-xl font-bold">Pending Review ({pendingApplications.length})</h2>
          <div className="space-y-4">
            {pendingApplications.map((app) => (
              <ApplicationCard
                key={app.id}
                application={app}
                expanded={expandedId === app.id}
                onToggleExpand={() => setExpandedId(expandedId === app.id ? null : app.id)}
                onApprove={handleApprove}
                onReject={handleReject}
                onReview={handleReview}
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
          <h2 className="mb-4 text-xl font-bold">Under Review ({reviewingApplications.length})</h2>
          <div className="space-y-4">
            {reviewingApplications.map((app) => (
              <ApplicationCard
                key={app.id}
                application={app}
                expanded={expandedId === app.id}
                onToggleExpand={() => setExpandedId(expandedId === app.id ? null : app.id)}
                onApprove={handleApprove}
                onReject={handleReject}
                onReview={handleReview}
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
          <h2 className="mb-4 text-xl font-bold">Processed ({processedApplications.length})</h2>
          <div className="space-y-4">
            {processedApplications.map((app) => (
              <ApplicationCard
                key={app.id}
                application={app}
                expanded={expandedId === app.id}
                onToggleExpand={() => setExpandedId(expandedId === app.id ? null : app.id)}
                onApprove={handleApprove}
                onReject={handleReject}
                onReview={handleReview}
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

      {applications.length === 0 && (
        <div className="text-muted-foreground py-12 text-center">No applications to review</div>
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
  onReview: (id: string) => void;
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
  onReview,
  processing,
  reviewNotes,
  onReviewNotesChange,
  getStatusBadge,
}: ApplicationCardProps) {
  return (
    <div className="bg-card rounded-lg border">
      <div className="p-6">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="mb-2 flex items-center gap-3">
              <h3 className="text-lg font-bold">{application.businessName}</h3>
              <span
                className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${getStatusBadge(application.status)}`}
              >
                {application.status.replace('_', ' ')}
              </span>
            </div>
            <p className="text-muted-foreground mb-1 text-sm">
              {application.user.name || application.user.email}
            </p>
            <p className="text-muted-foreground text-sm">
              Applied {new Date(application.createdAt).toLocaleDateString()}
            </p>
          </div>

          <Button variant="outline" size="sm" onClick={onToggleExpand}>
            <Eye className="mr-2 size-4" />
            {expanded ? 'Hide' : 'View'} Details
          </Button>
        </div>

        {expanded && (
          <div className="mt-6 space-y-4 border-t pt-4">
            <div>
              <h4 className="mb-2 text-sm font-semibold">Business Description</h4>
              <p className="text-sm">{application.businessDescription}</p>
            </div>

            {application.businessWebsite && (
              <div>
                <h4 className="mb-2 text-sm font-semibold">Website</h4>
                <a
                  href={application.businessWebsite}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-blue-600 hover:underline"
                >
                  {application.businessWebsite}
                </a>
              </div>
            )}

            <div>
              <h4 className="mb-2 text-sm font-semibold">Sustainability Practices</h4>
              <p className="text-sm">{application.ecoQuestions.sustainabilityPractices}</p>
            </div>

            <div>
              <h4 className="mb-2 text-sm font-semibold">Material Sourcing</h4>
              <p className="text-sm">{application.ecoQuestions.materialSourcing}</p>
            </div>

            {application.ecoQuestions.packagingApproach && (
              <div>
                <h4 className="mb-2 text-sm font-semibold">Packaging Approach</h4>
                <p className="text-sm">{application.ecoQuestions.packagingApproach}</p>
              </div>
            )}

            {application.ecoQuestions.carbonFootprint && (
              <div>
                <h4 className="mb-2 text-sm font-semibold">Carbon Footprint</h4>
                <p className="text-sm">{application.ecoQuestions.carbonFootprint}</p>
              </div>
            )}

            <div>
              <h4 className="mb-2 text-sm font-semibold">Donation Percentage</h4>
              <p className="text-sm">{application.donationPercentage}%</p>
            </div>

            {/* Review Notes */}
            <div>
              <label
                htmlFor={`notes-${application.id}`}
                className="mb-2 block text-sm font-semibold"
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
                className="border-input bg-background ring-offset-background placeholder:text-muted-foreground focus-visible:ring-ring flex min-h-[80px] w-full rounded-md border px-3 py-2 text-sm focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50"
              />
            </div>

            {/* Action Buttons */}
            {application.status !== 'APPROVED' && application.status !== 'REJECTED' && (
              <div className="flex gap-3">
                {application.status === 'PENDING' && (
                  <Button
                    variant="outline"
                    onClick={() => onReview(application.id)}
                    disabled={processing}
                  >
                    {processing ? (
                      <Loader2 className="mr-2 size-4 animate-spin" />
                    ) : (
                      <FileText className="mr-2 size-4" />
                    )}
                    Mark as Under Review
                  </Button>
                )}

                <Button
                  variant="default"
                  onClick={() => onApprove(application.id)}
                  disabled={processing}
                  className="bg-green-600 hover:bg-green-700"
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
              <div className="rounded-lg bg-gray-50 p-4">
                <h4 className="mb-2 text-sm font-semibold">Admin Review Notes</h4>
                <p className="text-sm">{application.reviewNotes}</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
