// constants/cardTypes.js
// COMPLETE: 5 card types with position mapping

export const CARD_TYPES = {
  ALL_STARS: {
    id: 'all_stars',
    name: '🏈 NFL All-Stars',
    description: 'Current stars + Hall of Fame legends',
    icon: '⭐',
    default: true,
    suitMapping: {
      '♠': { position: 'QB', description: 'Quarterbacks' },
      '♥': { position: 'RB', description: 'Running Backs' },
      '♦': { position: 'WR', description: 'Wide Receivers' },
      '♣': { position: 'DEF', description: 'Defensive Players' }
    }
  },
  TEAM_ROSTER: {
    id: 'team_roster',
    name: '🏆 Team Rosters',
    description: 'Complete 52-man roster of your favorite NFL team',
    icon: '🏆',
    requiresTeam: true,
    suitMapping: {
      '♠': { position: 'QB/WR', description: 'Skill Positions' },
      '♥': { position: 'RB/TE', description: 'Ball Carriers' },
      '♦': { position: 'OL', description: 'Offensive Line' },
      '♣': { position: 'DEF/ST', description: 'Defense & Special Teams' }
    }
  },
  DEFENSE_ONLY: {
    id: 'defense_only',
    name: '🛡️ Defense Only',
    description: 'Only defensive players - 52 defenders',
    icon: '🛡️',
    suitMapping: {
      '♠': { position: 'DL', description: 'Defensive Line' },
      '♥': { position: 'LB', description: 'Linebackers' },
      '♦': { position: 'CB', description: 'Cornerbacks' },
      '♣': { position: 'S', description: 'Safeties' }
    }
  },
  OFFENSE_ONLY: {
    id: 'offense_only',
    name: '⚡ Offense Only',
    description: 'Only offensive players - 52 offensive stars',
    icon: '⚡',
    suitMapping: {
      '♠': { position: 'QB', description: 'Quarterbacks' },
      '♥': { position: 'RB', description: 'Running Backs' },
      '♦': { position: 'WR', description: 'Wide Receivers' },
      '♣': { position: 'TE/OL', description: 'Tight Ends & Linemen' }
    }
  },
  LEGENDS_ONLY: {
    id: 'legends_only',
    name: '🏅 Legends Only',
    description: 'Hall of Fame legends only - 52 immortals',
    icon: '🏅',
    suitMapping: {
      '♠': { position: 'QB Legend', description: 'Hall of Fame QBs' },
      '♥': { position: 'RB Legend', description: 'Hall of Fame RBs' },
      '♦': { position: 'WR Legend', description: 'Hall of Fame WRs' },
      '♣': { position: 'DEF Legend', description: 'Hall of Fame Defense' }
    }
  }
};

export const getCardTypeById = (id) => {
  return Object.values(CARD_TYPES).find(type => type.id === id) || CARD_TYPES.ALL_STARS;
};

export default CARD_TYPES;
