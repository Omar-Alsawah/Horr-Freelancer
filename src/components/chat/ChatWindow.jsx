import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useAuthStore } from '../../store/authStore';
import { useChatConnection } from '../../hooks/useChatConnection';
import { getMessages } from '../../api/chatApi';
import MessageBubble from './MessageBubble';
import MessageInput from './MessageInput';

// ─── Import your layout stylesheet ─────────────────────────────────────────
import '../../chat-styles.css';

export default function ChatWindow({ chatId }) {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const bottomRef = useRef(null);
  const navigate = useNavigate();
  // We use the named import for useAuthStore based on src/store/authStore.js
  const { user } = useAuthStore();
  const userId = user?.userId;

  // ─── Append incoming SignalR message ──────────────────────────────────────
  const handleNewMessage = (message) => {
    setMessages((prev) => [...prev, message]);
  };

  // ─── SignalR connection ────────────────────────────────────────────────────
  const { connectionState } = useChatConnection(chatId, handleNewMessage);

  // ─── Load mock messages on mount / chatId change (no backend) ──────────────
  useEffect(() => {
    if (!chatId) return;
    setLoading(true);
    setMessages([
      {
        Id: '1',
        Type: 0,
        TextContent: 'Hey! I have added some of my feedback to this doc. Let me know if you have any questions!',
        SenderId: 'other',
        SenderAvatarUrl: '',
        SentAt: new Date().toISOString(),
      },
      {
        Id: '2',
        Type: 0,
        TextContent: 'Awesome, thank you so much! I will take a look soon.',
        SenderId: 'me',
        SenderAvatarUrl: '',
        SentAt: new Date().toISOString(),
      },
      {
        Id: '3',
        Type: 3,
        FileName: 'Design Feedback.pdf',
        FileUrl: '',
        SenderId: 'other',
        SenderAvatarUrl: '',
        SentAt: new Date().toISOString(),
      },
    ]);
    setLoading(false);
  }, [chatId]);

  // ─── Auto-scroll to bottom on new messages ────────────────────────────────
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // ─── Loading state ────────────────────────────────────────────────────────
  if (loading) {
    return (
      <main className="chat-main items-center justify-center">
        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </main>
    );
  }

  // ─── Main render ──────────────────────────────────────────────────────────
  return (
    <main className="chat-main">

      {/* ── Name bar ───────────────────────────────────────────────────────── */}
      <header className="chat-header justify-between">

        <div className="flex items-center gap-4">
          <div className="user-status-avatar">
            <img src={'https://ui-avatars.com/api/?name=Chat&background=random'} alt="User" />
            <div
              className={`status-indicator ${connectionState === 'Connected' ? 'online' : ''}`}
              style={{ display: 'block', background: connectionState === 'Reconnecting' ? '#eab308' : '' }}
            ></div>
          </div>
          <div className="chat-header-info">
            <h3>Chat</h3>
            <p className="text-xs text-gray-500">{connectionState}</p>
          </div>
        </div>

        {/* Delivery Portal button */}
        <button
          onClick={() => {
            // TODO: wire contractId from chat data
            navigate(`/contracts/undefined/deliver`);
          }}
          className="bg-[#eab308] text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-opacity-90 transition-opacity"
        >
          Delivery Portal
        </button>

      </header>

      {/* ── Messages list ──────────────────────────────────────────────────── */}
      <div className="chat-messages">

        {messages.length === 0 ? (
          <div className="flex items-center justify-center h-full text-gray-400 text-sm">
            No messages yet. Say hello!
          </div>
        ) : (
          messages.map((message) => (
            <MessageBubble
              key={message.Id || message.MessageId || Math.random().toString()}
              message={message}
              isOwnMessage={message.SenderId === userId}
            />
          ))
        )}

        {/* Scroll anchor */}
        <div ref={bottomRef} />
      </div>

      {/* ── Input bar ──────────────────────────────────────────────────────── */}
      <MessageInput
        chatId={chatId}
        onMessageSent={(newMessage) =>
          setMessages((prev) => [...prev, newMessage])
        }
      />

    </main>
  );
}