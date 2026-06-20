import { useState, useEffect } from 'react';
import { getRecommendedFreelancers } from '../../../services/talentService';
import RecommendedFreelancerCard from './RecommendedFreelancerCard';
import InviteFreelancerModal from './InviteFreelancerModal';

const RecommendedFreelancers = ({ title = 'Recommended for you' }) => {
  const [freelancers, setFreelancers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [invitingFreelancer, setInvitingFreelancer] = useState(null);

  useEffect(() => {
    const fetchRecommended = async () => {
      try {
        setLoading(true);
        const data = await getRecommendedFreelancers();
        setFreelancers(Array.isArray(data) ? data : []);
      } catch (err) {
        setError('Failed to load recommendations.');
      } finally {
        setLoading(false);
      }
    };
    fetchRecommended();
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