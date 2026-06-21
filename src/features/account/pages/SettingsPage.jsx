import { useState } from 'react';
import { useLocation } from 'react-router-dom';
import SettingsSidebar from '../components/SettingsSidebar';
import MyInfoSection from '../components/MyInfoSection';
import BillingSection from '../components/BillingSection';
import SecuritySection from '../components/SecuritySection';

const SettingsPage = () => {
  const location = useLocation();
  const [activeTab, setActiveTab] = useState(location.state?.tab || 'my-info');

  const renderContent = () => {
    switch (activeTab) {
      case 'my-info':
        return <MyInfoSection />;
      case 'billing':
        return <BillingSection />;
      case 'security':
        return <SecuritySection />;
      case 'notifications':
        return (
          <div className="w-full max-w-4xl">
            <h1 className="text-2xl font-semibold mb-6 text-gray-900">Notifications</h1>
            <div className="bg-white rounded-3xl shadow-sm border border-black/5 p-6 md:p-8 mb-8">
              <p className="text-gray-500 text-sm">Notification settings coming soon.</p>
            </div>
          </div>
        );
      default:
        return <MyInfoSection />;
    }
  };

  return (
    <div className="max-w-[1100px] mx-auto px-8 py-10">
      <div className="md:grid md:grid-cols-[240px_1fr] md:gap-12 md:items-start">
        <SettingsSidebar activeTab={activeTab} onTabChange={setActiveTab} />
        <main className="w-full max-w-4xl">
          {renderContent()}
        </main>
      </div>
    </div>
  );
};

export default SettingsPage;
