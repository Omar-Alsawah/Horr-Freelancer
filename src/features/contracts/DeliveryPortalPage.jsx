import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { 
  ArrowLeft, ArrowRight, Info, AlertTriangle, 
  Sparkles, ShieldCheck, Clock, RefreshCw
} from 'lucide-react';
import toast from 'react-hot-toast';
import axios from 'axios';
import { useAuthStore } from '../../store/authStore';
import { 
  useContractQuery, 
  useContractDeliveriesQuery, 
  useDeliverWorkMutation,
  useDownloadAttachmentMutation 
} from '../../hooks/useContractDelivery';
import { revisionsApi } from '../../api/revisions';
import { contractsApi } from '../../api/contracts';
import DeliveryHistory from './DeliveryHistory';
import DeliveryUploader from './DeliveryUploader';

export default function DeliveryPortalPage() {
  const { contractId } = useParams();
  const { t, i18n } = useTranslation();
  const role = useAuthStore((state) => state.role);
  
  // Queries
  const { 
    data: contract, 
    isLoading: contractLoading, 
    error: contractError, 
    refetch: refetchContract 
  } = useContractQuery(contractId);
  
  const { 
    data: deliveries, 
    isLoading: deliveriesLoading, 
    error: deliveriesError, 
    refetch: refetchDeliveries 
  } = useContractDeliveriesQuery(contractId);

  // Revisions State
  const [pendingAdditionalRequests, setPendingAdditionalRequests] = useState([]);

  // Mutations
  const { 
    mutate: submitWork, 
    isLoading: isSubmitting, 
    error: submitError,
    uploadProgress 
  } = useDeliverWorkMutation();



  const {
    mutate: downloadAttachment
  } = useDownloadAttachmentMutation();

  const isRtl = i18n.language === 'ar';
  const isFreelancer = role === 'Freelancer';

  // Fetch pending additional revision requests
  useEffect(() => {
    const controller = new AbortController();
    if (isFreelancer) {
      revisionsApi.getPendingAdditionalRevisions({ signal: controller.signal })
        .then(res => {
          setPendingAdditionalRequests(res.data?.data || res.data || []);
        })
        .catch(err => {
          if (axios.isCancel(err)) return;
          console.error('Failed to fetch pending additional revisions:', err);
        });
    }
    return () => controller.abort();
  }, [isFreelancer, contractId]);

  const formatCurrency = (amount) => {
    if (amount == null) return '';
    const n = Number(amount);
    if (i18n.language === 'ar') return `${new Intl.NumberFormat('ar-EG').format(n)} ج.م`;
    return `EGP ${new Intl.NumberFormat('en-EG').format(n)}`;
  };

  const handleFreelancerSubmit = async (payload) => {
    try {
      await submitWork({
        contractId,
        ...payload
      });
      // Invalidate queries / Refresh state
      refetchContract();
      refetchDeliveries();
      if (isFreelancer) {
        revisionsApi.getPendingAdditionalRevisions()
          .then(res => {
            setPendingAdditionalRequests(res.data?.data || res.data || []);
          });
      }
    } catch {
      // toast error handled in hook
    }
  };

  const handleAdditionalRevisionResponse = async (requestId, accept) => {
    try {
      await revisionsApi.respondToAdditionalRevision(requestId, accept);
      toast.success(accept ? 'Request accepted!' : 'Request declined!');
      const res = await revisionsApi.getPendingAdditionalRevisions();
      setPendingAdditionalRequests(res.data?.data || res.data || []);
      refetchContract();
      refetchDeliveries();
    } catch (err) {
      toast.error(err.response?.data?.message || err.message || 'Failed to respond to request.');
    }
  };

  const handleDownloadAttachment = async (attachmentId, filename) => {
    // Determine the delivery containing this attachment to pass its ID
    const delivery = deliveries.find(d => {
      const atts = d.attachments || d.files || [];
      return atts.some(a => a.id === attachmentId);
    });
    
    if (!delivery) {
      toast.error('Attachment metadata not found.');
      return;
    }

    try {
      await downloadAttachment(contractId, delivery.id, attachmentId, filename);
    } catch {
      // toast error handled in hook
    }
  };

  const handleApprove = async (deliveryId) => {
    try {
      await contractsApi.approveDelivery(deliveryId);
      toast.success(t('delivery.review.approveSuccess', 'Delivery approved successfully!'));
      refetchContract();
      refetchDeliveries();
    } catch (err) {
      toast.error(err.title || t('common.error'));
    }
  };

  const handleRevision = async (deliveryId, reason) => {
    try {
      await contractsApi.requestDeliveryRevision(deliveryId, { reason });
      toast.success(t('delivery.review.revisionSuccess', 'Revision requested successfully!'));
      refetchContract();
      refetchDeliveries();
    } catch (err) {
      toast.error(err.title || t('common.error'));
    }
  };

  const handleDispute = async (deliveryId, reason) => {
    try {
      await contractsApi.disputeDelivery(deliveryId, { contractId: Number(contractId), reason });
      toast.success(t('delivery.review.disputeSuccess', 'Dispute opened successfully!'));
      refetchContract();
      refetchDeliveries();
    } catch (err) {
      toast.error(err.title || t('common.error'));
    }
  };

  if (contractError || deliveriesError) {
    return (
      <div className="max-w-3xl mx-auto my-12 p-8 bg-rose-50 rounded-2xl border border-rose-100 text-center flex flex-col items-center justify-center" dir={isRtl ? 'rtl' : 'ltr'}>
        <AlertTriangle className="w-14 h-14 text-rose-500 mb-4" />
        <h2 className="text-xl font-bold text-rose-950 mb-2">
          {t('common.error', 'Error Loading Portal')}
        </h2>
        <p className="text-sm text-rose-700 mb-6">
          {(contractError?.title || deliveriesError?.title) || t('errors.unexpected', 'Failed to synchronize with server.')}
        </p>
        <button 
          onClick={() => { refetchContract(); refetchDeliveries(); }}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-semibold rounded-xl text-white bg-slate-900 hover:bg-slate-800 transition shadow-sm"
        >
          <RefreshCw className="w-4 h-4 mr-1.5" />
          {t('common.retry', 'Retry')}
        </button>
      </div>
    );
  }

  const isLoading = contractLoading || deliveriesLoading;

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-12 space-y-6 animate-pulse" dir={isRtl ? 'rtl' : 'ltr'}>
        <div className="h-6 w-32 bg-gray-250 rounded"></div>
        <div className="h-44 bg-gray-200 rounded-2xl"></div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-4">
            <div className="h-8 bg-gray-200 rounded w-1/4"></div>
            <div className="h-32 bg-gray-200 rounded-2xl"></div>
          </div>
          <div className="lg:col-span-1 h-64 bg-gray-200 rounded-2xl"></div>
        </div>
      </div>
    );
  }

  if (!contract) return null;

  // State calculations
  const hasPendingDelivery = deliveries.some((d) => {
    const status = String(d.status || d.Status || '').toLowerCase();
    return status === 'pending' || status === '0';
  });
  const pendingDelivery = deliveries.find((d) => {
    const status = String(d.status || d.Status || '').toLowerCase();
    return status === 'pending' || status === '0';
  });
  const isPendingPaused = pendingDelivery?.isPaused || pendingDelivery?.IsPaused;
  const pendingPauseReason = pendingDelivery?.pauseReason || pendingDelivery?.PauseReason;
  const statusVal = contract.status !== undefined ? contract.status : contract.Status;
  const statusStr = String(statusVal != null ? statusVal : '').toLowerCase();
  const isActive = statusStr === 'active' || statusStr === '1';
  const isCompleted = statusStr === 'completed' || statusStr === 'closed' || statusStr === '2' || statusStr === '5';
  const activeRevisionDelivery = deliveries.find(d => String(d.status || d.Status || '').toLowerCase() === 'revisionrequested');
  const pendingAdditionalRequest = pendingAdditionalRequests.find(req => deliveries?.some(d => d.id === req.deliveryId));

  const cId = contract.id || contract.Id;
  const title = contract.proposal_Title || contract.proposalTitle || contract.jobTitle || contract.JobTitle || contract.title || 'Contract';
  const clientName = contract.client_Name || contract.clientName || contract.Client_Name || 'Client';
  const rate = contract.agreedRate || contract.AgreedRate;
  const started = contract.startedAt || contract.startDate || contract.StartedAt;
  const formattedStartDate = started ? new Date(started).toLocaleDateString() : 'N/A';
  const milestones = contract.milestones || contract.Milestones || [];

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-6" dir={isRtl ? 'rtl' : 'ltr'}>
      {/* Top Breadcrumb Navigation */}
      <div className="flex items-center">
        <Link 
          to={`/contracts/${cId}`} 
          className="inline-flex items-center text-sm font-semibold text-slate-650 hover:text-amber-500 transition-colors gap-1.5"
        >
          {isRtl ? <ArrowRight className="h-4 w-4" /> : <ArrowLeft className="h-4 w-4" />}
          {t('contracts.back_to_contract_details', 'Back to Contract Details')}
        </Link>
      </div>

      {/* Contract Banner Details */}
      <div className="bg-slate-900 text-white rounded-2xl shadow-xl p-6 sm:p-8 flex flex-col md:flex-row justify-between gap-6 border border-slate-800 relative overflow-hidden">
        <div className="absolute right-0 top-0 h-full w-1/3 bg-gradient-to-l from-amber-500/10 to-transparent pointer-events-none" />
        <div className="space-y-4 max-w-3xl">
          <div className="flex flex-wrap items-center gap-2">
            <span className={`text-xs font-bold uppercase px-3 py-1 rounded-full tracking-wider ${
              isActive 
                ? 'bg-amber-500/20 text-amber-400' 
                : 'bg-green-500/20 text-green-400'
            }`}>
              {isActive ? t('contracts.status_active', 'Active') : t('contracts.status_closed', 'Completed')}
            </span>
            <span className="text-xs font-bold uppercase bg-slate-800 text-slate-350 px-3 py-1 rounded-full tracking-wider flex items-center gap-1">
              <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />
              {isFreelancer ? t('escrow.freelancerView', 'Freelancer View') : t('escrow.clientView', 'Client View')}
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            {title}
          </h1>
          <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-slate-350">
            <div>
              <span className="font-medium text-slate-400">{t('contracts.client', 'Client')}: </span>
              <span className="text-white">{clientName}</span>
            </div>
            <div>
              <span className="font-medium text-slate-400">{t('contracts.start_date', 'Started')}: </span>
              <span className="text-white">{formattedStartDate}</span>
            </div>
          </div>
        </div>
        <div className="flex flex-col justify-end md:items-end flex-shrink-0 space-y-1">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
            {t('contracts.price', 'Contract Budget')}
          </span>
          <span className="text-2xl sm:text-3xl font-black text-amber-400">
            {formatCurrency(rate)}
          </span>
        </div>
      </div>

      {/* Portal Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Main Column - Deliveries Timeline */}
        <div className="lg:col-span-2 space-y-6">
          <DeliveryHistory
            deliveries={deliveries}
            isLoading={isLoading}
            role={role}
            onApprove={handleApprove}
            onRevision={handleRevision}
            onDispute={handleDispute}
            onDownloadAttachment={handleDownloadAttachment}
          />
        </div>

        {/* Sidebar Column - Actions */}
        <div className="lg:col-span-1 space-y-6">
          
          {/* Freelancer View Sidebar */}
          {isFreelancer && (
            <div className="space-y-6">
              
              {/* Additional Revisions Request Card (Step 6) */}
              {pendingAdditionalRequest && (
                <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 space-y-4">
                  <h4 className="font-bold text-slate-900 text-sm flex items-center gap-1.5">
                    <Info className="h-4 w-4 text-amber-500" />
                    Request for Additional Revisions
                  </h4>
                  <p className="text-xs text-slate-700 leading-relaxed">
                    Client is requesting <strong>{pendingAdditionalRequest.requestedCount}</strong> more revisions for: 
                    <em className="block mt-1 bg-white p-2 rounded border border-slate-200 font-medium text-left">{pendingAdditionalRequest.reason}</em>
                  </p>
                  <div className="flex gap-2 text-xs">
                    <button 
                      onClick={() => handleAdditionalRevisionResponse(pendingAdditionalRequest.id, true)} 
                      className="flex-1 bg-slate-900 text-white font-bold py-2 rounded-lg hover:bg-slate-800 transition"
                    >
                      Accept
                    </button>
                    <button 
                      onClick={() => handleAdditionalRevisionResponse(pendingAdditionalRequest.id, false)} 
                      className="flex-1 bg-white text-slate-800 border border-slate-350 font-bold py-2 rounded-lg hover:bg-slate-50 transition"
                    >
                      Decline
                    </button>
                  </div>
                </div>
              )}

              {/* In Dispute -> Show Warning Banner instead of uploader/revision forms */}
              {contract.inDispute ? (
                <div className="bg-white rounded-2xl shadow-sm border border-red-200 p-5 sm:p-6 space-y-4">
                  <div className="flex items-center gap-1.5 text-red-650">
                    <AlertTriangle className="h-5 w-5 text-red-600" />
                    <h3 className="text-lg font-bold text-gray-850">
                      Submission Blocked
                    </h3>
                  </div>
                  <p className="text-xs text-red-800 leading-relaxed font-medium bg-red-50 p-3.5 rounded-xl border border-red-100">
                    This contract is currently in dispute. Freelancers are prohibited from submitting any new deliverables or uploading files on a contract that is currently in dispute.
                  </p>
                </div>
              ) : (
                <>
                  {/* Active & Revision Requested -> Show Revision Instructions + Re-upload Area */}
                  {isActive && activeRevisionDelivery && (
                    <div className="bg-white rounded-2xl shadow-sm border border-amber-200 p-5 sm:p-6 space-y-5 text-left">
                      <div className="space-y-1">
                        <div className="flex items-center gap-1.5 text-amber-600">
                          <Sparkles className="h-5 w-5" />
                          <h3 className="text-lg font-bold text-gray-850">
                            Submit Revision
                          </h3>
                        </div>
                        <p className="text-xs text-gray-500">
                          Upload your updated work and notes in response to the client's revision request.
                        </p>
                      </div>

                      <div className="bg-amber-50 p-4 rounded-xl border border-amber-200 text-xs text-amber-900 space-y-1.5">
                        <span className="font-bold block">⚠️ Revision Feedback:</span>
                        <p className="leading-relaxed bg-white p-2.5 rounded border border-amber-100/60 font-medium">
                          {activeRevisionDelivery.revisionRequest?.reason || (Array.isArray(activeRevisionDelivery.revisionRequests) && activeRevisionDelivery.revisionRequests[activeRevisionDelivery.revisionRequests.length - 1]?.reason) || 'Please review the requested changes in the history log.'}
                        </p>
                      </div>

                      {submitError && (
                        <div className="bg-rose-50 border border-rose-100 rounded-xl p-4 flex items-start gap-2.5 text-rose-800 text-xs">
                          <AlertTriangle className="h-5 w-5 text-rose-500 flex-shrink-0 mt-0.5" />
                          <div>
                            <span className="font-bold block">Submission Blocked</span>
                            <span className="mt-0.5 block">{submitError.title || 'An error occurred during submission.'}</span>
                          </div>
                        </div>
                      )}

                      <DeliveryUploader
                        milestones={milestones}
                        onSubmit={handleFreelancerSubmit}
                        isSubmitting={isSubmitting}
                        uploadProgress={uploadProgress}
                        buttonLabel={t('delivery.submit_revision', 'Submit Revision')}
                      />
                    </div>
                  )}
                  
                  {/* Active & No Pending Delivery -> Show Submit Work Area */}
                  {isActive && !hasPendingDelivery && !activeRevisionDelivery && (
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-5 sm:p-6 space-y-5">
                      <div className="space-y-1">
                        <div className="flex items-center gap-1.5">
                          <Sparkles className="h-5 w-5 text-amber-500" />
                          <h3 className="text-lg font-bold text-gray-850">
                            {t('delivery.pageTitle', 'Submit Deliverables')}
                          </h3>
                        </div>
                        <p className="text-xs text-gray-500">
                          {t('delivery.history.freelancerDesc', 'Submit completed files and description to request milestone release.')}
                        </p>
                      </div>

                      {submitError && (
                        <div className="bg-rose-50 border border-rose-100 rounded-xl p-4 flex items-start gap-2.5 text-rose-800 text-xs">
                          <AlertTriangle className="h-5 w-5 text-rose-500 flex-shrink-0 mt-0.5" />
                          <div>
                            <span className="font-bold block">Submission Blocked</span>
                            <span className="mt-0.5 block">{submitError.title || 'An error occurred during submission.'}</span>
                          </div>
                        </div>
                      )}

                      <DeliveryUploader
                        milestones={milestones}
                        onSubmit={handleFreelancerSubmit}
                        isSubmitting={isSubmitting}
                        uploadProgress={uploadProgress}
                      />
                    </div>
                  )}
                </>
              )}

              {/* Active & Pending Delivery Submitted -> Show Under Review Status Card */}
              {isActive && hasPendingDelivery && (
                <div className="bg-white rounded-2xl shadow-sm border border-amber-200 p-6 text-center space-y-4 bg-amber-50/15 relative overflow-hidden">
                  <div className="absolute top-0 left-0 w-full h-1 bg-amber-400" />
                  <div className="inline-flex p-3 bg-amber-50 border border-amber-100 rounded-2xl text-amber-600">
                    <Clock className="h-7 w-7 animate-pulse" />
                  </div>
                  {isPendingPaused ? (
                    <div className="space-y-2">
                      <h3 className="text-lg font-bold text-gray-850">
                        {t('delivery.status.paused', 'Review Paused')}
                      </h3>
                      <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
                        {pendingPauseReason || t('delivery.uploader.pausedDesc', 'The automatic approval countdown is paused while a specialist review is being conducted.')}
                      </p>
                    </div>
                  ) : (
                    <>
                      <div className="space-y-2">
                        <h3 className="text-lg font-bold text-gray-850">
                          {t('delivery.status.pending', 'Under Review')}
                        </h3>
                        <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
                          {t('delivery.uploader.underReviewDesc', 'Your submission is currently pending review by the client. The client has 3 days to approve or request revisions.')}
                        </p>
                      </div>
                      <div className="text-xs text-gray-400 pt-2 border-t border-gray-100 font-medium">
                        {t('delivery.uploader.autoApproves', 'Auto-approves if no client action is taken within 3 days.')}
                      </div>
                    </>
                  )}
                </div>
              )}

              {/* Completed Contract State -> Show Read-Only Complete message */}
              {isCompleted && (
                <div className="bg-white rounded-2xl shadow-sm border border-green-200 p-6 text-center space-y-4 bg-green-50/15 relative overflow-hidden">
                  <div className="absolute top-0 left-0 w-full h-1 bg-green-500" />
                  <div className="inline-flex p-3 bg-green-50 border border-green-100 rounded-2xl text-green-600">
                    <ShieldCheck className="h-7 w-7" />
                  </div>
                  <div className="space-y-1">
                    <h3 className="text-lg font-bold text-gray-850">
                      {t('contracts.status_closed', 'Contract Completed')}
                    </h3>
                    <p className="text-xs sm:text-sm text-gray-500">
                      {t('contracts.contract_closed_notice', 'This contract is completed. You can no longer deliver work.')}
                    </p>
                  </div>
                </div>
              )}

            </div>
          )}

          {/* Client View Sidebar: Milestone / Escrow Snapshot */}
          {!isFreelancer && (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-5 sm:p-6 space-y-5">
              <div className="flex items-center gap-2">
                <Info className="h-5 w-5 text-amber-500" />
                <h3 className="text-lg font-bold text-gray-850">
                  {t('milestone.pageTitle', 'Milestone Status')}
                </h3>
              </div>
              <div className="space-y-3">
                {milestones.map((m) => {
                  const mId = m.id || m.Id;
                  const mTitle = m.title || m.Title;
                  const mDeadline = m.dueDate || m.DueDate || m.deadline;
                  const formattedDeadline = mDeadline ? new Date(mDeadline).toLocaleDateString() : 'N/A';
                  const mAmount = m.amount || m.Amount;
                  const mStatus = m.status || m.Status || '';

                  return (
                    <div key={mId} className="p-3 bg-gray-50 border border-gray-100 rounded-xl flex items-center justify-between text-sm">
                      <div>
                        <h4 className="font-semibold text-gray-850">{mTitle}</h4>
                        <span className="text-xs text-gray-500">{formattedDeadline}</span>
                      </div>
                      <div className="text-right">
                        <div className="font-bold text-gray-900">{formatCurrency(mAmount)}</div>
                        <span className={`text-xs font-semibold uppercase ${
                          mStatus === 'Released' 
                            ? 'text-green-600' 
                            : mStatus === 'Funded' 
                              ? 'text-blue-600' 
                              : 'text-amber-600'
                        }`}>
                          {mStatus}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Info Banner */}
          <div className="bg-amber-50/50 border border-amber-100 rounded-2xl p-4 flex items-start gap-3 text-amber-800 text-xs">
            <AlertTriangle className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
            <p className="leading-relaxed">
              {t('delivery.whatHappensNext', 'Once deliverables are submitted, the client has 3 days to review. If no action is taken, the milestone release triggers automatically.')}
            </p>
          </div>
        </div>

      </div>
    </div>
  );
}
