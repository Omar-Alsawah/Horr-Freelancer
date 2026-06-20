import { useState, useRef, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { getOnboardingStatus, getClientJobs, updateJob, deleteJob } from "../../../services/clientService";
import useAuth from "../../auth/hooks/useAuth";
import useFetch from "../../../hooks/useFetch";
import { toast } from "sonner";
import RecommendedFreelancers from "../../talent/components/RecommendedFreelancers";

// ── Step Card ─────────────────────────────────────────────────────────────────
function StepCard({ step }) {
  return (
    <div className={`cd-step-card ${step.done ? "is-done" : "is-pending"}`}>
      <div className="cd-step-body">
        <p className="cd-step-required">{step.requiredLabel}</p>
        {step.done ? (
          <div className="cd-step-verified">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
              <polyline points="20 6 9 17 4 12" />
            </svg>
            {step.actionLabel}
          </div>
        ) : (
          <Link className="cd-step-link" to={step.actionHref}>{step.actionLabel}</Link>
        )}
      </div>
      <div className="cd-step-icon" style={{ color: step.done ? "var(--cd-success)" : "var(--cd-gold)" }}>
        {step.icon}
      </div>
    </div>
  );
}

// ── Job Menu Dropdown ─────────────────────────────────────────────────────────
function JobMenu({ onEdit, onDelete }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <div className="cd-job-menu-wrap" ref={ref}>
      <button
        className="cd-job-menu"
        aria-label="Job options"
        onClick={() => setOpen((p) => !p)}
      >
        <svg width="4" height="16" viewBox="0 0 4 18" fill="currentColor">
          <circle cx="2" cy="2" r="2" />
          <circle cx="2" cy="9" r="2" />
          <circle cx="2" cy="16" r="2" />
        </svg>
      </button>
      {open && (
        <div className="cd-dropdown">
          <button className="cd-dropdown-item" onClick={() => { setOpen(false); onEdit(); }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
            </svg>
            Edit
          </button>
          <button className="cd-dropdown-item is-danger" onClick={() => { setOpen(false); onDelete(); }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="3 6 5 6 21 6" />
              <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
              <path d="M10 11v6M14 11v6" />
              <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
            </svg>
            Delete
          </button>
        </div>
      )}
    </div>
  );
}

// ── Edit Job Modal ────────────────────────────────────────────────────────────
function EditJobModal({ job, onClose, onSaved }) {
  const [form, setForm] = useState({
    title: job.title || "",
    description: job.description || "",
    budget: job.budget || "",
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm((p) => ({ ...p, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title.trim()) { toast.error("Title is required"); return; }

    setLoading(true);
    try {
      const updatedData = { ...job, ...form, budget: form.budget ? parseFloat(form.budget) : job.budget };
      await updateJob(job.id, updatedData);
      toast.success("Job updated successfully");
      onSaved(updatedData);
      onClose();
    } catch (err) {
      const message =
        err.response?.data?.errors?.[0] ||
        err.response?.data?.message ||
        err.message ||
        "Failed to update job";
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="cd-modal-overlay" onClick={onClose}>
      <div className="cd-modal" onClick={(e) => e.stopPropagation()}>
        <div className="cd-modal-header">
          <h2 className="cd-modal-title">Edit Job Post</h2>
          <button className="cd-modal-close" onClick={onClose} aria-label="Close">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>
        <form onSubmit={handleSubmit} className="cd-modal-body">
          <div className="cd-field">
            <label className="cd-label">Job Title</label>
            <input
              className="cd-input"
              name="title"
              value={form.title}
              onChange={handleChange}
              placeholder="e.g. Build a React dashboard"
            />
          </div>
          <div className="cd-field">
            <label className="cd-label">Description</label>
            <textarea
              className="cd-input cd-textarea"
              name="description"
              value={form.description}
              onChange={handleChange}
              placeholder="Describe the job..."
              rows={5}
            />
          </div>
          <div className="cd-field">
            <label className="cd-label">Budget (USD)</label>
            <input
              className="cd-input"
              name="budget"
              type="number"
              min="0"
              value={form.budget}
              onChange={handleChange}
              placeholder="e.g. 500"
            />
          </div>
          <div className="cd-modal-actions">
            <button type="submit" className="cd-btn-primary" disabled={loading}>
              {loading ? "Saving…" : "Save Changes"}
            </button>
            <button type="button" className="cd-btn-secondary" onClick={onClose} disabled={loading}>
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ── Delete Confirm Modal ──────────────────────────────────────────────────────
function DeleteConfirmModal({ job, onClose, onDeleted }) {
  const [loading, setLoading] = useState(false);

  const handleDelete = async () => {
    setLoading(true);
    try {
      await deleteJob(job.id);
      toast.success("Job deleted successfully");
      onDeleted();
      onClose();
    } catch (err) {
      const message =
        err.response?.data?.errors?.[0] ||
        err.response?.data?.message ||
        err.message ||
        "Failed to delete job";
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="cd-modal-overlay" onClick={onClose}>
      <div className="cd-modal cd-modal-sm" onClick={(e) => e.stopPropagation()}>
        <div className="cd-modal-header">
          <h2 className="cd-modal-title">Delete Job</h2>
          <button className="cd-modal-close" onClick={onClose} aria-label="Close">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>
        <div className="cd-modal-body">
          <div className="cd-delete-icon-wrap">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#c00" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="3 6 5 6 21 6" />
              <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
              <path d="M10 11v6M14 11v6" />
              <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
            </svg>
          </div>
          <p className="cd-confirm-text">
            Are you sure you want to delete <strong>"{job.title}"</strong>?<br />
            <span style={{ color: "#999", fontSize: "0.82rem" }}>This action cannot be undone.</span>
          </p>
          <div className="cd-modal-actions">
            <button className="cd-btn-danger" onClick={handleDelete} disabled={loading}>
              {loading ? "Deleting…" : "Yes, Delete"}
            </button>
            <button className="cd-btn-secondary" onClick={onClose} disabled={loading}>
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Job Card ──────────────────────────────────────────────────────────────────
function JobCard({ job, onEdit, onDelete }) {
  const navigate = useNavigate();

  const dateLabel = job.postedAt || job.createdAt
    ? new Date(job.postedAt || job.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
    : "Unknown date";

  const statItems = [
    { key: "Invited",   val: job.stats?.invited   ?? 0 },
    { key: "Proposals", val: job.stats?.proposals  ?? 0, jobId: job.id },
    { key: "Messaged",  val: job.stats?.messaged   ?? 0 },
    { key: "Hired",     val: job.stats?.hired      ?? 0 },
  ];

  return (
    <div className="cd-job-card">
      <div className="cd-job-head">
        <div className="cd-job-info">
          <h3 className="cd-job-title">{job.title}</h3>
          <p className="cd-job-meta">Created {dateLabel}</p>
          <Link className="cd-btn-open" to={`/client/manage-job/${job.id}`}>
            Open job post ↗
          </Link>
        </div>
        <JobMenu onEdit={() => onEdit(job)} onDelete={() => onDelete(job)} />
      </div>
      <div className="cd-job-stats">
        {statItems.map(({ key, val, jobId }) => {
          const isClickable = key === "Proposals" && val > 0;
          return (
            <div
              className="cd-stat"
              key={key}
              onClick={() => isClickable && navigate(`/client/job-proposals?jobId=${jobId}`)}
              title={isClickable ? "View proposals" : ""}
              style={{ cursor: isClickable ? "pointer" : "default" }}
              onMouseEnter={e => { if (isClickable) e.currentTarget.style.background = "#fdf8ee"; }}
              onMouseLeave={e => { if (isClickable) e.currentTarget.style.background = "transparent"; }}
            >
              <span
                className="cd-stat-val"
                style={{ color: isClickable ? "var(--cd-gold)" : undefined }}
              >
                {val}
              </span>
              <span className="cd-stat-key">{key}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── Post Job Placeholder Card ─────────────────────────────────────────────────
function PostJobCard() {
  return (
    <Link to="/client/post-job" className="cd-post-job-card">
      <div className="cd-post-job-inner">
        <span className="cd-post-job-plus">+</span>
        <span>Post a job</span>
      </div>
    </Link>
  );
}

// ── Skeleton Loader ───────────────────────────────────────────────────────────
function Skeleton({ height = 120, width = "100%", radius = 10 }) {
  return (
    <div
      className="cd-skeleton"
      style={{ height, width, borderRadius: radius }}
      aria-hidden="true"
    />
  );
}

// ── Main Dashboard ────────────────────────────────────────────────────────────
export default function ClientDashboard() {
  const [view, setView] = useState("grid");
  const [editingJob, setEditingJob] = useState(null);
  const [deletingJob, setDeletingJob] = useState(null);

  const { user, loading: authLoading } = useAuth();

  const { data: steps, loading: stepsLoading, error: stepsError } = useFetch(getOnboardingStatus);
  const {
    data: jobsData,
    loading: jobsLoading,
    error: jobsError,
    setData: setJobsData,
  } = useFetch(getClientJobs);

  const loading = authLoading || stepsLoading || jobsLoading;
  const error = stepsError || jobsError;
  const jobs = Array.isArray(jobsData) ? jobsData : [];

  const handleJobSaved = (updated) =>
    setJobsData((prev) =>
      Array.isArray(prev)
        ? prev.map((j) => (j.id === updated?.id ? { ...j, ...updated } : j))
        : prev
    );
  const handleJobDeleted = (id) =>
    setJobsData((prev) =>
      Array.isArray(prev) ? prev.filter((j) => j.id !== id) : prev
    );

  const stepCards = steps
    ? [
      {
        id: "billing",
        requiredLabel: "Required to hire",
        actionLabel: "Add a billing method",
        actionHref: "/client/settings#billing",
        done: steps.billingAdded,
        icon: (
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <rect x="1" y="4" width="22" height="16" rx="2" ry="2" />
            <line x1="1" y1="10" x2="23" y2="10" />
          </svg>
        ),
      },
      {
        id: "email",
        requiredLabel: "Required to hire",
        actionLabel: "Email address verified",
        actionHref: "#",
        done: steps.emailVerified,
        icon: (
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
            <polyline points="22,6 12,13 2,6" />
          </svg>
        ),
      },
      {
        id: "phone",
        requiredLabel: "Required to publish a job",
        actionLabel: "Phone number verified",
        actionHref: "#",
        done: steps.phoneVerified,
        icon: (
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.77 1h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 8.69a16 16 0 0 0 6.29 6.29l1.06-1.06a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z" />
          </svg>
        ),
      },
    ]
    : null;

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');

        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        :root {
          --cd-gold:       #C9A84C;
          --cd-gold-lt:    #e8c96a;
          --cd-gold-bg:    #fdf8ee;
          --cd-gold-ring:  rgba(201,168,76,0.18);
          --cd-surface:    #ffffff;
          --cd-bg:         #f5f4f1;
          --cd-border:     #e6e4df;
          --cd-muted:      #9a9590;
          --cd-success:    #2e7d32;
          --cd-success-bg: #f0faf0;
          --cd-danger:     #d32f2f;
          --cd-radius:     12px;
          --cd-text:       #1c1a17;
          --cd-text-soft:  #5a5650;
        }

        body {
          color: var(--cd-text);
          font-family: 'Inter', system-ui, sans-serif;
          min-height: 100vh;
        }

        .cd-main {
          max-width: 1080px;
          width: 100%;
          margin: 0 auto;
          padding: 2.75rem 1.5rem 5rem;
        }

        .cd-welcome {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 1rem;
          flex-wrap: wrap;
          margin-bottom: 2.5rem;
          padding-bottom: 2rem;
          border-bottom: 1px solid var(--cd-border);
        }
        .cd-welcome-title {
          font-size: clamp(1.5rem, 3vw, 2rem);
          font-weight: 800;
          letter-spacing: -0.02em;
          color: var(--cd-text);
        }
        .cd-welcome-title span {
          background: linear-gradient(135deg, var(--cd-gold), var(--cd-gold-lt));
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }
        .cd-welcome-sub {
          margin-top: 0.25rem;
          font-size: 0.9rem;
          color: var(--cd-muted);
          font-weight: 400;
        }

        .cd-btn-primary {
          display: inline-flex;
          align-items: center;
          gap: 0.35rem;
          background: linear-gradient(135deg, var(--cd-gold), var(--cd-gold-lt));
          color: #fff;
          font-weight: 600;
          font-size: 0.875rem;
          padding: 0.6rem 1.4rem;
          border-radius: 8px;
          text-decoration: none;
          border: none;
          cursor: pointer;
          font-family: inherit;
          letter-spacing: 0.01em;
          transition: opacity 0.18s, transform 0.15s, box-shadow 0.18s;
          box-shadow: 0 2px 8px rgba(201,168,76,0.25);
        }
        .cd-btn-primary:hover { opacity: 0.9; transform: translateY(-1px); box-shadow: 0 4px 14px rgba(201,168,76,0.35); }

        .cd-btn-secondary {
          display: inline-flex;
          align-items: center;
          background: var(--cd-surface);
          border: 1px solid var(--cd-border);
          color: var(--cd-text);
          font-weight: 500;
          font-size: 0.875rem;
          padding: 0.6rem 1.3rem;
          border-radius: 8px;
          cursor: pointer;
          font-family: inherit;
          transition: background 0.15s, border-color 0.15s;
        }
        .cd-btn-secondary:hover { background: #f0eeea; border-color: #ccc; }

        .cd-btn-danger {
          display: inline-flex;
          align-items: center;
          gap: 0.35rem;
          background: var(--cd-danger);
          color: #fff;
          font-weight: 600;
          font-size: 0.875rem;
          padding: 0.6rem 1.4rem;
          border-radius: 8px;
          border: none;
          cursor: pointer;
          font-family: inherit;
          transition: opacity 0.15s, transform 0.15s;
        }
        .cd-btn-danger:hover { opacity: 0.88; transform: translateY(-1px); }

        .cd-section-title {
          font-size: 0.95rem;
          font-weight: 700;
          color: var(--cd-text);
          margin-bottom: 1rem;
          letter-spacing: -0.01em;
        }

        .cd-steps-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 0.85rem;
          margin-bottom: 2.75rem;
        }
        @media (max-width: 700px) { .cd-steps-grid { grid-template-columns: 1fr; } }

        .cd-step-card {
          background: var(--cd-surface);
          border: 1px solid var(--cd-border);
          border-radius: var(--cd-radius);
          padding: 1.25rem 1.2rem;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 0.75rem;
          transition: box-shadow 0.2s;
          border-left: 3px solid transparent;
        }
        .cd-step-card:hover { box-shadow: 0 2px 12px rgba(0,0,0,0.06); }
        .cd-step-card.is-pending { border-left-color: var(--cd-gold); }
        .cd-step-card.is-done    { border-left-color: var(--cd-success); opacity: 0.75; }

        .cd-step-required {
          font-size: 0.68rem;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.09em;
          color: var(--cd-muted);
          margin-bottom: 0.4rem;
        }
        .cd-step-link {
          color: var(--cd-gold);
          font-weight: 600;
          font-size: 0.875rem;
          text-decoration: none;
          transition: opacity 0.15s;
        }
        .cd-step-link:hover { opacity: 0.75; text-decoration: underline; }
        .cd-step-verified {
          display: flex;
          align-items: center;
          gap: 0.35rem;
          color: var(--cd-success);
          font-size: 0.875rem;
          font-weight: 600;
        }
        .cd-step-icon {
          font-size: 1.6rem;
          flex-shrink: 0;
          line-height: 1;
        }

        .cd-overview-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 1.1rem;
        }
        .cd-toggle-group {
          display: flex;
          background: var(--cd-surface);
          border: 1px solid var(--cd-border);
          border-radius: 8px;
          padding: 3px;
          gap: 2px;
        }
        .cd-toggle-btn {
          background: none;
          border: none;
          cursor: pointer;
          font-family: inherit;
          font-size: 0.8rem;
          font-weight: 500;
          color: var(--cd-muted);
          padding: 0.3rem 0.85rem;
          border-radius: 6px;
          transition: background 0.15s, color 0.15s;
        }
        .cd-toggle-btn.active {
          background: var(--cd-gold-bg);
          color: #7a5c1e;
          font-weight: 600;
        }

        .cd-jobs-wrap { display: grid; gap: 0.85rem; }
        .cd-jobs-wrap.view-grid {
          grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
        }
        .cd-jobs-wrap.view-list { grid-template-columns: 1fr; }

        .cd-job-card {
          background: var(--cd-surface);
          border: 1px solid var(--cd-border);
          border-radius: var(--cd-radius);
          padding: 1.4rem 1.35rem;
          transition: box-shadow 0.2s, transform 0.18s, border-color 0.2s;
          position: relative;
          overflow: hidden;
        }
        .cd-job-card::before {
          content: '';
          position: absolute;
          top: 0; left: 0; right: 0;
          height: 3px;
          background: linear-gradient(90deg, var(--cd-gold), var(--cd-gold-lt));
          opacity: 0;
          transition: opacity 0.2s;
        }
        .cd-job-card:hover { box-shadow: 0 6px 24px rgba(0,0,0,0.09); transform: translateY(-2px); border-color: #ddd; }
        .cd-job-card:hover::before { opacity: 1; }

        .cd-job-head {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          gap: 0.5rem;
          margin-bottom: 1.2rem;
        }
        .cd-job-info { flex: 1; min-width: 0; }
        .cd-job-title {
          font-size: 1rem;
          font-weight: 700;
          color: var(--cd-text);
          margin-bottom: 0.25rem;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        .cd-job-meta { font-size: 0.78rem; color: var(--cd-muted); margin-bottom: 0.9rem; font-weight: 400; }

        .cd-btn-open {
          display: inline-flex;
          align-items: center;
          gap: 0.25rem;
          background: var(--cd-gold-bg);
          color: #7a5c1e;
          font-size: 0.78rem;
          font-weight: 600;
          padding: 0.35rem 0.85rem;
          border-radius: 6px;
          text-decoration: none;
          transition: background 0.15s, color 0.15s;
          border: 1px solid rgba(201,168,76,0.25);
        }
        .cd-btn-open:hover { background: #f5edcd; color: #5a4010; }

        .cd-job-menu-wrap { position: relative; flex-shrink: 0; }
        .cd-job-menu {
          background: none;
          border: none;
          cursor: pointer;
          color: var(--cd-muted);
          padding: 0.4rem 0.5rem;
          border-radius: 6px;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: color 0.15s, background 0.15s;
        }
        .cd-job-menu:hover { color: var(--cd-text); background: #f0eeea; }
        .cd-dropdown {
          position: absolute;
          top: calc(100% + 6px);
          right: 0;
          background: var(--cd-surface);
          border: 1px solid var(--cd-border);
          border-radius: 10px;
          box-shadow: 0 6px 24px rgba(0,0,0,0.12);
          min-width: 140px;
          z-index: 200;
          overflow: hidden;
        }
        .cd-dropdown-item {
          display: flex;
          align-items: center;
          gap: 0.55rem;
          width: 100%;
          background: none;
          border: none;
          padding: 0.7rem 1rem;
          font-size: 0.85rem;
          font-family: inherit;
          font-weight: 500;
          color: var(--cd-text);
          cursor: pointer;
          text-align: left;
          transition: background 0.15s;
        }
        .cd-dropdown-item:hover { background: #f7f5f1; }
        .cd-dropdown-item.is-danger { color: var(--cd-danger); }
        .cd-dropdown-item.is-danger:hover { background: #fff5f5; }

        .cd-job-stats {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 0;
          border-top: 1px solid var(--cd-border);
          padding-top: 1rem;
        }
        .cd-stat {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 0.2rem;
          padding: 0.25rem 0.1rem;
          border-right: 1px solid var(--cd-border);
          border-radius: 6px;
          transition: background 0.15s;
        }
        .cd-stat:last-child { border-right: none; }
        .cd-stat-val {
          font-size: 1.15rem;
          font-weight: 700;
          color: var(--cd-text);
          letter-spacing: -0.02em;
        }
        .cd-stat-key {
          font-size: 0.62rem;
          color: var(--cd-muted);
          text-transform: uppercase;
          letter-spacing: 0.06em;
          font-weight: 500;
        }

        .cd-post-job-card {
          background: var(--cd-surface);
          border: 2px dashed #d6d0c4;
          border-radius: var(--cd-radius);
          min-height: 185px;
          display: flex;
          align-items: center;
          justify-content: center;
          text-decoration: none;
          transition: border-color 0.2s, background 0.2s;
        }
        .cd-post-job-card:hover { border-color: var(--cd-gold); background: var(--cd-gold-bg); }
        .cd-post-job-inner {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 0.4rem;
          color: var(--cd-gold);
          font-weight: 600;
          font-size: 0.9rem;
          transition: transform 0.2s;
        }
        .cd-post-job-card:hover .cd-post-job-inner { transform: scale(1.05); }
        .cd-post-job-plus {
          font-size: 2rem;
          line-height: 1;
          width: 48px;
          height: 48px;
          border-radius: 50%;
          background: var(--cd-gold-bg);
          display: flex;
          align-items: center;
          justify-content: center;
          border: 2px solid rgba(201,168,76,0.3);
          transition: background 0.2s;
        }
        .cd-post-job-card:hover .cd-post-job-plus { background: rgba(201,168,76,0.2); }

        .cd-skeleton {
          background: linear-gradient(90deg, #eae8e4 25%, #f2f0ec 50%, #eae8e4 75%);
          background-size: 200% 100%;
          animation: cd-shimmer 1.5s infinite;
        }
        @keyframes cd-shimmer {
          0%   { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }

        .cd-error {
          background: #fff5f5;
          border: 1px solid #f5c6c6;
          border-radius: var(--cd-radius);
          padding: 1.1rem 1.4rem;
          color: var(--cd-danger);
          font-size: 0.88rem;
          font-weight: 500;
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .cd-modal-overlay {
          position: fixed;
          inset: 0;
          background: rgba(0,0,0,0.4);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 500;
          padding: 1rem;
          backdrop-filter: blur(3px);
          animation: cd-fade-in 0.15s ease;
        }
        @keyframes cd-fade-in { from { opacity: 0; } to { opacity: 1; } }

        .cd-modal {
          background: var(--cd-surface);
          border-radius: 16px;
          width: 100%;
          max-width: 520px;
          box-shadow: 0 16px 60px rgba(0,0,0,0.18);
          overflow: hidden;
          animation: cd-slide-up 0.2s ease;
        }
        @keyframes cd-slide-up { from { transform: translateY(16px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }

        .cd-modal-sm { max-width: 400px; }
        .cd-modal-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 1.3rem 1.6rem;
          border-bottom: 1px solid var(--cd-border);
        }
        .cd-modal-title { font-size: 1.05rem; font-weight: 700; letter-spacing: -0.01em; }
        .cd-modal-close {
          background: #f4f2ee;
          border: none;
          width: 30px;
          height: 30px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          color: var(--cd-muted);
          transition: background 0.15s, color 0.15s;
        }
        .cd-modal-close:hover { background: #e8e5e0; color: var(--cd-text); }
        .cd-modal-body { padding: 1.6rem; display: flex; flex-direction: column; gap: 1.1rem; }
        .cd-modal-actions { display: flex; gap: 0.65rem; padding-top: 0.25rem; }
        .cd-field { display: flex; flex-direction: column; gap: 0.45rem; }
        .cd-label { font-size: 0.82rem; font-weight: 600; color: var(--cd-text-soft); letter-spacing: 0.01em; }
        .cd-input {
          padding: 0.65rem 0.95rem;
          border: 1.5px solid var(--cd-border);
          border-radius: 8px;
          font-size: 0.9rem;
          font-family: inherit;
          background: #fafaf8;
          color: var(--cd-text);
          transition: border-color 0.15s, background 0.15s, box-shadow 0.15s;
          outline: none;
          width: 100%;
        }
        .cd-input:focus {
          border-color: var(--cd-gold);
          background: #fff;
          box-shadow: 0 0 0 3px var(--cd-gold-ring);
        }
        .cd-textarea { resize: vertical; min-height: 110px; }

        .cd-delete-icon-wrap {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 56px;
          height: 56px;
          background: #fff5f5;
          border-radius: 50%;
          margin: 0 auto 0.25rem;
          border: 1px solid #f5c6c6;
        }
        .cd-confirm-text {
          font-size: 0.92rem;
          color: var(--cd-text);
          line-height: 1.65;
          text-align: center;
        }

        @media (max-width: 520px) {
          .cd-main { padding: 1.5rem 1rem 4rem; }
          .cd-job-stats { grid-template-columns: repeat(2, 1fr); }
          .cd-stat:nth-child(2) { border-right: none; }
          .cd-stat:nth-child(3) { border-top: 1px solid var(--cd-border); }
          .cd-stat:nth-child(4) { border-top: 1px solid var(--cd-border); }
        }
      `}</style>

      <main className="cd-main">

        {/* Welcome */}
        <div className="cd-welcome">
          <div>
            <h1 className="cd-welcome-title">
              Welcome back,{" "}
              {loading
                ? <Skeleton height={30} width={110} radius={6} />
                : <span>{user?.firstName || user?.fullName?.split(" ")[0] || "there"}</span>
              }
            </h1>
            <p className="cd-welcome-sub">Here's what's happening with your jobs today.</p>
          </div>
          <a href="/client/post-job" className="cd-btn-primary">+ Post a job</a>
        </div>

        {/* Onboarding Steps */}
        <h3 className="cd-section-title">Last steps before you can hire</h3>
        <div className="cd-steps-grid">
          {loading || !stepCards
            ? [1, 2, 3].map((i) => <Skeleton key={i} height={92} radius={12} />)
            : stepCards.map((step) => <StepCard key={step.id} step={step} />)
          }
        </div>

        {/* Recommended Freelancers */}
          <RecommendedFreelancers />

        {/* Overview */}
        <div className="cd-overview-header">
          <h3 className="cd-section-title" style={{ marginBottom: 0 }}>Overview</h3>
          <div className="cd-toggle-group">
            <button
              className={`cd-toggle-btn ${view === "grid" ? "active" : ""}`}
              onClick={() => setView("grid")}
            >
              Grid
            </button>
            <button
              className={`cd-toggle-btn ${view === "list" ? "active" : ""}`}
              onClick={() => setView("list")}
            >
              List
            </button>
          </div>
        </div>

        {error && (
          <div className="cd-error">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
            Could not load your dashboard: {error}
          </div>
        )}

        {!error && (
          <div className={`cd-jobs-wrap ${view === "grid" ? "view-grid" : "view-list"}`}>
            {loading
              ? [1, 2, 3].map((i) => <Skeleton key={i} height={200} radius={12} />)
              : jobs.map((job) => (
                <JobCard
                  key={job.id}
                  job={job}
                  onEdit={setEditingJob}
                  onDelete={setDeletingJob}
                />
              ))
            }
            {!loading && <PostJobCard />}
          </div>
        )}

      </main>

      {/* Edit Modal */}
      {editingJob && (
        <EditJobModal
          job={editingJob}
          onClose={() => setEditingJob(null)}
          onSaved={(updated) => handleJobSaved(updated)}
        />
      )}

      {/* Delete Confirm Modal */}
      {deletingJob && (
        <DeleteConfirmModal
          job={deletingJob}
          onClose={() => setDeletingJob(null)}
          onDeleted={() => handleJobDeleted(deletingJob.id)}
        />
      )}
    </>
  );
}