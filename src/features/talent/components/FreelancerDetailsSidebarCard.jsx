import { ClipboardList } from "lucide-react";
import FreelancerSectionCard from "./FreelancerSectionCard";

function DetailTile({ label, value, highlight = false }) {
  return (
    <div className={`fd-detail-tile ${highlight ? "is-highlight" : ""}`.trim()}>
      <p className="fd-detail-label">{label}</p>
      <p className="fd-detail-value">{value || "Not provided"}</p>
    </div>
  );
}

export default function FreelancerDetailsSidebarCard({ freelancer }) {
  const experienceValue =
    freelancer.yearsOfExperience === null
      ? "Not provided"
      : `${freelancer.yearsOfExperience} years`;

  return (
    <FreelancerSectionCard
      title="Profile Details"
      icon={<ClipboardList size={16} strokeWidth={2} />}
      className="fd-sidebar-card"
    >
      <div className="fd-detail-grid">
        <DetailTile label="Experience" value={experienceValue} />
        <DetailTile label="Level" value={freelancer.experienceLevel} />
        <DetailTile
          label="Verification"
          value={freelancer.isVerified ? "Verified" : "Not verified"}
          highlight={freelancer.isVerified}
        />
        <DetailTile label="Location" value={freelancer.locationLabel} />
      </div>
    </FreelancerSectionCard>
  );
}
