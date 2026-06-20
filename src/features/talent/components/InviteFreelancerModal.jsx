import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { getClientJobs, sendJobInvitation } from '../../../services/clientService';

const InviteFreelancerModal = ({ freelancer, onClose }) => {
  const [jobs, setJobs] = useState([]);
  const [jobsLoading, setJobsLoading] = useState(false);
  const [jobsError, setJobsError] = useState(null);
  const [selectedJobId, setSelectedJobId] = useState('');
  const [message, setMessage] = useState(
    'Hi, I would like to invite you to discuss my job post.'
  );
  const [sending, setSending] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState('');

  useEffect(() => {
    const fetchJobs = async () => {
      setJobsLoading(true);
      setJobsError(null);
      try {
        const response = await getClientJobs();
        const rawJobs = Array.isArray(response) ? response : response?.data || [];
        setJobs(Array.isArray(rawJobs) ? rawJobs : []);
        if (Array.isArray(rawJobs) && rawJobs.length > 0) {
          setSelectedJobId(rawJobs[0].id || '');
        }
      } catch (err) {
        setJobsError(
          err.response?.data?.message || err.message || 'Unable to load job list.'
        );
      } finally {
        setJobsLoading(false);
      }
    };
    fetchJobs();
  }, []);

  const handleSend = async () => {
    if (!selectedJobId) {
      setError('Select a job before sending the invitation.');
      return;
    }
    if (!freelancer?.userId) {
      setError('Unable to resolve freelancer identifier.');
      return;
    }

    setSending(true);
    setError(null);
    setSuccess('');

    try {
      await sendJobInvitation({
        jobPostId: selectedJobId,
        freelancerId: freelancer.userId,
        message: message,
      });
      setSuccess('Invitation sent successfully.');
      toast.success('Invitation sent successfully.');
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Failed to send invitation.';
      setError(msg);
      toast.error(msg);
    } finally {
      setSending(false);
    }
  };

  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        zIndex: 500, padding: '1rem', backdropFilter: 'blur(3px)',
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: '#fff', borderRadius: '16px', width: '100%',
          maxWidth: '480px', boxShadow: '0 16px 60px rgba(0,0,0,0.18)',
          overflow: 'hidden',
        }}
      >
        {/* Header */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '1.3rem 1.6rem', borderBottom: '1px solid #e6e4df',
        }}>
          <div>
            <h2 style={{ fontSize: '1.05rem', fontWeight: '700', margin: '0 0 2px' }}>
              Send a job invitation
            </h2>
            <p style={{ fontSize: '0.78rem', color: '#9a9590', margin: 0 }}>
              To {freelancer.name}
            </p>
          </div>
          <button
            onClick={onClose}
            style={{
              background: '#f4f2ee', border: 'none', width: '30px', height: '30px',
              borderRadius: '50%', display: 'flex', alignItems: 'center',
              justifyContent: 'center', cursor: 'pointer', color: '#9a9590',
            }}
          >
            ✕
          </button>
        </div>

        {/* Body */}
        <div style={{ padding: '1.6rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.45rem' }}>
            <label style={{ fontSize: '0.82rem', fontWeight: '600', color: '#5a5650' }}>
              Select a job post
            </label>
            <select
              value={selectedJobId}
              onChange={(e) => setSelectedJobId(e.target.value)}
              disabled={jobsLoading || jobs.length === 0}
              style={{
                padding: '0.65rem 0.95rem', border: '1.5px solid #e6e4df',
                borderRadius: '8px', fontSize: '0.9rem', fontFamily: 'inherit',
                background: '#fafaf8', color: '#1c1a17', outline: 'none', width: '100%',
              }}
            >
              <option value="">Select a job post</option>
              {jobs.map((job) => (
                <option key={job.id} value={job.id}>
                  {job.title || job.name || `Job ${job.id}`}
                </option>
              ))}
            </select>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.45rem' }}>
            <label style={{ fontSize: '0.82rem', fontWeight: '600', color: '#5a5650' }}>
              Message
            </label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Write your invitation message..."
              rows={4}
              maxLength={1000}
              style={{
                padding: '0.65rem 0.95rem', border: '1.5px solid #e6e4df',
                borderRadius: '8px', fontSize: '0.9rem', fontFamily: 'inherit',
                background: '#fafaf8', color: '#1c1a17', outline: 'none',
                width: '100%', resize: 'vertical',
              }}
            />
            <span style={{ fontSize: '0.75rem', color: '#9a9590', textAlign: 'right' }}>
              {message.length}/1000
            </span>
          </div>

          {jobsError && <p style={{ color: '#d32f2f', fontSize: '0.85rem', margin: 0 }}>{jobsError}</p>}
          {error && <p style={{ color: '#d32f2f', fontSize: '0.85rem', margin: 0 }}>{error}</p>}
          {success && <p style={{ color: '#2e7d32', fontSize: '0.85rem', margin: 0 }}>{success}</p>}

          <div style={{ display: 'flex', gap: '0.65rem', paddingTop: '0.25rem' }}>
            <button
              onClick={handleSend}
              disabled={sending || jobsLoading || !selectedJobId}
              style={{
                padding: '0.6rem 1.4rem', borderRadius: '8px',
                border: '1px solid #B7A06A', background: '#B7A06A',
                color: '#fff', fontWeight: '600', fontSize: '0.875rem',
                cursor: sending ? 'not-allowed' : 'pointer',
                opacity: sending || !selectedJobId ? 0.7 : 1,
                fontFamily: 'inherit',
              }}
            >
              {sending ? 'Sending…' : 'Send Invitation'}
            </button>
            <button
              onClick={onClose}
              disabled={sending}
              style={{
                padding: '0.6rem 1.3rem', borderRadius: '8px',
                border: '1px solid #e6e4df', background: '#fff',
                color: '#1c1a17', fontWeight: '500', fontSize: '0.875rem',
                cursor: 'pointer', fontFamily: 'inherit',
              }}
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InviteFreelancerModal;