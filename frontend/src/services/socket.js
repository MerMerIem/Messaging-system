const SOCKET_URL = 'wss://5000-idx-messaging-system-meriem-real-1738334045250.cluster-p6qcyjpiljdwusmrjxdspyb5m2.cloudworkstations.dev';

console.log('socket url:', SOCKET_URL);

class WebSocketService {
  socket = null;

  // Connect to WebSocket server
  connect() {
    if (this.socket) {
      console.warn('Already connected to WebSocket');
      return;
    }

    this.socket = new WebSocket(SOCKET_URL);

    this.socket.onopen = () => {
      console.log('Connected to WebSocket server');
    };

    this.socket.onerror = (error) => {
      console.error('WebSocket error:', error);
    };

    this.socket.onclose = () => {
      console.log('WebSocket connection closed');
    };
  }

  // Disconnect from WebSocket server
  disconnect() {
    if (this.socket) {
      this.socket.close();
      this.socket = null; // Clear socket after disconnect
    }
  }

  // Handle incoming messages
  onMessage(callback) {
    if (!this.socket) {
      console.error('WebSocket not initialized. Cannot listen for messages');
      return;
    }
    
    this.socket.onmessage = (event) => {
      callback(event.data);
    };
  }

  // Send message to WebSocket server
  sendMessage(data) {
    if (this.socket && this.socket.readyState === WebSocket.OPEN) {
      this.socket.send(data);
    } else {
      console.error('WebSocket is not open. Cannot send message');
    }
  }

  // Handle user connection event
  onUserConnect(callback) {
    this._onEvent('user_connected', callback);
  }

  // Handle user disconnection event
  onUserDisconnect(callback) {
    this._onEvent('user_disconnected', callback);
  }

  // Helper function to handle specific events
  _onEvent(eventType, callback) {
    if (!this.socket) {
      console.error('WebSocket not initialized. Cannot listen for events');
      return;
    }

    this.socket.onmessage = (event) => {
      const message = JSON.parse(event.data);
      if (message.event === eventType) {
        callback(message);
      }
    };
  }
}

export const webSocketService = new WebSocketService();
