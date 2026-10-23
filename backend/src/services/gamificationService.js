const User = require('../models/User')

const BADGE_DEFINITIONS = [
  {
    id: 'newbie_helper',
    name: 'Newbie Helper',
    icon: '🌱',
    description: 'Completed your first session helping a peer.',
    check: (user) => (user.stats?.sessionsHelped || 0) >= 1
  },
  {
    id: 'helpful_hand',
    name: 'Helpful Hand',
    icon: '🤝',
    description: 'Helped 5 peers successfully.',
    check: (user) => (user.stats?.sessionsHelped || 0) >= 5
  },
  {
    id: 'community_pillar',
    name: 'Community Pillar',
    icon: '🏛️',
    description: 'Helped 15 peers share skills.',
    check: (user) => (user.stats?.sessionsHelped || 0) >= 15
  },
  {
    id: 'master_mentor',
    name: 'Master Mentor',
    icon: '👑',
    description: 'Conducted 30 or more helping sessions.',
    check: (user) => (user.stats?.sessionsHelped || 0) >= 30
  },
  {
    id: 'fast_learner',
    name: 'Fast Learner',
    icon: '💡',
    description: 'Completed your first learning session.',
    check: (user) => (user.stats?.sessionsLearned || 0) >= 1
  },
  {
    id: 'curious_mind',
    name: 'Curious Mind',
    icon: '🔍',
    description: 'Completed 5 learning sessions.',
    check: (user) => (user.stats?.sessionsLearned || 0) >= 5
  },
  {
    id: 'knowledge_seeker',
    name: 'Knowledge Seeker',
    icon: '📚',
    description: 'Completed 15 learning sessions.',
    check: (user) => (user.stats?.sessionsLearned || 0) >= 15
  },
  {
    id: 'five_star',
    name: 'Five-Star Star',
    icon: '⭐',
    description: 'Maintained a 5.0 average rating with 3+ reviews.',
    check: (user) => (user.stats?.totalRatingsCount || 0) >= 3 && (user.stats?.averageRating || 0) >= 4.95
  },
  {
    id: 'streak_starter',
    name: 'Streak Starter',
    icon: '🔥',
    description: 'Achieved a 3-day active streak in helping or learning.',
    check: (user) => (user.streaks?.helpingStreak || 0) >= 3 || (user.streaks?.learningStreak || 0) >= 3
  },
  {
    id: 'expert',
    name: 'Expert',
    icon: '🎓',
    description: 'Reached 500+ Reputation Score.',
    check: (user) => (user.reputation || 0) >= 500
  },
  {
    id: 'legend',
    name: 'Legend',
    icon: '🏆',
    description: 'Reached 900+ Reputation Score or 50+ completed sessions.',
    check: (user) => (user.reputation || 0) >= 900 || (((user.stats?.sessionsHelped || 0) + (user.stats?.sessionsLearned || 0)) >= 50 && (user.stats?.averageRating || 0) >= 4.8)
  }
]

/**
 * Calculates updated streak value based on timestamp
 */
function calculateNewStreak(currentStreak, lastActivityDate) {
  const now = new Date()
  if (!lastActivityDate) return 1

  const lastDate = new Date(lastActivityDate)
  const diffHours = (now - lastDate) / (1000 * 60 * 60)

  // Within the same 24-hour window (or same calendar day)
  if (diffHours < 24 && now.getDate() === lastDate.getDate() && now.getMonth() === lastDate.getMonth()) {
    return Math.max(1, currentStreak || 1)
  }
  // Consecutive day within 48 hours
  if (diffHours <= 48) {
    return (currentStreak || 0) + 1
  }
  // Streak lapsed
  return 1
}

/**
 * Evaluates and awards badges idempotently
 */
function evaluateBadges(user) {
  if (!user.badges) user.badges = []
  const existingIds = new Set(user.badges.map(b => b.id))
  let newlyAwarded = []

  for (const def of BADGE_DEFINITIONS) {
    if (!existingIds.has(def.id) && def.check(user)) {
      const newBadge = {
        id: def.id,
        name: def.name,
        description: def.description,
        icon: def.icon,
        awardedAt: new Date()
      }
      user.badges.push(newBadge)
      newlyAwarded.push(newBadge)
    }
  }

  return newlyAwarded
}

/**
 * Updates a user's stats, level, and reputation upon session closure
 */
async function processSessionCompletion(userId, role) {
  const user = await User.findById(userId)
  if (!user) return null

  if (!user.stats) {
    user.stats = {
      sessionsHelped: 0,
      sessionsLearned: 0,
      totalRatingsCount: 0,
      averageRating: 0,
      ratingDistribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 }
    }
  }
  if (!user.streaks) {
    user.streaks = {
      helpingStreak: 0,
      learningStreak: 0,
      lastHelpedAt: null,
      lastLearnedAt: null
    }
  }

  if (role === 'helper') {
    user.stats.sessionsHelped += 1
    user.streaks.helpingStreak = calculateNewStreak(user.streaks.helpingStreak, user.streaks.lastHelpedAt)
    user.streaks.lastHelpedAt = new Date()
    user.reputation = Math.min(1000, Math.max(0, (user.reputation || 100) + 20))
    user.xp = (user.xp || 0) + 50
  } else if (role === 'learner') {
    user.stats.sessionsLearned += 1
    user.streaks.learningStreak = calculateNewStreak(user.streaks.learningStreak, user.streaks.lastLearnedAt)
    user.streaks.lastLearnedAt = new Date()
    user.reputation = Math.min(1000, Math.max(0, (user.reputation || 100) + 10))
    user.xp = (user.xp || 0) + 30
  }

  user.level = Math.floor((user.xp || 0) / 100) + 1
  evaluateBadges(user)
  await user.save()
  return user
}

/**
 * Updates helper statistics, rating distribution, and reputation upon receiving a review
 */
async function processRating(helperId, ratingScore) {
  const helper = await User.findById(helperId)
  if (!helper) return null

  if (!helper.stats) {
    helper.stats = {
      sessionsHelped: 0,
      sessionsLearned: 0,
      totalRatingsCount: 0,
      averageRating: 0,
      ratingDistribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 }
    }
  }

  const roundedRating = Math.max(1, Math.min(5, Math.round(ratingScore)))
  const currentCount = helper.stats.totalRatingsCount || 0
  const currentAvg = helper.stats.averageRating || 0
  const currentSum = currentAvg * currentCount

  const newCount = currentCount + 1
  const newAvg = (currentSum + roundedRating) / newCount

  helper.stats.totalRatingsCount = newCount
  helper.stats.averageRating = Number(newAvg.toFixed(2))

  if (!helper.stats.ratingDistribution) {
    helper.stats.ratingDistribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 }
  }
  helper.stats.ratingDistribution[roundedRating] = (helper.stats.ratingDistribution[roundedRating] || 0) + 1

  // Reputation bonus / penalty based on rating
  // 5 stars: +25, 4 stars: +15, 3 stars: 0, 2 stars: -15, 1 star: -30
  let ratingDelta = 0
  if (roundedRating === 5) ratingDelta = 25
  else if (roundedRating === 4) ratingDelta = 15
  else if (roundedRating === 3) ratingDelta = 0
  else if (roundedRating === 2) ratingDelta = -15
  else if (roundedRating === 1) ratingDelta = -30

  // Active streak bonus
  const streakBonus = Math.min(25, (helper.streaks?.helpingStreak || 0) * 5)
  helper.reputation = Math.min(1000, Math.max(0, (helper.reputation || 100) + ratingDelta + streakBonus))
  helper.xp = (helper.xp || 0) + 40
  helper.level = Math.floor((helper.xp || 0) / 100) + 1

  evaluateBadges(helper)
  await helper.save()
  return helper
}

module.exports = {
  BADGE_DEFINITIONS,
  calculateNewStreak,
  evaluateBadges,
  processSessionCompletion,
  processRating
}
