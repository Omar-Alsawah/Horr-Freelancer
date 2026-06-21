import { ENDPOINTS } from '../../services/endpoints';
import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'react-hot-toast';
import { X, Check } from 'lucide-react';
import api from '../../api/axios';

const METHOD_DETAILS_MAP = {
  0: 'instapayUsername',
  1: 'bankAccountDetails',
  2: 'eWalletNumber',
  'InstaPay': 'instapayUsername',
  'BankTransfer': 'bankAccountDetails',
  'EWallet': 'eWalletNumber',
  'instapay': 'instapayUsername',
  'banktransfer': 'bankAccountDetails',
  'ewallet': 'eWalletNumber'
};

const METHOD_BADGE_STYLES = {
  0: 'bg-blue-100 text-blue-700',
  1: 'bg-purple-100 text-purple-700',
  2: 'bg-orange-100 text-orange-700',
  'InstaPay': 'bg-blue-100 text-blue-700',
  'BankTransfer': 'bg-purple-100 text-purple-700',
  'EWallet': 'bg-orange-100 text-orange-700',
  'instapay': 'bg-blue-100 text-blue-700',
  'banktransfer': 'bg-purple-100 text-purple-700',
  'ewallet': 'bg-orange-100 text-orange-700'
};

const METHOD_LABEL_MAP = {
  0: 'admin.instapay',
  1: 'admin.bankTransfer',
  2: 'admin.ewallet',
  'InstaPay': 'admin.instapay',
  'BankTransfer': 'admin.bankTransfer',
  'EWallet': 'admin.ewallet',
  'instapay': 'admin.instapay',
  'banktransfer': 'admin.bankTransfer',
  'ewallet': 'admin.ewallet'
};

export default function WithdrawalRequestsPage() {
  const { t, i18n } = useTranslation();
  
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [approveDialogState, setApproveDialogState] = useState({ isOpen: false, id: null, note: '', error: null });
  const [rejectDialogState, setRejectDialogState] = useState({ isOpen: false, id: null, note: '', error: null, clientError: null });

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    setLoading(true);
    try {
      const response = await api.get(ENDPOINTS.ADMIN.WITHDRAWAL_PENDING);
      const payload = response.data?.data || response.data;
      setRequests(Array.isArray(payload) ? payload : []);
    } catch (err) {
      toast.error(err.title || t('common.error'));
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async () => {
    const { id, note } = approveDialogState;
    if (!id) return;
    try {
      await api.patch(ENDPOINTS.ADMIN.WITHDRAWAL_REVIEW(id), { status: 1, adminNote: note });
      setRequests(prev => prev.filter(r => r.id !== id));
      toast.success(t('admin.withdrawApproveSuccess'));
      setApproveDialogState({ isOpen: false, id: null, note: '', error: null });
    } catch (err) {
      const isAlready = err.status === 409 || err.status === 422 || (err.title && err.title.toLowerCase().includes('already'));
      if (isAlready) {
        setApproveDialogState(prev => ({ ...prev, error: t('admin.alreadyReviewed') }));
      } else {
        toast.error(err.title || t('common.error'));
      }
    }
  };

  const handleReject = async () => {
    const { id, note } = rejectDialogState;
    if (!id) return;
    
    if (!note.trim()) {
      setRejectDialogState(prev => ({ ...prev, clientError: t('admin.noteRequired') }));
      return;
    }

    try {
      await api.patch(ENDPOINTS.ADMIN.WITHDRAWAL_REVIEW(id), { 
        status: 2, 
        adminNote: note 
      });
      setRequests(prev => prev.filter(r => r.id !== id));
      toast.success(t('admin.withdrawRejectSuccess'));
      setRejectDialogState({ isOpen: false, id: null, note: '', error: null, clientError: null });
    } catch (err) {
      const isAlready = err.status === 409 || err.status === 422 || (err.title && err.title.toLowerCase().includes('already'));
      if (isAlready) {
        setRejectDialogState(prev => ({ ...prev, error: t('admin.alreadyReviewed'), clientError: null }));
      } else {
        toast.error(err.title || t('common.error'));
      }
    }
  };

  const getMethodDetail = (request) => {
    const field = METHOD_DETAILS_MAP[request.method];
    return request[field] || request.instapayUsername || request.bankAccountDetails || request.eWalletNumber || request.ewalletNumber || request.instaPayUsername || '—';
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">{t('admin.withdrawalRequests')}</h1>
      
      {/* Table Card */}
      <div className="bg-white text-gray-900 shadow-sm rounded-xl border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200 text-sm">
                <th className="px-6 py-4 font-semibold text-gray-700">{t('admin.freelancerName')}</th>
                <th className="px-6 py-4 font-semibold text-gray-700">{t('admin.amount')}</th>
                <th className="px-6 py-4 font-semibold text-gray-700">{t('admin.method')}</th>
                <th className="px-6 py-4 font-semibold text-gray-700">{t('admin.methodDetail')}</th>
                <th className="px-6 py-4 font-semibold text-gray-700">{t('admin.submittedDate')}</th>
                <th className="px-6 py-4 font-semibold text-gray-700">{t('admin.actions')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 text-sm">
              {loading ? (
                Array.from({ length: 4 }).map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    <td className="px-6 py-4"><div className="h-4 bg-gray-200 rounded w-3/4"></div></td>
                    <td className="px-6 py-4"><div className="h-4 bg-gray-200 rounded w-1/2"></div></td>
                    <td className="px-6 py-4"><div className="h-6 bg-gray-200 rounded w-20"></div></td>
                    <td className="px-6 py-4"><div className="h-4 bg-gray-200 rounded w-2/3"></div></td>
                    <td className="px-6 py-4"><div className="h-4 bg-gray-200 rounded w-1/2"></div></td>
                    <td className="px-6 py-4 flex gap-2"><div className="h-8 bg-gray-200 rounded w-24"></div></td>
                  </tr>
                ))
              ) : requests.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-6 py-12 text-center text-gray-500">
                    {t('admin.noWithdrawalRequests')}
                  </td>
                </tr>
              ) : (
                requests.map((request, idx) => (
                  <tr key={request.id} className={idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                    <td className="px-6 py-4">
                      <div className="font-medium text-gray-900">{request.freelancerName || '—'}</div>
                      <div className="text-gray-500 font-mono text-xs mt-0.5">{request.freelancerId || '—'}</div>
                    </td>
                    <td className="px-6 py-4 text-gray-700 whitespace-nowrap">
                      {new Intl.NumberFormat('en-EG', { style: 'currency', currency: 'EGP' }).format(request.amount || 0)}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${METHOD_BADGE_STYLES[request.method] || 'bg-gray-100 text-gray-700'}`}>
                        {t(METHOD_LABEL_MAP[request.method])}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-gray-500 font-mono text-xs">{getMethodDetail(request)}</td>
                    <td className="px-6 py-4 text-gray-500">
                      {request.submittedAt ? new Date(request.submittedAt).toLocaleDateString() : '—'}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => setApproveDialogState({ isOpen: true, id: request.id, note: '', error: null })}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-green-500 hover:bg-green-600 text-white text-xs font-medium rounded-md transition-colors"
                        >
                          <Check className="w-4 h-4" />
                          {t('admin.approve')}
                        </button>
                        <button
                          onClick={() => setRejectDialogState({ isOpen: true, id: request.id, note: '', error: null, clientError: null })}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-red-500 hover:bg-red-600 text-white text-xs font-medium rounded-md transition-colors"
                        >
                          <X className="w-4 h-4" />
                          {t('admin.reject')}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Confirmation Dialog - Approve */}
      {approveDialogState.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6 space-y-4">
            <h3 className="text-lg font-bold text-gray-900">{t('admin.approveDepositTitle')}</h3>
            
            {approveDialogState.error && (
              <div className="bg-red-50 border-l-4 border-red-500 p-3 text-sm text-red-700 font-medium">
                {approveDialogState.error}
              </div>
            )}

            <div className="bg-yellow-50 border-l-4 border-yellow-500 p-3 text-sm text-yellow-800 font-medium">
              {t('admin.manualDeductionNotice')}
            </div>

            <p className="text-gray-600 text-sm">{t('admin.approveDepositConfirm')}</p>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                {t('admin.rejectDepositNoteLabel')}
              </label>
              <textarea
                value={approveDialogState.note}
                onChange={(e) => setApproveDialogState(prev => ({ ...prev, note: e.target.value, error: null }))}
                placeholder={t('admin.approveDepositNotePlaceholder')}
                className="w-full h-24 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#eab308] focus:border-transparent text-sm resize-none"
              />
            </div>

            <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100">
              <button 
                onClick={() => setApproveDialogState({ isOpen: false, id: null, note: '', error: null })}
                className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-medium rounded-md transition-colors"
              >
                {t('admin.cancel')}
              </button>
              <button 
                onClick={handleApprove}
                className="px-4 py-2 bg-[#eab308] hover:bg-yellow-600 text-white text-sm font-medium rounded-md shadow-sm transition-colors"
              >
                {t('admin.approve')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Rejection Dialog with Note */}
      {rejectDialogState.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6 space-y-4">
            <h3 className="text-lg font-bold text-gray-900">{t('admin.rejectDepositTitle')}</h3>
            
            {rejectDialogState.error && (
              <div className="bg-red-50 border-l-4 border-red-500 p-3 text-sm text-red-700 font-medium">
                {rejectDialogState.error}
              </div>
            )}

            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                {t('admin.rejectDepositNoteLabel')} <span className="text-red-500">*</span>
              </label>
              <textarea
                value={rejectDialogState.note}
                onChange={(e) => setRejectDialogState(prev => ({ ...prev, note: e.target.value, error: null, clientError: null }))}
                placeholder={t('admin.rejectDepositNotePlaceholder')}
                className={`w-full h-24 px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-[#eab308] focus:border-transparent text-sm resize-none ${
                    rejectDialogState.clientError ? 'border-red-500 ring-1 ring-red-500' : 'border-gray-300'
                }`}
              />
              {rejectDialogState.clientError && (
                <p className="text-red-500 text-xs mt-1 font-medium">{rejectDialogState.clientError}</p>
              )}
            </div>
            <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100">
              <button 
                onClick={() => setRejectDialogState({ isOpen: false, id: null, note: '', error: null, clientError: null })}
                className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-medium rounded-md transition-colors"
              >
                {t('admin.cancel')}
              </button>
              <button 
                onClick={handleReject}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-sm font-medium rounded-md shadow-sm transition-colors"
              >
                {t('admin.submit')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
