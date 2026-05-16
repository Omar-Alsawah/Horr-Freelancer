import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import toast from 'react-hot-toast';
import { Loader2, FileText, Link as LinkIcon, CheckCircle2, AlertCircle, Clock, XCircle, Search } from 'lucide-react';
import { contractsApi } from '../../api/contracts';

function formatCurrency(amount, lang) {
  if (amount == null) return '';
  const n = Number(amount);
  if (lang === 'ar') return `${new Intl.NumberFormat('ar-EG').format(n)} ج.م`;
  return `$${new Intl.NumberFormat('en-US').format(n)}`;
}

function CountdownTimer({ deadline, autoApprovesText }) {
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0 });

  useEffect(() => {
    const target = new Date(deadline).getTime();
    
    function updateTimer() {
      const now = new Date().getTime();
      const difference = target - now;
      
      if (difference > 0) {
        const days = Math.floor(difference / (1000 * 60 * 60 * 24));
        const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        setTimeLeft({ days, hours });
      } else {
        setTimeLeft({ days: 0, hours: 0 });
      }
    }

    updateTimer();
    // Update every minute is sufficient for days/hours, but requirements said "tick every second", so:
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, [deadline]);

  const text = autoApprovesText.replace('{{days}}', timeLeft.days).replace('{{hours}}', timeLeft.hours);

  return (
    <div className="flex items-center text-amber-700 font-medium bg-amber-50 px-3 py-1.5 rounded-full inline-flex text-sm mt-3">
      <Clock className="w-4 h-4 mr-1.5" />
      {text}
    </div>
  );
}

export default function DeliveryReviewPage() {
  const { t, i18n } = useTranslation();
  const { contractId, deliveryId } = useParams();
  
  const [delivery, setDelivery] = useState(null);
  const [loading, setLoading] = useState(true);
  
  const [activeAction, setActiveAction] = useState(null); // 'APPROVE' | 'REVISION' | 'DISPUTE'
  const [reason, setReason] = useState('');
  const [reasonError, setReasonError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    async function loadDelivery() {
      try {
        const res = await contractsApi.getDelivery(contractId, deliveryId);
        setDelivery(res.data);
      } catch (err) {
        toast.error(err.title || t('common.error'));
      } finally {
        setLoading(false);
      }
    }
    loadDelivery();
  }, [contractId, deliveryId, t]);

  const toggleAction = (action) => {
    if (activeAction === action) {
      setActiveAction(null);
    } else {
      setActiveAction(action);
      setReason('');
      setReasonError('');
    }
  };

  const handleApprove = async () => {
    setIsSubmitting(true);
    try {
      await contractsApi.approveDelivery(deliveryId);
      setDelivery(prev => ({ ...prev, status: 'Approved' }));
      toast.success(t('delivery.review.approveSuccess'));
      setActiveAction(null);
    } catch (err) {
      toast.error(err.title || t('common.error'));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRevision = async () => {
    if (!reason.trim()) {
      setReasonError(t('delivery.review.revisionReasonRequired'));
      return;
    }
    setReasonError('');
    setIsSubmitting(true);
    try {
      await contractsApi.requestDeliveryRevision(deliveryId, { Reason: reason.trim() });
      setDelivery(prev => ({ ...prev, status: 'RevisionRequested' }));
      setActiveAction(null);
    } catch (err) {
      toast.error(err.title || t('common.error'));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDispute = async () => {
    if (!reason.trim()) {
      setReasonError(t('delivery.review.disputeReasonRequired'));
      return;
    }
    setReasonError('');
    setIsSubmitting(true);
    try {
      await contractsApi.disputeDelivery(deliveryId, { ContractId: contractId, DeliveryId: deliveryId, Reason: reason.trim() });
      setDelivery(prev => ({ ...prev, status: 'Disputed' }));
      setActiveAction(null);
    } catch (err) {
      toast.error(err.title || t('common.error'));
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="animate-spin h-8 w-8 text-primary-gold" />
      </div>
    );
  }

  if (!delivery) {
    return (
      <div className="max-w-3xl mx-auto mt-8 p-6 text-center">
        <h2 className="text-2xl font-bold text-gray-800">{t('common.error')}</h2>
      </div>
    );
  }

  const isPending = delivery.status === 'Pending';

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Approved':
        return <span className="bg-green-100 text-green-800 text-sm font-semibold px-3 py-1 rounded-full">{t('delivery.status.approved')}</span>;
      case 'Disputed':
        return <span className="bg-red-100 text-red-800 text-sm font-semibold px-3 py-1 rounded-full">{t('delivery.status.disputed')}</span>;
      case 'RevisionRequested':
        return <span className="bg-blue-100 text-blue-800 text-sm font-semibold px-3 py-1 rounded-full">{t('delivery.status.revisionRequested')}</span>;
      default:
        return <span className="bg-amber-100 text-amber-800 text-sm font-semibold px-3 py-1 rounded-full">{t('delivery.status.pending')}</span>;
    }
  };

  return (
    <div className="max-w-3xl mx-auto my-8 p-6 space-y-6">
      
      {/* Top Banner Context Header */}
      <div className="bg-white rounded-lg shadow border border-gray-200 overflow-hidden">
        <div className="p-6 border-b border-gray-100 flex justify-between items-start">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">{t('delivery.review.pageTitle')}</h1>
            <div className="text-sm text-gray-500">
              {t('delivery.review.submissionDate')} {new Date(delivery.submissionDate).toLocaleString(i18n.language === 'ar' ? 'ar-EG' : 'en-US')}
            </div>
            {isPending && delivery.reviewDeadline && (
              <CountdownTimer deadline={delivery.reviewDeadline} autoApprovesText={t('delivery.review.autoApprovesIn')} />
            )}
          </div>
          <div>
            {getStatusBadge(delivery.status)}
          </div>
        </div>

        <div className="p-6 bg-gray-50 border-b border-gray-100">
          <p className="text-gray-800 whitespace-pre-wrap">{delivery.deliveryNote}</p>
        </div>

        {/* Attachments */}
        {delivery.attachments && delivery.attachments.length > 0 && (
          <div className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">{t('delivery.review.attachments')}</h3>
            <ul className="space-y-3">
              {delivery.attachments.map((att, idx) => (
                <li key={idx}>
                  {att.type.toLowerCase() === 'file' ? (
                    <a href={att.url} download className="flex items-center text-blue-600 hover:underline">
                      <FileText className="w-5 h-5 mr-2" />
                      {att.name || att.url}
                    </a>
                  ) : (
                    <a href={att.url} target="_blank" rel="noopener noreferrer" className="flex items-center text-blue-600 hover:underline">
                      <LinkIcon className="w-5 h-5 mr-2" />
                      {att.name || att.url}
                    </a>
                  )}
                </li>
              ))}
            </ul>
          </div>
        )}

        <div className="p-6 bg-indigo-50 border-t border-indigo-100">
          <p className="text-indigo-800 font-medium flex items-center">
             {t('delivery.review.escrowAtStake').replace('{{amount}}', formatCurrency(delivery.escrowAmount, i18n.language))}
          </p>
        </div>
      </div>

      {/* Interactive Actions */}
      {isPending && (
        <div className="bg-white rounded-lg shadow border border-gray-200 p-6">
          <div className="flex flex-wrap gap-4 mb-4">
            <button
              onClick={() => isSubmitting ? null : handleApprove()}
              disabled={isSubmitting}
              className={`flex items-center justify-center px-4 py-2 text-white bg-green-600 hover:bg-green-700 font-medium rounded-md shadow-sm disabled:opacity-50 transition ${activeAction === 'APPROVE' && isSubmitting ? 'w-32' : ''}`}
            >
              {activeAction === 'APPROVE' && isSubmitting ? (
                <Loader2 className="animate-spin w-5 h-5" />
              ) : (
                <>
                  <CheckCircle2 className="w-5 h-5 mr-2" />
                  {t('delivery.review.approve')}
                </>
              )}
            </button>
            <button
              onClick={() => toggleAction('REVISION')}
              disabled={isSubmitting}
              className={`flex items-center px-4 py-2 bg-white text-gray-700 border border-gray-300 hover:bg-gray-50 font-medium rounded-md shadow-sm disabled:opacity-50 transition`}
            >
              <Search className="w-5 h-5 mr-2 text-gray-500" />
              {t('delivery.review.requestRevision')}
            </button>
            <button
              onClick={() => toggleAction('DISPUTE')}
              disabled={isSubmitting}
              className={`flex items-center px-4 py-2 bg-white text-red-700 border border-red-300 hover:bg-red-50 font-medium rounded-md shadow-sm disabled:opacity-50 transition`}
            >
              <AlertCircle className="w-5 h-5 mr-2 text-red-500" />
              {t('delivery.review.openDispute')}
            </button>
          </div>

          {/* Revision Form */}
          {activeAction === 'REVISION' && (
            <div className="mt-4 p-4 border border-gray-200 rounded-md bg-gray-50">
              <label className="block text-sm font-medium text-gray-700 mb-2">{t('delivery.review.revisionReason')}</label>
              <textarea
                className="w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-primary-gold focus:border-primary-gold"
                rows="3"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                disabled={isSubmitting}
              />
              {reasonError && <p className="mt-1 text-sm text-red-600">{reasonError}</p>}
              <div className="mt-3 flex justify-end">
                <button
                  onClick={handleRevision}
                  disabled={isSubmitting}
                  className="px-4 py-2 bg-primary-navy text-white rounded-md hover:bg-gray-800 disabled:opacity-50 flex items-center"
                >
                  {isSubmitting && <Loader2 className="animate-spin w-4 h-4 mr-2" />}
                  {isSubmitting ? t('delivery.review.submitting') : t('delivery.review.submit')}
                </button>
              </div>
            </div>
          )}

          {/* Dispute Form */}
          {activeAction === 'DISPUTE' && (
            <div className="mt-4 p-4 border border-red-100 rounded-md bg-red-50">
              <label className="block text-sm font-medium text-red-800 mb-2">{t('delivery.review.disputeReason')}</label>
              <textarea
                className="w-full p-2 border border-red-300 rounded-md shadow-sm focus:ring-red-500 focus:border-red-500"
                rows="4"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                disabled={isSubmitting}
              />
              {reasonError && <p className="mt-1 text-sm text-red-600">{reasonError}</p>}
              <div className="mt-3 flex justify-end">
                <button
                  onClick={handleDispute}
                  disabled={isSubmitting}
                  className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50 flex items-center"
                >
                  {isSubmitting && <Loader2 className="animate-spin w-4 h-4 mr-2" />}
                  {isSubmitting ? t('delivery.review.submitting') : t('delivery.review.submit')}
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
