import { Briefcase } from "lucide-react";
import FreelancerSectionCard from "./FreelancerSectionCard";

export default function FreelancerEmploymentCard({
  employmentHistory = [],
  formatExperience,
}) {
  if (!employmentHistory.length) return null;

  return (
    <FreelancerSectionCard
      title="Work History"
      icon={<Briefcase size={16} strokeWidth={2} />}
    >
      <ul className="fd-timeline">
        {employmentHistory.map((item, index) => (
          <li className="fd-timeline-item" key={`work-${index}`}>
            <span className="fd-timeline-dot" aria-hidden="true" />
            <p className="fd-timeline-text">{formatExperience(item)}</p>
          </li>
        ))}
      </ul>
    </FreelancerSectionCard>
  );
}
