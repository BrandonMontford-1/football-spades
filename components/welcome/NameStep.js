// components/welcome/NameStep.js
import React from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, { Path } from 'react-native-svg';
import { COLORS, GRADIENTS, TYPOGRAPHY, SPACING, RADIUS } from '../../constants/theme';

export const NameStep = ({ playerName, setPlayerName, gameMode, setGameMode, onNext }) => {
  const isValid = playerName.trim().length > 0;

  const modes = [
    { id: 'classic', label: 'CLASSIC' },
    { id: 'arcade',  label: 'ARCADE'  },
    { id: 'season',  label: '🏈 SEASON' },
  ];

  return (
    <View style={styles.stepContainer}>
      <View style={styles.logoContainer}>
        <Svg width="90" height="90" viewBox="0 0 100 100">
          <Path d="M30 20 Q50 10, 70 20 L70 80 Q50 90, 30 80 Z" fill="#8B4513" stroke={COLORS.gold} strokeWidth="3" />
          <Path d="M45 30 L55 30 M45 40 L55 40 M45 50 L55 50 M45 60 L55 60" stroke={COLORS.gold} strokeWidth="2" />
        </Svg>
        <Text style={styles.title}>FOOTBALL SPADES</Text>
        <Text style={styles.subtitle}>COACH'S EDITION</Text>
      </View>

      <View style={styles.inputContainer}>
        <TextInput
          style={[styles.input, playerName && !isValid && styles.inputError]}
          placeholder="ENTER YOUR COACH NAME"
          placeholderTextColor={COLORS.textMuted}
          value={playerName}
          onChangeText={setPlayerName}
          maxLength={20}
          autoCapitalize="words"
        />
        {playerName && !isValid && (
          <Text style={styles.errorText}>Name cannot be empty</Text>
        )}
      </View>

      {/* Mode toggle — 3 options */}
      <View style={styles.modeToggle}>
        {modes.map(m => (
          <TouchableOpacity
            key={m.id}
            style={[styles.modeToggleButton, gameMode === m.id && styles.modeToggleActive]}
            onPress={() => setGameMode(m.id)}
          >
            <Text style={[styles.modeToggleText, gameMode === m.id && styles.modeToggleTextActive]}>
              {m.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Season mode note */}
      {gameMode === 'season' && (
        <View style={styles.seasonNote}>
          <Text style={styles.seasonNoteText}>
            🏈 Pick a team and compete through an 8-game season. Make the playoffs and win the championship!
          </Text>
        </View>
      )}

      <TouchableOpacity
        style={[styles.nextButton, !isValid && styles.nextButtonDisabled]}
        onPress={onNext}
        disabled={!isValid}
      >
        <LinearGradient colors={GRADIENTS.win} style={styles.nextGradient}>
          <Text style={styles.nextButtonText}>NEXT →</Text>
        </LinearGradient>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  stepContainer: { flex: 1, justifyContent: 'center' },
  logoContainer: { alignItems: 'center', marginBottom: SPACING.lg },
  title: { ...TYPOGRAPHY.displayM, color: COLORS.gold, marginTop: SPACING.sm, letterSpacing: 1 },
  subtitle: { ...TYPOGRAPHY.label, color: COLORS.info, letterSpacing: 2, marginTop: SPACING.xs },
  inputContainer: { marginBottom: SPACING.lg },
  input: {
    backgroundColor: COLORS.surface, borderWidth: 1, borderColor: COLORS.borderGold,
    borderRadius: RADIUS.pill, paddingHorizontal: SPACING.md, paddingVertical: SPACING.sm + 4,
    fontSize: 16, color: COLORS.textPrimary, textAlign: 'center', fontWeight: '600',
  },
  inputError: { borderColor: COLORS.lose },
  errorText: { color: COLORS.lose, fontSize: 11, textAlign: 'center', marginTop: SPACING.xs },
  modeToggle: {
    flexDirection: 'row', backgroundColor: COLORS.surface,
    borderRadius: RADIUS.pill, marginBottom: SPACING.sm, padding: SPACING.xs,
  },
  modeToggleButton: {
    flex: 1, paddingVertical: SPACING.sm - 2,
    borderRadius: RADIUS.pill - 4, alignItems: 'center',
  },
  modeToggleActive: { backgroundColor: COLORS.gold },
  modeToggleText: { color: COLORS.info, fontSize: 11, fontWeight: 'bold', letterSpacing: 0.5 },
  modeToggleTextActive: { color: COLORS.field },
  seasonNote: {
    backgroundColor: 'rgba(255,215,0,0.08)', borderRadius: RADIUS.md,
    borderWidth: 1, borderColor: COLORS.borderGold,
    padding: SPACING.sm, marginBottom: SPACING.sm,
  },
  seasonNoteText: { ...TYPOGRAPHY.bodySmall, color: COLORS.textSub, textAlign: 'center', lineHeight: 18 },
  nextButton: { borderRadius: RADIUS.pill, overflow: 'hidden', marginTop: SPACING.sm },
  nextButtonDisabled: { opacity: 0.5 },
  nextGradient: { paddingVertical: SPACING.md, alignItems: 'center' },
  nextButtonText: { color: COLORS.textPrimary, fontSize: 16, fontWeight: 'bold', letterSpacing: 1 },
});
