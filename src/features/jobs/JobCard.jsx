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
  const { t, i18n } = useTranslation();
  const lang = i18n.language;

  return (
    <div 
      className="bg-white border border-gray-200 rounded-lg p-5 mb-4 cursor-pointer hover:shadow-md transition-shadow"
      onClick={() => onClick?.(job.id)}
    >
      {/* Top Row: Posted Time + Bookmark */}
      <div className="flex justify-between items-center mb-2">
        <span className="text-xs text-gray-500">
          {t('jobs.posted_time', { time: job.postedTime })}
        </span>
        <button 
          className="p-1.5 rounded-full hover:bg-gray-100 transition-colors"
          onClick={(e) => { e.stopPropagation(); onToggleSave?.(job.id); }}
          aria-label={isSaved ? 'Unsave job' : 'Save job'}
        >
          <Heart 
            className={`w-5 h-5 transition-colors ${isSaved ? 'fill-red-500 text-red-500' : 'text-gray-400'}`}
          />
        </button>
      </div>

      {/* Title */}
      <h2 className="text-base font-semibold text-gray-900 mb-1 leading-snug">{job.title}</h2>

      {/* Budget & Type */}
      <div className="text-sm text-gray-500 mb-2">
        {job.jobType === 'FixedPrice' ? t('jobs.fixed_price') : t('jobs.hourly')}
        {' – '}
        {t('jobs.est_budget')}: {formatBudget(job.budgetMin, job.budgetMax, lang)}
      </div>

      {/* Description */}
      {job.description && (
        <p className="text-sm text-gray-600 mb-3 line-clamp-3 leading-relaxed">{job.description}</p>
      )}

      {/* Skill Tags */}
      {job.skills?.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-3">
          {job.skills.map((skill, i) => (
            <span key={i} className="px-2.5 py-1 bg-gray-100 text-gray-700 text-xs rounded-full font-medium">
              {skill}
            </span>
          ))}
        </div>
      )}

      {/* Footer */}
      <div className="flex flex-wrap items-center gap-3 text-xs text-gray-500 pt-2 border-t border-gray-100">
        {job.paymentVerified && (
          <div className="flex items-center gap-1">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" className="text-green-600">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
            </svg>
            <span>{t('jobs.payment_verified')}</span>
          </div>
        )}
        {job.rating && <div className="text-yellow-500">{'★'.repeat(Math.round(job.rating))}{'☆'.repeat(5 - Math.round(job.rating))}</div>}
        {job.clientSpent && <div>{job.clientSpent}</div>}
        {job.clientCountry && <div>{job.clientCountry}</div>}
      </div>
    </div>
  );
}
