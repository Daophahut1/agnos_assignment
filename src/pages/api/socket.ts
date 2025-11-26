import { Server } from 'socket.io';
import type { NextApiRequest, NextApiResponse } from 'next';

const SocketHandler = (req: NextApiRequest, res: NextApiResponse) => {
  if ((res.socket as any).server.io) {
    console.log('Socket is already running');
  } else {
    console.log('Socket is initializing');
    const io = new Server((res.socket as any).server, {
      path: '/api/socket',
      addTrailingSlash: false,
    });
    (res.socket as any).server.io = io;

    io.on('connection', (socket) => {
      console.log('New client connected');

      socket.on('input-change', (data) => {
        socket.broadcast.emit('update-dashboard', data);
      });

      socket.on('form-submit', (data) => {
        socket.broadcast.emit('new-submission', data);
      });
      
      socket.on('disconnect', () => {
        console.log('Client disconnected');
      });
    });
  }
  res.end();
};

export default SocketHandler;
