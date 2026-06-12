import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api/axios';

export default function MyServicesPage() {
  const [activeTab, setActiveTab] = useState('Approved');
  const [services, setServices] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchServices();
  }, []);

  // Auto-select "Under review" tab if there are items there
  useEffect(() => {
    if (!isLoading && services.length > 0) {
      const reviewCount = services.filter(s => s.status === 'Under review').length;
      if (reviewCount > 0) {
        setActiveTab('Under review');
      }
    }
  }, [isLoading, services]);

  const fetchServices = async () => {
    try {
      setIsLoading(true);
      const response = await api.get('/api/services/my-services');
      setServices(response.data.data || []);
    } catch (error) {
      console.error('Failed to fetch services', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this service?')) {
      try {
        await api.delete(`/api/services/${id}`);
        setServices(prev => prev.filter(s => s.id !== id));
      } catch (error) {
        console.error('Failed to delete', error);
      }
    }
  };

  const handleTabClick = (tabName) => {
    setActiveTab(tabName);
  };

  const approvedCount = services.filter(s => s.status === 'Approved').length;
  const reviewCount = services.filter(s => s.status === 'Under review').length;
  const filteredServices = services.filter(s => {
    const status = s.status || 'Under review';
    return status === activeTab;
  });

  return (
    <div className="container animate-fade-up" style={{ maxWidth: '1200px', marginTop: '4rem', display: 'block' }}>

      {/* Row 1: Hero Section */}
      <div className="hero-section" style={{ marginBottom: '5rem', width: '100%', display: 'block' }}>
        <h1 style={{ fontSize: '3.5rem', marginBottom: '1.5rem', lineHeight: 1.1, color: '#333', letterSpacing: '-1px' }}>
          Create and manage your services
        </h1>
        <p style={{ fontSize: '1.1rem', color: '#5e6d55', marginBottom: '2.5rem', lineHeight: 1.6, maxWidth: '700px' }}>
          Explore new ways to earn on HORR. With Catalog services, clients come to you. So you can spend more
          time working on the things you love.
        </p>
        <Link
          to="/services/create"
          className="btn btn-warning"
          style={{ padding: '0.9rem 2rem', fontWeight: 700, color: '#fff', background: '#FFC107', border: 'none', borderRadius: '8px', fontSize: '0.95rem' }}
        >
          CREATE A SERVICE
        </Link>
      </div>

      {/* Row 2: Projects Section */}
      <div className="projects-section" style={{ width: '100%', display: 'block' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <h2 style={{ fontSize: '1.8rem', margin: 0, fontWeight: 600 }}>Services</h2>
          <Link
            to="/services/create"
            className="btn btn-warning"
            style={{ fontSize: '0.8rem', padding: '0.6rem 1.2rem', fontWeight: 700, color: '#fff', background: '#FFC107', border: 'none', borderRadius: '6px' }}
          >
            Create a service
          </Link>
        </div>

        <div
          className="job-feed-tabs"
          style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #e0e0e0', marginBottom: '1rem', paddingBottom: '0.5rem' }}
        >
          <div style={{ display: 'flex', gap: '2rem' }}>
            <div
              className={`feed-tab ${activeTab === 'Approved' ? 'active' : ''}`}
              onClick={() => handleTabClick('Approved')}
              style={{ cursor: 'pointer', fontWeight: activeTab === 'Approved' ? 600 : 500, color: activeTab === 'Approved' ? '#000' : undefined, padding: '0.5rem 0', borderBottom: '2px solid transparent' }}
            >
              Approved (<span>{approvedCount}</span>)
            </div>
            <div
              className={`feed-tab ${activeTab === 'Under review' ? 'active' : ''}`}
              onClick={() => handleTabClick('Under review')}
              style={{ cursor: 'pointer', fontWeight: activeTab === 'Under review' ? 600 : 500, color: activeTab === 'Under review' ? '#000' : undefined, padding: '0.5rem 0', borderBottom: '2px solid transparent' }}
            >
              Under Review (<span>{reviewCount}</span>)
            </div>
          </div>
          <div style={{ color: '#666', fontSize: '0.85rem', fontWeight: 600, paddingRight: '4rem' }}>Created</div>
        </div>

        <div style={{ minHeight: '200px' }}>
          {isLoading ? (
            <div style={{ textAlign: 'center', padding: '3rem', color: '#777' }}>Loading...</div>
          ) : filteredServices.length === 0 ? (
            <div
              className="empty-state-card"
              style={{ textAlign: 'center', padding: '3rem', background: '#fff', border: '1px dashed #ddd', borderRadius: '8px' }}
            >
              {services.length === 0 ? (
                <>
                  <h3 style={{ marginBottom: '0.5rem', fontSize: '1.1rem' }}>No services found</h3>
                  <p style={{ color: '#777', marginBottom: '1.5rem', fontSize: '0.9rem' }}>Get started by creating your first service.</p>
                  <Link to="/services/create" style={{ color: '#108a00', fontWeight: 600, textDecoration: 'none' }}>Create a service</Link>
                </>
              ) : (
                <h3 style={{ marginBottom: '1rem', fontSize: '1.1rem', color: '#555' }}>No services in {activeTab}</h3>
              )}
            </div>
          ) : (
            <div className="service-list" style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
              {filteredServices.map(service => (
                <div key={service.id} className="service-row-item animate-fade-up">
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <div style={{ width: '80px', height: '50px', background: '#d4ecec', borderRadius: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem', minWidth: '80px' }}>
                      📄
                    </div>
                    <div>
                      <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 600, color: '#333' }}>{service.title}</h3>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '3rem' }}>
                    <span style={{ color: '#333', fontSize: '0.9rem', fontWeight: 500 }}>{service.date || 'Dec 19, 2025'}</span>
                    <button
                      onClick={() => handleDelete(service.id)}
                      style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#d32f2f', fontSize: '1.2rem', padding: '0.5rem', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'background 0.2s' }}
                      onMouseOver={(e) => { e.currentTarget.style.background = '#ffebee'; }}
                      onMouseOut={(e) => { e.currentTarget.style.background = 'transparent'; }}
                      title="Delete"
                    >
                      🗑️
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

    </div>
  );
}
