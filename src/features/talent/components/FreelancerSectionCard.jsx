/**
 * Reusable section card wrapper for freelancer profile pages.
 */
export default function FreelancerSectionCard({
  title,
  icon,
  children,
  className = "",
  empty = false,
  emptyMessage = "No information available yet.",
}) {
  return (
    <section className={`fd-section-card ${className}`.trim()}>
      <header className="fd-section-header">
        {icon ? (
          <span className="fd-section-icon" aria-hidden="true">
            {icon}
          </span>
        ) : null}
        <h3 className="fd-section-title">{title}</h3>
      </header>

      <div className="fd-section-body">
        {empty ? <p className="fd-empty">{emptyMessage}</p> : children}
      </div>
    </section>
  );
}
