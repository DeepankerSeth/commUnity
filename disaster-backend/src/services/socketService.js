import { Server } from 'socket.io';
import jwt from 'jsonwebtoken';

let io;

export const initializeSocket = (server) => {
  io = new Server(server);
  
  io.use((socket, next) => {
    const token = socket.handshake.auth.token;
    if (!token) {
      return next(new Error('Authentication error'));
    }
    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
      if (err) return next(new Error('Authentication error'));
      socket.userId = decoded.id;
      next();
    });
  });

  io.on('connection', (socket) => {
    console.log(`User ${socket.userId} connected`);
    
    socket.join(socket.userId);
    
    socket.on('disconnect', () => {
      console.log(`User ${socket.userId} disconnected`);
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