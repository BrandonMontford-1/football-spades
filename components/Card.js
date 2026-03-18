import React, { useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';

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

const Card = ({ card, onPress, isPlayable = true, isOpponent = false }) => {
  // Animation values
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;

  const handlePressIn = () => {
    if (!isPlayable) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    Animated.spring(scaleAnim, {
      toValue: 0.95,
      friction: 5,
      useNativeDriver: true,
    }).start();
    Animated.timing(rotateAnim, {
      toValue: 1,
      duration: 100,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    if (!isPlayable) return;
    Animated.spring(scaleAnim, {
      toValue: 1,
      friction: 3,
      useNativeDriver: true,
    }).start();
    Animated.timing(rotateAnim, {
      toValue: 0,
      duration: 100,
      useNativeDriver: true,
    }).start();
  };

  const handlePress = () => {
    if (!isPlayable) return;
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    onPress(card);
  };

  // Opponent card (face down)
  if (isOpponent) {
    return (
      <Animated.View
        style={[
          styles.opponentCardContainer,
          {
            transform: [
              { scale: scaleAnim },
              {
                rotateZ: safeInterpolate(rotateAnim, [0, 1], ['0deg', '2deg'], '0deg')
              }
            ]
          }
        ]}
      >
        <LinearGradient
          colors={['#2a2a2a', '#1a1a1a', '#0a0a0a']}
          style={styles.opponentCard}
        >
          <Text style={styles.opponentCardIcon}>🏈</Text>
          <Text style={styles.opponentCardQuestion}>?</Text>
        </LinearGradient>
      </Animated.View>
    );
  }

  // Player card gradient based on suit
  const getCardGradient = () => {
    switch(card?.suit) {
      case '♠': return ['#1a1a1a', '#2d2d2d', '#000000'];
      case '♥': return ['#8b0000', '#a52a2a', '#6b0000'];
      case '♦': return ['#0066cc', '#003366', '#000066'];
      case '♣': return ['#006400', '#228b22', '#004d00'];
      default: return ['#333', '#444', '#222'];
    }
  };

  return (
    <Animated.View
      style={{
        transform: [
          { scale: scaleAnim },
          {
            rotateZ: safeInterpolate(rotateAnim, [0, 1], ['0deg', '1deg'], '0deg')
          }
        ]
      }}
    >
      <TouchableOpacity
        activeOpacity={0.9}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        onPress={handlePress}
        disabled={!isPlayable}
      >
        <LinearGradient
          colors={getCardGradient()}
          style={styles.cardContainer}
        >
          <View style={styles.cardBorder}>
            {/* Top left corner */}
            <View style={styles.cardCorner}>
              <Text style={styles.cardValue}>{card?.value}</Text>
              <Text style={styles.cardSuit}>{card?.suit}</Text>
            </View>

            {/* Center player info */}
            <View style={styles.cardCenter}>
              <Text style={styles.cardPlayer} numberOfLines={2}>
                {card?.player}
              </Text>
              <View style={styles.cardPositionBadge}>
                <Text style={styles.cardPositionText}>
                  {card?.position}
                </Text>
              </View>
              <Text style={styles.cardEra}>
                {card?.era === 'Legend' ? '🏆 HOF' : '⭐ STAR'}
              </Text>
            </View>

            {/* Bottom right corner */}
            <View style={[styles.cardCorner, styles.cardCornerBottom]}>
              <Text style={styles.cardValue}>{card?.value}</Text>
              <Text style={styles.cardSuit}>{card?.suit}</Text>
            </View>
          </View>
        </LinearGradient>
      </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  cardContainer: {
    width: 70,
    height: 100,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#ffd700',
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  cardBorder: {
    flex: 1,
    padding: 6,
    position: 'relative',
  },
  cardCorner: {
    position: 'absolute',
    top: 4,
    left: 4,
    alignItems: 'center',
  },
  cardCornerBottom: {
    top: undefined,
    bottom: 4,
    right: 4,
    left: undefined,
    transform: [{ rotate: '180deg' }],
  },
  cardValue: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
    textShadowColor: 'rgba(0,0,0,0.5)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  cardSuit: {
    color: '#ffd700',
    fontSize: 14,
    marginTop: -2,
  },
  cardCenter: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardPlayer: {
    color: '#fff',
    fontSize: 9,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 3,
    textShadowColor: 'rgba(0,0,0,0.5)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  cardPositionBadge: {
    backgroundColor: '#ffd700',
    paddingHorizontal: 5,
    paddingVertical: 1,
    borderRadius: 8,
    marginVertical: 2,
  },
  cardPositionText: {
    color: '#000',
    fontSize: 7,
    fontWeight: 'bold',
  },
  cardEra: {
    color: '#87CEEB',
    fontSize: 6,
    marginTop: 2,
  },
  
  opponentCardContainer: {
    width: 45,
    height: 65,
    marginHorizontal: 2,
  },
  opponentCard: {
    flex: 1,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#ffd700',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  opponentCardIcon: {
    color: '#ffd700',
    fontSize: 20,
    textShadowColor: 'rgba(0,0,0,0.5)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  opponentCardQuestion: {
    color: '#ffd700',
    fontSize: 8,
    marginTop: 2,
    opacity: 0.7,
  },
});

export default Card;
