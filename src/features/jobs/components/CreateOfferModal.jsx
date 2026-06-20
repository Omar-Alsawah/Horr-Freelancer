import { useState } from 'react';

const CreateOfferModal = ({ proposal, onClose, onConfirm, loading }) => {
  const [agreedRate, setAgreedRate] = useState(proposal.bidRate || '');
  const [jobDescription, setJobDescription] = useState('');

  const handleSubmit = () => {
    if (!agreedRate) return;
    onConfirm({ agreedRate: parseFloat(agreedRate), jobDescription });
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
          maxWidth: '460px', boxShadow: '0 16px 60px rgba(0,0,0,0.18)',
          overflow: 'hidden',
        }}
      >
        {/* Header */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '1.3rem 1.6rem', borderBottom: '1px solid #e6e4df',
        }}>
          <div>
            <h2 style={{ fontSize: '1.05rem', fontWeight: '700', margin: '0 0 2px' }}>Create Offer</h2>
            <p style={{ fontSize: '0.78rem', color: '#9a9590', margin: 0 }}>
              To {proposal.freelancerName}
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
        <div style={{ padding: '1.6rem', display: 'flex', flexDirection: 'column', gap: '1.1rem' }}>
          
          {/* Agreed Rate */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.45rem' }}>
            <label style={{ fontSize: '0.82rem', fontWeight: '600', color: '#5a5650' }}>
              Agreed Rate (EGP)
            </label>
            <input
              type="number"
              min="0"
              value={agreedRate}
              onChange={(e) => setAgreedRate(e.target.value)}
              placeholder="e.g. 1200"
              style={{
                padding: '0.65rem 0.95rem', border: '1.5px solid #e6e4df',
                borderRadius: '8px', fontSize: '0.9rem', fontFamily: 'inherit',
                background: '#fafaf8', color: '#1c1a17', outline: 'none', width: '100%',
              }}
            />
          </div>

          {/* Job Description / Note */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.45rem' }}>
            <label style={{ fontSize: '0.82rem', fontWeight: '600', color: '#5a5650' }}>
              Job Description
            </label>
            <textarea
              value={jobDescription}
              onChange={(e) => setJobDescription(e.target.value)}
              placeholder="Add a custom note or job description for the freelancer..."
              rows={4}
              style={{
                padding: '0.65rem 0.95rem', border: '1.5px solid #e6e4df',
                borderRadius: '8px', fontSize: '0.9rem', fontFamily: 'inherit',
                background: '#fafaf8', color: '#1c1a17', outline: 'none',
                width: '100%', resize: 'vertical',
              }}
            />
          </div>

          {/* Actions */}
          <div style={{ display: 'flex', gap: '0.65rem', paddingTop: '0.25rem' }}>
            <button
              onClick={handleSubmit}
              disabled={loading || !agreedRate}
              style={{
                padding: '0.6rem 1.4rem', borderRadius: '8px',
                border: '1px solid #B7A06A', background: '#B7A06A',
                color: '#fff', fontWeight: '600', fontSize: '0.875rem',
                cursor: loading || !agreedRate ? 'not-allowed' : 'pointer',
                opacity: loading || !agreedRate ? 0.7 : 1,
                fontFamily: 'inherit',
              }}
            >
              {loading ? 'Sending…' : 'Send Offer'}
            </button>
            <button
              onClick={onClose}
              disabled={loading}
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

export default CreateOfferModal;