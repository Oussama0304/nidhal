import { io } from 'socket.io-client';

const socket = io('http://localhost:3001', {
  autoConnect: false
});

export const connectSocket = (token) => {
  socket.auth = { token };
  socket.connect();
};

export const disconnectSocket = () => {
  socket.disconnect();
};

export default socket;
