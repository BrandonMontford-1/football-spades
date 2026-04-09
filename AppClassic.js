import React, { useState } from 'react';
import { StyleSheet, StatusBar, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import GameBoard from './components/GameBoard';
import WelcomeScreen from './components/WelcomeScreen';
import { useGameState } from './hooks/useGameState';

// Simple error handler
const ErrorFallback = ({ error, resetError }) => (
  <SafeAreaView style={styles.errorContainer}>
    <StatusBar barStyle="light-content" backgroundColor="#0a3d0a" />
    <Text style={styles.errorTitle}>Something went wrong</Text>
    <Text style={styles.errorMessage}>{error.toString()}</Text>
    <TouchableOpacity style={styles.errorButton} onPress={resetError}>
      <Text style={styles.errorButtonText}>Restart App</Text>
    </TouchableOpacity>
  </SafeAreaView>
);

export default function App() {
  const [gameStarted, setGameStarted] = useState(false);
  const [playerName, setPlayerName] = useState('Coach');
  const [hasError, setHasError] = useState(false);
  const [error, setError] = useState(null);
  
  try {
    const gameState = useGameState();

    const handleGameStart = (name) => {
      try {
        setPlayerName(name);
        setGameStarted(true);
      } catch (err) {
        setError(err);
        setHasError(true);
      }
    };

    const resetError = () => {
      setHasError(false);
      setError(null);
      setGameStarted(false);
    };

    if (hasError) {
      return <ErrorFallback error={error} resetError={resetError} />;
    }

    if (!gameStarted) {
      return <WelcomeScreen onStart={handleGameStart} />;
    }

    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="light-content" backgroundColor="#0a3d0a" />
        <GameBoard
          players={gameState.players.map(p => 
            p.id === 0 ? { ...p, name: playerName } : p
          )}
          currentPlayer={gameState.currentPlayer}
          currentTrick={gameState.currentTrick}
          gamePhase={gameState.gamePhase}
          spadesBroken={gameState.spadesBroken}
          isProcessing={gameState.isProcessing}
          debug={gameState.debug}
          roundNumber={gameState.roundNumber}
          selectedBid={gameState.selectedBid}
          setSelectedBid={gameState.setSelectedBid}
          scoreHistory={gameState.scoreHistory}
          makeBid={gameState.makeBid}
          playCard={(card) => gameState.playCard(card, 0)}
          makeComputerBids={gameState.makeComputerBids}
          resetGame={gameState.resetGame}
        />
      </SafeAreaView>
    );
  } catch (err) {
    return (
      <SafeAreaView style={styles.errorContainer}>
        <Text style={styles.errorTitle}>Fatal Error</Text>
        <Text style={styles.errorMessage}>{err.toString()}</Text>
      </SafeAreaView>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0a3d0a',
  },
  errorContainer: {
    flex: 1,
    backgroundColor: '#0a3d0a',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorTitle: {
    color: '#ffd700',
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  errorMessage: {
    color: '#ff6b6b',
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 20,
  },
  errorButton: {
    backgroundColor: '#4CAF50',
    padding: 15,
    borderRadius: 10,
  },
  errorButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
