import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

const StatsScreen = ({ stats, tendencies, onClose }) => {
  // Default stats if not provided
  const defaultStats = {
    gamesPlayed: 0,
    wins: 0,
    losses: 0,
    winPercentage: 0,
    totalTouchdowns: 0,
    totalFieldGoals: 0,
    totalShutouts: 0,
    totalBags: 0,
    biggestWin: 0,
    currentStreak: 0,
    longestStreak: 0,
    vsBelichick: { wins: 0, losses: 0 },
    vsTomlin: { wins: 0, losses: 0 },
    vsRivera: { wins: 0, losses: 0 },
  };

  const displayStats = stats || defaultStats;
  const displayTendencies = tendencies || { player: {} };

  return (
    <View style={styles.container}>
      <LinearGradient colors={['#0a3d0a', '#1a4d1a']} style={styles.content}>
        <Text style={styles.title}>📊 COACH'S RECORD</Text>
        
        <ScrollView showsVerticalScrollIndicator={false}>
          {/* Career Overview */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>🏆 CAREER</Text>
            <View style={styles.statRow}>
              <Text style={styles.statLabel}>Games:</Text>
              <Text style={styles.statValue}>{displayStats.gamesPlayed}</Text>
            </View>
            <View style={styles.statRow}>
              <Text style={styles.statLabel}>Record:</Text>
              <Text style={styles.statValue}>{displayStats.wins}-{displayStats.losses}</Text>
            </View>
            <View style={styles.statRow}>
              <Text style={styles.statLabel}>Win %:</Text>
              <Text style={styles.statValue}>{displayStats.winPercentage}%</Text>
            </View>
            <View style={styles.statRow}>
              <Text style={styles.statLabel}>Streak:</Text>
              <Text style={[
                styles.statValue,
                displayStats.currentStreak > 0 ? styles.winText : styles.lossText
              ]}>
                {displayStats.currentStreak > 0 ? `🔥 ${displayStats.currentStreak}` : `💔 ${Math.abs(displayStats.currentStreak)}`}
              </Text>
            </View>
            <View style={styles.statRow}>
              <Text style={styles.statLabel}>Longest Streak:</Text>
              <Text style={styles.statValue}>🔥 {displayStats.longestStreak}</Text>
            </View>
          </View>

          {/* Scoring Stats */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>🏈 OFFENSE</Text>
            <View style={styles.statRow}>
              <Text style={styles.statLabel}>Total TDs:</Text>
              <Text style={styles.statValue}>{displayStats.totalTouchdowns}</Text>
            </View>
            <View style={styles.statRow}>
              <Text style={styles.statLabel}>Field Goals:</Text>
              <Text style={styles.statValue}>{displayStats.totalFieldGoals}</Text>
            </View>
            <View style={styles.statRow}>
              <Text style={styles.statLabel}>Shutouts:</Text>
              <Text style={styles.statValue}>{displayStats.totalShutouts}</Text>
            </View>
            <View style={styles.statRow}>
              <Text style={styles.statLabel}>Biggest Win:</Text>
              <Text style={styles.statValue}>{displayStats.biggestWin} pts</Text>
            </View>
          </View>

          {/* Penalties */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>👜 PENALTIES</Text>
            <View style={styles.statRow}>
              <Text style={styles.statLabel}>Total Bags:</Text>
              <Text style={styles.statValue}>{displayStats.totalBags}</Text>
            </View>
          </View>

          {/* Head-to-Head */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>🤔 VS COACHES</Text>
            <View style={styles.statRow}>
              <Text style={styles.statLabel}>😈 Belichick:</Text>
              <Text style={styles.statValue}>{displayStats.vsBelichick.wins}-{displayStats.vsBelichick.losses}</Text>
            </View>
            <View style={styles.statRow}>
              <Text style={styles.statLabel}>🤔 Tomlin:</Text>
              <Text style={styles.statValue}>{displayStats.vsTomlin.wins}-{displayStats.vsTomlin.losses}</Text>
            </View>
            <View style={styles.statRow}>
              <Text style={styles.statLabel}>😅 Rivera:</Text>
              <Text style={styles.statValue}>{displayStats.vsRivera.wins}-{displayStats.vsRivera.losses}</Text>
            </View>
          </View>

          {/* Player Tendencies */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>🔍 YOUR STYLE</Text>
            {displayTendencies.player?.aggressiveBidder && (
              <View style={styles.tendencyRow}>
                <Text style={styles.tendencyEmoji}>🎯</Text>
                <Text style={styles.tendencyText}>Aggressive bidder</Text>
              </View>
            )}
            {displayTendencies.player?.nilBluffer && (
              <View style={styles.tendencyRow}>
                <Text style={styles.tendencyEmoji}>🃏</Text>
                <Text style={styles.tendencyText}>Nil bluffer</Text>
              </View>
            )}
            {displayTendencies.player?.spadeLover && (
              <View style={styles.tendencyRow}>
                <Text style={styles.tendencyEmoji}>♠️</Text>
                <Text style={styles.tendencyText}>Spade lover</Text>
              </View>
            )}
            {!displayTendencies.player?.aggressiveBidder && 
             !displayTendencies.player?.nilBluffer && 
             !displayTendencies.player?.spadeLover && (
              <View style={styles.tendencyRow}>
                <Text style={styles.tendencyEmoji}>📋</Text>
                <Text style={styles.tendencyText}>Still learning your style</Text>
              </View>
            )}
          </View>
        </ScrollView>

        <TouchableOpacity style={styles.closeButton} onPress={onClose}>
          <LinearGradient
            colors={['#4CAF50', '#2E7D32']}
            style={styles.closeButtonGradient}
          >
            <Text style={styles.closeText}>BACK TO GAME</Text>
          </LinearGradient>
        </TouchableOpacity>
      </LinearGradient>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 40,
  },
  content: {
    flex: 1,
    padding: 20,
    paddingTop: 50,
  },
  title: {
    color: '#ffd700',
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
    letterSpacing: 2,
    textShadowColor: '#000',
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 5,
  },
  section: {
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: 10,
    padding: 15,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#ffd700',
  },
  sectionTitle: {
    color: '#87CEEB',
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,215,0,0.3)',
    paddingBottom: 5,
  },
  statRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 3,
  },
  statLabel: {
    color: '#fff',
    fontSize: 14,
  },
  statValue: {
    color: '#ffd700',
    fontSize: 14,
    fontWeight: 'bold',
  },
  winText: {
    color: '#4CAF50',
  },
  lossText: {
    color: '#ff6b6b',
  },
  tendencyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 4,
    backgroundColor: 'rgba(255,215,0,0.1)',
    padding: 8,
    borderRadius: 8,
  },
  tendencyEmoji: {
    fontSize: 16,
    marginRight: 8,
  },
  tendencyText: {
    color: '#87CEEB',
    fontSize: 12,
    fontStyle: 'italic',
  },
  closeButton: {
    marginTop: 10,
    borderRadius: 10,
    overflow: 'hidden',
  },
  closeButtonGradient: {
    padding: 15,
    alignItems: 'center',
  },
  closeText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    letterSpacing: 1,
  },
});

export default StatsScreen;
