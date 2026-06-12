import React, { useEffect } from 'react';
import { Outlet, NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuthStore } from '../store/authStore';
import { LayoutDashboard, Wallet, ArrowDownFromLine, ShieldCheck, LogOut } from 'lucide-react';
import { Toaster } from 'react-hot-toast';

export default function AdminLayout() {
  const { t, i18n } = useTranslation();
  const { logout } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    document.documentElement.dir = i18n.language === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.lang = i18n.language;
  }, [i18n.language]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navItems = [
    { name: t('admin.dashboard'), path: '/admin/dashboard', icon: LayoutDashboard },
    { name: t('admin.depositRequests'), path: '/admin/deposits', icon: Wallet },
    { name: t('admin.withdrawalRequests'), path: '/admin/withdrawals', icon: ArrowDownFromLine },
    { name: t('admin.verificationRequests'), path: '/admin/verification', icon: ShieldCheck },
  ];

  return (
    <div className={`min-h-screen bg-gray-50 flex ${i18n.language === 'ar' ? 'font-cairo' : 'font-sans'}`}>
      {/* Sidebar */}
      <aside 
        className={`w-64 bg-white border-gray-200 flex flex-col fixed inset-y-0 z-10 transition-transform ${
          i18n.language === 'ar' ? 'border-l right-0' : 'border-r left-0'
        }`}
      >
        {/* Logo */}
        <div className="h-16 flex items-center px-6 border-b border-gray-200">
          <div className="flex items-center gap-2 text-decoration-none">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="#eab308" xmlns="http://www.w3.org/2000/svg">
              <polygon points="12 2 22 20 2 20" />
            </svg>
            <span className="font-bold text-2xl text-gray-900 tracking-tight">HORR</span>
          </div>
        </div>

        {/* Nav Items */}
        <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
          {navItems.map((item) => {
            const isActive = location.pathname.startsWith(item.path);
            return (
              <NavLink
                key={item.path}
                to={item.path}
                className={`relative flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-yellow-50 text-yellow-700'
                    : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                }`}
              >
                <div 
                  className={`w-1.5 h-6 absolute transition-all ${
                    i18n.language === 'ar' ? 'right-0 rounded-l-full' : 'left-0 rounded-r-full'
                  } ${isActive ? 'bg-[#eab308]' : 'bg-transparent'}`}
                ></div>
                <item.icon className={`w-5 h-5 ${isActive ? 'text-[#eab308]' : 'text-gray-400'}`} />
                {item.name}
              </NavLink>
            );
          })}
        </nav>

        {/* Logout Button */}
        <div className="p-4 border-t border-gray-200">
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 w-full px-3 py-2.5 rounded-md text-sm font-medium text-red-600 hover:bg-red-50 transition-colors"
          >
            <LogOut className="w-5 h-5 text-red-500" />
            {t('admin.logout')}
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className={`flex-1 flex flex-col min-h-screen ${i18n.language === 'ar' ? 'pr-64' : 'pl-64'}`}>
        <div className="p-8 flex-1">
          <Outlet />
        </div>
      </main>

      <Toaster position="bottom-right" />
    </div>
  );
}
