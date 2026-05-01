import { useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Toaster } from 'react-hot-toast';
import { Button } from '@/components/ui/button';
import Navbar from './Navbar';

export default function RootLayout() {
  const { i18n } = useTranslation();

  useEffect(() => {
    document.dir = i18n.language === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.lang = i18n.language;
  }, [i18n.language]);

  const toggleLang = () => {
    i18n.changeLanguage(i18n.language === 'en' ? 'ar' : 'en');
  };

  return (
    <div className="min-h-screen bg-background font-sans antialiased text-foreground flex flex-col">
      <Navbar />
      <div className="flex justify-end p-2 bg-muted/30">
        <Button variant="ghost" size="sm" onClick={toggleLang}>
          {i18n.language === 'en' ? 'العربية (AR)' : 'English (EN)'}
        </Button>
      </div>
      <main className="flex-1">
        <Outlet />
      </main>
      <Toaster position="bottom-right" />
    </div>
  );
}
