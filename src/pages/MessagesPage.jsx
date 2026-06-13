import { useParams } from 'react-router-dom';
import ChatSidebar from '../components/chat/ChatSidebar';
import ChatWindow from '../components/chat/ChatWindow';

// ─── Import your layout stylesheet ─────────────────────────────────────────
import '../chat-styles.css';

export default function MessagesPage() {
  const { chatId } = useParams();

  // If no chatId exists in the URL, we pass undefined so the ChatWindow renders
  // the empty/placeholder state until ChatSidebar redirects to the first chat.
  const activeChatId = chatId;

  return (
    <div className="chat-container h-full w-full max-h-[calc(100vh-70px)]">
      {/* ── Left — conversation list ──────────────────────────────────────── */}
      <ChatSidebar />

      {/* ── Right — chat window ───────────────────────────────────────────── */}
      <ChatWindow key={activeChatId || 'none'} chatId={activeChatId} />
    </div>
  );
}