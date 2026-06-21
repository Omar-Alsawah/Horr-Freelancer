import { useState, useEffect } from 'react';
import { getRecommendedFreelancers } from '../../../services/talentService';
import RecommendedFreelancerCard from './RecommendedFreelancerCard';
import InviteFreelancerModal from './InviteFreelancerModal';
import axios from 'axios';

const CACHE_KEY = 'horr_recommended_freelancers';
const CACHE_DURATION = 3 * 60 * 60 * 1000; // 3 hours

const RecommendedFreelancers = ({ title = 'Recommended for you' }) => {
  const [freelancers, setFreelancers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [invitingFreelancer, setInvitingFreelancer] = useState(null);

  useEffect(() => {
    const controller = new AbortController();
    const fetchRecommended = async () => {
      setLoading(true);

      const cachedData = localStorage.getItem(CACHE_KEY);
      if (cachedData) {
        try {
          const { items, fetchedAt } = JSON.parse(cachedData);
          if (Date.now() - fetchedAt < CACHE_DURATION && Array.isArray(items)) {
            setFreelancers(items);
            setLoading(false);
            return;
          }
        } catch (e) {
          console.error('Failed to parse cached recommendations', e);
        }
      }

      try {
        const data = await getRecommendedFreelancers({ signal: controller.signal });
        const items = Array.isArray(data) ? data : [];
        setFreelancers(items);

        localStorage.setItem(CACHE_KEY, JSON.stringify({
          items,
          fetchedAt: Date.now()
        }));
      } catch (err) {
        if (axios.isCancel(err) || err.code === 'ERR_CANCELED') return;
        setError('Failed to load recommendations.');
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    };
    fetchRecommended();
    return () => controller.abort();
  }, []);

  // Silently hide the section if there's an error or nothing to show
  if (!loading && (error || freelancers.length === 0)) {
    return null;
  }

  return (
    <div style={{ marginBottom: '2.5rem' }}>
      <h3 style={{
        fontSize: '0.95rem', fontWeight: '700', color: '#1c1a17',
        marginBottom: '1rem', letterSpacing: '-0.01em',
      }}>
        {title}
      </h3>

      <div style={{
        display: 'flex', gap: '1rem', overflowX: 'auto',
        paddingBottom: '0.5rem',
      }}>
        {loading
          ? [1, 2, 3].map((i) => (
            <div key={i} style={{
              minWidth: '280px', maxWidth: '280px', height: '260px',
              borderRadius: '14px', flexShrink: 0,
              background: 'linear-gradient(90deg, #eae8e4 25%, #f2f0ec 50%, #eae8e4 75%)',
              backgroundSize: '200% 100%',
              animation: 'rf-shimmer 1.5s infinite',
            }} />
          ))
          : freelancers.map((freelancer) => (
            <RecommendedFreelancerCard
              key={freelancer.userId}
              freelancer={freelancer}
              onInvite={setInvitingFreelancer}
            />
          ))
        }
      </div>

      {invitingFreelancer && (
        <InviteFreelancerModal
          freelancer={invitingFreelancer}
          onClose={() => setInvitingFreelancer(null)}
        />
      )}

      <style>{`
        @keyframes rf-shimmer {
          0%   { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }
      `}</style>
    </div>
  );
};

export default RecommendedFreelancers;