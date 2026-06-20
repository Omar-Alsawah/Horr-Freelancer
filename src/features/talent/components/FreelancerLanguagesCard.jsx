import { Languages } from "lucide-react";
import FreelancerSectionCard from "./FreelancerSectionCard";

export default function FreelancerLanguagesCard({ languages = [], formatLanguage }) {
  if (!languages.length) return null;

  return (
    <FreelancerSectionCard
      title="Languages"
      icon={<Languages size={16} strokeWidth={2} />}
    >
      <ul className="fd-chip-list">
        {languages.map((item, index) => (
          <li className="fd-chip-item" key={`lang-${index}`}>
            {formatLanguage(item)}
          </li>
        ))}
      </ul>
    </FreelancerSectionCard>
  );
}
