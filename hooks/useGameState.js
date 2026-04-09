// hooks/useGameState.js
// Classic Spades — with sound, autosave, AppState pause, card memory

import { useState, useEffect, useRef, useCallback } from 'react';
import { Alert, AppState } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Haptics from 'expo-haptics';
import { getRandomCoaches } from '../constants/coaches';
import { createFullDeck } from '../constants/deck';
import { CARD_TYPES } from '../constants/cardTypes';
import { SoundService } from '../services/soundService';
import { saveClassicGame, clearClassicGame } from '../services/gameAutosave';

const shuffle = (deck) => {
  const d = [...deck];
  for (let i = d.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [d[i], d[j]] = [d[j], d[i]];
  }
  return d;
};

const SUIT_ORDER = { '♠': 0, '♥': 1, '♦': 2, '♣': 3 };
const sortHand = (hand) =>
  [...hand].sort((a, b) =>
    SUIT_ORDER[a.suit] !== SUIT_ORDER[b.suit]
      ? SUIT_ORDER[a.suit] - SUIT_ORDER[b.suit]
      : a.rank - b.rank
  );

const findWinningCard = (trick) => {
  if (!trick.length) return null;
  return trick.reduce((best, play) => {
    const b = best.card, t = play.card;
    if (t.suit === '♠' && b.suit !== '♠') return play;
    if (t.suit === b.suit && t.rank > b.rank) return play;
    return best;
  }, trick[0]);
};

const generateBotBid = (hand, difficulty) => {
  let bid = 0;
  const spades = hand.filter(c => c.suit === '♠');
  const aces   = hand.filter(c => c.value === 'A');
  const high   = hand.filter(c => ['A','K','Q'].includes(c.value));
  const medium = hand.filter(c => ['J','10'].includes(c.value));
  const voids  = 4 - new Set(hand.map(c => c.suit)).size;
  if (difficulty === 'easy') {
    bid = Math.floor(spades.length / 3) + aces.length;
    if (spades.length === 0 && aces.length === 0 && Math.random() < 0.05) bid = 0;
  } else if (difficulty === 'medium') {
    bid = Math.floor(spades.length / 2) + Math.floor(high.length / 2) + Math.floor(medium.length / 3);
    if (spades.length === 0 && high.length < 2 && Math.random() < 0.3) bid = 0;
  } else {
    bid = aces.length;
    const kings = hand.filter(c => c.value === 'K');
    bid += kings.filter(k => hand.filter(c => c.suit === k.suit).length > 1).length * 0.7;
    spades.forEach((card, idx) => {
      if (card.value === 'A') bid += 1;
      else if (card.value === 'K' && spades.length > 1) bid += 0.8;
      else if (card.value === 'Q' && spades.length > 2) bid += 0.6;
      else if (spades.length - idx > 3) bid += 0.3;
    });
    bid += voids * 0.5;
    if (!hand.some(c => ['A','K','Q'].includes(c.value)) && !hand.some(c => c.suit === '♠') && voids >= 2 && Math.random() < 0.7) bid = 0;
    bid = Math.round(bid);
  }
  return Math.min(13, Math.max(0, bid));
};

const selectBotPlay = (hand, currentTrick, leadSuit, spadesBroken, difficulty, playedCards) => {
  if (!hand.length) return null;
  let valid = [...hand];
  if (currentTrick.length > 0 && leadSuit) {
    const hasLead = hand.some(c => c.suit === leadSuit);
    if (hasLead) valid = hand.filter(c => c.suit === leadSuit);
  } else if (currentTrick.length === 0 && !spadesBroken) {
    const nonSpades = hand.filter(c => c.suit !== '♠');
    if (nonSpades.length) valid = nonSpades;
  }
  const isHigh = (card) => {
    if (!playedCards) return false;
    const higherPlayed = [...playedCards].filter(id => {
      const p = id.split('-');
      return p[0] === card.suit && parseInt(p[2], 10) > card.rank;
    });
    return higherPlayed.length >= (14 - card.rank);
  };
  if (currentTrick.length > 0) {
    const winning = findWinningCard(currentTrick);
    const winners = valid.filter(c =>
      (c.suit === '♠' && winning.card.suit !== '♠') ||
      (c.suit === winning.card.suit && c.rank > winning.card.rank)
    );
    if (difficulty === 'expert' && winners.length) return winners.sort((a, b) => a.rank - b.rank)[0];
    if (difficulty === 'medium' && winners.length) return winners.sort((a, b) => a.rank - b.rank)[0];
    if (difficulty === 'easy' && winners.length && Math.random() > 0.5) return valid.sort((a, b) => b.rank - a.rank)[0];
  } else if (difficulty === 'expert') {
    const high = valid.filter(c => isHigh(c));
    if (high.length) {
      const ns = high.filter(c => c.suit !== '♠');
      if (ns.length) return ns.sort((a, b) => b.rank - a.rank)[0];
      return high.sort((a, b) => b.rank - a.rank)[0];
    }
    const suitCounts = {};
    hand.forEach(c => { suitCounts[c.suit] = (suitCounts[c.suit] || 0) + 1; });
    const ns = valid.filter(c => c.suit !== '♠');
    if (ns.length) return ns.sort((a, b) => (suitCounts[a.suit] || 0) - (suitCounts[b.suit] || 0) || a.rank - b.rank)[0];
  }
  return valid.sort((a, b) => a.rank - b.rank)[0];
};

const saveGameStats = async (finalPlayers, didWin) => {
  try {
    const raw  = await AsyncStorage.getItem('gameStats');
    const prev = raw ? JSON.parse(raw) : { gamesPlayed: 0, wins: 0, losses: 0, totalTricks: 0, totalBags: 0, highestScore: 0, totalScore: 0, currentStreak: 0, longestStreak: 0 };
    const me = finalPlayers[0];
    const currentStreak = didWin ? Math.max(0, prev.currentStreak) + 1 : Math.min(0, prev.currentStreak) - 1;
    await AsyncStorage.setItem('gameStats', JSON.stringify({
      gamesPlayed:   prev.gamesPlayed + 1,
      wins:          prev.wins   + (didWin ? 1 : 0),
      losses:        prev.losses + (didWin ? 0 : 1),
      totalTricks:   prev.totalTricks + (me?.tricks ?? 0),
      totalBags:     prev.totalBags   + (me?.bags   ?? 0),
      highestScore:  Math.max(prev.highestScore, me?.score ?? 0),
      totalScore:    prev.totalScore  + (me?.score  ?? 0),
      currentStreak,
      longestStreak: Math.max(prev.longestStreak, currentStreak),
    }));
  } catch (_) {}
};

export const useGameState = (
  cardType     = CARD_TYPES.ALL_STARS.id,
  selectedTeam = null,
  winTarget    = 70,
  savedState   = null,
) => {
  const cardTypeRef      = useRef(cardType);
  const selectedTeamRef  = useRef(selectedTeam);
  const winTargetRef     = useRef(winTarget);
  const playersRef       = useRef([]);
  const gamePhaseRef     = useRef('bidding');
  const currentPlayerRef = useRef(0);
  const isProcessingRef  = useRef(false);
  const currentTrickRef  = useRef([]);
  const leadSuitRef      = useRef(null);
  const spadesBrokenRef  = useRef(false);
  const roundNumberRef   = useRef(savedState?.roundNumber ?? 1);
  const playedCardsRef   = useRef(new Set());
  const voidSuitsRef     = useRef({ 0: new Set(), 1: new Set(), 2: new Set(), 3: new Set() });
  const isPausedRef      = useRef(false);

  useEffect(() => { cardTypeRef.current     = cardType;     }, [cardType]);
  useEffect(() => { selectedTeamRef.current = selectedTeam; }, [selectedTeam]);
  useEffect(() => { winTargetRef.current    = winTarget;    }, [winTarget]);

  const [players,       setPlayers]       = useState(savedState?.players ?? []);
  const [currentPlayer, setCurrentPlayer] = useState(savedState?.currentPlayer ?? 0);
  const [currentTrick,  setCurrentTrick]  = useState(savedState?.currentTrick ?? []);
  const [leadSuit,      setLeadSuit]      = useState(savedState?.leadSuit ?? null);
  const [spadesBroken,  setSpadesBroken]  = useState(savedState?.spadesBroken ?? false);
  const [gamePhase,     setGamePhase]     = useState(savedState?.gamePhase ?? 'bidding');
  const [isProcessing,  setIsProcessing]  = useState(false);
  const [debug,         setDebug]         = useState('');
  const [roundNumber,   setRoundNumber]   = useState(savedState?.roundNumber ?? 1);
  const [selectedBid,   setSelectedBid]   = useState(null);
  const [scoreHistory,  setScoreHistory]  = useState(savedState?.scoreHistory ?? []);
  const [isPaused,      setIsPaused]      = useState(false);

  useEffect(() => { playersRef.current       = players;       }, [players]);
  useEffect(() => { gamePhaseRef.current     = gamePhase;     }, [gamePhase]);
  useEffect(() => { currentPlayerRef.current = currentPlayer; }, [currentPlayer]);
  useEffect(() => { isProcessingRef.current  = isProcessing;  }, [isProcessing]);
  useEffect(() => { currentTrickRef.current  = currentTrick;  }, [currentTrick]);
  useEffect(() => { leadSuitRef.current      = leadSuit;      }, [leadSuit]);
  useEffect(() => { spadesBrokenRef.current  = spadesBroken;  }, [spadesBroken]);
  useEffect(() => { roundNumberRef.current   = roundNumber;   }, [roundNumber]);
  useEffect(() => { isPausedRef.current      = isPaused;      }, [isPaused]);

  const botTimer = useRef(null);

  const triggerAutosave = useCallback(() => {
    saveClassicGame({
      players:       playersRef.current,
      currentPlayer: currentPlayerRef.current,
      currentTrick:  currentTrickRef.current,
      leadSuit:      leadSuitRef.current,
      spadesBroken:  spadesBrokenRef.current,
      gamePhase:     gamePhaseRef.current,
      roundNumber:   roundNumberRef.current,
      scoreHistory:  [],
      cardType, selectedTeam, winTarget,
    });
  }, [cardType, selectedTeam, winTarget]);

  // AppState — auto pause on background
  useEffect(() => {
    const sub = AppState.addEventListener('change', (next) => {
      if ((next === 'background' || next === 'inactive') && !isPausedRef.current) {
        if (gamePhaseRef.current === 'playing' || gamePhaseRef.current === 'bidding') {
          isPausedRef.current = true;
          setIsPaused(true);
          triggerAutosave();
          SoundService.pause();
        }
      }
    });
    return () => sub.remove();
  }, [triggerAutosave]);

  useEffect(() => {
    SoundService.init();
    return () => SoundService.unloadAll();
  }, []);

  const resetCardMemory = useCallback(() => {
    playedCardsRef.current = new Set();
    voidSuitsRef.current   = { 0: new Set(), 1: new Set(), 2: new Set(), 3: new Set() };
  }, []);

  const startNewRound = useCallback((prevPlayers = []) => {
    const ct   = cardTypeRef.current;
    const team = selectedTeamRef.current;
    const coaches = getRandomCoaches(3, team);
    const configs = [
      { name: 'You', team, difficulty: null, isHuman: true },
      ...coaches.map(c => ({ name: c.name, team: c.team, difficulty: c.difficulty, isHuman: false })),
    ];
    const newPlayers = configs.map((cfg, idx) => {
      const deck = shuffle(createFullDeck(ct, cfg.team));
      const hand = [];
      for (let i = 0; i < 13; i++) { const c = deck.pop(); if (c) hand.push(c); }
      return {
        id: idx, name: cfg.name, hand: sortHand(hand),
        score:  prevPlayers[idx]?.score ?? 0,
        bags:   prevPlayers[idx]?.bags  ?? 0,
        tricks: 0, bid: null,
        difficulty: cfg.difficulty, team: cfg.team, isHuman: cfg.isHuman,
      };
    });
    resetCardMemory();
    setPlayers(newPlayers);
    setCurrentTrick([]);
    setLeadSuit(null);
    setCurrentPlayer(0);
    setSpadesBroken(false);
    setIsProcessing(false);
    setSelectedBid(null);
    setIsPaused(false);
    isPausedRef.current = false;
    setGamePhase('bidding');
    setDebug(`Classic • Q${roundNumberRef.current} • ${team?.toUpperCase() || 'All-Stars'}`);
  }, [resetCardMemory]);

  useEffect(() => { if (!savedState) startNewRound(); }, []);
  useEffect(() => { setRoundNumber(1); setScoreHistory([]); startNewRound(); }, [cardType, selectedTeam]);

  const pauseGame = useCallback(() => {
    isPausedRef.current = true;
    setIsPaused(true);
    triggerAutosave();
    SoundService.pause();
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  }, [triggerAutosave]);

  const resumeGame = useCallback(() => {
    isPausedRef.current = false;
    setIsPaused(false);
    SoundService.resume();
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  }, []);

  const makeBid = useCallback((bid, playerIndex) => {
    if (isPausedRef.current) return;
    SoundService.bidPlaced();
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    if (bid === 0 && playerIndex === 0) Alert.alert('🛡️ SHUTOUT ATTEMPT!', "Going for the shutout!");
    setPlayers(prev => {
      const updated = prev.map((p, i) => i === playerIndex ? { ...p, bid } : p);
      if (updated.every(p => p.bid !== null)) {
        setTimeout(() => { setGamePhase('playing'); setCurrentPlayer(0); setDebug('Game on — you lead!'); }, 0);
      } else {
        setCurrentPlayer((playerIndex + 1) % 4);
      }
      return updated;
    });
    setSelectedBid(null);
  }, []);

  const makeComputerBids = useCallback(() => {
    setDebug('Coaching staff bidding...');
    [1, 2, 3].forEach(idx => {
      setTimeout(() => {
        setPlayers(prev => {
          const player = prev[idx];
          if (!player || player.bid !== null) return prev;
          const bid = generateBotBid(player.hand, player.difficulty);
          const updated = prev.map((p, i) => i === idx ? { ...p, bid } : p);
          if (updated.every(p => p.bid !== null)) {
            setTimeout(() => { setGamePhase('playing'); setCurrentPlayer(0); setDebug('Game on — you lead!'); }, 0);
          } else {
            setCurrentPlayer((idx + 1) % 4);
          }
          return updated;
        });
      }, idx * 500);
    });
  }, []);

  const isValidPlay = useCallback((card, playerIndex) => {
    const player = playersRef.current[playerIndex];
    if (!player) return false;
    if (currentTrickRef.current.length === 0) {
      if (card.suit === '♠' && !spadesBrokenRef.current) {
        if (player.hand.some(c => c.suit !== '♠')) {
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
          Alert.alert('❌ Illegal', "Can't lead spades until broken!");
          return false;
        }
      }
    } else {
      if (player.hand.some(c => c.suit === leadSuitRef.current) && card.suit !== leadSuitRef.current) {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
        Alert.alert('❌ Illegal', 'Must follow suit!');
        return false;
      }
    }
    return true;
  }, []);

  const evaluateTrick = useCallback((trick) => {
    const winner    = findWinningCard(trick);
    const winnerIdx = winner.player;
    if (winnerIdx === 0) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
      SoundService.trickWin();
    } else {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      SoundService.trickLose();
    }
    setPlayers(prev => {
      const updated = prev.map((p, i) => i === winnerIdx ? { ...p, tricks: p.tricks + 1 } : p);
      playersRef.current = updated;
      setTimeout(() => triggerAutosave(), 0);
      if (updated[0].hand.length === 0) {
        setTimeout(() => endRound(updated), 600);
      } else {
        setTimeout(() => {
          setCurrentTrick([]);
          setLeadSuit(null);
          setCurrentPlayer(winnerIdx);
          setIsProcessing(false);
          setDebug(`${updated[winnerIdx].name} won the trick!`);
        }, 800);
      }
      return updated;
    });
  }, [triggerAutosave]);

  const playCard = useCallback((card, playerIndex) => {
    if (isPausedRef.current) return;
    if (playerIndex !== currentPlayerRef.current || gamePhaseRef.current !== 'playing' || isProcessingRef.current) return;
    if (!isValidPlay(card, playerIndex)) return;
    setIsProcessing(true);
    playedCardsRef.current.add(`${card.suit}-${card.value}-${card.rank}`);
    if (currentTrickRef.current.length > 0 && leadSuitRef.current && card.suit !== leadSuitRef.current) {
      voidSuitsRef.current[playerIndex]?.add(leadSuitRef.current);
    }
    if (card.suit === '♠' && !spadesBrokenRef.current) {
      setSpadesBroken(true);
      spadesBrokenRef.current = true;
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      SoundService.spadesBroken();
      if (playerIndex === 0) Alert.alert('♠ Spades Broken!', 'Spades can now be led!');
    } else if (playerIndex === 0) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      SoundService.cardPlay();
    }
    setPlayers(prev => {
      const updated = prev.map((p, i) => i === playerIndex ? { ...p, hand: p.hand.filter(c => c.id !== card.id) } : p);
      playersRef.current = updated;
      return updated;
    });
    setCurrentTrick(prev => {
      const newTrick = [...prev, { card, player: playerIndex }];
      currentTrickRef.current = newTrick;
      if (newTrick.length === 1) { setLeadSuit(card.suit); leadSuitRef.current = card.suit; }
      if (newTrick.length === 4) {
        setTimeout(() => evaluateTrick(newTrick), 400);
      } else {
        const next = (playerIndex + 1) % 4;
        setCurrentPlayer(next);
        setIsProcessing(false);
      }
      return newTrick;
    });
  }, [isValidPlay, evaluateTrick]);

  const endRound = useCallback((roundPlayers) => {
    const nilBonus = Math.round(winTargetRef.current * 0.2);
    const updated = roundPlayers.map(p => {
      let { score, bags, bid, tricks } = p;
      if (bid === 0) {
        if (tricks === 0) { score += nilBonus; } else { score -= nilBonus; }
      } else {
        if (tricks >= bid) {
          const over = tricks - bid;
          score += bid * 10 + over;
          bags  += over;
          if (bags >= 10) { score -= 100; bags -= 10; }
        } else {
          score -= bid * 10;
        }
      }
      return { ...p, score, bags, tricks: 0, bid: null };
    });
    setScoreHistory(prev => [
      { round: roundNumberRef.current, scores: updated.map(p => ({ name: p.name, score: p.score })) },
      ...prev,
    ].slice(0, 10));
    setRoundNumber(r => { roundNumberRef.current = r + 1; return r + 1; });
    const winner = updated.find(p => p.score >= winTargetRef.current);
    if (winner) {
      const didWin = winner.id === 0;
      setPlayers(updated);
      setGamePhase('gameOver');
      saveGameStats(updated, didWin);
      clearClassicGame();
      if (didWin) { Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success); SoundService.gameWin(); }
      else        { Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);   SoundService.gameLose(); }
      Alert.alert('🏆 GAME OVER', `${winner.name} wins with ${winner.score} pts!`);
    } else {
      setTimeout(() => startNewRound(updated), 1500);
    }
  }, [startNewRound]);

  useEffect(() => {
    if (isPaused || gamePhase !== 'playing' || currentPlayer === 0 || isProcessing) return;
    if (botTimer.current) clearTimeout(botTimer.current);
    botTimer.current = setTimeout(() => {
      const player = playersRef.current[currentPlayer];
      if (!player?.hand?.length) return;
      const card = selectBotPlay(player.hand, currentTrickRef.current, leadSuitRef.current, spadesBrokenRef.current, player.difficulty, playedCardsRef.current);
      if (card) playCard(card, currentPlayer);
    }, 900);
    return () => clearTimeout(botTimer.current);
  }, [isPaused, currentPlayer, gamePhase, isProcessing, playCard]);

  const resetGame = useCallback(() => {
    clearClassicGame();
    setRoundNumber(1);
    roundNumberRef.current = 1;
    setScoreHistory([]);
    startNewRound();
  }, [startNewRound]);

  return {
    players, currentPlayer, currentTrick, gamePhase, spadesBroken,
    isProcessing, debug, roundNumber, selectedBid, setSelectedBid,
    scoreHistory, nilBonus: Math.round(winTarget * 0.2), isPaused,
    makeBid, makeComputerBids, playCard, resetGame, pauseGame, resumeGame,
  };
};

export default useGameState;
