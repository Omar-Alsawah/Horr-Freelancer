import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { ShieldCheck, AlertCircle, CheckCircle2, Clock, Upload, X, Image as ImageIcon } from 'lucide-react';
import toast from 'react-hot-toast';
import { verificationApi } from '../../api/verification';
import SettingsLayout from '../../layouts/SettingsLayout';

export default function VerificationPage() {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [statusData, setStatusData] = useState(null);
  const [files, setFiles] = useState({ frontImage: null, backImage: null, selfie: null });
  const [previews, setPreviews] = useState({ frontImage: null, backImage: null, selfie: null });
  const [errors, setErrors] = useState({});

  const fetchStatus = async () => {
    setLoading(true);
    try {
      const res = await verificationApi.getMyStatus();
      setStatusData(res.data);
    } catch (err) {
      toast.error(err.title || t('common.error'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStatus();
  }, []);

  const validateFile = (file) => {
    if (!file) return 'Required';
    if (!file.type.startsWith('image/')) return 'Must be an image (JPG, PNG)';
    if (file.size > 5 * 1024 * 1024) return 'Must be under 5MB';
    return null;
  };

  const handleFileChange = (field) => (e) => {
    const file = e.target.files[0];
    if (file) {
      const error = validateFile(file);
      setErrors(prev => ({ ...prev, [field]: error }));
      
      if (!error) {
        setFiles(prev => ({ ...prev, [field]: file }));
        const reader = new FileReader();
        reader.onloadend = () => {
          setPreviews(prev => ({ ...prev, [field]: reader.result }));
        };
        reader.readAsDataURL(file);
      } else {
        setFiles(prev => ({ ...prev, [field]: null }));
        setPreviews(prev => ({ ...prev, [field]: null }));
      }
    }
  };

  const removeFile = (field) => {
    setFiles(prev => ({ ...prev, [field]: null }));
    setPreviews(prev => ({ ...prev, [field]: null }));
    setErrors(prev => ({ ...prev, [field]: null }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Final validation
    const newErrors = {};
    Object.keys(files).forEach(key => {
      const err = validateFile(files[key]);
      if (err) newErrors[key] = err;
    });

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      toast.error('Please fix the errors in the form');
      return;
    }

    setSubmitting(true);
    try {
      const formData = new FormData();
      formData.append('frontImage', files.frontImage);
      formData.append('backImage', files.backImage);
      formData.append('selfie', files.selfie);

      await verificationApi.submitVerification(formData);
      toast.success('Verification submitted successfully');
      fetchStatus(); // Refresh status to show Pending
    } catch (err) {
      if (err.status === 409) {
        toast.error(err.title || 'You already have a pending verification request.');
      } else {
        toast.error(err.title || t('common.error'));
      }
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <SettingsLayout title="Identity Verification">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#d4af37]"></div>
        </div>
      </SettingsLayout>
    );
  }

  // Status mapping: 0=Pending, 1=Approved, 2=Rejected
  const isApproved = statusData?.status === 1;
  const isPending = statusData?.status === 0;
  const isRejected = statusData?.status === 2;
  const showForm = !statusData || isRejected;

  return (
    <SettingsLayout title="Identity Verification">
      <div className="space-y-6">
        {/* Status Header */}
        {statusData && (
          <div className={`p-4 rounded-lg flex items-start gap-4 border ${
            isApproved ? 'bg-green-50 border-green-200' : 
            isPending ? 'bg-blue-50 border-blue-200' : 
            'bg-red-50 border-red-200'
          }`}>
            <div className="mt-1">
              {isApproved ? <CheckCircle2 className="text-green-600" /> : 
               isPending ? <Clock className="text-blue-600" /> : 
               <AlertCircle className="text-red-600" />}
            </div>
            <div>
              <h3 className={`font-semibold ${
                isApproved ? 'text-green-800' : 
                isPending ? 'text-blue-800' : 
                'text-red-800'
              }`}>
                {isApproved ? 'Identity Verified' : 
                 isPending ? 'Verification Pending' : 
                 'Verification Rejected'}
              </h3>
              <p className="text-sm opacity-90 mt-1">
                {isApproved ? `Your identity was successfully verified on ${new Date(statusData.submittedAt).toLocaleDateString()}.` : 
                 isPending ? "Your verification is under review. We'll notify you once it's complete." : 
                 `Reason: ${statusData.rejectionReason || 'Images were not clear enough.'}`}
              </p>
              {isRejected && (
                <p className="text-sm font-medium text-red-700 mt-2">
                  Please resubmit with clearer images below.
                </p>
              )}
            </div>
          </div>
        )}

        {showForm ? (
          <form onSubmit={handleSubmit} className="space-y-8 bg-white p-6 rounded-xl border border-gray-200">
            <div className="space-y-1">
              <h4 className="text-lg font-semibold text-gray-900">Upload Identity Documents</h4>
              <p className="text-sm text-gray-500">Please provide clear photos of your official ID and a selfie.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Front of ID */}
              <FileUploader 
                label="Front of ID"
                field="frontImage"
                preview={previews.frontImage}
                error={errors.frontImage}
                onChange={handleFileChange('frontImage')}
                onRemove={() => removeFile('frontImage')}
                disabled={submitting}
              />

              {/* Back of ID */}
              <FileUploader 
                label="Back of ID"
                field="backImage"
                preview={previews.backImage}
                error={errors.backImage}
                onChange={handleFileChange('backImage')}
                onRemove={() => removeFile('backImage')}
                disabled={submitting}
              />

              {/* Selfie */}
              <FileUploader 
                label="Selfie holding ID"
                field="selfie"
                preview={previews.selfie}
                error={errors.selfie}
                onChange={handleFileChange('selfie')}
                onRemove={() => removeFile('selfie')}
                disabled={submitting}
              />
            </div>

            <div className="pt-4 border-t border-gray-100">
              <button
                type="submit"
                disabled={submitting}
                className={`w-full py-3 px-4 rounded-lg font-semibold text-white transition-all ${
                  submitting ? 'bg-gray-400 cursor-not-allowed' : 'bg-[#d4af37] hover:bg-[#b8962d] shadow-sm hover:shadow-md'
                }`}
              >
                {submitting ? (
                  <span className="flex items-center justify-center gap-2">
                    <Clock className="animate-spin h-4 w-4" /> Submitting...
                  </span>
                ) : (
                  'Submit for Verification'
                )}
              </button>
            </div>
          </form>
        ) : (
          <div className="bg-white p-8 rounded-xl border border-gray-200 text-center space-y-4">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-50 text-gray-400 mb-2">
              <ShieldCheck size={32} />
            </div>
            <h4 className="text-xl font-semibold text-gray-900">
              {isApproved ? 'You are all set!' : 'Submission Received'}
            </h4>
            <p className="text-gray-500 max-w-md mx-auto">
              {isApproved ? 
                'Your account is verified. You now have access to exclusive features and increased trust from clients.' : 
                'We have received your documents and are currently reviewing them. This usually takes 1-2 business days.'}
            </p>
          </div>
        )}
      </div>
    </SettingsLayout>
  );
}

function FileUploader({ label, field, preview, error, onChange, onRemove, disabled }) {
  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-700">{label}</label>
      <div className={`relative group border-2 border-dashed rounded-xl transition-all h-48 flex flex-col items-center justify-center overflow-hidden ${
        error ? 'border-red-300 bg-red-50' : 
        preview ? 'border-green-300 bg-gray-50' : 
        'border-gray-300 hover:border-[#d4af37] bg-gray-50'
      }`}>
        {preview ? (
          <>
            <img src={preview} alt={label} className="w-full h-full object-cover" />
            {!disabled && (
              <button
                type="button"
                onClick={onRemove}
                className="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow-lg"
              >
                <X size={16} />
              </button>
            )}
          </>
        ) : (
          <label className="w-full h-full flex flex-col items-center justify-center cursor-pointer p-4">
            <div className="mb-2 p-3 rounded-full bg-white text-gray-400 group-hover:text-[#d4af37] transition-colors shadow-sm">
              <Upload size={24} />
            </div>
            <span className="text-xs font-medium text-gray-500 group-hover:text-[#d4af37]">Click to upload</span>
            <input 
              type="file" 
              className="hidden" 
              accept="image/*" 
              onChange={onChange}
              disabled={disabled}
            />
          </label>
        )}
      </div>
      {error && <p className="text-xs text-red-500 flex items-center gap-1 font-medium"><AlertCircle size={12} /> {error}</p>}
    </div>
  );
}
