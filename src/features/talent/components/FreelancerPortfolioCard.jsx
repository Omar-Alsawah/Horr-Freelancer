import { LayoutGrid } from "lucide-react";
import FreelancerSectionCard from "./FreelancerSectionCard";

export default function FreelancerPortfolioCard({ portfolio = [] }) {
  if (!portfolio.length) return null;

  return (
    <FreelancerSectionCard
      title="Portfolio"
      icon={<LayoutGrid size={16} strokeWidth={2} />}
    >
      <div className="fd-portfolio-grid">
        {portfolio.map((item, index) => {
          const label =
            typeof item === "string"
              ? item
              : item.title || item.name || `Project ${index + 1}`;

          return (
            <article className="fd-portfolio-item" key={`${label}-${index}`}>
              <div className="fd-portfolio-thumb" aria-hidden="true">
                <span>{String(index + 1).padStart(2, "0")}</span>
              </div>
              <p className="fd-portfolio-label">{label}</p>
            </article>
          );
        })}
      </div>
    </FreelancerSectionCard>
  );
}
