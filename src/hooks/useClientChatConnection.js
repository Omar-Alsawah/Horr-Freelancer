import { useEffect, useRef, useState } from 'react';
import * as signalR from '@microsoft/signalr';
import { toast } from 'sonner';

export function useChatConnection(chatId, onMessageReceived) {
  const connectionRef = useRef(null);
  const [connectionState, setConnectionState] = useState('Disconnected');
  const onMessageReceivedRef = useRef(onMessageReceived);

  // Keep the handler ref updated
  useEffect(() => {
    onMessageReceivedRef.current = onMessageReceived;
  }, [onMessageReceived]);

  useEffect(() => {
    if (!chatId || chatId === 'demo-chat-id' || chatId === 'undefined') return;

    let isMounted = true;

    // Resolve Hub URL dynamically based on VITE_API_BASE_URL
    const apiBase = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5200/api';
    const hubUrl = apiBase.endsWith('/api') ? apiBase.slice(0, -4) + '/hubs/chat' : apiBase + '/hubs/chat';

    // 1. Build the connection
    const connection = new signalR.HubConnectionBuilder()
      .withUrl(hubUrl, {
        accessTokenFactory: () => localStorage.getItem('token'),
      })
      .withAutomaticReconnect()
      .configureLogging(signalR.LogLevel.Warning)
      .build();

    // 2. Register the incoming message handler
    connection.on('ReceiveMessage', (message) => {
      onMessageReceivedRef.current?.(message);
    });

    // 3. Track connection state changes
    connection.onreconnecting(() => {
      if (isMounted) setConnectionState('Reconnecting');
    });
    connection.onreconnected(() => {
      if (isMounted) setConnectionState('Connected');
    });
    connection.onclose(() => {
      if (isMounted) setConnectionState('Disconnected');
    });

    // 4. Start connection then join the chat group
    connection
      .start()
      .then(() => {
        if (!isMounted) {
          if (connection.state === signalR.HubConnectionState.Connected) {
            connection.stop();
          }
          return;
        }
        setConnectionState('Connected');
        return connection.invoke('JoinChat', chatId);
      })
      .catch((err) => {
        if (isMounted) {
          console.error('SignalR connection error:', err);
          toast.error('Could not connect to chat. Please refresh.');
        }
      });

    connectionRef.current = connection;

    // 5. Cleanup — leave chat group if connected, then stop connection
    return () => {
      isMounted = false;
      if (connection.state === signalR.HubConnectionState.Connected) {
        connection
          .invoke('LeaveChat', chatId)
          .catch((err) => console.error('LeaveChat error:', err))
          .finally(() => connection.stop());
      } else {
        connection.stop();
      }
    };
  }, [chatId]); // Re-runs when chatId changes

  return { connectionState };
}

export default useChatConnection;
