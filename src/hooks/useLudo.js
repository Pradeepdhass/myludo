// Ludo Game Engine React Hook
import { useState, useEffect, useCallback, useRef } from 'react';
import { audio } from '../services/audio';
import { firebaseService } from '../services/firebase';

export const COLORS = ['yellow', 'green', 'red', 'blue'];

export const START_CELLS = {
  yellow: 1,
  green: 14,
  red: 27,
  blue: 40
};

export const SAFE_CELLS = [1, 9, 14, 22, 27, 35, 40, 48];

export const TRACK_COORDS = [
  {x: 0, y: 6}, {x: 1, y: 6}, {x: 2, y: 6}, {x: 3, y: 6}, {x: 4, y: 6}, {x: 5, y: 6},
  {x: 6, y: 5}, {x: 6, y: 4}, {x: 6, y: 3}, {x: 6, y: 2}, {x: 6, y: 1}, {x: 6, y: 0},
  {x: 7, y: 0},
  {x: 8, y: 0}, {x: 8, y: 1}, {x: 8, y: 2}, {x: 8, y: 3}, {x: 8, y: 4}, {x: 8, y: 5},
  {x: 9, y: 6}, {x: 10, y: 6}, {x: 11, y: 6}, {x: 12, y: 6}, {x: 13, y: 6}, {x: 14, y: 6},
  {x: 14, y: 7},
  {x: 14, y: 8}, {x: 13, y: 8}, {x: 12, y: 8}, {x: 11, y: 8}, {x: 10, y: 8}, {x: 9, y: 8},
  {x: 8, y: 9}, {x: 8, y: 10}, {x: 8, y: 11}, {x: 8, y: 12}, {x: 8, y: 13}, {x: 8, y: 14},
  {x: 7, y: 14},
  {x: 6, y: 14}, {x: 6, y: 13}, {x: 6, y: 12}, {x: 6, y: 11}, {x: 6, y: 10}, {x: 6, y: 9},
  {x: 5, y: 8}, {x: 4, y: 8}, {x: 3, y: 8}, {x: 2, y: 8}, {x: 1, y: 8}, {x: 0, y: 8},
  {x: 0, y: 7}
];

export const YARD_COORDS = {
  yellow: [{x: 2, y: 2}, {x: 3, y: 2}, {x: 2, y: 3}, {x: 3, y: 3}],
  green: [{x: 11, y: 2}, {x: 12, y: 2}, {x: 11, y: 3}, {x: 12, y: 3}],
  red: [{x: 11, y: 11}, {x: 12, y: 11}, {x: 11, y: 12}, {x: 12, y: 12}],
  blue: [{x: 2, y: 11}, {x: 3, y: 11}, {x: 2, y: 12}, {x: 3, y: 12}]
};

// Map logical position to board cell (x, y)
export const getTokenCoordinates = (color, tokenIdx, pos) => {
  if (pos === -1) {
    return YARD_COORDS[color][tokenIdx];
  }
  
  if (pos >= 0 && pos <= 50) {
    const start = START_CELLS[color];
    const absIdx = (start + pos) % 52;
    return TRACK_COORDS[absIdx];
  }
  
  // Home Run (51-55)
  if (pos >= 51 && pos <= 55) {
    const step = pos - 51;
    switch (color) {
      case 'yellow': return {x: 1 + step, y: 7};
      case 'green': return {x: 7, y: 1 + step};
      case 'red': return {x: 13 - step, y: 7};
      case 'blue': return {x: 7, y: 13 - step};
      default: return {x: 7, y: 7};
    }
  }
  
  // Home (56)
  switch (color) {
    case 'yellow': return {x: 6, y: 7};
    case 'green': return {x: 7, y: 6};
    case 'red': return {x: 8, y: 7};
    case 'blue': return {x: 7, y: 8};
    default: return {x: 7, y: 7};
  }
};

const initialPositions = {
  yellow: [-1, -1, -1, -1],
  green: [-1, -1, -1, -1],
  red: [-1, -1, -1, -1],
  blue: [-1, -1, -1, -1]
};

export const useLudo = () => {
  const [gameMode, setGameMode] = useState('local'); // 'local', 'ai', 'online'
  const [roomId, setRoomId] = useState(null);
  const [myPlayerId] = useState(() => {
    let id = localStorage.getItem('ludo_player_id');
    if (!id) {
      id = 'player_' + Math.random().toString(36).substr(2, 9);
      localStorage.setItem('ludo_player_id', id);
    }
    return id;
  });
  const [myColor, setMyColor] = useState('yellow');
  const [lobbyPlayers, setLobbyPlayers] = useState([]);
  
  const [gameState, setGameState] = useState('setup'); // 'setup', 'playing', 'finished'
  const [players, setPlayers] = useState({
    yellow: { name: 'Player 1', active: true, isAI: false },
    green: { name: 'Player 2', active: true, isAI: false },
    red: { name: 'Player 3', active: false, isAI: false },
    blue: { name: 'Player 4', active: false, isAI: false }
  });
  
  const [turn, setTurn] = useState('yellow');
  const [diceValue, setDiceValue] = useState(1);
  const [diceState, setDiceState] = useState('idle'); // 'idle', 'rolling', 'rolled'
  const [rolledSixCount, setRolledSixCount] = useState(0);
  const [hasPendingMove, setHasPendingMove] = useState(false);
  const [positions, setPositions] = useState(initialPositions);
  const [finishedPlayers, setFinishedPlayers] = useState([]);
  const [logs, setLogs] = useState([{ time: new Date().toLocaleTimeString(), text: 'Welcome to Ludo Professional!' }]);
  const [isMoving, setIsMoving] = useState(false); // Disable interaction during slide animations

  const syncBlocked = useRef(false);

  const addLog = useCallback((text) => {
    setLogs((prev) => [{ time: new Date().toLocaleTimeString(), text }, ...prev.slice(0, 49)]);
  }, []);

  // Check if color has won (all 4 tokens at 56)
  const checkPlayerFinished = useCallback((color, currentPos) => {
    const tokenPositions = currentPos[color];
    return tokenPositions.every(pos => pos === 56);
  }, []);

  // Compute absolute track index if on the outer track, else null
  const getAbsoluteTrackIndex = useCallback((color, relPos) => {
    if (relPos >= 0 && relPos <= 50) {
      return (START_CELLS[color] + relPos) % 52;
    }
    return null;
  }, []);

  // Check if position is a safe cell
  const isCellSafe = useCallback((color, relPos) => {
    const absIdx = getAbsoluteTrackIndex(color, relPos);
    if (absIdx === null) return false;
    return SAFE_CELLS.includes(absIdx);
  }, [getAbsoluteTrackIndex]);

  // Check if move is valid for a given token
  const getValidMoves = useCallback((color, roll, currentPos) => {
    const tokens = currentPos[color];
    const moves = [];
    
    tokens.forEach((pos, idx) => {
      if (pos === -1) {
        // Can only release on 6
        if (roll === 6) moves.push(idx);
      } else if (pos < 56) {
        // Can move if it doesn't overshoot home
        if (pos + roll <= 56) {
          moves.push(idx);
        }
      }
    });
    
    return moves;
  }, []);

  // Rotate turn to next active player
  const getNextTurn = useCallback((currentColor, currentPlayers, currentWinners) => {
    let index = COLORS.indexOf(currentColor);
    for (let i = 1; i <= 4; i++) {
      const nextIndex = (index + i) % 4;
      const nextColor = COLORS[nextIndex];
      const player = currentPlayers[nextColor];
      
      // Player must be active, and not already in the finished list
      if (player.active && !currentWinners.includes(nextColor)) {
        return nextColor;
      }
    }
    return currentColor; // Fallback
  }, []);

  // Push updates to Firestore in online mode
  const syncToFirebase = useCallback(async (updates) => {
    if (gameMode !== 'online' || !roomId) return;
    try {
      syncBlocked.current = true;
      await firebaseService.updateRoom(roomId, {
        ...updates,
        updatedAt: new Date().toISOString()
      });
      // Small timeout to let state update fire locally before enabling listeners
      setTimeout(() => {
        syncBlocked.current = false;
      }, 300);
    } catch (e) {
      console.error("Firebase Sync Error:", e);
      syncBlocked.current = false;
    }
  }, [gameMode, roomId]);

  // Core move action
  const executeMove = useCallback(async (tokenColor, tokenIdx, roll) => {
    if (isMoving) return;
    setIsMoving(true);

    const startPos = positions[tokenColor][tokenIdx];
    let endPos = startPos === -1 ? 0 : startPos + roll;
    
    // Animate move cell by cell
    let currentStep = startPos === -1 ? -1 : startPos;
    
    const animateStep = () => {
      return new Promise((resolve) => {
        if (currentStep === -1) {
          currentStep = 0;
          setPositions(prev => {
            const next = { ...prev, [tokenColor]: [...prev[tokenColor]] };
            next[tokenColor][tokenIdx] = 0;
            return next;
          });
          audio.playMove();
          resolve();
        } else {
          const stepTimer = setInterval(() => {
            currentStep++;
            setPositions(prev => {
              const next = { ...prev, [tokenColor]: [...prev[tokenColor]] };
              next[tokenColor][tokenIdx] = currentStep;
              return next;
            });
            audio.playMove();
            
            if (currentStep >= endPos) {
              clearInterval(stepTimer);
              resolve();
            }
          }, 150);
        }
      });
    };

    await animateStep();

    // Move complete. Apply rules (captures, home reaches, turn rotations)
    setPositions(prevPositions => {
      const nextPositions = { ...prevPositions };
      let extraRoll = false;
      let captureLogText = '';
      let homeLogText = '';

      // 1. Capture Check (only on outer track)
      if (endPos >= 0 && endPos <= 50) {
        const landingAbsIdx = (START_CELLS[tokenColor] + endPos) % 52;
        const landingIsSafe = SAFE_CELLS.includes(landingAbsIdx);

        if (!landingIsSafe) {
          // Check all opposing active tokens
          COLORS.forEach(oppColor => {
            if (oppColor === tokenColor) return;
            nextPositions[oppColor].forEach((oppPos, oppIdx) => {
              if (oppPos >= 0 && oppPos <= 50) {
                const oppAbsIdx = (START_CELLS[oppColor] + oppPos) % 52;
                if (oppAbsIdx === landingAbsIdx) {
                  // Captured!
                  nextPositions[oppColor][oppIdx] = -1; // Send to base
                  extraRoll = true;
                  captureLogText = `💥 ${players[tokenColor].name} captured ${players[oppColor].name}'s token! Extra Roll!`;
                  audio.playCapture();
                }
              }
            });
          });
        }
      }

      // 2. Home Check
      if (endPos === 56) {
        extraRoll = true;
        homeLogText = `🎉 ${players[tokenColor].name} got a token HOME! Extra Roll!`;
        audio.playHome();
      }

      // Log results
      if (captureLogText) addLog(captureLogText);
      if (homeLogText) addLog(homeLogText);
      
      const hasWon = checkPlayerFinished(tokenColor, nextPositions);
      let updatedWinners = [...finishedPlayers];
      if (hasWon && !finishedPlayers.includes(tokenColor)) {
        updatedWinners.push(tokenColor);
        setFinishedPlayers(updatedWinners);
        addLog(`🏆 ${players[tokenColor].name} has FINISHED all tokens!`);
        audio.playVictory();
      }

      // Check if game is completely finished
      const activeRunningPlayersCount = COLORS.filter(c => players[c].active && !updatedWinners.includes(c)).length;
      const totalActivePlayers = COLORS.filter(c => players[c].active).length;
      
      let nextGameState = gameState;
      if (activeRunningPlayersCount <= 1 && totalActivePlayers > 1) {
        nextGameState = 'finished';
        setGameState('finished');
        addLog("Game Over! All players finished.");
      }

      // 3. Determine next turn
      let nextTurnColor = turn;
      let nextSixCount = rolledSixCount;
      if (!extraRoll && roll !== 6) {
        nextTurnColor = getNextTurn(turn, players, updatedWinners);
        nextSixCount = 0;
      } else if (roll === 6) {
        // Kept turn because of 6. Six count is already handled at roll time.
        // If they hit 3 sixes, turn was passed in the roll function.
      } else {
        // Captured or Home. Reset consecutive sixes
        nextSixCount = 0;
      }

      setTurn(nextTurnColor);
      setRolledSixCount(nextSixCount);
      setDiceState('idle');
      setHasPendingMove(false);
      setIsMoving(false);

      // Sync online state
      if (gameMode === 'online') {
        syncToFirebase({
          positions: nextPositions,
          turn: nextTurnColor,
          diceState: 'idle',
          diceValue: roll,
          rolledSixCount: nextSixCount,
          hasPendingMove: false,
          finishedPlayers: updatedWinners,
          gameState: nextGameState,
          lastAction: {
            type: 'move',
            player: tokenColor,
            timestamp: new Date().toISOString(),
            summary: `${players[tokenColor].name} moved token ${tokenIdx + 1} by ${roll}`
          }
        });
      }

      return nextPositions;
    });

  }, [positions, turn, rolledSixCount, finishedPlayers, players, gameMode, roomId, isMoving, gameState, checkPlayerFinished, getNextTurn, syncToFirebase, addLog]);

  // Roll dice action
  const rollDice = useCallback(() => {
    if (gameState !== 'playing' || diceState !== 'idle' || hasPendingMove || isMoving) return;
    
    // In online mode, only current player can roll
    if (gameMode === 'online' && turn !== myColor) return;

    setDiceState('rolling');
    audio.playRoll();
    
    // Sync rolling state online
    if (gameMode === 'online') {
      syncToFirebase({
        diceState: 'rolling',
        lastAction: {
          type: 'roll-start',
          player: turn,
          timestamp: new Date().toISOString(),
          summary: `${players[turn].name} is rolling the dice...`
        }
      });
    }

    setTimeout(() => {
      const roll = Math.floor(Math.random() * 6) + 1;
      setDiceValue(roll);
      setDiceState('rolled');
      
      const newSixCount = roll === 6 ? rolledSixCount + 1 : 0;
      setRolledSixCount(newSixCount);
      addLog(`🎲 ${players[turn].name} rolled a ${roll}!`);

      if (newSixCount === 3) {
        addLog(`⚠️ Three 6s in a row! Turn passes to next player.`);
        const nextTurnColor = getNextTurn(turn, players, finishedPlayers);
        
        setTurn(nextTurnColor);
        setRolledSixCount(0);
        setDiceState('idle');
        setHasPendingMove(false);
        
        if (gameMode === 'online') {
          syncToFirebase({
            turn: nextTurnColor,
            diceValue: roll,
            diceState: 'idle',
            rolledSixCount: 0,
            hasPendingMove: false,
            lastAction: {
              type: 'roll-bust',
              player: turn,
              timestamp: new Date().toISOString(),
              summary: `${players[turn].name} rolled three 6s. Turn passed.`
            }
          });
        }
        return;
      }

      // Check valid moves
      const moves = getValidMoves(turn, roll, positions);
      if (moves.length === 0) {
        addLog(`No valid moves. Skipping turn.`);
        setTimeout(() => {
          const nextTurnColor = getNextTurn(turn, players, finishedPlayers);
          setTurn(nextTurnColor);
          setRolledSixCount(0);
          setDiceState('idle');
          setHasPendingMove(false);
          
          if (gameMode === 'online') {
            syncToFirebase({
              turn: nextTurnColor,
              diceValue: roll,
              diceState: 'idle',
              rolledSixCount: 0,
              hasPendingMove: false,
              lastAction: {
                type: 'roll-skip',
                player: turn,
                timestamp: new Date().toISOString(),
                summary: `${players[turn].name} rolled a ${roll} with no moves. Turn passed.`
              }
            });
          }
        }, 1500);
      } else {
        setHasPendingMove(true);
        
        if (gameMode === 'online') {
          syncToFirebase({
            diceState: 'rolled',
            diceValue: roll,
            rolledSixCount: newSixCount,
            hasPendingMove: true,
            lastAction: {
              type: 'roll',
              player: turn,
              timestamp: new Date().toISOString(),
              summary: `${players[turn].name} rolled a ${roll}`
            }
          });
        }
      }
    }, 800);

  }, [gameState, diceState, hasPendingMove, isMoving, gameMode, turn, myColor, rolledSixCount, players, finishedPlayers, getNextTurn, getValidMoves, positions, syncToFirebase, addLog]);

  // AI Moves decision engine
  const executeAIMove = useCallback(() => {
    if (gameState !== 'playing' || turn !== 'green' && turn !== 'red' && turn !== 'blue') return;
    if (!players[turn].isAI || isMoving) return;

    if (diceState === 'idle' && !hasPendingMove) {
      // Roll the dice automatically
      rollDice();
    } else if (diceState === 'rolled' && hasPendingMove) {
      // Choose best token to move
      const validMoves = getValidMoves(turn, diceValue, positions);
      if (validMoves.length === 0) return; // Will skip automatically

      // AI Logic:
      // 1. Prioritize capturing an opponent token
      // 2. Prioritize moving token into home (pos 56)
      // 3. Prioritize releasing token from base (if rolled a 6)
      // 4. Prioritize moving a token that is vulnerable to safety
      // 5. Fallback: move the token furthest along, or random
      
      let selectedIdx = validMoves[0];
      let maxScore = -1;

      validMoves.forEach(idx => {
        const startPos = positions[turn][idx];
        const nextPos = startPos === -1 ? 0 : startPos + diceValue;
        let score = 0;

        // Capturing is highly valued
        if (nextPos >= 0 && nextPos <= 50) {
          const landingAbsIdx = (START_CELLS[turn] + nextPos) % 52;
          const safe = SAFE_CELLS.includes(landingAbsIdx);
          if (!safe) {
            COLORS.forEach(oppColor => {
              if (oppColor === turn) return;
              positions[oppColor].forEach((oppPos) => {
                if (oppPos >= 0 && oppPos <= 50) {
                  const oppAbsIdx = (START_CELLS[oppColor] + oppPos) % 52;
                  if (oppAbsIdx === landingAbsIdx) {
                    score += 100; // HUGE boost for capture
                  }
                }
              });
            });
          }
        }

        // Home path is good
        if (nextPos === 56) {
          score += 80; // Bring home
        }

        // Release from yard is good
        if (startPos === -1 && nextPos === 0) {
          score += 50;
        }

        // Escape danger (if someone is right behind us, and we can land on a safe zone)
        if (startPos >= 0 && startPos <= 50) {
          const startAbsIdx = (START_CELLS[turn] + startPos) % 52;
          const currentSafe = SAFE_CELLS.includes(startAbsIdx);
          
          const nextAbsIdx = (START_CELLS[turn] + nextPos) % 52;
          const nextSafe = SAFE_CELLS.includes(nextAbsIdx);

          let inDanger = false;
          COLORS.forEach(oppColor => {
            if (oppColor === turn) return;
            positions[oppColor].forEach(oppPos => {
              if (oppPos >= 0 && oppPos <= 50) {
                const oppAbsIdx = (START_CELLS[oppColor] + oppPos) % 52;
                // Opponent is within 6 squares behind us
                const diff = (startAbsIdx - oppAbsIdx + 52) % 52;
                if (diff > 0 && diff <= 6) {
                  inDanger = true;
                }
              }
            });
          });

          if (inDanger) {
            if (nextSafe) score += 40; // Escape to safety
            else score += 15; // At least run away
          }
        }

        // Furthest token along is slightly preferred to avoid splitting forces
        score += (startPos + 1) * 0.5;

        if (score > maxScore) {
          maxScore = score;
          selectedIdx = idx;
        }
      });

      // Execute AI token move after small delay
      setTimeout(() => {
        executeMove(turn, selectedIdx, diceValue);
      }, 1000);
    }
  }, [gameState, turn, players, diceState, hasPendingMove, diceValue, positions, getValidMoves, rollDice, executeMove]);

  // Check and run AI turns
  useEffect(() => {
    if (gameMode !== 'online' && players[turn].isAI && gameState === 'playing') {
      executeAIMove();
    }
  }, [turn, diceState, hasPendingMove, players, gameMode, gameState, executeAIMove]);

  // Online Multiplayer database listening sync
  useEffect(() => {
    if (gameMode !== 'online' || !roomId) return;

    addLog(`Configuring listener for room: ${roomId}`);
    const unsubscribe = firebaseService.listenToRoom(
      roomId,
      (roomData) => {
        // Skip updates if we just wrote them ourselves (to avoid feedback loops)
        if (syncBlocked.current) return;

        // Parse Firestore data
        if (roomData.players) {
          setLobbyPlayers(roomData.players);
          
          // Re-build standard players profile from lobby players
          const newPlayers = {
            yellow: { name: 'Empty Slot', active: false, isAI: false },
            green: { name: 'Empty Slot', active: false, isAI: false },
            red: { name: 'Empty Slot', active: false, isAI: false },
            blue: { name: 'Empty Slot', active: false, isAI: false }
          };
          
          roomData.players.forEach(p => {
            newPlayers[p.color] = { name: p.name, active: true, isAI: false };
          });
          
          setPlayers(newPlayers);

          // Update local player color matching DB profile
          const me = roomData.players.find(p => p.id === myPlayerId);
          if (me && me.color !== myColor) {
            setMyColor(me.color);
          }
        }

        if (roomData.gameState) setGameState(roomData.gameState);
        if (roomData.turn) setTurn(roomData.turn);
        if (roomData.diceValue !== undefined) setDiceValue(roomData.diceValue);
        if (roomData.diceState) setDiceState(roomData.diceState);
        if (roomData.rolledSixCount !== undefined) setRolledSixCount(roomData.rolledSixCount);
        if (roomData.hasPendingMove !== undefined) setHasPendingMove(roomData.hasPendingMove);
        if (roomData.positions) setPositions(roomData.positions);
        if (roomData.finishedPlayers) setFinishedPlayers(roomData.finishedPlayers);
        
        if (roomData.lastAction && roomData.lastAction.summary) {
          addLog(roomData.lastAction.summary);
        }
      },
      (error) => {
        addLog(`⚠️ Match sync error: ${error.message}`);
      }
    );

    return () => {
      unsubscribe();
    };
  }, [gameMode, roomId, addLog, myPlayerId, myColor]);

  // Setup options
  const configureLocalGame = (configuredPlayers) => {
    // configuredPlayers: { yellow: { active: true, name: 'Alice' }, ... }
    const mapped = {};
    COLORS.forEach(c => {
      mapped[c] = {
        name: configuredPlayers[c].name || `Player ${c.toUpperCase()}`,
        active: configuredPlayers[c].active,
        isAI: false
      };
    });
    setPlayers(mapped);
    setPositions(initialPositions);
    setFinishedPlayers([]);
    setTurn('yellow');
    setDiceState('idle');
    setRolledSixCount(0);
    setHasPendingMove(false);
    setGameMode('local');
    setGameState('playing');
    setLogs([{ time: new Date().toLocaleTimeString(), text: 'Local match started!' }]);
  };

  const configureAIGame = (playerName, playerColor, computerCount) => {
    const mapped = {
      yellow: { name: 'Empty', active: false, isAI: false },
      green: { name: 'Empty', active: false, isAI: false },
      red: { name: 'Empty', active: false, isAI: false },
      blue: { name: 'Empty', active: false, isAI: false }
    };
    
    // Assign player
    mapped[playerColor] = { name: playerName || 'Player 1', active: true, isAI: false };
    
    // Assign computers
    let compColors = COLORS.filter(c => c !== playerColor);
    for (let i = 0; i < computerCount; i++) {
      const compColor = compColors[i];
      mapped[compColor] = { name: `Robo ${compColor.toUpperCase()}`, active: true, isAI: true };
    }
    
    setPlayers(mapped);
    setMyColor(playerColor);
    setPositions(initialPositions);
    setFinishedPlayers([]);
    
    // Turn starts with yellow. If yellow is not active, rotate
    const firstTurn = getNextTurn('blue', mapped, []);
    setTurn(firstTurn);
    
    setDiceState('idle');
    setRolledSixCount(0);
    setHasPendingMove(false);
    setGameMode('ai');
    setGameState('playing');
    setLogs([{ time: new Date().toLocaleTimeString(), text: `AI match started! You are ${playerColor.toUpperCase()}.` }]);
  };

  const createOnlineRoom = async (roomIdInput, playerName, playerColor) => {
    try {
      const id = roomIdInput.trim().toUpperCase();
      if (!id) throw new Error("Room ID cannot be empty");
      
      setRoomId(id);
      setGameMode('online');
      
      const roomData = await firebaseService.createRoom(id, playerColor, playerName, myPlayerId);
      setLobbyPlayers(roomData.players);
      
      const me = roomData.players.find(p => p.id === myPlayerId);
      if (me) {
        setMyColor(me.color);
      }
      
      setGameState('lobby');
      addLog(`Room ${id} created. Share code to invite friends!`);
    } catch (e) {
      addLog(`⚠️ Lobby creation failed: ${e.message}`);
      throw e;
    }
  };

  const joinOnlineRoom = async (roomIdInput, playerName, playerColor) => {
    try {
      const id = roomIdInput.trim().toUpperCase();
      if (!id) throw new Error("Room ID cannot be empty");
      
      setRoomId(id);
      setGameMode('online');
      
      const roomData = await firebaseService.joinRoom(id, playerColor, playerName, myPlayerId);
      setLobbyPlayers(roomData.players);
      
      const me = roomData.players.find(p => p.id === myPlayerId);
      if (me) {
        setMyColor(me.color);
      }
      
      setGameState('lobby');
      addLog(`Joined room ${id}! Waiting for host to start...`);
    } catch (e) {
      addLog(`⚠️ Lobby join failed: ${e.message}`);
      throw e;
    }
  };

  const startOnlineGame = async () => {
    if (gameMode !== 'online' || !roomId) return;
    try {
      await firebaseService.updateRoom(roomId, {
        gameState: 'playing',
        lastAction: {
          type: 'start',
          player: myColor,
          timestamp: new Date().toISOString(),
          summary: `Host started the game!`
        }
      });
      setGameState('playing');
    } catch (e) {
      addLog(`⚠️ Failed to start game: ${e.message}`);
    }
  };

  const exitToSetup = () => {
    setGameState('setup');
    setRoomId(null);
    setLobbyPlayers([]);
    setPositions(initialPositions);
    setFinishedPlayers([]);
    setLogs([{ time: new Date().toLocaleTimeString(), text: 'Returned to setup.' }]);
  };

  return {
    gameMode,
    roomId,
    myColor,
    myPlayerId,
    lobbyPlayers,
    gameState,
    players,
    turn,
    diceValue,
    diceState,
    rolledSixCount,
    hasPendingMove,
    positions,
    finishedPlayers,
    logs,
    isMoving,
    rollDice,
    executeMove,
    configureLocalGame,
    configureAIGame,
    createOnlineRoom,
    joinOnlineRoom,
    startOnlineGame,
    exitToSetup,
    addLog,
    getValidMoves
  };
};
