import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { getClientProposals, revokeOffer, createOffer } from '../../../services/clientService';
import useFetch from '../../../hooks/useFetch';
import ProposalsList from '../components/ProposalsList';
import RejectConfirmModal from '../components/RejectConfirmModal';
import CreateOfferModal from '../components/CreateOfferModal';
import { toast } from 'sonner';

const JobProposalsPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const jobId = searchParams.get('jobId');

  const {
    data: proposalsData,
    loading,
    error,
    setData: setProposals,
    refetch: refetchProposals,
  } = useFetch(getClientProposals);

  const proposals = Array.isArray(proposalsData) ? proposalsData : [];
  const [activeTab, setActiveTab] = useState('active');

  const [rejectingProposal, setRejectingProposal] = useState(null);
  const [acceptingProposal, setAcceptingProposal] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);

  const handleRejectConfirm = async () => {
    setActionLoading(true);
    try {
      await revokeOffer(rejectingProposal.id);
      setProposals((prev) =>
        Array.isArray(prev)
          ? prev.map((p) =>
              p.id === rejectingProposal.id ? { ...p, status: 'Revoked' } : p
            )
          : prev
      );
      toast.success('Offer revoked successfully');
      setRejectingProposal(null);
    } catch (err) {
      const status = err.response?.status;
      if (status === 404) {
        toast.error('Proposal not found.');
      } else if (status === 400) {
        toast.error(err.response?.data?.message || 'Bad request. Could not reject proposal.');
      } else {
        toast.error('Something went wrong. Please try again.');
      }
    } finally {
      setActionLoading(false);
    }
  };

  const handleCreateOffer = async ({ agreedRate, jobDescription }) => {
    setActionLoading(true);
    try {
      await createOffer({
       freelancerId: acceptingProposal.freelancerId,
       proposalId: acceptingProposal.id,
       jobPostId: acceptingProposal.jobPostId,
       agreedRate,
       jobDescription,
    });
      await refetchProposals();
      toast.success('Offer sent successfully');
      setAcceptingProposal(null);
    } catch (err) {
      const status = err.response?.status;
      if (status === 400) {
        toast.error(err.response?.data?.message || 'Bad request. Could not send offer.');
      } else {
        toast.error('Something went wrong. Please try again.');
      }
    } finally {
      setActionLoading(false);
    }
  };

  const filtered = jobId
    ? proposals.filter((p) => p.jobPostId === jobId)
    : proposals;

  const activeProposals = filtered.filter((p) => {
    const s = String(p.status ?? p.Status).toLowerCase();
    return ['active', 'accepted', 'approved', '1', 'submitted'].includes(s);
  });

  const sentProposals = filtered.filter((p) => {
    const s = String(p.status ?? p.Status).toLowerCase();
    return ['pending', 'sent', 'offer', '0'].includes(s);
  });

  const historyProposals = filtered.filter((p) => {
    const s = String(p.status ?? p.Status).toLowerCase();
    const isActive = ['active', 'accepted', 'approved', '1', 'submitted'].includes(s);
    const isSent = ['pending', 'sent', 'offer', '0'].includes(s);
    return !isActive && !isSent;
  });

  const displayed = activeTab === 'active'
    ? activeProposals
    : activeTab === 'sent'
      ? sentProposals
      : historyProposals;

  const totalCount = displayed.length;

  return (
    <div style={{ maxWidth: '850px', width: '100%', margin: '0 auto', padding: '2.5rem 3rem', boxSizing: 'border-box' }}>

      {/* Back button */}
      <button
        onClick={() => navigate('/client/dashboard')}
        style={{
          fontSize: '13px', color: 'var(--color-text-secondary)',
          display: 'flex', alignItems: 'center', gap: '4px',
          marginBottom: '1rem', background: 'none',
          border: 'none', cursor: 'pointer', padding: 0,
        }}
      >
        ← Back to dashboard
      </button>

      {/* Page title */}
      <div style={{ marginBottom: '1.5rem' }}>
        <h1 style={{ fontSize: '22px', fontWeight: '500', color: 'var(--color-text-primary)', margin: '0 0 4px' }}>
          Job proposals
        </h1>
        <p style={{ fontSize: '13px', color: 'var(--color-text-secondary)', margin: 0 }}>
          {totalCount} {totalCount === 1 ? 'proposal' : 'proposals'}
          {jobId ? ' for this job' : ' across all your job posts'}
        </p>
      </div>

      {/* Tabs */}
      <div style={{
        display: 'flex',
        borderBottom: '1px solid #e8e8e8',
        marginBottom: '1.75rem',
      }}>
        {[
          { id: 'active', label: `Active (${activeProposals.length})` },
          { id: 'sent', label: `Sent Offers (${sentProposals.length})` },
          { id: 'history', label: `History (${historyProposals.length})` }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            style={{
              padding: '0.6rem 1.25rem',
              fontSize: '14px',
              fontWeight: activeTab === tab.id ? '600' : '400',
              color: activeTab === tab.id ? '#B7A06A' : '#888',
              background: 'none',
              border: 'none',
              borderBottom: activeTab === tab.id ? '2px solid #B7A06A' : '2px solid transparent',
              cursor: 'pointer',
              fontFamily: 'inherit',
              marginBottom: '-1px',
              textTransform: 'none',
              transition: 'color 0.15s',
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Content */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--color-text-secondary)', fontSize: '14px' }}>
          Loading proposals...
        </div>
      ) : error ? (
        <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--color-text-danger)', fontSize: '14px' }}>
          {error}
        </div>
      ) : displayed.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--color-text-secondary)', fontSize: '14px' }}>
          {activeTab === 'active' && "No active proposals found."}
          {activeTab === 'sent' && "No pending offers sent to freelancers yet."}
          {activeTab === 'history' && "No proposal history available."}
        </div>
      ) : (
        <ProposalsList
          proposals={displayed}
          onAccept={setAcceptingProposal}
          onReject={setRejectingProposal}
          isHistory={activeTab === 'history'}
        />
      )}

      {/* Reject Modal */}
      {rejectingProposal && (
        <RejectConfirmModal
          proposal={rejectingProposal}
          onClose={() => setRejectingProposal(null)}
          onConfirm={handleRejectConfirm}
          loading={actionLoading}
        />
      )}

      {/* Create Offer Modal */}
      {acceptingProposal && (
        <CreateOfferModal
          proposal={acceptingProposal}
          onClose={() => setAcceptingProposal(null)}
          onConfirm={handleCreateOffer}
          loading={actionLoading}
        />
      )}
    </div>
  );
};

export default JobProposalsPage;