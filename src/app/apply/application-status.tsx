'use client';

import { Clock, CheckCircle, XCircle, FileText } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

interface ApplicationStatusProps {
  application: {
    id: string;
    status: string;
    businessName: string;
    businessDescription: string;
    createdAt: Date;
    reviewedAt?: Date | null;
    reviewNotes?: string | null;
  };
}

export function ApplicationStatus({ application }: ApplicationStatusProps) {
  const getStatusIcon = () => {
    switch (application.status) {
      case 'PENDING':
      case 'UNDER_REVIEW':
        return <Clock className="size-12 text-neutral-500" />;
      case 'APPROVED':
        return <CheckCircle className="text-forest-dark size-12" />;
      case 'REJECTED':
        return <XCircle className="size-12 text-neutral-600" />;
      default:
        return <FileText className="size-12 text-neutral-500" />;
    }
  };

  const getStatusText = () => {
    switch (application.status) {
      case 'PENDING':
        return {
          title: 'Application Received',
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
          title: 'Application Status',
          description: 'Please contact support for more information.',
        };
    }
  };

  const getStatusBadge = () => {
    const baseClasses = 'inline-flex items-center rounded-full px-3 py-1 text-sm font-medium';
    switch (application.status) {
      case 'PENDING':
        return `${baseClasses} bg-neutral-100 text-neutral-700`;
      case 'UNDER_REVIEW':
        return `${baseClasses} bg-neutral-100 text-neutral-700`;
      case 'APPROVED':
        return `${baseClasses} bg-eco-light text-forest-dark`;
      case 'REJECTED':
        return `${baseClasses} bg-neutral-100 text-neutral-700`;
      default:
        return `${baseClasses} bg-neutral-100 text-neutral-700`;
    }
  };

  const statusText = getStatusText();

  return (
    <div className="space-y-6">
      {/* Main Status Card */}
      <div className="rounded-lg border bg-white p-8 shadow-sm">
        <div className="flex flex-col items-center text-center">
          <div className="mb-4">{getStatusIcon()}</div>

          <h2 className="mb-2 text-2xl font-bold">{statusText.title}</h2>
          <p className="text-muted-foreground mb-6">{statusText.description}</p>

          <div className="bg-card w-full space-y-4 rounded-lg border p-6 text-left">
            <div>
              <dt className="text-muted-foreground text-sm font-medium">Business Name</dt>
              <dd className="mt-1 font-medium">{application.businessName}</dd>
            </div>

            <div>
              <dt className="text-muted-foreground text-sm font-medium">Status</dt>
              <dd className="mt-1">
                <span className={getStatusBadge()}>{application.status.replace('_', ' ')}</span>
              </dd>
            </div>

            <div>
              <dt className="text-muted-foreground text-sm font-medium">Submitted</dt>
              <dd className="mt-1">{new Date(application.createdAt).toLocaleDateString()}</dd>
            </div>

            {application.reviewedAt && (
              <div>
                <dt className="text-muted-foreground text-sm font-medium">Reviewed</dt>
                <dd className="mt-1">{new Date(application.reviewedAt).toLocaleDateString()}</dd>
              </div>
            )}

            {application.reviewNotes && (
              <div>
                <dt className="text-muted-foreground text-sm font-medium">Review Notes</dt>
                <dd className="mt-1 text-sm">{application.reviewNotes}</dd>
              </div>
            )}
          </div>

          {application.status === 'APPROVED' && (
            <div className="mt-6">
              <Button asChild size="lg" className="bg-forest-dark hover:bg-forest-light">
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
                <span className="font-medium text-neutral-700">1-3 business days</span>
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
