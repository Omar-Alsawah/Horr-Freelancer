import { Star } from "lucide-react";
import FreelancerSectionCard from "./FreelancerSectionCard";

export default function FreelancerReviewsCard({ reviews = [] }) {
  if (!reviews.length) return null;

  return (
    <FreelancerSectionCard
      title="Ratings & Reviews"
      icon={<Star size={16} strokeWidth={2} />}
    >
      <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
        {reviews.map((review) => (
          <div
            key={review.id}
            style={{
              borderBottom: "1px solid var(--fd-border)",
              paddingBottom: "1.25rem",
            }}
            className="last:border-0 last:pb-0"
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "flex-start",
                flexWrap: "wrap",
                gap: "0.5rem",
              }}
            >
              <div>
                <h4
                  style={{
                    margin: 0,
                    fontWeight: 700,
                    fontSize: "0.95rem",
                    color: "var(--fd-text)",
                  }}
                >
                  {review.clientName}
                </h4>
                <p
                  style={{
                    margin: "0.15rem 0 0 0",
                    fontSize: "0.75rem",
                    color: "var(--fd-text-muted)",
                  }}
                >
                  {review.projectTitle} •{" "}
                  {new Date(review.createdAt).toLocaleDateString()}
                </p>
              </div>
              <div style={{ display: "flex", gap: "2px" }}>
                {[1, 2, 3, 4, 5].map((i) => (
                  <Star
                    key={i}
                    size={14}
                    style={{
                      color: i <= review.rating ? "var(--fd-gold)" : "#e2e8f0",
                      fill: i <= review.rating ? "var(--fd-gold)" : "none",
                    }}
                  />
                ))}
              </div>
            </div>
            {review.comment && (
              <p
                style={{
                  margin: "0.75rem 0 0 0",
                  fontSize: "0.875rem",
                  color: "#4b5563",
                  fontStyle: "italic",
                  lineHeight: "1.5",
                }}
              >
                "{review.comment}"
              </p>
            )}
          </div>
        ))}
      </div>
    </FreelancerSectionCard>
  );
}
