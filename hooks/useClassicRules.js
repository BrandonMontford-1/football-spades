import { useState, useEffect } from 'react';
import { Alert } from 'react-native';

export const useClassicRules = (engine, ai, onScoreUpdate) => {
  const [bids, setBids] = useState([null, null, null, null]);
  const [selectedBid, setSelectedBid] = useState(null);
  const [gamePhase, setGamePhase] = useState("bidding");
  
  // IMPORTANT FIX: Initialize playersWithScore from engine.players
  // This ensures we have the cards from the engine!
  const [playersWithScore, setPlayersWithScore] = useState(
    engine.players.map(p => ({ 
      ...p, 
      score: 0, 
      bags: 0, 
      bid: null 
    }))
  );

  // FIX: Sync players when engine updates (when cards are dealt)
  useEffect(() => {
    console.log("🔄 ClassicRules: Syncing players from engine");
    setPlayersWithScore(prev => 
      engine.players.map((p, index) => ({
        ...p,
        score: prev[index]?.score || 0,
        bags: prev[index]?.bags || 0,
        bid: prev[index]?.bid || null
      }))
    );
  }, [engine.players]);

  const WINNING_SCORE = 70;

  const makeBid = (bid, playerIndex) => {
    const updatedBids = [...bids];
    updatedBids[playerIndex] = bid;
    setBids(updatedBids);

    const updatedPlayers = [...playersWithScore];
    updatedPlayers[playerIndex].bid = bid;
    setPlayersWithScore(updatedPlayers);

    if (bid === 0) {
      Alert.alert("🛡️ SHUTOUT ATTEMPT!", `${updatedPlayers[playerIndex].name} is going for the SHUTOUT!`);
    }

    const allBidsIn = updatedBids.every(b => b !== null);
    
    if (allBidsIn) {
      setGamePhase("playing");
      Alert.alert("GAME PLAN SET", "KICKOFF!");
    }
  };

  const makeComputerBids = (players, tendencies) => {
    if (gamePhase !== "bidding") return;
    
    setTimeout(() => {
      const bid = ai.generateBid(players[1]?.hand || [], "expert", tendencies);
      makeBid(bid, 1);
    }, 300);
    
    setTimeout(() => {
      const bid = ai.generateBid(players[2]?.hand || [], "medium", tendencies);
      makeBid(bid, 2);
    }, 600);
    
    setTimeout(() => {
      const bid = ai.generateBid(players[3]?.hand || [], "easy", tendencies);
      makeBid(bid, 3);
    }, 900);
  };

  const scoreTrick = (winner) => {
    const updated = [...playersWithScore];
    updated[winner].score += 7;
    setPlayersWithScore(updated);
    onScoreUpdate?.(updated);
    return updated;
  };

  const endRound = () => {
    const updated = [...playersWithScore];
    
    updated.forEach(player => {
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
          player.score += overtricks * 3;
          player.bags += overtricks;
          
          if (player.bags >= 10) {
            player.score -= 14;
            player.bags -= 10;
            Alert.alert("⚠️ PENALTY!", `${player.name} -14 for 10 bags!`);
          }
        } else {
          const short = player.bid - player.tricks;
          player.score -= short * 7;
        }
      }
    });

    setPlayersWithScore(updated);
    
    const winner = updated.find(p => p.score >= WINNING_SCORE);
    if (winner) {
      setGamePhase("gameOver");
      return { gameOver: true, winner: winner.name, players: updated };
    }
    
    setBids([null, null, null, null]);
    setGamePhase("bidding");
    
    return { gameOver: false, players: updated };
  };

  const resetGame = () => {
    const reset = playersWithScore.map(p => ({ ...p, score: 0, bags: 0, bid: null }));
    setPlayersWithScore(reset);
    setBids([null, null, null, null]);
    setGamePhase("bidding");
    setSelectedBid(null);
  };

  return {
    players: playersWithScore,
    bids,
    gamePhase,
    selectedBid,
    setSelectedBid,
    makeBid,
    makeComputerBids,
    scoreTrick,
    endRound,
    resetGame,
    WINNING_SCORE,
  };
};
