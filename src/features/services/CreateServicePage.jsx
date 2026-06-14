import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../api/axios';

const STEPS = ['Overview','Pricing','Gallery','Process','Description','Review'];

function Stepper({ currentStep }) {
  const progress = ((currentStep - 1) / (STEPS.length - 1)) * 100;
  return (
    <div className="stepper-container animate-fade-scale delay-1">
      <div className="stepper-line">
        <div className="stepper-line-progress" style={{ width: `${progress}%` }}></div>
      </div>
      {STEPS.map((name, i) => {
        const stepNum = i + 1;
        let cls = 'step-item';
        if (currentStep === stepNum) cls += ' active';
        else if (currentStep > stepNum) cls += ' completed';
        return (
          <div key={stepNum} className={cls}>
            <div className="step-circle">{stepNum}</div>
            <div className="step-label">{name}</div>
          </div>
        );
      })}
    </div>
  );
}

export default function CreateServicePage() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const [threeTiers, setThreeTiers] = useState(true);

  const [form, setForm] = useState({
    title: '', category: '', subcategory: '',
    attributes: [], newAttr: '',
    starter: { title:'', desc:'', days:'1', revisions:'', sections:'1', price:'15.00' },
    standard: { title:'', desc:'', days:'3', revisions:'', sections:'3', price:'30.00' },
    advanced: { title:'', desc:'', days:'5', revisions:'', sections:'5', price:'60.00' },
    tierOptions: [
      { name:'Source Code', starter:true, standard:true, advanced:true },
      { name:'Commercial Use', starter:false, standard:true, advanced:true }
    ],
    requirements: [{ text:'', required:false }],
    steps: [{ title:'', desc:'' }],
    description: '',
    faqs: []
  });

  const set = (key, val) => setForm(p => ({ ...p, [key]: val }));
  const setTier = (tier, field, val) => setForm(p => ({ ...p, [tier]: { ...p[tier], [field]: val } }));
  const goExit = () => navigate('/services/my-services');
  const next = () => step < 6 && setStep(step + 1);
  const back = () => step > 1 && setStep(step - 1);

  const addAttr = () => {
    const v = form.newAttr.trim();
    if (v && !form.attributes.includes(v)) {
      set('attributes', [...form.attributes, v]);
      set('newAttr', '');
    }
  };

  const removeAttr = (i) => set('attributes', form.attributes.filter((_, idx) => idx !== i));

  const addRequirement = () => set('requirements', [...form.requirements, { text:'', required:false }]);
  const removeRequirement = (i) => set('requirements', form.requirements.filter((_, idx) => idx !== i));
  const setReq = (i, f, v) => set('requirements', form.requirements.map((r, idx) => idx === i ? { ...r, [f]: v } : r));

  const addStep = () => set('steps', [...form.steps, { title:'', desc:'' }]);
  const removeStep = (i) => set('steps', form.steps.filter((_, idx) => idx !== i));
  const setStepField = (i, f, v) => set('steps', form.steps.map((s, idx) => idx === i ? { ...s, [f]: v } : s));

  const addFaq = () => { if (form.faqs.length < 5) set('faqs', [...form.faqs, { q:'', a:'' }]); };
  const removeFaq = (i) => set('faqs', form.faqs.filter((_, idx) => idx !== i));
  const setFaq = (i, f, v) => set('faqs', form.faqs.map((fq, idx) => idx === i ? { ...fq, [f]: v } : fq));

  const addTierOption = () => set('tierOptions', [...form.tierOptions, { name:'', starter:true, standard:true, advanced:true }]);
  const removeTierOption = (i) => set('tierOptions', form.tierOptions.filter((_, idx) => idx !== i));
  const setTierOpt = (i, f, v) => set('tierOptions', form.tierOptions.map((o, idx) => idx === i ? { ...o, [f]: v } : o));

  const publish = async () => {
    setSubmitting(true);
    try {
      await api.post('/api/services', { title: form.title, category: form.category, subcategory: form.subcategory, description: form.description, price: form.starter.price });
      alert('Service submitted successfully!');
      navigate('/services/my-services');
    } catch (e) {
      console.error(e);
      setSubmitting(false);
    }
  };

  const footerButtons = (showBack = true) => (
    <div style={{ display:'flex', justifyContent:'flex-end', gap:'1rem', marginTop:'2rem', borderTop:'1px solid var(--color-border)', paddingTop:'2rem' }}>
      {showBack && <button className="btn btn-outline" onClick={back} type="button">Back</button>}
      <button className="btn btn-outline" onClick={goExit} type="button">Save &amp; exit</button>
      <button className="btn btn-success" onClick={next} type="button">Save &amp; Continue</button>
    </div>
  );

  return (
    <div className="creation-flow-wrapper animate-fade-up">
      <Stepper currentStep={step} />

      {/* STEP 1: OVERVIEW */}
      {step === 1 && (
        <div className="creation-grid">
          <div className="creation-main">
            <h1 className="page-title animate-slide-right delay-2">Service overview</h1>
            <div className="card project-creation-card animate-fade-up delay-3">
              <div className="form-section">
                <label className="form-label">Title</label>
                <p className="form-hint">Tell the client what you will deliver and how it benefits them.</p>
                <input type="text" className="form-input" placeholder="I will craft a brilliant landing page" value={form.title} onChange={e => set('title', e.target.value)} />
              </div>
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'2rem' }}>
                <div className="form-section">
                  <label className="form-label">Category</label>
                  <p className="form-hint">Select a category for your project.</p>
                  <select className="form-select" value={form.category} onChange={e => set('category', e.target.value)}>
                    <option value="">Select a category</option>
                    <option value="Web Development">Web Development</option>
                    <option value="Design">Design</option>
                  </select>
                </div>
                <div className="form-section">
                  <label className="form-label">Subcategory</label>
                  <p className="form-hint">Select a secondary category that's relevant to your project.</p>
                  <select className="form-select" value={form.subcategory} onChange={e => set('subcategory', e.target.value)}>
                    <option value="">Select a subcategory</option>
                    <option value="Landing Page">Landing Page</option>
                    <option value="UI Design">UI Design</option>
                  </select>
                </div>
              </div>
              <div className="form-section">
                <label className="form-label">Project attributes <span style={{ fontWeight:'normal', color:'var(--color-text-secondary)' }}>(Optional)</span></label>
                <p className="form-hint">Choose up to 3</p>
                <div style={{ display:'flex', gap:'0.5rem', flexWrap:'wrap', marginTop:'0.5rem' }}>
                  {form.attributes.map((attr, i) => (
                    <span key={i} className="skill-badge" style={{ display:'inline-flex', alignItems:'center', gap:'0.5rem' }}>
                      {attr} <span style={{ cursor:'pointer', fontWeight:'bold' }} onClick={() => removeAttr(i)}>×</span>
                    </span>
                  ))}
                </div>
                <div style={{ display:'flex', gap:'0.5rem', marginTop:'0.5rem' }}>
                  <input type="text" className="form-input" placeholder="Add custom attribute" style={{ width:'auto', flexGrow:1 }} value={form.newAttr} onChange={e => set('newAttr', e.target.value)} onKeyDown={e => { if(e.key==='Enter'){e.preventDefault();addAttr();}}} />
                  <button className="btn btn-outline" style={{ padding:'0 1rem' }} onClick={addAttr} type="button">Add</button>
                </div>
              </div>
              {footerButtons(false)}
            </div>
          </div>
          <aside className="sidebar-tips creation-sidebar animate-fade-up delay-4">
            <h3>Tips regarding the title</h3>
            <div style={{ marginBottom:'2rem' }}>
              <h4 style={{ fontSize:'0.9rem', marginBottom:'0.5rem' }}>Be specific</h4>
              <p style={{ fontSize:'0.85rem', color:'var(--color-text-secondary)', lineHeight:1.4 }}>"I will create a logo" is good, but "I will design a minimalist modern logo for tech startups" is better.</p>
            </div>
            <div>
              <h4 style={{ fontSize:'0.9rem', marginBottom:'0.5rem' }}>Category</h4>
              <p style={{ fontSize:'0.85rem', color:'var(--color-text-secondary)', lineHeight:1.4 }}>Select the category that best fits your service. This helps clients find you.</p>
            </div>
          </aside>
        </div>
      )}

      {/* STEP 2: PRICING */}
      {step === 2 && (<>
        <h1 className="page-title animate-slide-right delay-2">Price &amp; scope</h1>
        <p className="form-hint animate-slide-right delay-3" style={{ marginBottom:'2rem' }}>Customize and price your service with tiered pricing.</p>
        <div className="animate-fade-scale delay-4" style={{ marginBottom:'1.5rem' }}>
          <label className="switch"><input type="checkbox" checked={threeTiers} onChange={e => setThreeTiers(e.target.checked)} /><span className="slider"></span></label>
          <span style={{ fontWeight:600, marginLeft:'0.5rem' }}>3 Tiers</span>
        </div>

        <div className={`pricing-grid animate-fade-up delay-5${!threeTiers ? ' single-tier' : ''}`}>
          {['starter','standard','advanced'].map((tier, ti) => {
            const labels = ['Starter','Standard','Advanced'];
            const t = form[tier];
            return (
              <div className="pricing-card" key={tier}>
                <div className="tier-header">{labels[ti]}</div>
                <div className="tier-input-group"><label className="tier-label">Custom Title</label><input type="text" className="tier-input" placeholder="Name your package" value={t.title} onChange={e => setTier(tier,'title',e.target.value)} /></div>
                <div className="tier-input-group"><label className="tier-label">Custom Description</label><textarea className="tier-input" placeholder="Describe the details of your offering" style={{ height:'100px', resize:'none' }} value={t.desc} onChange={e => setTier(tier,'desc',e.target.value)}></textarea></div>
                <div className="tier-input-group"><label className="tier-label">Delivery Days</label><select className="tier-input" value={t.days} onChange={e => setTier(tier,'days',e.target.value)}><option value="1">1 Day</option><option value="3">3 Days</option><option value="5">5 Days</option><option value="7">7 Days</option><option value="10">10 Days</option></select></div>
                <div className="tier-input-group"><label className="tier-label">Number of Revisions</label><input type="number" className="tier-input" min="0" placeholder="0" value={t.revisions} onChange={e => setTier(tier,'revisions',e.target.value)} /></div>
                <div className="tier-input-group"><label className="tier-label">Number of Sections</label><select className="tier-input" value={t.sections} onChange={e => setTier(tier,'sections',e.target.value)}><option value="1">1</option><option value="3">3</option><option value="5">5</option><option value="10">10</option><option value="15">15</option></select></div>
                <div className="tier-input-group" style={{ marginTop:'1.5rem' }}><label className="tier-label">Project Price</label><div style={{ display:'flex', alignItems:'center' }}><span style={{ fontSize:'1.2rem', marginRight:'0.5rem', fontWeight:700 }}>$</span><input type="number" className="tier-input" value={t.price} onChange={e => setTier(tier,'price',e.target.value)} /></div></div>
              </div>
            );
          })}
        </div>

        <h3 style={{ fontSize:'1.1rem', margin:'2rem 0 1rem' }}>Service Tier Options</h3>
        <table className={`tier-options-table${!threeTiers ? ' single-tier-table' : ''}`}>
          <thead><tr><th>Option</th><th>Starter</th><th>Standard</th><th>Advanced</th></tr></thead>
          <tbody>
            {form.tierOptions.map((opt, i) => (
              <tr key={i}>
                <td>{i < 2 ? opt.name : (<div style={{ display:'flex', alignItems:'center', gap:'0.5rem' }}><input type="text" className="tier-input" placeholder="Feature Name" style={{ padding:'0.4rem', fontSize:'0.9rem' }} value={opt.name} onChange={e => setTierOpt(i,'name',e.target.value)} /><span onClick={() => removeTierOption(i)} style={{ cursor:'pointer', fontSize:'0.8rem' }}>❌</span></div>)}</td>
                <td style={{ textAlign:'center' }}><input type="checkbox" checked={opt.starter} onChange={e => setTierOpt(i,'starter',e.target.checked)} /></td>
                <td style={{ textAlign:'center' }}><input type="checkbox" checked={opt.standard} onChange={e => setTierOpt(i,'standard',e.target.checked)} /></td>
                <td style={{ textAlign:'center' }}><input type="checkbox" checked={opt.advanced} onChange={e => setTierOpt(i,'advanced',e.target.checked)} /></td>
              </tr>
            ))}
          </tbody>
        </table>
        <div style={{ marginTop:'1rem', cursor:'pointer', color:'var(--color-primary-gold, #C5A065)', fontWeight:600 }} onClick={addTierOption}>+ Create custom add-on</div>

        <div style={{ display:'flex', justifyContent:'flex-end', gap:'1rem', borderTop:'1px solid var(--color-border)', paddingTop:'2rem', marginTop:'2rem' }}>
          <button className="btn btn-outline" onClick={back} type="button">Back</button>
          <button className="btn" style={{ color:'var(--color-text-main)', border:'none', background:'transparent', cursor:'pointer' }} onClick={goExit} type="button">Save &amp; exit</button>
          <button className="btn btn-success" onClick={next} type="button">Save &amp; Continue</button>
        </div>
      </>)}

      {/* STEP 3: GALLERY */}
      {step === 3 && (
        <div className="creation-grid">
          <div className="creation-main">
            <h1 className="page-title animate-slide-right delay-2">Create a service gallery</h1>
            <p className="form-hint animate-slide-right delay-3" style={{ marginBottom:'2rem' }}>Upload images, a video, and documents to showcase your service.</p>
            <div className="card gallery-section animate-fade-up delay-4">
              <h3>Service Images</h3>
              <p>Upload up to 15 images (.jpg or .png), up to 10MB each.</p>
              <div className="upload-grid">
                <div className="upload-placeholder"><div className="upload-icon">📤</div><div>Drag image here or <span style={{ color:'var(--color-primary-gold, #C5A065)', fontWeight:600 }}>browse</span></div></div>
                <div className="upload-placeholder" style={{ borderStyle:'dotted', background:'transparent' }}></div>
              </div>
            </div>
            <div className="card gallery-section animate-fade-up delay-5">
              <h3>Service Video</h3>
              <p>Upload one video (mp4), up to 100MB and less than 90 seconds.</p>
              <div className="upload-grid">
                <div className="upload-placeholder"><div className="upload-icon">🎥</div><div>Drag video here or <span style={{ color:'var(--color-primary-gold, #C5A065)', fontWeight:600 }}>browse</span></div></div>
              </div>
            </div>
            <div className="card gallery-section animate-fade-up delay-6">
              <h3>Sample Documents <span style={{ fontWeight:'normal', color:'#777' }}>(Optional)</span></h3>
              <p>Add up to 3 PDF files (.pdf), up to 15MB each.</p>
              <div className="upload-grid">
                <div className="upload-placeholder"><div className="upload-icon">📄</div><div>Drag document here or <span style={{ color:'var(--color-primary-gold, #C5A065)', fontWeight:600 }}>browse</span></div></div>
              </div>
            </div>
            <div style={{ display:'flex', justifyContent:'flex-end', gap:'1rem', borderTop:'1px solid var(--color-border)', paddingTop:'2rem', marginTop:'2rem' }}>
              <button className="btn btn-outline" onClick={back} type="button">Back</button>
              <button className="btn btn-outline" onClick={goExit} type="button">Save &amp; exit</button>
              <button className="btn btn-success" onClick={next} type="button">Continue</button>
            </div>
          </div>
          <aside className="sidebar-tips creation-sidebar animate-fade-up delay-5">
            <h3>Gallery guidelines</h3>
            <p>Highlight your work with professional, high-quality images, videos, and documents. Only add work you own or have the right to use.</p>
            <h4 style={{ fontSize:'0.9rem', marginBottom:'0.5rem' }}>What to avoid:</h4>
            <ul style={{ paddingLeft:'1.2rem', fontSize:'0.85rem', color:'var(--color-text-secondary)', lineHeight:1.6 }}>
              <li>Blurry or distorted work</li><li>Poorly cropped images</li><li>Text-heavy images</li><li>Referencing other companies</li><li>Work that's not related to this project</li>
            </ul>
          </aside>
        </div>
      )}

      {/* STEP 4: PROCESS */}
      {step === 4 && (
        <div className="creation-grid animate-fade-up delay-2">
          <div className="creation-main">
            <h1 className="animate-slide-right delay-3" style={{ fontSize:'1.8rem', margin:'0 0 2rem 0' }}>Requirements and steps</h1>
            <section style={{ marginBottom:'3rem' }}>
              <h2 style={{ fontSize:'1.25rem', marginBottom:'0.5rem' }}>Info you'll need from the client</h2>
              <p style={{ fontSize:'0.9rem', color:'var(--color-text-secondary)', marginBottom:'1.5rem' }}>Ask the client for any information or materials you need to start working on their service.</p>
              <div>
                {form.requirements.map((req, i) => (
                  <div className="requirement-card" key={i}>
                    <button className="remove-icon" onClick={() => removeRequirement(i)} type="button">×</button>
                    <label style={{ fontSize:'0.85rem', color:'#777', marginBottom:'0.5rem', display:'block' }}>Requirement</label>
                    <textarea className="textarea-limited" value={req.text} onChange={e => setReq(i,'text',e.target.value)}></textarea>
                    <div className="char-count">{req.text.length}/250 characters (min. 10)</div>
                    <label className="checkbox-label" style={{ marginTop:'1rem' }}><input type="checkbox" checked={req.required} onChange={e => setReq(i,'required',e.target.checked)} /> Client needs to answer before I can start working</label>
                  </div>
                ))}
              </div>
              <div style={{ color:'var(--color-success, #C5A065)', fontWeight:500, cursor:'pointer' }} onClick={addRequirement}>+ Add a requirement</div>
            </section>
            <section>
              <h2 style={{ fontSize:'1.25rem', marginBottom:'0.5rem' }}>Steps you'll take to get the service done</h2>
              <p style={{ fontSize:'0.9rem', color:'var(--color-text-secondary)', marginBottom:'1.5rem' }}>Share your step-by-step process so the client will know how you'll work on their service.</p>
              <div>
                {form.steps.map((s, i) => (
                  <div className="step-card" key={i}>
                    <button className="remove-icon" onClick={() => removeStep(i)} type="button">×</button>
                    <div style={{ marginBottom:'1rem' }}>
                      <label style={{ fontSize:'0.85rem', color:'#777', marginBottom:'0.5rem', display:'block' }}>Step {i+1} title</label>
                      <input type="text" className="form-input" value={s.title} onChange={e => setStepField(i,'title',e.target.value)} />
                      <div className="char-count">{s.title.length}/75 characters (min. 3)</div>
                    </div>
                    <div>
                      <label style={{ fontSize:'0.85rem', color:'#777', marginBottom:'0.5rem', display:'block' }}>Description (optional)</label>
                      <textarea className="textarea-limited" value={s.desc} onChange={e => setStepField(i,'desc',e.target.value)}></textarea>
                      <div className="char-count">{s.desc.length}/250 characters</div>
                    </div>
                  </div>
                ))}
              </div>
              <div style={{ color:'var(--color-success, #C5A065)', fontWeight:500, cursor:'pointer' }} onClick={addStep}>+ Add a step</div>
            </section>
            <div style={{ display:'flex', justifyContent:'flex-end', gap:'1rem', marginTop:'4rem', paddingTop:'2rem', borderTop:'1px solid var(--color-border)' }}>
              <button className="btn btn-outline" onClick={back} type="button">Back</button>
              <button className="btn" style={{ color:'var(--color-text-main)', border:'none', background:'transparent', cursor:'pointer' }} onClick={goExit} type="button">Save &amp; exit</button>
              <button className="btn btn-success" onClick={next} type="button">Save &amp; Continue</button>
            </div>
          </div>
          <aside className="sidebar-tips" style={{ alignSelf:'start' }}>
            <h3>Tips if you're stuck</h3>
            <div style={{ marginBottom:'2rem' }}><h4 style={{ fontSize:'0.9rem', marginBottom:'0.5rem' }}>Requirements</h4><p>Pretend you're meeting with the client for the first time. What information or materials would you need them to send you?</p></div>
            <div><h4 style={{ fontSize:'0.9rem', marginBottom:'0.5rem' }}>Steps</h4><p>Think of steps like your milestones or to-do list. What will you need to do to finish this service?</p></div>
          </aside>
        </div>
      )}

      {/* STEP 5: DESCRIPTION */}
      {step === 5 && (
        <div className="creation-grid animate-fade-up delay-2">
          <div className="creation-main">
            <h1 className="page-title animate-slide-right delay-2">Project description</h1>
            <div className="card project-creation-card animate-fade-up delay-3">
              <div className="form-section">
                <h3 style={{ fontSize:'1.1rem', marginBottom:'0.5rem' }}>Project summary</h3>
                <p className="form-hint" style={{ marginBottom:'1rem' }}>Briefly explain what sets you and your project apart.</p>
                <textarea style={{ width:'100%', height:'200px', padding:'1rem', border:'1px solid var(--color-border)', borderRadius:'8px', fontFamily:'inherit', resize:'vertical' }} value={form.description} onChange={e => set('description', e.target.value)}></textarea>
                <div style={{ textAlign:'right', fontSize:'0.75rem', color:'#777', marginTop:'0.3rem' }}>min. 120 characters</div>
              </div>
              <div className="form-section" style={{ marginTop:'3rem' }}>
                <h3 style={{ fontSize:'1.1rem', marginBottom:'0.5rem' }}>Frequently asked questions (optional)</h3>
                <p className="form-hint" style={{ marginBottom:'1rem' }}>Write answers to common questions your client ask. Add up to 5 questions.</p>
                <div>
                  {form.faqs.map((faq, i) => (
                    <div key={i} style={{ marginBottom:'1rem' }} className="animate-fade-up">
                      <input type="text" className="form-input" placeholder="Question" style={{ marginBottom:'0.5rem', fontWeight:600 }} value={faq.q} onChange={e => setFaq(i,'q',e.target.value)} />
                      <textarea className="form-input" placeholder="Answer" style={{ height:'80px', resize:'none' }} value={faq.a} onChange={e => setFaq(i,'a',e.target.value)}></textarea>
                      <div style={{ textAlign:'right', marginTop:'0.2rem' }}><span style={{ color:'#ff4d4f', cursor:'pointer', fontSize:'0.8rem' }} onClick={() => removeFaq(i)}>Remove</span></div>
                    </div>
                  ))}
                </div>
                <div style={{ color:'var(--color-success, #C5A065)', fontWeight:500, cursor:'pointer', marginTop:'1rem' }} onClick={addFaq}>+ Add a question</div>
              </div>
              <div style={{ display:'flex', justifyContent:'flex-end', gap:'1rem', marginTop:'4rem', paddingTop:'2rem', borderTop:'1px solid var(--color-border)' }}>
                <button className="btn btn-outline" onClick={back} type="button">Back</button>
                <button className="btn btn-outline" onClick={goExit} type="button">Save &amp; exit</button>
                <button className="btn btn-success" onClick={next} type="button">Save &amp; Continue</button>
              </div>
            </div>
          </div>
          <aside className="sidebar-tips creation-sidebar animate-fade-up delay-4">
            <h3>Project details</h3>
            <ul style={{ paddingLeft:'1.2rem', fontSize:'0.85rem', color:'var(--color-text-secondary)', lineHeight:1.6 }}>
              <li>Add more details about your offering and why clients should work with you.</li>
              <li>Show potential clients the steps you take to complete your project.</li>
              <li>Address common client questions to save the back and forth.</li>
            </ul>
          </aside>
        </div>
      )}

      {/* STEP 6: REVIEW */}
      {step === 6 && (<>
        <h1 className="page-title animate-slide-right delay-2">Review &amp; Publish</h1>
        <p className="form-hint animate-slide-right delay-3" style={{ marginBottom:'2rem' }}>Double check your details before publishing.</p>
        <div className="review-section animate-fade-up delay-4">
          <div className="review-label">Title</div>
          <div className="review-value">{form.title || 'Untitled Service'}</div>
          <div className="review-label">Category</div>
          <div className="review-value">{form.category || 'Uncategorized'}</div>
          <div className="review-label">Subcategory</div>
          <div className="review-value">{form.subcategory || '-'}</div>
          <div className="review-label">Description</div>
          <div className="review-value" style={{ fontSize:'0.95rem', lineHeight:1.5 }}>{form.description || 'No description provided.'}</div>
        </div>
        <div style={{ display:'flex', justifyContent:'flex-end', gap:'1rem', marginTop:'2rem', paddingTop:'2rem', borderTop:'1px solid var(--color-border)' }}>
          <button className="btn btn-outline" onClick={back} disabled={submitting} type="button">Back</button>
          <button className="btn btn-success" onClick={publish} disabled={submitting} type="button">{submitting ? 'Publishing...' : 'Publish Service'}</button>
        </div>
      </>)}
    </div>
  );
}
