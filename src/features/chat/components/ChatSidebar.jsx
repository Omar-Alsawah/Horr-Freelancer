import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'sonner';
import { formatDistanceToNow } from 'date-fns';
import { getChats } from '../../../services/chatService';

export default function ChatSidebar({ chats: propChats, setChats: propSetChats, loading: propLoading }) {
  const [internalChats, setInternalChats] = useState([]);
  const [internalLoading, setInternalLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();
  const { chatId } = useParams();

  const chats = propChats !== undefined ? propChats : internalChats;
  const setChats = propSetChats !== undefined ? propSetChats : setInternalChats;
  const loading = propLoading !== undefined ? propLoading : internalLoading;

  // ─── Load chats from API on mount ─────────────────────────────────────────
  useEffect(() => {
    if (propChats !== undefined) return;
    getChats()
      .then((data) => {
        setChats(data || []);
      })
      .catch(() => toast.error('Could not load conversations.'))
      .finally(() => setInternalLoading(false));
  }, [propChats, setChats]);

  // ─── Auto-redirect if no valid chatId is present ───────────────────────────
  useEffect(() => {
    if (!loading && chats.length > 0) {
      const hasNoValidChatId = !chatId || chatId === 'demo-chat-id' || chatId === 'undefined';
      if (hasNoValidChatId) {
        const firstChat = chats[0];
        const firstId = firstChat.id || firstChat.chatId || firstChat.Id || firstChat.ChatId;
        if (firstId) {
          navigate(`/client/messages/${firstId}`, { replace: true });
        }
      }
    }
  }, [chatId, chats, loading, navigate]);

  // ─── Filter chats computed during render ─────────────────────────────────
  const filteredChats = searchQuery.trim()
    ? chats.filter((chat) => {
        const name = chat.otherPartyName || chat.OtherPartyName || '';
        const preview = chat.lastMessagePreview || chat.LastMessagePreview || '';
        return (
          name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          preview.toLowerCase().includes(searchQuery.toLowerCase())
        );
      })
    : chats;

  // ─── Shared Header ─────────────────────────────────────────────────────────
  const renderSidebarHeader = () => (
    <div className="chat-sidebar-header">
      <h2 className="chat-sidebar-title">Messages</h2>
      <div className="search-wrapper">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="11" cy="11" r="8"></circle>
          <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
        </svg>
        <input
          type="text"
          placeholder="Search"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
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
            No conversations yet.
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

        {/* No search results */}
        {filteredChats.length === 0 && (
          <div className="flex items-center justify-center py-8 text-gray-400 text-sm">
            No conversations match your search.
          </div>
        )}

        {filteredChats.map((chat) => {
          const cId = chat.id || chat.chatId || chat.Id || chat.ChatId;
          const name = chat.otherPartyName || chat.OtherPartyName || 'User';
          const avatarUrl = chat.otherPartyAvatarUrl || chat.OtherPartyAvatarUrl;
          const time = chat.lastMessageAt || chat.LastMessageAt;
          const preview = chat.lastMessagePreview || chat.LastMessagePreview || '';
          const unread = chat.unreadCount || chat.UnreadCount || 0;

          return (
            <div
              key={cId}
              onClick={() => navigate(`/client/messages/${cId}`)}
              className={`conversation-item ${String(cId) === String(chatId) ? 'active' : ''}`}
              role="button"
              tabIndex={0}
            >
              {/* Avatar */}
              <div className="user-status-avatar">
                <img
                  src={
                    avatarUrl ||
                    'https://ui-avatars.com/api/?name=' +
                    encodeURIComponent(name) +
                    '&background=random'
                  }
                  alt={name}
                />
              </div>

              {/* Info */}
              <div className="conv-info">
                <div className="conv-top">
                  <span className="conv-name truncate">{name}</span>
                  <span className="conv-time flex-shrink-0">
                    {time
                      ? formatDistanceToNow(new Date(time), { addSuffix: true })
                      : ''}
                  </span>
                </div>
                <div
                  className={`conv-preview truncate ${unread > 0 ? 'unread' : ''
                    } flex justify-between items-center gap-2`}
                >
                  <span className="truncate">{preview}</span>
                  {unread > 0 && (
                    <span className="bg-[#eab308] text-white text-[10px] font-bold px-2 py-0.5 rounded-full flex-shrink-0">
                      {unread}
                    </span>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </aside>
  );
}
