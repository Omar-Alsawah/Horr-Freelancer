import { useTranslation } from 'react-i18next';
import { Heart } from 'lucide-react';

function formatBudget(budget, currency, convertedBudget, convertedCurrency, lang) {
  const fmt = (n, cur) => {
    return new Intl.NumberFormat(lang === 'ar' ? 'ar-EG' : 'en-EG', {
      style: 'currency',
      currency: cur || 'USD',
      maximumFractionDigits: 0
    }).format(n);
  };

  const originalStr = fmt(budget || 0, currency);
  if (convertedBudget != null && convertedCurrency != null && convertedCurrency !== currency) {
    const convertedStr = fmt(convertedBudget, convertedCurrency);
    return `${originalStr} (${convertedStr})`;
  }
  return originalStr;
}

export default function JobCard({ job, isSaved, onToggleSave, onClick }) {
  const { t, i18n } = useTranslation();

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
        {t('jobs.est_budget')}: {formatBudget(job.budget, job.budgetCurrency, job.convertedBudget, job.convertedCurrency, i18n.language)}
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
