// Main App Integration
import React, { useState } from 'react';
import './App.css';
import { useLudo, COLORS } from './hooks/useLudo';
import GameBoard from './components/GameBoard';
import Dice from './components/Dice';
import GameLog from './components/GameLog';
import Lobby from './components/Lobby';
import { Info, Trophy, RotateCcw, ArrowLeft, Volume2, VolumeX } from 'lucide-react';
import { audio } from './services/audio';

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
    getValidMoves,
    turnTimer,
    MAX_TURN_TIME,
    coins,
    addCoins,
    lastWinnings,
    getPrizePool
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

  const [isMuted, setIsMuted] = useState(() => {
    const stored = localStorage.getItem('ludo_muted');
    const isMutedBool = stored === 'true';
    audio.setMuted(isMutedBool);
    return isMutedBool;
  });

  const toggleMute = () => {
    const newState = !isMuted;
    setIsMuted(newState);
    localStorage.setItem('ludo_muted', newState.toString());
    audio.setMuted(newState);
  };

  const renderAvatarSvg = (color) => {
    switch (color) {
      case 'yellow':
        return (
          <svg viewBox="0 0 100 100" className="avatar-img-svg">
            <circle cx="50" cy="50" r="50" fill="#ffd32a" />
            <circle cx="25" cy="25" r="10" fill="#ffa801" />
            <circle cx="25" cy="25" r="6" fill="#ff7f50" />
            <circle cx="75" cy="25" r="10" fill="#ffa801" />
            <circle cx="75" cy="25" r="6" fill="#ff7f50" />
            <polygon points="10,40 25,43 10,46" fill="#3d3d3d" />
            <polygon points="90,40 75,43 90,46" fill="#3d3d3d" />
            <polygon points="15,60 30,62 15,64" fill="#3d3d3d" />
            <polygon points="85,60 70,62 85,64" fill="#3d3d3d" />
            <polygon points="45,10 50,25 55,10" fill="#3d3d3d" />
            <ellipse cx="50" cy="65" rx="16" ry="12" fill="#ffffff" />
            <circle cx="38" cy="45" r="5" fill="#3d3d3d" />
            <circle cx="38" cy="44" r="1.5" fill="#ffffff" />
            <circle cx="62" cy="45" r="5" fill="#3d3d3d" />
            <circle cx="62" cy="44" r="1.5" fill="#ffffff" />
            <polygon points="46,58 54,58 50,64" fill="#ff5e57" />
            <path d="M 46 68 Q 50 72 54 68" fill="none" stroke="#3d3d3d" strokeWidth="2.5" strokeLinecap="round" />
          </svg>
        );
      case 'green':
        return (
          <svg viewBox="0 0 100 100" className="avatar-img-svg">
            <circle cx="50" cy="50" r="50" fill="#05c46b" />
            <path d="M 50 15 C 40 5, 60 5, 50 15 Z" fill="#0be881" />
            <circle cx="35" cy="40" r="8" fill="#ffffff" />
            <circle cx="35" cy="40" r="4" fill="#1e272e" />
            <circle cx="35" cy="38" r="1.5" fill="#ffffff" />
            <circle cx="65" cy="40" r="8" fill="#ffffff" />
            <circle cx="65" cy="40" r="4" fill="#1e272e" />
            <circle cx="65" cy="38" r="1.5" fill="#ffffff" />
            <circle cx="28" cy="52" r="5" fill="#ff5e57" opacity="0.6" />
            <circle cx="72" cy="52" r="5" fill="#ff5e57" opacity="0.6" />
            <path d="M 44 48 Q 50 42 56 48 L 50 68 Z" fill="#ffc048" stroke="#d28c00" strokeWidth="1" />
          </svg>
        );
      case 'red':
        return (
          <svg viewBox="0 0 100 100" className="avatar-img-svg">
            <circle cx="50" cy="50" r="50" fill="#ff5e57" />
            <polygon points="15,35 20,5 42,28" fill="#ff3f34" />
            <polygon points="18,32 23,10 38,26" fill="#ffd2cc" />
            <polygon points="85,35 80,5 58,28" fill="#ff3f34" />
            <polygon points="82,32 77,10 62,26" fill="#ffd2cc" />
            <path d="M 15 62 Q 35 75 50 62 Q 65 75 85 62 C 75 90, 25 90, 15 62 Z" fill="#ffffff" />
            <circle cx="35" cy="45" r="5" fill="#1e272e" />
            <circle cx="35" cy="43" r="1.5" fill="#ffffff" />
            <circle cx="65" cy="45" r="5" fill="#1e272e" />
            <circle cx="65" cy="43" r="1.5" fill="#ffffff" />
            <circle cx="50" cy="62" r="6" fill="#1e272e" />
          </svg>
        );
      case 'blue':
        return (
          <svg viewBox="0 0 100 100" className="avatar-img-svg">
            <circle cx="50" cy="50" r="50" fill="#3c40c6" />
            <path d="M 50 15 Q 65 0 60 25 Z" fill="#575fcf" />
            <path d="M 15 70 C 30 92, 70 92, 85 70 C 70 82, 30 82, 15 70 Z" fill="#f1f2f6" />
            <circle cx="36" cy="42" r="5" fill="#1e272e" />
            <circle cx="36" cy="40" r="1.5" fill="#ffffff" />
            <circle cx="64" cy="42" r="5" fill="#1e272e" />
            <circle cx="64" cy="40" r="1.5" fill="#ffffff" />
            <path d="M 22 45 Q 26 48 22 51" fill="none" stroke="#575fcf" strokeWidth="2" strokeLinecap="round" />
            <path d="M 78 45 Q 74 48 78 51" fill="none" stroke="#575fcf" strokeWidth="2" strokeLinecap="round" />
            <path d="M 40 56 Q 50 64 60 56" fill="none" stroke="#1e272e" strokeWidth="3" strokeLinecap="round" />
          </svg>
        );
      default:
        return null;
    }
  };

  const renderPlayerProfile = (color, side) => {
    const p = players[color];
    if (!p || !p.active) {
      return <div className="profile-placeholder" />;
    }

    const isCurrentTurn = turn === color;

    // Small emoji badge
    let emoji = '😀';
    if (color === 'yellow') emoji = '🐯';
    else if (color === 'green') emoji = '🦜';
    else if (color === 'red') emoji = '🦊';
    else if (color === 'blue') emoji = '🦈';

    const radius = 41;
    const circumference = 2 * Math.PI * radius; // 257.6
    const strokeDashoffset = circumference - (turnTimer / MAX_TURN_TIME) * circumference;

    return (
      <div className={`player-profile-row ${side === 'left' ? 'left-align' : 'right-align'}`}>
        {/* Avatar Wrapper with circular progress ring */}
        <div className="player-profile-avatar-wrapper" style={{ position: 'relative', width: '90px', height: '90px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          {isCurrentTurn && (
            <svg width="90" height="90" style={{ position: 'absolute', top: 0, left: 0, transform: 'rotate(-90deg)', zIndex: 10, pointerEvents: 'none' }}>
              <circle
                cx="45"
                cy="45"
                r={radius}
                fill="transparent"
                stroke="rgba(255,255,255,0.1)"
                strokeWidth="4"
              />
              <circle
                cx="45"
                cy="45"
                r={radius}
                fill="transparent"
                stroke={`var(--color-${color})`}
                strokeWidth="4"
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
                style={{
                  transition: 'stroke-dashoffset 0.25s linear',
                  filter: `drop-shadow(0 0 4px var(--color-${color}))`
                }}
              />
            </svg>
          )}

          <div className={`player-profile-avatar-outer ${isCurrentTurn ? `active-turn ${color}-turn` : ''}`}>
            <div className="player-profile-avatar-inner">
              {renderAvatarSvg(color)}
            </div>
            <div className="player-emoji-badge">{emoji}</div>
          </div>
        </div>

        {/* Info Column containing Name Pill on top, Dice on bottom (if turn) */}
        <div className="player-profile-info-col" style={{ display: 'flex', flexDirection: 'column', gap: '6px', alignItems: side === 'left' ? 'flex-start' : 'flex-end', zIndex: 5 }}>
          <div className={`player-profile-name-capsule ${color}-banner`}>
            {p.name}
          </div>

          {isCurrentTurn && (
            <div className="player-profile-dice-wrap">
              <Dice
                value={diceValue}
                state={diceState}
                onClick={rollDice}
                disabled={!isMyTurn || diceState !== 'idle' || hasPendingMove || isMoving}
                isMyTurn={isMyTurn && diceState === 'idle' && !hasPendingMove && !isMoving}
                color={color}
              />
            </div>
          )}
        </div>
      </div>
    );
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
          coins={coins}
          addCoins={addCoins}
          lastWinnings={lastWinnings}
          getPrizePool={getPrizePool}
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
            coins={coins}
            addCoins={addCoins}
            lastWinnings={lastWinnings}
            getPrizePool={getPrizePool}
          />
        </div>
      ) : (
        // Active Match Layout (Playing or Finished)
        <div className="game-screen-container">
          {/* Top Bar: Back, Wallet & Sound */}
          <div className="game-top-bar" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
            <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
              <button 
                className="btn-3d btn-3d-cyan square-btn" 
                onClick={() => {
                  if (window.confirm("Are you sure you want to exit the current match? Your progress will be lost.")) {
                    exitToSetup();
                  }
                }}
                title="Exit Game"
              >
                <ArrowLeft size={24} strokeWidth={3} />
              </button>

              <div className="game-wallet-pill" style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                background: 'rgba(255, 255, 255, 0.1)',
                backdropFilter: 'blur(10px)',
                padding: '6px 14px',
                borderRadius: '16px',
                border: '2px solid rgba(255,255,255,0.15)',
                color: '#ffffff',
                fontWeight: '800',
                fontSize: '14px',
                boxShadow: '0 4px 10px rgba(0,0,0,0.15)'
              }}>
                <span>🪙</span>
                <span className="coin-glow" style={{ color: '#ffe066' }}>{coins.toLocaleString()}</span>
              </div>
            </div>

            <button 
              className="btn-3d btn-3d-cyan square-btn" 
              onClick={toggleMute}
              title={isMuted ? "Unmute Sound" : "Mute Sound"}
            >
              {isMuted ? <VolumeX size={24} strokeWidth={3} /> : <Volume2 size={24} strokeWidth={3} />}
            </button>
          </div>

          {/* Main Gameplay Screen Grid */}
          <div className="game-main-layout">
            {/* Left Side: Yellow & Red */}
            <div className="profiles-column left-side">
              {renderPlayerProfile('yellow', 'left')}
              {renderPlayerProfile('red', 'left')}
            </div>

            {/* Center: Ludo Board */}
            <div className="board-center-area">
              <GameBoard
                positions={positions}
                playableTokens={playableTokens}
                onTokenClick={(color, idx) => executeMove(color, idx, diceValue)}
                turn={turn}
              />
              
              {/* Consecutive Sixes Badge */}
              {rolledSixCount > 0 && (
                <div style={{ 
                  textAlign: 'center', 
                  fontSize: '14px', 
                  color: 'var(--color-yellow)', 
                  marginTop: '16px', 
                  fontWeight: 'bold',
                  background: 'rgba(0,0,0,0.6)',
                  padding: '6px 12px',
                  borderRadius: '20px',
                  border: '1.5px solid var(--color-yellow)',
                  display: 'inline-block',
                  position: 'relative',
                  left: '50%',
                  transform: 'translateX(-50%)'
                }}>
                  🎲 Consecutive Sixes: {rolledSixCount}/3
                </div>
              )}
            </div>

            {/* Right Side: Green & Blue */}
            <div className="profiles-column right-side">
              {renderPlayerProfile('green', 'right')}
              {renderPlayerProfile('blue', 'right')}
            </div>
          </div>
        </div>
      )}

      {/* Winner Overlay Modal */}
      {gameState === 'finished' && (
        <div className="modal-overlay">
          <div className="modal-content glass-panel" style={{ padding: '40px' }}>
            <div style={{ fontSize: '48px', marginBottom: '16px' }}>🏆</div>
            <h2>Match Completed!</h2>
            
            {/* Coin reward panel */}
            {lastWinnings > 0 ? (
              <div className="victory-reward-card" style={{
                background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.2) 0%, rgba(217, 119, 6, 0.2) 100%)',
                border: '2px solid #f59e0b',
                borderRadius: '16px',
                padding: '16px',
                marginBottom: '20px',
                textAlign: 'center',
                boxShadow: '0 8px 24px rgba(245,158,11,0.2)'
              }}>
                <div style={{ fontSize: '20px', fontWeight: '800', marginBottom: '4px' }}>💰 Reward Earned!</div>
                <div style={{ fontSize: '22px', fontWeight: '900', color: '#fbbf24' }}>+🪙 {lastWinnings.toLocaleString()} Gold Coins</div>
              </div>
            ) : (
              <div className="victory-reward-card" style={{
                background: 'rgba(255,255,255,0.05)',
                border: '2px solid rgba(255,255,255,0.1)',
                borderRadius: '16px',
                padding: '16px',
                marginBottom: '20px',
                textAlign: 'center'
              }}>
                <div style={{ fontSize: '16px', color: 'var(--text-secondary)' }}>Better luck next time!</div>
              </div>
            )}

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
