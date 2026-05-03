import React, { useState, useEffect } from 'react';
import { 
  User, 
  MapPin, 
  Share2, 
  Edit2, 
  Plus, 
  Trash2, 
  Linkedin, 
  Github, 
  Search,
  Star,
  ExternalLink,
  ChevronRight,
  Loader2
} from 'lucide-react';
import { profileApi } from '../../api/profile';
import { toast } from 'react-hot-toast';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Card } from '../../components/ui/card';

const MyProfilePage = () => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editedFields, setEditedFields] = useState({});

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const response = await profileApi.getProfile();
      setProfile(response.data);
      setEditedFields({});
    } catch (error) {
      console.error('Error fetching profile:', error);
      toast.error('Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleEditMode = () => {
    if (isEditMode) {
      // Cancelling edit
      setEditedFields({});
    }
    setIsEditMode(!isEditMode);
  };

  const handleFieldChange = (field, value) => {
    setProfile(prev => ({ ...prev, [field]: value }));
    setEditedFields(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    if (Object.keys(editedFields).length === 0) {
      setIsEditMode(false);
      return;
    }

    try {
      await profileApi.updateProfile(editedFields);
      toast.success('Profile updated successfully');
      setIsEditMode(false);
      setEditedFields({});
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error('Failed to update profile');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-[#d4af37]" />
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="text-center py-20">
        <p className="text-gray-500">Profile not found.</p>
      </div>
    );
  }

  return (
    <div className="container max-w-[1100px] mx-auto pt-8 pb-16 px-4">
      {/* Profile Header */}
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-8">
        <div className="flex items-center gap-6">
          <div className="w-24 h-24 rounded-full bg-gray-100 flex items-center justify-center text-gray-400 border-2 border-gray-200">
            {profile.avatarUrl ? (
              <img src={profile.avatarUrl} alt={profile.name} className="w-full h-full rounded-full object-cover" />
            ) : (
              <User size={40} />
            )}
          </div>
          <div className="flex flex-col gap-1">
            {isEditMode ? (
              <Input 
                className="text-2xl font-bold h-auto py-1 px-2 border-primary-500"
                value={profile.name} 
                onChange={(e) => handleFieldChange('name', e.target.value)}
              />
            ) : (
              <h1 className="text-3xl font-bold text-gray-900">{profile.name}</h1>
            )}
            <div className="flex items-center text-gray-500 gap-1 mt-1">
              <MapPin size={16} />
              {isEditMode ? (
                <Input 
                  className="h-7 py-0.5 px-2 w-48"
                  value={profile.location} 
                  onChange={(e) => handleFieldChange('location', e.target.value)}
                />
              ) : (
                <span>{profile.location}</span>
              )}
            </div>
            {profile.rating > 0 && (
              <div className="flex items-center gap-1 mt-1 text-yellow-500">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} size={14} fill={i < Math.round(profile.rating) ? "currentColor" : "none"} />
                ))}
                <span className="text-sm font-medium ml-1">({profile.rating})</span>
              </div>
            )}
          </div>
        </div>
        <div className="flex items-center gap-3">
          {isEditMode ? (
            <>
              <Button variant="outline" onClick={handleToggleEditMode}>Cancel</Button>
              <Button className="bg-[#d4af37] hover:bg-[#b8962d] text-white" onClick={handleSave}>Save Changes</Button>
            </>
          ) : (
            <>
              <Button variant="primary" className="bg-[#d4af37] hover:bg-[#b8962d] text-white">See public view</Button>
              <Button variant="outline" onClick={handleToggleEditMode}>Edit Profile</Button>
              <Button variant="ghost" className="p-2 h-auto text-gray-500"><Share2 size={20} className="mr-2" /> Share</Button>
            </>
          )}
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-[300px_1fr] gap-8">
        {/* Sidebar */}
        <aside className="space-y-6">
          <Card className="p-6 border-gray-200 shadow-sm">
            <div className="flex justify-between items-center mb-4 text-[#d4af37]">
              <h2 className="text-lg font-bold">Availability</h2>
              {!isEditMode && <button className="text-gray-400 hover:text-gray-600" onClick={handleToggleEditMode}><Edit2 size={16} /></button>}
            </div>
            {isEditMode ? (
              <select 
                className="w-full p-2 border border-gray-200 rounded-md focus:ring-2 focus:ring-[#d4af37] outline-none"
                value={profile.availability}
                onChange={(e) => handleFieldChange('availability', e.target.value)}
              >
                <option value="Available">Available</option>
                <option value="Not Available">Not Available</option>
                <option value="Busy">Busy</option>
              </select>
            ) : (
              <p className="flex items-center gap-2 font-medium">
                <span className="w-2.5 h-2.5 rounded-full bg-green-500"></span>
                {profile.availability || 'Available'}
              </p>
            )}
          </Card>

          <Card className="p-6 border-gray-200 shadow-sm">
            <div className="flex justify-between items-center mb-4 text-[#d4af37]">
              <h2 className="text-lg font-bold">Connects</h2>
              {!isEditMode && <button className="text-gray-400 hover:text-gray-600" onClick={handleToggleEditMode}><Edit2 size={16} /></button>}
            </div>
            {isEditMode ? (
              <Input 
                type="number"
                value={profile.connects}
                onChange={(e) => handleFieldChange('connects', parseInt(e.target.value) || 0)}
              />
            ) : (
              <p className="font-bold text-lg mb-2">Connects: {profile.connects || 0}</p>
            )}
            {!isEditMode && <a href="#" className="text-sm text-[#d4af37] font-semibold hover:underline">View details</a>}
          </Card>

          <Card className="p-6 border-gray-200 shadow-sm">
            <div className="flex justify-between items-center mb-4 text-[#d4af37]">
              <h2 className="text-lg font-bold">Hours per week</h2>
              {!isEditMode && <button className="text-gray-400 hover:text-gray-600" onClick={handleToggleEditMode}><Edit2 size={16} /></button>}
            </div>
            {isEditMode ? (
              <Input 
                value={profile.hoursPerWeek}
                onChange={(e) => handleFieldChange('hoursPerWeek', e.target.value)}
                placeholder="e.g. More than 30 hrs/week"
              />
            ) : (
              <>
                <p className="font-bold">{profile.hoursPerWeek || 'More than 30 hrs/week'}</p>
                <p className="text-sm text-gray-500">Open to contract to hire</p>
              </>
            )}
          </Card>

          <Card className="p-6 border-gray-200 shadow-sm">
            <div className="flex justify-between items-center mb-4 text-[#d4af37]">
              <h2 className="text-lg font-bold">Languages</h2>
              {!isEditMode && (
                <div className="flex gap-2">
                  <button className="text-gray-400 hover:text-gray-600"><Plus size={16} /></button>
                  <button className="text-gray-400 hover:text-gray-600"><Edit2 size={16} /></button>
                </div>
              )}
            </div>
            <div className="space-y-2">
              <p><span className="font-medium">English:</span> <span className="text-gray-500">Conversational</span></p>
              <p><span className="font-medium">Arabic:</span> <span className="text-gray-500">Native</span></p>
            </div>
          </Card>

          <Card className="p-6 border-gray-200 shadow-sm">
            <h2 className="text-lg font-bold mb-4 text-[#d4af37]">Verifications</h2>
            <div className="space-y-1">
              <p className="font-medium">ID: <span className="text-gray-500">Unverified</span></p>
              <a href="#" className="text-sm text-[#d4af37] font-semibold hover:underline">Verify your identity</a>
            </div>
          </Card>

          <Card className="p-6 border-gray-200 shadow-sm">
            <div className="flex justify-between items-center mb-4 text-[#d4af37]">
              <h2 className="text-lg font-bold">Linked Accounts</h2>
            </div>
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <Linkedin size={20} className="text-blue-600" />
                <div>
                  <p className="text-sm font-bold">{profile.name}</p>
                  {!isEditMode && <a href="#" className="text-xs text-[#d4af37] font-semibold hover:underline">View profile</a>}
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Github size={20} className="text-gray-900" />
                <div>
                  <p className="text-sm font-bold">{profile.name}</p>
                  {!isEditMode && <a href="#" className="text-xs text-[#d4af37] font-semibold hover:underline">View profile</a>}
                </div>
              </div>
            </div>
          </Card>
        </aside>

        {/* Main Content */}
        <main className="space-y-6">
          <section className="bg-white rounded-xl p-8 border border-gray-200 shadow-sm">
            <div className="flex justify-between items-start mb-6">
              <div className="w-full">
                {isEditMode ? (
                  <Input 
                    className="text-2xl font-bold h-auto py-2 px-3 mb-4 w-full border-[#d4af37] focus:ring-[#d4af37]"
                    placeholder="Role Title"
                    value={profile.title} 
                    onChange={(e) => handleFieldChange('title', e.target.value)}
                  />
                ) : (
                  <h2 className="text-3xl font-bold text-gray-900 mb-4">{profile.title || 'No title set'}</h2>
                )}
              </div>
              {!isEditMode && (
                <button className="text-gray-400 hover:text-gray-600 p-1 bg-gray-50 rounded-full hover:bg-gray-100 transition-colors" onClick={handleToggleEditMode}>
                  <Edit2 size={18} />
                </button>
              )}
            </div>
          </section>

          <section className="bg-white rounded-xl p-8 border border-gray-200 shadow-sm">
            <div className="flex justify-between items-start mb-6 text-[#d4af37]">
              <h2 className="text-xl font-bold">Professional Summary</h2>
              {!isEditMode && (
                <button className="text-gray-400 hover:text-gray-600 p-1 bg-gray-50 rounded-full hover:bg-gray-100 transition-colors" onClick={handleToggleEditMode}>
                  <Edit2 size={18} />
                </button>
              )}
            </div>
            {isEditMode ? (
              <textarea 
                className="w-full min-h-[150px] p-4 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#d4af37] outline-none leading-relaxed transition-all"
                value={profile.bio} 
                onChange={(e) => handleFieldChange('bio', e.target.value)}
                placeholder="Describe your professional background..."
              />
            ) : (
              <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                {profile.bio || 'Add a professional summary to tell clients about your experience and goals.'}
              </p>
            )}
          </section>

          <section className="bg-white rounded-xl p-8 border border-gray-200 shadow-sm">
            <div className="flex justify-between items-center mb-6 text-[#d4af37]">
              <h2 className="text-xl font-bold">Portfolio</h2>
              <button className="text-gray-400 hover:text-gray-600 p-1 bg-gray-50 rounded-full hover:bg-gray-100 transition-colors"><Plus size={18} /></button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {profile.portfolioItems?.length > 0 ? (
                profile.portfolioItems.map((item, index) => (
                  <Card key={index} className="overflow-hidden group border-gray-200 hover:shadow-md transition-shadow">
                    <div className="h-40 bg-gray-100 flex items-center justify-center relative">
                      {item.imageUrl ? (
                        <img src={item.imageUrl} alt={item.title} className="w-full h-full object-cover" />
                      ) : (
                        <Search size={32} className="text-gray-300" />
                      )}
                      <div className="absolute top-2 right-2 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button className="bg-white p-1.5 rounded-full shadow-sm text-gray-600 hover:text-gray-900"><Edit2 size={14} /></button>
                        <button className="bg-white p-1.5 rounded-full shadow-sm text-red-500 hover:text-red-700"><Trash2 size={14} /></button>
                      </div>
                    </div>
                    <div className="p-4">
                      <h3 className="font-bold text-gray-900 group-hover:text-[#d4af37] transition-colors">{item.title}</h3>
                      <p className="text-sm text-gray-500 mt-1 line-clamp-2">{item.description}</p>
                    </div>
                  </Card>
                ))
              ) : (
                <div className="col-span-full py-12 text-center bg-gray-50 rounded-xl border-2 border-dashed border-gray-200">
                  <p className="text-gray-500 italic">No portfolio items added yet.</p>
                  <Button variant="ghost" className="mt-2 text-[#d4af37]"><Plus size={16} className="mr-2" /> Add Item</Button>
                </div>
              )}
            </div>
          </section>

          <section className="bg-white rounded-xl p-8 border border-gray-200 shadow-sm">
            <div className="flex justify-between items-center mb-6 text-[#d4af37]">
              <h2 className="text-xl font-bold">Skills</h2>
              {!isEditMode && (
                <button className="text-gray-400 hover:text-gray-600 p-1 bg-gray-50 rounded-full hover:bg-gray-100 transition-colors" onClick={handleToggleEditMode}>
                  <Edit2 size={18} />
                </button>
              )}
            </div>
            {isEditMode ? (
              <Input 
                className="w-full"
                placeholder="Enter skills separated by commas (e.g. React, Node, SQL)"
                value={profile.skills?.join(', ') || ''}
                onChange={(e) => handleFieldChange('skills', e.target.value.split(',').map(s => s.trim()))}
              />
            ) : (
              <div className="flex flex-wrap gap-2">
                {profile.skills?.length > 0 ? (
                  profile.skills.map((skill, index) => (
                    <span key={index} className="px-5 py-2 bg-gray-100 text-gray-700 rounded-full text-sm font-semibold hover:bg-gray-200 transition-colors cursor-default">
                      {skill}
                    </span>
                  ))
                ) : (
                  <p className="text-gray-500 italic">No skills listed.</p>
                )}
              </div>
            )}
          </section>
        </main>
      </div>
    </div>
  );
};

export default MyProfilePage;
