import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, useLocation, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { toast } from 'react-hot-toast';
import { ArrowLeft } from 'lucide-react';
import { proposalsApi } from '../../api/proposals';
import { contractsApi } from '../../api/contracts'; // Assuming there's a contracts API
import { initiateChat } from '../../api/chatApi';

const ViewOfferPage = () => {
  const { proposalId } = useParams();
  const { state } = useLocation();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [offer, setOffer] = useState(state?.proposal || null);
  const [loading, setLoading] = useState(!state?.proposal);
  const [apiError, setApiError] = useState(null);
  const [contractId, setContractId] = useState(null); // Stored separately for reliable access in action handlers

  const fetchedRef = useRef(false);

  useEffect(() => {
    if (fetchedRef.current) return;
    fetchedRef.current = true;

    const fetchOfferDetails = async () => {
      try {
        setLoading(true);
        let currentOffer = offer;
        let cId = proposalId;

        // If not passed via state, look up in proposals list first
        if (!currentOffer) {
          const response = await proposalsApi.getMyProposals();
          const payload = response.data?.data || response.data;
          const activeList = payload?.activeProposals || payload?.active || [];
          const submittedList = payload?.submittedProposals || payload?.submitted || [];
          const offersList = payload?.offers || payload?.pendingOffers || [];
          const allProposals = [...activeList, ...submittedList, ...offersList];
          currentOffer = allProposals.find(p => String(p.id || p.Id) === String(proposalId));
        }

        if (currentOffer) {
          cId = currentOffer.contractId ?? currentOffer.ContractId ?? currentOffer.id ?? currentOffer.Id ?? proposalId;
          setContractId(cId); // Store contract ID in state for use in action handlers
          
          try {
            const contractRes = await proposalsApi.getOffer(cId);
            const contractData = contractRes.data?.data || contractRes.data;
            setOffer({ ...currentOffer, ...contractData });
          } catch (contractErr) {
            console.error('Error fetching detailed contract offer:', contractErr);
            setOffer(currentOffer);
          }
        } else {
          setOffer(null);
        }
      } catch (error) {
        console.error('Error in fetchOfferDetails:', error);
        toast.error(error.title || t('errors.unexpected'));
      } finally {
        setLoading(false);
      }
    };

    if (proposalId) {
      fetchOfferDetails();
    }
  }, [proposalId, t]);

  const handleAccept = async () => {
    if (!window.confirm(t('proposals.accept_offer_confirm'))) return;
    setApiError(null);

    const cId = contractId ?? offer?.contractId ?? offer?.ContractId;
    if (!cId) {
      toast.error('No contract ID found to accept offer');
      return;
    }

    try {
      await contractsApi.acceptOffer(cId);
      toast.success(t('proposals.accept_offer_success'));
      navigate('/contracts/my-contracts');
    } catch (error) {
      if (error.status === 400 || error.status === 422) {
        setApiError(error.title || t('errors.unexpected'));
      } else {
        toast.error(error.title || t('errors.unexpected'));
      }
    }
  };

  const handleDecline = async () => {
    if (!window.confirm(t('proposals.withdraw_confirm') /* reusing generic confirm as decline_confirm is not explicitly asked for without reason, wait, prompt says "show a confirmation dialog" */)) return;
    setApiError(null);

    const cId = contractId ?? offer?.contractId ?? offer?.ContractId;
    if (!cId) {
      toast.error('No contract ID found to decline offer');
      return;
    }

    try {
      await contractsApi.declineOffer(cId);
      toast(t('proposals.decline_offer_success'), { icon: 'ℹ️' });
      navigate('/proposals/my-proposals');
    } catch (error) {
      if (error.status === 400 || error.status === 422) {
        setApiError(error.title || t('errors.unexpected'));
      } else {
        toast.error(error.title || t('errors.unexpected'));
      }
    }
  };

  const handleMessageClient = async () => {
    const cId = contractId ?? offer?.contractId ?? offer?.ContractId;
    if (!cId) {
      toast.error('No contract ID found');
      return;
    }

    try {
      setLoading(true);
      // POST /api/chat/initiate with { contractId } in the body
      const chatObj = await initiateChat(cId);
      const targetChatId = chatObj?.chatId ?? chatObj?.ChatId ?? chatObj?.id ?? chatObj?.Id;
      if (targetChatId) {
        navigate(`/messages/${targetChatId}`);
      } else {
        toast.error('Could not resolve chat ID');
      }
    } catch (err) {
      console.error('Failed to open chat:', err);
      toast.error(err.title || t('errors.unexpected'));
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="p-8 text-center">{t('common.loading')}</div>;
  if (!offer) return <div className="p-8 text-center text-red-500">{t('proposals.offer_not_found')}</div>;

  return (
    <div className="main-container">
      <Link 
        to="/proposals/my-proposals" 
        style={{ display: 'inline-block', marginBottom: 16, color: 'var(--color-primary-green)', textDecoration: 'none' }}
      >
        &larr; {t('proposals.back_to_list', 'Back to Proposals')}
      </Link>

      <div className="offer-container details-card">
        
        {apiError && (
          <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-lg mb-6 flex items-center gap-2">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z" />
            </svg>
            <span className="font-semibold">{apiError}</span>
          </div>
        )}

        <div className="offer-header" style={{ borderBottom: '1px solid var(--color-border)', paddingBottom: '1.5rem', marginBottom: '1.5rem' }}>
          <h1 className="offer-title" style={{ fontSize: '1.5rem', fontWeight: '600', marginBottom: '0.5rem' }}>
            {t('proposals.offer_prefix')}: {offer.jobPostTitle || offer.JobPostTitle || offer.jobTitle || offer.title || 'Untitled'}
          </h1>
          <div className="client-name" style={{ fontSize: '1rem', color: 'var(--color-text-secondary)' }}>{offer.clientName || offer.ClientName || offer.client_Name || 'Client'}</div>
        </div>

        <div className="section-title" style={{ fontSize: '1.1rem', fontWeight: '600', marginBottom: '1rem' }}>{t('proposals.contract_terms')}</div>
        <div className="terms-grid" style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr 1fr', gap: '1.5rem', marginBottom: '2rem' }}>
          <div className="term-item" style={{ marginBottom: '0.5rem' }}>
            <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--color-text-secondary)', marginBottom: '0.3rem' }}>{t('proposals.contract_title')}</label>
            <div style={{ fontWeight: '500', fontSize: '1.05rem', color: '#1e293b' }}>{offer.contractTitle || offer.jobPostTitle || offer.JobPostTitle || offer.jobTitle || offer.title || 'Untitled'}</div>
          </div>
          <div className="term-item" style={{ marginBottom: '0.5rem' }}>
            <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--color-text-secondary)', marginBottom: '0.3rem' }}>{t('proposals.amount')}</label>
            <div style={{ fontWeight: '500', fontSize: '1.05rem', color: '#1e293b' }}>
              {t('jobs.egp_format', { amount: (offer.amount ?? offer.offeredRate ?? offer.bidRate ?? offer.BidRate ?? offer.bidAmount ?? 0).toFixed(2) })}
            </div>
          </div>
          <div className="term-item" style={{ marginBottom: '0.5rem' }}>
            <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--color-text-secondary)', marginBottom: '0.3rem' }}>{t('proposals.start_date')}</label>
            <div style={{ fontWeight: '500', fontSize: '1.05rem', color: '#1e293b' }}>
              {(() => {
                const startRaw = offer.startDate ?? offer.StartDate ?? offer.createdAt ?? offer.CreatedAt;
                return startRaw ? new Date(startRaw).toLocaleDateString() : 'N/A';
              })()}
            </div>
          </div>
        </div>

        {offer.terms && offer.terms.length > 0 && (
          <div style={{ marginBottom: '2rem' }}>
            <div className="section-title" style={{ fontSize: '1.1rem', fontWeight: '600', marginBottom: '1rem' }}>
               {t('proposals.milestones_title')}
            </div>
            <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '1rem' }}>
              <thead>
                <tr style={{ textAlign: 'left', borderBottom: '1px solid #eee' }}>
                  <th style={{ padding: '0.75rem 0' }}>{t('proposals.milestone_title_label')}</th>
                  <th style={{ padding: '0.75rem 0' }}>{t('proposals.milestone_amount_label')}</th>
                  <th style={{ padding: '0.75rem 0' }}>{t('proposals.milestone_date_label')}</th>
                </tr>
              </thead>
              <tbody>
                {offer.terms.map((term, index) => {
                  const termTitle = term.milestoneTitle ?? term.MilestoneTitle ?? term.title ?? `Milestone ${index + 1}`;
                  const termAmount = term.amount ?? term.Amount ?? 0;
                  const rawDueDate = term.dueDate ?? term.DueDate;
                  const formattedDueDate = rawDueDate ? new Date(rawDueDate).toLocaleDateString() : '—';
                  return (
                    <tr key={index} style={{ borderBottom: '1px solid #f9f9f9' }}>
                      <td style={{ padding: '0.75rem 0' }}>{termTitle}</td>
                      <td style={{ padding: '0.75rem 0' }}>{t('jobs.egp_format', { amount: termAmount.toFixed(2) })}</td>
                      <td style={{ padding: '0.75rem 0' }}>{formattedDueDate}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        <div className="section-title" style={{ fontSize: '1.1rem', fontWeight: '600', marginBottom: '1rem' }}>{t('proposals.message_from_client')}</div>
        <div className="message-box" style={{ background: '#f9f9f9', padding: '1rem', borderRadius: '6px', border: '1px solid #eee', marginBottom: '2rem' }}>
          {offer.messageFromClient || offer.message || "No message provided."}
        </div>

        <div className="action-buttons" style={{ display: 'flex', gap: '1rem', marginTop: '2rem' }}>
          <button className="btn btn-primary" onClick={handleAccept} style={{ padding: '0.6rem 1.5rem', borderRadius: '4px' }}>
            {t('proposals.accept_offer')}
          </button>
          <button 
            className="btn btn-outline" 
            onClick={handleDecline} 
            style={{ 
              borderColor: '#fca5a5', 
              color: '#d32f2f', 
              padding: '0.6rem 1.5rem', 
              borderRadius: '4px',
              backgroundColor: '#fff',
              fontWeight: '500',
              cursor: 'pointer',
              transition: 'all 0.2s'
            }}
            onMouseEnter={(e) => { e.target.style.backgroundColor = '#fef2f2'; e.target.style.borderColor = '#ef4444'; }}
            onMouseLeave={(e) => { e.target.style.backgroundColor = '#fff'; e.target.style.borderColor = '#fca5a5'; }}
          >
            {t('proposals.decline_offer')}
          </button>
          <button className="btn btn-outline" onClick={handleMessageClient} style={{ padding: '0.6rem 1.5rem', borderRadius: '4px' }}>
            {t('proposals.message_client')}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ViewOfferPage;
