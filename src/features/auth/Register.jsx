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

export default function Register() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const loginAction = useAuthStore(state => state.login);

  const [form, setForm] = useState({
    fullName: '',
    email: '',
    password: '',
    role: 'Freelancer',
    phoneNumber: '',
    bio: '',
    address: '',
    city: '',
    country: '',
    stateProvince: '',
    timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone || '',
    zipCode: '',
  });

  const [loading, setLoading] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});

  const update = (key) => (e) => setForm(prev => ({ ...prev, [key]: e.target.value }));

  const errorFor = (field) => {
    const key = Object.keys(fieldErrors).find(k => k.toLowerCase() === field.toLowerCase());
    return key ? fieldErrors[key] : null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setFieldErrors({});
    try {
      const res = await api.post('/api/auth/register', form);
      navigate('/verify-email', { state: { email: form.email } });
    } catch (err) {
      toast.error(err.title || t('common.error'));
      if (err.errors) setFieldErrors(err.errors);
    } finally {
      setLoading(false);
    }
  };

  const inputCls = (field) => `${errorFor(field) ? 'border-red-500' : ''}`;

  const FieldError = ({ field }) => {
    const err = errorFor(field);
    return err ? <div className="text-red-500 text-xs mt-0.5">{Array.isArray(err) ? err[0] : err}</div> : null;
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-2xl text-center text-[#1e293b]">{t('auth.register')}</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">

          {/* Role Segmented Control */}
          <div className="flex bg-gray-100 p-1 rounded-lg w-full">
            {['Freelancer', 'Client'].map((r) => (
              <button
                key={r}
                type="button"
                onClick={() => setForm(prev => ({ ...prev, role: r }))}
                className={`flex-1 py-2.5 text-sm font-medium rounded-md transition-colors ${
                  form.role === r
                    ? 'bg-white shadow-sm text-gray-900'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                {t(`auth.role_${r.toLowerCase()}`)}
              </button>
            ))}
          </div>

          {/* Primary Fields — 2 columns */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">{t('auth.name')}</label>
              <Input value={form.fullName} onChange={update('fullName')} className={inputCls('fullName')} required />
              <FieldError field="fullName" />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">{t('auth.email')}</label>
              <Input type="email" value={form.email} onChange={update('email')} className={inputCls('email')} required />
              <FieldError field="email" />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">{t('auth.password')}</label>
              <Input type="password" value={form.password} onChange={update('password')} className={inputCls('password')} required />
              <FieldError field="password" />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">{t('auth.phone')}</label>
              <Input type="tel" value={form.phoneNumber} onChange={update('phoneNumber')} className={inputCls('phoneNumber')} />
              <FieldError field="phoneNumber" />
            </div>
          </div>

          {/* Bio */}
          <div>
            <label className="text-sm font-medium text-gray-700 mb-1 block">{t('auth.bio')}</label>
            <textarea
              value={form.bio}
              onChange={update('bio')}
              rows={3}
              className={`w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#eab308] focus:border-transparent resize-none ${errorFor('bio') ? 'border-red-500' : ''}`}
            />
            <FieldError field="bio" />
          </div>

          {/* Location Fields — 2 columns */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">{t('auth.address')}</label>
              <Input value={form.address} onChange={update('address')} className={inputCls('address')} />
              <FieldError field="address" />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">{t('auth.city')}</label>
              <Input value={form.city} onChange={update('city')} className={inputCls('city')} />
              <FieldError field="city" />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">{t('auth.state_province')}</label>
              <Input value={form.stateProvince} onChange={update('stateProvince')} className={inputCls('stateProvince')} />
              <FieldError field="stateProvince" />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">{t('auth.country')}</label>
              <Input value={form.country} onChange={update('country')} className={inputCls('country')} />
              <FieldError field="country" />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">{t('auth.zip_code')}</label>
              <Input value={form.zipCode} onChange={update('zipCode')} className={inputCls('zipCode')} />
              <FieldError field="zipCode" />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">{t('auth.timezone')}</label>
              <Input value={form.timeZone} onChange={update('timeZone')} className={inputCls('timeZone')} />
              <FieldError field="timeZone" />
            </div>
          </div>

          <Button type="submit" className="w-full bg-[#eab308] hover:bg-yellow-500 text-white" disabled={loading}>
            {loading ? t('common.loading') : t('auth.submit_register')}
          </Button>

          <div className="text-center text-sm">
            <Link to="/login" className="text-[#1e293b] hover:underline">{t('auth.go_to_login')}</Link>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
