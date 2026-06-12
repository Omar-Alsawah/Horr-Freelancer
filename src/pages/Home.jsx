import { useTranslation } from 'react-i18next';
import { useAuthStore } from '../app/store';

export default function Home() {
  const { t } = useTranslation();
  const { user, token } = useAuthStore();

  return (
    <div className="space-y-4 py-8">
      <h1 className="text-3xl font-bold text-navy">{t('home.welcome')}</h1>
      <p className="text-textSecondary text-lg">{t('home.subtitle')}</p>

      {token && (
        <div className="mt-8 p-4 bg-card rounded-xl border shadow-sm max-w-sm">
          <p className="text-textMain font-medium">{t('home.logged_in_as')}</p>
        </div>
      )}
    </div>
  );
}
