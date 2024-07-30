import { io, Socket } from 'socket.io-client';

let socket: Socket | null = null;

export const initializeSocket = (userId: string) => {
  if (!socket) {
    socket = io(process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:3002', {
      query: { userId },
    });

    socket.on('connect', () => {
      console.log('Connected to WebSocket server');
    });

    socket.on('disconnect', () => {
      console.log('Disconnected from WebSocket server');
    });

    socket.on('error', (error) => {
      console.error('WebSocket error:', error);
    });
  }

  return socket;
};

export const getSocket = () => {
  if (!socket) {
    throw new Error('Socket not initialized. Call initializeSocket first.');
  }
  return socket;
};

export const closeSocket = () => {
  if (socket) {
    socket.close();
    socket = null;
  }
};

export const subscribeToIncidentUpdates = (callback: (incident: any) => void) => {
  const socket = getSocket();
  socket.on('incidentsUpdated', callback);
};

export const subscribeToNotifications = (callback: (notification: any) => void) => {
  const socket = getSocket();
  socket.on('newNotification', callback);
};
