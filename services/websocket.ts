import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';

const BACKEND_URLS = {
  local: 'http://localhost:8080',
  production: 'https://hyoshii-farm-be-569244639422.asia-southeast2.run.app'
};

export const createWebSocketClient = (
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  onMessage: (data: any) => void,
  onStatusChange: (status: string) => void
) => {
  const backendUrl = window.location.hostname === 'localhost' 
    ? BACKEND_URLS.local 
    : BACKEND_URLS.production;

  const client = new Client({
    webSocketFactory: () => new SockJS(`${backendUrl}/ws`),
    connectHeaders: {},
    debug: (str) => {
      console.log('STOMP: ' + str);
    },
    reconnectDelay: 5000,
    heartbeatIncoming: 4000,
    heartbeatOutgoing: 4000
  });

  client.onConnect = () => {
    onStatusChange('Connected');

    client.subscribe('/topic/plc-monitoring', (message) => {
      try {
        const data = JSON.parse(message.body);
        onMessage(data);
      } catch (error) {
        console.error('Error parsing message:', error);
      }
    });
  };

  client.onStompError = (frame) => {
    console.error('STOMP error:', frame);
    onStatusChange('Error');
  };

  client.onWebSocketClose = () => {
    onStatusChange('Disconnected');
  };

  return client;
};