import { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import toast from 'react-hot-toast';
import { Loader2, Inbox, Briefcase, Clock, AlertTriangle, RefreshCw } from 'lucide-react';
import { revisionsApi } from '../../api/revisions';
import { useAuthStore } from '../../store/authStore';
import StatusBadge from '../../components/ui/StatusBadge';

function formatCurrency(amount, lang) {
  if (amount == null) return '';
  const n = Number(amount);
  if (lang === 'ar') return `${new Intl.NumberFormat('ar-EG', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(n)} ج.م`;
  return `$${new Intl.NumberFormat('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(n)}`;
}

function timeSince(dateString, i18n) {
  if (!dateString) return '';
  const days = Math.floor((new Date() - new Date(dateString)) / 86400000);
  if (days === 0) return i18n.language === 'ar' ? 'اليوم' : 'Today';
  if (days === 1) return i18n.language === 'ar' ? 'منذ يوم واحد' : '1 day ago';
  return i18n.language === 'ar' ? `منذ ${days} أيام` : `${days} days ago`;
}

export default function RevisionQueuePage() {
  const { t, i18n } = useTranslation();
  const role = useAuthStore(state => state.role);

  const [openRevisions, setOpenRevisions] = useState([]);
  const [myCases, setMyCases] = useState([]);
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [isSubmittingId, setIsSubmittingId] = useState(null);

  const fetchQueues = async () => {
    setLoading(true);
    setError(false);
    try {
      const [openRes, myRes] = await Promise.all([
        revisionsApi.getOpenRevisions(),
        revisionsApi.getMyCases()
      ]);
      setOpenRevisions(openRes.data || []);
      setMyCases(myRes.data || []);
    } catch (err) {
      toast.error(err.title || t('revisions.errorLoading'));
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (role === 'Specialist') {
      fetchQueues();
    }
  }, [role]);

  // Route Guard
  if (role !== 'Specialist') {
    return <Navigate to="/unauthorized" replace />;
  }

  const handleTakeCase = async (revisionId) => {
    setIsSubmittingId(revisionId);
    try {
      await revisionsApi.acceptRevision(revisionId);
      
      // Mutate local state
      const targetRev = openRevisions.find(r => r.id === revisionId);
      if (targetRev) {
        const updatedRev = { ...targetRev, status: 'AcceptedBySpecialist' };
        setOpenRevisions(prev => prev.map(r => r.id === revisionId ? updatedRev : r));
        setMyCases(prev => [...prev, updatedRev]);
      }
      toast.success(t('revisions.caseAccepted'));
    } catch (err) {
      if (err.status === 404) {
        toast((tObj) => (
          <span>{t('revisions.endpointNotReady')}</span>
        ), { icon: '🚧' });
      } else {
        toast.error(err.title || t('common.error'));
      }
    } finally {
      setIsSubmittingId(null);
    }
  };

  // State 1: Error
  if (error) {
    return (
      <div className="max-w-4xl mx-auto my-12 p-8 bg-red-50 rounded-xl border border-red-200 text-center flex flex-col items-center">
        <AlertTriangle className="w-16 h-16 text-red-400 mb-4" />
        <h2 className="text-2xl font-bold text-red-900 mb-2">{t('revisions.errorLoading')}</h2>
        <button 
          onClick={fetchQueues}
          className="mt-6 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-red-600 hover:bg-red-700"
        >
          <RefreshCw className="w-4 h-4 mr-2" />
          {t('revisions.retry')}
        </button>
      </div>
    );
  }

  // State 2: Loading (Skeletons)
  if (loading) {
    return (
      <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8 space-y-6">
        <div className="h-10 bg-gray-200 animate-pulse rounded-md w-1/4 mb-8"></div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((x) => (
            <div key={x} className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
              <div className="h-6 bg-gray-200 animate-pulse rounded w-3/4 mb-4"></div>
              <div className="space-y-2 mb-6">
                <div className="h-4 bg-gray-200 animate-pulse rounded w-full"></div>
                <div className="h-4 bg-gray-200 animate-pulse rounded w-5/6"></div>
              </div>
              <div className="h-10 bg-gray-200 animate-pulse rounded w-full"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // State 3: Success Content
  return (
    <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8 space-y-10">
      
      {/* Header */}
      <div className="border-b border-gray-200 pb-5 flex flex-col sm:flex-row sm:items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">{t('revisions.pageTitle')}</h1>
        <div className="mt-4 sm:mt-0 bg-blue-50 text-blue-700 px-4 py-2 rounded-lg font-medium border border-blue-100 flex items-center shadow-sm">
          <Briefcase className="w-5 h-5 mr-2 opacity-70" />
          {t('revisions.activeCaseload').replace('{{count}}', myCases.length)}
        </div>
      </div>

      {/* Primary Queue */}
      <div>
        <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
          <Inbox className="w-6 h-6 mr-2 text-gray-400" />
          Open Requests
        </h2>

        {openRevisions.length === 0 ? (
          <div className="bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200 p-16 text-center flex flex-col items-center">
            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-4">
              <Inbox className="w-10 h-10 text-gray-400" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-1">{t('revisions.noRequests')}</h3>
            <p className="text-gray-500">You are all caught up for now.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {openRevisions.map((rev) => {
              const isAccepted = rev.status === 'AcceptedBySpecialist';
              return (
                <div 
                  key={rev.id} 
                  className={`bg-white rounded-xl shadow-sm border border-gray-200 p-6 flex flex-col h-full transition-all ${isAccepted ? 'opacity-50 grayscale select-none' : 'hover:shadow-md'}`}
                >
                  <div className="flex justify-between items-start mb-4 gap-4">
                    <h3 className="font-bold text-lg text-gray-900 leading-tight">{rev.contractTitle}</h3>
                    <div className="shrink-0"><StatusBadge status={rev.status} /></div>
                  </div>
                  
                  <p className="text-gray-600 text-sm flex-grow mb-6 line-clamp-3" title={rev.reason}>
                    {rev.reason && rev.reason.length > 80 ? rev.reason.slice(0, 80) + '...' : rev.reason}
                  </p>
                  
                  <div className="bg-gray-50 rounded-lg p-4 mb-6 border border-gray-100 grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-xs font-bold text-gray-500 uppercase">{t('revisions.amountAtStake')}</p>
                      <p className="font-bold text-gray-900">{formatCurrency(rev.amountAtStake, i18n.language)}</p>
                    </div>
                    <div>
                      <p className="text-xs font-bold text-gray-500 uppercase">{t('revisions.dateRequested')}</p>
                      <p className="text-sm font-medium text-gray-700 flex items-center">
                        <Clock className="w-3 h-3 mr-1 text-gray-400" />
                        {timeSince(rev.dateRequested, i18n)}
                      </p>
                    </div>
                  </div>

                  {isAccepted ? (
                    <div className="w-full text-center py-3 bg-gray-100 text-gray-500 font-bold rounded-lg border border-gray-200 tracking-wider uppercase text-sm">
                      {t('revisions.taken')}
                    </div>
                  ) : (
                    <button
                      onClick={() => handleTakeCase(rev.id)}
                      disabled={isSubmittingId === rev.id}
                      className="w-full inline-flex justify-center items-center px-4 py-3 border border-transparent shadow-sm text-sm font-bold rounded-lg text-white bg-primary hover:bg-gray-800 focus:outline-none disabled:opacity-50 transition-colors"
                    >
                      {isSubmittingId === rev.id ? (
                        <><Loader2 className="animate-spin w-4 h-4 mr-2" />{t('revisions.taking')}</>
                      ) : (
                        t('revisions.takeCase')
                      )}
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* My Active Cases Section */}
      {myCases.length > 0 && (
        <div className="pt-8 border-t border-gray-200">
          <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
            <Briefcase className="w-6 h-6 mr-2 text-primary" />
            {t('revisions.myCases')}
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {myCases.map((rev) => (
              <div key={rev.id} className="bg-white rounded-xl shadow-sm border border-l-4 border-l-blue-500 border-gray-200 p-6 flex flex-col h-full hover:shadow-md transition-shadow">
                <div className="flex justify-between items-start mb-4 gap-4">
                  <h3 className="font-bold text-lg text-gray-900 leading-tight">{rev.contractTitle}</h3>
                </div>
                
                <p className="text-gray-600 text-sm flex-grow mb-6 line-clamp-2">
                  {rev.reason}
                </p>
                
                <div className="bg-blue-50 rounded-lg p-4 border border-blue-100 flex items-center justify-between">
                  <div>
                    <p className="text-xs font-bold text-blue-600 uppercase">{t('revisions.amountAtStake')}</p>
                    <p className="font-bold text-blue-900">{formatCurrency(rev.amountAtStake, i18n.language)}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs font-bold text-blue-600 uppercase">{t('revisions.dateRequested')}</p>
                    <p className="text-sm font-medium text-blue-800 flex items-center justify-end">
                      <Clock className="w-3 h-3 mr-1 opacity-60" />
                      {timeSince(rev.dateRequested, i18n)}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  );
}
