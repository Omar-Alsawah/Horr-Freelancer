import { FileText } from "lucide-react";
import FreelancerSectionCard from "./FreelancerSectionCard";

export default function FreelancerMainInfoCard({ freelancer }) {
  const hasBio = Boolean(freelancer.bio?.trim());

  return (
    <FreelancerSectionCard
      title="About"
      icon={<FileText size={16} strokeWidth={2} />}
      empty={!hasBio}
      emptyMessage="This freelancer has not added a professional summary yet."
    >
      {hasBio ? <p className="fd-bio">{freelancer.bio}</p> : null}
    </FreelancerSectionCard>
  );
}
