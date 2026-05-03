import React, { useState, useEffect } from 'react';
import { 
  User, 
  Mail, 
  MapPin, 
  Phone, 
  Globe, 
  Clock,
  Edit2,
  Loader2
} from 'lucide-react';
import { profileApi } from '../../api/profile';
import { toast } from 'react-hot-toast';
import SettingsSidebar from './SettingsSidebar';
import { Card } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';

const SettingsPage = () => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editSections, setEditSections] = useState({
    account: false,
    location: false
  });
  const [editedFields, setEditedFields] = useState({});

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const response = await profileApi.getProfile();
      const profileData = response.data.data;
      if (profileData) {
        setProfile({
          ...profileData,
          name: profileData.fullName // Map for consistency
        });
      }
    } catch (error) {
      toast.error('Failed to load settings');
    } finally {
      setLoading(false);
    }
  };

  const toggleEdit = (section) => {
    setEditSections(prev => ({ ...prev, [section]: !prev[section] }));
  };

  const handleFieldChange = (field, value) => {
    setProfile(prev => ({ ...prev, [field]: value }));
    setEditedFields(prev => ({ ...prev, [field]: value }));
  };

  const handleUpdate = async (section) => {
    if (Object.keys(editedFields).length === 0) {
      toggleEdit(section);
      return;
    }

    try {
      await profileApi.updateProfile(editedFields);
      toast.success('Settings updated successfully');
      setEditedFields({});
      toggleEdit(section);
    } catch (error) {
      toast.error('Failed to update settings');
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
          <h1 className="text-3xl font-bold text-gray-900 mb-8">Contact info</h1>

          {/* Account Card */}
          <Card className="border-gray-200 overflow-hidden shadow-sm">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
              <h2 className="text-xl font-bold text-gray-800">Account</h2>
              {!editSections.account && (
                <button 
                  onClick={() => toggleEdit('account')}
                  className="p-2 rounded-full hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <Edit2 size={18} />
                </button>
              )}
            </div>
            
            <div className="p-8">
              {editSections.account ? (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-sm font-semibold text-gray-700">First name</label>
                      <Input 
                        value={profile?.firstName || profile?.name?.split(' ')[0] || ''} 
                        onChange={(e) => handleFieldChange('firstName', e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-semibold text-gray-700">Last name</label>
                      <Input 
                        value={profile?.lastName || profile?.name?.split(' ')[1] || ''} 
                        onChange={(e) => handleFieldChange('lastName', e.target.value)}
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-gray-700">Email</label>
                    <Input 
                      type="email"
                      value={profile?.email} 
                      onChange={(e) => handleFieldChange('email', e.target.value)}
                    />
                  </div>
                  <div className="flex gap-4 pt-4 border-t border-gray-100">
                    <Button className="bg-[#d4af37] hover:bg-[#b8962d] text-white" onClick={() => handleUpdate('account')}>Update</Button>
                    <Button variant="outline" onClick={() => toggleEdit('account')}>Cancel</Button>
                  </div>
                </div>
              ) : (
                <div className="space-y-6 text-sm">
                  <div className="flex border-b border-gray-50 pb-4">
                    <div className="w-1/3 text-gray-500 font-medium">User ID</div>
                    <div className="w-2/3 text-gray-900 font-bold">{profile?.id?.substring(0, 8) || 'e83b2bbd'}</div>
                  </div>
                  <div className="flex border-b border-gray-50 pb-4">
                    <div className="w-1/3 text-gray-500 font-medium">Name</div>
                    <div className="w-2/3 text-gray-900 font-bold">{profile?.name}</div>
                  </div>
                  <div className="flex border-b border-gray-50 pb-4">
                    <div className="w-1/3 text-gray-500 font-medium">Email</div>
                    <div className="w-2/3 text-gray-900 font-bold">{profile?.email}</div>
                  </div>
                  <button className="text-red-500 font-semibold hover:underline mt-4">Close my account</button>
                </div>
              )}
            </div>
          </Card>

          {/* Location Card */}
          <Card className="border-gray-200 overflow-hidden shadow-sm">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
              <h2 className="text-xl font-bold text-gray-800">Location</h2>
              {!editSections.location && (
                <button 
                  onClick={() => toggleEdit('location')}
                  className="p-2 rounded-full hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <Edit2 size={18} />
                </button>
              )}
            </div>

            <div className="p-8">
              {editSections.location ? (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-sm font-semibold text-gray-700">Time Zone</label>
                      <select 
                        className="w-full p-2 border border-gray-200 rounded-md outline-none focus:ring-2 focus:ring-[#d4af37]"
                        value={profile?.timezone || 'UTC+02:00 Cairo'}
                        onChange={(e) => handleFieldChange('timezone', e.target.value)}
                      >
                        <option>UTC+02:00 Cairo</option>
                        <option>UTC+03:00 Riyadh</option>
                      </select>
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-semibold text-gray-700">Country</label>
                      <select 
                        className="w-full p-2 border border-gray-200 rounded-md outline-none focus:ring-2 focus:ring-[#d4af37]"
                        value={profile?.country || 'Egypt'}
                        onChange={(e) => handleFieldChange('country', e.target.value)}
                      >
                        <option>Egypt</option>
                        <option>United States</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-sm font-semibold text-gray-700">Address</label>
                      <Input 
                        value={profile?.address || ''} 
                        onChange={(e) => handleFieldChange('address', e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-semibold text-gray-700">Phone</label>
                      <div className="flex items-center overflow-hidden border border-gray-200 rounded-md focus-within:ring-2 focus-within:ring-[#d4af37]">
                        <span className="px-3 bg-gray-50 border-r border-gray-200 text-lg">🇪🇬</span>
                        <input 
                          className="flex-1 p-2 outline-none"
                          value={profile?.phone || ''}
                          onChange={(e) => handleFieldChange('phone', e.target.value)}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-4 pt-4 border-t border-gray-100">
                    <Button className="bg-[#d4af37] hover:bg-[#b8962d] text-white" onClick={() => handleUpdate('location')}>Update</Button>
                    <Button variant="outline" onClick={() => toggleEdit('location')}>Cancel</Button>
                  </div>
                </div>
              ) : (
                <div className="space-y-6 text-sm">
                  <div className="flex border-b border-gray-50 pb-4">
                    <div className="w-1/3 text-gray-500 font-medium">Time Zone</div>
                    <div className="w-2/3 text-gray-900 font-bold">{profile?.timezone || 'UTC+02:00 Cairo'}</div>
                  </div>
                  <div className="flex border-b border-gray-50 pb-4">
                    <div className="w-1/3 text-gray-500 font-medium">Address</div>
                    <div className="w-2/3 text-gray-900 font-bold">
                      {profile?.address ? (
                        <p className="whitespace-pre-wrap">{profile?.address}</p>
                      ) : (
                        <span className="text-gray-400 italic">No address set</span>
                      )}
                    </div>
                  </div>
                  <div className="flex border-b border-gray-50 pb-4">
                    <div className="w-1/3 text-gray-500 font-medium">Phone</div>
                    <div className="w-2/3 text-gray-900 font-bold">{profile?.phone || '+20 1030153889'}</div>
                  </div>
                </div>
              )}
            </div>
          </Card>
        </main>
      </div>
    </div>
  );
};

export default SettingsPage;
