import React from 'react';
import { useTranslation } from 'react-i18next';

export default function StatusBadge({ status }) {
  const { t } = useTranslation();

  const getBadgeStyle = (currentStatus) => {
    switch (currentStatus) {
      // Pending variants
      case 'Pending':
      case 'Open':
      case 'Unfunded':
        return 'bg-amber-100 text-amber-800';
      // Review/Process variants
      case 'UnderReview':
      case 'Funded':
      case 'AcceptedBySpecialist':
        return 'bg-blue-100 text-blue-800';
      // Action-oriented variants
      case 'RevisionRequested':
      case 'Disputed':
      case 'Rejected':
        return 'bg-red-100 text-red-800';
      // Success variants 
      case 'Approved':
      case 'Released':
        return 'bg-green-100 text-green-800';
      // Hybrid/Other variants
      case 'Delivered':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const statusKeyMap = {
    // Delivery Submission & Review
    'Pending': 'delivery.status.pending',
    'Approved': 'delivery.status.approved',
    'Disputed': 'delivery.status.disputed',
    'RevisionRequested': 'delivery.status.revisionRequested',
    
    // Milestones
    'Unfunded': 'milestone.status.unfunded',
    'Funded': 'milestone.status.funded',
    'Delivered': 'milestone.status.delivered',
    'Released': 'milestone.status.released',
    
    // Disputes
    'Open': 'disputes.status.open',
    'UnderReview': 'disputes.status.underReview',
    
    // Revisions
    'AcceptedBySpecialist': 'revisions.status.accepted'
  };

  const translationKey = statusKeyMap[status];
  const displayLabel = translationKey ? t(translationKey, { defaultValue: status }) : status;

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold uppercase tracking-wider ${getBadgeStyle(status)}`}>
      {displayLabel}
    </span>
  );
}
