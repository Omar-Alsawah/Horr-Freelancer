import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate, Navigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import toast from 'react-hot-toast';
import { 
  Loader2, 
  AlertTriangle, 
  CheckCircle2, 
  XCircle, 
  ArrowLeft, 
  FileText, 
  RefreshCw 
} from 'lucide-react';
import { revisionsApi } from '../../api/revisions';
import { useAuthStore } from '../../store/authStore';

export default function SpecialistReviewSubmitPage() {
  const { t } = useTranslation();
  const { contractId, deliveryId } = useParams();
  const navigate = useNavigate();
  const role = useAuthStore(state => state.role);

  const [reviewData, setReviewData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  
  const [verdict, setVerdict] = useState(''); // 'Satisfactory' | 'Unsatisfactory' | ''
  const [reviewNote, setReviewNote] = useState('');
  const [touched, setTouched] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const fetchReviewStatus = useCallback(async (isRetry = false) => {
    if (isRetry) {
      setLoading(true);
      setError(false);
    }
    try {
      const res = await revisionsApi.getSpecialistReviewStatus(contractId, deliveryId);
      if (res.data) {
        setReviewData(res.data);
        if (res.data.verdict) setVerdict(res.data.verdict);
        if (res.data.reviewNote) setReviewNote(res.data.reviewNote);
      } else {
        setError(true);
      }
    } catch (err) {
      toast.error(err.title || t('specialist.errorLoading', 'Error loading review details'));
      setError(true);
    } finally {
      setLoading(false);
    }
  }, [contractId, deliveryId, t]);

  useEffect(() => {
    if (role === 'Specialist') {
      const timer = setTimeout(() => {
        fetchReviewStatus();
      }, 0);
      return () => clearTimeout(timer);
    }
  }, [role, fetchReviewStatus]);

  // Route Guard
  if (role !== 'Specialist') {
    return <Navigate to="/unauthorized" replace />;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setTouched(true);

    if (!verdict) {
      toast.error(t('specialist.selectVerdictError', 'Please select a verdict.'));
      return;
    }

    if (reviewNote.length < 50 || reviewNote.length > 5000) {
      toast.error(t('specialist.noteLengthError', 'Review note must be between 50 and 5000 characters.'));
      return;
    }

    setSubmitting(true);
    try {
      await revisionsApi.submitSpecialistVerdict(contractId, deliveryId, {
        verdict,
        reviewNote
      });
      toast.success(t('specialist.submitSuccess', 'Review submitted successfully'));
      navigate('/specialist/queue');
    } catch (err) {
      if (err.status === 403) {
        toast.error(t('specialist.errors.forbidden', 'You are not assigned to this review'));
      } else if (err.status === 404) {
        toast.error(t('specialist.errors.notFound', 'No pending review found'));
      } else if (err.status === 422) {
        toast.error(t('specialist.errors.alreadyCompleted', 'This review is already completed'));
      } else {
        toast.error(err.title || t('specialist.errors.submissionFailed', 'Submission failed'));
      }
    } finally {
      setSubmitting(false);
    }
  };

  // State 1: Loading Skeletons
  if (loading) {
    return (
      <div className="max-w-3xl mx-auto py-8 px-4 sm:px-6 lg:px-8 space-y-6">
        <div className="flex items-center space-x-4">
          <div className="h-10 w-10 bg-gray-200 animate-pulse rounded-full"></div>
          <div className="h-8 bg-gray-200 animate-pulse rounded w-1/3"></div>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm space-y-4">
          <div className="h-6 bg-gray-200 animate-pulse rounded w-1/4"></div>
          <div className="h-4 bg-gray-200 animate-pulse rounded w-1/2"></div>
          <div className="h-24 bg-gray-200 animate-pulse rounded w-full"></div>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="h-24 bg-gray-200 animate-pulse rounded-xl"></div>
            <div className="h-24 bg-gray-200 animate-pulse rounded-xl"></div>
          </div>
          <div className="h-32 bg-gray-200 animate-pulse rounded-xl"></div>
          <div className="h-12 bg-gray-200 animate-pulse rounded-lg w-full"></div>
        </div>
      </div>
    );
  }

  // State 2: Error
  if (error || !reviewData) {
    return (
      <div className="max-w-3xl mx-auto my-12 p-8 bg-red-50 rounded-xl border border-red-200 text-center flex flex-col items-center">
        <AlertTriangle className="w-16 h-16 text-red-400 mb-4" />
        <h2 className="text-2xl font-bold text-red-900 mb-2">
          {t('specialist.errorLoading', 'Failed to load review details')}
        </h2>
        <p className="text-red-700 mb-6">
          {t('specialist.errorLoadingSub', 'No review request found or network error occurred.')}
        </p>
        <div className="flex space-x-4">
          <button 
            onClick={() => navigate('/specialist/queue')}
            className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md shadow-sm text-gray-700 bg-white hover:bg-gray-55"
          >
            {t('specialist.backToQueue', 'Back to Queue')}
          </button>
          <button 
            onClick={() => fetchReviewStatus(true)}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-red-650 hover:bg-red-700"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            {t('specialist.retry', 'Retry')}
          </button>
        </div>
      </div>
    );
  }

  const isSubmitDisabled = !verdict || reviewNote.length < 50 || reviewNote.length > 5000 || submitting;

  const displayNote = reviewData.deliveryNote || reviewData.requirementsSummary || '';

  return (
    <div className="max-w-3xl mx-auto py-8 px-4 sm:px-6 lg:px-8 space-y-6">
      {/* Header */}
      <div className="flex items-center space-x-4 mb-2">
        <button 
          onClick={() => navigate(-1)} 
          className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          title={t('specialist.back', 'Go Back')}
        >
          <ArrowLeft className="w-6 h-6 text-gray-600" />
        </button>
        <h1 className="text-3xl font-bold text-gray-900">
          {t('specialist.submitReviewTitle', 'Submit Contract Review')}
        </h1>
      </div>

      {/* Info Panel */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm space-y-4">
        <h2 className="text-lg font-bold text-gray-900 border-b pb-2 flex items-center">
          <FileText className="w-5 h-5 mr-2 text-primary" />
          {t('specialist.deliveryDetails', 'Delivery Details')}
        </h2>
        <div>
          <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">
            {t('specialist.contractTitleLabel', 'Contract')}
          </span>
          <p className="font-semibold text-gray-900 mt-0.5">
            {reviewData.contractTitle || `${t('specialist.reviewLabel', 'Review')} #${reviewData.id.slice(0, 8)}`}
          </p>
        </div>
        <div>
          <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">
            {t('specialist.deliveryNoteLabel', 'Delivery Note')}
          </span>
          <div className="mt-1 bg-gray-50 rounded-lg p-4 border border-gray-155 text-gray-700 text-sm whitespace-pre-wrap font-normal">
            {displayNote || t('specialist.noDeliveryNote', 'No delivery details provided.')}
          </div>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm space-y-6">
        {/* Verdict */}
        <div className="space-y-3">
          <label className="block text-sm font-bold text-gray-700 uppercase tracking-wider">
            {t('specialist.verdictLabel', 'Verdict')}
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <button
              type="button"
              onClick={() => setVerdict('Satisfactory')}
              className={`flex flex-col items-center justify-center p-5 rounded-xl border-2 transition-all text-center ${
                verdict === 'Satisfactory'
                  ? 'border-green-500 bg-green-50/20 text-green-900'
                  : 'border-gray-200 hover:border-gray-300 bg-white text-gray-600'
              }`}
            >
              <CheckCircle2 className={`w-8 h-8 mb-2 ${verdict === 'Satisfactory' ? 'text-green-600' : 'text-gray-400'}`} />
              <span className="font-bold text-base">{t('specialist.satisfactory', 'Satisfactory')}</span>
              <span className="text-xs text-gray-500 mt-1">
                {t('specialist.satisfactoryDesc', 'The delivery meets all requirements.')}
              </span>
            </button>
            
            <button
              type="button"
              onClick={() => setVerdict('Unsatisfactory')}
              className={`flex flex-col items-center justify-center p-5 rounded-xl border-2 transition-all text-center ${
                verdict === 'Unsatisfactory'
                  ? 'border-red-500 bg-red-50/20 text-red-900'
                  : 'border-gray-200 hover:border-gray-300 bg-white text-gray-600'
              }`}
            >
              <XCircle className={`w-8 h-8 mb-2 ${verdict === 'Unsatisfactory' ? 'text-red-655' : 'text-gray-400'}`} />
              <span className="font-bold text-base">{t('specialist.unsatisfactory', 'Unsatisfactory')}</span>
              <span className="text-xs text-gray-500 mt-1">
                {t('specialist.unsatisfactoryDesc', 'The delivery fails to meet requirements.')}
              </span>
            </button>
          </div>
        </div>

        {/* Review Note */}
        <div className="space-y-2">
          <label htmlFor="reviewNote" className="block text-sm font-bold text-gray-700 uppercase tracking-wider">
            {t('specialist.reviewNoteLabel', 'Review Note')}
          </label>
          <textarea
            id="reviewNote"
            rows={6}
            minLength={50}
            maxLength={5000}
            value={reviewNote}
            onChange={(e) => {
              setReviewNote(e.target.value);
              setTouched(true);
            }}
            onBlur={() => setTouched(true)}
            placeholder={t('specialist.reviewNotePlaceholder', 'Provide detailed feedback on this delivery. Minimum 50 characters.')}
            className={`w-full rounded-lg border shadow-sm focus:border-primary focus:ring-primary text-sm p-3 font-normal ${
              touched && reviewNote.length < 50
                ? 'border-red-300 focus:border-red-500 focus:ring-red-500'
                : 'border-gray-300 font-normal'
            }`}
          />
          <div className="flex justify-between items-center text-xs mt-1">
            <span>
              {touched && reviewNote.length < 50 ? (
                <span className="text-red-600 font-medium flex items-center">
                  <AlertTriangle className="w-3.5 h-3.5 mr-1 shrink-0" />
                  {t('specialist.charsRemaining', '{{count}} more characters required').replace('{{count}}', 50 - reviewNote.length)}
                </span>
              ) : (
                <span className="text-gray-400">
                  {t('specialist.reviewNoteInstruction', 'Keep it objective and constructive.')}
                </span>
              )}
            </span>
            <span className={`font-semibold ${reviewNote.length < 50 ? 'text-gray-400' : 'text-green-600'}`}>
              {reviewNote.length}/5000
            </span>
          </div>
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={isSubmitDisabled}
          className="w-full inline-flex justify-center items-center px-4 py-3 border border-transparent shadow-sm text-sm font-bold rounded-lg text-white bg-primary hover:bg-gray-800 focus:outline-none disabled:opacity-50 transition-colors"
        >
          {submitting ? (
            <>
              <Loader2 className="animate-spin w-4 h-4 mr-2" />
              {t('specialist.submitting', 'Submitting…')}
            </>
          ) : (
            t('specialist.submitVerdictButton', 'Submit Verdict')
          )}
        </button>
      </form>
    </div>
  );
}
