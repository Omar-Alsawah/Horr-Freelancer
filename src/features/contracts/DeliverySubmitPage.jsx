import { useState, useEffect } from 'react';
import { useParams, useNavigate, Navigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import toast from 'react-hot-toast';
import { Loader2, Plus, Trash2, CheckCircle2, AlertTriangle, Info, RefreshCw } from 'lucide-react';
import { contractsApi } from '../../api/contracts';
import { useAuthStore } from '../../store/authStore';

function formatCurrency(amount, lang) {
  if (amount == null) return '';
  const n = Number(amount);
  if (lang === 'ar') return `${new Intl.NumberFormat('ar-EG', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(n)} ج.م`;
  return `$${new Intl.NumberFormat('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(n)}`;
}

export default function DeliverySubmitPage() {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const role = useAuthStore(state => state.role);
  const { contractId, milestoneId } = useParams();
  
  const [contract, setContract] = useState(null);
  const [milestone, setMilestone] = useState(null);
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [validationError, setValidationError] = useState('');
  
  // Form State
  const [deliveryNote, setDeliveryNote] = useState('');
  const [attachments, setAttachments] = useState([]); // { id: string, type: 'FILE' | 'LINK', file: File | null, link: string }

  const loadContract = async () => {
    setLoading(true);
    setError(false);
    try {
      const res = await contractsApi.getContract(contractId);
      const data = res.data;
      setContract(data);
      
      if (milestoneId && data.milestones) {
        const m = data.milestones.find(m => m.id.toString() === milestoneId);
        if (m) setMilestone(m);
      }
    } catch (err) {
      toast.error(err.title || t('common.error'));
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (role === 'Freelancer') {
      loadContract();
    }
  }, [contractId, milestoneId, t, role]);

  if (role !== 'Freelancer') {
    return <Navigate to="/unauthorized" replace />;
  }

  const addAttachmentRow = () => {
    setAttachments(prev => [
      ...prev,
      { id: Math.random().toString(36).substring(7), type: 'FILE', file: null, link: '' }
    ]);
  };

  const removeAttachmentRow = (id) => {
    setAttachments(prev => prev.filter(att => att.id !== id));
  };

  const updateAttachment = (id, key, value) => {
    setAttachments(prev => prev.map(att => att.id === id ? { ...att, [key]: value } : att));
  };

  const handleFileChange = (id, e) => {
    if (e.target.files && e.target.files[0]) {
      updateAttachment(id, 'file', e.target.files[0]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setValidationError('');

    const hasNoNote = !deliveryNote.trim();
    const activeAttachments = attachments.filter(a => (a.type === 'FILE' && a.file) || (a.type === 'LINK' && a.link.trim()));
    
    if (hasNoNote && activeAttachments.length === 0) {
      setValidationError(t('delivery.emptyError'));
      return;
    }

    setIsSubmitting(true);
    try {
      const formData = new FormData();
      formData.append('ContractId', contractId);
      if (milestoneId) {
        formData.append('MilestoneId', milestoneId);
      }
      if (deliveryNote.trim()) {
        formData.append('DeliveryNote', deliveryNote.trim());
      }
      
      activeAttachments.forEach(att => {
        if (att.type === 'FILE' && att.file) {
          formData.append('Attachments', att.file);
        } else if (att.type === 'LINK' && att.link.trim()) {
          formData.append('Links', att.link.trim());
        }
      });

      await contractsApi.submitDelivery(formData);
      setIsSuccess(true);
      toast.success(t('delivery.successMessage'));
    } catch (err) {
      toast.error(err.title || t('common.error'));
    } finally {
      setIsSubmitting(false);
    }
  };

  if (error) {
    return (
      <div className="max-w-4xl mx-auto my-12 p-8 bg-red-50 rounded-xl border border-red-200 text-center flex flex-col items-center">
        <AlertTriangle className="w-16 h-16 text-red-400 mb-4" />
        <h2 className="text-2xl font-bold text-red-900 mb-2">{t('common.error')}</h2>
        <button 
          onClick={loadContract}
          className="mt-6 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-red-600 hover:bg-red-700 transition"
        >
          <RefreshCw className="w-4 h-4 mr-2" />
          {t('common.retry', 'Retry')}
        </button>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto my-8 p-6 space-y-6">
        <div className="h-32 bg-gray-200 animate-pulse rounded-lg border border-gray-200"></div>
        <div className="h-64 bg-gray-200 animate-pulse rounded-lg border border-gray-200"></div>
      </div>
    );
  }

  if (!contract) return null;

  const submitDisabled = !contract.escrowFunded || isSubmitting || isSuccess;

  return (
    <div className="max-w-4xl mx-auto my-8 p-6 space-y-6">
      
      {/* Context Header */}
      <div className="bg-white rounded-lg shadow border border-gray-200 p-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">{t('delivery.pageTitle')}</h1>
        <div className="flex flex-col md:flex-row md:justify-between mb-2">
          <div>
            <span className="font-semibold text-gray-700">{t('delivery.contractLabel')} </span>
            <span className="text-gray-900">{contract.title || contract.jobTitle}</span>
          </div>
          <div>
            <span className="font-semibold text-gray-700">{t('delivery.clientLabel')} </span>
            <span className="text-gray-900">{contract.clientName}</span>
          </div>
        </div>
        
        {milestone && (
          <div className="mt-4 pt-4 border-t border-gray-100 flex flex-wrap gap-4 text-sm">
            <div>
              <span className="font-semibold text-gray-700">{t('delivery.milestoneLabel')} </span>
              <span className="text-gray-900">{milestone.title}</span>
            </div>
            <div>
              <span className="font-semibold text-gray-700">{t('delivery.amountLabel')} </span>
              <span className="text-gray-900">{formatCurrency(milestone.amount, i18n.language)}</span>
            </div>
            {milestone.deadline && (
              <div>
                <span className="font-semibold text-gray-700">{t('delivery.deadlineLabel')} </span>
                <span className="text-gray-900">
                  {new Date(milestone.deadline).toLocaleDateString(i18n.language === 'ar' ? 'ar-EG' : 'en-US', { day: 'numeric', month: 'short', year: 'numeric' })}
                </span>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Escrow Warning Banner */}
      {!contract.escrowFunded && (
        <div className="bg-amber-50 border-l-4 border-amber-500 p-4 rounded-md flex items-start">
          <AlertTriangle className="h-6 w-6 text-amber-600 mr-3 flex-shrink-0" />
          <p className="text-amber-800 font-medium">
            {t('delivery.noEscrowWarning')}
          </p>
        </div>
      )}

      {/* Success State */}
      {isSuccess ? (
        <div className="bg-green-50 border border-green-200 rounded-lg p-8 text-center flex flex-col items-center">
          <CheckCircle2 className="h-16 w-16 text-green-500 mb-4" />
          <h2 className="text-2xl font-bold text-green-800 mb-2">{t('delivery.successMessage')}</h2>
          <button 
            type="button" 
            onClick={() => navigate('/contracts/my-contracts')}
            className="mt-6 px-4 py-2 bg-white border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-gold"
          >
            {t('contracts.back_to_contracts')}
          </button>
        </div>
      ) : (
        /* Delivery Form */
        <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow border border-gray-200 p-6 space-y-6">
          
          {/* Delivery Note */}
          <div>
            <label htmlFor="deliveryNote" className="block text-base font-medium text-gray-900 mb-2">
              {t('delivery.noteLabel')}
            </label>
            <textarea
              id="deliveryNote"
              rows={4}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-gold focus:ring focus:ring-primary-gold focus:ring-opacity-50 p-3 border"
              placeholder={t('delivery.notePlaceholder')}
              value={deliveryNote}
              onChange={(e) => setDeliveryNote(e.target.value)}
              disabled={isSubmitting}
            />
          </div>

          {/* Attachment Builder */}
          <div>
            <div className="flex justify-between items-center mb-4">
              <label className="block text-base font-medium text-gray-900">
                {t('contracts.attachments')}
              </label>
              <button
                type="button"
                onClick={addAttachmentRow}
                disabled={isSubmitting}
                className="inline-flex items-center text-sm font-medium text-primary-gold hover:text-amber-600 border border-amber-200 rounded-md px-3 py-1.5 bg-amber-50 hover:bg-amber-100 transition-colors disabled:opacity-50"
              >
                <Plus className="h-4 w-4 mr-1" />
                {t('delivery.addAttachment')}
              </button>
            </div>
            
            <div className="space-y-3">
              {attachments.map((att) => (
                <div key={att.id} className="flex items-center gap-3 bg-gray-50 p-3 rounded-lg border border-gray-200">
                  <select
                    className="block w-32 rounded-md border-gray-300 shadow-sm focus:border-primary-gold focus:ring focus:ring-primary-gold focus:ring-opacity-50 p-2 border bg-white disabled:opacity-50"
                    value={att.type}
                    onChange={(e) => updateAttachment(att.id, 'type', e.target.value)}
                    disabled={isSubmitting}
                  >
                    <option value="FILE">{t('delivery.fileType')}</option>
                    <option value="LINK">{t('delivery.linkType')}</option>
                  </select>

                  <div className="flex-1">
                    {att.type === 'FILE' ? (
                      <input
                        type="file"
                        onChange={(e) => handleFileChange(att.id, e)}
                        disabled={isSubmitting}
                        className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-primary-gold file:bg-opacity-10 file:text-amber-700 hover:file:bg-opacity-20 transition-colors disabled:opacity-50"
                      />
                    ) : (
                      <input
                        type="url"
                        placeholder="https://"
                        value={att.link}
                        onChange={(e) => updateAttachment(att.id, 'link', e.target.value)}
                        disabled={isSubmitting}
                        className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-gold focus:ring focus:ring-primary-gold focus:ring-opacity-50 p-2 border disabled:opacity-50"
                      />
                    )}
                  </div>

                  <button
                    type="button"
                    onClick={() => removeAttachmentRow(att.id)}
                    disabled={isSubmitting}
                    className="p-2 text-gray-400 hover:text-red-500 rounded-md hover:bg-red-50 transition-colors disabled:opacity-50"
                    title={t('delivery.remove')}
                  >
                    <Trash2 className="h-5 w-5" />
                  </button>
                </div>
              ))}
              
              {attachments.length === 0 && (
                <div className="text-sm text-gray-500 text-center py-4 border-2 border-dashed border-gray-200 rounded-lg bg-gray-50">
                  {t('delivery.emptyError')} ({t('contracts.no_deliveries')})
                </div>
              )}
            </div>

            {/* Validation Message */}
            {validationError && (
              <p className="mt-3 text-sm text-red-600 font-medium">
                {validationError}
              </p>
            )}
          </div>

          {/* What Happens Next Info Panel */}
          <div className="bg-blue-50 border border-blue-100 rounded-md p-4 flex items-start mt-6">
            <Info className="h-5 w-5 text-blue-500 mr-2 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-blue-800">
              {t('delivery.whatHappensNext')}
            </p>
          </div>

          {/* Actions */}
          <div className="mt-6 flex justify-end">
            <button
              type="submit"
              disabled={submitDisabled}
              className="inline-flex justify-center items-center py-2 px-6 border border-transparent shadow-sm text-base font-medium rounded-md text-white bg-primary disabled:bg-gray-400 disabled:cursor-not-allowed hover:bg-gray-800 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
              style={{ backgroundColor: !submitDisabled ? '#1e293b' : undefined }} // primary-navy
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="animate-spin -ml-1 mr-2 h-5 w-5" />
                  {t('delivery.submitting')}
                </>
              ) : (
                t('delivery.submit')
              )}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
