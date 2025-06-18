const express = require('express');
const User = require('../models/User');
const auth = require('../middleware/auth');

const router = express.Router();

// Save compatibility data
router.post('/compatibility', auth, async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    user.compatibilityData = req.body;
    user.isOnboarded = true;
    await user.save();

    res.json({ message: 'Compatibility data saved successfully' });
  } catch (error) {
    console.error('Save compatibility error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get user compatibility data
router.get('/compatibility', auth, async (req, res) => {
  try {
    const user = await User.findById(req.userId).select('compatibilityData');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json(user.compatibilityData);
  } catch (error) {
    console.error('Get compatibility error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update user profile
router.put('/profile', auth, async (req, res) => {
  try {
    const { name, age } = req.body;
    
    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (name) user.name = name;
    if (age) user.age = age;
    
    await user.save();

    res.json({
      id: user._id,
      email: user.email,
      name: user.name,
      age: user.age,
      isOnboarded: user.isOnboarded,
      state: user.state,
      currentMatchId: user.currentMatchId,
      lastMatchDate: user.lastMatchDate,
      freezeUntil: user.freezeUntil
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;