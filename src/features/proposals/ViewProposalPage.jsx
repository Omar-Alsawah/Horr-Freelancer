import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { toast } from 'react-hot-toast';
import { proposalsApi } from '../../api/proposals';

const ViewProposalPage = () => {
  const { id } = useParams();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [proposal, setProposal] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProposal = async () => {
      try {
        const response = await proposalsApi.getProposal(id);
        setProposal(response.data);
      } catch (error) {
        console.error('Error fetching proposal:', error);
        toast.error(error.title || t('errors.unexpected'));
      } finally {
        setLoading(false);
      }
    };

    fetchProposal();
  }, [id, t]);

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

  if (loading) return <div className="p-8 text-center">{t('common.loading')}</div>;
  if (!proposal) return <div className="p-8 text-center text-red-500">{t('proposals.not_found')}</div>;

  const bidRate = proposal.bidRate || 0;
  const horrFee = bidRate * 0.10;
  const receiveAmount = bidRate - horrFee;

  return (
    <div className="container proposal-container" style={{ maxWidth: '1000px', margin: '2rem auto', display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '2rem' }}>
      <div className="main-col" style={{ background: '#fff', border: '1px solid var(--color-border)', borderRadius: '8px', padding: '2rem' }}>
        <h1 className="job-title" style={{ fontSize: '1.5rem', fontWeight: '600', marginBottom: '0.5rem' }}>{proposal.jobTitle}</h1>
        <div className="proposal-status" style={{ display: 'inline-block', background: '#E3F2FD', color: '#1565C0', padding: '0.2rem 0.6rem', borderRadius: '4px', fontSize: '0.85rem', marginBottom: '1.5rem', fontWeight: '500' }}>
          {proposal.status}
        </div>

        <div className="section-title" style={{ fontSize: '1.1rem', fontWeight: '600', marginBottom: '1rem', marginTop: '1.5rem', borderBottom: '1px solid #eee', paddingBottom: '0.5rem' }}>
          {t('job_details.summary')}
        </div>
        <p style={{ marginBottom: '1rem', color: '#555' }}>
          <span>{proposal.jobDescription}</span>
          <Link to={`/jobs/${proposal.jobPostId}`} style={{ color: 'var(--color-primary-gold)', marginLeft: '0.5rem' }}>
            {t('proposals.view_posting')}
          </Link>
        </p>

        <div className="section-title" style={{ fontSize: '1.1rem', fontWeight: '600', marginBottom: '1rem', marginTop: '1.5rem', borderBottom: '1px solid #eee', paddingBottom: '0.5rem' }}>
          {t('proposals.your_proposal')}
        </div>

        <div style={{ marginBottom: '1.5rem' }}>
          <div style={{ fontWeight: '600', marginBottom: '0.5rem' }}>{t('proposals.cover_letter_title')}</div>
          <div className="cover-letter" style={{ whiteSpace: 'pre-wrap', lineHeight: '1.6', color: '#333' }}>
            {proposal.coverLetter}
          </div>
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
                {proposal.terms.map((term, index) => (
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
      </div>

      <div className="side-col" style={{ background: '#fff', border: '1px solid var(--color-border)', borderRadius: '8px', padding: '1.5rem', height: 'fit-content' }}>
        <h3 style={{ fontSize: '1.1rem', marginBottom: '1rem' }}>{t('proposals.proposed_terms')}</h3>
        <div className="terms-row" style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
          <span className="terms-label" style={{ color: 'var(--color-text-secondary)' }}>{t('proposals.price_label')}</span>
          <span className="terms-value" style={{ fontWeight: '500' }}>{t('jobs.egp_format', { amount: bidRate.toFixed(2) })}</span>
        </div>
        <div className="terms-row" style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
          <span className="terms-label" style={{ color: 'var(--color-text-secondary)' }}>{t('proposals.horrFee')}</span>
          <span className="terms-value" style={{ fontWeight: '500' }}>-{t('jobs.egp_format', { amount: horrFee.toFixed(2) })}</span>
        </div>
        <div className="terms-row" style={{ display: 'flex', justifyContent: 'space-between', marginTop: '0.5rem', paddingTop: '0.5rem', borderTop: '1px solid #eee' }}>
          <span className="terms-label" style={{ color: 'var(--color-text-secondary)' }}>{t('proposals.receive_label')}</span>
          <span className="terms-value" style={{ fontWeight: '500' }}>{t('jobs.egp_format', { amount: receiveAmount.toFixed(2) })}</span>
        </div>

        {proposal.status === 'Submitted' && (
          <button className="btn btn-primary" style={{ width: '100%', marginTop: '2rem', backgroundColor: '#C5A47E', borderColor: '#C5A47E', borderRadius: '20px' }}>
            {t('proposals.edit_proposal')}
          </button>
        )}
        <button 
          className="btn btn-outline" 
          style={{ width: '100%', marginTop: '1rem', color: '#d32f2f', border: '1px solid #eee', borderRadius: '20px' }}
          onClick={handleWithdraw}
        >
          {t('proposals.withdraw_button')}
        </button>
      </div>
    </div>
  );
};

export default ViewProposalPage;
