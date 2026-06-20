import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import TalentCard from "./components/TalentCard";
import { fetchSavedTalents, clearSavedTalents, toggleSaveFreelancer } from "./talentSlice";

/**
 * Utility: Extract initials from full name
 */
function getInitials(fullName) {
  if (!fullName) return "?";
  const parts = fullName.trim().split(/\s+/);
  if (parts.length >= 2) {
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  }
  return fullName.substring(0, 2).toUpperCase();
}

/**
 * Utility: Generate consistent avatar color from name
 */
function getAvatarColor(fullName) {
  const colors = [
    "#7AC943", "#43A047", "#2E7D32", "#388E3C",
    "#4CAF50", "#66BB6A", "#81C784", "#A5D6A7"
  ];
  if (!fullName) return colors[0];
  const hash = fullName.charCodeAt(0) + fullName.charCodeAt(fullName.length - 1);
  return colors[hash % colors.length];
}

/**
 * Utility: Map proficiency levels to short form
 */
function mapProficiencyLevel(level) {
  const mapping = {
    Beginner: "Beg",
    Intermediate: "Int",
    Expert: "Exp",
    Advanced: "Exp",
  };
  return mapping[level] || level;
}

/**
 * Utility: Transform API saved talent response to component props
 */
function transformSavedTalent(apiTalent) {
  const initials = getInitials(apiTalent.fullName);
  const avatarColor = getAvatarColor(apiTalent.fullName);

  return {
    id: apiTalent.id,
    initials,
    avatarColor,
    avatarUrl: apiTalent.profilePicturePath || null,
    name: apiTalent.fullName,
    isVerified: apiTalent.isVerified || false,
    isSaved: true, // Since it is in saved talents list
    badge: null,
    title: apiTalent.title || "Freelancer",
    jobSuccess: apiTalent.jobSuccessPercentage ?? 100,
    earned: null,
    rating: apiTalent.averageRating || 0,
    ratingCount: apiTalent.totalReviews || 0,
    hourlyRate: apiTalent.hourlyRate || 0,
    bio: apiTalent.bio || "",
    skills: (apiTalent.skills || []).map((skill) => ({
      name: skill.skillName,
      level: mapProficiencyLevel(skill.proficiencyLevel),
    })),
    availability: apiTalent.availability || "Not specified",
    isOnline: false,
    profileUrl: `/client/freelancer/${apiTalent.id}`,
  };
}

export default function SavedTalentPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { savedTalents, savedLoading, savedError, savedPagination } = useSelector(
    (state) => state.talent
  );

  // Fetch saved talents on component mount, clear on unmount
  useEffect(() => {
    dispatch(fetchSavedTalents({ page: 1, pageSize: 10 }));
    return () => {
      dispatch(clearSavedTalents());
    };
  }, [dispatch]);

  const handleLoadMore = () => {
    const nextPage = savedPagination.page + 1;
    dispatch(fetchSavedTalents({ page: nextPage, pageSize: savedPagination.pageSize }));
  };

  const handleInvite = (talentId) => {
    navigate(`/client/freelancer/${talentId}?invite=true`);
  };

  const handleBookmark = (talentId, isSaved) => {
    dispatch(toggleSaveFreelancer({ freelancerId: talentId, isSaved }));
  };

  const transformedTalents = savedTalents.map(transformSavedTalent);

  return (
    <>
      <style>{`
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        :root {
          --sav-gold:    #C9A84C;
          --sav-bg:      #f9f9f7;
          --sav-border:  #e6e4df;
          --sav-muted:   #9a9590;
          --sav-text:    #1c1a17;
          --sav-radius:  12px;
        }

        .sav-page {
          min-height: 100vh;
          background: var(--sav-bg);
          font-family: 'DM Sans', system-ui, sans-serif;
          color: var(--sav-text);
          padding: 3rem 2rem 5rem;
        }

        .sav-container {
          max-width: 1000px;
          margin: 0 auto;
          display: flex;
          flex-direction: column;
          gap: 2rem;
        }

        /* ── Header ── */
        .sav-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          border-bottom: 1px solid var(--sav-border);
          padding-bottom: 1.5rem;
        }

        .sav-title-group {
          display: flex;
          align-items: center;
          gap: 0.75rem;
        }

        .sav-title {
          font-size: 2rem;
          font-weight: 700;
          color: #1c1a17;
          letter-spacing: -0.01em;
        }

        .sav-count-badge {
          background: rgba(201, 168, 76, 0.15);
          color: var(--sav-gold);
          font-size: 0.85rem;
          font-weight: 700;
          padding: 0.25rem 0.75rem;
          border-radius: 999px;
        }

        /* ── List ── */
        .sav-list {
          display: flex;
          flex-direction: column;
          gap: 1.2rem;
        }

        /* ── States & CTA ── */
        .sav-state {
          text-align: center;
          padding: 6rem 2rem;
          color: var(--sav-muted);
          font-size: 1rem;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 1.25rem;
          background: #ffffff;
          border: 1px solid var(--sav-border);
          border-radius: var(--sav-radius);
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.02);
        }

        .sav-state-icon {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 80px;
          height: 80px;
          border-radius: 50%;
          background: #fbfbfa;
          border: 1px dashed var(--sav-border);
          margin-bottom: 0.5rem;
          color: var(--sav-gold);
        }

        .sav-state-title {
          font-size: 1.25rem;
          font-weight: 700;
          color: var(--sav-text);
        }

        .sav-state-desc {
          font-size: 0.9rem;
          max-width: 400px;
          line-height: 1.5;
          margin-bottom: 0.5rem;
        }

        .sav-cta-btn {
          background: var(--sav-gold);
          color: #ffffff;
          border: none;
          border-radius: 8px;
          padding: 0.75rem 2rem;
          font-size: 0.95rem;
          font-weight: 600;
          cursor: pointer;
          font-family: inherit;
          text-decoration: none;
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          transition: all 0.2s ease;
          box-shadow: 0 4px 12px rgba(201, 168, 76, 0.25);
        }

        .sav-cta-btn:hover {
          opacity: 0.92;
          transform: translateY(-1px);
          box-shadow: 0 6px 18px rgba(201, 168, 76, 0.35);
        }

        .sav-cta-btn:active {
          transform: translateY(0);
        }

        /* ── Skeletons ── */
        .sav-skeleton {
          background: #ffffff;
          border: 1px solid var(--sav-border);
          border-radius: var(--sav-radius);
          padding: 1.5rem;
          display: flex;
          flex-direction: column;
          gap: 0.85rem;
        }

        .sav-skel-line {
          border-radius: 6px;
          background: linear-gradient(90deg, #eae8e4 25%, #f2f0ec 50%, #eae8e4 75%);
          background-size: 200% 100%;
          animation: sav-shimmer 1.5s infinite;
        }

        @keyframes sav-shimmer {
          0%   { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }

        @media (max-width: 768px) {
          .sav-page {
            padding: 2rem 1rem;
          }
          .sav-header {
            flex-direction: column;
            align-items: flex-start;
            gap: 1rem;
          }
        }
      `}</style>

      <div className="sav-page">
        <div className="sav-container">
          
          {/* Header */}
          <div className="sav-header">
            <div className="sav-title-group">
              <h1 className="sav-title">Saved Talent</h1>
              {!savedLoading && !savedError && savedPagination.totalCount > 0 && (
                <span className="sav-count-badge">
                  {savedPagination.totalCount} {savedPagination.totalCount === 1 ? 'Freelancer' : 'Freelancers'}
                </span>
              )}
            </div>
            {savedTalents.length > 0 && (
              <button 
                onClick={() => navigate("/client/search-talent")}
                style={{
                  background: "transparent",
                  border: `1px solid var(--sav-border)`,
                  color: "var(--sav-text)",
                  borderRadius: "8px",
                  padding: "0.5rem 1.25rem",
                  fontSize: "0.875rem",
                  fontWeight: 600,
                  cursor: "pointer",
                  fontFamily: "inherit",
                  transition: "background 0.15s"
                }}
                onMouseEnter={(e) => e.target.style.background = "#f5f5f3"}
                onMouseLeave={(e) => e.target.style.background = "transparent"}
              >
                Find More Freelancers
              </button>
            )}
          </div>

          {/* List of saved talent */}
          <div className="sav-list">
            
            {/* Loading skeletons */}
            {savedLoading && savedTalents.length === 0 && [1, 2].map((i) => (
              <div key={i} className="sav-skeleton">
                <div className="sav-skel-line" style={{ height: 20, width: "30%" }} />
                <div className="sav-skel-line" style={{ height: 14, width: "60%" }} />
                <div className="sav-skel-line" style={{ height: 14, width: "45%" }} />
                <div className="sav-skel-line" style={{ height: 50 }} />
                <div className="sav-skel-line" style={{ height: 14, width: "70%" }} />
              </div>
            ))}

            {/* Error state */}
            {!savedLoading && savedError && (
              <div className="sav-state">
                <div className="sav-state-icon" style={{ color: "#d32f2f", borderColor: "#ffcdd2" }}>
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="12" cy="12" r="10" />
                    <line x1="12" y1="8" x2="12" y2="12" />
                    <line x1="12" y1="16" x2="12.01" y2="16" />
                  </svg>
                </div>
                <h3 className="sav-state-title">Failed to Load Saved Talent</h3>
                <p className="sav-state-desc">{savedError}</p>
                <button className="sav-cta-btn" onClick={() => dispatch(fetchSavedTalents({ page: 1, pageSize: 10 }))}>
                  Try Again
                </button>
              </div>
            )}

            {/* Empty state (No saved talent yet) */}
            {!savedLoading && !savedError && transformedTalents.length === 0 && (
              <div className="sav-state">
                <div className="sav-state-icon">
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
                  </svg>
                </div>
                <h3 className="sav-state-title">No Saved Freelancers Yet</h3>
                <p className="sav-state-desc">
                  Keep track of freelancers you're interested in by clicking the bookmark icon on their profiles or search cards.
                </p>
                <button className="sav-cta-btn" onClick={() => navigate("/client/search-talent")}>
                  Browse Talent
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="5" y1="12" x2="19" y2="12" />
                    <polyline points="12 5 19 12 12 19" />
                  </svg>
                </button>
              </div>
            )}

            {/* Cards rendering */}
            {transformedTalents.map((talent) => (
              <TalentCard
                key={talent.id}
                talent={talent}
                onInvite={handleInvite}
                onBookmark={handleBookmark}
              />
            ))}

            {/* Load More Pagination */}
            {!savedLoading && !savedError && transformedTalents.length > 0 && savedPagination.hasNextPage && (
              <div style={{ textAlign: "center", marginTop: "2rem" }}>
                <button
                  onClick={handleLoadMore}
                  style={{
                    background: "var(--sav-gold)",
                    color: "#fff",
                    border: "none",
                    borderRadius: "8px",
                    padding: "0.75rem 2.5rem",
                    fontSize: "0.95rem",
                    fontWeight: 600,
                    cursor: "pointer",
                    fontFamily: "inherit",
                    boxShadow: "0 4px 12px rgba(201, 168, 76, 0.2)",
                    transition: "opacity 0.15s",
                  }}
                  onMouseEnter={(e) => e.target.style.opacity = "0.9"}
                  onMouseLeave={(e) => e.target.style.opacity = "1"}
                >
                  Load More
                </button>
              </div>
            )}

          </div>

        </div>
      </div>
    </>
  );
}
