import { useState } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Mail, RefreshCw } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import api from '@/api/axios';
import toast from 'react-hot-toast';
import { ENDPOINTS } from '@/services/endpoints';

export default function VerifyEmail() {
  const { t } = useTranslation();
  const location = useLocation();
  const email = location.state?.email || '';
  const [resending, setResending] = useState(false);

  const handleResend = async () => {
    if (!email) {
      toast.error(t('verify_email.no_email_error'));
      return;
    }
    setResending(true);
    try {
      // Backend: POST /Auth/resend-confirmation-email?email=...
      await api.post(`${ENDPOINTS.AUTH.RESEND_CONFIRMATION_EMAIL}?email=${encodeURIComponent(email)}`);
      toast.success(t('verify_email.resend_success'));
    } catch (err) {
      toast.error(err.title || t('common.error'));
    } finally {
      setResending(false);
    }
  };

  return (
    <Card className="w-full">
      <CardContent className="pt-8 pb-8 text-center">
        <div className="mx-auto w-16 h-16 rounded-full bg-[#eab308]/10 flex items-center justify-center mb-5">
          <Mail className="w-8 h-8 text-[#eab308]" />
        </div>

        <h1 className="text-xl font-bold text-gray-900 mb-2">{t('verify_email.title')}</h1>
        <p className="text-sm text-gray-500 mb-1">{t('verify_email.subtitle')}</p>

        {email && (
          <p className="text-sm font-medium text-gray-800 mb-6">{email}</p>
        )}

        <p className="text-sm text-gray-500 mb-6 leading-relaxed max-w-sm mx-auto">
          {t('verify_email.instructions')}
        </p>

        <Button
          onClick={handleResend}
          disabled={resending}
          variant="outline"
          className="w-full mb-4 gap-2"
        >
          <RefreshCw className={`w-4 h-4 ${resending ? 'animate-spin' : ''}`} />
          {resending ? t('common.loading') : t('verify_email.resend_btn')}
        </Button>

        <Link to="/login" className="text-sm text-[#1e293b] hover:underline">
          {t('verify_email.back_to_login')}
        </Link>
      </CardContent>
    </Card>
  );
}
