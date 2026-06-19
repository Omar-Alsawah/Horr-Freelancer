import { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'react-hot-toast';
import { Link } from 'react-router-dom';
import { jobInvitationsApi } from '../../api/jobinvitations';
import { proposalsApi } from '../../api/proposals';

const JobInvitationsPage = () => {
  const { t } = useTranslation();
  const [invitations, setInvitations] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeInvitation, setActiveInvitation] = useState(null);
  const [bidRate, setBidRate] = useState(0);
  const [coverLetter, setCoverLetter] = useState('');
  const [durationDays, setDurationDays] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState({});
  const [apiError, setApiError] = useState(null);

  const fetchedRef = useRef(false);

  const fetchInvitations = async () => {
    try {
      const response = await jobInvitationsApi.getInvitations();
      const payload = response.data?.data || response.data;
      setInvitations(Array.isArray(payload) ? payload : (payload?.items || []));
    } catch (error) {
      console.error('Error fetching invitations:', error);
      toast.error(error.title || t('errors.unexpected'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (fetchedRef.current) return;
    fetchedRef.current = true;
    fetchInvitations();
  }, []);

  const handleDecline = async (id, e) => {
    e.stopPropagation();
    if (!window.confirm(t('proposals.decline_confirm', 'Are you sure you want to decline this invitation?'))) return;

    const previousInvitations = [...invitations];
    setInvitations(prev => prev.filter(inv => inv.id !== id));

    try {
      await jobInvitationsApi.declineInvitation(id);
      toast.success(t('proposals.decline_success', 'Invitation declined successfully'));
    } catch (error) {
      setInvitations(previousInvitations);
      toast.error(error.title || t('errors.unexpected'));
    }
  };

  const openAcceptModal = (invitation, e) => {
    e.stopPropagation();
    setActiveInvitation(invitation);
    const jobBudget = invitation.jobPost?.budget ?? invitation.jobPost?.budgetAmount ?? 0;
    setBidRate(jobBudget);
    setCoverLetter('');
    setDurationDays('');
    setErrors({});
    setApiError(null);
    setIsModalOpen(true);
  };

  const validate = () => {
    const newErrors = {};
    if (bidRate <= 0) {
      newErrors.bidRate = t('proposals.validation.bid_rate_required');
    }

    if (!durationDays || durationDays < 1 || durationDays > 365) {
      newErrors.durationDays = t('proposals.validation.duration_invalid');
    }

    if (coverLetter.length < 50) {
      newErrors.coverLetter = t('proposals.validation.cover_letter_min');
    } else if (coverLetter.length > 2000) {
      newErrors.coverLetter = t('proposals.validation.cover_letter_max');
    } else {
      const regex = /^[\u0600-\u06FFa-zA-Z0-9\s.,!?]+$/;
      if (!regex.test(coverLetter)) {
        newErrors.coverLetter = t('proposals.validation.cover_letter_invalid');
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleAcceptSubmit = async (e) => {
    e.preventDefault();
    setApiError(null);

    if (!validate()) return;

    setSubmitting(true);
    try {
      const proposalData = {
        jobPostId: activeInvitation.jobPost?.id || activeInvitation.jobPostId,
        submitAsType: 0,
        bidRate,
        coverLetter,
        durationDays,
        terms: []
      };

      await proposalsApi.submitProposal(proposalData);
      toast.success(t('proposals.success_message'));
      
      // Close modal and refresh list
      setIsModalOpen(false);
      setLoading(true);
      fetchInvitations();
    } catch (error) {
      if (error.status === 409) {
        setApiError(t('proposals.duplicateError'));
      } else {
        toast.error(error.title || t('errors.unexpected'));
      }
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div className="p-8 text-center">{t('common.loading')}</div>;

  const renderEmptyState = () => {
    const noInvitations = t('proposals.no_invitations', 'No job invitations yet');
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
          {noInvitations}
        </h3>
        <p style={{ color: 'var(--color-text-secondary)', marginBottom: '1rem' }}>
          {subtitle}
        </p>
      </div>
    );
  };

  const horrFee = bidRate * 0.10;
  const receiveAmount = bidRate - horrFee;

  return (
    <div className="container container-single-col" style={{ maxWidth: '1000px', marginTop: '2rem' }}>
      <h1 className="page-title" style={{ marginBottom: '1.5rem' }}>
        {t('proposals.job_invitations_title', 'Job invitations')}
      </h1>

      {invitations.length === 0 ? (
        renderEmptyState()
      ) : (
        <div className="proposal-group">
          <div className="proposal-group-header">
            {t('proposals.job_invitations_title', 'Job invitations')}
          </div>
          {invitations.map(item => {
            const jobTitle = item.jobPost?.title || item.jobPostTitle || item.jobTitle || 'Untitled Job';
            const clientName = item.clientName || item.client?.name || item.client?.userName || 'Client';
            const budget = item.jobPost?.budget ?? item.jobPost?.budgetAmount ?? 0;
            const date = item.createdAt || item.invitedAt || item.date;
            const jobId = item.jobPost?.id || item.jobPostId;

            return (
              <div 
                key={item.id} 
                className="proposal-list-item" 
                style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
              >
                <div>
                  <div className="proposal-date">
                    {date ? new Date(date).toLocaleDateString() : '—'}
                  </div>
                  {jobId ? (
                    <Link to={`/jobs/${jobId}`} className="proposal-title">
                      {jobTitle}
                    </Link>
                  ) : (
                    <div className="proposal-title">{jobTitle}</div>
                  )}
                  <div className="proposal-meta" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                    <span>{t('proposals.invited_by', { clientName: clientName })}</span>
                    {budget > 0 && <span style={{ color: '#aaa' }}>|</span>}
                    {budget > 0 && <span>{t('jobs.egp_format', { amount: budget.toFixed(2) })}</span>}
                  </div>
                </div>
                
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <button 
                    onClick={(e) => openAcceptModal(item, e)}
                    style={{ 
                      color: '#fff', 
                      background: '#C5A47E', 
                      border: '1px solid #C5A47E', 
                      borderRadius: '6px',
                      padding: '0.4rem 0.8rem',
                      cursor: 'pointer', 
                      fontWeight: '500',
                      fontSize: '0.85rem',
                      transition: 'all 0.2s'
                    }}
                    onMouseEnter={(e) => { e.currentTarget.style.background = '#b08e65'; }}
                    onMouseLeave={(e) => { e.currentTarget.style.background = '#C5A47E'; }}
                  >
                    {t('proposals.accept', 'Accept')}
                  </button>
                  <button 
                    onClick={(e) => handleDecline(item.id, e)}
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
                    {t('proposals.decline', 'Decline')}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Accept Proposal Modal */}
      {isModalOpen && activeInvitation && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.5)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 1000,
          padding: '1rem'
        }}>
          <div style={{
            backgroundColor: '#fff',
            borderRadius: '8px',
            width: '100%',
            maxWidth: '650px',
            maxHeight: '90vh',
            overflowY: 'auto',
            padding: '2rem',
            boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1), 0 2px 4px -1px rgba(0,0,0,0.06)'
          }}>
            <h2 className="text-xl font-semibold mb-4 text-[#C5A47E]" style={{ color: '#C5A47E', marginBottom: '1.5rem', fontSize: '1.25rem' }}>
              {t('proposals.accept_modal_title', { title: activeInvitation.jobPost?.title || activeInvitation.jobPostTitle || activeInvitation.jobTitle || 'Untitled Job' })}
            </h2>

            <form onSubmit={handleAcceptSubmit}>
              {/* Terms Section */}
              <div style={{ marginBottom: '1.5rem' }}>
                <p className="font-semibold mb-2" style={{ fontWeight: '600', marginBottom: '0.5rem' }}>
                  {t('proposals.rate_question')}
                </p>

                <div className="rate-grid" style={{ display: 'grid', gridTemplateColumns: '1fr auto', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
                  <div>
                    <strong>{t('proposals.price_label')}</strong>
                    <div className="text-sm text-gray-500" style={{ fontSize: '0.85rem', color: '#666' }}>{t('proposals.price_hint')}</div>
                  </div>
                  <div className="rate-input-group" style={{ display: 'flex', alignItems: 'center', border: '1px solid #ccc', borderRadius: '4px', padding: '0.25rem 0.5rem' }}>
                    <span style={{ marginRight: '0.25rem' }}>EGP</span>
                    <input 
                      type="number" 
                      step="0.01"
                      value={bidRate} 
                      onChange={(e) => setBidRate(parseFloat(e.target.value) || 0)}
                      className={errors.bidRate ? 'border-red-500' : ''}
                      style={{ border: 'none', outline: 'none', width: '100px', textAlign: 'right' }}
                    />
                  </div>
                </div>
                {errors.bidRate && <div className="error-message" style={{ color: 'red', fontSize: '0.85rem', marginBottom: '1rem' }}>{errors.bidRate}</div>}

                <div className="rate-grid fee-row text-sm" style={{ display: 'grid', gridTemplateColumns: '1fr auto', alignItems: 'center', gap: '1rem', fontSize: '0.85rem', color: '#666', borderTop: '1px solid #eee', paddingTop: '0.5rem', marginBottom: '0.5rem' }}>
                  <div>
                    <strong>{t('proposals.horrFee')}</strong>
                  </div>
                  <div className="text-right">
                    -EGP {horrFee.toFixed(2)}
                  </div>
                </div>

                <div className="rate-grid" style={{ display: 'grid', gridTemplateColumns: '1fr auto', alignItems: 'center', gap: '1rem', borderTop: '1px solid #eee', paddingTop: '0.5rem' }}>
                  <div>
                    <strong>{t('proposals.receive_label')}</strong>
                    <div className="text-sm text-gray-500" style={{ fontSize: '0.85rem', color: '#666' }}>{t('proposals.receive_hint')}</div>
                  </div>
                  <div className="rate-input-group" style={{ display: 'flex', alignItems: 'center', border: '1px solid #eee', borderRadius: '4px', padding: '0.25rem 0.5rem', backgroundColor: '#f9f9f9' }}>
                    <span style={{ marginRight: '0.25rem' }}>EGP</span>
                    <input 
                      type="number" 
                      value={receiveAmount.toFixed(2)} 
                      readOnly 
                      style={{ border: 'none', outline: 'none', width: '100px', textAlign: 'right', backgroundColor: 'transparent' }}
                    />
                  </div>
                </div>

                <div className="rate-grid" style={{ display: 'grid', gridTemplateColumns: '1fr auto', alignItems: 'center', gap: '1rem', borderTop: '1px solid #eee', paddingTop: '0.5rem', marginTop: '1rem' }}>
                  <div>
                    <strong>{t('proposals.duration_label')}</strong>
                    <div className="text-sm text-gray-500" style={{ fontSize: '0.85rem', color: '#666' }}>{t('proposals.duration_hint')}</div>
                  </div>
                  <div className="rate-input-group" style={{ display: 'flex', alignItems: 'center', border: '1px solid #ccc', borderRadius: '4px', padding: '0.25rem 0.5rem' }}>
                    <input 
                      type="number" 
                      min="1"
                      max="365"
                      placeholder="Days"
                      value={durationDays} 
                      onChange={(e) => setDurationDays(parseInt(e.target.value) || '')}
                      className={errors.durationDays ? 'border-red-500' : ''}
                      style={{ border: 'none', outline: 'none', width: '100px', textAlign: 'right' }}
                    />
                  </div>
                </div>
                {errors.durationDays && <div className="error-message" style={{ color: 'red', fontSize: '0.85rem', marginTop: '0.25rem', marginBottom: '1rem' }}>{errors.durationDays}</div>}
              </div>

              {/* Cover Letter Section */}
              <div style={{ marginBottom: '1.5rem' }}>
                <p className="font-semibold mb-2" style={{ fontWeight: '600', marginBottom: '0.5rem' }}>{t('proposals.cover_letter_title')}</p>
                <textarea 
                  value={coverLetter}
                  onChange={(e) => setCoverLetter(e.target.value)}
                  placeholder={t('proposals.cover_letter_placeholder')}
                  style={{
                    width: '100%',
                    height: '150px',
                    padding: '0.5rem',
                    border: errors.coverLetter ? '1px solid red' : '1px solid #ccc',
                    borderRadius: '4px',
                    resize: 'vertical',
                    outline: 'none'
                  }}
                ></textarea>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '0.25rem' }}>
                  <div style={{ color: 'red', fontSize: '0.85rem' }}>
                    {errors.coverLetter && errors.coverLetter}
                  </div>
                  <div style={{ fontSize: '0.85rem', color: coverLetter.length < 50 || coverLetter.length > 2000 ? 'red' : '#666' }}>
                    {t('proposals.char_counter', { count: coverLetter.length })}
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div style={{ display: 'flex', gap: '1rem', marginTop: '2rem' }}>
                <button 
                  type="submit"
                  disabled={submitting}
                  style={{
                    background: '#C5A47E',
                    color: '#fff',
                    border: 'none',
                    borderRadius: '4px',
                    padding: '0.6rem 1.5rem',
                    fontWeight: '600',
                    cursor: 'pointer',
                    opacity: submitting ? 0.5 : 1
                  }}
                >
                  {submitting ? t('common.loading') : t('proposals.submit_proposal', 'Submit Proposal')}
                </button>
                <button 
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  style={{
                    background: '#eee',
                    color: '#333',
                    border: 'none',
                    borderRadius: '4px',
                    padding: '0.6rem 1.5rem',
                    fontWeight: '600',
                    cursor: 'pointer'
                  }}
                >
                  {t('proposals.cancel_button')}
                </button>
              </div>

              {apiError && (
                <div style={{ color: 'red', fontSize: '0.85rem', marginTop: '1rem' }}>
                  {apiError}
                </div>
              )}
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default JobInvitationsPage;
