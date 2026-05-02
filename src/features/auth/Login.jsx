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
      const res = await api.post('/api/auth/login', { email, password });
      const payload = parseJwt(res.data.token);
      loginAction(res.data.token, { userId: payload.userId, email: payload.email, role: payload.role, name: payload.name });
      navigate('/jobs');
    } catch (err) {
      toast.error(err.title || t('common.error'));
      if (err.errors) {
        setFieldErrors(err.errors);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-16 flex items-center justify-center">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl text-center text-navy">{t('auth.login')}</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-textMain">{t('auth.email')}</label>
              <Input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                className={handleErrorKey('email') ? 'border-red-500' : ''}
              />
              {handleErrorKey('email') && <div className="text-red-500 text-xs">{handleErrorKey('email')[0]}</div>}
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-textMain">{t('auth.password')}</label>
              <Input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                className={handleErrorKey('password') ? 'border-red-500' : ''}
              />
              {handleErrorKey('password') && <div className="text-red-500 text-xs">{handleErrorKey('password')[0]}</div>}
            </div>
            <Button type="submit" className="w-full bg-gold hover:bg-yellow-500 text-white" disabled={loading}>
              {loading ? t('common.loading') : t('auth.submit_login')}
            </Button>
            <div className="mt-4 text-center text-sm">
              <Link to="/register" className="text-navy hover:underline">{t('auth.go_to_register')}</Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
