import { Sparkles } from "lucide-react";
import FreelancerSectionCard from "./FreelancerSectionCard";

function skillLevelClass(level = "") {
  const normalized = level.toLowerCase();
  if (normalized.includes("exp") || normalized.includes("advanced")) return "level-expert";
  if (normalized.includes("int")) return "level-intermediate";
  if (normalized.includes("beg")) return "level-beginner";
  return "level-default";
}

export default function FreelancerSkillsCard({ skills }) {
  return (
    <FreelancerSectionCard
      title="Skills"
      icon={<Sparkles size={16} strokeWidth={2} />}
      empty={skills.length === 0}
      emptyMessage="No skills were added yet."
    >
      {skills.length > 0 ? (
        <div className="fd-skills-wrap">
          {skills.map((skill, index) => (
            <span
              className={`fd-skill-pill ${skillLevelClass(skill.level)}`}
              key={`${skill.name}-${index}`}
            >
              <span className="fd-skill-name">{skill.name}</span>
              {skill.level ? (
                <span className="fd-skill-level">{skill.level}</span>
              ) : null}
            </span>
          ))}
        </div>
      ) : null}
    </FreelancerSectionCard>
  );
}
