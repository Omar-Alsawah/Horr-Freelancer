import { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Upload, X, File, AlertCircle, Link as LinkIcon, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';

const MAX_FILE_SIZE = 15 * 1024 * 1024; // 15MB limit per file
const BLOCKED_EXTENSIONS = ['.exe', '.bat', '.sh', '.msi', '.cmd', '.com'];

export default function DeliveryUploader({ 
  milestones = [],
  onSubmit, 
  isSubmitting, 
  uploadProgress 
}) {
  const { t, i18n } = useTranslation();
  const fileInputRef = useRef(null);

  const [selectedMilestoneId, setSelectedMilestoneId] = useState('');
  const [deliveryNote, setDeliveryNote] = useState('');
  const [files, setFiles] = useState([]); // Array of File objects
  const [links, setLinks] = useState([]); // Array of strings
  const [isDragActive, setIsDragActive] = useState(false);
  const [validationError, setValidationError] = useState('');

  // File size formatting utility
  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  // Perform validations (File Type & Size)
  const validateFilesList = (candidateFiles) => {
    let errorMsg = '';
    const validFiles = [];

    for (let i = 0; i < candidateFiles.length; i++) {
      const file = candidateFiles[i];
      const extension = file.name.substring(file.name.lastIndexOf('.')).toLowerCase();

      if (file.size > MAX_FILE_SIZE) {
        errorMsg = t('delivery.uploader.sizeError', `File "{{name}}" exceeds the maximum size limit of 15MB.`, { name: file.name });
        break;
      }
      if (BLOCKED_EXTENSIONS.includes(extension)) {
        errorMsg = t('delivery.uploader.typeError', `File type for "{{name}}" is not allowed for security reasons.`, { name: file.name });
        break;
      }
      
      // Prevent duplicates
      if (files.some(f => f.name === file.name && f.size === file.size)) {
        continue;
      }
      validFiles.push(file);
    }

    if (errorMsg) {
      setValidationError(errorMsg);
      toast.error(errorMsg);
      return false;
    }
    
    setValidationError('');
    setFiles((prev) => [...prev, ...validFiles]);
    return true;
  };

  // Drag & Drop Handlers
  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setIsDragActive(true);
    } else if (e.type === 'dragleave') {
      setIsDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      validateFilesList(e.dataTransfer.files);
    }
  };

  const handleFileSelect = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      validateFilesList(e.target.files);
    }
  };

  const removeFile = (index) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  };

  // Links Handlers
  const addLink = () => {
    setLinks((prev) => [...prev, '']);
  };

  const updateLink = (index, value) => {
    setLinks((prev) => prev.map((l, i) => (i === index ? value : l)));
  };

  const removeLink = (index) => {
    setLinks((prev) => prev.filter((_, i) => i !== index));
  };

  // Submit Handler
  const handleSubmit = (e) => {
    e.preventDefault();
    setValidationError('');

    const hasNoNote = !deliveryNote.trim();
    const activeLinks = links.filter(l => l.trim());

    if (hasNoNote && files.length === 0 && activeLinks.length === 0) {
      const err = t('delivery.emptyError', 'Please provide a note or at least one attachment.');
      setValidationError(err);
      toast.error(err);
      return;
    }

    const payload = {
      milestoneId: selectedMilestoneId || undefined,
      deliveryNote: deliveryNote.trim(),
      attachments: files,
      links: activeLinks
    };

    if (onSubmit) {
      onSubmit(payload);
    }
  };

  // Auto-select first active milestone
  useEffect(() => {
    let active = true;
    const select = async () => {
      await Promise.resolve();
      if (active && milestones && milestones.length > 0 && !selectedMilestoneId) {
        const activeMilestone = milestones.find(m => m.status === 'Funded') || milestones[0];
        if (activeMilestone) {
          setSelectedMilestoneId(activeMilestone.id.toString());
        }
      }
    };
    select();
    return () => {
      active = false;
    };
  }, [milestones, selectedMilestoneId]);

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* Milestone Selector */}
      {milestones && milestones.length > 0 && (
        <div className="space-y-2">
          <label htmlFor="target-milestone" className="block text-sm font-bold text-gray-800">
            {t('delivery.milestoneLabel', 'Target Milestone')}
          </label>
          <select
            id="target-milestone"
            value={selectedMilestoneId}
            onChange={(e) => setSelectedMilestoneId(e.target.value)}
            disabled={isSubmitting}
            className="block w-full rounded-xl border-gray-300 shadow-sm p-3 text-sm focus:border-amber-500 focus:ring-amber-500 border bg-white outline-none disabled:opacity-60"
          >
            <option value="">{t('delivery.uploader.noMilestone', 'Select milestone (Optional)')}</option>
            {milestones.map((m) => (
              <option 
                key={m.id} 
                value={m.id} 
                disabled={m.status === 'Released'}
              >
                {m.title} ({i18n.language === 'ar' ? `${m.amount} ج.م` : `EGP ${m.amount}`}) {m.status === 'Released' ? `(${t('milestone.status.released', 'Released')})` : ''}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Note Textarea */}
      <div className="space-y-2">
        <label htmlFor="delivery-note" className="block text-sm font-bold text-gray-800">
          {t('delivery.noteLabel', 'Delivery Note')}
        </label>
        <textarea
          id="delivery-note"
          rows={4}
          value={deliveryNote}
          onChange={(e) => setDeliveryNote(e.target.value)}
          disabled={isSubmitting}
          placeholder={t('delivery.notePlaceholder', 'Describe the work you have completed...')}
          className="w-full rounded-xl border-gray-300 shadow-sm p-3 text-sm focus:border-amber-500 focus:ring-amber-500 border bg-white outline-none disabled:opacity-60 resize-y"
        />
      </div>

      {/* Drag & Drop File Zone */}
      <div className="space-y-2">
        <label className="block text-sm font-bold text-gray-800">
          {t('contracts.attachments', 'Attachments')}
        </label>
        
        <div
          onDragEnter={handleDrag}
          onDragOver={handleDrag}
          onDragLeave={handleDrag}
          onDrop={handleDrop}
          onClick={() => !isSubmitting && fileInputRef.current?.click()}
          className={`border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer transition-all flex flex-col items-center justify-center gap-2 ${
            isDragActive 
              ? 'border-amber-500 bg-amber-50/50' 
              : 'border-slate-200 bg-slate-50/50 hover:bg-slate-50 hover:border-slate-300'
          } ${isSubmitting ? 'pointer-events-none opacity-60' : ''}`}
        >
          <input
            type="file"
            multiple
            ref={fileInputRef}
            onChange={handleFileSelect}
            className="hidden"
          />
          <Upload className={`h-8 w-8 ${isDragActive ? 'text-amber-500 animate-bounce' : 'text-slate-400'}`} />
          <div>
            <span className="text-sm font-bold text-gray-800">
              {t('delivery.uploader.dragTitle', 'Drag and drop files here')}
            </span>
            <span className="text-sm text-gray-500 font-medium">
              {' '}{t('delivery.uploader.orSelect', 'or browse')}
            </span>
          </div>
          <p className="text-xs text-gray-400">
            {t('delivery.uploader.limits', 'Max size 15MB. Blocked formats: exe, bat, sh')}
          </p>
        </div>
      </div>

      {/* Selected Files Chips List */}
      {files.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
            {t('delivery.uploader.selectedFiles', 'Files to Upload')} ( {files.length} )
          </h4>
          <div className="space-y-2 max-h-[180px] overflow-y-auto pr-1">
            {files.map((file, idx) => (
              <div 
                key={idx} 
                className="flex items-center justify-between p-2.5 bg-slate-50 border border-slate-100 rounded-xl"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <File className="h-4.5 w-4.5 text-blue-500 flex-shrink-0" />
                  <div className="min-w-0">
                    <p className="text-xs sm:text-sm font-semibold text-gray-850 truncate max-w-[180px] sm:max-w-xs">
                      {file.name}
                    </p>
                    <p className="text-[10px] text-gray-400 font-medium">
                      {formatFileSize(file.size)}
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => removeFile(idx)}
                  disabled={isSubmitting}
                  className="text-gray-400 hover:text-rose-600 p-1 hover:bg-rose-50 rounded-lg transition"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* URL Link Builders */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">
            {t('delivery.uploader.linksList', 'Resource Links')}
          </label>
          <button
            type="button"
            onClick={addLink}
            disabled={isSubmitting}
            className="text-xs font-semibold text-emerald-700 hover:text-emerald-800 bg-emerald-50 hover:bg-emerald-100 px-2.5 py-1.5 rounded-lg border border-emerald-100 transition"
          >
            + {t('delivery.uploader.addLink', 'Add Link')}
          </button>
        </div>

        {links.length > 0 && (
          <div className="space-y-2 max-h-[140px] overflow-y-auto pr-1">
            {links.map((link, idx) => (
              <div key={idx} className="flex items-center gap-2 bg-slate-50 border border-slate-100 p-2.5 rounded-xl">
                <div className="flex-1 min-w-0 flex items-center gap-2 bg-white border border-gray-200 rounded-lg px-2.5 py-1.5 focus-within:border-amber-500 focus-within:ring-1 focus-within:ring-amber-500">
                  <LinkIcon className="h-3.5 w-3.5 text-emerald-500 flex-shrink-0" />
                  <input
                    type="url"
                    placeholder="https://"
                    value={link}
                    onChange={(e) => updateLink(idx, e.target.value)}
                    disabled={isSubmitting}
                    className="block w-full border-0 outline-none text-xs sm:text-sm p-0 focus:ring-0"
                  />
                </div>
                <button
                  type="button"
                  onClick={() => removeLink(idx)}
                  disabled={isSubmitting}
                  className="text-gray-400 hover:text-rose-600 p-1.5 hover:bg-rose-50 rounded-lg transition flex-shrink-0"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Validation Error Banner */}
      {validationError && (
        <div className="bg-rose-50 border border-rose-100 rounded-xl p-3 flex items-start gap-2 text-rose-800 text-xs">
          <AlertCircle className="h-4 w-4 text-rose-500 flex-shrink-0 mt-0.5" />
          <p>{validationError}</p>
        </div>
      )}

      {/* Upload Progress Bar */}
      {isSubmitting && uploadProgress > 0 && (
        <div className="space-y-1.5 bg-gray-50 p-3.5 rounded-xl border border-gray-100">
          <div className="flex justify-between text-xs font-semibold text-gray-700">
            <span>{t('delivery.uploader.uploadingFiles', 'Uploading files...')}</span>
            <span>{uploadProgress}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
            <div 
              className="bg-amber-500 h-2 rounded-full transition-all duration-300" 
              style={{ width: `${uploadProgress}%` }}
            />
          </div>
        </div>
      )}

      {/* Form Action Buttons */}
      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full inline-flex items-center justify-center py-3.5 px-4 rounded-xl font-bold text-white bg-slate-900 hover:bg-slate-800 shadow-lg shadow-slate-900/10 transition disabled:opacity-50 gap-2 text-sm sm:text-base cursor-pointer"
      >
        {isSubmitting ? (
          <>
            <Loader2 className="h-5 w-5 animate-spin mr-1.5" />
            {t('delivery.submitting', 'Submitting...')}
          </>
        ) : (
          t('delivery.submit', 'Submit Deliverables')
        )}
      </button>
    </form>
  );
}

// Small loader helper icon
function Loader2({ className }) {
  return (
    <svg className={`animate-spin ${className}`} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
    </svg>
  );
}
