import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Wallet, ArrowDownFromLine, ShieldCheck, Gavel } from 'lucide-react';
import api from '../../api/axios';

export default function AdminDashboardPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [counts, setCounts] = useState({ deposits: null, withdrawals: null, verifications: null, disputes: null });

  useEffect(() => {
    const fetchCounts = async () => {
      const [depositsRes, withdrawalsRes, verificationsRes, disputesRes] = await Promise.allSettled([
        api.get('/api/admin/billing/deposit-requests/pending'),
        api.get('/api/admin/billing/withdrawal-requests/pending'),
        api.get('/api/Verification/pending'),
        api.get('/api/disputes'),
      ]);

      const resolve = (res) => {
        if (res.status !== 'fulfilled') return '—';
        const payload = res.value.data?.data || res.value.data;
        return Array.isArray(payload) ? payload.length : '—';
      };

      const resolveDisputes = (res) => {
        if (res.status !== 'fulfilled') return '—';
        const payload = res.value.data?.data || res.value.data;
        return typeof payload?.totalCount === 'number' ? payload.totalCount : '—';
      };

      setCounts({
        deposits: resolve(depositsRes),
        withdrawals: resolve(withdrawalsRes),
        verifications: resolve(verificationsRes),
        disputes: resolveDisputes(disputesRes),
      });
    };

    fetchCounts();
  }, []);

  const cards = [
    {
      label: t('admin.depositRequests'),
      count: counts.deposits,
      icon: Wallet,
      iconColor: 'text-yellow-500',
      iconBg: 'bg-yellow-50',
      route: '/admin/deposits',
      urgentColor: 'text-yellow-600',
    },
    {
      label: t('admin.withdrawalRequests'),
      count: counts.withdrawals,
      icon: ArrowDownFromLine,
      iconColor: 'text-blue-500',
      iconBg: 'bg-blue-50',
      route: '/admin/withdrawals',
      urgentColor: 'text-blue-600',
    },
    {
      label: t('admin.verificationRequests'),
      count: counts.verifications,
      icon: ShieldCheck,
      iconColor: 'text-green-500',
      iconBg: 'bg-green-50',
      route: '/admin/verification',
      urgentColor: 'text-green-600',
    },
    {
      label: t('admin.disputes'),
      count: counts.disputes,
      icon: Gavel,
      iconColor: 'text-red-500',
      iconBg: 'bg-red-50',
      route: '/admin/disputes',
      urgentColor: 'text-red-600',
    },
  ];

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">{t('admin.dashboard')}</h1>
        <p className="text-sm text-gray-500 mt-1">{t('admin.dashboardSubtitle')}</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {cards.map((card) => {
          const Icon = card.icon;
          const isLoading = card.count === null;
          const hasError = card.count === '—';
          const countValue = typeof card.count === 'number' ? card.count : 0;
          const showBadge = !isLoading && !hasError && countValue > 0;

          return (
            <button
              key={card.route}
              onClick={() => navigate(card.route)}
              className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 text-left hover:shadow-md hover:border-gray-300 transition-all group"
            >
              <div className="flex items-start justify-between">
                <div className={`p-3 rounded-xl ${card.iconBg}`}>
                  <Icon className={`w-6 h-6 ${card.iconColor}`} />
                </div>
                {showBadge && (
                  <span className="text-xs font-semibold px-2 py-1 bg-red-50 text-red-600 rounded-full">
                    {t('admin.pendingBadge')}
                  </span>
                )}
              </div>
              <div className="mt-4">
                <div className={`text-3xl font-bold ${isLoading ? 'text-gray-300 animate-pulse' : countValue > 0 ? card.urgentColor : 'text-gray-900'}`}>
                  {isLoading ? '—' : card.count}
                </div>
                <div className="text-sm font-medium text-gray-600 mt-1">{card.label}</div>
                <div className="text-xs text-gray-400 mt-0.5">{t('admin.pendingReview')}</div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
