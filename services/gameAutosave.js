// services/gameAutosave.js
// Saves and restores mid-round game state to AsyncStorage
// Classic: saves after every trick (full round state)
// Arcade: saves per round (scores + time remaining)

import AsyncStorage from '@react-native-async-storage/async-storage';

const KEYS = {
  CLASSIC: 'autosave_classic',
  ARCADE:  'autosave_arcade',
  SEASON:  'autosave_season',
};

// ── Classic autosave ──────────────────────────────────────────────────────────
export const saveClassicGame = async (state) => {
  try {
    const data = {
      savedAt:      Date.now(),
      players:      state.players.map(p => ({
        ...p,
        hand: p.hand, // full hand — cards are plain objects, safe to serialize
      })),
      currentPlayer: state.currentPlayer,
      currentTrick:  state.currentTrick,
      leadSuit:      state.leadSuit,
      spadesBroken:  state.spadesBroken,
      gamePhase:     state.gamePhase,
      roundNumber:   state.roundNumber,
      scoreHistory:  state.scoreHistory,
      cardType:      state.cardType,
      selectedTeam:  state.selectedTeam,
      winTarget:     state.winTarget,
    };
    await AsyncStorage.setItem(KEYS.CLASSIC, JSON.stringify(data));
  } catch (_) {}
};

export const loadClassicGame = async () => {
  try {
    const raw = await AsyncStorage.getItem(KEYS.CLASSIC);
    if (!raw) return null;
    const data = JSON.parse(raw);
    // Expire saves older than 24 hours
    if (Date.now() - data.savedAt > 24 * 60 * 60 * 1000) {
      await clearClassicGame();
      return null;
    }
    return data;
  } catch (_) { return null; }
};

export const clearClassicGame = async () => {
  try { await AsyncStorage.removeItem(KEYS.CLASSIC); } catch (_) {}
};

// ── Arcade autosave ───────────────────────────────────────────────────────────
export const saveArcadeGame = async (state) => {
  try {
    const data = {
      savedAt:      Date.now(),
      players:      state.players,
      currentPlayer: state.currentPlayer,
      currentTrick:  state.currentTrick,
      leadSuit:      state.leadSuit,
      spadesBroken:  state.spadesBroken,
      roundNumber:   state.roundNumber,
      scoreHistory:  state.scoreHistory,
      gameTimeLeft:  state.gameTimeLeft,  // ← exact second saved
      cardType:      state.cardType,
      selectedTeam:  state.selectedTeam,
    };
    await AsyncStorage.setItem(KEYS.ARCADE, JSON.stringify(data));
  } catch (_) {}
};

export const loadArcadeGame = async () => {
  try {
    const raw = await AsyncStorage.getItem(KEYS.ARCADE);
    if (!raw) return null;
    const data = JSON.parse(raw);
    // Expire saves older than 4 hours (arcade is short-session)
    if (Date.now() - data.savedAt > 4 * 60 * 60 * 1000) {
      await clearArcadeGame();
      return null;
    }
    return data;
  } catch (_) { return null; }
};

export const clearArcadeGame = async () => {
  try { await AsyncStorage.removeItem(KEYS.ARCADE); } catch (_) {}
};

// ── Season autosave ───────────────────────────────────────────────────────────
export const saveSeasonGame = async (state) => {
  try {
    const data = {
      savedAt:       Date.now(),
      currentWeek:   state.currentWeek,
      standings:     state.standings,
      seasonPhase:   state.seasonPhase,
      playoffTeams:  state.playoffTeams,
      playoffBracket: state.playoffBracket,
      playoffRound:  state.playoffRound,
      weekResult:    state.weekResult,
      playerTeamId:  state.playerTeamId,
      schedule:      state.schedule,
    };
    await AsyncStorage.setItem(KEYS.SEASON, JSON.stringify(data));
  } catch (_) {}
};

export const loadSeasonGame = async () => {
  try {
    const raw = await AsyncStorage.getItem(KEYS.SEASON);
    if (!raw) return null;
    const data = JSON.parse(raw);
    // Season saves never expire — a season can last days
    return data;
  } catch (_) { return null; }
};

export const clearSeasonGame = async () => {
  try { await AsyncStorage.removeItem(KEYS.SEASON); } catch (_) {}
};

// ── Check if any save exists ──────────────────────────────────────────────────
export const checkForSavedGame = async () => {
  try {
    const [classic, arcade, season] = await Promise.all([
      AsyncStorage.getItem(KEYS.CLASSIC),
      AsyncStorage.getItem(KEYS.ARCADE),
      AsyncStorage.getItem(KEYS.SEASON),
    ]);
    return {
      hasClassic: !!classic,
      hasArcade:  !!arcade,
      hasSeason:  !!season,
      classic:    classic ? JSON.parse(classic) : null,
      arcade:     arcade  ? JSON.parse(arcade)  : null,
      season:     season  ? JSON.parse(season)  : null,
    };
  } catch (_) {
    return { hasClassic: false, hasArcade: false, hasSeason: false };
  }
};
