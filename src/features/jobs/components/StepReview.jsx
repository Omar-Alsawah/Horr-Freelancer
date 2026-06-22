/**
 * StepReview — Step 6
 * Props: jobData
 *
 * Read-only summary of everything the client filled in.
 * No BE call needed — assembled from local state.
 */


function capitalize(str) {
  if (!str) return "";
  return str.charAt(0).toUpperCase() + str.slice(1);
}

export default function StepReview({ jobData, preferredCurrency = "USD" }) {
  return (
    <>
      <p className="pj-step-indicator">Review Job Post</p>
      <h1 className="pj-step-title">
        {jobData.title || "Review your job post"}
      </h1>

      <div className="pj-form-card">
        <div className="pj-review-row">
          <p className="pj-review-label">Job Title</p>
          <p className="pj-review-value">{jobData.title || "—"}</p>
        </div>

        <div className="pj-review-row">
          <p className="pj-review-label">Job Category</p>
          <p className="pj-review-value">
            {jobData.categoryName || "—"}
          </p>
        </div>

        <div className="pj-review-row">
          <p className="pj-review-label">Job Description</p>
          <p className="pj-review-value">{jobData.description || "No description provided."}</p>
        </div>

        <div className="pj-review-row">
          <p className="pj-review-label">Required Skills</p>
          <p className="pj-review-value">{jobData.skillNames.join(", ") || "No skills selected"}</p>
        </div>

        <div className="pj-review-grid">
          <div>
            <p className="pj-review-label">Project Scale</p>
            <p className="pj-review-value">{capitalize(jobData.scopeSize)}</p>
          </div>

          <div>
            <p className="pj-review-label">Experience Level</p>
            <p className="pj-review-value">{jobData.experience.map(capitalize).join(", ") || "Not specified"}</p>
          </div>
          <div>
            <p className="pj-review-label">Budget</p>
            <p className="pj-review-value">
              {jobData.budgetAmount ? `${jobData.budgetAmount} ${preferredCurrency} (Fixed Price)` : "Not specified"}
            </p>
          </div>
        </div>

      </div>
    </>
  );
}
