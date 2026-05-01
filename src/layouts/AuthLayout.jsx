import { Outlet } from 'react-router-dom';

export default function AuthLayout() {
  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center">
      {/* Auth-specific wrappers can go here */}
      <Outlet />
    </div>
  );
}
