// components/GameBoardRealistic.js
// + Pause button in header
// + Pause overlay with resume/quit

import React, { useEffect, useRef, useState } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet,
  ScrollView, Animated,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import Card from './Card';
import Field from './Field';
import ScoreHistory from './ScoreHistory';
import {
  COLORS, GRADIENTS, TYPOGRAPHY, SPACING, RADIUS, SHADOWS, getSuitColor,
} from '../constants/theme';

const GameBoard = (props) => {
  const {
    players = [], currentPlayer, currentTrick = [], gamePhase,
    spadesBroken, isProcessing, debug, roundNumber, scoreHistory = [],
    playCard, resetGame, mode = 'classic',
    nilBonus, winTarget, onShowStats,
    selectedBid, setSelectedBid, makeBid, makeComputerBids,
    gameTimeLeft, turnTimeLeft, blindNilAvailable, isBlindNil, setIsBlindNil,
    isPaused = false, pauseGame, resumeGame,
  } = props;

  const fadeAnim     = useRef(new Animated.Value(0)).current;
  const bidSlideAnim = useRef(new Animated.Value(60)).current;
  const bidOpacAnim  = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, { toValue: 1, duration: 400, useNativeDriver: true }).start();
  }, []);

  useEffect(() => {
    const show = gamePhase === 'bidding' && players[0]?.bid === null && mode === 'classic';
    Animated.parallel([
      Animated.spring(bidSlideAnim, { toValue: show ? 0 : 80, friction: 8, useNativeDriver: true }),
      Animated.timing(bidOpacAnim, { toValue: show ? 1 : 0, duration: 220, useNativeDriver: true }),
    ]).start();
  }, [gamePhase, players, mode]);

  // ── Scoreboard ──────────────────────────────────────────────────────────────
  const renderScoreboard = () => (
    <Animated.View style={{ opacity: fadeAnim }}>
      <LinearGradient colors={['rgba(0,0,0,0.82)', 'rgba(0,0,0,0.6)']} style={styles.scoreboard}>
        <View style={styles.scoreboardHeader}>
          <Text style={styles.scoreboardTitle}>
            {mode === 'arcade' ? '⚡ ARCADE' : '🏈 CLASSIC'} • Q{roundNumber}
          </Text>
          {spadesBroken
            ? <Text style={styles.spadeActive}>♠ SECONDARY ACTIVE</Text>
            : <Text style={styles.spadeLocked}>♠ SECONDARY LOCKED</Text>}
        </View>
        {mode === 'arcade' && (
          <View style={styles.timerRow}>
            <View style={styles.timerBlock}>
              <Text style={styles.timerLabel}>GAME</Text>
              <Text style={[styles.timerValue, (gameTimeLeft ?? 99) <= 10 && styles.timerDanger]}>
                {isPaused ? '⏸' : `${Math.max(0, gameTimeLeft ?? 0)}s`}
              </Text>
            </View>
            <View style={styles.timerDivider} />
            <View style={styles.timerBlock}>
              <Text style={styles.timerLabel}>TURN</Text>
              <Text style={[styles.timerValue, (turnTimeLeft ?? 99) <= 2 && styles.timerDanger]}>
                {isPaused ? '⏸' : `${turnTimeLeft ?? 5}s`}
              </Text>
            </View>
          </View>
        )}
        <View style={styles.scoreRow}>
          {players.map((player) => {
            const isActive = currentPlayer === player.id && gamePhase === 'playing';
            const isYou    = player.id === 0;
            return (
              <View key={player.id} style={[styles.scoreCell, isActive && styles.scoreCellActive, isYou && styles.scoreCellYou]}>
                <Text style={styles.scoreName}>
                  {isYou ? 'YOU' : (player.name || 'COACH').substring(0, 5).toUpperCase()}
                </Text>
                <Text style={[styles.scoreValue, isActive && styles.scoreValueActive]}>
                  {player.score ?? 0}
                </Text>
                {mode === 'classic' && (
                  <View style={styles.scoreSubRow}>
                    <Text style={styles.scoreSubText}>B:{player.bid ?? '?'}</Text>
                    <Text style={styles.scoreSubText}>T:{player.tricks ?? 0}</Text>
                    {(player.bags ?? 0) > 0 && (
                      <Text style={[styles.scoreSubText, styles.bagText]}>👜{player.bags}</Text>
                    )}
                  </View>
                )}
                {isActive && <View style={styles.activeIndicatorDot} />}
              </View>
            );
          })}
        </View>
      </LinearGradient>
    </Animated.View>
  );

  const renderNameplate = (player, rotate = false) => {
    if (!player) return null;
    const isActive = currentPlayer === player.id && gamePhase === 'playing';
    return (
      <LinearGradient
        colors={isActive ? ['rgba(255,215,0,0.2)', 'rgba(255,215,0,0.05)'] : ['rgba(0,0,0,0.5)', 'rgba(0,0,0,0.3)']}
        style={[styles.nameplate, rotate && styles.nameplateRotated, isActive && styles.nameplateActive]}
      >
        <Text style={styles.nameplateName} numberOfLines={1}>{player.name || 'Coach'}</Text>
        <Text style={styles.nameplateCards}>🃏 {player.hand?.length ?? 0}</Text>
      </LinearGradient>
    );
  };

  const renderTrickArea = () => {
    const statusText =
      gamePhase === 'bidding'  ? 'GAME PLANNING' :
      gamePhase === 'gameOver' ? 'GAME OVER'     :
      isPaused                 ? '⏸ PAUSED'      :
      currentPlayer === 0      ? '▶ YOUR DRIVE'  :
      `${players[currentPlayer]?.name?.split(' ')[0] ?? '?'}'s DRIVE`;

    return (
      <View style={styles.trickArea}>
        <LinearGradient colors={['rgba(0,0,0,0.75)', 'rgba(0,0,0,0.5)']} style={styles.trickPanel}>
          <View style={styles.trickCards}>
            {currentTrick.length === 0 ? (
              <View style={styles.trickEmpty}>
                <Text style={styles.trickEmptyText}>{isPaused ? '⏸ PAUSED' : 'AWAITING PLAY'}</Text>
              </View>
            ) : (
              currentTrick.map((play, i) => {
                const sc = getSuitColor(play.card.suit);
                const isWinner = i === currentTrick.length - 1 && currentTrick.length === 4;
                return (
                  <View key={i} style={[styles.trickCard, isWinner && styles.trickCardWinner]}>
                    <LinearGradient colors={['#F8F4E8', '#EDE8D8']} style={styles.trickCardInner}>
                      <Text style={[styles.trickCardValue, { color: sc }]}>{play.card.value}{play.card.suit}</Text>
                      <Text style={styles.trickCardPlayer} numberOfLines={1}>
                        {play.card.player?.split(' ').slice(-1)[0] ?? '?'}
                      </Text>
                      <View style={[styles.trickCardDot, { backgroundColor: play.player === 0 ? COLORS.gold : COLORS.lose }]} />
                    </LinearGradient>
                  </View>
                );
              })
            )}
          </View>
          <View style={styles.trickStatusBar}>
            <Text style={[styles.trickStatusText, currentPlayer === 0 && gamePhase === 'playing' && !isPaused && styles.trickStatusYourTurn]}>
              {statusText}
            </Text>
          </View>
        </LinearGradient>
      </View>
    );
  };

  // ── Pause overlay ───────────────────────────────────────────────────────────
  const renderPauseOverlay = () => {
    if (!isPaused) return null;
    return (
      <View style={styles.pauseOverlay}>
        <LinearGradient colors={['rgba(5,13,5,0.97)', 'rgba(0,0,0,0.95)']} style={styles.pausePanel}>
          <Text style={styles.pauseEmoji}>⏸</Text>
          <Text style={styles.pauseTitle}>GAME PAUSED</Text>
          <Text style={styles.pauseSub}>Your game has been saved</Text>

          <TouchableOpacity style={styles.resumeBtn} onPress={resumeGame} activeOpacity={0.8}>
            <LinearGradient colors={GRADIENTS.gold} style={styles.resumeBtnInner}>
              <Text style={[styles.resumeBtnText, { color: '#000' }]}>▶ RESUME</Text>
            </LinearGradient>
          </TouchableOpacity>

          <TouchableOpacity style={styles.quitBtn} onPress={resetGame} activeOpacity={0.8}>
            <LinearGradient colors={[COLORS.surface, COLORS.surface]} style={styles.quitBtnInner}>
              <Text style={styles.quitBtnText}>✕ QUIT GAME</Text>
            </LinearGradient>
          </TouchableOpacity>
        </LinearGradient>
      </View>
    );
  };

  const renderBidding = () => {
    if (mode !== 'classic') return null;
    if (gamePhase !== 'bidding' || players[0]?.bid !== null) return null;
    const nilPts = nilBonus ?? 14;
    return (
      <Animated.View
        style={[styles.bidOverlay, { opacity: bidOpacAnim, transform: [{ translateY: bidSlideAnim }] }]}
        pointerEvents={gamePhase === 'bidding' && players[0]?.bid === null ? 'auto' : 'none'}
      >
        <LinearGradient colors={['rgba(10,26,10,0.97)', 'rgba(5,13,5,0.99)']} style={styles.playbookPanel}>
          <View style={styles.playbookHeader}>
            <Text style={styles.playbookTitle}>📋 GAME PLAN</Text>
            <Text style={styles.playbookSub}>HOW MANY TOUCHDOWNS CAN YOU CALL?</Text>
          </View>
          <View style={styles.nilBanner}>
            <Text style={styles.nilBannerText}>0 = SHUTOUT BID  •  ±{nilPts} pts</Text>
          </View>
          <View style={styles.bidGrid}>
            {Array.from({ length: 14 }, (_, i) => i).map((num) => {
              const isNil = num === 0, isSelected = selectedBid === num;
              return (
                <TouchableOpacity
                  key={num}
                  onPress={() => {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                    setSelectedBid?.(num);
                    makeBid?.(num, 0);
                    makeComputerBids?.();
                  }}
                  activeOpacity={0.75}
                >
                  <LinearGradient
                    colors={isSelected ? [COLORS.gold, COLORS.goldDark] : isNil ? ['#8b0000', '#4a0000'] : [COLORS.fieldLight, COLORS.fieldMid]}
                    style={[styles.bidBtn, isSelected && styles.bidBtnSelected]}
                  >
                    <Text style={[styles.bidBtnText, isSelected && styles.bidBtnTextSelected]}>
                      {isNil ? 'NIL' : num}
                    </Text>
                  </LinearGradient>
                </TouchableOpacity>
              );
            })}
          </View>
        </LinearGradient>
      </Animated.View>
    );
  };

  const renderBlindNil = () => {
    if (mode !== 'arcade' || !blindNilAvailable || isBlindNil) return null;
    return (
      <TouchableOpacity
        style={styles.blindNilBtn}
        onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy); setIsBlindNil?.(true); makeBid?.(0, 0, true); }}
        activeOpacity={0.8}
      >
        <LinearGradient colors={['#8b0000', '#4a0000']} style={styles.blindNilInner}>
          <Text style={styles.blindNilText}>🎲 BLIND NIL</Text>
          <Text style={styles.blindNilSub}>±{nilBonus ?? 14} PTS</Text>
        </LinearGradient>
      </TouchableOpacity>
    );
  };

  const renderGameOver = () => {
    if (gamePhase !== 'gameOver') return null;
    const winner = players.length ? players.reduce((a, b) => (a.score > b.score ? a : b)) : null;
    const youWon = winner?.id === 0;
    const resetLabel = mode === 'arcade' ? 'NEXT QUARTER' : 'NEW SEASON';
    return (
      <View style={styles.gameOverOverlay}>
        <LinearGradient
          colors={youWon ? ['#0a2a0a', '#163516'] : ['#1a0505', '#2a0a0a']}
          style={styles.gameOverPanel}
        >
          <Text style={styles.gameOverEmoji}>{youWon ? '🏆' : '💀'}</Text>
          <Text style={styles.gameOverTitle}>{youWon ? 'SUPER BOWL CHAMPS' : 'GAME OVER'}</Text>
          <Text style={styles.gameOverWinner}>{winner?.name ?? 'Unknown'}</Text>
          <Text style={styles.gameOverScore}>{winner?.score ?? 0} POINTS</Text>
          <View style={styles.gameOverScores}>
            {[...players].sort((a, b) => b.score - a.score).map((p, i) => (
              <View key={p.id} style={styles.gameOverRow}>
                <Text style={styles.gameOverRank}>#{i + 1}</Text>
                <Text style={styles.gameOverPlayerName}>{p.name}</Text>
                <Text style={[styles.gameOverPlayerScore, i === 0 && styles.gameOverWinnerScore]}>{p.score}</Text>
              </View>
            ))}
          </View>
          {winTarget && <Text style={styles.gameOverTarget}>Win target: {winTarget} pts</Text>}
          <View style={styles.gameOverButtons}>
            <TouchableOpacity onPress={resetGame} activeOpacity={0.8} style={styles.newGameBtn}>
              <LinearGradient
                colors={youWon ? [COLORS.gold, COLORS.goldDark] : [COLORS.fieldLight, COLORS.field]}
                style={styles.newGameBtnInner}
              >
                <Text style={[styles.newGameBtnText, youWon && { color: '#000' }]}>{resetLabel}</Text>
              </LinearGradient>
            </TouchableOpacity>
            {onShowStats && (
              <TouchableOpacity onPress={onShowStats} activeOpacity={0.8} style={styles.statsBtn}>
                <LinearGradient colors={[COLORS.surface, COLORS.surface]} style={styles.statsBtnInner}>
                  <Text style={styles.statsBtnText}>📊 STATS</Text>
                </LinearGradient>
              </TouchableOpacity>
            )}
          </View>
        </LinearGradient>
      </View>
    );
  };

  return (
    <Animated.View style={[styles.root, { opacity: fadeAnim }]}>
      <Field />

      {/* Header with pause button */}
      <LinearGradient colors={['rgba(0,0,0,0.85)', 'rgba(0,0,0,0.6)']} style={styles.header}>
        <Text style={styles.headerDebug} numberOfLines={1}>🏈 {debug}</Text>
        <Text style={styles.headerRound}>Q{roundNumber}</Text>
        {/* Pause button — only during active play */}
        {(gamePhase === 'playing' || gamePhase === 'bidding') && pauseGame && (
          <TouchableOpacity
            style={styles.pauseBtn}
            onPress={isPaused ? resumeGame : pauseGame}
            activeOpacity={0.8}
          >
            <Text style={styles.pauseBtnText}>{isPaused ? '▶' : '⏸'}</Text>
          </TouchableOpacity>
        )}
      </LinearGradient>

      {renderScoreboard()}
      {scoreHistory?.length > 0 && <ScoreHistory history={scoreHistory} />}

      <View style={styles.field}>
        <View style={styles.topZone}>
          {renderNameplate(players[1])}
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.opponentHandH}>
            <View style={styles.opponentCardsH}>
              {players[1]?.hand?.map((card, i) => (
                <View key={card.id} style={{ marginLeft: i > 0 ? -22 : 0 }}>
                  <Card card={card} isOpponent />
                </View>
              ))}
            </View>
          </ScrollView>
        </View>
        <View style={styles.midRow}>
          <View style={styles.sideZone}>
            {renderNameplate(players[2], true)}
            <View style={styles.opponentCardsV}>
              {players[2]?.hand?.map((card, i) => (
                <View key={card.id} style={{ marginTop: i > 0 ? -22 : 0 }}>
                  <Card card={card} isOpponent />
                </View>
              ))}
            </View>
          </View>
          <View style={styles.centerZone}>
            {renderTrickArea()}
            {renderBlindNil()}
          </View>
          <View style={styles.sideZone}>
            {renderNameplate(players[3], true)}
            <View style={styles.opponentCardsV}>
              {players[3]?.hand?.map((card, i) => (
                <View key={card.id} style={{ marginTop: i > 0 ? -22 : 0 }}>
                  <Card card={card} isOpponent />
                </View>
              ))}
            </View>
          </View>
        </View>
        <View style={styles.bottomZone}>
          {renderNameplate(players[0])}
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.yourHandContent}>
            {players[0]?.hand?.map((card) => (
              <Card
                key={card.id}
                card={card}
                onPress={(c) => playCard?.(c, 0)}
                isPlayable={currentPlayer === 0 && gamePhase === 'playing' && !isProcessing && !isPaused}
                isOpponent={false}
              />
            ))}
          </ScrollView>
        </View>
      </View>

      {renderBidding()}
      {renderGameOver()}
      {renderPauseOverlay()}
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: 'transparent' },
  header: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    marginHorizontal: SPACING.sm, marginBottom: 4,
    paddingHorizontal: SPACING.md, paddingVertical: 7,
    borderRadius: RADIUS.sm, borderWidth: 1, borderColor: COLORS.borderGold,
  },
  headerDebug: { ...TYPOGRAPHY.bodySmall, color: COLORS.gold, flex: 1 },
  headerRound: { ...TYPOGRAPHY.h2, color: COLORS.gold, marginLeft: SPACING.sm },
  pauseBtn: {
    marginLeft: SPACING.sm,
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.pill,
    borderWidth: 1, borderColor: COLORS.border,
    paddingHorizontal: SPACING.sm,
    paddingVertical: 3,
  },
  pauseBtnText: { color: COLORS.gold, fontSize: 14, fontWeight: '700' },

  scoreboard: {
    marginHorizontal: SPACING.sm, marginBottom: 4,
    borderRadius: RADIUS.md, padding: SPACING.sm,
    borderWidth: 1, borderColor: COLORS.borderGold, ...SHADOWS.panel,
  },
  scoreboardHeader: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    marginBottom: 6, paddingBottom: 5, borderBottomWidth: 1, borderBottomColor: COLORS.borderGold,
  },
  scoreboardTitle: { ...TYPOGRAPHY.h3, color: COLORS.gold, textTransform: 'none', letterSpacing: 0.5, fontSize: 11 },
  spadeActive:  { color: COLORS.spade, fontSize: 9, fontWeight: '700', letterSpacing: 0.5 },
  spadeLocked:  { color: COLORS.textMuted, fontSize: 9, fontWeight: '600', letterSpacing: 0.5 },
  timerRow: {
    flexDirection: 'row', justifyContent: 'center', alignItems: 'center',
    marginBottom: 8, paddingBottom: 6, borderBottomWidth: 1, borderBottomColor: COLORS.borderGold, gap: SPACING.lg,
  },
  timerBlock: { alignItems: 'center' },
  timerDivider: { width: 1, height: 32, backgroundColor: COLORS.border },
  timerLabel: { ...TYPOGRAPHY.label, fontSize: 9, color: COLORS.textMuted },
  timerValue: { ...TYPOGRAPHY.timerSmall, fontSize: 22 },
  timerDanger: { color: COLORS.lose },
  scoreRow: { flexDirection: 'row', justifyContent: 'space-around' },
  scoreCell: { alignItems: 'center', flex: 1, paddingVertical: 4, paddingHorizontal: 2, borderRadius: RADIUS.sm, position: 'relative' },
  scoreCellActive: { backgroundColor: COLORS.goldGlow, borderWidth: 1, borderColor: COLORS.borderGold },
  scoreCellYou: { backgroundColor: 'rgba(0,230,118,0.06)' },
  scoreName: { ...TYPOGRAPHY.label, fontSize: 9, color: COLORS.textSub },
  scoreValue: { ...TYPOGRAPHY.scoreMid, fontSize: 20, color: COLORS.gold },
  scoreValueActive: { color: COLORS.goldLight },
  scoreSubRow: { flexDirection: 'row', gap: 6, marginTop: 2 },
  scoreSubText: { ...TYPOGRAPHY.label, fontSize: 8, color: COLORS.textMuted, letterSpacing: 0.5 },
  bagText: { color: COLORS.warning },
  activeIndicatorDot: { position: 'absolute', top: 3, right: 5, width: 6, height: 6, borderRadius: 3, backgroundColor: COLORS.gold },
  nameplate: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 10, paddingVertical: 4, borderRadius: RADIUS.pill,
    borderWidth: 1, borderColor: COLORS.border, marginVertical: 2, gap: 6,
  },
  nameplateRotated: { transform: [{ rotate: '-90deg' }], width: 90, alignSelf: 'center' },
  nameplateActive: { borderColor: COLORS.borderGold },
  nameplateName: { ...TYPOGRAPHY.bodySmall, fontWeight: '700', fontSize: 9, color: COLORS.textPrimary, flex: 1 },
  nameplateCards: { ...TYPOGRAPHY.bodySmall, fontSize: 9, color: COLORS.textMuted },
  trickArea: { alignItems: 'center', justifyContent: 'center' },
  trickPanel: { borderRadius: RADIUS.md, padding: 10, borderWidth: 1, borderColor: COLORS.borderGold, minWidth: 200, alignItems: 'center', ...SHADOWS.panel },
  trickCards: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', minHeight: 80, gap: 4, marginBottom: 6 },
  trickEmpty: { paddingVertical: 20, paddingHorizontal: 16 },
  trickEmptyText: { ...TYPOGRAPHY.label, color: COLORS.textMuted, fontSize: 9, letterSpacing: 1.5 },
  trickCard: { borderRadius: RADIUS.sm, overflow: 'hidden', ...SHADOWS.card },
  trickCardWinner: { borderWidth: 2, borderColor: COLORS.gold, borderRadius: RADIUS.sm },
  trickCardInner: { width: 58, height: 70, borderRadius: RADIUS.sm, alignItems: 'center', justifyContent: 'center', padding: 4, position: 'relative' },
  trickCardValue: { fontSize: 14, fontWeight: '900', letterSpacing: -0.5 },
  trickCardPlayer: { fontSize: 7, fontWeight: '700', color: '#333', textAlign: 'center', maxWidth: 50, marginTop: 3 },
  trickCardDot: { position: 'absolute', bottom: 4, width: 6, height: 6, borderRadius: 3 },
  trickStatusBar: { borderTopWidth: 1, borderTopColor: COLORS.borderGold, paddingTop: 5, width: '100%', alignItems: 'center' },
  trickStatusText: { ...TYPOGRAPHY.label, fontSize: 9, color: COLORS.textMuted, letterSpacing: 1.2 },
  trickStatusYourTurn: { color: COLORS.gold, letterSpacing: 1.5 },

  // Pause overlay
  pauseOverlay: { ...StyleSheet.absoluteFillObject, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.8)', zIndex: 50 },
  pausePanel: { width: '75%', borderRadius: RADIUS.xl, padding: SPACING.xl, borderWidth: 2, borderColor: COLORS.borderGold, alignItems: 'center', ...SHADOWS.goldGlow },
  pauseEmoji: { fontSize: 48, marginBottom: SPACING.sm },
  pauseTitle: { ...TYPOGRAPHY.displayM, color: COLORS.gold, marginBottom: 4 },
  pauseSub:   { ...TYPOGRAPHY.bodySmall, color: COLORS.textSub, marginBottom: SPACING.lg },
  resumeBtn:  { borderRadius: RADIUS.pill, overflow: 'hidden', width: '100%', marginBottom: SPACING.sm },
  resumeBtnInner: { paddingVertical: SPACING.md, alignItems: 'center' },
  resumeBtnText:  { ...TYPOGRAPHY.h2, letterSpacing: 1 },
  quitBtn:    { borderRadius: RADIUS.pill, overflow: 'hidden', width: '100%' },
  quitBtnInner: { paddingVertical: SPACING.sm + 4, alignItems: 'center', borderWidth: 1, borderColor: COLORS.border, borderRadius: RADIUS.pill },
  quitBtnText:  { ...TYPOGRAPHY.body, color: COLORS.textMuted },

  bidOverlay: { position: 'absolute', bottom: 0, left: 0, right: 0, zIndex: 20 },
  playbookPanel: {
    borderTopLeftRadius: RADIUS.xl, borderTopRightRadius: RADIUS.xl,
    padding: SPACING.md, borderTopWidth: 2, borderLeftWidth: 1, borderRightWidth: 1,
    borderColor: COLORS.borderGold, ...SHADOWS.panel,
  },
  playbookHeader: { alignItems: 'center', marginBottom: SPACING.sm },
  playbookTitle: { ...TYPOGRAPHY.h1, color: COLORS.gold, fontSize: 18 },
  playbookSub: { ...TYPOGRAPHY.bodySmall, color: COLORS.textSub, letterSpacing: 0.5, marginTop: 2 },
  nilBanner: {
    backgroundColor: 'rgba(139,0,0,0.2)', borderWidth: 1, borderColor: 'rgba(139,0,0,0.4)',
    borderRadius: RADIUS.pill, alignSelf: 'center', paddingHorizontal: 14, paddingVertical: 4, marginBottom: SPACING.sm,
  },
  nilBannerText: { color: COLORS.lose, fontSize: 10, fontWeight: '700', letterSpacing: 0.5 },
  bidGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: 6 },
  bidBtn: { width: 52, height: 52, borderRadius: 26, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: COLORS.border },
  bidBtnSelected: { borderColor: COLORS.gold, borderWidth: 2, transform: [{ scale: 1.08 }], ...SHADOWS.goldGlow },
  bidBtnText: { color: COLORS.textPrimary, fontSize: 15, fontWeight: '800', letterSpacing: -0.5 },
  bidBtnTextSelected: { color: '#000' },
  blindNilBtn: { marginTop: 8, borderRadius: RADIUS.pill, overflow: 'hidden', alignSelf: 'center' },
  blindNilInner: { paddingHorizontal: 20, paddingVertical: 8, alignItems: 'center' },
  blindNilText: { ...TYPOGRAPHY.h2, color: COLORS.textPrimary, fontSize: 12 },
  blindNilSub: { color: COLORS.gold, fontSize: 9, fontWeight: '700' },
  gameOverOverlay: { ...StyleSheet.absoluteFillObject, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.75)', zIndex: 30 },
  gameOverPanel: { width: '82%', borderRadius: RADIUS.xl, padding: SPACING.xl, borderWidth: 2, borderColor: COLORS.borderGold, alignItems: 'center', ...SHADOWS.goldGlow },
  gameOverEmoji: { fontSize: 52, marginBottom: 8 },
  gameOverTitle: { ...TYPOGRAPHY.displayM, color: COLORS.gold, textAlign: 'center', marginBottom: 6 },
  gameOverWinner: { ...TYPOGRAPHY.h1, color: COLORS.textPrimary, textAlign: 'center' },
  gameOverScore: { ...TYPOGRAPHY.scoreMid, color: COLORS.textSub, marginBottom: SPACING.md },
  gameOverScores: { width: '100%', marginBottom: SPACING.md, borderTopWidth: 1, borderTopColor: COLORS.border, paddingTop: SPACING.sm },
  gameOverRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 4, borderBottomWidth: 1, borderBottomColor: COLORS.border },
  gameOverRank: { ...TYPOGRAPHY.label, color: COLORS.textMuted, width: 28 },
  gameOverPlayerName: { ...TYPOGRAPHY.body, flex: 1, color: COLORS.textSub },
  gameOverPlayerScore: { ...TYPOGRAPHY.body, fontWeight: '800', color: COLORS.textSub },
  gameOverWinnerScore: { color: COLORS.gold },
  gameOverTarget: { ...TYPOGRAPHY.label, color: COLORS.textMuted, marginBottom: SPACING.sm },
  gameOverButtons: { flexDirection: 'row', gap: SPACING.sm, width: '100%' },
  newGameBtn: { flex: 2, borderRadius: RADIUS.pill, overflow: 'hidden' },
  newGameBtnInner: { paddingVertical: 12, alignItems: 'center' },
  newGameBtnText: { ...TYPOGRAPHY.h2, color: COLORS.textPrimary, letterSpacing: 1.5 },
  statsBtn: { flex: 1, borderRadius: RADIUS.pill, overflow: 'hidden' },
  statsBtnInner: { paddingVertical: 12, alignItems: 'center', borderWidth: 1, borderColor: COLORS.borderGold, borderRadius: RADIUS.pill },
  statsBtnText: { ...TYPOGRAPHY.h2, color: COLORS.gold, fontSize: 12 },
  field: { flex: 1, marginHorizontal: SPACING.sm },
  topZone: { height: '22%', alignItems: 'center' },
  midRow: { flex: 1, flexDirection: 'row' },
  sideZone: { width: '18%', alignItems: 'center', justifyContent: 'center' },
  centerZone: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  bottomZone: { height: '28%', alignItems: 'center', justifyContent: 'flex-end', paddingBottom: 4 },
  opponentHandH: { width: '100%' },
  opponentCardsH: { flexDirection: 'row', paddingHorizontal: 4 },
  opponentCardsV: { alignItems: 'center', paddingVertical: 4 },
  yourHandContent: { flexDirection: 'row', paddingHorizontal: 4, paddingVertical: 6, alignItems: 'center' },
});

export default GameBoard;
