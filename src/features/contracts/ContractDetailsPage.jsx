import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Paperclip, MessageSquare } from 'lucide-react';
import toast from 'react-hot-toast';
import { contractsApi } from '../../api/contracts';
import { getChatByContract } from '../../api/chatApi';

function formatEgp(amount, lang) {
  if (amount == null) return '';
  const n = Number(amount);
  if (lang === 'ar') return `${new Intl.NumberFormat('ar-EG').format(n)} ج.م`;
  return `EGP ${new Intl.NumberFormat('en-EG').format(n)}`;
}

export default function ContractDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  const lang = i18n.language;

  const [contract, setContract] = useState(null);
  const [deliveries, setDeliveries] = useState([]);
  const [loading, setLoading] = useState(true);


  // Review
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [reviewSubmitting, setReviewSubmitting] = useState(false);

  const fetchContract = useCallback(async () => {
    try {
      setLoading(true);
      const res = await contractsApi.getContract(id);
      const contractData = res.data?.data || res.data;
      setContract(contractData);
      try {
        const resDeliveries = await contractsApi.getDeliveries(id);
        setDeliveries(resDeliveries.data?.data || resDeliveries.data || []);
      } catch (err) {
        console.error('Failed to load deliveries:', err);
      }
    } catch (err) {
      toast.error(err.title || t('common.error'));
      navigate('/contracts/my-contracts');
    } finally {
      setLoading(false);
    }
  }, [id, navigate, t]);

  useEffect(() => {
    let active = true;
    const load = async () => {
      await Promise.resolve();
      if (active) {
        fetchContract();
      }
    };
    load();
    return () => {
      active = false;
    };
  }, [fetchContract]);


  const submitReview = async () => {
    if (rating === 0) {
      toast.error("Please provide a rating before submitting.");
      return;
    }
    
    setReviewSubmitting(true);
    try {
      const res = await contractsApi.submitReview(id, { rating, comment });
      toast.success(t('contracts.feedback_submitted'));
      
      // Update contract state to hide form & show review
      setContract(prev => ({
        ...prev,
        review: res.data || { rating, comment }
      }));
    } catch (err) {
      if (err.status === 409) {
        toast.error(t('contracts.duplicate_review'));
      } else {
        toast.error(err.title || t('common.error'));
      }
    } finally {
      setReviewSubmitting(false);
    }
  };

  const handleMessageClient = async () => {
    try {
      setLoading(true);
      const chatObj = await getChatByContract(id);
      const targetChatId = chatObj?.chatId ?? chatObj?.ChatId ?? chatObj?.id ?? chatObj?.Id;
      if (targetChatId) {
        navigate(`/messages/${targetChatId}`);
      } else {
        toast.error('Could not resolve chat ID');
      }
    } catch (err) {
      console.error('Failed to open chat:', err);
      toast.error(err.title || t('common.error'));
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="main-container text-center py-20">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-[#eab308] border-t-transparent"></div>
      </div>
    );
  }

  if (!contract) return null;

  const statusVal = contract.status !== undefined ? contract.status : contract.Status;
  const statusStr = String(statusVal != null ? statusVal : '').toLowerCase();
  const isActive = statusStr === 'active' || statusStr === '1';
  const isClosed = statusStr === 'closed' || statusStr === 'completed' || statusStr === '2' || statusStr === '5';
  const title = contract.proposal_Title || contract.proposalTitle || contract.jobTitle || contract.JobTitle || contract.title || 'Contract';
  const clientName = contract.client_Name || contract.clientName || contract.Client_Name || 'Client';
  const rate = contract.agreedRate || contract.AgreedRate;
  const started = contract.startedAt || contract.startDate || contract.StartedAt;
  const formattedStartDate = started ? new Date(started).toLocaleDateString() : 'N/A';
  const description = contract.description || contract.Description || 'This contract involves the full scope of work as discussed in the proposal. The goal is to deliver high-quality results within the agreed timeline.';

  return (
    <div className="main-container">
      <Link to="/contracts/my-contracts" style={{ display: 'inline-block', marginBottom: 16, color: 'var(--color-primary-green)', textDecoration: 'none' }}>
        &larr; {t('contracts.back_to_contracts')}
      </Link>

      <div className="details-card">
        {/* Header */}
        <div className="contract-header">
          <div className="header-left">
            <h1 id="contract-title">{title}</h1>
            <div className="client-subtitle">{clientName}</div>
          </div>
          <div className="header-right header-buttons">
            {isActive && (
              <button className="btn-deliver" onClick={() => navigate(`/contracts/${id}/deliveries`)}>
                {t('contracts.view_delivery_portal') || 'View Delivery Portal'}
              </button>
            )}
            <button className="btn-message" onClick={handleMessageClient} title="Message Client">
              <MessageSquare size={20} />
            </button>
          </div>
        </div>

        {/* Terms Grid */}
        <div className="section-title">{t('contracts.terms_title') || 'Contract Terms'}</div>
        <div className="terms-grid">
          <div className="term-item">
            <label>{t('contracts.price')}</label>
            <span>{formatEgp(rate, lang)}</span>
          </div>
          <div className="term-item">
            <label>{t('contracts.start_date')}</label>
            <span>{formattedStartDate}</span>
          </div>
          <div className="term-item">
            <label>{t('contracts.status')}</label>
            <span className={`contract-status ${isActive ? 'status-active' : 'status-closed'}`}>
              {isActive ? t('contracts.status_active') : t('contracts.status_closed')}
            </span>
          </div>
        </div>

        <div className="section-title">{t('contracts.description')}</div>
        <div className="description-box mb-8 whitespace-pre-wrap">
          {description}
        </div>

        {/* Delivery History */}
        <div className="border-t border-[#e2e2e2] pt-6 mb-8">
            <div className="section-title">{t('contracts.delivery_history')}</div>
            {(!deliveries || deliveries.length === 0) ? (
               <p className="text-[#5e6d55] text-sm">{t('contracts.no_deliveries')}</p>
            ) : (
                <div className="space-y-4">
                   {deliveries.map((delivery, idx) => {
                      const dStatus = delivery.status || 'Delivered';
                      const dNote = delivery.deliveryNote || delivery.note || '';
                      const dDate = delivery.submittedAt || delivery.date || new Date().toISOString();
                      const dAttachments = delivery.attachments || delivery.files || [];

                      return (
                        <div key={delivery.id || idx} className="p-4 border border-[#e2e2e2] rounded-lg bg-gray-50">
                            <div className="flex justify-between items-start mb-2">
                               <div className="font-medium text-[#001e00]">{new Date(dDate).toLocaleDateString()}</div>
                               <span className="text-xs bg-gray-200 px-2 py-1 rounded inline-flex items-center">{dStatus}</span>
                            </div>
                            {dNote && <p className="text-sm text-[#5e6d55] mb-3 whitespace-pre-wrap">{dNote}</p>}
                            {dAttachments.length > 0 && (
                              <div className="flex flex-wrap gap-2">
                                 {dAttachments.map((f, i) => {
                                   const fName = f.name || f.fileName || f.originalFileName || 'Attachment';
                                   return (
                                     <span key={f.id || i} className="text-xs bg-white border border-[#e2e2e2] px-2 py-1 rounded-full flex items-center gap-1 shadow-sm"><Paperclip size={12}/>{fName}</span>
                                   );
                                 })}
                              </div>
                            )}
                        </div>
                      );
                   })}
                </div>
            )}
        </div>

        {/* Contract Closed Notice OR Review Section */}
        {isClosed && (
            <div className="feedback-section border-t border-[#e2e2e2] pt-6">
                {!contract.review ? (
                    <>
                        <div className="mb-4 p-4 bg-[#f2f2f2] text-[#5e6d55] rounded-lg text-sm text-center font-medium">
                            {t('contracts.contract_closed_notice')}
                        </div>
                        <div className="section-title">{t('contracts.rate_client')}</div>
                        <div className="star-rating flex gap-2 mb-4">
                            {[1, 2, 3, 4, 5].map(star => (
                                <span 
                                    key={star} 
                                    className={`text-3xl cursor-pointer transition-colors ${rating >= star ? 'text-[#FFC107]' : 'text-[#d1d1d1]'}`}
                                    onClick={() => setRating(star)}
                                >
                                    ★
                                </span>
                            ))}
                        </div>
                        <textarea 
                            className="feedback-textarea w-full p-4 border border-[#e0e0e0] rounded-xl font-['Inter'] text-[15px] resize-y min-h-[120px] outline-none bg-[#fafafa] mb-4 focus:bg-white focus:border-[#c5a065] transition-colors"
                            placeholder={t('contracts.feedback_placeholder')}
                            value={comment}
                            onChange={e => setComment(e.target.value)}
                        />
                        <button 
                            className="btn-deliver disabled:opacity-50"
                            onClick={submitReview}
                            disabled={reviewSubmitting}
                        >
                            {reviewSubmitting ? t('common.loading') : t('contracts.submit_feedback')}
                        </button>
                    </>
                ) : (
                    <div className="bg-[#f0f7f0] p-6 rounded-xl border border-[#e2e2e2]">
                        <div className="section-title text-[#001e00] !mb-2">Your Review</div>
                        <div className="text-[#FFC107] text-2xl mb-2">{'★'.repeat(contract.review.rating || 5)}</div>
                        {contract.review.comment && <p className="text-[#5e6d55] italic">"{contract.review.comment}"</p>}
                    </div>
                )}
            </div>
        )}
      </div>
    </div>
  );
}
