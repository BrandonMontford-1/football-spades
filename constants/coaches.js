// ============================================
// 🏈 COMPLETE COACH ROSTER - 12 Unique Coaches
// ============================================

export const COACHES = {
  // AGGRESSIVE (Expert - Always attacks)
  aggressive: [
    { 
      id: 'belichick',
      name: "😈 Bill Belichick", 
      team: "Patriots", 
      style: "calculated", 
      aggression: 0.9,
      difficulty: "expert",
      description: "The master of defense. Never shows his hand."
    },
    { 
      id: 'sirianni',
      name: "🦅 Nick Sirianni", 
      team: "Eagles", 
      style: "fiery", 
      aggression: 0.95,
      difficulty: "expert",
      description: "Emotional, intense, always attacking."
    },
    { 
      id: 'campbell',
      name: "🐯 Dan Campbell", 
      team: "Lions", 
      style: "intense", 
      aggression: 1.0,
      difficulty: "expert",
      description: "Will bite your kneecaps off. Extreme aggression."
    },
    { 
      id: 'reid',
      name: "👑 Andy Reid", 
      team: "Chiefs", 
      style: "creative", 
      aggression: 0.85,
      difficulty: "expert",
      description: "Offensive genius. Creative play-calling."
    }
  ],
  
  // BALANCED (Medium - Adapts to situation)
  balanced: [
    { 
      id: 'tomlin',
      name: "🤔 Mike Tomlin", 
      team: "Steelers", 
      style: "steady", 
      adaptability: 0.7,
      difficulty: "medium",
      description: "The standard is the standard. Consistent and reliable."
    },
    { 
      id: 'mcvay',
      name: "🎯 Sean McVay", 
      team: "Rams", 
      style: "innovative", 
      adaptability: 0.8,
      difficulty: "medium",
      description: "Young gun. Adapts quickly to any situation."
    },
    { 
      id: 'shanahan',
      name: "📋 Kyle Shanahan", 
      team: "49ers", 
      style: "systematic", 
      adaptability: 0.75,
      difficulty: "medium",
      description: "Scheme master. Follows the system perfectly."
    },
    { 
      id: 'taylor',
      name: "🧠 Zac Taylor", 
      team: "Bengals", 
      style: "modern", 
      adaptability: 0.7,
      difficulty: "medium",
      description: "Modern thinker. Balances risk and reward."
    }
  ],
  
  // CONSERVATIVE (Easy - Plays safe)
  conservative: [
    { 
      id: 'rivera',
      name: "😅 Ron Rivera", 
      team: "Commanders", 
      style: "safe", 
      risk: 0.2,
      difficulty: "easy",
      description: "Riverboat Ron? Not anymore. Plays it safe."
    },
    { 
      id: 'harbaugh',
      name: "🛡️ John Harbaugh", 
      team: "Ravens", 
      style: "disciplined", 
      risk: 0.3,
      difficulty: "easy",
      description: "Special teams master. Disciplined approach."
    },
    { 
      id: 'stefanski',
      name: "📊 Kevin Stefanski", 
      team: "Browns", 
      style: "methodical", 
      risk: 0.25,
      difficulty: "easy",
      description: "Analytical. Every move is calculated."
    },
    { 
      id: 'bowles',
      name: "🔒 Todd Bowles", 
      team: "Buccaneers", 
      style: "defensive", 
      risk: 0.2,
      difficulty: "easy",
      description: "Defensive minded. Prevents big plays."
    }
  ]
};

// ALL COACHES flattened array
export const ALL_COACHES = [
  ...COACHES.aggressive,
  ...COACHES.balanced,
  ...COACHES.conservative
];

// Get random coach by difficulty
export const getRandomCoach = (difficulty) => {
  if (difficulty === 'easy') {
    const pool = COACHES.conservative;
    return pool[Math.floor(Math.random() * pool.length)];
  }
  if (difficulty === 'medium') {
    const pool = COACHES.balanced;
    return pool[Math.floor(Math.random() * pool.length)];
  }
  if (difficulty === 'expert') {
    const pool = COACHES.aggressive;
    return pool[Math.floor(Math.random() * pool.length)];
  }
  // Random any
  return ALL_COACHES[Math.floor(Math.random() * ALL_COACHES.length)];
};

// Get coach by ID
export const getCoachById = (id) => {
  return ALL_COACHES.find(c => c.id === id);
};

// Tournament schedule (16 games)
export const TOURNAMENT_SCHEDULE = [
  // Weeks 1-4: Introduction to each type
  { week: 1, opponent: getCoachById('rivera'), difficulty: 'easy', home: true },
  { week: 2, opponent: getCoachById('tomlin'), difficulty: 'medium', home: false },
  { week: 3, opponent: getCoachById('belichick'), difficulty: 'expert', home: true },
  { week: 4, opponent: getCoachById('harbaugh'), difficulty: 'easy', home: false },
  
  // Weeks 5-8: Mix it up
  { week: 5, opponent: getCoachById('mcvay'), difficulty: 'medium', home: true },
  { week: 6, opponent: getCoachById('sirianni'), difficulty: 'expert', home: false },
  { week: 7, opponent: getCoachById('stefanski'), difficulty: 'easy', home: true },
  { week: 8, opponent: getCoachById('shanahan'), difficulty: 'medium', home: false },
  
  // Weeks 9-12: Second half
  { week: 9, opponent: getCoachById('campbell'), difficulty: 'expert', home: true },
  { week: 10, opponent: getCoachById('bowles'), difficulty: 'easy', home: false },
  { week: 11, opponent: getCoachById('taylor'), difficulty: 'medium', home: true },
  { week: 12, opponent: getCoachById('reid'), difficulty: 'expert', home: false },
  
  // Weeks 13-16: Rematches and finale
  { week: 13, opponent: getCoachById('rivera'), difficulty: 'easy', home: true },
  { week: 14, opponent: getCoachById('tomlin'), difficulty: 'medium', home: false },
  { week: 15, opponent: getCoachById('belichick'), difficulty: 'expert', home: true },
  { week: 16, opponent: { 
    id: 'allstar',
    name: "🌟 ALL-STAR TEAM", 
    team: "NFL Legends", 
    style: "perfect", 
    difficulty: "legend",
    description: "The best of the best. Can you beat them?"
  }, difficulty: 'legend', home: false }
];

// Playoff opponents
export const PLAYOFF_OPPONENTS = {
  wildcard: () => getRandomCoach('medium'),
  divisional: () => getRandomCoach('expert'),
  championship: () => getRandomCoach('expert'),
  superbowl: {
    id: 'legend',
    name: "🏆 LEGEND COACH", 
    team: "Hall of Fame", 
    style: "mythical", 
    difficulty: "legend",
    description: "The greatest of all time. This is your moment."
  }
};
