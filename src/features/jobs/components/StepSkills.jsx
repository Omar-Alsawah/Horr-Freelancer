/**
 * StepSkills — Step 2
 * Props: jobData, suggestedSkills, skillInput, setSkillInput, handleSkillKey, addSkill, removeSkill
 *
 * TODO: suggestedSkills fetched from GET /api/skills/suggested?sub={subCategoryValue}
 */

function SkillTag({ id, name, onRemove }) {
  return (
    <div className="pj-skill-tag">
      {name}
      <button onClick={() => onRemove(id)} aria-label={`Remove ${name}`}>×</button>
    </div>
  );
}

export default function StepSkills({
  jobData,
  suggestedSkills,
  skillInput,
  setSkillInput,
  handleSkillKey,
  addSkill,
  removeSkill,
}) {
  return (
    <>
      <p className="pj-step-indicator">Step 2 / 6 — Job Post</p>
      <h1 className="pj-step-title">What are the main skills required for your work?</h1>

      <div className="pj-form-card">
        <label className="pj-label">Search skills</label>

        <div className="pj-skills-search-wrap">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <input
            type="text"
            className="pj-skills-input"
            placeholder="Search skills or add your own"
            value={skillInput}
            onChange={(e) => setSkillInput(e.target.value)}
            onKeyDown={handleSkillKey}
          />
        </div>

        <div className="pj-skills-tags">
          {jobData.skills.map((id, idx) => (
            <SkillTag key={id} id={id} name={jobData.skillNames[idx]} onRemove={removeSkill} />
          ))}
        </div>

        {suggestedSkills.length > 0 && (
          <div>
            <label className="pj-label" style={{ fontSize: "0.85rem" }}>
              Popular skills for {jobData.subCategoryName || "this category"}
            </label>
            <div className="pj-pill-group">
              {suggestedSkills.map((s) => (
                <div
                  key={s.id}
                  className={`pj-pill ${jobData.skills.includes(s.id) ? "selected" : ""}`}
                  onClick={() => jobData.skills.includes(s.id) ? removeSkill(s.id) : addSkill(s)}
                >
                  {s.name}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </>
  );
}
