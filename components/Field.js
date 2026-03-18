import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

const Field = () => {
  return (
    <View style={styles.fieldContainer}>
      <LinearGradient
        colors={['rgba(0,100,0,0.3)', 'rgba(0,80,0,0.35)', 'rgba(0,60,0,0.4)']}
        style={styles.field}
      >
        {/* Yard lines */}
        {[...Array(11)].map((_, i) => (
          <View key={i} style={[styles.yardLine, { left: `${(i + 1) * 9.09}%` }]} />
        ))}
        
        {/* 50-yard line */}
        <View style={styles.fiftyYardLine} />
        <Text style={styles.fiftyText}>50</Text>
        
        {/* Field numbers */}
        <Text style={[styles.fieldNumber, { left: '10%' }]}>10</Text>
        <Text style={[styles.fieldNumber, { left: '20%' }]}>20</Text>
        <Text style={[styles.fieldNumber, { left: '30%' }]}>30</Text>
        <Text style={[styles.fieldNumber, { left: '40%' }]}>40</Text>
        <Text style={[styles.fieldNumber, { left: '60%' }]}>40</Text>
        <Text style={[styles.fieldNumber, { left: '70%' }]}>30</Text>
        <Text style={[styles.fieldNumber, { left: '80%' }]}>20</Text>
        <Text style={[styles.fieldNumber, { left: '90%' }]}>10</Text>
        
        {/* End Zones */}
        <View style={[styles.endZone, styles.leftEndZone]}>
          <Text style={styles.endZoneText}>END ZONE</Text>
        </View>
        <View style={[styles.endZone, styles.rightEndZone]}>
          <Text style={styles.endZoneText}>END ZONE</Text>
        </View>
        
        {/* Center logo */}
        <View style={styles.centerLogo}>
          <Text style={styles.centerLogoText}>🏈</Text>
        </View>
      </LinearGradient>
    </View>
  );
};

const styles = StyleSheet.create({
  fieldContainer: {
    position: 'absolute',
    top: '12%',
    bottom: '12%',
    left: '5%',
    right: '5%',
    zIndex: -1,
  },
  field: {
    width: '100%',
    height: '100%',
    borderRadius: 20,
    borderWidth: 2,
    borderColor: '#fff',
    overflow: 'hidden',
    position: 'relative',
  },
  yardLine: {
    position: 'absolute',
    width: 1,
    height: '100%',
    backgroundColor: 'rgba(255,255,255,0.3)',
  },
  fiftyYardLine: {
    position: 'absolute',
    left: '50%',
    width: 2,
    height: '100%',
    backgroundColor: 'rgba(255,215,0,0.6)',
    marginLeft: -1,
  },
  fiftyText: {
    position: 'absolute',
    left: '50%',
    top: '10%',
    color: 'rgba(255,215,0,0.6)',
    fontSize: 12,
    fontWeight: 'bold',
    marginLeft: -8,
  },
  fieldNumber: {
    position: 'absolute',
    bottom: '5%',
    color: 'rgba(255,255,255,0.4)',
    fontSize: 10,
    fontWeight: 'bold',
  },
  endZone: {
    position: 'absolute',
    width: '10%',
    height: '100%',
    backgroundColor: 'rgba(255,0,0,0.15)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  leftEndZone: {
    left: 0,
    borderRightWidth: 1,
    borderRightColor: '#fff',
  },
  rightEndZone: {
    right: 0,
    borderLeftWidth: 1,
    borderLeftColor: '#fff',
  },
  endZoneText: {
    color: 'rgba(255,255,255,0.4)',
    fontSize: 10,
    fontWeight: 'bold',
    transform: [{ rotate: '-90deg' }],
  },
  centerLogo: {
    position: 'absolute',
    top: '40%',
    left: '40%',
    width: '20%',
    height: '20%',
    backgroundColor: 'rgba(255,215,0,0.1)',
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,215,0,0.3)',
  },
  centerLogoText: {
    fontSize: 24,
    opacity: 0.5,
  },
});

export default Field;
