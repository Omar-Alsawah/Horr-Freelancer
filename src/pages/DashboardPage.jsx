import { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import toast from 'react-hot-toast';
import { jobsApi } from '../api/jobs';
import { useAuthStore } from '../store/authStore';
import JobCard from '../features/jobs/JobCard';
import JobCardSkeleton from '../features/jobs/JobCardSkeleton';
import EmptyState from '../features/jobs/EmptyState';
import axios from 'axios';

const CACHE_KEY = 'horr_recommended_jobs';
const CACHE_DURATION = 3 * 60 * 60 * 1000; // 3 hours

export default function DashboardPage() {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);

  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [savedIds, setSavedIds] = useState(new Set());
  const [savingIds, setSavingIds] = useState(new Set());
  const fetchedRef = useRef(false);

  const fetchRecommendations = useCallback(async (options = {}) => {
    const { signal } = options;
    setLoading(true);

    const cachedData = localStorage.getItem(CACHE_KEY);
    if (cachedData) {
      try {
        const { items, fetchedAt } = JSON.parse(cachedData);
        if (Date.now() - fetchedAt < CACHE_DURATION && Array.isArray(items)) {
          if (signal && signal.aborted) return;
          setJobs(items);
          const initialSaved = new Set(
            items.filter(job => job.isSaved).map(job => job.id)
          );
          setSavedIds(initialSaved);
          setLoading(false);
          return;
        }
      } catch (e) {
        console.error('Failed to parse cached recommendations', e);
      }
    }

    try {
      const res = await jobsApi.getRecommendedJobs({ signal });
      const payload = res.data?.data || res.data;
      const items = Array.isArray(payload) ? payload : (payload?.items || []);
      
      if (signal && signal.aborted) return;

      setJobs(items);
      
      // Initialize savedIds with the ids of the jobs that are already saved
      const initialSaved = new Set(
        items.filter(job => job.isSaved).map(job => job.id)
      );
      setSavedIds(initialSaved);

      // Save to cache
      localStorage.setItem(CACHE_KEY, JSON.stringify({
        items,
        fetchedAt: Date.now()
      }));
    } catch (err) {
      if (axios.isCancel(err) || err.code === 'ERR_CANCELED') return;
      toast.error(err.title || t('common.error'));
      if (signal && signal.aborted) return;
      setJobs([]);
    } finally {
      if (!signal || !signal.aborted) {
        setLoading(false);
      }
    }
  }, [t]);

  useEffect(() => {
    const controller = new AbortController();
    if (user?.role === 'Freelancer') {
      if (!fetchedRef.current) {
        fetchedRef.current = true;
        Promise.resolve().then(() => {
          fetchRecommendations({ signal: controller.signal });
        });
      }
    } else if (user && user.role !== 'Freelancer') {
      Promise.resolve().then(() => {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      });
    }
    return () => controller.abort();
  }, [user, fetchRecommendations]);

  const handleToggleSave = async (jobId) => {
    if (savingIds.has(jobId)) return;
    const wasSaved = savedIds.has(jobId);
    
    // Optimistic update
    setSavedIds(prev => {
      const n = new Set(prev);
      if (wasSaved) {
        n.delete(jobId);
      } else {
        n.add(jobId);
      }
      return n;
    });
    
    setSavingIds(prev => {
      const n = new Set(prev);
      n.add(jobId);
      return n;
    });

    try {
      if (wasSaved) {
        await jobsApi.unsaveJob(jobId);
      } else {
        await jobsApi.saveJob(jobId);
      }

      // Update cache
      const cached = localStorage.getItem(CACHE_KEY);
      if (cached) {
        try {
          const parsed = JSON.parse(cached);
          if (Array.isArray(parsed.items)) {
            parsed.items = parsed.items.map(job => 
              job.id === jobId ? { ...job, isSaved: !wasSaved } : job
            );
            localStorage.setItem(CACHE_KEY, JSON.stringify(parsed));
          }
        } catch (e) {
          console.error(e);
        }
      }
    } catch (err) {
      // Revert optimistic update
      setSavedIds(prev => {
        const n = new Set(prev);
        if (wasSaved) {
          n.add(jobId);
        } else {
          n.delete(jobId);
        }
        return n;
      });
      toast.error(err.title || t('common.error'));
    } finally {
      setSavingIds(prev => {
        const n = new Set(prev);
        n.delete(jobId);
        return n;
      });
    }
  };

  const isFallback = jobs.some(job => job.isFallback);

  if (user?.role && user.role !== 'Freelancer') {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <h1 className="text-3xl font-bold font-cairo" style={{ color: 'var(--color-text-main)' }}>
          {t('home.welcome') || 'Welcome to HORR'}
        </h1>
        <p className="mt-3 text-lg" style={{ color: 'var(--color-text-secondary)' }}>
          Manage your postings and talent from the navigation above.
        </p>
      </div>
    );
  }

  return (
    <div className="container container-single-col" style={{ maxWidth: '960px', margin: '2rem auto' }}>
      
      {/* Welcome Banner Card */}
      <div 
        className="bg-white/80 backdrop-blur-md border border-gray-200/80 rounded-2xl p-6 md:p-8 mb-8 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-6 relative overflow-hidden"
        style={{
          boxShadow: '0 4px 20px -2px rgba(0,0,0,0.05)',
        }}
      >
        {/* Background glow effects */}
        <div className="absolute -top-24 -right-24 w-48 h-48 bg-[#eab308]/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-[#1e293b]/5 rounded-full blur-3xl pointer-events-none"></div>
        
        <div className="relative z-10">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-[#eab308]/10 text-[#856404] mb-3">
            {isFallback 
              ? `⏱️ ${t('dashboard.recent_jobs_badge', 'Recent Jobs')}` 
              : `✨ ${t('dashboard.personalized_matches', 'Personalized Matches')}`}
          </span>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-gray-900 mb-2 font-cairo">
            {i18n.exists('dashboard.welcome_back') 
              ? t('dashboard.welcome_back', { name: user?.name }) 
              : `Welcome back, ${user?.name || 'Freelancer'}!`}
          </h1>
          <p className="text-gray-500 text-sm md:text-base max-w-xl">
            {isFallback
              ? (t('dashboard.recent_jobs_fallback_subtitle', 'There were no recommended jobs, and here are some recent jobs for you'))
              : (t('dashboard.banner_subtitle', 'We have analyzed your profile and matched you with high-quality opportunities that fit your skillset.'))}
          </p>
        </div>
        
        <div className="flex gap-4 w-full md:w-auto relative z-10">
          <button 
            onClick={() => navigate('/find-work')}
            className="w-full md:w-auto px-5 py-2.5 bg-[#1e293b] hover:bg-[#2e3b4e] text-white font-medium text-sm rounded-xl transition-all shadow-sm flex items-center justify-center gap-2 hover:scale-[1.02] active:scale-[0.98]"
            style={{
              cursor: 'pointer',
              transition: 'transform 0.2s ease, background-color 0.2s ease'
            }}
          >
            🔍 {t('dashboard.browse_all') || 'Browse All Jobs'}
          </button>
        </div>
      </div>

      {/* Recommended Section Title */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold text-gray-900 font-cairo" style={{ margin: 0 }}>
          {isFallback 
            ? t('dashboard.recent_jobs_header', 'Recent Jobs') 
            : t('dashboard.recommended_jobs_header', 'Jobs you might like')}
        </h2>
      </div>

      <div className="job-list">
        {loading ? (
          [1, 2, 3].map(i => <JobCardSkeleton key={i} />)
        ) : jobs.length === 0 ? (
          <EmptyState
            title={t('dashboard.no_recommendations_title', 'No recommendations yet')}
            subtitle={t('dashboard.no_recommendations_subtitle', 'Complete your profile to get personalized job matches.')}
          />
        ) : (
          jobs.map(job => (
            <JobCard
              key={job.id}
              job={job}
              isSaved={savedIds.has(job.id)}
              onToggleSave={handleToggleSave}
              onClick={id => navigate(`/jobs/${id}`)}
            />
          ))
        )}
      </div>
    </div>
  );
}
