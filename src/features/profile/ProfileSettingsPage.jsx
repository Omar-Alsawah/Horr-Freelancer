import React, { useState, useEffect } from 'react';
import { 
  Loader2,
  ChevronDown,
  X,
  Search,
  Star,
  Award,
  Zap
} from 'lucide-react';
import { profileApi } from '../../api/profile';
import { skillsApi } from '../../api/skills';
import { toast } from 'react-hot-toast';
import SettingsSidebar from './SettingsSidebar';
import { Card } from '../../components/ui/card';
import { Button } from '../../components/ui/button';

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
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [errors, setErrors] = useState({});

  // Skills state
  const [mySkills, setMySkills] = useState([]);
  const [allSkills, setAllSkills] = useState([]);
  const [selectedSkillId, setSelectedSkillId] = useState('');
  const [selectedProficiency, setSelectedProficiency] = useState(1);
  const [skillSearch, setSkillSearch] = useState('');
  const [skillError, setSkillError] = useState('');

  useEffect(() => {
    fetchProfile();
    fetchMySkills();
    fetchAllSkills();
  }, []);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const response = await profileApi.getProfile();
      const data = response.data.data || response.data.value || response.data;
      if (data) {
        setProfile({
          ...data,
          experienceLevel: ExperienceLevelEnum[data.experienceLevel] || 'Beginner'
        });
      }
    } catch (error) {
      toast.error('Failed to load profile settings');
    } finally {
      setLoading(false);
    }
  };

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

  const handleFieldChange = (field, value) => {
    setProfile(prev => ({ ...prev, [field]: value }));
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

  const handleSubmit = async () => {
    setIsSaving(true);
    try {
      const levelInt = ExperienceLevelEnum[profile.experienceLevel];
      await profileApi.updateExperienceLevel(levelInt);
      toast.success('Experience level updated');
    } catch (error) {
      toast.error('Failed to update settings');
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
          <div className="flex justify-between items-center bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Expertise Settings</h1>
              <p className="text-gray-500 text-sm mt-1">Showcase your skills and experience level to clients.</p>
            </div>
            <Button 
              onClick={handleSubmit} 
              disabled={isSaving}
              className="bg-[#108a00] hover:bg-[#0d7300] text-white px-8 rounded-xl h-12 shadow-lg shadow-green-100"
            >
              {isSaving ? <Loader2 size={18} className="animate-spin mr-2" /> : 'Save Experience'}
            </Button>
          </div>

          <div className="space-y-6">
            {/* Experience Level Section */}
            <Card className="p-8 border-none shadow-sm ring-1 ring-gray-100 rounded-2xl space-y-6">
              <div className="flex items-center gap-3 border-b border-gray-50 pb-4">
                <div className="w-10 h-10 bg-amber-50 rounded-xl flex items-center justify-center text-amber-600">
                  <Award size={20} />
                </div>
                <h2 className="text-xl font-bold text-gray-800">Experience Level</h2>
              </div>
              
              <div className="relative max-w-md">
                <select 
                  className="w-full h-12 p-3 pl-4 border border-gray-200 rounded-xl appearance-none focus:ring-2 focus:ring-[#d4af37]/20 outline-none transition-all cursor-pointer bg-white"
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
              <p className="text-xs text-gray-400">Select the level that best matches your professional history.</p>
            </Card>

            {/* Skills Management Section */}
            <Card className="p-8 border-none shadow-sm ring-1 ring-gray-100 rounded-2xl space-y-8">
              <div className="flex items-center gap-3 border-b border-gray-50 pb-4">
                <div className="w-10 h-10 bg-indigo-50 rounded-xl flex items-center justify-center text-indigo-600">
                  <Zap size={20} />
                </div>
                <h2 className="text-xl font-bold text-gray-800">Professional Skills</h2>
              </div>
              
              <div className="p-6 bg-gray-50/50 rounded-2xl border border-gray-100 space-y-6">
                <h3 className="text-sm font-bold text-gray-700 uppercase tracking-wider">Add New Skill</h3>
                <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                  <div className="md:col-span-5 relative">
                    <div className="relative">
                      <Input 
                        placeholder="Search skills..." 
                        className="pl-10 h-12 rounded-xl border-gray-200 bg-white"
                        value={skillSearch}
                        onChange={(e) => setSkillSearch(e.target.value)}
                      />
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                    </div>
                    {skillSearch && (
                      <div className="absolute z-20 w-full mt-2 bg-white border border-gray-100 rounded-xl shadow-2xl max-h-60 overflow-y-auto p-2">
                        {allSkills
                          .filter(s => s.name.toLowerCase().includes(skillSearch.toLowerCase()))
                          .map(skill => (
                            <div 
                              key={skill.id} 
                              className="p-3 hover:bg-yellow-50 rounded-lg cursor-pointer text-sm transition-colors flex justify-between items-center"
                              onClick={() => {
                                setSelectedSkillId(skill.id);
                                setSkillSearch(skill.name);
                              }}
                            >
                              <span>{skill.name}</span>
                              {selectedSkillId === skill.id && <div className="w-2 h-2 bg-[#d4af37] rounded-full" />}
                            </div>
                          ))
                        }
                      </div>
                    )}
                  </div>
                  <div className="md:col-span-4 relative">
                    <select 
                      className="w-full h-12 p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#d4af37]/20 outline-none appearance-none cursor-pointer bg-white"
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
                      className="w-full h-12 bg-[#d4af37] hover:bg-[#b8962d] text-white rounded-xl shadow-md shadow-yellow-100 transition-all"
                    >
                      Add Skill
                    </Button>
                  </div>
                </div>
                {skillError && <p className="text-red-500 text-xs font-medium ml-1">{skillError}</p>}
              </div>

              <div className="space-y-4">
                <h3 className="text-sm font-bold text-gray-700 uppercase tracking-wider">Your Skills</h3>
                <div className="flex flex-wrap gap-3">
                  {mySkills.length > 0 ? (
                    mySkills.map((skill) => (
                      <div 
                        key={skill.skillId} 
                        className="px-5 py-3 bg-white border border-gray-100 text-gray-800 text-sm font-semibold rounded-2xl flex items-center gap-4 shadow-sm hover:ring-2 hover:ring-[#d4af37]/30 transition-all animate-in zoom-in duration-300"
                      >
                        <div className="flex flex-col">
                          <span className="text-gray-900">{skill.skillName}</span>
                          <span className="text-[10px] text-[#d4af37] font-bold uppercase tracking-tighter">{getProficiencyLabel(skill.proficiencyLevel)}</span>
                        </div>
                        <button 
                          className="p-1.5 bg-gray-50 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors"
                          onClick={() => handleRemoveSkill(skill.skillId)}
                        >
                          <X size={14} />
                        </button>
                      </div>
                    ))
                  ) : (
                    <div className="w-full text-center py-12 bg-gray-50/50 rounded-3xl border-2 border-dashed border-gray-100">
                      <p className="text-gray-500 italic text-sm font-medium">You haven't added any skills to your profile yet.</p>
                      <p className="text-[10px] text-gray-400 mt-1">Skills help clients find you for relevant jobs.</p>
                    </div>
                  )}
                </div>
              </div>
            </Card>
          </div>
        </main>
      </div>
    </div>
  );
};

export default ProfileSettingsPage;
