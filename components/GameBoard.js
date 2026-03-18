import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Animated,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, { Path, Circle, Rect, Defs, RadialGradient, Stop } from 'react-native-svg';
import * as Haptics from 'expo-haptics';
import Card from './Card';
import Field from './Field';
import ScoreHistory from './ScoreHistory';

// Safe animation helper
const safeInterpolate = (value, inputRange, outputRange, fallback = outputRange[0]) => {
  if (!value || typeof value.interpolate !== 'function') {
    return fallback;
  }
  return value.interpolate({
    inputRange: inputRange,
    outputRange: outputRange,
  });
};

const GameBoard = (props) => {
  const {
    players,
    currentPlayer,
    currentTrick,
    gamePhase,
    spadesBroken,
    isProcessing,
    debug,
    roundNumber,
    selectedBid,
    setSelectedBid,
    scoreHistory,
    makeBid,
    playCard,
    makeComputerBids,
    resetGame,
  } = props;

  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const bidOverlayAnim = useRef(new Animated.Value(0)).current;

  // Fade in on mount
  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    }).start();
  }, []);

  // Bid overlay animation
  useEffect(() => {
    if (gamePhase === "bidding" && players[0]?.bid === null) {
      Animated.spring(bidOverlayAnim, {
        toValue: 1,
        friction: 8,
        useNativeDriver: true,
      }).start();
    } else {
      Animated.timing(bidOverlayAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }).start();
    }
  }, [gamePhase, players]);

  // ============================================
  // 🏆 PREMIUM SCOREBOARD
  // ============================================
  const renderScoreBoard = () => (
    <Animated.View style={[styles.scoreboardContainer, { opacity: fadeAnim }]}>
      <LinearGradient
        colors={['#2a2a2a', '#1a1a1a', '#0a0a0a']}
        style={styles.scoreboardFrame}
      >
        {/* Rivets */}
        <View style={[styles.rivet, { top: 5, left: 10 }]} />
        <View style={[styles.rivet, { top: 5, right: 10 }]} />
        <View style={[styles.rivet, { bottom: 5, left: 10 }]} />
        <View style={[styles.rivet, { bottom: 5, right: 10 }]} />
        
        {/* Main screen */}
        <LinearGradient
          colors={['rgba(0,40,0,0.95)', 'rgba(0,20,0,0.98)']}
          style={styles.scoreboardScreen}
        >
          <Text style={styles.scoreboardTitle}>🏆 GAME SCORE 🏆</Text>
          
          <View style={styles.scoreboardRow}>
            {players.map((player) => (
              <View 
                key={player.id} 
                style={[
                  styles.scoreboardCell,
                  currentPlayer === player.id && gamePhase === "playing" && styles.activeCell,
                ]}
              >
                <Text style={styles.scoreboardTeam}>
                  {player.id === 0 ? "YOU" : 
                   player.id === 1 ? "BELI" :
                   player.id === 2 ? "TOML" : "RIVA"}
                </Text>
                <Text style={styles.scoreboardScore}>{player.score}</Text>
                <View style={styles.scoreboardDetails}>
                  <Text style={styles.scoreboardBid}>B:{player.bid ?? '?'}</Text>
                  <Text style={styles.scoreboardBags}>👜:{player.bags}</Text>
                </View>
                {player.tricks > 0 && (
                  <View style={styles.trickIndicator}>
                    <Text style={styles.trickIndicatorText}>🔥 {player.tricks}</Text>
                  </View>
                )}
              </View>
            ))}
          </View>
          
          <View style={styles.ledTicker}>
            <Text style={styles.ledTickerText}>
              {spadesBroken ? '♠️ SECONDARY ACTIVE' : '♠️ SECONDARY LOCKED'} • Q{roundNumber}
            </Text>
          </View>
        </LinearGradient>
      </LinearGradient>
    </Animated.View>
  );

  // ============================================
  // 📋 PREMIUM NAMEPLATES
  // ============================================
  const renderPlayerNameplate = (player, isVertical = false) => {
    const isActive = currentPlayer === player.id && gamePhase === "playing";
    
    return (
      <View style={[
        styles.nameplateContainer,
        isVertical && styles.nameplateContainerVertical
      ]}>
        <LinearGradient
          colors={isActive ? ['#5a4a3a', '#3a2a1a'] : ['#3a2a1a', '#1a0a00']}
          style={[
            styles.nameplate,
            isVertical && styles.nameplateVertical,
            isActive && styles.activeNameplate
          ]}
        >
          <Text style={styles.nameplateName}>{player.name}</Text>
          <View style={styles.nameplateStats}>
            <Text style={styles.nameplateBid}>BID {player.bid ?? '?'}</Text>
            <Text style={styles.nameplateCards}>📋 {player.hand?.length || 0}</Text>
          </View>
          
          {/* Decorative screws */}
          <View style={[styles.screw, styles.screwTL]} />
          <View style={[styles.screw, styles.screwTR]} />
          <View style={[styles.screw, styles.screwBL]} />
          <View style={[styles.screw, styles.screwBR]} />
        </LinearGradient>
      </View>
    );
  };

  // ============================================
  // 🎥 PREMIUM TRICK AREA
  // ============================================
  const renderTrick = () => {
    const suitColors = { "♠": "#000", "♣": "#000", "♥": "#f00", "♦": "#f00" };

    return (
      <View style={styles.projectorContainer}>
        <LinearGradient
          colors={['#3a3a3a', '#1a1a1a']}
          style={styles.projectorBody}
        >
          <View style={styles.lensOuter}>
            <View style={styles.lensInner}>
              <Text style={styles.projectorLabel}>🎥</Text>
            </View>
          </View>
          
          <View style={styles.projectorScreen}>
            {currentTrick.map((play, i) => (
              <View key={i} style={styles.projectorCard}>
                <LinearGradient colors={['#fff', '#f0f0f0']} style={styles.projectorCardInner}>
                  <Text style={[styles.projectorCardValue, { color: suitColors[play.card.suit] }]}>
                    {play.card.value}{play.card.suit}
                  </Text>
                  <View style={[styles.projectorCardIndicator, { 
                    backgroundColor: play.player === 0 ? '#ffd700' : '#ff4444'
                  }]} />
                </LinearGradient>
              </View>
            ))}
            {currentTrick.length === 0 && (
              <View style={styles.projectorStandby}>
                <Text style={styles.projectorStandbyText}>AWAITING PLAY</Text>
              </View>
            )}
          </View>
          
          <View style={styles.driveInfo}>
            <Text style={styles.driveText}>
              {gamePhase === "playing" ? 
                (currentPlayer === 0 ? "YOUR DRIVE" : `${players[currentPlayer]?.name}'s DRIVE`) :
                "GAME PLANNING"}
            </Text>
          </View>
        </LinearGradient>
      </View>
    );
  };

  // ============================================
  // 🎮 PREMIUM BIDDING
  // ============================================
  const renderBidding = () => {
    if (gamePhase !== "bidding" || players[0]?.bid !== null) return null;
    
    const scale = safeInterpolate(bidOverlayAnim, [0, 1], [0.8, 1], 1);
    const translateY = safeInterpolate(bidOverlayAnim, [0, 1], [50, 0], 0);

    return (
      <Animated.View style={[
        styles.playbookOverlay,
        {
          opacity: bidOverlayAnim,
          transform: [{ scale }, { translateY }]
        }
      ]}>
        <LinearGradient
          colors={['#5a4a3a', '#2a1a0a']}
          style={styles.playbook}
        >
          <Text style={styles.playbookTitle}>📋 GAME PLAN</Text>
          <Text style={styles.playbookSubtitle}>CALL YOUR TOUCHDOWNS</Text>
          
          <View style={styles.playbookRibbon}>
            <Text style={styles.playbookRibbonText}>0 = SHUTOUT ATTEMPT (±14)</Text>
          </View>
          
          <View style={styles.playbookButtons}>
            {[...Array(14).keys()].map(num => (
              <TouchableOpacity
                key={num}
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                  setSelectedBid(num);
                  makeBid(num, 0);
                  makeComputerBids();
                }}
              >
                <LinearGradient
                  colors={num === 0 ? ['#8b0000', '#4a0000'] : ['#2a6b2a', '#0a2a0a']}
                  style={[
                    styles.playbookButton,
                    selectedBid === num && styles.playbookButtonSelected,
                  ]}
                >
                  <Text style={styles.playbookButtonText}>
                    {num === 0 ? "SHUTOUT" : num}
                  </Text>
                </LinearGradient>
              </TouchableOpacity>
            ))}
          </View>
        </LinearGradient>
      </Animated.View>
    );
  };

  // ============================================
  // 🏆 PREMIUM GAME OVER
  // ============================================
  const renderGameOver = () => {
    if (gamePhase !== "gameOver") return null;
    
    const winner = players.reduce((prev, current) => 
      (prev.score > current.score) ? prev : current
    );

    return (
      <View style={styles.trophyCase}>
        <LinearGradient colors={['#1a0a0a', '#2a1a0a']} style={styles.trophyCaseInner}>
          <Text style={styles.trophyTitle}>🏆 SUPER BOWL CHAMPIONS 🏆</Text>
          <Text style={styles.trophyWinner}>{winner.name}</Text>
          <Text style={styles.trophyScore}>{winner.score} POINTS</Text>
          
          <TouchableOpacity onPress={resetGame}>
            <LinearGradient colors={['#4CAF50', '#1B5E20']} style={styles.trophyButton}>
              <Text style={styles.trophyButtonText}>NEW SEASON</Text>
            </LinearGradient>
          </TouchableOpacity>
        </LinearGradient>
      </View>
    );
  };

  return (
    <Animated.View style={[styles.container, { opacity: fadeAnim }]}>
      <Field />
      
      {/* Header */}
      <LinearGradient colors={['#2a2a2a', '#1a1a1a']} style={styles.header}>
        <Text style={styles.debug}>🏈 {debug}</Text>
        <Text style={styles.quarter}>Q{roundNumber}</Text>
      </LinearGradient>

      {renderScoreBoard()}
      <ScoreHistory history={scoreHistory} />

      {/* Main Game Area */}
      <View style={styles.gameArea}>
        {/* Top Opponent */}
        <View style={styles.topArea}>
          {renderPlayerNameplate(players[1])}
          <ScrollView horizontal>
            <View style={styles.opponentCards}>
              {players[1]?.hand?.map((card, index) => (
                <View key={card.id} style={{ marginLeft: index > 0 ? -25 : 0 }}>
                  <Card card={card} isOpponent={true} />
                </View>
              ))}
            </View>
          </ScrollView>
        </View>

        {/* Middle Row */}
        <View style={styles.middleRow}>
          {/* Left Opponent */}
          <View style={styles.leftArea}>
            {renderPlayerNameplate(players[2], true)}
            <ScrollView>
              <View style={styles.opponentCardsVertical}>
                {players[2]?.hand?.map((card, index) => (
                  <View key={card.id} style={{ marginTop: index > 0 ? -25 : 0 }}>
                    <Card card={card} isOpponent={true} />
                  </View>
                ))}
              </View>
            </ScrollView>
          </View>

          {/* Center */}
          <View style={styles.centerArea}>
            {renderTrick()}
          </View>

          {/* Right Opponent */}
          <View style={styles.rightArea}>
            {renderPlayerNameplate(players[3], true)}
            <ScrollView>
              <View style={styles.opponentCardsVertical}>
                {players[3]?.hand?.map((card, index) => (
                  <View key={card.id} style={{ marginTop: index > 0 ? -25 : 0 }}>
                    <Card card={card} isOpponent={true} />
                  </View>
                ))}
              </View>
            </ScrollView>
          </View>
        </View>

        {/* Bottom - You */}
        <View style={styles.bottomArea}>
          {renderPlayerNameplate(players[0])}
          <ScrollView horizontal>
            <View style={styles.yourCards}>
              {players[0]?.hand?.map(card => (
                <Card 
                  key={card.id}
                  card={card}
                  onPress={(selectedCard) => playCard(selectedCard, 0)}
                  isPlayable={currentPlayer === 0 && gamePhase === "playing" && !isProcessing}
                  isOpponent={false}
                />
              ))}
            </View>
          </ScrollView>
        </View>
      </View>

      {renderBidding()}
      {renderGameOver()}
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'transparent',
  },

  // Header
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    margin: 5,
    padding: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#ffd700',
  },
  debug: {
    color: '#ffff00',
    fontSize: 11,
    fontWeight: 'bold',
  },
  quarter: {
    color: '#ffd700',
    fontSize: 14,
    fontWeight: 'bold',
  },

  // Scoreboard
  scoreboardContainer: {
    marginHorizontal: 5,
    marginBottom: 5,
  },
  scoreboardFrame: {
    borderRadius: 15,
    padding: 3,
    borderWidth: 2,
    borderColor: '#8b6910',
    position: 'relative',
  },
  rivet: {
    position: 'absolute',
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#ffd700',
    borderWidth: 2,
    borderColor: '#8b6910',
    zIndex: 10,
  },
  scoreboardScreen: {
    borderRadius: 12,
    padding: 10,
    borderWidth: 1,
    borderColor: '#0f0',
  },
  scoreboardTitle: {
    color: '#ffd700',
    fontSize: 12,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 5,
  },
  scoreboardRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  scoreboardCell: {
    alignItems: 'center',
    flex: 1,
    padding: 5,
    borderRadius: 8,
  },
  activeCell: {
    backgroundColor: 'rgba(255,215,0,0.2)',
    borderWidth: 1,
    borderColor: '#ffd700',
  },
  scoreboardTeam: {
    color: '#87CEEB',
    fontSize: 11,
    fontWeight: 'bold',
  },
  scoreboardScore: {
    color: '#ffd700',
    fontSize: 22,
    fontWeight: 'bold',
  },
  scoreboardDetails: {
    flexDirection: 'row',
    gap: 8,
  },
  scoreboardBid: {
    color: '#87CEEB',
    fontSize: 9,
    fontWeight: 'bold',
  },
  scoreboardBags: {
    color: '#ff6b6b',
    fontSize: 9,
    fontWeight: 'bold',
  },
  trickIndicator: {
    position: 'absolute',
    top: 2,
    right: 2,
    backgroundColor: 'rgba(255,0,0,0.3)',
    borderRadius: 10,
    paddingHorizontal: 4,
  },
  trickIndicatorText: {
    color: '#ffd700',
    fontSize: 8,
    fontWeight: 'bold',
  },
  ledTicker: {
    marginTop: 5,
    paddingTop: 5,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,215,0,0.3)',
    alignItems: 'center',
  },
  ledTickerText: {
    color: '#ffd700',
    fontSize: 8,
    letterSpacing: 1,
  },

  // Nameplates
  nameplateContainer: {
    marginVertical: 2,
  },
  nameplateContainerVertical: {
    transform: [{ rotate: '-90deg' }],
    width: 100,
    marginVertical: 20,
  },
  nameplate: {
    paddingHorizontal: 15,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: '#8b6910',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    position: 'relative',
  },
  nameplateVertical: {
    transform: [{ rotate: '90deg' }],
    width: 100,
  },
  activeNameplate: {
    borderColor: '#ffd700',
  },
  screw: {
    position: 'absolute',
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#ffd700',
    borderWidth: 1,
    borderColor: '#8b6910',
  },
  screwTL: { top: 3, left: 3 },
  screwTR: { top: 3, right: 3 },
  screwBL: { bottom: 3, left: 3 },
  screwBR: { bottom: 3, right: 3 },
  nameplateName: {
    color: '#fff',
    fontSize: 10,
    fontWeight: 'bold',
  },
  nameplateStats: {
    flexDirection: 'row',
    gap: 8,
  },
  nameplateBid: {
    color: '#ffd700',
    fontSize: 9,
    fontWeight: 'bold',
  },
  nameplateCards: {
    color: '#87CEEB',
    fontSize: 9,
    fontWeight: 'bold',
  },

  // Trick Area
  projectorContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  projectorBody: {
    borderRadius: 15,
    padding: 15,
    borderWidth: 2,
    borderColor: '#8b6910',
    alignItems: 'center',
    minWidth: 160,
  },
  lensOuter: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#4a4a4a',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
    borderWidth: 2,
    borderColor: '#8b6910',
  },
  lensInner: {
    width: 35,
    height: 35,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ffd700',
  },
  projectorLabel: {
    color: '#ffd700',
    fontSize: 12,
  },
  projectorScreen: {
    minHeight: 60,
    flexDirection: 'row',
    justifyContent: 'center',
    flexWrap: 'wrap',
  },
  projectorCard: {
    margin: 2,
  },
  projectorCardInner: {
    width: 40,
    height: 50,
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#ffd700',
    position: 'relative',
  },
  projectorCardValue: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  projectorCardIndicator: {
    position: 'absolute',
    bottom: 2,
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  projectorStandby: {
    padding: 10,
  },
  projectorStandbyText: {
    color: 'rgba(255,255,255,0.5)',
    fontSize: 10,
  },
  driveInfo: {
    marginTop: 5,
  },
  driveText: {
    color: '#ffd700',
    fontSize: 9,
    fontWeight: 'bold',
  },

  // Bidding
  playbookOverlay: {
    position: 'absolute',
    top: '25%',
    left: '10%',
    right: '10%',
    zIndex: 20,
  },
  playbook: {
    borderRadius: 20,
    padding: 20,
    borderWidth: 3,
    borderColor: '#8b6910',
  },
  playbookTitle: {
    color: '#ffd700',
    fontSize: 22,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 5,
  },
  playbookSubtitle: {
    color: '#fff',
    fontSize: 14,
    textAlign: 'center',
  },
  playbookRibbon: {
    backgroundColor: 'rgba(255,0,0,0.2)',
    padding: 5,
    borderRadius: 15,
    alignSelf: 'center',
    marginVertical: 10,
  },
  playbookRibbonText: {
    color: '#ff6b6b',
    fontSize: 10,
    fontWeight: 'bold',
  },
  playbookButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 5,
  },
  playbookButton: {
    width: 55,
    height: 55,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#8b6910',
  },
  playbookButtonSelected: {
    borderColor: '#ffd700',
    transform: [{ scale: 1.1 }],
  },
  playbookButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },

  // Game Over
  trophyCase: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 30,
  },
  trophyCaseInner: {
    padding: 30,
    borderRadius: 20,
    borderWidth: 3,
    borderColor: '#ffd700',
    alignItems: 'center',
    width: '80%',
  },
  trophyTitle: {
    color: '#ffd700',
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 10,
  },
  trophyWinner: {
    color: '#fff',
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  trophyScore: {
    color: '#87CEEB',
    fontSize: 16,
    marginBottom: 20,
  },
  trophyButton: {
    paddingHorizontal: 25,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: '#ffd700',
  },
  trophyButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },

  // Layout
  gameArea: {
    flex: 1,
    marginHorizontal: 5,
  },
  topArea: {
    height: '22%',
    alignItems: 'center',
  },
  middleRow: {
    flex: 1,
    flexDirection: 'row',
  },
  leftArea: {
    width: '20%',
    alignItems: 'center',
  },
  centerArea: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rightArea: {
    width: '20%',
    alignItems: 'center',
  },
  bottomArea: {
    height: '28%',
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  opponentCards: {
    flexDirection: 'row',
  },
  opponentCardsVertical: {
    alignItems: 'center',
  },
  yourCards: {
    flexDirection: 'row',
    paddingVertical: 5,
  },
});

export default GameBoard;
