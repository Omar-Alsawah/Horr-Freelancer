import { useTranslation } from 'react-i18next';
import { useAuthStore } from '../../app/store';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';

export default function Navbar() {
  const { t, i18n } = useTranslation();
  const { user, token, logout } = useAuthStore();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="border-b bg-card">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <div className="flex items-center gap-6">
          <Link to="/" className="text-xl font-bold text-navy">
            {t('nav.brand')}
          </Link>
          <Link to="/" className="text-sm font-medium text-textSecondary hover:text-textMain transition-colors">
            {t('nav.home')}
          </Link>
        </div>

        <div className="flex items-center gap-4">
          {token ? (
            <Button variant="outline" onClick={handleLogout}>
              {t('auth.logout')}
            </Button>
          ) : (
            <div className="flex items-center gap-2">
              <Button variant="ghost" asChild>
                <Link to="/login">{t('auth.login')}</Link>
              </Button>
              <Button asChild className="bg-gold hover:bg-yellow-500 text-white">
                <Link to="/register">{t('auth.register')}</Link>
              </Button>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}
