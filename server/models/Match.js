const mongoose = require('mongoose');

const matchSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  partnerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  compatibilityScore: {
    type: Number,
    required: true,
    min: 0,
    max: 100
  },
  status: {
    type: String,
    enum: ['active', 'pinned', 'expired', 'unmatched'],
    default: 'active'
  },
  pinnedBy: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  messageCount: {
    type: Number,
    default: 0
  },
  lastMessageAt: {
    type: Date,
    default: null
  },
  canVideoCall: {
    type: Boolean,
    default: false
  },
  expiresAt: {
    type: Date,
    required: true
  },
  feedbackGiven: {
    type: Boolean,
    default: false
  },
  feedbackMessage: {
    type: String,
    default: null
  }
}, {
  timestamps: true
});

// Index for efficient querying
matchSchema.index({ userId: 1, status: 1 });
matchSchema.index({ partnerId: 1, status: 1 });
matchSchema.index({ expiresAt: 1 });

// Check if match allows video calls (100+ messages within 48 hours)
matchSchema.methods.checkVideoCallEligibility = function() {
  if (this.messageCount >= 100) {
    const timeDiff = Date.now() - this.createdAt.getTime();
    const fortyEightHours = 48 * 60 * 60 * 1000;
    
    if (timeDiff <= fortyEightHours) {
      this.canVideoCall = true;
      return true;
    }
  }
  return false;
};

// Check if both users have pinned the match
matchSchema.methods.isMutuallyPinned = function() {
  return this.pinnedBy.length === 2;
};

module.exports = mongoose.model('Match', matchSchema);