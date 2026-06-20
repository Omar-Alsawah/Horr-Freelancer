/**
 * WizardShell
 * Outer layout wrapper for the PostJob wizard.
 * No Navbar — PostJob is a distraction-free focused flow.
 *
 * Props:
 * - step       {number}    current step 1–6
 * - onNext     {function}
 * - onBack     {function}
 * - error      {string|null}
 * - submitting {boolean}
 * - nextLabel  {string}
 * - children   {ReactNode}
 */

const STEP_LABELS = {
  1: "Category",
  2: "Skills",
  3: "Scope",
  4: "Budget",
  5: "Description",
  6: "Review",
};

function StepBar({ current }) {
  return (
    <div className="pj-stepbar">
      {[1, 2, 3, 4, 5, 6].map((n) => (
        <div
          key={n}
          className={`pj-stepbar-item ${current >= n ? "done" : ""} ${current === n ? "active" : ""}`}
        >
          <div className="pj-stepbar-dot">{current > n ? "✓" : n}</div>
          <span className="pj-stepbar-label">{STEP_LABELS[n]}</span>
          {n < 6 && <div className="pj-stepbar-line" />}
        </div>
      ))}
    </div>
  );
}

export default function WizardShell({ step, onNext, onBack, error, submitting, nextLabel, children }) {
  return (
    <div className="pj-container">
      <StepBar current={step} />
      {children}
      {error && <div className="pj-error">⚠ {error}</div>}
      <div className="pj-wizard-footer">
        <button
          className="pj-btn-back"
          onClick={onBack}
          style={{ visibility: step === 1 ? "hidden" : "visible" }}
        >
          Back
        </button>
        <button className="pj-btn-next" onClick={onNext} disabled={submitting}>
          {submitting ? "Posting…" : nextLabel}
        </button>
      </div>
    </div>
  );
}
