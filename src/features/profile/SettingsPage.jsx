import React, { useState, useEffect } from 'react';
import { 
  User, 
  MapPin, 
  Phone, 
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
  const [errors, setErrors] = useState({});

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const response = await profileApi.getProfile();
      if (response.data) {
        setProfile(response.data);
      }
    } catch (error) {
      toast.error('Failed to load settings');
    } finally {
      setLoading(false);
    }
  };

  const toggleEdit = (section) => {
    setEditSections(prev => ({ ...prev, [section]: !prev[section] }));
    setErrors({});
  };

  const handleFieldChange = (field, value) => {
    setProfile(prev => ({ ...prev, [field]: value }));
    setEditedFields(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const handleUpdate = async (section) => {
    if (Object.keys(editedFields).length === 0) {
      toggleEdit(section);
      return;
    }

    try {
      await profileApi.updateProfile(profile); // Send full profile as per "full current form state" logic if needed, or just editedFields. 
      // Subtask 3 says for ProfileSettingsPage "full current form state". 
      // Let's be consistent and send full state if that's the PUT expectation.
      toast.success('Settings updated successfully');
      setEditedFields({});
      toggleEdit(section);
    } catch (error) {
      if (error.response?.status === 400 && error.response.data?.errors) {
        const fieldErrors = {};
        Object.keys(error.response.data.errors).forEach(key => {
          const camelKey = key.charAt(0).toLowerCase() + key.slice(1);
          fieldErrors[camelKey] = error.response.data.errors[key][0];
        });
        setErrors(fieldErrors);
      } else {
        toast.error('Failed to update settings');
      }
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
                        value={profile?.firstName || ''} 
                        onChange={(e) => handleFieldChange('firstName', e.target.value)}
                        className={errors.firstName ? 'border-red-500' : ''}
                      />
                      {errors.firstName && <p className="text-red-500 text-xs">{errors.firstName}</p>}
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-semibold text-gray-700">Last name</label>
                      <Input 
                        value={profile?.lastName || ''} 
                        onChange={(e) => handleFieldChange('lastName', e.target.value)}
                        className={errors.lastName ? 'border-red-500' : ''}
                      />
                      {errors.lastName && <p className="text-red-500 text-xs">{errors.lastName}</p>}
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-gray-700">Email</label>
                    <Input 
                      type="email"
                      value={profile?.email || ''} 
                      onChange={(e) => handleFieldChange('email', e.target.value)}
                      className={errors.email ? 'border-red-500' : ''}
                    />
                    {errors.email && <p className="text-red-500 text-xs">{errors.email}</p>}
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
                    <div className="w-2/3 text-gray-900 font-bold">{profile?.id?.substring(0, 8) || 'N/A'}</div>
                  </div>
                  <div className="flex border-b border-gray-50 pb-4">
                    <div className="w-1/3 text-gray-500 font-medium">Name</div>
                    <div className="w-2/3 text-gray-900 font-bold">{profile?.firstName} {profile?.lastName}</div>
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
                        className={`w-full p-2 border rounded-md outline-none focus:ring-2 focus:ring-[#d4af37] ${
                          errors.timezone ? 'border-red-500' : 'border-gray-200'
                        }`}
                        value={profile?.timezone || 'UTC+02:00 Cairo'}
                        onChange={(e) => handleFieldChange('timezone', e.target.value)}
                      >
                        <option>UTC+02:00 Cairo</option>
                        <option>UTC+03:00 Riyadh</option>
                      </select>
                      {errors.timezone && <p className="text-red-500 text-xs">{errors.timezone}</p>}
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-semibold text-gray-700">Country</label>
                      <select 
                        className={`w-full p-2 border rounded-md outline-none focus:ring-2 focus:ring-[#d4af37] ${
                          errors.country ? 'border-red-500' : 'border-gray-200'
                        }`}
                        value={profile?.country || 'Egypt'}
                        onChange={(e) => handleFieldChange('country', e.target.value)}
                      >
                        <option>Egypt</option>
                        <option>United States</option>
                      </select>
                      {errors.country && <p className="text-red-500 text-xs">{errors.country}</p>}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-sm font-semibold text-gray-700">Address</label>
                      <Input 
                        value={profile?.address || ''} 
                        onChange={(e) => handleFieldChange('address', e.target.value)}
                        className={errors.address ? 'border-red-500' : ''}
                      />
                      {errors.address && <p className="text-red-500 text-xs">{errors.address}</p>}
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-semibold text-gray-700">Phone</label>
                      <div className={`flex items-center overflow-hidden border rounded-md focus-within:ring-2 focus-within:ring-[#d4af37] ${
                        errors.phone ? 'border-red-500' : 'border-gray-200'
                      }`}>
                        <span className="px-3 bg-gray-50 border-r border-gray-200 text-lg">🇪🇬</span>
                        <input 
                          className="flex-1 p-2 outline-none"
                          value={profile?.phone || ''}
                          onChange={(e) => handleFieldChange('phone', e.target.value)}
                        />
                      </div>
                      {errors.phone && <p className="text-red-500 text-xs">{errors.phone}</p>}
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
                    <div className="w-2/3 text-gray-900 font-bold">{profile?.phone || 'N/A'}</div>
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
