import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  User, 
  Settings as SettingsIcon, 
  ShieldCheck, 
  CreditCard, 
  MapPin,
  Lock
} from 'lucide-react';

const SettingsSidebar = () => {
  const location = useLocation();

  const menuItems = [
    { 
      label: 'Contact info', 
      path: '/settings', 
      icon: <User size={18} /> 
    },
    { 
      label: 'Profile Settings', 
      path: '/settings/profile', 
      icon: <SettingsIcon size={18} /> 
    },
    { 
      label: 'Password & Security', 
      path: '/settings/password', 
      icon: <Lock size={18} /> 
    },
    { 
      label: 'Identity Verification', 
      path: '/settings/verification', 
      icon: <ShieldCheck size={18} /> 
    },
    { 
      label: 'Get Paid', 
      path: '/settings/billing', 
      icon: <CreditCard size={18} /> 
    }
  ];

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
                ? 'bg-[#d4af37] text-white shadow-sm' 
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
