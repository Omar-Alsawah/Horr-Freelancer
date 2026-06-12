import { Outlet } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import Navbar from '../components/Navbar';
import { useTranslation } from 'react-i18next';
import { useEffect } from 'react';

export default function MainLayout() {
  const { i18n } = useTranslation();

  useEffect(() => {
    document.documentElement.dir = i18n.language === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.lang = i18n.language;
  }, [i18n.language]);

  return (
    <div className={`min-h-screen bg-transparent antialiased text-foreground flex flex-col ${i18n.language === 'ar' ? 'font-cairo' : 'font-sans'}`}>
      <Navbar />
      <main className="flex-1 bg-transparent">
        <Outlet />
      </main>
      <Toaster position="bottom-right" />
    </div>
  );
}
