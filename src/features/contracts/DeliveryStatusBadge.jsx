import { useTranslation } from 'react-i18next';

export default function DeliveryStatusBadge({ status }) {
  const { t } = useTranslation();

  const getBadgeStyle = (currentStatus) => {
    switch (currentStatus) {
      case 'Pending':
        return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'Approved':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'RevisionRequested':
        return 'bg-rose-100 text-rose-800 border-rose-200';
      case 'Disputed':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const statusKeyMap = {
    'Pending': 'delivery.status.pending',
    'Approved': 'delivery.status.approved',
    'Disputed': 'delivery.status.disputed',
    'RevisionRequested': 'delivery.status.revisionRequested'
  };

  const label = t(statusKeyMap[status] || status, { defaultValue: status });

  return (
    <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider border ${getBadgeStyle(status)}`}>
      {label}
    </span>
  );
}
