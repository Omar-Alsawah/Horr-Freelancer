import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { contractsService } from '../../../services/contractsService';
import Pagination from '../components/Pagination';
import { Briefcase } from 'lucide-react';

// ── Helpers ───────────────────────────────────────────────────────────────────

/** Normalize inconsistent casing coming from the API */
function normalize(c) {
  return {
    id: c.id ?? c.Id,
    title: c.proposalTitle ?? c.proposal_Title ?? c.jobTitle ?? c.JobTitle ?? c.title ?? c.Title ?? 'Untitled',
    freelancerName: c.freelancerName ?? c.freelancer_Name ?? c.FreelancerName ?? c.Freelancer_Name ?? c.freelancer?.name ?? c.freelancer?.Name ?? 'Unknown',
    startedAt: c.startedAt ?? c.startDate ?? c.StartedAt ?? null,
    agreedRate: c.agreedRate ?? c.AgreedRate ?? 0,
    status: (c.status ?? c.Status ?? '').toString().toLowerCase(),
  };
}

function isActive(status) {
  return status === 'active' || status === '1';
}

function formatEgp(amount) {
  if (amount == null) return '';
  const n = Number(amount);
  return `EGP ${new Intl.NumberFormat('en-EG').format(n)}`;
}

function ContractSkeleton() {
  return (
    <div style={{
      background: '#ffffff',
      border: '1px solid #e8e8e8',
      borderRadius: '14px',
      padding: '2rem 2.25rem',
      marginBottom: '1.25rem',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      width: '100%',
      boxSizing: 'border-box',
    }}>
      <div className="animate-pulse" style={{ flex: 1 }}>
        <div style={{ height: 16, width: '50%', background: '#e5e7eb', borderRadius: 4, marginBottom: 12 }}></div>
        <div style={{ height: 12, width: '30%', background: '#e5e7eb', borderRadius: 4, marginBottom: 8 }}></div>
        <div style={{ height: 10, width: '20%', background: '#e5e7eb', borderRadius: 4 }}></div>
      </div>
      <div className="animate-pulse" style={{ width: '80px', textAlign: 'right' }}>
        <div style={{ height: 14, width: 60, background: '#e5e7eb', borderRadius: 4, marginBottom: 8, marginLeft: 'auto' }}></div>
        <div style={{ height: 24, width: 70, background: '#e5e7eb', borderRadius: 4, marginLeft: 'auto' }}></div>
      </div>
    </div>
  );
}

function EmptyContracts({ title, subtitle }) {
  return (
    <div style={{
      textAlign: 'center',
      padding: '4rem 1rem',
      background: '#ffffff',
      border: '1px solid #e8e8e8',
      borderRadius: '14px',
      width: '100%',
      boxSizing: 'border-box',
    }}>
      <div style={{
        display: 'inline-flex',
        padding: 16,
        background: '#fcfaf6',
        borderRadius: '50%',
        marginBottom: 16,
        color: '#B7A06A',
      }}>
        <Briefcase style={{ width: 40, height: 40 }} />
      </div>
      <h3 style={{
        fontSize: '17px',
        fontWeight: '600',
        color: '#1a1a1a',
        margin: '0 0 6px',
      }}>
        {title}
      </h3>
      <p style={{ fontSize: '14px', color: '#888', margin: 0 }}>
        {subtitle}
      </p>
    </div>
  );
}

const getInitials = (name) => {
  if (!name) return '?';
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
};

const formatDate = (dateStr) => {
  if (!dateStr) return 'N/A';
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
};

export default function MyContractsPage() {
  const navigate = useNavigate();
  const [contracts, setContracts] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('active'); // 'active' | 'closed'

  const fetchContracts = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await contractsService.getMyContracts({ page, limit: 10 });
      const dataPayload = result;
      const items = dataPayload?.items || dataPayload?.Items || (Array.isArray(dataPayload) ? dataPayload : []);
      const totalCount = dataPayload?.totalCount || dataPayload?.TotalCount || 0;
      const pages = Math.ceil(totalCount / 10) || 1;

      setContracts(items.map(normalize));
      setTotalPages(pages);
    } catch (err) {
      console.error('[MyContractsPage] fetch error:', err);
      setError(err.response?.data?.message || err.message || 'Failed to load contracts.');
      setContracts([]);
    } finally {
      setLoading(false);
    }
  }, [page]);

  useEffect(() => {
    let active = true;
    const load = async () => {
      await Promise.resolve();
      if (active) {
        fetchContracts();
      }
    };
    load();
    return () => {
      active = false;
    };
  }, [fetchContracts]);

  const activeContracts = contracts.filter((c) => isActive(c.status));
  const closedContracts = contracts.filter((c) => !isActive(c.status));
  const displayedContracts = activeTab === 'active' ? activeContracts : closedContracts;

  const renderContract = (contract) => {
    const cId = contract.id || contract.Id;
    const isActiveContract = isActive(contract.status);
    const badge = isActiveContract
      ? { background: '#EAF3DE', color: '#3B6D11', label: 'Active' }
      : { background: '#F1EFE8', color: '#5F5E5A', label: 'Closed' };

    return (
      <div
        key={cId}
        style={{
          background: '#ffffff',
          border: '1px solid #e8e8e8',
          borderRadius: '14px',
          padding: '2rem 2.25rem',
          marginBottom: '1.25rem',
          transition: 'box-shadow 0.2s, transform 0.2s',
          cursor: 'pointer',
          width: '100%',
          boxSizing: 'border-box',
        }}
        onClick={() => navigate(`/client/contracts/${cId}`)}
        onMouseEnter={e => {
          e.currentTarget.style.boxShadow = '0 4px 20px rgba(0,0,0,0.07)';
          e.currentTarget.style.transform = 'translateY(-2px)';
        }}
        onMouseLeave={e => {
          e.currentTarget.style.boxShadow = 'none';
          e.currentTarget.style.transform = 'none';
        }}
      >
        {/* Top row — Freelancer info + Agreed rate */}
        <div style={{
          display: 'flex',
          alignItems: 'flex-start',
          justifyContent: 'space-between',
          width: '100%',
        }}>
          {/* Left — avatar + name */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={{
              width: '52px',
              height: '52px',
              borderRadius: '50%',
              background: '#EEEDFE',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '16px',
              fontWeight: '600',
              color: '#3C3489',
              flexShrink: 0,
            }}>
              {getInitials(contract.freelancerName)}
            </div>
            <div>
              <h3 style={{ fontSize: '17px', fontWeight: '600', color: '#1a1a1a', margin: '0 0 4px' }}>
                {contract.title}
              </h3>
              <p style={{ fontSize: '13px', color: '#666', margin: '0 0 2px' }}>
                Freelancer: <span style={{ fontWeight: '500', color: '#1a1a1a' }}>{contract.freelancerName}</span>
              </p>
              <p style={{ fontSize: '13px', color: '#999', margin: 0 }}>
                Started {formatDate(contract.startedAt)}
              </p>
            </div>
          </div>

          {/* Right — agreed rate */}
          <div style={{ textAlign: 'right' }}>
            <p style={{ fontSize: '12px', color: '#999', margin: '0 0 4px', letterSpacing: '0.02em' }}>
              Agreed rate
            </p>
            <p style={{ fontSize: '24px', fontWeight: '600', color: '#1a1a1a', margin: 0, lineHeight: 1 }}>
              {contract.agreedRate.toLocaleString()}{' '}
              <span style={{ fontSize: '13px', color: '#999', fontWeight: '400' }}>EGP</span>
            </p>
          </div>
        </div>

        {/* Bottom row — Status badge + Action buttons */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          borderTop: '1px solid #f0f0f0',
          paddingTop: '1.25rem',
          marginTop: '1.25rem',
          width: '100%',
        }}>
          <div>
            <span style={{
              fontSize: '12px',
              padding: '4px 14px',
              borderRadius: '99px',
              background: badge.background,
              color: badge.color,
              fontWeight: '500',
            }}>
              {badge.label}
            </span>
          </div>
          <div>
            <button
              onClick={(e) => {
                e.stopPropagation();
                navigate(`/client/contracts/${cId}`);
              }}
              style={{
                padding: '9px 24px',
                borderRadius: '8px',
                fontSize: '14px',
                cursor: 'pointer',
                border: '1px solid #B7A06A',
                background: '#B7A06A',
                color: '#fff',
                fontWeight: '500',
                transition: 'background 0.15s',
              }}
              onMouseEnter={e => e.currentTarget.style.background = '#a08d5a'}
              onMouseLeave={e => e.currentTarget.style.background = '#B7A06A'}
            >
              View Details
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div style={{ maxWidth: '850px', width: '100%', margin: '0 auto', padding: '2.5rem 3rem', boxSizing: 'border-box' }}>
      
      {/* Back button */}
      <button
        onClick={() => navigate('/client/dashboard')}
        style={{
          fontSize: '13px',
          color: 'var(--color-text-secondary)',
          display: 'flex',
          alignItems: 'center',
          gap: '4px',
          marginBottom: '1rem',
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          padding: 0,
        }}
      >
        ← Back to dashboard
      </button>

      {/* Page Title */}
      <div style={{ marginBottom: '1.5rem' }}>
        <h1 style={{ fontSize: '22px', fontWeight: '500', color: 'var(--color-text-primary)', margin: '0 0 4px' }}>
          My Contracts
        </h1>
        <p style={{ fontSize: '13px', color: 'var(--color-text-secondary)', margin: 0 }}>
          {activeTab === 'active' ? 'Manage your active contracts' : 'View your completed and closed contracts'}
        </p>
      </div>

      {/* Tabs */}
      <div style={{
        display: 'flex',
        borderBottom: '1px solid #e8e8e8',
        marginBottom: '1.75rem',
        width: '100%',
      }}>
        {[
          { id: 'active', label: 'Active' },
          { id: 'closed', label: 'Closed' }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            style={{
              padding: '0.6rem 1.25rem',
              fontSize: '14px',
              fontWeight: activeTab === tab.id ? '600' : '400',
              color: activeTab === tab.id ? '#B7A06A' : '#888',
              background: 'none',
              border: 'none',
              borderBottom: activeTab === tab.id ? '2px solid #B7A06A' : '2px solid transparent',
              cursor: 'pointer',
              fontFamily: 'inherit',
              marginBottom: '-1px',
              textTransform: 'none',
              transition: 'color 0.15s',
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Error */}
      {error && (
        <div style={{ color: 'var(--color-text-danger)', padding: '1rem 0', fontSize: '14px', textAlign: 'center' }}>
          {error}
        </div>
      )}

      {/* Content */}
      <div style={{ minHeight: '300px', width: '100%' }}>
        {loading ? (
          <>
            <ContractSkeleton />
            <ContractSkeleton />
            <ContractSkeleton />
          </>
        ) : displayedContracts.length === 0 ? (
          <EmptyContracts
            title={activeTab === 'active' ? 'No active contracts yet' : 'No closed contracts yet'}
            subtitle={
              activeTab === 'active'
                ? 'Once you hire a freelancer, the contract will appear here.'
                : 'Closed and finished contracts will appear here.'
            }
          />
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', width: '100%', boxSizing: 'border-box' }}>
            {displayedContracts.map(renderContract)}
          </div>
        )}
      </div>

      <div style={{ marginTop: '2rem', display: 'flex', justifyContent: 'center' }}>
        <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
      </div>
    </div>
  );
}
