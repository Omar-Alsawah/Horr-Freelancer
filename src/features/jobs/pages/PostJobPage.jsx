import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { createJob, getCategories, getSkills } from "../../../services/clientService";

import WizardShell    from "../components/WizardShell";
import StepCategory   from "../components/StepCategory";
import StepSkills     from "../components/StepSkills";
import StepScope      from "../components/StepScope";
import StepBudget     from "../components/StepBudget";
import StepDescription from "../components/StepDescription";
import StepReview     from "../components/StepReview";
import RecommendedFreelancers from "../../talent/components/RecommendedFreelancers";

/**
 * PostJob — Brain of the wizard
 * Owns all state, logic, and API calls.
 *
 * TODO (replace mock functions with real API calls):
 * - fetchCategories()        → GET /api/categories
 * - fetchSuggestedSkills()   → GET /api/skills/suggested?sub={subCategoryValue}
 * - submitJob()              → POST /api/jobs
 */

const TOTAL_STEPS = 6;

const NEXT_LABELS = {
  1: "Next: Skills",
  2: "Next: Scope",
  3: "Next: Budget",
  4: "Next: Description",
  5: "Review Job Post",
  6: "Post this Job",
};

// ── Data Fetching Logic ───────────────────────────────────────────────────

async function fetchCategoriesData() {
  try {
    const response = await getCategories();
    
    // Handle the standard response wrapper { succeeded, data: [...] }
    const data = response?.data || response;
    
    // Handle .NET's $values wrapper or direct array
    const rawList = Array.isArray(data) ? data : (data?.$values || []);
    
    // Normalize casing (Id -> id, Name -> name, SubCategories -> subCategories)
    return rawList.map(c => {
      const subData = c.subCategories || c.SubCategories || [];
      const subList = Array.isArray(subData) ? subData : (subData?.$values || []);
      
      return {
        id: c.id || c.Id,
        name: c.name || c.Name,
        subCategories: subList.map(s => ({
          id: s.id || s.Id,
          name: s.name || s.Name
        }))
      };
    });
  } catch (error) {
    console.error("Error fetching categories:", error);
    return [];
  }
}

async function fetchSkillsData() {
  try {
    const data = await getSkills();
    // Handle .NET's $values wrapper or direct array
    const rawList = Array.isArray(data) ? data : (data?.$values || []);
    
    // Normalize casing (Id -> id, Name -> name)
    return rawList.map(s => ({
      id: s.id || s.Id,
      name: s.name || s.Name
    }));
  } catch (error) {
    console.error("Error fetching skills:", error);
    return [];
  }
}

// ─────────────────────────────────────────────────────────────────────────────

export default function PostJobPage() {
  const navigate = useNavigate();

  const [step,            setStep]            = useState(1);
  const [categories,      setCategories]      = useState([]);
  const [availableSkills, setAvailableSkills] = useState([]);
  const [submitting,      setSubmitting]      = useState(false);
  const [error,           setError]           = useState(null);
  const [skillInput,      setSkillInput]      = useState("");
  const [posted,          setPosted]          = useState(false);

  // All form data — update keys to match BE request body when available
  const [jobData, setJobData] = useState({
    title:            "",
    categoryId:       "",
    categoryName:     "",
    skills:           [], // Store skill IDs
    skillNames:       [], // Store skill names for display
    scopeSize:        "medium",
    duration:         "3-6m",
    experience:       ["intermediate"],
    budgetType:       "fixed",
    budgetAmount:     "",
    description:      "",
    attachment:       null,
    attachmentName:   "",
  });

  const patch = (fields) => setJobData((prev) => ({ ...prev, ...fields }));

  // Fetch categories and all skills on mount
  useEffect(() => {
    fetchCategoriesData().then(setCategories);
    fetchSkillsData().then(setAvailableSkills);
  }, []);

  // Map skills to suggestions (optional: filter by categoryId if backend supports it)
  const suggestedSkills = useMemo(() => {
    if (!jobData.categoryId) {
      return [];
    }
    // For now, just show the first 8 skills
    return availableSkills.slice(0, 8);
  }, [jobData.categoryId, availableSkills]);

  // Skills logic
  const addSkill = (skill) => {
    if (!skill || jobData.skills.includes(skill.id)) return;
    patch({ 
      skills: [...jobData.skills, skill.id],
      skillNames: [...jobData.skillNames, skill.name]
    });
  };
  const removeSkill = (skillId) => {
    const idx = jobData.skills.indexOf(skillId);
    if (idx > -1) {
      const newSkills = [...jobData.skills];
      const newNames = [...jobData.skillNames];
      newSkills.splice(idx, 1);
      newNames.splice(idx, 1);
      patch({ skills: newSkills, skillNames: newNames });
    }
  };

  // Experience multi-select
  const toggleExperience = (val) => {
    const has = jobData.experience.includes(val);
    patch({ experience: has ? jobData.experience.filter((e) => e !== val) : [...jobData.experience, val] });
  };

  // Skills input keyboard handler
  const handleSkillKey = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      // Try to find if input matches an existing skill name
      const found = availableSkills.find(s => s.name.toLowerCase() === skillInput.toLowerCase());
      if (found) {
        addSkill(found);
        setSkillInput("");
      } else if (skillInput.trim()) {
        // If not found, maybe create a new one? (The prompt implies selection from /api/Skills)
        // For now, only allow selection from availableSkills
        toast.info("Please select a skill from the suggested list.");
      }
    }
  };

  // Navigation
  const goNext = async () => {
    if (step === 1 && !jobData.categoryId) {
      setError("Please select a category.");
      return;
    }
    setError(null);

    if (step === TOTAL_STEPS) {
      // Submit to BE
      setSubmitting(true);
      try {
        // Map frontend state to Backend DTO (JobDetailsDto)
        const payload = {
          title: jobData.title,
          categoryId: jobData.categoryId, // Map selected category id
          scope: {
            "small": "Small",
            "medium": "Medium",
            "large": "Large"
          }[jobData.scopeSize] || "Medium",
          experienceLevel: {
            "entry": "EntryLevel",
            "intermediate": "Intermediate",
            "expert": "Expert",
            "any": "Intermediate"
          }[jobData.experience[0]] || "Intermediate",
          budget: parseFloat(jobData.budgetAmount) || 0,
          jobType: jobData.budgetType === "fixed" ? "FixedPrice" : "Hourly",
          skills: jobData.skills, // Send array of id strings
          description: jobData.description,
          milestones: [] 
        };

        await createJob(payload);
        toast.success("Your job post is now live!");
        setPosted(true);
      } catch (e) {
        console.error("Submit Error:", e);
        setError(e.errorCode ? `${e.message} (Code: ${e.errorCode})` : e.message);
      } finally {
        setSubmitting(false);
      }
      return;
    }

    setStep((s) => s + 1);
    window.scrollTo(0, 0);
  };

  const goBack = () => {
    setError(null);
    setStep((s) => Math.max(s - 1, 1));
    window.scrollTo(0, 0);
  };

  // ── Success screen ────────────────────────────────────────────────────
  if (posted) {
    return (
      <>
        <style>{`
          *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

          body {
            background: #f9f9f9;
            color: #1a1a1a;
            font-family: 'DM Sans', system-ui, sans-serif;
            min-height: 100vh;
          }

          .pj-success-wrap { max-width: 820px; margin: 0 auto; padding: 4rem 1.5rem 5rem; text-align: center; }
          .pj-success-icon { width: 64px; height: 64px; border-radius: 50%; background: #f0faf0; display: flex; align-items: center; justify-content: center; margin: 0 auto 1.5rem; }
          .pj-success-title { font-size: 1.6rem; font-weight: 700; color: #1a1a1a; margin-bottom: 0.5rem; }
          .pj-success-sub { color: #888; font-size: 0.95rem; margin-bottom: 3rem; }
          .pj-success-actions { margin-top: 1rem; }
          .pj-btn-dashboard { display: inline-flex; align-items: center; gap: 0.4rem; background: linear-gradient(135deg, #C9A84C, #E5C97A); color: #fff; border: none; padding: 0.7rem 1.6rem; border-radius: 8px; font-family: inherit; font-weight: 600; font-size: 0.9rem; cursor: pointer; transition: opacity 0.15s, transform 0.15s; }
          .pj-btn-dashboard:hover { opacity: 0.9; transform: translateY(-1px); }
        `}</style>

        <div className="pj-success-wrap">
          <div className="pj-success-icon">
            <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="#2e7d32" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="20 6 9 17 4 12" />
            </svg>
          </div>
          <h1 className="pj-success-title">Your job has been posted!</h1>
          <p className="pj-success-sub">
            Here are some freelancers we think would be a great fit.
          </p>

          <div style={{ textAlign: 'left', marginBottom: '2rem' }}>
            <RecommendedFreelancers title="Recommended for this job" />
          </div>

          <div className="pj-success-actions">
            <button className="pj-btn-dashboard" onClick={() => navigate("/client/dashboard")}>
              Go to dashboard
            </button>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <style>{`
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        body {
          background: #f9f9f9;
          color: #1a1a1a;
          font-family: 'DM Sans', system-ui, sans-serif;
          min-height: 100vh;
        }

        :root {
          --pj-gold:    #C9A84C;
          --pj-gold-lt: #E5C97A;
          --pj-surface: #ffffff;
          --pj-border:  #e8e8e8;
          --pj-muted:   #888;
          --pj-success: #2e7d32;
          --pj-radius:  10px;
          --pj-text:    #1a1a1a;
        }

        .pj-container {
          max-width: 820px;
          width: 100%;
          margin: 0 auto;
          padding: 2.5rem 1.5rem 5rem;
        }

        /* Step bar */
        .pj-stepbar {
          display: flex;
          align-items: center;
          margin-bottom: 2.5rem;
          overflow-x: auto;
          padding-bottom: 0.5rem;
        }
        .pj-stepbar-item { display: flex; align-items: center; flex-shrink: 0; }
        .pj-stepbar-dot {
          width: 30px; height: 30px;
          border-radius: 50%;
          border: 2px solid var(--pj-border);
          background: #fff;
          color: var(--pj-muted);
          font-size: 0.75rem; font-weight: 700;
          display: flex; align-items: center; justify-content: center;
          flex-shrink: 0;
          transition: all 0.2s;
          z-index: 1;
        }
        .pj-stepbar-item.active .pj-stepbar-dot { border-color: var(--pj-gold); color: var(--pj-gold); box-shadow: 0 0 0 3px rgba(201,168,76,0.15); }
        .pj-stepbar-item.done  .pj-stepbar-dot  { background: var(--pj-gold); border-color: var(--pj-gold); color: #fff; }
        .pj-stepbar-label { font-size: 0.72rem; font-weight: 600; color: var(--pj-muted); margin-left: 0.4rem; white-space: nowrap; }
        .pj-stepbar-item.active .pj-stepbar-label { color: var(--pj-gold); }
        .pj-stepbar-item.done  .pj-stepbar-label  { color: var(--pj-text); }
        .pj-stepbar-line { height: 2px; width: 2rem; background: var(--pj-border); margin: 0 0.5rem; flex-shrink: 0; }
        .pj-stepbar-item.done .pj-stepbar-line { background: var(--pj-gold); }

        /* Typography */
        .pj-step-indicator { font-size: 0.72rem; font-weight: 600; letter-spacing: 0.1em; text-transform: uppercase; color: var(--pj-muted); margin-bottom: 0.75rem; }
        .pj-step-title     { font-size: clamp(1.5rem, 3vw, 2rem); font-weight: 700; line-height: 1.3; margin-bottom: 0.75rem; }
        .pj-step-desc      { color: var(--pj-muted); font-size: 0.95rem; margin-bottom: 2rem; }
        .pj-label          { display: block; font-size: 0.875rem; font-weight: 600; color: var(--pj-text); margin-bottom: 0.5rem; }
        .pj-sublabel       { font-size: 0.8rem; color: var(--pj-muted); margin-bottom: 0.5rem; display: block; }

        /* Form card */
        .pj-form-card { background: var(--pj-surface); border: 1px solid var(--pj-border); border-radius: var(--pj-radius); padding: 2rem; margin-bottom: 2rem; box-shadow: 0 1px 6px rgba(0,0,0,0.05); }

        /* Select */
        .pj-select-wrap { margin-bottom: 1.5rem; }
        .pj-select { width: 100%; padding: 0.75rem 1rem; border: 2px solid var(--pj-gold); border-radius: 8px; font-family: inherit; font-size: 0.95rem; background: #fff; color: var(--pj-text); cursor: pointer; outline: none; appearance: none; background-image: url("data:image/svg+xml,%3Csvg width='10' height='6' viewBox='0 0 10 6' fill='none' stroke='%23888' stroke-width='1.5' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M1 1L5 5L9 1'/%3E%3C/svg%3E"); background-repeat: no-repeat; background-position: right 1rem center; }
        .pj-select:focus { border-color: var(--pj-gold-lt); box-shadow: 0 0 0 3px rgba(201,168,76,0.12); }

        /* Skills */
        .pj-skills-search-wrap { position: relative; margin-bottom: 1rem; }
        .pj-skills-search-wrap svg { position: absolute; left: 0.85rem; top: 50%; transform: translateY(-50%); color: var(--pj-muted); pointer-events: none; }
        .pj-skills-input { width: 100%; padding: 0.75rem 1rem 0.75rem 2.5rem; border: 1px solid var(--pj-border); border-radius: 8px; font-family: inherit; font-size: 0.95rem; outline: none; transition: border-color 0.15s, box-shadow 0.15s; }
        .pj-skills-input:focus { border-color: var(--pj-gold); box-shadow: 0 0 0 3px rgba(201,168,76,0.1); }
        .pj-skills-tags { display: flex; flex-wrap: wrap; gap: 0.5rem; margin-bottom: 1.25rem; min-height: 1rem; }
        .pj-skill-tag { display: inline-flex; align-items: center; gap: 0.4rem; background: var(--pj-gold); color: #fff; padding: 0.35rem 0.75rem; border-radius: 20px; font-size: 0.85rem; font-weight: 500; }
        .pj-skill-tag button { background: none; border: none; color: #fff; cursor: pointer; font-size: 1.1rem; line-height: 1; padding: 0; opacity: 0.8; }
        .pj-skill-tag button:hover { opacity: 1; }
        .pj-pill-group { display: flex; flex-wrap: wrap; gap: 0.65rem; margin-top: 0.75rem; }
        .pj-pill { padding: 0.5rem 1.1rem; border-radius: 20px; border: 1px solid var(--pj-border); cursor: pointer; font-size: 0.875rem; font-weight: 500; background: #fff; color: var(--pj-text); transition: border-color 0.15s, color 0.15s, background 0.15s; user-select: none; }
        .pj-pill:hover    { border-color: var(--pj-gold); color: var(--pj-gold); }
        .pj-pill.selected { background: var(--pj-gold); color: #fff; border-color: var(--pj-gold); }

        /* Radio / Checkbox cards */
        .pj-radio-group { display: flex; flex-direction: column; gap: 0.75rem; margin-bottom: 2rem; }
        .pj-radio-card { display: flex; align-items: flex-start; gap: 1rem; padding: 1.25rem 1.5rem; border: 1px solid var(--pj-border); border-radius: 8px; cursor: pointer; transition: border-color 0.15s, background 0.15s; }
        .pj-radio-card.compact { padding: 0.85rem 1.25rem; align-items: center; }
        .pj-radio-card:hover   { border-color: var(--pj-gold); background: rgba(201,168,76,0.03); }
        .pj-radio-card.selected { border-color: var(--pj-gold); background: rgba(201,168,76,0.07); }
        .pj-radio-card input { margin-top: 0.2rem; accent-color: var(--pj-gold); flex-shrink: 0; }
        .pj-radio-card.compact input { margin-top: 0; }
        .pj-radio-content h4 { font-size: 0.95rem; font-weight: 600; margin-bottom: 0.3rem; }
        .pj-radio-content p  { font-size: 0.85rem; color: var(--pj-muted); margin: 0; }

        /* Budget */
        .pj-budget-card { display: flex; align-items: center; justify-content: space-between; padding: 1.25rem 1.5rem; border: 2px solid var(--pj-gold); border-radius: 8px; background: rgba(201,168,76,0.05); margin-bottom: 1.5rem; cursor: pointer; }
        .pj-budget-card-left { display: flex; align-items: center; gap: 1rem; }
        .pj-budget-icon { color: var(--pj-gold); flex-shrink: 0; }
        .pj-budget-radio { width: 20px; height: 20px; border-radius: 50%; border: 2px solid var(--pj-gold); display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
        .pj-budget-radio-inner { width: 10px; height: 10px; border-radius: 50%; background: var(--pj-gold); }
        .pj-price-group { display: flex; align-items: center; gap: 0.75rem; margin-top: 1rem; }
        .pj-price-input { padding: 0.6rem 0.85rem; border: 1px solid var(--pj-border); border-radius: 6px; width: 160px; text-align: right; font-family: inherit; font-size: 1rem; font-weight: 600; outline: none; transition: border-color 0.15s; }
        .pj-price-input:focus { border-color: var(--pj-gold); box-shadow: 0 0 0 3px rgba(201,168,76,0.1); }
        .pj-price-currency { font-weight: 700; }

        /* Description */
        .pj-desc-grid { display: grid; grid-template-columns: 1fr 2fr; gap: 2rem; }
        @media (max-width: 600px) { .pj-desc-grid { grid-template-columns: 1fr; } }
        .pj-desc-tips h4 { font-weight: 600; margin-bottom: 0.75rem; font-size: 0.95rem; }
        .pj-desc-tips ul { padding-left: 1.1rem; font-size: 0.875rem; color: var(--pj-muted); line-height: 1.7; }
        .pj-textarea { width: 100%; padding: 0.85rem 1rem; border: 1px solid var(--pj-border); border-radius: 8px; font-family: inherit; font-size: 0.95rem; resize: vertical; min-height: 220px; outline: none; transition: border-color 0.15s, box-shadow 0.15s; color: var(--pj-text); margin-bottom: 1rem; }
        .pj-textarea:focus { border-color: var(--pj-gold); box-shadow: 0 0 0 3px rgba(201,168,76,0.1); }
        .pj-attach-btn { display: inline-flex; align-items: center; gap: 0.4rem; border: 1px solid var(--pj-gold); color: var(--pj-gold); background: none; border-radius: 6px; padding: 0.5rem 1rem; font-family: inherit; font-size: 0.875rem; font-weight: 600; cursor: pointer; transition: background 0.15s, color 0.15s; }
        .pj-attach-btn:hover { background: var(--pj-gold); color: #fff; }
        .pj-filename { font-size: 0.85rem; color: var(--pj-muted); margin-top: 0.5rem; }

        /* Review */
        .pj-review-row { padding: 1.1rem 0; border-bottom: 1px solid var(--pj-border); }
        .pj-review-row:last-child { border-bottom: none; }
        .pj-review-label { font-size: 0.72rem; font-weight: 600; text-transform: uppercase; letter-spacing: 0.08em; color: var(--pj-muted); margin-bottom: 0.4rem; }
        .pj-review-value { font-size: 0.95rem; color: var(--pj-text); white-space: pre-wrap; line-height: 1.6; }
        .pj-review-grid  { display: grid; grid-template-columns: repeat(3, 1fr); gap: 1rem; padding-top: 1rem; }
        @media (max-width: 580px) { .pj-review-grid { grid-template-columns: 1fr 1fr; } }

        /* Wizard footer */
        .pj-wizard-footer { display: flex; justify-content: space-between; align-items: center; margin-top: 2rem; padding-top: 2rem; border-top: 1px solid var(--pj-border); }
        .pj-btn-back { background: none; border: 1px solid var(--pj-border); color: var(--pj-text); padding: 0.6rem 1.4rem; border-radius: 8px; font-family: inherit; font-weight: 600; font-size: 0.875rem; cursor: pointer; transition: border-color 0.15s, background 0.15s; }
        .pj-btn-back:hover { border-color: #aaa; background: #f5f5f5; }
        .pj-btn-next { display: inline-flex; align-items: center; gap: 0.4rem; background: linear-gradient(135deg, var(--pj-gold), var(--pj-gold-lt)); color: #fff; border: none; padding: 0.65rem 1.5rem; border-radius: 8px; font-family: inherit; font-weight: 600; font-size: 0.875rem; cursor: pointer; transition: opacity 0.15s, transform 0.15s; }
        .pj-btn-next:hover:not(:disabled) { opacity: 0.88; transform: translateY(-1px); }
        .pj-btn-next:disabled { opacity: 0.6; cursor: not-allowed; transform: none; }

        /* Error */
        .pj-error { background: #fff3f3; border: 1px solid #fcc; border-radius: 8px; padding: 0.85rem 1.1rem; color: #c00; font-size: 0.875rem; margin-bottom: 1.25rem; }

        /* Misc */
        .pj-group { margin-bottom: 2rem; }
        .pj-group:last-child { margin-bottom: 0; }
      `}</style>

      <WizardShell
        step={step}
        onNext={goNext}
        onBack={goBack}
        error={error}
        submitting={submitting}
        nextLabel={NEXT_LABELS[step]}
      >
        {step === 1 && (
          <StepCategory
            jobData={jobData}
            patch={patch}
            categories={categories}
          />
        )}
        {step === 2 && (
          <StepSkills
            jobData={jobData}
            suggestedSkills={suggestedSkills}
            skillInput={skillInput}
            setSkillInput={setSkillInput}
            handleSkillKey={handleSkillKey}
            addSkill={addSkill}
            removeSkill={removeSkill}
          />
        )}
        {step === 3 && (
          <StepScope
            jobData={jobData}
            patch={patch}
            toggleExperience={toggleExperience}
          />
        )}
        {step === 4 && (
          <StepBudget
            jobData={jobData}
            patch={patch}
          />
        )}
        {step === 5 && (
          <StepDescription
            jobData={jobData}
            patch={patch}
          />
        )}
        {step === 6 && (
          <StepReview
            jobData={jobData}
          />
        )}
      </WizardShell>
    </>
  );
}