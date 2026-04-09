// components/welcome/CardStyleStep.js
import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { CARD_TYPES } from '../../constants/cardTypes';
import { COLORS, GRADIENTS, TYPOGRAPHY, SPACING, RADIUS } from '../../constants/theme';

export const CardStyleStep = ({
  cardType,
  setCardType,
  selectedTeam,
  setSelectedTeam,
  allTeams,
  onNext,
  onBack,
  gameMode, // passed from WelcomeScreen so we know if season mode
}) => {
  // Season mode requires a team roster — force that selection
  const isSeason = gameMode === 'season';

  // In season mode, card type is locked to team roster
  const effectiveCardType = isSeason ? CARD_TYPES.TEAM_ROSTER.id : cardType;
  const isValid = effectiveCardType !== CARD_TYPES.TEAM_ROSTER.id || selectedTeam;

  return (
    <View style={styles.stepContainer}>
      <Text style={styles.stepTitle}>
        {isSeason ? '🏈 CHOOSE YOUR TEAM' : '🎴 CHOOSE YOUR CARD STYLE'}
      </Text>
      <Text style={styles.stepSubtitle}>
        {isSeason
          ? 'Pick the team you\'ll represent this season'
          : 'Each card features real NFL players'}
      </Text>

      <ScrollView showsVerticalScrollIndicator={false} style={styles.cardTypeScroll}>
        {/* In season mode, skip deck type picker and go straight to team */}
        {!isSeason && Object.values(CARD_TYPES).map(type => (
          <TouchableOpacity
            key={type.id}
            style={[styles.cardTypeOption, cardType === type.id && styles.cardTypeOptionActive]}
            onPress={() => {
              setCardType(type.id);
              if (type.id !== CARD_TYPES.TEAM_ROSTER.id) setSelectedTeam(null);
            }}
          >
            <View style={styles.cardTypeHeader}>
              <Text style={styles.cardTypeIcon}>{type.icon}</Text>
              <Text style={[styles.cardTypeName, cardType === type.id && styles.cardTypeNameActive]}>
                {type.name}
              </Text>
            </View>
            <Text style={styles.cardTypeDescription}>{type.description}</Text>

            {type.id === CARD_TYPES.TEAM_ROSTER.id && cardType === type.id && (
              <TeamSelector
                allTeams={allTeams}
                selectedTeam={selectedTeam}
                setSelectedTeam={setSelectedTeam}
              />
            )}
          </TouchableOpacity>
        ))}

        {/* Season mode: show team selector directly */}
        {isSeason && (
          <View style={styles.seasonTeamContainer}>
            <TeamSelector
              allTeams={allTeams}
              selectedTeam={selectedTeam}
              setSelectedTeam={setSelectedTeam}
              fullWidth
            />
          </View>
        )}
      </ScrollView>

      <View style={styles.stepButtons}>
        <TouchableOpacity style={styles.backButton} onPress={onBack}>
          <Text style={styles.backButtonText}>← BACK</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.nextButton, !isValid && styles.nextButtonDisabled]}
          onPress={() => {
            // In season mode, auto-set card type to team roster
            if (isSeason) setCardType(CARD_TYPES.TEAM_ROSTER.id);
            onNext();
          }}
          disabled={!isValid}
        >
          <LinearGradient colors={GRADIENTS.win} style={styles.nextGradient}>
            <Text style={styles.nextButtonText}>NEXT →</Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </View>
  );
};

// ── Shared team selector ──────────────────────────────────────────────────────
const TeamSelector = ({ allTeams, selectedTeam, setSelectedTeam, fullWidth }) => (
  <View style={[styles.teamSelectorContainer, fullWidth && styles.teamSelectorFull]}>
    <Text style={styles.teamSelectorLabel}>🏟️ Choose a Roster</Text>
    <ScrollView
      horizontal={!fullWidth}
      showsHorizontalScrollIndicator={false}
      style={fullWidth ? null : styles.teamScroll}
    >
      <View style={[styles.teamGrid, fullWidth && styles.teamGridFull]}>
        {allTeams.map(team => (
          <TouchableOpacity
            key={team.id}
            style={[styles.teamButton, selectedTeam === team.id && styles.teamButtonActive]}
            onPress={() => setSelectedTeam(team.id)}
          >
            <Text style={styles.teamEmoji}>{team.emoji}</Text>
            <Text style={[styles.teamName, selectedTeam === team.id && styles.teamNameActive]}>
              {team.name.split(' ').pop()}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </ScrollView>
  </View>
);

const styles = StyleSheet.create({
  stepContainer: { flex: 1, justifyContent: 'center' },
  stepTitle: { ...TYPOGRAPHY.displayM, color: COLORS.gold, textAlign: 'center', marginBottom: SPACING.sm },
  stepSubtitle: { ...TYPOGRAPHY.bodySmall, color: COLORS.info, textAlign: 'center', marginBottom: SPACING.lg },
  cardTypeScroll: { flex: 1, marginBottom: SPACING.md },
  cardTypeOption: {
    backgroundColor: COLORS.surface, borderWidth: 2, borderColor: COLORS.info,
    borderRadius: RADIUS.md, padding: SPACING.md, marginBottom: SPACING.sm,
  },
  cardTypeOptionActive: { borderColor: COLORS.gold, backgroundColor: COLORS.goldGlow },
  cardTypeHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: SPACING.sm },
  cardTypeIcon: { fontSize: 28, marginRight: SPACING.sm },
  cardTypeName: { ...TYPOGRAPHY.h1, color: COLORS.info },
  cardTypeNameActive: { color: COLORS.gold },
  cardTypeDescription: { ...TYPOGRAPHY.bodySmall, color: COLORS.textSub, lineHeight: 16 },

  seasonTeamContainer: { flex: 1 },

  teamSelectorContainer: {
    marginTop: SPACING.sm, paddingTop: SPACING.sm,
    borderTopWidth: 1, borderTopColor: COLORS.border,
  },
  teamSelectorFull: { borderTopWidth: 0, paddingTop: 0, flex: 1 },
  teamSelectorLabel: {
    color: COLORS.gold, fontSize: 13, fontWeight: '800',
    marginBottom: SPACING.sm, letterSpacing: 0.5,
  },
  teamScroll: { flexDirection: 'row' },
  teamGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: SPACING.sm, paddingVertical: SPACING.xs },
  teamGridFull: { flexDirection: 'row', flexWrap: 'wrap', gap: SPACING.sm },
  teamButton: {
    alignItems: 'center', backgroundColor: COLORS.surface,
    borderWidth: 1, borderColor: COLORS.info,
    borderRadius: RADIUS.sm, padding: SPACING.sm, minWidth: 70,
  },
  teamButtonActive: { backgroundColor: COLORS.gold, borderColor: COLORS.gold },
  teamEmoji: { fontSize: 20, marginBottom: 2 },
  teamName: { color: COLORS.info, fontSize: 9, fontWeight: 'bold', textAlign: 'center' },
  teamNameActive: { color: COLORS.field },

  stepButtons: { flexDirection: 'row', gap: SPACING.sm, marginTop: SPACING.md },
  backButton: {
    flex: 1, backgroundColor: COLORS.surface, borderWidth: 1, borderColor: COLORS.info,
    borderRadius: RADIUS.pill, paddingVertical: SPACING.md, alignItems: 'center',
  },
  backButtonText: { color: COLORS.info, fontSize: 14, fontWeight: 'bold' },
  nextButton: { flex: 2, borderRadius: RADIUS.pill, overflow: 'hidden' },
  nextButtonDisabled: { opacity: 0.5 },
  nextGradient: { paddingVertical: SPACING.md, alignItems: 'center' },
  nextButtonText: { color: COLORS.textPrimary, fontSize: 16, fontWeight: 'bold', letterSpacing: 1 },
});
