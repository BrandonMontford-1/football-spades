// hooks/useSeasonState.js
// Season Mode engine — with team validation guard

import { useState, useCallback, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  buildSchedule,
  simulateWeekStandings,
  getCoachForTeam,
  ALL_TEAM_IDS,
} from '../constants/seasonSchedule';
import { NFL_TEAMS } from '../constants/rosters';

const TOTAL_WEEKS   = 8;
const PLAYOFF_SPOTS = 4;
const FALLBACK_TEAM = 'kc';

const initStandings = () => {
  const s = {};
  ALL_TEAM_IDS.forEach(id => { s[id] = { wins: 0, losses: 0 }; });
  return s;
};

const getTeamInfo = (teamId) =>
  NFL_TEAMS.find(t => t.id === teamId) || { id: teamId, name: teamId.toUpperCase(), emoji: '🏈', shortName: teamId };

const sortedStandings = (standings) =>
  Object.entries(standings)
    .map(([id, record]) => ({ id, ...record, ...getTeamInfo(id) }))
    .sort((a, b) => b.wins - a.wins || a.id.localeCompare(b.id));

const saveSeasonStats = async (playerTeamId, wins, losses, madePlayoffs, wonChampionship) => {
  try {
    const raw  = await AsyncStorage.getItem('seasonStats');
    const prev = raw ? JSON.parse(raw) : {
      seasonsPlayed: 0, playoffAppearances: 0, championships: 0,
      bestRecord: { wins: 0, losses: 8 }, history: [],
    };
    await AsyncStorage.setItem('seasonStats', JSON.stringify({
      seasonsPlayed:      prev.seasonsPlayed + 1,
      playoffAppearances: prev.playoffAppearances + (madePlayoffs ? 1 : 0),
      championships:      prev.championships + (wonChampionship ? 1 : 0),
      bestRecord: wins > prev.bestRecord.wins ? { wins, losses } : prev.bestRecord,
      history: [{ teamId: playerTeamId, wins, losses, madePlayoffs, wonChampionship }, ...prev.history].slice(0, 10),
    }));
  } catch (_) {}
};

export const useSeasonState = (playerTeamId, winTarget = 70) => {
  // ── Guard: crash-proof team validation ───────────────────────────────────
  const safeTeamId  = (playerTeamId && ALL_TEAM_IDS.includes(playerTeamId)) ? playerTeamId : FALLBACK_TEAM;
  const hasTeamError = !playerTeamId || !ALL_TEAM_IDS.includes(playerTeamId);

  const [schedule,       setSchedule]       = useState([]);
  const [currentWeek,    setCurrentWeek]    = useState(1);
  const [standings,      setStandings]      = useState(initStandings);
  const [seasonPhase,    setSeasonPhase]    = useState('schedule');
  const [playoffTeams,   setPlayoffTeams]   = useState([]);
  const [playoffBracket, setPlayoffBracket] = useState(null);
  const [playoffRound,   setPlayoffRound]   = useState('semi');
  const [currentGame,    setCurrentGame]    = useState(null);
  const [weekResult,     setWeekResult]     = useState(null);

  useEffect(() => { setSchedule(buildSchedule(safeTeamId)); }, [safeTeamId]);

  const startWeekGame = useCallback(() => {
    const week = schedule[currentWeek - 1];
    if (!week) return;
    setCurrentGame(week);
    setSeasonPhase('playing');
  }, [schedule, currentWeek]);

  const recordGameResult = useCallback((playerWon) => {
    setWeekResult(playerWon ? 'win' : 'loss');
    setStandings(prev => {
      const next = { ...prev };
      next[safeTeamId] = {
        wins:   prev[safeTeamId].wins   + (playerWon ? 1 : 0),
        losses: prev[safeTeamId].losses + (playerWon ? 0 : 1),
      };
      const sim = simulateWeekStandings(ALL_TEAM_IDS, safeTeamId, playerWon);
      Object.entries(sim).forEach(([id, r]) => {
        next[id] = { wins: next[id].wins + (r === 'W' ? 1 : 0), losses: next[id].losses + (r === 'L' ? 1 : 0) };
      });
      return next;
    });
    setSeasonPhase('schedule');
  }, [safeTeamId]);

  const advanceWeek = useCallback(() => {
    if (currentWeek >= TOTAL_WEEKS) {
      setStandings(prev => {
        const top4 = sortedStandings(prev).slice(0, PLAYOFF_SPOTS).map(t => t.id);
        setPlayoffTeams(top4);
        if (top4.includes(safeTeamId)) {
          setPlayoffBracket({ semi1: { home: top4[0], away: top4[3] }, semi2: { home: top4[1], away: top4[2] }, final: null, winner: null });
          setPlayoffRound('semi');
          setSeasonPhase('playoff');
        } else {
          saveSeasonStats(safeTeamId, prev[safeTeamId].wins, prev[safeTeamId].losses, false, false);
          setSeasonPhase('eliminated');
        }
        return prev;
      });
    } else {
      setCurrentWeek(w => w + 1);
      setWeekResult(null);
      setSeasonPhase('schedule');
    }
  }, [currentWeek, safeTeamId]);

  const startPlayoffGame = useCallback(() => {
    if (!playoffBracket) return;
    const matchup = playoffRound === 'semi'
      ? (playoffBracket.semi1.home === safeTeamId || playoffBracket.semi1.away === safeTeamId ? playoffBracket.semi1 : playoffBracket.semi2)
      : playoffBracket.final;
    const opponentId = matchup.home === safeTeamId ? matchup.away : matchup.home;
    setCurrentGame({
      week:      playoffRound === 'semi' ? 'Semi-Final' : 'Championship',
      label:     playoffRound === 'semi' ? '🏆 Playoffs - Semi-Final' : '🏆 Championship Game',
      opponents: [opponentId],
      isPlayoff: true,
    });
    setSeasonPhase('playing');
  }, [playoffBracket, playoffRound, safeTeamId]);

  const recordPlayoffResult = useCallback((playerWon) => {
    if (!playerWon) {
      setStandings(prev => {
        saveSeasonStats(safeTeamId, prev[safeTeamId].wins, prev[safeTeamId].losses, true, false);
        return prev;
      });
      setSeasonPhase('eliminated');
      return;
    }
    if (playoffRound === 'semi') {
      setPlayoffBracket(prev => {
        const inSemi1   = prev.semi1.home === safeTeamId || prev.semi1.away === safeTeamId;
        const other     = inSemi1 ? prev.semi2 : prev.semi1;
        const otherWin  = Math.random() < 0.55 ? other.home : other.away;
        return { ...prev, final: { home: inSemi1 ? safeTeamId : otherWin, away: inSemi1 ? otherWin : safeTeamId } };
      });
      setPlayoffRound('final');
      setSeasonPhase('playoff');
    } else {
      setStandings(prev => {
        saveSeasonStats(safeTeamId, prev[safeTeamId].wins, prev[safeTeamId].losses, true, true);
        return prev;
      });
      setPlayoffBracket(prev => ({ ...prev, winner: safeTeamId }));
      setSeasonPhase('champion');
    }
  }, [playoffRound, safeTeamId]);

  return {
    schedule, currentWeek, leaderboard: sortedStandings(standings),
    playerRecord: standings[safeTeamId] || { wins: 0, losses: 0 },
    seasonPhase, playoffTeams, playoffBracket, playoffRound,
    currentGame, weekResult,
    isLastWeek: currentWeek === TOTAL_WEEKS,
    currentScheduleWeek: schedule[currentWeek - 1],
    hasTeamError, safeTeamId,
    startWeekGame, recordGameResult, advanceWeek,
    startPlayoffGame, recordPlayoffResult,
  };
};

export default useSeasonState;
