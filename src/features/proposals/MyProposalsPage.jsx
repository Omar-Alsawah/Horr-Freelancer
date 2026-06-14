import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { toast } from 'react-hot-toast';
import { proposalsApi } from '../../api/proposals';

const MyProposalsPage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('submitted');
  const [proposals, setProposals] = useState({
    active: [],
    submitted: [],
    offers: []
  });
  const [loading, setLoading] = useState(true);

  const fetchedRef = useRef(false);

  useEffect(() => {
    if (fetchedRef.current) return;
    fetchedRef.current = true;

    const fetchProposals = async () => {
      try {
        const response = await proposalsApi.getMyProposals();
        const payload = response.data?.data || response.data;
        let activeList = [];
        let submittedList = [];
        let offersList = [];

        const items = Array.isArray(payload)
          ? payload
          : (payload?.items || payload?.Items || null);

        if (items) {
          items.forEach(item => {
            const statusVal = item.status !== undefined ? item.status : item.Status;
            const statusStr = String(statusVal != null ? statusVal : '').toLowerCase();
            if (statusStr === 'active' || statusStr === '2') {
              activeList.push(item);
            } else if (statusStr === 'offer' || statusStr === 'accepted' || statusStr === '1') {
              offersList.push(item);
            } else {
              submittedList.push(item);
            }
          });
        } else {
          activeList = payload?.activeProposals || payload?.active || [];
          submittedList = payload?.submittedProposals || payload?.submitted || [];
          offersList = payload?.offers || payload?.pendingOffers || [];
        }

        setProposals({
          active: activeList,
          submitted: submittedList,
          offers: offersList
        });
      } catch (error) {
        console.error('Error fetching proposals:', error);
        toast.error(error.title || t('errors.unexpected'));
      } finally {
        setLoading(false);
      }
    };

    fetchProposals();
  }, [t]);

  const handleWithdraw = async (id, e) => {
    e.stopPropagation();
    if (!window.confirm(t('proposals.withdraw_confirm'))) return;

    // Save previous state for rollback
    const previousSubmitted = [...proposals.submitted];

    // Optimistic update
    setProposals(prev => ({
      ...prev,
      submitted: prev.submitted.filter(p => p.id !== id)
    }));

    try {
      await proposalsApi.withdrawProposal(id);
    } catch (error) {
      // Rollback
      setProposals(prev => ({
        ...prev,
        submitted: previousSubmitted
      }));
      toast.error(error.title || t('errors.unexpected'));
    }
  };

  if (loading) return <div className="p-8 text-center">{t('common.loading')}</div>;

  const renderEmptyState = (tabName) => {
    const noActive = t('proposals.no_active', 'No active proposals');
    const noSubmitted = t('proposals.no_submitted', 'No submitted proposals');
    const noOffers = t('proposals.no_offers', 'No offers yet');
    const subtitle = t('proposals.empty_saved_subtitle', 'You have no proposals in this section.');

    return (
      <div className="card empty-state" style={{ textAlign: 'center', padding: '4rem 2rem' }}>
        <svg width="200" height="150" viewBox="0 0 200 150" fill="none" style={{ margin: '0 auto 1.5rem' }}>
          <rect x="40" y="40" width="60" height="60" rx="30" fill="#E0F2F1" />
          <rect x="100" y="40" width="60" height="60" rx="30" fill="#E1BEE7" />
          <path d="M100 100 L40 40" stroke="#aaa" strokeWidth="2" />
          <path d="M100 100 L160 40" stroke="#aaa" strokeWidth="2" />
        </svg>
        <h3 style={{ marginBottom: '0.5rem', fontSize: '1.25rem' }}>
          {tabName === 'active' ? noActive : tabName === 'submitted' ? noSubmitted : noOffers}
        </h3>
        <p style={{ color: 'var(--color-text-secondary)', marginBottom: '1rem' }}>
          {subtitle}
        </p>
      </div>
    );
  };

  const resolveStatusText = (statusVal) => {
    const statusStr = String(statusVal != null ? statusVal : '').toLowerCase();
    if (statusStr === 'active' || statusStr === '2') return 'Active';
    if (statusStr === 'offer' || statusStr === 'accepted' || statusStr === '1') return 'Offer';
    if (statusStr === 'withdrawn' || statusStr === '3') return 'Withdrawn';
    if (statusStr === 'declined' || statusStr === '4') return 'Declined';
    return 'Submitted';
  };

  const renderStatusBadge = (statusVal) => {
    const status = resolveStatusText(statusVal);
    let color = '#777';
    let bg = '#eee';
    if (status === 'Active') {
      color = '#108a00';
      bg = '#e5f3e5';
    } else if (status === 'Submitted') {
      color = '#1565C0';
      bg = '#E3F2FD';
    } else if (status === 'Offer') {
      color = '#854d0e';
      bg = '#fef9c3';
    } else if (status === 'Withdrawn' || status === 'Declined') {
      color = '#d32f2f';
      bg = '#fdeaea';
    }

    return (
      <span style={{ 
        display: 'inline-block', 
        padding: '0.2rem 0.6rem', 
        borderRadius: '4px', 
        fontSize: '0.75rem', 
        fontWeight: '500',
        backgroundColor: bg,
        color: color,
        marginLeft: '0.5rem'
      }}>
        {status}
      </span>
    );
  };

  const currentList = proposals[activeTab] || [];

  return (
    <div className="container container-single-col" style={{ maxWidth: '1000px', marginTop: '2rem' }}>
      <h1 className="page-title" style={{ marginBottom: '1.5rem' }}>{t('proposals.my_proposals_title')}</h1>

      <div className="proposal-tabs">
        <div 
          className={`proposal-tab ${activeTab === 'submitted' ? 'active' : ''}`} 
          onClick={() => setActiveTab('submitted')}
        >
          {t('proposals.submitted_proposals')} ({proposals.submitted.length})
        </div>
        <div 
          className={`proposal-tab ${activeTab === 'offers' ? 'active' : ''}`} 
          onClick={() => setActiveTab('offers')}
        >
          {t('proposals.offers')} ({proposals.offers.length})
        </div>
        <div 
          className={`proposal-tab ${activeTab === 'active' ? 'active' : ''}`} 
          onClick={() => setActiveTab('active')}
        >
          {t('proposals.tab_active') || 'Active'} ({proposals.active.length})
        </div>
      </div>

      <div id={`content-${activeTab}`}>
        {currentList.length === 0 ? (
          renderEmptyState(activeTab)
        ) : (
          <div className="proposal-group">
            <div className="proposal-group-header">
              {activeTab === 'submitted' ? t('proposals.submitted_proposals') : activeTab === 'offers' ? t('proposals.offers') : (t('proposals.active_proposals') || 'Active Proposals')}
            </div>
            {currentList.map(item => {
              const bid = item.bidAmount ?? item.bidRate ?? 0;
              const fee = bid * 0.10;
              return (
                <div 
                  key={item.id} 
                  className="proposal-list-item" 
                  onClick={() => navigate(activeTab === 'offers' ? `/offers/${item.id}` : `/proposals/${item.id}`, { state: { proposal: item } })}
                  style={{ cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
                >
                  <div>
                    <div className="proposal-date">
                      {(() => {
                        const raw = item.submittedAt || item.createdAt || item.date || item.submittedDate;
                        return raw ? new Date(raw).toLocaleDateString() : '—';
                      })()}
                    </div>
                    <div className="proposal-title">{item.jobPostTitle || item.JobPostTitle || item.jobTitle || item.title || 'Untitled'}</div>
                    <div className="proposal-meta" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                      {bid > 0 && <span>{t('jobs.egp_format', { amount: bid.toFixed(2) })}</span>}
                      {bid > 0 && <span style={{ color: '#aaa' }}>|</span>}
                      {bid > 0 && <span>{t('proposals.horrFee') || 'Fee'}: {t('jobs.egp_format', { amount: fee.toFixed(2) })}</span>}
                      {renderStatusBadge(item.status)}
                    </div>
                  </div>
                  {activeTab === 'submitted' && (
                    <button 
                      onClick={(e) => handleWithdraw(item.id, e)}
                      style={{ 
                        color: '#d32f2f', 
                        background: '#fff', 
                        border: '1px solid #fecaca', 
                        borderRadius: '6px',
                        padding: '0.4rem 0.8rem',
                        cursor: 'pointer', 
                        fontWeight: '500',
                        fontSize: '0.85rem',
                        transition: 'all 0.2s'
                      }}
                      onMouseEnter={(e) => { e.currentTarget.style.background = '#fef2f2'; e.currentTarget.style.borderColor = '#fca5a5'; }}
                      onMouseLeave={(e) => { e.currentTarget.style.background = '#fff'; e.currentTarget.style.borderColor = '#fecaca'; }}
                    >
                      {t('proposals.withdraw')}
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

    </div>
  );
};

export default MyProposalsPage;
