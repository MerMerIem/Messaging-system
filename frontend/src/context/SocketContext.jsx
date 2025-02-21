import { createContext, useContext, useEffect, useState } from 'react';
import { io } from 'socket.io-client';

const SocketContext = createContext();
<<<<<<< HEAD
const SOCKET_URL = '5000-idx-messaging-system-meriem-1737666434377.cluster-rz2e7e5f5ff7owzufqhsecxujc.cloudworkstations.dev';
=======
const SOCKET_URL = '5000-idx-messaging-system-meriem-real-1738334045250.cluster-p6qcyjpiljdwusmrjxdspyb5m2.cloudworkstations.dev';
>>>>>>> origin/ghani

// Generate a stable user ID and name that persists across refreshes
const getOrCreateUser = () => {
  const storedUser = localStorage.getItem('chatUser');
  if (storedUser) {
    return JSON.parse(storedUser); // Return existing user if found
  }
  
  const newUser = {
    id: 'user_' + Math.random().toString(36).substr(2, 6),
    name: 'User_' + Math.random().toString(36).substr(2, 6)
  };
  
  localStorage.setItem('chatUser', JSON.stringify(newUser));
  return newUser; // Return the newly created user
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
  const [files, setFiles] = useState({});
  
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

    newSocket.on('private:file', (file) => {
      console.log('Received file:', file);
      setFiles(prev => {
        const chatId = [file.from, file.to].sort().join('-');
        return {
          ...prev,
          [chatId]: [...(prev[chatId] || []), file],
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

    newSocket.on('welcome', (message)=>{
      console.log(message);
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

  const sendFile = async (toUserId, file) => {
    console.log('Attempting to send file', { to: toUserId, file });
  
    if (!socket || !isConnected) {
      console.warn('Cannot send file - socket not connected');
      return;
    }
  
    const formData = new FormData();
    formData.append('file', file);
  
    try {
      // Upload file to the backend first
      const response = await fetch('http://localhost:5000/api/sendFile/upload', {
        method: 'POST',
        body: formData,
      });
  
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'File upload failed');
  
      const fileUrl = data.fileUrl;
  
      const fileData = {
        from: user.id,
        to: toUserId,
        fileUrl,  
        fileName: file.name,
        fileType: file.type,
        timestamp: new Date().toISOString(),
      };  
      // Emit event to send the file URL via socket
      socket.emit('private:file', fileData);
  
      // Add file to local state
      const chatId = [user.id, toUserId].sort().join('-');
      setFiles(prev => ({
        ...prev,
        [chatId]: [...(prev[chatId] || []), fileData.fileUrl]
      }));
      
      console.log('File sent successfully',fileData);
    } catch (error) {
      console.error('File upload error:', error);
    }
  };  

  return (
    <SocketContext.Provider value={{ 
      socket,
      onlineUsers,
      messages,
      files,
      activeChat,
      setActiveChat,
      currentUser: user,
      sendPrivateMessage,
      sendFile,
      isConnected
    }}>
      {children}
    </SocketContext.Provider>
  );
};