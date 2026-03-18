import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, { Path } from 'react-native-svg';

const WelcomeScreen = ({ onStart }) => {
  const [playerName, setPlayerName] = useState('');
  const [showRules, setShowRules] = useState(false);

  const handleStart = () => {
    onStart(playerName.trim() || "Coach");
  };

  const renderRules = () => (
    <View style={styles.rulesContainer}>
      <Text style={styles.rulesTitle}>🏈 COACH'S PLAYBOOK</Text>
      
      <View style={styles.ruleSection}>
        <Text style={styles.ruleHeader}>📋 BIDDING</Text>
        <Text style={styles.ruleText}>• Each player predicts how many tricks (touchdowns) they'll win</Text>
        <Text style={styles.ruleText}>• Bid 0-13 • 0 = SHUTOUT ATTEMPT</Text>
      </View>

      <View style={styles.ruleSection}>
        <Text style={styles.ruleHeader}>🏆 SCORING</Text>
        <Text style={styles.ruleText}>• Win a trick = +7 points (TOUCHDOWN!)</Text>
        <Text style={styles.ruleText}>• Make your bid = No adjustment</Text>
        <Text style={styles.ruleText}>• Miss your bid = -7 per trick short (OFFSIDES)</Text>
        <Text style={styles.ruleText}>• Extra tricks beyond bid = +3 each (FIELD GOAL)</Text>
        <Text style={styles.ruleText}>• Successful shutout (bid 0, take 0) = +14</Text>
        <Text style={styles.ruleText}>• Failed shutout = -14</Text>
      </View>

      <View style={styles.ruleSection}>
        <Text style={styles.ruleHeader}>👜 PENALTIES (BAGS)</Text>
        <Text style={styles.ruleText}>• Each extra trick beyond your bid = 1 bag</Text>
        <Text style={styles.ruleText}>• 10 bags = -14 point penalty (PERSONAL FOUL)</Text>
      </View>

      <View style={styles.ruleSection}>
        <Text style={styles.ruleHeader}>♠️ SECONDARY (SPADES)</Text>
        <Text style={styles.ruleText}>• Spades beat all other suits</Text>
        <Text style={styles.ruleText}>• Cannot lead with spades until "broken"</Text>
        <Text style={styles.ruleText}>• Spades break when played on another suit</Text>
      </View>

      <View style={styles.ruleSection}>
        <Text style={styles.ruleHeader}>🏆 WINNING</Text>
        <Text style={styles.ruleText}>• First to 70 points wins</Text>
        <Text style={styles.ruleText}>• Game ends immediately</Text>
      </View>

      <TouchableOpacity 
        style={styles.gotItButton}
        onPress={() => setShowRules(false)}
      >
        <Text style={styles.gotItText}>GOT IT</Text>
      </TouchableOpacity>
    </View>
  );

  if (showRules) {
    return (
      <LinearGradient colors={['#0a3d0a', '#1a4d1a']} style={styles.container}>
        <ScrollView contentContainerStyle={styles.scrollContent}>
          {renderRules()}
        </ScrollView>
      </LinearGradient>
    );
  }

  return (
    <LinearGradient colors={['#0a3d0a', '#1a4d1a']} style={styles.container}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.content}
      >
        {/* Football Logo */}
        <View style={styles.logoContainer}>
          <Svg width="120" height="120" viewBox="0 0 100 100">
            <Path d="M30 20 Q50 10, 70 20 L70 80 Q50 90, 30 80 Z" fill="#8B4513" stroke="#FFD700" strokeWidth="4" />
            <Path d="M45 30 L55 30 M45 40 L55 40 M45 50 L55 50 M45 60 L55 60" stroke="#FFD700" strokeWidth="3" />
          </Svg>
          <Text style={styles.title}>FOOTBALL SPADES</Text>
          <Text style={styles.subtitle}>COACH'S EDITION</Text>
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>ENTER YOUR NAME:</Text>
          <TextInput
            style={styles.input}
            placeholder="Coach"
            placeholderTextColor="rgba(255,255,255,0.5)"
            value={playerName}
            onChangeText={setPlayerName}
            maxLength={20}
            autoCapitalize="words"
          />
        </View>

        <View style={styles.buttonContainer}>
          <TouchableOpacity 
            style={styles.rulesButton}
            onPress={() => setShowRules(true)}
          >
            <Text style={styles.rulesButtonText}>📋 GAME RULES</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.startButton}
            onPress={handleStart}
          >
            <LinearGradient colors={['#4CAF50', '#2E7D32']} style={styles.startButtonGradient}>
              <Text style={styles.startButtonText}>KICKOFF 🏈</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>Version 2.0.0 • COACH'S EDITION</Text>
        </View>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    justifyContent: 'space-between',
    padding: 20,
    paddingTop: 60,
    paddingBottom: 30,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 20,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 40,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFD700',
    marginTop: 20,
    textShadowColor: '#000',
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 5,
    letterSpacing: 2,
  },
  subtitle: {
    fontSize: 14,
    color: '#87CEEB',
    marginTop: 5,
    letterSpacing: 3,
    fontWeight: '600',
  },
  inputContainer: {
    marginBottom: 30,
  },
  label: {
    color: '#FFD700',
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 8,
    letterSpacing: 1,
  },
  input: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderWidth: 2,
    borderColor: '#FFD700',
    borderRadius: 12,
    padding: 15,
    fontSize: 18,
    color: '#fff',
    fontWeight: '600',
  },
  buttonContainer: {
    gap: 15,
  },
  rulesButton: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderWidth: 2,
    borderColor: '#87CEEB',
    borderRadius: 12,
    padding: 15,
    alignItems: 'center',
  },
  rulesButtonText: {
    color: '#87CEEB',
    fontSize: 16,
    fontWeight: 'bold',
    letterSpacing: 1,
  },
  startButton: {
    borderRadius: 12,
    overflow: 'hidden',
    elevation: 5,
  },
  startButtonGradient: {
    padding: 18,
    alignItems: 'center',
  },
  startButtonText: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
    letterSpacing: 2,
  },
  footer: {
    alignItems: 'center',
    marginTop: 40,
  },
  footerText: {
    color: 'rgba(255,255,255,0.3)',
    fontSize: 10,
  },
  rulesContainer: {
    backgroundColor: 'rgba(0,0,0,0.8)',
    borderRadius: 20,
    padding: 20,
    borderWidth: 3,
    borderColor: '#FFD700',
  },
  rulesTitle: {
    color: '#FFD700',
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
    letterSpacing: 2,
  },
  ruleSection: {
    marginBottom: 20,
  },
  ruleHeader: {
    color: '#87CEEB',
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
    letterSpacing: 1,
  },
  ruleText: {
    color: '#fff',
    fontSize: 12,
    lineHeight: 18,
    marginLeft: 10,
    marginBottom: 4,
  },
  gotItButton: {
    backgroundColor: '#4CAF50',
    padding: 15,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 10,
  },
  gotItText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    letterSpacing: 1,
  },
});

export default WelcomeScreen;
