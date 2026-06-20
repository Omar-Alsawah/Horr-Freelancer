import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuthStore } from '@/store/authStore';
import api from '@/api/axios';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { AlertCircle, RefreshCw } from 'lucide-react';
import toast from 'react-hot-toast';



// Detect "email not confirmed" errors from backend
function isEmailNotConfirmedError(err) {
  if (err.errorCode === 'EMAIL_NOT_CONFIRMED') return true;
  const msg = ((err.message || '') + (err.title || '')).toLowerCase();
  const errorsStr = JSON.stringify(err.errors || '').toLowerCase();
  return (
    msg.includes('confirm') ||
    msg.includes('not confirmed') ||
    msg.includes('not allowed') ||
    errorsStr.includes('confirm') ||
    errorsStr.includes('not allowed') ||
    errorsStr.includes('not confirmed')
  );
}

export default function Login() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const loginAction = useAuthStore(state => state.login);
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});
  const [unverifiedEmail, setUnverifiedEmail] = useState('');
  const [resending, setResending] = useState(false);

  const handleErrorKey = (field) => {
    const key = Object.keys(fieldErrors).find(k => k.toLowerCase() === field.toLowerCase());
    return key ? fieldErrors[key] : null;
  };

  const handleResend = async () => {
    if (!unverifiedEmail) return;
    setResending(true);
    try {
      await api.post(`/api/auth/resend-confirmation-email?email=${encodeURIComponent(unverifiedEmail)}`);
      toast.success(t('verify_email.resend_success') || 'Verification email resent!');
    } catch (err) {
      toast.error(err.title || t('common.error'));
    } finally {
      setResending(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setFieldErrors({});
    setUnverifiedEmail('');
    try {
      const res = await api.post('/api/auth/login', { email, password });
      const token = res.data;

      loginAction(token);
      
      const rawRole = useAuthStore.getState().role;
      const userRoles = Array.isArray(rawRole) ? rawRole : [rawRole];
      
      const isRole = (r) => userRoles.some(ur => ur && ur.toLowerCase() === r.toLowerCase());

      if (isRole('Admin')) {
        navigate('/admin/dashboard', { replace: true });
      } else if (isRole('Specialist')) {
        navigate('/specialist/queue', { replace: true });
      } else if (isRole('Client')) {
        navigate('/client/dashboard', { replace: true });
      } else {
        navigate('/', { replace: true });
      }
    } catch (err) {
      if (isEmailNotConfirmedError(err)) {
        setUnverifiedEmail(email);
        return;
      }
      toast.error(err.title || t('common.error'));
      if (err.errors) {
        setFieldErrors(err.errors);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-2xl text-center text-[#1e293b]">{t('auth.login')}</CardTitle>
      </CardHeader>
      <CardContent>
        {unverifiedEmail && (
          <div className="bg-amber-50 border border-amber-200 p-4 rounded-md mb-6">
            <div className="flex gap-3">
              <AlertCircle className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <h3 className="text-sm font-medium text-amber-800">
                  {t('auth.email_not_verified') || "Your email address has not been verified yet. Please check your inbox."}
                </h3>
                <div className="mt-2 text-sm text-amber-700">
                  <Button 
                    variant="link" 
                    className="p-0 h-auto text-amber-700 hover:text-amber-900 font-semibold inline-flex items-center gap-1.5"
                    onClick={handleResend}
                    disabled={resending}
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${resending ? 'animate-spin' : ''}`} />
                    {resending ? t('common.loading') : (t('verify_email.resend_btn') || "Didn't receive it? Resend Email.")}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">{t('auth.email')}</label>
            <Input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              className={handleErrorKey('email') ? 'border-red-500' : ''}
              required
            />
            {handleErrorKey('email') && <div className="text-red-500 text-xs">{handleErrorKey('email')[0]}</div>}
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">{t('auth.password')}</label>
            <Input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              className={handleErrorKey('password') ? 'border-red-500' : ''}
              required
            />
            {handleErrorKey('password') && <div className="text-red-500 text-xs">{handleErrorKey('password')[0]}</div>}
          </div>
          <Button type="submit" className="w-full bg-[#eab308] hover:bg-yellow-500 text-white" disabled={loading}>
            {loading ? t('common.loading') : t('auth.submit_login')}
          </Button>
          <div className="mt-4 text-center text-sm">
            <Link to="/register" className="text-[#1e293b] hover:underline">{t('auth.go_to_register')}</Link>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
