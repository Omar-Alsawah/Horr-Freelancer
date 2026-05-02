import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { toast } from 'react-hot-toast';
import { proposalsApi } from '../../api/proposals';

const MyProposalsPage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('active');
  const [proposals, setProposals] = useState({
    active: [],
    submitted: [],
    offers: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProposals = async () => {
      try {
        const response = await proposalsApi.getMyProposals();
        setProposals({
          active: response.data.active || [],
          submitted: response.data.submitted || [],
          offers: response.data.offers || []
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
    const previousActive = [...proposals.active];

    // Optimistic update
    setProposals(prev => ({
      ...prev,
      active: prev.active.filter(p => p.id !== id)
    }));

    try {
      await proposalsApi.withdrawProposal(id);
    } catch (error) {
      // Rollback
      setProposals(prev => ({
        ...prev,
        active: previousActive
      }));
      toast.error(error.title || t('errors.unexpected'));
    }
  };

  if (loading) return <div className="p-8 text-center">{t('common.loading')}</div>;

  const renderEmptyState = (tabName) => (
    <div className="card empty-state" style={{ textAlign: 'center', padding: '4rem 2rem' }}>
      <svg width="200" height="150" viewBox="0 0 200 150" fill="none" style={{ margin: '0 auto 1.5rem' }}>
        <rect x="40" y="40" width="60" height="60" rx="30" fill="#E0F2F1" />
        <rect x="100" y="40" width="60" height="60" rx="30" fill="#E1BEE7" />
        <path d="M100 100 L40 40" stroke="#aaa" strokeWidth="2" />
        <path d="M100 100 L160 40" stroke="#aaa" strokeWidth="2" />
      </svg>
      <h3 style={{ marginBottom: '0.5rem', fontSize: '1.25rem' }}>
        {tabName === 'active' ? t('proposals.no_active') : tabName === 'submitted' ? t('proposals.no_submitted') : t('proposals.no_offers')}
      </h3>
      <p style={{ color: 'var(--color-text-secondary)', marginBottom: '1rem' }}>
        {t('proposals.empty_saved_subtitle') || 'You have no proposals here.'}
      </p>
    </div>
  );

  const renderStatusBadge = (status) => {
    let color = '#777';
    let bg = '#eee';
    if (status === 'Active' || status === 'Interviewing') {
      color = '#108a00';
      bg = '#e5f3e5';
    } else if (status === 'Submitted') {
      color = '#1565C0';
      bg = '#E3F2FD';
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
          className={`proposal-tab ${activeTab === 'active' ? 'active' : ''}`} 
          onClick={() => setActiveTab('active')}
        >
          {t('proposals.tab_active')} ({proposals.active.length})
        </div>
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
      </div>

      <div id={`content-${activeTab}`}>
        {currentList.length === 0 ? (
          renderEmptyState(activeTab)
        ) : (
          <div className="proposal-group">
            <div className="proposal-group-header">
              {activeTab === 'active' ? t('proposals.active_proposals') : activeTab === 'submitted' ? t('proposals.submitted_proposals') : t('proposals.offers')}
            </div>
            {currentList.map(item => {
              const fee = item.bidRate ? item.bidRate * 0.10 : 0;
              return (
                <div 
                  key={item.id} 
                  className="proposal-list-item" 
                  onClick={() => navigate(activeTab === 'offers' ? `/offers/${item.id}` : `/proposals/${item.id}`)}
                  style={{ cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
                >
                  <div>
                    <div className="proposal-date">{item.submittedDate || item.date}</div>
                    <div className="proposal-title">{item.jobTitle || item.title}</div>
                    <div className="proposal-meta" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                      {item.bidRate && <span>{t('jobs.egp_format', { amount: item.bidRate.toFixed(2) })}</span>}
                      {item.bidRate && <span style={{ color: '#aaa' }}>|</span>}
                      {item.bidRate && <span>{t('proposals.horrFee') || 'Fee'}: ${fee.toFixed(2)}</span>}
                      {renderStatusBadge(item.status)}
                    </div>
                  </div>
                  {activeTab === 'active' && (
                    <button 
                      onClick={(e) => handleWithdraw(item.id, e)}
                      style={{ color: '#d32f2f', background: 'none', border: 'none', cursor: 'pointer', fontWeight: '500' }}
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
