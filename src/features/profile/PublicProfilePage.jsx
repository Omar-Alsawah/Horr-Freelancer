import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { 
  Loader2, 
  MapPin, 
  CheckCircle, 
  Star, 
  Folder, 
  ExternalLink, 
  X,
  Play
} from 'lucide-react';
import { profileApi } from '../../api/profile';
import { toast } from 'react-hot-toast';

const PublicProfilePage = () => {
  const { userIdHash } = useParams();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedProject, setSelectedProject] = useState(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);

  useEffect(() => {
    const fetchPublicProfile = async () => {
      try {
        setLoading(true);
        const response = await profileApi.getPublicProfile(userIdHash);
        const data = response.data.data || response.data.value || response.data;
        setProfile(data);
        setError(null);
      } catch (err) {
        if (err.status === 404) {
          setError('Profile not found');
        } else {
          setError('Failed to load profile');
        }
      } finally {
        setLoading(false);
      }
    };

    if (userIdHash) {
      fetchPublicProfile();
    }
  }, [userIdHash]);

  const getExperienceLabel = (level) => {
    const labels = { 0: 'Beginner', 1: 'Intermediate', 2: 'Advanced', 3: 'Expert' };
    return labels[level] || 'Intermediate';
  };

  const openViewModal = (project) => {
    setSelectedProject(project);
    setIsViewModalOpen(true);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-[#C5A065] mx-auto mb-4" />
          <p className="text-gray-600 font-medium">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50 p-4">
        <div className="bg-white p-8 rounded-2xl shadow-xl max-w-md w-full text-center">
          <div className="bg-red-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 text-red-500">
            <X size={32} />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">{error}</h2>
          <p className="text-gray-600 mb-6 font-medium">The profile you're looking for might be private or doesn't exist.</p>
          <button 
            onClick={() => window.history.back()}
            className="w-full py-3 bg-[#C5A065] text-white font-bold rounded-xl hover:bg-[#b8962d] transition-all"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  if (!profile) return null;

  return (
    <div className="bg-gray-50 min-h-screen pb-12">
      <div className="container max-w-[1100px] mx-auto pt-8 px-4">
        {/* Profile Header Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 mb-6">
          <div className="flex flex-col md:flex-row gap-8 items-start">
            <div className="relative shrink-0 mx-auto md:mx-0">
              <img 
                src={profile.avatarUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(profile.fullName)}&background=C5A065&color=fff`}
                alt={profile.fullName}
                className="w-32 h-32 rounded-full border-4 border-white shadow-xl object-cover"
              />
              <div className="absolute bottom-2 right-2 w-5 h-5 bg-[#14a800] border-2 border-white rounded-full"></div>
            </div>
            
            <div className="flex-1 w-full text-center md:text-left">
              <div className="flex flex-col md:flex-row justify-between items-center md:items-start gap-4 mb-6">
                <div>
                  <div className="flex items-center justify-center md:justify-start gap-2 mb-1">
                    <h1 className="text-3xl font-bold text-gray-900">{profile.fullName}</h1>
                    {profile.isVerified && (
                      <CheckCircle className="text-[#108a00] fill-[#108a00]/10" size={24} />
                    )}
                  </div>
                  <div className="flex items-center justify-center md:justify-start gap-2 text-gray-500 font-medium">
                    <MapPin size={16} />
                    <span>{profile.city}, {profile.country}</span>
                  </div>
                </div>
                
                <div className="flex gap-3">
                  <button className="px-6 py-2.5 bg-white border border-gray-200 text-gray-700 font-bold rounded-xl hover:bg-gray-50 transition-all">
                    Save Profile
                  </button>
                  <button className="px-8 py-2.5 bg-[#14a800] text-white font-bold rounded-xl hover:bg-[#108a00] transition-all">
                    Hire Me
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 pt-6 border-t border-gray-50">
                <div className="text-center md:text-left">
                  <div className="text-2xl font-bold text-gray-900 flex items-center justify-center md:justify-start gap-1">
                    <Star className="text-[#C5A065] fill-[#C5A065]" size={20} />
                    {profile.trustScore ? `${profile.trustScore}%` : 'N/A'}
                  </div>
                  <div className="text-xs font-bold text-gray-400 uppercase tracking-wider mt-1">Trust Score</div>
                </div>
                <div className="text-center md:text-left">
                  <div className="text-2xl font-bold text-gray-900">{getExperienceLabel(profile.experienceLevel)}</div>
                  <div className="text-xs font-bold text-gray-400 uppercase tracking-wider mt-1">Experience</div>
                </div>
                <div className="text-center md:text-left">
                  <div className="text-2xl font-bold text-gray-900">{profile.totalEarnings || '$0'}</div>
                  <div className="text-xs font-bold text-gray-400 uppercase tracking-wider mt-1">Total Earnings</div>
                </div>
                <div className="text-center md:text-left">
                  <div className="text-2xl font-bold text-gray-900">{profile.totalJobs || 0}</div>
                  <div className="text-xs font-bold text-gray-400 uppercase tracking-wider mt-1">Total Jobs</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column */}
          <div className="lg:col-span-4 space-y-6">
            <div className="bg-black aspect-video rounded-2xl flex items-center justify-center text-white cursor-pointer group relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
              <div className="z-10 bg-white/20 backdrop-blur-md p-4 rounded-full group-hover:scale-110 transition-transform">
                <Play className="fill-white" size={32} />
              </div>
              <span className="absolute bottom-4 left-4 text-sm font-bold opacity-80">Video Introduction</span>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-6 pb-4 border-b border-gray-50">Profile Details</h3>
              <div className="space-y-6">
                <div>
                  <div className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Hours Per Week</div>
                  <div className="text-gray-700 font-semibold">More than 30 hrs/week</div>
                </div>
                <div>
                  <div className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Languages</div>
                  <div className="space-y-1">
                    <div className="text-gray-700 font-semibold">English: Native</div>
                    <div className="text-gray-700 font-semibold">Spanish: Fluent</div>
                  </div>
                </div>
                <div>
                  <div className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Education</div>
                  <div className="text-gray-700 font-semibold">Bachelor of Science, CS</div>
                  <div className="text-xs text-gray-500 font-medium">MIT, 2020</div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column */}
          <div className="lg:col-span-8 space-y-6">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">{profile.title || 'Professional Freelancer'}</h2>
              <div className="text-gray-600 leading-relaxed whitespace-pre-wrap font-medium">
                {profile.bio || 'This freelancer hasn\'t provided a bio yet.'}
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
              <h3 className="text-xl font-bold text-gray-900 mb-6">Work History</h3>
              <div className="space-y-8">
                {/* Fixed placeholder as per prototype but we are focused on live fields */}
                <div className="pb-8 border-b border-gray-50">
                  <div className="text-[#108a00] font-bold text-lg mb-2">Web Application Development for Startups</div>
                  <div className="flex items-center gap-2 mb-3">
                    <div className="flex items-center gap-1 text-[#C5A065] text-sm font-bold">
                      <Star size={14} className="fill-[#C5A065]" />
                      5.0 (24 reviews)
                    </div>
                  </div>
                  <p className="text-gray-600 italic font-medium">"Exceptional work, very responsive and delivered ahead of schedule."</p>
                </div>
              </div>
              <button className="w-full mt-6 py-3 text-[#14a800] font-bold hover:bg-gray-50 rounded-xl transition-all">
                View all work history
              </button>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
              <h3 className="text-xl font-bold text-gray-900 mb-6">Portfolio</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {profile.portfolio && profile.portfolio.length > 0 ? (
                  profile.portfolio.map((item) => (
                    <div 
                      key={item.id} 
                      onClick={() => openViewModal(item)}
                      className="group cursor-pointer border border-gray-100 rounded-xl overflow-hidden hover:shadow-lg transition-all bg-gray-50/50"
                    >
                      <div className="aspect-video relative overflow-hidden bg-gray-200">
                        {item.thumbnailUrl && (
                          <img src={item.thumbnailUrl} alt={item.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                        )}
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                          <span className="bg-white text-gray-900 px-4 py-2 rounded-lg font-bold text-sm">View Details</span>
                        </div>
                      </div>
                      <div className="p-4 bg-white">
                        <h4 className="font-bold text-gray-900 truncate">{item.title}</h4>
                        <p className="text-xs text-gray-500 mt-1 line-clamp-2">{item.description}</p>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-400 italic">No projects added to portfolio.</p>
                )}
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
              <h3 className="text-xl font-bold text-gray-900 mb-6">Skills</h3>
              <div className="flex flex-wrap gap-2">
                {profile.skills && profile.skills.length > 0 ? (
                  profile.skills.map((skill, i) => (
                    <span 
                      key={i}
                      className="px-4 py-2 bg-gray-50 text-gray-700 text-sm font-bold rounded-full border border-gray-100"
                    >
                      {skill}
                    </span>
                  ))
                ) : (
                  <p className="text-gray-400 italic">No skills listed.</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Portfolio Viewer Modal */}
      {isViewModalOpen && selectedProject && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={() => setIsViewModalOpen(false)} />
          <div className="relative bg-white w-full max-w-4xl max-h-[90vh] rounded-2xl overflow-hidden flex flex-col shadow-2xl">
            <button 
              onClick={() => setIsViewModalOpen(false)}
              className="absolute top-4 right-4 z-10 p-2 bg-black/20 hover:bg-black/40 text-white rounded-full transition-colors"
            >
              <X size={24} />
            </button>
            
            <div className="overflow-y-auto">
              <div className="h-64 md:h-96 relative bg-gray-900 flex items-center justify-center">
                {selectedProject.thumbnailUrl && (
                  <img src={selectedProject.thumbnailUrl} alt={selectedProject.title} className="max-w-full max-h-full object-contain" />
                )}
                <div className="absolute bottom-0 left-0 right-0 p-8 bg-gradient-to-t from-black/90 to-transparent text-white">
                  <h2 className="text-3xl font-bold">{selectedProject.title}</h2>
                  {selectedProject.role && <p className="text-gray-300 mt-1">{selectedProject.role}</p>}
                </div>
              </div>
              
              <div className="p-8 space-y-8">
                <div>
                  <h3 className="text-sm font-bold text-[#C5A065] uppercase tracking-wider mb-2">Project Description</h3>
                  <p className="text-gray-700 leading-relaxed whitespace-pre-wrap font-medium">{selectedProject.description}</p>
                </div>
                
                {selectedProject.visitLink && (
                  <div>
                    <h3 className="text-sm font-bold text-[#C5A065] uppercase tracking-wider mb-2">Project Link</h3>
                    <a 
                      href={selectedProject.visitLink} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline flex items-center gap-1 font-semibold"
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
    </div>
  );
};

export default PublicProfilePage;
