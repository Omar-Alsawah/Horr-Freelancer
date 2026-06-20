import React, { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import toast from 'react-hot-toast';
import { Loader2, AlertCircle, Clock, ChevronDown, ChevronUp, FileText, Link as LinkIcon, DollarSign, User, RefreshCw } from 'lucide-react';
import { disputesApi } from '../../api/disputes';
import { BASE_URL } from '../../api/axios';
import { useAuthStore } from '../../store/authStore';
import StatusBadge from '../../components/ui/StatusBadge';

function formatCurrency(amount, lang) {
  if (amount == null) return '';
  const n = Number(amount);
  if (lang === 'ar') return `${new Intl.NumberFormat('ar-EG', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(n)} ج.م`;
  return `$${new Intl.NumberFormat('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(n)}`;
}

export default function DisputeManagementPage() {
  const { t, i18n } = useTranslation();
  const role = useAuthStore(state => state.role);

  const [disputes, setDisputes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  // Detail panel state
  const [activeDisputeId, setActiveDisputeId] = useState(null);
  const [clientPct, setClientPct] = useState(50);
  const [freelancerPct, setFreelancerPct] = useState(50);
  const [adminNotes, setAdminNotes] = useState('');
  const [notesError, setNotesError] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchDisputes = async () => {
    setLoading(true);
    setError(false);
    try {
      const response = await disputesApi.getAdminDisputes();
      const rawItems = response.data?.data?.items || response.data?.items || response.data || [];
      const mapped = rawItems.map(d => ({
        id: d.id,
        contractTitle: `Contract #${d.contractId}`,
        reason: d.reason,
        dateOpened: d.openedAt,
        status: d.status,
        amountAtStake: d.agreedRate,
        clientName: d.clientFullName,
        freelancerName: d.freelancerFullName,
        openedByName: d.openedByUserFullName,
        attachments: (d.attachments || []).map(a => ({
          type: 'file',
          name: a.originalFileName,
          url: `${BASE_URL}/api/deliveries/attachments/${a.id}/download`
        }))
      }));
      setDisputes(mapped);
    } catch (err) {
      toast.error(err.title || t('common.error'));
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (role === 'Admin') {
      fetchDisputes();
    }
  }, [t, role]);

  if (role !== 'Admin') {
    return <Navigate to="/unauthorized" replace />;
  }

  const handleRowClick = (id) => {
    if (activeDisputeId === id) {
      setActiveDisputeId(null);
      setAdminNotes('');
      setNotesError(false);
    } else {
      setActiveDisputeId(id);
      setAdminNotes('');
      setNotesError(false);
      setClientPct(50);
      setFreelancerPct(50);
    }
  };

  const handleClientPctChange = (val) => {
    let num = parseInt(val);
    if (isNaN(num)) num = 0;
    if (num < 0) num = 0;
    if (num > 100) num = 100;
    setClientPct(num);
    setFreelancerPct(100 - num);
  };

  const handleFreelancerPctChange = (val) => {
    let num = parseInt(val);
    if (isNaN(num)) num = 0;
    if (num < 0) num = 0;
    if (num > 100) num = 100;
    setFreelancerPct(num);
    setClientPct(100 - num);
  };

  const handleResolveSplit = async () => {
    if (!adminNotes.trim()) {
      setNotesError(true);
      return;
    }
    
    if (clientPct + freelancerPct !== 100) {
      toast.error('The sum of client and freelancer percentages must equal 100%.');
      return;
    }
    
    setIsSubmitting(true);
    setNotesError(false);
    
    try {
      await disputesApi.resolveDispute(activeDisputeId, {
        ClientPercentage: clientPct,
        FreelancerPercentage: freelancerPct,
        AdminDecision: adminNotes
      });
      
      // Update local state without fetching
      setDisputes(prev => prev.filter(d => d.id !== activeDisputeId));
      setActiveDisputeId(null);
      setAdminNotes('');
      toast.success(t('disputes.resolvedSuccessfully', 'Dispute resolved successfully.'));
    } catch (err) {
      toast.error(err.title || t('common.error'));
    } finally {
      setIsSubmitting(false);
    }
  };

  if (error) {
    return (
      <div className="max-w-7xl mx-auto my-12 p-8 bg-red-50 rounded-xl border border-red-200 text-center flex flex-col items-center">
        <AlertCircle className="w-16 h-16 text-red-400 mb-4" />
        <h2 className="text-2xl font-bold text-red-900 mb-2">{t('common.error')}</h2>
        <button 
          onClick={fetchDisputes}
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
      <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8 space-y-6">
        <div className="h-20 bg-gray-200 animate-pulse rounded-lg border border-gray-200 mb-5"></div>
        <div className="h-96 bg-gray-200 animate-pulse rounded-xl border border-gray-200"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8 space-y-6">
      
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-gray-200 pb-5">
        <h1 className="text-3xl font-bold text-gray-900">{t('disputes.pageTitle')}</h1>
        <p className="mt-2 text-sm text-gray-500 font-medium bg-gray-100 inline-block px-4 py-2 rounded-lg border border-gray-200">
          {t('disputes.openCount').replace('{{count}}', disputes.length)}
        </p>
      </div>

      {disputes.length === 0 ? (
        // Empty State
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-16 text-center flex flex-col items-center">
          <AlertCircle className="h-16 w-16 text-green-500 mb-4 opacity-50" />
          <h3 className="text-xl font-bold text-gray-900 mb-2">{t('disputes.noOpenDisputes')}</h3>
          <p className="text-gray-500">All contracts are running smoothly.</p>
        </div>
      ) : (
        // Dispute List
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('disputes.contractTitle')}</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden md:table-cell">{t('disputes.reason')}</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('disputes.daysOpen')}</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('disputes.status.open')}</th>
                  <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider"></th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {disputes.map((dispute) => {
                  const daysOpen = Math.floor((new Date() - new Date(dispute.dateOpened)) / 86400000);
                  const isUrgent = daysOpen > 7;
                  const isActive = activeDisputeId === dispute.id;

                  return (
                    <React.Fragment key={dispute.id}>
                      {/* Interactive Row */}
                      <tr 
                        className={`hover:bg-gray-50 cursor-pointer transition-colors ${isActive ? 'bg-blue-50/50' : ''}`}
                        onClick={() => handleRowClick(dispute.id)}
                      >
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {dispute.contractTitle}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-500 hidden md:table-cell max-w-xs truncate">
                          {dispute.reason}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className={`flex items-center text-sm font-medium ${isUrgent ? 'text-red-600' : 'text-gray-600'}`}>
                            <Clock className={`w-4 h-4 mr-1.5 ${isUrgent ? 'animate-pulse' : ''}`} />
                            {t('disputes.daysOpen').replace('{{days}}', daysOpen)}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <StatusBadge status={dispute.status} />
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-gray-400">
                          {isActive ? <ChevronUp className="w-5 h-5 ml-auto" /> : <ChevronDown className="w-5 h-5 ml-auto" />}
                        </td>
                      </tr>

                      {/* Expandable Detail Panel */}
                      {isActive && (
                        <tr>
                          <td colSpan="5" className="px-0 py-0">
                            <div className="bg-gray-50 border-t border-b border-gray-100 p-6 md:p-8 animate-in slide-in-from-top-2 duration-200">
                              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                                
                                {/* Info Panel */}
                                <div className="col-span-1 border-r border-gray-200 pr-0 md:pr-8 space-y-6">
                                  <div>
                                    <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">{t('disputes.amountAtStake')}</h4>
                                    <div className="flex items-center text-2xl font-extrabold text-amber-600 bg-amber-50 px-4 py-2 rounded-lg border border-amber-100 inline-flex">
                                      <DollarSign className="w-6 h-6 mr-1 opacity-70" />
                                      {formatCurrency(dispute.amountAtStake, i18n.language)}
                                    </div>
                                  </div>
                                  
                                  <div className="space-y-4 pt-2">
                                    <div className="flex items-center justify-between p-3 bg-white rounded-lg border border-gray-200">
                                      <div className="flex items-center text-sm font-medium text-gray-700">
                                        <User className="w-4 h-4 mr-2 text-gray-400" />
                                        {t('disputes.clientName')}
                                      </div>
                                      <span className="text-sm font-bold text-gray-900">{dispute.clientName}</span>
                                    </div>
                                    <div className="flex items-center justify-between p-3 bg-white rounded-lg border border-gray-200">
                                      <div className="flex items-center text-sm font-medium text-gray-700">
                                        <User className="w-4 h-4 mr-2 text-primary text-gray-400" />
                                        {t('disputes.freelancerName')}
                                      </div>
                                      <span className="text-sm font-bold text-gray-900">{dispute.freelancerName}</span>
                                    </div>
                                  </div>
                                </div>

                                {/* Main Interaction Area */}
                                <div className="col-span-1 md:col-span-2 space-y-6">
                                  
                                  <div>
                                    <h4 className="text-sm font-bold text-gray-900 mb-2 flex items-center justify-between">
                                      {t('disputes.reason')}
                                      <span className="text-xs font-medium text-gray-500 bg-gray-200 px-2 py-0.5 rounded-full lowercase">
                                        {t('disputes.openedBy')} {dispute.openedByName}
                                      </span>
                                    </h4>
                                    <div className="bg-white p-4 rounded-lg border border-gray-200 text-sm text-gray-700 whitespace-pre-wrap shadow-sm">
                                      {dispute.reason}
                                    </div>
                                  </div>

                                  {dispute.attachments && dispute.attachments.length > 0 && (
                                    <div>
                                      <h4 className="text-sm font-bold text-gray-900 mb-2">{t('disputes.attachments')}</h4>
                                      <div className="flex flex-wrap gap-3">
                                        {dispute.attachments.map((att, idx) => (
                                          <a 
                                            key={idx}
                                            href={att.url}
                                            download
                                            target="_blank"
                                            rel="noreferrer"
                                            className="inline-flex items-center px-3 py-1.5 rounded-md border border-gray-200 bg-white text-sm font-medium text-blue-600 hover:bg-blue-50 transition-colors shadow-sm"
                                          >
                                            {att.type === 'file' ? <FileText className="w-4 h-4 mr-2 text-gray-500" /> : <LinkIcon className="w-4 h-4 mr-2 text-gray-500" />}
                                            {att.name || 'Attachment'}
                                          </a>
                                        ))}
                                      </div>
                                    </div>
                                  )}

                                  {/* Resolution Form */}
                                  <div className="pt-4 border-t border-gray-200 space-y-6">
                                    {/* Percentages Section */}
                                    <div className="space-y-4 bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                                      <h4 className="text-sm font-bold text-gray-900 flex items-center gap-2">
                                        <RefreshCw className="w-4 h-4 text-amber-600" />
                                        {t('disputes.refundSplitPercentages', 'Refund Split Percentages')}
                                      </h4>
                                      <p className="text-xs text-gray-500 font-medium leading-relaxed">
                                        {t('disputes.refundSplitHint', 'Specify how the escrow funds will be distributed. Client gets refunded, freelancer gets paid minus the standard 15% platform commission.')}
                                      </p>
                                      
                                      <div className="grid grid-cols-2 gap-4">
                                        <div>
                                          <label className="block text-xs font-semibold text-gray-600 mb-1">
                                            {t('disputes.clientRefundPercentage', 'Client Refund %')}
                                          </label>
                                          <input
                                            type="number"
                                            min="0"
                                            max="100"
                                            className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-amber-500 focus:ring-amber-500 sm:text-sm p-2.5 border"
                                            value={clientPct}
                                            onChange={(e) => handleClientPctChange(e.target.value)}
                                          />
                                        </div>
                                        <div>
                                          <label className="block text-xs font-semibold text-gray-600 mb-1">
                                            {t('disputes.freelancerPayoutPercentage', 'Freelancer Payout %')}
                                          </label>
                                          <input
                                            type="number"
                                            min="0"
                                            max="100"
                                            className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-amber-500 focus:ring-amber-500 sm:text-sm p-2.5 border"
                                            value={freelancerPct}
                                            onChange={(e) => handleFreelancerPctChange(e.target.value)}
                                          />
                                        </div>
                                      </div>

                                      <div className="flex flex-wrap gap-2 pt-2">
                                        <button
                                          type="button"
                                          onClick={() => { setClientPct(100); setFreelancerPct(0); }}
                                          className={`text-xs px-3 py-1.5 rounded-lg border transition-all font-semibold ${clientPct === 100 ? 'bg-amber-500 border-amber-500 text-white shadow-sm' : 'bg-gray-50 hover:bg-gray-100 border-gray-200 text-gray-700'}`}
                                        >
                                          100% Client / 0% Freelancer
                                        </button>
                                        <button
                                          type="button"
                                          onClick={() => { setClientPct(50); setFreelancerPct(50); }}
                                          className={`text-xs px-3 py-1.5 rounded-lg border transition-all font-semibold ${clientPct === 50 ? 'bg-amber-500 border-amber-500 text-white shadow-sm' : 'bg-gray-50 hover:bg-gray-100 border-gray-200 text-gray-700'}`}
                                        >
                                          50% Client / 50% Freelancer
                                        </button>
                                        <button
                                          type="button"
                                          onClick={() => { setClientPct(0); setFreelancerPct(100); }}
                                          className={`text-xs px-3 py-1.5 rounded-lg border transition-all font-semibold ${clientPct === 0 ? 'bg-amber-500 border-amber-500 text-white shadow-sm' : 'bg-gray-50 hover:bg-gray-100 border-gray-200 text-gray-700'}`}
                                        >
                                          0% Client / 100% Freelancer
                                        </button>
                                      </div>
                                    </div>

                                    <div>
                                      <label className="block text-sm font-bold text-gray-900 mb-2">
                                        {t('disputes.adminNotes')}
                                      </label>
                                      <textarea
                                        rows={3}
                                        className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-amber-500 focus:ring-amber-500 sm:text-sm resize-none p-3 border"
                                        placeholder="Explain the administrative ruling explicitly before closing..."
                                        value={adminNotes}
                                        onChange={(e) => {
                                          setAdminNotes(e.target.value);
                                          if (e.target.value.trim()) setNotesError(false);
                                        }}
                                      />
                                      {notesError && (
                                        <p className="mt-2 text-sm text-red-600 font-medium flex items-center">
                                          <AlertCircle className="w-4 h-4 mr-1" />
                                          {t('disputes.notesRequired')}
                                        </p>
                                      )}
                                    </div>

                                    <div className="mt-5">
                                      <button
                                        onClick={handleResolveSplit}
                                        disabled={isSubmitting}
                                        className="w-full inline-flex justify-center items-center px-4 py-3 border border-transparent shadow-sm text-sm font-bold rounded-lg text-white bg-amber-600 hover:bg-amber-700 disabled:opacity-50 transition-colors"
                                      >
                                        {isSubmitting ? <Loader2 className="animate-spin w-5 h-5" /> : t('disputes.resolveSplit', 'Resolve Dispute')}
                                      </button>
                                    </div>
                                  </div>

                                </div>
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

    </div>
  );
}
