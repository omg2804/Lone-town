import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, User, Mail, Calendar, Settings, Edit3, Save, X } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const Profile = () => {
  const { user, updateUser } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    name: user?.name || '',
    email: user?.email || '',
    age: user?.age || 18
  });

  const handleSave = () => {
    updateUser(editForm);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditForm({
      name: user?.name || '',
      email: user?.email || '',
      age: user?.age || 18
    });
    setIsEditing(false);
  };

  return (
    <div className="min-h-screen p-6">
      <div className="container mx-auto max-w-4xl">
        {/* Header */}
        <motion.div 
          className="flex items-center justify-between mb-8"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="flex items-center space-x-3">
            <Link 
              to="/dashboard"
              className="p-2 rounded-full hover:bg-white/50 backdrop-blur-sm transition-colors duration-200"
            >
              <ArrowLeft className="h-5 w-5 text-gray-600" />
            </Link>
            <h1 className="text-2xl font-bold text-gray-800">Profile</h1>
          </div>
          
          {!isEditing ? (
            <motion.button
              onClick={() => setIsEditing(true)}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="flex items-center space-x-2 bg-gradient-to-r from-pink-500 to-purple-600 text-white px-4 py-2 rounded-xl hover:shadow-lg transition-all duration-200"
            >
              <Edit3 className="h-4 w-4" />
              <span>Edit</span>
            </motion.button>
          ) : (
            <div className="flex space-x-2">
              <motion.button
                onClick={handleCancel}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="flex items-center space-x-2 border border-gray-300 text-gray-700 px-4 py-2 rounded-xl hover:bg-gray-50 transition-all duration-200"
              >
                <X className="h-4 w-4" />
                <span>Cancel</span>
              </motion.button>
              <motion.button
                onClick={handleSave}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="flex items-center space-x-2 bg-gradient-to-r from-pink-500 to-purple-600 text-white px-4 py-2 rounded-xl hover:shadow-lg transition-all duration-200"
              >
                <Save className="h-4 w-4" />
                <span>Save</span>
              </motion.button>
            </div>
          )}
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Profile Card */}
          <motion.div 
            className="lg:col-span-1"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-8 shadow-xl text-center">
              <div className="w-32 h-32 mx-auto mb-6 bg-gradient-to-r from-pink-500 to-purple-600 rounded-full flex items-center justify-center">
                <User className="h-16 w-16 text-white" />
              </div>
              
              {isEditing ? (
                <div className="space-y-4">
                  <input
                    type="text"
                    value={editForm.name}
                    onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                    className="w-full text-center text-2xl font-bold text-gray-800 bg-transparent border-b-2 border-pink-300 focus:border-pink-500 outline-none transition-colors duration-200"
                  />
                  <input
                    type="email"
                    value={editForm.email}
                    onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                    className="w-full text-center text-gray-600 bg-transparent border-b-2 border-pink-300 focus:border-pink-500 outline-none transition-colors duration-200"
                  />
                  <input
                    type="number"
                    value={editForm.age}
                    onChange={(e) => setEditForm({ ...editForm, age: parseInt(e.target.value) })}
                    min="18"
                    max="100"
                    className="w-full text-center text-gray-600 bg-transparent border-b-2 border-pink-300 focus:border-pink-500 outline-none transition-colors duration-200"
                  />
                </div>
              ) : (
                <>
                  <h2 className="text-2xl font-bold text-gray-800 mb-2">{user?.name}</h2>
                  <p className="text-gray-600 mb-1">{user?.email}</p>
                  <p className="text-gray-600">{user?.age} years old</p>
                </>
              )}
              
              <div className="mt-6 pt-6 border-t border-gray-200">
                <div className="flex items-center justify-center space-x-2 text-sm">
                  <div className={`w-3 h-3 rounded-full ${
                    user?.state === 'available' ? 'bg-green-500' :
                    user?.state === 'matched' ? 'bg-blue-500' :
                    user?.state === 'pinned' ? 'bg-purple-500' :
                    'bg-red-500'
                  }`} />
                  <span className="text-gray-600 capitalize">{user?.state}</span>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Profile Details */}
          <motion.div 
            className="lg:col-span-2 space-y-6"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            {/* Account Information */}
            <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 shadow-xl">
              <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center space-x-2">
                <User className="h-5 w-5 text-purple-600" />
                <span>Account Information</span>
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Full Name
                  </label>
                  <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-xl">
                    <User className="h-5 w-5 text-gray-400" />
                    <span className="text-gray-800">{user?.name}</span>
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email Address
                  </label>
                  <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-xl">
                    <Mail className="h-5 w-5 text-gray-400" />
                    <span className="text-gray-800">{user?.email}</span>
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Age
                  </label>
                  <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-xl">
                    <Calendar className="h-5 w-5 text-gray-400" />
                    <span className="text-gray-800">{user?.age} years old</span>
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Status
                  </label>
                  <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-xl">
                    <div className={`w-3 h-3 rounded-full ${
                      user?.state === 'available' ? 'bg-green-500' :
                      user?.state === 'matched' ? 'bg-blue-500' :
                      user?.state === 'pinned' ? 'bg-purple-500' :
                      'bg-red-500'
                    }`} />
                    <span className="text-gray-800 capitalize">{user?.state}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Preferences */}
            <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 shadow-xl">
              <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center space-x-2">
                <Settings className="h-5 w-5 text-purple-600" />
                <span>Preferences</span>
              </h3>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                  <span className="text-gray-700">Email Notifications</span>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" className="sr-only peer" defaultChecked />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-pink-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-pink-500"></div>
                  </label>
                </div>
                
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                  <span className="text-gray-700">Push Notifications</span>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" className="sr-only peer" defaultChecked />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-pink-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-pink-500"></div>
                  </label>
                </div>
                
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                  <span className="text-gray-700">Show Online Status</span>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" className="sr-only peer" defaultChecked />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-pink-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-pink-500"></div>
                  </label>
                </div>
              </div>
            </div>

            {/* Compatibility Data */}
            <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 shadow-xl">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">
                Compatibility Profile
              </h3>
              
              <div className="text-center py-8 text-gray-500">
                <Settings className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                <p>Your compatibility data is used to find your perfect matches.</p>
                <Link 
                  to="/onboarding"
                  className="inline-block mt-4 text-purple-600 hover:text-purple-700 font-medium"
                >
                  Update Compatibility Profile
                </Link>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default Profile;