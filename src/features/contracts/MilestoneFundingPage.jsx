import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import toast from 'react-hot-toast';
import { Loader2, PlusCircle, CheckCircle2, AlertCircle } from 'lucide-react';
import { contractsApi } from '../../api/contracts';
import { walletApi } from '../../api/wallet';

function formatCurrency(amount, lang) {
  if (amount == null) return '';
  const n = Number(amount);
  if (lang === 'ar') return `${new Intl.NumberFormat('ar-EG').format(n)} ج.م`;
  return `$${new Intl.NumberFormat('en-US').format(n)}`;
}

export default function MilestoneFundingPage() {
  const { t, i18n } = useTranslation();
  const { contractId } = useParams();

  const [contract, setContract] = useState(null);
  const [milestones, setMilestones] = useState([]);
  const [walletBalance, setWalletBalance] = useState(0);
  const [loading, setLoading] = useState(true);

  // Modal State
  const [selectedMilestone, setSelectedMilestone] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    async function loadData() {
      try {
        const [contractRes, walletRes] = await Promise.all([
          contractsApi.getContract(contractId),
          walletApi.getWalletBalance()
        ]);
        
        setContract(contractRes.data);
        setMilestones(contractRes.data.milestones || []);
        // The structure might be { balance: 0 } based on requirements
        setWalletBalance(walletRes.data?.balance ?? 0);
      } catch (err) {
        toast.error(err.title || t('common.error'));
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [contractId, t]);

  const handleFundConfirm = async () => {
    if (!selectedMilestone) return;
    setIsSubmitting(true);
    
    try {
      await contractsApi.fundMilestone(selectedMilestone.id);
      
      // Success Path
      setMilestones(prev => prev.map(m => 
        m.id === selectedMilestone.id ? { ...m, status: 'Funded' } : m
      ));
      toast.success(t('milestone.fundSuccess'));
      setSelectedMilestone(null);
    } catch (err) {
      if (err.title && err.title.toLowerCase().includes('insufficient balance')) {
        // Special mapping requested for Insufficient Balance
        toast.error(
          (t) => (
            <div className="flex flex-col gap-1">
              <span>{t('milestone.insufficientBalance')}</span>
              <Link 
                to="/wallet" 
                className="text-blue-500 hover:text-blue-700 underline font-medium text-sm mt-1"
                onClick={() => toast.dismiss(t.id)}
              >
                Top up wallet
              </Link>
            </div>
          ),
          { duration: 5000 }
        );
      } else {
        toast.error(err.title || t('common.error'));
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="animate-spin h-8 w-8 text-primary-gold" />
      </div>
    );
  }

  if (!contract) {
    return (
      <div className="max-w-4xl mx-auto mt-8 p-6 text-center">
        <h2 className="text-2xl font-bold text-gray-800">{t('common.error')}</h2>
      </div>
    );
  }

  // Calculate generic totals dynamically off local state map
  const totalFunded = milestones
    .filter(m => m.status !== 'Unfunded')
    .reduce((sum, m) => sum + Number(m.amount), 0);

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Funded':
        return <span className="bg-blue-100 text-blue-800 text-sm font-semibold px-3 py-1 rounded-full">{t('milestone.status.funded')}</span>;
      case 'Delivered':
        return <span className="bg-purple-100 text-purple-800 text-sm font-semibold px-3 py-1 rounded-full">{t('milestone.status.delivered')}</span>;
      case 'Released':
        return <span className="bg-green-100 text-green-800 text-sm font-semibold px-3 py-1 rounded-full">{t('milestone.status.released')}</span>;
      default:
        return <span className="bg-amber-100 text-amber-800 text-sm font-semibold px-3 py-1 rounded-full">{t('milestone.status.unfunded')}</span>;
    }
  };

  return (
    <div className="max-w-5xl mx-auto my-8 p-6 space-y-6">
      
      {/* Page Header */}
      <div className="bg-white rounded-lg shadow border border-gray-200 p-6 flex flex-col md:flex-row md:items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">{contract.title || contract.jobTitle}</h1>
          <div className="text-gray-500 font-medium">
            <span className="mr-8">{t('milestone.totalFunded')}: <span className="text-gray-900 font-bold">{formatCurrency(totalFunded, i18n.language)}</span></span>
            <span>{t('milestone.totalValue')}: <span className="text-gray-900 font-bold">{formatCurrency(contract.totalValue, i18n.language)}</span></span>
          </div>
        </div>
        <div className="mt-4 md:mt-0 px-4 py-3 bg-gray-50 rounded-lg border border-gray-200">
          <p className="text-sm text-gray-600 font-medium">{t('milestone.walletBalance').replace('{{balance}}', formatCurrency(walletBalance, i18n.language))}</p>
        </div>
      </div>

      {/* Milestone List */}
      <h2 className="text-xl font-bold text-gray-900 mb-4">{t('milestone.pageTitle')}</h2>
      
      <div className="space-y-4 relative">
        {/* Simple timeline line running down the left */}
        <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-gray-200 z-0 hidden md:block"></div>
        
        {milestones.map((milestone, idx) => (
          <div key={milestone.id} className="relative z-10 flex items-start gap-6">
            
            {/* Timeline Dot */}
            <div className={`mt-5 hidden md:flex items-center justify-center w-6 h-6 rounded-full border-4 border-white ${
              milestone.status === 'Unfunded' ? 'bg-amber-400' :
              milestone.status === 'Funded' ? 'bg-blue-500' :
              milestone.status === 'Delivered' ? 'bg-purple-500' : 'bg-green-500'
            }`}></div>
            
            {/* Card */}
            <div className="flex-1 bg-white border border-gray-200 rounded-lg shadow-sm p-6 flex flex-col md:flex-row md:items-center justify-between hover:shadow transition-shadow">
              <div className="flex-1">
                <div className="flex justify-between md:block mb-2">
                  <h3 className="text-lg font-semibold text-gray-900">{milestone.title}</h3>
                  <div className="md:hidden">
                    {getStatusBadge(milestone.status)}
                  </div>
                </div>
                {milestone.description && (
                  <p className="text-gray-600 text-sm mb-4 line-clamp-2">{milestone.description}</p>
                )}
                
                <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm">
                  <div>
                    <span className="text-gray-500 font-medium">{t('milestone.amount')}: </span>
                    <span className="text-gray-900 font-bold">{formatCurrency(milestone.amount, i18n.language)}</span>
                  </div>
                  {milestone.dueDate && (
                    <div>
                      <span className="text-gray-500 font-medium">{t('milestone.dueDate')}: </span>
                      <span className="text-gray-900">{new Date(milestone.dueDate).toLocaleDateString(i18n.language === 'ar' ? 'ar-EG' : 'en-US')}</span>
                    </div>
                  )}
                </div>
              </div>
              
              <div className="mt-4 md:mt-0 md:ml-6 flex items-center justify-between md:flex-col md:items-end gap-3 min-w-[120px]">
                <div className="hidden md:block">
                  {getStatusBadge(milestone.status)}
                </div>
                {milestone.status === 'Unfunded' && (
                  <button
                    onClick={() => setSelectedMilestone(milestone)}
                    className="inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-primary hover:bg-gray-800 transition-colors"
                  >
                    <PlusCircle className="w-4 h-4 mr-2" />
                    {t('milestone.fund')}
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
        {milestones.length === 0 && (
          <div className="text-center py-12 bg-white rounded-lg border border-gray-200 text-gray-500">
            No milestones found.
          </div>
        )}
      </div>

      {/* Confirmation Modal */}
      {selectedMilestone && (
        <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black bg-opacity-50 px-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full overflow-hidden">
            <div className="p-6 border-b border-gray-100">
              <h3 className="text-lg font-bold text-gray-900">{t('milestone.modal.title')}</h3>
              <p className="text-gray-500 text-sm mt-1">{selectedMilestone.title}</p>
            </div>
            
            <div className="p-6 bg-gray-50 space-y-4">
              <div className="flex justify-between items-center text-gray-700">
                <span>{t('milestone.modal.amount')}</span>
                <span className="font-semibold">{formatCurrency(selectedMilestone.amount, i18n.language)}</span>
              </div>
              <div className="flex justify-between items-center text-gray-700">
                <span>{t('milestone.modal.fee')}</span>
                <span className="font-semibold">{formatCurrency((Number(selectedMilestone.amount) * 0.055).toFixed(2), i18n.language)}</span>
              </div>
              <div className="border-t border-gray-200 pt-4 flex justify-between items-center text-gray-900 text-lg font-bold">
                <span>{t('milestone.modal.total')}</span>
                <span>{formatCurrency((Number(selectedMilestone.amount) * 1.055).toFixed(2), i18n.language)}</span>
              </div>
            </div>

            <div className="p-6 flex items-center justify-end gap-3">
              <button
                onClick={() => setSelectedMilestone(null)}
                disabled={isSubmitting}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 font-medium hover:bg-gray-50 disabled:opacity-50"
              >
                {t('milestone.modal.cancel')}
              </button>
              <button
                onClick={handleFundConfirm}
                disabled={isSubmitting}
                className="inline-flex justify-center items-center px-4 py-2 bg-primary-navy text-white rounded-md font-medium hover:bg-gray-800 disabled:opacity-50 transition min-w-[140px]"
                style={{ backgroundColor: !isSubmitting ? '#1e293b' : undefined }}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="animate-spin w-4 h-4 mr-2" />
                    {t('milestone.funding')}
                  </>
                ) : (
                  t('milestone.modal.confirm')
                )}
              </button>
            </div>
          </div>
        </div>
      )}
      
    </div>
  );
}
