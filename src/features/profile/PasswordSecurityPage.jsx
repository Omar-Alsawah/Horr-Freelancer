import React, { useState } from 'react';
import { 
  Lock, 
  Eye, 
  EyeOff, 
  ShieldCheck, 
  Loader2,
  AlertCircle,
  AlertTriangle,
  Trash2
} from 'lucide-react';
import { authApi } from '../../api/auth';
import { toast } from 'react-hot-toast';
import SettingsSidebar from './SettingsSidebar';
import { Card } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';

const PasswordSecurityPage = () => {
  const [formData, setFormData] = useState({
    oldPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [showPasswords, setShowPasswords] = useState({
    old: false,
    new: false,
    confirm: false
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [showCloseConfirm, setShowCloseConfirm] = useState(false);

  const handleTogglePassword = (field) => {
    setShowPasswords(prev => ({ ...prev, [field]: !prev[field] }));
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    // Clear error for the field when typing
    if (errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };


  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Client-side validation
    setErrors({});
    const newErrors = {};
    
    if (formData.newPassword.length < 8) {
      newErrors.newPassword = 'New password must be at least 8 characters long';
    } else if (formData.newPassword !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setLoading(true);

    try {
      // Backend expects { oldPassword, newPassword }
      const payload = {
        oldPassword: formData.oldPassword,
        newPassword: formData.newPassword
      };
      await authApi.changePassword(payload);
      toast.success('Password changed successfully');
      
      // Clear all fields on success
      setFormData({
        oldPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
    } catch (error) {
      if (error.status === 401) {
        toast.error('Session expired. Please log in again.');
      } else if (error.status === 400) {
        // Map 400 errors to oldPassword as per requirements
        const errorMessage = error.data?.message || error.data?.title || (error.data?.errors && Object.values(error.data.errors)[0][0]) || 'Invalid current password';
        setErrors({ oldPassword: errorMessage });
      } else {
        toast.error(error.data?.title || 'An unexpected error occurred');
      }
    } finally {
      setLoading(false);
    }
  };

  const [closingAccount, setClosingAccount] = useState(false);

  const handleCloseAccount = async () => {
    setClosingAccount(true);
    try {
      await authApi.closeAccount();
      toast.success('Your account has been closed.');
      // Clear auth and redirect to login
      localStorage.removeItem('token');
      window.location.href = '/login';
    } catch (error) {
      if (error.status === 401) {
        toast.error('Session expired. Please log in again.');
      } else {
        toast.error(error.data?.message || 'Failed to close account. Please contact support.');
      }
      setClosingAccount(false);
    }
  };


  return (
    <div className="container max-w-[1100px] mx-auto pt-8 pb-16 px-4">
      <div className="flex flex-col md:flex-row gap-8">
        <SettingsSidebar />
        
        <main className="flex-1 space-y-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">Password & Security</h1>

          <Card className="p-8 border-gray-200 shadow-sm">
            <div className="mb-8">
              <h2 className="text-xl font-bold text-gray-800">Change Password</h2>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700">Current Password</label>
                <div className="relative">
                  <Input 
                    type={showPasswords.old ? "text" : "password"}
                    name="oldPassword"
                    value={formData.oldPassword}
                    onChange={handleInputChange}
                    className={`pr-12 ${errors.oldPassword ? 'border-red-500 focus:ring-red-500' : ''}`}
                  />
                  <button 
                    type="button"
                    onClick={() => handleTogglePassword('old')}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    {showPasswords.old ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
                {errors.oldPassword && (
                  <p className="text-xs text-red-500 flex items-center gap-1 mt-1">
                    <AlertCircle size={12} /> {errors.oldPassword}
                  </p>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-gray-700">New Password</label>
                  <div className="relative">
                    <Input 
                      type={showPasswords.new ? "text" : "password"}
                      name="newPassword"
                      value={formData.newPassword}
                      onChange={handleInputChange}
                      className={`pr-12 ${errors.newPassword ? 'border-red-500 focus:ring-red-500' : ''}`}
                    />
                    <button 
                      type="button"
                      onClick={() => handleTogglePassword('new')}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                    >
                      {showPasswords.new ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                  {errors.newPassword && (
                    <p className="text-xs text-red-500 flex items-center gap-1 mt-1">
                      <AlertCircle size={12} /> {errors.newPassword}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-semibold text-gray-700">Confirm New Password</label>
                  <div className="relative">
                    <Input 
                      type={showPasswords.confirm ? "text" : "password"}
                      name="confirmPassword"
                      value={formData.confirmPassword}
                      onChange={handleInputChange}
                      className={`pr-12 ${errors.confirmPassword ? 'border-red-500 focus:ring-red-500' : ''}`}
                    />
                    <button 
                      type="button"
                      onClick={() => handleTogglePassword('confirm')}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                    >
                      {showPasswords.confirm ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                  {errors.confirmPassword && (
                    <p className="text-xs text-red-500 flex items-center gap-1 mt-1">
                      <AlertCircle size={12} /> {errors.confirmPassword}
                    </p>
                  )}
                </div>
              </div>

              <div className="flex justify-end pt-4">
                <Button 
                  type="submit" 
                  disabled={loading}
                  className="bg-[#d4af37] hover:bg-[#b8962d] text-white px-8"
                >
                  {loading && <Loader2 size={18} className="animate-spin mr-2" />}
                  Update Password
                </Button>
              </div>
            </form>
          </Card>

          <Card className="p-8 border-gray-200 shadow-sm border-l-4 border-l-[#d4af37]">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-gray-800">Two-Step Verification</h2>
              <span className="px-3 py-1 bg-gray-100 text-gray-600 rounded-full text-xs font-bold uppercase tracking-wider">Status: Off</span>
            </div>
            <p className="text-gray-500 text-sm mb-6 max-w-2xl">
              Add an extra layer of security to your account. When you log in, we'll ask for a code from your phone or an authenticator app.
            </p>
            <Button variant="outline" className="border-gray-200 hover:bg-gray-50" disabled>
              Enable Two-Factor Authentication
            </Button>
          </Card>

          {/* Danger Zone — Close My Account */}
          <Card className="p-8 border-red-200 shadow-sm border-l-4 border-l-red-500 bg-red-50/30">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                <AlertTriangle size={20} className="text-red-600" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-red-700">Danger Zone</h2>
                <p className="text-xs text-red-500 font-medium">Irreversible actions</p>
              </div>
            </div>
            <p className="text-gray-600 text-sm mb-6 max-w-2xl">
              Once you close your account, all of your data — including your profile, proposals, contracts, and payment history — will be permanently deleted. This action cannot be undone.
            </p>

            {!showCloseConfirm ? (
              <Button 
                type="button"
                variant="outline"
                onClick={() => setShowCloseConfirm(true)}
                className="border-red-300 text-red-600 hover:bg-red-50 hover:text-red-700 hover:border-red-400 transition-colors"
              >
                <Trash2 size={16} className="mr-2" />
                Close My Account
              </Button>
            ) : (
              <div className="p-4 bg-red-50 border border-red-200 rounded-lg space-y-4">
                <p className="text-sm font-semibold text-red-700">
                  Are you sure you want to close your account? This action is permanent and cannot be reversed.
                </p>
                <div className="flex gap-3">
                  <Button
                    type="button"
                    onClick={handleCloseAccount}
                    className="bg-red-600 hover:bg-red-700 text-white"
                  >
                    Yes, Close My Account
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setShowCloseConfirm(false)}
                    className="border-gray-300 text-gray-600 hover:bg-gray-50"
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            )}
          </Card>
        </main>
      </div>
    </div>
  );
};

export default PasswordSecurityPage;

