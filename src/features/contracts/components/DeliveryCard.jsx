import { useState } from 'react';
import { Check, Edit3, ShieldAlert, Loader2, Calendar, Sparkles, User, X, AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';
import { contractsService } from '../../../services/contractsService';
import DeliveryStatusBadge from './DeliveryStatusBadge';
import DeliveryFilesList from './DeliveryFilesList';

export default function DeliveryCard({ 
  delivery, 
  role, 
  onApprove, 
  onRevision, 
  onDispute, 
  onDownloadAttachment,
  onRefresh,
  isRevisionDisabled
}) {
    
  const [activeAction, setActiveAction] = useState(null); // 'REVISION' | 'DISPUTE' | 'ADDITIONAL_REVISION'
  const [reason, setReason] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [requestedCount, setRequestedCount] = useState(2);

  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [reviewerType, setReviewerType] = useState(null); // 'AI' | 'Human'
  const [requirements, setRequirements] = useState('');
  const [requirementsError, setRequirementsError] = useState('');
  const [aiResult, setAiResult] = useState(null);

  const handleSubmitReviewRequest = async () => {
    if (requirements.trim().length < 50) {
      setRequirementsError("Requirements summary must be at least 50 characters.");
      return;
    }
    if (requirements.trim().length > 2000) {
      setRequirementsError("Requirements summary cannot exceed 2000 characters.");
      return;
    }
    setRequirementsError('');
    setIsSubmitting(true);
    try {
      const payload = {
        reviewerType: reviewerType === 'AI' ? 'AI' : 'Human',
        requirementsSummary: requirements.trim()
      };
      
      const response = await contractsService.requestSpecialistReview(
        delivery.contractId || delivery.ContractId,
        delivery.id,
        payload
      );
      
      if (reviewerType === 'AI') {
        const isFailedAi = response.reviewNote?.includes("failed to produce a valid response") || 
                            response.verdict === null;
        
        if (isFailedAi) {
          toast.error("AI review is currently unavailable (tokens may have run out). Please request a Human Specialist instead.");
          setReviewerType('Human');
        } else {
          setAiResult(response);
          toast.success("AI Review Completed successfully!");
        }
      } else {
        toast.success("Human Specialist assigned. Auto-approval is now paused.");
        setIsReviewModalOpen(false);
        if (onRefresh) onRefresh();
      }
    } catch (err) {
      const errMsg = err.response?.data?.message || err.message || "Failed to submit review request.";
      toast.error(errMsg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const statusStr = String(delivery.status !== undefined ? delivery.status : (delivery.Status !== undefined ? delivery.Status : '')).toLowerCase();
  const isPending = statusStr === 'pending' || statusStr === '0';
  const isClient = role === 'Client';

  const resetForm = () => {
    setActiveAction(null);
    setReason('');
    setError('');
    setRequestedCount(2);
  };

  const handleApprove = async () => {
    if (onApprove) {
      setIsSubmitting(true);
      try {
        await onApprove(delivery.id);
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  const handleRevisionSubmit = async () => {
    if (!reason.trim()) {
      setError('Please enter a reason for revision.');
      return;
    }
    setError('');
    if (onRevision) {
      setIsSubmitting(true);
      try {
        await onRevision(delivery.id, reason.trim());
        resetForm();
      } catch (err) {
        if (err.response?.data?.errorCode === 'REVISION_LIMIT_EXCEEDED' || String(err.response?.data?.message || '').toLowerCase().includes('limit')) {
          setError('Revision limit exceeded. You must request additional revisions from the freelancer.');
          setActiveAction('ADDITIONAL_REVISION');
        } else {
          setError(err.response?.data?.message || err.message || 'Failed to request revision.');
        }
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  const handleAdditionalRevisionSubmit = async () => {
    if (!reason.trim()) {
      setError('Please enter a reason for the additional revisions request.');
      return;
    }
    setError('');
    setIsSubmitting(true);
    try {
      await contractsService.requestAdditionalRevisions({
        deliveryId: delivery.id,
        requestedCount: Number(requestedCount),
        reason: reason.trim()
      });
      toast.success('Additional revisions requested successfully!');
      resetForm();
      if (onRefresh) onRefresh();
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to request additional revisions.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDisputeSubmit = async () => {
    if (!reason.trim()) {
      setError('Please enter a reason for the dispute.');
      return;
    }
    setError('');
    if (onDispute) {
      setIsSubmitting(true);
      try {
        await onDispute(delivery.id, reason.trim());
        resetForm();
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  const dateVal = delivery.submittedAt || delivery.SubmittedAt || delivery.submissionDate || delivery.date;
  const formattedDate = new Date(dateVal).toLocaleString(
    false ? 'ar-EG' : 'en-US',
    { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }
  );

  const attachmentsList = delivery.attachments || delivery.files || [];
  const isPaused = delivery.isPaused || delivery.IsPaused;

  const validateAttachmentsForAi = () => {
    if (attachmentsList.length === 0) {
      return {
        valid: false,
        reason: "AI review requires at least one attachment to analyze."
      };
    }

    const allowedExtensions = ['.txt', '.csv', '.pdf', '.doc', '.docx', '.md', '.zip', '.rar', '.7z'];
    const maxSizeBytes = 50 * 1024 * 1024; // 50MB

    for (const attachment of attachmentsList) {
      const fileName = attachment.name || attachment.originalFileName || attachment.fileName || '';
      const extension = fileName.substring(fileName.lastIndexOf('.')).toLowerCase();
      const sizeBytes = attachment.fileSizeBytes || attachment.size || 0;

      if (!allowedExtensions.includes(extension)) {
        return {
          valid: false,
          reason: `File "${fileName}" has an invalid format. AI review only supports documents (.txt, .csv, .pdf, .doc, .docx, .md) and zip archives (.zip, .rar, .7z).`
        };
      }

      if (sizeBytes > maxSizeBytes) {
        return {
          valid: false,
          reason: `File "${fileName}" exceeds the 50MB size limit for AI reviews.`
        };
      }
    }

    return { valid: true };
  };

  const aiValidation = validateAttachmentsForAi();

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:border-gray-300 transition-all">
      {/* Card Header */}
      <div className="p-4 sm:p-5 border-b border-gray-100 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-sm text-gray-500 font-medium">
          <Calendar className="h-4 w-4 text-gray-400" />
          <span>{formattedDate}</span>
        </div>
        <DeliveryStatusBadge status={delivery.status !== undefined ? delivery.status : delivery.Status} />
      </div>

      {/* Card Body */}
      <div className="p-4 sm:p-5 space-y-4">
        {isPaused && (
          <div className="bg-amber-50 border border-amber-200 p-4 rounded-xl flex items-start gap-3 text-amber-900 text-sm">
            <ShieldAlert className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
            <div>
              <span className="font-bold block">Delivery Review Paused</span>
              <span className="mt-1 block text-xs text-amber-800 leading-relaxed">
                {delivery.pauseReason || delivery.PauseReason || 'Auto-approval worker is paused while a specialist review is in progress.'}
              </span>
            </div>
          </div>
        )}

        {delivery.deliveryNote && (
          <div className="bg-gray-50 p-4 rounded-lg border border-gray-100 text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">
            {delivery.deliveryNote}
          </div>
        )}

        <DeliveryFilesList 
          attachments={delivery.attachments} 
          onDownload={onDownloadAttachment} 
        />

        {/* Revision & Additional Requests Log */}
        {((delivery.revisionRequests && delivery.revisionRequests.length > 0) || delivery.revisionRequest || (delivery.additionalRevisionRequests && delivery.additionalRevisionRequests.length > 0)) && (
          <div className="mt-5 pt-4 border-t border-gray-100 space-y-3">
            <span className="block text-[11px] font-bold text-gray-450 uppercase tracking-wider">
              Revision & Additional Requests Log
            </span>
            <div className="space-y-3">
              {/* Revision Requests */}
              {Array.isArray(delivery.revisionRequests) ? (
                delivery.revisionRequests.map((rev, index) => (
                  <div key={rev.id || index} className="p-3 bg-amber-50/40 border border-amber-100 rounded-xl text-xs space-y-1.5 text-left">
                    <div className="flex justify-between items-center text-amber-800 font-semibold">
                      <span>Revision #{index + 1}</span>
                      <span className="text-[10px] bg-amber-105/60 px-2 py-0.5 rounded-full uppercase tracking-wider">
                        {rev.status || 'Pending'}
                      </span>
                    </div>
                    <p className="text-gray-700 leading-relaxed font-medium">{rev.reason}</p>
                    {rev.requestedAt && (
                      <span className="block text-[10px] text-gray-400">
                        Requested: {new Date(rev.requestedAt).toLocaleString()}
                      </span>
                    )}
                  </div>
                ))
              ) : (
                delivery.revisionRequest && (
                  <div className="p-3 bg-amber-50/40 border border-amber-100 rounded-xl text-xs space-y-1.5 text-left">
                    <div className="flex justify-between items-center text-amber-800 font-semibold">
                      <span>Revision Request</span>
                      <span className="text-[10px] bg-amber-105/60 px-2 py-0.5 rounded-full uppercase tracking-wider">
                        {delivery.revisionRequest.status || 'Pending'}
                      </span>
                    </div>
                    <p className="text-gray-700 leading-relaxed font-medium">{delivery.revisionRequest.reason}</p>
                    {delivery.revisionRequest.requestedAt && (
                      <span className="block text-[10px] text-gray-400">
                        Requested: {new Date(delivery.revisionRequest.requestedAt).toLocaleString()}
                      </span>
                    )}
                  </div>
                )
              )}

              {/* Additional Revision Requests */}
              {Array.isArray(delivery.additionalRevisionRequests) && delivery.additionalRevisionRequests.map((req, idx) => (
                <div key={req.id || idx} className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs space-y-1.5 text-left">
                  <div className="flex justify-between items-center text-slate-800 font-semibold">
                    <span>Requested Additional Revisions (+{req.requestedCount})</span>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full uppercase tracking-wider ${
                      req.status === 'Approved' || req.status === 'Accepted' ? 'bg-emerald-100 text-emerald-800' :
                      req.status === 'Rejected' || req.status === 'Declined' ? 'bg-rose-100 text-rose-800' : 'bg-slate-100 text-slate-800'
                    }`}>
                      {req.status || 'Pending'}
                    </span>
                  </div>
                  <p className="text-gray-700 leading-relaxed font-medium">{req.reason}</p>
                  {req.requestedAt && (
                    <span className="block text-[10px] text-gray-400">
                      Requested: {new Date(req.requestedAt).toLocaleString()}
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Specialist Review Section */}
        {delivery.specialistReview && (
          <div className="mt-5 pt-4 border-t border-gray-100 space-y-3">
            <span className="block text-[11px] font-bold text-gray-400 uppercase tracking-wider">
              Specialist Review Status & Feedback
            </span>
            <div className={`p-4 rounded-xl border text-sm space-y-3 text-left ${
              delivery.specialistReview.status === 'Completed'
                ? delivery.specialistReview.verdict === 'Satisfactory'
                  ? 'bg-emerald-50/40 border-emerald-100 text-emerald-900'
                  : 'bg-rose-50/40 border-rose-100 text-rose-900'
                : 'bg-blue-50/40 border-blue-100 text-blue-900'
            }`}>
              <div className="flex justify-between items-center font-semibold">
                <span className={`flex items-center gap-1.5 ${
                  delivery.specialistReview.status === 'Completed'
                    ? delivery.specialistReview.verdict === 'Satisfactory'
                      ? 'text-emerald-800'
                      : 'text-rose-800'
                    : 'text-blue-800'
                }`}>
                  {delivery.specialistReview.reviewerType === 'AI' ? 'AI Assistant Review' : 'Human Specialist Review'}
                </span>
                <span className={`text-[10px] px-2.5 py-0.5 rounded-full uppercase font-bold tracking-wider ${
                  delivery.specialistReview.status === 'Completed'
                    ? delivery.specialistReview.verdict === 'Satisfactory'
                      ? 'bg-emerald-100 text-emerald-800'
                      : 'bg-rose-100 text-rose-800'
                    : 'bg-blue-100 text-blue-800'
                }`}>
                  {delivery.specialistReview.status === 'Completed'
                    ? delivery.specialistReview.verdict
                    : delivery.specialistReview.status === 'InProgress' ? 'In Progress' : delivery.specialistReview.status}
                </span>
              </div>
              
              {delivery.specialistReview.requirementsSummary && (
                <div className="text-xs text-gray-600 border-l-2 border-gray-300 pl-3 py-0.5 mt-1">
                  <span className="font-bold block text-[10px] text-gray-400 uppercase mb-0.5">Evaluation Scope:</span>
                  {delivery.specialistReview.requirementsSummary}
                </div>
              )}

              {delivery.specialistReview.status === 'Completed' && delivery.specialistReview.reviewNote && (
                <div className="mt-2 space-y-1">
                  <span className="font-bold block text-[10px] text-gray-400 uppercase">Review Notes:</span>
                  <p className="text-gray-700 leading-relaxed font-medium whitespace-pre-wrap text-xs bg-white/60 p-3 rounded-lg border border-gray-100">
                    {delivery.specialistReview.reviewNote}
                  </p>
                </div>
              )}

              <div className="flex justify-between items-center text-[10px] text-gray-400 mt-2 pt-1 border-t border-gray-100/50">
                <span>Requested: {new Date(delivery.specialistReview.requestedAt).toLocaleString()}</span>
                {delivery.specialistReview.completedAt && (
                  <span>Completed: {new Date(delivery.specialistReview.completedAt).toLocaleString()}</span>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Action Area for Client (Pending items only) */}
      {isClient && isPending && !isPaused && (
        <div className="bg-gray-50 border-t border-gray-100 p-4 sm:p-5 space-y-4">
          {!activeAction ? (
            <div className="flex flex-wrap gap-2.5">
              <button
                onClick={handleApprove}
                disabled={isSubmitting}
                className="inline-flex items-center justify-center px-4 py-2 text-xs sm:text-sm font-semibold rounded-lg text-white bg-emerald-600 hover:bg-emerald-700 shadow-sm transition disabled:opacity-50"
              >
                {isSubmitting ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-1.5" />
                ) : (
                  <Check className="h-4 w-4 mr-1.5" />
                )}
                {'Approve'}
              </button>

              <button
                onClick={() => { setActiveAction('REVISION'); setReason(''); setError(''); }}
                disabled={isSubmitting || isRevisionDisabled}
                title={isRevisionDisabled ? "No revisions remaining. Please request additional revisions." : undefined}
                className="inline-flex items-center justify-center px-4 py-2 text-xs sm:text-sm font-semibold rounded-lg text-gray-700 bg-white border border-gray-300 hover:bg-gray-50 shadow-sm transition disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-gray-100 disabled:text-gray-400"
              >
                <Edit3 className="h-4 w-4 mr-1.5 text-gray-500" />
                {'Request Revision'}
              </button>

              <button
                onClick={() => { setActiveAction('DISPUTE'); setReason(''); setError(''); }}
                disabled={isSubmitting}
                className="inline-flex items-center justify-center px-4 py-2 text-xs sm:text-sm font-semibold rounded-lg text-rose-700 bg-white border border-rose-200 hover:bg-rose-50 shadow-sm transition disabled:opacity-50"
              >
                <ShieldAlert className="h-4 w-4 mr-1.5 text-rose-500" />
                {'Open Dispute'}
              </button>

              <button
                onClick={() => { setIsReviewModalOpen(true); setReviewerType(null); setRequirements(''); setRequirementsError(''); setAiResult(null); }}
                disabled={isSubmitting}
                className="inline-flex items-center justify-center px-4 py-2 text-xs sm:text-sm font-semibold rounded-lg text-slate-705 bg-white border border-slate-300 hover:bg-slate-50 shadow-sm transition disabled:opacity-50"
              >
                <Sparkles className="h-4 w-4 mr-1.5 text-slate-500 animate-pulse" />
                {'Request Specialist Review'}
              </button>
            </div>
          ) : activeAction === 'ADDITIONAL_REVISION' ? (
            <div className="p-4 rounded-lg border bg-slate-50 border-slate-200 space-y-3">
              <label className="block text-xs sm:text-sm font-semibold text-slate-800">
                Request Additional Revisions:
              </label>
              
              <div className="flex items-center gap-3">
                <span className="text-xs text-slate-700 font-medium">Revisions Count:</span>
                <select
                  value={requestedCount}
                  onChange={(e) => setRequestedCount(Number(e.target.value))}
                  disabled={isSubmitting}
                  className="rounded-lg border-slate-200 shadow-sm p-1.5 text-xs bg-white outline-none border"
                >
                  <option value={1}>1 Revision</option>
                  <option value={2}>2 Revisions</option>
                  <option value={3}>3 Revisions</option>
                  <option value={5}>5 Revisions</option>
                </select>
              </div>

              <textarea
                rows={3}
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                disabled={isSubmitting}
                className="w-full rounded-lg border-slate-200 shadow-sm p-3 text-sm focus:border-slate-800 focus:ring-slate-800 border bg-white outline-none"
                placeholder="State the reason why you need additional revisions..."
              />
              
              {error && <p className="text-xs text-rose-600 font-medium">{error}</p>}

              <div className="flex justify-end gap-2 text-xs sm:text-sm">
                <button
                  type="button"
                  onClick={resetForm}
                  disabled={isSubmitting}
                  className="px-3 py-1.5 font-semibold text-gray-650 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition"
                >
                  {'Cancel'}
                </button>
                
                <button
                  type="button"
                  disabled={isSubmitting}
                  onClick={handleAdditionalRevisionSubmit}
                  className="px-4 py-1.5 font-semibold text-white rounded-lg transition inline-flex items-center bg-slate-900 hover:bg-slate-800"
                >
                  {isSubmitting && <Loader2 className="h-3.5 w-3.5 animate-spin mr-1.5" />}
                  {'Submit Request'}
                </button>
              </div>
            </div>
          ) : (
            <div className={`p-4 rounded-lg border ${activeAction === 'DISPUTE' ? 'bg-rose-50/50 border-rose-100' : 'bg-gray-100/50 border-gray-200'} space-y-3`}>
              <label className="block text-xs sm:text-sm font-semibold text-gray-800">
                {activeAction === 'DISPUTE' 
                  ? 'Provide a detailed reason for the dispute:'
                  : 'Provide a reason for revision:'
                }
              </label>
              
              <textarea
                rows={3}
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                disabled={isSubmitting}
                className="w-full rounded-lg border-gray-300 shadow-sm p-3 text-sm focus:border-amber-500 focus:ring-amber-500 border bg-white outline-none"
                placeholder={activeAction === 'DISPUTE' 
                  ? 'Describe the dispute reasoning in detail...'
                  : 'Detail the adjustments required...'
                }
              />
              
              {error && <p className="text-xs text-rose-600 font-medium">{error}</p>}

              <div className="flex justify-end gap-2 text-xs sm:text-sm">
                <button
                  type="button"
                  onClick={resetForm}
                  disabled={isSubmitting}
                  className="px-3 py-1.5 font-semibold text-gray-600 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition"
                >
                  {'Cancel'}
                </button>
                
                <button
                  type="button"
                  disabled={isSubmitting}
                  onClick={activeAction === 'DISPUTE' ? handleDisputeSubmit : handleRevisionSubmit}
                  className={`px-4 py-1.5 font-semibold text-white rounded-lg transition inline-flex items-center ${
                    activeAction === 'DISPUTE' 
                      ? 'bg-rose-600 hover:bg-rose-700' 
                      : 'bg-slate-800 hover:bg-slate-900'
                  }`}
                >
                  {isSubmitting && <Loader2 className="h-3.5 w-3.5 animate-spin mr-1.5" />}
                  {'Submit'}
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Review Request Modal */}
      {isReviewModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-100 max-w-lg w-full overflow-hidden animate-in zoom-in-95 duration-200 text-left">
            {/* Header */}
            <div className="p-5 border-b border-slate-100 flex items-center justify-between">
              <h3 className="text-lg font-bold text-slate-900">Request Delivery Review</h3>
              <button
                onClick={() => { setIsReviewModalOpen(false); setAiResult(null); }}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-50 transition"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Content */}
            {!aiResult ? (
              <div className="p-6 space-y-6">
                {/* Step 1: Select Type */}
                <div className="space-y-3">
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-400">
                    Choose Reviewer Type
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* AI Option */}
                    <button
                      type="button"
                      onClick={() => setReviewerType('AI')}
                      className={`p-4 rounded-xl border text-left flex flex-col justify-between h-36 transition-all ${
                        reviewerType === 'AI'
                          ? 'border-emerald-500 bg-emerald-50/20 shadow-sm ring-1 ring-emerald-500'
                          : 'border-slate-200 hover:bg-slate-50/50 hover:border-slate-300'
                      }`}
                    >
                      <div className="flex items-center justify-between w-full">
                        <span className={`p-2 rounded-lg ${reviewerType === 'AI' ? 'bg-emerald-500 text-white' : 'bg-slate-100 text-slate-500'}`}>
                          <Sparkles className="h-5 w-5" />
                        </span>
                        <span className="text-[10px] font-bold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full">
                          Instant
                        </span>
                      </div>
                      <div>
                        <h4 className="font-bold text-slate-800 text-sm">AI Review (Gemini)</h4>
                        <p className="text-xs text-slate-500 mt-1 font-medium">Get immediate quality feedback.</p>
                      </div>
                    </button>

                    {/* Human Specialist Option */}
                    <button
                      type="button"
                      onClick={() => setReviewerType('Human')}
                      className={`p-4 rounded-xl border text-left flex flex-col justify-between h-36 transition-all ${
                        reviewerType === 'Human'
                          ? 'border-blue-500 bg-blue-50/20 shadow-sm ring-1 ring-blue-500'
                          : 'border-slate-200 hover:bg-slate-50/50 hover:border-slate-300'
                      }`}
                    >
                      <div className="flex items-center justify-between w-full">
                        <span className={`p-2 rounded-lg ${reviewerType === 'Human' ? 'bg-blue-500 text-white' : 'bg-slate-100 text-slate-500'}`}>
                          <User className="h-5 w-5" />
                        </span>
                        <span className="text-[10px] font-bold bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full">
                          1-3 Days
                        </span>
                      </div>
                      <div>
                        <h4 className="font-bold text-slate-800 text-sm">Human Specialist</h4>
                        <p className="text-xs text-slate-500 mt-1 font-medium">Assigned to a professional reviewer.</p>
                      </div>
                    </button>
                  </div>
                </div>

                {/* Validation Warnings for AI */}
                {reviewerType === 'AI' && !aiValidation.valid && (
                  <div className="bg-rose-50 border border-rose-100 rounded-xl p-3.5 flex items-start gap-2.5 text-xs text-rose-800">
                    <AlertTriangle className="h-4.5 w-4.5 text-rose-500 flex-shrink-0 mt-0.5" />
                    <div>
                      <span className="font-bold block">AI Review Unavailable</span>
                      <span className="mt-0.5 block leading-relaxed font-medium">{aiValidation.reason}</span>
                    </div>
                  </div>
                )}

                {/* Step 2: Form */}
                {reviewerType && (reviewerType !== 'AI' || aiValidation.valid) && (
                  <div className="space-y-2 animate-in fade-in slide-in-from-top-2 duration-200">
                    <div className="flex justify-between items-center">
                      <label htmlFor="requirements-summary" className="block text-xs font-bold uppercase tracking-wider text-slate-400">
                        Requirements Summary
                      </label>
                      <span className={`text-[10px] font-semibold ${requirements.trim().length >= 50 ? 'text-slate-450' : 'text-amber-600'}`}>
                        {requirements.trim().length}/2000 chars (min 50)
                      </span>
                    </div>
                    <textarea
                      id="requirements-summary"
                      rows={4}
                      value={requirements}
                      onChange={(e) => setRequirements(e.target.value)}
                      placeholder={
                        reviewerType === 'AI'
                          ? "Specify detailed instructions and criteria. AI requires a thorough summary of requirements to check against."
                          : "Describe the requirements the specialist should evaluate the delivery against..."
                      }
                      className="w-full rounded-xl border border-slate-200 shadow-sm p-3 text-sm focus:border-slate-800 focus:ring-slate-800 outline-none resize-none"
                    />
                    {requirementsError && (
                      <p className="text-xs text-rose-600 font-semibold">{requirementsError}</p>
                    )}
                  </div>
                )}

                {/* Footer Buttons */}
                <div className="flex justify-end gap-2.5 pt-4 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setIsReviewModalOpen(false)}
                    className="px-4 py-2 text-sm font-semibold text-slate-600 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleSubmitReviewRequest}
                    disabled={isSubmitting || !reviewerType || (reviewerType === 'AI' && !aiValidation.valid)}
                    className="px-5 py-2 text-sm font-semibold text-white bg-slate-900 rounded-xl hover:bg-slate-800 transition disabled:opacity-50 inline-flex items-center gap-1.5"
                  >
                    {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
                    {reviewerType === 'AI' ? 'Run AI Review' : 'Submit to Specialist'}
                  </button>
                </div>
              </div>
            ) : (
              /* AI Result Display Panel */
              <div className="p-6 space-y-5 animate-in fade-in duration-200">
                <div className="text-center space-y-2">
                  <span className={`inline-flex p-3 rounded-full ${aiResult.verdict === 0 || aiResult.verdict === 'Satisfactory' ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}>
                    <Sparkles className="h-7 w-7" />
                  </span>
                  <h4 className="text-lg font-bold text-slate-850">AI Review Result</h4>
                  <div className="inline-block">
                    <span className={`text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full ${
                      aiResult.verdict === 0 || aiResult.verdict === 'Satisfactory'
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-rose-100 text-rose-800'
                    }`}>
                      {aiResult.verdict === 0 || aiResult.verdict === 'Satisfactory' ? 'Satisfactory' : 'Unsatisfactory'}
                    </span>
                  </div>
                </div>

                <div className="bg-slate-50 border border-slate-100 p-4 rounded-xl space-y-2">
                  <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">AI Reasoning</span>
                  <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-wrap">{aiResult.reviewNote}</p>
                </div>

                <div className="flex justify-end pt-3 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => { setIsReviewModalOpen(false); setAiResult(null); if (onRefresh) onRefresh(); }}
                    className="px-5 py-2 text-sm font-semibold text-white bg-slate-900 rounded-xl hover:bg-slate-800 transition"
                  >
                    Close
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
