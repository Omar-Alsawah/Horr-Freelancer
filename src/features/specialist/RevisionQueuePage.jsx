import { useState, useEffect, useCallback } from 'react';
import { Navigate, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import toast from 'react-hot-toast';
import { 
  Clock, 
  AlertTriangle, 
  RefreshCw, 
  FileText, 
  CheckCircle2, 
  Inbox 
} from 'lucide-react';
import { revisionsApi } from '../../api/revisions';
import { useAuthStore } from '../../store/authStore';

export default function RevisionQueuePage() {
  const { t } = useTranslation();
  const role = useAuthStore(state => state.role);

  const [specialistQueue, setSpecialistQueue] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const fetchQueues = useCallback(async (isRetry = false) => {
    if (isRetry) {
      setLoading(true);
      setError(false);
    }
    try {
      const res = await revisionsApi.getSpecialistQueue();
      setSpecialistQueue(res.data || []);
    } catch (err) {
      toast.error(err.title || t('specialist.errorLoading', 'Error loading specialist queue'));
      setError(true);
    } finally {
      setLoading(false);
    }
  }, [t]);

  useEffect(() => {
    if (role === 'Specialist') {
      const timer = setTimeout(() => {
        fetchQueues();
      }, 0);
      return () => clearTimeout(timer);
    }
  }, [role, fetchQueues]);

  // Route Guard
  if (role !== 'Specialist') {
    return <Navigate to="/unauthorized" replace />;
  }

  // State 1: Error
  if (error) {
    return (
      <div className="max-w-4xl mx-auto my-12 p-8 bg-red-50 rounded-xl border border-red-200 text-center flex flex-col items-center">
        <AlertTriangle className="w-16 h-16 text-red-400 mb-4" />
        <h2 className="text-2xl font-bold text-red-900 mb-2">{t('specialist.errorLoading', 'Error loading specialist queue')}</h2>
        <button 
          onClick={() => fetchQueues(true)}
          className="mt-6 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-red-650 hover:bg-red-700"
        >
          <RefreshCw className="w-4 h-4 mr-2" />
          {t('specialist.retry', 'Retry')}
        </button>
      </div>
    );
  }

  // State 2: Loading (Skeletons)
  if (loading) {
    return (
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="h-10 bg-gray-200 animate-pulse rounded-md w-1/4 mb-8"></div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[1, 2, 3].map((x) => (
            <div key={x} className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm space-y-4">
              <div className="h-10 w-10 bg-gray-200 animate-pulse rounded-xl"></div>
              <div className="h-6 bg-gray-200 animate-pulse rounded w-1/3"></div>
            </div>
          ))}
        </div>
        <div className="h-64 bg-gray-200 animate-pulse rounded-xl w-full"></div>
      </div>
    );
  }

  const pendingCount = specialistQueue.filter(r => !r.verdict).length;
  const completedCount = specialistQueue.filter(r => r.verdict).length;
  const totalCount = specialistQueue.length;

  const cards = [
    {
      label: t('specialist.stats.totalAssigned', 'Total Assigned'),
      count: totalCount,
      icon: FileText,
      iconColor: 'text-blue-500',
      iconBg: 'bg-blue-50',
      textColor: 'text-gray-900',
    },
    {
      label: t('specialist.stats.pendingAction', 'Pending Action'),
      count: pendingCount,
      icon: Clock,
      iconColor: 'text-yellow-500',
      iconBg: 'bg-yellow-50',
      textColor: pendingCount > 0 ? 'text-yellow-600' : 'text-gray-900',
      showUrgentBadge: pendingCount > 0,
    },
    {
      label: t('specialist.stats.completed', 'Completed'),
      count: completedCount,
      icon: CheckCircle2,
      iconColor: 'text-green-500',
      iconBg: 'bg-green-50',
      textColor: 'text-gray-900',
    },
  ];

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">{t('specialist.contractSpecialistReviews', 'Contract Specialist Reviews')}</h1>
        <p className="text-sm text-gray-500 mt-1">
          {t('specialist.dashboardSubtitle', 'Manage and submit reviews for contract deliveries.')}
        </p>
      </div>

      {/* Stats Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {cards.map((card, idx) => {
          const Icon = card.icon;
          return (
            <div
              key={idx}
              className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 flex flex-col justify-between hover:shadow-md transition-shadow text-left"
            >
              <div className="flex items-start justify-between">
                <div className={`p-3 rounded-xl ${card.iconBg}`}>
                  <Icon className={`w-6 h-6 ${card.iconColor}`} />
                </div>
                {card.showUrgentBadge && (
                  <span className="text-xs font-semibold px-2 py-1 bg-red-50 text-red-650 rounded-full">
                    {t('specialist.actionRequired', 'Action Required')}
                  </span>
                )}
              </div>
              <div className="mt-4">
                <div className={`text-3xl font-bold ${card.textColor}`}>
                  {card.count}
                </div>
                <div className="text-sm font-medium text-gray-600 mt-1">{card.label}</div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Table Section */}
      <div className="space-y-4">
        <h2 className="text-lg font-bold text-gray-900 flex items-center">
          <Inbox className="w-5 h-5 mr-2 text-gray-400" />
          {t('specialist.assignedQueueTitle', 'Review Cases Queue')}
        </h2>

        <div className="bg-white text-gray-900 shadow-sm rounded-xl border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200 text-sm">
                  <th className="px-6 py-4 font-semibold text-gray-700">{t('specialist.table.contract', 'Contract')}</th>
                  <th className="px-6 py-4 font-semibold text-gray-700">{t('specialist.table.details', 'Details')}</th>
                  <th className="px-6 py-4 font-semibold text-gray-700">{t('specialist.table.assignedDate', 'Assigned Date')}</th>
                  <th className="px-6 py-4 font-semibold text-gray-700">{t('specialist.table.status', 'Status')}</th>
                  <th className="px-6 py-4 font-semibold text-gray-700">{t('specialist.table.actions', 'Actions')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 text-sm">
                {specialistQueue.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="px-6 py-12 text-center text-gray-500">
                      <div className="flex flex-col items-center justify-center space-y-2">
                        <FileText className="w-10 h-10 text-gray-300" />
                        <span className="font-medium text-gray-600">{t('specialist.noReviews', 'No assigned reviews found.')}</span>
                      </div>
                    </td>
                  </tr>
                ) : (
                  specialistQueue.map((review, idx) => {
                    const displayTitle = review.contractTitle || `${t('specialist.reviewLabel', 'Review')} #${review.id.slice(0, 8)}`;
                    const displayNote = review.deliveryNote || review.requirementsSummary || '';
                    const dateToUse = review.assignedAt || review.requestedAt;
                    const contractIdToUse = review.contractId || '0';

                    return (
                      <tr key={review.id} className={idx % 2 === 0 ? 'bg-white' : 'bg-gray-50/50 hover:bg-gray-50 transition-colors'}>
                        <td className="px-6 py-4 font-semibold text-gray-900 whitespace-nowrap">{displayTitle}</td>
                        <td className="px-6 py-4 text-gray-550 max-w-xs truncate" title={displayNote}>
                          {displayNote}
                        </td>
                        <td className="px-6 py-4 text-gray-500 whitespace-nowrap">
                          {dateToUse ? new Date(dateToUse).toLocaleDateString() : '—'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {review.verdict === 'Satisfactory' && (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-green-150 text-green-800 uppercase tracking-wider">
                              {t('specialist.satisfactory', 'Satisfactory')}
                            </span>
                          )}
                          {review.verdict === 'Unsatisfactory' && (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-red-155 text-red-800 uppercase tracking-wider">
                              {t('specialist.unsatisfactory', 'Unsatisfactory')}
                            </span>
                          )}
                          {!review.verdict && (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-yellow-100 text-yellow-855 uppercase tracking-wider animate-pulse">
                              {t('specialist.pending', 'Pending')}
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <Link
                            to={`/specialist/reviews/${contractIdToUse}/${review.deliveryId}`}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#eab308] hover:bg-yellow-600 text-white text-xs font-semibold rounded-md shadow-sm transition-colors"
                          >
                            {review.verdict ? t('specialist.viewReview', 'View') : t('specialist.submitReview', 'Review')}
                          </Link>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
