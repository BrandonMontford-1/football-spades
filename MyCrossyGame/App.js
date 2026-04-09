import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  PanResponder,
  Alert,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';

const { width, height } = Dimensions.get('window');
const GRID_SIZE = 9; // 9x9 grid
const CELL_SIZE = Math.min(width, height) / GRID_SIZE;
const BOARD_SIZE = CELL_SIZE * GRID_SIZE;
const OFFSET_X = (width - BOARD_SIZE) / 2;
const OFFSET_Y = (height - BOARD_SIZE - 100) / 2;

// Game colors - bright and fun like Crossy Road
const COLORS = {
  grass: '#7cb518',
  road: '#3a3a3a',
  water: '#2c7da0',
  player: '#ffd166',
  enemy: '#ef476f',
  star: '#ffd700',
  finish: '#06d6a0',
};

export default function CrossyStyleGame() {
  const [playerPos, setPlayerPos] = useState({ x: 4, y: 8 });
  const [enemies, setEnemies] = useState([]);
  const [stars, setStars] = useState([]);
  const [score, setScore] = useState(0);
  const [gameState, setGameState] = useState('playing'); // playing, gameOver, win
  const [moveCounter, setMoveCounter] = useState(0);
  
  // Define the game board layout
  const boardLayout = [
    'finish', 'finish', 'finish', 'finish', 'finish', 'finish', 'finish', 'finish', 'finish',
    'road', 'road', 'road', 'road', 'road', 'road', 'road', 'road', 'road',
    'grass', 'grass', 'grass', 'grass', 'grass', 'grass', 'grass', 'grass', 'grass',
    'road', 'road', 'road', 'road', 'road', 'road', 'road', 'road', 'road',
    'grass', 'grass', 'grass', 'grass', 'grass', 'grass', 'grass', 'grass', 'grass',
    'road', 'road', 'road', 'road', 'road', 'road', 'road', 'road', 'road',
    'grass', 'grass', 'grass', 'grass', 'grass', 'grass', 'grass', 'grass', 'grass',
    'road', 'road', 'road', 'road', 'road', 'road', 'road', 'road', 'road',
    'start', 'start', 'start', 'start', 'start', 'start', 'start', 'start', 'start',
  ];

  // Initialize enemies and stars
  useEffect(() => {
    startNewGame();
  }, []);

  const startNewGame = () => {
    const newEnemies = [];
    const newStars = [];
    
    // Add enemies on road rows
    for (let row = 0; row < GRID_SIZE; row++) {
      const tileType = boardLayout[row * GRID_SIZE];
      if (tileType === 'road') {
        const numEnemies = Math.floor(Math.random() * 3) + 1;
        for (let i = 0; i < numEnemies; i++) {
          newEnemies.push({
            id: Math.random(),
            x: Math.floor(Math.random() * GRID_SIZE),
            y: row,
            direction: Math.random() > 0.5 ? 'right' : 'left',
          });
        }
      }
      // Add stars on grass rows
      if (tileType === 'grass') {
        if (Math.random() > 0.7) {
          newStars.push({
            id: Math.random(),
            x: Math.floor(Math.random() * GRID_SIZE),
            y: row,
            collected: false,
          });
        }
      }
    }
    
    setEnemies(newEnemies);
    setStars(newStars);
    setPlayerPos({ x: 4, y: 8 });
    setScore(0);
    setGameState('playing');
    setMoveCounter(0);
  };

  // Move enemies (simple AI)
  useEffect(() => {
    if (gameState !== 'playing') return;
    
    const interval = setInterval(() => {
      setEnemies(prevEnemies => 
        prevEnemies.map(enemy => {
          let newX = enemy.x + (enemy.direction === 'right' ? 1 : -1);
          // Wrap around screen
          if (newX >= GRID_SIZE) newX = 0;
          if (newX < 0) newX = GRID_SIZE - 1;
          return { ...enemy, x: newX };
        })
      );
    }, 500);
    
    return () => clearInterval(interval);
  }, [gameState]);

  // Check collisions
  useEffect(() => {
    if (gameState !== 'playing') return;
    
    // Check enemy collision
    const hitByEnemy = enemies.some(enemy => 
      enemy.x === playerPos.x && enemy.y === playerPos.y
    );
    
    if (hitByEnemy) {
      setGameState('gameOver');
      return;
    }
    
    // Check star collection
    setStars(prevStars => {
      const newStars = [...prevStars];
      let starsCollected = 0;
      
      for (let i = 0; i < newStars.length; i++) {
        if (!newStars[i].collected && 
            newStars[i].x === playerPos.x && 
            newStars[i].y === playerPos.y) {
          newStars[i].collected = true;
          starsCollected++;
        }
      }
      
      if (starsCollected > 0) {
        setScore(prev => prev + starsCollected * 10);
      }
      
      return newStars;
    });
    
    // Check win condition (reached top)
    if (playerPos.y === 0) {
      const tileType = boardLayout[0];
      if (tileType === 'finish') {
        setGameState('win');
      }
    }
  }, [playerPos, enemies, gameState]);

  // Movement controls
  const movePlayer = (dx, dy) => {
    if (gameState !== 'playing') return;
    
    const newX = playerPos.x + dx;
    const newY = playerPos.y + dy;
    
    // Check boundaries
    if (newX < 0 || newX >= GRID_SIZE) return;
    if (newY < 0 || newY >= GRID_SIZE) return;
    
    // Check if tile is walkable (start and grass are walkable)
    const tileIndex = newY * GRID_SIZE;
    const tileType = boardLayout[tileIndex];
    
    if (tileType === 'road' || tileType === 'grass' || tileType === 'start' || tileType === 'finish') {
      setPlayerPos({ x: newX, y: newY });
      setMoveCounter(prev => prev + 1);
    }
  };

  // Touch controls
  const handleSwipe = (dx, dy) => {
    if (Math.abs(dx) > Math.abs(dy)) {
      // Horizontal swipe
      if (dx > 0) movePlayer(1, 0);
      else movePlayer(-1, 0);
    } else {
      // Vertical swipe
      if (dy > 0) movePlayer(0, 1);
      else movePlayer(0, -1);
    }
  };

  // PanResponder for swipe detection
  const panResponder = PanResponder.create({
    onStartShouldSetPanResponder: () => true,
    onPanResponderRelease: (evt, gestureState) => {
      const { dx, dy } = gestureState;
      if (Math.abs(dx) > 20 || Math.abs(dy) > 20) {
        handleSwipe(dx, dy);
      }
    },
  });

  // Get tile color based on position
  const getTileColor = (x, y) => {
    const tileIndex = y * GRID_SIZE + x;
    const tileType = boardLayout[tileIndex];
    
    switch(tileType) {
      case 'grass': return COLORS.grass;
      case 'road': return COLORS.road;
      case 'water': return COLORS.water;
      case 'start': return COLORS.grass;
      case 'finish': return COLORS.finish;
      default: return COLORS.grass;
    }
  };

  // Render game board
  const renderBoard = () => {
    const tiles = [];
    
    for (let y = 0; y < GRID_SIZE; y++) {
      for (let x = 0; x < GRID_SIZE; x++) {
        const isPlayer = playerPos.x === x && playerPos.y === y;
        const isEnemy = enemies.some(e => e.x === x && e.y === y);
        const isStar = stars.some(s => s.x === x && s.y === y && !s.collected);
        const tileColor = getTileColor(x, y);
        
        tiles.push(
          <View
            key={`${x}-${y}`}
            style={[
              styles.tile,
              {
                left: OFFSET_X + x * CELL_SIZE,
                top: OFFSET_Y + y * CELL_SIZE,
                width: CELL_SIZE,
                height: CELL_SIZE,
                backgroundColor: tileColor,
              },
            ]}
          >
            {isPlayer && <Text style={styles.playerEmoji}>🐸</Text>}
            {isEnemy && <Text style={styles.enemyEmoji}>🚗</Text>}
            {isStar && <Text style={styles.starEmoji}>⭐</Text>}
          </View>
        );
      }
    }
    
    return tiles;
  };

  return (
    <View style={styles.container} {...panResponder.panHandlers}>
      <StatusBar style="light" />
      
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.scoreText}>Score: {score}</Text>
        <Text style={styles.movesText}>Moves: {moveCounter}</Text>
      </View>
      
      {/* Game Board */}
      <View style={styles.boardContainer}>
        {renderBoard()}
      </View>
      
      {/* Controls hint */}
      <View style={styles.controlsHint}>
        <Text style={styles.hintText}>👆 Swipe up/down/left/right to move</Text>
      </View>
      
      {/* Game Over / Win Modal */}
      {(gameState === 'gameOver' || gameState === 'win') && (
        <View style={styles.modal}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>
              {gameState === 'win' ? '🎉 YOU WIN! 🎉' : '💀 GAME OVER 💀'}
            </Text>
            <Text style={styles.modalScore}>Final Score: {score}</Text>
            <Text style={styles.modalMoves}>Moves: {moveCounter}</Text>
            <TouchableOpacity style={styles.restartButton} onPress={startNewGame}>
              <Text style={styles.restartText}>PLAY AGAIN</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1a2e',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 20,
    paddingTop: 50,
    backgroundColor: '#16213e',
  },
  scoreText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#ffd700',
  },
  movesText: {
    fontSize: 18,
    color: '#fff',
  },
  boardContainer: {
    flex: 1,
    position: 'relative',
  },
  tile: {
    position: 'absolute',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 0.5,
    borderColor: 'rgba(0,0,0,0.1)',
  },
  playerEmoji: {
    fontSize: CELL_SIZE * 0.6,
  },
  enemyEmoji: {
    fontSize: CELL_SIZE * 0.5,
  },
  starEmoji: {
    fontSize: CELL_SIZE * 0.4,
  },
  controlsHint: {
    padding: 20,
    alignItems: 'center',
    backgroundColor: '#16213e',
  },
  hintText: {
    color: '#aaa',
    fontSize: 14,
  },
  modal: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.8)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#16213e',
    padding: 30,
    borderRadius: 20,
    alignItems: 'center',
    width: '80%',
  },
  modalTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#ffd700',
    marginBottom: 20,
    textAlign: 'center',
  },
  modalScore: {
    fontSize: 20,
    color: '#fff',
    marginBottom: 10,
  },
  modalMoves: {
    fontSize: 16,
    color: '#aaa',
    marginBottom: 30,
  },
  restartButton: {
    backgroundColor: '#ef476f',
    paddingHorizontal: 30,
    paddingVertical: 15,
    borderRadius: 10,
  },
  restartText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
});
