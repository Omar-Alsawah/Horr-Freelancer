import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Loader2, X, Star } from 'lucide-react';
import { profileApi } from '../../api/profile';
import { getImageUrl } from '../../api/axios';
import BackGroundImg from '../../assets/BackGround.PNG';

const PublicProfilePage = () => {
  const { userIdHash } = useParams();
  const [profile, setProfile] = useState(null);
  const [portfolio, setPortfolio] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isSaved, setIsSaved] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      if (!userIdHash) return;
      try {
        setLoading(true);

        // Fetch profile (hydrated with portfolio, languages, etc.)
        const profileRes = await profileApi.getPublicProfile(userIdHash);
        const profileData =
          profileRes.data.data || profileRes.data.value || profileRes.data;
        
        setProfile(profileData);
        
        // Extract portfolio from the hydrated profile
        if (profileData && profileData.portfolio) {
          setPortfolio(Array.isArray(profileData.portfolio) ? profileData.portfolio : []);
        } else {
          setPortfolio([]);
        }

        setError(null);
      } catch (err) {
        console.error("Error fetching public profile:", err);
        setError(err?.status === 404 ? 'Profile not found' : 'Failed to load profile');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [userIdHash]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#f9f9f9]">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-[#C5A065] mx-auto mb-4" />
          <p className="text-gray-600 font-medium">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#f9f9f9] p-4">
        <div className="bg-white p-8 rounded-2xl shadow-xl max-w-md w-full text-center border border-gray-100">
          <div className="bg-red-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 text-red-500">
            <X size={32} />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">{error || 'Profile not found'}</h2>
          <p className="text-gray-600 mb-6 font-medium">The profile you're looking for might be private or doesn't exist.</p>
          <button 
            onClick={() => window.history.back()}
            className="w-full py-3 bg-[#108a00] text-white font-bold rounded-xl hover:bg-[#0d7300] transition-all"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  const avatarSrc = profile.profilePicturePath 
    ? getImageUrl(profile.profilePicturePath) 
    : `https://ui-avatars.com/api/?name=${encodeURIComponent(profile.fullName)}&background=99cc99&color=fff`;

  return (
    <div className="public-profile-view">
      <style>{`
        .public-profile-view {
          min-height: 100vh;
          background-image: url(${BackGroundImg});
          background-size: cover;
          background-repeat: no-repeat;
          background-attachment: fixed;
          background-position: center;
          font-family: 'Inter', sans-serif;
          color: #1A1A1A;
          padding-top: 2rem;
          padding-bottom: 4rem;
        }

        .public-profile-view .pp-container {
          max-width: 1000px;
          margin: 0 auto;
          padding: 0 1.5rem;
        }

        .public-profile-view .card {
          background: #FFFFFF;
          border-radius: 12px;
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05);
          border: 1px solid rgba(0, 0, 0, 0.02);
          overflow: hidden;
          margin-bottom: 1rem;
        }

        .public-profile-view .profile-container {
          display: grid;
          grid-template-columns: 280px 1fr;
          gap: 2rem;
          margin-top: 1rem;
        }

        @media (max-width: 850px) {
          .public-profile-view .profile-container {
            grid-template-columns: 1fr;
          }
        }

        .public-profile-view .profile-left-col {
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
        }

        .public-profile-view .profile-right-col {
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
        }

        .public-profile-view .btn-save-elegant {
          width: 50px;
          height: 50px;
          border-radius: 50%;
          border: 1px solid #e0e0e0;
          background: white;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.2s;
          color: #666;
          padding: 0;
        }

        .public-profile-view .btn-save-elegant:hover {
          background: #f5f5f5;
          border-color: #ccc;
        }

        .public-profile-view .btn-save-elegant.saved {
          background: #fff0f0;
          border-color: #ffcccc;
          color: #ff4d4f;
        }

        .public-profile-view .btn-save-elegant svg {
          width: 24px;
          height: 24px;
          fill: none;
          stroke: currentColor;
          stroke-width: 2;
        }

        .public-profile-view .btn-save-elegant.saved svg {
          fill: currentColor;
        }

        .public-profile-view .btn-green-elegant {
          background: #108a00;
          color: white;
          padding: 0.75rem 2rem;
          border-radius: 25px;
          font-weight: 600;
          border: none;
          cursor: pointer;
          transition: background 0.2s;
          font-size: 0.95rem;
        }

        .public-profile-view .btn-green-elegant:hover {
          background: #0d7300;
        }

        .public-profile-view .profile-stat-group {
          border-bottom: 1px solid #eee;
          padding-bottom: 1rem;
          margin-bottom: 1rem;
        }

        .public-profile-view .profile-stat-group:last-child {
          border-bottom: none;
        }

        .public-profile-view .profile-stat-label {
          font-size: 0.9rem;
          color: #666;
          margin-bottom: 0.2rem;
        }

        .public-profile-view .profile-stat-value {
          font-weight: 600;
          color: #1A1A1A;
          font-size: 0.95rem;
        }

        .public-profile-view .job-success-score {
          color: #C5A065;
          font-weight: 600;
          display: flex;
          align-items: center;
          gap: 0.3rem;
        }

        .public-profile-view .job-success-icon {
          width: 16px;
          height: 16px;
          fill: #C5A065;
        }

        .public-profile-view .work-history-item {
          margin-bottom: 1.5rem;
          padding-bottom: 1.5rem;
          border-bottom: 1px solid #eee;
        }

        .public-profile-view .work-history-item:last-child {
          border-bottom: none;
        }

        .public-profile-view .work-history-title {
          font-weight: 600;
          color: #108a00;
          font-size: 1.05rem;
        }

        .public-profile-view .work-history-meta {
          font-size: 0.85rem;
          color: #666;
          margin: 0.3rem 0;
          display: flex;
          gap: 1rem;
        }

        .public-profile-view .portfolio-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
          gap: 1rem;
          margin-top: 1rem;
        }

        .public-profile-view .portfolio-item {
          background: #fff8e1;
          aspect-ratio: 4/3;
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #C5A065;
          font-size: 0.8rem;
          border: 1px solid #ffd591;
          overflow: hidden;
        }

        .public-profile-view .portfolio-item img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .public-profile-view .light-pill {
          background: #f2f7f2;
          color: #108a00;
          padding: 0.4rem 1rem;
          border-radius: 20px;
          font-size: 0.85rem;
          font-weight: 600;
          display: inline-block;
        }

        .public-profile-view .view-more-link {
          text-align: center;
          color: #108a00;
          font-weight: 600;
          cursor: pointer;
          font-size: 0.9rem;
        }

        .public-profile-view .view-more-link:hover {
          text-decoration: underline;
        }
      `}</style>

      <div className="pp-container">
        {/* Profile Header */}
        <div className="card" style={{ padding: '2rem' }}>
          <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap' }}>
            <div style={{ position: 'relative', flexShrink: 0 }}>
              <img 
                src={avatarSrc}
                style={{ width: '90px', height: '90px', borderRadius: '50%', border: '3px solid white', boxShadow: '0 2px 10px rgba(0,0,0,0.1)', objectFit: 'cover' }}
                alt={profile.fullName}
              />
              <div
                style={{ position: 'absolute', bottom: '5px', right: '5px', width: '16px', height: '16px', background: '#14a800', border: '2px solid white', borderRadius: '50%' }}
              >
              </div>
            </div>
            <div style={{ flex: 1, minWidth: '300px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
                <div>
                  <h1 style={{ margin: 0, fontSize: '1.6rem', fontWeight: 700 }}>{profile.fullName}</h1>
                  <p style={{ margin: '0.1rem 0', fontSize: '1.1rem', fontWeight: 600, color: '#333' }}>{profile.title}</p>
                  <div style={{ color: '#666', marginTop: '0.2rem', fontSize: '0.9rem' }}>
                    {profile.city && profile.country ? `${profile.city}, ${profile.country}` : (profile.city || profile.country || 'Location not specified')}
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                  <button 
                    className={`btn-save-elegant ${isSaved ? 'saved' : ''}`}
                    onClick={() => setIsSaved(!isSaved)}
                    title={isSaved ? "Saved" : "Save Profile"}
                  >
                    <svg viewBox="0 0 24 24">
                      <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                    </svg>
                  </button>
                  <button className="btn-green-elegant">Invite to Job</button>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '3rem', marginTop: '1.5rem', flexWrap: 'wrap' }}>
                <div>
                  <div style={{ fontWeight: 600, fontSize: '1.1rem' }}>{profile.trustScore || '0'}%</div>
                  <div style={{ fontSize: '0.85rem', color: '#666' }}>Job Success</div>
                </div>
                <div>
                  <div style={{ fontWeight: 600, fontSize: '1.1rem' }}>{profile.totalEarnings || '$0'}</div>
                  <div style={{ fontSize: '0.85rem', color: '#666' }}>Total Earnings</div>
                </div>
                <div>
                  <div style={{ fontWeight: 600, fontSize: '1.1rem' }}>{profile.totalJobs || '0'}</div>
                  <div style={{ fontSize: '0.85rem', color: '#666' }}>Total Jobs</div>
                </div>
                <div>
                  <div style={{ fontWeight: 600, fontSize: '1.1rem' }}>{profile.totalHours || '0'}</div>
                  <div style={{ fontSize: '0.85rem', color: '#666' }}>Total Hours</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="profile-container">
          {/* Left Column */}
          <div className="profile-left-col">
            <div className="card" style={{ padding: '1.5rem' }}>
              <h3 style={{ marginTop: 0, fontSize: '1.1rem', borderBottom: '1px solid #eee', paddingBottom: '0.8rem', marginBottom: '1rem', fontWeight: 600 }}>
                Details
              </h3>

              <div className="profile-stat-group">
                <div className="profile-stat-label">Hours per week</div>
                <div className="profile-stat-value">
                  {profile.availability || 'Not specified'}
                </div>
                <div style={{ fontSize: '0.8rem', color: '#666', marginTop: '0.2rem' }}>
                  Open to contract to hire
                </div>
              </div>

              <div className="profile-stat-group">
                <div className="profile-stat-label">Languages</div>
                {profile.languages && profile.languages.length > 0 ? (
                  profile.languages.map((lang, idx) => (
                    <div key={idx} className="profile-stat-value">{lang.name}: {lang.level}</div>
                  ))
                ) : (
                  <div className="profile-stat-value text-gray-400 italic">No languages specified</div>
                )}
              </div>

              <div className="profile-stat-group">
                <div className="profile-stat-label">Education</div>
                {profile.education && profile.education.length > 0 ? (
                  profile.education.map((edu, idx) => (
                    <div key={idx} style={{ marginBottom: idx < profile.education.length - 1 ? '0.8rem' : 0 }}>
                      <div className="profile-stat-value">
                        {edu.degree}{edu.fieldOfStudy ? `, ${edu.fieldOfStudy}` : ''}
                      </div>
                      <div style={{ fontSize: '0.8rem', color: '#666' }}>
                        {edu.school}, {edu.year || (edu.dateEnd ? new Date(edu.dateEnd).getFullYear() : '')}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="profile-stat-value text-gray-400 italic">No education specified</div>
                )}
              </div>

              <div className="profile-stat-group">
                <div className="profile-stat-label">Verification</div>
                <div className="profile-stat-value" style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                  {profile.isVerified ? (
                    <>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#108a00" strokeWidth="2">
                        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                        <polyline points="22 4 12 14.01 9 11.01"></polyline>
                      </svg> ID Verified
                    </>
                  ) : (
                    <span className="text-gray-400">ID Not Verified</span>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Right Column */}
          <div className="profile-right-col">
            <div className="card" style={{ padding: '2rem' }}>
              <h2 style={{ marginTop: 0, fontSize: '1.3rem', fontWeight: 600 }}>Professional Summary</h2>
              <p style={{ color: '#555', lineHeight: '1.6', marginTop: '1rem', whiteSpace: 'pre-wrap' }}>
                {profile.bio || 'This freelancer hasn\'t provided a professional summary yet.'}
              </p>
            </div>

            <div className="card" style={{ padding: '2rem' }}>
              <h3 style={{ marginTop: 0, marginBottom: '1.5rem', fontWeight: 600, fontSize: '1.1rem' }}>Work History</h3>
              {profile.employmentHistory && profile.employmentHistory.length > 0 ? (
                profile.employmentHistory.map((job, idx) => (
                  <div key={idx} className="work-history-item">
                    <div className="work-history-title">{job.title}</div>
                    <div style={{ fontSize: '0.85rem', color: '#666', marginTop: '0.2rem' }}>
                      {job.company} • {job.fromDate ? new Date(job.fromDate).toLocaleDateString() : ''} - {job.toDate ? new Date(job.toDate).toLocaleDateString() : 'Present'}
                    </div>
                    {job.description && (
                      <div style={{ fontStyle: 'italic', color: '#555', marginTop: '0.5rem', fontSize: '0.9rem' }}>
                        "{job.description}"
                      </div>
                    )}
                  </div>
                ))
              ) : (
                <div className="text-gray-400 italic py-4">No work history provided yet.</div>
              )}

            </div>

            <div className="card" style={{ padding: '2rem' }}>
              <h3 style={{ marginTop: 0, marginBottom: '1rem', fontWeight: 600, fontSize: '1.1rem' }}>Portfolio</h3>
              <div className="portfolio-grid">
                {portfolio.length > 0 ? (
                  portfolio.map((item) => (
                    <div key={item.id} className="portfolio-item">
                      {item.thumbnailUrl ? (
                        <img src={getImageUrl(item.thumbnailUrl)} alt={item.title} />
                      ) : (
                        <span style={{ padding: '0.5rem', textAlign: 'center' }}>{item.title}</span>
                      )}
                    </div>
                  ))
                ) : (
                  <div className="text-gray-400 italic py-4 col-span-full">No portfolio items added yet.</div>
                )}
              </div>
            </div>

            <div className="card" style={{ padding: '2rem' }}>
              <h3 style={{ marginTop: 0, marginBottom: '1rem', fontWeight: 600, fontSize: '1.1rem' }}>Skills</h3>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                {profile.skills && profile.skills.length > 0 ? (
                  profile.skills.map((skill, idx) => (
                    <span key={idx} className="light-pill">{typeof skill === 'string' ? skill : skill.name}</span>
                  ))
                ) : (
                  <div className="text-gray-400 italic">No skills listed yet.</div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PublicProfilePage;
