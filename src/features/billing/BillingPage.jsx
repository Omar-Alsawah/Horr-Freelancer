import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { Loader2, Upload, Inbox, CreditCard } from 'lucide-react';
import toast from 'react-hot-toast';
import { billingApi } from '../../api/billing';
import SettingsSidebar from '../profile/SettingsSidebar';
import { Card } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';

const DEPOSIT_STATUS = {
  0: { key: 'statusPending', color: 'bg-yellow-100 text-yellow-800' },
  1: { key: 'statusApproved', color: 'bg-green-100 text-green-800' },
  2: { key: 'statusRejected', color: 'bg-red-100 text-red-800' },
};

const ACCEPTED_FILE_TYPES = ['image/jpeg', 'image/jpg', 'image/png'];

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

const BillingPage = () => {
  const { t, i18n } = useTranslation();
  const fileInputRef = useRef(null);

  // Wallet balance state
  const [balance, setBalance] = useState(null);
  const [balanceLoading, setBalanceLoading] = useState(true);

  // Deposit form state
  const [amount, setAmount] = useState('');
  const [receiptNumber, setReceiptNumber] = useState('');
  const [receiptPhoto, setReceiptPhoto] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);
  const [formErrors, setFormErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Deposit history state
  const [deposits, setDeposits] = useState([]);
  const [depositsLoading, setDepositsLoading] = useState(true);

  // Fetch wallet balance
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

  // Fetch deposit history
  const fetchDeposits = useCallback(async () => {
    try {
      setDepositsLoading(true);
      const res = await billingApi.getMyDepositRequests();
      const data = res.data?.data || res.data?.value || res.data;
      setDeposits(Array.isArray(data) ? data : data?.items || []);
    } catch (err) {
      toast.error(err.title || t('errors.unexpected'));
    } finally {
      setDepositsLoading(false);
    }
  }, [t]);

  useEffect(() => {
    fetchBalance();
    fetchDeposits();
  }, [fetchBalance, fetchDeposits]);

  // File selection handler
  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!ACCEPTED_FILE_TYPES.includes(file.type)) {
      setFormErrors(prev => ({ ...prev, receiptPhoto: t('billing.validation.invalidFileType') }));
      setReceiptPhoto(null);
      setPhotoPreview(null);
      e.target.value = '';
      return;
    }

    setReceiptPhoto(file);
    setFormErrors(prev => {
      const next = { ...prev };
      delete next.receiptPhoto;
      return next;
    });

    const reader = new FileReader();
    reader.onload = (ev) => setPhotoPreview(ev.target.result);
    reader.readAsDataURL(file);
  };

  // Validation
  const validate = () => {
    const errors = {};
    const numAmount = parseFloat(amount);
    if (!amount || isNaN(numAmount) || numAmount <= 0) {
      errors.amount = t('billing.validation.amountRequired');
    }
    if (!receiptNumber.trim()) {
      errors.receiptNumber = t('billing.validation.receiptNumberRequired');
    }
    if (!receiptPhoto) {
      errors.receiptPhoto = t('billing.validation.receiptPhotoRequired');
    }
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Submit deposit
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);
    try {
      const formData = new FormData();
      formData.append('Amount', parseFloat(amount));
      formData.append('ReceiptNumber', receiptNumber.trim());
      formData.append('ReceiptPhoto', receiptPhoto);

      const res = await billingApi.submitDepositRequest(formData);
      toast.success(t('billing.depositSubmitted'));

      // Build a local row from form data + response
      const newDeposit = res.data?.data || res.data?.value || res.data || {};
      const localRow = {
        id: newDeposit.id || Date.now(),
        amount: parseFloat(amount),
        receiptNumber: receiptNumber.trim(),
        status: newDeposit.status ?? 0,
        submittedDate: newDeposit.submittedDate || new Date().toISOString(),
        adminNote: newDeposit.adminNote || null,
        ...newDeposit,
      };
      setDeposits(prev => [localRow, ...prev]);

      // Reset form
      setAmount('');
      setReceiptNumber('');
      setReceiptPhoto(null);
      setPhotoPreview(null);
      setFormErrors({});
      if (fileInputRef.current) fileInputRef.current.value = '';
    } catch (err) {
      toast.error(err.title || t('errors.unexpected'));
    } finally {
      setIsSubmitting(false);
    }
  };

  const currentLocale = i18n.language;

  return (
    <div className="max-w-[1100px] mx-auto pt-8 pb-16 px-4" style={{ fontFamily: 'var(--font-body)' }}>
      <div className="flex flex-col md:flex-row gap-8">
        <SettingsSidebar />

        <main className="flex-1 space-y-8">
          <h1 className="heading-h1">{t('billing.pageTitle')}</h1>

          {/* Outstanding Balance Card */}
          <div className="card-base rounded-horr-lg p-6">
            <h3 className="label text-text-secondary mb-2">
              {t('billing.outstandingBalance')}
            </h3>
            {balanceLoading ? (
              <Loader2 className="w-6 h-6 animate-spin text-gold" />
            ) : (
              <>
                <div className="text-h1 font-bold text-text-main mt-2 mb-1 mono">
                  {formatEGP(balance, currentLocale)}
                </div>
                <p className="body-sm">
                  {t('billing.approxUsd', { amount: new Intl.NumberFormat(currentLocale === 'ar' ? 'ar-EG' : 'en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(balance / 47.85) })}
                </p>
                <p className="caption mt-1">
                  {t('billing.conversionRate')}
                </p>
              </>
            )}
          </div>

          {/* Deposit Request Form Card */}
          <Card className="card-base p-8 space-y-6">
            <div className="flex items-center gap-3 border-b border-[var(--color-border)] pb-4">
              <div className="w-10 h-10 bg-gold-light rounded-horr-lg flex items-center justify-center text-gold">
                <CreditCard size={20} />
              </div>
              <div>
                <h2 className="heading-h3">{t('billing.depositTitle')}</h2>
                <p className="caption mt-0.5">{t('billing.depositDescription')}</p>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Amount */}
              <div className="space-y-2">
                <label className="label" htmlFor="deposit-amount">
                  {t('billing.amountLabel')}
                </label>
                <Input
                  id="deposit-amount"
                  type="number"
                  step="0.01"
                  min="0"
                  className={`form-input h-12 ${formErrors.amount ? 'border-danger-border' : ''}`}
                  value={amount}
                  onChange={(e) => {
                    setAmount(e.target.value);
                    if (formErrors.amount) setFormErrors(prev => { const n = { ...prev }; delete n.amount; return n; });
                  }}
                  placeholder={t('billing.amountPlaceholder')}
                />
                {formErrors.amount && <p className="error-message">{formErrors.amount}</p>}
              </div>

              {/* Receipt Number */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider" htmlFor="receipt-number">
                  {t('billing.receiptNumberLabel')}
                </label>
                <Input
                  id="receipt-number"
                  type="text"
                  className={`h-12 rounded-xl ${formErrors.receiptNumber ? 'border-red-500' : 'border-gray-200'}`}
                  value={receiptNumber}
                  onChange={(e) => {
                    setReceiptNumber(e.target.value);
                    if (formErrors.receiptNumber) setFormErrors(prev => { const n = { ...prev }; delete n.receiptNumber; return n; });
                  }}
                  placeholder={t('billing.receiptNumberPlaceholder')}
                />
                {formErrors.receiptNumber && <p className="text-red-500 text-xs mt-1">{formErrors.receiptNumber}</p>}
              </div>

              {/* Receipt Photo */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                  {t('billing.receiptPhotoLabel')}
                </label>
                <div className="flex items-center gap-3">
                  <Button
                    type="button"
                    variant="outline"
                    className="rounded-xl border-gray-200 hover:bg-gray-50"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <Upload size={16} className="mr-2" />
                    {t('billing.chooseFile')}
                  </Button>
                  {receiptPhoto && (
                    <span className="text-sm text-gray-600 truncate max-w-[200px]">{receiptPhoto.name}</span>
                  )}
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".jpg,.jpeg,.png"
                  className="hidden"
                  onChange={handleFileChange}
                />
                <p className="text-xs text-gray-400">{t('billing.receiptPhotoHint')}</p>
                {formErrors.receiptPhoto && <p className="text-red-500 text-xs mt-1">{formErrors.receiptPhoto}</p>}

                {/* Thumbnail Preview */}
                {photoPreview && (
                  <div className="mt-3">
                    <img
                      src={photoPreview}
                      alt="Receipt preview"
                      className="w-32 h-32 object-cover rounded-xl border border-gray-200 shadow-sm"
                    />
                  </div>
                )}
              </div>

              {/* Submit */}
              <div className="pt-2">
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="bg-[#108a00] hover:bg-[#0d7300] text-white px-8 rounded-xl h-12 shadow-lg shadow-green-100 transition-all"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 size={18} className="animate-spin mr-2" />
                      {t('billing.submitting')}
                    </>
                  ) : (
                    t('billing.submitDeposit')
                  )}
                </Button>
              </div>
            </form>
          </Card>

          {/* Deposit Request History */}
          <Card className="p-8 border-none shadow-sm ring-1 ring-gray-100 rounded-2xl space-y-6">
            <div className="flex items-center gap-3 border-b border-gray-50 pb-4">
              <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center text-blue-600">
                <Inbox size={20} />
              </div>
              <h2 className="text-xl font-bold text-gray-800">{t('billing.historyTitle')}</h2>
            </div>

            {depositsLoading ? (
              <div className="flex justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-[#d4af37]" />
              </div>
            ) : deposits.length === 0 ? (
              /* Empty State */
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Inbox size={28} className="text-gray-400" />
                </div>
                <h3 className="text-lg font-semibold text-gray-700 mb-1">{t('billing.emptyTitle')}</h3>
                <p className="text-sm text-gray-500">{t('billing.emptySubtitle')}</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-100">
                      <th className="text-left py-3 px-4 text-xs font-bold text-gray-500 uppercase tracking-wider">{t('billing.colAmount')}</th>
                      <th className="text-left py-3 px-4 text-xs font-bold text-gray-500 uppercase tracking-wider">{t('billing.colReceiptNumber')}</th>
                      <th className="text-left py-3 px-4 text-xs font-bold text-gray-500 uppercase tracking-wider">{t('billing.colStatus')}</th>
                      <th className="text-left py-3 px-4 text-xs font-bold text-gray-500 uppercase tracking-wider">{t('billing.colSubmittedDate')}</th>
                      <th className="text-left py-3 px-4 text-xs font-bold text-gray-500 uppercase tracking-wider">{t('billing.colAdminNote')}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {deposits.map((dep) => {
                      const statusInfo = DEPOSIT_STATUS[dep.status] || DEPOSIT_STATUS[0];
                      return (
                        <tr key={dep.id} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                          <td className="py-3 px-4 font-medium text-gray-900">
                            {formatEGP(dep.amount, currentLocale)}
                          </td>
                          <td className="py-3 px-4 text-gray-600">
                            {dep.receiptNumber}
                          </td>
                          <td className="py-3 px-4">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${statusInfo.color}`}>
                              {t(`billing.${statusInfo.key}`)}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-gray-600">
                            {dep.submittedDate
                              ? new Intl.DateTimeFormat(currentLocale === 'ar' ? 'ar-EG' : 'en-US', {
                                  year: 'numeric',
                                  month: 'short',
                                  day: 'numeric',
                                }).format(new Date(dep.submittedDate))
                              : '—'}
                          </td>
                          <td className="py-3 px-4 text-gray-600">
                            {dep.status === 2 ? (dep.adminNote || '—') : ''}
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

export default BillingPage;
