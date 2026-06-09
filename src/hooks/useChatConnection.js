import { useEffect, useRef, useState } from 'react';
import * as signalR from '@microsoft/signalr';
import toast from 'react-hot-toast';

export function useChatConnection(chatId, onMessageReceived) {
  const connectionRef = useRef(null);
  const [connectionState, setConnectionState] = useState('Disconnected');

  useEffect(() => {
    if (!chatId) return;

    // 1. Build the connection
    const connection = new signalR.HubConnectionBuilder()
      .withUrl('https://localhost:5200/hubs/chat', {
        accessTokenFactory: () => localStorage.getItem('horr_token'),
      })
      .withAutomaticReconnect()
      .configureLogging(signalR.LogLevel.Information)
      .build();

    // 2. Register the incoming message handler
    connection.on('ReceiveMessage', onMessageReceived);

    // 3. Track connection state changes
    connection.onreconnecting(() => setConnectionState('Reconnecting'));
    connection.onreconnected(() => setConnectionState('Connected'));
    connection.onclose(() => setConnectionState('Disconnected'));

    // 4. Start connection then join the chat group
    connection
      .start()
      .then(() => {
        setConnectionState('Connected');
        return connection.invoke('JoinChat', chatId);
      })
      .catch((err) => {
        console.error('SignalR connection error:', err);
        toast.error('Could not connect to chat. Please refresh.');
      });

    connectionRef.current = connection;

    // 5. Cleanup — leave chat group and stop connection
    return () => {
      connection
        .invoke('LeaveChat', chatId)
        .catch((err) => console.error('LeaveChat error:', err))
        .finally(() => connection.stop());
    };
  }, [chatId]); // Re-runs when chatId changes

  return { connectionState };
}
