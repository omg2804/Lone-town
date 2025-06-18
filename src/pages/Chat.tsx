import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowLeft, 
  Send, 
  User, 
  Video, 
  Phone, 
  MoreVertical,
  Heart,
  Smile,
  Image,
  Mic
} from 'lucide-react';
import { Link, useParams } from 'react-router-dom';
import { useSocket } from '../contexts/SocketContext';
import { useAuth } from '../contexts/AuthContext';
import { format, parseISO } from 'date-fns';

interface Message {
  id: string;
  senderId: string;
  receiverId: string;
  content: string;
  type: 'text' | 'image' | 'voice';
  timestamp: string;
  read: boolean;
}

const Chat = () => {
  const { matchId } = useParams<{ matchId: string }>();
  const { socket, typing } = useSocket();
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [canVideoCall, setCanVideoCall] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout>();

  useEffect(() => {
    if (socket && matchId) {
      // Join match room
      socket.emit('joinMatch', matchId);

      // Listen for messages
      socket.on('newMessage', (message: Message) => {
        setMessages(prev => [...prev, message]);
      });

      // Listen for typing events
      socket.on('userTyping', ({ userId, isTyping }) => {
        if (userId !== user?.id) {
          setIsTyping(isTyping);
        }
      });

      // Load existing messages
      loadMessages();

      return () => {
        socket.off('newMessage');
        socket.off('userTyping');
      };
    }
  }, [socket, matchId, user?.id]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const loadMessages = async () => {
    // Simulate loading messages
    const mockMessages: Message[] = [
      {
        id: '1',
        senderId: user?.id === '1' ? '2' : '1',
        receiverId: user?.id || '1',
        content: 'Hi! I noticed we both love hiking and reading. What\'s your favorite book?',
        type: 'text',
        timestamp: new Date(Date.now() - 3600000).toISOString(),
        read: true
      },
      {
        id: '2',
        senderId: user?.id || '1',
        receiverId: user?.id === '1' ? '2' : '1',
        content: 'Hello! I just finished "The Seven Husbands of Evelyn Hugo" and loved it. What about you?',
        type: 'text',
        timestamp: new Date(Date.now() - 3000000).toISOString(),
        read: true
      },
      {
        id: '3',
        senderId: user?.id === '1' ? '2' : '1',
        receiverId: user?.id || '1',
        content: 'That\'s a great choice! I\'m currently reading "Atomic Habits". Have you been on any good hikes recently?',
        type: 'text',
        timestamp: new Date(Date.now() - 1800000).toISOString(),
        read: true
      }
    ];
    setMessages(mockMessages);
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = () => {
    if (!newMessage.trim() || !socket || !matchId) return;

    const message: Message = {
      id: Date.now().toString(),
      senderId: user?.id || '',
      receiverId: 'partner-id', // This would come from match data
      content: newMessage,
      type: 'text',
      timestamp: new Date().toISOString(),
      read: false
    };

    socket.emit('sendMessage', { matchId, message });
    setMessages(prev => [...prev, message]);
    setNewMessage('');
  };

  const handleTyping = (value: string) => {
    setNewMessage(value);
    
    if (socket && matchId) {
      socket.emit('typing', { matchId, isTyping: true });
      
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
      
      typingTimeoutRef.current = setTimeout(() => {
        socket.emit('typing', { matchId, isTyping: false });
      }, 1000);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const formatMessageTime = (timestamp: string) => {
    const date = parseISO(timestamp);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);
    
    if (diffInHours < 24) {
      return format(date, 'HH:mm');
    } else {
      return format(date, 'MMM d, HH:mm');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 to-purple-50 flex flex-col">
      {/* Header */}
      <motion.div 
        className="bg-white/80 backdrop-blur-sm border-b border-gray-200 p-4"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <div className="container mx-auto max-w-4xl flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Link 
              to="/dashboard"
              className="p-2 rounded-full hover:bg-gray-100 transition-colors duration-200"
            >
              <ArrowLeft className="h-5 w-5 text-gray-600" />
            </Link>
            
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-r from-pink-500 to-purple-600 rounded-full flex items-center justify-center">
                <User className="h-5 w-5 text-white" />
              </div>
              <div>
                <h2 className="font-semibold text-gray-800">Your Match</h2>
                <p className="text-sm text-gray-500">
                  {isTyping ? 'Typing...' : 'Online'}
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            {canVideoCall && (
              <>
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  className="p-2 rounded-full bg-green-100 text-green-600 hover:bg-green-200 transition-colors duration-200"
                >
                  <Video className="h-5 w-5" />
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  className="p-2 rounded-full bg-blue-100 text-blue-600 hover:bg-blue-200 transition-colors duration-200"
                >
                  <Phone className="h-5 w-5" />
                </motion.button>
              </>
            )}
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              className="p-2 rounded-full hover:bg-gray-100 transition-colors duration-200"
            >
              <MoreVertical className="h-5 w-5 text-gray-600" />
            </motion.button>
          </div>
        </div>
      </motion.div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4">
        <div className="container mx-auto max-w-4xl space-y-4">
          <AnimatePresence>
            {messages.map((message, index) => {
              const isOwn = message.senderId === user?.id;
              const showAvatar = index === 0 || messages[index - 1].senderId !== message.senderId;

              return (
                <motion.div
                  key={message.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
                  className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`flex max-w-xs lg:max-w-md ${isOwn ? 'flex-row-reverse' : 'flex-row'} items-end space-x-2`}>
                    {showAvatar && !isOwn && (
                      <div className="w-8 h-8 bg-gradient-to-r from-pink-500 to-purple-600 rounded-full flex items-center justify-center flex-shrink-0">
                        <User className="h-4 w-4 text-white" />
                      </div>
                    )}
                    
                    <div
                      className={`px-4 py-2 rounded-2xl ${
                        isOwn
                          ? 'bg-gradient-to-r from-pink-500 to-purple-600 text-white'
                          : 'bg-white text-gray-800 shadow-sm'
                      } ${showAvatar ? '' : isOwn ? 'mr-10' : 'ml-10'}`}
                    >
                      <p className="text-sm">{message.content}</p>
                      <p className={`text-xs mt-1 ${isOwn ? 'text-pink-100' : 'text-gray-500'}`}>
                        {formatMessageTime(message.timestamp)}
                      </p>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>

          {/* Typing Indicator */}
          <AnimatePresence>
            {isTyping && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="flex justify-start"
              >
                <div className="flex items-end space-x-2">
                  <div className="w-8 h-8 bg-gradient-to-r from-pink-500 to-purple-600 rounded-full flex items-center justify-center">
                    <User className="h-4 w-4 text-white" />
                  </div>
                  <div className="bg-white px-4 py-2 rounded-2xl shadow-sm">
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Message Input */}
      <motion.div 
        className="bg-white/80 backdrop-blur-sm border-t border-gray-200 p-4"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.1 }}
      >
        <div className="container mx-auto max-w-4xl">
          <div className="flex items-end space-x-3">
            <div className="flex space-x-2">
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                className="p-2 rounded-full hover:bg-gray-100 transition-colors duration-200"
              >
                <Image className="h-5 w-5 text-gray-500" />
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                className="p-2 rounded-full hover:bg-gray-100 transition-colors duration-200"
              >
                <Mic className="h-5 w-5 text-gray-500" />
              </motion.button>
            </div>

            <div className="flex-1 relative">
              <textarea
                value={newMessage}
                onChange={(e) => handleTyping(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Type your message..."
                className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-2xl focus:ring-2 focus:ring-pink-500 focus:border-transparent resize-none max-h-32 transition-all duration-200"
                rows={1}
              />
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                className="absolute right-2 top-1/2 transform -translate-y-1/2 p-1 rounded-full hover:bg-gray-100 transition-colors duration-200"
              >
                <Smile className="h-5 w-5 text-gray-500" />
              </motion.button>
            </div>

            <motion.button
              onClick={handleSendMessage}
              disabled={!newMessage.trim()}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="p-3 bg-gradient-to-r from-pink-500 to-purple-600 text-white rounded-full hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
            >
              <Send className="h-5 w-5" />
            </motion.button>
          </div>

          {/* Progress Indicator */}
          {!canVideoCall && (
            <div className="mt-3 flex items-center justify-center">
              <div className="text-xs text-gray-500 flex items-center space-x-2">
                <Heart className="h-3 w-3 text-pink-500" />
                <span>{messages.length}/100 messages to unlock video calls</span>
              </div>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
};

export default Chat;