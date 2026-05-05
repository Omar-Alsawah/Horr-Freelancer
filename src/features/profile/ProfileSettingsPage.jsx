import React, { useState, useEffect } from 'react';
import { 
  Loader2,
  ChevronDown,
  Edit2,
  X,
  Search
} from 'lucide-react';
import { profileApi } from '../../api/profile';
import { skillsApi } from '../../api/skills';
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
  'Beginner': 0,
  'Intermediate': 1,
  'Advanced': 2,
  'Expert': 3,
  0: 'Beginner',
  1: 'Intermediate',
  2: 'Advanced',
  3: 'Expert'
};

const ProfileSettingsPage = () => {
  const [profile, setProfile] = useState(null);
  const [originalProfile, setOriginalProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [editedFields, setEditedFields] = useState({});
  const [errors, setErrors] = useState({});

  const [mySkills, setMySkills] = useState([]);
  const [allSkills, setAllSkills] = useState([]);
  const [selectedSkillId, setSelectedSkillId] = useState('');
  const [selectedProficiency, setSelectedProficiency] = useState(1);
  const [skillError, setSkillError] = useState('');
  const [skillSearch, setSkillSearch] = useState('');

  useEffect(() => {
    fetchProfile();
    fetchMySkills();
    fetchAllSkills();
  }, []);

  const fetchMySkills = async () => {
    try {
      const response = await skillsApi.getMySkills();
      const data = response.data.data || response.data.value || response.data;
      setMySkills(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Failed to load my skills');
    }
  };

  const fetchAllSkills = async () => {
    try {
      const response = await skillsApi.getAllSkills();
      const data = response.data.data || response.data.value || response.data;
      setAllSkills(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Failed to load all skills');
    }
  };

  const handleAddSkill = async () => {
    if (!selectedSkillId) {
      setSkillError('Please select a skill');
      return;
    }
    
    setSkillError('');
    try {
      const response = await skillsApi.addSkill({
        skillId: selectedSkillId,
        proficiencyLevel: parseInt(selectedProficiency, 10)
      });
      const newSkill = response.data.data || response.data.value || response.data;
      setMySkills(prev => [...prev, newSkill]);
      setSelectedSkillId('');
      setSkillSearch('');
      setSelectedProficiency(1);
      toast.success('Skill added');
    } catch (err) {
      if (err.status === 409) {
        setSkillError('You already have this skill');
      } else {
        toast.error('Failed to add skill');
      }
    }
  };

  const handleRemoveSkill = async (skillId) => {
    try {
      await skillsApi.removeSkill(skillId);
      setMySkills(prev => prev.filter(s => s.skillId !== skillId));
      toast.success('Skill removed');
    } catch (err) {
      toast.error('Failed to remove skill');
    }
  };

  const getProficiencyLabel = (level) => {
    const labels = { 0: 'Beginner', 1: 'Intermediate', 2: 'Advanced', 3: 'Expert' };
    return labels[level] || 'Intermediate';
  };

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const response = await profileApi.getProfile();
      const data = response.data.data || response.data.value || response.data;
      if (data) {
        const processedData = {
          ...data,
          visibility: VisibilityEnum[data.visibility] || 'Public',
          experienceLevel: ExperienceLevelEnum[data.experienceLevel] || 'Beginner'
        };
        setProfile(processedData);
        setOriginalProfile(processedData);
      }
      setEditedFields({});
    } catch (error) {
      toast.error('Failed to load profile settings');
    } finally {
      setLoading(false);
    }
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

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    if (Object.keys(editedFields).length === 0) return;

    setIsSaving(true);
    setErrors({});

    try {
      // Route each changed group to its correct PATCH endpoint
      
      // 1. Name update
      if (editedFields.fullName !== undefined && profile.fullName !== originalProfile.fullName) {
        await profileApi.updateName(profile.fullName);
      }

      // 2. Email update
      if (editedFields.email !== undefined && profile.email !== originalProfile.email) {
        await profileApi.updateEmail(profile.email);
      }

      // 3. Location update
      const locationFields = ['address', 'city', 'stateProvince', 'zipCode', 'country', 'timeZone', 'phoneNumber'];
      const hasLocationChanges = locationFields.some(field => editedFields[field] !== undefined && profile[field] !== originalProfile[field]);
      if (hasLocationChanges) {
        const locationDto = {
          address: profile.address || '',
          city: profile.city || '',
          stateProvince: profile.stateProvince || '',
          zipCode: profile.zipCode || '',
          country: profile.country || '',
          timeZone: profile.timeZone || '',
          phoneNumber: profile.phoneNumber || ''
        };
        await profileApi.updateLocation(locationDto);
      }

      // 4. Title update
      if (editedFields.title !== undefined && profile.title !== originalProfile.title) {
        await profileApi.updateTitle(profile.title);
      }

      // 5. Bio update
      if (editedFields.bio !== undefined && profile.bio !== originalProfile.bio) {
        await profileApi.updateBio(profile.bio);
      }

      // 6. Experience Level update
      if (editedFields.experienceLevel !== undefined && profile.experienceLevel !== originalProfile.experienceLevel) {
        const levelInt = ExperienceLevelEnum[profile.experienceLevel];
        await profileApi.updateExperienceLevel({ experienceLevel: levelInt });
      }

      // 7. Privacy update
      const privacyFields = ['visibility'];
      const hasPrivacyChanges = privacyFields.some(field => editedFields[field] !== undefined && profile[field] !== originalProfile[field]);
      if (hasPrivacyChanges) {
        const privacyDto = {
          visibility: VisibilityEnum[profile.visibility]
        };
        await profileApi.updatePrivacy(privacyDto);
      }

      toast.success('Settings updated successfully');
      await fetchProfile();
    } catch (error) {
      if (error.status === 400 && error.errors) {
        const fieldErrors = {};
        Object.keys(error.errors).forEach(key => {
          const camelKey = key.charAt(0).toLowerCase() + key.slice(1);
          fieldErrors[camelKey] = error.errors[key][0];
        });
        setErrors(fieldErrors);
      } else {
        toast.error(error.title || 'Failed to update settings');
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
              disabled={isSaving || Object.keys(editedFields).length === 0}
              className="bg-[#d4af37] hover:bg-[#b8962d] text-white px-8"
            >
              {isSaving ? <Loader2 size={18} className="animate-spin mr-2" /> : null}
              Save Changes
            </Button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Account Info Section */}
            <Card className="p-8 border-gray-200 shadow-sm space-y-6">
              <h2 className="text-xl font-bold text-gray-800">Account Info</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-gray-700">Full Name</label>
                  <input 
                    type="text" 
                    className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-[#d4af37] outline-none transition-all ${
                      errors.fullName ? 'border-red-500' : 'border-gray-200'
                    }`}
                    value={profile.fullName || ''}
                    onChange={(e) => handleFieldChange('fullName', e.target.value)}
                  />
                  {errors.fullName && <p className="text-red-500 text-xs mt-1">{errors.fullName}</p>}
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-gray-700">Email</label>
                  <input 
                    type="email" 
                    className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-[#d4af37] outline-none transition-all ${
                      errors.email ? 'border-red-500' : 'border-gray-200'
                    }`}
                    value={profile.email || ''}
                    onChange={(e) => handleFieldChange('email', e.target.value)}
                  />
                  {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
                </div>
                <div className="space-y-2 md:col-span-2">
                  <label className="text-sm font-semibold text-gray-700">Professional Title</label>
                  <input 
                    type="text" 
                    className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-[#d4af37] outline-none transition-all ${
                      errors.title ? 'border-red-500' : 'border-gray-200'
                    }`}
                    value={profile.title || ''}
                    onChange={(e) => handleFieldChange('title', e.target.value)}
                    placeholder="e.g. Senior Full Stack Developer"
                  />
                  {errors.title && <p className="text-red-500 text-xs mt-1">{errors.title}</p>}
                </div>
                <div className="space-y-2 md:col-span-2">
                  <label className="text-sm font-semibold text-gray-700">Professional Summary</label>
                  <textarea 
                    className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-[#d4af37] outline-none transition-all min-h-[120px] ${
                      errors.bio ? 'border-red-500' : 'border-gray-200'
                    }`}
                    value={profile.bio || ''}
                    onChange={(e) => handleFieldChange('bio', e.target.value)}
                    placeholder="Describe your background, skills, and achievements..."
                  />
                  {errors.bio && <p className="text-red-500 text-xs mt-1">{errors.bio}</p>}
                </div>
              </div>
            </Card>

            {/* Location Section */}
            <Card className="p-8 border-gray-200 shadow-sm space-y-6">
              <h2 className="text-xl font-bold text-gray-800">Location & Contact</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-gray-700">Address</label>
                  <input 
                    type="text" 
                    className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-[#d4af37] outline-none transition-all ${
                      errors.address ? 'border-red-500' : 'border-gray-200'
                    }`}
                    value={profile.address || ''}
                    onChange={(e) => handleFieldChange('address', e.target.value)}
                  />
                  {errors.address && <p className="text-red-500 text-xs mt-1">{errors.address}</p>}
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-gray-700">Phone Number</label>
                  <input 
                    type="text" 
                    className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-[#d4af37] outline-none transition-all ${
                      errors.phoneNumber ? 'border-red-500' : 'border-gray-200'
                    }`}
                    value={profile.phoneNumber || ''}
                    onChange={(e) => handleFieldChange('phoneNumber', e.target.value)}
                    placeholder="+201..."
                  />
                  {errors.phoneNumber && <p className="text-red-500 text-xs mt-1">{errors.phoneNumber}</p>}
                </div>
              </div>
            </Card>

            {/* Visibility Section */}
            <Card className="p-8 border-gray-200 shadow-sm space-y-6">
              <h2 className="text-xl font-bold text-gray-800">Privacy</h2>
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-gray-700">Profile Visibility</label>
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
              <div className="relative">
                <select 
                  className={`w-full p-3 border rounded-lg appearance-none cursor-pointer focus:ring-2 focus:ring-[#d4af37] outline-none transition-all ${
                    errors.experienceLevel ? 'border-red-500' : 'border-gray-200'
                  }`}
                  value={profile.experienceLevel}
                  onChange={(e) => handleFieldChange('experienceLevel', e.target.value)}
                >
                  <option>Beginner</option>
                  <option>Intermediate</option>
                  <option>Advanced</option>
                  <option>Expert</option>
                </select>
                <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={18} />
              </div>
            </Card>

            {/* Skills Management Section */}
            <Card className="p-8 border-gray-200 shadow-sm space-y-6">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-bold text-gray-800">Skills</h2>
              </div>
              
              <div className="p-6 bg-gray-50 rounded-xl border border-gray-100 space-y-4">
                <h3 className="text-sm font-bold text-gray-700">Add New Skill</h3>
                <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                  <div className="md:col-span-5 relative">
                    <input 
                      type="text" 
                      placeholder="Search skills..." 
                      className="w-full p-3 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#d4af37] outline-none transition-all"
                      value={skillSearch}
                      onChange={(e) => setSkillSearch(e.target.value)}
                    />
                    {skillSearch && (
                      <div className="absolute z-10 w-full mt-2 bg-white border border-gray-200 rounded-lg shadow-xl max-h-60 overflow-y-auto">
                        {allSkills
                          .filter(s => s.name.toLowerCase().includes(skillSearch.toLowerCase()))
                          .map(skill => (
                            <div 
                              key={skill.id} 
                              className="p-3 hover:bg-yellow-50 cursor-pointer text-sm transition-colors"
                              onClick={() => {
                                setSelectedSkillId(skill.id);
                                setSkillSearch(skill.name);
                              }}
                            >
                              {skill.name}
                            </div>
                          ))
                        }
                      </div>
                    )}
                  </div>
                  <div className="md:col-span-4 relative">
                    <select 
                      className="w-full p-3 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#d4af37] outline-none appearance-none cursor-pointer bg-white"
                      value={selectedProficiency}
                      onChange={(e) => setSelectedProficiency(e.target.value)}
                    >
                      <option value={0}>Beginner</option>
                      <option value={1}>Intermediate</option>
                      <option value={2}>Advanced</option>
                      <option value={3}>Expert</option>
                    </select>
                    <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={16} />
                  </div>
                  <div className="md:col-span-3">
                    <Button 
                      type="button"
                      onClick={handleAddSkill}
                      className="w-full h-full bg-[#d4af37] hover:bg-[#b8962d] text-white"
                    >
                      Add Skill
                    </Button>
                  </div>
                </div>
                {skillError && <p className="text-red-500 text-xs font-medium">{skillError}</p>}
              </div>

              <div className="flex flex-wrap gap-3 mt-4">
                {mySkills.length > 0 ? (
                  mySkills.map((skill) => (
                    <div 
                      key={skill.skillId} 
                      className="px-4 py-2 bg-white border border-gray-200 text-gray-800 text-sm font-semibold rounded-full flex items-center gap-3 shadow-sm group hover:border-[#d4af37] transition-all"
                    >
                      <span>{skill.skillName} • <span className="text-[#d4af37]">{getProficiencyLabel(skill.proficiencyLevel)}</span></span>
                      <X 
                        size={14} 
                        className="cursor-pointer text-gray-400 hover:text-red-500 transition-colors" 
                        onClick={() => handleRemoveSkill(skill.skillId)}
                      />
                    </div>
                  ))
                ) : (
                  <p className="text-gray-500 italic text-sm py-4">No skills added yet.</p>
                )}
              </div>
            </Card>
          </form>
        </main>
      </div>
    </div>
  );
};



export default ProfileSettingsPage;
