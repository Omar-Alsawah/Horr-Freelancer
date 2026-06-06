import { useState, useEffect } from 'react';
import { useParams, Navigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import toast from 'react-hot-toast';
import { Loader2, AlertTriangle, ArrowRight, ShieldCheck, Banknote, Wallet, Receipt, PackageOpen, RefreshCw } from 'lucide-react';
import { contractsApi } from '../../api/contracts';
import { walletApi } from '../../api/wallet';
import { useAuthStore } from '../../store/authStore';

function formatCurrency(amount, lang) {
  if (amount == null) return '';
  const n = Number(amount);
  if (lang === 'ar') return `${new Intl.NumberFormat('ar-EG', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(n)} ج.م`;
  return `$${new Intl.NumberFormat('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(n)}`;
}

export default function EscrowBreakdownPage() {
  const { t, i18n } = useTranslation();
  const { contractId } = useParams();
  const role = useAuthStore(state => state.role);

  const [escrow, setEscrow] = useState(null);
  const [walletBalance, setWalletBalance] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const loadData = async () => {
    setLoading(true);
    setError(false);
    try {
      const promises = [contractsApi.getEscrow(contractId)];
      if (role === 'Freelancer') {
        promises.push(walletApi.getWalletBalance());
      }
      const results = await Promise.all(promises);
      setEscrow(results[0].data);
      if (role === 'Freelancer' && results[1]) {
        setWalletBalance(results[1].data?.balance ?? 0);
      }
    } catch (err) {
      toast.error(err.title || t('common.error'));
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (role === 'Freelancer' || role === 'Client') {
      loadData();
    }
  }, [contractId, role, t]);

  if (role !== 'Freelancer' && role !== 'Client') {
    return <Navigate to="/unauthorized" replace />;
  }

  if (error) {
    return (
      <div className="max-w-5xl mx-auto my-12 p-8 bg-red-50 rounded-xl border border-red-200 text-center flex flex-col items-center">
        <AlertTriangle className="w-16 h-16 text-red-400 mb-4" />
        <h2 className="text-2xl font-bold text-red-900 mb-2">{t('common.error')}</h2>
        <button 
          onClick={loadData}
          className="mt-6 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-red-600 hover:bg-red-700 transition"
        >
          <RefreshCw className="w-4 h-4 mr-2" />
          {t('common.retry', 'Retry')}
        </button>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto my-8 p-6 space-y-8">
        <div className="h-48 bg-gray-200 animate-pulse rounded-2xl border border-gray-200"></div>
        <div className="h-64 bg-gray-200 animate-pulse rounded-2xl border border-gray-200"></div>
      </div>
    );
  }

  if (!escrow) return null;

  const { totalFunded, totalReleased, totalRefunded, platformEarned, currentlyHeld, transactions } = escrow;

  // Math check
  const netEscrow = Number(totalFunded) - Number(totalReleased) - Number(totalRefunded);
  const mathMismatch = Math.abs(Number(currentlyHeld) - netEscrow) > 0.01;

  const getTxAmountColor = (type) => {
    const tLower = type.toLowerCase();
    if (tLower.includes('release') || tLower.includes('credit')) return 'text-green-600';
    if (tLower.includes('refund')) return 'text-red-600';
    if (tLower.includes('fund') || tLower.includes('deposit')) return 'text-blue-600';
    if (tLower.includes('fee')) return 'text-gray-500';
    return 'text-gray-900';
  };

  return (
    <div className="max-w-5xl mx-auto my-8 p-6 space-y-8">
      
      {/* Header */}
      <div className="border-b border-gray-200 pb-5">
        <h1 className="text-3xl font-bold text-gray-900">{t('escrow.pageTitle')}</h1>
        <p className="mt-2 text-sm text-gray-500 font-medium bg-gray-100 inline-block px-3 py-1 rounded-full">
          {role === 'Client' ? t('escrow.clientView') : t('escrow.freelancerView')}
        </p>
      </div>

      {/* Math Mismatch Banner */}
      {mathMismatch && (
        <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-md flex items-start">
          <AlertTriangle className="h-6 w-6 text-red-600 mr-3 flex-shrink-0" />
          <p className="text-red-800 font-medium">
            {t('escrow.mathMismatchWarning')}
          </p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Most Prominent Element: Currently Held */}
        <div className="md:col-span-2 bg-amber-50 rounded-2xl border border-amber-200 shadow-sm p-8 flex flex-col items-center justify-center text-center">
          <ShieldCheck className="w-12 h-12 text-amber-500 mb-4" />
          <p className="text-lg font-bold text-amber-700 uppercase tracking-wide mb-2">{t('escrow.currentlyHeld')}</p>
          <p className="text-5xl md:text-6xl font-extrabold text-amber-600 tracking-tight">
            {formatCurrency(currentlyHeld, i18n.language)}
          </p>
        </div>

        {/* Role-based Info Panel */}
        <div className="md:col-span-1 bg-white rounded-2xl shadow border border-gray-200 p-6 flex flex-col justify-center">
          {role === 'Freelancer' ? (
            <div className="text-center">
              <Wallet className="w-10 h-10 text-blue-500 mx-auto mb-3" />
              <p className="text-sm font-semibold text-gray-500 uppercase">{t('escrow.yourWalletBalance')}</p>
              <p className="text-3xl font-bold text-gray-900 my-2">{formatCurrency(walletBalance, i18n.language)}</p>
              <p className="text-xs text-blue-600 bg-blue-50 mt-4 px-3 py-2 rounded-md font-medium inline-block">
                {t('escrow.earningsNote')}
              </p>
            </div>
          ) : (
            <div className="flex flex-col h-full justify-between space-y-4">
              <div className="bg-gray-50 border border-gray-100 p-4 rounded-xl text-center">
                <p className="text-xs font-bold text-gray-500 uppercase mb-1">{t('escrow.totalSpent')}</p>
                <p className="text-2xl font-bold text-gray-900">{formatCurrency(totalFunded, i18n.language)}</p>
              </div>
              <div className="bg-amber-50 border border-amber-100 p-4 rounded-xl text-center">
                <p className="text-xs font-bold text-amber-600 uppercase mb-1">{t('escrow.stillLocked')}</p>
                <p className="text-2xl font-bold text-amber-700">{formatCurrency(currentlyHeld, i18n.language)}</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Money Flow Breakdown Panel */}
      <div className="bg-white rounded-2xl shadow border border-gray-200 p-8">
        <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
          <Banknote className="w-6 h-6 mr-2 text-green-600" /> 
          Financial Flow
        </h2>
        
        <div className="flex flex-col md:flex-row items-center justify-between gap-6 relative">
          
          {/* Incoming */}
          <div className="flex-1 bg-blue-50 rounded-xl p-5 border border-blue-100 w-full text-center hover:shadow-md transition">
            <p className="text-xs font-bold uppercase text-blue-500 tracking-wider mb-2">{t('escrow.totalFunded')}</p>
            <p className="text-2xl font-bold text-blue-700">{formatCurrency(totalFunded, i18n.language)}</p>
          </div>

          <ArrowRight className="text-gray-300 w-10 h-10 hidden md:block shrink-0" />

          {/* Platform Split */}
          <div className="bg-gray-50 rounded-xl p-5 border border-gray-200 w-full md:w-auto text-center shrink-0 shadow-inner">
            <p className="text-xs font-bold uppercase text-gray-500 tracking-wider mb-2">{t('escrow.platformEarned')}</p>
            <p className="text-xl font-bold text-gray-600">{formatCurrency(platformEarned, i18n.language)}</p>
          </div>

          <ArrowRight className="text-gray-300 w-10 h-10 hidden md:block shrink-0" />

          {/* Outgoing Bifurcated */}
          <div className="flex-1 flex flex-col gap-4 w-full text-center">
            <div className="bg-green-50 rounded-xl p-5 border border-green-200 hover:shadow-md transition">
              <p className="text-xs font-bold uppercase text-green-600 tracking-wider mb-2">{t('escrow.totalReleased')}</p>
              <p className="text-2xl font-bold text-green-700">{formatCurrency(totalReleased, i18n.language)}</p>
            </div>
            {Number(totalRefunded) > 0 && (
              <div className="bg-red-50 rounded-xl p-4 border border-red-200">
                <p className="text-xs font-bold uppercase text-red-600 tracking-wider mb-1">{t('escrow.totalRefunded')}</p>
                <p className="text-xl font-bold text-red-700">{formatCurrency(totalRefunded, i18n.language)}</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Transaction History */}
      <div className="bg-white rounded-2xl shadow border border-gray-200 overflow-hidden">
        <div className="p-6 border-b border-gray-100 flex items-center">
          <Receipt className="w-6 h-6 mr-2 text-gray-500" />
          <h2 className="text-xl font-bold text-gray-900">History</h2>
        </div>

        {transactions && transactions.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('escrow.transaction.date')}</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('escrow.transaction.type')}</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('escrow.transaction.description')}</th>
                  <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">{t('escrow.transaction.amount')}</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {transactions.map((tx) => (
                  <tr key={tx.id} className="hover:bg-gray-50 transition">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(tx.date).toLocaleDateString(i18n.language === 'ar' ? 'ar-EG' : 'en-US', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {tx.type}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600 max-w-sm truncate" title={tx.description}>
                      {tx.description}
                    </td>
                    <td className={`px-6 py-4 whitespace-nowrap text-sm font-bold text-right ${getTxAmountColor(tx.type)}`}>
                      {formatCurrency(tx.amount, i18n.language)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-12 text-center flex flex-col items-center justify-center">
            <PackageOpen className="w-12 h-12 text-gray-300 mb-3" />
            <p className="text-gray-500 text-lg">{t('escrow.noTransactions')}</p>
          </div>
        )}
      </div>

    </div>
  );
}
