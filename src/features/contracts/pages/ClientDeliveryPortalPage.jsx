import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { toast } from 'sonner';
import { ArrowLeft, Clock, CheckCircle2, Archive, RefreshCcw, X, Loader2 } from 'lucide-react';
import { useContractQuery, useContractDeliveriesQuery, useDownloadAttachmentMutation } from '../../../hooks/useClientContractDelivery';
import { contractsService } from '../../../services/contractsService';
import DeliveryHistory from '../components/DeliveryHistory';

export default function ClientDeliveryPortalPage() {
  const { id: contractId } = useParams();

  const { data: contract, loading: contractLoading, refetch: refetchContract } = useContractQuery(contractId);
  const { data: deliveries, loading: deliveriesLoading, refetch: refetchDeliveries } = useContractDeliveriesQuery(contractId);
  const { mutate: downloadAttachment } = useDownloadAttachmentMutation();

  const [isAdditionalModalOpen, setIsAdditionalModalOpen] = useState(false);
  const [requestedCount, setRequestedCount] = useState(2);
  const [additionalReason, setAdditionalReason] = useState('');
  const [additionalError, setAdditionalError] = useState('');
  const [isSubmittingAdditional, setIsSubmittingAdditional] = useState(false);

  const isLoading = contractLoading || deliveriesLoading;

  // Helpers
  const statusStr = String(contract?.status ?? contract?.Status ?? '').toLowerCase();
  const isActive = statusStr === 'active' || statusStr === '1';
  const isCompleted = ['completed', 'closed', '2', '5'].includes(statusStr);
  const hasPending = deliveries?.some(d => {
    const s = String(d.status ?? d.Status ?? '').toLowerCase();
    return s === 'pending' || s === '0';
  });
  const pendingDelivery = deliveries?.find(d => {
    const s = String(d.status ?? d.Status ?? '').toLowerCase();
    return s === 'pending' || s === '0';
  });
  const isPendingPaused = pendingDelivery?.isPaused || pendingDelivery?.IsPaused;
  const pendingPauseReason = pendingDelivery?.pauseReason || pendingDelivery?.PauseReason;

  const sortedDeliveriesForId = deliveries ? [...deliveries].sort((a, b) => {
    const dateB = b.submittedAt || b.SubmittedAt || b.submissionDate || b.date;
    const dateA = a.submittedAt || a.SubmittedAt || a.submissionDate || a.date;
    return new Date(dateB).getTime() - new Date(dateA).getTime();
  }) : [];
  const latestDeliveryId = pendingDelivery?.id || sortedDeliveriesForId[0]?.id;
 
  const maxRevisions = contract?.maxRevisions ?? contract?.MaxRevisions ?? 0;
  const totalRevisionsRequested = deliveries?.reduce((sum, d) => {
    const revs = d.revisionRequests || d.RevisionRequests || [];
    let count = Array.isArray(revs) ? revs.length : 0;
    if (d.revisionRequest || d.RevisionRequest) count += 1;
    return sum + count;
  }, 0) || 0;
  const revisionsRemaining = Math.max(0, maxRevisions - totalRevisionsRequested);
  const isZeroRevisions = revisionsRemaining === 0;

  // Handlers
  const handleApprove = async (deliveryId) => {
    try {
      await contractsService.approveDelivery(deliveryId);
      toast.success('Delivery approved!');
      refetchContract();
      refetchDeliveries();
    } catch (err) {
      toast.error(err.response?.data?.message || err.message || 'Failed to approve delivery.');
    }
  };

  const handleRevision = async (deliveryId, reason) => {
    try {
      await contractsService.requestRevision(deliveryId, { reason });
      toast.success('Revision requested successfully!');
      refetchContract();
      refetchDeliveries();
    } catch (err) {
      toast.error(err.response?.data?.message || err.message || 'Failed to request revision.');
      throw err;
    }
  };

  const handleDispute = async (deliveryId, reason) => {
    try {
      await contractsService.openDispute(deliveryId, { reason });
      toast.success('Dispute opened successfully!');
      refetchContract();
      refetchDeliveries();
    } catch (err) {
      toast.error(err.response?.data?.message || err.message || 'Failed to open dispute.');
    }
  };

  const handleRequestAdditionalRevisions = async () => {
    if (!additionalReason.trim()) {
      setAdditionalError('Please enter a reason for requesting additional revisions.');
      return;
    }
    if (!latestDeliveryId) {
      toast.error('No delivery available to request revisions for.');
      return;
    }
    setAdditionalError('');
    setIsSubmittingAdditional(true);
    try {
      await contractsService.requestAdditionalRevisions({
        deliveryId: latestDeliveryId,
        requestedCount: Number(requestedCount),
        reason: additionalReason.trim()
      });
      toast.success('Additional revisions requested successfully!');
      setIsAdditionalModalOpen(false);
      setAdditionalReason('');
      refetchContract();
      refetchDeliveries();
    } catch (err) {
      setAdditionalError(err.response?.data?.message || err.message || 'Failed to request additional revisions.');
    } finally {
      setIsSubmittingAdditional(false);
    }
  };

  if (isLoading) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-8 w-full animate-pulse">
        <div className="h-6 w-48 bg-gray-200 rounded mb-6"></div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-4">
            <div className="h-40 bg-gray-200 rounded-xl"></div>
            <div className="h-40 bg-gray-200 rounded-xl"></div>
          </div>
          <div className="lg:col-span-1">
            <div className="h-48 bg-gray-200 rounded-xl"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 w-full">
      <Link 
        to={`/client/contracts/${contractId}`} 
        className="inline-flex items-center gap-1.5 text-accent font-semibold text-sm mb-6 hover:underline"
        style={{ color: 'var(--accent)' }}
      >
        <ArrowLeft size={16} /> Back to Contract Details
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2">
          {(!deliveries || deliveries.length === 0) ? (
            <div className="bg-white border border-gray-200 rounded-2xl p-8 text-center flex flex-col items-center justify-center">
              <div className="inline-flex p-3 bg-gray-50 border border-gray-100 rounded-2xl mb-3 text-gray-400">
                <Archive className="h-8 w-8" />
              </div>
              <h3 className="text-base font-semibold text-gray-800 mb-1">
                No deliveries yet
              </h3>
              <p className="text-sm text-gray-500 max-w-xs">
                The freelancer has not submitted any deliverables yet.
              </p>
            </div>
          ) : (
            <DeliveryHistory
              deliveries={deliveries}
              isLoading={false}
              role="Client"
              onApprove={!isCompleted ? handleApprove : undefined}
              onRevision={!isCompleted ? handleRevision : undefined}
              onDispute={!isCompleted ? handleDispute : undefined}
              onDownloadAttachment={(id, name) => downloadAttachment(id, name)}
              onRefresh={() => { refetchContract(); refetchDeliveries(); }}
              isRevisionDisabled={isZeroRevisions}
            />
          )}
        </div>

        {/* Sidebar */}
        <div className="lg:col-span-1 space-y-4">
          {isActive && hasPending && (
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-5 shadow-sm relative overflow-hidden">
              {isPendingPaused ? (
                <>
                  <div className="flex items-center gap-2 text-amber-850 mb-2">
                    <Clock className="h-5 w-5 text-amber-605" />
                    <h3 className="font-semibold text-sm uppercase tracking-wide">Review Paused</h3>
                  </div>
                  <p className="text-amber-800 text-sm leading-relaxed">
                    {pendingPauseReason || 'Auto-approval worker is paused while a specialist review is in progress.'}
                  </p>
                </>
              ) : (
                <>
                  <div className="absolute top-0 right-0 p-3">
                    <span className="relative flex h-3 w-3">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-3 w-3 bg-amber-500"></span>
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-amber-800 mb-2">
                    <Clock className="h-5 w-5" />
                    <h3 className="font-semibold text-sm uppercase tracking-wide">Awaiting your review</h3>
                  </div>
                  <p className="text-amber-700 text-sm leading-relaxed">
                    You have 3 days to approve or request revisions before auto-approval.
                  </p>
                </>
              )}
            </div>
          )}

          {isCompleted && (
            <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-5 shadow-sm">
              <div className="flex items-center gap-2 text-emerald-800 mb-2">
                <CheckCircle2 className="h-5 w-5" />
                <h3 className="font-semibold text-sm uppercase tracking-wide">Contract Completed</h3>
              </div>
              <p className="text-emerald-700 text-sm leading-relaxed">
                This contract has been successfully completed. Deliveries are now read-only.
              </p>
            </div>
          )}

          {/* Revisions Info / Tracker */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-5 shadow-sm">
            <div className="flex items-center gap-2 text-slate-800 mb-2">
              <RefreshCcw className="h-5 w-5 text-amber-500" />
              <h3 className="font-semibold text-sm uppercase tracking-wide">Max Revisions Tracker</h3>
            </div>
            <div className="space-y-3">
              <div className="flex justify-between items-center text-xs text-slate-700">
                <span>Total Allowed:</span>
                <span className="font-bold">{maxRevisions}</span>
              </div>
              <div className="flex justify-between items-center text-xs text-slate-700">
                <span>Used Revisions:</span>
                <span className="font-bold text-amber-700">{totalRevisionsRequested}</span>
              </div>
              <div className="flex justify-between items-center text-xs text-slate-700 border-t border-slate-200 pt-2 font-semibold">
                <span>Remaining:</span>
                <span className={`text-sm ${revisionsRemaining === 0 ? 'text-rose-600 font-extrabold' : 'text-slate-800 font-bold'}`}>
                  {revisionsRemaining} allowed
                </span>
              </div>
              {isZeroRevisions && !isCompleted && latestDeliveryId && (
                <button
                  onClick={() => {
                    setAdditionalReason('');
                    setAdditionalError('');
                    setRequestedCount(2);
                    setIsAdditionalModalOpen(true);
                  }}
                  className="w-full mt-2 inline-flex items-center justify-center px-4 py-2 text-xs font-semibold rounded-lg text-white bg-slate-900 hover:bg-slate-800 shadow-sm transition animate-in fade-in duration-200"
                >
                  Request Additional Revisions
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Request Additional Revisions Modal */}
      {isAdditionalModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-100 max-w-lg w-full overflow-hidden animate-in zoom-in-95 duration-200 text-left">
            {/* Header */}
            <div className="p-5 border-b border-slate-100 flex items-center justify-between">
              <h3 className="text-lg font-bold text-slate-900">Request Additional Revisions</h3>
              <button
                onClick={() => setIsAdditionalModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-50 transition"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Content */}
            <div className="p-6 space-y-4">
              <div className="flex items-center gap-3">
                <span className="text-sm text-slate-700 font-semibold">Revisions Count:</span>
                <select
                  value={requestedCount}
                  onChange={(e) => setRequestedCount(Number(e.target.value))}
                  disabled={isSubmittingAdditional}
                  className="rounded-lg border-slate-200 shadow-sm p-1.5 text-sm bg-white outline-none border"
                >
                  <option value={1}>1 Revision</option>
                  <option value={2}>2 Revisions</option>
                  <option value={3}>3 Revisions</option>
                  <option value={5}>5 Revisions</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-400">
                  Reason for Request
                </label>
                <textarea
                  rows={4}
                  value={additionalReason}
                  onChange={(e) => setAdditionalReason(e.target.value)}
                  placeholder="State the reason why you need additional revisions..."
                  disabled={isSubmittingAdditional}
                  className="w-full rounded-xl border border-slate-200 shadow-sm p-3 text-sm focus:border-slate-800 focus:ring-slate-800 outline-none resize-none"
                />
                {additionalError && (
                  <p className="text-xs text-rose-600 font-semibold">{additionalError}</p>
                )}
              </div>

              {/* Footer Buttons */}
              <div className="flex justify-end gap-2.5 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsAdditionalModalOpen(false)}
                  className="px-4 py-2 text-sm font-semibold text-slate-600 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleRequestAdditionalRevisions}
                  disabled={isSubmittingAdditional}
                  className="px-5 py-2 text-sm font-semibold text-white bg-slate-900 rounded-xl hover:bg-slate-800 transition disabled:opacity-50 inline-flex items-center gap-1.5"
                >
                  {isSubmittingAdditional && <Loader2 className="h-4 w-4 animate-spin" />}
                  Submit Request
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
