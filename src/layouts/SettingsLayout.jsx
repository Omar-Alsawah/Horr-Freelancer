import React from 'react';
import SettingsSidebar from '../features/profile/SettingsSidebar';

const SettingsLayout = ({ title, children }) => {
  return (
    <div className="container max-w-[1100px] mx-auto pt-8 pb-16 px-4">
      <div className="flex flex-col md:flex-row gap-8">
        <SettingsSidebar />
        
        <main className="flex-1 space-y-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">{title}</h1>
          {children}
        </main>
      </div>
    </div>
  );
};

export default SettingsLayout;
