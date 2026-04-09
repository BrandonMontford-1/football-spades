// components/ScoreHistory.js
// Uses actual coach names from score history — no more hardcoded BELI/TOML/RIVA

import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS, TYPOGRAPHY, SPACING, RADIUS } from '../constants/theme';

const ScoreHistory = ({ history }) => {
  if (!history?.length) return null;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>📊 GAME HISTORY</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <View style={styles.row}>
          {history.map((entry, index) => (
            <LinearGradient
              key={index}
              colors={['rgba(0,0,0,0.82)', 'rgba(0,20,0,0.9)']}
              style={styles.card}
            >
              <Text style={styles.roundText}>Q{entry.round}</Text>
              {entry.timestamp && (
                <Text style={styles.timeText}>{entry.timestamp}</Text>
              )}
              <View style={styles.divider} />

              {entry.scores.map((score, i) => {
                const isYou = i === 0;
                // Use actual name from history, trim to fit
                const displayName = isYou
                  ? 'YOU'
                  : (score.name || 'COACH').substring(0, 5).toUpperCase();

                return (
                  <View key={i} style={styles.scoreRow}>
                    <Text style={[styles.playerName, isYou && styles.youText]}>
                      {displayName}
                    </Text>
                    <Text style={[
                      styles.scoreValue,
                      score.score > 0 ? styles.positiveScore :
                      score.score < 0 ? styles.negativeScore :
                      styles.neutralScore,
                    ]}>
                      {score.score > 0 ? `+${score.score}` : score.score}
                    </Text>
                    {/* Show bid/tricks if available (classic mode) */}
                    {score.bid !== undefined && (
                      <Text style={styles.bidText}>
                        B:{score.bid ?? '?'} T:{score.tricks ?? 0}
                      </Text>
                    )}
                  </View>
                );
              })}

              {/* Bag total if any score has bags */}
              {entry.scores.some(s => s.bags > 0) && (
                <View style={styles.bagRow}>
                  <Text style={styles.bagText}>
                    👜 {entry.scores.reduce((a, s) => a + (s.bags || 0), 0)} bags
                  </Text>
                </View>
              )}
            </LinearGradient>
          ))}
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginHorizontal: SPACING.sm,
    marginBottom: 4,
  },
  title: {
    ...TYPOGRAPHY.label,
    color: COLORS.gold,
    fontSize: 9,
    marginBottom: 4,
  },
  row: {
    flexDirection: 'row',
    paddingVertical: 2,
  },
  card: {
    width: 150,
    padding: 8,
    marginRight: 6,
    borderRadius: RADIUS.sm,
    borderWidth: 1,
    borderColor: COLORS.borderGold,
  },
  roundText: {
    color: COLORS.gold,
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  timeText: {
    color: COLORS.textMuted,
    fontSize: 7,
    marginBottom: 3,
  },
  divider: {
    height: 1,
    backgroundColor: COLORS.borderGold,
    opacity: 0.4,
    marginVertical: 4,
  },
  scoreRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginVertical: 2,
  },
  playerName: {
    color: COLORS.textSub,
    fontSize: 9,
    fontWeight: '700',
    width: 38,
  },
  youText: {
    color: COLORS.gold,
  },
  scoreValue: {
    fontSize: 11,
    fontWeight: '800',
    width: 36,
    textAlign: 'right',
  },
  positiveScore: { color: COLORS.win },
  negativeScore:  { color: COLORS.lose },
  neutralScore:   { color: COLORS.textPrimary },
  bidText: {
    color: COLORS.textMuted,
    fontSize: 7,
    width: 42,
    textAlign: 'right',
  },
  bagRow: {
    marginTop: 4,
    paddingTop: 4,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  bagText: {
    color: COLORS.warning,
    fontSize: 8,
    textAlign: 'center',
    opacity: 0.8,
  },
});

export default ScoreHistory;

