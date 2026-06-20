import { useState } from 'react';
import Modal from './Modal';
import { changePassword } from '../../../services/clientService';
import { toast } from 'sonner';

const SecuritySection = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [passwords, setPasswords] = useState({
    oldPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!passwords.oldPassword || !passwords.newPassword || !passwords.confirmPassword) {
      toast.error("Please fill in all fields");
      return;
    }

    if (passwords.newPassword.length < 4) {
      toast.error("New password must be at least 4 characters");
      return;
    }

    if (passwords.newPassword !== passwords.confirmPassword) {
      toast.error("New passwords don't match");
      return;
    }

    if (passwords.oldPassword === passwords.newPassword) {
      toast.error("New password must be different from the old one");
      return;
    }

    setLoading(true);
    try {
      await changePassword({
        oldPassword: passwords.oldPassword,
        newPassword: passwords.newPassword,
      });

      toast.success("Password changed successfully! Logging out...");
      setPasswords({ oldPassword: "", newPassword: "", confirmPassword: "" });

      setTimeout(() => {
        localStorage.removeItem("token");
        window.location.href = "/login";
      }, 2000);

    } catch (err) {
      const message =
        err.response?.data?.errors?.[0] ||
        err.response?.data?.message ||
        err.message ||
        "Something went wrong";
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div id="security" className="animate-in fade-in duration-500">
      <h1 className="text-3xl font-bold mb-8 text-gray-900">Password & Security</h1>

      <div className="bg-white rounded-3xl shadow-sm border border-black/5 p-6 md:p-8 mb-8 hover:shadow-lg transition-all duration-300">
        <h2 className="text-xl font-bold text-gray-900 mb-6">Login</h2>
        <div className="flex justify-between items-center py-6 border-t border-gray-50">
          <div>
            <div className="font-bold text-gray-900 text-sm mb-1">Password</div>
            <div className="text-gray-500 text-sm">You've set a password for your HORR account.</div>
          </div>
          <button
            className="text-amber-600 font-bold text-sm hover:underline flex items-center gap-1"
            onClick={() => setIsModalOpen(true)}
          >
            Change password <span className="text-lg">›</span>
          </button>
        </div>
      </div>

      <div className="bg-white rounded-3xl shadow-sm border border-black/5 p-6 md:p-8 mb-8 hover:shadow-lg transition-all duration-300">
        <h2 className="text-xl font-bold text-gray-900 mb-6">Two-step verification</h2>
        <div className="flex justify-between items-center py-6 border-t border-gray-50">
          <div>
            <div className="font-bold text-gray-900 text-sm mb-1">Authenticator app codes</div>
            <div className="text-gray-500 text-sm">Verify one-time codes generated from your authenticator app.</div>
          </div>
          <div className="flex items-center gap-4">
            <div className="w-8 h-8 rounded-full bg-amber-600 text-white flex items-center justify-center text-xs font-bold shadow-md">✓</div>
            <span className="text-gray-300 text-2xl">›</span>
          </div>
        </div>
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Change your password">
        <p className="text-gray-500 text-sm mb-8 leading-relaxed">
          You'll need to log in again on all devices after changing your password to ensure your account security.
        </p>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block font-semibold text-sm mb-2 text-gray-900 tracking-wide">Current password</label>
            <input
              type="password"
              className="w-full px-4 py-3 border border-slate-200 rounded-lg bg-gray-50 text-gray-900 text-sm focus:bg-white focus:border-amber-600 focus:ring-4 focus:ring-amber-100 focus:outline-none transition-all"
              required
              value={passwords.oldPassword}
              onChange={e => setPasswords({ ...passwords, oldPassword: e.target.value })}
            />
          </div>
          <div>
            <label className="block font-semibold text-sm mb-2 text-gray-900 tracking-wide">New password</label>
            <input
              type="password"
              className="w-full px-4 py-3 border border-slate-200 rounded-lg bg-gray-50 text-gray-900 text-sm focus:bg-white focus:border-amber-600 focus:ring-4 focus:ring-amber-100 focus:outline-none transition-all"
              required
              value={passwords.newPassword}
              onChange={e => setPasswords({ ...passwords, newPassword: e.target.value })}
            />
            <p className="text-[11px] text-gray-400 mt-2 font-medium">
              Must be at least 8 characters long, including 1 number or 1 symbol.
            </p>
          </div>
          <div>
            <label className="block font-semibold text-sm mb-2 text-gray-900 tracking-wide">Re-enter new password</label>
            <input
              type="password"
              className="w-full px-4 py-3 border border-slate-200 rounded-lg bg-gray-50 text-gray-900 text-sm focus:bg-white focus:border-amber-600 focus:ring-4 focus:ring-amber-100 focus:outline-none transition-all"
              required
              value={passwords.confirmPassword}
              onChange={e => setPasswords({ ...passwords, confirmPassword: e.target.value })}
            />
          </div>
          <div className="flex gap-4 pt-4">
            <button
              type="submit"
              className="flex-1 px-6 py-3 rounded-full font-bold text-sm bg-gradient-to-br from-amber-600 to-amber-700 text-white shadow-lg hover:shadow-xl hover:-translate-y-0.5 active:translate-y-0 transition-all disabled:opacity-50"
              disabled={loading}
            >
              {loading ? 'Processing...' : 'Confirm and log out'}
            </button>
            <button
              type="button"
              className="px-6 py-3 rounded-full font-bold text-sm bg-white border border-gray-300 text-gray-900 hover:bg-gray-50 hover:border-gray-400 transition-all"
              onClick={() => setIsModalOpen(false)}
              disabled={loading}
            >
              Cancel
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default SecuritySection;