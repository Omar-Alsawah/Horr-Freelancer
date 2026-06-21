import { useParams } from 'react-router-dom';
import { useEffect, useState } from 'react';
import ChatSidebar from '../components/chat/ChatSidebar';
import ChatWindow from '../components/chat/ChatWindow';
import { getChats } from '../api/chatApi';
import toast from 'react-hot-toast';
import axios from 'axios';

// ─── Import your layout stylesheet ─────────────────────────────────────────
import '../chat-styles.css';

// Helper to resolve property names case-insensitively
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

export default function MessagesPage() {
  const { chatId } = useParams();
  const [chats, setChats] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const controller = new AbortController();
    getChats({ signal: controller.signal })
      .then((data) => {
        setChats(data || []);
      })
      .catch((err) => {
        if (axios.isCancel(err) || err.code === 'ERR_CANCELED') return;
        toast.error('Could not load conversations.');
      })
      .finally(() => {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      });

    return () => {
      controller.abort();
    };
  }, []);

  // Find the active chat object from the list
  const activeChat = chats.find(c => {
    const cId = getProp(c, 'id') || getProp(c, 'chatId');
    return String(cId) === String(chatId);
  });

  return (
    <div className="chat-container h-full w-full max-h-[calc(100vh-70px)]">
      {/* ── Left — conversation list ──────────────────────────────────────── */}
      <ChatSidebar chats={chats} setChats={setChats} loading={loading} />

      {/* ── Right — chat window ───────────────────────────────────────────── */}
      <ChatWindow key={chatId || 'none'} chatId={chatId} initialActiveChat={activeChat} />
    </div>
  );
}