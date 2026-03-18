// utils/gameLogic.js

// Shuffle deck (Fisher-Yates algorithm)
export const shuffleDeck = (deck) => {
  const shuffled = [...deck];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
};

// Sort hand by suit then rank
export const sortHand = (hand) => {
  return [...hand].sort((a, b) => {
    if (a.suit === b.suit) {
      return a.rank - b.rank;
    }
    const suits = ["♠", "♥", "♦", "♣"];
    return suits.indexOf(a.suit) - suits.indexOf(b.suit);
  });
};

// Deal cards to players (4 players, 13 cards each)
export const dealCards = (deck) => {
  const hands = [[], [], [], []];
  for (let i = 0; i < deck.length; i++) {
    hands[i % 4].push(deck[i]);
  }
  return hands.map(hand => sortHand(hand));
};

// Find winning card in a trick
export const findWinningCard = (trick) => {
  if (!trick || trick.length === 0) return null;
  
  let winningPlay = trick[0];
  
  for (let i = 1; i < trick.length; i++) {
    const current = trick[i];
    
    // Spades (trump) beats everything
    if (current.card.suit === '♠' && winningPlay.card.suit !== '♠') {
      winningPlay = current;
    } 
    // Same suit - higher rank wins
    else if (current.card.suit === winningPlay.card.suit) {
      if (current.card.rank > winningPlay.card.rank) {
        winningPlay = current;
      }
    }
  }
  
  return winningPlay;
};

// Check if play is valid
export const isValidPlay = (card, hand, currentTrick, leadSuit, spadesBroken) => {
  // First card of trick
  if (currentTrick.length === 0) {
    // Can't lead spades unless they're broken
    if (card.suit === '♠' && !spadesBroken) {
      const hasNonSpade = hand.some(c => c.suit !== '♠');
      if (hasNonSpade) return false;
    }
    return true;
  } 
  
  // Following suit
  if (leadSuit) {
    const hasLeadSuit = hand.some(c => c.suit === leadSuit);
    if (hasLeadSuit && card.suit !== leadSuit) {
      return false;
    }
  }
  
  return true;
};

// Calculate score for a player
export const calculateScore = (player) => {
  if (player.bid === 0) {
    return player.tricks === 0 ? 100 : -100;
  }
  if (player.tricks >= player.bid) {
    const bags = player.tricks - player.bid;
    return (player.bid * 10) + bags;
  }
  return -(player.bid * 10);
};
