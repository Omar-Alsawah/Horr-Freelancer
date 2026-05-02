import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { toast } from 'react-hot-toast';
import { proposalsApi } from '../../api/proposals';
import { AlertCircle, Clock, CheckCircle, XCircle } from 'lucide-react';

const MyProposalsPage = () => {
  const { t, i18n } = useTranslation();
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
        // Assuming the API returns data grouped or we filter it here
        // For prototype, we'll just set it
        setProposals({
          active: response.data.active || [],
          submitted: response.data.submitted || [],
          offers: response.data.offers || []
        });
      } catch (error) {
        console.error('Error fetching proposals:', error);
        // Fallback dummy data for prototype demo if API fails
        setProposals({
          active: [
            { id: 1, title: 'React Native Mobile App Development', date: 'Initiated Yesterday', status: 'Interviewing' },
            { id: 2, title: 'E-commerce Website redesign', date: 'Initiated 3 days ago', status: 'Sent a proposal' }
          ],
          submitted: [
            { id: 3, title: 'Python Script for Data Analysis', date: 'Submitted 5 days ago', status: 'General Profile' }
          ],
          offers: [
            { id: 4, title: 'Looking for a Senior Frontend Developer', date: 'Received Today', clientName: 'TechCorp Inc.' }
          ]
        });
      } finally {
        setLoading(false);
      }
    };

    fetchProposals();
  }, []);

  const handleWithdraw = async (id) => {
    if (!window.confirm(t('proposals.withdraw_confirm'))) return;

    try {
      await proposalsApi.withdrawProposal(id);
      toast.success(t('proposals.withdraw_success'));
      // Update local state
      setProposals(prev => ({
        ...prev,
        active: prev.active.filter(p => p.id !== id),
        submitted: prev.submitted.filter(p => p.id !== id)
      }));
    } catch (error) {
      toast.error(t('errors.unexpected'));
    }
  };

  if (loading) return <div className="p-8 text-center">{t('common.loading')}</div>;

  return (
    <div className="container container-single-col" style={{ maxWidth: '1000px', marginTop: '2rem' }}>
      <h1 className="page-title" style={{ marginBottom: '1.5rem' }}>{t('proposals.my_proposals_title')}</h1>

      <div className="proposal-tabs">
        <div 
          className={`proposal-tab ${activeTab === 'active' ? 'active' : ''}`} 
          onClick={() => setActiveTab('active')}
        >
          {t('proposals.tab_active')}
        </div>
        <div 
          className={`proposal-tab ${activeTab === 'referrals' ? 'active' : ''}`} 
          onClick={() => setActiveTab('referrals')}
        >
          {t('proposals.tab_referrals')}
        </div>
      </div>

      {activeTab === 'active' ? (
        <div id="content-active">
          {/* Offers */}
          <div className="proposal-group">
            <div className="proposal-group-header">
              {t('proposals.offers')} ({proposals.offers.length})
            </div>
            {proposals.offers.length > 0 ? (
              proposals.offers.map(offer => (
                <div 
                  key={offer.id} 
                  className="proposal-list-item flex justify-between items-center" 
                  onClick={() => navigate(`/proposals/view-offer/${offer.id}`)}
                  style={{ cursor: 'pointer' }}
                >
                  <div>
                    <div className="proposal-date">{offer.date}</div>
                    <div className="proposal-title">{offer.title}</div>
                    <div className="proposal-meta">{offer.clientName}</div>
                  </div>
                  <CheckCircle className="text-green-500 w-5 h-5" />
                </div>
              ))
            ) : (
              <div className="proposal-list-item text-gray-500 italic">{t('proposals.no_offers')}</div>
            )}
          </div>

          {/* Active Proposals */}
          <div className="proposal-group">
            <div className="proposal-group-header">
              {t('proposals.active_proposals')} ({proposals.active.length})
            </div>
            {proposals.active.length > 0 ? (
              proposals.active.map(proposal => (
                <div 
                  key={proposal.id} 
                  className="proposal-list-item flex justify-between items-center"
                  onClick={() => navigate(`/proposals/view/${proposal.id}`)}
                  style={{ cursor: 'pointer' }}
                >
                  <div>
                    <div className="proposal-date">{proposal.date}</div>
                    <div className="proposal-title">{proposal.title}</div>
                    <div className="proposal-meta">{proposal.status}</div>
                  </div>
                  <button 
                    onClick={(e) => { e.stopPropagation(); handleWithdraw(proposal.id); }}
                    className="text-red-500 hover:underline text-sm font-medium"
                  >
                    {t('proposals.withdraw')}
                  </button>
                </div>
              ))
            ) : (
              <div className="proposal-list-item text-gray-500 italic">{t('proposals.no_active')}</div>
            )}
          </div>

          {/* Submitted Proposals */}
          <div className="proposal-group">
            <div className="proposal-group-header">
              {t('proposals.submitted_proposals')} ({proposals.submitted.length})
            </div>
            {proposals.submitted.length > 0 ? (
              proposals.submitted.map(proposal => (
                <div 
                  key={proposal.id} 
                  className="proposal-list-item flex justify-between items-center"
                  onClick={() => navigate(`/proposals/view/${proposal.id}`)}
                  style={{ cursor: 'pointer' }}
                >
                  <div>
                    <div className="proposal-date">{proposal.date}</div>
                    <div className="proposal-title">{proposal.title}</div>
                    <div className="proposal-meta">{proposal.status}</div>
                  </div>
                  <button 
                    onClick={(e) => { e.stopPropagation(); handleWithdraw(proposal.id); }}
                    className="text-red-500 hover:underline text-sm font-medium"
                  >
                    {t('proposals.withdraw')}
                  </button>
                </div>
              ))
            ) : (
              <div className="proposal-list-item text-gray-500 italic">{t('proposals.no_submitted')}</div>
            )}
          </div>
        </div>
      ) : (
        <div id="content-referrals">
          <div className="section-wrapper text-center py-16">
            <div className="flex justify-center mb-8">
              <div className="relative w-48 h-32">
                <div className="absolute left-0 bottom-0 w-16 h-16 rounded-full bg-teal-50" />
                <div className="absolute right-0 bottom-0 w-16 h-16 rounded-full bg-purple-50" />
                <div className="absolute left-8 top-0 w-32 h-24 border-2 border-dashed border-gray-200 rounded-lg flex items-center justify-center">
                   <AlertCircle className="text-gray-300 w-12 h-12" />
                </div>
              </div>
            </div>
            <h3 className="text-xl font-bold mb-2">{t('proposals.no_referrals_title')}</h3>
            <p className="text-gray-500 mb-4 max-w-md mx-auto">
              {t('proposals.no_referrals_desc')}
            </p>
            <a href="#" className="text-green-600 underline font-medium">
              {t('proposals.learn_referrals')}
            </a>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyProposalsPage;
