import { useEffect, useRef, useState } from 'react';
import * as signalR from '@microsoft/signalr';
import toast from 'react-hot-toast';

export function useChatConnection(chatId, onMessageReceived) {
  const connectionRef = useRef(null);
  const [connectionState, setConnectionState] = useState('Disconnected');

  useEffect(() => {
    if (!chatId) return;

    let isMounted = true;

    // 1. Build the connection
    const connection = new signalR.HubConnectionBuilder()
      .withUrl('https://localhost:7070/hubs/chat', {
        accessTokenFactory: () => localStorage.getItem('horr_token'),
      })
      .withAutomaticReconnect()
      .configureLogging(signalR.LogLevel.Warning)
      .build();

    // 2. Register the incoming message handler
    connection.on('ReceiveMessage', onMessageReceived);

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
