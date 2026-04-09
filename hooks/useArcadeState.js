// hooks/useArcadeState.js
// Arcade Spades — with sound, AppState timer pause, autosave per round

import { useState, useEffect, useRef, useCallback } from 'react';
import { Alert, AppState } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Haptics from 'expo-haptics';
import { getRandomCoaches } from '../constants/coaches';
import { createFullDeck } from '../constants/deck';
import { CARD_TYPES } from '../constants/cardTypes';
import { SoundService } from '../services/soundService';
import { saveArcadeGame, clearArcadeGame } from '../services/gameAutosave';

const GAME_DURATION = 90;
const TURN_DURATION = 5;

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

const getTrickPoints = (card) =>
  card.value === 'A' ? 8 : card.suit === '♠' ? 3 : 6;

const getValidCards = (hand, leadSuit, spadesBroken) => {
  if (!leadSuit) {
    if (!spadesBroken) {
      const nonSpades = hand.filter(c => c.suit !== '♠');
      return nonSpades.length ? nonSpades : hand;
    }
    return hand;
  }
  const hasLead = hand.some(c => c.suit === leadSuit);
  return hasLead ? hand.filter(c => c.suit === leadSuit) : hand;
};

const selectBotPlay = (hand, currentTrick, leadSuit, spadesBroken, difficulty, playedCards) => {
  if (!hand.length) return null;
  const valid = currentTrick.length > 0 && leadSuit
    ? (hand.some(c => c.suit === leadSuit) ? hand.filter(c => c.suit === leadSuit) : hand)
    : getValidCards(hand, null, spadesBroken);

  const isHigh = (card) => {
    if (!playedCards) return false;
    const higherPlayed = [...playedCards].filter(id => {
      const p = id.split('-');
      return p[0] === card.suit && parseInt(p[2], 10) > card.rank;
    });
    return higherPlayed.length >= (14 - card.rank);
  };

  if (currentTrick.length === 0) {
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
    return valid.sort((a, b) => a.rank - b.rank)[0];
  }

  const winning = findWinningCard(currentTrick);
  const winners = valid.filter(c =>
    (c.suit === '♠' && winning.card.suit !== '♠') ||
    (c.suit === winning.card.suit && c.rank > winning.card.rank)
  );
  if (winners.length) return winners.sort((a, b) => a.rank - b.rank)[0];

  const suitCounts = {};
  hand.forEach(c => { suitCounts[c.suit] = (suitCounts[c.suit] || 0) + 1; });
  const ns = valid.filter(c => c.suit !== '♠');
  if (ns.length) return ns.sort((a, b) => (suitCounts[a.suit] || 0) - (suitCounts[b.suit] || 0) || a.rank - b.rank)[0];
  return valid.sort((a, b) => a.rank - b.rank)[0];
};

export const useArcadeState = (
  cardType     = CARD_TYPES.ALL_STARS.id,
  selectedTeam = null,
  savedState   = null,
) => {
  const cardTypeRef      = useRef(cardType);
  const selectedTeamRef  = useRef(selectedTeam);
  const playersRef       = useRef([]);
  const gamePhaseRef     = useRef('playing');
  const currentPlayerRef = useRef(0);
  const isProcessingRef  = useRef(false);
  const currentTrickRef  = useRef([]);
  const leadSuitRef      = useRef(null);
  const spadesBrokenRef  = useRef(false);
  const gameTimeRef      = useRef(savedState?.gameTimeLeft ?? GAME_DURATION);
  const roundNumberRef   = useRef(savedState?.roundNumber ?? 1);
  const isPausedRef      = useRef(false);
  const playedCardsRef   = useRef(new Set());

  useEffect(() => { cardTypeRef.current     = cardType;     }, [cardType]);
  useEffect(() => { selectedTeamRef.current = selectedTeam; }, [selectedTeam]);

  const [players,       setPlayers]       = useState(savedState?.players ?? []);
  const [currentPlayer, setCurrentPlayer] = useState(savedState?.currentPlayer ?? 0);
  const [currentTrick,  setCurrentTrick]  = useState(savedState?.currentTrick ?? []);
  const [leadSuit,      setLeadSuit]      = useState(savedState?.leadSuit ?? null);
  const [spadesBroken,  setSpadesBroken]  = useState(savedState?.spadesBroken ?? false);
  const [gamePhase,     setGamePhase]     = useState('playing');
  const [isProcessing,  setIsProcessing]  = useState(false);
  const [debug,         setDebug]         = useState('');
  const [roundNumber,   setRoundNumber]   = useState(savedState?.roundNumber ?? 1);
  const [scoreHistory,  setScoreHistory]  = useState(savedState?.scoreHistory ?? []);
  const [gameTimeLeft,  setGameTimeLeft]  = useState(savedState?.gameTimeLeft ?? GAME_DURATION);
  const [turnTimeLeft,  setTurnTimeLeft]  = useState(TURN_DURATION);
  const [blindNilAvailable, setBlindNilAvailable] = useState(false);
  const [isBlindNil,    setIsBlindNil]    = useState(false);
  const [isPaused,      setIsPaused]      = useState(false);

  useEffect(() => { playersRef.current       = players;       }, [players]);
  useEffect(() => { gamePhaseRef.current     = gamePhase;     }, [gamePhase]);
  useEffect(() => { currentPlayerRef.current = currentPlayer; }, [currentPlayer]);
  useEffect(() => { isProcessingRef.current  = isProcessing;  }, [isProcessing]);
  useEffect(() => { currentTrickRef.current  = currentTrick;  }, [currentTrick]);
  useEffect(() => { leadSuitRef.current      = leadSuit;      }, [leadSuit]);
  useEffect(() => { spadesBrokenRef.current  = spadesBroken;  }, [spadesBroken]);
  useEffect(() => { gameTimeRef.current      = gameTimeLeft;  }, [gameTimeLeft]);
  useEffect(() => { roundNumberRef.current   = roundNumber;   }, [roundNumber]);
  useEffect(() => { isPausedRef.current      = isPaused;      }, [isPaused]);

  const gameTimerRef = useRef(null);
  const turnTimerRef = useRef(null);
  const botTimerRef  = useRef(null);

  const stopGameTimer = useCallback(() => {
    if (gameTimerRef.current) { clearInterval(gameTimerRef.current); gameTimerRef.current = null; }
  }, []);

  const startGameTimer = useCallback(() => {
    stopGameTimer();
    gameTimerRef.current = setInterval(() => {
      if (isPausedRef.current) return; // skip tick while paused
      setGameTimeLeft(prev => {
        if (prev <= 1) {
          stopGameTimer();
          setTimeout(() => {
            if (gamePhaseRef.current !== 'gameOver') {
              setGamePhase('gameOver');
              clearArcadeGame();
              const sorted = [...playersRef.current].sort((a, b) => b.score - a.score);
              const didWin = sorted[0]?.id === 0;
              if (didWin) { Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success); SoundService.gameWin(); }
              else        { Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);   SoundService.gameLose(); }
              Alert.alert('⏰ TIME\'S UP!', didWin ? `🏆 YOU WIN with ${sorted[0].score} pts!` : `${sorted[0]?.name} wins with ${sorted[0]?.score} pts`);
            }
          }, 0);
          return 0;
        }
        if (prev <= 6 && prev > 1) {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          SoundService.clockWarning();
        }
        return prev - 1;
      });
    }, 1000);
  }, [stopGameTimer]);

  const stopTurnTimer = useCallback(() => {
    if (turnTimerRef.current) { clearInterval(turnTimerRef.current); turnTimerRef.current = null; }
  }, []);

  const startTurnTimer = useCallback(() => {
    stopTurnTimer();
    setTurnTimeLeft(TURN_DURATION);
    if (currentPlayerRef.current !== 0) return;
    turnTimerRef.current = setInterval(() => {
      if (isPausedRef.current) return;
      setTurnTimeLeft(prev => {
        if (prev <= 1) {
          stopTurnTimer();
          const player = playersRef.current[0];
          if (player?.hand?.length && gamePhaseRef.current === 'playing' && !isProcessingRef.current) {
            const valid = getValidCards(player.hand, leadSuitRef.current, spadesBrokenRef.current);
            const lowest = [...valid].sort((a, b) => a.rank - b.rank)[0];
            if (lowest) {
              Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
              SoundService.autoPlay();
              Alert.alert('⏰ AUTO-PLAY', `Playing ${lowest.player} — time ran out!`);
              playCardInternal(lowest, 0);
            }
          }
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  }, [stopTurnTimer]);

  // Autosave helper
  const triggerAutosave = useCallback(() => {
    saveArcadeGame({
      players:       playersRef.current,
      currentPlayer: currentPlayerRef.current,
      currentTrick:  currentTrickRef.current,
      leadSuit:      leadSuitRef.current,
      spadesBroken:  spadesBrokenRef.current,
      roundNumber:   roundNumberRef.current,
      scoreHistory:  [],
      gameTimeLeft:  gameTimeRef.current,
      cardType, selectedTeam,
    });
  }, [cardType, selectedTeam]);

  // AppState — pause timers on background
  useEffect(() => {
    const sub = AppState.addEventListener('change', (next) => {
      if ((next === 'background' || next === 'inactive') && !isPausedRef.current) {
        isPausedRef.current = true;
        setIsPaused(true);
        triggerAutosave();
        SoundService.pause();
      }
    });
    return () => sub.remove();
  }, [triggerAutosave]);

  useEffect(() => {
    SoundService.init();
    return () => SoundService.unloadAll();
  }, []);

  const startNewRound = useCallback((prevPlayers = []) => {
    stopTurnTimer();
    playedCardsRef.current = new Set();
    const ct   = cardTypeRef.current;
    const team = selectedTeamRef.current;
    const coaches = getRandomCoaches(3, team);
    const configs = [
      { name: 'You', team, difficulty: 'expert', isHuman: true },
      ...coaches.map(c => ({ name: c.name, team: c.team, difficulty: c.difficulty, isHuman: false })),
    ];
    const newPlayers = configs.map((cfg, idx) => {
      const deck = shuffle(createFullDeck(ct, cfg.team));
      const hand = [];
      for (let i = 0; i < 13; i++) { const c = deck.pop(); if (c) hand.push(c); }
      return {
        id: idx, name: cfg.name, hand: sortHand(hand),
        score:  prevPlayers[idx]?.score ?? 0,
        tricks: 0, bid: null, bags: 0,
        difficulty: cfg.difficulty, team: cfg.team, isHuman: cfg.isHuman,
      };
    });
    setPlayers(newPlayers);
    setCurrentTrick([]);
    setLeadSuit(null);
    setCurrentPlayer(0);
    setSpadesBroken(false);
    setIsProcessing(false);
    setBlindNilAvailable(false);
    setIsBlindNil(false);
    setIsPaused(false);
    isPausedRef.current = false;
    setGamePhase('playing');
    setDebug(`Arcade • Q${roundNumberRef.current} • ${team?.toUpperCase() || 'All-Stars'}`);
    setTimeout(() => startTurnTimer(), 100);
  }, [stopTurnTimer, startTurnTimer]);

  useEffect(() => {
    if (!savedState) startNewRound();
    startGameTimer();
    return () => {
      stopGameTimer();
      stopTurnTimer();
      if (botTimerRef.current) clearTimeout(botTimerRef.current);
    };
  }, []);

  useEffect(() => {
    stopGameTimer();
    stopTurnTimer();
    setGameTimeLeft(GAME_DURATION);
    setRoundNumber(1);
    roundNumberRef.current = 1;
    setScoreHistory([]);
    startNewRound();
    startGameTimer();
  }, [cardType, selectedTeam]);

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

  const isValidPlayCheck = useCallback((card, playerIndex) => {
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
    const points    = getTrickPoints(winner.card);
    if (winnerIdx === 0) { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy); SoundService.trickWin(); }
    else                 { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); SoundService.trickLose(); }
    stopGameTimer();
    stopTurnTimer();
    setPlayers(prev => {
      const updated = prev.map((p, i) =>
        i === winnerIdx ? { ...p, score: p.score + points, tricks: p.tricks + 1 } : p
      );
      playersRef.current = updated;
      if (updated[0].hand.length === 0) {
        setTimeout(() => endRound(updated), 600);
      } else {
        setTimeout(() => {
          setCurrentTrick([]);
          setLeadSuit(null);
          setCurrentPlayer(winnerIdx);
          setIsProcessing(false);
          setDebug(`${updated[winnerIdx].name} +${points}pts`);
          startGameTimer();
          if (winnerIdx === 0) startTurnTimer();
        }, 800);
      }
      return updated;
    });
  }, [stopGameTimer, stopTurnTimer, startGameTimer, startTurnTimer]);

  const playCardInternal = useCallback((card, playerIndex) => {
    if (isProcessingRef.current) return;
    setIsProcessing(true);
    stopTurnTimer();
    playedCardsRef.current.add(`${card.suit}-${card.value}-${card.rank}`);
    if (card.suit === '♠' && !spadesBrokenRef.current) {
      setSpadesBroken(true);
      spadesBrokenRef.current = true;
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      SoundService.spadesBroken();
    } else if (playerIndex === 0) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      SoundService.cardPlay();
    }
    setPlayers(prev => {
      const updated = prev.map((p, i) =>
        i === playerIndex ? { ...p, hand: p.hand.filter(c => c.id !== card.id) } : p
      );
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
        currentPlayerRef.current = next;
        setIsProcessing(false);
        if (next === 0) startTurnTimer();
      }
      return newTrick;
    });
  }, [stopTurnTimer, evaluateTrick, startTurnTimer]);

  const playCard = useCallback((card, playerIndex) => {
    if (isPausedRef.current) return;
    if (playerIndex !== currentPlayerRef.current || gamePhaseRef.current !== 'playing' || isProcessingRef.current) return;
    if (!isValidPlayCheck(card, playerIndex)) return;
    stopTurnTimer();
    playCardInternal(card, playerIndex);
  }, [isValidPlayCheck, stopTurnTimer, playCardInternal]);

  const endRound = useCallback((roundPlayers) => {
    setScoreHistory(prev => [
      { round: roundNumberRef.current, scores: roundPlayers.map(p => ({ name: p.name, score: p.score, tricks: p.tricks })) },
      ...prev,
    ].slice(0, 10));
    setRoundNumber(r => { roundNumberRef.current = r + 1; return r + 1; });

    (async () => {
      try {
        const raw  = await AsyncStorage.getItem('gameStats');
        const prev = raw ? JSON.parse(raw) : { gamesPlayed: 0, wins: 0, losses: 0, totalTricks: 0, totalBags: 0, highestScore: 0, totalScore: 0, currentStreak: 0, longestStreak: 0 };
        const me = roundPlayers[0];
        const didWin = [...roundPlayers].sort((a, b) => b.score - a.score)[0]?.id === 0;
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
    })();

    // Autosave scores after each round
    setTimeout(() => triggerAutosave(), 0);

    if (gameTimeRef.current <= 0) {
      clearArcadeGame();
      setGamePhase('gameOver');
      const sorted = [...roundPlayers].sort((a, b) => b.score - a.score);
      const didWin = sorted[0]?.id === 0;
      if (didWin) { Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success); SoundService.gameWin(); }
      else        { Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);   SoundService.gameLose(); }
      Alert.alert('⏰ FINAL SCORE', `${sorted[0]?.name} wins — ${sorted[0]?.score} pts!`);
      return;
    }

    const carry = roundPlayers.map(p => ({ ...p, tricks: 0 }));
    setTimeout(() => startNewRound(carry), 1200);
  }, [startNewRound, triggerAutosave]);

  useEffect(() => {
    if (isPaused || gamePhase !== 'playing' || currentPlayer === 0 || isProcessing) return;
    if (botTimerRef.current) clearTimeout(botTimerRef.current);
    botTimerRef.current = setTimeout(() => {
      const player = playersRef.current[currentPlayer];
      if (!player?.hand?.length) return;
      const card = selectBotPlay(player.hand, currentTrickRef.current, leadSuitRef.current, spadesBrokenRef.current, player.difficulty, playedCardsRef.current);
      if (card) playCardInternal(card, currentPlayer);
    }, 700);
    return () => clearTimeout(botTimerRef.current);
  }, [isPaused, currentPlayer, gamePhase, isProcessing, playCardInternal]);

  const resetGame = useCallback(() => {
    clearArcadeGame();
    stopGameTimer();
    stopTurnTimer();
    setGameTimeLeft(GAME_DURATION);
    setRoundNumber(1);
    roundNumberRef.current = 1;
    setScoreHistory([]);
    startNewRound();
    startGameTimer();
  }, [stopGameTimer, stopTurnTimer, startNewRound, startGameTimer]);

  return {
    players, currentPlayer, currentTrick, gamePhase, spadesBroken,
    isProcessing, debug, roundNumber, scoreHistory,
    gameTimeLeft, turnTimeLeft, blindNilAvailable, isBlindNil, setIsBlindNil,
    isPaused, playCard, resetGame, pauseGame, resumeGame,
  };
};

export default useArcadeState;
