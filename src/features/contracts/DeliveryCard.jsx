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

  const statusStr = String(delivery.status !== undefined ? delivery.status : (delivery.Status !== undefined ? delivery.Status : '')).toLowerCase();
  const isPending = statusStr === 'pending' || statusStr === '0';
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

  const dateVal = delivery.submittedAt || delivery.SubmittedAt || delivery.submissionDate || delivery.date;
  const formattedDate = new Date(dateVal).toLocaleString(
    i18n.language === 'ar' ? 'ar-EG' : 'en-US',
    { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }
  );

  const isPaused = delivery.isPaused || delivery.IsPaused;

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:border-gray-300 transition-all">
      {/* Card Header */}
      <div className="p-4 sm:p-5 border-b border-gray-100 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-sm text-gray-500 font-medium">
          <Calendar className="h-4 w-4 text-gray-400" />
          <span>{formattedDate}</span>
        </div>
        <DeliveryStatusBadge status={delivery.status !== undefined ? delivery.status : delivery.Status} />
      </div>

      {/* Card Body */}
      <div className="p-4 sm:p-5 space-y-4">
        {isPaused && (
          <div className="bg-amber-50 border border-amber-200 p-4 rounded-xl flex items-start gap-3 text-amber-900 text-sm">
            <ShieldAlert className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
            <div>
              <span className="font-bold block">
                {i18n.language === 'ar' ? 'تم إيقاف مراجعة التسليم مؤقتاً' : 'Delivery Review Paused'}
              </span>
              <span className="mt-1 block text-xs text-amber-800 leading-relaxed">
                {delivery.pauseReason || delivery.PauseReason || (i18n.language === 'ar' ? 'تم إيقاف المراجعة التلقائية مؤقتاً أثناء مراجعة المختص.' : 'Auto-approval worker is paused while a specialist review is in progress.')}
              </span>
            </div>
          </div>
        )}

        {delivery.deliveryNote && (
          <div className="bg-gray-50 p-4 rounded-lg border border-gray-100 text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">
            {delivery.deliveryNote}
          </div>
        )}

        <DeliveryFilesList 
          attachments={delivery.attachments || delivery.files || []} 
          onDownload={onDownloadAttachment} 
        />

        {/* Revision & Additional Requests Log */}
        {((delivery.revisionRequests && delivery.revisionRequests.length > 0) || delivery.revisionRequest || (delivery.additionalRevisionRequests && delivery.additionalRevisionRequests.length > 0)) && (
          <div className="mt-5 pt-4 border-t border-gray-150 space-y-3">
            <span className="block text-[11px] font-bold text-gray-400 uppercase tracking-wider">
              {t('delivery.history.revisions_log', 'Revision & Additional Requests Log')}
            </span>
            <div className="space-y-3">
              {/* Revision Requests */}
              {Array.isArray(delivery.revisionRequests) ? (
                delivery.revisionRequests.map((rev, index) => (
                  <div key={rev.id || index} className="p-3 bg-amber-50/40 border border-amber-100 rounded-xl text-xs space-y-1.5 text-left">
                    <div className="flex justify-between items-center text-amber-800 font-semibold">
                      <span>{t('delivery.history.revision_num', 'Revision')} #{index + 1}</span>
                      <span className="text-[10px] bg-amber-100 px-2 py-0.5 rounded-full uppercase tracking-wider">
                        {rev.status || 'Pending'}
                      </span>
                    </div>
                    <p className="text-gray-700 leading-relaxed font-medium">{rev.reason}</p>
                    {rev.requestedAt && (
                      <span className="block text-[10px] text-gray-405">
                        {t('delivery.history.requested_at', 'Requested')}: {new Date(rev.requestedAt).toLocaleString()}
                      </span>
                    )}
                  </div>
                ))
              ) : (
                delivery.revisionRequest && (
                  <div className="p-3 bg-amber-50/40 border border-amber-100 rounded-xl text-xs space-y-1.5 text-left">
                    <div className="flex justify-between items-center text-amber-800 font-semibold">
                      <span>{t('delivery.history.revision_request', 'Revision Request')}</span>
                      <span className="text-[10px] bg-amber-100 px-2 py-0.5 rounded-full uppercase tracking-wider">
                        {delivery.revisionRequest.status || 'Pending'}
                      </span>
                    </div>
                    <p className="text-gray-700 leading-relaxed font-medium">{delivery.revisionRequest.reason}</p>
                    {delivery.revisionRequest.requestedAt && (
                      <span className="block text-[10px] text-gray-405">
                        {t('delivery.history.requested_at', 'Requested')}: {new Date(delivery.revisionRequest.requestedAt).toLocaleString()}
                      </span>
                    )}
                  </div>
                )
              )}

              {/* Additional Revision Requests */}
              {Array.isArray(delivery.additionalRevisionRequests) && delivery.additionalRevisionRequests.map((req, idx) => (
                <div key={req.id || idx} className="p-3 bg-indigo-50/40 border border-indigo-100 rounded-xl text-xs space-y-1.5 text-left">
                  <div className="flex justify-between items-center text-indigo-800 font-semibold">
                    <span>{t('delivery.history.additional_revisions_req', 'Requested Additional Revisions')} (+{req.requestedCount})</span>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full uppercase tracking-wider ${
                      req.status === 'Approved' || req.status === 'Accepted' ? 'bg-emerald-100 text-emerald-800' :
                      req.status === 'Rejected' || req.status === 'Declined' ? 'bg-rose-100 text-rose-800' : 'bg-indigo-100 text-indigo-800'
                    }`}>
                      {req.status || 'Pending'}
                    </span>
                  </div>
                  <p className="text-gray-700 leading-relaxed font-medium">{req.reason}</p>
                  {req.requestedAt && (
                    <span className="block text-[10px] text-gray-450">
                      {t('delivery.history.requested_at', 'Requested')}: {new Date(req.requestedAt).toLocaleString()}
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Action Area for Client (Pending items only) */}
      {isClient && isPending && !isPaused && (
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
