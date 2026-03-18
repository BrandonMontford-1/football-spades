// utils/botLogic.js
import { findWinningCard } from './gameLogic.js';

// Generate bid based on difficulty - MAKE SURE THIS FUNCTION NAME MATCHES
export const generateBotBid = (hand, difficulty) => {
  try {
    switch(difficulty) {
      case "easy":
        const spadesCount = hand.filter(c => c.suit === '♠').length;
        const aces = hand.filter(c => c.value === 'A').length;
        return Math.min(13, Math.max(0, Math.floor(spadesCount / 3) + aces));
        
      case "medium":
        const mSpades = hand.filter(c => c.suit === '♠').length;
        const mHigh = hand.filter(c => ['A','K','Q'].includes(c.value)).length;
        const mMedium = hand.filter(c => ['J','10'].includes(c.value)).length;
        return Math.min(13, Math.max(0, 
          Math.floor(mSpades / 2) + Math.floor(mHigh / 2) + Math.floor(mMedium / 3)
        ));
        
      case "expert":
        // Count sure tricks (Aces)
        let expertBid = hand.filter(c => c.value === 'A').length;
        
        // Count supported Kings
        const kings = hand.filter(c => c.value === 'K');
        const kingsWithSupport = kings.filter(k => 
          hand.filter(c => c.suit === k.suit).length > 1
        ).length;
        expertBid += kingsWithSupport * 0.7;
        
        // Count spade strength
        const spades = hand.filter(c => c.suit === '♠');
        spades.forEach((card, idx) => {
          if (card.value === 'A') expertBid += 1;
          else if (card.value === 'K' && spades.length > 1) expertBid += 0.8;
          else if (card.value === 'Q' && spades.length > 2) expertBid += 0.6;
          else if (spades.length - idx > 3) expertBid += 0.3;
        });
        
        // Count voids (no cards in a suit)
        const suits = new Set(hand.map(c => c.suit));
        expertBid += (4 - suits.size) * 0.5;
        
        return Math.min(13, Math.max(0, Math.round(expertBid)));
        
      default:
        return 1;
    }
  } catch (error) {
    console.log("Error generating bid:", error);
    return 1;
  }
};

// Select card to play based on difficulty - MAKE SURE THIS FUNCTION NAME MATCHES
export const selectBotPlay = (hand, currentTrick, leadSuit, spadesBroken, difficulty) => {
  try {
    // Determine playable cards
    let playable = [...hand];
    
    if (currentTrick.length > 0 && leadSuit) {
      const hasLeadSuit = hand.some(c => c.suit === leadSuit);
      if (hasLeadSuit) {
        playable = hand.filter(c => c.suit === leadSuit);
      }
    } else if (!spadesBroken) {
      const nonSpades = hand.filter(c => c.suit !== '♠');
      if (nonSpades.length > 0) {
        playable = nonSpades;
      }
    }
    
    if (playable.length === 0) {
      playable = hand;
    }
    
    // Different strategies based on difficulty
    switch(difficulty) {
      case "easy":
        // Random play
        return playable[Math.floor(Math.random() * playable.length)];
        
      case "medium":
        // Play middle card most often
        if (currentTrick.length > 0) {
          const winningPlay = findWinningCard(currentTrick);
          if (winningPlay) {
            const canWin = playable.some(c => 
              (c.suit === '♠' && winningPlay.card.suit !== '♠') ||
              (c.suit === winningPlay.card.suit && c.rank > winningPlay.card.rank)
            );
            if (canWin) {
              // Play smallest winning card
              const winningCards = playable.filter(c => 
                (c.suit === '♠' && winningPlay.card.suit !== '♠') ||
                (c.suit === winningPlay.card.suit && c.rank > winningPlay.card.rank)
              );
              return winningCards.sort((a, b) => a.rank - b.rank)[0];
            }
          }
        }
        return playable.sort((a, b) => a.rank - b.rank)[0];
        
      case "expert":
        if (currentTrick.length > 0) {
          const winningPlay = findWinningCard(currentTrick);
          if (winningPlay) {
            const canWin = playable.some(c => 
              (c.suit === '♠' && winningPlay.card.suit !== '♠') ||
              (c.suit === winningPlay.card.suit && c.rank > winningPlay.card.rank)
            );
            if (canWin) {
              // Win with smallest card
              const winningCards = playable.filter(c => 
                (c.suit === '♠' && winningPlay.card.suit !== '♠') ||
                (c.suit === winningPlay.card.suit && c.rank > winningPlay.card.rank)
              );
              return winningCards.sort((a, b) => a.rank - b.rank)[0];
            } else {
              // Can't win, save high cards
              const lowCards = playable.filter(c => !['A','K','Q'].includes(c.value));
              if (lowCards.length > 0) {
                return lowCards.sort((a, b) => a.rank - b.rank)[0];
              }
            }
          }
        }
        return playable.sort((a, b) => a.rank - b.rank)[0];
        
      default:
        return playable[0];
    }
  } catch (error) {
    console.log("Error selecting play:", error);
    return hand[0];
  }
};
