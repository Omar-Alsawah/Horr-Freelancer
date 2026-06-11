import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Check, Edit3, ShieldAlert, Loader2, Calendar } from 'lucide-react';
import DeliveryStatusBadge from './DeliveryStatusBadge';
import DeliveryFilesList from './DeliveryFilesList';

export default function DeliveryCard({ 
  delivery, 
  role, 
  onApprove, 
  onRevision, 
  onDispute, 
  onDownloadAttachment 
}) {
  const { t, i18n } = useTranslation();
  
  const [activeAction, setActiveAction] = useState(null); // 'REVISION' | 'DISPUTE'
  const [reason, setReason] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isPending = delivery.status === 'Pending';
  const isClient = role === 'Client';

  const resetForm = () => {
    setActiveAction(null);
    setReason('');
    setError('');
  };

  const handleApprove = async () => {
    if (onApprove) {
      setIsSubmitting(true);
      try {
        await onApprove(delivery.id);
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  const handleRevisionSubmit = async () => {
    if (!reason.trim()) {
      setError(t('delivery.review.revisionReasonRequired', 'Please enter a reason for revision.'));
      return;
    }
    setError('');
    if (onRevision) {
      setIsSubmitting(true);
      try {
        await onRevision(delivery.id, reason.trim());
        resetForm();
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  const handleDisputeSubmit = async () => {
    if (!reason.trim()) {
      setError(t('delivery.review.disputeReasonRequired', 'Please enter a reason for the dispute.'));
      return;
    }
    setError('');
    if (onDispute) {
      setIsSubmitting(true);
      try {
        await onDispute(delivery.id, reason.trim());
        resetForm();
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  const formattedDate = new Date(delivery.submissionDate).toLocaleString(
    i18n.language === 'ar' ? 'ar-EG' : 'en-US',
    { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }
  );

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:border-gray-300 transition-all">
      {/* Card Header */}
      <div className="p-4 sm:p-5 border-b border-gray-100 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-sm text-gray-500 font-medium">
          <Calendar className="h-4 w-4 text-gray-400" />
          <span>{formattedDate}</span>
        </div>
        <DeliveryStatusBadge status={delivery.status} />
      </div>

      {/* Card Body */}
      <div className="p-4 sm:p-5 space-y-4">
        {delivery.deliveryNote && (
          <div className="bg-gray-50 p-4 rounded-lg border border-gray-100 text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">
            {delivery.deliveryNote}
          </div>
        )}

        <DeliveryFilesList 
          attachments={delivery.attachments} 
          onDownload={onDownloadAttachment} 
        />
      </div>

      {/* Action Area for Client (Pending items only) */}
      {isClient && isPending && (
        <div className="bg-gray-50 border-t border-gray-100 p-4 sm:p-5 space-y-4">
          {!activeAction ? (
            <div className="flex flex-wrap gap-2.5">
              <button
                onClick={handleApprove}
                disabled={isSubmitting}
                className="inline-flex items-center justify-center px-4 py-2 text-xs sm:text-sm font-semibold rounded-lg text-white bg-emerald-600 hover:bg-emerald-700 shadow-sm transition disabled:opacity-50"
              >
                {isSubmitting ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-1.5" />
                ) : (
                  <Check className="h-4 w-4 mr-1.5" />
                )}
                {t('delivery.review.approve', 'Approve')}
              </button>

              <button
                onClick={() => { setActiveAction('REVISION'); setReason(''); setError(''); }}
                disabled={isSubmitting}
                className="inline-flex items-center justify-center px-4 py-2 text-xs sm:text-sm font-semibold rounded-lg text-gray-700 bg-white border border-gray-300 hover:bg-gray-50 shadow-sm transition disabled:opacity-50"
              >
                <Edit3 className="h-4 w-4 mr-1.5 text-gray-500" />
                {t('delivery.review.requestRevision', 'Request Revision')}
              </button>

              <button
                onClick={() => { setActiveAction('DISPUTE'); setReason(''); setError(''); }}
                disabled={isSubmitting}
                className="inline-flex items-center justify-center px-4 py-2 text-xs sm:text-sm font-semibold rounded-lg text-rose-700 bg-white border border-rose-200 hover:bg-rose-50 shadow-sm transition disabled:opacity-50"
              >
                <ShieldAlert className="h-4 w-4 mr-1.5 text-rose-500" />
                {t('delivery.review.openDispute', 'Open Dispute')}
              </button>
            </div>
          ) : (
            <div className={`p-4 rounded-lg border ${activeAction === 'DISPUTE' ? 'bg-rose-50/50 border-rose-100' : 'bg-gray-100/50 border-gray-200'} space-y-3`}>
              <label className="block text-xs sm:text-sm font-semibold text-gray-800">
                {activeAction === 'DISPUTE' 
                  ? t('delivery.review.disputeReason', 'Provide a detailed reason for the dispute:')
                  : t('delivery.review.revisionReason', 'Provide a reason for revision:')
                }
              </label>
              
              <textarea
                rows={3}
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                disabled={isSubmitting}
                className="w-full rounded-lg border-gray-300 shadow-sm p-3 text-sm focus:border-amber-500 focus:ring-amber-500 border bg-white outline-none"
                placeholder={activeAction === 'DISPUTE' 
                  ? t('delivery.review.disputePlaceholder', 'Describe the dispute reasoning in detail...')
                  : t('delivery.review.revisionPlaceholder', 'Detail the adjustments required...')
                }
              />
              
              {error && <p className="text-xs text-rose-600 font-medium">{error}</p>}

              <div className="flex justify-end gap-2 text-xs sm:text-sm">
                <button
                  type="button"
                  onClick={resetForm}
                  disabled={isSubmitting}
                  className="px-3 py-1.5 font-semibold text-gray-600 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition"
                >
                  {t('common.cancel', 'Cancel')}
                </button>
                
                <button
                  type="button"
                  disabled={isSubmitting}
                  onClick={activeAction === 'DISPUTE' ? handleDisputeSubmit : handleRevisionSubmit}
                  className={`px-4 py-1.5 font-semibold text-white rounded-lg transition inline-flex items-center ${
                    activeAction === 'DISPUTE' 
                      ? 'bg-rose-600 hover:bg-rose-700' 
                      : 'bg-slate-800 hover:bg-slate-900'
                  }`}
                >
                  {isSubmitting && <Loader2 className="h-3.5 w-3.5 animate-spin mr-1.5" />}
                  {t('delivery.review.submit', 'Submit')}
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
