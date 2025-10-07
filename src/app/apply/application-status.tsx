'use client';

import { Clock, CheckCircle, XCircle, FileText } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

interface ApplicationStatusProps {
  application: {
    id: string;
    status: string;
    businessName: string;
    createdAt: Date;
    reviewedAt?: Date | null;
    reviewNotes?: string | null;
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

  return (
    <div className={`rounded-lg border p-8 ${getStatusColor()}`}>
      <div className="flex flex-col items-center text-center">
        <div className="mb-4">{getStatusIcon()}</div>

        <h2 className="mb-2 text-2xl font-bold">{statusText.title}</h2>
        <p className="text-muted-foreground mb-6">{statusText.description}</p>

        <div className="bg-card w-full rounded-lg border p-6 text-left">
          <dl className="space-y-4">
            <div>
              <dt className="text-sm font-semibold text-muted-foreground">Business Name</dt>
              <dd className="mt-1">{application.businessName}</dd>
            </div>

            <div>
              <dt className="text-sm font-semibold text-muted-foreground">Application Status</dt>
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
              <dt className="text-sm font-semibold text-muted-foreground">Submitted</dt>
              <dd className="mt-1">{new Date(application.createdAt).toLocaleDateString()}</dd>
            </div>

            {application.reviewedAt && (
              <div>
                <dt className="text-sm font-semibold text-muted-foreground">Reviewed</dt>
                <dd className="mt-1">{new Date(application.reviewedAt).toLocaleDateString()}</dd>
              </div>
            )}

            {application.reviewNotes && (
              <div>
                <dt className="text-sm font-semibold text-muted-foreground">Review Notes</dt>
                <dd className="mt-1 text-sm">{application.reviewNotes}</dd>
              </div>
            )}
          </dl>
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
            <p className="text-sm text-muted-foreground">
              You may submit a new application after addressing the feedback provided.
            </p>
          </div>
        )}

        {(application.status === 'PENDING' || application.status === 'UNDER_REVIEW') && (
          <div className="mt-6">
            <p className="text-sm text-muted-foreground">
              We typically review applications within 2-3 business days. You'll receive an email
              when your application status changes.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
