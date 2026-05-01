import { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { jobsApi } from '../../api/jobs';
import JobCard from './JobCard';
import JobCardSkeleton from './JobCardSkeleton';
import EmptyState from './EmptyState';
import Pagination from './Pagination';

export default function SavedJobsPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const pageSize = 10;

  const fetchSavedJobs = useCallback(async () => {
    setLoading(true);
    try {
      const res = await jobsApi.getJobs({ page, pageSize, saved: true });
      setJobs(res.data.items || []);
      setTotalPages(Math.ceil((res.data.totalCount || 0) / pageSize));
    } catch (err) {
      toast.error(err.title || t('common.error'));
      setJobs([]);
    } finally {
      setLoading(false);
    }
  }, [page, pageSize, t]);

  useEffect(() => { fetchSavedJobs(); }, [fetchSavedJobs]);

  const handleUnsave = async (jobId) => {
    // Optimistic remove
    setJobs((prev) => prev.filter((j) => j.id !== jobId));
    try {
      await jobsApi.unsaveJob(jobId);
    } catch (err) {
      toast.error(t('errors.unsave_failed'));
      fetchSavedJobs();
    }
  };

  const handleJobClick = (id) => navigate(`/jobs/${id}`);

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">{t('jobs.saved_jobs')}</h1>

      {loading ? (
        <div>
          {[...Array(3)].map((_, i) => <JobCardSkeleton key={i} />)}
        </div>
      ) : jobs.length === 0 ? (
        <EmptyState title={t('jobs.empty_saved_title')} subtitle={t('jobs.empty_saved_subtitle')} />
      ) : (
        <div>
          {jobs.map((job) => (
            <JobCard
              key={job.id}
              job={job}
              isSaved={true}
              onToggleSave={handleUnsave}
              onClick={handleJobClick}
            />
          ))}
        </div>
      )}

      <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
    </div>
  );
}
