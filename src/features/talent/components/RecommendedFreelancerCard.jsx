import { useNavigate } from 'react-router-dom';

const RecommendedFreelancerCard = ({ freelancer, onInvite }) => {
  const navigate = useNavigate();
  const {
    userId,
    name,
    title,
    bio,
    hourlyRate,
    experienceLevel,
    availability,
    skills = [],
  } = freelancer;

  const getInitials = (fullName) => {
    if (!fullName) return '?';
    const parts = fullName.trim().split(/\s+/);
    if (parts.length >= 2) return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    return fullName.substring(0, 2).toUpperCase();
  };

  const visibleSkills = skills.slice(0, 3);
  const extraSkillsCount = skills.length - visibleSkills.length;

  return (
    <div
      style={{
        background: '#ffffff',
        border: '1px solid #e6e4df',
        borderRadius: '14px',
        padding: '1.5rem',
        minWidth: '280px',
        maxWidth: '280px',
        flexShrink: 0,
        display: 'flex',
        flexDirection: 'column',
        gap: '0.9rem',
        transition: 'box-shadow 0.2s, transform 0.18s',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.boxShadow = '0 8px 28px rgba(0,0,0,0.08)';
        e.currentTarget.style.transform = 'translateY(-2px)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.boxShadow = 'none';
        e.currentTarget.style.transform = 'translateY(0)';
      }}
    >
      {/* Avatar + name + availability */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <div style={{
          width: '46px', height: '46px', borderRadius: '50%',
          background: '#EEEDFE', display: 'flex', alignItems: 'center',
          justifyContent: 'center', fontSize: '14px', fontWeight: '600',
          color: '#3C3489', flexShrink: 0, position: 'relative',
        }}>
          {getInitials(name)}
          <span style={{
            position: 'absolute', bottom: '-2px', right: '-2px',
            width: '11px', height: '11px', borderRadius: '50%',
            border: '2px solid #fff',
            background: availability ? '#C9A84C' : '#ccc',
          }} />
        </div>
        <div style={{ minWidth: 0 }}>
          <p style={{
            fontSize: '15px', fontWeight: '700', color: '#1c1a17',
            margin: '0 0 2px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
          }}>
            {name}
          </p>
          <p style={{
            fontSize: '12px', color: '#9a9590', margin: 0,
            whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
          }}>
            {title}
          </p>
        </div>
      </div>

      {/* Experience + rate */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
        {experienceLevel && (
          <span style={{
            fontSize: '11px', fontWeight: '600', padding: '3px 10px',
            borderRadius: '99px', background: '#fdf8ee', color: '#7a5c1e',
          }}>
            {experienceLevel}
          </span>
        )}
        <span style={{ fontSize: '13px', fontWeight: '600', color: '#1c1a17' }}>
          {hourlyRate} <span style={{ fontSize: '11px', color: '#9a9590', fontWeight: '400' }}>EGP/hr</span>
        </span>
      </div>

      {/* Bio */}
      {bio && (
        <p style={{
          fontSize: '13px', color: '#5a5650', lineHeight: '1.6', margin: 0,
          display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden',
        }}>
          {bio}
        </p>
      )}

      {/* Skills */}
      {visibleSkills.length > 0 && (
        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
          {visibleSkills.map((skill, idx) => (
            <span key={idx} style={{
              fontSize: '11px', padding: '3px 9px', borderRadius: '99px',
              background: '#f4f2ee', color: '#5a5650', fontWeight: '500',
            }}>
              {skill}
            </span>
          ))}
          {extraSkillsCount > 0 && (
            <span style={{
              fontSize: '11px', padding: '3px 9px', borderRadius: '99px',
              background: '#f4f2ee', color: '#9a9590', fontWeight: '500',
            }}>
              +{extraSkillsCount} more
            </span>
          )}
        </div>
      )}

      {/* Actions */}
      <div style={{ display: 'flex', gap: '8px', marginTop: '0.4rem' }}>
        <button
          onClick={() => navigate(`/client/freelancer/${userId}`)}
          style={{
            flex: 1, padding: '8px 0', borderRadius: '8px',
            border: '1px solid #e6e4df', background: '#fff',
            color: '#1c1a17', fontWeight: '500', fontSize: '13px',
            cursor: 'pointer', fontFamily: 'inherit',
          }}
        >
          View Profile
        </button>
        <button
          onClick={() => onInvite(freelancer)}
          style={{
            flex: 1, padding: '8px 0', borderRadius: '8px',
            border: '1px solid #B7A06A', background: '#B7A06A',
            color: '#fff', fontWeight: '600', fontSize: '13px',
            cursor: 'pointer', fontFamily: 'inherit',
          }}
        >
          Invite
        </button>
      </div>
    </div>
  );
};

export default RecommendedFreelancerCard;