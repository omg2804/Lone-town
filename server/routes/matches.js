const express = require('express');
const Match = require('../models/Match');
const User = require('../models/User');
const auth = require('../middleware/auth');

const router = express.Router();

// Get current match
router.get('/current', auth, async (req, res) => {
  try {
    const match = await Match.findOne({
      $or: [
        { userId: req.userId },
        { partnerId: req.userId }
      ],
      status: { $in: ['active', 'pinned'] }
    }).populate('userId partnerId', 'name age');

    if (!match) {
      return res.json(null);
    }

    res.json(match);
  } catch (error) {
    console.error('Get current match error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Pin a match
router.post('/:matchId/pin', auth, async (req, res) => {
  try {
    const match = await Match.findById(req.params.matchId);
    if (!match) {
      return res.status(404).json({ message: 'Match not found' });
    }

    // Check if user is part of this match
    if (!match.userId.equals(req.userId) && !match.partnerId.equals(req.userId)) {
      return res.status(403).json({ message: 'Unauthorized' });
    }

    // Add user to pinnedBy array if not already pinned
    if (!match.pinnedBy.includes(req.userId)) {
      match.pinnedBy.push(req.userId);
    }

    // If both users have pinned, update match status
    if (match.pinnedBy.length === 2) {
      match.status = 'pinned';
      
      // Update both users' states
      await User.findByIdAndUpdate(match.userId, { state: 'pinned' });
      await User.findByIdAndUpdate(match.partnerId, { state: 'pinned' });
    }

    await match.save();
    res.json(match);
  } catch (error) {
    console.error('Pin match error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Unpin a match
router.post('/:matchId/unpin', auth, async (req, res) => {
  try {
    const match = await Match.findById(req.params.matchId);
    if (!match) {
      return res.status(404).json({ message: 'Match not found' });
    }

    // Check if user is part of this match
    if (!match.userId.equals(req.userId) && !match.partnerId.equals(req.userId)) {
      return res.status(403).json({ message: 'Unauthorized' });
    }

    // Remove user from pinnedBy array
    match.pinnedBy = match.pinnedBy.filter(id => !id.equals(req.userId));
    match.status = 'expired';

    // Get the other user
    const otherUserId = match.userId.equals(req.userId) ? match.partnerId : match.userId;

    // Freeze the user who unpinned for 24 hours
    const freezeUntil = new Date(Date.now() + 24 * 60 * 60 * 1000);
    await User.findByIdAndUpdate(req.userId, { 
      state: 'frozen',
      freezeUntil: freezeUntil,
      currentMatchId: null
    });

    // Set the other user to available after 2 hours and provide feedback
    setTimeout(async () => {
      await User.findByIdAndUpdate(otherUserId, { 
        state: 'available',
        currentMatchId: null
      });
      
      // Generate and save feedback message
      match.feedbackGiven = true;
      match.feedbackMessage = generateFeedbackMessage();
      await match.save();
    }, 2 * 60 * 60 * 1000); // 2 hours

    await match.save();
    res.json(match);
  } catch (error) {
    console.error('Unpin match error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Generate feedback message
function generateFeedbackMessage() {
  const feedbackMessages = [
    "Sometimes timing isn't right, and that's okay. Keep being authentic in your conversations.",
    "Every interaction teaches us something. Focus on building genuine connections.",
    "Not every match will develop into something more, and that's part of the journey.",
    "Consider what you're looking for in a connection and communicate that clearly.",
    "Take time to really get to know someone before making decisions about compatibility."
  ];
  
  return feedbackMessages[Math.floor(Math.random() * feedbackMessages.length)];
}

module.exports = router;