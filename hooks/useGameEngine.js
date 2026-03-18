import { useState } from 'react';
import { Alert } from 'react-native';

// ============================================
// 🃏 DECK DATA - All 52 Cards
// ============================================
const spadesCards = [
  { id: "A♠", suit: "♠", value: "A", rank: 14, player: "Patrick Surtain II", position: "CB", era: "Current" },
  { id: "K♠", suit: "♠", value: "K", rank: 13, player: "Sauce Gardner", position: "CB", era: "Current" },
  { id: "Q♠", suit: "♠", value: "Q", rank: 12, player: "Deion Sanders", position: "CB", era: "Legend" },
  { id: "J♠", suit: "♠", value: "J", rank: 11, player: "Darrelle Revis", position: "CB", era: "Legend" },
  { id: "10♠", suit: "♠", value: "10", rank: 10, player: "Jalen Ramsey", position: "CB", era: "Current" },
  { id: "9♠", suit: "♠", value: "9", rank: 9, player: "Trevon Diggs", position: "CB", era: "Current" },
  { id: "8♠", suit: "♠", value: "8", rank: 8, player: "Rod Woodson", position: "S", era: "Legend" },
  { id: "7♠", suit: "♠", value: "7", rank: 7, player: "Champ Bailey", position: "CB", era: "Legend" },
  { id: "6♠", suit: "♠", value: "6", rank: 6, player: "Marlon Humphrey", position: "CB", era: "Current" },
  { id: "5♠", suit: "♠", value: "5", rank: 5, player: "Denzel Ward", position: "CB", era: "Current" },
  { id: "4♠", suit: "♠", value: "4", rank: 4, player: "Ronnie Lott", position: "S", era: "Legend" },
  { id: "3♠", suit: "♠", value: "3", rank: 3, player: "Mel Blount", position: "CB", era: "Legend" },
  { id: "2♠", suit: "♠", value: "2", rank: 2, player: "Paul Krause", position: "S", era: "Legend" },
];

const heartsCards = [
  { id: "A♥", suit: "♥", value: "A", rank: 14, player: "Micah Parsons", position: "LB", era: "Current" },
  { id: "K♥", suit: "♥", value: "K", rank: 13, player: "Myles Garrett", position: "DE", era: "Current" },
  { id: "Q♥", suit: "♥", value: "Q", rank: 12, player: "Lawrence Taylor", position: "LB", era: "Legend" },
  { id: "J♥", suit: "♥", value: "J", rank: 11, player: "Reggie White", position: "DE", era: "Legend" },
  { id: "10♥", suit: "♥", value: "10", rank: 10, player: "Nick Bosa", position: "DE", era: "Current" },
  { id: "9♥", suit: "♥", value: "9", rank: 9, player: "T.J. Watt", position: "LB", era: "Current" },
  { id: "8♥", suit: "♥", value: "8", rank: 8, player: "Ray Lewis", position: "LB", era: "Legend" },
  { id: "7♥", suit: "♥", value: "7", rank: 7, player: "Dick Butkus", position: "LB", era: "Legend" },
  { id: "6♥", suit: "♥", value: "6", rank: 6, player: "Aaron Donald", position: "DT", era: "Current" },
  { id: "5♥", suit: "♥", value: "5", rank: 5, player: "Chris Jones", position: "DT", era: "Current" },
  { id: "4♥", suit: "♥", value: "4", rank: 4, player: "Bruce Smith", position: "DE", era: "Legend" },
  { id: "3♥", suit: "♥", value: "3", rank: 3, player: "Deacon Jones", position: "DE", era: "Legend" },
  { id: "2♥", suit: "♥", value: "2", rank: 2, player: "Joe Greene", position: "DT", era: "Legend" },
];

const diamondsCards = [
  { id: "A♦", suit: "♦", value: "A", rank: 14, player: "Patrick Mahomes", position: "QB", era: "Current" },
  { id: "K♦", suit: "♦", value: "K", rank: 13, player: "Justin Jefferson", position: "WR", era: "Current" },
  { id: "Q♦", suit: "♦", value: "Q", rank: 12, player: "Jerry Rice", position: "WR", era: "Legend" },
  { id: "J♦", suit: "♦", value: "J", rank: 11, player: "Tom Brady", position: "QB", era: "Legend" },
  { id: "10♦", suit: "♦", value: "10", rank: 10, player: "Tyreek Hill", position: "WR", era: "Current" },
  { id: "9♦", suit: "♦", value: "9", rank: 9, player: "Ja'Marr Chase", position: "WR", era: "Current" },
  { id: "8♦", suit: "♦", value: "8", rank: 8, player: "Walter Payton", position: "RB", era: "Legend" },
  { id: "7♦", suit: "♦", value: "7", rank: 7, player: "Barry Sanders", position: "RB", era: "Legend" },
  { id: "6♦", suit: "♦", value: "6", rank: 6, player: "Christian McCaffrey", position: "RB", era: "Current" },
  { id: "5♦", suit: "♦", value: "5", rank: 5, player: "Travis Kelce", position: "TE", era: "Current" },
  { id: "4♦", suit: "♦", value: "4", rank: 4, player: "Jim Brown", position: "RB", era: "Legend" },
  { id: "3♦", suit: "♦", value: "3", rank: 3, player: "Randy Moss", position: "WR", era: "Legend" },
  { id: "2♦", suit: "♦", value: "2", rank: 2, player: "Joe Montana", position: "QB", era: "Legend" },
];

const clubsCards = [
  { id: "A♣", suit: "♣", value: "A", rank: 14, player: "Trent Williams", position: "OT", era: "Current" },
  { id: "K♣", suit: "♣", value: "K", rank: 13, player: "Zack Martin", position: "OG", era: "Current" },
  { id: "Q♣", suit: "♣", value: "Q", rank: 12, player: "Anthony Muñoz", position: "OT", era: "Legend" },
  { id: "J♣", suit: "♣", value: "J", rank: 11, player: "Larry Allen", position: "OG", era: "Legend" },
  { id: "10♣", suit: "♣", value: "10", rank: 10, player: "Lane Johnson", position: "OT", era: "Current" },
  { id: "9♣", suit: "♣", value: "9", rank: 9, player: "Quenton Nelson", position: "OG", era: "Current" },
  { id: "8♣", suit: "♣", value: "8", rank: 8, player: "Jonathan Ogden", position: "OT", era: "Legend" },
  { id: "7♣", suit: "♣", value: "7", rank: 7, player: "Bruce Matthews", position: "OL", era: "Legend" },
  { id: "6♣", suit: "♣", value: "6", rank: 6, player: "Tristan Wirfs", position: "OT", era: "Current" },
  { id: "5♣", suit: "♣", value: "5", rank: 5, player: "Penei Sewell", position: "OT", era: "Current" },
  { id: "4♣", suit: "♣", value: "4", rank: 4, player: "Gene Upshaw", position: "OG", era: "Legend" },
  { id: "3♣", suit: "♣", value: "3", rank: 3, player: "Mike Webster", position: "C", era: "Legend" },
  { id: "2♣", suit: "♣", value: "2", rank: 2, player: "Forrest Gregg", position: "OT", era: "Legend" },
];

const createDeck = () => {
  console.log("🃏 Creating deck...");
  const deck = [...spadesCards, ...heartsCards, ...diamondsCards, ...clubsCards];
  console.log(`🃏 Deck created with ${deck.length} cards`);
  return deck;
};

const shuffle = (deck) => {
  console.log("🔄 Shuffling deck...");
  const shuffled = [...deck];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  console.log("✅ Deck shuffled");
  return shuffled;
};

const sortHand = (hand) => {
  return hand.sort((a, b) => {
    if (a.suit === b.suit) return a.rank - b.rank;
    const suits = ["♠", "♥", "♦", "♣"];
    return suits.indexOf(a.suit) - suits.indexOf(b.suit);
  });
};

const findWinningCard = (trick) => {
  if (trick.length === 0) return null;
  
  let winning = trick[0];
  
  for (let i = 1; i < trick.length; i++) {
    const current = trick[i];
    
    // Spades (trump) beats everything
    if (current.card.suit === '♠' && winning.card.suit !== '♠') {
      winning = current;
    } 
    // Same suit - higher rank wins
    else if (current.card.suit === winning.card.suit) {
      if (current.card.rank > winning.card.rank) {
        winning = current;
      }
    }
  }
  
  return winning;
};

// ============================================
// 🎮 CORE ENGINE - Mode Agnostic
// ============================================
export const useGameEngine = (playerName = "Coach", opponent = null) => {
  // Core player state (NO scores, NO bids - just hands and tricks)
  const [players, setPlayers] = useState([
    { 
      id: 0, 
      name: playerName, 
      hand: [], 
      tricks: 0, 
      isHuman: true,
      difficulty: "human"
    },
    { 
      id: 1, 
      name: opponent?.name || "😈 Belichick", 
      hand: [], 
      tricks: 0, 
      isHuman: false,
      difficulty: opponent?.difficulty || "expert",
      coachId: opponent?.id || "belichick"
    },
    { 
      id: 2, 
      name: "🤔 Tomlin", 
      hand: [], 
      tricks: 0, 
      isHuman: false,
      difficulty: "medium",
      coachId: "tomlin"
    },
    { 
      id: 3, 
      name: "😅 Rivera", 
      hand: [], 
      tricks: 0, 
      isHuman: false,
      difficulty: "easy",
      coachId: "rivera"
    },
  ]);

  const [currentPlayer, setCurrentPlayer] = useState(0);
  const [currentTrick, setCurrentTrick] = useState([]);
  const [leadSuit, setLeadSuit] = useState(null);
  const [spadesBroken, setSpadesBroken] = useState(false);
  const [gamePhase, setGamePhase] = useState("dealing");
  const [roundNumber, setRoundNumber] = useState(1);
  const [isProcessing, setIsProcessing] = useState(false);
  const [debug, setDebug] = useState("Ready");

  // Start a new round (deals cards)
  const startNewRound = () => {
    console.log("🔄 ENGINE: Starting new round");
    setDebug("Dealing cards...");
    
    // Create and shuffle deck
    const deck = shuffle(createDeck());
    console.log(`🃏 Deck has ${deck.length} cards`);
    
    // Create a deep copy of players to avoid reference issues
    const newPlayers = JSON.parse(JSON.stringify(players));
    
    console.log("📤 Dealing cards to players...");
    for (let i = 0; i < 4; i++) {
      const startIdx = i * 13;
      const endIdx = startIdx + 13;
      const playerCards = deck.slice(startIdx, endIdx);
      newPlayers[i].hand = sortHand(playerCards);
      console.log(`   Player ${i} (${newPlayers[i].name}) got ${newPlayers[i].hand.length} cards`);
      newPlayers[i].tricks = 0;
    }

    console.log("✅ Cards dealt successfully");
    setPlayers(newPlayers);
    setCurrentPlayer(0);
    setCurrentTrick([]);
    setLeadSuit(null);
    setSpadesBroken(false);
    setGamePhase("playing");
    setIsProcessing(false);
    setDebug("Your turn");
    
    console.log("🔄 ENGINE: Round started - Game phase is now 'playing'");
  };

  // Check if a play is valid (same suit, spades rules)
  const isValidPlay = (card, playerIndex) => {
    const player = players[playerIndex];
    
    // First card of the trick
    if (currentTrick.length === 0) {
      // Can't lead with spades unless they're broken
      if (card.suit === '♠' && !spadesBroken) {
        const hasNonSpade = player.hand.some(c => c.suit !== '♠');
        if (hasNonSpade) {
          Alert.alert("❌ Illegal Formation", "Can't lead with spades before they're broken!");
          return false;
        }
      }
      return true;
    } 
    // Following suit
    else {
      const hasLeadSuit = player.hand.some(c => c.suit === leadSuit);
      if (hasLeadSuit && card.suit !== leadSuit) {
        Alert.alert("❌ Illegal Formation", `You must play ${leadSuit} if you have it!`);
        return false;
      }
      return true;
    }
  };

  // Play a card (core mechanic)
  const playCard = (card, playerIndex) => {
    // Validation
    if (playerIndex !== currentPlayer) {
      setDebug("Not your turn!");
      return false;
    }
    if (gamePhase !== "playing") {
      setDebug("Game is not in playing phase");
      return false;
    }
    if (isProcessing) {
      setDebug("Please wait...");
      return false;
    }
    
    if (!isValidPlay(card, playerIndex)) {
      return false;
    }

    setIsProcessing(true);
    setDebug(`${players[playerIndex].name} plays ${card.player}`);

    // Create deep copy of players
    const updated = JSON.parse(JSON.stringify(players));
    
    // Remove card from hand
    updated[playerIndex].hand = updated[playerIndex].hand.filter(c => c.id !== card.id);

    // Add to trick
    const newTrick = [...currentTrick, { card, player: playerIndex }];

    // Set lead suit if first card
    if (newTrick.length === 1) {
      setLeadSuit(card.suit);
    }

    // Check if spades are broken
    if (card.suit === "♠" && !spadesBroken) {
      setSpadesBroken(true);
      if (playerIndex === 0) {
        Alert.alert("♠️ Secondary Activated!", "Spades can now be led.");
      }
    }

    setPlayers(updated);
    setCurrentTrick(newTrick);

    // If trick is complete (4 cards)
    if (newTrick.length === 4) {
      const winner = findWinningCard(newTrick);
      
      // Add trick to winner
      const updatedWithWinner = JSON.parse(JSON.stringify(updated));
      updatedWithWinner[winner.player].tricks += 1;
      setPlayers(updatedWithWinner);
      
      setDebug(`${updatedWithWinner[winner.player].name} wins the trick!`);
      
      // Reset for next trick after delay
      setTimeout(() => {
        setCurrentTrick([]);
        setLeadSuit(null);
        setCurrentPlayer(winner.player);
        setIsProcessing(false);
        
        // Check if round is complete
        if (updatedWithWinner[0].hand.length === 0) {
          setGamePhase("roundEnd");
          setDebug("Round complete!");
        } else {
          setDebug(winner.player === 0 ? "Your turn" : `${updatedWithWinner[winner.player].name}'s turn`);
        }
      }, 500);
      
      return {
        completed: true,
        winner: winner.player,
        trick: newTrick,
        players: updatedWithWinner,
        roundComplete: updatedWithWinner[0].hand.length === 0
      };
    } 
    // Trick not complete - move to next player
    else {
      const nextPlayer = (playerIndex + 1) % 4;
      setCurrentPlayer(nextPlayer);
      setIsProcessing(false);
      setDebug(nextPlayer === 0 ? "Your turn" : `${players[nextPlayer].name}'s turn`);
      
      return {
        completed: false,
        nextPlayer: nextPlayer
      };
    }
  };

  // Reset the entire game
  const resetGame = () => {
    setDebug("Resetting game...");
    const resetPlayers = players.map(p => ({ 
      ...p, 
      tricks: 0,
      hand: [] 
    }));
    setPlayers(resetPlayers);
    setRoundNumber(1);
    startNewRound();
  };

  // Skip to next round (for testing)
  const nextRound = () => {
    setRoundNumber(prev => prev + 1);
    startNewRound();
  };

  return {
    // Core state
    players,
    currentPlayer,
    currentTrick,
    leadSuit,
    spadesBroken,
    gamePhase,
    roundNumber,
    isProcessing,
    debug,
    setDebug,
    
    // Core functions
    startNewRound,
    playCard,
    resetGame,
    nextRound,
    setGamePhase,
    setRoundNumber,
    setPlayers,
    setCurrentPlayer,
    setIsProcessing,
  };
};
