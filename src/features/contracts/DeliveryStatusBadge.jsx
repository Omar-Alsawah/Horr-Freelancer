import { useTranslation } from 'react-i18next';

/**
 * DeliveryStatusBadge — converged to the same .badge system as StatusBadge.
 * Previously had a border class variant that diverged from StatusBadge.
 * Now both components produce visually identical badges for the same status.
 */
export default function DeliveryStatusBadge({ status }) {
  const { t } = useTranslation();

  const getBadgeVariant = (currentStatus) => {
    switch (currentStatus) {
      case 'Pending':          return 'badge--warning';
      case 'Approved':         return 'badge--success';
      case 'RevisionRequested': return 'badge--danger';
      case 'Disputed':         return 'badge--danger';
      default:                 return 'badge--neutral';
    }
  };

  const statusKeyMap = {
    'Pending':           'delivery.status.pending',
    'Approved':          'delivery.status.approved',
    'Disputed':          'delivery.status.disputed',
    'RevisionRequested': 'delivery.status.revisionRequested',
  };

  const label = t(statusKeyMap[status] || status, { defaultValue: status });

  return (
    <span className={`badge ${getBadgeVariant(status)}`}>
      {label}
    </span>
  );
}
