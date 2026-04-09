// components/WelcomeScreen.js
// Premium dark luxury × NFL stadium welcome flow
// Uses theme.js design system throughout
// 3-step flow: Name → Card Style → Settings

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Modal,
  TouchableOpacity,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Feather } from '@expo/vector-icons';
import { CARD_TYPES } from '../constants/cardTypes';
import { getAllTeams } from '../constants/rosters';
import { NameStep } from './welcome/NameStep';
import { CardStyleStep } from './welcome/CardStyleStep';
import { SettingsStep } from './welcome/SettingsStep';
import {
  COLORS,
  GRADIENTS,
  TYPOGRAPHY,
  SPACING,
  RADIUS,
  SHADOWS,
} from '../constants/theme';

// ── Card back & table configs ─────────────────────────────────────────────────
export const CARD_BACKS = [
  { id: 'football', name: '🏈 Football', color: '#8B4513', pattern: '🏈', textColor: COLORS.gold },
  { id: 'stars',    name: '⭐ Stars',    color: '#1a237e', pattern: '⭐', textColor: COLORS.gold },
  { id: 'trophy',   name: '🏆 Trophy',   color: '#b8860b', pattern: '🏆', textColor: COLORS.gold },
  { id: 'classic',  name: '♠ Classic',   color: '#2c1810', pattern: '♠',  textColor: COLORS.gold },
  { id: 'spades',   name: '♠ Spades',    color: '#0a2f4a', pattern: '♠',  textColor: COLORS.gold },
];

export const TABLE_THEMES = [
  { id: 'grass',   name: '🏟️ Grass',   colors: COLORS.classicGrad },
  { id: 'stadium', name: '🏟️ Stadium', colors: ['#0A1A2A', '#051A2A', '#051015'] },
  { id: 'leather', name: '🏈 Leather', colors: ['#1A0A05', '#0F0503', '#080302'] },
  { id: 'night',   name: '🌙 Night',   colors: ['#050505', '#0A0A0A', '#0F0F0F'] },
];

// ─── WelcomeScreen ────────────────────────────────────────────────────────────
const WelcomeScreen = ({ onStart }) => {
  const [step,          setStep]          = useState('name');
  const [playerName,    setPlayerName]    = useState('');
  const [showRules,     setShowRules]     = useState(false);
  const [showSettings,  setShowSettings]  = useState(false);
  const [gameMode,      setGameMode]      = useState('classic');
  const [difficulty,    setDifficulty]    = useState('medium');
  const [bagPenalty,    setBagPenalty]    = useState(true);
  const [winTarget,     setWinTarget]     = useState(70);
  const [blindNil,      setBlindNil]      = useState(false);
  const [cardBack,      setCardBack]      = useState('football');
  const [tableTheme,    setTableTheme]    = useState('grass');
  const [showTutorial,  setShowTutorial]  = useState(true);
  const [cardType,      setCardType]      = useState(CARD_TYPES.ALL_STARS.id);
  const [selectedTeam,  setSelectedTeam]  = useState(null);
  const [allTeams,      setAllTeams]      = useState([]);

  useEffect(() => {
    loadSettings();
    setAllTeams(getAllTeams());
  }, []);

  // ── Persistence ──────────────────────────────────────────────────────────────
  const loadSettings = async () => {
    try {
      const get = (k) => AsyncStorage.getItem(k);
      const [
        savedName, savedMode, savedDiff, savedBagPen, savedWin,
        savedNil, savedBack, savedTheme, savedTut, savedCT, savedTeam,
      ] = await Promise.all([
        get('playerName'), get('gameMode'), get('difficulty'), get('bagPenalty'),
        get('winTarget'), get('blindNil'), get('cardBack'), get('tableTheme'),
        get('showTutorial'), get('cardType'), get('selectedTeam'),
      ]);

      if (savedName)   setPlayerName(savedName);
      if (savedMode)   setGameMode(savedMode);
      if (savedDiff)   setDifficulty(savedDiff);
      if (savedBagPen) setBagPenalty(savedBagPen === 'true');
      if (savedWin)    setWinTarget(parseInt(savedWin));
      if (savedNil)    setBlindNil(savedNil === 'true');
      if (savedBack)   setCardBack(savedBack);
      if (savedTheme)  setTableTheme(savedTheme);
      if (savedTut)    setShowTutorial(savedTut === 'true');
      if (savedCT)     setCardType(savedCT);
      if (savedTeam)   setSelectedTeam(savedTeam);
    } catch (e) {
      console.log('Settings load error:', e);
    }
  };

  const saveSettings = async () => {
    try {
      const pairs = [
        ['playerName',   playerName.trim() || 'Coach'],
        ['gameMode',     gameMode],
        ['difficulty',   difficulty],
        ['bagPenalty',   bagPenalty.toString()],
        ['winTarget',    winTarget.toString()],
        ['blindNil',     blindNil.toString()],
        ['cardBack',     cardBack],
        ['tableTheme',   tableTheme],
        ['showTutorial', showTutorial.toString()],
        ['cardType',     cardType],
        ...(selectedTeam ? [['selectedTeam', selectedTeam]] : []),
      ];
      await Promise.all(pairs.map(([k, v]) => AsyncStorage.setItem(k, v)));
    } catch (e) {
      console.log('Settings save error:', e);
    }
  };

  const handleStart = () => {
    saveSettings();
    onStart(playerName.trim() || 'Coach', gameMode, {
      difficulty, bagPenalty, winTarget, blindNil,
      cardBack, tableTheme, showTutorial, cardType, selectedTeam,
    });
  };

  const handleNext = () => {
    if (step === 'name')           setStep('cardStyle');
    else if (step === 'cardStyle') setStep('settings');
  };

  const handleBack = () => {
    if (step === 'cardStyle') setStep('name');
    else if (step === 'settings') setStep('cardStyle');
  };

  // ── Progress dots ─────────────────────────────────────────────────────────────
  const stepOrder = ['name', 'cardStyle', 'settings'];
  const stepIdx   = stepOrder.indexOf(step);

  const renderProgress = () => (
    <View style={styles.progressRow}>
      {stepOrder.map((s, i) => (
        <View key={s} style={[styles.progressDot, i <= stepIdx && styles.progressDotActive]} />
      ))}
    </View>
  );

  // ── Rules modal ───────────────────────────────────────────────────────────────
  const renderRules = () => (
    <Modal visible={showRules} transparent animationType="fade">
      <View style={styles.modalBackdrop}>
        <LinearGradient
          colors={['rgba(5,13,5,0.98)', 'rgba(0,0,0,0.96)']}
          style={styles.modalPanel}
        >
          <ScrollView showsVerticalScrollIndicator={false}>
            <Text style={styles.modalTitle}>🏈 COACH'S PLAYBOOK</Text>

            {[
              {
                header: '🎮 GAME MODES',
                items: [
                  { sub: '🏈 CLASSIC', lines: ['Bidding (0–13 tricks)', 'Bags penalty at 10', 'Nil: ±14 pts', `First to ${winTarget} wins`] },
                  { sub: '⚡ ARCADE',  lines: ['No bidding', 'Ace=8 • Spade=3 • Other=6', '90s clock + 5s turn timer', 'Highest score wins'] },
                  { sub: '🏈 SEASON',  lines: ['Pick your NFL team', '8-game regular season', 'Top 4 make playoffs', 'Win the championship!'] },
                ],
              },
              {
                header: '🎴 CARD TYPES',
                items: [
                  { lines: ['🏈 All-Stars — current stars + legends', '🏆 Team Rosters — your favorite NFL team', '🛡️ Defense Only — CB, S, LB, DL', '⚡ Offense Only — QB, RB, WR, TE', '🏅 Legends Only — Hall of Fame only'] },
                ],
              },
              {
                header: '♠️ SPADES RULES',
                items: [
                  { lines: ['Spades beat all other suits (trump)', 'Cannot lead spades until broken', 'Must follow suit if you have it'] },
                ],
              },
            ].map(({ header, items }) => (
              <View key={header} style={styles.modalSection}>
                <Text style={styles.modalSectionHeader}>{header}</Text>
                <View style={styles.modalDivider} />
                {items.map((item, i) => (
                  <View key={i}>
                    {item.sub && <Text style={styles.modalSubHeader}>{item.sub}</Text>}
                    {item.lines.map((line, j) => (
                      <Text key={j} style={styles.modalLine}>• {line}</Text>
                    ))}
                  </View>
                ))}
              </View>
            ))}

            <TouchableOpacity style={styles.modalBtn} onPress={() => setShowRules(false)} activeOpacity={0.8}>
              <LinearGradient colors={[COLORS.fieldLight, COLORS.field]} style={styles.modalBtnInner}>
                <Text style={styles.modalBtnText}>GOT IT</Text>
              </LinearGradient>
            </TouchableOpacity>
          </ScrollView>
        </LinearGradient>
      </View>
    </Modal>
  );

  // ── Settings modal ────────────────────────────────────────────────────────────
  const renderSettingsModal = () => (
    <Modal visible={showSettings} transparent animationType="fade">
      <View style={styles.modalBackdrop}>
        <LinearGradient
          colors={['rgba(5,13,5,0.98)', 'rgba(0,0,0,0.96)']}
          style={styles.modalPanel}
        >
          <ScrollView showsVerticalScrollIndicator={false}>
            <Text style={styles.modalTitle}>⚙️ SETTINGS</Text>
            <SettingsStep
              gameMode={gameMode}
              difficulty={difficulty}        setDifficulty={setDifficulty}
              bagPenalty={bagPenalty}        setBagPenalty={setBagPenalty}
              winTarget={winTarget}          setWinTarget={setWinTarget}
              blindNil={blindNil}            setBlindNil={setBlindNil}
              cardBack={cardBack}            setCardBack={setCardBack}
              tableTheme={tableTheme}        setTableTheme={setTableTheme}
              showTutorial={showTutorial}    setShowTutorial={setShowTutorial}
              CARD_BACKS={CARD_BACKS}
              TABLE_THEMES={TABLE_THEMES}
            />
            <TouchableOpacity style={styles.modalBtn} onPress={() => setShowSettings(false)} activeOpacity={0.8}>
              <LinearGradient colors={[COLORS.fieldLight, COLORS.field]} style={styles.modalBtnInner}>
                <Text style={styles.modalBtnText}>SAVE & CLOSE</Text>
              </LinearGradient>
            </TouchableOpacity>
          </ScrollView>
        </LinearGradient>
      </View>
    </Modal>
  );

  const currentTheme = TABLE_THEMES.find(t => t.id === tableTheme) ?? TABLE_THEMES[0];

  return (
    <LinearGradient colors={currentTheme.colors} style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.inner}
      >
        {step === 'settings' && (
          <TouchableOpacity style={styles.gearBtn} onPress={() => setShowSettings(true)}>
            <Feather name="settings" size={20} color={COLORS.gold} />
          </TouchableOpacity>
        )}

        <TouchableOpacity style={styles.rulesBtn} onPress={() => setShowRules(true)}>
          <Feather name="book-open" size={18} color={COLORS.textSub} />
        </TouchableOpacity>

        {renderProgress()}

        {step === 'name' && (
          <NameStep
            playerName={playerName}
            setPlayerName={setPlayerName}
            gameMode={gameMode}
            setGameMode={setGameMode}
            onNext={handleNext}
          />
        )}

        {step === 'cardStyle' && (
          <CardStyleStep
            cardType={cardType}
            setCardType={setCardType}
            selectedTeam={selectedTeam}
            setSelectedTeam={setSelectedTeam}
            allTeams={allTeams}
            onNext={handleNext}
            onBack={handleBack}
            gameMode={gameMode}
          />
        )}

        {step === 'settings' && (
          <SettingsStep
            gameMode={gameMode}
            difficulty={difficulty}        setDifficulty={setDifficulty}
            bagPenalty={bagPenalty}        setBagPenalty={setBagPenalty}
            winTarget={winTarget}          setWinTarget={setWinTarget}
            blindNil={blindNil}            setBlindNil={setBlindNil}
            cardBack={cardBack}            setCardBack={setCardBack}
            tableTheme={tableTheme}        setTableTheme={setTableTheme}
            showTutorial={showTutorial}    setShowTutorial={setShowTutorial}
            CARD_BACKS={CARD_BACKS}
            TABLE_THEMES={TABLE_THEMES}
            onBack={handleBack}
            onStart={handleStart}
          />
        )}

        <Text style={styles.version}>v4.0.0 • COACH'S EDITION</Text>
      </KeyboardAvoidingView>

      {renderRules()}
      {renderSettingsModal()}
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  inner: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: SPACING.lg,
    paddingVertical: 40,
  },
  gearBtn: {
    position: 'absolute', top: 52, right: SPACING.lg,
    width: 38, height: 38, borderRadius: 19,
    backgroundColor: COLORS.surface,
    alignItems: 'center', justifyContent: 'center',
    zIndex: 10, borderWidth: 1, borderColor: COLORS.borderGold,
  },
  rulesBtn: {
    position: 'absolute', top: 52, left: SPACING.lg,
    width: 38, height: 38, borderRadius: 19,
    backgroundColor: COLORS.surface,
    alignItems: 'center', justifyContent: 'center',
    zIndex: 10, borderWidth: 1, borderColor: COLORS.border,
  },
  progressRow: {
    flexDirection: 'row', justifyContent: 'center',
    gap: 8, marginBottom: SPACING.lg, marginTop: 60,
  },
  progressDot: { width: 28, height: 4, borderRadius: 2, backgroundColor: COLORS.border },
  progressDotActive: { backgroundColor: COLORS.gold },
  version: {
    textAlign: 'center', color: COLORS.textMuted,
    fontSize: 9, letterSpacing: 1, marginTop: SPACING.md,
  },
  modalBackdrop: {
    flex: 1, justifyContent: 'center', alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.88)',
  },
  modalPanel: {
    width: '88%', maxHeight: '82%',
    borderRadius: RADIUS.xl, padding: SPACING.lg,
    borderWidth: 1, borderColor: COLORS.borderGold, ...SHADOWS.panel,
  },
  modalTitle: { ...TYPOGRAPHY.h1, color: COLORS.gold, textAlign: 'center', marginBottom: SPACING.md, fontSize: 20 },
  modalSection: { marginBottom: SPACING.md },
  modalSectionHeader: { ...TYPOGRAPHY.h2, color: COLORS.info, fontSize: 12, marginBottom: 6 },
  modalDivider: { height: 1, backgroundColor: COLORS.borderGold, opacity: 0.4, marginBottom: 8 },
  modalSubHeader: { ...TYPOGRAPHY.bodySmall, color: COLORS.gold, fontWeight: '700', marginTop: 6, marginBottom: 2 },
  modalLine: { ...TYPOGRAPHY.bodySmall, color: COLORS.textSub, lineHeight: 18, marginLeft: 4, marginBottom: 1 },
  modalBtn: { borderRadius: RADIUS.pill, overflow: 'hidden', marginTop: SPACING.md },
  modalBtnInner: { paddingVertical: 12, alignItems: 'center' },
  modalBtnText: { ...TYPOGRAPHY.h2, color: COLORS.textPrimary, letterSpacing: 1.5, fontSize: 13 },
});

export default WelcomeScreen;
