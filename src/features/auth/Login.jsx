import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuthStore } from '@/store/authStore';
import api from '@/api/axios';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import toast from 'react-hot-toast';

function parseJwt(token) {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    return JSON.parse(decodeURIComponent(atob(base64).split('').map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2)).join('')));
  } catch (e) { return {}; }
}

// Detect "email not confirmed" errors from backend
function isEmailNotConfirmedError(err) {
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

  const handleErrorKey = (field) => {
    const key = Object.keys(fieldErrors).find(k => k.toLowerCase() === field.toLowerCase());
    return key ? fieldErrors[key] : null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setFieldErrors({});
    try {
      // Backend returns the JWT token string directly: Ok(result.Data.Token)
      const res = await api.post('/api/auth/login', { email, password });
      const token = res.data;
      const payload = parseJwt(token);
      
      // Map JWT claims to user object (handling both standard and long-form keys)
      const userObj = {
        userId: payload.userId || payload['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier'],
        email: payload.email || payload['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress'],
        role: payload.role || payload['http://schemas.microsoft.com/w2008/06/identity/claims/role'],
        name: payload.name || payload['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name']
      };

      loginAction(token, userObj);
      navigate('/');
    } catch (err) {
      // If the backend rejects because email is not confirmed, redirect to verify page
      if (isEmailNotConfirmedError(err)) {
        toast(t('auth.email_not_verified'), { icon: '📧' });
        navigate('/verify-email', { state: { email } });
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
