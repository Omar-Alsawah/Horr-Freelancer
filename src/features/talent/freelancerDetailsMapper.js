export function getInitials(fullName = "") {
  const parts = String(fullName).trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
}

function toTitleCase(value = "") {
  return String(value)
    .split(/[_\s-]+/)
    .filter(Boolean)
    .map((part) => part[0].toUpperCase() + part.slice(1).toLowerCase())
    .join(" ");
}

const EXPERIENCE_LEVELS = {
  0: "Entry Level",
  1: "Intermediate",
  2: "Expert",
};

function mapSkills(skills = []) {
  return skills.map((skill) => {
    if (typeof skill === "string") {
      return { name: skill, level: "" };
    }
    return {
      name: skill.skillName || skill.name || "Skill",
      level: skill.proficiencyLevel || skill.level || "",
    };
  });
}

/**
 * Maps public profile API payload to UI model.
 * @param {Object} profile - API `data` object
 * @param {{ id?: string, isSaved?: boolean }} meta
 */
export function mapFreelancerDetails(profile = {}, meta = {}) {
  const locationParts = [profile.city, profile.country].filter(Boolean);

  return {
    id: meta.id || "",
    fullName: profile.fullName || "Unknown Freelancer",
    initials: getInitials(profile.fullName),
    title: profile.title || "Freelancer",
    bio: profile.bio || "",
    avatarUrl: profile.profilePicturePath || "",   
    isVerified: Boolean(profile.isVerified),
    isSaved: Boolean(meta.isSaved),
    trustScore: Number(profile.trustScore ?? 0),
    averageRating: Number(profile.averageRating ?? 0),
    totalReviews: Number(profile.totalReviews ?? 0),
    jobSuccessPercentage: Number(profile.jobSuccessPercentage ?? 100),
    reviews: Array.isArray(profile.reviews) ? profile.reviews : [],
    experienceLevel:
      EXPERIENCE_LEVELS[profile.experienceLevel] ||
      (profile.experienceLevel != null ? String(profile.experienceLevel) : ""),
    yearsOfExperience:
      profile.yearsOfExperience === null ||
      profile.yearsOfExperience === undefined
        ? null
        : Number(profile.yearsOfExperience),
    totalEarnings: profile.totalEarnings ?? "0",
    totalJobs: Number(profile.totalJobs ?? 0),
    totalHours: Number(profile.totalHours ?? 0),
    locationLabel: locationParts.join(", "),
    portfolio: Array.isArray(profile.portfolio) ? profile.portfolio : [],
    skills: mapSkills(profile.skills || []),
    languages: Array.isArray(profile.languages) ? profile.languages : [],
    education: Array.isArray(profile.education) ? profile.education : [],
    employmentHistory: Array.isArray(profile.employmentHistory)
      ? profile.employmentHistory
      : [],
    formatLanguage(language) {
      if (typeof language === "string") return language;
      const name = language.name || language.languageName || "Language";
      const level = language.level || language.proficiency || "";
      return level ? `${name}: ${toTitleCase(level)}` : name;
    },
    formatEducation(education) {
      if (typeof education === "string") return education;
      const degree = education.degree || education.title || "Education";
      const school = education.school || education.institution || "";
      const field = education.fieldOfStudy || "";
      const year = education.year || education.graduationYear || "";
      const details = [school, field, year].filter(Boolean).join(", ");
      return details ? `${degree} - ${details}` : degree;
    },
    formatExperience(experience) {
      if (typeof experience === "string") return experience;
      const title = experience.title || experience.position || "Experience";
      const company = experience.company || experience.organization || "";
      const from = experience.fromDate || experience.startDate || experience.from || "";
      const to = experience.toDate || experience.endDate || experience.to || "Present";
      const period = from ? `${from} - ${to}` : "";
      const suffix = [company, period].filter(Boolean).join(" | ");
      return suffix ? `${title} - ${suffix}` : title;
    },
  };
}
