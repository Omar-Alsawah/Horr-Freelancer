import { useState } from 'react';
import { updateName, updateEmail, getUserProfile } from '../../../services/clientService';
import useAuth from '../../auth/hooks/useAuth';
import useFetch from '../../../hooks/useFetch';
import { toast } from 'sonner';

const MyInfoSection = () => {
  // 1. Get basic info from Auth (FirstName, LastName)
  const { user: authUser, refreshUser } = useAuth();
  
  // 2. Get extended info from UserProfile (Email, Location, etc.)
  const { data: rawExtraProfile, loading: extraLoading } = useFetch(getUserProfile);

  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: ''
  });
  const [saving, setSaving] = useState(false);

  // Extract real profile data from wrapper if it exists
  const extraProfile = rawExtraProfile?.data || rawExtraProfile || {};

  // Merge the data from both sources
  const profile = {
    ...authUser,
    ...extraProfile
  };

  const displayFirstName = profile.firstName || '';
  const displayLastName = profile.lastName || '';
  const displayEmail = profile.email || 'Not Provided';
  const displayUserName = profile.fullName || `${displayFirstName} ${displayLastName}`.trim() || 'N/A';

  const handleSave = async () => {
    setSaving(true);
    try {
      const fullName = `${formData.firstName} ${formData.lastName}`;
      await updateName(fullName);
      
      if (formData.email && formData.email !== displayEmail) {
        await updateEmail(formData.email);
      }
      
      await refreshUser();
      toast.success('Profile updated successfully!');
      setIsEditing(false);
    } catch (err) {
      toast.error('Failed to update profile: ' + (err.response?.data || err.message));
    } finally {
      setSaving(false);
    }
  };

  const loading = !authUser && extraLoading;

  if (loading) return <div className="bg-white rounded-3xl p-8 shadow-sm">Loading profile details...</div>;

  return (
    <div id="my-info" className="animate-in fade-in duration-500">
      <h1 className="text-3xl font-bold mb-8 text-gray-900">My Info</h1>

      <div className="bg-white rounded-3xl shadow-sm border border-black/5 p-6 md:p-8 mb-8 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300">
        <div className="flex justify-between items-center mb-8 pb-6 border-b border-gray-100">
          <div className="flex items-center">
            <div className="w-20 h-20 rounded-full overflow-hidden mr-6 flex-shrink-0 border-2 border-gray-100">
              <img 
                src={profile.avatarUrl || `https://ui-avatars.com/api/?name=${displayFirstName}+${displayLastName}&background=0D1821&color=fff`} 
                alt="User Avatar" 
                className="w-full h-full object-cover"
              />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">{displayFirstName} {displayLastName}</h2>
              <p className="text-gray-500 font-medium">Individual Account</p>
            </div>
          </div>
          <button 
            className="w-10 h-10 rounded-full border border-gray-200 bg-white text-amber-600 flex items-center justify-center cursor-pointer hover:bg-amber-50 hover:border-amber-600 transition-all shadow-sm"
            onClick={() => {
              if (!isEditing) {
                setFormData({
                  firstName: displayFirstName,
                  lastName: displayLastName,
                  email: displayEmail === 'Not Provided' ? '' : displayEmail
                });
              }
              setIsEditing(!isEditing);
            }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
            </svg>
          </button>
        </div>

        {!isEditing ? (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-[1fr_2fr] gap-4 items-center">
              <div className="text-gray-500 text-sm font-medium">Account type</div>
              <div className="font-semibold text-gray-900">Individual</div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-[1fr_2fr] gap-4 items-center">
              <div className="text-gray-500 text-sm font-medium">Username</div>
              <div className="font-semibold text-gray-900">{displayUserName}</div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-[1fr_2fr] gap-4 items-center">
              <div className="text-gray-500 text-sm font-medium">Email</div>
              <div className="font-semibold text-gray-900">{displayEmail}</div>
            </div>

            <div className="mt-8 pt-8 border-t border-gray-100">
              <h3 className="text-lg font-bold text-gray-900 mb-6">Personal info</h3>
              <div className="grid grid-cols-1 md:grid-cols-[1fr_2fr] gap-4 items-center mb-4">
                <div className="text-gray-500 text-sm font-medium">Time Zone</div>
                <div className="font-semibold text-gray-900">{profile.timeZone || 'UTC+02:00 Cairo'}</div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-[1fr_2fr] gap-4 items-center">
                <div className="text-gray-500 text-sm font-medium">Country</div>
                <div className="font-semibold text-gray-900 flex items-center gap-2">
                   {profile.country || 'Egypt'}
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="animate-in slide-in-from-top-2 duration-300">
            <div className="mb-8">
              <p className="text-sm text-gray-500 mb-6 bg-amber-50 p-4 rounded-xl border border-amber-100">
                Please read our <a href="#" className="text-amber-600 font-bold hover:underline">policy on name changes</a> to understand how it affects your verified status.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div>
                  <label className="block font-semibold text-sm mb-2 text-gray-900 tracking-wide">First Name</label>
                  <input 
                    type="text" 
                    className="w-full px-4 py-3 border border-slate-200 rounded-lg bg-gray-50 text-gray-900 text-sm focus:bg-white focus:border-amber-600 focus:ring-4 focus:ring-amber-100 focus:outline-none transition-all" 
                    value={formData.firstName} 
                    onChange={(e) => setFormData({...formData, firstName: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block font-semibold text-sm mb-2 text-gray-900 tracking-wide">Last Name</label>
                  <input 
                    type="text" 
                    className="w-full px-4 py-3 border border-slate-200 rounded-lg bg-gray-50 text-gray-900 text-sm focus:bg-white focus:border-amber-600 focus:ring-4 focus:ring-amber-100 focus:outline-none transition-all" 
                    value={formData.lastName} 
                    onChange={(e) => setFormData({...formData, lastName: e.target.value})}
                  />
                </div>
              </div>

              <div className="mb-8">
                <label className="block font-semibold text-sm mb-2 text-gray-900 tracking-wide">Email</label>
                <input 
                  type="email" 
                  className="w-full px-4 py-3 border border-slate-200 rounded-lg bg-gray-50 text-gray-900 text-sm focus:bg-white focus:border-amber-600 focus:ring-4 focus:ring-amber-100 focus:outline-none transition-all" 
                  value={formData.email} 
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                />
              </div>

              <div className="flex gap-4 pt-4">
                <button 
                  className="px-8 py-2.5 rounded-full font-bold text-sm bg-gradient-to-br from-amber-600 to-amber-700 text-white shadow-lg hover:shadow-xl hover:-translate-y-0.5 active:translate-y-0 transition-all disabled:opacity-50" 
                  onClick={handleSave} 
                  disabled={saving}
                >
                  {saving ? 'Saving...' : 'Save Changes'}
                </button>
                <button 
                  className="px-8 py-2.5 rounded-full font-bold text-sm bg-white border border-gray-300 text-gray-900 hover:bg-gray-50 hover:border-gray-400 transition-all" 
                  onClick={() => setIsEditing(false)} 
                  disabled={saving}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MyInfoSection;
