import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import { formatDistanceToNow } from 'date-fns';
import { getChats } from '../../api/chatApi';

export default function ChatSidebar() {
  const [chats, setChats] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { chatId } = useParams();

  // Mock conversations used when API fails
  const mockChats = [
    {
      Id: 'mock-1',
      OtherPartyName: 'Mercedes Hodkiewicz',
      OtherPartyAvatarUrl: 'https://ui-avatars.com/api/?name=Mercedes+Hodkiewicz&background=random',
      LastMessageAt: new Date().toISOString(),
      LastMessagePreview: 'Hey, are you available for a quick call?',
      UnreadCount: 2,
    },
    {
      Id: 'mock-2',
      OtherPartyName: 'Mira Rhiel Madsen',
      OtherPartyAvatarUrl: 'https://ui-avatars.com/api/?name=Mira+Rhiel+Madsen&background=random',
      LastMessageAt: new Date(Date.now() - 3600 * 1000).toISOString(),
      LastMessagePreview: 'I have sent the contract for review.',
      UnreadCount: 0,
    },
  ];

  // ─── Load mock chats on mount (no backend) ───────────────────────────────────────
  useEffect(() => {
    setChats([
      {
        Id: '1',
        OtherPartyName: 'Mercedes Hodkiewicz',
        OtherPartyAvatarUrl: '',
        LastMessagePreview: 'Hey! I have added some of my feedback to this doc.',
        LastMessageAt: new Date().toISOString(),
        UnreadCount: 2,
      },
      {
        Id: '2',
        OtherPartyName: 'Mira Rhiel Madsen',
        OtherPartyAvatarUrl: '',
        LastMessagePreview: "Let's set up some time to meet.",
        LastMessageAt: new Date().toISOString(),
        UnreadCount: 0,
      },
      {
        Id: '3',
        OtherPartyName: 'Erin Ekstrom Bothman',
        OtherPartyAvatarUrl: '',
        LastMessagePreview: 'Yes, I am available for the afternoon.',
        LastMessageAt: new Date().toISOString(),
        UnreadCount: 1,
      },
    ]);
    setLoading(false);
  }, []);

  // ─── Shared Header ─────────────────────────────────────────────────────────
  const renderSidebarHeader = () => (
    <div className="chat-sidebar-header">
      <h2 className="chat-sidebar-title">Messages</h2>
      <div className="search-wrapper">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="11" cy="11" r="8"></circle>
          <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
        </svg>
        <input type="text" placeholder="Search" />
      </div>
    </div>
  );

  // ─── Skeleton loader ───────────────────────────────────────────────────────
  if (loading) {
    return (
      <aside className="chat-sidebar">
        {renderSidebarHeader()}
        <div className="conversation-list">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="flex items-center gap-3 px-6 py-4 animate-pulse border-b border-gray-100">
              <div className="w-12 h-12 bg-gray-200 rounded-full flex-shrink-0" />
              <div className="flex-1 space-y-2">
                <div className="h-3 bg-gray-200 rounded w-3/4" />
                <div className="h-3 bg-gray-200 rounded w-1/2" />
              </div>
            </div>
          ))}
        </div>
      </aside>
    );
  }

  // ─── Empty state ───────────────────────────────────────────────────────────
  if (!chats.length) {
    return (
      <aside className="chat-sidebar">
        {renderSidebarHeader()}
        <div className="conversation-list">
          <div className="flex items-center justify-center h-full text-gray-400 text-sm p-4 text-center">
            Could not load conversations.
          </div>
        </div>
      </aside>
    );
  }

  // ─── Chat list ─────────────────────────────────────────────────────────────
  return (
    <aside className="chat-sidebar">
      {renderSidebarHeader()}
      <div className="conversation-list">
        {chats.map((chat) => (
          <div
            key={chat.Id || chat.ChatId}
            onClick={() => navigate(`/messages/${chat.Id || chat.ChatId}`)}
            className={`conversation-item ${String(chat.Id || chat.ChatId) === chatId ? 'active' : ''}`}
            role="button"
            tabIndex={0}
          >
            {/* Avatar */}
            <div className="user-status-avatar">
              <img
                src={chat.OtherPartyAvatarUrl || 'https://ui-avatars.com/api/?name=' + encodeURIComponent(chat.OtherPartyName || 'User') + '&background=random'}
                alt={chat.OtherPartyName}
              />
              {/* Optional: we don't have online status in ChatSummaryDto, leaving indicator out or hidden */}
            </div>

            {/* Info */}
            <div className="conv-info">
              <div className="conv-top">
                <span className="conv-name truncate">
                  {chat.OtherPartyName}
                </span>
                <span className="conv-time flex-shrink-0">
                  {chat.LastMessageAt ? formatDistanceToNow(new Date(chat.LastMessageAt), { addSuffix: true }) : ''}
                </span>
              </div>
              <div className={`conv-preview truncate ${chat.UnreadCount > 0 ? 'unread' : ''} flex justify-between items-center gap-2`}>
                <span className="truncate">{chat.LastMessagePreview}</span>
                {/* Unread badge (tailoring a standard tailwind badge since messages.html didn't have one explicitly styled as a badge) */}
                {chat.UnreadCount > 0 && (
                  <span className="bg-[#eab308] text-white text-[10px] font-bold px-2 py-0.5 rounded-full flex-shrink-0">
                    {chat.UnreadCount}
                  </span>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </aside>
  );
}
