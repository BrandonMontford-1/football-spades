import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

const ScoreHistory = ({ history }) => {
  if (!history || history.length === 0) {
    return null;
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>📊 GAME HISTORY</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <View style={styles.historyContainer}>
          {history.map((entry, index) => (
            <LinearGradient
              key={index}
              colors={['rgba(0,0,0,0.8)', 'rgba(0,20,0,0.9)']}
              style={styles.historyCard}
            >
              <Text style={styles.roundText}>ROUND {entry.round}</Text>
              <Text style={styles.timeText}>{entry.timestamp}</Text>
              <View style={styles.divider} />
              {entry.scores.map((score, i) => (
                <View key={i} style={styles.scoreRow}>
                  <Text style={[
                    styles.playerName,
                    i === 0 ? styles.youText : null
                  ]}>
                    {i === 0 ? "YOU" : 
                     i === 1 ? "BELI" :
                     i === 2 ? "TOML" : "RIVA"}
                  </Text>
                  <Text style={[
                    styles.scoreValue,
                    score.score > 0 ? styles.positiveScore : 
                    score.score < 0 ? styles.negativeScore : styles.neutralScore
                  ]}>
                    {score.score > 0 ? `+${score.score}` : score.score}
                  </Text>
                  <Text style={styles.bidText}>
                    (B:{score.bid} T:{score.tricks})
                  </Text>
                </View>
              ))}
              <View style={styles.bagRow}>
                <Text style={styles.bagText}>
                  👜 {entry.scores.map(s => s.bags).reduce((a, b) => a + b, 0)} total bags
                </Text>
              </View>
            </LinearGradient>
          ))}
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 5,
    paddingHorizontal: 5,
  },
  title: {
    color: '#ffd700',
    fontSize: 12,
    fontWeight: 'bold',
    marginBottom: 5,
    letterSpacing: 1,
  },
  historyContainer: {
    flexDirection: 'row',
    paddingVertical: 2,
  },
  historyCard: {
    width: 160,
    padding: 10,
    marginRight: 8,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#ffd700',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 5,
  },
  roundText: {
    color: '#ffd700',
    fontSize: 11,
    fontWeight: 'bold',
    letterSpacing: 0.5,
  },
  timeText: {
    color: 'rgba(255,255,255,0.4)',
    fontSize: 8,
    marginBottom: 5,
  },
  divider: {
    height: 1,
    backgroundColor: 'rgba(255,215,0,0.3)',
    marginVertical: 4,
  },
  scoreRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginVertical: 2,
  },
  playerName: {
    color: '#87CEEB',
    fontSize: 9,
    width: 35,
    fontWeight: 'bold',
  },
  youText: {
    color: '#ffd700',
    fontWeight: 'bold',
  },
  scoreValue: {
    fontSize: 11,
    fontWeight: 'bold',
    width: 40,
    textAlign: 'right',
  },
  positiveScore: {
    color: '#4CAF50',
  },
  negativeScore: {
    color: '#ff6b6b',
  },
  neutralScore: {
    color: '#fff',
  },
  bidText: {
    color: 'rgba(255,255,255,0.5)',
    fontSize: 7,
    width: 45,
    textAlign: 'right',
  },
  bagRow: {
    marginTop: 5,
    paddingTop: 4,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,215,0,0.2)',
  },
  bagText: {
    color: 'rgba(255,215,0,0.6)',
    fontSize: 8,
    textAlign: 'center',
  },
});

export default ScoreHistory;
