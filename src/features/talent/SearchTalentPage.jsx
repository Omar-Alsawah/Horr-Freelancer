import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import TalentSearchBar from "./components/TalentSearchBar";
import TalentCard from "./components/TalentCard";
import { fetchTalents, setPage, toggleSaveFreelancer } from "./talentSlice";

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
 * Utility: Transform API talent response to component props
 */
function transformTalent(apiTalent) {
  const initials = getInitials(apiTalent.fullName);
  const avatarColor = getAvatarColor(apiTalent.fullName);

  return {
    id: apiTalent.id,
    initials,
    avatarColor,
    avatarUrl: apiTalent.profilePicturePath || null,
    name: apiTalent.fullName,
    isVerified: apiTalent.isVerified || false,
    isSaved: apiTalent.isSaved || false,
    badge: null, // TODO: Determine badge logic if needed
    title: apiTalent.title || "Freelancer",
    jobSuccess: apiTalent.jobSuccessPercentage ?? 100,
    earned: null, // Not provided in API, removed per requirements
    rating: apiTalent.averageRating || 0,
    ratingCount: apiTalent.totalReviews || 0,
    hourlyRate: apiTalent.hourlyRate || 0,
    bio: apiTalent.bio || "",
    skills: (apiTalent.skills || []).map((skill) => ({
      name: skill.skillName,
      level: mapProficiencyLevel(skill.proficiencyLevel),
    })),
    availability: apiTalent.availability || "Not specified",
    isOnline: false, // Not provided in API
    profileUrl: `/client/freelancer/${apiTalent.id}`,
  };
}

/**
 * SearchTalentPage
 * Main page for browsing and searching freelancers.
 * Connected to Redux for state management and API integration.
 */
export default function SearchTalentPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { talents, loading, error, pagination } = useSelector(
    (state) => state.talent
  );

  const [search, setSearch] = useState("");

  // Fetch talents on component mount
  useEffect(() => {
    dispatch(fetchTalents({ page: 1, pageSize: 10 }));
  }, [dispatch]);

  const handleFilter = () => {
    // TODO: Open filter sidebar or modal
    console.log("Filter clicked");
  };

  const handleLoadMore = () => {
    const nextPage = pagination.page + 1;
    dispatch(setPage(nextPage));
    dispatch(fetchTalents({ page: nextPage, pageSize: pagination.pageSize }));
  };

  const handleInvite = (talentId) => {
    navigate(`/client/freelancer/${talentId}?invite=true`);
  };

  const handleBookmark = (talentId, isSaved) => {
    dispatch(toggleSaveFreelancer({ freelancerId: talentId, isSaved }));
  };

  const transformedTalents = talents.map(transformTalent);

    return (
        <>
            <style>{`
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        :root {
          --st-gold:    #C9A84C;
          --st-bg:      #f9f9f7;
          --st-border:  #e6e4df;
          --st-muted:   #999;
          --st-text:    #1c1a17;
          --st-radius:  12px;
        }

        .st-page {
          min-height: 100vh;
          background: var(--st-bg);
          font-family: 'DM Sans', system-ui, sans-serif;
          color: var(--st-text);
        }

        /* ── Hero ── */
        .st-hero {
          position: relative;
          max-width: 1000px;
          margin: 0 auto;
          padding: 4rem 2rem 2rem;
          text-align: center;
        }

        .st-hero-title {
          font-size: 2.8rem;
          font-weight: 700;
          letter-spacing: -0.02em;
          line-height: 1.15;
          margin-bottom: 0.8rem;
          color: #000;
        }

        .st-hero-sub {
          font-size: 1rem;
          color: var(--st-muted);
          max-width: 600px;
          line-height: 1.6;
          margin: 0 auto 2.2rem;
        }

        /* ── Cards list ── */
        .st-list {
          max-width: 1000px;
          margin: 0 auto;
          padding: 2rem 2rem 5rem;
          display: flex;
          flex-direction: column;
          gap: 1.2rem;
        }

        /* ── Empty / Loading states ── */
        .st-state {
          text-align: center;
          padding: 5rem 2rem;
          color: var(--st-muted);
          font-size: 1rem;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 1rem;
        }
        .st-state svg { opacity: 0.3; width: 56px; height: 56px; }

        /* ── Skeleton card ── */
        .st-skeleton {
          background: #ffffff;
          border: 1px solid var(--st-border);
          border-radius: var(--st-radius);
          padding: 1.5rem;
          display: flex;
          flex-direction: column;
          gap: 0.85rem;
        }
        .st-skel-line {
          border-radius: 6px;
          background: linear-gradient(90deg, #eae8e4 25%, #f2f0ec 50%, #eae8e4 75%);
          background-size: 200% 100%;
          animation: st-shimmer 1.5s infinite;
        }
        @keyframes st-shimmer {
          0%   { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }

        @media (max-width: 520px) {
          .st-hero, .st-list { padding-left: 1rem; padding-right: 1rem; }
        }
      `}</style>

            <div className="st-page">

                {/* Hero */}
                <div className="st-hero">
                    <h1 className="st-hero-title">Find Your Perfect Talent</h1>
                    <p className="st-hero-sub">
                        Connect with top-rated freelancers and agencies for your next project.
                    </p>

                    <TalentSearchBar
                        value={search}
                        onChange={setSearch}
                        onFilter={handleFilter}
                    />
                </div>

                {/* Cards */}
                <div className="st-list">

                    {/* Loading skeletons */}
                    {loading && [1, 2, 3].map((i) => (
                        <div key={i} className="st-skeleton">
                            <div className="st-skel-line" style={{ height: 20, width: "40%" }} />
                            <div className="st-skel-line" style={{ height: 14, width: "70%" }} />
                            <div className="st-skel-line" style={{ height: 14, width: "55%" }} />
                            <div className="st-skel-line" style={{ height: 60 }} />
                            <div className="st-skel-line" style={{ height: 14, width: "80%" }} />
                            <div className="st-skel-line" style={{ height: 14, width: "60%" }} />
                        </div>
                    ))}

                    {/* Empty state */}
                    {!loading && transformedTalents.length === 0 && (
                        <div className="st-state">
                            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#9a9590" strokeWidth="1.5">
                                <circle cx="11" cy="11" r="8" />
                                <line x1="21" y1="21" x2="16.65" y2="16.65" />
                            </svg>
                            <span>{error ? `Error: ${error}` : "No talent found. Try adjusting your search criteria."}</span>
                        </div>
                    )}

                    {/* Talent cards */}
                    {!loading && transformedTalents.map((talent) => (
                        <TalentCard
                            key={talent.id}
                            talent={talent}
                            onInvite={handleInvite}
                            onBookmark={handleBookmark}
                        />
                    ))}

                    {/* Load More button */}
                    {!loading && transformedTalents.length > 0 && pagination.hasNextPage && (
                        <div style={{ textAlign: "center", marginTop: "2rem", paddingBottom: "2rem" }}>
                            <button
                                onClick={handleLoadMore}
                                style={{
                                    background: "#C9A84C",
                                    color: "#fff",
                                    border: "none",
                                    borderRadius: "8px",
                                    padding: "0.75rem 2rem",
                                    fontSize: "0.95rem",
                                    fontWeight: 600,
                                    cursor: "pointer",
                                    fontFamily: "'DM Sans', system-ui, sans-serif",
                                    transition: "opacity 0.15s",
                                }}
                                onMouseEnter={(e) => e.target.style.opacity = "0.88"}
                                onMouseLeave={(e) => e.target.style.opacity = "1"}
                            >
                                Load More Talents
                            </button>
                        </div>
                    )}

                </div>
            </div>
        </>
    );
}