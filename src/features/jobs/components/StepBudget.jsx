/**
 * StepBudget — Step 4
 * Props: jobData, patch
 *
 * Currently fixed price only.
 * TODO: extend when hourly rate option is added from BE.
 */
export default function StepBudget({ jobData, patch }) {
  return (
    <>
      <p className="pj-step-indicator">Step 4 / 6 — Job Post</p>
      <h1 className="pj-step-title">Tell us about your budget.</h1>
      <p className="pj-step-desc">This will help us match you to talent within your range.</p>

      <div className="pj-form-card">
        {/* Fixed price selector */}
        <div className="pj-budget-card">
          <div className="pj-budget-card-left">
            <div className="pj-budget-icon">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z" />
                <line x1="7" y1="7" x2="7.01" y2="7" />
              </svg>
            </div>
            <div>
              <h4 style={{ margin: 0, fontSize: "0.95rem" }}>Fixed price</h4>
              <p style={{ margin: 0, fontSize: "0.82rem", color: "var(--pj-muted)" }}>Set a price for the project</p>
            </div>
          </div>
          <div className="pj-budget-radio">
            <div className="pj-budget-radio-inner" />
          </div>
        </div>

        {/* Amount input */}
        <div>
          <label className="pj-label">What is the best cost estimate for your project?</label>
          <span className="pj-sublabel">You can negotiate this cost and create milestones later.</span>
          <div className="pj-price-group">
            <input
              type="number"
              className="pj-price-input"
              placeholder="0.00"
              min="0"
              value={jobData.budgetAmount}
              onChange={(e) => patch({ budgetAmount: e.target.value })}
            />
            <span className="pj-price-currency">USD</span>
          </div>
        </div>
      </div>
    </>
  );
}
