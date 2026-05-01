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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <div className="flex gap-6 flex-col lg:flex-row">
        {/* Main Feed Column */}
        <main className="flex-1 min-w-0">
          {/* Search Bar */}
          <div className="flex items-center border border-gray-300 rounded-lg px-4 py-2.5 bg-white mb-6 focus-within:ring-2 focus-within:ring-[#eab308] focus-within:border-transparent">
            <Search className="w-5 h-5 text-gray-500 mr-3 flex-shrink-0" />
            <input
              type="text"
              placeholder={t('jobs.search_placeholder')}
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              className="w-full bg-transparent border-none focus:outline-none text-sm text-gray-900 placeholder-gray-500"
            />
          </div>

          <h2 className="text-2xl font-semibold text-gray-900 mb-4">{t('jobs.section_title')}</h2>

          {/* Tabs + Sort */}
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center border-b border-gray-200 mb-4 pb-3 gap-3">
            <div className="flex items-center gap-1">
              {jobTypeFilters.map((f) => (
                <button
                  key={f.value}
                  onClick={() => setJobType(f.value)}
                  className={`px-3 py-1.5 text-sm rounded-md font-medium transition-colors ${
                    jobType === f.value 
                      ? 'bg-[#1e293b] text-white' 
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-500">{t('jobs.sort_by')}</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="border border-gray-300 rounded-md px-2 py-1.5 text-sm text-gray-700 outline-none cursor-pointer bg-white"
              >
                <option value="newest">{t('jobs.sort_newest')}</option>
                <option value="oldest">{t('jobs.sort_oldest')}</option>
                <option value="budget-high">{t('jobs.sort_budget_high')}</option>
                <option value="budget-low">{t('jobs.sort_budget_low')}</option>
              </select>
            </div>
          </div>

          <p className="text-sm text-gray-500 mb-6">{t('jobs.section_hint')}</p>

          {/* Job List */}
          {loading ? (
            <div>
              {[...Array(3)].map((_, i) => <JobCardSkeleton key={i} />)}
            </div>
          ) : jobs.length === 0 ? (
            <EmptyState title={t('jobs.empty_title')} subtitle={t('jobs.empty_subtitle')} />
          ) : (
            <div>
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
        <aside className="w-full lg:w-72 flex-shrink-0">
          {/* Profile Snapshot */}
          <div className="bg-white border border-gray-200 rounded-lg p-6 text-center mb-4">
            <div className="w-20 h-20 rounded-full bg-[#1e293b] text-white flex items-center justify-center text-2xl font-bold mx-auto mb-3">
              {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
            </div>
            <div className="text-lg font-semibold text-gray-900">{user?.name || 'User'}</div>
            <div className="text-sm text-gray-500 mb-4">{user?.role || ''}</div>
            <div className="w-full">
              <div className="flex justify-between text-xs text-[#eab308] font-medium mb-1">
                <span className="text-[#eab308] hover:underline cursor-pointer">{t('jobs.complete_profile') || 'Complete your profile'}</span>
                <span>40%</span>
              </div>
              <div className="h-1 bg-gray-200 rounded-full overflow-hidden">
                <div className="h-full bg-[#eab308] w-2/5"></div>
              </div>
            </div>
          </div>

          {/* Identity Verification */}
          <div className="bg-white border border-gray-200 rounded-lg p-6 mb-4">
            <h3 className="font-semibold text-gray-900 mb-2">Identity verification</h3>
            <p className="text-sm text-gray-500 mb-3 leading-relaxed">Increase your profile visibility in search results and win more work with an ID Verified Badge.</p>
            <a href="#" className="text-sm font-medium text-[#eab308] hover:underline">Get ID Verified</a>
          </div>
        </aside>
      </div>
    </div>
  );
}
