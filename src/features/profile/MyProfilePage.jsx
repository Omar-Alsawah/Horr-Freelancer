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
  ExternalLink
} from 'lucide-react';
import { profileApi } from '../../api/profile';
import { toast } from 'react-hot-toast';
import './MyProfilePage.css';

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

  useEffect(() => {
    fetchProfile();
  }, []);

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
      if (editedFields.fullName !== undefined) {
        await profileApi.updateName(editedFields.fullName);
      }

      // 2. Update Email if changed
      if (editedFields.email !== undefined) {
        await profileApi.updateEmail(editedFields.email);
      }

      // 3. Update Location/Phone if changed
      const locationFields = ['address', 'city', 'stateProvince', 'zipCode', 'country', 'timeZone', 'phoneNumber'];
      const hasLocationChanges = locationFields.some(field => editedFields[field] !== undefined);
      
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
    } else {
      setIsEditMode(true);
    }
  };

  const handleSeePublicView = () => {
    if (profile?.id) {
      navigate(`/profile/${profile.id}/public`);
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
  const currentTitle = editedFields.title !== undefined ? editedFields.title : (profile.title || '');
  const currentBio = editedFields.bio !== undefined ? editedFields.bio : (profile.bio || '');
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
                <p className="text-sm text-gray-500">{profile.email}</p>
              </>
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
                disabled={loading}
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
              <p className="text-sm font-medium text-gray-700">
                {profile.experienceLevel === 0 ? 'Entry Level' : profile.experienceLevel === 1 ? 'Intermediate' : 'Expert'}
              </p>
            </section>
          )}
        </aside>

        {/* Main Content */}
        <main className="main-content">
          <section className="p-card section-title">
            <div className="section-header">
              {isEditMode ? (
                <div className="w-full">
                  <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1 block">Professional Title</label>
                  <input 
                    type="text" 
                    value={currentTitle}
                    onChange={(e) => handleFieldChange('title', e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded-lg text-lg font-bold outline-none focus:border-[#C5A065] focus:ring-1 focus:ring-[#C5A065]"
                    placeholder="e.g. Senior Frontend Developer"
                  />
                  {fieldErrors.title && <p className="text-red-500 text-xs mt-1">{fieldErrors.title}</p>}
                </div>
              ) : (
                <h2 className="role-title">{profile.title || 'No title set'}</h2>
              )}
            </div>
          </section>

          <section className="p-card section-summary">
            <div className="section-header mb-4">
              <h2>Professional Summary</h2>
            </div>
            {isEditMode ? (
              <div className="w-full">
                <textarea 
                  value={currentBio}
                  onChange={(e) => handleFieldChange('bio', e.target.value)}
                  rows={4}
                  className="w-full p-3 border border-gray-300 rounded-lg outline-none focus:border-[#C5A065] focus:ring-1 focus:ring-[#C5A065] resize-none"
                  placeholder="Write a professional summary..."
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
            <div className="flex flex-wrap gap-2">
              {profile.skills && profile.skills.length > 0 ? (
                profile.skills.map((skill, index) => (
                  <span key={index} className="px-3 py-1 bg-gray-100 text-gray-800 text-sm font-medium rounded-full border border-gray-200">
                    {skill}
                  </span>
                ))
              ) : (
                <p className="subtext italic">No skills listed.</p>
              )}
            </div>
          </section>

          <section className="p-card section-portfolio">
            <div className="section-header mb-4">
              <h2>Portfolio</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {profile.portfolioItems && profile.portfolioItems.length > 0 ? (
                profile.portfolioItems.map((item) => (
                  <div key={item.id} className="border border-gray-200 rounded-xl overflow-hidden group hover:shadow-md transition-shadow">
                    <div className="h-40 bg-gray-100 relative overflow-hidden">
                      {item.imageUrl ? (
                        <img src={item.imageUrl} alt={item.title} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-400">
                          <Folder size={32} />
                        </div>
                      )}
                    </div>
                    <div className="p-4 bg-white">
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
    </div>
  );
};


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
                disabled={loading}
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
            <span className="text-yellow-800 font-medium">Profile Link: https://horr.app/profile/{profile.id}</span>
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
        </aside>

        {/* Main Content */}
        <main className="main-content">
          <section className="p-card section-title">
            <div className="section-header">
              {isEditMode ? (
                <div className="w-full">
                  <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1 block">Title</label>
                  <input 
                    type="text" 
                    value={currentTitle}
                    onChange={(e) => handleFieldChange('title', e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded-lg text-lg font-bold outline-none focus:border-[#C5A065] focus:ring-1 focus:ring-[#C5A065]"
                    placeholder="e.g. Senior Frontend Developer"
                  />
                  {fieldErrors.title && <p className="text-red-500 text-xs mt-1">{fieldErrors.title}</p>}
                </div>
              ) : (
                <h2 className="role-title">{profile.title || 'No title set'}</h2>
              )}
            </div>
          </section>

          <section className="p-card section-summary">
            <div className="section-header mb-4">
              <h2>Professional Summary</h2>
            </div>
            {isEditMode ? (
              <div className="w-full">
                <textarea 
                  value={currentBio}
                  onChange={(e) => handleFieldChange('bio', e.target.value)}
                  rows={4}
                  className="w-full p-3 border border-gray-300 rounded-lg outline-none focus:border-[#C5A065] focus:ring-1 focus:ring-[#C5A065] resize-none"
                  placeholder="Write a professional summary..."
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
            <div className="flex flex-wrap gap-2">
              {profile.skills && profile.skills.length > 0 ? (
                profile.skills.map((skill, index) => (
                  <span key={index} className="px-3 py-1 bg-gray-100 text-gray-800 text-sm font-medium rounded-full border border-gray-200">
                    {skill}
                  </span>
                ))
              ) : (
                <p className="subtext italic">No skills listed.</p>
              )}
            </div>
          </section>

          <section className="p-card section-portfolio">
            <div className="section-header mb-4">
              <h2>Portfolio</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {profile.portfolioItems && profile.portfolioItems.length > 0 ? (
                profile.portfolioItems.map((item) => (
                  <div key={item.id} className="border border-gray-200 rounded-xl overflow-hidden group hover:shadow-md transition-shadow">
                    <div className="h-40 bg-gray-100 relative overflow-hidden">
                      {item.imageUrl ? (
                        <img src={item.imageUrl} alt={item.title} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-400">
                          <Folder size={32} />
                        </div>
                      )}
                    </div>
                    <div className="p-4 bg-white">
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
    </div>
  );
};

export default MyProfilePage;
