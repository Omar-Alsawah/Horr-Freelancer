import { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { Briefcase } from 'lucide-react';
import toast from 'react-hot-toast';
import { contractsApi } from '../../api/contracts';
import Pagination from '../jobs/Pagination';

function formatEgp(amount, lang) {
  if (amount == null) return '';
  const n = Number(amount);
  if (lang === 'ar') return `${new Intl.NumberFormat('ar-EG').format(n)} ج.م`;
  return `EGP ${new Intl.NumberFormat('en-EG').format(n)}`;
}

function ContractSkeleton() {
  return (
    <div className="contract-item" style={{ cursor: 'default', pointerEvents: 'none' }}>
      <div className="contract-info animate-pulse" style={{ flex: 1 }}>
        <div style={{ height: 16, width: '60%', background: '#e5e7eb', borderRadius: 4, marginBottom: 8 }}></div>
        <div style={{ height: 12, width: '40%', background: '#e5e7eb', borderRadius: 4, marginBottom: 6 }}></div>
        <div style={{ height: 10, width: '30%', background: '#e5e7eb', borderRadius: 4 }}></div>
      </div>
      <div className="contract-meta animate-pulse">
        <div style={{ height: 14, width: 60, background: '#e5e7eb', borderRadius: 4, marginBottom: 6, marginLeft: 'auto' }}></div>
        <div style={{ height: 20, width: 50, background: '#e5e7eb', borderRadius: 12, marginLeft: 'auto' }}></div>
      </div>
    </div>
  );
}

function EmptyContracts({ title, subtitle }) {
  return (
    <div className="empty-state">
      <div style={{ display: 'inline-flex', padding: 16, background: '#f3f4f6', borderRadius: '50%', marginBottom: 16 }}>
        <Briefcase style={{ width: 40, height: 40, color: '#9ca3af' }} />
      </div>
      <h3 style={{ fontSize: '1.1rem', fontWeight: 600, color: '#374151', marginBottom: 4 }}>{title}</h3>
      <p style={{ fontSize: '0.9rem', color: '#6b7280' }}>{subtitle}</p>
    </div>
  );
}

export default function MyContractsPage() {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const lang = i18n.language;

  const [activeTab, setActiveTab] = useState('active');
  const [contracts, setContracts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const limit = 10;

  const fetchContracts = useCallback(async () => {
    setLoading(true);
    try {
      const res = await contractsApi.getMyContracts({ page, limit });
      const dataPayload = res.data?.data || res.data;
      const items = dataPayload?.items || dataPayload?.Items || (Array.isArray(dataPayload) ? dataPayload : []);
      const totalCount = dataPayload?.totalCount || dataPayload?.TotalCount || 0;
      const pages = Math.ceil(totalCount / limit) || 1;
      setContracts(items);
      setTotalPages(pages);
    } catch (err) {
      toast.error(err.title || t('common.error'));
      setContracts([]);
    } finally {
      setLoading(false);
    }
  }, [page, limit, t]);

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

  const activeContracts = contracts.filter(c => {
    const statusVal = c.status !== undefined ? c.status : c.Status;
    const status = String(statusVal != null ? statusVal : '').toLowerCase();
    return status === 'active' || status === '1';
  });
  const closedContracts = contracts.filter(c => {
    const statusVal = c.status !== undefined ? c.status : c.Status;
    const status = String(statusVal != null ? statusVal : '').toLowerCase();
    return status !== 'active' && status !== '1';
  });
  const displayedContracts = activeTab === 'active' ? activeContracts : closedContracts;

  const renderContract = (contract) => {
    const cId = contract.id || contract.Id;
    const statusVal = contract.status !== undefined ? contract.status : contract.Status;
    const statusStr = String(statusVal != null ? statusVal : '').toLowerCase();
    const isActive = statusStr === 'active' || statusStr === '1';
    const title = contract.proposal_Title || contract.proposalTitle || contract.jobTitle || contract.JobTitle || contract.title || 'Contract';
    const clientName = contract.client_Name || contract.clientName || contract.Client_Name || 'Client';
    const rate = contract.agreedRate || contract.AgreedRate;
    const started = contract.startedAt || contract.startDate || contract.StartedAt;
    const formattedStartDate = started ? new Date(started).toLocaleDateString() : 'N/A';

    return (
      <div
        key={cId}
        className="contract-item"
        onClick={() => isActive ? navigate(`/contracts/${cId}`) : null}
        style={{ cursor: isActive ? 'pointer' : 'default' }}
      >
        <div className="contract-info">
          <h3>{title}</h3>
          <div className="client-info">{t('contracts.client')}: {clientName}</div>
          <div className="date-range">
            {t('contracts.started')}: {formattedStartDate}
          </div>
        </div>
        <div className="contract-meta">
          <div className="contract-rate">{formatEgp(rate, lang)}</div>
          <span className={`contract-status ${isActive ? 'status-active' : 'status-closed'}`}>
            {isActive ? t('contracts.status_active') : t('contracts.status_closed')}
          </span>
          {isActive && (
            <button
              className="view-details-btn"
              onClick={(e) => { e.stopPropagation(); navigate(`/contracts/${cId}`); }}
            >
              {t('contracts.view_details')}
            </button>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="main-container">
      <div className="content-card">
        {/* Tabs */}
        <div className="tabs-header">
          <button
            className={`tab-btn ${activeTab === 'active' ? 'active' : ''}`}
            onClick={() => setActiveTab('active')}
          >
            {t('contracts.tab_active')}
          </button>
          <button
            className={`tab-btn ${activeTab === 'closed' ? 'active' : ''}`}
            onClick={() => setActiveTab('closed')}
          >
            {t('contracts.tab_closed')}
          </button>
        </div>

        {/* Content */}
        <div className="tab-content active">
          <h1 className="page-title">
            {activeTab === 'active' ? t('contracts.active_title') : t('contracts.closed_title')}
          </h1>

          <div className="contract-list">
            {loading ? (
              <>
                <ContractSkeleton />
                <ContractSkeleton />
                <ContractSkeleton />
              </>
            ) : displayedContracts.length === 0 ? (
              <EmptyContracts
                title={activeTab === 'active' ? t('contracts.empty_active_title') : t('contracts.empty_closed_title')}
                subtitle={activeTab === 'active' ? t('contracts.empty_active_subtitle') : t('contracts.empty_closed_subtitle')}
              />
            ) : (
              displayedContracts.map(renderContract)
            )}
          </div>
        </div>
      </div>

      <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
    </div>
  );
}
