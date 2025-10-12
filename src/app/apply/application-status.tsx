'use client';

import { Clock, CheckCircle, XCircle, FileText, Sparkles, AlertTriangle, Zap } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import {
  getTierEmoji,
  getEstimatedReviewTime,
  getRedFlags,
  type ApplicationTier,
} from '@/lib/application-scoring';

interface ApplicationStatusProps {
  application: {
    id: string;
    status: string;
    businessName: string;
    businessDescription: string;
    createdAt: Date;
    reviewedAt?: Date | null;
    reviewNotes?: string | null;
    completenessScore: number;
    tier: string;
    autoApprovalEligible: boolean;
  };
}

export function ApplicationStatus({ application }: ApplicationStatusProps) {
  const getStatusIcon = () => {
    switch (application.status) {
      case 'PENDING':
        return <Clock className="size-12 text-yellow-500" />;
      case 'UNDER_REVIEW':
        return <FileText className="size-12 text-blue-500" />;
      case 'APPROVED':
        return <CheckCircle className="size-12 text-green-500" />;
      case 'REJECTED':
        return <XCircle className="size-12 text-red-500" />;
      default:
        return <Clock className="size-12 text-gray-500" />;
    }
  };

  const getStatusText = () => {
    switch (application.status) {
      case 'PENDING':
        return {
          title: 'Application Pending',
          description: 'Your application has been received and is awaiting review.',
        };
      case 'UNDER_REVIEW':
        return {
          title: 'Under Review',
          description: 'Our team is currently reviewing your application.',
        };
      case 'APPROVED':
        return {
          title: 'Application Approved!',
          description: 'Congratulations! Your seller application has been approved.',
        };
      case 'REJECTED':
        return {
          title: 'Application Not Approved',
          description: 'Unfortunately, your application was not approved at this time.',
        };
      default:
        return {
          title: 'Application Status Unknown',
          description: 'Please contact support for more information.',
        };
    }
  };

  const getStatusColor = () => {
    switch (application.status) {
      case 'PENDING':
        return 'border-yellow-200 bg-yellow-50';
      case 'UNDER_REVIEW':
        return 'border-blue-200 bg-blue-50';
      case 'APPROVED':
        return 'border-green-200 bg-green-50';
      case 'REJECTED':
        return 'border-red-200 bg-red-50';
      default:
        return 'border-gray-200 bg-gray-50';
    }
  };

  const statusText = getStatusText();
  const redFlags = getRedFlags(application.businessDescription);
  const estimatedTime = getEstimatedReviewTime(
    application.completenessScore,
    application.tier as ApplicationTier,
    application.autoApprovalEligible
  );
  const tierEmoji = getTierEmoji(application.tier as ApplicationTier);

  return (
    <div className="space-y-6">
      {/* Main Status Card */}
      <div className={`rounded-lg border p-8 ${getStatusColor()}`}>
        <div className="flex flex-col items-center text-center">
          <div className="mb-4">{getStatusIcon()}</div>

          <h2 className="mb-2 text-2xl font-bold">{statusText.title}</h2>
          <p className="text-muted-foreground mb-6">{statusText.description}</p>

          <div className="bg-card w-full space-y-4 rounded-lg border p-6 text-left">
            <div>
              <dt className="text-muted-foreground text-sm font-semibold">Business Name</dt>
              <dd className="mt-1">{application.businessName}</dd>
            </div>

            <div>
              <dt className="text-muted-foreground text-sm font-semibold">Application Status</dt>
              <dd className="mt-1">
                <span
                  className={`inline-flex items-center rounded-full px-3 py-1 text-sm font-semibold ${
                    application.status === 'PENDING'
                      ? 'bg-yellow-100 text-yellow-800'
                      : application.status === 'UNDER_REVIEW'
                        ? 'bg-blue-100 text-blue-800'
                        : application.status === 'APPROVED'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-red-100 text-red-800'
                  }`}
                >
                  {application.status.replace('_', ' ')}
                </span>
              </dd>
            </div>

            <div>
              <dt className="text-muted-foreground text-sm font-semibold">Submitted</dt>
              <dd className="mt-1">{new Date(application.createdAt).toLocaleDateString()}</dd>
            </div>

            {application.reviewedAt && (
              <div>
                <dt className="text-muted-foreground text-sm font-semibold">Reviewed</dt>
                <dd className="mt-1">{new Date(application.reviewedAt).toLocaleDateString()}</dd>
              </div>
            )}

            {application.reviewNotes && (
              <div>
                <dt className="text-muted-foreground text-sm font-semibold">Review Notes</dt>
                <dd className="mt-1 text-sm">{application.reviewNotes}</dd>
              </div>
            )}
          </div>

          {application.status === 'APPROVED' && (
            <div className="mt-6">
              <Button asChild size="lg">
                <Link href="/seller">Go to Seller Dashboard</Link>
              </Button>
            </div>
          )}

          {application.status === 'REJECTED' && (
            <div className="mt-6">
              <p className="text-muted-foreground text-sm">
                You may submit a new application after addressing the feedback provided.
              </p>
            </div>
          )}

          {(application.status === 'PENDING' || application.status === 'UNDER_REVIEW') && (
            <div className="mt-6">
              <p className="text-muted-foreground text-sm">
                Expected review time:{' '}
                <span className="text-forest-dark font-semibold">{estimatedTime}</span>
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Application Score Card */}
      <div className="from-forest-light/10 to-eco-light/20 border-forest-light/30 rounded-lg border bg-gradient-to-br p-6">
        <div className="mb-4 flex items-center gap-2">
          <Sparkles className="text-forest-light size-5" />
          <h3 className="text-lg font-semibold text-neutral-800">Application Score</h3>
        </div>

        <div className="flex items-start justify-between gap-6">
          <div className="flex-1">
            <div className="space-y-2">
              <p className="text-sm text-neutral-600">
                Your application is{' '}
                <span className="font-semibold">{application.completenessScore}%</span> complete (
                {tierEmoji} {application.tier.charAt(0).toUpperCase() + application.tier.slice(1)}{' '}
                Tier)
              </p>

              {application.autoApprovalEligible && (
                <div className="text-eco-dark flex items-center gap-2 text-sm font-medium">
                  <Zap className="size-4" />
                  <span>Qualified for instant approval!</span>
                </div>
              )}

              {(application.status === 'PENDING' || application.status === 'UNDER_REVIEW') && (
                <p className="text-sm text-neutral-600">
                  <Clock className="mr-1 inline size-4" />
                  Expected review time:{' '}
                  <span className="text-forest-dark font-medium">{estimatedTime}</span>
                </p>
              )}
            </div>
          </div>

          {/* Visual Score Indicator */}
          <div className="flex flex-col items-center gap-2">
            <div className="relative size-20">
              <svg className="size-20 -rotate-90 transform">
                <circle
                  cx="40"
                  cy="40"
                  r="36"
                  stroke="currentColor"
                  strokeWidth="8"
                  fill="none"
                  className="text-neutral-200"
                />
                <circle
                  cx="40"
                  cy="40"
                  r="36"
                  stroke="currentColor"
                  strokeWidth="8"
                  fill="none"
                  strokeDasharray={`${2 * Math.PI * 36}`}
                  strokeDashoffset={`${2 * Math.PI * 36 * (1 - application.completenessScore / 100)}`}
                  className="text-forest-dark transition-all duration-500"
                  strokeLinecap="round"
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-forest-dark text-lg font-bold">
                  {application.completenessScore}%
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Red Flags Warning (if any) */}
      {redFlags.length > 0 && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4">
          <div className="flex items-start gap-3">
            <AlertTriangle className="mt-0.5 size-5 flex-shrink-0 text-red-600" />
            <div className="flex-1">
              <h4 className="mb-2 font-semibold text-red-800">
                {redFlags.length} Concern{redFlags.length > 1 ? 's' : ''} Detected
              </h4>
              <ul className="space-y-1">
                {redFlags.map((flag, idx) => (
                  <li key={idx} className="text-sm text-red-700">
                    • {flag}
                  </li>
                ))}
              </ul>
              <p className="mt-2 text-xs text-red-600">
                These concerns may require additional review or clarification from our team.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
