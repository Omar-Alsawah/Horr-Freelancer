import { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { Search } from 'lucide-react';
import toast from 'react-hot-toast';
import { jobsApi } from '../../api/jobs';
import { useAuthStore } from '../../store/authStore';
import { useDebounce } from '../../hooks/useDebounce';
import JobCard from './JobCard';
import JobCardSkeleton from './JobCardSkeleton';
import EmptyState from './EmptyState';
import Pagination from './Pagination';

export default function FindWorkPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);

  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [keyword, setKeyword] = useState('');
  const [jobType, setJobType] = useState('');
  const [sortBy, setSortBy] = useState('newest');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [savedJobIds, setSavedJobIds] = useState(new Set());

  const debouncedKeyword = useDebounce(keyword, 400);
  const pageSize = 10;

  const fetchJobs = useCallback(async () => {
    setLoading(true);
    try {
      const params = { page, pageSize, sortBy };
      if (debouncedKeyword) params.keyword = debouncedKeyword;
      if (jobType) params.jobType = jobType;
      const res = await jobsApi.getJobs(params);
      setJobs(res.data.items || []);
      setTotalPages(Math.ceil((res.data.totalCount || 0) / pageSize));
    } catch (err) {
      toast.error(err.title || t('common.error'));
      setJobs([]);
    } finally {
      setLoading(false);
    }
  }, [page, pageSize, sortBy, debouncedKeyword, jobType, t]);

  useEffect(() => { fetchJobs(); }, [fetchJobs]);

  // Reset to page 1 when filters change
  useEffect(() => { setPage(1); }, [debouncedKeyword, jobType, sortBy]);

  const handleToggleSave = async (jobId) => {
    const wasSaved = savedJobIds.has(jobId);
    // Optimistic update
    setSavedJobIds((prev) => {
      const next = new Set(prev);
      wasSaved ? next.delete(jobId) : next.add(jobId);
      return next;
    });
    try {
      if (wasSaved) {
        await jobsApi.unsaveJob(jobId);
      } else {
        await jobsApi.saveJob(jobId);
      }
    } catch (err) {
      // Revert
      setSavedJobIds((prev) => {
        const next = new Set(prev);
        wasSaved ? next.add(jobId) : next.delete(jobId);
        return next;
      });
      toast.error(wasSaved ? t('errors.unsave_failed') : t('errors.save_failed'));
    }
  };

  const handleJobClick = (id) => navigate(`/jobs/${id}`);

  const jobTypeFilters = [
    { label: t('jobs.filter_all'), value: '' },
    { label: t('jobs.filter_fixed'), value: 'FixedPrice' },
    { label: t('jobs.filter_hourly'), value: 'Hourly' }
  ];

  return (
    <div className="container" style={{ gridTemplateColumns: '7fr 3fr' }}>
      {/* Main Feed Column */}
      <main className="feed-section">
        {/* Search Bar */}
        <div className="search-bar-main">
          <div className="search-input-wrapper">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#777" stroke-width="2">
              <circle cx="11" cy="11" r="8"></circle>
              <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
            </svg>
            <input
              type="text"
              placeholder={t('jobs.search_placeholder')}
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
            />
          </div>
        </div>

        <h2 className="section-title" style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>
          {t('jobs.section_title')}
        </h2>

        {/* Tabs + Sort */}
        <div className="job-feed-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #e0e0e0', marginBottom: '1.5rem' }}>
          <div className="job-feed-tabs" style={{ borderBottom: 'none', marginBottom: 0 }}>
            {jobTypeFilters.map((f) => (
              <div
                key={f.value}
                onClick={() => setJobType(f.value)}
                className={`feed-tab ${jobType === f.value ? 'active' : ''}`}
              >
                {f.label}
              </div>
            ))}
          </div>

          <div className="sort-container" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span style={{ fontSize: '0.9rem', color: '#5e6d55' }}>{t('jobs.sort_by')}</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              id="job-sort-select"
              style={{ border: '1px solid #ccc', borderRadius: '6px', padding: '0.4rem', fontSize: '0.9rem', color: '#333', outline: 'none', cursor: 'pointer' }}
            >
              <option value="newest">{t('jobs.sort_newest')}</option>
              <option value="oldest">{t('jobs.sort_oldest')}</option>
              <option value="budget-high">{t('jobs.sort_budget_high')}</option>
              <option value="budget-low">{t('jobs.sort_budget_low')}</option>
            </select>
          </div>
        </div>

        <div style={{ fontSize: '0.85rem', color: 'var(--color-text-secondary)', marginBottom: '1.5rem' }}>
          {t('jobs.section_hint')}
        </div>

        {/* Job List */}
        {loading ? (
          <div id="job-feed-container">
            {[...Array(3)].map((_, i) => <JobCardSkeleton key={i} />)}
          </div>
        ) : jobs.length === 0 ? (
          <EmptyState title={t('jobs.empty_title')} subtitle={t('jobs.empty_subtitle')} />
        ) : (
          <div id="job-feed-container">
            {jobs.map((job) => (
              <JobCard
                key={job.id}
                job={job}
                isSaved={savedJobIds.has(job.id)}
                onToggleSave={handleToggleSave}
                onClick={handleJobClick}
              />
            ))}
          </div>
        )}

        <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
      </main>

      {/* Sidebar */}
      <aside className="sidebar">
        {/* Profile Snapshot */}
        <div className="card profile-card">
          <div className="profile-avatar">
            {user?.name ? user.name.split(' ').map(n => n[0]).join('').toUpperCase() : 'U'}
          </div>
          <a href="#" className="profile-name">{user?.name || 'User'}</a>
          <div className="profile-title">{user?.role || 'Freelancer'}</div>
          <div className="progress-container">
            <div className="progress-label">
              <span className="promo-link" style={{ fontSize: '0.8rem', cursor: 'pointer' }}>
                {t('jobs.complete_profile')}
              </span>
              <span>40%</span>
            </div>
            <div className="progress-bar">
              <div className="progress-fill" style={{ width: '40%' }}></div>
            </div>
          </div>
        </div>

        {/* Identity Verification */}
        <div className="card promo-card">
          <h3 style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: '0.5rem' }}>
            Identity verification
          </h3>
          <p className="promo-text">
            Increase your profile visibility in search results and win more work with an ID Verified Badge.
          </p>
          <a href="#" className="promo-link">Get ID Verified</a>
        </div>
      </aside>
    </div>
  );
}
