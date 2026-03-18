import { useState, useEffect } from 'react';
import { Alert } from 'react-native';

// Deck data
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
  return [...spadesCards, ...heartsCards, ...diamondsCards, ...clubsCards];
};

const shuffle = (deck) => {
  for (let i = deck.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [deck[i], deck[j]] = [deck[j], deck[i]];
  }
  return deck;
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
    if (trick[i].card.suit === '♠' && winning.card.suit !== '♠') {
      winning = trick[i];
    } else if (trick[i].card.suit === winning.card.suit && 
               trick[i].card.rank > winning.card.rank) {
      winning = trick[i];
    }
  }
  return winning;
};

// Bot bidding logic
const generateBotBid = (hand, difficulty) => {
  let bid = 0;
  
  switch(difficulty) {
    case "easy":
      const spadesCount = hand.filter(c => c.suit === '♠').length;
      const aces = hand.filter(c => c.value === 'A').length;
      bid = Math.floor(spadesCount / 3) + aces;
      if (spadesCount === 0 && aces === 0 && Math.random() < 0.05) bid = 0;
      break;
      
    case "medium":
      const mSpades = hand.filter(c => c.suit === '♠').length;
      const mHigh = hand.filter(c => ['A','K','Q'].includes(c.value)).length;
      const mMedium = hand.filter(c => ['J','10'].includes(c.value)).length;
      bid = Math.floor(mSpades / 2) + Math.floor(mHigh / 2) + Math.floor(mMedium / 3);
      if (mSpades === 0 && mHigh < 2 && Math.random() < 0.3) bid = 0;
      break;
      
    case "expert":
      let expertBid = hand.filter(c => c.value === 'A').length;
      const kings = hand.filter(c => c.value === 'K');
      const kingsWithSupport = kings.filter(k => 
        hand.filter(c => c.suit === k.suit).length > 1
      ).length;
      expertBid += kingsWithSupport * 0.7;
      
      const spades = hand.filter(c => c.suit === '♠');
      spades.forEach((card, idx) => {
        if (card.value === 'A') expertBid += 1;
        else if (card.value === 'K' && spades.length > 1) expertBid += 0.8;
        else if (card.value === 'Q' && spades.length > 2) expertBid += 0.6;
        else if (spades.length - idx > 3) expertBid += 0.3;
      });
      
      const voids = 4 - new Set(hand.map(c => c.suit)).size;
      expertBid += voids * 0.5;
      
      const hasHighCard = hand.some(c => ['A','K','Q'].includes(c.value));
      const hasSpades = hand.some(c => c.suit === '♠');
      if (!hasHighCard && !hasSpades && voids >= 2 && Math.random() < 0.7) expertBid = 0;
      
      bid = Math.round(expertBid);
      break;
      
    default: bid = 1;
  }
  
  return Math.min(13, Math.max(0, Math.round(bid)));
};

// Bot playing logic
const selectBotPlay = (hand, currentTrick, leadSuit, spadesBroken, difficulty) => {
  let playable = [...hand];
  
  if (currentTrick.length > 0 && leadSuit) {
    const hasLead = hand.some(c => c.suit === leadSuit);
    if (hasLead) playable = hand.filter(c => c.suit === leadSuit);
  } else if (!spadesBroken) {
    const nonSpades = hand.filter(c => c.suit !== '♠');
    if (nonSpades.length > 0) playable = nonSpades;
  }
  
  let selectedCard;
  
  switch(difficulty) {
    case "easy":
      if (currentTrick.length > 0) {
        const winningPlay = findWinningCard(currentTrick);
        if (winningPlay) {
          const canWin = playable.some(c => 
            (c.suit === '♠' && winningPlay.card.suit !== '♠') ||
            (c.suit === winningPlay.card.suit && c.rank > winningPlay.card.rank)
          );
          if (canWin) {
            const winningCards = playable.filter(c => 
              (c.suit === '♠' && winningPlay.card.suit !== '♠') ||
              (c.suit === winningPlay.card.suit && c.rank > winningPlay.card.rank)
            );
            selectedCard = winningCards[Math.floor(Math.random() * winningCards.length)];
          } else {
            selectedCard = playable[Math.floor(Math.random() * playable.length)];
          }
        } else {
          selectedCard = playable[0];
        }
      } else {
        selectedCard = playable[Math.floor(Math.random() * playable.length)];
      }
      break;
      
    case "medium":
      if (currentTrick.length > 0) {
        const winningPlay = findWinningCard(currentTrick);
        if (winningPlay) {
          const canWin = playable.some(c => 
            (c.suit === '♠' && winningPlay.card.suit !== '♠') ||
            (c.suit === winningPlay.card.suit && c.rank > winningPlay.card.rank)
          );
          if (canWin) {
            selectedCard = playable
              .filter(c => 
                (c.suit === '♠' && winningPlay.card.suit !== '♠') ||
                (c.suit === winningPlay.card.suit && c.rank > winningPlay.card.rank)
              )
              .sort((a, b) => a.rank - b.rank)[0];
          } else {
            selectedCard = playable.sort((a, b) => a.rank - b.rank)[0];
          }
        } else {
          selectedCard = playable[0];
        }
      } else {
        selectedCard = playable.sort((a, b) => b.rank - a.rank)[
          Math.floor(playable.length / 2)
        ] || playable[0];
      }
      break;
      
    case "expert":
      if (currentTrick.length > 0) {
        const winningPlay = findWinningCard(currentTrick);
        if (winningPlay) {
          const canWin = playable.some(c => 
            (c.suit === '♠' && winningPlay.card.suit !== '♠') ||
            (c.suit === winningPlay.card.suit && c.rank > winningPlay.card.rank)
          );
          if (canWin) {
            const winningCards = playable.filter(c => 
              (c.suit === '♠' && winningPlay.card.suit !== '♠') ||
              (c.suit === winningPlay.card.suit && c.rank > winningPlay.card.rank)
            );
            selectedCard = winningCards.length > 1 
              ? winningCards.sort((a, b) => a.rank - b.rank)[0]
              : winningCards[0];
          } else {
            const nonWinners = playable.filter(c => !['A','K','Q'].includes(c.value));
            selectedCard = nonWinners.length > 0
              ? nonWinners.sort((a, b) => a.rank - b.rank)[0]
              : playable.sort((a, b) => a.rank - b.rank)[0];
          }
        } else {
          selectedCard = playable[0];
        }
      } else {
        const suitCounts = {};
        playable.forEach(c => suitCounts[c.suit] = (suitCounts[c.suit] || 0) + 1);
        let longestSuit = Object.keys(suitCounts).reduce((a, b) => 
          suitCounts[a] > suitCounts[b] ? a : b
        );
        const suitCards = playable.filter(c => c.suit === longestSuit);
        selectedCard = suitCards[Math.floor(suitCards.length / 2)];
      }
      break;
      
    default: selectedCard = playable[0];
  }
  
  return selectedCard;
};

export const useGameState = () => {
  const [players, setPlayers] = useState([
    { id: 0, name: "You (HC)", hand: [], tricks: 0, bid: null, score: 0, bags: 0, isHuman: true, difficulty: "human" },
    { id: 1, name: "😈 Belichick", hand: [], tricks: 0, bid: null, score: 0, bags: 0, isHuman: false, difficulty: "expert" },
    { id: 2, name: "🤔 Tomlin", hand: [], tricks: 0, bid: null, score: 0, bags: 0, isHuman: false, difficulty: "medium" },
    { id: 3, name: "😅 Rivera", hand: [], tricks: 0, bid: null, score: 0, bags: 0, isHuman: false, difficulty: "easy" },
  ]);

  const [currentPlayer, setCurrentPlayer] = useState(0);
  const [currentTrick, setCurrentTrick] = useState([]);
  const [leadSuit, setLeadSuit] = useState(null);
  const [spadesBroken, setSpadesBroken] = useState(false);
  const [gamePhase, setGamePhase] = useState("bidding");
  const [selectedBid, setSelectedBid] = useState(null);
  const [roundNumber, setRoundNumber] = useState(1);
  const [isProcessing, setIsProcessing] = useState(false);
  const [debug, setDebug] = useState("Waiting...");
  const [forceBotTimer, setForceBotTimer] = useState(null);
  const [scoreHistory, setScoreHistory] = useState([]);

  const WINNING_SCORE = 70;

  const startNewRound = () => {
    const deck = shuffle(createDeck());
    const newPlayers = [...players];

    for (let i = 0; i < 4; i++) {
      newPlayers[i].hand = sortHand(deck.slice(i * 13, i * 13 + 13));
      newPlayers[i].tricks = 0;
      newPlayers[i].bid = null;
    }

    setPlayers(newPlayers);
    setCurrentPlayer(0);
    setCurrentTrick([]);
    setLeadSuit(null);
    setSpadesBroken(false);
    setGamePhase("bidding");
    setSelectedBid(null);
    setIsProcessing(false);
    setDebug("New quarter - Call your plays!");
  };

  const makeBid = (bid, playerIndex) => {
    const updated = [...players];
    updated[playerIndex].bid = bid;
    setPlayers(updated);

    if (bid === 0) {
      Alert.alert("🛡️ SHUTOUT ATTEMPT!", `${updated[playerIndex].name} is going for the SHUTOUT!`);
    }

    const allBidsIn = updated.every(p => p.bid !== null);
    
    if (allBidsIn) {
      setGamePhase("playing");
      Alert.alert("GAME PLAN SET", "KICKOFF!");
      
      if (!updated[0].isHuman) {
        setTimeout(() => computerPlay(0), 500);
      }
    }
  };

  const makeComputerBids = () => {
    setDebug("Coaching staff placing bids...");
    
    setTimeout(() => makeBid(generateBotBid(players[1].hand, "expert"), 1), 300);
    setTimeout(() => makeBid(generateBotBid(players[2].hand, "medium"), 2), 600);
    setTimeout(() => makeBid(generateBotBid(players[3].hand, "easy"), 3), 900);
  };

  const isValidPlay = (card, playerIndex) => {
    const player = players[playerIndex];
    
    if (currentTrick.length === 0) {
      if (card.suit === '♠' && !spadesBroken) {
        const hasNonSpade = player.hand.some(c => c.suit !== '♠');
        if (hasNonSpade) {
          Alert.alert("Illegal Formation", "Can't lead with DBs!");
          return false;
        }
      }
      return true;
    } else {
      const hasLeadSuit = player.hand.some(c => c.suit === leadSuit);
      if (hasLeadSuit && card.suit !== leadSuit) {
        Alert.alert("Illegal Formation", "Must match position group!");
        return false;
      }
      return true;
    }
  };

  const playCard = (card, playerIndex) => {
    if (playerIndex !== currentPlayer || gamePhase !== "playing" || isProcessing) return;
    if (!isValidPlay(card, playerIndex)) return;

    setIsProcessing(true);
    setDebug(`${players[playerIndex].name} sends in ${card.player}`);

    const updated = [...players];
    updated[playerIndex].hand = updated[playerIndex].hand.filter(c => c.id !== card.id);

    const newTrick = [...currentTrick, { card, player: playerIndex }];
    setCurrentTrick(newTrick);

    if (newTrick.length === 1) setLeadSuit(card.suit);

    if (card.suit === "♠" && !spadesBroken) {
      setSpadesBroken(true);
      if (playerIndex === 0) Alert.alert("Secondary Activated!", "DBs can now make plays!");
    }

    setPlayers(updated);

    if (newTrick.length === 4) {
      evaluateTrick(newTrick);
    } else {
      setCurrentPlayer((playerIndex + 1) % 4);
      setIsProcessing(false);
    }
  };

  // ============================================
  // 🏈 FOOTBALL SCORING
  // ============================================
  const evaluateTrick = (trick) => {
    const winningPlay = findWinningCard(trick);
    const updated = [...players];
    
    updated[winningPlay.player].tricks += 1;
    updated[winningPlay.player].score += 7; // TOUCHDOWN!
    
    setPlayers(updated);
    
    Alert.alert("🏈 TOUCHDOWN!", `${updated[winningPlay.player].name} scores! +7`);

    setTimeout(() => {
      setCurrentTrick([]);
      setLeadSuit(null);
      setCurrentPlayer(winningPlay.player);
      setIsProcessing(false);

      if (updated[0].hand.length === 0) {
        endRound(updated);
      }
    }, 400);
  };

  const addToScoreHistory = (roundPlayers) => {
    const historyEntry = {
      round: roundNumber,
      timestamp: new Date().toLocaleTimeString(),
      scores: roundPlayers.map(p => ({
        name: p.name,
        score: p.score,
        bid: p.bid,
        tricks: p.tricks,
        bags: p.bags
      }))
    };
    setScoreHistory(prev => [historyEntry, ...prev].slice(0, 10));
  };

  const endRound = (roundPlayers) => {
    const updatedPlayers = [...roundPlayers];
    
    updatedPlayers.forEach(player => {
      if (player.bid === 0) {
        if (player.tricks === 0) {
          player.score += 14;
          Alert.alert("🛡️ SHUTOUT!", `${player.name} +14 points`);
        } else {
          player.score -= 14;
          Alert.alert("💔 FAILED SHUTOUT!", `${player.name} -14 points`);
        }
      } else {
        if (player.tricks >= player.bid) {
          const overtricks = player.tricks - player.bid;
          player.score += overtricks * 3; // FIELD GOALS
          player.bags += overtricks;
          
          if (player.bags >= 10) {
            player.score -= 14;
            player.bags -= 10;
            Alert.alert("⚠️ PENALTY!", `${player.name} -14 for 10 bags!`);
          }
        } else {
          const short = player.bid - player.tricks;
          player.score -= short * 7; // OFFSIDES penalty
        }
      }
    });

    addToScoreHistory(updatedPlayers);
    
    Alert.alert(`🏈 QUARTER ${roundNumber} COMPLETE`, 
      updatedPlayers.map(p => `${p.name}: ${p.score}`).join('\n')
    );

    setPlayers(updatedPlayers);
    setRoundNumber(prev => prev + 1);

    const winner = updatedPlayers.find(p => p.score >= WINNING_SCORE);
    if (winner) {
      setGamePhase("gameOver");
      Alert.alert("🏆 SUPER BOWL CHAMPIONS 🏆", `${winner.name} wins!`);
    } else {
      setTimeout(startNewRound, 1500);
    }
  };

  const computerPlay = (playerIndex) => {
    if (gamePhase !== "playing" || currentPlayer !== playerIndex || isProcessing) return;
    
    const player = players[playerIndex];
    if (!player.hand?.length) return;

    const card = selectBotPlay(player.hand, currentTrick, leadSuit, spadesBroken, player.difficulty);
    if (card) playCard(card, playerIndex);
  };

  const resetGame = () => {
    const resetPlayers = players.map(p => ({ ...p, score: 0, bags: 0 }));
    setPlayers(resetPlayers);
    setRoundNumber(1);
    setScoreHistory([]);
    startNewRound();
  };

  useEffect(() => {
    startNewRound();
  }, []);

  useEffect(() => {
    if (gamePhase === "playing" && currentPlayer !== 0 && !isProcessing) {
      const timer = setTimeout(() => computerPlay(currentPlayer), 1000);
      setForceBotTimer(timer);
      return () => clearTimeout(timer);
    }
  }, [currentPlayer, gamePhase, isProcessing]);

  return {
    players,
    currentPlayer,
    currentTrick,
    gamePhase,
    spadesBroken,
    isProcessing,
    debug,
    roundNumber,
    selectedBid,
    setSelectedBid,
    scoreHistory,
    makeBid,
    playCard,
    makeComputerBids,
    resetGame,
  };
};
