import { Server } from 'socket.io';

let io = null;

export function initializeSocket(server) {
  io = new Server(server, {
    cors: {
      origin: '*',
    },
  });

  io.on('connection', (socket) => {
    console.log('Socket connected:', socket.id);
  });

  return io;
}

export function getSocket() {
  if (!io) {
    const noop = () => {};
    return {
      to: () => ({ emit: noop }),
      emit: noop,
    };
  }
  return io;
}
