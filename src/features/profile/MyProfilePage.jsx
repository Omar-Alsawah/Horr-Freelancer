import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  User, 
  MapPin, 
  Share2, 
  Edit2, 
  Star,
  Loader2,
  Folder,
  Globe,
  ExternalLink,
  X,
  Search,
  Plus,
  Trash2,
  Eye,
  Video,
  Image as ImageIcon
} from 'lucide-react';
import { profileApi } from '../../api/profile';
import { skillsApi } from '../../api/skills';
import { portfolioApi } from '../../api/portfolio';
import { toast } from 'react-hot-toast';
import './MyProfilePage.css';

const PortfolioSkeleton = () => (
  <div className="border border-gray-100 rounded-xl overflow-hidden animate-pulse">
    <div className="h-40 bg-gray-100" />
    <div className="p-4 space-y-3">
      <div className="h-4 bg-gray-100 rounded w-3/4" />
      <div className="h-3 bg-gray-100 rounded w-full" />
      <div className="h-3 bg-gray-100 rounded w-5/6" />
    </div>
  </div>
);

const MyProfilePage = () => {
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const [isEditMode, setIsEditMode] = useState(false);
  const [editedFields, setEditedFields] = useState({});
  const [fieldErrors, setFieldErrors] = useState({});
  const [isSaving, setIsSaving] = useState(false);
  const [showCopyFallback, setShowCopyFallback] = useState(false);
  
  const [mySkills, setMySkills] = useState([]);
  const [allSkills, setAllSkills] = useState([]);
  const [selectedSkillId, setSelectedSkillId] = useState('');
  const [selectedProficiency, setSelectedProficiency] = useState(1);
  const [skillError, setSkillError] = useState('');
  const [skillSearch, setSkillSearch] = useState('');

  const [portfolio, setPortfolio] = useState([]);
  const [isPortfolioLoading, setIsPortfolioLoading] = useState(true);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedProject, setSelectedProject] = useState(null);
  const [isAddingProject, setIsAddingProject] = useState(false);
  
  const [portfolioFormData, setPortfolioFormData] = useState({
    title: '',
    description: '',
    role: '',
    visitLink: '',
    thumbnail: null,
    images: [],
    videos: []
  });
  const [portfolioErrors, setPortfolioErrors] = useState({});

  useEffect(() => {
    fetchProfile();
    fetchMySkills();
    fetchPortfolio();
  }, []);

  const fetchPortfolio = async () => {
    try {
      setIsPortfolioLoading(true);
      const response = await portfolioApi.getPortfolio();
      const data = response.data.data || response.data.value || response.data;
      setPortfolio(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Error fetching portfolio:', err);
    } finally {
      setIsPortfolioLoading(false);
    }
  };

  const fetchMySkills = async () => {
    try {
      const response = await skillsApi.getMySkills();
      const data = response.data.data || response.data.value || response.data;
      setMySkills(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Error fetching skills:', err);
    }
  };

  const fetchAllSkills = async () => {
    try {
      const response = await skillsApi.getAllSkills();
      const data = response.data.data || response.data.value || response.data;
      setAllSkills(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Error fetching all skills:', err);
    }
  };

  const fetchProfile = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await profileApi.getProfile();
      // Handle wrapped Result object: response.data.data or response.data.value
      const data = response.data.data || response.data.value || response.data;
      setProfile(data);
      setEditedFields({});
      setFieldErrors({});
    } catch (err) {
      console.error('Error fetching profile:', err);
      setError(err.title || 'Failed to load profile data');
    } finally {
      setLoading(false);
    }
  };

  const handleFieldChange = (field, value) => {
    setEditedFields(prev => ({ ...prev, [field]: value }));
    if (fieldErrors[field]) {
      setFieldErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const validatePhone = (phone) => {
    const egyptPhoneRegex = /^(\+201)[0-2,5]{1}[0-9]{8}$/;
    return egyptPhoneRegex.test(phone);
  };

  const handleSave = async () => {
    if (Object.keys(editedFields).length === 0) {
      setIsEditMode(false);
      return;
    }
    
    setIsSaving(true);
    setFieldErrors({});
    
    try {
      // 1. Update Name if changed
      if (editedFields.fullName !== undefined && editedFields.fullName !== profile.fullName) {
        await profileApi.updateName(editedFields.fullName);
      }

      // 2. Update Email if changed
      if (editedFields.email !== undefined && editedFields.email !== profile.email) {
        await profileApi.updateEmail(editedFields.email);
      }

      // 3. Update Location/Phone if changed
      const locationFields = ['address', 'city', 'stateProvince', 'zipCode', 'country', 'timeZone', 'phoneNumber'];
      const hasLocationChanges = locationFields.some(field => editedFields[field] !== undefined && editedFields[field] !== profile[field]);
      
      if (hasLocationChanges) {
        // Validate Phone Number if present
        const phoneToValidate = editedFields.phoneNumber !== undefined ? editedFields.phoneNumber : profile.phoneNumber;
        if (phoneToValidate && !validatePhone(phoneToValidate)) {
          setFieldErrors(prev => ({ ...prev, phoneNumber: 'Invalid Egyptian phone number. Must start with +201...' }));
          setIsSaving(false);
          return;
        }

        const locationDto = {
          address: editedFields.address !== undefined ? editedFields.address : profile.address || '',
          city: editedFields.city !== undefined ? editedFields.city : profile.city || '',
          stateProvince: editedFields.stateProvince !== undefined ? editedFields.stateProvince : profile.stateProvince || '',
          zipCode: editedFields.zipCode !== undefined ? editedFields.zipCode : profile.zipCode || '',
          country: editedFields.country !== undefined ? editedFields.country : profile.country || '',
          timeZone: editedFields.timeZone !== undefined ? editedFields.timeZone : profile.timeZone || '',
          phoneNumber: editedFields.phoneNumber !== undefined ? editedFields.phoneNumber : profile.phoneNumber || ''
        };
        await profileApi.updateLocation(locationDto);
      }

      // 4. Update Title if changed
      if (editedFields.title !== undefined && editedFields.title !== profile.title) {
        await profileApi.updateTitle(editedFields.title);
      }

      // 5. Update Bio if changed
      if (editedFields.bio !== undefined && editedFields.bio !== profile.bio) {
        await profileApi.updateBio(editedFields.bio);
      }

      // 6. Update Experience Level if changed
      if (editedFields.experienceLevel !== undefined && editedFields.experienceLevel !== profile.experienceLevel) {
        await profileApi.updateExperienceLevel(parseInt(editedFields.experienceLevel, 10));
      }

      // Success: update local state and show toast
      setProfile(prev => ({ ...prev, ...editedFields }));
      setIsEditMode(false);
      setEditedFields({});
      toast.success('Profile updated successfully');
    } catch (err) {
      if (err.status === 400 && err.errors) {
        // Display errors inline
        const errors = {};
        Object.keys(err.errors).forEach(key => {
          const camelKey = key.charAt(0).toLowerCase() + key.slice(1);
          errors[camelKey] = err.errors[key][0];
        });
        setFieldErrors(errors);
      } else {
        toast.error(err.title || 'An unexpected error occurred while saving.');
      }
    } finally {
      setIsSaving(false);
    }
  };

  const toggleEditMode = () => {
    if (isEditMode) {
      setIsEditMode(false);
      setEditedFields({});
      setFieldErrors({});
      setSkillError('');
    } else {
      setIsEditMode(true);
      if (allSkills.length === 0) {
        fetchAllSkills();
      }
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

  const validatePortfolioFiles = (files, type, maxCount, maxSizeMB) => {
    const errors = [];
    if (files.length > maxCount) {
      errors.push(`Maximum ${maxCount} ${type} allowed`);
    }
    Array.from(files).forEach(file => {
      if (file.size > maxSizeMB * 1024 * 1024) {
        errors.push(`${file.name} is too large (max ${maxSizeMB}MB)`);
      }
      if (type === 'videos' && !file.type.includes('video/mp4')) {
        errors.push(`${file.name} must be .mp4`);
      }
      if ((type === 'images' || type === 'thumbnail') && !file.type.match(/image\/(jpeg|png)/)) {
        errors.push(`${file.name} must be .jpg or .png`);
      }
    });
    return errors;
  };

  const handlePortfolioFileChange = (e, type) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    let maxCount = 10;
    let maxSizeMB = 5;
    if (type === 'thumbnail') maxCount = 1;
    if (type === 'videos') {
      maxCount = 2;
      maxSizeMB = 50;
    }

    const errors = validatePortfolioFiles(files, type, maxCount, maxSizeMB);
    if (errors.length > 0) {
      setPortfolioErrors(prev => ({ ...prev, [type]: errors[0] }));
      return;
    }

    setPortfolioErrors(prev => {
      const next = { ...prev };
      delete next[type];
      return next;
    });

    if (type === 'thumbnail') {
      setPortfolioFormData(prev => ({ ...prev, thumbnail: files[0] }));
    } else if (type === 'images') {
      setPortfolioFormData(prev => ({ ...prev, images: Array.from(files) }));
    } else if (type === 'videos') {
      setPortfolioFormData(prev => ({ ...prev, videos: Array.from(files) }));
    }
  };

  const resetPortfolioForm = () => {
    setPortfolioFormData({ title: '', description: '', role: '', visitLink: '', thumbnail: null, images: [], videos: [] });
    setPortfolioErrors({});
  };

  const openAddPortfolioModal = () => {
    resetPortfolioForm();
    setIsAddingProject(true);
    setIsEditModalOpen(true);
  };

  const openEditPortfolioModal = (project) => {
    setPortfolioFormData({
      title: project.title || '',
      description: project.description || '',
      role: project.role || '',
      visitLink: project.visitLink || '',
      thumbnail: null,
      images: [],
      videos: []
    });
    setSelectedProject(project);
    setIsAddingProject(false);
    setIsEditModalOpen(true);
  };

  const handleSavePortfolio = async (e) => {
    e.preventDefault();
    if (!portfolioFormData.title || !portfolioFormData.description) {
      setPortfolioErrors(prev => ({ ...prev, title: 'Title and description are required' }));
      return;
    }
    if (isAddingProject && !portfolioFormData.thumbnail) {
      setPortfolioErrors(prev => ({ ...prev, thumbnail: 'Thumbnail is required' }));
      return;
    }

    const formData = new FormData();
    formData.append('title', portfolioFormData.title);
    formData.append('description', portfolioFormData.description);
    if (portfolioFormData.role) formData.append('role', portfolioFormData.role);
    if (portfolioFormData.visitLink) formData.append('visitLink', portfolioFormData.visitLink);
    if (portfolioFormData.thumbnail) formData.append('thumbnail', portfolioFormData.thumbnail);
    
    portfolioFormData.images.forEach(img => formData.append('images', img));
    portfolioFormData.videos.forEach(vid => formData.append('videos', vid));

    try {
      setIsSaving(true);
      if (isAddingProject) {
        const response = await portfolioApi.addPortfolio(formData);
        const newItem = response.data.data || response.data.value || response.data;
        setPortfolio(prev => [...prev, newItem]);
        toast.success('Project added successfully');
      } else {
        const response = await portfolioApi.updatePortfolio(selectedProject.id, formData);
        const updatedItem = response.data.data || response.data.value || response.data;
        setPortfolio(prev => prev.map(item => item.id === selectedProject.id ? updatedItem : item));
        toast.success('Project updated successfully');
      }
      setIsEditModalOpen(false);
    } catch (err) {
      if (err.status === 400 && err.errors) {
        const errors = {};
        Object.keys(err.errors).forEach(key => {
          const camelKey = key.charAt(0).toLowerCase() + key.slice(1);
          errors[camelKey] = err.errors[key][0];
        });
        setPortfolioErrors(errors);
      } else {
        toast.error('Failed to save project');
      }
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeletePortfolio = async (id) => {
    if (!window.confirm('Are you sure you want to delete this project?')) return;
    try {
      await portfolioApi.deletePortfolio(id);
      setPortfolio(prev => prev.filter(item => item.id !== id));
      toast.success('Project deleted');
    } catch (err) {
      toast.error('Failed to delete project');
    }
  };

  const openViewPortfolioModal = (project) => {
    setSelectedProject(project);
    setIsViewModalOpen(true);
  };

  const handleSeePublicView = () => {
    if (profile?.userIdHash) {
      navigate(`/profile/${profile.userIdHash}/public`);
    }
  };

  const handleShare = async () => {
    if (!profile?.id) return;
    const url = `${window.location.origin}/profile/${profile.id}`;
    
    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(url);
        toast.success('Profile link copied to clipboard');
      } else {
        const textArea = document.createElement("textarea");
        textArea.value = url;
        document.body.appendChild(textArea);
        textArea.select();
        try {
          document.execCommand('copy');
          toast.success('Profile link copied to clipboard');
        } catch (err) {
          throw new Error('execCommand failed');
        }
        document.body.removeChild(textArea);
      }
    } catch (err) {
      toast.error('Could not copy link. Please copy it manually.');
      setShowCopyFallback(true);
    }
  };

  const renderAvatar = () => {
    if (profile.avatarUrl) {
      return <img src={profile.avatarUrl} alt={profile.fullName} className="avatar-img" />;
    }
    const initials = profile.fullName
      ? profile.fullName.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2)
      : '';
    return (
      <div className="w-full h-full flex items-center justify-center bg-[#C5A065] text-white font-bold text-3xl">
        {initials || <User size={40} />}
      </div>
    );
  };

  const renderStars = (rating) => {
    const stars = [];
    const numRating = Number(rating) || 0;
    for (let i = 1; i <= 5; i++) {
      if (i <= numRating) {
        stars.push(<Star key={i} size={14} className="text-[#C5A065] fill-[#C5A065]" />);
      } else if (i - 0.5 <= numRating) {
        stars.push(<Star key={i} size={14} className="text-[#C5A065] fill-[#C5A065] opacity-50" />);
      } else {
        stars.push(<Star key={i} size={14} className="text-gray-300" />);
      }
    }
    return <div className="flex gap-1 items-center">{stars} <span className="text-sm font-semibold ml-1">{numRating.toFixed(1)}</span></div>;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-[#C5A065]" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="container max-w-[1100px] mx-auto py-12 px-4 text-center">
        <div className="bg-red-50 text-red-600 p-4 rounded-lg inline-block">
          <p className="font-semibold">Error Loading Profile</p>
          <p className="text-sm">{error}</p>
          <button onClick={fetchProfile} className="mt-4 px-4 py-2 bg-red-100 hover:bg-red-200 rounded text-red-700 text-sm font-medium transition-colors">
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (!profile) return null;

  const currentFullName = editedFields.fullName !== undefined ? editedFields.fullName : (profile.fullName || '');
  const currentEmail = editedFields.email !== undefined ? editedFields.email : (profile.email || '');

  const currentBio = editedFields.bio !== undefined ? editedFields.bio : (profile.bio || '');
  const currentTitle = editedFields.title !== undefined ? editedFields.title : (profile.title || '');
  const currentExperienceLevel = editedFields.experienceLevel !== undefined ? editedFields.experienceLevel : (profile.experienceLevel !== undefined ? profile.experienceLevel : 0);
  const currentAddress = editedFields.address !== undefined ? editedFields.address : (profile.address || '');
  const currentPhoneNumber = editedFields.phoneNumber !== undefined ? editedFields.phoneNumber : (profile.phoneNumber || '');
  
  const displayLocation = profile.address || (profile.city ? `${profile.city}, ${profile.country}` : 'No location set');
  const hasChanges = Object.keys(editedFields).length > 0;

  return (
    <div className="profile-container">
      {/* Profile Header */}
      <header className="profile-header">
        <div className="header-left">
          <div className="avatar-container overflow-hidden rounded-full">
            {renderAvatar()}
          </div>
          <div className="user-info">
            {isEditMode ? (
              <div className="space-y-2 mt-2">
                <div>
                  <input 
                    type="text" 
                    value={currentFullName}
                    onChange={(e) => handleFieldChange('fullName', e.target.value)}
                    className="p-2 border border-gray-300 rounded text-xl font-bold w-full outline-none focus:border-[#C5A065]"
                    placeholder="Full Name"
                  />
                  {fieldErrors.fullName && <p className="text-red-500 text-xs mt-1">{fieldErrors.fullName}</p>}
                </div>
                <div>
                  <input 
                    type="email" 
                    value={currentEmail}
                    onChange={(e) => handleFieldChange('email', e.target.value)}
                    className="p-1 border border-gray-300 rounded text-sm w-full outline-none focus:border-[#C5A065]"
                    placeholder="Email"
                  />
                  {fieldErrors.email && <p className="text-red-500 text-xs mt-1">{fieldErrors.email}</p>}
                </div>
              </div>
            ) : (
              <>
                <h1>{profile.fullName}</h1>
                <p className="text-lg font-semibold text-gray-700">{profile.title}</p>
                <p className="text-sm text-gray-500">{profile.email}</p>
              </>
            )}

            {isEditMode && (
              <div className="mt-2">
                <input 
                  type="text" 
                  value={currentTitle}
                  onChange={(e) => handleFieldChange('title', e.target.value)}
                  className="p-2 border border-gray-300 rounded text-lg font-semibold w-full outline-none focus:border-[#C5A065]"
                  placeholder="Professional Title"
                />
                {fieldErrors.title && <p className="text-red-500 text-xs mt-1">{fieldErrors.title}</p>}
              </div>
            )}
            
            {isEditMode ? (
              <div className="mt-2 space-y-2">
                <div>
                  <div className="flex items-center gap-1 p-1 border border-gray-300 rounded bg-white">
                    <MapPin size={14} className="text-gray-400" />
                    <input 
                      type="text" 
                      value={currentAddress}
                      onChange={(e) => handleFieldChange('address', e.target.value)}
                      className="text-sm w-full outline-none"
                      placeholder="Address"
                    />
                  </div>
                  {fieldErrors.address && <p className="text-red-500 text-xs mt-1">{fieldErrors.address}</p>}
                </div>
                <div>
                  <input 
                    type="text" 
                    value={currentPhoneNumber}
                    onChange={(e) => handleFieldChange('phoneNumber', e.target.value)}
                    className="p-1 border border-gray-300 rounded text-sm w-full outline-none focus:border-[#C5A065]"
                    placeholder="Phone (e.g. +201...)"
                  />
                  {fieldErrors.phoneNumber && <p className="text-red-500 text-xs mt-1">{fieldErrors.phoneNumber}</p>}
                </div>
              </div>
            ) : (
              <div className="mt-1 space-y-1">
                <p className="location flex items-center gap-1 text-gray-600"><MapPin size={14} /> {displayLocation}</p>
                {profile.phoneNumber && <p className="text-xs text-gray-500">{profile.phoneNumber}</p>}
              </div>
            )}
            
            <div className="mt-2 flex items-center gap-2">
              {renderStars(profile.trustScore)}
              {profile.isVerified && <span className="bg-blue-100 text-blue-700 text-[10px] px-1.5 py-0.5 rounded font-bold uppercase tracking-wider">Verified</span>}
            </div>
          </div>
        </div>

        <div className="header-right flex gap-3 items-center">
          {isEditMode ? (
            <>
              <button 
                onClick={toggleEditMode} 
                className="px-4 py-2 text-sm font-medium text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                disabled={isSaving}
              >
                Cancel
              </button>
              <button 
                onClick={handleSave} 
                disabled={!hasChanges || isSaving}
                className="px-4 py-2 text-sm font-medium text-white bg-[#C5A065] hover:bg-[#b8962d] rounded-lg transition-colors disabled:opacity-50 flex items-center gap-2"
              >
                {isSaving && <Loader2 size={14} className="animate-spin" />}
                Save Changes
              </button>
            </>
          ) : (
            <>
              <button 
                onClick={handleSeePublicView} 
                className="btn btn-primary px-4 py-2 text-sm font-medium"
                disabled={loading || !profile?.userIdHash}
              >
                See public view
              </button>
              <button 
                onClick={toggleEditMode} 
                className="btn btn-outline flex items-center gap-2 px-4 py-2 text-sm font-medium"
              >
                <Edit2 size={16} /> Edit Profile
              </button>
              <button 
                onClick={handleShare} 
                className="btn-icon flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <Share2 size={18} /> Share
              </button>
            </>
          )}
        </div>
      </header>

      {showCopyFallback && (
        <div className="container max-w-[1100px] mx-auto px-4 mt-4">
          <div className="bg-yellow-50 border border-yellow-100 p-3 rounded-lg flex items-center justify-between text-sm">
            <span className="text-yellow-800 font-medium">Profile Link: {window.location.origin}/profile/{profile.id}</span>
            <button onClick={() => setShowCopyFallback(false)} className="text-yellow-600 font-bold px-2">✕</button>
          </div>
        </div>
      )}

      <div className="profile-layout">
        {/* Sidebar */}
        <aside className="sidebar">
          <section className="p-card section-availability">
            <div className="section-header">
              <h2>Availability</h2>
            </div>
            <p className="status">
              <span className="status-dot"></span> 
              Available
            </p>
          </section>

          <section className="p-card section-linked">
            <div className="section-header">
              <h2>Linked Accounts</h2>
            </div>
            <div className="linked-item">
              <Globe size={20} className="social-icon" />
              <div className="linked-text">
                <p className="text-bold">Website</p>
              </div>
            </div>
          </section>
          
          {profile.experienceLevel !== undefined && (
            <section className="p-card">
              <div className="section-header">
                <h2>Experience</h2>
              </div>
              {isEditMode ? (
                <div className="mt-2">
                  <select 
                    value={currentExperienceLevel}
                    onChange={(e) => handleFieldChange('experienceLevel', e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded text-sm outline-none focus:border-[#C5A065] bg-white cursor-pointer"
                  >
                    <option value={0}>Beginner</option>
                    <option value={1}>Intermediate</option>
                    <option value={2}>Advanced</option>
                    <option value={3}>Expert</option>
                  </select>
                </div>
              ) : (
                <p className="text-sm font-medium text-gray-700">
                  {profile.experienceLevel === 0 ? 'Beginner' : 
                   profile.experienceLevel === 1 ? 'Intermediate' : 
                   profile.experienceLevel === 2 ? 'Advanced' : 'Expert'}
                </p>
              )}
            </section>
          )}
        </aside>

        {/* Main Content */}
        <main className="main-content">


          <section className="p-card section-summary">
            <div className="section-header mb-4">
              <h2>Professional Summary</h2>
            </div>
            {isEditMode ? (
              <div className="w-full">
                <textarea 
                  value={currentBio}
                  onChange={(e) => handleFieldChange('bio', e.target.value)}
                  rows={6}
                  className="w-full p-3 border border-gray-300 rounded-lg outline-none focus:border-[#C5A065] resize-y"
                  placeholder="Tell clients about your experience and goals..."
                />
                {fieldErrors.bio && <p className="text-red-500 text-xs mt-1">{fieldErrors.bio}</p>}
              </div>
            ) : (
              <p className="summary-text whitespace-pre-wrap">
                {profile.bio || 'Add a professional summary to tell clients about your experience and goals.'}
              </p>
            )}
          </section>

          <section className="p-card section-skills">
            <div className="section-header mb-4">
              <h2>Skills</h2>
            </div>
            
            {isEditMode && (
              <div className="mb-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
                <h3 className="text-sm font-semibold mb-3">Add New Skill</h3>
                <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
                  <div className="md:col-span-5 relative">
                    <input 
                      type="text" 
                      placeholder="Search skills..." 
                      className="w-full p-2 text-sm border border-gray-300 rounded focus:border-[#C5A065] outline-none"
                      value={skillSearch}
                      onChange={(e) => setSkillSearch(e.target.value)}
                    />
                    {skillSearch && (
                      <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded shadow-lg max-h-48 overflow-y-auto">
                        {allSkills
                          .filter(s => s.name.toLowerCase().includes(skillSearch.toLowerCase()))
                          .map(skill => (
                            <div 
                              key={skill.id} 
                              className="p-2 hover:bg-gray-100 cursor-pointer text-sm"
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
                  <div className="md:col-span-4">
                    <select 
                      className="w-full p-2 text-sm border border-gray-300 rounded focus:border-[#C5A065] outline-none bg-white"
                      value={selectedProficiency}
                      onChange={(e) => setSelectedProficiency(e.target.value)}
                    >
                      <option value={0}>Beginner</option>
                      <option value={1}>Intermediate</option>
                      <option value={2}>Advanced</option>
                      <option value={3}>Expert</option>
                    </select>
                  </div>
                  <div className="md:col-span-3">
                    <button 
                      onClick={handleAddSkill}
                      className="w-full p-2 bg-[#C5A065] text-white text-sm font-medium rounded hover:bg-[#b8962d] transition-colors"
                    >
                      Add Skill
                    </button>
                  </div>
                </div>
                {skillError && <p className="text-red-500 text-xs mt-2">{skillError}</p>}
              </div>
            )}

            <div className="flex flex-wrap gap-2">
              {mySkills && mySkills.length > 0 ? (
                mySkills.map((skill) => (
                  <div 
                    key={skill.skillId} 
                    className="px-3 py-1.5 bg-gray-100 text-gray-800 text-sm font-medium rounded-full border border-gray-200 flex items-center gap-2"
                  >
                    <span>{skill.skillName} • {getProficiencyLabel(skill.proficiencyLevel)}</span>
                    {isEditMode && (
                      <X 
                        size={14} 
                        className="cursor-pointer text-gray-400 hover:text-red-500" 
                        onClick={() => handleRemoveSkill(skill.skillId)}
                      />
                    )}
                  </div>
                ))
              ) : (
                <p className="subtext italic">No skills listed.</p>
              )}
            </div>
          </section>

          <section className="p-card section-portfolio">
            <div className="section-header mb-4 flex justify-between items-center">
              <h2>Portfolio</h2>
              {isEditMode && (
                <button 
                  onClick={openAddPortfolioModal}
                  className="flex items-center gap-2 px-3 py-1.5 bg-[#C5A065] text-white text-xs font-bold rounded-lg hover:bg-[#b8962d] transition-colors"
                >
                  <Plus size={14} /> Add Project
                </button>
              )}
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {isPortfolioLoading ? (
                Array(4).fill(0).map((_, i) => <PortfolioSkeleton key={i} />)
              ) : portfolio && portfolio.length > 0 ? (
                portfolio.map((item) => (
                  <div key={item.id} className="border border-gray-100 rounded-xl overflow-hidden group hover:shadow-lg transition-all bg-white relative">
                    <div className="h-40 bg-gray-50 relative overflow-hidden">
                      {item.thumbnailUrl ? (
                        <img src={item.thumbnailUrl} alt={item.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-300">
                          <Folder size={32} />
                        </div>
                      )}
                      
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                        {isEditMode ? (
                          <>
                            <button 
                              onClick={() => openEditPortfolioModal(item)}
                              className="p-2 bg-white rounded-full text-blue-600 hover:bg-blue-50 transition-colors"
                            >
                              <Edit2 size={18} />
                            </button>
                            <button 
                              onClick={() => handleDeletePortfolio(item.id)}
                              className="p-2 bg-white rounded-full text-red-600 hover:bg-red-50 transition-colors"
                            >
                              <Trash2 size={18} />
                            </button>
                          </>
                        ) : (
                          <button 
                            onClick={() => openViewPortfolioModal(item)}
                            className="px-4 py-2 bg-white text-gray-900 text-sm font-bold rounded-lg flex items-center gap-2 hover:bg-gray-100 transition-colors"
                          >
                            <Eye size={16} /> View Details
                          </button>
                        )}
                      </div>
                    </div>
                    <div className="p-4">
                      <h3 className="font-bold text-gray-900 truncate">{item.title}</h3>
                      <p className="text-sm text-gray-500 mt-1 line-clamp-2">{item.description}</p>
                    </div>
                  </div>
                ))
              ) : (
                <p className="subtext italic col-span-2 text-center py-8">No portfolio items added yet.</p>
              )}
            </div>
          </section>

        </main>
      </div>

      {/* View Modal */}
      {isViewModalOpen && selectedProject && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setIsViewModalOpen(false)} />
          <div className="relative bg-white w-full max-w-4xl max-h-[90vh] rounded-2xl overflow-hidden flex flex-col shadow-2xl animate-in fade-in zoom-in duration-200">
            <button 
              onClick={() => setIsViewModalOpen(false)}
              className="absolute top-4 right-4 z-10 p-2 bg-white/10 hover:bg-white/20 text-white rounded-full transition-colors"
            >
              <X size={24} />
            </button>
            
            <div className="overflow-y-auto">
              <div className="h-64 md:h-80 relative bg-gray-900">
                {selectedProject.thumbnailUrl && (
                  <img src={selectedProject.thumbnailUrl} alt={selectedProject.title} className="w-full h-full object-contain" />
                )}
                <div className="absolute bottom-0 left-0 right-0 p-8 bg-gradient-to-t from-black/80 to-transparent text-white">
                  <h2 className="text-3xl font-bold">{selectedProject.title}</h2>
                  {selectedProject.role && <p className="text-gray-300 mt-1">{selectedProject.role}</p>}
                </div>
              </div>
              
              <div className="p-8 space-y-8">
                <div>
                  <h3 className="text-sm font-bold text-[#C5A065] uppercase tracking-wider mb-2">Project Description</h3>
                  <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">{selectedProject.description}</p>
                </div>
                
                {selectedProject.visitLink && (
                  <div>
                    <h3 className="text-sm font-bold text-[#C5A065] uppercase tracking-wider mb-2">Project Link</h3>
                    <a 
                      href={selectedProject.visitLink} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline flex items-center gap-1"
                    >
                      {selectedProject.visitLink} <ExternalLink size={14} />
                    </a>
                  </div>
                )}
                
                {selectedProject.media && selectedProject.media.length > 0 && (
                  <div>
                    <h3 className="text-sm font-bold text-[#C5A065] uppercase tracking-wider mb-4">Media Gallery</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {selectedProject.media.map((file) => (
                        <div key={file.id} className="rounded-xl overflow-hidden bg-gray-100 border border-gray-200">
                          {file.fileType.includes('video') ? (
                            <video controls className="w-full h-full">
                              <source src={file.fileUrl} type="video/mp4" />
                              Your browser does not support the video tag.
                            </video>
                          ) : (
                            <img src={file.fileUrl} alt="Media" className="w-full h-full object-cover" />
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add/Edit Modal */}
      {isEditModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setIsEditModalOpen(false)} />
          <form 
            onSubmit={handleSavePortfolio}
            className="relative bg-white w-full max-w-2xl max-h-[90vh] rounded-2xl overflow-hidden flex flex-col shadow-2xl"
          >
            <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
              <h2 className="text-xl font-bold text-gray-900">{isAddingProject ? 'Add New Project' : 'Edit Project'}</h2>
              <button disabled={isSaving} type="button" onClick={() => setIsEditModalOpen(false)} className="text-gray-400 hover:text-gray-600 p-1">
                <X size={24} />
              </button>
            </div>
            
            <div className="overflow-y-auto p-6 space-y-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-bold text-gray-700">Project Title *</label>
                  <input 
                    type="text" 
                    className={`w-full p-2.5 border rounded-lg focus:border-[#C5A065] outline-none transition-all ${portfolioErrors.title ? 'border-red-500' : 'border-gray-300'}`}
                    value={portfolioFormData.title}
                    onChange={(e) => setPortfolioFormData(prev => ({ ...prev, title: e.target.value }))}
                    placeholder="e.g. E-commerce Mobile App"
                  />
                  {portfolioErrors.title && <p className="text-red-500 text-xs">{portfolioErrors.title}</p>}
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-gray-700">Role</label>
                    <input 
                      type="text" 
                      className="w-full p-2.5 border border-gray-300 rounded-lg focus:border-[#C5A065] outline-none transition-all"
                      value={portfolioFormData.role}
                      onChange={(e) => setPortfolioFormData(prev => ({ ...prev, role: e.target.value }))}
                      placeholder="e.g. UI/UX Designer"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-gray-700">Project Link</label>
                    <input 
                      type="url" 
                      className="w-full p-2.5 border border-gray-300 rounded-lg focus:border-[#C5A065] outline-none transition-all"
                      value={portfolioFormData.visitLink}
                      onChange={(e) => setPortfolioFormData(prev => ({ ...prev, visitLink: e.target.value }))}
                      placeholder="https://..."
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-bold text-gray-700">Description *</label>
                  <textarea 
                    rows={4}
                    className={`w-full p-2.5 border rounded-lg focus:border-[#C5A065] outline-none transition-all resize-none ${portfolioErrors.description ? 'border-red-500' : 'border-gray-300'}`}
                    value={portfolioFormData.description}
                    onChange={(e) => setPortfolioFormData(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Explain what you did and the results achieved..."
                  />
                  {portfolioErrors.description && <p className="text-red-500 text-xs">{portfolioErrors.description}</p>}
                </div>
              </div>
              
              <div className="space-y-4 border-t border-gray-100 pt-6">
                <h3 className="text-sm font-bold text-gray-900 border-l-4 border-[#C5A065] pl-3">Media Uploads</h3>
                
                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-gray-500 uppercase">Cover Thumbnail * (JPG/PNG)</label>
                    <div className="flex items-center gap-4">
                      <label className="flex-1 cursor-pointer">
                        <div className={`p-4 border-2 border-dashed rounded-xl flex flex-col items-center gap-2 hover:border-[#C5A065] hover:bg-yellow-50/30 transition-all ${portfolioErrors.thumbnail ? 'border-red-200' : 'border-gray-200'}`}>
                          <div className="p-2 bg-yellow-50 rounded-lg text-[#C5A065]">
                            <ImageIcon size={20} />
                          </div>
                          <span className="text-xs font-medium text-gray-600">
                            {portfolioFormData.thumbnail ? portfolioFormData.thumbnail.name : 'Select JPG or PNG'}
                          </span>
                          <input type="file" accept="image/jpeg,image/png" className="hidden" onChange={(e) => handlePortfolioFileChange(e, 'thumbnail')} />
                        </div>
                      </label>
                    </div>
                    {portfolioErrors.thumbnail && <p className="text-red-500 text-xs">{portfolioErrors.thumbnail}</p>}
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-gray-500 uppercase">Gallery Images (Max 10)</label>
                      <label className="block cursor-pointer">
                        <div className="p-4 border-2 border-dashed border-gray-200 rounded-xl flex flex-col items-center gap-2 hover:border-[#C5A065] transition-all">
                          <Plus size={20} className="text-gray-400" />
                          <span className="text-xs font-medium text-gray-600">
                            {portfolioFormData.images.length > 0 ? `${portfolioFormData.images.length} files selected` : 'Add Images'}
                          </span>
                          <input type="file" multiple accept="image/jpeg,image/png" className="hidden" onChange={(e) => handlePortfolioFileChange(e, 'images')} />
                        </div>
                      </label>
                      {portfolioErrors.images && <p className="text-red-500 text-xs">{portfolioErrors.images}</p>}
                    </div>
                    
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-gray-500 uppercase">Videos (Max 2, MP4)</label>
                      <label className="block cursor-pointer">
                        <div className="p-4 border-2 border-dashed border-gray-200 rounded-xl flex flex-col items-center gap-2 hover:border-[#C5A065] transition-all">
                          <Video size={20} className="text-gray-400" />
                          <span className="text-xs font-medium text-gray-600">
                            {portfolioFormData.videos.length > 0 ? `${portfolioFormData.videos.length} videos selected` : 'Add Videos'}
                          </span>
                          <input type="file" multiple accept="video/mp4" className="hidden" onChange={(e) => handlePortfolioFileChange(e, 'videos')} />
                        </div>
                      </label>
                      {portfolioErrors.videos && <p className="text-red-500 text-xs">{portfolioErrors.videos}</p>}
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="p-6 border-t border-gray-100 flex justify-end gap-3 bg-gray-50/50">
              <button 
                type="button"
                disabled={isSaving}
                onClick={() => setIsEditModalOpen(false)}
                className="px-6 py-2 text-sm font-bold text-gray-600 hover:bg-gray-200 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button 
                type="submit"
                disabled={isSaving}
                className="px-8 py-2 text-sm font-bold text-white bg-[#C5A065] hover:bg-[#b8962d] rounded-lg transition-colors disabled:opacity-50 flex items-center gap-2"
              >
                {isSaving && <Loader2 size={16} className="animate-spin" />}
                {isAddingProject ? 'Add Project' : 'Save Changes'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default MyProfilePage;
