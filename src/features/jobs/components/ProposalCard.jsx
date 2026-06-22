const statusStyles = {
  Active:    { background: '#EAF3DE', color: '#3B6D11' },
  Submitted: { background: '#FAEEDA', color: '#633806' },
  Offer:     { background: '#E8F4FD', color: '#1565C0' },
  Rejected:  { background: '#FCEBEB', color: '#A32D2D' },
  Withdrawn: { background: '#F1EFE8', color: '#5F5E5A' },
};

const getInitials = (name) => {
  if (!name) return '?';
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
};

const formatDate = (dateStr) => {
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
};

const ProposalCard = ({ proposal, onAccept, onReject, isHistory }) => {
  const { freelancerName, bidRate, coverLetter, status, createdAt, maxRevisions, MaxRevisions } = proposal;
  const badge = statusStyles[status] || statusStyles.Active;

  const s = String(status).toLowerCase();
  const isSentOffer = ['pending', 'sent', 'offer', '0'].includes(s);

  return (
    <div
      style={{
        background: '#ffffff',
        border: '1px solid #e8e8e8',
        borderRadius: '14px',
        padding: '2rem 2.25rem',
        marginBottom: '1.25rem',
        transition: 'box-shadow 0.2s',
        opacity: isHistory ? 0.85 : 1,
        width: '100%',
        boxSizing: 'border-box',
      }}
      onMouseEnter={e => e.currentTarget.style.boxShadow = '0 4px 20px rgba(0,0,0,0.07)'}
      onMouseLeave={e => e.currentTarget.style.boxShadow = 'none'}
    >
      {/* Top row — freelancer info + bid */}
      <div style={{
        display: 'flex',
        alignItems: 'flex-start',
        justifyContent: 'space-between',
        marginBottom: '1.25rem',
      }}>
        {/* Left — avatar + name */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{
            width: '52px',
            height: '52px',
            borderRadius: '50%',
            background: '#EEEDFE',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '16px',
            fontWeight: '600',
            color: '#3C3489',
            flexShrink: 0,
          }}>
            {getInitials(freelancerName)}
          </div>
          <div>
            <p style={{ fontSize: '17px', fontWeight: '600', color: '#1a1a1a', margin: '0 0 4px' }}>
              {freelancerName}
            </p>
            <p style={{ fontSize: '13px', color: '#999', margin: 0 }}>
              Sent {formatDate(createdAt)}
            </p>
          </div>
        </div>

        {/* Right — bid rate & revisions */}
        <div style={{ textAlign: 'right' }}>
          <p style={{ fontSize: '12px', color: '#999', margin: '0 0 4px', letterSpacing: '0.02em' }}>
            Bid rate
          </p>
          <p style={{ fontSize: '24px', fontWeight: '600', color: '#1a1a1a', margin: '0 0 8px', lineHeight: 1 }}>
            {bidRate.toLocaleString()}{' '}
            <span style={{ fontSize: '13px', color: '#999', fontWeight: '400' }}>EGP</span>
          </p>
          {(maxRevisions != null || MaxRevisions != null) && (
            <p style={{ fontSize: '12px', color: '#B7A06A', margin: 0, fontWeight: '500' }}>
              Max Revisions: {maxRevisions ?? MaxRevisions}
            </p>
          )}
        </div>
      </div>

      {/* Status badge */}
      <div style={{ marginBottom: '1rem' }}>
        <span style={{
          fontSize: '12px',
          padding: '4px 14px',
          borderRadius: '99px',
          background: badge.background,
          color: badge.color,
          fontWeight: '500',
        }}>
          {status}
        </span>
      </div>

      {/* Cover letter */}
      <p style={{
        fontSize: '14px',
        color: '#555',
        lineHeight: '1.75',
        margin: isHistory ? '0' : '0 0 1.75rem',
        display: '-webkit-box',
        WebkitLineClamp: 2,
        WebkitBoxOrient: 'vertical',
        overflow: 'hidden',
      }}>
        {coverLetter}
      </p>

      {/* Action buttons — reject for sent offers, accept for submitted */}
      {!isHistory && (isSentOffer || s === 'submitted') && (
        <div style={{
          display: 'flex',
          gap: '12px',
          justifyContent: 'flex-end',
          borderTop: '1px solid #f0f0f0',
          paddingTop: '1.25rem',
        }}>
          {isSentOffer && (
            <button
              onClick={() => onReject(proposal)}
              style={{
                padding: '9px 24px',
                borderRadius: '8px',
                fontSize: '14px',
                cursor: 'pointer',
                border: '1px solid #e0e0e0',
                background: '#ffffff',
                color: '#555',
                fontWeight: '500',
                transition: 'background 0.15s, border-color 0.15s',
              }}
              onMouseEnter={e => {
                e.currentTarget.style.background = '#f7f7f5';
                e.currentTarget.style.borderColor = '#ccc';
              }}
              onMouseLeave={e => {
                e.currentTarget.style.background = '#ffffff';
                e.currentTarget.style.borderColor = '#e0e0e0';
              }}
            >
              Reject
            </button>
          )}
          {s === 'submitted' && (
            <button
              onClick={() => onAccept(proposal)}
              style={{
                padding: '9px 24px',
                borderRadius: '8px',
                fontSize: '14px',
                cursor: 'pointer',
                border: '1px solid #B7A06A',
                background: '#B7A06A',
                color: '#fff',
                fontWeight: '500',
                transition: 'background 0.15s',
              }}
              onMouseEnter={e => e.currentTarget.style.background = '#a08d5a'}
              onMouseLeave={e => e.currentTarget.style.background = '#B7A06A'}
            >
              Accept
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default ProposalCard;