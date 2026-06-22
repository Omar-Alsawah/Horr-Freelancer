import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Heart, Tag, Star, Globe, Calendar, ArrowLeft, Copy, Flag } from 'lucide-react';
import toast from 'react-hot-toast';
import axios from 'axios';
import { jobsApi } from '../../api/jobs';
import { getUserProfile } from '../../services/clientService';
import { currencyApi } from '../../api/currency';

function formatBudget(budget, currency, convertedBudget, convertedCurrency, lang) {
  const fmt = (n, cur) => {
    return new Intl.NumberFormat(lang === 'ar' ? 'ar-EG' : 'en-EG', {
      style: 'currency',
      currency: cur || 'EGP',
      maximumFractionDigits: 0
    }).format(n);
  };
  const originalStr = fmt(budget || 0, currency);
  if (convertedBudget != null && convertedCurrency != null && convertedCurrency !== currency) {
    const convertedStr = fmt(convertedBudget, convertedCurrency);
    return `${originalStr} (${convertedStr})`;
  }
  return originalStr;
}

function DetailSkeleton() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <div className="flex gap-6 flex-col lg:flex-row animate-pulse">
        <main className="flex-1 bg-white border border-gray-200 rounded-lg p-6">
          <div className="h-7 bg-gray-200 rounded w-3/4 mb-4"></div>
          <div className="flex gap-4 mb-6">
            <div className="h-4 bg-gray-200 rounded w-28"></div>
            <div className="h-4 bg-gray-200 rounded w-20"></div>
          </div>
          <div className="flex gap-8 mb-6">
            <div className="flex gap-3 items-center"><div className="h-10 w-10 bg-gray-200 rounded"></div><div><div className="h-4 bg-gray-200 rounded w-16 mb-1"></div><div className="h-3 bg-gray-200 rounded w-20"></div></div></div>
            <div className="flex gap-3 items-center"><div className="h-10 w-10 bg-gray-200 rounded"></div><div><div className="h-4 bg-gray-200 rounded w-20 mb-1"></div><div className="h-3 bg-gray-200 rounded w-40"></div></div></div>
          </div>
          <div className="h-4 bg-gray-200 rounded w-20 mb-3"></div>
          <div className="space-y-2 mb-6"><div className="h-3 bg-gray-200 rounded w-full"></div><div className="h-3 bg-gray-200 rounded w-5/6"></div><div className="h-3 bg-gray-200 rounded w-4/6"></div></div>
          <div className="h-4 bg-gray-200 rounded w-36 mb-3"></div>
          <div className="flex gap-2 mb-6"><div className="h-7 bg-gray-200 rounded-full w-16"></div><div className="h-7 bg-gray-200 rounded-full w-12"></div><div className="h-7 bg-gray-200 rounded-full w-24"></div></div>
          <div className="h-4 bg-gray-200 rounded w-40 mb-3"></div>
          <div className="space-y-2"><div className="h-3 bg-gray-200 rounded w-1/3"></div><div className="h-3 bg-gray-200 rounded w-1/4"></div><div className="h-3 bg-gray-200 rounded w-1/3"></div></div>
        </main>
        <aside className="w-full lg:w-80 flex-shrink-0 space-y-4">
          <div className="bg-white border border-gray-200 rounded-lg p-6"><div className="h-10 bg-gray-200 rounded mb-3"></div><div className="h-10 bg-gray-200 rounded"></div></div>
          <div className="bg-white border border-gray-200 rounded-lg p-6 space-y-3"><div className="h-5 bg-gray-200 rounded w-1/2 mb-2"></div><div className="h-3 bg-gray-200 rounded w-3/4"></div><div className="h-3 bg-gray-200 rounded w-1/2"></div><div className="h-3 bg-gray-200 rounded w-2/3"></div></div>
        </aside>
      </div>
    </div>
  );
}

function NotFoundCard({ t }) {
  return (
    <div className="max-w-lg mx-auto mt-20 bg-white border border-gray-200 rounded-lg p-8 text-center">
      <div className="text-5xl mb-4">🔍</div>
      <h2 className="text-xl font-bold text-gray-900 mb-2">{t('job_details.not_found_title')}</h2>
      <p className="text-sm text-gray-500 mb-6">{t('job_details.not_found_subtitle')}</p>
      <Link to="/find-work" className="inline-flex items-center gap-2 px-4 py-2 bg-[#1e293b] text-white text-sm font-medium rounded-md hover:bg-gray-800 transition-colors">
        <ArrowLeft className="w-4 h-4" /> {t('job_details.back_to_jobs')}
      </Link>
    </div>
  );
}

export default function JobDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  const lang = i18n.language;

  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [preferredCurrency, setPreferredCurrency] = useState(null);
  const [userConvertedBudget, setUserConvertedBudget] = useState(null);

  useEffect(() => {
    const controller = new AbortController();
    const fetchJob = async () => {
      setLoading(true);
      setNotFound(false);
      try {
        const res = await jobsApi.getJob(id, { signal: controller.signal });
        const jobData = res.data;
        setJob(jobData);
        setIsSaved(jobData.isSaved || false);

        // Fetch user profile to get preferred currency
        let prefCurr = null;
        try {
          const profile = await getUserProfile();
          if (profile && profile.preferredCurrency) {
            prefCurr = profile.preferredCurrency;
            setPreferredCurrency(prefCurr);
          }
        } catch (profileErr) {
          // Ignore if user is not logged in or profile fails
        }

        // Convert budget if we have a preferred currency that differs from job currency
        const jobCurr = jobData.budgetCurrency || 'EGP';
        if (prefCurr && prefCurr !== jobCurr && jobData.budget > 0) {
          try {
            const convRes = await currencyApi.convertCurrency(jobData.budget, jobCurr, prefCurr);
            const val = typeof convRes.data === 'number' ? convRes.data : (convRes.data?.amount ?? convRes.data?.convertedAmount ?? convRes.data?.result ?? convRes.data);
            if (val && !isNaN(val)) {
              setUserConvertedBudget(Number(val));
            }
          } catch (convErr) {
            console.error("Failed to convert currency to preferred currency", convErr);
          }
        }
      } catch (err) {
        if (axios.isCancel(err) || err.code === 'ERR_CANCELED') return;
        if (err.status === 404) {
          setNotFound(true);
        } else {
          toast.error(err.title || t('common.error'));
        }
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    };
    fetchJob();
    return () => controller.abort();
  }, [id, t]);

  const handleToggleSave = async () => {
    const wasSaved = isSaved;
    setIsSaved(!wasSaved);
    try {
      if (wasSaved) {
        await jobsApi.unsaveJob(id);
      } else {
        await jobsApi.saveJob(id);
      }
    } catch (err) {
      setIsSaved(wasSaved);
      toast.error(wasSaved ? t('errors.unsave_failed') : t('errors.save_failed'));
    }
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    toast.success(t('common.success'));
  };

  if (loading) return <DetailSkeleton />;
  if (notFound) return <NotFoundCard t={t} />;
  if (!job) return null;

  return (
    <div className="container">
      {/* Left Column: Job Content */}
      <main className="section-wrapper card">
        <div className="job-header">
          <h1 className="job-title">{job.title}</h1>

          <div className="job-meta">
            <span className="meta-item">{t('jobs.posted_time', { time: job.postedTime })}</span>
            <span className="meta-item">
              <Globe className="w-4 h-4" />
              {job.location || t('job_details.worldwide')}
            </span>
          </div>

          <div className="job-features">
            <div className="feature-item">
              <div className="feature-icon">
                <Tag className="w-5 h-5" />
              </div>
              <div className="feature-text">
                <div>
                  {formatBudget(
                    job.budget,
                    job.budgetCurrency,
                    preferredCurrency ? userConvertedBudget : job.convertedBudget,
                    preferredCurrency && userConvertedBudget != null ? preferredCurrency : job.convertedCurrency,
                    lang
                  )}
                </div>
                <div>{job.jobType === 'FixedPrice' ? t('jobs.fixed_price') : t('jobs.hourly')}</div>
              </div>
            </div>
            {job.experienceLevel && (
              <div className="feature-item">
                <div className="feature-icon">
                  <Star className="w-5 h-5" />
                </div>
                <div className="feature-text">
                  <div>{job.experienceLevel}</div>
                  <div>{t('job_details.experience_hint')}</div>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="job-description-section">
          <h2 className="section-title">{t('job_details.summary')}</h2>
          <div className="job-description whitespace-pre-line">
            {job.description}
          </div>
        </div>

        {job.projectType && (
          <div className="project-type-section">
            <div className="feature-item">
              <div className="feature-icon">
                <Calendar className="w-5 h-5" />
              </div>
              <strong>{t('job_details.project_type')}:</strong>&nbsp;
              <span className="text-gray-500">{job.projectType}</span>
            </div>
          </div>
        )}

        {job.skills?.length > 0 && (
          <div className="skills-section">
            <h2 className="section-title">{t('job_details.skills_title')}</h2>
            <div className="skills-list">
              {job.skills.map((skill, i) => (
                <span key={i} className="skill-badge">{skill}</span>
              ))}
            </div>
          </div>
        )}

        {job.activity && (
          <div className="activity-section">
            <h2 className="section-title">{t('job_details.activity_title')}</h2>
            {job.activity.proposals != null && (
              <div className="activity-row">
                <span>{t('job_details.proposals')}:</span>
                <span>{job.activity.proposals}</span>
              </div>
            )}
            {job.activity.hires != null && (
              <div className="activity-row">
                <span>{t('job_details.hires')}:</span>
                <span>{job.activity.hires}</span>
              </div>
            )}
            {job.activity.invitesSent != null && (
              <div className="activity-row">
                <span>{t('job_details.invites_sent')}:</span>
                <span>{job.activity.invitesSent}</span>
              </div>
            )}
            {job.activity.unansweredInvites != null && (
              <div className="activity-row">
                <span>{t('job_details.unanswered_invites')}:</span>
                <span>{job.activity.unansweredInvites}</span>
              </div>
            )}
          </div>
        )}

        {job.clientHistory?.length > 0 && (
          <div className="history-section" style={{ marginTop: '3rem', borderTop: '1px solid #eee', paddingTop: '1.5rem' }}>
            <h2 className="section-title" style={{ marginBottom: '1rem' }}>
              {t('job_details.client_history')} ({job.clientHistory.length})
            </h2>

            <div className="space-y-6">
              {job.clientHistory.map((item, i) => (
                <div key={i} className="history-item">
                  <div className="flex justify-between items-start">
                    <div style={{ maxWidth: '70%' }}>
                      <h3 style={{ fontSize: '1rem', color: 'var(--color-primary-gold)', fontWeight: 500, margin: '0 0 0.5rem 0' }}>
                        {item.title}
                      </h3>
                      <div className="rating-stars" style={{ color: '#108a00', fontSize: '0.8rem', marginBottom: '0.5rem' }}>
                        {'★'.repeat(Math.round(item.rating || 5))}{' '}
                        <span style={{ fontWeight: 600, color: '#333', marginLeft: '0.3rem' }}>{item.ratingValue || '5.0'}</span>
                      </div>
                      {item.feedback && (
                        <p style={{ fontSize: '0.9rem', color: '#333', marginBottom: '0.5rem', fontStyle: 'italic', lineHeight: 1.4 }}>
                          "{item.feedback}"
                        </p>
                      )}
                      <div style={{ fontSize: '0.85rem', color: '#555' }}>
                        {t('job_details.to_freelancer')}: <span style={{ fontWeight: 500, color: '#333' }}>{item.freelancerName}</span>
                      </div>
                    </div>
                    <div style={{ textAlign: 'right', fontSize: '0.8rem', color: '#555' }}>
                      <div style={{ marginBottom: '0.3rem' }}>{item.duration}</div>
                      <div style={{ fontWeight: 500, color: '#333' }}>{item.billed}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>

      {/* Right Column: Sidebar */}
      <aside className="sidebar">
        <div className="card action-card">
          <div className="action-buttons">
            <button
              onClick={() => navigate(`/proposals/submit?jobId=${id}`)}
              className="btn btn-apply"
            >
              {t('job_details.submit_proposal')}
            </button>
            <button
              onClick={handleToggleSave}
              className={`btn btn-save ${isSaved ? 'active' : ''}`}
            >
              <Heart className={`w-4 h-4 ${isSaved ? 'fill-current' : ''}`} />
              {isSaved ? t('job_details.saved') : t('job_details.save_job')}
            </button>
          </div>
          <button className="flag-link bg-transparent border-none p-0 text-left">
            {t('job_details.flag_inappropriate')}
          </button>
        </div>

        {job.client && (
          <div className="card client-info-card">
            <h3 className="client-info-title">{t('job_details.about_client')}</h3>

            {job.client.paymentVerified && (
              <div className="client-verified">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
                </svg>
                {t('job_details.payment_method_verified')}
              </div>
            )}

            {job.client.rating && (
              <div className="rating-row">
                <div className="stars">
                  {'★'.repeat(Math.round(job.client.rating))}
                </div>
                <span className="font-medium text-gray-900">{job.client.ratingValue}</span>
                <span className="text-gray-500">
                  {job.client.reviewCount} {t('job_details.reviews')}
                </span>
              </div>
            )}

            <div className="location-row">{job.client.country}</div>
            {job.client.localTime && (
              <div style={{ fontSize: '0.85rem', color: '#777', marginBottom: '1rem' }}>
                {job.client.localTime}
              </div>
            )}

            <div className="client-stat">
              <strong>{job.client.jobsPosted}</strong> {t('job_details.jobs_posted')}
            </div>
            {job.client.hireRate && <div className="client-stat">{job.client.hireRate}</div>}
            <div className="client-stat" style={{ marginTop: '1rem' }}>
              <strong>{job.client.totalSpent}</strong> {t('job_details.total_spent')}
            </div>
            {job.client.totalHires && <div className="client-stat">{job.client.totalHires}</div>}

            {job.client.memberSince && (
              <div className="member-since">
                {t('job_details.member_since')} {job.client.memberSince}
              </div>
            )}
          </div>
        )}

        <div className="card copy-link-box">
          <h3 className="client-info-title" style={{ fontSize: '1rem' }}>
            {t('job_details.job_link')}
          </h3>
          <div className="link-input-group">
            <span className="link-text">{window.location.href}</span>
            <button onClick={handleCopyLink} className="copy-btn">
              {t('job_details.copy_link')}
            </button>
          </div>
        </div>
      </aside>
    </div>
  );
}
