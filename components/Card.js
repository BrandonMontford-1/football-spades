// components/Card.js
// Premium NFL card — dark luxury × stadium aesthetic
// Uses theme.js design system throughout

import React, { useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Animated } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { COLORS, SHADOWS, RADIUS, getSuitColor } from '../constants/theme';

// ── Suit helpers ──────────────────────────────────────────────────────────────
const getSuitGradient = (suit) => ({
  '♠': [COLORS.fieldMid, COLORS.field],
  '♥': ['#8b0000', '#4a0000'],
  '♦': ['#003a8c', '#001a4a'],
  '♣': ['#0a3d1a', '#051a0a'],
})[suit] ?? [COLORS.fieldMid, COLORS.field];

const getEraLabel = (era) =>
  era === 'Legend' ? '🏆 HOF' : '⭐ STAR';

// ── Face-down card ────────────────────────────────────────────────────────────
const CardBack = () => (
  <View style={styles.opponentCardWrap}>
    <LinearGradient colors={[COLORS.cardBack1, COLORS.cardBack2]} style={styles.opponentCard}>
      <Text style={styles.opponentIcon}>🏈</Text>
      <Text style={styles.opponentQ}>?</Text>
    </LinearGradient>
  </View>
);

// ── Main card component ───────────────────────────────────────────────────────
const Card = ({ card, onPress, isPlayable = true, isOpponent = false }) => {
  const scaleAnim  = useRef(new Animated.Value(1)).current;
  const liftAnim   = useRef(new Animated.Value(0)).current;

  if (isOpponent || !card) return <CardBack />;

  const suitColor = getSuitColor(card.suit);

  const handlePressIn = () => {
    if (!isPlayable) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    Animated.parallel([
      Animated.spring(scaleAnim, { toValue: 1.08, friction: 6, useNativeDriver: true }),
      Animated.timing(liftAnim,  { toValue: 1, duration: 120, useNativeDriver: true }),
    ]).start();
  };

  const handlePressOut = () => {
    if (!isPlayable) return;
    Animated.parallel([
      Animated.spring(scaleAnim, { toValue: 1, friction: 4, useNativeDriver: true }),
      Animated.timing(liftAnim,  { toValue: 0, duration: 120, useNativeDriver: true }),
    ]).start();
  };

  const handlePress = () => {
    if (!isPlayable) return;
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    onPress?.(card);
  };

  const shadowOpacity = liftAnim.interpolate({ inputRange: [0, 1], outputRange: [0.3, 0.7] });
  const shadowRadius  = liftAnim.interpolate({ inputRange: [0, 1], outputRange: [4,  14] });

  return (
    <Animated.View
      style={[
        styles.cardWrap,
        {
          transform: [{ scale: scaleAnim }],
          shadowOpacity,
          shadowRadius,
        },
        !isPlayable && styles.cardDisabled,
      ]}
    >
      <TouchableOpacity
        activeOpacity={0.85}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        onPress={handlePress}
        disabled={!isPlayable}
      >
        <LinearGradient colors={getSuitGradient(card.suit)} style={styles.card}>
          {/* Gold border overlay */}
          <View style={[styles.goldBorder, isPlayable && styles.goldBorderActive]} />

          {/* Top-left corner */}
          <View style={styles.cornerTL}>
            <Text style={[styles.cornerValue, { color: suitColor }]}>{card.value}</Text>
            <Text style={[styles.cornerSuit,  { color: suitColor }]}>{card.suit}</Text>
          </View>

          {/* Center content */}
          <View style={styles.centerContent}>
            <Text style={[styles.centerSuit, { color: suitColor, opacity: 0.18 }]}>{card.suit}</Text>
            <View style={styles.playerInfo}>
              <Text style={styles.playerName} numberOfLines={2} adjustsFontSizeToFit>
                {card.player}
              </Text>
              <View style={[styles.positionBadge, { borderColor: suitColor }]}>
                <Text style={[styles.positionText, { color: suitColor }]}>{card.position}</Text>
              </View>
              <Text style={styles.eraLabel}>{getEraLabel(card.era)}</Text>
            </View>
          </View>

          {/* Bottom-right corner (rotated) */}
          <View style={styles.cornerBR}>
            <Text style={[styles.cornerValue, { color: suitColor, transform: [{ rotate: '180deg' }] }]}>{card.value}</Text>
            <Text style={[styles.cornerSuit,  { color: suitColor, transform: [{ rotate: '180deg' }] }]}>{card.suit}</Text>
          </View>

          {/* Playable glow line */}
          {isPlayable && <View style={[styles.glowLine, { backgroundColor: suitColor }]} />}
        </LinearGradient>
      </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  // ── Face-down ───────────────────────────────────────────────────────────────
  opponentCardWrap: {
    width: 44,
    height: 62,
    marginHorizontal: 2,
    borderRadius: RADIUS.card,
    ...SHADOWS.card,
    shadowColor: '#000',
  },
  opponentCard: {
    flex: 1,
    borderRadius: RADIUS.card,
    borderWidth: 1.5,
    borderColor: COLORS.borderGold,
    alignItems: 'center',
    justifyContent: 'center',
  },
  opponentIcon: { fontSize: 18, opacity: 0.9 },
  opponentQ:    { color: COLORS.goldDark, fontSize: 8, marginTop: 2, opacity: 0.7 },

  // ── Player card ─────────────────────────────────────────────────────────────
  cardWrap: {
    marginHorizontal: 3,
    borderRadius: RADIUS.card,
    shadowColor: COLORS.gold,
    shadowOffset: { width: 0, height: 4 },
    elevation: 8,
  },
  card: {
    width: 72,
    height: 102,
    borderRadius: RADIUS.card,
    overflow: 'hidden',
    position: 'relative',
    padding: 5,
    justifyContent: 'space-between',
  },
  cardDisabled: { opacity: 0.5 },

  goldBorder: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: RADIUS.card,
    borderWidth: 1.5,
    borderColor: COLORS.borderGold,
  },
  goldBorderActive: {
    borderColor: COLORS.gold,
    borderWidth: 2,
  },

  // Corners
  cornerTL: { alignItems: 'flex-start' },
  cornerBR: { alignItems: 'flex-end' },
  cornerValue: {
    fontSize: 15,
    fontWeight: '900',
    lineHeight: 16,
  },
  cornerSuit: {
    fontSize: 13,
    fontWeight: '900',
    lineHeight: 14,
  },

  // Center
  centerContent: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  centerSuit: {
    position: 'absolute',
    fontSize: 52,
    fontWeight: '900',
  },
  playerInfo: {
    alignItems: 'center',
    zIndex: 2,
    paddingHorizontal: 2,
  },
  playerName: {
    color: COLORS.textPrimary,
    fontSize: 8,
    fontWeight: '800',
    textAlign: 'center',
    letterSpacing: 0.2,
    textShadowColor: 'rgba(0,0,0,0.8)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
    marginBottom: 3,
    maxWidth: 60,
  },
  positionBadge: {
    borderWidth: 1,
    borderRadius: 6,
    paddingHorizontal: 4,
    paddingVertical: 1,
    marginBottom: 2,
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  positionText: {
    fontSize: 6,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  eraLabel: {
    color: COLORS.textMuted,
    fontSize: 6,
    fontWeight: '600',
    letterSpacing: 0.3,
  },

  // Playable glow line at bottom
  glowLine: {
    position: 'absolute',
    bottom: 0,
    left: 8,
    right: 8,
    height: 2,
    borderRadius: 1,
    opacity: 0.7,
  },
});

export default Card;
