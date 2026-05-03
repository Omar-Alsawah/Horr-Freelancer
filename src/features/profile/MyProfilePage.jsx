import React, { useState, useEffect } from 'react';
import { 
  User, 
  MapPin, 
  Share2, 
  Edit2, 
  Plus, 
  Trash2, 
  Globe, 
  Code2, 
  Search,
  Star,
  ExternalLink,
  ChevronRight,
  Loader2,
  Video,
  Award,
  Briefcase,
  Folder
} from 'lucide-react';
import { profileApi } from '../../api/profile';
import { toast } from 'react-hot-toast';
import './MyProfilePage.css';

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
      const profileData = response.data.data;
      
      if (profileData) {
        setProfile({
          ...profileData,
          name: profileData.fullName,
          title: profileData.title || (profileData.bio ? (profileData.bio.split('\n')[0] || '') : 'Senior Web Developer'),
        });
      }
      setEditedFields({});
    } catch (error) {
      console.error('Error fetching profile:', error);
      toast.error('Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-[#C5A065]" />
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
    <div className="profile-container">
      {/* Profile Header */}
      <header className="profile-header">
        <div className="header-left">
          <div className="avatar-container">
            {profile.avatarUrl ? (
              <img src={profile.avatarUrl} alt={profile.name} className="avatar-img" />
            ) : (
              <User size={40} className="avatar-icon" />
            )}
          </div>
          <div className="user-info">
            <h1>{profile.name}</h1>
            <p className="location"><MapPin size={14} /> {profile.location || 'Cairo, Egypt'}</p>
          </div>
        </div>
        <div className="header-right">
          <button className="btn btn-primary">See public view</button>
          <button className="btn btn-outline">Profile settings</button>
          <button className="btn-icon"><Share2 size={18} /> Share</button>
        </div>
      </header>

      <div className="profile-layout">
        {/* Sidebar */}
        <aside className="sidebar">
          <section className="p-card section-availability">
            <div className="section-header">
              <h2>Availability</h2>
              <button className="edit-btn"><Edit2 size={14} /></button>
            </div>
            <p className="status">
              <span className="status-dot"></span> 
              {profile.availability || 'Available'}
            </p>
          </section>

          <section className="p-card section-connects">
            <div className="section-header">
              <h2>Connects</h2>
              <button className="edit-btn"><Edit2 size={14} /></button>
            </div>
            <p className="text-bold" style={{ fontSize: '1.2rem', marginBottom: '0.5rem' }}>
              Connects: {profile.connects || 0}
            </p>
            <a href="#" className="view-link" style={{ color: 'var(--profile-gold)', fontSize: '0.9rem' }}>
              View details
            </a>
          </section>

          <section className="p-card section-video">
            <div className="section-header">
              <h2>Video introduction</h2>
              <button className="add-btn"><Plus size={14} /></button>
            </div>
            <p className="subtext">No video added</p>
          </section>

          <section className="p-card section-hours">
            <div className="section-header">
              <h2>Hours per week</h2>
              <button className="edit-btn"><Edit2 size={14} /></button>
            </div>
            <div>
              <p className="text-bold">{profile.hoursPerWeek || 'More than 30 hrs/week'}</p>
              <p className="subtext">Open to contract to hire</p>
            </div>
          </section>

          <section className="p-card section-languages">
            <div className="section-header">
              <h2>Languages</h2>
              <div className="header-actions">
                <button className="add-btn"><Plus size={14} /></button>
                <button className="edit-btn" style={{ marginLeft: '0.5rem' }}><Edit2 size={14} /></button>
              </div>
            </div>
            <div>
              <p>English: <span className="text-muted">Conversational</span></p>
              <p>Arabic: <span className="text-muted">Native or Bilingual</span></p>
            </div>
          </section>

          <section className="p-card section-verifications">
            <div className="section-header">
              <h2>Verifications</h2>
            </div>
            <div className="verification-item">
              <p>ID: <span className="text-bold">Unverified</span></p>
              <a href="#" className="view-link" style={{ color: 'var(--profile-gold)', fontSize: '0.9rem' }}>
                Verify your identity
              </a>
            </div>
          </section>

          <section className="p-card section-education">
            <div className="section-header">
              <h2>Education</h2>
              <button className="add-btn"><Plus size={14} /></button>
            </div>
            <div className="education-item">
              <p className="text-bold">Egypt-Japan University of Science and Technology (E-JUST)</p>
              <p className="subtext">Bachelor of Computer Science (BCompSc), 2021-2025 (expected)</p>
            </div>
          </section>

          <section className="p-card section-linked">
            <div className="section-header">
              <h2>Linked Accounts</h2>
            </div>
            <div className="linked-item">
              <Globe size={20} className="social-icon" />
              <div className="linked-text">
                <p className="text-bold">{profile.name}</p>
                <a href="#" className="view-link" style={{ color: 'var(--profile-gold)', fontSize: '0.8rem' }}>
                  View profile
                </a>
              </div>
            </div>
            <div className="linked-item">
              <Code2 size={20} className="social-icon" />
              <div className="linked-text">
                <p className="text-bold">{profile.name}</p>
                <a href="#" className="view-link" style={{ color: 'var(--profile-gold)', fontSize: '0.8rem' }}>
                  View profile
                </a>
              </div>
            </div>
          </section>
        </aside>

        {/* Main Content */}
        <main className="main-content">
          <section className="p-card section-title">
            <div className="section-header">
              <h2 className="role-title">{profile.title}</h2>
              <button className="edit-btn"><Edit2 size={16} /></button>
            </div>
          </section>

          <section className="p-card section-summary">
            <div className="section-header">
              <h2>Professional Summary</h2>
              <button className="edit-btn"><Edit2 size={14} /></button>
            </div>
            <p className="summary-text">
              {profile.bio || 'Add a professional summary to tell clients about your experience and goals.'}
            </p>
          </section>

          <section className="p-card section-portfolio">
            <div className="section-header">
              <h2>Portfolio</h2>
              <button className="add-btn"><Plus size={14} /></button>
            </div>
            <div className="portfolio-list">
              {profile.portfolioItems?.length > 0 ? (
                profile.portfolioItems.map((item, index) => (
                  <div key={index} className="portfolio-item">
                    <div className="portfolio-info">
                      <p className="text-bold">{item.title}</p>
                      <p className="subtext">{item.description}</p>
                    </div>
                    <div className="portfolio-actions">
                      <a href="#" className="view-link" style={{ color: 'var(--profile-gold)' }}>View Media</a>
                      <button className="edit-btn-small"><Edit2 size={14} /></button>
                      <button className="delete-btn-small"><Trash2 size={14} /></button>
                    </div>
                  </div>
                ))
              ) : (
                <p className="subtext italic text-center py-4">No portfolio items added yet.</p>
              )}
            </div>
          </section>

          <section className="p-card section-history">
            <div className="section-header">
              <h2>Work history</h2>
            </div>
            <p className="subtext">No Work History</p>
          </section>

          <section className="p-card section-skills">
            <div className="section-header">
              <h2>Skills</h2>
              <button className="edit-btn"><Edit2 size={14} /></button>
            </div>
            <div className="skills-tags">
              {profile.skills?.length > 0 ? (
                profile.skills.map((skill, index) => (
                  <span key={index} className="skill-tag">
                    {skill}
                  </span>
                ))
              ) : (
                <p className="subtext italic">No skills listed.</p>
              )}
            </div>
          </section>

          <section className="p-card section-placeholder">
            <div className="section-header">
              <h2>Other experiences</h2>
              <button className="add-btn"><Plus size={14} /></button>
            </div>
            <div className="placeholder-content">
              <div className="icon-circle">
                <Folder className="placeholder-icon" size={24} />
              </div>
            </div>
          </section>

          <section className="p-card section-placeholder">
            <div className="section-header">
              <h2>Certifications</h2>
              <button className="add-btn"><Plus size={14} /></button>
            </div>
            <div className="placeholder-content">
              <div className="icon-circle">
                <Award className="placeholder-icon" size={24} />
              </div>
            </div>
          </section>

          <section className="p-card section-placeholder">
            <div className="section-header">
              <h2>Employment history</h2>
              <button className="add-btn"><Plus size={14} /></button>
            </div>
            <div className="placeholder-content">
              <div className="icon-circle">
                <Briefcase className="placeholder-icon" size={24} />
              </div>
            </div>
          </section>
        </main>
      </div>
    </div>
  );
};

export default MyProfilePage;
