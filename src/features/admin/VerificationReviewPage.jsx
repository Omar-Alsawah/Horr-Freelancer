import { ENDPOINTS } from '../../services/endpoints';
import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'react-hot-toast';
import { X, Check, ChevronLeft, ChevronRight } from 'lucide-react';
import api, { getImageUrl } from '../../api/axios';
import axios from 'axios';
const IMAGE_TYPES = ['frontId', 'backId', 'selfie'];

export default function VerificationReviewPage() {
  const { t } = useTranslation();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterMode, setFilterMode] = useState('pending'); // 'pending' | 'all'

  // Lightbox state
  const [lightbox, setLightbox] = useState({ isOpen: false, requestId: null, currentIndex: 0 });
  
  // Dialog states
  const [approveDialog, setApproveDialog] = useState({ isOpen: false, id: null, error: null });
  const [rejectDialog, setRejectDialog] = useState({ isOpen: false, id: null, reason: '', error: null, clientError: null });

  useEffect(() => {
    const controller = new AbortController();
    fetchRequests(controller.signal);
    return () => controller.abort();
  }, [filterMode]);

  const fetchRequests = async (signal) => {
    setLoading(true);
    setRequests([]);
    try {
      const endpoint = filterMode === 'pending'
        ? ENDPOINTS.VERIFICATION.PENDING
        : ENDPOINTS.VERIFICATION.ALL;
      const response = await api.get(endpoint, { signal });
      setRequests(response.data || []);
    } catch (err) {
      if (axios.isCancel(err)) return;
      toast.error(err.title || t('common.error'));
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async () => {
    const { id } = approveDialog;
    if (!id) return;
    try {
      await api.post(ENDPOINTS.VERIFICATION.REVIEW, { requestId: id, approved: true });
      setRequests(prev => prev.filter(r => r.id !== id));
      toast.success(t('admin.verifyApproveSuccess'));
      setApproveDialog({ isOpen: false, id: null, error: null });
    } catch (err) {
      setApproveDialog(prev => ({ ...prev, error: err.title || t('common.error') }));
    }
  };

  const handleReject = async () => {
    const { id, reason } = rejectDialog;
    if (!id) return;
    if (!reason.trim()) {
      setRejectDialog(prev => ({ ...prev, clientError: t('admin.rejectionReasonPlaceholder') }));
      return;
    }

    try {
      await api.post(ENDPOINTS.VERIFICATION.REVIEW, { 
        requestId: id, 
        approved: false, 
        rejectionReason: reason 
      });
      setRequests(prev => prev.filter(r => r.id !== id));
      toast.success(t('admin.verifyRejectSuccess'));
      setRejectDialog({ isOpen: false, id: null, reason: '', error: null, clientError: null });
    } catch (err) {
      setRejectDialog(prev => ({ ...prev, error: err.title || t('common.error') }));
    }
  };

  const openLightbox = (requestId, index) => {
    setLightbox({ isOpen: true, requestId, currentIndex: index });
  };

  const navigateLightbox = (dir) => {
    setLightbox(prev => ({
      ...prev,
      currentIndex: (prev.currentIndex + dir + 3) % 3
    }));
  };

  const currentRequest = requests.find(r => r.id === lightbox.requestId);
  const currentImages = currentRequest ? [currentRequest.frontImageUrl, currentRequest.backImageUrl, currentRequest.selfieUrl] : [];

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">{t('admin.verificationRequests')}</h1>

      {/* Filter Toggle */}
      <div className="flex items-center gap-2 bg-gray-100 p-1 rounded-lg w-fit">
        {['pending', 'all'].map((mode) => (
          <button
            key={mode}
            onClick={() => setFilterMode(mode)}
            className={`px-4 py-1.5 text-sm font-medium rounded-md transition-all ${
              filterMode === mode
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            {mode === 'pending' ? t('admin.pendingOnly') : t('admin.allRequests')}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 animate-pulse space-y-4">
              <div className="h-6 bg-gray-200 rounded w-3/4"></div>
              <div className="h-4 bg-gray-200 rounded w-1/3"></div>
              <div className="grid grid-cols-3 gap-2">
                <div className="aspect-square bg-gray-200 rounded"></div>
                <div className="aspect-square bg-gray-200 rounded"></div>
                <div className="aspect-square bg-gray-200 rounded"></div>
              </div>
              <div className="flex gap-2">
                <div className="h-10 bg-gray-200 rounded flex-1"></div>
                <div className="h-10 bg-gray-200 rounded flex-1"></div>
              </div>
            </div>
          ))}
        </div>
      ) : requests.length === 0 ? (
        <div className="bg-white rounded-xl p-12 text-center border border-gray-200 shadow-sm">
          <p className="text-gray-500">{t('admin.noVerificationRequests')}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {requests.map(request => (
            <div key={request.id} className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 hover:shadow-md transition-shadow flex flex-col space-y-4">
              <div>
                <h3 className="text-lg font-bold text-gray-900">{request.userFullName}</h3>
                <p className="text-sm text-gray-500">
                  {request.submittedAt ? new Date(request.submittedAt).toLocaleDateString() : '—'}
                </p>
              </div>

              <div className="grid grid-cols-3 gap-2">
                {[request.frontImageUrl, request.backImageUrl, request.selfieUrl].map((url, idx) => (
                  <button 
                    key={idx} 
                    onClick={() => openLightbox(request.id, idx)}
                    className="aspect-square rounded-lg border border-gray-200 overflow-hidden hover:opacity-80 transition-opacity bg-gray-50"
                  >
                    <img src={getImageUrl(url)} alt={t(`admin.${IMAGE_TYPES[idx]}`)} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>

              <div className="flex gap-2 pt-2 mt-auto">
                {(filterMode === 'all' && (request.status === 1 || request.status === 2)) ? (
                  // Already reviewed — show status badge only
                  <div className="w-full">
                    <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-semibold ${
                      request.status === 1
                        ? 'bg-green-50 text-green-700 border border-green-200'
                        : 'bg-red-50 text-red-700 border border-red-200'
                    }`}>
                      {request.status === 1 ? <Check className="w-4 h-4" /> : <X className="w-4 h-4" />}
                      {request.status === 1 ? t('admin.approved') : t('admin.rejected')}
                    </span>
                    {request.status === 2 && request.rejectionReason && (
                      <p className="text-xs text-gray-500 mt-2 leading-relaxed">
                        <span className="font-medium">{t('admin.reason')}:</span> {request.rejectionReason}
                      </p>
                    )}
                  </div>
                ) : (
                  // Pending — show action buttons
                  <>
                    <button
                      onClick={() => setApproveDialog({ isOpen: true, id: request.id, error: null })}
                      className="flex-1 inline-flex items-center justify-center gap-1.5 px-4 py-2.5 bg-green-500 hover:bg-green-600 text-white text-sm font-semibold rounded-lg transition-colors"
                    >
                      <Check className="w-4 h-4" />
                      {t('admin.approve')}
                    </button>
                    <button
                      onClick={() => setRejectDialog({ isOpen: true, id: request.id, reason: '', error: null, clientError: null })}
                      className="flex-1 inline-flex items-center justify-center gap-1.5 px-4 py-2.5 bg-red-500 hover:bg-red-600 text-white text-sm font-semibold rounded-lg transition-colors"
                    >
                      <X className="w-4 h-4" />
                      {t('admin.reject')}
                    </button>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Lightbox */}
      {lightbox.isOpen && currentRequest && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm p-4">
          <button 
            onClick={() => setLightbox({ ...lightbox, isOpen: false })}
            className="absolute top-6 right-6 p-2 text-white/70 hover:text-white bg-white/10 hover:bg-white/20 rounded-full transition-all"
          >
            <X className="w-6 h-6" />
          </button>
          
          <button 
            onClick={() => navigateLightbox(-1)}
            className="absolute left-6 p-3 text-white/70 hover:text-white bg-white/10 hover:bg-white/20 rounded-full transition-all"
          >
            <ChevronLeft className="w-8 h-8" />
          </button>

          <div className="max-w-4xl max-h-[80vh] flex flex-col items-center gap-4">
            <img 
              src={getImageUrl(currentImages[lightbox.currentIndex])} 
              alt={t(`admin.${IMAGE_TYPES[lightbox.currentIndex]}`)}
              className="max-w-full max-h-[75vh] object-contain rounded-lg shadow-2xl"
            />
            <span className="text-white font-medium bg-black/50 px-4 py-1.5 rounded-full text-sm">
              {t(`admin.${IMAGE_TYPES[lightbox.currentIndex]}`)} ({lightbox.currentIndex + 1} / 3)
            </span>
          </div>

          <button 
            onClick={() => navigateLightbox(1)}
            className="absolute right-6 p-3 text-white/70 hover:text-white bg-white/10 hover:bg-white/20 rounded-full transition-all"
          >
            <ChevronRight className="w-8 h-8" />
          </button>
        </div>
      )}

      {/* Approve Dialog */}
      {approveDialog.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm p-6 space-y-4">
            <h3 className="text-xl font-bold text-gray-900">{t('admin.approveVerificationTitle')}</h3>
            <p className="text-gray-600 text-sm leading-relaxed">{t('admin.approveVerificationConfirm')}</p>
            
            {approveDialog.error && (
              <p className="text-red-500 text-sm font-medium">{approveDialog.error}</p>
            )}

            <div className="flex items-center justify-end gap-3 pt-2">
              <button 
                onClick={() => setApproveDialog({ isOpen: false, id: null, error: null })}
                className="px-4 py-2.5 text-gray-700 font-medium hover:bg-gray-100 rounded-lg transition-colors"
              >
                {t('admin.cancel')}
              </button>
              <button 
                onClick={handleApprove}
                className="px-6 py-2.5 bg-[#eab308] hover:bg-yellow-600 text-white font-bold rounded-lg shadow-sm transition-all shadow-yellow-200"
              >
                {t('admin.approve')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reject Dialog */}
      {rejectDialog.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6 space-y-4">
            <h3 className="text-xl font-bold text-gray-900">{t('admin.rejectVerificationTitle')}</h3>
            
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-700">{t('admin.rejectionReason')}</label>
              <textarea
                value={rejectDialog.reason}
                onChange={(e) => setRejectDialog(prev => ({ ...prev, reason: e.target.value, error: null, clientError: null }))}
                placeholder={t('admin.rejectionReasonPlaceholder')}
                className={`w-full h-32 px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-[#eab308] focus:border-transparent text-sm resize-none transition-all ${
                  rejectDialog.clientError || rejectDialog.error ? 'border-red-500 ring-red-50' : 'border-gray-200 focus:ring-yellow-50 shadow-sm'
                }`}
              />
              {(rejectDialog.clientError || rejectDialog.error) && (
                <p className="text-red-500 text-xs font-semibold">{rejectDialog.clientError || rejectDialog.error}</p>
              )}
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button 
                onClick={() => setRejectDialog({ isOpen: false, id: null, reason: '', error: null, clientError: null })}
                className="px-4 py-2.5 text-gray-700 font-medium hover:bg-gray-100 rounded-lg transition-colors"
              >
                {t('admin.cancel')}
              </button>
              <button 
                onClick={handleReject}
                className="px-6 py-2.5 bg-red-500 hover:bg-red-600 text-white font-bold rounded-lg shadow-sm transition-all shadow-red-100"
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
