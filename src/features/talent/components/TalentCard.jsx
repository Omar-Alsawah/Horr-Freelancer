import TalentBadge from "./TalentBadge";
import SkillTags from "./SkillTags";
import { useNavigate } from "react-router-dom";

/**
 * TalentCard
 * Displays a single freelancer's profile card with horizontal layout.
 *
 * Props:
 *   talent: {
 *     id:              string
 *     initials:        string           — e.g. "FF"
 *     avatarColor:     string           — hex background for initials avatar
 *     avatarUrl:       string | null    — if set, shows image instead of initials
 *     name:            string
 *     isVerified:      boolean
 *     badge:           "top-rated" | "rising-talent" | null
 *     title:           string           — e.g. "Children's book illustrator"
 *     jobSuccess:      number           — e.g. 90 (percentage)
 *     rating:          number           — e.g. 4.9
 *     ratingCount:     number           — e.g. 14
 *     hourlyRate:      number           — e.g. 75
 *     bio:             string
 *     skills:          Array<{ name: string, level: "Exp"|"Int"|"Beg"|null }>
 *     availability:    "Full-time" | "Part-time" | "Not available"
 *     isOnline:        boolean
 *     profileUrl:      string           — route to profile page
 *   }
 *   onInvite:     (talentId) => void    — called when "Invite to Job" is clicked
 *   onBookmark:   (talentId, isSaved) => void — called when bookmark button is clicked
 */
export default function TalentCard({ talent = {}, onInvite, onBookmark }) {
    const navigate = useNavigate();
    const {
        id,
        initials = "?",
        avatarColor = "#888",
        avatarUrl = null,
        name = "—",
        isVerified = false,
        badge = null,
        title = "—",
        jobSuccess = null,
        earned = null,
        rating = null,
        ratingCount = null,
        hourlyRate = null,
        bio = "",
        skills = [],
        availability = null,
        isOnline = false,
        profileUrl = "#",
    } = talent;
    const bookmarked = talent.isSaved ?? false;

    const formatEarned = (val) => {
        if (val >= 1000) return `$${(val / 1000).toFixed(0)}k+`;
        return `$${val}`;
    };

    const handleCardClick = () => {
        if (profileUrl && profileUrl !== "#") {
            navigate(profileUrl);
        }
    };

    const handleCardKeyDown = (event) => {
        if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            handleCardClick();
        }
    };

    return (
        <>
            <style>{`
        @keyframes goldenWave {
          0% {
            left: -100%;
          }
          100% {
            left: 100%;
          }
        }

        .tc-card {
          background: #ffffff;
          border: 1px solid #e6e4df;
          border-radius: 12px;
          padding: 1.5rem;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          font-family: 'DM Sans', system-ui, sans-serif;
          color: #1c1a17;
          cursor: pointer;
          position: relative;
          overflow: hidden;
        }

        .tc-card::before {
          content: '';
          position: absolute;
          top: 0;
          left: -100%;
          width: 100%;
          height: 100%;
          background: linear-gradient(
            90deg,
            transparent,
            rgba(201, 168, 76, 0.3),
            rgba(201, 168, 76, 0.6),
            rgba(201, 168, 76, 0.3),
            transparent
          );
          border-radius: 12px;
          pointer-events: none;
        }

        .tc-card:hover::before {
          animation: goldenWave 0.8s ease-in-out infinite;
        }

        .tc-card:hover {
          box-shadow: 0 12px 48px rgba(201, 168, 76, 0.18);
          transform: translateY(-4px);
          background-color: #fafaf8;
          border-color: rgba(201, 168, 76, 0.45);
        }

        .tc-card:active {
          transform: translateY(-2px);
        }

        /* ── Main container ── */
        .tc-container {
          display: flex;
          align-items: flex-start;
          gap: 1.25rem;
          margin-bottom: 1rem;
        }

        /* ── Avatar + online indicator ── */
        .tc-avatar-wrap {
          position: relative;
          flex-shrink: 0;
        }

        .tc-avatar {
          width: 64px;
          height: 64px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1.1rem;
          font-weight: 700;
          color: #fff;
          letter-spacing: 0.04em;
          overflow: hidden;
        }
        .tc-avatar img { width: 100%; height: 100%; object-fit: cover; }

        .tc-online-indicator {
          position: absolute;
          bottom: -4px;
          left: 50%;
          transform: translateX(-50%);
          width: 10px;
          height: 10px;
          border-radius: 50%;
          border: 2px solid #fff;
          background: #C9A84C;
        }
        .tc-online-indicator.offline {
          background: #ccc;
        }

        /* ── Main info section ── */
        .tc-info {
          flex: 1;
          min-width: 0;
        }

        .tc-name-row {
          display: flex;
          align-items: center;
          flex-wrap: wrap;
          gap: 0.4rem;
          margin-bottom: 0.25rem;
        }
        .tc-name {
          font-size: 1.1rem;
          font-weight: 700;
          color: #1c1a17;
        }

        .tc-title {
          font-size: 0.9rem;
          color: #9a9590;
          line-height: 1.4;
          margin-bottom: 0.6rem;
        }

        .tc-earned {
          font-size: 0.85rem;
          color: #C9A84C;
          font-weight: 600;
        }

        /* ── Right actions ── */
        .tc-actions {
          display: flex;
          flex-direction: column;
          align-items: flex-end;
          gap: 0.6rem;
          flex-shrink: 0;
        }

        .tc-bookmark-btn {
          background: none;
          border: none;
          cursor: pointer;
          color: #ccc;
          padding: 0.4rem;
          display: flex;
          align-items: center;
          border-radius: 50%;
          transition: color 0.15s, background 0.15s;
        }
        .tc-bookmark-btn:hover { color: #e57373; background: #fff5f5; }
        .tc-bookmark-btn.active { color: #e57373; }

        .tc-invite-btn {
          background: #C9A84C;
          color: #fff;
          border: none;
          border-radius: 20px;
          padding: 0.6rem 1.4rem;
          font-size: 0.85rem;
          font-weight: 600;
          cursor: pointer;
          font-family: inherit;
          white-space: nowrap;
          transition: opacity 0.15s, transform 0.15s;
        }
        .tc-invite-btn:hover { opacity: 0.88; transform: translateY(-1px); }

        /* ── Stats row ── */
        .tc-stats {
          display: flex;
          align-items: center;
          gap: 2rem;
          padding: 0.8rem 0;
          flex-wrap: wrap;
        }
        .tc-stat {
          display: flex;
          flex-direction: column;
          gap: 0.15rem;
        }
        .tc-stat-val {
          font-size: 1rem;
          font-weight: 700;
          color: #1c1a17;
        }
        .tc-stat-key {
          font-size: 0.65rem;
          color: #9a9590;
          text-transform: uppercase;
          letter-spacing: 0.08em;
          font-weight: 600;
        }

        .tc-rating-stars {
          display: flex;
          align-items: center;
          gap: 0.25rem;
          color: #1c1a17;
          font-weight: 700;
        }
        .tc-star { color: #C9A84C; }
        .tc-rating-count { font-size: 0.78rem; color: #9a9590; font-weight: 400; }

        /* ── Bio ── */
        .tc-bio {
          font-size: 0.85rem;
          color: #9a9590;
          line-height: 1.5;
          margin-bottom: 1rem;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }

        /* ── Footer ── */
        .tc-footer {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-top: 0.8rem;
          flex-wrap: wrap;
          gap: 0.75rem;
        }

        .tc-availability {
          font-size: 0.82rem;
          font-weight: 600;
          color: #9a9590;
        }

        .tc-view-btn {
          background: none;
          border: none;
          cursor: pointer;
          font-family: inherit;
          font-size: 0.85rem;
          font-weight: 600;
          color: #C9A84C;
          display: flex;
          align-items: center;
          gap: 0.3rem;
          padding: 0;
          transition: opacity 0.15s;
          text-decoration: none;
        }
        .tc-view-btn:hover { opacity: 0.75; }

        @media (max-width: 768px) {
          .tc-container {
            flex-direction: column;
            gap: 1rem;
          }
          .tc-actions {
            flex-direction: row;
            align-items: center;
            gap: 0.8rem;
            width: 100%;
            justify-content: space-between;
          }
          .tc-invite-btn {
            width: auto;
          }
        }
      `}</style>

            <div
                className="tc-card"
                role="link"
                tabIndex={0}
                onClick={handleCardClick}
                onKeyDown={handleCardKeyDown}
                aria-label={`View profile for ${name}`}
            >
                {/* Main container */}
                <div className="tc-container">

                    {/* Avatar + online indicator */}
                    <div className="tc-avatar-wrap">
                        <div className="tc-avatar" style={{ background: avatarColor }}>
                            {avatarUrl
                                ? <img src={avatarUrl} alt={name} />
                                : initials
                            }
                        </div>
                        <div className={`tc-online-indicator ${isOnline ? "" : "offline"}`} />
                    </div>

                    {/* Info */}
                    <div className="tc-info">
                        <div className="tc-name-row">
                            <span className="tc-name">{name}</span>
                            {isVerified && <TalentBadge type="verified" />}
                            {badge && <TalentBadge type={badge} />}
                        </div>
                        <p className="tc-title">{title}</p>
                        {earned !== null && <p className="tc-earned">${formatEarned(earned)} earned</p>}
                    </div>

                    {/* Bookmark + Invite */}
                    <div className="tc-actions">
                        <button
                          type="button"
                          className={`tc-bookmark-btn ${bookmarked ? "active" : ""}`}
                          onClick={(event) => {
                            event.stopPropagation();
                            onBookmark?.(id, bookmarked);
                          }}
                          aria-label="Bookmark freelancer"
                        >
                            <svg width="18" height="18" viewBox="0 0 24 24" fill={bookmarked ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
                            </svg>
                        </button>
                        <button
                          type="button"
                          className="tc-invite-btn"
                          onClick={(event) => {
                            event.stopPropagation();
                            onInvite?.(id);
                          }}
                        >
                            Invite to Job
                        </button>
                    </div>
                </div>

                {/* Stats */}
                <div className="tc-stats">
                  {jobSuccess !== null && (
                    <div className="tc-stat">
                      <span className="tc-stat-val">{jobSuccess}%</span>
                      <span className="tc-stat-key">Job Success</span>
                    </div>
                  )}

                  {rating !== null && (
                    <div className="tc-stat">
                      <div className="tc-rating-stars">
                        <span className="tc-star">★</span>
                        <span>{Number(rating).toFixed(1)}</span>
                        {ratingCount !== null && (
                          <span className="tc-rating-count">({ratingCount})</span>
                        )}
                      </div>
                      <span className="tc-stat-key">Rating</span>
                    </div>
                  )}

                  {hourlyRate !== null && (
                    <div className="tc-stat">
                      <span className="tc-stat-val">${Number(hourlyRate).toFixed(2)} / hr</span>
                      <span className="tc-stat-key">Rate</span>
                    </div>
                  )}

                  {badge && (
                    <div className="tc-stat">
                      <TalentBadge type={badge} />
                    </div>
                  )}
                </div>

                {/* Bio */}
                {bio && <p className="tc-bio">{bio}</p>}

                {/* Skills */}
                <SkillTags skills={skills} max={4} />

                {/* Footer */}
                <div className="tc-footer">
                    {availability && (
                        <span className="tc-availability">
                            [Availability: {availability}]
                        </span>
                    )}
                    <span className="tc-view-btn">
                        View Profile
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <line x1="5" y1="12" x2="19" y2="12" />
                            <polyline points="12 5 19 12 12 19" />
                        </svg>
                    </span>
                </div>

            </div>
        </>
    );
}