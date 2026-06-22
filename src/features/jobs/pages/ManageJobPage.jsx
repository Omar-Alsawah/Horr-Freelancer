import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { getJobDetails, deleteJob, getUserProfile } from '../../../services/clientService';
import { currencyApi } from '../../../api/currency';
import EditJobDetailsModal from '../components/EditJobDetailsModal';
import axios from 'axios';

// ── Delete Confirm Modal ──────────────────────────────────────────────────────
function DeleteConfirmModal({ job, onClose, onDeleted }) {
    const [loading, setLoading] = useState(false);

    const handleDelete = async () => {
        setLoading(true);
        try {
            await deleteJob(job.id);
            toast.success('Job deleted successfully');
            onDeleted();
            onClose();
        } catch (err) {
            const message =
                err.response?.data?.errors?.[0] ||
                err.response?.data?.message ||
                err.message ||
                'Failed to delete job';
            toast.error(message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div
            onClick={onClose}
            style={{
                position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                zIndex: 500, padding: '1rem', backdropFilter: 'blur(3px)',
            }}
        >
            <div
                onClick={(e) => e.stopPropagation()}
                style={{
                    background: '#fff', borderRadius: '16px', width: '100%',
                    maxWidth: '400px', boxShadow: '0 16px 60px rgba(0,0,0,0.18)', overflow: 'hidden',
                }}
            >
                <div style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    padding: '1.3rem 1.6rem', borderBottom: '1px solid #e6e4df',
                }}>
                    <h2 style={{ fontSize: '1.05rem', fontWeight: '700', margin: 0 }}>Delete Job</h2>
                    <button
                        onClick={onClose}
                        style={{
                            background: '#f4f2ee', border: 'none', width: '30px', height: '30px',
                            borderRadius: '50%', display: 'flex', alignItems: 'center',
                            justifyContent: 'center', cursor: 'pointer', color: '#9a9590',
                        }}
                    >
                        ✕
                    </button>
                </div>
                <div style={{ padding: '1.6rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <p style={{ fontSize: '0.92rem', color: '#1c1a17', lineHeight: '1.65', margin: 0, textAlign: 'center' }}>
                        Are you sure you want to delete <strong>"{job.title}"</strong>?
                        <br />
                        <span style={{ color: '#9a9590', fontSize: '0.82rem' }}>This action cannot be undone.</span>
                    </p>
                    <div style={{ display: 'flex', gap: '0.65rem' }}>
                        <button
                            onClick={handleDelete}
                            disabled={loading}
                            style={{
                                padding: '0.6rem 1.4rem', borderRadius: '8px', border: 'none',
                                background: '#d32f2f', color: '#fff', fontWeight: '600', fontSize: '0.875rem',
                                cursor: 'pointer', opacity: loading ? 0.7 : 1, fontFamily: 'inherit',
                            }}
                        >
                            {loading ? 'Deleting…' : 'Yes, Delete'}
                        </button>
                        <button
                            onClick={onClose}
                            disabled={loading}
                            style={{
                                padding: '0.6rem 1.3rem', borderRadius: '8px', border: '1px solid #e6e4df',
                                background: '#fff', color: '#1c1a17', fontWeight: '500', fontSize: '0.875rem',
                                cursor: 'pointer', fontFamily: 'inherit',
                            }}
                        >
                            Cancel
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

// ── Helpers ────────────────────────────────────────────────────────────────────
const formatDate = (dateStr) => {
    if (!dateStr) return '—';
    return new Date(dateStr).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
};

const scopeLabel = { Small: 'Small', Medium: 'Medium', Large: 'Large' };
const experienceLabel = { Beginner: 'Entry level', Intermediate: 'Intermediate', Expert: 'Expert' };

// ── Main Page ──────────────────────────────────────────────────────────────────
export default function ManageJobPage() {
    const { id } = useParams();
    const navigate = useNavigate();

    const [job, setJob] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [editingJob, setEditingJob] = useState(false);
    const [deletingJob, setDeletingJob] = useState(false);
    const [preferredCurrency, setPreferredCurrency] = useState('USD');
    const [convertedBudget, setConvertedBudget] = useState(null);
    const [convertedMilestones, setConvertedMilestones] = useState({});

    useEffect(() => {
        const controller = new AbortController();

        const fetchJob = async () => {
            try {
                setLoading(true);
                setError(null);
                
                const jobData = await getJobDetails(id, { signal: controller.signal });
                setJob(jobData);

                let pCurrency = 'USD';
                try {
                    const profile = await getUserProfile();
                    if (profile?.preferredCurrency) {
                        pCurrency = profile.preferredCurrency;
                    }
                } catch (e) {
                    console.error("Failed to fetch user profile for currency", e);
                }
                setPreferredCurrency(pCurrency);

                const jobCurr = jobData.budgetCurrency || 'EGP';
                if (pCurrency !== jobCurr) {
                    try {
                        const bgConv = await currencyApi.convertCurrency(jobData.budget, jobCurr, pCurrency, { signal: controller.signal });
                        const bgVal = typeof bgConv.data === 'number' ? bgConv.data : (bgConv.data?.amount ?? bgConv.data?.convertedAmount ?? bgConv.data?.result ?? bgConv.data);
                        setConvertedBudget(bgVal);

                        if (jobData.milestones && jobData.milestones.length > 0) {
                            const mConvs = {};
                            for (let m of jobData.milestones) {
                                const mConv = await currencyApi.convertCurrency(m.amount, jobCurr, pCurrency, { signal: controller.signal });
                                const mVal = typeof mConv.data === 'number' ? mConv.data : (mConv.data?.amount ?? mConv.data?.convertedAmount ?? mConv.data?.result ?? mConv.data);
                                mConvs[m.id] = mVal;
                            }
                            setConvertedMilestones(mConvs);
                        }
                    } catch (e) {
                        console.error("Currency conversion failed", e);
                    }
                }

            } catch (err) {
                if (axios.isCancel(err) || err.code === 'ERR_CANCELED') return;
                setError(
                    err.response?.data?.message || 'Failed to load job details. Please try again.'
                );
            } finally {
                if (!controller.signal.aborted) setLoading(false);
            }
        };

        fetchJob();
        return () => controller.abort();
    }, [id]);

    const hasProposals = (job?.stats?.proposals ?? 0) > 0;

    return (
        <>
            <style>{`
        *, *::before, *::after { box-sizing: border-box; }

        .mj-page { max-width: 900px; margin: 0 auto; padding: 2.5rem 1.5rem 5rem; font-family: 'Inter', system-ui, sans-serif; }

        .mj-back { font-size: 13px; color: #888; display: flex; align-items: center; gap: 4px; margin-bottom: 1rem; background: none; border: none; cursor: pointer; padding: 0; }
        .mj-back:hover { color: #555; }

        .mj-header { display: flex; justify-content: space-between; align-items: flex-start; gap: 1rem; margin-bottom: 1.5rem; flex-wrap: wrap; }
        .mj-title { font-size: 1.6rem; font-weight: 700; color: #1a1a1a; margin: 0 0 0.4rem; }
        .mj-meta { font-size: 0.85rem; color: #999; margin: 0 0 0.9rem; }
        .mj-pills { display: flex; gap: 8px; flex-wrap: wrap; }
        .mj-pill { font-size: 12px; font-weight: 500; padding: 4px 12px; border-radius: 99px; background: #f4f2ee; color: #5a5650; }
        .mj-pill.gold { background: #fdf8ee; color: #7a5c1e; }

        .mj-actions { display: flex; gap: 8px; flex-shrink: 0; }
        .mj-btn-edit, .mj-btn-delete { padding: 0.55rem 1.1rem; border-radius: 8px; font-size: 0.85rem; font-weight: 600; cursor: pointer; font-family: inherit; transition: opacity 0.15s, background 0.15s; }
        .mj-btn-edit { background: #C9A84C; color: #fff; border: none; }
        .mj-btn-edit:hover { opacity: 0.88; }
        .mj-btn-delete { background: #fff; color: #d32f2f; border: 1px solid #f5c6c6; }
        .mj-btn-delete:hover { background: #fff5f5; }

        .mj-locked-banner {
          display: flex; align-items: flex-start; gap: 0.85rem;
          background: #fdf8ee; border: 1px solid rgba(201,168,76,0.3);
          border-radius: 12px; padding: 1rem 1.25rem; margin-bottom: 2rem;
        }
        .mj-locked-icon { color: #C9A84C; flex-shrink: 0; margin-top: 2px; }
        .mj-locked-title { font-size: 0.9rem; font-weight: 700; color: #5a4010; margin: 0 0 0.25rem; }
        .mj-locked-text { font-size: 0.85rem; color: #7a5c1e; margin: 0; line-height: 1.55; }

        .mj-stats { display: grid; grid-template-columns: repeat(4, 1fr); gap: 0; background: #fff; border: 1px solid #e8e8e8; border-radius: 12px; padding: 1.25rem 0; margin-bottom: 2rem; }
        .mj-stat { display: flex; flex-direction: column; align-items: center; gap: 4px; border-right: 1px solid #e8e8e8; border-radius: 6px; transition: background 0.15s; }
        .mj-stat:last-child { border-right: none; }
        .mj-stat-val { font-size: 1.4rem; font-weight: 700; color: #1a1a1a; }
        .mj-stat-key { font-size: 0.68rem; color: #999; text-transform: uppercase; letter-spacing: 0.06em; font-weight: 500; }

        .mj-card { background: #fff; border: 1px solid #e8e8e8; border-radius: 12px; padding: 1.5rem 1.75rem; margin-bottom: 1.25rem; }
        .mj-card-title { font-size: 0.95rem; font-weight: 700; color: #1a1a1a; margin: 0 0 1rem; }

        .mj-budget-row { display: flex; align-items: center; justify-content: space-between; }
        .mj-budget-amount { font-size: 1.5rem; font-weight: 700; color: #1a1a1a; }
        .mj-budget-type { font-size: 0.85rem; color: #999; }

        .mj-description { font-size: 0.92rem; color: #444; line-height: 1.75; white-space: pre-wrap; margin: 0; }

        .mj-skills { display: flex; gap: 8px; flex-wrap: wrap; }
        .mj-skill-pill { font-size: 0.82rem; padding: 5px 14px; border-radius: 99px; background: #f4f2ee; color: #5a5650; font-weight: 500; }

        .mj-milestone { padding: 1rem 0; border-bottom: 1px solid #f0f0f0; }
        .mj-milestone:last-child { border-bottom: none; }
        .mj-milestone-head { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 0.4rem; gap: 0.75rem; }
        .mj-milestone-title { font-size: 0.9rem; font-weight: 600; color: #1a1a1a; margin: 0; }
        .mj-milestone-amount { font-size: 0.9rem; font-weight: 700; color: #1a1a1a; white-space: nowrap; }
        .mj-milestone-desc { font-size: 0.85rem; color: #777; line-height: 1.6; margin: 0 0 0.5rem; }
        .mj-milestone-meta { font-size: 0.78rem; color: #aaa; display: flex; gap: 12px; }

        .mj-state { text-align: center; padding: 4rem 1rem; color: #888; font-size: 0.9rem; }

        @media (max-width: 600px) {
          .mj-stats { grid-template-columns: repeat(2, 1fr); }
          .mj-stat:nth-child(2) { border-right: none; }
          .mj-stat:nth-child(3) { border-top: 1px solid #e8e8e8; padding-top: 0.75rem; }
          .mj-stat:nth-child(4) { border-top: 1px solid #e8e8e8; padding-top: 0.75rem; }
        }
      `}</style>

            <div className="mj-page">
                <button className="mj-back" onClick={() => navigate('/client/dashboard')}>
                    ← Back to dashboard
                </button>

                {loading ? (
                    <div className="mj-state">Loading job details…</div>
                ) : error ? (
                    <div className="mj-state" style={{ color: '#d32f2f' }}>{error}</div>
                ) : !job ? (
                    <div className="mj-state">Job not found.</div>
                ) : (
                    <>
                        {/* Header */}
                        <div className="mj-header">
                            <div>
                                <h1 className="mj-title">{job.title}</h1>
                                <p className="mj-meta">
                                    {job.categoryName} · Posted {formatDate(job.postedAt)}
                                </p>
                                <div className="mj-pills">
                                    <span className="mj-pill">{scopeLabel[job.scope] || job.scope}</span>
                                    <span className="mj-pill">{experienceLabel[job.experienceLevel] || job.experienceLevel}</span>
                                    <span className="mj-pill gold">{job.jobType === 'FixedPrice' ? 'Fixed price' : 'Hourly'}</span>
                                </div>
                            </div>

                            {!hasProposals && (
                                <div className="mj-actions">
                                    <button className="mj-btn-edit" onClick={() => setEditingJob(true)}>Edit</button>
                                    <button className="mj-btn-delete" onClick={() => setDeletingJob(true)}>Delete</button>
                                </div>
                            )}
                        </div>

                        {/* Locked notice */}
                        {hasProposals && (
                            <div className="mj-locked-banner">
                                <svg className="mj-locked-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <circle cx="12" cy="12" r="10" />
                                    <line x1="12" y1="8" x2="12" y2="12" />
                                    <line x1="12" y1="16" x2="12.01" y2="16" />
                                </svg>
                                <div>
                                    <p className="mj-locked-title">This job can no longer be edited</p>
                                    <p className="mj-locked-text">
                                        This job has received proposals from freelancers, so editing or deleting it has been disabled to keep the process fair for everyone who applied.
                                    </p>
                                </div>
                            </div>
                        )}

                        {/* Stats */}
                        <div className="mj-stats">
                            <div
                                className="mj-stat"
                                style={{ cursor: job.stats?.proposals > 0 ? 'pointer' : 'default' }}
                                onClick={() => job.stats?.proposals > 0 && navigate(`/client/job-proposals?jobId=${job.id}`)}
                                onMouseEnter={(e) => { if (job.stats?.proposals > 0) e.currentTarget.style.background = '#fdf8ee'; }}
                                onMouseLeave={(e) => { if (job.stats?.proposals > 0) e.currentTarget.style.background = 'transparent'; }}
                            >
                                <span className="mj-stat-val" style={{ color: job.stats?.proposals > 0 ? '#C9A84C' : undefined }}>
                                    {job.stats?.proposals ?? 0}
                                </span>
                                <span className="mj-stat-key">Proposals</span>
                            </div>
                            <div className="mj-stat">
                                <span className="mj-stat-val">{job.stats?.invited ?? 0}</span>
                                <span className="mj-stat-key">Invited</span>
                            </div>
                            <div className="mj-stat">
                                <span className="mj-stat-val">{job.stats?.messaged ?? 0}</span>
                                <span className="mj-stat-key">Messaged</span>
                            </div>
                            <div className="mj-stat">
                                <span className="mj-stat-val">{job.stats?.hired ?? 0}</span>
                                <span className="mj-stat-key">Hired</span>
                            </div>
                        </div>

                        {/* Budget */}
                        <div className="mj-card">
                            <p className="mj-card-title">Budget</p>
                            <div className="mj-budget-row">
                                <span className="mj-budget-amount">
                                    {preferredCurrency !== (job?.budgetCurrency || 'EGP') && convertedBudget != null 
                                        ? `${Number(convertedBudget).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ${preferredCurrency}` 
                                        : `${Number(job?.budget).toLocaleString()} ${job?.budgetCurrency || 'EGP'}`}
                                </span>
                                <span className="mj-budget-type">{job.jobType === 'FixedPrice' ? 'Fixed price' : 'Hourly rate'}</span>
                            </div>
                        </div>

                        {/* Description */}
                        <div className="mj-card">
                            <p className="mj-card-title">Description</p>
                            <p className="mj-description">{job.description || 'No description provided.'}</p>
                        </div>

                        {/* Skills */}
                        {job.skills?.length > 0 && (
                            <div className="mj-card">
                                <p className="mj-card-title">Required Skills</p>
                                <div className="mj-skills">
                                    {job.skills.map((skill, idx) => (
                                        <span key={idx} className="mj-skill-pill">{skill}</span>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Milestones */}
                        {job.jobType === 'FixedPrice' && job.milestones?.length > 0 && (
                            <div className="mj-card">
                                <p className="mj-card-title">Milestones</p>
                                {job.milestones.map((m) => (
                                    <div key={m.id} className="mj-milestone">
                                        <div className="mj-milestone-head">
                                            <p className="mj-milestone-title">{m.title}</p>
                                            <span className="mj-milestone-amount">
                                                {preferredCurrency !== (job?.budgetCurrency || 'EGP') && convertedMilestones[m.id] != null
                                                    ? `${Number(convertedMilestones[m.id]).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ${preferredCurrency}`
                                                    : `${Number(m.amount).toLocaleString()} ${job?.budgetCurrency || 'EGP'}`}
                                            </span>
                                        </div>
                                        {m.description && <p className="mj-milestone-desc">{m.description}</p>}
                                        <div className="mj-milestone-meta">
                                            <span>Due {formatDate(m.dueDate)}</span>
                                            <span>{m.status}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </>
                )}
            </div>

            {/* Edit Modal */}
            {editingJob && job && (
                <EditJobDetailsModal
                    job={job}
                    onClose={() => setEditingJob(false)}
                    onSaved={(updated) => setJob((prev) => ({ ...prev, ...updated }))}
                />
            )}

            {/* Delete Confirm Modal */}
            {deletingJob && job && (
                <DeleteConfirmModal
                    job={job}
                    onClose={() => setDeletingJob(false)}
                    onDeleted={() => navigate('/client/dashboard')}
                />
            )}
        </>
    );
}