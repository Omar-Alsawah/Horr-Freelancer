import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { toast } from 'sonner';
import { useChatConnection } from '../../../hooks/useClientChatConnection';
import { getMessages, getChats } from '../../../services/chatService';
import MessageBubble from './MessageBubble';
import MessageInput from './MessageInput';

// ─── Import your layout stylesheet ─────────────────────────────────────────
import '../../../styles/chat-styles.css';

const getMessageId = (msg) => {
  if (!msg) return null;
  return msg.Id || msg.MessageId || msg.id || msg.messageId;
};

// Helper to get case-insensitive properties
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

export default function ChatWindow({ chatId, initialActiveChat }) {
  const isValidChat = chatId && chatId !== 'demo-chat-id' && chatId !== 'undefined';
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(isValidChat);
  const [activeChat, setActiveChat] = useState(initialActiveChat || null);
  const navigate = useNavigate();

  // ─── Pagination & Scrolling States ──────────────────────────────────────────
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [isFetchingMore, setIsFetchingMore] = useState(false);

  const containerRef = useRef(null);
  const prevScrollHeightRef = useRef(0);
  const prevScrollTopRef = useRef(0);
  const isPrependingRef = useRef(false);
  const isInitialLoadRef = useRef(true);
  
  // Use Redux for auth in Horr-Front-end
  const user = useSelector((state) => state.auth.user);
  const userId = user?.id || user?.userId || user?.Id;

  // Sync activeChat when prop changes
  useEffect(() => {
    if (initialActiveChat) {
      setActiveChat(initialActiveChat);
    }
  }, [initialActiveChat]);

  // ─── Append incoming SignalR message ──────────────────────────────────────
  const handleNewMessage = (message) => {
    const newId = getMessageId(message);
    if (!newId) return;
    setMessages((prev) => {
      if (prev.some((m) => getMessageId(m) === newId)) {
        return prev;
      }
      return [...prev, message];
    });
  };

  // ─── SignalR connection ────────────────────────────────────────────────────
  const { connectionState } = useChatConnection(chatId, handleNewMessage);

  // ─── Load initial page of messages and chat details ────────────────────────
  useEffect(() => {
    if (!isValidChat) return;
    let active = true;

    const loadData = async () => {
      await Promise.resolve();
      if (!active) return;
      setLoading(true);
      setCurrentPage(1);
      setHasMore(true);
      setIsFetchingMore(false);
      isInitialLoadRef.current = true;

      try {
        // Load active chat info
        if (!initialActiveChat) {
          const chatsList = await getChats();
          if (active && chatsList && Array.isArray(chatsList)) {
            const found = chatsList.find(c => {
              const cId = getProp(c, 'id') || getProp(c, 'chatId');
              return String(cId) === String(chatId);
            });
            if (found) {
              setActiveChat(found);
            }
          }
        }

        // Load messages (page 1)
        const data = await getMessages(chatId, 1);
        if (active) {
          const items = getProp(data, 'items') || [];
          const reversed = [...items].reverse();
          setMessages(reversed);
          if (items.length < 30) {
            setHasMore(false);
          }
        }
      } catch {
        toast.error('Could not load messages from server.');
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    loadData();

    return () => {
      active = false;
    };
  }, [chatId, isValidChat, initialActiveChat]);

  // ─── Handle Scroll Up Lazy Loading ─────────────────────────────────────────
  const handleScroll = async (e) => {
    const container = e.currentTarget;
    if (container.scrollTop < 50 && hasMore && !isFetchingMore && isValidChat && !loading) {
      setIsFetchingMore(true);
      const nextPage = currentPage + 1;

      try {
        // Store current scroll measurements for restoration
        prevScrollHeightRef.current = container.scrollHeight;
        prevScrollTopRef.current = container.scrollTop;

        const data = await getMessages(chatId, nextPage);
        const items = getProp(data, 'items') || [];

        if (items.length < 30) {
          setHasMore(false);
        }

        if (items.length > 0) {
          const reversedNewItems = [...items].reverse();
          isPrependingRef.current = true;
          setMessages((prev) => [...reversedNewItems, ...prev]);
          setCurrentPage(nextPage);
        } else {
          setHasMore(false);
        }
      } catch (err) {
        console.error('Error fetching older messages:', err);
        toast.error('Could not load older messages.');
      } finally {
        setIsFetchingMore(false);
      }
    }
  };

  // ─── Scroll Restoration and Alignment ─────────────────────────────────────
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    if (isInitialLoadRef.current && messages.length > 0) {
      container.scrollTop = container.scrollHeight;
      isInitialLoadRef.current = false;
    } else if (isPrependingRef.current) {
      const diff = container.scrollHeight - prevScrollHeightRef.current;
      container.scrollTop = prevScrollTopRef.current + diff;
      isPrependingRef.current = false;
    } else {
      // Smooth scroll for new message
      container.scrollTo({ top: container.scrollHeight, behavior: 'smooth' });
    }
  }, [messages, loading]);

  // ─── Placeholder state if no active chat is selected ─────────────────────
  if (!chatId || chatId === 'demo-chat-id' || chatId === 'undefined') {
    return (
      <main className="chat-main items-center justify-center text-center p-8 bg-gray-50 dark:bg-zinc-950">
        <div className="flex flex-col items-center max-w-sm">
          <div className="w-16 h-16 bg-amber-100 text-amber-600 rounded-full flex items-center justify-center mb-4 shadow-sm">
            <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">No conversation selected</h3>
          <p className="text-gray-500 dark:text-gray-400 text-sm">
            Select a contact from the sidebar to start chatting, view project details, and access the delivery portal.
          </p>
        </div>
      </main>
    );
  }

  // ─── Loading state ────────────────────────────────────────────────────────
  if (loading) {
    return (
      <main className="chat-main items-center justify-center">
        <div className="w-8 h-8 border-4 border-amber-500 border-t-transparent rounded-full animate-spin" />
      </main>
    );
  }

  // Helper to resolve property names case-insensitively
  const getActiveChatProp = (propName) => {
    if (!activeChat) return null;
    const lower = propName.toLowerCase();
    for (const key of Object.keys(activeChat)) {
      if (key.toLowerCase() === lower) {
        return activeChat[key];
      }
    }
    return null;
  };

  const otherPartyName = getActiveChatProp('otherPartyName') || 'Chat';
  const otherPartyAvatarUrl = getActiveChatProp('otherPartyAvatarUrl');
  const contractId = getActiveChatProp('contractId');

  // ─── Main render ──────────────────────────────────────────────────────────
  return (
    <main className="chat-main">

      {/* ── Name bar ───────────────────────────────────────────────────────── */}
      <header className="chat-header justify-between">

        <div className="flex items-center gap-4">
          <div className="user-status-avatar">
            <img 
              src={
                otherPartyAvatarUrl || 
                `https://ui-avatars.com/api/?name=${encodeURIComponent(otherPartyName)}&background=random`
              } 
              alt={otherPartyName} 
            />
            <div
              className={`status-indicator ${connectionState === 'Connected' ? 'online' : ''}`}
              style={{ display: 'block', background: connectionState === 'Reconnecting' ? '#eab308' : '' }}
            ></div>
          </div>
          <div className="chat-header-info">
            <h3>{otherPartyName}</h3>
            <p className="text-xs text-gray-500">{connectionState}</p>
          </div>
        </div>

        {/* Delivery Portal button */}
        {contractId && (
          <button
            onClick={() => {
              navigate(`/client/contracts/${contractId}/deliveries`);
            }}
            className="bg-[#eab308] text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-opacity-90 transition-opacity"
          >
            Delivery Portal
          </button>
        )}

      </header>

      {/* ── Messages list ──────────────────────────────────────────────────── */}
      <div className="chat-messages" ref={containerRef} onScroll={handleScroll}>

        {isFetchingMore && (
          <div className="flex justify-center py-2 flex-shrink-0">
            <div className="w-5 h-5 border-2 border-amber-500 border-t-transparent rounded-full animate-spin" />
          </div>
        )}

        {messages.length === 0 ? (
          <div className="flex items-center justify-center h-full text-gray-400 text-sm">
            No messages yet. Say hello!
          </div>
        ) : (
          messages.map((message, idx) => {
            const mId = message.Id || message.MessageId || message.id || message.messageId || `msg-${idx}`;
            const mSenderId = message.SenderId || message.senderId;
            return (
              <MessageBubble
                key={mId}
                message={message}
                isOwnMessage={String(mSenderId) === String(userId)}
              />
            );
          })
        )}
      </div>

      {/* ── Input bar ──────────────────────────────────────────────────────── */}
      <MessageInput
        chatId={chatId}
        onMessageSent={(newMessage) => {
          const newId = getMessageId(newMessage);
          if (!newId) return;
          setMessages((prev) => {
            if (prev.some((m) => getMessageId(m) === newId)) {
              return prev;
            }
            return [...prev, newMessage];
          });
        }}
      />

    </main>
  );
}
