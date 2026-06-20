import React, { useRef, useState } from 'react';
import { toast } from 'sonner';
import { sendTextMessage, sendFileMessage as uploadFile } from '../../../services/chatService';

// ─── Validation Constants ────────────────────────────────────────────────────
const ACCEPTED_EXTENSIONS = [
  'jpg', 'jpeg', 'png', 'gif', 'webp',  // images
  'mp4', 'mov', 'avi', 'webm',           // videos
  'pdf'                                   // documents
];

const SIZE_LIMITS = {
  image: 10 * 1024 * 1024,   // 10MB
  video: 150 * 1024 * 1024,  // 150MB
  pdf:   20 * 1024 * 1024,   // 20MB
};

function getFileCategory(extension) {
  if (['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(extension)) return 'image';
  if (['mp4', 'mov', 'avi', 'webm'].includes(extension))          return 'video';
  if (extension === 'pdf')                                         return 'pdf';
  return null;
}

// ─── Component ───────────────────────────────────────────────────────────────
export default function MessageInput({ chatId, onMessageSent }) {
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef(null);

  // Send text message
  const handleSendText = async () => {
    if (!text.trim() || loading) return;
    setLoading(true);
    try {
      const newMessage = await sendTextMessage(chatId, text.trim());
      setText('');
      onMessageSent(newMessage);
    } catch {
      toast.error('Failed to send message. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Send on Enter (not Shift+Enter)
  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendText();
    }
  };

  // Handle file selection and upload
  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // 1. Validate extension
    const extension = (file?.name || '').split('.').pop().toLowerCase();
    if (!ACCEPTED_EXTENSIONS.includes(extension)) {
      toast.error(`File type .${extension} is not supported.`);
      e.target.value = '';
      return;
    }

    // 2. Validate size
    const category = getFileCategory(extension);
    if (!category) {
      toast.error(`File type .${extension} is not supported.`);
      e.target.value = '';
      return;
    }
    
    const limit = SIZE_LIMITS[category];
    if (file.size > limit) {
      const limitMB = limit / (1024 * 1024);
      toast.error(`${category} files must be under ${limitMB}MB.`);
      e.target.value = '';
      return;
    }

    // 3. Upload
    setLoading(true);
    try {
      const newMessage = await uploadFile(chatId, file);
      onMessageSent(newMessage);
    } catch {
      toast.error('File upload failed. Please try again.');
    } finally {
      setLoading(false);
      e.target.value = ''; // Reset file input
    }
  };

  return (
    <div className="chat-input-area">
      <div className="chat-input-wrapper">
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Send a message..."
          disabled={loading}
        />
        
        <div className="chat-actions">
          <div className="action-icons">
            {/* Hidden file input */}
            <input
              type="file"
              ref={fileInputRef}
              style={{ display: 'none' }}
              accept=".jpg,.jpeg,.png,.gif,.webp,.mp4,.mov,.avi,.webm,.pdf"
              onChange={handleFileChange}
            />

            {/* Attach button (Paperclip icon from prototype) */}
            <svg 
              className="action-icon" 
              onClick={() => !loading && fileInputRef.current?.click()}
              width="20" height="20" viewBox="0 0 24 24" fill="none"
              stroke="currentColor" strokeWidth="2"
              style={{ cursor: loading ? 'not-allowed' : 'pointer' }}
            >
              <path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48"></path>
            </svg>
          </div>

          <button
            type="button"
            onClick={handleSendText}
            disabled={loading || !text.trim()}
            className="btn-send"
          >
            {loading ? (
              <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin inline-block" />
            ) : (
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="22" y1="2" x2="11" y2="13"></line>
                <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
              </svg>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
