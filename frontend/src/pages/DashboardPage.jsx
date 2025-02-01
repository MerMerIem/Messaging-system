import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSocket } from '../context/SocketContext';
import { socketService } from '../services/socket';

const UserSidebar = ({onlineUsers, setActiveChat, activeChat}) => (
  <div className="w-1/4 bg-white shadow-md p-4 rounded-xl">
    <h2 className="text-xl font-semibold text-blue-600 mb-4">Online Users</h2>
    <div className="space-y-2">
      {onlineUsers.map(user => (
        <div
          key={user.id}
          onClick={() => {
            console.log('Selecting chat with user:', user);
            setActiveChat(user);
          }}
          className={`p-3 rounded-lg cursor-pointer transition-colors bg-gray-100 ${
            activeChat?.id === user.id 
              ? 'bg-blue-100 text-blue-800' 
              : 'hover:bg-gray-100'
          }`}
        >
          <div className="font-medium text-blue-600">{user.name}</div>
        </div>
      ))}
    </div>
  </div>
);

const ChatArea = ({messagesEndRef, messageInput, setMessageInput, activeChat, chatMessages, handleSendMessage, currentUser}) => (
  <div className="flex-1 flex-col bg-white justify-between rounded-xl p-4 shadow-md">
    {activeChat ? (
      <>
        {/* Chat Header */}
        <div className="bg-white border-b pb-4 border-gray-200">
          <h3 className="text-lg font-semibold text-blue-600">
            Chat with <span className='font-bold'>{activeChat.name}</span>
          </h3>
        </div>

        <div className="overflow-y-auto my-4 space-y-4 h-auto max-h-60 p-4 bg-white scrollbar-thin scrollbar-thumb-blue-500 scrollbar-track-white">
          {chatMessages.map((message, index) => (
            <div
              key={index}
              className={`flex ${
                message.from === currentUser.id ? 'justify-end' : 'justify-start'
              }`}
            >
              <div
                className={`max-w-[70%] rounded-lg p-3 ${
                  message.from === currentUser.id
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-200 text-gray-900'
                }`}
              >
                <p>{message.content}</p>
                <p className="text-xs mt-1 opacity-70">
                  {new Date(message.timestamp).toLocaleTimeString()}
                </p>
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>

        {/* Message Input */}
        <form onSubmit={handleSendMessage} className=" border-gray-200">
          <div className="flex space-x-2">
            <input
              type="text"
              value={messageInput}
              onChange={(e) => setMessageInput(e.target.value)}
              placeholder="Type a message..."
              className="flex-1 bg-white text-gray-900 p-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
            />
            <button
              type="submit"
              className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
            >
              Send
            </button>
          </div>
        </form>
      </>
    ) : (
      <div className="flex-1 flex items-center justify-center text-gray-500">
        Select a user to start chatting
      </div>
    )}
  </div>
);

function DashboardPage() {
  const { 
    onlineUsers, 
    messages, 
    activeChat, 
    setActiveChat, 
    currentUser, 
    sendPrivateMessage 
  } = useSocket();

  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const messagesEndRef = useRef(null);
  const [messageInput, setMessageInput] = useState('');

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, activeChat]);

  const chatId = activeChat ? [currentUser.id, activeChat.id].sort().join('-') : null;
  const chatMessages = chatId ? messages[chatId] || [] : [];

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (messageInput.trim() && activeChat) {
      sendPrivateMessage(activeChat.id, messageInput.trim());
      setMessageInput('');
    }
  };

  const handleLogout = () => {
    socketService.disconnect();
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

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

      <div className="max-w-7xl mx-auto mt-8 p-6 ">
        {error ? (
          <div className="bg-red-50 text-red-500 p-4 rounded-lg mb-4">
            {error}
          </div>
        ) : (
          <div className="flex gap-6 min-h-80">
            <UserSidebar
              activeChat={activeChat}
              setActiveChat={setActiveChat}
              onlineUsers={onlineUsers}
            />
            <ChatArea
              chatMessages={chatMessages}
              activeChat={activeChat}
              handleSendMessage={handleSendMessage}
              messageInput={messageInput}
              setMessageInput={setMessageInput}
              messagesEndRef={messagesEndRef}
              currentUser={currentUser}
            />
          </div>
        )}
      </div>
    </div>
  );
}

export default DashboardPage;