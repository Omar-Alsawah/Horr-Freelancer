import React from 'react';
import { format } from 'date-fns';

const BASE_URL = 'https://localhost:5200';

export default function MessageBubble({ message, isOwnMessage }) {
  const renderContent = () => {
    switch (message.Type) {
      case 0: // Text
        return (
          <p>{message.TextContent}</p>
        );
      case 1: // Image
        return (
          <img
            src={`${BASE_URL}${message.FileUrl}`}
            alt="image"
            style={{ maxWidth: '100%', borderRadius: '8px' }}
          />
        );
      case 2: // Video
        return (
          <video
            controls
            src={`${BASE_URL}${message.FileUrl}`}
            style={{ maxWidth: '100%', borderRadius: '8px' }}
          />
        );
      case 3: // PDF
        return (
          <a
            href={`${BASE_URL}${message.FileUrl}`}
            download
            className="flex items-center gap-2"
            style={{ textDecoration: 'underline' }}
          >
            📄 {message.FileName}
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
          src={message.SenderAvatarUrl || 'https://ui-avatars.com/api/?name=U&background=random'}
          alt="avatar"
        />
      </div>

      {/* Bubble Content */}
      <div className="message-content">
        <div className="message-bubble">
          {renderContent()}
        </div>
        <p className="message-time">
          {format(new Date(message.SentAt), 'hh:mm a')}
        </p>
      </div>
    </div>
  );
}
