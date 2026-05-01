import { Outlet } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';

export default function AuthLayout() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4 font-sans">
      <div className="w-full max-w-md">
         <div className="flex justify-center mb-8 items-center gap-2">
            <svg width="40" height="40" viewBox="0 0 24 24" fill="#eab308" xmlns="http://www.w3.org/2000/svg">
              <polygon points="12 2 22 20 2 20" />
            </svg>
            <span className="font-bold text-3xl text-gray-900 tracking-tight">HORR</span>
         </div>
         <Outlet />
      </div>
      <Toaster position="bottom-right" />
    </div>
  );
}
