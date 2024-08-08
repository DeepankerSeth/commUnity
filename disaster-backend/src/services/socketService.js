import { Server } from 'socket.io';
import jwt from 'jsonwebtoken';

let io;

export function initializeSocketIO(server) {
  io = new Server(server, {
    cors: {
      origin: process.env.FRONTEND_URL || 'http://localhost:3000',
      methods: ['GET', 'POST']
    }
  });

  io.on('connection', (socket) => {
    console.log('New client connected');
    socket.on('disconnect', () => {
      console.log('Client disconnected');
    });
  });
}

export function emitIncidentUpdate(incidentId, updatedIncident) {
  if (io) {
    io.emit('incidentUpdate', { incidentId, ...updatedIncident });
  }
}

export function emitNewIncident(incident) {
  if (io) {
    io.emit('newIncident', incident);
  }
}

export function emitVerificationUpdate(incidentId, verificationScore, verificationStatus) {
  if (io) {
    io.emit('verificationUpdate', { incidentId, verificationScore, verificationStatus });
  }
}