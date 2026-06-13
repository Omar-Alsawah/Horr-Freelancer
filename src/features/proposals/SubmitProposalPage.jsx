import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { toast } from 'react-hot-toast';
import { jobsApi } from '../../api/jobs';
import { proposalsApi } from '../../api/proposals';

const SubmitProposalPage = () => {
  const { t } = useTranslation();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const jobId = searchParams.get('jobId');

  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [apiError, setApiError] = useState(null);

  // Form State
  const [submitAsType, setSubmitAsType] = useState('Freelancer');
  const [bidRate, setBidRate] = useState(0);
  const [coverLetter, setCoverLetter] = useState('');

  // Validation State
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (!jobId) {
      toast.error('No Job ID provided');
      navigate('/find-work');
      return;
    }

    const fetchJob = async () => {
      try {
        const response = await jobsApi.getJob(jobId);
        setJob(response.data);
      } catch (error) {
        console.error('Error fetching job:', error);
        toast.error(t('job_details.not_found_title'));
      } finally {
        setLoading(false);
      }
    };

    fetchJob();
  }, [jobId, navigate, t]);

  const handleBidRateChange = (e) => {
    const value = parseFloat(e.target.value) || 0;
    setBidRate(value);
  };

  const validate = () => {
    const newErrors = {};
    if (bidRate <= 0) {
      newErrors.bidRate = t('proposals.validation.bid_rate_required');
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setApiError(null);

    if (!validate()) return;

    setSubmitting(true);
    try {
      const proposalData = {
        jobPostId: jobId,
        submitAsType,
        bidRate,
        coverLetter
      };

      await proposalsApi.submitProposal(proposalData);
      toast.success(t('proposals.success_message'));
      navigate('/proposals/my-proposals');
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

  if (loading) return <div className="flex justify-center items-center h-screen">{t('common.loading')}</div>;

  const horrFee = bidRate * 0.10;
  const receiveAmount = bidRate - horrFee;


  return (
    <div className="container container-single-col" style={{ maxWidth: '900px' }}>
      <h1 className="page-title">{t('proposals.submit_title')}</h1>
      
      {job && (
        <div className="mb-6">
          <h2 className="text-xl font-semibold text-[#C5A47E]">{job.title}</h2>
        </div>
      )}

      <form onSubmit={handleSubmit}>
        {/* Proposal Settings */}
        <div className="proposal-section">
          <div className="proposal-section-title">{t('proposals.settings_title')}</div>
          <p className="mb-4 font-medium">{t('proposals.submit_as_label')}</p>
          
          <div className="radio-group">
            <div className="radio-option">
              <input 
                type="radio" 
                id="freelancer"
                name="submit-as" 
                checked={submitAsType === 'Freelancer'} 
                onChange={() => setSubmitAsType('Freelancer')}
              />
              <label htmlFor="freelancer">{t('proposals.as_freelancer')}</label>
            </div>
            <div className="radio-option">
              <input 
                type="radio" 
                id="agency"
                name="submit-as" 
                checked={submitAsType === 'Agency'} 
                onChange={() => setSubmitAsType('Agency')}
              />
              <label htmlFor="agency">{t('proposals.as_agency')}</label>
            </div>
          </div>
        </div>

        {/* Terms */}
        <div className="proposal-section">
          <div className="proposal-section-title">
            {t('proposals.terms_title')}
            {job && (
              <div className="client-budget-tag">
                {t('proposals.client_budget')} {job.budgetType === 'Fixed' ? `EGP ${job.budget}` : `EGP ${job.minBudget} - ${job.maxBudget}`}
                <span className="inline-block w-[14px] h-[14px] bg-[#666] rounded-full text-center leading-[14px] text-[10px] text-white ml-1">?</span>
              </div>
            )}
          </div>

          <p className="font-semibold mb-6">{t('proposals.rate_question')}</p>

          <div className="rate-grid">
            <div>
              <strong>{t('proposals.price_label')}</strong>
              <div className="text-sm text-gray-500">{t('proposals.price_hint')}</div>
            </div>
            <div className="rate-input-group">
              <span>$</span>
              <input 
                type="number" 
                step="0.01"
                value={bidRate} 
                onChange={handleBidRateChange}
                className={errors.bidRate ? 'border-red-500' : ''}
              />
            </div>
          </div>
          {errors.bidRate && <div className="error-message mb-4">{errors.bidRate}</div>}

          <div className="rate-grid fee-row text-sm">
            <div>
              <strong>{t('proposals.horrFee')}</strong>
            </div>
            <div className="text-right">
              -${horrFee.toFixed(2)}
            </div>
          </div>

          <div className="rate-grid">
            <div>
              <strong>{t('proposals.receive_label')}</strong>
              <div className="text-sm text-gray-500">{t('proposals.receive_hint')}</div>
            </div>
            <div className="rate-input-group">
              <span>$</span>
              <input 
                type="number" 
                value={receiveAmount.toFixed(2)} 
                readOnly 
                className="bg-gray-50"
              />
            </div>
          </div>
        </div>



        {/* Cover Letter */}
        <div className={`proposal-section ${errors.coverLetter ? 'border-[#d32f2f]' : ''}`}>
          <div className="proposal-section-title">{t('proposals.cover_letter_title')}</div>
          <textarea 
            className={`cover-letter-area ${errors.coverLetter ? 'border-[#d32f2f]' : ''}`}
            placeholder={t('proposals.cover_letter_placeholder')}
            value={coverLetter}
            onChange={(e) => setCoverLetter(e.target.value)}
          ></textarea>
          <div className="flex justify-between mt-2">
            <div>
              {errors.coverLetter && (
                <div className="error-message">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z" />
                  </svg>
                  {errors.coverLetter}
                </div>
              )}
            </div>
            <div className={`text-sm ${coverLetter.length < 50 || coverLetter.length > 2000 ? 'text-red-500 font-bold' : 'text-gray-500'}`}>
              {t('proposals.char_counter', { count: coverLetter.length })}
            </div>
          </div>
        </div>

        <div className="flex gap-4 mb-2">
          <button 
            type="submit"
            disabled={submitting}
            className="btn bg-[#C5A47E] hover:bg-[#b08e65] text-white rounded-full px-8 py-2 font-semibold disabled:opacity-50 transition-all shadow-md"
          >
            {submitting ? t('common.loading') : t('proposals.submit_button')}
          </button>
          <button 
            type="button" 
            onClick={() => navigate(-1)}
            className="btn bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-full px-8 py-2 font-semibold border border-gray-300 transition-all"
          >
            {t('proposals.cancel_button')}
          </button>
        </div>

        {apiError && (
          <div className="error-message mb-10">
             <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z" />
              </svg>
            {apiError}
          </div>
        )}
      </form>
    </div>
  );
}
;

export default SubmitProposalPage;
