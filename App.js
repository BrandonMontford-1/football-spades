// App.js
// + Resume prompt on launch (checks for saved classic/arcade game)
// + pause/resume props wired to all game wrappers
// + Season team validation error handling

import React, { useState, useEffect, useRef } from 'react';
import {
  StyleSheet, StatusBar, View, Text,
  TouchableOpacity, ActivityIndicator, Modal,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import GameBoardRealistic from './components/GameBoardRealistic';
import WelcomeScreen from './components/WelcomeScreen';
import StatsScreen from './components/StatsScreen';
import SeasonScreen from './components/SeasonScreen';
import { useGameState } from './hooks/useGameState';
import { useArcadeState } from './hooks/useArcadeState';
import { useSeasonState } from './hooks/useSeasonState';
import { checkForSavedGame, clearClassicGame, clearArcadeGame } from './services/gameAutosave';
import { CARD_TYPES } from './constants/cardTypes';
import { COLORS, GRADIENTS, TYPOGRAPHY, SPACING, RADIUS, SHADOWS } from './constants/theme';

// ── Error Boundary ────────────────────────────────────────────────────────────
class GameErrorBoundary extends React.Component {
  constructor(props) { super(props); this.state = { hasError: false, error: null }; }
  static getDerivedStateFromError(error) { return { hasError: true, error }; }
  componentDidCatch(error, info) { console.error('Game Error:', error, info); }
  handleReset = () => { this.setState({ hasError: false, error: null }); this.props.onReset?.(); };
  render() {
    if (this.state.hasError) {
      return (
        <View style={styles.errorContainer}>
          <Text style={styles.errorEmoji}>🏈💥</Text>
          <Text style={styles.errorTitle}>Game Error</Text>
          <Text style={styles.errorMessage}>{this.state.error?.message ?? 'Something went wrong'}</Text>
          <TouchableOpacity style={styles.errorButton} onPress={this.handleReset}>
            <Text style={styles.errorButtonText}>Restart Game</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.errorButtonSecondary} onPress={() => this.props.onBackToMenu?.()}>
            <Text style={styles.errorButtonSecondaryText}>Back to Menu</Text>
          </TouchableOpacity>
        </View>
      );
    }
    return this.props.children;
  }
}

const LoadingScreen = () => (
  <View style={styles.loadingContainer}>
    <ActivityIndicator size="large" color={COLORS.gold} />
    <Text style={styles.loadingText}>Setting up the field...</Text>
  </View>
);

// ── Resume modal ──────────────────────────────────────────────────────────────
const ResumeModal = ({ visible, saveInfo, onResume, onDiscard }) => {
  if (!visible || !saveInfo) return null;
  const isArcade  = saveInfo.type === 'arcade';
  const timeAgo   = saveInfo.savedAt ? Math.round((Date.now() - saveInfo.savedAt) / 60000) : null;
  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.resumeBackdrop}>
        <LinearGradient colors={['rgba(5,13,5,0.98)', 'rgba(0,0,0,0.96)']} style={styles.resumePanel}>
          <Text style={styles.resumeEmoji}>{isArcade ? '⚡' : '🏈'}</Text>
          <Text style={styles.resumeTitle}>RESUME GAME?</Text>
          <Text style={styles.resumeSub}>
            {isArcade ? 'Arcade' : 'Classic'} game saved
            {timeAgo !== null ? ` ${timeAgo < 1 ? 'just now' : `${timeAgo}m ago`}` : ''}
          </Text>
          {isArcade && saveInfo.gameTimeLeft && (
            <Text style={styles.resumeTimer}>{saveInfo.gameTimeLeft}s remaining</Text>
          )}
          <TouchableOpacity style={styles.resumeBtn} onPress={onResume} activeOpacity={0.8}>
            <LinearGradient colors={GRADIENTS.gold} style={styles.resumeBtnInner}>
              <Text style={[styles.resumeBtnText, { color: '#000' }]}>▶ RESUME</Text>
            </LinearGradient>
          </TouchableOpacity>
          <TouchableOpacity style={styles.discardBtn} onPress={onDiscard} activeOpacity={0.8}>
            <Text style={styles.discardBtnText}>✕ START NEW GAME</Text>
          </TouchableOpacity>
        </LinearGradient>
      </View>
    </Modal>
  );
};

// ── Classic game wrapper ──────────────────────────────────────────────────────
const ClassicGame = ({ playerName, settings, onReset, onShowStats, savedState }) => {
  const state = useGameState(settings.cardType, settings.selectedTeam, settings.winTarget, savedState);
  return (
    <GameBoardRealistic
      mode="classic"
      players={state.players.map(p => p.id === 0 ? { ...p, name: playerName } : p)}
      currentPlayer={state.currentPlayer}
      currentTrick={state.currentTrick}
      gamePhase={state.gamePhase}
      spadesBroken={state.spadesBroken}
      isProcessing={state.isProcessing}
      debug={state.debug}
      roundNumber={state.roundNumber}
      scoreHistory={state.scoreHistory}
      playCard={state.playCard}
      resetGame={state.resetGame}
      cardBack={settings.cardBack}
      tableTheme={settings.tableTheme}
      showTutorial={settings.showTutorial}
      winTarget={settings.winTarget}
      nilBonus={state.nilBonus}
      onShowStats={onShowStats}
      selectedBid={state.selectedBid}
      setSelectedBid={state.setSelectedBid}
      makeBid={state.makeBid}
      makeComputerBids={state.makeComputerBids}
      isPaused={state.isPaused}
      pauseGame={state.pauseGame}
      resumeGame={state.resumeGame}
    />
  );
};

// ── Arcade game wrapper ───────────────────────────────────────────────────────
const ArcadeGame = ({ playerName, settings, onReset, onShowStats, savedState }) => {
  const state = useArcadeState(settings.cardType, settings.selectedTeam, savedState);
  return (
    <GameBoardRealistic
      mode="arcade"
      players={state.players.map(p => p.id === 0 ? { ...p, name: playerName } : p)}
      currentPlayer={state.currentPlayer}
      currentTrick={state.currentTrick}
      gamePhase={state.gamePhase}
      spadesBroken={state.spadesBroken}
      isProcessing={state.isProcessing}
      debug={state.debug}
      roundNumber={state.roundNumber}
      scoreHistory={state.scoreHistory}
      playCard={state.playCard}
      resetGame={state.resetGame}
      cardBack={settings.cardBack}
      tableTheme={settings.tableTheme}
      showTutorial={settings.showTutorial}
      onShowStats={onShowStats}
      gameTimeLeft={state.gameTimeLeft}
      turnTimeLeft={state.turnTimeLeft}
      blindNilAvailable={state.blindNilAvailable}
      isBlindNil={state.isBlindNil}
      setIsBlindNil={state.setIsBlindNil}
      makeBid={state.makeBid}
      isPaused={state.isPaused}
      pauseGame={state.pauseGame}
      resumeGame={state.resumeGame}
    />
  );
};

// ── Season game wrapper ───────────────────────────────────────────────────────
const SeasonGame = ({ playerName, settings, currentGame, onGameOver }) => {
  const state = useGameState(CARD_TYPES.TEAM_ROSTER.id, settings.selectedTeam, settings.winTarget);
  const reportedRef = useRef(false);
  useEffect(() => {
    if (state.gamePhase === 'gameOver' && !reportedRef.current) {
      reportedRef.current = true;
      const winner = state.players.reduce((a, b) => a.score > b.score ? a : b);
      onGameOver(winner.id === 0);
    }
  }, [state.gamePhase]);
  return (
    <GameBoardRealistic
      mode="classic"
      players={state.players.map(p => p.id === 0 ? { ...p, name: playerName } : p)}
      currentPlayer={state.currentPlayer}
      currentTrick={state.currentTrick}
      gamePhase={state.gamePhase}
      spadesBroken={state.spadesBroken}
      isProcessing={state.isProcessing}
      debug={`${currentGame?.label ?? 'Season'} • Week ${currentGame?.week ?? '?'}`}
      roundNumber={state.roundNumber}
      scoreHistory={state.scoreHistory}
      playCard={state.playCard}
      resetGame={state.resetGame}
      cardBack={settings.cardBack}
      tableTheme={settings.tableTheme}
      showTutorial={false}
      winTarget={settings.winTarget}
      nilBonus={state.nilBonus}
      selectedBid={state.selectedBid}
      setSelectedBid={state.setSelectedBid}
      makeBid={state.makeBid}
      makeComputerBids={state.makeComputerBids}
      isPaused={state.isPaused}
      pauseGame={state.pauseGame}
      resumeGame={state.resumeGame}
    />
  );
};

// ── Season mode container ─────────────────────────────────────────────────────
const SeasonMode = ({ playerName, settings, onReset }) => {
  const season  = useSeasonState(settings.selectedTeam, settings.winTarget);
  const [gameKey, setGameKey] = useState(0);

  const handleStartGame = () => { setGameKey(k => k + 1); season.startWeekGame(); };
  const handleStartPlayoffGame = () => { setGameKey(k => k + 1); season.startPlayoffGame(); };

  if (season.seasonPhase === 'playing') {
    const isPlayoff = season.currentGame?.isPlayoff;
    return (
      <SeasonGame
        key={gameKey}
        playerName={playerName}
        settings={settings}
        currentGame={season.currentGame}
        onGameOver={isPlayoff ? season.recordPlayoffResult : season.recordGameResult}
      />
    );
  }

  return (
    <SeasonScreen
      playerTeamId={settings.selectedTeam}
      currentWeek={season.currentWeek}
      schedule={season.schedule}
      leaderboard={season.leaderboard}
      playerRecord={season.playerRecord}
      weekResult={season.weekResult}
      isLastWeek={season.isLastWeek}
      currentScheduleWeek={season.currentScheduleWeek}
      seasonPhase={season.seasonPhase}
      playoffTeams={season.playoffTeams}
      playoffBracket={season.playoffBracket}
      playoffRound={season.playoffRound}
      hasTeamError={season.hasTeamError}
      onStartGame={handleStartGame}
      onAdvanceWeek={season.advanceWeek}
      onStartPlayoffGame={handleStartPlayoffGame}
      onBackToMenu={onReset}
    />
  );
};

// ── Root App ──────────────────────────────────────────────────────────────────
export default function App() {
  const [gameStarted,  setGameStarted]  = useState(false);
  const [isLoading,    setIsLoading]    = useState(true);
  const [showStats,    setShowStats]    = useState(false);
  const [stats,        setStats]        = useState(null);
  const [playerName,   setPlayerName]   = useState('Coach');
  const [gameMode,     setGameMode]     = useState('classic');
  const [gameKey,      setGameKey]      = useState(0);
  const [resumeInfo,   setResumeInfo]   = useState(null);   // pending resume prompt
  const [savedState,   setSavedState]   = useState(null);   // state to restore
  const [settings, setSettings] = useState({
    difficulty: 'medium', bagPenalty: true, winTarget: 70, blindNil: false,
    cardBack: 'football', tableTheme: 'grass', showTutorial: true,
    cardType: CARD_TYPES.ALL_STARS.id, selectedTeam: null,
  });

  useEffect(() => {
    const init = async () => {
      try {
        const [statsRaw, saves] = await Promise.all([
          AsyncStorage.getItem('gameStats'),
          checkForSavedGame(),
        ]);
        if (statsRaw) setStats(JSON.parse(statsRaw));

        // Check for a resumable game
        if (saves.hasClassic && saves.classic) {
          setResumeInfo({ type: 'classic', savedAt: saves.classic.savedAt, data: saves.classic });
        } else if (saves.hasArcade && saves.arcade) {
          setResumeInfo({ type: 'arcade', savedAt: saves.arcade.savedAt, gameTimeLeft: saves.arcade.gameTimeLeft, data: saves.arcade });
        }
      } catch (_) {}
      setTimeout(() => setIsLoading(false), 500);
    };
    init();
  }, []);

  const handleResume = () => {
    if (!resumeInfo) return;
    const data = resumeInfo.data;
    // Restore settings from saved state
    setSettings(prev => ({
      ...prev,
      cardType:     data.cardType     ?? prev.cardType,
      selectedTeam: data.selectedTeam ?? prev.selectedTeam,
      winTarget:    data.winTarget    ?? prev.winTarget,
    }));
    setGameMode(resumeInfo.type);
    setSavedState(data);
    setGameKey(k => k + 1);
    setGameStarted(true);
    setResumeInfo(null);
  };

  const handleDiscardSave = async () => {
    await clearClassicGame();
    await clearArcadeGame();
    setResumeInfo(null);
  };

  const handleShowStats = async () => {
    try { const raw = await AsyncStorage.getItem('gameStats'); if (raw) setStats(JSON.parse(raw)); } catch (_) {}
    setShowStats(true);
  };

  const handleGameStart = (name, mode, gameSettings) => {
    setSavedState(null); // fresh game — no restore
    setPlayerName(name);
    setGameMode(mode);
    setSettings(gameSettings);
    setGameKey(k => k + 1);
    setGameStarted(true);
  };

  const handleReset = () => {
    setSavedState(null);
    setGameStarted(false);
    setGameKey(k => k + 1);
  };

  if (isLoading) return <LoadingScreen />;
  if (!gameStarted) return (
    <>
      <WelcomeScreen onStart={handleGameStart} />
      <ResumeModal
        visible={!!resumeInfo}
        saveInfo={resumeInfo}
        onResume={handleResume}
        onDiscard={handleDiscardSave}
      />
    </>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.field} />
      <GameErrorBoundary onReset={handleReset} onBackToMenu={handleReset}>
        {gameMode === 'classic' && (
          <ClassicGame key={gameKey} playerName={playerName} settings={settings} onReset={handleReset} onShowStats={handleShowStats} savedState={savedState} />
        )}
        {gameMode === 'arcade' && (
          <ArcadeGame key={gameKey} playerName={playerName} settings={settings} onReset={handleReset} onShowStats={handleShowStats} savedState={savedState} />
        )}
        {gameMode === 'season' && (
          <SeasonMode key={gameKey} playerName={playerName} settings={settings} onReset={handleReset} />
        )}
      </GameErrorBoundary>
      {showStats && <StatsScreen stats={stats} onClose={() => setShowStats(false)} />}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.field },
  loadingContainer: { flex: 1, backgroundColor: COLORS.field, justifyContent: 'center', alignItems: 'center', gap: 16 },
  loadingText: { color: COLORS.gold, fontSize: 14, fontWeight: '700', letterSpacing: 1 },
  errorContainer: { flex: 1, backgroundColor: COLORS.field, justifyContent: 'center', alignItems: 'center', padding: 24, gap: 12 },
  errorEmoji: { fontSize: 56 },
  errorTitle: { color: COLORS.gold, fontSize: 24, fontWeight: '800' },
  errorMessage: { color: COLORS.textSub, fontSize: 13, textAlign: 'center', lineHeight: 20 },
  errorButton: { marginTop: 8, backgroundColor: COLORS.fieldLight, paddingHorizontal: 32, paddingVertical: 12, borderRadius: 30, borderWidth: 1, borderColor: COLORS.borderGold },
  errorButtonText: { color: COLORS.textPrimary, fontSize: 15, fontWeight: '700' },
  errorButtonSecondary: { paddingHorizontal: 32, paddingVertical: 10, borderRadius: 30, borderWidth: 1, borderColor: COLORS.border },
  errorButtonSecondaryText: { color: COLORS.textSub, fontSize: 13 },
  // Resume modal
  resumeBackdrop: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.88)' },
  resumePanel: { width: '78%', borderRadius: RADIUS.xl, padding: SPACING.xl, borderWidth: 1, borderColor: COLORS.borderGold, alignItems: 'center', ...SHADOWS.goldGlow },
  resumeEmoji: { fontSize: 48, marginBottom: SPACING.sm },
  resumeTitle: { ...TYPOGRAPHY.displayM, color: COLORS.gold, marginBottom: 4 },
  resumeSub:   { ...TYPOGRAPHY.bodySmall, color: COLORS.textSub, marginBottom: SPACING.sm, textAlign: 'center' },
  resumeTimer: { ...TYPOGRAPHY.h2, color: COLORS.info, marginBottom: SPACING.md },
  resumeBtn:   { borderRadius: RADIUS.pill, overflow: 'hidden', width: '100%', marginBottom: SPACING.sm },
  resumeBtnInner: { paddingVertical: SPACING.md, alignItems: 'center' },
  resumeBtnText:  { ...TYPOGRAPHY.h2, letterSpacing: 1 },
  discardBtn:  { paddingVertical: SPACING.sm },
  discardBtnText: { ...TYPOGRAPHY.body, color: COLORS.textMuted },
});
