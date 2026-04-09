// constants/theme.js
// Football Spades — Design System
// Dark luxury × NFL stadium energy
// Every UI file imports from here — single source of truth

export const COLORS = {
  // ── Field greens (primary backgrounds) ──────────────────────────────────────
  field:        '#0A1A0A',
  fieldMid:     '#0F2A0F',
  fieldLight:   '#163516',

  // ── Gold accents (primary accent) ────────────────────────────────────────────
  gold:         '#FFD700',
  goldLight:    '#FFE55C',
  goldDark:     '#B8960C',
  goldGlow:     'rgba(255,215,0,0.18)',

  // ── Suits ────────────────────────────────────────────────────────────────────
  spade:        '#C8E6FF',
  heart:        '#FF5C5C',
  diamond:      '#FF8C42',
  club:         '#7EE8A2',

  // ── UI surfaces ───────────────────────────────────────────────────────────────
  surface:      'rgba(255,255,255,0.06)',
  surfaceHover: 'rgba(255,255,255,0.11)',
  border:       'rgba(255,255,255,0.12)',
  borderGold:   'rgba(255,215,0,0.4)',

  // ── Text ──────────────────────────────────────────────────────────────────────
  textPrimary:  '#FFFFFF',
  textSub:      'rgba(255,255,255,0.65)',
  textMuted:    'rgba(255,255,255,0.35)',

  // ── Status ────────────────────────────────────────────────────────────────────
  win:          '#00E676',
  lose:         '#FF5252',
  warning:      '#FFB74D',
  info:         '#40C4FF',

  // ── Card ──────────────────────────────────────────────────────────────────────
  cardFace:     '#F8F4E8',
  cardBack1:    '#1A3A1A',
  cardBack2:    '#0A1A0A',

  // ── Mode-specific gradients ───────────────────────────────────────────────────
  classicGrad:  ['#0A1A0A', '#0F2A0F', '#163516'],
  arcadeGrad:   ['#0A0A1A', '#1A0A2A', '#0A1A2A'],
  welcomeGrad:  ['#050D05', '#0A1A0A', '#0F2A0F'],
};

export const GRADIENTS = {
  gold:         ['#FFD700', '#B8960C'],
  goldSoft:     ['rgba(255,215,0,0.3)', 'rgba(184,150,12,0.1)'],
  fieldDeep:    ['#0A1A0A', '#163516'],
  arcadeDeep:   ['#0A0A1A', '#1A0A2A'],
  cardSelected: ['rgba(255,215,0,0.25)', 'rgba(255,215,0,0.08)'],
  win:          ['#00E676', '#00C853'],
  lose:         ['#FF5252', '#D32F2F'],
  surface:      ['rgba(255,255,255,0.08)', 'rgba(255,255,255,0.03)'],
  surfaceDeep:  ['rgba(0,0,0,0.5)', 'rgba(0,0,0,0.3)'],
  scoreboard:   ['rgba(0,0,0,0.7)', 'rgba(0,0,0,0.4)'],
};

export const TYPOGRAPHY = {
  displayXL:   { fontSize: 42, fontWeight: '900', letterSpacing: -1,   color: '#FFFFFF' },
  displayL:    { fontSize: 32, fontWeight: '800', letterSpacing: -0.5, color: '#FFFFFF' },
  displayM:    { fontSize: 24, fontWeight: '800', letterSpacing: 0,    color: '#FFFFFF' },

  h1:          { fontSize: 20, fontWeight: '700', letterSpacing: 0.5,  color: '#FFFFFF' },
  h2:          { fontSize: 16, fontWeight: '700', letterSpacing: 1,    color: '#FFFFFF' },
  h3:          { fontSize: 13, fontWeight: '700', letterSpacing: 1.5,  color: 'rgba(255,255,255,0.65)', textTransform: 'uppercase' },

  body:        { fontSize: 14, fontWeight: '400', letterSpacing: 0,    color: '#FFFFFF' },
  bodySmall:   { fontSize: 12, fontWeight: '400', letterSpacing: 0,    color: 'rgba(255,255,255,0.65)' },

  score:       { fontSize: 36, fontWeight: '900', letterSpacing: -1,   color: '#FFD700' },
  scoreMid:    { fontSize: 24, fontWeight: '800', letterSpacing: -0.5, color: '#FFD700' },
  label:       { fontSize: 10, fontWeight: '700', letterSpacing: 2,    color: 'rgba(255,255,255,0.35)', textTransform: 'uppercase' },

  cardValue:   { fontSize: 20, fontWeight: '900', letterSpacing: -0.5 },
  cardSuit:    { fontSize: 22, fontWeight: '900' },
  cardPlayer:  { fontSize: 9,  fontWeight: '700', letterSpacing: 0.2 },
  cardPos:     { fontSize: 7,  fontWeight: '600', letterSpacing: 0.5 },

  timerBig:    { fontSize: 40, fontWeight: '900', letterSpacing: -2,   color: '#FFD700' },
  timerSmall:  { fontSize: 20, fontWeight: '800', letterSpacing: -1,   color: '#FFD700' },
};

export const SPACING = {
  xs:   4,
  sm:   8,
  md:   16,
  lg:   24,
  xl:   32,
  xxl:  48,
};

export const RADIUS = {
  sm:   8,
  md:   14,
  lg:   20,
  xl:   28,
  card: 10,
  pill: 999,
};

export const SHADOWS = {
  card: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 8,
  },
  cardSelected: {
    shadowColor: '#FFD700',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 12,
    elevation: 12,
  },
  panel: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.5,
    shadowRadius: 16,
    elevation: 10,
  },
  goldGlow: {
    shadowColor: '#FFD700',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.4,
    shadowRadius: 20,
    elevation: 10,
  },
};

// ── Suit helpers ──────────────────────────────────────────────────────────────
export const getSuitColor = (suit) => ({
  '♠': COLORS.spade,
  '♥': COLORS.heart,
  '♦': COLORS.diamond,
  '♣': COLORS.club,
})[suit] || COLORS.textPrimary;

export const getSuitLabel = (suit) => ({
  '♠': 'Spades',
  '♥': 'Hearts',
  '♦': 'Diamonds',
  '♣': 'Clubs',
})[suit] || suit;

// ── Mode helpers ──────────────────────────────────────────────────────────────
export const getModeGradient = (mode) =>
  mode === 'arcade' ? GRADIENTS.arcadeDeep : GRADIENTS.fieldDeep;

export const getModeAccent = (mode) =>
  mode === 'arcade' ? COLORS.info : COLORS.gold;

// ── Card back styles ──────────────────────────────────────────────────────────
export const CARD_BACK_STYLES = {
  football: { colors: ['#2A1505', '#1A0D03'], pattern: '🏈', label: 'Football' },
  stars:    { colors: ['#0A0A2A', '#05051A'], pattern: '⭐', label: 'Stars'    },
  trophy:   { colors: ['#2A1A00', '#1A1000'], pattern: '🏆', label: 'Trophy'   },
  classic:  { colors: ['#1A0A0A', '#0A0505'], pattern: '♠',  label: 'Classic'  },
  spades:   { colors: ['#0A1A2A', '#050D1A'], pattern: '♠',  label: 'Spades'   },
};

// ── Table themes ──────────────────────────────────────────────────────────────
export const TABLE_THEMES = {
  grass:   { colors: ['#0A1A0A', '#0F2A0F', '#163516'], label: '🏟️ Grass'   },
  night:   { colors: ['#050505', '#0A0A0A', '#0F0F0F'], label: '🌙 Night'   },
  stadium: { colors: ['#0A1A2A', '#051A2A', '#051015'], label: '🏟️ Stadium' },
  leather: { colors: ['#1A0A05', '#0F0503', '#080302'], label: '🏈 Leather' },
};

export default {
  COLORS,
  GRADIENTS,
  TYPOGRAPHY,
  SPACING,
  RADIUS,
  SHADOWS,
  getSuitColor,
  getSuitLabel,
  getModeGradient,
  getModeAccent,
  CARD_BACK_STYLES,
  TABLE_THEMES,
};

