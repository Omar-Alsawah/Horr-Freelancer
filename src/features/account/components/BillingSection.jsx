import { useState, useCallback } from 'react';
import { getWalletBalance, addPaymentMethod, getOnboardingStatus, getUserPaymentMethods, deletePaymentMethod, updatePaymentMethod, submitDepositRequest, getMyDepositRequests, downloadReceipt } from '../../../services/clientService';
import useFetch from '../../../hooks/useFetch';
import { toast } from 'sonner';
import Pagination from '../../contracts/components/Pagination';
import { BASE_URL } from '../../../services/apiClient';
import { currencyApi } from '../../../api/currency';
import { useEffect } from 'react';
import axios from 'axios';

const InstaPayLogo = () => (
  <svg className="w-full h-full" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect width="100" height="100" rx="20" fill="#FF6B35" />
    <path d="M30 50C30 37.85 39.85 28 52 28C64.15 28 74 37.85 74 50C74 62.15 64.15 72 52 72C39.85 72 30 62.15 30 50Z" fill="#FFF" />
    <circle cx="52" cy="50" r="8" fill="#FF6B35" />
    <circle cx="62" cy="42" r="3" fill="#FF6B35" />
  </svg>
);

const EWalletLogo = () => (
  <svg className="w-full h-full" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect width="100" height="100" rx="20" fill="#10B981" />
    <rect x="15" y="30" width="70" height="50" rx="6" fill="#FFF" />
    <rect x="15" y="30" width="70" height="18" rx="6" fill="#E5E7EB" />
    <circle cx="75" cy="62" r="6" fill="#10B981" />
  </svg>
);

const formatAccountIdentifier = (identifier = '') => {
  const visibleStart = identifier.slice(0, 3);
  const visibleEnd = identifier.slice(-3);
  if (identifier.length <= 6) {
    return `${visibleStart}${'*'.repeat(Math.max(0, identifier.length - 3))}`;
  }
  return `${visibleStart}${'*'.repeat(4)}${visibleEnd}`;
};

const formatAddedDate = (dateString) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', year: 'numeric' }).format(date);
};

const getMethodType = (methodName) => {
  if (!methodName) return 'unknown';
  const normalized = methodName.toLowerCase();
  if (normalized.includes('insta')) return 'insta';
  if (normalized.includes('wallet') || normalized.includes('e-wallet') || normalized.includes('ewallet')) return 'wallet';
  return 'unknown';
};

const getReceiptUrl = (path) => {
  if (!path) return '';
  if (path.startsWith('http')) return path;
  return `${BASE_URL}${path}`;
};

const DepositStatusBadge = ({ status }) => {
  const normalized = (status || '').toLowerCase();
  let bg = 'bg-amber-100 text-amber-700 border-amber-200';
  let label = status || 'Pending';

  if (normalized === 'approved') {
    bg = 'bg-emerald-100 text-emerald-700 border-emerald-200';
  } else if (normalized === 'rejected') {
    bg = 'bg-rose-100 text-rose-700 border-rose-200';
  }

  return (
    <span className={`px-2.5 py-1 rounded-full text-[11px] font-bold border ${bg}`}>
      {label}
    </span>
  );
};

const HistorySkeleton = () => (
  <div className="space-y-4 animate-pulse">
    {[1, 2, 3].map(n => (
      <div key={n} className="bg-slate-50 border border-slate-200 rounded-3xl p-5 flex items-center justify-between">
        <div>
          <div className="h-5 bg-slate-200 rounded w-24 mb-2"></div>
          <div className="h-4 bg-slate-200 rounded w-48 mb-1"></div>
          <div className="h-3 bg-slate-200 rounded w-32"></div>
        </div>
        <div className="h-6 bg-slate-200 rounded-full w-20"></div>
      </div>
    ))}
  </div>
);

const BillingSection = () => {
  const { data: balanceData, loading: balanceLoading, refetch: refreshBalance } = useFetch(getWalletBalance);
  const { refetch: refreshOnboarding } = useFetch(getOnboardingStatus);
  const { data: paymentMethods, loading: paymentLoading, refetch: refreshPaymentMethods } = useFetch(getUserPaymentMethods);
  const [isAddingMethod, setIsAddingMethod] = useState(false);
  const [paymentType, setPaymentType] = useState('insta'); // 'insta' or 'wallet'
  const [identifier, setIdentifier] = useState('');
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [editIdentifier, setEditIdentifier] = useState('');
  const [updating, setUpdating] = useState(false);

  // State for Deposit Request
  const [isDepositing, setIsDepositing] = useState(false);
  const [depositAmount, setDepositAmount] = useState('');
  const [depositReceiptNumber, setDepositReceiptNumber] = useState('');
  const [depositPhoto, setDepositPhoto] = useState(null);
  const [depositPhotoPreview, setDepositPhotoPreview] = useState('');
  const [depositSubmitting, setDepositSubmitting] = useState(false);
  const [depositErrors, setDepositErrors] = useState({});

  // Paginated Deposit requests history list
  const [page, setPage] = useState(1);
  const fetchMyRequests = useCallback(() => getMyDepositRequests(page, 10), [page]);
  const { data: historyData, loading: historyLoading, refetch: refreshHistory } = useFetch(fetchMyRequests, true);

  // Conversion rate
  const [conversionRate, setConversionRate] = useState(48.00);

  useEffect(() => {
    const controller = new AbortController();
    const fetchRate = async () => {
      try {
        const res = await currencyApi.convertCurrency(1, 'USD', 'EGP', { signal: controller.signal });
        const rate = res?.data?.amount ?? res?.data?.convertedAmount ?? res?.data?.result ?? 48.00;
        setConversionRate(Number(rate));
      } catch (err) {
        if (axios.isCancel(err)) return;
        console.error('Failed to fetch conversion rate:', err);
      }
    };
    fetchRate();
    return () => controller.abort();
  }, []);

  const handleDownloadReceipt = async (reqId, receiptNum) => {
    try {
      const blob = await downloadReceipt(reqId);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `receipt_${receiptNum || reqId}`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error('[BillingSection] download error:', err);
      toast.error('Failed to download receipt');
    }
  };

  const handleAddMethod = async () => {
    if (!identifier.trim()) {
      toast.error('Please enter your account identifier.');
      return;
    }
    setSaving(true);
    try {
      const payload = {
        methodName: paymentType === 'insta' ? 'InstaPay' : 'E-Wallet',
        accountIdentifier: paymentType === 'insta' ? `${identifier.trim()}@instapay` : identifier.trim()
      };
      await addPaymentMethod(payload);
      toast.success('Billing method added successfully!');
      await Promise.all([refreshPaymentMethods(), refreshOnboarding()]);
      setIsAddingMethod(false);
      setIdentifier('');
    } catch {
      toast.error('Failed to add billing method');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteMethod = async (methodId) => {
    setDeletingId(methodId);
    try {
      await deletePaymentMethod(methodId);
      toast.success('Payment method removed');
      await Promise.all([refreshPaymentMethods(), refreshOnboarding()]);
      setShowDeleteConfirm(false);
    } catch {
      toast.error('Failed to remove payment method');
    } finally {
      setDeletingId(null);
    }
  };
  const handleUpdateMethod = async (methodId, type) => {
    if (!editIdentifier.trim()) {
      toast.error('Please enter an account identifier.');
      return;
    }
    setUpdating(true);
    try {
      const payload = {
        methodName: type === 'insta' ? 'InstaPay' : 'E-Wallet',
        accountIdentifier: type === 'insta' ? `${editIdentifier.trim()}@instapay` : editIdentifier.trim()
      };
      await updatePaymentMethod(methodId, payload);
      toast.success('Billing method updated successfully!');
      await Promise.all([refreshPaymentMethods(), refreshOnboarding()]);
      setEditingId(null);
    } catch {
      toast.error('Failed to update billing method');
    } finally {
      setUpdating(false);
    }
  };

  const validateDepositForm = () => {
    const errors = {};
    const amountVal = parseFloat(depositAmount);
    if (!depositAmount || isNaN(amountVal) || amountVal <= 0) {
      errors.amount = 'Please enter a valid deposit amount greater than 0.';
    }
    if (!depositReceiptNumber.trim()) {
      errors.receiptNumber = 'Receipt number is required.';
    }
    if (!depositPhoto) {
      errors.receiptPhoto = 'Receipt photo is required.';
    } else if (depositPhoto.size > 5 * 1024 * 1024) {
      errors.receiptPhoto = 'File size must not exceed 5MB.';
    }
    setDepositErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleDepositSubmit = async (e) => {
    e.preventDefault();
    if (!validateDepositForm()) {
      return;
    }
    setDepositSubmitting(true);
    try {
      const formData = new FormData();
      formData.append('Amount', parseFloat(depositAmount));
      formData.append('ReceiptNumber', depositReceiptNumber.trim());
      formData.append('ReceiptPhoto', depositPhoto);

      await submitDepositRequest(formData);
      toast.success('Deposit request submitted successfully!');
      
      setDepositAmount('');
      setDepositReceiptNumber('');
      setDepositPhoto(null);
      setDepositPhotoPreview('');
      setDepositErrors({});
      setIsDepositing(false);

      await Promise.all([refreshBalance(), refreshHistory()]);
    } catch (err) {
      console.error(err);
    } finally {
      setDepositSubmitting(false);
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        setDepositErrors(prev => ({ ...prev, receiptPhoto: 'Only image files are allowed.' }));
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        setDepositErrors(prev => ({ ...prev, receiptPhoto: 'File size must not exceed 5MB.' }));
        return;
      }
      setDepositPhoto(file);
      setDepositErrors(prev => {
        const copy = { ...prev };
        delete copy.receiptPhoto;
        return copy;
      });
      const reader = new FileReader();
      reader.onloadend = () => {
        setDepositPhotoPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleClearFile = () => {
    setDepositPhoto(null);
    setDepositPhotoPreview('');
  };

  return (
    <div id="billing" className="animate-in fade-in duration-500">
      <h1 className="text-3xl font-bold mb-8 text-gray-900">Billing & Payments</h1>

      {!isAddingMethod && !isDepositing ? (
        <div id="billing-view">
          <div className="bg-gray-50 rounded-2xl p-8 border border-gray-200 mb-8 shadow-sm flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <div>
              <h3 className="text-sm font-semibold text-gray-500 mb-3 uppercase tracking-wider">Outstanding balance</h3>
              <div className="text-5xl font-bold text-gray-900 my-2">
                {balanceLoading ? '...' : `${(balanceData?.balanceEGP ?? 0).toFixed(2)} EGP`}
              </div>
              <div className="flex items-center gap-3 text-gray-500 font-medium">
                <span>≈ {balanceLoading ? '...' : ((balanceData?.balanceEGP ?? 0) / conversionRate).toFixed(2)} USD</span>
                <span className="text-xs px-2 py-1 bg-white rounded-md border border-gray-100">1 USD = {conversionRate.toFixed(2)} EGP</span>
              </div>
            </div>
            <div>
              <button
                className="w-full md:w-auto px-8 py-3 rounded-full font-bold text-sm bg-gradient-to-br from-amber-600 to-amber-700 text-white shadow-lg hover:shadow-xl hover:-translate-y-0.5 active:translate-y-0 transition-all"
                onClick={() => setIsDepositing(true)}
              >
                Deposit Funds
              </button>
            </div>
          </div>

          <div className="bg-white rounded-3xl shadow-sm border border-black/5 p-6 md:p-8 mb-8 hover:shadow-lg transition-all duration-300">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-gray-900">Billing methods</h3>
              <div className="w-8 h-8 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center text-xs font-bold">✓</div>
            </div>

            {paymentLoading ? (
              <div className="py-6 text-center text-gray-500 text-sm">Loading billing details...</div>
            ) : Array.isArray(paymentMethods) && paymentMethods.length > 0 ? (
              <div className="space-y-4 mb-6">
                {paymentMethods.map((method) => {
                  const type = getMethodType(method.methodName);
                  const isInsta = type === 'insta';
                  const isEditing = editingId === method.id;

                  return (
                    <div key={method.id} className={`group bg-slate-50 border border-slate-200 rounded-3xl p-5 shadow-sm transition duration-300 hover:shadow-lg ${isEditing ? 'ring-2 ring-amber-500' : 'hover:-translate-y-0.5'}`}>
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex items-center gap-3">
                          <div className="w-11 h-11 rounded-2xl flex items-center justify-center flex-shrink-0">
                            {isInsta ? <InstaPayLogo /> : <EWalletLogo />}
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-gray-900">{method.methodName}</p>
                            <p className="text-xs text-gray-500 mt-1">Added {formatAddedDate(method.createdAt)}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className={`rounded-full px-3 py-1 text-[11px] font-semibold ${isInsta ? 'bg-amber-100 text-amber-700' : 'bg-emerald-100 text-emerald-700'}`}>
                            {isInsta ? 'InstaPay' : 'E-Wallet'}
                          </span>
                          {!isEditing && (
                            <>
                              <button
                                onClick={() => {
                                  setEditingId(method.id);
                                  setEditIdentifier(
                                    isInsta && method.accountIdentifier.endsWith('@instapay')
                                      ? method.accountIdentifier.slice(0, -9)
                                      : method.accountIdentifier
                                  );
                                }}
                                className="opacity-0 group-hover:opacity-100 transition-opacity ml-1 text-gray-400 hover:text-amber-600 p-1.5 hover:bg-amber-50 rounded-lg"
                                title="Edit payment method"
                              >
                                ✏️
                              </button>
                              <button
                                onClick={() => {
                                  setDeletingId(method.id);
                                  setShowDeleteConfirm(true);
                                }}
                                className="opacity-0 group-hover:opacity-100 transition-opacity ml-1 text-gray-400 hover:text-red-500 p-1.5 hover:bg-red-50 rounded-lg"
                                title="Remove payment method"
                              >
                                ✕
                              </button>
                            </>
                          )}
                        </div>
                      </div>
                      
                      {isEditing ? (
                        <div className="mt-4 animate-in fade-in slide-in-from-top-2 duration-300">
                          <div className="flex flex-col sm:flex-row gap-3">
                            <div className="flex-1 flex items-center bg-white border border-slate-300 rounded-xl focus-within:border-amber-500 focus-within:ring-4 focus-within:ring-amber-100 transition-all overflow-hidden">
                              <input 
                                type="text" 
                                className="flex-1 px-4 py-2.5 bg-transparent text-gray-900 text-sm outline-none" 
                                value={editIdentifier}
                                onChange={e => setEditIdentifier(e.target.value)}
                                placeholder={isInsta ? "username" : "10xxxxxxxxx"}
                                autoFocus
                              />
                              {isInsta && (
                                <span className="px-4 py-2.5 bg-slate-100 border-l border-slate-300 text-gray-500 text-sm font-semibold select-none">
                                  @instapay
                                </span>
                              )}
                            </div>
                            <div className="flex gap-2">
                              <button 
                                onClick={() => handleUpdateMethod(method.id, type)}
                                disabled={updating}
                                className="px-5 py-2.5 bg-amber-600 text-white text-sm font-bold rounded-xl hover:bg-amber-700 disabled:opacity-50 transition-colors shadow-sm"
                              >
                                {updating ? 'Saving...' : 'Save'}
                              </button>
                              <button 
                                onClick={() => setEditingId(null)}
                                disabled={updating}
                                className="px-5 py-2.5 bg-gray-200 text-gray-800 text-sm font-bold rounded-xl hover:bg-gray-300 disabled:opacity-50 transition-colors"
                              >
                                Cancel
                              </button>
                            </div>
                          </div>
                        </div>
                      ) : (
                        <p className="mt-4 text-sm text-gray-600">{formatAccountIdentifier(method.accountIdentifier)}</p>
                      )}
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="mb-6 p-6 bg-gray-50 rounded-2xl border border-dashed border-gray-300 text-center">
                <p className="text-gray-500 text-sm font-medium mb-6">
                  You haven't set up any billing methods yet. Add a method so you can hire when you're ready.
                </p>
                <button 
                  className="px-8 py-3 rounded-full font-bold text-sm bg-gradient-to-br from-amber-600 to-amber-700 text-white shadow-lg hover:shadow-xl hover:-translate-y-0.5 active:translate-y-0 transition-all"
                  onClick={() => setIsAddingMethod(true)}
                >
                  + Add a billing method
                </button>
              </div>
            )}

            <button
              className="w-full md:w-auto mt-2 inline-flex items-center justify-center px-6 py-3 rounded-full font-bold text-sm bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 transition-all"
              onClick={() => setIsAddingMethod(true)}
            >
              + Add another billing method
            </button>

            <p className="text-xs text-gray-400 mt-4">
              Your billing method will be charged only when you hire a freelancer or purchase a service.
            </p>
          </div>

          {/* Deposit Requests History Card */}
          <div className="bg-white rounded-3xl shadow-sm border border-black/5 p-6 md:p-8 mb-8 hover:shadow-lg transition-all duration-300">
            <h3 className="text-xl font-bold text-gray-900 mb-6">Deposit Requests History</h3>

            {historyLoading ? (
              <HistorySkeleton />
            ) : (() => {
              const historyItems = historyData?.items || historyData?.Items || (Array.isArray(historyData) ? historyData : []);
              const totalCount = historyData?.totalCount || historyData?.TotalCount || 0;
              const totalPages = historyData?.totalPages || historyData?.TotalPages || Math.ceil(totalCount / 10) || 1;

              if (historyItems.length === 0) {
                return (
                  <div className="p-6 bg-slate-50 rounded-2xl border border-dashed border-slate-300 text-center">
                    <p className="text-slate-500 text-sm font-medium">
                      No deposit requests found. You can submit one by clicking "Deposit Funds" above.
                    </p>
                  </div>
                );
              }

              return (
                <div className="space-y-4">
                  <div className="space-y-4">
                    {historyItems.map((req) => {
                      const reqId = req.id || req.Id;
                      const reqAmount = req.amount ?? req.Amount ?? 0;
                      const reqReceiptNum = req.receiptNumber ?? req.ReceiptNumber ?? '';
                      const reqCreatedAt = req.createdAt ?? req.CreatedAt ?? '';
                      const reqStatus = req.status ?? req.Status ?? 'Pending';
                      const reqAdminNote = req.adminNote ?? req.AdminNote ?? '';
                      const reqPhotoUrl = req.receiptPhotoUrl ?? req.ReceiptPhotoUrl ?? '';

                      return (
                        <div key={reqId} className="bg-slate-50 border border-slate-200 rounded-3xl p-5 shadow-sm transition duration-300 hover:shadow-lg">
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                            <div>
                              <div className="flex items-center gap-3">
                                <span className="text-lg font-bold text-gray-900">
                                  EGP {Number(reqAmount).toFixed(2)}
                                </span>
                                <DepositStatusBadge status={reqStatus} />
                              </div>
                              <div className="text-xs text-gray-500 mt-2 space-y-1">
                                <p>Receipt ID: <span className="font-semibold text-gray-700">{reqReceiptNum}</span></p>
                                <p>Submitted: {formatAddedDate(reqCreatedAt)}</p>
                              </div>
                            </div>
                            
                            {reqPhotoUrl && (
                              <div className="flex items-center">
                                <button 
                                  onClick={() => handleDownloadReceipt(reqId, reqReceiptNum)}
                                  className="inline-flex items-center gap-1.5 text-xs text-amber-600 hover:text-amber-700 font-bold bg-amber-50 hover:bg-amber-100 px-3 py-2 rounded-xl transition-all"
                                >
                                  📄 View Receipt
                                </button>
                              </div>
                            )}
                          </div>

                          {reqAdminNote && (
                            <div className="mt-4 pt-3 border-t border-slate-200/60 text-xs text-gray-600">
                              <span className="font-bold text-gray-700">Admin Note: </span>
                              {reqAdminNote}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>

                  <Pagination
                    page={page}
                    totalPages={totalPages}
                    onPageChange={(p) => setPage(p)}
                  />
                </div>
              );
            })()}
          </div>
        </div>
      ) : isAddingMethod ? (
        <div id="billing-add" className="bg-white rounded-3xl shadow-card-lg border border-black/5 p-6 md:p-8 mb-8 animate-in slide-in-from-bottom-4 duration-300">
          <div className="flex justify-between items-center mb-8">
            <h3 className="text-2xl font-bold text-gray-900">Add a billing method</h3>
            <button className="text-gray-400 hover:text-gray-600 transition-colors" onClick={() => setIsAddingMethod(false)}>✕</button>
          </div>

          <div className="flex gap-4 mb-8 bg-gray-50 p-1 rounded-2xl border border-gray-100">
            {['insta', 'wallet'].map(type => (
              <label key={type} className="flex-1 relative cursor-pointer">
                <input 
                  type="radio" 
                  name="paymentType" 
                  value={type} 
                  checked={paymentType === type}
                  onChange={() => {
                    setPaymentType(type);
                    setIdentifier('');
                  }}
                  className="hidden"
                />
                <span className={`flex items-center justify-center px-4 py-3 rounded-xl font-bold text-sm transition-all border border-transparent ${
                  paymentType === type 
                    ? 'bg-white text-amber-600 shadow-md border-gray-100 scale-[1.02]' 
                    : 'text-gray-500 hover:bg-white/50'
                }`}>
                  {type === 'insta' ? 'InstaPay' : 'E-Wallet'}
                </span>
              </label>
            ))}
          </div>

          <div className="space-y-6">
            {paymentType === 'insta' && (
              <div className="animate-in fade-in slide-in-from-left-2 duration-300">
                <label className="block font-semibold text-sm mb-2 text-gray-900 tracking-wide font-sans">
                  InstaPay Username
                </label>
                <div className="flex items-center bg-gray-50 border border-slate-200 rounded-lg focus-within:bg-white focus-within:border-amber-600 focus-within:ring-4 focus-within:ring-amber-100 focus-within:outline-none transition-all overflow-hidden font-sans">
                  <input 
                    type="text" 
                    className="flex-1 px-4 py-3 bg-transparent text-gray-900 text-sm focus:outline-none" 
                    placeholder="e.g. username"
                    value={identifier}
                    onChange={e => setIdentifier(e.target.value)}
                  />
                  <span className="px-4 py-3 bg-slate-100 border-l border-slate-200 text-gray-500 text-sm font-semibold select-none">
                    @instapay
                  </span>
                </div>
              </div>
            )}

            {paymentType === 'wallet' && (
              <div className="animate-in fade-in slide-in-from-left-2 duration-300">
                <label className="block font-semibold text-sm mb-2 text-gray-900 tracking-wide font-sans">
                  E-Wallet Mobile Number
                </label>
                <div className="flex gap-2 items-center">
                  <div className="w-16 h-[46px] bg-gray-50 border border-slate-200 rounded-lg flex items-center justify-center text-2xl shadow-inner">🇪🇬</div>
                  <input 
                    type="text" 
                    className="flex-1 px-4 py-3 border border-slate-200 rounded-lg bg-gray-50 text-gray-900 text-sm focus:bg-white focus:border-amber-600 focus:ring-4 focus:ring-amber-100 focus:outline-none transition-all font-sans" 
                    placeholder="10xxxxxxxxx" 
                    value={identifier}
                    onChange={e => setIdentifier(e.target.value)}
                  />
                </div>
              </div>
            )}
          </div>

          <div className="flex gap-4 mt-10">
            <button 
              className="px-10 py-3 rounded-full font-bold text-sm bg-gradient-to-br from-amber-600 to-amber-700 text-white shadow-lg hover:shadow-xl hover:-translate-y-0.5 active:translate-y-0 transition-all disabled:opacity-50"
              onClick={handleAddMethod}
              disabled={saving}
            >
              {saving ? 'Adding...' : 'Save Method'}
            </button>
            <button 
              className="px-10 py-3 rounded-full font-bold text-sm bg-white border border-gray-300 text-gray-900 hover:bg-gray-50 hover:border-gray-400 transition-all"
              onClick={() => {
                setIsAddingMethod(false);
                setIdentifier('');
              }}
              disabled={saving}
            >
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <div id="deposit-add" className="bg-white rounded-3xl shadow-card-lg border border-black/5 p-6 md:p-8 mb-8 animate-in slide-in-from-bottom-4 duration-300">
          <div className="flex justify-between items-center mb-8">
            <h3 className="text-2xl font-bold text-gray-900">Deposit Funds</h3>
            <button
              className="text-gray-400 hover:text-gray-600 transition-colors"
              onClick={() => {
                setIsDepositing(false);
                setDepositAmount('');
                setDepositReceiptNumber('');
                setDepositPhoto(null);
                setDepositPhotoPreview('');
                setDepositErrors({});
              }}
            >
              ✕
            </button>
          </div>

          <form onSubmit={handleDepositSubmit} className="space-y-6">
            <div>
              <label className="block font-semibold text-sm mb-2 text-gray-900 tracking-wide font-sans">
                Amount (EGP)
              </label>
              <input
                type="number"
                step="0.01"
                className={`w-full px-4 py-3 border rounded-lg bg-gray-50 text-gray-900 text-sm focus:bg-white focus:border-amber-600 focus:ring-4 focus:ring-amber-100 focus:outline-none transition-all font-sans ${
                  depositErrors.amount ? 'border-red-500 ring-4 ring-red-100' : 'border-slate-200'
                }`}
                placeholder="0.00"
                value={depositAmount}
                onChange={e => setDepositAmount(e.target.value)}
              />
              {depositErrors.amount && (
                <p className="text-red-500 text-xs mt-1 font-semibold">{depositErrors.amount}</p>
              )}
            </div>

            <div>
              <label className="block font-semibold text-sm mb-2 text-gray-900 tracking-wide font-sans">
                Receipt / Transaction Number
              </label>
              <input
                type="text"
                className={`w-full px-4 py-3 border rounded-lg bg-gray-50 text-gray-900 text-sm focus:bg-white focus:border-amber-600 focus:ring-4 focus:ring-amber-100 focus:outline-none transition-all font-sans ${
                  depositErrors.receiptNumber ? 'border-red-500 ring-4 ring-red-100' : 'border-slate-200'
                }`}
                placeholder="Enter receipt/transaction ID"
                value={depositReceiptNumber}
                onChange={e => setDepositReceiptNumber(e.target.value)}
              />
              {depositErrors.receiptNumber && (
                <p className="text-red-500 text-xs mt-1 font-semibold">{depositErrors.receiptNumber}</p>
              )}
            </div>

            <div>
              <label className="block font-semibold text-sm mb-2 text-gray-900 tracking-wide font-sans">
                Upload Receipt Photo
              </label>
              <div className="flex items-center gap-4">
                <label className="cursor-pointer inline-flex items-center justify-center px-6 py-3 border border-gray-300 rounded-lg text-sm font-semibold bg-white text-gray-700 hover:bg-gray-50 transition-colors">
                  Choose File
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleFileChange}
                  />
                </label>
                {depositPhoto && (
                  <button
                    type="button"
                    onClick={handleClearFile}
                    className="text-red-600 hover:text-red-700 text-xs font-semibold"
                  >
                    Clear File
                  </button>
                )}
              </div>
              {depositErrors.receiptPhoto && (
                <p className="text-red-500 text-xs mt-1 font-semibold">{depositErrors.receiptPhoto}</p>
              )}

              {depositPhotoPreview && (
                <div className="mt-4 border border-slate-200 rounded-2xl p-4 max-w-xs bg-slate-50 relative animate-in fade-in zoom-in-95 duration-200">
                  <img
                    src={depositPhotoPreview}
                    alt="Receipt preview"
                    className="max-h-40 rounded-xl object-contain mx-auto"
                  />
                  <p className="text-xs text-gray-500 mt-2 truncate text-center font-medium">{depositPhoto.name}</p>
                </div>
              )}
            </div>

            <div className="flex gap-4 mt-10">
              <button
                type="submit"
                className="px-10 py-3 rounded-full font-bold text-sm bg-gradient-to-br from-amber-600 to-amber-700 text-white shadow-lg hover:shadow-xl hover:-translate-y-0.5 active:translate-y-0 transition-all disabled:opacity-50"
                disabled={depositSubmitting}
              >
                {depositSubmitting ? 'Submitting...' : 'Submit Request'}
              </button>
              <button
                type="button"
                className="px-10 py-3 rounded-full font-bold text-sm bg-white border border-gray-300 text-gray-900 hover:bg-gray-50 hover:border-gray-400 transition-all"
                onClick={() => {
                  setIsDepositing(false);
                  setDepositAmount('');
                  setDepositReceiptNumber('');
                  setDepositPhoto(null);
                  setDepositPhotoPreview('');
                  setDepositErrors({});
                }}
                disabled={depositSubmitting}
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-xl max-w-sm w-full p-6 animate-in zoom-in-95 duration-200">
            <h3 className="text-xl font-bold text-gray-900 mb-2">Remove payment method?</h3>
            <p className="text-gray-600 text-sm mb-6">This action cannot be undone. You'll need to add the method again if you want to use it.</p>
            <div className="flex gap-3">
              <button
                className="flex-1 px-4 py-2.5 rounded-lg font-semibold text-sm bg-gray-100 text-gray-900 hover:bg-gray-200 transition-colors"
                onClick={() => {
                  setShowDeleteConfirm(false);
                  setDeletingId(null);
                }}
                disabled={deletingId !== null}
              >
                Keep it
              </button>
              <button
                className="flex-1 px-4 py-2.5 rounded-lg font-semibold text-sm bg-red-600 text-white hover:bg-red-700 transition-colors disabled:opacity-50"
                onClick={() => handleDeleteMethod(deletingId)}
                disabled={deletingId === null}
              >
                {deletingId !== null ? 'Removing...' : 'Remove'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BillingSection;
