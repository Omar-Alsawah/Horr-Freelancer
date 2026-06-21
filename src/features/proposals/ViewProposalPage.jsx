import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, Link, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { toast } from 'react-hot-toast';
import { ArrowLeft } from 'lucide-react';
import { proposalsApi } from '../../api/proposals';
import axios from 'axios';

const ViewProposalPage = () => {
  const { id } = useParams();
  const { state } = useLocation();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [proposal, setProposal] = useState(state?.proposal || null);
  const [loading, setLoading] = useState(!state?.proposal);

  const [isEditing, setIsEditing] = useState(false);
  const [editBidRate, setEditBidRate] = useState(0);
  const [editCoverLetter, setEditCoverLetter] = useState('');
  const [errors, setErrors] = useState({});

  const fetchedRef = useRef(false);

  useEffect(() => {
    if (proposal) {
      setEditBidRate(proposal.bidRate ?? proposal.BidRate ?? 0);
      setEditCoverLetter(proposal.coverLetter ?? proposal.CoverLetter ?? '');
    }
  }, [proposal]);

  useEffect(() => {
    if (proposal || fetchedRef.current) {
      setLoading(false);
      return;
    }
    fetchedRef.current = true;

    const controller = new AbortController();

    const fetchProposal = async () => {
      try {
        const response = await proposalsApi.getMyProposals({ signal: controller.signal });
        const payload = response.data?.data || response.data;
        const activeList = payload?.activeProposals || payload?.active || [];
        const submittedList = payload?.submittedProposals || payload?.submitted || [];
        const offersList = payload?.offers || payload?.pendingOffers || [];
        
        const allProposals = [...activeList, ...submittedList, [...offersList]];
        const found = allProposals.find(p => String(p.id || p.Id) === String(id));
        setProposal(found || null);
      } catch (error) {
        if (axios.isCancel(error)) return;
        console.error('Error fetching proposal details:', error);
        toast.error(error.title || t('errors.unexpected'));
      } finally {
        setLoading(false);
      }
    };

    fetchProposal();
    return () => controller.abort();
  }, [id, t, proposal]);

  const handleWithdraw = async () => {
    if (!window.confirm(t('proposals.withdraw_confirm'))) return;

    try {
      await proposalsApi.withdrawProposal(id);
      toast.success(t('proposals.withdraw_success'));
      navigate('/proposals/my-proposals');
    } catch (error) {
      toast.error(error.title || t('errors.unexpected'));
    }
  };

  const validate = () => {
    const newErrors = {};
    if (editBidRate <= 0) {
      newErrors.bidRate = t('proposals.validation.bid_rate_required') || 'Bid rate must be greater than 0.';
    }

    if (!editCoverLetter || editCoverLetter.trim() === '') {
      newErrors.coverLetter = 'Cover letter is required';
    } else if (editCoverLetter.length < 50) {
      newErrors.coverLetter = t('proposals.validation.cover_letter_min') || 'Cover letter must be at least 50 characters';
    } else if (editCoverLetter.length > 2000) {
      newErrors.coverLetter = t('proposals.validation.cover_letter_max') || 'Cover letter cannot exceed 2000 characters';
    } else {
      const regex = /^[\u0600-\u06FFa-zA-Z0-9\s.,!?]+$/;
      if (!regex.test(editCoverLetter)) {
        newErrors.coverLetter = t('proposals.validation.cover_letter_invalid') || 'Cover letter contains invalid characters';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSaveEdit = async () => {
    if (!validate()) return;

    try {
      const updatedData = {
        bidRate: editBidRate,
        coverLetter: editCoverLetter
      };
      
      await proposalsApi.updateProposal(id, updatedData);
      toast.success(t('common.success') || 'Proposal updated successfully!');
      
      setProposal(prev => ({
        ...prev,
        bidRate: editBidRate,
        coverLetter: editCoverLetter
      }));
      setIsEditing(false);
    } catch (error) {
      toast.error(error.title || t('errors.unexpected') || 'An error occurred while updating.');
    }
  };

  if (loading) return <div className="p-8 text-center">{t('common.loading')}</div>;
  if (!proposal) return <div className="p-8 text-center text-red-500">{t('proposals.not_found')}</div>;

  const bidRate = isEditing ? editBidRate : (proposal.bidRate ?? proposal.BidRate ?? 0);
  const horrFee = bidRate * 0.10;
  const receiveAmount = bidRate - horrFee;

  const statusVal = proposal.status !== undefined ? proposal.status : proposal.Status;
  const statusStr = String(statusVal != null ? statusVal : '').toLowerCase();

  let displayStatus = 'Submitted';
  let badgeColor = '#1565C0';
  let badgeBg = '#E3F2FD';

  if (statusStr === '1' || statusStr === 'accepted' || statusStr === 'offer' || statusStr === 'active') {
    displayStatus = 'Offer';
    badgeColor = '#108a00';
    badgeBg = '#e5f3e5';
  } else if (statusStr === '2' || statusStr === 'rejected' || statusStr === 'declined' || statusStr === 'withdrawn') {
    displayStatus = 'Withdrawn';
    badgeColor = '#d32f2f';
    badgeBg = '#fdeaea';
  }

  return (
    <div className="main-container">
      <Link 
        to="/proposals/my-proposals" 
        style={{ display: 'inline-block', marginBottom: 16, color: 'var(--color-primary-green)', textDecoration: 'none' }}
      >
        &larr; {t('proposals.back_to_list', 'Back to Proposals')}
      </Link>

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '2rem' }}>
        <div className="main-col details-card" style={{ marginBottom: 0 }}>
          <h1 className="job-title" style={{ fontSize: '1.5rem', fontWeight: '600', marginBottom: '0.5rem' }}>{proposal.jobPostTitle || proposal.JobPostTitle || proposal.jobTitle || 'Proposal Details'}</h1>
          <div className="proposal-status" style={{ display: 'inline-block', background: badgeBg, color: badgeColor, padding: '0.2rem 0.6rem', borderRadius: '4px', fontSize: '0.85rem', marginBottom: '1.5rem', fontWeight: '500' }}>
            {displayStatus}
          </div>

          <div className="section-title" style={{ fontSize: '1.1rem', fontWeight: '600', marginBottom: '1rem', marginTop: '1.5rem', borderBottom: '1px solid #eee', paddingBottom: '0.5rem' }}>
            {t('job_details.summary')}
          </div>
          <p style={{ marginBottom: '1rem', color: '#555' }}>
            <span>{proposal.jobDescription || t('proposals.no_description', 'No description available.')}</span>
            <Link to={`/jobs/${proposal.jobPostId || proposal.JobPostId}`} style={{ color: 'var(--color-primary-gold)', marginLeft: '0.5rem' }}>
              {t('proposals.view_posting')}
            </Link>
          </p>

          <div className="section-title" style={{ fontSize: '1.1rem', fontWeight: '600', marginBottom: '1rem', marginTop: '1.5rem', borderBottom: '1px solid #eee', paddingBottom: '0.5rem' }}>
            {t('proposals.your_proposal')}
          </div>

          <div style={{ marginBottom: '1.5rem' }}>
            <div style={{ fontWeight: '600', marginBottom: '0.5rem' }}>{t('proposals.cover_letter_title')}</div>
            {isEditing ? (
              <div>
                <textarea 
                  className="form-control"
                  value={editCoverLetter} 
                  onChange={e => setEditCoverLetter(e.target.value)} 
                  style={{ 
                    width: '100%', 
                    minHeight: '150px', 
                    padding: '0.75rem', 
                    border: errors.coverLetter ? '1px solid #d32f2f' : '1px solid #e2e2e2', 
                    borderRadius: '8px',
                    outline: 'none',
                    fontSize: '0.95rem',
                    lineHeight: '1.6'
                  }} 
                />
                {errors.coverLetter && (
                  <div style={{ color: '#d32f2f', fontSize: '0.85rem', marginTop: '0.25rem' }}>{errors.coverLetter}</div>
                )}
              </div>
            ) : (
              <div className="cover-letter" style={{ whiteSpace: 'pre-wrap', lineHeight: '1.6', color: '#333' }}>
                {proposal.coverLetter || proposal.CoverLetter}
              </div>
            )}
          </div>

          {proposal.terms && proposal.terms.length > 0 && (
            <div style={{ marginTop: '2rem' }}>
              <div className="section-title" style={{ fontSize: '1.1rem', fontWeight: '600', marginBottom: '1rem', marginTop: '1.5rem', borderBottom: '1px solid #eee', paddingBottom: '0.5rem' }}>
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
                  {proposal.terms.map((term, index) => {
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
        </div>

        <div className="side-col details-card" style={{ height: 'fit-content', marginBottom: 0 }}>
          <h3 style={{ fontSize: '1.1rem', marginBottom: '1rem' }}>{t('proposals.proposed_terms')}</h3>
          <div className="terms-row" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
            <span className="terms-label" style={{ color: 'var(--color-text-secondary)' }}>{t('proposals.price_label')}</span>
            {isEditing ? (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', width: '60%' }}>
                <input 
                  type="number" 
                  value={editBidRate} 
                  onChange={e => setEditBidRate(parseFloat(e.target.value) || 0)} 
                  style={{ 
                    width: '100%', 
                    padding: '0.4rem 0.6rem', 
                    border: errors.bidRate ? '1px solid #d32f2f' : '1px solid #e2e2e2', 
                    borderRadius: '6px',
                    textAlign: 'right',
                    fontSize: '0.95rem'
                  }}
                />
                {errors.bidRate && (
                  <div style={{ color: '#d32f2f', fontSize: '0.75rem', marginTop: '0.15rem' }}>{errors.bidRate}</div>
                )}
              </div>
            ) : (
              <span className="terms-value" style={{ fontWeight: '500' }}>{t('jobs.egp_format', { amount: bidRate.toFixed(2) })}</span>
            )}
          </div>
          <div className="terms-row" style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
            <span className="terms-label" style={{ color: 'var(--color-text-secondary)' }}>{t('proposals.horrFee')}</span>
            <span className="terms-value" style={{ fontWeight: '500' }}>-{t('jobs.egp_format', { amount: horrFee.toFixed(2) })}</span>
          </div>
          <div className="terms-row" style={{ display: 'flex', justifyContent: 'space-between', marginTop: '0.5rem', paddingTop: '0.5rem', borderTop: '1px solid #eee' }}>
            <span className="terms-label" style={{ color: 'var(--color-text-secondary)' }}>{t('proposals.receive_label')}</span>
            <span className="terms-value" style={{ fontWeight: '500' }}>{t('jobs.egp_format', { amount: receiveAmount.toFixed(2) })}</span>
          </div>

          {isEditing ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginTop: '2rem' }}>
              <button 
                className="btn btn-primary" 
                onClick={handleSaveEdit} 
                style={{ width: '100%', backgroundColor: '#C5A47E', borderColor: '#C5A47E', borderRadius: '20px', padding: '0.6rem 1rem' }}
              >
                {t('common.save') || 'Save'}
              </button>
              <button 
                className="btn btn-outline" 
                onClick={() => {
                  setIsEditing(false);
                  setEditBidRate(proposal.bidRate ?? proposal.BidRate ?? 0);
                  setEditCoverLetter(proposal.coverLetter ?? proposal.CoverLetter ?? '');
                  setErrors({});
                }} 
                style={{ width: '100%', borderRadius: '20px', padding: '0.6rem 1rem' }}
              >
                {t('common.cancel') || 'Cancel'}
              </button>
            </div>
          ) : (
            <>
              {displayStatus === 'Submitted' && (
                <button 
                  className="btn btn-primary" 
                  onClick={() => setIsEditing(true)}
                  style={{ width: '100%', marginTop: '2rem', backgroundColor: '#C5A47E', borderColor: '#C5A47E', borderRadius: '20px' }}
                >
                  {t('proposals.edit_proposal')}
                </button>
              )}
              <button 
                className="btn btn-outline" 
                style={{ 
                  width: '100%', 
                  marginTop: '1rem', 
                  color: '#d32f2f', 
                  border: '1px solid #fca5a5', 
                  borderRadius: '20px', 
                  padding: '0.6rem 1rem', 
                  background: '#fff',
                  fontWeight: '500',
                  cursor: 'pointer',
                  transition: 'all 0.2s'
                }}
                onMouseEnter={(e) => { e.target.style.backgroundColor = '#fef2f2'; e.target.style.borderColor = '#ef4444'; }}
                onMouseLeave={(e) => { e.target.style.backgroundColor = '#fff'; e.target.style.borderColor = '#fca5a5'; }}
                onClick={handleWithdraw}
              >
                {t('proposals.withdraw_button')}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default ViewProposalPage;
