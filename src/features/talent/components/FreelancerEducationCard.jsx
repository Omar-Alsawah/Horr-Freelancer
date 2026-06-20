import { GraduationCap } from "lucide-react";
import FreelancerSectionCard from "./FreelancerSectionCard";

export default function FreelancerEducationCard({ education = [], formatEducation }) {
  if (!education.length) return null;

  return (
    <FreelancerSectionCard
      title="Education"
      icon={<GraduationCap size={16} strokeWidth={2} />}
    >
      <ul className="fd-timeline">
        {education.map((item, index) => (
          <li className="fd-timeline-item" key={`edu-${index}`}>
            <span className="fd-timeline-dot" aria-hidden="true" />
            <p className="fd-timeline-text">{formatEducation(item)}</p>
          </li>
        ))}
      </ul>
    </FreelancerSectionCard>
  );
}
