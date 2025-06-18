import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Heart, 
  MessageCircle, 
  User, 
  Calendar, 
  Clock, 
  Sparkles, 
  Pin,
  PinOff,
  Video,
  Settings,
  LogOut
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useUser } from '../contexts/UserContext';
import { format, isAfter, parseISO, differenceInHours } from 'date-fns';

const Dashboard = () => {
  const { user, logout } = useAuth();
  const { currentMatch, loading, getCurrentMatch, pinMatch, unpinMatch } = useUser();
  const [timeUntilNextMatch, setTimeUntilNextMatch] = useState('');

  useEffect(() => {
    getCurrentMatch();
  }, []);

  useEffect(() => {
    const updateTimer = () => {
      if (user?.lastMatchDate) {
        const lastMatch = parseISO(user.lastMatchDate);
        const nextMatch = new Date(lastMatch.getTime() + 24 * 60 * 60 * 1000);
        const now = new Date();
        
        if (isAfter(nextMatch, now)) {
          const hours = Math.floor((nextMatch.getTime() - now.getTime()) / (1000 * 60 * 60));
          const minutes = Math.floor(((nextMatch.getTime() - now.getTime()) % (1000 * 60 * 60)) / (1000 * 60));
          setTimeUntilNextMatch(`${hours}h ${minutes}m`);
        } else {
          setTimeUntilNextMatch('Available now!');
        }
      }
    };

    updateTimer();
    const interval = setInterval(updateTimer, 60000);
    return () => clearInterval(interval);
  }, [user?.lastMatchDate]);

  const handlePin = async () => {
    try {
      await pinMatch();
    } catch (error) {
      console.error('Failed to pin match:', error);
    }
  };

  const handleUnpin = async () => {
    try {
      await unpinMatch();
    } catch (error) {
      console.error('Failed to unpin match:', error);
    }
  };

  const getStateMessage = () => {
    if (!user) return '';
    
    switch (user.state) {
      case 'available':
        return 'Ready for your daily match';
      case 'matched':
        return 'You have a new match!';
      case 'pinned':
        return 'Match pinned - continue the conversation';
      case 'frozen':
        const freezeEnd = user.freezeUntil ? parseISO(user.freezeUntil) : null;
        if (freezeEnd && isAfter(freezeEnd, new Date())) {
          const hoursLeft = differenceInHours(freezeEnd, new Date());
          return `Frozen for ${hoursLeft} more hours`;
        }
        return 'Frozen period ended - ready for new matches';
      default:
        return '';
    }
  };

  const getStateColor = () => {
    if (!user) return 'text-gray-500';
    
    switch (user.state) {
      case 'available':
        return 'text-green-600';
      case 'matched':
        return 'text-blue-600';
      case 'pinned':
        return 'text-purple-600';
      case 'frozen':
        return 'text-red-600';
      default:
        return 'text-gray-500';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-pink-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-6">
      <div className="container mx-auto max-w-6xl">
        {/* Header */}
        <motion.div 
          className="flex items-center justify-between mb-8"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="flex items-center space-x-3">
            <Sparkles className="h-8 w-8 text-pink-500" />
            <div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-pink-500 to-purple-600 bg-clip-text text-transparent">
                Welcome back, {user?.name}
              </h1>
              <p className={`text-sm font-medium ${getStateColor()}`}>
                {getStateMessage()}
              </p>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <Link
              to="/profile"
              className="p-2 rounded-xl border border-gray-300 hover:bg-gray-50 transition-colors duration-200"
            >
              <Settings className="h-5 w-5 text-gray-600" />
            </Link>
            <button
              onClick={logout}
              className="p-2 rounded-xl border border-gray-300 hover:bg-gray-50 transition-colors duration-200"
            >
              <LogOut className="h-5 w-5 text-gray-600" />
            </button>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Match Card */}
          <motion.div 
            className="lg:col-span-2"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-8 shadow-xl">
              <AnimatePresence mode="wait">
                {currentMatch ? (
                  <motion.div
                    key="match-found"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{ duration: 0.5 }}
                  >
                    <div className="text-center mb-8">
                      <div className="w-32 h-32 mx-auto mb-6 bg-gradient-to-r from-pink-500 to-purple-600 rounded-full flex items-center justify-center">
                        <User className="h-16 w-16 text-white" />
                      </div>
                      
                      <h2 className="text-3xl font-bold text-gray-800 mb-2">
                        Your Daily Match
                      </h2>
                      
                      <div className="flex items-center justify-center space-x-4 text-sm text-gray-600 mb-4">
                        <div className="flex items-center space-x-1">
                          <Heart className="h-4 w-4 text-pink-500" />
                          <span>{currentMatch.compatibilityScore}% Compatible</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <MessageCircle className="h-4 w-4 text-blue-500" />
                          <span>{currentMatch.messageCount} messages</span>
                        </div>
                        {currentMatch.canVideoCall && (
                          <div className="flex items-center space-x-1">
                            <Video className="h-4 w-4 text-green-500" />
                            <span>Video calls unlocked</span>
                          </div>
                        )}
                      </div>
                      
                      <p className="text-gray-600 mb-6">
                        Matched on {format(parseISO(currentMatch.createdAt), 'MMMM d, yyyy')}
                      </p>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-4">
                      <Link
                        to={`/chat/${currentMatch.id}`}
                        className="flex-1 bg-gradient-to-r from-blue-500 to-purple-600 text-white text-center py-3 rounded-xl font-semibold hover:shadow-lg transition-all duration-200"
                      >
                        Continue Conversation
                      </Link>
                      
                      {currentMatch.status === 'pinned' ? (
                        <motion.button
                          onClick={handleUnpin}
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          className="flex items-center justify-center space-x-2 px-6 py-3 border-2 border-red-500 text-red-600 rounded-xl font-semibold hover:bg-red-50 transition-all duration-200"
                        >
                          <PinOff className="h-5 w-5" />
                          <span>Unpin</span>
                        </motion.button>
                      ) : (
                        <motion.button
                          onClick={handlePin}
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          className="flex items-center justify-center space-x-2 px-6 py-3 border-2 border-pink-500 text-pink-600 rounded-xl font-semibold hover:bg-pink-50 transition-all duration-200"
                        >
                          <Pin className="h-5 w-5" />
                          <span>Pin Match</span>
                        </motion.button>
                      )}
                    </div>
                  </motion.div>
                ) : (
                  <motion.div
                    key="no-match"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{ duration: 0.5 }}
                    className="text-center py-16"
                  >
                    <div className="w-32 h-32 mx-auto mb-6 bg-gray-200 rounded-full flex items-center justify-center">
                      <Heart className="h-16 w-16 text-gray-400" />
                    </div>
                    
                    <h2 className="text-3xl font-bold text-gray-800 mb-4">
                      No Active Match
                    </h2>
                    
                    <p className="text-gray-600 mb-6">
                      {user?.state === 'frozen' 
                        ? 'You are currently in a cooling-off period.'
                        : 'Your next match will appear soon. We are carefully selecting someone special for you.'
                      }
                    </p>
                    
                    {timeUntilNextMatch && (
                      <div className="flex items-center justify-center space-x-2 text-purple-600 font-semibold">
                        <Clock className="h-5 w-5" />
                        <span>Next match: {timeUntilNextMatch}</span>
                      </div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>

          {/* Sidebar */}
          <motion.div 
            className="space-y-6"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            {/* Today's Stats */}
            <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 shadow-xl">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Today's Activity</h3>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Messages sent</span>
                  <span className="font-semibold text-blue-600">
                    {currentMatch?.messageCount || 0}
                  </span>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Compatibility</span>
                  <span className="font-semibold text-pink-600">
                    {currentMatch?.compatibilityScore || 0}%
                  </span>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Status</span>
                  <span className={`font-semibold capitalize ${getStateColor()}`}>
                    {user?.state || 'Unknown'}
                  </span>
                </div>
              </div>
            </div>

            {/* Progress to Video Call */}
            {currentMatch && !currentMatch.canVideoCall && (
              <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 shadow-xl">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Video Call Progress</h3>
                
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Messages</span>
                    <span className="font-semibold">{currentMatch.messageCount}/100</span>
                  </div>
                  
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-gradient-to-r from-green-400 to-green-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${Math.min((currentMatch.messageCount / 100) * 100, 100)}%` }}
                    />
                  </div>
                  
                  <p className="text-xs text-gray-500">
                    Send 100 messages within 48 hours to unlock video calls
                  </p>
                </div>
              </div>
            )}

            {/* Quick Actions */}
            <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 shadow-xl">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Quick Actions</h3>
              
              <div className="space-y-3">
                <Link
                  to="/profile"
                  className="w-full flex items-center space-x-3 p-3 rounded-xl border border-gray-200 hover:bg-gray-50 transition-colors duration-200"
                >
                  <User className="h-5 w-5 text-gray-500" />
                  <span className="text-gray-700">Edit Profile</span>
                </Link>
                
                <button className="w-full flex items-center space-x-3 p-3 rounded-xl border border-gray-200 hover:bg-gray-50 transition-colors duration-200">
                  <Calendar className="h-5 w-5 text-gray-500" />
                  <span className="text-gray-700">Match History</span>
                </button>
                
                <button className="w-full flex items-center space-x-3 p-3 rounded-xl border border-gray-200 hover:bg-gray-50 transition-colors duration-200">
                  <Settings className="h-5 w-5 text-gray-500" />
                  <span className="text-gray-700">Settings</span>
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;