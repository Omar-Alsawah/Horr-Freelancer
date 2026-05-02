import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { toast } from 'react-hot-toast';
import { proposalsApi } from '../../api/proposals';
import { contractsApi } from '../../api/contracts'; // Assuming there's a contracts API

const ViewOfferPage = () => {
  const { proposalId } = useParams();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [offer, setOffer] = useState(null);
  const [loading, setLoading] = useState(true);
  const [apiError, setApiError] = useState(null);

  useEffect(() => {
    const fetchOffer = async () => {
      try {
        const response = await proposalsApi.getProposal(proposalId);
        setOffer(response.data);
      } catch (error) {
        console.error('Error fetching offer:', error);
        toast.error(error.title || t('errors.unexpected'));
      } finally {
        setLoading(false);
      }
    };

    if (proposalId) {
      fetchOffer();
    }
  }, [proposalId, t]);

  const handleAccept = async () => {
    if (!window.confirm(t('proposals.accept_offer_confirm'))) return;
    setApiError(null);

    try {
      // The prompt says POST /api/contracts/{id}/accept-offer
      // Usually, it's the proposalId or an offerId. We use proposalId here as per prompt "{id}"
      await contractsApi.acceptOffer(proposalId);
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

    try {
      await contractsApi.declineOffer(proposalId);
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

  if (loading) return <div className="p-8 text-center">{t('common.loading')}</div>;
  if (!offer) return <div className="p-8 text-center text-red-500">{t('proposals.offer_not_found')}</div>;

  return (
    <div className="container" style={{ marginTop: '2rem' }}>
      <div className="offer-container" style={{ maxWidth: '900px', margin: '2rem auto', background: '#fff', border: '1px solid var(--color-border)', borderRadius: '8px', padding: '2rem' }}>
        
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
            {t('proposals.offer_prefix')}: {offer.jobTitle || offer.title}
          </h1>
          <div className="client-name" style={{ fontSize: '1rem', color: 'var(--color-text-secondary)' }}>{offer.clientName}</div>
        </div>

        <div className="section-title" style={{ fontSize: '1.1rem', fontWeight: '600', marginBottom: '1rem' }}>{t('proposals.contract_terms')}</div>
        <div className="terms-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', marginBottom: '2rem' }}>
          <div className="term-item" style={{ marginBottom: '0.5rem' }}>
            <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--color-text-secondary)', marginBottom: '0.3rem' }}>{t('proposals.contract_title')}</label>
            <div style={{ fontWeight: '500', fontSize: '1.05rem' }}>{offer.contractTitle || offer.jobTitle || offer.title}</div>
          </div>
          <div className="term-item" style={{ marginBottom: '0.5rem' }}>
            <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--color-text-secondary)', marginBottom: '0.3rem' }}>{t('proposals.amount')}</label>
            <div style={{ fontWeight: '500', fontSize: '1.05rem' }}>{t('jobs.egp_format', { amount: (offer.amount || offer.offeredRate || 0).toFixed(2) })}</div>
          </div>
          <div className="term-item" style={{ marginBottom: '0.5rem' }}>
            <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--color-text-secondary)', marginBottom: '0.3rem' }}>{t('proposals.weekly_limit')}</label>
            <div style={{ fontWeight: '500', fontSize: '1.05rem' }}>{offer.weeklyLimit || 'N/A'}</div>
          </div>
          <div className="term-item" style={{ marginBottom: '0.5rem' }}>
            <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--color-text-secondary)', marginBottom: '0.3rem' }}>{t('proposals.start_date')}</label>
            <div style={{ fontWeight: '500', fontSize: '1.05rem' }}>{offer.startDate ? new Date(offer.startDate).toLocaleDateString() : 'N/A'}</div>
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
                {offer.terms.map((term, index) => (
                  <tr key={index} style={{ borderBottom: '1px solid #f9f9f9' }}>
                    <td style={{ padding: '0.75rem 0' }}>{term.milestoneTitle}</td>
                    <td style={{ padding: '0.75rem 0' }}>{t('jobs.egp_format', { amount: term.amount.toFixed(2) })}</td>
                    <td style={{ padding: '0.75rem 0' }}>{new Date(term.dueDate).toLocaleDateString()}</td>
                  </tr>
                ))}
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
          <button className="btn btn-outline" onClick={handleDecline} style={{ borderColor: '#d32f2f', color: '#d32f2f', padding: '0.6rem 1.5rem', borderRadius: '4px' }}>
            {t('proposals.decline_offer')}
          </button>
          <button className="btn btn-outline" onClick={() => navigate('/messages')} style={{ padding: '0.6rem 1.5rem', borderRadius: '4px' }}>
            {t('proposals.message_client')}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ViewOfferPage;
