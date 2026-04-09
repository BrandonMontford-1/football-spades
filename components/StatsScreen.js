// components/StatsScreen.js
import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import {
  COLORS,
  GRADIENTS,
  TYPOGRAPHY,
  SPACING,
  RADIUS,
  SHADOWS,
} from '../constants/theme';

const StatsScreen = ({ stats, onClose }) => {
  const s = {
    gamesPlayed:  0,
    wins:         0,
    losses:       0,
    totalTricks:  0,
    totalBags:    0,
    highestScore: 0,
    totalScore:   0,
    currentStreak: 0,
    longestStreak: 0,
    ...stats,
  };

  const winPct = s.gamesPlayed > 0
    ? Math.round((s.wins / s.gamesPlayed) * 100)
    : 0;

  const avgScore = s.gamesPlayed > 0
    ? Math.round(s.totalScore / s.gamesPlayed)
    : 0;

  const avgTricks = s.gamesPlayed > 0
    ? (s.totalTricks / s.gamesPlayed).toFixed(1)
    : '0.0';

  return (
    <View style={styles.overlay}>
      <LinearGradient colors={GRADIENTS.fieldDeep} style={styles.content}>

        <Text style={styles.title}>📊 COACH'S RECORD</Text>

        <ScrollView showsVerticalScrollIndicator={false} style={styles.scroll}>

          {/* Career */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>🏆 CAREER</Text>
            <Row label="Games Played"  value={s.gamesPlayed} />
            <Row label="Record"        value={`${s.wins}W – ${s.losses}L`} />
            <Row label="Win %"         value={`${winPct}%`} highlight={winPct >= 50} />
            <Row label="Current Streak"
              value={s.currentStreak >= 0 ? `🔥 ${s.currentStreak}W` : `💔 ${Math.abs(s.currentStreak)}L`}
              highlight={s.currentStreak > 0}
              danger={s.currentStreak < 0}
            />
            <Row label="Longest Win Streak" value={`🔥 ${s.longestStreak}`} />
          </View>

          {/* Scoring */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>🏈 SCORING</Text>
            <Row label="Highest Score" value={`${s.highestScore} pts`} highlight />
            <Row label="Avg Score/Game" value={`${avgScore} pts`} />
            <Row label="Total Tricks"  value={s.totalTricks} />
            <Row label="Avg Tricks/Game" value={avgTricks} />
          </View>

          {/* Penalties */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>👜 PENALTIES</Text>
            <Row label="Total Bags"    value={s.totalBags} danger={s.totalBags > 20} />
            <Row label="Bag Penalties" value={Math.floor(s.totalBags / 10)} danger={Math.floor(s.totalBags / 10) > 0} />
          </View>

          {/* No games yet */}
          {s.gamesPlayed === 0 && (
            <View style={styles.emptyState}>
              <Text style={styles.emptyEmoji}>🏈</Text>
              <Text style={styles.emptyText}>No games played yet.</Text>
              <Text style={styles.emptyText}>Hit the field to build your record!</Text>
            </View>
          )}

        </ScrollView>

        <TouchableOpacity style={styles.closeBtn} onPress={onClose} activeOpacity={0.8}>
          <LinearGradient colors={GRADIENTS.win} style={styles.closeBtnInner}>
            <Text style={styles.closeBtnText}>← BACK TO GAME</Text>
          </LinearGradient>
        </TouchableOpacity>

      </LinearGradient>
    </View>
  );
};

// ── Small helper row ──────────────────────────────────────────────────────────
const Row = ({ label, value, highlight = false, danger = false }) => (
  <View style={styles.row}>
    <Text style={styles.rowLabel}>{label}</Text>
    <Text style={[
      styles.rowValue,
      highlight && styles.rowHighlight,
      danger    && styles.rowDanger,
    ]}>
      {value}
    </Text>
  </View>
);

// ── Styles ────────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  overlay: {
    position: 'absolute',
    top: 0, left: 0, right: 0, bottom: 0,
    zIndex: 40,
  },
  content: {
    flex: 1,
    padding: SPACING.md,
    paddingTop: SPACING.xxl,
  },
  title: {
    ...TYPOGRAPHY.displayM,
    color: COLORS.gold,
    textAlign: 'center',
    marginBottom: SPACING.md,
    letterSpacing: 2,
  },
  scroll: { flex: 1 },
  section: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    marginBottom: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.borderGold,
    ...SHADOWS.panel,
  },
  sectionTitle: {
    ...TYPOGRAPHY.h2,
    color: COLORS.info,
    marginBottom: SPACING.sm,
    paddingBottom: SPACING.xs,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderGold,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: SPACING.xs,
  },
  rowLabel: {
    ...TYPOGRAPHY.body,
    color: COLORS.textSub,
  },
  rowValue: {
    ...TYPOGRAPHY.body,
    fontWeight: '800',
    color: COLORS.gold,
  },
  rowHighlight: { color: COLORS.win },
  rowDanger:    { color: COLORS.lose },
  emptyState: {
    alignItems: 'center',
    paddingVertical: SPACING.xl,
    gap: SPACING.sm,
  },
  emptyEmoji: { fontSize: 48 },
  emptyText: {
    ...TYPOGRAPHY.bodySmall,
    color: COLORS.textMuted,
    textAlign: 'center',
  },
  closeBtn: {
    marginTop: SPACING.sm,
    borderRadius: RADIUS.pill,
    overflow: 'hidden',
  },
  closeBtnInner: {
    paddingVertical: SPACING.md,
    alignItems: 'center',
  },
  closeBtnText: {
    ...TYPOGRAPHY.h2,
    color: COLORS.textPrimary,
    letterSpacing: 1,
  },
});

export default StatsScreen;
