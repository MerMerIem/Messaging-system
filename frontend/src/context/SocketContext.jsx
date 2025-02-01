import { createContext, useContext, useEffect, useState } from 'react';
import { io } from 'socket.io-client';

const SocketContext = createContext();
const SOCKET_URL = '5000-idx-messaging-system-meriem-real-push-1738413544112.cluster-p6qcyjpiljdwusmrjxdspyb5m2.cloudworkstations.dev';

// Generate a stable user ID and name that persists across refreshes
const getOrCreateUser = () => {
  const storedUser = localStorage.getItem('chatUser');
  if (storedUser) {
    return JSON.parse(storedUser);
  }
  
  const newUser = {
    id: 'user_' + Math.random().toString(36).substr(2, 6),
    name: 'User_' + Math.random().toString(36).substr(2, 6)
  };
  
  localStorage.setItem('chatUser', JSON.stringify(newUser))
  return newUser;
};

export const useSocket = () => {
  return useContext(SocketContext);
};

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [messages, setMessages] = useState({});
  const [activeChat, setActiveChat] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  
  const user = getOrCreateUser();
  console.log('Current user:', user);

  useEffect(() => {
    console.log('Initializing socket connection for user:', user);
    
    const newSocket = io(SOCKET_URL, {
      query: { 
        userId: user.id,
        userName: user.name
      },
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000
    });

    newSocket.on('connect', () => {
      console.log('Socket connected successfully', newSocket.id);
      setIsConnected(true);
      setSocket(newSocket);
    });

    newSocket.on('users:online', (users) => {
      console.log('Received online users:', users);
      const filteredUsers = users.filter(u => u.id !== user.id);
      setOnlineUsers(filteredUsers);
    });

    newSocket.on('private:message', (message) => {
      console.log('Received private message:', message);
      setMessages(prev => {
        const chatId = [message.from, message.to].sort().join('-');
        const chatMessages = prev[chatId] || [];
        return {
          ...prev,
          [chatId]: [...chatMessages, message]
        };
      });
    });

    newSocket.on('disconnect', () => {
      console.log('Socket disconnected');
      setIsConnected(false);
    });

    newSocket.on('connect_error', (error) => {
      console.error('Connection error:', error);
      setIsConnected(false);
    });

    return () => {
      console.log('Cleaning up socket connection');
      if (newSocket) {
        newSocket.disconnect();
      }
    };
  }, []); 

  const sendPrivateMessage = (toUserId, content) => {
    console.log('Attempting to send private message:', { to: toUserId, content });
    if (socket && isConnected) {
      const messageData = {
        from: user.id,
        to: toUserId,
        content,
        timestamp: new Date().toISOString()
      };
      socket.emit('private:message', messageData);
      
      // Add message to local state
      const chatId = [user.id, toUserId].sort().join('-');
      setMessages(prev => ({
        ...prev,
        [chatId]: [...(prev[chatId] || []), messageData]
      }));
      
      console.log('Message sent successfully');
    } else {
      console.warn('Cannot send message - socket not connected');
    }
  };

  return (
    <SocketContext.Provider value={{ 
      socket,
      onlineUsers,
      messages,
      activeChat,
      setActiveChat,
      currentUser: user,
      sendPrivateMessage,
      isConnected
    }}>
      {children}
    </SocketContext.Provider>
  );
};