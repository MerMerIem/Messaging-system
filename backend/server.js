import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';

const app = express();
app.use(cors());

const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
    credentials: true
  }
});

// Store user connections - Map<userId, Set<connection>>
const userConnections = new Map();

// Helper to get unique online users
const getUniqueOnlineUsers = () => {
  const uniqueUsers = [];
  userConnections.forEach((connections, userId) => {
    if (connections.size > 0) {
      const userInfo = Array.from(connections)[0];
      uniqueUsers.push({
        id: userId,
        name: userInfo.userName
      });
    }
  });
  console.log('Current unique online users:', uniqueUsers);
  return uniqueUsers;
};

// Helper to broadcast online users
const broadcastOnlineUsers = () => {
  const users = getUniqueOnlineUsers();
  console.log('Broadcasting online users:', users);
  io.emit('users:online', users);
};

io.on('connection', (socket) => {
  const userId = socket.handshake.query.userId;
  const userName = socket.handshake.query.userName;

  console.log('New connection attempt:', {
    socketId: socket.id,
    userId,
    userName
  });

  if (!userId || !userName) {
    console.log('Rejecting connection - missing user info');
    socket.disconnect();
    return;
  }

  // Initialize user's connection set if it doesn't exist
  if (!userConnections.has(userId)) {
    userConnections.set(userId, new Set());
  }

  // Add this connection to user's set
  userConnections.get(userId).add({
    socketId: socket.id,
    userName
  });

  console.log(`User ${userId} connected successfully:`, {
    socketId: socket.id,
    connectionsCount: userConnections.get(userId).size
  });

  // Send current online users to everyone
  broadcastOnlineUsers();

  // Handle private messages
  socket.on('private:message', (message) => {
    console.log('Processing private message:', message);

    // Send to all recipient's connections
    const recipientConnections = userConnections.get(message.to);
    if (recipientConnections) {
      recipientConnections.forEach(conn => {
        io.to(conn.socketId).emit('private:message', message);
        console.log(`Message sent to recipient socket: ${conn.socketId}`);
      });
    }

    // Send to sender's other connections (if any)
    const senderConnections = userConnections.get(message.from);
    if (senderConnections) {
      senderConnections.forEach(conn => {
        if (conn.socketId !== socket.id) {
          io.to(conn.socketId).emit('private:message', message);
          console.log(`Message sent to sender's other socket: ${conn.socketId}`);
        }
      });
    }
  });

  // Handle disconnection
  socket.on('disconnect', () => {
    console.log(`Client disconnecting:`, {
      socketId: socket.id,
      userId
    });

    const userSockets = userConnections.get(userId);
    if (userSockets) {
      // Remove this specific socket
      userSockets.forEach(conn => {
        if (conn.socketId === socket.id) {
          userSockets.delete(conn);
          console.log(`Removed socket ${socket.id} for user ${userId}`);
        }
      });

      // If no more connections, remove user entirely
      if (userSockets.size === 0) {
        userConnections.delete(userId);
        console.log(`User ${userId} has no more connections, removing entirely`);
      }

      // Update online users list
      broadcastOnlineUsers();
    }
  });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log('Waiting for connections...');
});

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('\nShutting down server...');
  io.close(() => {
    console.log('Socket.IO server closed');
    server.close(() => {
      console.log('HTTP server closed');
      process.exit(0);
    });
  });
});