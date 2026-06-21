import { ENDPOINTS } from '../../services/endpoints';
import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'react-hot-toast';
import { X, Check, Eye } from 'lucide-react';
import api, { getImageUrl } from '../../api/axios';
import axios from 'axios';
export default function DepositRequestsPage() {
  const { t, i18n } = useTranslation();
  
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [receiptImage, setReceiptImage] = useState(null);
  const [lightboxUrl, setLightboxUrl] = useState(null);
  
  const [approveDialogState, setApproveDialogState] = useState({ isOpen: false, id: null, error: null });
  const [rejectDialogState, setRejectDialogState] = useState({ isOpen: false, id: null, note: '', error: null });

  const handleViewReceipt = async (request) => {
    try {
      setReceiptImage(request);
      const response = await api.get(ENDPOINTS.BILLING.DOWNLOAD_RECEIPT(request.id), { responseType: 'blob' });
      const blob = response.data || response;
      const objectUrl = URL.createObjectURL(blob);
      setLightboxUrl(objectUrl);
    } catch (err) {
      toast.error('Failed to load receipt image.');
      setReceiptImage(null);
    }
  };

  const handleCloseLightbox = () => {
    if (lightboxUrl) {
      URL.revokeObjectURL(lightboxUrl);
    }
    setLightboxUrl(null);
    setReceiptImage(null);
  };

  const handleDownloadReceipt = async (request) => {
    try {
      const response = await api.get(ENDPOINTS.BILLING.DOWNLOAD_RECEIPT(request.id), { responseType: 'blob' });
      const blob = response.data || response;
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `receipt_${request.receiptNumber || request.id}`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      toast.error('Download failed.');
    }
  };

  useEffect(() => {
    const controller = new AbortController();
    fetchRequests(controller.signal);
    return () => controller.abort();
  }, []);

  const fetchRequests = async (signal) => {
    setLoading(true);
    try {
      const response = await api.get(ENDPOINTS.ADMIN.DEPOSIT_PENDING, { signal });
      const payload = response.data?.data || response.data;
      setRequests(Array.isArray(payload) ? payload : []);
    } catch (err) {
      if (axios.isCancel(err)) return;
      toast.error(err.title || t('common.error'));
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async () => {
    const { id } = approveDialogState;
    if (!id) return;
    try {
      await api.patch(ENDPOINTS.ADMIN.DEPOSIT_REVIEW(id), { status: 1 });
      setRequests(prev => prev.filter(r => r.id !== id));
      toast.success(t('admin.approveSuccess'));
      setApproveDialogState({ isOpen: false, id: null, error: null });
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
    try {
      await api.patch(ENDPOINTS.ADMIN.DEPOSIT_REVIEW(id), { 
        status: 2, 
        adminNote: note 
      });
      setRequests(prev => prev.filter(r => r.id !== id));
      toast.success(t('admin.rejectSuccess'));
      setRejectDialogState({ isOpen: false, id: null, note: '', error: null });
    } catch (err) {
      const isAlready = err.status === 409 || err.status === 422 || (err.title && err.title.toLowerCase().includes('already'));
      if (isAlready) {
        setRejectDialogState(prev => ({ ...prev, error: t('admin.alreadyReviewed') }));
      } else {
        toast.error(err.title || t('common.error'));
      }
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">{t('admin.depositRequests')}</h1>
      
      {/* Table Card */}
      <div className="bg-white text-gray-900 shadow-sm rounded-xl border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200 text-sm">
                <th className="px-6 py-4 font-semibold text-gray-700">{t('admin.clientId')}</th>
                <th className="px-6 py-4 font-semibold text-gray-700">{t('admin.amount')}</th>
                <th className="px-6 py-4 font-semibold text-gray-700">{t('admin.receiptNumber')}</th>
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
                    <td className="px-6 py-4"><div className="h-4 bg-gray-200 rounded w-1/2"></div></td>
                    <td className="px-6 py-4"><div className="h-4 bg-gray-200 rounded w-2/3"></div></td>
                    <td className="px-6 py-4 flex gap-2"><div className="h-8 bg-gray-200 rounded w-24"></div></td>
                  </tr>
                ))
              ) : requests.length === 0 ? (
                <tr>
                  <td colSpan="5" className="px-6 py-12 text-center text-gray-500">
                    {t('admin.noDepositRequests')}
                  </td>
                </tr>
              ) : (
                requests.map((request, idx) => (
                  <tr key={request.id} className={idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                    <td className="px-6 py-4 font-medium text-gray-900 font-mono text-xs">{request.clientId || '—'}</td>
                    <td className="px-6 py-4 text-gray-700 whitespace-nowrap">
                      {new Intl.NumberFormat('en-EG', { style: 'currency', currency: 'EGP' }).format(request.amount || 0)}
                    </td>
                    <td className="px-6 py-4 text-gray-500 font-mono text-xs">{request.receiptNumber || '—'}</td>
                    <td className="px-6 py-4 text-gray-500">
                      {request.submittedAt ? new Date(request.submittedAt).toLocaleDateString() : '—'}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleViewReceipt(request)}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-medium rounded-md transition-colors"
                        >
                          <Eye className="w-4 h-4" />
                          {t('admin.viewReceipt')}
                        </button>
                        <button
                          onClick={() => handleDownloadReceipt(request)}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 hover:bg-blue-100 hover:text-blue-700 text-blue-700 text-xs font-medium rounded-md transition-colors border border-blue-100"
                        >
                          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                          </svg>
                          {t('admin.download', 'Download')}
                        </button>
                        <button
                          onClick={() => setApproveDialogState({ isOpen: true, id: request.id, error: null })}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-green-500 hover:bg-green-600 text-white text-xs font-medium rounded-md transition-colors"
                        >
                          <Check className="w-4 h-4" />
                          {t('admin.approve')}
                        </button>
                        <button
                          onClick={() => setRejectDialogState({ isOpen: true, id: request.id, note: '', error: null })}
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
 
      {/* Lightbox Modal */}
      {receiptImage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="relative w-full max-w-4xl max-h-[90vh] flex flex-col items-center justify-center">
            <button
              onClick={handleCloseLightbox}
              className="absolute -top-12 right-0 p-2 text-white/70 hover:text-white bg-black/40 hover:bg-black/60 rounded-full transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
            <button
              onClick={() => handleDownloadReceipt(receiptImage)}
              className="absolute -top-12 right-12 p-2 text-white/70 hover:text-white bg-black/40 hover:bg-black/60 rounded-full transition-colors flex items-center gap-1 text-xs px-3 font-semibold"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              Download
            </button>
            {lightboxUrl ? (
              <img
                src={lightboxUrl}
                alt="Receipt"
                className="max-w-full max-h-[85vh] object-contain rounded-lg shadow-2xl"
              />
            ) : (
              <div className="text-white text-sm animate-pulse">Loading image...</div>
            )}
          </div>
        </div>
      )}

      {/* Confirmation Dialog - Approve */}
      {approveDialogState.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-sm p-6 space-y-4">
            <h3 className="text-lg font-bold text-gray-900">{t('admin.approveDepositTitle')}</h3>
            
            {approveDialogState.error && (
              <div className="bg-red-50 border-l-4 border-red-500 p-3 text-sm text-red-700">
                {approveDialogState.error}
              </div>
            )}

            <p className="text-gray-600 text-sm">{t('admin.approveDepositConfirm')}</p>
            <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100">
              <button 
                onClick={() => setApproveDialogState({ isOpen: false, id: null, error: null })}
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
              <div className="bg-red-50 border-l-4 border-red-500 p-3 text-sm text-red-700">
                {rejectDialogState.error}
              </div>
            )}

            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                {t('admin.rejectDepositNoteLabel')}
              </label>
              <textarea
                value={rejectDialogState.note}
                onChange={(e) => setRejectDialogState(prev => ({ ...prev, note: e.target.value, error: null }))}
                placeholder={t('admin.rejectDepositNotePlaceholder')}
                className="w-full h-24 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#eab308] focus:border-transparent text-sm resize-none"
              />
            </div>
            <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100">
              <button 
                onClick={() => setRejectDialogState({ isOpen: false, id: null, note: '', error: null })}
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
