// components/welcome/SettingsStep.js
import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Feather } from '@expo/vector-icons';
import { COLORS, GRADIENTS, TYPOGRAPHY, SPACING, RADIUS } from '../../constants/theme';

export const SettingsStep = ({
  gameMode,
  difficulty,
  setDifficulty,
  bagPenalty,
  setBagPenalty,
  winTarget,
  setWinTarget,
  blindNil,
  setBlindNil,
  cardBack,
  setCardBack,
  tableTheme,
  setTableTheme,
  showTutorial,
  setShowTutorial,
  CARD_BACKS,
  TABLE_THEMES,
  onBack,
  onStart,
}) => {
  return (
    <View style={styles.stepContainer}>
      <Text style={styles.stepTitle}>⚙️ GAME SETTINGS</Text>
      <Text style={styles.stepSubtitle}>Customize your experience</Text>

      <ScrollView showsVerticalScrollIndicator={false} style={styles.settingsScroll}>

        {/* Difficulty */}
        <View style={styles.settingGroup}>
          <Text style={styles.settingLabel}>🎯 DIFFICULTY</Text>
          <View style={styles.optionsRow}>
            {['easy', 'medium', 'hard'].map(level => (
              <TouchableOpacity
                key={level}
                style={[styles.optionChip, difficulty === level && styles.optionChipActive]}
                onPress={() => setDifficulty(level)}
              >
                <Text style={[styles.optionChipText, difficulty === level && styles.optionChipTextActive]}>
                  {level.toUpperCase()}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Classic-only settings */}
        {gameMode === 'classic' && (
          <>
            <View style={styles.settingGroup}>
              <Text style={styles.settingLabel}>👜 BAG PENALTY</Text>
              <View style={styles.optionsRow}>
                {[true, false].map(val => (
                  <TouchableOpacity
                    key={String(val)}
                    style={[styles.optionChip, bagPenalty === val && styles.optionChipActive]}
                    onPress={() => setBagPenalty(val)}
                  >
                    <Text style={[styles.optionChipText, bagPenalty === val && styles.optionChipTextActive]}>
                      {val ? 'ON' : 'OFF'}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View style={styles.settingGroup}>
              <Text style={styles.settingLabel}>🏆 WIN TARGET</Text>
              <View style={styles.optionsRow}>
                {[70, 100, 150, 200].map(target => (
                  <TouchableOpacity
                    key={target}
                    style={[styles.optionChip, winTarget === target && styles.optionChipActive]}
                    onPress={() => setWinTarget(target)}
                  >
                    <Text style={[styles.optionChipText, winTarget === target && styles.optionChipTextActive]}>
                      {target}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View style={styles.settingGroup}>
              <Text style={styles.settingLabel}>🎲 BLIND NIL</Text>
              <View style={styles.optionsRow}>
                {[true, false].map(val => (
                  <TouchableOpacity
                    key={String(val)}
                    style={[styles.optionChip, blindNil === val && styles.optionChipActive]}
                    onPress={() => setBlindNil(val)}
                  >
                    <Text style={[styles.optionChipText, blindNil === val && styles.optionChipTextActive]}>
                      {val ? 'ON' : 'OFF'}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </>
        )}

        {/* Card Back */}
        <View style={styles.settingGroup}>
          <Text style={styles.settingLabel}>🎴 CARD BACK</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.cardScroll}>
            {CARD_BACKS.map(back => (
              <TouchableOpacity
                key={back.id}
                style={[styles.cardOption, cardBack === back.id && styles.cardOptionActive]}
                onPress={() => setCardBack(back.id)}
              >
                <LinearGradient colors={[back.color, back.color + 'cc']} style={styles.cardPreview}>
                  <Text style={[styles.cardPreviewText, { color: back.textColor }]}>{back.pattern}</Text>
                </LinearGradient>
                <Text style={styles.cardName}>{back.name}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Table Theme */}
        <View style={styles.settingGroup}>
          <Text style={styles.settingLabel}>🏟️ TABLE THEME</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.cardScroll}>
            {TABLE_THEMES.map(theme => (
              <TouchableOpacity
                key={theme.id}
                style={[styles.themeOption, tableTheme === theme.id && styles.themeOptionActive]}
                onPress={() => setTableTheme(theme.id)}
              >
                <LinearGradient colors={theme.colors} style={styles.themePreview}>
                  <Text style={styles.themePreviewText}>🏈</Text>
                </LinearGradient>
                <Text style={styles.themeName}>{theme.name}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Tutorial */}
        <View style={styles.settingGroup}>
          <Text style={styles.settingLabel}>📚 TUTORIAL</Text>
          <View style={styles.optionsRow}>
            {[true, false].map(val => (
              <TouchableOpacity
                key={String(val)}
                style={[styles.optionChip, showTutorial === val && styles.optionChipActive]}
                onPress={() => setShowTutorial(val)}
              >
                <Text style={[styles.optionChipText, showTutorial === val && styles.optionChipTextActive]}>
                  {val ? 'ON' : 'OFF'}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

      </ScrollView>

      <View style={styles.stepButtons}>
        {onBack && (
          <TouchableOpacity style={styles.backButton} onPress={onBack}>
            <Text style={styles.backButtonText}>← BACK</Text>
          </TouchableOpacity>
        )}
        {onStart && (
          <TouchableOpacity style={styles.startGameButton} onPress={onStart}>
            <LinearGradient colors={GRADIENTS.win} style={styles.startGradient}>
              <Text style={styles.startButtonText}>KICKOFF!</Text>
              <Feather name="play" size={18} color={COLORS.textPrimary} />
            </LinearGradient>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  stepContainer: { flex: 1, justifyContent: 'center' },
  stepTitle: {
    ...TYPOGRAPHY.displayM,
    color: COLORS.gold,
    textAlign: 'center',
    marginBottom: SPACING.sm,
  },
  stepSubtitle: {
    ...TYPOGRAPHY.bodySmall,
    color: COLORS.info,
    textAlign: 'center',
    marginBottom: SPACING.lg,
  },
  settingsScroll: { flex: 1, marginBottom: SPACING.md },
  settingGroup: { marginBottom: SPACING.md + 4 },
  settingLabel: {
    color: COLORS.gold,
    fontSize: 12,
    fontWeight: 'bold',
    marginBottom: SPACING.sm,
    letterSpacing: 0.5,
  },
  optionsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: SPACING.sm },
  optionChip: {
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.info,
    borderRadius: RADIUS.pill,
    paddingHorizontal: SPACING.md - 2,
    paddingVertical: SPACING.xs + 2,
  },
  optionChipActive: { backgroundColor: COLORS.gold, borderColor: COLORS.gold },
  optionChipText: { color: COLORS.info, fontSize: 11, fontWeight: 'bold' },
  optionChipTextActive: { color: COLORS.field },
  cardScroll: { flexDirection: 'row', marginTop: SPACING.sm },
  cardOption: {
    alignItems: 'center',
    marginRight: SPACING.sm,
    padding: SPACING.xs + 2,
    borderRadius: RADIUS.sm,
  },
  cardOptionActive: { backgroundColor: COLORS.goldGlow },
  cardPreview: {
    width: 50,
    height: 65,
    borderRadius: RADIUS.xs ?? 6,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: COLORS.borderGold,
  },
  cardPreviewText: { fontSize: 24 },
  cardName: { color: COLORS.textPrimary, fontSize: 9, marginTop: SPACING.xs },
  themeOption: {
    alignItems: 'center',
    marginRight: SPACING.sm,
    padding: SPACING.xs + 2,
    borderRadius: RADIUS.sm,
  },
  themeOptionActive: { backgroundColor: COLORS.goldGlow },
  themePreview: {
    width: 50,
    height: 50,
    borderRadius: RADIUS.sm,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: COLORS.borderGold,
  },
  themePreviewText: { fontSize: 20 },
  themeName: { color: COLORS.textPrimary, fontSize: 9, marginTop: SPACING.xs },
  stepButtons: { flexDirection: 'row', gap: SPACING.sm, marginTop: SPACING.md },
  backButton: {
    flex: 1,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.info,
    borderRadius: RADIUS.pill,
    paddingVertical: SPACING.md,
    alignItems: 'center',
  },
  backButtonText: { color: COLORS.info, fontSize: 14, fontWeight: 'bold' },
  startGameButton: { flex: 2, borderRadius: RADIUS.pill, overflow: 'hidden' },
  startGradient: {
    flexDirection: 'row',
    paddingVertical: SPACING.md,
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.sm,
  },
  startButtonText: {
    color: COLORS.textPrimary,
    fontSize: 16,
    fontWeight: 'bold',
    letterSpacing: 1,
  },
});
