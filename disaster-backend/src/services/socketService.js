import { Server } from 'socket.io';

let io;

export const initializeSocket = (server) => {
  io = new Server(server);
  
  io.on('connection', (socket) => {
    console.log('A user connected');
    
    socket.on('authenticate', (userId) => {
      socket.join(userId);
      console.log(`User ${userId} authenticated`);
    });
    
    socket.on('disconnect', () => {
      console.log('User disconnected');
    });
  });
};

export const emitNotification = (userId, notification) => {
  if (io) {
    io.to(userId).emit('newNotification', notification);
  }
};

export const emitIncidentUpdate = (incidentId, updatedIncident) => {
  if (io) {
    io.emit('incidentUpdated', { incidentId, updatedIncident });
  }
};