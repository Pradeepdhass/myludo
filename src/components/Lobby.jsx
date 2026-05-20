// Setup and Lobby Screen - Room Multiplayer Only
import React, { useState, useEffect } from 'react';
import { firebaseService } from '../services/firebase';
import { Globe, Play, Plus, ArrowRight, AlertTriangle, Key } from 'lucide-react';
import { COLORS } from '../hooks/useLudo';

export const Lobby = ({
  createOnlineRoom,
  joinOnlineRoom,
  startOnlineGame,
  roomId,
  lobbyPlayers,
  gameState,
  onOpenSettings,
  myPlayerId
}) => {
  const [playerName, setPlayerName] = useState(() => localStorage.getItem('ludo_player_name') || 'Player');
  const [playerColor, setPlayerColor] = useState('random');
  const [roomInput, setRoomInput] = useState('');
  const [isFirebaseOk, setIsFirebaseOk] = useState(false);
  const [loading, setLoading] = useState(false);
  const [localError, setLocalError] = useState('');

  useEffect(() => {
    localStorage.setItem('ludo_player_name', playerName);
  }, [playerName]);

  useEffect(() => {
    setIsFirebaseOk(firebaseService.isAvailable());
  }, [roomId, gameState]);

  // Generate random 4-digit number Room ID
  const generateRandomRoomId = () => {
    return Math.floor(1000 + Math.random() * 9000).toString();
  };

  const handleCreateOnline = async () => {
    setLocalError('');
    if (!playerName.trim()) {
      setLocalError("Please enter your name");
      return;
    }
    
    setLoading(true);
    const randomId = generateRandomRoomId();

    // Resolve random color for the host
    let resolvedColor = playerColor;
    if (resolvedColor === 'random') {
      const colors = ['yellow', 'green', 'red', 'blue'];
      resolvedColor = colors[Math.floor(Math.random() * colors.length)];
    }

    try {
      await createOnlineRoom(randomId, playerName, resolvedColor);
    } catch (e) {
      setLocalError(e.message);
    } finally {
      setLoading(false);
    }
  };

  const handleJoinOnline = async () => {
    setLocalError('');
    if (!playerName.trim()) {
      setLocalError("Please enter your name");
      return;
    }
    if (!roomInput.trim()) {
      setLocalError("Please enter a room code to join");
      return;
    }
    
    setLoading(true);
    try {
      await joinOnlineRoom(roomInput.trim().toUpperCase(), playerName, playerColor);
    } catch (e) {
      setLocalError(e.message);
    } finally {
      setLoading(false);
    }
  };

  // Render waiting room lobby once connected
  if (gameState === 'lobby' && roomId) {
    const localPlayerObj = lobbyPlayers.find(p => p.id === myPlayerId);
    const isHost = localPlayerObj ? localPlayerObj.isHost : false;

    return (
      <div className="lobby-screen glass-panel" style={{ maxWidth: '500px', margin: '0 auto' }}>
        <h2>Multiplayer Lobby</h2>
        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
          <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>ROOM CODE</span>
          <div style={{ fontSize: '36px', fontFamily: 'var(--font-mono)', fontWeight: 'bold', color: 'var(--color-yellow)', letterSpacing: '2px', marginTop: '4px' }}>
            {roomId}
          </div>
          <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginTop: '4px' }}>
            Share this code with your friends so they can join the game!
          </p>
        </div>

        <div style={{ marginBottom: '20px' }}>
          <h3 style={{ fontSize: '14px', marginBottom: '8px', color: 'var(--text-primary)' }}>
            Players Connected ({lobbyPlayers.length}/4)
          </h3>
          <div className="lobby-players-list">
            {lobbyPlayers.map((p, idx) => (
              <div key={idx} className="lobby-player-card">
                <div className="lobby-player-info">
                  <div className="color-dot" style={{ color: `var(--color-${p.color})`, backgroundColor: `var(--color-${p.color})` }} />
                  <span style={{ fontWeight: '600' }}>{p.name}</span>
                  {p.isHost && (
                    <span style={{ fontSize: '10px', background: 'rgba(245,158,11,0.2)', color: 'var(--color-yellow)', padding: '2px 6px', borderRadius: '4px', marginLeft: '4px' }}>
                      Host
                    </span>
                  )}
                </div>
                <span style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>
                  {p.color.toUpperCase()}
                </span>
              </div>
            ))}
            
            {Array.from({ length: 4 - lobbyPlayers.length }).map((_, idx) => (
              <div key={idx} className="lobby-player-card" style={{ opacity: 0.4, borderStyle: 'dashed' }}>
                <span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>Waiting for player...</span>
              </div>
            ))}
          </div>
        </div>

        {localError && (
          <div style={{ background: 'rgba(239, 68, 68, 0.1)', color: 'var(--color-red)', padding: '10px', borderRadius: '8px', fontSize: '13px', marginBottom: '16px', border: '1px solid rgba(239, 68, 68, 0.2)' }}>
            {localError}
          </div>
        )}

        {isHost ? (
          <button 
            className="glass-button" 
            style={{ width: '100%', background: 'var(--color-green)', color: '#ffffff', borderColor: 'transparent', height: '48px' }}
            disabled={lobbyPlayers.length < 2 || loading}
            onClick={startOnlineGame}
          >
            <Play size={18} /> Start Match (Needs 2+ Players)
          </button>
        ) : (
          <div style={{ textAlign: 'center', color: 'var(--text-secondary)', padding: '12px', fontSize: '14px', background: 'rgba(255,255,255,0.02)', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
            <span style={{ display: 'inline-block', animation: 'pulse 1.5s infinite' }}>⏳</span> Waiting for host to start the game...
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="setup-card glass-panel" style={{ maxWidth: '500px', margin: '0 auto' }}>
      <h2>Online Matchmaker</h2>
      <p style={{ textAlign: 'center', color: 'var(--text-secondary)', fontSize: '14px', marginBottom: '24px' }}>
        Create or join an online room to play Ludo with friends
      </p>

      {localError && (
        <div style={{ background: 'rgba(239, 68, 68, 0.1)', color: 'var(--color-red)', padding: '10px 14px', borderRadius: '10px', fontSize: '13px', marginBottom: '16px', border: '1px solid rgba(239, 68, 68, 0.2)' }}>
          {localError}
        </div>
      )}

      <div className="setup-section" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        {!isFirebaseOk ? (
          <div style={{ padding: '16px', background: 'rgba(245, 158, 11, 0.08)', borderRadius: '12px', border: '1px solid rgba(245, 158, 11, 0.2)', display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div style={{ display: 'flex', gap: '8px', color: 'var(--color-yellow)', fontWeight: '600', alignItems: 'center' }}>
              <AlertTriangle size={18} /> Firebase is not configured
            </div>
            <p style={{ fontSize: '12px', color: 'var(--text-secondary)', lineHeight: '1.4' }}>
              Online mode requires Firebase credentials. Click the gear settings icon in the top right to configure your connection in 5 seconds.
            </p>
            <button className="glass-button" style={{ fontSize: '12px', padding: '8px 16px' }} onClick={onOpenSettings}>
              Configure Firebase Credentials
            </button>
          </div>
        ) : (
          <>
            {/* Player details */}
            <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '12px', marginBottom: '6px', color: 'var(--text-secondary)' }}>Your Name</label>
                <input 
                  type="text" 
                  className="glass-input" 
                  style={{ padding: '12px' }}
                  value={playerName} 
                  onChange={(e) => setPlayerName(e.target.value)}
                  placeholder="Enter username"
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '12px', marginBottom: '6px', color: 'var(--text-secondary)' }}>Token Color</label>
                <select 
                  className="glass-input" 
                  style={{ padding: '12px 8px', textTransform: 'capitalize' }}
                  value={playerColor} 
                  onChange={(e) => setPlayerColor(e.target.value)}
                >
                  <option value="random" style={{ background: '#121420' }}>🎲 Random Color</option>
                  {COLORS.map(c => <option key={c} value={c} style={{ background: '#121420' }}>{c}</option>)}
                </select>
              </div>
            </div>

            <hr style={{ border: '0', borderTop: '1px solid rgba(255,255,255,0.05)', margin: '10px 0' }} />

            {/* Create Room Box */}
            <div style={{ background: 'rgba(255,255,255,0.01)', border: '1px dashed rgba(255,255,255,0.05)', padding: '16px', borderRadius: '12px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <h3 style={{ fontSize: '14px', margin: 0 }}>Host a Game</h3>
                  <p style={{ fontSize: '11px', color: 'var(--text-secondary)', margin: '2px 0 0 0' }}>Generates a random room code</p>
                </div>
                <button 
                  className="glass-button" 
                  disabled={loading} 
                  onClick={handleCreateOnline}
                  style={{ background: 'var(--color-yellow)', color: '#000000', borderColor: 'transparent', padding: '10px 16px', fontWeight: 'bold' }}
                >
                  <Plus size={16} /> Create Room
                </button>
              </div>
            </div>

            {/* Join Room Box */}
            <div style={{ background: 'rgba(255,255,255,0.01)', border: '1px dashed rgba(255,255,255,0.05)', padding: '16px', borderRadius: '12px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <h3 style={{ fontSize: '14px', margin: 0 }}>Join a Friend's Game</h3>
              <div style={{ display: 'flex', gap: '12px' }}>
                <input 
                  type="text" 
                  className="glass-input" 
                  style={{ fontFamily: 'var(--font-mono)', letterSpacing: '1px', textTransform: 'uppercase', textAlign: 'center', fontSize: '16px', fontWeight: 'bold', padding: '10px' }}
                  placeholder="ENTER 4-DIGIT CODE" 
                  value={roomInput} 
                  onChange={(e) => {
                    const val = e.target.value.replace(/[^0-9]/g, '');
                    if (val.length <= 4) setRoomInput(val);
                  }}
                />
                <button 
                  className="glass-button" 
                  disabled={loading} 
                  onClick={handleJoinOnline}
                  style={{ background: 'var(--color-blue)', color: '#ffffff', borderColor: 'transparent', padding: '10px 20px', fontWeight: 'bold' }}
                >
                  <ArrowRight size={16} /> Join
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};
export default Lobby;
