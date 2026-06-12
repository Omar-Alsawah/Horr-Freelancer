import React, { useState, useEffect } from 'react';
import { 
  User, 
  MapPin, 
  Phone, 
  Clock,
  Edit2,
  Loader2,
  Save,
  Mail,
  DollarSign,
  Briefcase,
  ExternalLink,
  Globe,
  Plus,
  Trash2,
  GraduationCap,
  ChevronDown
} from 'lucide-react';
import { profileApi } from '../../api/profile';
import { toast } from 'react-hot-toast';
import SettingsSidebar from './SettingsSidebar';
import { Card } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';

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

const SettingsPage = () => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const response = await profileApi.getFreelancerDetails();
      const data = response.data.data || response.data.value || response.data;
      if (data) {
        setProfile({
          ...data,
          experienceLevel: ExperienceLevelEnum[data.experienceLevel] || 'Beginner',
          languages: Array.isArray(data.languages) ? data.languages : [],
          education: Array.isArray(data.education) ? data.education : [],
          experienceDetails: Array.isArray(data.experienceDetails) ? data.experienceDetails : [],
          employmentHistory: Array.isArray(data.employmentHistory) ? data.employmentHistory : []
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

  const addLanguage = () => {
    setProfile(prev => ({
      ...prev,
      languages: [...prev.languages, { name: '', level: 'Conversational' }]
    }));
  };

  const updateLanguage = (index, field, value) => {
    const newLangs = [...profile.languages];
    newLangs[index] = { ...newLangs[index], [field]: value };
    setProfile(prev => ({ ...prev, languages: newLangs }));
  };

  const removeLanguage = (index) => {
    setProfile(prev => ({
      ...prev,
      languages: prev.languages.filter((_, i) => i !== index)
    }));
  };

  const addEducation = () => {
    setProfile(prev => ({
      ...prev,
      education: [...prev.education, { school: '', degree: '', fieldOfStudy: '', dateStart: new Date().toISOString(), dateEnd: new Date().toISOString() }]
    }));
  };

  const updateEducation = (index, field, value) => {
    const newEdu = [...profile.education];
    newEdu[index] = { ...newEdu[index], [field]: value };
    setProfile(prev => ({ ...prev, education: newEdu }));
  };

  const removeEducation = (index) => {
    setProfile(prev => ({
      ...prev,
      education: prev.education.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    setIsSaving(true);
    setErrors({});

    try {
      const updateDto = {
        fullName: profile.fullName,
        email: profile.email,
        title: profile.title,
        bio: profile.bio,
        experienceLevel: ExperienceLevelEnum[profile.experienceLevel],
        yearsOfExperience: parseInt(profile.yearsOfExperience) || 0,
        hourlyRate: profile.hourlyRate ? parseFloat(profile.hourlyRate) : null,
        availability: profile.availability,
        portfolioUrl: profile.portfolioUrl,
        phoneNumber: profile.phoneNumber,
        address: profile.address,
        city: profile.city,
        stateProvince: profile.stateProvince,
        zipCode: profile.zipCode,
        country: profile.country,
        timeZone: profile.timeZone,
        languages: profile.languages.map(l => ({ id: l.id || null, name: l.name, level: l.level })),
        education: profile.education.map(e => ({ 
          id: e.id || null,
          school: e.school, 
          degree: e.degree, 
          fieldOfStudy: e.fieldOfStudy, 
          dateStart: e.dateStart || null, 
          dateEnd: e.dateEnd || null 
        })),
        experienceDetails: (profile.experienceDetails || []).map(exp => ({
          id: exp.id || 0,
          subject: exp.subject,
          description: exp.description
        })),
        employmentHistory: profile.employmentHistory ? profile.employmentHistory.map(e => ({
          id: e.id || null,
          company: e.company,
          city: e.city || '',
          country: e.country || '',
          title: e.title,
          currentlyWorkThere: e.currentlyWorkThere || false,
          fromDate: e.fromDate || e.dateStart || null,
          toDate: e.toDate || e.dateEnd || null
        })) : []
      };

      await profileApi.updateFreelancerDetails(updateDto);
      toast.success('Profile updated successfully');
      await fetchProfile();
    } catch (error) {
      console.error('Update failed:', error.response?.data);
      if (error.response?.data?.errors) {
        // If it's an array, it's likely a list of general errors
        if (Array.isArray(error.response.data.errors)) {
          toast.error(error.response.data.errors.join(', '));
        } else {
          setErrors(error.response.data.errors);
        }
      } else if (error.response?.data?.message) {
        toast.error(error.response.data.message);
      } else {
        toast.error('Failed to update profile');
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
    <div className="container max-w-[1100px] mx-auto pt-8 pb-16 px-4 font-inter">
      <div className="flex flex-col md:flex-row gap-8">
        <SettingsSidebar />
        
        <main className="flex-1 space-y-8">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Profile Details</h1>
              <p className="text-gray-500 text-sm mt-1">Manage your identity and professional information.</p>
            </div>
            <Button 
              onClick={handleSubmit} 
              disabled={isSaving}
              className="bg-[#108a00] hover:bg-[#0d7300] text-white px-8 rounded-xl h-12 shadow-lg shadow-green-100 transition-all w-full sm:w-auto"
            >
              {isSaving ? <Loader2 size={18} className="animate-spin mr-2" /> : <Save size={18} className="mr-2" />}
              Save All Changes
            </Button>
          </div>

          <div className="space-y-6">
            {/* Basic Info */}
            <Card className="p-8 border-none shadow-sm ring-1 ring-gray-100 rounded-2xl space-y-8">
              <div className="flex items-center gap-3 border-b border-gray-50 pb-4">
                <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center text-blue-600">
                  <User size={20} />
                </div>
                <h2 className="text-xl font-bold text-gray-800">Basic Information</h2>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Full Name</label>
                  <div className="relative">
                    <Input 
                      className={`pl-10 h-12 rounded-xl ${errors.fullName ? 'border-red-500' : 'border-gray-200'}`}
                      value={profile.fullName || ''}
                      onChange={(e) => handleFieldChange('fullName', e.target.value)}
                    />
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                  </div>
                  {errors.fullName && <p className="text-red-500 text-[10px] mt-1">{errors.fullName}</p>}
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Email Address</label>
                  <div className="relative">
                    <Input 
                      className="pl-10 h-12 rounded-xl bg-gray-50 border-gray-200 text-gray-500 cursor-not-allowed"
                      value={profile.email || ''}
                      disabled
                    />
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                  </div>
                  <p className="text-[10px] text-gray-400">Email updates are handled via security tab</p>
                </div>
                <div className="space-y-2 md:col-span-2">
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Professional Title</label>
                  <Input 
                    className={`h-12 rounded-xl ${errors.title ? 'border-red-500' : 'border-gray-200'}`}
                    value={profile.title || ''}
                    onChange={(e) => handleFieldChange('title', e.target.value)}
                    placeholder="e.g. Senior Full Stack Developer"
                  />
                  {errors.title && <p className="text-red-500 text-[10px] mt-1">{errors.title}</p>}
                </div>
                <div className="space-y-2 md:col-span-2">
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Professional Summary</label>
                  <textarea 
                    className="w-full p-4 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#d4af37]/20 focus:border-[#d4af37] outline-none transition-all min-h-[150px] resize-none"
                    value={profile.bio || ''}
                    onChange={(e) => handleFieldChange('bio', e.target.value)}
                    placeholder="Tell clients about your expertise and what makes you unique..."
                  />
                  {errors.bio && <p className="text-red-500 text-[10px] mt-1">{errors.bio}</p>}
                </div>
              </div>
            </Card>

            {/* Professional Details */}
            <Card className="p-8 border-none shadow-sm ring-1 ring-gray-100 rounded-2xl space-y-8">
              <div className="flex items-center gap-3 border-b border-gray-50 pb-4">
                <div className="w-10 h-10 bg-amber-50 rounded-xl flex items-center justify-center text-amber-600">
                  <Briefcase size={20} />
                </div>
                <h2 className="text-xl font-bold text-gray-800">Professional Details</h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Hourly Rate ($)</label>
                  <div className="relative">
                    <Input 
                      type="number"
                      className="pl-10 h-12 rounded-xl border-gray-200"
                      value={profile.hourlyRate || ''}
                      onChange={(e) => handleFieldChange('hourlyRate', e.target.value)}
                    />
                    <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Availability</label>
                  <div className="relative">
                    <select 
                      className="w-full h-12 p-3 pl-10 border border-gray-200 rounded-xl appearance-none focus:ring-2 focus:ring-[#d4af37]/20 focus:border-[#d4af37] outline-none transition-all cursor-pointer bg-white"
                      value={profile.availability || ''}
                      onChange={(e) => handleFieldChange('availability', e.target.value)}
                    >
                      <option value="">Select availability</option>
                      <option value="More than 30 hrs/week">More than 30 hrs/week</option>
                      <option value="Less than 30 hrs/week">Less than 30 hrs/week</option>
                      <option value="As needed">As needed</option>
                    </select>
                    <Clock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={16} />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Experience Level</label>
                  <div className="relative">
                    <select 
                      className="w-full h-12 p-3 border border-gray-200 rounded-xl appearance-none focus:ring-2 focus:ring-[#d4af37]/20 focus:border-[#d4af37] outline-none transition-all cursor-pointer bg-white"
                      value={profile.experienceLevel}
                      onChange={(e) => handleFieldChange('experienceLevel', e.target.value)}
                    >
                      <option>Beginner</option>
                      <option>Intermediate</option>
                      <option>Advanced</option>
                      <option>Expert</option>
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={16} />
                  </div>
                </div>
                <div className="md:col-span-3 space-y-2">
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Portfolio URL</label>
                  <div className="relative">
                    <Input 
                      className="pl-10 h-12 rounded-xl border-gray-200"
                      value={profile.portfolioUrl || ''}
                      onChange={(e) => handleFieldChange('portfolioUrl', e.target.value)}
                      placeholder="https://yourportfolio.com"
                    />
                    <ExternalLink className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                  </div>
                </div>
              </div>
            </Card>

            {/* Location & Contact */}
            <Card className="p-8 border-none shadow-sm ring-1 ring-gray-100 rounded-2xl space-y-8">
              <div className="flex items-center gap-3 border-b border-gray-50 pb-4">
                <div className="w-10 h-10 bg-rose-50 rounded-xl flex items-center justify-center text-rose-600">
                  <MapPin size={20} />
                </div>
                <h2 className="text-xl font-bold text-gray-800">Location & Contact</h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Country</label>
                  <Input 
                    className="h-12 rounded-xl border-gray-200"
                    value={profile.country || ''}
                    onChange={(e) => handleFieldChange('country', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">City</label>
                  <Input 
                    className="h-12 rounded-xl border-gray-200"
                    value={profile.city || ''}
                    onChange={(e) => handleFieldChange('city', e.target.value)}
                  />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Phone Number</label>
                  <div className="relative">
                    <Input 
                      className="pl-10 h-12 rounded-xl border-gray-200"
                      value={profile.phoneNumber || ''}
                      onChange={(e) => handleFieldChange('phoneNumber', e.target.value)}
                      placeholder="+201..."
                    />
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                  </div>
                </div>
              </div>
            </Card>

            {/* Languages */}
            <Card className="p-8 border-none shadow-sm ring-1 ring-gray-100 rounded-2xl space-y-6">
              <div className="flex items-center justify-between border-b border-gray-50 pb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-purple-50 rounded-xl flex items-center justify-center text-purple-600">
                    <Globe size={20} />
                  </div>
                  <h2 className="text-xl font-bold text-gray-800">Languages</h2>
                </div>
                <Button variant="outline" size="sm" onClick={addLanguage} className="rounded-lg border-gray-200 hover:bg-gray-50">
                  <Plus size={16} className="mr-1" /> Add Language
                </Button>
              </div>

              <div className="space-y-4">
                {profile.languages.map((lang, idx) => (
                  <div key={idx} className="flex gap-4 items-end animate-in fade-in slide-in-from-top-2 duration-300">
                    <div className="flex-1 space-y-2">
                      <label className="text-[10px] font-bold text-gray-400 uppercase">Language</label>
                      <Input 
                        className="h-11 rounded-xl border-gray-200 focus:ring-2 focus:ring-[#d4af37]/20 outline-none"
                        value={lang.name}
                        onChange={(e) => updateLanguage(idx, 'name', e.target.value)}
                        placeholder="e.g. English"
                      />
                    </div>
                    <div className="flex-1 space-y-2">
                      <label className="text-[10px] font-bold text-gray-400 uppercase">Proficiency</label>
                      <select 
                        className="w-full h-11 p-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#d4af37]/20 outline-none bg-white"
                        value={lang.level}
                        onChange={(e) => updateLanguage(idx, 'level', e.target.value)}
                      >
                        <option>Basic</option>
                        <option>Conversational</option>
                        <option>Fluent</option>
                        <option>Native</option>
                      </select>
                    </div>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      onClick={() => removeLanguage(idx)}
                      className="text-gray-400 hover:text-red-500 hover:bg-red-50 h-11 w-11 rounded-xl"
                    >
                      <Trash2 size={18} />
                    </Button>
                  </div>
                ))}
                {profile.languages.length === 0 && (
                  <p className="text-sm text-gray-500 italic text-center py-4">No languages added yet.</p>
                )}
              </div>
            </Card>

            {/* Education */}
            <Card className="p-8 border-none shadow-sm ring-1 ring-gray-100 rounded-2xl space-y-6">
              <div className="flex items-center justify-between border-b border-gray-50 pb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-indigo-50 rounded-xl flex items-center justify-center text-indigo-600">
                    <GraduationCap size={20} />
                  </div>
                  <h2 className="text-xl font-bold text-gray-800">Education</h2>
                </div>
                <Button variant="outline" size="sm" onClick={addEducation} className="rounded-lg border-gray-200 hover:bg-gray-50">
                  <Plus size={16} className="mr-1" /> Add Education
                </Button>
              </div>

              <div className="space-y-8">
                {profile.education.map((edu, idx) => (
                  <div key={idx} className="p-6 bg-gray-50/50 rounded-2xl space-y-4 relative group border border-transparent hover:border-gray-200 transition-all animate-in fade-in slide-in-from-top-2">
                    <button 
                      onClick={() => removeEducation(idx)}
                      className="absolute top-4 right-4 text-gray-400 hover:text-red-500 p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <Trash2 size={16} />
                    </button>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-gray-400 uppercase">School / University</label>
                        <Input 
                          className="h-11 rounded-xl border-gray-200 bg-white"
                          value={edu.school}
                          onChange={(e) => updateEducation(idx, 'school', e.target.value)}
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-gray-400 uppercase">Degree</label>
                        <Input 
                          className="h-11 rounded-xl border-gray-200 bg-white"
                          value={edu.degree}
                          onChange={(e) => updateEducation(idx, 'degree', e.target.value)}
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-gray-400 uppercase">Field of Study</label>
                        <Input 
                          className="h-11 rounded-xl border-gray-200 bg-white"
                          value={edu.fieldOfStudy}
                          onChange={(e) => updateEducation(idx, 'fieldOfStudy', e.target.value)}
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                          <label className="text-[10px] font-bold text-gray-400 uppercase">Started</label>
                          <Input 
                            type="date" 
                            className="h-11 rounded-xl border-gray-200 bg-white"
                            value={edu.dateStart?.split('T')[0]}
                            onChange={(e) => updateEducation(idx, 'dateStart', e.target.value)}
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[10px] font-bold text-gray-400 uppercase">Ended</label>
                          <Input 
                            type="date" 
                            className="h-11 rounded-xl border-gray-200 bg-white"
                            value={edu.dateEnd?.split('T')[0]}
                            onChange={(e) => updateEducation(idx, 'dateEnd', e.target.value)}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
                {profile.education.length === 0 && (
                  <p className="text-sm text-gray-500 italic text-center py-4">No education history added yet.</p>
                )}
              </div>
            </Card>

            {/* Work History (Platform Derived) */}
            <Card className="p-8 border-none shadow-sm ring-1 ring-gray-100 rounded-2xl space-y-6 bg-gray-50/30">
              <div className="flex items-center gap-3 border-b border-gray-50 pb-4">
                <div className="w-10 h-10 bg-green-50 rounded-xl flex items-center justify-center text-green-600">
                  <Briefcase size={20} />
                </div>
                <h2 className="text-xl font-bold text-gray-800">Platform Work History</h2>
              </div>

              <div className="space-y-4">
                {profile.employmentHistory.length > 0 ? (
                  profile.employmentHistory.map((job, idx) => (
                    <div key={idx} className="p-5 bg-white rounded-2xl border border-gray-100 flex justify-between items-start">
                      <div>
                        <h4 className="font-bold text-gray-900">{job.title}</h4>
                        <div className="flex items-center gap-2 text-xs text-gray-500 mt-1">
                          <span>{job.company}</span>
                          <span>•</span>
                          <span>{job.dateRange}</span>
                        </div>
                        {job.description && (
                          <p className="text-sm text-gray-600 mt-3 italic">"{job.description}"</p>
                        )}
                      </div>
                      <div className="bg-green-50 text-green-700 text-[10px] font-bold px-2 py-1 rounded-md uppercase tracking-wider">
                        Completed
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8">
                    <p className="text-sm text-gray-500">No platform jobs completed yet.</p>
                    <p className="text-[11px] text-gray-400 mt-1">Your work history is automatically updated as you complete contracts on HORR.</p>
                  </div>
                )}
              </div>
            </Card>
          </div>
        </main>
      </div>
    </div>
  );
};

export default SettingsPage;
