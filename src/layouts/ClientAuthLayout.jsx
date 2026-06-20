import { Outlet } from 'react-router-dom';

const AuthLayout = () => {
  return (
    <div className="auth-layout min-h-screen flex items-center justify-center bg-transparent py-10 px-4">
      <div className="w-full flex justify-center">
        <Outlet />
      </div>
    </div>
  );
};

export default AuthLayout;
