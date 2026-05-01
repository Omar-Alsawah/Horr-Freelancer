import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuthStore } from '../../app/store';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import api from '../../api/axios';
import toast from 'react-hot-toast';

export default function Login() {
  const { t } = useTranslation();
  const loginAction = useAuthStore(state => state.login);
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      // Mock API call to satisfy requirements before hitting a real backend
      // Replace with real api.post('/api/auth/login') when backend is ready
      await new Promise(resolve => setTimeout(resolve, 800));
      loginAction('mock-jwt-token-123', { email });
      navigate('/');
    } catch (error) {
      // Errors map via global axios interceptor
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
                required 
                value={email}
                onChange={e => setEmail(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-textMain">{t('auth.password')}</label>
              <Input 
                type="password" 
                required 
                value={password}
                onChange={e => setPassword(e.target.value)}
              />
            </div>
            <Button type="submit" className="w-full bg-gold hover:bg-yellow-500 text-white" disabled={loading}>
              {loading ? t('common.loading') : t('auth.submit_login')}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
