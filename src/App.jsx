// Main App Integration
import React, { useState } from 'react';
import './App.css';
import { useLudo, COLORS } from './hooks/useLudo';
import GameBoard from './components/GameBoard';
import Dice from './components/Dice';
import GameLog from './components/GameLog';
import Lobby from './components/Lobby';
import { Info, Trophy, RotateCcw } from 'lucide-react';

function App() {
  const {
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
    getValidMoves
  } = useLudo();



  // Compute which tokens the active human player can click to move
  const getPlayableTokens = () => {
    if (gameState !== 'playing' || diceState !== 'rolled' || !hasPendingMove || isMoving) {
      return [];
    }

    // In online mode, you can only move your own tokens on your turn
    if (gameMode === 'online' && turn !== myColor) {
      return [];
    }

    // If it's an AI's turn, human cannot move it
    if (gameMode !== 'online' && players[turn]?.isAI) {
      return [];
    }

    return getValidMoves(turn, diceValue, positions);
  };

  const playableTokens = getPlayableTokens();
  const isMyTurn = gameMode !== 'online' ? !players[turn]?.isAI : turn === myColor;

  return (
    <div className="app-container">


      <header>
        <h1>🏆 Ludo Pro</h1>
        <p>Real-time Multiplayer & Pass-and-Play Ludo</p>
      </header>

      {/* Main Screen Router */}
      {gameState === 'setup' || (gameState === 'lobby' && gameMode === 'online' && !roomId) ? (
        <Lobby
          configureLocalGame={configureLocalGame}
          configureAIGame={configureAIGame}
          createOnlineRoom={createOnlineRoom}
          joinOnlineRoom={joinOnlineRoom}
          startOnlineGame={startOnlineGame}
          roomId={roomId}
          lobbyPlayers={lobbyPlayers}
          gameState={gameState}
          myPlayerId={myPlayerId}
        />
      ) : gameState === 'lobby' && roomId ? (
        // Lobby waiting for start
        <div style={{ width: '100%', display: 'flex', justifyContent: 'center' }}>
          <Lobby
            configureLocalGame={configureLocalGame}
            configureAIGame={configureAIGame}
            createOnlineRoom={createOnlineRoom}
            joinOnlineRoom={joinOnlineRoom}
            startOnlineGame={startOnlineGame}
            roomId={roomId}
            lobbyPlayers={lobbyPlayers}
            gameState={gameState}
            myPlayerId={myPlayerId}
          />
        </div>
      ) : (
        // Active Match Layout (Playing or Finished)
        <div className="main-layout">
          {/* Game Board and Local Dice Controls */}
          <div className="game-area">
            <GameBoard
              positions={positions}
              playableTokens={playableTokens}
              onTokenClick={(color, idx) => executeMove(color, idx, diceValue)}
              turn={turn}
            />
            
            {/* Dice Panel */}
            <div className="glass-panel" style={{ width: '100%', maxWidth: '300px', padding: '16px', borderRadius: '16px' }}>
              <Dice
                value={diceValue}
                state={diceState}
                onClick={rollDice}
                disabled={!isMyTurn || diceState !== 'idle' || hasPendingMove || isMoving}
                isMyTurn={isMyTurn && diceState === 'idle' && !hasPendingMove && !isMoving}
                turnName={players[turn]?.name}
              />
              
              {rolledSixCount > 0 && (
                <div style={{ textAlign: 'center', fontSize: '12px', color: 'var(--color-yellow)', marginTop: '8px', fontWeight: 'bold' }}>
                  🎲 Consecutive Sixes: {rolledSixCount}/3
                </div>
              )}
            </div>
          </div>

          {/* Sidebar (Logs, Scores, Standings) */}
          <GameLog
            turn={turn}
            players={players}
            logs={logs}
            onExit={exitToSetup}
            finishedPlayers={finishedPlayers}
            gameMode={gameMode}
            roomId={roomId}
          />
        </div>
      )}

      {/* Winner Overlay Modal */}
      {gameState === 'finished' && (
        <div className="modal-overlay">
          <div className="modal-content glass-panel" style={{ padding: '40px' }}>
            <div style={{ fontSize: '48px', marginBottom: '16px' }}>🏆</div>
            <h2>Match Completed!</h2>
            <p>Here is the final standings leaderboard:</p>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', margin: '24px 0', textAlign: 'left' }}>
              {finishedPlayers.map((color, idx) => (
                <div 
                  key={color} 
                  className="glass-panel"
                  style={{ 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    padding: '12px 18px', 
                    borderRadius: '12px',
                    borderLeft: `4px solid var(--color-${color})`,
                    background: idx === 0 ? 'rgba(245, 158, 11, 0.15)' : 'rgba(255,255,255,0.03)'
                  }}
                >
                  <span style={{ fontWeight: '800', fontSize: '15px' }}>
                    {idx === 0 ? '🥇' : idx === 1 ? '🥈' : idx === 2 ? '🥉' : '🎖️'} #{idx + 1} {players[color]?.name}
                  </span>
                  <span style={{ fontSize: '12px', color: 'var(--text-secondary)', textTransform: 'uppercase', alignSelf: 'center' }}>
                    {idx === 0 ? 'Grand Winner' : 'Finished'}
                  </span>
                </div>
              ))}
            </div>

            <button 
              className="glass-button" 
              style={{ background: 'var(--color-blue)', color: '#ffffff', borderColor: 'transparent', width: '100%', height: '48px' }}
              onClick={exitToSetup}
            >
              <RotateCcw size={16} /> Return to Menu
            </button>
          </div>
        </div>
      )}

    </div>
  );
}

export default App;
