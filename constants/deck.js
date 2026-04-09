// constants/deck.js
// Builds 52-card decks for all 5 card types
// FIX: Team rosters now repeat players across all 4 suits (each suit gets all 13 players)

import { CARD_TYPES } from './cardTypes';
import { getTeamRoster } from './rosters';

export const SUITS = ['♠', '♥', '♦', '♣'];
export const RANKS = ['A', 'K', 'Q', 'J', '10', '9', '8', '7', '6', '5', '4', '3', '2'];

export const RANK_VALUES = {
  'A': 14, 'K': 13, 'Q': 12, 'J': 11, '10': 10, '9': 9, '8': 8,
  '7': 7, '6': 6, '5': 5, '4': 4, '3': 3, '2': 2
};

// ── All-Stars ─────────────────────────────────────────────────────────────────
const ALL_STARS_DECK = {
  '♠': {
    'A': { name: 'Patrick Mahomes', position: 'QB', era: 'Current' },
    'K': { name: 'Joe Montana', position: 'QB', era: 'Legend' },
    'Q': { name: 'Tom Brady', position: 'QB', era: 'Legend' },
    'J': { name: 'Peyton Manning', position: 'QB', era: 'Legend' },
    '10': { name: 'Josh Allen', position: 'QB', era: 'Current' },
    '9': { name: 'Lamar Jackson', position: 'QB', era: 'Current' },
    '8': { name: 'Joe Burrow', position: 'QB', era: 'Current' },
    '7': { name: 'Justin Herbert', position: 'QB', era: 'Current' },
    '6': { name: 'C.J. Stroud', position: 'QB', era: 'Current' },
    '5': { name: 'Dak Prescott', position: 'QB', era: 'Current' },
    '4': { name: 'Jalen Hurts', position: 'QB', era: 'Current' },
    '3': { name: 'Brock Purdy', position: 'QB', era: 'Current' },
    '2': { name: 'Tua Tagovailoa', position: 'QB', era: 'Current' }
  },
  '♥': {
    'A': { name: 'Christian McCaffrey', position: 'RB', era: 'Current' },
    'K': { name: 'Walter Payton', position: 'RB', era: 'Legend' },
    'Q': { name: 'Barry Sanders', position: 'RB', era: 'Legend' },
    'J': { name: 'Jim Brown', position: 'RB', era: 'Legend' },
    '10': { name: 'Derrick Henry', position: 'RB', era: 'Current' },
    '9': { name: 'Saquon Barkley', position: 'RB', era: 'Current' },
    '8': { name: 'Bijan Robinson', position: 'RB', era: 'Current' },
    '7': { name: 'Nick Chubb', position: 'RB', era: 'Current' },
    '6': { name: 'Jonathan Taylor', position: 'RB', era: 'Current' },
    '5': { name: 'Josh Jacobs', position: 'RB', era: 'Current' },
    '4': { name: 'Travis Kelce', position: 'TE', era: 'Current' },
    '3': { name: 'George Kittle', position: 'TE', era: 'Current' },
    '2': { name: 'Mark Andrews', position: 'TE', era: 'Current' }
  },
  '♦': {
    'A': { name: 'Jerry Rice', position: 'WR', era: 'Legend' },
    'K': { name: 'Randy Moss', position: 'WR', era: 'Legend' },
    'Q': { name: 'Terrell Owens', position: 'WR', era: 'Legend' },
    'J': { name: 'Justin Jefferson', position: 'WR', era: 'Current' },
    '10': { name: 'Tyreek Hill', position: 'WR', era: 'Current' },
    '9': { name: "Ja'Marr Chase", position: 'WR', era: 'Current' },
    '8': { name: 'CeeDee Lamb', position: 'WR', era: 'Current' },
    '7': { name: 'A.J. Brown', position: 'WR', era: 'Current' },
    '6': { name: 'Davante Adams', position: 'WR', era: 'Current' },
    '5': { name: 'Stefon Diggs', position: 'WR', era: 'Current' },
    '4': { name: 'Amon-Ra St. Brown', position: 'WR', era: 'Current' },
    '3': { name: 'Puka Nacua', position: 'WR', era: 'Current' },
    '2': { name: 'Deebo Samuel', position: 'WR', era: 'Current' }
  },
  '♣': {
    'A': { name: 'Lawrence Taylor', position: 'LB', era: 'Legend' },
    'K': { name: 'Reggie White', position: 'DE', era: 'Legend' },
    'Q': { name: 'Ray Lewis', position: 'LB', era: 'Legend' },
    'J': { name: 'Dick Butkus', position: 'LB', era: 'Legend' },
    '10': { name: 'Aaron Donald', position: 'DT', era: 'Legend' },
    '9': { name: 'T.J. Watt', position: 'LB', era: 'Current' },
    '8': { name: 'Nick Bosa', position: 'DE', era: 'Current' },
    '7': { name: 'Myles Garrett', position: 'DE', era: 'Current' },
    '6': { name: 'Micah Parsons', position: 'LB', era: 'Current' },
    '5': { name: 'Fred Warner', position: 'LB', era: 'Current' },
    '4': { name: 'Deion Sanders', position: 'CB', era: 'Legend' },
    '3': { name: 'Ronnie Lott', position: 'S', era: 'Legend' },
    '2': { name: 'Ed Reed', position: 'S', era: 'Legend' }
  }
};

// ── Defense Only ──────────────────────────────────────────────────────────────
const DEFENSE_ONLY_DECK = {
  '♠': {
    'A': { name: 'Reggie White', position: 'DE', era: 'Legend' },
    'K': { name: 'Bruce Smith', position: 'DE', era: 'Legend' },
    'Q': { name: 'Deacon Jones', position: 'DE', era: 'Legend' },
    'J': { name: 'Myles Garrett', position: 'DE', era: 'Current' },
    '10': { name: 'Nick Bosa', position: 'DE', era: 'Current' },
    '9': { name: 'T.J. Watt', position: 'OLB', era: 'Current' },
    '8': { name: 'Micah Parsons', position: 'DE', era: 'Current' },
    '7': { name: 'Maxx Crosby', position: 'DE', era: 'Current' },
    '6': { name: 'Danielle Hunter', position: 'DE', era: 'Current' },
    '5': { name: 'Josh Allen', position: 'DE', era: 'Current' },
    '4': { name: 'Brian Burns', position: 'DE', era: 'Current' },
    '3': { name: 'Haason Reddick', position: 'DE', era: 'Current' },
    '2': { name: 'Khalil Mack', position: 'DE', era: 'Current' }
  },
  '♥': {
    'A': { name: 'Lawrence Taylor', position: 'LB', era: 'Legend' },
    'K': { name: 'Ray Lewis', position: 'LB', era: 'Legend' },
    'Q': { name: 'Dick Butkus', position: 'LB', era: 'Legend' },
    'J': { name: 'Mike Singletary', position: 'LB', era: 'Legend' },
    '10': { name: 'Fred Warner', position: 'LB', era: 'Current' },
    '9': { name: 'Roquan Smith', position: 'LB', era: 'Current' },
    '8': { name: 'Bobby Wagner', position: 'LB', era: 'Current' },
    '7': { name: 'Demario Davis', position: 'LB', era: 'Current' },
    '6': { name: 'C.J. Mosley', position: 'LB', era: 'Current' },
    '5': { name: 'Patrick Queen', position: 'LB', era: 'Current' },
    '4': { name: 'Zaire Franklin', position: 'LB', era: 'Current' },
    '3': { name: 'Foyesade Oluokun', position: 'LB', era: 'Current' },
    '2': { name: 'Matt Milano', position: 'LB', era: 'Current' }
  },
  '♦': {
    'A': { name: 'Deion Sanders', position: 'CB', era: 'Legend' },
    'K': { name: 'Rod Woodson', position: 'CB', era: 'Legend' },
    'Q': { name: 'Darrelle Revis', position: 'CB', era: 'Legend' },
    'J': { name: 'Patrick Surtain II', position: 'CB', era: 'Current' },
    '10': { name: 'Sauce Gardner', position: 'CB', era: 'Current' },
    '9': { name: 'Jaire Alexander', position: 'CB', era: 'Current' },
    '8': { name: 'Trevon Diggs', position: 'CB', era: 'Current' },
    '7': { name: 'Jalen Ramsey', position: 'CB', era: 'Current' },
    '6': { name: 'Marshon Lattimore', position: 'CB', era: 'Current' },
    '5': { name: 'Denzel Ward', position: 'CB', era: 'Current' },
    '4': { name: 'A.J. Terrell', position: 'CB', era: 'Current' },
    '3': { name: 'Charvarius Ward', position: 'CB', era: 'Current' },
    '2': { name: 'Jaycee Horn', position: 'CB', era: 'Current' }
  },
  '♣': {
    'A': { name: 'Ronnie Lott', position: 'S', era: 'Legend' },
    'K': { name: 'Ed Reed', position: 'S', era: 'Legend' },
    'Q': { name: 'Troy Polamalu', position: 'S', era: 'Legend' },
    'J': { name: 'Brian Dawkins', position: 'S', era: 'Legend' },
    '10': { name: 'Minkah Fitzpatrick', position: 'S', era: 'Current' },
    '9': { name: 'Derwin James', position: 'S', era: 'Current' },
    '8': { name: 'Jessie Bates III', position: 'S', era: 'Current' },
    '7': { name: 'Justin Simmons', position: 'S', era: 'Current' },
    '6': { name: 'Kevin Byard', position: 'S', era: 'Current' },
    '5': { name: 'Budda Baker', position: 'S', era: 'Current' },
    '4': { name: 'Tyrann Mathieu', position: 'S', era: 'Current' },
    '3': { name: 'Talanoa Hufanga', position: 'S', era: 'Current' },
    '2': { name: 'Jevon Holland', position: 'S', era: 'Current' }
  }
};

// ── Offense Only ──────────────────────────────────────────────────────────────
const OFFENSE_ONLY_DECK = {
  '♠': {
    'A': { name: 'Patrick Mahomes', position: 'QB', era: 'Current' },
    'K': { name: 'Joe Montana', position: 'QB', era: 'Legend' },
    'Q': { name: 'Tom Brady', position: 'QB', era: 'Legend' },
    'J': { name: 'Peyton Manning', position: 'QB', era: 'Legend' },
    '10': { name: 'Josh Allen', position: 'QB', era: 'Current' },
    '9': { name: 'Lamar Jackson', position: 'QB', era: 'Current' },
    '8': { name: 'Joe Burrow', position: 'QB', era: 'Current' },
    '7': { name: 'Justin Herbert', position: 'QB', era: 'Current' },
    '6': { name: 'C.J. Stroud', position: 'QB', era: 'Current' },
    '5': { name: 'Dak Prescott', position: 'QB', era: 'Current' },
    '4': { name: 'Jalen Hurts', position: 'QB', era: 'Current' },
    '3': { name: 'Brock Purdy', position: 'QB', era: 'Current' },
    '2': { name: 'Tua Tagovailoa', position: 'QB', era: 'Current' }
  },
  '♥': {
    'A': { name: 'Christian McCaffrey', position: 'RB', era: 'Current' },
    'K': { name: 'Walter Payton', position: 'RB', era: 'Legend' },
    'Q': { name: 'Barry Sanders', position: 'RB', era: 'Legend' },
    'J': { name: 'Jim Brown', position: 'RB', era: 'Legend' },
    '10': { name: 'Derrick Henry', position: 'RB', era: 'Current' },
    '9': { name: 'Saquon Barkley', position: 'RB', era: 'Current' },
    '8': { name: 'Bijan Robinson', position: 'RB', era: 'Current' },
    '7': { name: 'Nick Chubb', position: 'RB', era: 'Current' },
    '6': { name: 'Jonathan Taylor', position: 'RB', era: 'Current' },
    '5': { name: 'Josh Jacobs', position: 'RB', era: 'Current' },
    '4': { name: 'Isiah Pacheco', position: 'RB', era: 'Current' },
    '3': { name: 'Jahmyr Gibbs', position: 'RB', era: 'Current' },
    '2': { name: 'Tony Pollard', position: 'RB', era: 'Current' }
  },
  '♦': {
    'A': { name: 'Jerry Rice', position: 'WR', era: 'Legend' },
    'K': { name: 'Randy Moss', position: 'WR', era: 'Legend' },
    'Q': { name: 'Terrell Owens', position: 'WR', era: 'Legend' },
    'J': { name: 'Justin Jefferson', position: 'WR', era: 'Current' },
    '10': { name: 'Tyreek Hill', position: 'WR', era: 'Current' },
    '9': { name: "Ja'Marr Chase", position: 'WR', era: 'Current' },
    '8': { name: 'CeeDee Lamb', position: 'WR', era: 'Current' },
    '7': { name: 'A.J. Brown', position: 'WR', era: 'Current' },
    '6': { name: 'Davante Adams', position: 'WR', era: 'Current' },
    '5': { name: 'Stefon Diggs', position: 'WR', era: 'Current' },
    '4': { name: 'Amon-Ra St. Brown', position: 'WR', era: 'Current' },
    '3': { name: 'Puka Nacua', position: 'WR', era: 'Current' },
    '2': { name: 'Deebo Samuel', position: 'WR', era: 'Current' }
  },
  '♣': {
    'A': { name: 'Travis Kelce', position: 'TE', era: 'Current' },
    'K': { name: 'Tony Gonzalez', position: 'TE', era: 'Legend' },
    'Q': { name: 'Rob Gronkowski', position: 'TE', era: 'Legend' },
    'J': { name: 'George Kittle', position: 'TE', era: 'Current' },
    '10': { name: 'Mark Andrews', position: 'TE', era: 'Current' },
    '9': { name: 'T.J. Hockenson', position: 'TE', era: 'Current' },
    '8': { name: 'Kyle Pitts', position: 'TE', era: 'Current' },
    '7': { name: 'Dalton Kincaid', position: 'TE', era: 'Current' },
    '6': { name: 'Sam LaPorta', position: 'TE', era: 'Current' },
    '5': { name: 'Trent Williams', position: 'T', era: 'Current' },
    '4': { name: 'Zack Martin', position: 'G', era: 'Current' },
    '3': { name: 'Creed Humphrey', position: 'C', era: 'Current' },
    '2': { name: 'Jason Kelce', position: 'C', era: 'Legend' }
  }
};

// ── Legends Only ──────────────────────────────────────────────────────────────
const LEGENDS_ONLY_DECK = {
  '♠': {
    'A': { name: 'Joe Montana', position: 'QB', era: 'Legend' },
    'K': { name: 'John Elway', position: 'QB', era: 'Legend' },
    'Q': { name: 'Dan Marino', position: 'QB', era: 'Legend' },
    'J': { name: 'Steve Young', position: 'QB', era: 'Legend' },
    '10': { name: 'Brett Favre', position: 'QB', era: 'Legend' },
    '9': { name: 'Terry Bradshaw', position: 'QB', era: 'Legend' },
    '8': { name: 'Roger Staubach', position: 'QB', era: 'Legend' },
    '7': { name: 'Fran Tarkenton', position: 'QB', era: 'Legend' },
    '6': { name: 'Otto Graham', position: 'QB', era: 'Legend' },
    '5': { name: 'Johnny Unitas', position: 'QB', era: 'Legend' },
    '4': { name: 'Bart Starr', position: 'QB', era: 'Legend' },
    '3': { name: 'Warren Moon', position: 'QB', era: 'Legend' },
    '2': { name: 'Jim Kelly', position: 'QB', era: 'Legend' }
  },
  '♥': {
    'A': { name: 'Walter Payton', position: 'RB', era: 'Legend' },
    'K': { name: 'Barry Sanders', position: 'RB', era: 'Legend' },
    'Q': { name: 'Jim Brown', position: 'RB', era: 'Legend' },
    'J': { name: 'Emmitt Smith', position: 'RB', era: 'Legend' },
    '10': { name: 'Gale Sayers', position: 'RB', era: 'Legend' },
    '9': { name: 'Eric Dickerson', position: 'RB', era: 'Legend' },
    '8': { name: 'LaDainian Tomlinson', position: 'RB', era: 'Legend' },
    '7': { name: 'Marshall Faulk', position: 'RB', era: 'Legend' },
    '6': { name: 'Jerome Bettis', position: 'RB', era: 'Legend' },
    '5': { name: 'Curtis Martin', position: 'RB', era: 'Legend' },
    '4': { name: 'Tony Dorsett', position: 'RB', era: 'Legend' },
    '3': { name: 'Franco Harris', position: 'RB', era: 'Legend' },
    '2': { name: 'Earl Campbell', position: 'RB', era: 'Legend' }
  },
  '♦': {
    'A': { name: 'Jerry Rice', position: 'WR', era: 'Legend' },
    'K': { name: 'Randy Moss', position: 'WR', era: 'Legend' },
    'Q': { name: 'Terrell Owens', position: 'WR', era: 'Legend' },
    'J': { name: 'Marvin Harrison', position: 'WR', era: 'Legend' },
    '10': { name: 'Cris Carter', position: 'WR', era: 'Legend' },
    '9': { name: 'Steve Largent', position: 'WR', era: 'Legend' },
    '8': { name: 'Michael Irvin', position: 'WR', era: 'Legend' },
    '7': { name: 'Lynn Swann', position: 'WR', era: 'Legend' },
    '6': { name: 'John Stallworth', position: 'WR', era: 'Legend' },
    '5': { name: 'Paul Warfield', position: 'WR', era: 'Legend' },
    '4': { name: 'Andre Reed', position: 'WR', era: 'Legend' },
    '3': { name: 'Art Monk', position: 'WR', era: 'Legend' },
    '2': { name: 'James Lofton', position: 'WR', era: 'Legend' }
  },
  '♣': {
    'A': { name: 'Lawrence Taylor', position: 'LB', era: 'Legend' },
    'K': { name: 'Reggie White', position: 'DE', era: 'Legend' },
    'Q': { name: 'Ray Lewis', position: 'LB', era: 'Legend' },
    'J': { name: 'Dick Butkus', position: 'LB', era: 'Legend' },
    '10': { name: 'Jack Lambert', position: 'LB', era: 'Legend' },
    '9': { name: 'Mike Singletary', position: 'LB', era: 'Legend' },
    '8': { name: 'Deion Sanders', position: 'CB', era: 'Legend' },
    '7': { name: 'Ronnie Lott', position: 'S', era: 'Legend' },
    '6': { name: 'Rod Woodson', position: 'CB', era: 'Legend' },
    '5': { name: 'Ed Reed', position: 'S', era: 'Legend' },
    '4': { name: 'Troy Polamalu', position: 'S', era: 'Legend' },
    '3': { name: 'Bruce Smith', position: 'DE', era: 'Legend' },
    '2': { name: 'Joe Greene', position: 'DT', era: 'Legend' }
  }
};

// ── Team Roster → Suit Format ─────────────────────────────────────────────────
// FIX: Each suit gets ALL 13 team players (same roster, all suits).
// This means the same player can appear in multiple suits with different values,
// which is correct — you're playing with a team's players, not 52 unique people.
const convertTeamToSuitFormat = (simpleRoster) => {
  const result = {};
  for (const suit of SUITS) {
    result[suit] = {};
    for (const rank of RANKS) {
      const player = simpleRoster[rank];
      if (player) {
        result[suit][rank] = player;
      } else {
        result[suit][rank] = { name: `${rank}`, position: 'Player', era: 'Current' };
      }
    }
  }
  return result;
};

// ── Main deck factory ─────────────────────────────────────────────────────────
export const createFullDeck = (cardType = CARD_TYPES.ALL_STARS.id, teamId = null) => {
  let sourceDeck;

  if (cardType === CARD_TYPES.TEAM_ROSTER.id && teamId) {
    const teamRoster = getTeamRoster(teamId);
    if (teamRoster) {
      // If roster already has suit keys, use directly; otherwise convert
      const hasSuits = SUITS.some(s => teamRoster[s] !== undefined);
      sourceDeck = hasSuits ? teamRoster : convertTeamToSuitFormat(teamRoster);
    } else {
      sourceDeck = ALL_STARS_DECK;
    }
  } else if (cardType === CARD_TYPES.DEFENSE_ONLY.id) {
    sourceDeck = DEFENSE_ONLY_DECK;
  } else if (cardType === CARD_TYPES.OFFENSE_ONLY.id) {
    sourceDeck = OFFENSE_ONLY_DECK;
  } else if (cardType === CARD_TYPES.LEGENDS_ONLY.id) {
    sourceDeck = LEGENDS_ONLY_DECK;
  } else {
    sourceDeck = ALL_STARS_DECK;
  }

  const deck = [];
  let cardId = 0;

  for (const suit of SUITS) {
    const suitCards = sourceDeck[suit] || {};
    for (const rank of RANKS) {
      const cardData = suitCards[rank] || { name: `${rank}${suit}`, position: 'Player', era: 'Current' };
      deck.push({
        id: cardId++,
        suit,
        value: rank,
        rank: RANK_VALUES[rank],
        player: cardData.name,
        position: cardData.position,
        era: cardData.era || 'Current',
        number: cardData.number || null,
      });
    }
  }

  return deck;
};

export const createDeck = () => createFullDeck(CARD_TYPES.ALL_STARS.id, null);

