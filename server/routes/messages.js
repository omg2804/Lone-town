const express = require('express');
const Message = require('../models/Message');
const Match = require('../models/Match');
const auth = require('../middleware/auth');

const router = express.Router();

// Get messages for a match
router.get('/match/:matchId', auth, async (req, res) => {
  try {
    const { matchId } = req.params;
    
    // Verify user is part of this match
    const match = await Match.findById(matchId);
    if (!match || (!match.userId.equals(req.userId) && !match.partnerId.equals(req.userId))) {
      return res.status(403).json({ message: 'Unauthorized' });
    }

    const messages = await Message.find({ matchId })
      .sort({ createdAt: 1 })
      .populate('senderId', 'name')
      .populate('receiverId', 'name');

    res.json(messages);
  } catch (error) {
    console.error('Get messages error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Send a message
router.post('/', auth, async (req, res) => {
  try {
    const { matchId, receiverId, content, type = 'text' } = req.body;

    // Verify match exists and user is part of it
    const match = await Match.findById(matchId);
    if (!match || (!match.userId.equals(req.userId) && !match.partnerId.equals(req.userId))) {
      return res.status(403).json({ message: 'Unauthorized' });
    }

    // Create message
    const message = new Message({
      matchId,
      senderId: req.userId,
      receiverId,
      content,
      type
    });

    await message.save();

    // Update match message count and last message timestamp
    match.messageCount += 1;
    match.lastMessageAt = new Date();
    
    // Check video call eligibility
    match.checkVideoCallEligibility();
    
    await match.save();

    // Populate sender info for response
    await message.populate('senderId', 'name');
    await message.populate('receiverId', 'name');

    res.status(201).json(message);
  } catch (error) {
    console.error('Send message error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Mark messages as read
router.put('/read/:matchId', auth, async (req, res) => {
  try {
    const { matchId } = req.params;

    // Verify user is part of this match
    const match = await Match.findById(matchId);
    if (!match || (!match.userId.equals(req.userId) && !match.partnerId.equals(req.userId))) {
      return res.status(403).json({ message: 'Unauthorized' });
    }

    // Mark all unread messages from the other user as read
    await Message.updateMany(
      {
        matchId,
        receiverId: req.userId,
        read: false
      },
      {
        read: true,
        readAt: new Date()
      }
    );

    res.json({ message: 'Messages marked as read' });
  } catch (error) {
    console.error('Mark messages read error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;