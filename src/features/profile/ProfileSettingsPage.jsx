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

const VisibilityEnum = {
  'Public': 0,
  'Private': 1,
  'Horr Users Only': 2,
  0: 'Public',
  1: 'Private',
  2: 'Horr Users Only'
};

const ExperienceLevelEnum = {
  'Entry level': 0,
  'Intermediate': 1,
  'Expert': 2,
  0: 'Entry level',
  1: 'Intermediate',
  2: 'Expert'
};

const ProfileSettingsPage = () => {
  const [profile, setProfile] = useState({
    visibility: 'Public',
    experienceLevel: 'Entry level'
  });
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const response = await profileApi.getProfile();
      const data = response.data.data || response.data;
      if (data) {
        setProfile({
          visibility: VisibilityEnum[data.visibility] || 'Public',
          experienceLevel: ExperienceLevelEnum[data.experienceLevel] || 'Entry level'
        });
      }
    } catch (error) {
      toast.error('Failed to load profile settings');
    } finally {
      setLoading(false);
    }
  };

  const handleFieldChange = (field, value) => {
    setProfile(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    setIsSaving(true);
    setErrors({});

    try {
      const payload = {
        visibility: VisibilityEnum[profile.visibility],
        experienceLevel: ExperienceLevelEnum[profile.experienceLevel]
      };
      await profileApi.updatePrivacy(payload);
      toast.success('Profile settings updated successfully');
    } catch (error) {
      if (error.status === 400 && error.errors) {
        const fieldErrors = {};
        Object.keys(error.errors).forEach(key => {
          const camelKey = key.charAt(0).toLowerCase() + key.slice(1);
          fieldErrors[camelKey] = error.errors[key][0];
        });
        setErrors(fieldErrors);
      } else {
        toast.error(error.title || 'Failed to update profile settings');
      }
    } finally {
      setIsSaving(false);
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
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Profile Settings</h1>
            <Button 
              onClick={handleSubmit} 
              disabled={isSaving}
              className="bg-[#d4af37] hover:bg-[#b8962d] text-white px-8"
            >
              {isSaving ? <Loader2 size={18} className="animate-spin mr-2" /> : null}
              Save Changes
            </Button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Visibility Section */}
            <Card className="p-8 border-gray-200 shadow-sm space-y-6">
              <h2 className="text-xl font-bold text-gray-800">My profile</h2>
              
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-gray-700">Visibility</label>
                  <div className="relative">
                    <select 
                      className={`w-full p-3 border rounded-lg appearance-none cursor-pointer focus:ring-2 focus:ring-[#d4af37] outline-none transition-all ${
                        errors.visibility ? 'border-red-500' : 'border-gray-200'
                      }`}
                      value={profile.visibility}
                      onChange={(e) => handleFieldChange('visibility', e.target.value)}
                    >
                      <option>Public</option>
                      <option>Private</option>
                      <option>Horr Users Only</option>
                    </select>
                    <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={18} />
                  </div>
                  {errors.visibility && <p className="text-red-500 text-xs mt-1">{errors.visibility}</p>}
                </div>
              </div>
            </Card>

            {/* Experience Level Section */}
            <Card className="p-8 border-gray-200 shadow-sm space-y-6">
              <h2 className="text-xl font-bold text-gray-800">Experience level</h2>
              {errors.experienceLevel && <p className="text-red-500 text-sm">{errors.experienceLevel}</p>}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[
                  { id: 'Entry level', desc: 'I am relatively new to this field' },
                  { id: 'Intermediate', desc: 'I have substantial experience in this field' },
                  { id: 'Expert', desc: 'I have comprehensive and deep expertise in this field' }
                ].map((level) => (
                  <div 
                    key={level.id}
                    onClick={() => handleFieldChange('experienceLevel', level.id)}
                    className={`p-6 border-2 rounded-xl cursor-pointer transition-all ${
                      profile.experienceLevel === level.id 
                        ? 'border-[#d4af37] bg-yellow-50/50 shadow-sm' 
                        : 'border-gray-100 hover:border-gray-200'
                    }`}
                  >
                    <div className="flex items-center gap-3 mb-2">
                      <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                         profile.experienceLevel === level.id ? 'border-[#d4af37]' : 'border-gray-300'
                      }`}>
                        {profile.experienceLevel === level.id && <div className="w-2.5 h-2.5 rounded-full bg-[#d4af37]" />}
                      </div>
                      <span className="font-bold text-gray-900">{level.id}</span>
                    </div>
                    <p className="text-xs text-gray-500 leading-relaxed">{level.desc}</p>
                  </div>
                ))}
              </div>
            </Card>

            {/* Categories Section (Static for now as per ground truth) */}
            <Card className="p-8 border-gray-200 shadow-sm">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-gray-800">Categories</h2>
              </div>
              <div className="space-y-4">
                <span className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm font-semibold inline-block">
                  Web, Mobile & Software Dev
                </span>
                <div className="pt-2">
                  <span className="px-3 py-1.5 bg-gray-50 text-gray-600 rounded-md text-xs font-bold border border-gray-100">
                    Web Development
                  </span>
                </div>
              </div>
            </Card>
          </form>
        </main>
      </div>
    </div>
  );
};


export default ProfileSettingsPage;
