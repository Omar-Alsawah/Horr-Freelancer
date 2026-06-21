import React from 'react';
import { useTranslation } from 'react-i18next';

/**
 * StatusBadge — unified across freelancer and client surfaces.
 * Uses the Horr token-driven .badge class system from components.css.
 * No raw Tailwind color classes — all colors derive from semantic tokens.
 */
export default function StatusBadge({ status }) {
  const { t } = useTranslation();

  const getBadgeVariant = (currentStatus) => {
    switch (currentStatus) {
      // Pending / Open / Not yet funded
      case 'Pending':
      case 'Open':
      case 'Unfunded':
        return 'badge--warning';

      // In-process / Funded / Accepted
      case 'UnderReview':
      case 'Funded':
      case 'AcceptedBySpecialist':
        return 'badge--info';

      // Needs action / Problematic
      case 'RevisionRequested':
      case 'Disputed':
      case 'Rejected':
        return 'badge--danger';

      // Success
      case 'Approved':
      case 'Released':
        return 'badge--success';

      // Delivered — distinct purple to signal completion awaiting review
      case 'Delivered':
        return 'badge--purple';

      default:
        return 'badge--neutral';
    }
  };

  const statusKeyMap = {
    // Delivery Submission & Review
    'Pending':              'delivery.status.pending',
    'Approved':             'delivery.status.approved',
    'Disputed':             'delivery.status.disputed',
    'RevisionRequested':    'delivery.status.revisionRequested',
    // Milestones
    'Unfunded':             'milestone.status.unfunded',
    'Funded':               'milestone.status.funded',
    'Delivered':            'milestone.status.delivered',
    'Released':             'milestone.status.released',
    // Disputes
    'Open':                 'disputes.status.open',
    'UnderReview':          'disputes.status.underReview',
    // Revisions
    'AcceptedBySpecialist': 'revisions.status.accepted',
    'Rejected':             'delivery.status.rejected',
  };

  const translationKey = statusKeyMap[status];
  const displayLabel = translationKey
    ? t(translationKey, { defaultValue: status })
    : status;

  return (
    <span className={`badge ${getBadgeVariant(status)}`}>
      {displayLabel}
    </span>
  );
}
