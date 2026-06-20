/**
 * StepCategory — Step 1
 * Props: jobData, patch, categories, subCategories
 *
 * - categories and subCategories come from the BE via PostJob.jsx
 * TODO: categories fetched from GET /api/categories
 */
export default function StepCategory({ jobData, patch, categories }) {
  return (
    <>
      <p className="pj-step-indicator">Step 1 / 6 — Job Post</p>
      <h1 className="pj-step-title">Let's start by defining your job category.</h1>
      <p className="pj-step-desc">This helps us match you with the right talent.</p>
      
      <div className="pj-form-card">
        <div className="pj-select-wrap">
          <label className="pj-label" htmlFor="pj-title">Write a title for your job post</label>
          <input
            id="pj-title"
            type="text"
            className="pj-skills-input"
            style={{ paddingLeft: '1rem' }}
            placeholder="Example: React Developer for E-commerce site"
            value={jobData.title}
            onChange={(e) => patch({ title: e.target.value })}
          />
        </div>
        <div className="pj-select-wrap">
          <label className="pj-label" htmlFor="pj-category">Category</label>
          <select
            id="pj-category"
            className="pj-select"
            value={jobData.categoryId}
            onChange={(e) => {
              const opt = e.target.options[e.target.selectedIndex];
              patch({
                categoryId: e.target.value,
                categoryName: opt.text,
              });
            }}
          >
            <option value="" disabled>Select a category</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </div>
      </div>
    </>
  );
}
