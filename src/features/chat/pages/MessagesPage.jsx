import { useParams } from 'react-router-dom';
import { useEffect, useState } from 'react';
import ChatSidebar from '../components/ChatSidebar';
import ChatWindow from '../components/ChatWindow';
import { getChats } from '../../../services/chatService';
import { toast } from 'sonner';

// ─── Import your layout stylesheet ─────────────────────────────────────────
import '../../../styles/chat-styles.css';

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
    let active = true;
    getChats()
      .then((data) => {
        if (active) {
          const chatsData = Array.isArray(data) ? data : (data?.items ?? data?.data ?? []);
          setChats(chatsData);
        }
      })
      .catch((err) => {
        console.error(err);
        toast.error('Could not load conversations.');
      })
      .finally(() => {
        if (active) {
          setLoading(false);
        }
      });

    return () => {
      active = false;
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
