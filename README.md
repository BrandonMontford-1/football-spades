# 🏈 Football Spades — Coach's Edition

A React Native / Expo card game that combines classic Spades with NFL player theming. Every card in the deck is a real NFL player. Play against 3 AI coaches, each running their own team's roster.

**Offline first.** No wifi needed. Built for road trips, flights, waiting rooms.

---

## What's in v5.0

| Feature | Status |
|---|---|
| Classic Spades (full rules) | ✅ |
| Arcade Spades (90s clock, no bidding) | ✅ |
| Season Mode (8-game schedule + playoffs) | ✅ |
| All 32 NFL teams with full rosters | ✅ |
| 5 card deck types | ✅ |
| 3 AI difficulty levels with card memory | ✅ |
| Sound effects (expo-av, no audio files) | ✅ |
| Haptics throughout | ✅ |
| Pause button + auto-pause on background | ✅ |
| Autosave after every trick | ✅ |
| Resume prompt on launch | ✅ |
| Career stats (AsyncStorage) | ✅ |
| Season career history + championships | ✅ |
| Full theme system (theme.js) | ✅ |

---

## Game Modes

### 🏈 Classic
Standard Spades. Bid 0–13 tricks, score points for making your bid, penalized for missing. First to reach your chosen win target wins.

- Nil bid: ±(winTarget × 20%) pts
- Bags: 10 overtricks = −100 pts, bags reset
- Win target: 70, 100, 150, or 200
- Optional: bag penalty toggle, blind nil

### ⚡ Arcade
Fast Spades — no bidding, just play.

- 90-second game clock
- 5-second turn timer (auto-plays lowest valid card on timeout)
- Ace = 8 pts, Spade = 3 pts, Any other = 6 pts
- Highest score when time runs out wins

### 🏟️ Season
Full NFL-style season experience.

- Pick your team from all 32 NFL franchises
- 8-game regular season schedule — one division per week
- All other teams simulate W/L records each week
- Live standings updated after every game
- Top 4 teams make the playoffs
- Tournament of 4: semi-finals → championship
- Career stats saved: seasons, playoff appearances, championships, best record

---

## Card Deck Types

| Type | Description |
|---|---|
| 🏈 NFL All-Stars | Current stars + HOF legends across all positions |
| 🏆 Team Rosters | Pick any of 32 NFL teams — play with their players |
| 🛡️ Defense Only | 52 defenders — DL, LB, CB, S |
| ⚡ Offense Only | 52 offensive players — QB, RB, WR, TE/OL |
| 🏅 Legends Only | 52 Hall of Famers only |

---

## AI Opponents

3 random NFL coaches selected as opponents. Each coach plays cards from their own team's roster.

| Difficulty | Bidding | Playing |
|---|---|---|
| Easy | Basic spade/ace count | Mostly random |
| Medium | High card awareness | Conservative, basic memory |
| Expert | Full hand evaluation | Card memory, void tracking, optimal play |

**Card memory:** Expert AI tracks every played card and which suits each player is void in. Leads effectively-high cards, dumps from shortest suit to build voids.

---

## Sound & Haptics

All sounds generated programmatically via `expo-av` — no audio files, works fully offline.

| Event | Sound | Haptic |
|---|---|---|
| Card played | Soft whoosh | Light |
| Trick won (you) | Ascending chime | Heavy |
| Trick won (opponent) | Low thud | Light |
| Spades broken | Dramatic sting | Medium |
| Bid placed | Soft click | Medium |
| Game over (win) | Fanfare | Success |
| Game over (loss) | Low drone | Error |
| Auto-play timeout | Warning beep | Warning |
| Clock last 5 seconds | Tick | Light |
| Pause / Resume | Soft tone | Light |

---

## Autosave & Pause

- **Pause button** (⏸) in header during active play
- **Auto-pause** when app goes to background (AppState listener)
- **Classic:** saves full game state after every trick
- **Arcade:** saves scores + exact time remaining per round
- **Resume prompt** on launch — shows time-ago and seconds remaining
- Saves expire: Classic after 24hrs, Arcade after 4hrs

---

## Architecture

```
SpadesFB/
├── App.js                          # Root router + resume prompt
├── components/
│   ├── GameBoardRealistic.js       # Main game UI (all modes)
│   ├── Card.js                     # Individual card component
│   ├── WelcomeScreen.js            # 3-step onboarding
│   ├── SeasonScreen.js             # Season hub (schedule/standings/career)
│   ├── ScoreHistory.js             # Round history panel
│   ├── StatsScreen.js              # Career stats overlay
│   ├── Field.js                    # NFL field background
│   └── welcome/
│       ├── NameStep.js             # Step 1: name + mode selection
│       ├── CardStyleStep.js        # Step 2: deck type + team
│       └── SettingsStep.js         # Step 3: rules + visuals
├── hooks/
│   ├── useGameState.js             # Classic mode engine
│   ├── useArcadeState.js           # Arcade mode engine
│   └── useSeasonState.js           # Season mode engine
├── services/
│   ├── soundService.js             # expo-av programmatic tones
│   └── gameAutosave.js             # AsyncStorage save/load/clear
├── constants/
│   ├── theme.js                    # Design system (single source of truth)
│   ├── deck.js                     # Deck factory — builds 52-card decks
│   ├── cardTypes.js                # 5 deck type definitions
│   ├── coaches.js                  # 32 NFL coaches with difficulties
│   ├── rosters.js                  # All 32 NFL team rosters
│   └── seasonSchedule.js           # 8-week schedule + sim logic
```

---

## Tech Stack

- React Native + Expo
- expo-av (sound)
- expo-haptics
- expo-linear-gradient
- react-native-svg
- @react-native-async-storage/async-storage
- react-native-safe-area-context
- @expo/vector-icons

---

## How to Run

```bash
git clone https://github.com/BrandonMontford-1/football-spades
cd football-spades
npm install
npx expo start
```

Scan the QR code with Expo Go (iOS/Android) or press `i` for iOS simulator.

---

## Version History

| Version | Description |
|---|---|
| v1.0 | Single-file prototype — basic Spades, no NFL theming |
| v5.0 | Full Coach's Edition — Season mode, sound, autosave, AI card memory, 32 teams |

---

## Roadmap

- [ ] Real recorded sound effects
- [ ] Card play animations
- [ ] Partnership mode (2v2)
- [ ] Multiplayer
- [ ] App Store release (pending NFL licensing)

---

*Built offline-first for road trips, flights, and anywhere you don't need wifi.*
