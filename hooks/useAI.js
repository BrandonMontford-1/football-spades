// ============================================
// 🤖 AI BOT LOGIC - Shared by all modes
// ============================================

// Calculate hand strength (0-13)
const calculateHandStrength = (hand) => {
  let strength = 0;
  hand.forEach(card => {
    if (card.value === 'A') strength += 1;
    if (card.value === 'K') strength += 0.8;
    if (card.value === 'Q') strength += 0.6;
    if (card.value === 'J') strength += 0.4;
    if (card.suit === '♠') strength += 0.3;
  });
  return Math.min(13, Math.round(strength));
};

// Find winning card in a trick (import from engine)
const findWinningCard = (trick) => {
  if (trick.length === 0) return null;
  let winning = trick[0];
  for (let i = 1; i < trick.length; i++) {
    if (trick[i].card.suit === '♠' && winning.card.suit !== '♠') {
      winning = trick[i];
    } else if (trick[i].card.suit === winning.card.suit && 
               trick[i].card.rank > winning.card.rank) {
      winning = trick[i];
    }
  }
  return winning;
};

// CLASSIC MODE: Play based on bid
const selectClassicPlay = (hand, currentTrick, leadSuit, spadesBroken, difficulty, currentTricks, bid, tendencies) => {
  let playable = [...hand];
  
  if (currentTrick.length > 0 && leadSuit) {
    const hasLead = hand.some(c => c.suit === leadSuit);
    if (hasLead) playable = hand.filter(c => c.suit === leadSuit);
  } else if (!spadesBroken) {
    const nonSpades = hand.filter(c => c.suit !== '♠');
    if (nonSpades.length > 0) playable = nonSpades;
  }
  
  const tricksNeeded = bid - currentTricks;
  const tricksRemaining = 13 - (currentTrick.length > 0 ? 1 : 0) - currentTricks;
  
  // Expert difficulty uses bid-based strategy
  if (difficulty === "expert") {
    if (tricksNeeded <= 0) {
      // Already made bid - try to lose tricks
      return playable.sort((a, b) => b.rank - a.rank)[0];
    } else if (tricksNeeded > tricksRemaining) {
      // Need to win almost all - play aggressively
      return playable.sort((a, b) => a.rank - b.rank)[0];
    }
  }
  
  // Medium difficulty
  if (difficulty === "medium") {
    if (tricksNeeded > tricksRemaining / 2) {
      return playable.sort((a, b) => a.rank - b.rank)[0];
    }
    return playable.sort((a, b) => b.rank - a.rank)[0];
  }
  
  // Easy difficulty - random with some logic
  if (difficulty === "easy") {
    // Sometimes play randomly, sometimes try to follow basic strategy
    if (Math.random() < 0.3) {
      return playable[Math.floor(Math.random() * playable.length)];
    }
    // Play smallest card most of the time
    return playable.sort((a, b) => a.rank - b.rank)[0];
  }
  
  return playable[0];
};

// ARCADE MODE: Always try to win
const selectArcadePlay = (hand, currentTrick, leadSuit, spadesBroken, difficulty, streak = 0) => {
  let playable = [...hand];
  
  if (currentTrick.length > 0 && leadSuit) {
    const hasLead = hand.some(c => c.suit === leadSuit);
    if (hasLead) playable = hand.filter(c => c.suit === leadSuit);
  }
  
  // Can we win this trick?
  if (currentTrick.length > 0) {
    const winningPlay = findWinningCard(currentTrick);
    if (winningPlay) {
      // Find cards that can beat the current winner
      const canWin = playable.filter(c => 
        (c.suit === '♠' && winningPlay.card.suit !== '♠') ||
        (c.suit === winningPlay.card.suit && c.rank > winningPlay.card.rank)
      );
      
      if (canWin.length > 0) {
        // Win with smallest possible card (save high cards)
        return canWin.sort((a, b) => a.rank - b.rank)[0];
      }
    }
  }
  
  // Can't win this trick - play smallest card
  return playable.sort((a, b) => a.rank - b.rank)[0];
};

// Generate bid for CLASSIC mode
const generateClassicBid = (hand, difficulty, tendencies) => {
  const handStrength = calculateHandStrength(hand);
  let bid = handStrength;
  
  // Expert difficulty features
  if (difficulty === "expert") {
    // Bluff nil (bid 0 with good hand) - 10% chance
    if (handStrength > 6 && Math.random() < 0.1) {
      return 0;
    }
    
    // Adjust based on player tendencies
    if (tendencies?.player?.aggressiveBidder) {
      bid += 2;
    }
    if (tendencies?.player?.nilBluffer) {
      bid = Math.max(0, bid - 1);
    }
  }
  
  // Medium difficulty
  if (difficulty === "medium") {
    bid = Math.round(handStrength * 0.9);
  }
  
  // Easy difficulty
  if (difficulty === "easy") {
    bid = Math.floor(handStrength * 0.7);
  }
  
  return Math.min(13, Math.max(0, Math.round(bid)));
};

export const useAI = (mode = 'classic') => {
  // Mode-aware bot decision making
  const selectPlay = (hand, currentTrick, leadSuit, spadesBroken, difficulty, currentTricks = 0, bid = 0, streak = 0, tendencies = {}) => {
    if (mode === 'classic') {
      return selectClassicPlay(hand, currentTrick, leadSuit, spadesBroken, difficulty, currentTricks, bid, tendencies);
    } else {
      // Arcade mode - always aggressive
      return selectArcadePlay(hand, currentTrick, leadSuit, spadesBroken, difficulty, streak);
    }
  };

  const generateBid = (hand, difficulty, tendencies = {}) => {
    if (mode === 'classic') {
      return generateClassicBid(hand, difficulty, tendencies);
    }
    // Arcade mode has NO bidding
    return null;
  };

  // Get bot personality based on difficulty and mode
  const getPersonality = (difficulty) => {
    const personalities = {
      classic: {
        expert: { name: "😈 Belichick", style: "calculated", aggression: 0.7 },
        medium: { name: "🤔 Tomlin", style: "balanced", aggression: 0.5 },
        easy: { name: "😅 Rivera", style: "cautious", aggression: 0.3 },
      },
      arcade: {
        expert: { name: "😈 Belichick", style: "dominating", aggression: 0.9 },
        medium: { name: "🤔 Tomlin", style: "aggressive", aggression: 0.7 },
        easy: { name: "😅 Rivera", style: "streaky", aggression: 0.5 },
      }
    };
    
    return personalities[mode]?.[difficulty] || personalities.classic.medium;
  };

  return {
    selectPlay,
    generateBid,
    getPersonality,
  };
};
