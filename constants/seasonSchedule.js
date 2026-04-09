// constants/seasonSchedule.js
// 8-week NFL season schedule for Football Spades Season Mode
// Each week = 1 division, 3 opponents from that division
// Your own division is skipped — you play 7 other divisions + 1 wild card week

import { COACHES } from './coaches';

export const DIVISIONS = {
  AFC_EAST:  { name: 'AFC East',  teams: ['buf', 'mia', 'ne',  'nyj'] },
  AFC_NORTH: { name: 'AFC North', teams: ['bal', 'cin', 'cle', 'pit'] },
  AFC_SOUTH: { name: 'AFC South', teams: ['hou', 'ind', 'jac', 'ten'] },
  AFC_WEST:  { name: 'AFC West',  teams: ['den', 'kc',  'lv',  'lac'] },
  NFC_EAST:  { name: 'NFC East',  teams: ['dal', 'nyg', 'phi', 'was'] },
  NFC_NORTH: { name: 'NFC North', teams: ['chi', 'det', 'gb',  'min'] },
  NFC_SOUTH: { name: 'NFC South', teams: ['atl', 'car', 'no',  'tb']  },
  NFC_WEST:  { name: 'NFC West',  teams: ['ari', 'lar', 'sf',  'sea'] },
};

// Find which division a team belongs to
export const getTeamDivision = (teamId) => {
  for (const [key, div] of Object.entries(DIVISIONS)) {
    if (div.teams.includes(teamId)) return key;
  }
  return null;
};

// Build 8-week schedule excluding player's own division
// Week 8 = wild card (one team from each remaining division)
export const buildSchedule = (playerTeamId) => {
  const playerDiv = getTeamDivision(playerTeamId);
  const otherDivisions = Object.entries(DIVISIONS).filter(([key]) => key !== playerDiv);

  // Shuffle divisions for variety each season
  for (let i = otherDivisions.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [otherDivisions[i], otherDivisions[j]] = [otherDivisions[j], otherDivisions[i]];
  }

  const schedule = [];

  // Weeks 1-7: one division each week, 3 opponents (exclude player's own team)
  for (let w = 0; w < 7; w++) {
    const [divKey, div] = otherDivisions[w];
    const opponents = div.teams.filter(t => t !== playerTeamId);
    // Pick 3 (all 4 teams in division, none are player's team)
    const picks = opponents.slice(0, 3);
    schedule.push({
      week: w + 1,
      label: div.name,
      opponents: picks,
    });
  }

  // Week 8: Wild Card — one team from each of the first 4 remaining divisions
  const wildCardTeams = otherDivisions.slice(0, 4).map(([, div]) => {
    const available = div.teams.filter(t => t !== playerTeamId);
    return available[Math.floor(Math.random() * available.length)];
  }).filter(Boolean).slice(0, 3);

  schedule.push({
    week: 8,
    label: 'Wild Card Week',
    opponents: wildCardTeams,
  });

  return schedule;
};

// Get coach for a team
export const getCoachForTeam = (teamId) => {
  return COACHES.find(c => c.team === teamId) || { name: 'Coach', team: teamId, difficulty: 'medium' };
};

// Simulate W/L for all 32 teams for a given week (excluding player's game)
// Returns { teamId: { wins, losses } } delta for this week
export const simulateWeekStandings = (allTeamIds, playerTeamId, playerWon) => {
  const results = {};
  allTeamIds.forEach(id => {
    if (id === playerTeamId) return; // player's result handled separately
    // Random win/loss weighted by difficulty
    const coach = getCoachForTeam(id);
    const winChance = coach.difficulty === 'expert' ? 0.65
      : coach.difficulty === 'medium' ? 0.50
      : 0.38;
    results[id] = Math.random() < winChance ? 'W' : 'L';
  });
  return results;
};

// All 32 team IDs
export const ALL_TEAM_IDS = Object.values(DIVISIONS).flatMap(d => d.teams);
