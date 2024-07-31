import { Server } from 'socket.io';
import http from 'http';

let io;

export const initializeSocket = (app) => {
  const server = http.createServer(app);
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

export function emitIncidentUpdate(incidentId, updatedData) {
  if (io) {
    io.emit('incidentUpdate', { incidentId, ...updatedData });
  }
}

export function emitClusterUpdate(clusterData) {
  if (io) {
    io.emit('clusterUpdate', clusterData);
  }
}

export function emitVerificationUpdate(incidentId, verificationData) {
  if (io) {
    io.emit('verificationUpdate', { incidentId, ...verificationData });
  }
}

export function emitRiskUpdate(userId, riskData) {
  if (io) {
    io.to(userId.toString()).emit('riskUpdate', riskData);
  }
}

export function emitNotification(userId, notification) {
  if (io) {
    io.to(userId.toString()).emit('notification', notification);
  }
}

export function setupSocketHandlers(socket) {
  socket.on('joinRoom', (userId) => {
    socket.join(userId.toString());
  });

  socket.on('leaveRoom', (userId) => {
    socket.leave(userId.toString());
  });

  socket.on('disconnect', () => {
    console.log('User disconnected');
  });
}