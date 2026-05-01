import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Heart, Tag, Star, Globe, Calendar, ArrowLeft, Copy, Flag } from 'lucide-react';
import toast from 'react-hot-toast';
import { jobsApi } from '../../api/jobs';

function formatBudget(min, max, lang) {
  const fmt = (n) => {
    if (lang === 'ar') return new Intl.NumberFormat('ar-EG').format(n);
    return new Intl.NumberFormat('en-EG').format(n);
  };
  if (lang === 'ar') {
    if (max && min !== max) return `${fmt(min)} ج.م – ${fmt(max)} ج.م`;
    return `${fmt(min || max)} ج.م`;
  }
  if (max && min !== max) return `EGP ${fmt(min)} – ${fmt(max)}`;
  return `EGP ${fmt(min || max)}`;
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

  useEffect(() => {
    const fetchJob = async () => {
      setLoading(true);
      setNotFound(false);
      try {
        const res = await jobsApi.getJob(id);
        setJob(res.data);
        setIsSaved(res.data.isSaved || false);
      } catch (err) {
        if (err.status === 404) {
          setNotFound(true);
        } else {
          toast.error(err.title || t('common.error'));
        }
      } finally {
        setLoading(false);
      }
    };
    fetchJob();
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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <div className="flex gap-6 flex-col lg:flex-row">
        {/* Main Content */}
        <main className="flex-1 bg-white border border-gray-200 rounded-lg p-6">
          {/* Job Header */}
          <div className="mb-6">
            <h1 className="text-xl font-bold text-gray-900 mb-2">{job.title}</h1>
            <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500">
              <span>{t('jobs.posted_time', { time: job.postedTime })}</span>
              <span className="flex items-center gap-1"><Globe className="w-4 h-4" /> {job.location || t('job_details.worldwide')}</span>
            </div>
          </div>

          {/* Feature Items */}
          <div className="flex flex-wrap gap-8 mb-6 pb-6 border-b border-gray-200">
            <div className="flex items-start gap-3">
              <div className="p-2 bg-gray-100 rounded-lg"><Tag className="w-5 h-5 text-gray-600" /></div>
              <div>
                <div className="font-semibold text-gray-900">{formatBudget(job.budgetMin, job.budgetMax, lang)}</div>
                <div className="text-sm text-gray-500">{job.jobType === 'FixedPrice' ? t('jobs.fixed_price') : t('jobs.hourly')}</div>
              </div>
            </div>
            {job.experienceLevel && (
              <div className="flex items-start gap-3">
                <div className="p-2 bg-gray-100 rounded-lg"><Star className="w-5 h-5 text-gray-600" /></div>
                <div>
                  <div className="font-semibold text-gray-900">{job.experienceLevel}</div>
                  <div className="text-sm text-gray-500">{t('job_details.experience_hint')}</div>
                </div>
              </div>
            )}
          </div>

          {/* Description */}
          <div className="mb-6 pb-6 border-b border-gray-200">
            <h2 className="text-base font-semibold text-gray-900 mb-2">{t('job_details.summary')}</h2>
            <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-line">{job.description}</p>
          </div>

          {/* Project Type */}
          {job.projectType && (
            <div className="mb-6 pb-6 border-b border-gray-200">
              <div className="flex items-center gap-2 text-sm">
                <Calendar className="w-4 h-4 text-gray-500" />
                <strong className="text-gray-900">{t('job_details.project_type')}:</strong>
                <span className="text-gray-500">{job.projectType}</span>
              </div>
            </div>
          )}

          {/* Skills */}
          {job.skills?.length > 0 && (
            <div className="mb-6 pb-6 border-b border-gray-200">
              <h2 className="text-base font-semibold text-gray-900 mb-3">{t('job_details.skills_title')}</h2>
              <div className="flex flex-wrap gap-2">
                {job.skills.map((skill, i) => (
                  <span key={i} className="px-3 py-1.5 bg-gray-100 text-gray-700 text-sm rounded-full font-medium">{skill}</span>
                ))}
              </div>
            </div>
          )}

          {/* Activity */}
          {job.activity && (
            <div className="mb-6 pb-6 border-b border-gray-200">
              <h2 className="text-base font-semibold text-gray-900 mb-3">{t('job_details.activity_title')}</h2>
              <div className="space-y-2 text-sm">
                {job.activity.proposals != null && <div className="flex justify-between text-gray-600"><span>{t('job_details.proposals')}:</span><span>{job.activity.proposals}</span></div>}
                {job.activity.hires != null && <div className="flex justify-between text-gray-600"><span>{t('job_details.hires')}:</span><span>{job.activity.hires}</span></div>}
                {job.activity.invitesSent != null && <div className="flex justify-between text-gray-600"><span>{t('job_details.invites_sent')}:</span><span>{job.activity.invitesSent}</span></div>}
                {job.activity.unansweredInvites != null && <div className="flex justify-between text-gray-600"><span>{t('job_details.unanswered_invites')}:</span><span>{job.activity.unansweredInvites}</span></div>}
              </div>
            </div>
          )}

          {/* Client History */}
          {job.clientHistory?.length > 0 && (
            <div className="pt-2">
              <h2 className="text-base font-semibold text-gray-900 mb-4">{t('job_details.client_history')} ({job.clientHistory.length})</h2>
              <div className="space-y-5">
                {job.clientHistory.map((item, i) => (
                  <div key={i} className="flex justify-between items-start border-b border-gray-100 pb-4 last:border-0 last:pb-0">
                    <div className="max-w-[70%]">
                      <h3 className="text-sm font-medium text-[#eab308] mb-1">{item.title}</h3>
                      <div className="text-green-700 text-xs mb-1">{'★'.repeat(Math.round(item.rating || 5))} <span className="text-gray-900 font-semibold ml-1">{item.ratingValue || '5.0'}</span></div>
                      {item.feedback && <p className="text-sm text-gray-700 italic mb-1 leading-snug">"{item.feedback}"</p>}
                      <div className="text-xs text-gray-500">{t('job_details.to_freelancer')}: <span className="text-gray-900 font-medium">{item.freelancerName}</span></div>
                    </div>
                    <div className="text-right text-xs text-gray-500">
                      <div className="mb-1">{item.duration}</div>
                      <div className="text-gray-900 font-medium">{item.billed}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </main>

        {/* Sidebar */}
        <aside className="w-full lg:w-80 flex-shrink-0 space-y-4">
          {/* Action Card */}
          <div className="bg-white border border-gray-200 rounded-lg p-5">
            <div className="space-y-3 mb-4">
              <button
                onClick={() => navigate(`/proposals/submit?jobId=${id}`)}
                className="w-full py-2.5 px-4 bg-[#eab308] hover:bg-yellow-500 text-white font-semibold rounded-md transition-colors text-sm"
              >
                {t('job_details.submit_proposal')}
              </button>
              <button
                onClick={handleToggleSave}
                className={`w-full py-2.5 px-4 border rounded-md transition-colors text-sm font-medium flex items-center justify-center gap-2 ${
                  isSaved ? 'border-red-300 text-red-600 bg-red-50 hover:bg-red-100' : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                }`}
              >
                <Heart className={`w-4 h-4 ${isSaved ? 'fill-red-500 text-red-500' : ''}`} />
                {isSaved ? t('job_details.saved') : t('job_details.save_job')}
              </button>
            </div>
            <button className="text-xs text-gray-400 hover:text-gray-600 flex items-center gap-1">
              <Flag className="w-3 h-3" /> {t('job_details.flag_inappropriate')}
            </button>
          </div>

          {/* Client Info Card */}
          {job.client && (
            <div className="bg-white border border-gray-200 rounded-lg p-5">
              <h3 className="font-semibold text-gray-900 mb-3">{t('job_details.about_client')}</h3>

              {job.client.paymentVerified && (
                <div className="flex items-center gap-1.5 text-sm text-green-700 mb-3">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" /></svg>
                  {t('job_details.payment_method_verified')}
                </div>
              )}

              {job.client.rating && (
                <div className="flex items-center gap-2 text-sm mb-3">
                  <span className="text-yellow-500">{'★'.repeat(Math.round(job.client.rating))}</span>
                  <span className="text-gray-900 font-medium">{job.client.ratingValue}</span>
                  <span className="text-gray-500">{job.client.reviewCount} {t('job_details.reviews')}</span>
                </div>
              )}

              <div className="text-sm font-medium text-gray-900 mb-0.5">{job.client.country}</div>
              {job.client.localTime && <div className="text-xs text-gray-500 mb-3">{job.client.localTime}</div>}

              <div className="space-y-1.5 text-sm text-gray-600">
                {job.client.jobsPosted != null && <div><strong className="text-gray-900">{job.client.jobsPosted}</strong> {t('job_details.jobs_posted')}</div>}
                {job.client.hireRate && <div>{job.client.hireRate}</div>}
                {job.client.totalSpent && <div><strong className="text-gray-900">{job.client.totalSpent}</strong> {t('job_details.total_spent')}</div>}
                {job.client.totalHires && <div>{job.client.totalHires}</div>}
              </div>

              {job.client.memberSince && <div className="text-xs text-gray-400 mt-4 pt-3 border-t border-gray-100">{t('job_details.member_since')} {job.client.memberSince}</div>}
            </div>
          )}

          {/* Copy Link Card */}
          <div className="bg-white border border-gray-200 rounded-lg p-5">
            <h3 className="font-semibold text-gray-900 mb-2 text-sm">{t('job_details.job_link')}</h3>
            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-500 truncate flex-1 bg-gray-50 px-2 py-1.5 rounded border border-gray-200">{window.location.href}</span>
              <button onClick={handleCopyLink} className="flex-shrink-0 px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-medium rounded transition-colors flex items-center gap-1">
                <Copy className="w-3 h-3" /> {t('job_details.copy_link')}
              </button>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
