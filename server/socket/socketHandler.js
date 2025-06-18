const Message = require('../models/Message');
const Match = require('../models/Match');
const User = require('../models/User');

const connectedUsers = new Map();

function socketHandler(io) {
  io.on('connection', (socket) => {
    console.log('User connected:', socket.id);

    // Handle user authentication
    socket.on('authenticate', (userId) => {
      socket.userId = userId;
      connectedUsers.set(userId, socket.id);
      
      // Update user's last seen
      User.findByIdAndUpdate(userId, { lastSeen: new Date() }).exec();
      
      // Emit online users to all clients
      io.emit('onlineUsers', Array.from(connectedUsers.keys()));
    });

    // Handle joining a match room
    socket.on('joinMatch', (matchId) => {
      socket.join(matchId);
      console.log(`User ${socket.userId} joined match ${matchId}`);
    });

    // Handle sending messages
    socket.on('sendMessage', async (data) => {
      try {
        const { matchId, message } = data;
        
        // Verify match exists and user is authorized
        const match = await Match.findById(matchId);
        if (!match || (!match.userId.equals(socket.userId) && !match.partnerId.equals(socket.userId))) {
          socket.emit('error', { message: 'Unauthorized' });
          return;
        }

        // Create and save message
        const newMessage = new Message({
          matchId,
          senderId: socket.userId,
          receiverId: message.receiverId,
          content: message.content,
          type: message.type || 'text'
        });

        await newMessage.save();

        // Update match statistics
        match.messageCount += 1;
        match.lastMessageAt = new Date();
        match.checkVideoCallEligibility();
        await match.save();

        // Populate sender info
        await newMessage.populate('senderId', 'name');
        await newMessage.populate('receiverId', 'name');

        // Emit message to match room
        io.to(matchId).emit('newMessage', newMessage);

        // Send push notification to offline user if needed
        const receiverSocketId = connectedUsers.get(message.receiverId);
        if (!receiverSocketId) {
          // User is offline, could send push notification here
          console.log(`User ${message.receiverId} is offline, message queued`);
        }

      } catch (error) {
        console.error('Error sending message:', error);
        socket.emit('error', { message: 'Failed to send message' });
      }
    });

    // Handle typing indicators
    socket.on('typing', (data) => {
      const { matchId, isTyping } = data;
      socket.to(matchId).emit('userTyping', {
        userId: socket.userId,
        isTyping
      });
    });

    // Handle marking messages as read
    socket.on('markAsRead', async (data) => {
      try {
        const { matchId } = data;
        
        await Message.updateMany(
          {
            matchId,
            receiverId: socket.userId,
            read: false
          },
          {
            read: true,
            readAt: new Date()
          }
        );

        // Notify sender that messages were read
        socket.to(matchId).emit('messagesRead', {
          userId: socket.userId,
          matchId
        });

      } catch (error) {
        console.error('Error marking messages as read:', error);
      }
    });

    // Handle video call requests
    socket.on('videoCallRequest', (data) => {
      const { matchId, receiverId } = data;
      const receiverSocketId = connectedUsers.get(receiverId);
      
      if (receiverSocketId) {
        io.to(receiverSocketId).emit('incomingVideoCall', {
          matchId,
          callerId: socket.userId
        });
      }
    });

    // Handle video call responses
    socket.on('videoCallResponse', (data) => {
      const { matchId, callerId, accepted } = data;
      const callerSocketId = connectedUsers.get(callerId);
      
      if (callerSocketId) {
        io.to(callerSocketId).emit('videoCallResponse', {
          matchId,
          accepted,
          responderId: socket.userId
        });
      }
    });

    // Handle disconnection
    socket.on('disconnect', () => {
      console.log('User disconnected:', socket.id);
      
      if (socket.userId) {
        connectedUsers.delete(socket.userId);
        
        // Update user's last seen
        User.findByIdAndUpdate(socket.userId, { lastSeen: new Date() }).exec();
        
        // Emit updated online users
        io.emit('onlineUsers', Array.from(connectedUsers.keys()));
      }
    });
  });
}

module.exports = socketHandler;