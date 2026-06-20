const RejectConfirmModal = ({ proposal, onClose, onConfirm, loading }) => {
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
          maxWidth: '400px', boxShadow: '0 16px 60px rgba(0,0,0,0.18)',
          overflow: 'hidden',
        }}
      >
        {/* Header */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '1.3rem 1.6rem', borderBottom: '1px solid #e6e4df',
        }}>
          <h2 style={{ fontSize: '1.05rem', fontWeight: '700', margin: 0 }}>Reject Proposal</h2>
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
          <p style={{ fontSize: '0.92rem', color: '#1c1a17', lineHeight: '1.65', margin: 0 }}>
            Are you sure you want to reject <strong>{proposal.freelancerName}</strong>'s proposal?
            <br />
            <span style={{ color: '#9a9590', fontSize: '0.82rem' }}>This action cannot be undone.</span>
          </p>

          <div style={{ display: 'flex', gap: '0.65rem', paddingTop: '0.25rem' }}>
            <button
              onClick={onConfirm}
              disabled={loading}
              style={{
                padding: '0.6rem 1.4rem', borderRadius: '8px', border: 'none',
                background: '#d32f2f', color: '#fff', fontWeight: '600',
                fontSize: '0.875rem', cursor: 'pointer', opacity: loading ? 0.7 : 1,
                fontFamily: 'inherit',
              }}
            >
              {loading ? 'Rejecting…' : 'Yes, Reject'}
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

export default RejectConfirmModal;