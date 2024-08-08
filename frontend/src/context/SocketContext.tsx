import React, { createContext, useContext, useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';

interface SocketContextType {
  socket: Socket | null;
  on: (event: string, listener: (...args: any[]) => void) => void;
  off: (event: string, listener: (...args: any[]) => void) => void;
}

const SocketContext = createContext<SocketContextType>({ socket: null, on: () => {}, off: () => {} });

export const useSocket = () => useContext(SocketContext);

export const SocketProvider: React.FC<{ token: string | null; children: React.ReactNode }> = ({ children, token }) => {
  const [socket, setSocket] = useState<Socket | null>(null);

  useEffect(() => {
    if (token) {
      const newSocket = io(process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:3001', {
        auth: { token },
      });
      setSocket(newSocket);

      return () => {
        newSocket.close();
      };
    } else {
      setSocket(null);
    }
  }, [token]);

  return (
    <SocketContext.Provider value={{
      socket,
      on: (event, listener) => socket?.on(event, listener),
      off: (event, listener) => socket?.off(event, listener)
    }}>
      {children}
    </SocketContext.Provider>
  );
};