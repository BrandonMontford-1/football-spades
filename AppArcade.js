import React, { useState } from 'react';
import { StyleSheet, StatusBar } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import GameBoardArcade from './components/GameBoardArcade';
import WelcomeScreen from './components/WelcomeScreen';
import { useArcadeState } from './hooks/useArcadeState';

export default function AppArcade() {
  const [gameStarted, setGameStarted] = useState(false);
  const [playerName, setPlayerName] = useState('Coach');
  const [difficulty, setDifficulty] = useState('medium');
  const [bagPenalty, setBagPenalty] = useState(true);
  const [winTarget, setWinTarget] = useState(70);
  const [blindNil, setBlindNil] = useState(false);
  const [cardBack, setCardBack] = useState('football');
  const [tableTheme, setTableTheme] = useState('grass');
  const [showTutorial, setShowTutorial] = useState(true);
  
  const gameState = useArcadeState(difficulty, bagPenalty, winTarget, blindNil, cardBack, tableTheme);

  const handleGameStart = (name, selectedDifficulty, selectedBagPenalty, selectedWinTarget, selectedBlindNil, selectedCardBack, selectedTableTheme, selectedShowTutorial) => {
    setPlayerName(name);
    setDifficulty(selectedDifficulty);
    setBagPenalty(selectedBagPenalty);
    setWinTarget(selectedWinTarget);
    setBlindNil(selectedBlindNil);
    setCardBack(selectedCardBack);
    setTableTheme(selectedTableTheme);
    setShowTutorial(selectedShowTutorial);
    setGameStarted(true);
  };

  if (!gameStarted) {
    return <WelcomeScreen onStart={handleGameStart} />;
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#0a3d0a" />
      <GameBoardArcade
        players={gameState.players.map(p => p.id === 0 ? { ...p, name: playerName } : p)}
        currentPlayer={gameState.currentPlayer}
        currentTrick={gameState.currentTrick}
        gamePhase={gameState.gamePhase}
        spadesBroken={gameState.spadesBroken}
        isProcessing={gameState.isProcessing}
        debug={gameState.debug}
        roundNumber={gameState.roundNumber}
        scoreHistory={gameState.scoreHistory}
        gameTimeLeft={gameState.gameTimeLeft}
        turnTimeLeft={gameState.turnTimeLeft}
        blindNilAvailable={gameState.blindNilAvailable}
        isBlindNil={gameState.isBlindNil}
        setIsBlindNil={gameState.setIsBlindNil}
        makeBid={gameState.makeBid}
        playCard={(card) => gameState.playCard(card, 0)}
        resetGame={gameState.resetGame}
        cardBack={cardBack}
        tableTheme={tableTheme}
        showTutorial={showTutorial}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0a3d0a',
  },
});
