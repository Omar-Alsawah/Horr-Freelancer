import { useTranslation } from 'react-i18next';
import { Archive } from 'lucide-react';
import DeliveryCard from './DeliveryCard';

export default function DeliveryHistory({ 
  deliveries = [], 
  isLoading, 
  role, 
  onApprove, 
  onRevision, 
  onDispute, 
  onDownloadAttachment 
}) {
  const { t } = useTranslation();

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2].map((i) => (
          <div key={i} className="bg-white rounded-xl border border-gray-200 p-5 space-y-3 animate-pulse">
            <div className="flex justify-between items-center">
              <div className="h-4 bg-gray-200 rounded w-1/4"></div>
              <div className="h-6 bg-gray-200 rounded-full w-16"></div>
            </div>
            <div className="h-16 bg-gray-100 rounded"></div>
            <div className="h-10 bg-gray-200 rounded w-2/3"></div>
          </div>
        ))}
      </div>
    );
  }

  if (!deliveries || deliveries.length === 0) {
    return (
      <div className="bg-white border border-gray-200 rounded-2xl p-8 text-center flex flex-col items-center justify-center">
        <div className="inline-flex p-3 bg-gray-50 border border-gray-100 rounded-2xl mb-3 text-gray-400">
          <Archive className="h-8 w-8" />
        </div>
        <h3 className="text-base font-semibold text-gray-800 mb-1">
          {t('contracts.no_deliveries', 'No deliveries yet')}
        </h3>
        <p className="text-sm text-gray-500 max-w-xs">
          {role === 'Freelancer' 
            ? t('delivery.history.freelancerEmpty', 'Submit your completed files and links to request payment release.')
            : t('delivery.history.clientEmpty', 'The freelancer has not submitted any deliverables for review yet.')
          }
        </p>
      </div>
    );
  }

  // Sort deliveries by date descending (newest first)
  const sortedDeliveries = [...deliveries].sort((a, b) => {
    const dateB = b.submittedAt || b.SubmittedAt || b.submissionDate || b.date;
    const dateA = a.submittedAt || a.SubmittedAt || a.submissionDate || a.date;
    return new Date(dateB).getTime() - new Date(dateA).getTime();
  });

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-bold text-gray-850">
          {t('contracts.delivery_history', 'Delivery History')}
        </h3>
        <span className="text-xs bg-gray-100 text-gray-650 px-2.5 py-1 rounded-md font-semibold">
          {deliveries.length} {deliveries.length === 1 ? 'submission' : 'submissions'}
        </span>
      </div>
      <div className="space-y-4">
        {sortedDeliveries.map((delivery) => (
          <DeliveryCard
            key={delivery.id}
            delivery={delivery}
            role={role}
            onApprove={onApprove}
            onRevision={onRevision}
            onDispute={onDispute}
            onDownloadAttachment={onDownloadAttachment}
          />
        ))}
      </div>
    </div>
  );
}
