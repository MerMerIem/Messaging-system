import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowUpFromLine  } from 'lucide-react';
import { socketService } from '../services/socket';
import { messageApi } from '../services/messageApi';

const UserSidebar = ({ users, selectedUser, onSelectUser }) => (
  <div className="w-80 bg-white rounded-xl p-4 border border-gray-100">
    <h2 className="text-lg font-semibold mb-6 text-blue-800 px-2">Contacts</h2>
    <div className="space-y-1">
      {users.map((user) => (
        <div
          key={user.id}
          onClick={() => onSelectUser(user)}
          className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-all duration-200
            ${selectedUser?.id === user.id 
              ? 'bg-blue-50 border-l-4 border-blue-500' 
              : 'hover:bg-gray-50 border-l-4 border-transparent'
            }`}
        >
          <div className="relative">
            <img
              src={user.avatar}
              alt={user.name}
              className="w-12 h-12 rounded-full object-cover ring-2 ring-blue-100"
            />
            <div
              className={`absolute bottom-0 right-0 w-3.5 h-3.5 rounded-full border-2 border-white
                ${user.online ? 'bg-green-500' : 'bg-gray-400'}
                shadow-lg`}
            />
          </div>
          <div className="flex flex-col">
            <span className="font-medium text-gray-800">{user.name}</span>
            <span className="text-xs text-gray-500">
              {user.online ? 'Online' : 'Offline'}
            </span>
          </div>
        </div>
      ))}
    </div>
  </div>
);

const MessageBubble = ({ message }) => (
  <div
    className={`p-3 rounded-lg max-w-[70%] shadow-sm ${
      message.sender === 'me'
        ? 'bg-blue-600 text-white ml-auto rounded-br-none'
        : 'bg-gray-100 text-gray-800 rounded-bl-none'
    }`}
  >
    <div className="break-words">{message.text}</div>
    {message.file && (
      <div className={`mt-2 p-2 rounded flex items-center gap-2 ${
        message.sender === 'me' ? 'bg-blue-500' : 'bg-gray-200'
      }`}>
        <span>📎</span>
        <a 
          href={URL.createObjectURL(message.file)} 
          download={message.file.name}
          className="hover:underline truncate text-sm"
        >
          {message.file.name}
        </a>
      </div>
    )}
    <div className={`text-xs mt-1 ${
      message.sender === 'me' ? 'text-blue-100' : 'text-gray-500'
    }`}>
      {new Date(message.timestamp).toLocaleTimeString()}
    </div>
  </div>
);

const ChatInput = ({ onSend, disabled }) => {
  const [newMessage, setNewMessage] = useState('');
  const [attachedFile, setAttachedFile] = useState(null);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (newMessage.trim() || attachedFile) {
      onSend(newMessage, attachedFile);
      setNewMessage('');
      setAttachedFile(null);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex gap-2 pt-4 border-t">
      {attachedFile && (
        <div className="absolute bottom-20 left-4 bg-white p-3 rounded-lg shadow-lg flex items-center gap-2 border border-blue-100">
          <span className="text-blue-500"> <ArrowUpFromLine /> </span>
          <span className="text-sm text-gray-600 truncate max-w-[200px]">{attachedFile.name}</span>
          <button
            type="button"
            onClick={() => setAttachedFile(null)}
            className="text-gray-400 hover:text-red-500 transition-colors"
          >
            ✕
          </button>
        </div>
      )}
      <input
        type="text"
        value={newMessage}
        onChange={(e) => setNewMessage(e.target.value)}
        placeholder="Type a message..."
        className="flex-1 p-3 border rounded-full bg-gray-50 text-gray-700 focus:bg-white focus:ring-2 focus:ring-blue-200 focus:border-blue-400 transition-all outline-none"
        disabled={disabled}
      />
      <input
        type="file"
        onChange={(e) => setAttachedFile(e.target.files[0])}
        className="hidden"
        id="file-attachment"
      />
      <label
        htmlFor="file-attachment"
        className="p-3 text-blue-500 hover:bg-blue-50 rounded-full cursor-pointer transition-colors"
        title="Attach file"
      >
        <ArrowUpFromLine />
      </label>
      <button
        type="submit"
        className="px-6 py-3 bg-blue-600 text-white rounded-full hover:bg-blue-700 disabled:opacity-50 disabled:hover:bg-blue-600 transition-colors font-medium"
        disabled={disabled}
      >
        Send
      </button>
    </form>
  );
};

const ChatArea = ({ selectedUser, messages, onSendMessage }) => (
  <div className="flex-1 bg-white rounded-xl p-4 border border-gray-100 min-h-[45rem]">
    {selectedUser ? (
      <>
        <div className="border-b pb-4 mb-4">
          <div className="flex items-center gap-3">
            <img
              src={selectedUser.avatar}
              alt={selectedUser.name}
              className="w-10 h-10 rounded-full ring-2 ring-blue-100"
            />
            <div>
              <span className="font-medium text-gray-800">{selectedUser.name}</span>
              <div className="text-sm text-gray-500">
                {selectedUser.online ? 'Online' : 'Offline'}
              </div>
            </div>
          </div>
        </div>
        <div className="h-[500px] overflow-y-auto mb-4 space-y-3 scrollbar-thin scrollbar-thumb-blue-200 scrollbar-track-gray-50 pr-2">
          {messages.map((message, index) => (
            <MessageBubble key={index} message={message} />
          ))}
        </div>
        <ChatInput onSend={onSendMessage} disabled={!selectedUser} />
      </>
    ) : (
      <div className="h-full flex flex-col items-center justify-center text-gray-500 space-y-4">
        <div className="w-16 h-16 rounded-full bg-blue-50 flex items-center justify-center">
          <span className="text-2xl">💬</span>
        </div>
        <p className="text-lg">Select a contact to start messaging</p>
      </div>
    )}
  </div>
);

function DashboardPage() {
  const [messages, setMessages] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  // Load users and initialize socket connection
  useEffect(() => {
    const initializeDashboard = async () => {
      try {
        setIsLoading(true);
        
        // Check authentication
        const currentUser = await messageApi.getCurrentUser();
        if (!currentUser) {
          navigate('/login');
          return;
        }

        // Get initial users list
        const users = await messageApi.getUsers();
        setOnlineUsers(users);

        // Connect to socket
        socketService.connect();

        // Listen for online status changes
        socketService.onUserConnect((userId) => {
          setOnlineUsers(prev => 
            prev.map(u => u.id === userId ? { ...u, online: true } : u)
          );
        });

        socketService.onUserDisconnect((userId) => {
          setOnlineUsers(prev => 
            prev.map(u => u.id === userId ? { ...u, online: false } : u)
          );
        });

        // Listen for new messages
        socketService.onMessage((message) => {
          if (selectedUser?.id === message.senderId) {
            setMessages(prev => [...prev, message]);
          }
        });

      } catch (error) {
        console.error('Error initializing dashboard:', error);
        setError('Failed to load contacts');
      } finally {
        setIsLoading(false);
      }
    };

    initializeDashboard();

    return () => {
      socketService.disconnect();
    };
  }, [navigate]);

  // Load message history when user is selected
  useEffect(() => {
    const loadMessages = async () => {
      if (selectedUser) {
        try {
          const history = await messageApi.getMessageHistory(selectedUser.id);
          setMessages(history);
        } catch (error) {
          console.error('Error loading messages:', error);
          setError('Failed to load messages');
        }
      }
    };

    loadMessages();
  }, [selectedUser]);

  const handleSendMessage = async (text, file) => {
    if (!selectedUser || (!text.trim() && !file)) return;

    try {
      let fileUrl = null;
      if (file) {
        const uploadResult = await messageApi.uploadFile(file);
        fileUrl = uploadResult.url;
      }

      const messageData = {
        text: text.trim(),
        fileUrl,
        recipientId: selectedUser.id,
        timestamp: new Date().toISOString()
      };

      // Send via socket
      socketService.sendMessage(messageData);

      // Save to backend
      const savedMessage = await messageApi.sendMessage(messageData);
      
      // Update local state
      setMessages(prev => [...prev, savedMessage]);
    } catch (error) {
      console.error('Error sending message:', error);
      setError('Failed to send message');
    }
  };

  const handleLogout = () => {
    socketService.disconnect();
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-gray-100 flex items-center justify-center">
        <div className="text-blue-600">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-gray-100">
      <nav className="bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <h1 className="text-xl font-bold text-blue-800">Messaging App</h1>
          <button
            onClick={handleLogout}
            className="px-4 py-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
          >
            Logout
          </button>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto mt-8 p-6">
        {error ? (
          <div className="bg-red-50 text-red-500 p-4 rounded-lg mb-4">
            {error}
          </div>
        ) : (
          <div className="flex gap-6">
            <UserSidebar
              users={onlineUsers}
              selectedUser={selectedUser}
              onSelectUser={setSelectedUser}
            />
            <ChatArea
              selectedUser={selectedUser}
              messages={messages}
              onSendMessage={handleSendMessage}
            />
          </div>
        )}
      </div>
    </div>
  );
}

export default DashboardPage;
