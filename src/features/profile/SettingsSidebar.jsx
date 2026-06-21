import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { User, ShieldCheck, CreditCard, Lock, ArrowUpRight } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';

const SettingsSidebar = () => {
  const location = useLocation();
  const { role } = useAuthStore();
  const normalizedRole = (role || '').toLowerCase();

  // Base items visible to all authenticated users
  const menuItems = [
    { label: 'Profile Details',       path: '/settings',              icon: <User size={18} /> },
    { label: 'Password & Security',   path: '/settings/password',     icon: <Lock size={18} /> },
    { label: 'Identity Verification', path: '/settings/verification', icon: <ShieldCheck size={18} /> },
  ];

  // Clients can deposit funds
  if (normalizedRole === 'client') {
    menuItems.push({
      label: 'Billing & Payments',
      path: '/settings/billing',
      icon: <CreditCard size={18} />,
    });
  }

  // Freelancers can request withdrawals
  if (normalizedRole === 'freelancer') {
    menuItems.push({
      label: 'Withdrawals',
      path: '/billing/withdrawals',
      icon: <ArrowUpRight size={18} />,
    });
  }

  return (
    <aside className="w-full md:w-64 space-y-1">
      {menuItems.map((item) => {
        const isActive = location.pathname === item.path;
        return (
          <Link
            key={item.path}
            to={item.path}
            className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
              isActive
                ? 'bg-gold text-white shadow-sm'
                : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
            }`}
          >
            {item.icon}
            {item.label}
          </Link>
        );
      })}
    </aside>
  );
};

export default SettingsSidebar;
