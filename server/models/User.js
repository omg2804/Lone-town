const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const compatibilitySchema = new mongoose.Schema({
  values: [String],
  emotionalIntelligence: { type: Number, min: 1, max: 10 },
  relationshipGoals: String,
  lifestyle: [String],
  personalityTraits: {
    openness: { type: Number, min: 1, max: 10 },
    conscientiousness: { type: Number, min: 1, max: 10 },
    extraversion: { type: Number, min: 1, max: 10 },
    agreeableness: { type: Number, min: 1, max: 10 },
    neuroticism: { type: Number, min: 1, max: 10 }
  },
  dealBreakers: [String],
  interests: [String]
});

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true
  },
  password: {
    type: String,
    required: true,
    minlength: 6
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  age: {
    type: Number,
    required: true,
    min: 18,
    max: 100
  },
  isOnboarded: {
    type: Boolean,
    default: false
  },
  compatibilityData: compatibilitySchema,
  state: {
    type: String,
    enum: ['available', 'matched', 'pinned', 'frozen'],
    default: 'available'
  },
  currentMatchId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Match',
    default: null
  },
  lastMatchDate: {
    type: Date,
    default: null
  },
  freezeUntil: {
    type: Date,
    default: null
  },
  isActive: {
    type: Boolean,
    default: true
  },
  lastSeen: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Compare password method
userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Calculate compatibility score with another user
userSchema.methods.calculateCompatibility = function(otherUser) {
  if (!this.compatibilityData || !otherUser.compatibilityData) {
    return 0;
  }

  let score = 0;
  let totalFactors = 0;

  // Values compatibility (30% weight)
  const commonValues = this.compatibilityData.values.filter(value => 
    otherUser.compatibilityData.values.includes(value)
  );
  const valuesScore = (commonValues.length / Math.max(this.compatibilityData.values.length, otherUser.compatibilityData.values.length)) * 30;
  score += valuesScore;
  totalFactors += 30;

  // Personality traits compatibility (25% weight)
  const personalityScore = calculatePersonalityCompatibility(
    this.compatibilityData.personalityTraits,
    otherUser.compatibilityData.personalityTraits
  ) * 25;
  score += personalityScore;
  totalFactors += 25;

  // Relationship goals compatibility (20% weight)
  const goalsScore = (this.compatibilityData.relationshipGoals === otherUser.compatibilityData.relationshipGoals) ? 20 : 0;
  score += goalsScore;
  totalFactors += 20;

  // Lifestyle compatibility (15% weight)
  const commonLifestyle = this.compatibilityData.lifestyle.filter(item => 
    otherUser.compatibilityData.lifestyle.includes(item)
  );
  const lifestyleScore = (commonLifestyle.length / Math.max(this.compatibilityData.lifestyle.length, otherUser.compatibilityData.lifestyle.length)) * 15;
  score += lifestyleScore;
  totalFactors += 15;

  // Interests compatibility (10% weight)
  const commonInterests = this.compatibilityData.interests.filter(interest => 
    otherUser.compatibilityData.interests.includes(interest)
  );
  const interestsScore = (commonInterests.length / Math.max(this.compatibilityData.interests.length, otherUser.compatibilityData.interests.length)) * 10;
  score += interestsScore;
  totalFactors += 10;

  return Math.round(score);
};

function calculatePersonalityCompatibility(traits1, traits2) {
  const traitKeys = ['openness', 'conscientiousness', 'extraversion', 'agreeableness', 'neuroticism'];
  let totalDifference = 0;
  
  traitKeys.forEach(trait => {
    const diff = Math.abs(traits1[trait] - traits2[trait]);
    totalDifference += diff;
  });
  
  // Convert difference to compatibility score (lower difference = higher compatibility)
  const maxPossibleDifference = traitKeys.length * 9; // max difference per trait is 9
  const compatibilityScore = 1 - (totalDifference / maxPossibleDifference);
  
  return compatibilityScore;
}

module.exports = mongoose.model('User', userSchema);