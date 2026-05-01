import { Outlet } from 'react-router-dom';

export default function MainLayout() {
  return (
    <div className="min-h-screen bg-background">
      {/* Main navigation can go here */}
      <Outlet />
    </div>
  );
}
