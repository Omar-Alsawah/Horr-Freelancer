import { Heart, Star } from "lucide-react";

export default function FreelancerHeaderCard({
  freelancer,
  onToggleSave,
  onInvite,
}) {
  const stats = [
    { value: `${freelancer.jobSuccessPercentage ?? 100}%`, label: "Job Success" },
    { value: freelancer.totalEarnings, label: "Total Earnings" },
    { value: String(freelancer.totalJobs), label: "Jobs Completed" },
    { value: String(freelancer.totalHours), label: "Hours Worked" },
  ];

  return (
    <section className="fd-hero-card">
      <div className="fd-hero-accent" aria-hidden="true" />

      <div className="fd-hero-main">
        <div className="fd-avatar-wrap">
          {freelancer.avatarUrl ? (
            <img
              src={freelancer.avatarUrl}
              alt={freelancer.fullName}
              className="fd-avatar"
            />
          ) : (
            <div className="fd-avatar fd-avatar-fallback">
              {freelancer.initials}
            </div>
          )}
          {freelancer.isVerified ? (
            <span className="fd-status-dot" title="Verified" />
          ) : null}
        </div>

        <div className="fd-hero-content">
          <div className="fd-hero-top">
            <div>
              <div className="fd-name-row">
                <h1 className="fd-title">{freelancer.fullName}</h1>
                {freelancer.isVerified ? (
                  <span className="fd-verified-badge">Verified</span>
                ) : null}
              </div>
              <p className="fd-role">{freelancer.title}</p>
              <p className="fd-subtitle">
                {freelancer.locationLabel || "Location not provided"}
              </p>
              {freelancer.totalReviews > 0 ? (
                <div style={{ display: "flex", alignItems: "center", gap: "0.35rem", marginTop: "0.4rem" }}>
                  <div style={{ display: "flex", gap: "2px" }}>
                    {[1, 2, 3, 4, 5].map((i) => (
                      <Star
                        key={i}
                        size={14}
                        style={{
                          color: i <= freelancer.averageRating ? "var(--fd-gold)" : "#e2e8f0",
                          fill: i <= freelancer.averageRating ? "var(--fd-gold)" : (i - 0.5 <= freelancer.averageRating ? "var(--fd-gold)" : "none"),
                          opacity: i - 0.5 <= freelancer.averageRating && i > freelancer.averageRating ? 0.5 : 1
                        }}
                      />
                    ))}
                  </div>
                  <span style={{ fontSize: "0.85rem", fontWeight: 600, color: "var(--fd-text-muted)" }}>
                    {freelancer.averageRating.toFixed(1)} ({freelancer.totalReviews} reviews)
                  </span>
                </div>
              ) : null}
            </div>

            <div className="fd-header-actions">
              <button
                type="button"
                className={`fd-save-btn ${freelancer.isSaved ? "saved" : ""}`}
                onClick={onToggleSave}
                aria-label={
                  freelancer.isSaved ? "Remove from saved" : "Save freelancer"
                }
              >
                <Heart
                  size={16}
                  strokeWidth={2}
                  fill={freelancer.isSaved ? "currentColor" : "none"}
                />
                {freelancer.isSaved ? "Saved" : "Save"}
              </button>
              <button type="button" className="fd-invite-btn" onClick={onInvite}>
                Invite to Job
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="fd-stats-row">
        {stats.map((stat) => (
          <div className="fd-stat-card" key={stat.label}>
            <p className="fd-stat-value">{stat.value}</p>
            <p className="fd-stat-label">{stat.label}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
