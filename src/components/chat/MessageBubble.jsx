import { format } from 'date-fns';

const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://localhost:5200';

export default function MessageBubble({ message, isOwnMessage }) {
  const getProp = (obj, propName) => {
    if (!obj) return null;
    const lower = propName.toLowerCase();
    for (const key of Object.keys(obj)) {
      if (key.toLowerCase() === lower) {
        return obj[key];
      }
    }
    return null;
  };

  const type = getProp(message, 'type');
  const body = getProp(message, 'body');
  const textContent = getProp(message, 'textContent');
  const fileUrl = getProp(message, 'fileUrl');
  const fileName = getProp(message, 'fileName');
  const senderAvatarUrl = getProp(message, 'senderAvatarUrl');
  const senderName = getProp(message, 'senderName') || 'User';
  const sentAt = getProp(message, 'sentAt') || new Date().toISOString();

  const renderContent = () => {
    const normalizedType = typeof type === 'string' ? type.toLowerCase() : type;
    switch (normalizedType) {
      case 0:
      case 'text': // Text
        return (
          <p>{textContent || body}</p>
        );
      case 1:
      case 'image': // Image
        return (
          <img
            src={`${BASE_URL}${fileUrl}`}
            alt="image"
            style={{ maxWidth: '100%', borderRadius: '8px' }}
          />
        );
      case 2:
      case 'video': // Video
        return (
          <video
            controls
            src={`${BASE_URL}${fileUrl}`}
            style={{ maxWidth: '100%', borderRadius: '8px' }}
          />
        );
      case 3:
      case 'pdf': // PDF
        return (
          <a
            href={`${BASE_URL}${fileUrl}`}
            download
            className="flex items-center gap-2"
            style={{ textDecoration: 'underline' }}
          >
            📄 {fileName}
          </a>
        );
      default:
        return <p style={{ color: '#aaa' }}>Unsupported message type</p>;
    }
  };

  return (
    <div className={`message-group ${isOwnMessage ? 'me' : 'other'}`}>
      {/* Avatar */}
      <div className="message-avatar">
        <img
          src={
            senderAvatarUrl ||
            `https://ui-avatars.com/api/?name=${encodeURIComponent(senderName)}&background=random`
          }
          alt={senderName}
        />
      </div>

      {/* Bubble Content */}
      <div className="message-content">
        <div className="message-bubble">
          {renderContent()}
        </div>
        <p className="message-time">
          {format(new Date(sentAt), 'hh:mm a')}
        </p>
      </div>
    </div>
  );
}
