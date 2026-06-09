import React from 'react';
import { useParams } from 'react-router-dom';
import ChatSidebar from '../components/chat/ChatSidebar';
import ChatWindow from '../components/chat/ChatWindow';

// ─── Import your layout stylesheet ─────────────────────────────────────────
import '../chat-styles.css';

export default function MessagesPage() {
  const { chatId } = useParams();

  // For testing purposes, if no chatId exists in the URL, we can force a fallback 
  // parameter or let it render the styled placeholder.
  const activeChatId = chatId || "demo-chat-id";

  return (
    <div className="chat-container h-full w-full max-h-[calc(100vh-70px)]">
      {/* ── Left — conversation list ──────────────────────────────────────── */}
      <ChatSidebar />

      {/* ── Right — chat window ───────────────────────────────────────────── */}
      <ChatWindow chatId={activeChatId} />
    </div>
  );
}