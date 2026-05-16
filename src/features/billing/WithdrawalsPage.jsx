import React, { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { Loader2, DollarSign, Wallet, History, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import { billingApi } from '../../api/billing';
import SettingsSidebar from '../profile/SettingsSidebar';
import { Card } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';

const WITHDRAWAL_METHOD_BADGES = {
  0: { key: 'methodInstapay', color: 'bg-blue-100 text-blue-800' },
  1: { key: 'methodBank', color: 'bg-purple-100 text-purple-800' },
  2: { key: 'methodEWallet', color: 'bg-orange-100 text-orange-800' },
};

const WITHDRAWAL_STATUS = {
  0: { key: 'statusPending', color: 'bg-yellow-100 text-yellow-800' },
  1: { key: 'statusApproved', color: 'bg-green-100 text-green-800' },
  2: { key: 'statusRejected', color: 'bg-red-100 text-red-800' },
};

const formatEGP = (amount, locale) => {
  if (locale === 'ar') {
    return new Intl.NumberFormat('ar-EG', {
      style: 'decimal',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount) + ' ج.م';
  }
  return 'EGP ' + new Intl.NumberFormat('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
};

const WithdrawalsPage = () => {
  const { t, i18n } = useTranslation();
  const currentLocale = i18n.language;

  // Wallet Balance
  const [balance, setBalance] = useState(null);
  const [balanceLoading, setBalanceLoading] = useState(true);

  // Form State
  const [amount, setAmount] = useState('');
  const [method, setMethod] = useState(0); // 0: InstaPay, 1: BankTransfer, 2: EWallet
  const [instapayUsername, setInstapayUsername] = useState('');
  const [bankAccountDetails, setBankAccountDetails] = useState('');
  const [eWalletNumber, setEWalletNumber] = useState('');
  const [formErrors, setFormErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // History State
  const [withdrawals, setWithdrawals] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(true);

  const fetchBalance = useCallback(async () => {
    try {
      setBalanceLoading(true);
      const res = await billingApi.getWalletBalance();
      const data = res.data?.data || res.data?.value || res.data;
      setBalance(data?.balanceEGP ?? 0);
    } catch (err) {
      toast.error(err.title || t('errors.unexpected'));
    } finally {
      setBalanceLoading(false);
    }
  }, [t]);

  const fetchHistory = useCallback(async () => {
    try {
      setHistoryLoading(true);
      const res = await billingApi.getMyWithdrawalRequests();
      const data = res.data?.data || res.data?.value || res.data;
      setWithdrawals(Array.isArray(data) ? data : data?.items || []);
    } catch (err) {
      toast.error(err.title || t('errors.unexpected'));
    } finally {
      setHistoryLoading(false);
    }
  }, [t]);

  useEffect(() => {
    fetchBalance();
    fetchHistory();
  }, [fetchBalance, fetchHistory]);

  const validate = () => {
    const errors = {};
    const numAmount = parseFloat(amount);
    
    if (!amount || isNaN(numAmount) || numAmount <= 0) {
      errors.amount = t('billing.validation.amountRequired');
    }

    if (method === 0 && !instapayUsername.trim()) {
      errors.instapayUsername = t('billing.validation.instapayRequired');
    } else if (method === 1 && !bankAccountDetails.trim()) {
      errors.bankAccountDetails = t('billing.validation.bankRequired');
    } else if (method === 2 && !eWalletNumber.trim()) {
      errors.eWalletNumber = t('billing.validation.eWalletRequired');
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);
    try {
      const payload = {
        amount: parseFloat(amount),
        method,
        instapayUsername: method === 0 ? instapayUsername.trim() : '',
        bankAccountDetails: method === 1 ? bankAccountDetails.trim() : '',
        eWalletNumber: method === 2 ? eWalletNumber.trim() : ''
      };

      const res = await billingApi.submitWithdrawalRequest(payload);
      toast.success(t('billing.withdrawalSubmitted'));

      // Build local row and prepend
      const newReq = res.data?.data || res.data?.value || res.data || {};
      const localRow = {
        id: newReq.id || Date.now(),
        amount: parseFloat(amount),
        method,
        instapayUsername: payload.instapayUsername,
        bankAccountDetails: payload.bankAccountDetails,
        eWalletNumber: payload.eWalletNumber,
        status: newReq.status ?? 0,
        submittedDate: newReq.submittedDate || new Date().toISOString(),
        adminNote: newReq.adminNote || null,
        ...newReq
      };
      setWithdrawals(prev => [localRow, ...prev]);

      // Deduct balance locally for better UX
      setBalance(prev => Math.max(0, (prev || 0) - parseFloat(amount)));

      // Reset form
      setAmount('');
      setMethod(0);
      setInstapayUsername('');
      setBankAccountDetails('');
      setEWalletNumber('');
      setFormErrors({});
      
    } catch (err) {
      const errorTitle = err.title || '';
      
      // If backend returns ValidationProblemDetails, real errors are in err.errors
      if (err.errors) {
        const parsedErrors = {};
        let hasInsufficient = false;
        
        Object.entries(err.errors).forEach(([key, val]) => {
          const lowerKey = key.toLowerCase();
          const msg = Array.isArray(val) ? val[0] : val;
          if (msg.toLowerCase().includes('insufficient')) {
            hasInsufficient = true;
          }
          parsedErrors[lowerKey] = msg;
        });

        // Special handling for the insufficient balance translation
        if (hasInsufficient) {
          parsedErrors.amount = t('billing.insufficientBalance') || 'Insufficient balance for this withdrawal amount.';
        }

        setFormErrors(prev => ({ ...prev, ...parsedErrors }));
        return; // Don't show toast if we mapped it to fields
      }
      
      // Fallback for simple string errors
      if (errorTitle.toLowerCase().includes('insufficient')) {
        setFormErrors(prev => ({ ...prev, amount: t('billing.insufficientBalance') || 'Insufficient balance for this withdrawal amount.' }));
      } else {
        toast.error(errorTitle || t('errors.unexpected'));
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderMethodDetail = (dep) => {
    switch(dep.method) {
      case 0: return dep.instapayUsername;
      case 1: return dep.bankAccountDetails;
      case 2: return dep.eWalletNumber;
      default: return '—';
    }
  };

  return (
    <div className="container max-w-[1100px] mx-auto pt-8 pb-16 px-4 font-inter">
      <div className="flex flex-col md:flex-row gap-8">
        <SettingsSidebar />

        <main className="flex-1 space-y-8">
          <h1 className="text-2xl font-bold text-gray-900">{t('billing.withdrawalsTitle')}</h1>

          {/* Available Balance Card */}
          <div className="card" style={{ background: '#fff', borderRadius: '12px', padding: '1.5rem', border: '1px solid #E0E0E0' }}>
            <div className="flex justify-between items-center mb-2">
              <h2 className="text-lg font-semibold text-gray-800">{t('billing.availableBalance')}</h2>
              <DollarSign className="text-gray-400" size={24} />
            </div>
            {balanceLoading ? (
              <Loader2 className="w-6 h-6 animate-spin text-[#d4af37] mt-2" />
            ) : (
              <div className="text-3xl font-bold text-[#d4af37] mt-2">
                {formatEGP(balance, currentLocale)}
              </div>
            )}
          </div>

          {/* Request Withdrawal Form */}
          <Card className="p-8 border-none shadow-sm ring-1 ring-gray-100 rounded-2xl space-y-6">
            <div className="flex items-center gap-3 border-b border-gray-50 pb-4">
              <div className="w-10 h-10 bg-indigo-50 rounded-xl flex items-center justify-center text-indigo-600">
                <Wallet size={20} />
              </div>
              <h2 className="text-xl font-bold text-gray-800">{t('billing.requestWithdrawalTitle')}</h2>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Method Selector */}
              <div className="space-y-3">
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                  {t('billing.methodLabel')}
                </label>
                <div className="flex gap-4 bg-gray-50 p-2 rounded-xl border border-gray-100 overflow-x-auto">
                  {[0, 1, 2].map((m) => {
                    const keys = ['instapay', 'bankTransfer', 'eWallet'];
                    const isSelected = method === m;
                    return (
                      <label key={m} className={`flex-1 relative cursor-pointer group min-w-[120px]`}>
                        <input
                          type="radio"
                          name="withdrawalMethod"
                          value={m}
                          checked={isSelected}
                          onChange={() => {
                            setMethod(m);
                            setFormErrors(prev => {
                              const n = { ...prev };
                              ['instapayUsername', 'bankAccountDetails', 'eWalletNumber'].forEach(k => delete n[k]);
                              return n;
                            });
                          }}
                          className="sr-only"
                        />
                        <span className={`block text-center py-2.5 px-4 rounded-lg text-sm font-medium transition-all ${
                          isSelected 
                            ? 'bg-white text-[#d4af37] shadow-sm border border-gray-200' 
                            : 'text-gray-600 hover:text-gray-900 border border-transparent'
                        }`}>
                          {t(`billing.methods.${keys[m]}`)}
                        </span>
                      </label>
                    );
                  })}
                </div>
              </div>

              {/* Conditional Fields */}
              <div className="space-y-4">
                {/* AMOUNT (Always visible) */}
                <div className="space-y-2">
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wider" htmlFor="withdraw-amount">
                    {t('billing.amountLabel')}
                  </label>
                  <Input
                    id="withdraw-amount"
                    type="number"
                    step="0.01"
                    className={`h-12 rounded-xl ${formErrors.amount ? 'border-red-500' : 'border-gray-200'}`}
                    value={amount}
                    onChange={(e) => {
                      setAmount(e.target.value);
                      if (formErrors.amount) setFormErrors(prev => { const n = { ...prev }; delete n.amount; return n; });
                    }}
                    placeholder="0.00"
                  />
                  {formErrors.amount && <p className="text-red-500 text-xs mt-1 flex items-center gap-1"><AlertCircle size={14}/> {formErrors.amount}</p>}
                </div>

                {/* InstaPay */}
                {method === 0 && (
                  <div className="space-y-2 animate-in fade-in zoom-in-95 duration-200">
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider" htmlFor="instapay-username">
                      {t('billing.instapayUsername')}
                    </label>
                    <Input
                      id="instapay-username"
                      type="text"
                      className={`h-12 rounded-xl ${formErrors.instapayUsername ? 'border-red-500' : 'border-gray-200'}`}
                      value={instapayUsername}
                      onChange={(e) => {
                        setInstapayUsername(e.target.value);
                        if (formErrors.instapayUsername) setFormErrors(prev => { const n = {...prev}; delete n.instapayUsername; return n;});
                      }}
                      placeholder="username@instapay"
                    />
                    {formErrors.instapayUsername && <p className="text-red-500 text-xs mt-1 flex items-center gap-1"><AlertCircle size={14}/> {formErrors.instapayUsername}</p>}
                  </div>
                )}

                {/* Bank Transfer */}
                {method === 1 && (
                  <div className="space-y-2 animate-in fade-in zoom-in-95 duration-200">
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider" htmlFor="bank-details">
                      {t('billing.bankAccountDetails')}
                    </label>
                    <textarea
                      id="bank-details"
                      className={`w-full p-4 border rounded-xl focus:ring-2 focus:ring-[#d4af37]/20 focus:border-[#d4af37] outline-none transition-all min-h-[100px] resize-none ${formErrors.bankAccountDetails ? 'border-red-500' : 'border-gray-200'}`}
                      value={bankAccountDetails}
                      onChange={(e) => {
                        setBankAccountDetails(e.target.value);
                        if (formErrors.bankAccountDetails) setFormErrors(prev => { const n = {...prev}; delete n.bankAccountDetails; return n;});
                      }}
                      placeholder="Bank Name, Account Holder, IBAN / Account Number"
                    />
                    {formErrors.bankAccountDetails && <p className="text-red-500 text-xs mt-1 flex items-center gap-1"><AlertCircle size={14}/> {formErrors.bankAccountDetails}</p>}
                  </div>
                )}

                {/* E-Wallet */}
                {method === 2 && (
                  <div className="space-y-2 animate-in fade-in zoom-in-95 duration-200">
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider" htmlFor="ewallet-number">
                      {t('billing.eWalletNumber')}
                    </label>
                    <Input
                      id="ewallet-number"
                      type="text"
                      className={`h-12 rounded-xl ${formErrors.eWalletNumber ? 'border-red-500' : 'border-gray-200'}`}
                      value={eWalletNumber}
                      onChange={(e) => {
                        setEWalletNumber(e.target.value);
                        if (formErrors.eWalletNumber) setFormErrors(prev => { const n = {...prev}; delete n.eWalletNumber; return n;});
                      }}
                      placeholder="E-Wallet Mobile Number"
                    />
                    {formErrors.eWalletNumber && <p className="text-red-500 text-xs mt-1 flex items-center gap-1"><AlertCircle size={14}/> {formErrors.eWalletNumber}</p>}
                  </div>
                )}
              </div>

              {/* Submit Button */}
              <div className="pt-4">
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="bg-[#108a00] hover:bg-[#0d7300] text-white px-8 rounded-xl h-12 shadow-lg shadow-green-100 transition-all w-full sm:w-auto"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 size={18} className="animate-spin mr-2" />
                      {t('billing.submitting')}
                    </>
                  ) : (
                    t('billing.submitWithdrawal')
                  )}
                </Button>
              </div>
            </form>
          </Card>

          {/* Withdrawal History Table */}
          <Card className="p-8 border-none shadow-sm ring-1 ring-gray-100 rounded-2xl space-y-6">
            <div className="flex items-center gap-3 border-b border-gray-50 pb-4">
              <div className="w-10 h-10 bg-teal-50 rounded-xl flex items-center justify-center text-teal-600">
                <History size={20} />
              </div>
              <h2 className="text-xl font-bold text-gray-800">{t('billing.withdrawalHistoryTitle')}</h2>
            </div>

            {historyLoading ? (
              <div className="flex justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-[#d4af37]" />
              </div>
            ) : withdrawals.length === 0 ? (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <History size={28} className="text-gray-400" />
                </div>
                <h3 className="text-lg font-semibold text-gray-700 mb-1">No withdrawal requests yet</h3>
                <p className="text-sm text-gray-500">Your withdrawal requests will appear here.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-100">
                      <th className="text-left py-3 px-4 text-xs font-bold text-gray-500 uppercase tracking-wider">{t('billing.colAmount')}</th>
                      <th className="text-left py-3 px-4 text-xs font-bold text-gray-500 uppercase tracking-wider">{t('billing.colMethod')}</th>
                      <th className="text-left py-3 px-4 text-xs font-bold text-gray-500 uppercase tracking-wider">{t('billing.colDetail')}</th>
                      <th className="text-left py-3 px-4 text-xs font-bold text-gray-500 uppercase tracking-wider">{t('billing.colStatus')}</th>
                      <th className="text-left py-3 px-4 text-xs font-bold text-gray-500 uppercase tracking-wider">{t('billing.colSubmittedDate')}</th>
                      <th className="text-left py-3 px-4 text-xs font-bold text-gray-500 uppercase tracking-wider">{t('billing.colAdminNote')}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {withdrawals.map((req) => {
                      const statusInfo = WITHDRAWAL_STATUS[req.status] || WITHDRAWAL_STATUS[0];
                      const methodInfo = WITHDRAWAL_METHOD_BADGES[req.method] || WITHDRAWAL_METHOD_BADGES[0];
                      
                      return (
                        <tr key={req.id} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                          <td className="py-3 px-4 font-medium text-gray-900">
                            {formatEGP(req.amount, currentLocale)}
                          </td>
                          <td className="py-3 px-4">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-bold tracking-wide uppercase ${methodInfo.color}`}>
                              {t(`billing.${methodInfo.key}`)}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-gray-600 truncate max-w-[200px]">
                            {renderMethodDetail(req)}
                          </td>
                          <td className="py-3 px-4">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${statusInfo.color}`}>
                              {t(`billing.${statusInfo.key}`)}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-gray-600">
                            {req.submittedDate
                              ? new Intl.DateTimeFormat(currentLocale === 'ar' ? 'ar-EG' : 'en-US', {
                                  year: 'numeric',
                                  month: 'short',
                                  day: 'numeric',
                                }).format(new Date(req.submittedDate))
                              : '—'}
                          </td>
                          <td className="py-3 px-4 text-gray-600 max-w-[150px] truncate">
                            {req.status === 2 ? (req.adminNote || '—') : ''}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </Card>
        </main>
      </div>
    </div>
  );
};

export default WithdrawalsPage;
