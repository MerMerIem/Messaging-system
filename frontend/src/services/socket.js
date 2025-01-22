import io from 'socket.io-client';

const SOCKET_URL = 'http://localhost:5000';

class SocketService {
  socket = null;
  
  connect() {
    this.socket = io(SOCKET_URL);
    
    this.socket.on('connect', () => {
      console.log('Connected to socket server');
    });

    this.socket.on('error', (error) => {
      console.error('Socket error:', error);
    });
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
    }
  }

  // Basic events your friend needs to implement on backend
  onMessage(callback) {
    this.socket.on('message', callback);
  }

  sendMessage(data) {
    this.socket.emit('message', data);
  }

  onUserConnect(callback) {
    this.socket.on('user_connected', callback);
  }

  onUserDisconnect(callback) {
    this.socket.on('user_disconnected', callback);
  }
}

export const socketService = new SocketService();
