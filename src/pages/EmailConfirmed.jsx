import { useState, useEffect } from 'react';
import { useSearchParams, Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { CheckCircle, XCircle } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import api from '@/api/axios';

export default function EmailConfirmed() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');

  const [status, setStatus] = useState('loading'); // loading | success | error
  const [countdown, setCountdown] = useState(3);

  useEffect(() => {
    const verify = async () => {
      if (!token) {
        setStatus('error');
        return;
      }
      try {
        await api.post('/api/auth/verify-email', { token });
        setStatus('success');
      } catch {
        setStatus('error');
      }
    };
    verify();
  }, [token]);

  // Auto-redirect countdown on success
  useEffect(() => {
    if (status !== 'success') return;
    const interval = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          navigate('/login');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [status, navigate]);

  if (status === 'loading') {
    return (
      <Card className="w-full">
        <CardContent className="pt-8 pb-8 text-center">
          <div className="mx-auto w-12 h-12 rounded-full border-4 border-gray-200 border-t-[#eab308] animate-spin mb-5"></div>
          <p className="text-sm text-gray-500">{t('email_confirmed.verifying')}</p>
        </CardContent>
      </Card>
    );
  }

  if (status === 'error') {
    return (
      <Card className="w-full">
        <CardContent className="pt-8 pb-8 text-center">
          <div className="mx-auto w-16 h-16 rounded-full bg-red-50 flex items-center justify-center mb-5">
            <XCircle className="w-8 h-8 text-red-500" />
          </div>
          <h1 className="text-xl font-bold text-gray-900 mb-2">{t('email_confirmed.error_title')}</h1>
          <p className="text-sm text-gray-500 mb-6">{t('email_confirmed.error_subtitle')}</p>
          <Link to="/verify-email" className="text-sm font-medium text-[#eab308] hover:underline">
            {t('email_confirmed.try_again')}
          </Link>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full">
      <CardContent className="pt-8 pb-8 text-center">
        <div className="mx-auto w-16 h-16 rounded-full bg-green-50 flex items-center justify-center mb-5">
          <CheckCircle className="w-8 h-8 text-green-600" />
        </div>
        <h1 className="text-xl font-bold text-gray-900 mb-2">{t('email_confirmed.success_title')}</h1>
        <p className="text-sm text-gray-500 mb-4">{t('email_confirmed.success_subtitle')}</p>
        <p className="text-xs text-gray-400">
          {t('email_confirmed.redirect_msg', { seconds: countdown })}
        </p>
      </CardContent>
    </Card>
  );
}
