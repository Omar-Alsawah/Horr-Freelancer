export default function StepDescription({ jobData, patch }) {
  return (
    <>
      <p className="pj-step-indicator">Step 5 / 6 — Job Post</p>
      <h1 className="pj-step-title">Start the conversation.</h1>

      <div className="pj-form-card">
        <div className="pj-desc-grid">

          {/* Tips */}
          <div className="pj-desc-tips">
            <h4>Talent are looking for:</h4>
            <ul>
              <li>Clear expectations about your task or deliverables</li>
              <li>The skills required for your work</li>
              <li>Good communication</li>
              <li>Details about how you or your team like to work</li>
            </ul>
          </div>

          {/* Input */}
          <div>
            <label className="pj-label" htmlFor="pj-desc">Describe what you need</label>
            <textarea
              id="pj-desc"
              className="pj-textarea"
              rows={10}
              placeholder="Already have a description? Paste it here!"
              value={jobData.description}
              onChange={(e) => patch({ description: e.target.value })}
            />
          </div>

        </div>
      </div>
    </>
  );
}
