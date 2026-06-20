export default function FreelancerDetailsSkeleton() {
  return (
    <div className="fd-page">
      <div className="fd-shell">
        <div className="fd-skeleton fd-skeleton-breadcrumb" />
        <div className="fd-skeleton fd-skeleton-header" />
        <div className="fd-grid">
          <div className="fd-column-left">
            <div className="fd-skeleton fd-skeleton-card" />
          </div>
          <div className="fd-column-right">
            <div className="fd-skeleton fd-skeleton-card" />
            <div className="fd-skeleton fd-skeleton-card" />
            <div className="fd-skeleton fd-skeleton-card" />
          </div>
        </div>
      </div>
    </div>
  );
}
