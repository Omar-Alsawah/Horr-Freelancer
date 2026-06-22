import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { updateJob, getCategories, getSkills } from '../../../services/clientService';
import axios from 'axios';

// ── Data normalizers (same pattern as PostJobPage) ──────────────────────────
async function fetchCategoriesData(options = {}) {
    try {
        const response = await getCategories(options);
        const data = response?.data || response;
        const rawList = Array.isArray(data) ? data : (data?.$values || []);
        return rawList.map((c) => ({
            id: c.id || c.Id,
            name: c.name || c.Name,
        }));
    } catch (err) {
        if (axios.isCancel(err) || err.code === 'ERR_CANCELED') throw err;
        console.error('Error fetching categories:', err);
        return [];
    }
}

async function fetchSkillsData(options = {}) {
    try {
        const data = await getSkills(options);
        const rawList = Array.isArray(data) ? data : (data?.$values || []);
        return rawList.map((s) => ({
            id: s.id || s.Id,
            name: s.name || s.Name,
        }));
    } catch (err) {
        if (axios.isCancel(err) || err.code === 'ERR_CANCELED') throw err;
        console.error('Error fetching skills:', err);
        return [];
    }
}

const SCOPE_OPTIONS = [
    { value: 'Small', label: 'Small' },
    { value: 'Medium', label: 'Medium' },
    { value: 'Large', label: 'Large' },
];

const EXPERIENCE_OPTIONS = [
    { value: 'Beginner', label: 'Entry level' },
    { value: 'Intermediate', label: 'Intermediate' },
    { value: 'Expert', label: 'Expert' },
];

const JOB_TYPE_OPTIONS = [
    { value: 'FixedPrice', label: 'Fixed price' },
    { value: 'Hourly', label: 'Hourly' },
];

const EditJobDetailsModal = ({ job, onClose, onSaved }) => {
    const [categories, setCategories] = useState([]);
    const [availableSkills, setAvailableSkills] = useState([]);
    const [loadingMeta, setLoadingMeta] = useState(true);
    const [loading, setLoading] = useState(false);
    const [skillInput, setSkillInput] = useState('');

    // skills = array of IDs (sent to backend), skillNames = array of display names (kept in sync)
    const [form, setForm] = useState({
        title: job.title || '',
        categoryId: job.categoryId || '',
        description: job.description || '',
        skills: [],
        skillNames: job.skills || [], // initial names from job details; resolved to IDs once metadata loads
        scope: job.scope || 'Medium',
        experienceLevel: job.experienceLevel || 'Intermediate',
        jobType: job.jobType || 'FixedPrice',
        budget: job.budget || '',
    });

    useEffect(() => {
        const controller = new AbortController();
        const loadMeta = async () => {
            setLoadingMeta(true);
            try {
                const [cats, skills] = await Promise.all([
                    fetchCategoriesData({ signal: controller.signal }), 
                    fetchSkillsData({ signal: controller.signal })
                ]);
                
                if (controller.signal.aborted) return;
                
                setCategories(cats);
                setAvailableSkills(skills);

                // Resolve the job's existing skill NAMES (from job details) into IDs using the loaded skills list
                setForm((prev) => {
                    const resolvedIds = [];
                    const resolvedNames = [];
                    prev.skillNames.forEach((name) => {
                        const match = skills.find((s) => s.name.toLowerCase() === name.toLowerCase());
                        if (match) {
                            resolvedIds.push(match.id);
                            resolvedNames.push(match.name);
                        } else {
                            // Skill no longer exists in the master list — drop it rather than send an invalid id
                            console.warn(`Skill "${name}" not found in skills list; removing from form.`);
                        }
                    });
                    return { ...prev, skills: resolvedIds, skillNames: resolvedNames };
                });

                setLoadingMeta(false);
            } catch (err) {
                if (axios.isCancel(err) || err.code === 'ERR_CANCELED') return;
                setLoadingMeta(false);
            }
        };
        loadMeta();
        return () => controller.abort();
    }, []);

    const patch = (fields) => setForm((prev) => ({ ...prev, ...fields }));

    const addSkill = (skill) => {
        if (!skill || form.skills.includes(skill.id)) return;
        patch({
            skills: [...form.skills, skill.id],
            skillNames: [...form.skillNames, skill.name],
        });
    };

    const removeSkill = (skillId) => {
        const idx = form.skills.indexOf(skillId);
        if (idx === -1) return;
        const newSkills = [...form.skills];
        const newNames = [...form.skillNames];
        newSkills.splice(idx, 1);
        newNames.splice(idx, 1);
        patch({ skills: newSkills, skillNames: newNames });
    };

    const handleSkillKey = (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            const found = availableSkills.find(
                (s) => s.name.toLowerCase() === skillInput.toLowerCase()
            );
            if (found) {
                addSkill(found);
                setSkillInput('');
            } else if (skillInput.trim()) {
                toast.info('Please select a skill from the suggested list.');
            }
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!form.title.trim()) {
            toast.error('Title is required');
            return;
        }

        setLoading(true);
        try {
            const updatedData = {
                ...job,
                title: form.title,
                categoryId: form.categoryId,
                description: form.description,
                skills: form.skills, // send IDs, matching backend expectations
                scope: form.scope,
                experienceLevel: form.experienceLevel,
                jobType: form.jobType,
                budget: form.budget ? parseFloat(form.budget) : job.budget,
            };
            await updateJob(job.id, updatedData);
            toast.success('Job updated successfully');
            // Reflect names (not ids) back to the parent for display purposes
            onSaved({ ...updatedData, skills: form.skillNames });
            onClose();
        } catch (err) {
            const message =
                err.response?.data?.errors?.[0] ||
                err.response?.data?.message ||
                err.message ||
                'Failed to update job';
            toast.error(message);
        } finally {
            setLoading(false);
        }
    };

    const suggestedSkills = availableSkills
        .filter((s) => !form.skills.includes(s.id))
        .slice(0, 8);

    return (
        <div
            onClick={onClose}
            style={{
                position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                zIndex: 600, padding: '1rem', backdropFilter: 'blur(3px)',
            }}
        >
            <div
                onClick={(e) => e.stopPropagation()}
                style={{
                    background: '#fff', borderRadius: '18px', width: '100%',
                    maxWidth: '640px', maxHeight: '90vh', overflowY: 'auto',
                    boxShadow: '0 20px 70px rgba(0,0,0,0.22)',
                }}
            >
                {/* Header */}
                <div style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    padding: '1.5rem 1.75rem', borderBottom: '1px solid #eee',
                    position: 'sticky', top: 0, background: '#fff', zIndex: 1,
                }}>
                    <div>
                        <h2 style={{ fontSize: '1.15rem', fontWeight: '700', color: '#1a1a1a', margin: '0 0 2px' }}>
                            Edit job post
                        </h2>
                        <p style={{ fontSize: '0.8rem', color: '#999', margin: 0 }}>
                            Update the details of your job post
                        </p>
                    </div>
                    <button
                        onClick={onClose}
                        style={{
                            background: '#f4f2ee', border: 'none', width: '32px', height: '32px',
                            borderRadius: '50%', display: 'flex', alignItems: 'center',
                            justifyContent: 'center', cursor: 'pointer', color: '#9a9590', flexShrink: 0,
                        }}
                    >
                        ✕
                    </button>
                </div>

                <form onSubmit={handleSubmit} style={{ padding: '1.75rem' }}>

                    {/* Title */}
                    <div style={{ marginBottom: '1.5rem' }}>
                        <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: '600', color: '#5a5650', marginBottom: '0.5rem' }}>
                            Job Title
                        </label>
                        <input
                            value={form.title}
                            onChange={(e) => patch({ title: e.target.value })}
                            placeholder="e.g. Build a React dashboard"
                            style={{
                                width: '100%', padding: '0.7rem 0.95rem', border: '1.5px solid #e6e4df',
                                borderRadius: '8px', fontSize: '0.92rem', fontFamily: 'inherit',
                                background: '#fafaf8', outline: 'none',
                            }}
                        />
                    </div>

                    {/* Category */}
                    <div style={{ marginBottom: '1.5rem' }}>
                        <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: '600', color: '#5a5650', marginBottom: '0.5rem' }}>
                            Category
                        </label>
                        <select
                            value={form.categoryId}
                            onChange={(e) => patch({ categoryId: e.target.value })}
                            disabled={loadingMeta}
                            style={{
                                width: '100%', padding: '0.7rem 0.95rem', border: '1.5px solid #e6e4df',
                                borderRadius: '8px', fontSize: '0.92rem', fontFamily: 'inherit',
                                background: '#fafaf8', outline: 'none', cursor: 'pointer',
                            }}
                        >
                            <option value="">Select a category</option>
                            {categories.map((c) => (
                                <option key={c.id} value={c.id}>{c.name}</option>
                            ))}
                        </select>
                    </div>

                    {/* Description */}
                    <div style={{ marginBottom: '1.5rem' }}>
                        <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: '600', color: '#5a5650', marginBottom: '0.5rem' }}>
                            Description
                        </label>
                        <textarea
                            value={form.description}
                            onChange={(e) => patch({ description: e.target.value })}
                            placeholder="Describe the job..."
                            rows={5}
                            style={{
                                width: '100%', padding: '0.7rem 0.95rem', border: '1.5px solid #e6e4df',
                                borderRadius: '8px', fontSize: '0.92rem', fontFamily: 'inherit',
                                background: '#fafaf8', outline: 'none', resize: 'vertical', lineHeight: '1.6',
                            }}
                        />
                    </div>

                    {/* Skills */}
                    <div style={{ marginBottom: '1.5rem' }}>
                        <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: '600', color: '#5a5650', marginBottom: '0.5rem' }}>
                            Required Skills
                        </label>

                        {loadingMeta ? (
                            <p style={{ fontSize: '0.82rem', color: '#999', margin: '0 0 0.5rem' }}>Loading skills…</p>
                        ) : (
                            form.skillNames.length > 0 && (
                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '0.75rem' }}>
                                    {form.skillNames.map((name, idx) => (
                                        <span
                                            key={form.skills[idx]}
                                            style={{
                                                display: 'inline-flex', alignItems: 'center', gap: '6px',
                                                background: '#B7A06A', color: '#fff', padding: '5px 12px',
                                                borderRadius: '20px', fontSize: '0.82rem', fontWeight: '500',
                                            }}
                                        >
                                            {name}
                                            <button
                                                type="button"
                                                onClick={() => removeSkill(form.skills[idx])}
                                                style={{ background: 'none', border: 'none', color: '#fff', cursor: 'pointer', fontSize: '1rem', lineHeight: 1, padding: 0, opacity: 0.85 }}
                                            >
                                                ×
                                            </button>
                                        </span>
                                    ))}
                                </div>
                            )
                        )}

                        <input
                            value={skillInput}
                            onChange={(e) => setSkillInput(e.target.value)}
                            onKeyDown={handleSkillKey}
                            placeholder="Type a skill and press Enter..."
                            disabled={loadingMeta}
                            style={{
                                width: '100%', padding: '0.65rem 0.95rem', border: '1.5px solid #e6e4df',
                                borderRadius: '8px', fontSize: '0.9rem', fontFamily: 'inherit',
                                background: '#fafaf8', outline: 'none', marginBottom: '0.6rem',
                            }}
                        />

                        {suggestedSkills.length > 0 && (
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                                {suggestedSkills.map((s) => (
                                    <button
                                        type="button"
                                        key={s.id}
                                        onClick={() => addSkill(s)}
                                        style={{
                                            padding: '5px 12px', borderRadius: '20px', border: '1px solid #e6e4df',
                                            background: '#fff', color: '#5a5650', fontSize: '0.78rem',
                                            fontWeight: '500', cursor: 'pointer', fontFamily: 'inherit',
                                        }}
                                    >
                                        + {s.name}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Scope */}
                    <div style={{ marginBottom: '1.5rem' }}>
                        <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: '600', color: '#5a5650', marginBottom: '0.5rem' }}>
                            Project Scale
                        </label>
                        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                            {SCOPE_OPTIONS.map((opt) => (
                                <button
                                    type="button"
                                    key={opt.value}
                                    onClick={() => patch({ scope: opt.value })}
                                    style={{
                                        padding: '8px 18px', borderRadius: '20px',
                                        border: form.scope === opt.value ? '1.5px solid #B7A06A' : '1.5px solid #e6e4df',
                                        background: form.scope === opt.value ? '#B7A06A' : '#fff',
                                        color: form.scope === opt.value ? '#fff' : '#1a1a1a',
                                        fontSize: '0.85rem', fontWeight: '500', cursor: 'pointer', fontFamily: 'inherit',
                                    }}
                                >
                                    {opt.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Experience Level */}
                    <div style={{ marginBottom: '1.5rem' }}>
                        <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: '600', color: '#5a5650', marginBottom: '0.5rem' }}>
                            Experience Level
                        </label>
                        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                            {EXPERIENCE_OPTIONS.map((opt) => (
                                <button
                                    type="button"
                                    key={opt.value}
                                    onClick={() => patch({ experienceLevel: opt.value })}
                                    style={{
                                        padding: '8px 18px', borderRadius: '20px',
                                        border: form.experienceLevel === opt.value ? '1.5px solid #B7A06A' : '1.5px solid #e6e4df',
                                        background: form.experienceLevel === opt.value ? '#B7A06A' : '#fff',
                                        color: form.experienceLevel === opt.value ? '#fff' : '#1a1a1a',
                                        fontSize: '0.85rem', fontWeight: '500', cursor: 'pointer', fontFamily: 'inherit',
                                    }}
                                >
                                    {opt.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Job Type + Budget */}
                    <div style={{ display: 'flex', gap: '1.25rem', marginBottom: '1.75rem', flexWrap: 'wrap' }}>
                        <div style={{ flex: '1 1 200px' }}>
                            <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: '600', color: '#5a5650', marginBottom: '0.5rem' }}>
                                Job Type
                            </label>
                            <div style={{ display: 'flex', gap: '8px' }}>
                                {JOB_TYPE_OPTIONS.map((opt) => (
                                    <button
                                        type="button"
                                        key={opt.value}
                                        onClick={() => patch({ jobType: opt.value })}
                                        style={{
                                            flex: 1, padding: '8px 0', borderRadius: '8px',
                                            border: form.jobType === opt.value ? '1.5px solid #B7A06A' : '1.5px solid #e6e4df',
                                            background: form.jobType === opt.value ? '#B7A06A' : '#fff',
                                            color: form.jobType === opt.value ? '#fff' : '#1a1a1a',
                                            fontSize: '0.85rem', fontWeight: '500', cursor: 'pointer', fontFamily: 'inherit',
                                        }}
                                    >
                                        {opt.label}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div style={{ flex: '1 1 160px' }}>
                            <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: '600', color: '#5a5650', marginBottom: '0.5rem' }}>
                                Budget ({job.budgetCurrency || 'EGP'})
                            </label>
                            <input
                                type="number"
                                min="0"
                                value={form.budget}
                                onChange={(e) => patch({ budget: e.target.value })}
                                placeholder="e.g. 5000"
                                style={{
                                    width: '100%', padding: '0.7rem 0.95rem', border: '1.5px solid #e6e4df',
                                    borderRadius: '8px', fontSize: '0.92rem', fontFamily: 'inherit',
                                    background: '#fafaf8', outline: 'none', fontWeight: '600',
                                }}
                            />
                        </div>
                    </div>

                    {/* Actions */}
                    <div style={{ display: 'flex', gap: '0.75rem', paddingTop: '0.5rem', borderTop: '1px solid #eee' }}>
                        <button
                            type="submit"
                            disabled={loading || loadingMeta}
                            style={{
                                padding: '0.7rem 1.6rem', borderRadius: '8px', border: 'none',
                                background: '#B7A06A', color: '#fff', fontWeight: '600',
                                fontSize: '0.9rem', cursor: 'pointer', opacity: (loading || loadingMeta) ? 0.7 : 1,
                                fontFamily: 'inherit', marginTop: '1rem',
                            }}
                        >
                            {loading ? 'Saving…' : 'Save Changes'}
                        </button>
                        <button
                            type="button"
                            onClick={onClose}
                            disabled={loading}
                            style={{
                                padding: '0.7rem 1.5rem', borderRadius: '8px', border: '1px solid #e6e4df',
                                background: '#fff', color: '#1a1a1a', fontWeight: '500',
                                fontSize: '0.9rem', cursor: 'pointer', fontFamily: 'inherit', marginTop: '1rem',
                            }}
                        >
                            Cancel
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default EditJobDetailsModal;