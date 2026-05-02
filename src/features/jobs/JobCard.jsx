import { useTranslation } from 'react-i18next';
import { Heart } from 'lucide-react';

function formatBudget(min, max, lang) {
  const fmt = (n) => {
    if (lang === 'ar') {
      return new Intl.NumberFormat('ar-EG').format(n);
    }
    return new Intl.NumberFormat('en-EG').format(n);
  };

  if (lang === 'ar') {
    if (max && min !== max) return `${fmt(min)} ج.م – ${fmt(max)} ج.م`;
    return `${fmt(min || max)} ج.م`;
  }
  if (max && min !== max) return `EGP ${fmt(min)} – ${fmt(max)}`;
  return `EGP ${fmt(min || max)}`;
}

export default function JobCard({ job, isSaved, onToggleSave, onClick }) {
  const { t } = useTranslation();

  return (
    <div 
      className="job-card-v2"
      onClick={() => onClick?.(job.id)}
    >
      <div className="job-card-top-row">
        <span className="job-posted-time">
          {t('jobs.posted_time', { time: job.postedTime })}
        </span>
        <button 
          className={`btn-icon-circle ${isSaved ? 'saved' : ''}`}
          onClick={(e) => { e.stopPropagation(); onToggleSave?.(job.id); }}
          aria-label={isSaved ? 'Unsave job' : 'Save job'}
        >
          <Heart 
            className="w-5 h-5 transition-colors"
          />
        </button>
      </div>

      <h2 className="job-card-title">{job.title}</h2>
      
      <div className="job-card-budget">
        {job.jobType === 'FixedPrice' ? t('jobs.fixed_price') : t('jobs.hourly')}
        {' - '}
        {job.experienceLevel || t('jobs.intermediate')}
        {' - '}
        {t('jobs.est_budget')}: {job.budgetMin && job.budgetMax ? `$${job.budgetMin}-$${job.budgetMax}` : `$${job.budgetMin || job.budgetMax || '0'}`}
      </div>

      {job.description && (
        <div className="job-card-description">{job.description}</div>
      )}

      {job.skills?.length > 0 && (
        <div className="skills-list small-skills">
          {job.skills.map((skill, i) => (
            <span key={i} className="skill-badge">
              {skill}
            </span>
          ))}
        </div>
      )}

      <div className="job-card-footer">
        {job.paymentVerified && (
          <div className="verified-badge">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
            </svg>
            {t('jobs.payment_verified')}
          </div>
        )}
        {job.rating && (
          <div className="rating-stars">
            {'★'.repeat(Math.round(job.rating))}{'☆'.repeat(5 - Math.round(job.rating))}
          </div>
        )}
        {job.clientSpent && <div>{job.clientSpent} spent</div>}
        {job.clientCountry && <div>{job.clientCountry}</div>}
      </div>
    </div>
  );
}
