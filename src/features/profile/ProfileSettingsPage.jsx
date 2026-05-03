import React, { useState, useEffect } from 'react';
import { 
  Loader2,
  ChevronDown,
  Edit2
} from 'lucide-react';
import { profileApi } from '../../api/profile';
import { toast } from 'react-hot-toast';
import SettingsSidebar from './SettingsSidebar';
import { Card } from '../../components/ui/card';
import { Button } from '../../components/ui/button';

const ProfileSettingsPage = () => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editedFields, setEditedFields] = useState({});

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const response = await profileApi.getProfile();
      if (response.data && response.data.data) {
        setProfile(response.data.data);
      }
    } catch (error) {
      toast.error('Failed to load profile settings');
    } finally {
      setLoading(false);
    }
  };

  const handleFieldChange = (field, value) => {
    setProfile(prev => ({ ...prev, [field]: value }));
    setEditedFields(prev => ({ ...prev, [field]: value }));
  };

  const handleUpdate = async () => {
    if (Object.keys(editedFields).length === 0) return;

    try {
      await profileApi.updateProfile(editedFields);
      toast.success('Profile settings updated successfully');
      setEditedFields({});
    } catch (error) {
      toast.error('Failed to update profile settings');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-[#d4af37]" />
      </div>
    );
  }

  return (
    <div className="container max-w-[1100px] mx-auto pt-8 pb-16 px-4">
      <div className="flex flex-col md:flex-row gap-8">
        <SettingsSidebar />
        
        <main className="flex-1 space-y-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">Profile Settings</h1>

          {/* Visibility Section */}
          <Card className="p-8 border-gray-200 shadow-sm space-y-6">
            <h2 className="text-xl font-bold text-gray-800">My profile</h2>
            
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700">Visibility</label>
                <div className="relative">
                  <select 
                    className="w-full p-3 border border-gray-200 rounded-lg appearance-none cursor-pointer focus:ring-2 focus:ring-[#d4af37] outline-none transition-all"
                    value={profile?.visibility || 'Public'}
                    onChange={(e) => {
                      handleFieldChange('visibility', e.target.value);
                      handleUpdate();
                    }}
                  >
                    <option>Public</option>
                    <option>Private</option>
                    <option>Horr Users Only</option>
                  </select>
                  <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={18} />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700 flex items-center gap-1">
                  Project preference 
                  <span className="text-gray-400 text-xs italic font-normal">ⓘ</span>
                </label>
                <div className="relative">
                  <select 
                    className="w-full p-3 border border-gray-200 rounded-lg appearance-none cursor-pointer focus:ring-2 focus:ring-[#d4af37] outline-none transition-all"
                    value={profile?.projectPreference || 'Both short-term and long-term projects'}
                    onChange={(e) => {
                      handleFieldChange('projectPreference', e.target.value);
                      handleUpdate();
                    }}
                  >
                    <option>Both short-term and long-term projects</option>
                    <option>Short-term projects</option>
                    <option>Long-term projects</option>
                  </select>
                  <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={18} />
                </div>
              </div>
            </div>
          </Card>

          {/* Experience Level Section */}
          <Card className="p-8 border-gray-200 shadow-sm space-y-6">
            <h2 className="text-xl font-bold text-gray-800">Experience level</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[
                { id: 'Entry level', desc: 'I am relatively new to this field' },
                { id: 'Intermediate', desc: 'I have substantial experience in this field' },
                { id: 'Expert', desc: 'I have comprehensive and deep expertise in this field' }
              ].map((level) => (
                <div 
                  key={level.id}
                  onClick={() => {
                    handleFieldChange('experienceLevel', level.id);
                    handleUpdate();
                  }}
                  className={`p-6 border-2 rounded-xl cursor-pointer transition-all ${
                    profile?.experienceLevel === level.id 
                      ? 'border-[#d4af37] bg-yellow-50/50 shadow-sm' 
                      : 'border-gray-100 hover:border-gray-200'
                  }`}
                >
                  <div className="flex items-center gap-3 mb-2">
                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                       profile?.experienceLevel === level.id ? 'border-[#d4af37]' : 'border-gray-300'
                    }`}>
                      {profile?.experienceLevel === level.id && <div className="w-2.5 h-2.5 rounded-full bg-[#d4af37]" />}
                    </div>
                    <span className="font-bold text-gray-900">{level.id}</span>
                  </div>
                  <p className="text-xs text-gray-500 leading-relaxed">{level.desc}</p>
                </div>
              ))}
            </div>
          </Card>

          {/* Categories Section */}
          <Card className="p-8 border-gray-200 shadow-sm">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-gray-800">Categories</h2>
              <button className="text-[#d4af37] p-2 hover:bg-yellow-50 rounded-full transition-colors">
                <Edit2 size={18} />
              </button>
            </div>
            <div className="space-y-4">
              <span className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm font-semibold">
                Web, Mobile & Software Dev
              </span>
              <div className="pt-2">
                <span className="px-3 py-1.5 bg-gray-50 text-gray-600 rounded-md text-xs font-bold border border-gray-100">
                  Web Development
                </span>
              </div>
            </div>
          </Card>

          {/* Linked Accounts Section */}
          <Card className="p-8 border-gray-200 shadow-sm space-y-6">
            <h2 className="text-xl font-bold text-gray-800">Linked accounts</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Button 
                variant="outline" 
                className="justify-start h-auto py-4 px-6 border-blue-100 text-blue-600 hover:bg-blue-50 font-bold"
              >
                + LinkedIn
              </Button>
              <Button 
                variant="outline" 
                className="justify-start h-auto py-4 px-6 border-gray-100 text-gray-400 hover:bg-gray-50 font-bold opacity-70"
              >
                + GitHub
              </Button>
            </div>
          </Card>
        </main>
      </div>
    </div>
  );
};

export default ProfileSettingsPage;
