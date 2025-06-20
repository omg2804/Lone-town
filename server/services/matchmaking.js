// const User = require('../models/User');
// const Match = require('../models/Match');

// class MatchmakingService {
//   async processDailyMatches() {
//     try {
//       console.log('Processing daily matches...');
      
//       // Get all available users who are onboarded and not frozen
//       const availableUsers = await User.find({
//         isOnboarded: true,
//         state: 'available',
//         isActive: true,
//         $or: [
//           { freezeUntil: { $exists: false } },
//           { freezeUntil: null },
//           { freezeUntil: { $lt: new Date() } }
//         ]
//       });

//       console.log(`Found ${availableUsers.length} available users`);

//       // Process matches for users who haven't had a match today
//       for (const user of availableUsers) {
//         if (this.shouldGetNewMatch(user)) {
//           await this.findMatchForUser(user);
//         }
//       }

//       // Clean up expired matches
//       await this.cleanupExpiredMatches();
      
//       console.log('Daily matchmaking completed');
//     } catch (error) {
//       console.error('Error in daily matchmaking:', error);
//     }
//   }

//   shouldGetNewMatch(user) {
//     // User should get a new match if:
//     // 1. They haven't had a match today
//     // 2. They don't have an active match
//     // 3. They're not frozen
    
//     if (user.currentMatchId) return false;
//     if (user.state !== 'available') return false;
//     if (user.freezeUntil && user.freezeUntil > new Date()) return false;
    
//     const today = new Date();
//     today.setHours(0, 0, 0, 0);
    
//     return !user.lastMatchDate || user.lastMatchDate < today;
//   }

//   async findMatchForUser(user) {
//     try {
//       // Get potential matches (exclude users already matched with)
//       const excludeIds = await this.getExcludedUserIds(user._id);
      
//       const potentialMatches = await User.find({
//         _id: { $ne: user._id, $nin: excludeIds },
//         isOnboarded: true,
//         state: 'available',
//         isActive: true,
//         currentMatchId: null,
//         $or: [
//           { freezeUntil: { $exists: false } },
//           { freezeUntil: null },
//           { freezeUntil: { $lt: new Date() } }
//         ]
//       });

//       if (potentialMatches.length === 0) {
//         console.log(`No potential matches found for user ${user._id}`);
//         return;
//       }

//       // Calculate compatibility scores
//       const scoredMatches = potentialMatches.map(potentialMatch => ({
//         user: potentialMatch,
//         score: user.calculateCompatibility(potentialMatch)
//       }));

//       // Sort by compatibility score (highest first)
//       scoredMatches.sort((a, b) => b.score - a.score);

//       // Select the best match
//       const bestMatch = scoredMatches[0];
      
//       if (bestMatch.score >= 50) { // Minimum compatibility threshold
//         await this.createMatch(user, bestMatch.user, bestMatch.score);
//         console.log(`Created match between ${user._id} and ${bestMatch.user._id} with ${bestMatch.score}% compatibility`);
//       } else {
//         console.log(`No suitable match found for user ${user._id} (best score: ${bestMatch.score}%)`);
//       }
//     } catch (error) {
//       console.error(`Error finding match for user ${user._id}:`, error);
//     }
//   }

//   async getExcludedUserIds(userId) {
//     // Get users that this user has already been matched with in the last 30 days
//     const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    
//     const recentMatches = await Match.find({
//       $or: [
//         { userId: userId },
//         { partnerId: userId }
//       ],
//       createdAt: { $gte: thirtyDaysAgo }
//     });

//     const excludeIds = [];
//     recentMatches.forEach(match => {
//       if (match.userId.toString() !== userId.toString()) {
//         excludeIds.push(match.userId);
//       }
//       if (match.partnerId.toString() !== userId.toString()) {
//         excludeIds.push(match.partnerId);
//       }
//     });

//     return excludeIds;
//   }

//   async createMatch(user1, user2, compatibilityScore) {
//     try {
//       // Create match document
//       const match = new Match({
//         userId: user1._id,
//         partnerId: user2._id,
//         compatibilityScore,
//         expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours from now
//       });

//       await match.save();

//       // Update both users
//       await User.findByIdAndUpdate(user1._id, {
//         state: 'matched',
//         currentMatchId: match._id,
//         lastMatchDate: new Date()
//       });

//       await User.findByIdAndUpdate(user2._id, {
//         state: 'matched',
//         currentMatchId: match._id,
//         lastMatchDate: new Date()
//       });

//       return match;
//     } catch (error) {
//       console.error('Error creating match:', error);
//       throw error;
//     }
//   }

//   async cleanupExpiredMatches() {
//     try {
//       const now = new Date();
      
//       // Find expired matches that haven't been cleaned up
//       const expiredMatches = await Match.find({
//         expiresAt: { $lt: now },
//         status: { $in: ['active', 'pinned'] }
//       });

//       for (const match of expiredMatches) {
//         // Update match status
//         match.status = 'expired';
//         await match.save();

//         // Reset users to available state (unless they're frozen)
//         await User.findByIdAndUpdate(match.userId, {
//           $unset: { currentMatchId: 1 },
//           $set: { state: 'available' }
//         });

//         await User.findByIdAndUpdate(match.partnerId, {
//           $unset: { currentMatchId: 1 },
//           $set: { state: 'available' }
//         });
//       }

//       console.log(`Cleaned up ${expiredMatches.length} expired matches`);
//     } catch (error) {
//       console.error('Error cleaning up expired matches:', error);
//     }
//   }
// }

// module.exports = new MatchmakingService();

const User = require('../models/User');
const Match = require('../models/Match');

class MatchmakingService {
  async processDailyMatches() {
    try {
      console.log('Processing daily matches...');

      const matchedUserIds = new Set(); // Track matched users in this cycle

      const availableUsers = await User.find({
        isOnboarded: true,
        state: 'available',
        isActive: true,
        $or: [
          { freezeUntil: { $exists: false } },
          { freezeUntil: null },
          { freezeUntil: { $lt: new Date() } }
        ]
      });

      console.log(`Found ${availableUsers.length} available users`);

      for (const user of availableUsers) {
        if (
          !matchedUserIds.has(user._id.toString()) &&
          this.shouldGetNewMatch(user)
        ) {
          const match = await this.findMatchForUser(user, matchedUserIds);
          if (match) {
            matchedUserIds.add(user._id.toString());
            matchedUserIds.add(match.partnerId.toString());
          }
        }
      }

      await this.cleanupExpiredMatches();
      console.log('Daily matchmaking completed');
    } catch (error) {
      console.error('Error in daily matchmaking:', error);
    }
  }

  shouldGetNewMatch(user) {
    if (user.currentMatchId) return false;
    if (user.state !== 'available') return false;
    if (user.freezeUntil && user.freezeUntil > new Date()) return false;

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    return !user.lastMatchDate || user.lastMatchDate < today;
  }

  async findMatchForUser(user, matchedUserIds) {
    try {
      const excludeIds = await this.getExcludedUserIds(user._id);

      const potentialMatches = await User.find({
        _id: { $ne: user._id, $nin: [...excludeIds, ...matchedUserIds] },
        isOnboarded: true,
        state: 'available',
        isActive: true,
        currentMatchId: null,
        $or: [
          { freezeUntil: { $exists: false } },
          { freezeUntil: null },
          { freezeUntil: { $lt: new Date() } }
        ]
      });

      if (potentialMatches.length === 0) {
        console.log(`No potential matches found for user ${user._id}`);
        return null;
      }

      const scoredMatches = potentialMatches.map(potentialMatch => ({
        user: potentialMatch,
        score: user.calculateCompatibility(potentialMatch)
      }));

      scoredMatches.sort((a, b) => b.score - a.score);

      const bestMatch = scoredMatches[0];

      if (bestMatch.score >= 50) {
        const match = await this.createMatch(user, bestMatch.user, bestMatch.score);
        console.log(`Created match between ${user._id} and ${bestMatch.user._id} with ${bestMatch.score}% compatibility`);
        return match;
      } else {
        console.log(`No suitable match found for user ${user._id} (best score: ${bestMatch.score}%)`);
        return null;
      }
    } catch (error) {
      console.error(`Error finding match for user ${user._id}:`, error);
      return null;
    }
  }

  async getExcludedUserIds(userId) {
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

    const recentMatches = await Match.find({
      $or: [
        { userId: userId },
        { partnerId: userId }
      ],
      createdAt: { $gte: thirtyDaysAgo }
    });

    const excludeIds = [];
    recentMatches.forEach(match => {
      if (match.userId.toString() !== userId.toString()) {
        excludeIds.push(match.userId);
      }
      if (match.partnerId.toString() !== userId.toString()) {
        excludeIds.push(match.partnerId);
      }
    });

    return excludeIds;
  }

  async createMatch(user1, user2, compatibilityScore) {
    try {
      const match = new Match({
        userId: user1._id,
        partnerId: user2._id,
        compatibilityScore,
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000)
      });

      await match.save();

      await User.findByIdAndUpdate(user1._id, {
        state: 'matched',
        currentMatchId: match._id,
        lastMatchDate: new Date()
      });

      await User.findByIdAndUpdate(user2._id, {
        state: 'matched',
        currentMatchId: match._id,
        lastMatchDate: new Date()
      });

      return match;
    } catch (error) {
      console.error('Error creating match:', error);
      throw error;
    }
  }

  async cleanupExpiredMatches() {
    try {
      const now = new Date();

      const expiredMatches = await Match.find({
        expiresAt: { $lt: now },
        status: { $in: ['active', 'pinned'] }
      });

      for (const match of expiredMatches) {
        match.status = 'expired';
        await match.save();

        await User.findByIdAndUpdate(match.userId, {
          $unset: { currentMatchId: 1 },
          $set: { state: 'available' }
        });

        await User.findByIdAndUpdate(match.partnerId, {
          $unset: { currentMatchId: 1 },
          $set: { state: 'available' }
        });
      }

      console.log(`Cleaned up ${expiredMatches.length} expired matches`);
    } catch (error) {
      console.error('Error cleaning up expired matches:', error);
    }
  }
}

module.exports = new MatchmakingService();
