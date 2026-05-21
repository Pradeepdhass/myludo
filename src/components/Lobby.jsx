// Setup and Lobby Screen - Wood-Themed Room Multiplayer
import React, { useState, useEffect } from 'react';
import { Share2, Play, Plus, ArrowRight } from 'lucide-react';

// Cartoon SVG avatars for Ludo colors
const renderAvatarSvg = (color) => {
  switch (color) {
    case 'yellow':
      return (
        <svg viewBox="0 0 100 100" className="avatar-img-svg">
          <circle cx="50" cy="50" r="50" fill="#ffd32a" />
          {/* Ears */}
          <circle cx="25" cy="25" r="10" fill="#ffa801" />
          <circle cx="25" cy="25" r="6" fill="#ff7f50" />
          <circle cx="75" cy="25" r="10" fill="#ffa801" />
          <circle cx="75" cy="25" r="6" fill="#ff7f50" />
          {/* Stripes */}
          <polygon points="10,40 25,43 10,46" fill="#3d3d3d" />
          <polygon points="90,40 75,43 90,46" fill="#3d3d3d" />
          <polygon points="15,60 30,62 15,64" fill="#3d3d3d" />
          <polygon points="85,60 70,62 85,64" fill="#3d3d3d" />
          <polygon points="45,10 50,25 55,10" fill="#3d3d3d" />
          {/* Snout */}
          <ellipse cx="50" cy="65" rx="16" ry="12" fill="#ffffff" />
          {/* Eyes */}
          <circle cx="38" cy="45" r="5" fill="#3d3d3d" />
          <circle cx="38" cy="44" r="1.5" fill="#ffffff" />
          <circle cx="62" cy="45" r="5" fill="#3d3d3d" />
          <circle cx="62" cy="44" r="1.5" fill="#ffffff" />
          {/* Nose & Mouth */}
          <polygon points="46,58 54,58 50,64" fill="#ff5e57" />
          <path d="M 46 68 Q 50 72 54 68" fill="none" stroke="#3d3d3d" strokeWidth="2.5" strokeLinecap="round" />
        </svg>
      );
    case 'green':
      return (
        <svg viewBox="0 0 100 100" className="avatar-img-svg">
          <circle cx="50" cy="50" r="50" fill="#05c46b" />
          {/* Feather */}
          <path d="M 50 15 C 40 5, 60 5, 50 15 Z" fill="#0be881" />
          {/* Eyes */}
          <circle cx="35" cy="40" r="8" fill="#ffffff" />
          <circle cx="35" cy="40" r="4" fill="#1e272e" />
          <circle cx="35" cy="38" r="1.5" fill="#ffffff" />
          <circle cx="65" cy="40" r="8" fill="#ffffff" />
          <circle cx="65" cy="40" r="4" fill="#1e272e" />
          <circle cx="65" cy="38" r="1.5" fill="#ffffff" />
          {/* Blush */}
          <circle cx="28" cy="52" r="5" fill="#ff5e57" opacity="0.6" />
          <circle cx="72" cy="52" r="5" fill="#ff5e57" opacity="0.6" />
          {/* Beak */}
          <path d="M 44 48 Q 50 42 56 48 L 50 68 Z" fill="#ffc048" stroke="#d28c00" strokeWidth="1" />
        </svg>
      );
    case 'red':
      return (
        <svg viewBox="0 0 100 100" className="avatar-img-svg">
          <circle cx="50" cy="50" r="50" fill="#ff5e57" />
          {/* Ears */}
          <polygon points="15,35 20,5 42,28" fill="#ff3f34" />
          <polygon points="18,32 23,10 38,26" fill="#ffd2cc" />
          <polygon points="85,35 80,5 58,28" fill="#ff3f34" />
          <polygon points="82,32 77,10 62,26" fill="#ffd2cc" />
          {/* Cheeks */}
          <path d="M 15 62 Q 35 75 50 62 Q 65 75 85 62 C 75 90, 25 90, 15 62 Z" fill="#ffffff" />
          {/* Eyes */}
          <circle cx="35" cy="45" r="5" fill="#1e272e" />
          <circle cx="35" cy="43" r="1.5" fill="#ffffff" />
          <circle cx="65" cy="45" r="5" fill="#1e272e" />
          <circle cx="65" cy="43" r="1.5" fill="#ffffff" />
          {/* Nose */}
          <circle cx="50" cy="62" r="6" fill="#1e272e" />
        </svg>
      );
    case 'blue':
      return (
        <svg viewBox="0 0 100 100" className="avatar-img-svg">
          <circle cx="50" cy="50" r="50" fill="#3c40c6" />
          {/* Fin */}
          <path d="M 50 15 Q 65 0 60 25 Z" fill="#575fcf" />
          {/* Belly */}
          <path d="M 15 70 C 30 92, 70 92, 85 70 C 70 82, 30 82, 15 70 Z" fill="#f1f2f6" />
          {/* Eyes */}
          <circle cx="36" cy="42" r="5" fill="#1e272e" />
          <circle cx="36" cy="40" r="1.5" fill="#ffffff" />
          <circle cx="64" cy="42" r="5" fill="#1e272e" />
          <circle cx="64" cy="40" r="1.5" fill="#ffffff" />
          {/* Gills */}
          <path d="M 22 45 Q 26 48 22 51" fill="none" stroke="#575fcf" strokeWidth="2" strokeLinecap="round" />
          <path d="M 78 45 Q 74 48 78 51" fill="none" stroke="#575fcf" strokeWidth="2" strokeLinecap="round" />
          {/* Mouth */}
          <path d="M 40 56 Q 50 64 60 56" fill="none" stroke="#1e272e" strokeWidth="3" strokeLinecap="round" />
        </svg>
      );
    default:
      return null;
  }
};

export const Lobby = ({
  createOnlineRoom,
  joinOnlineRoom,
  startOnlineGame,
  roomId,
  lobbyPlayers,
  gameState,
  myPlayerId,
  configureLocalGame,
  configureAIGame,
  coins = 2500,
  addCoins,
  lastWinnings = 0,
  getPrizePool
}) => {
  const [playerName, setPlayerName] = useState(() => localStorage.getItem('ludo_player_name') || 'Player');
  const [playerColor, setPlayerColor] = useState('random');
  const [roomInput, setRoomInput] = useState('');
  const [activeTab, setActiveTab] = useState('invite'); // 'invite' or 'join' for Online mode
  const [loading, setLoading] = useState(false);
  const [localError, setLocalError] = useState('');

  // New states for AI & Local setup
  const [gameModeTab, setGameModeTab] = useState(() => {
    if (roomId) return 'online';
    return 'ai';
  });
  const [aiOpponents, setAiOpponents] = useState(3);
  const [localPlayers, setLocalPlayers] = useState({
    yellow: { name: 'Player 1', active: true },
    green: { name: 'Player 2', active: true },
    red: { name: 'Player 3', active: false },
    blue: { name: 'Player 4', active: false }
  });
  const [insufficientModal, setInsufficientModal] = useState({ show: false, mode: '', fee: 0 });
  const [showBurst, setShowBurst] = useState(false);

  // Sync gameModeTab if roomId becomes active
  useEffect(() => {
    if (roomId) {
      setGameModeTab('online');
    }
  }, [roomId]);

  // Handle URL parameter prefilling
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const roomParam = params.get('room');
    if (roomParam) {
      setRoomInput(roomParam);
      setActiveTab('join');
      setGameModeTab('online');
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('ludo_player_name', playerName);
  }, [playerName]);

  const currentTab = roomId ? 'invite' : activeTab;

  const generateRandomRoomId = () => {
    return Math.floor(1000 + Math.random() * 9000).toString();
  };

  const handleStartAIGame = () => {
    setLocalError('');
    if (!playerName.trim()) {
      setLocalError("Please enter your name first!");
      return;
    }
    if (coins < 100) {
      setInsufficientModal({ show: true, mode: 'VS AI', fee: 100 });
      return;
    }
    let resolvedColor = playerColor;
    if (resolvedColor === 'random') {
      const colors = ['yellow', 'green', 'red', 'blue'];
      resolvedColor = colors[Math.floor(Math.random() * colors.length)];
    }
    configureAIGame(playerName, resolvedColor, aiOpponents);
  };

  const handleStartLocalGame = () => {
    setLocalError('');
    const activeCount = Object.values(localPlayers).filter(p => p.active).length;
    if (activeCount < 2) {
      setLocalError("Pass & Play requires at least 2 active players!");
      return;
    }
    if (coins < 200) {
      setInsufficientModal({ show: true, mode: 'Pass & Play', fee: 200 });
      return;
    }
    configureLocalGame(localPlayers);
  };

  const handleCreateOnline = async () => {
    setLocalError('');
    if (!playerName.trim()) {
      setLocalError("Please enter your name first!");
      return;
    }
    if (coins < 500) {
      setInsufficientModal({ show: true, mode: 'Play Online (Create Room)', fee: 500 });
      return;
    }
    
    setLoading(true);
    const randomId = generateRandomRoomId();

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
      setLocalError("Please enter your name first!");
      return;
    }
    if (!roomInput.trim() || roomInput.trim().length < 4) {
      setLocalError("Please enter a valid 4-digit room ID!");
      return;
    }
    if (coins < 500) {
      setInsufficientModal({ show: true, mode: 'Play Online (Join Room)', fee: 500 });
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

  const handleToggleLocalPlayer = (color) => {
    const activeCount = Object.values(localPlayers).filter(p => p.active).length;
    if (localPlayers[color].active && activeCount <= 2) {
      setLocalError("A local match requires at least 2 active players!");
      return;
    }
    setLocalError('');
    setLocalPlayers(prev => ({
      ...prev,
      [color]: { ...prev[color], active: !prev[color].active }
    }));
  };

  const handleLocalPlayerNameChange = (color, name) => {
    setLocalPlayers(prev => ({
      ...prev,
      [color]: { ...prev[color], name }
    }));
  };

  const handleClaimCoins = () => {
    addCoins(1000);
    setShowBurst(true);
    setInsufficientModal({ show: false, mode: '', fee: 0 });
  };

  const handleShare = () => {
    const shareText = `Play Ludo with me! Room ID: ${roomId}`;
    const shareUrl = `${window.location.origin}${window.location.pathname}?room=${roomId}`;
    if (navigator.share) {
      navigator.share({
        title: 'Ludo Pro Online',
        text: shareText,
        url: shareUrl
      }).catch(console.error);
    } else {
      navigator.clipboard.writeText(`${shareText} - ${shareUrl}`);
      alert("Room link copied to clipboard!");
    }
  };

  const renderSlotsGrid = () => {
    const colors = ['yellow', 'green', 'red', 'blue'];
    return (
      <div className="lobby-grid-container">
        {colors.map(color => {
          const p = lobbyPlayers.find(x => x.color === color);
          if (p) {
            return (
              <div key={color} className="lobby-grid-slot">
                <div className={`avatar-circle-outer slot-${color}`}>
                  {renderAvatarSvg(color)}
                </div>
                <div className="player-name-pill">
                  {p.name}
                  {p.isHost && " 👑"}
                </div>
              </div>
            );
          } else {
            return (
              <div key={color} className="lobby-grid-slot">
                <div className="avatar-circle-outer waiting">
                  <span style={{ fontSize: '28px', color: '#b0bec5', fontWeight: 'bold' }}>+</span>
                </div>
                <div className="player-name-pill waiting-label">
                  WAITING...
                </div>
              </div>
            );
          }
        })}
        <div className="vs-badge-center">VS</div>
      </div>
    );
  };

  const renderLocalPlayersSetup = () => {
    const colors = ['yellow', 'green', 'red', 'blue'];
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
        <p style={{ fontSize: '13px', color: '#8c4e20', textAlign: 'center', fontWeight: '800', textTransform: 'uppercase' }}>
          Configure Local Players
        </p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {colors.map(color => {
            const isPlayerActive = localPlayers[color].active;
            return (
              <div
                key={color}
                className={`local-player-slot slot-${color} ${isPlayerActive ? 'active' : 'inactive'}`}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  padding: '8px 14px',
                  borderRadius: '18px',
                  border: '3px solid #4a220f',
                  backgroundColor: isPlayerActive ? '#ffffff' : 'rgba(74, 34, 15, 0.05)',
                  transition: 'all 0.2s ease',
                  boxShadow: isPlayerActive ? 'inset 0 2px 4px rgba(0,0,0,0.05), 0 4px 6px rgba(0,0,0,0.1)' : 'none'
                }}
              >
                <input
                  type="checkbox"
                  id={`local-active-${color}`}
                  checked={isPlayerActive}
                  onChange={() => handleToggleLocalPlayer(color)}
                  style={{
                    width: '20px',
                    height: '20px',
                    cursor: 'pointer',
                    accentColor: `var(--color-${color})`
                  }}
                />
                
                <div style={{ width: '32px', height: '32px' }}>
                  {renderAvatarSvg(color)}
                </div>

                <input
                  type="text"
                  id={`local-name-${color}`}
                  value={localPlayers[color].name}
                  disabled={!isPlayerActive}
                  onChange={(e) => handleLocalPlayerNameChange(color, e.target.value)}
                  placeholder={`${color.charAt(0).toUpperCase() + color.slice(1)} Player`}
                  maxLength={12}
                  style={{
                    flex: 1,
                    border: 'none',
                    borderBottom: isPlayerActive ? `2px solid var(--color-${color})` : '2px solid transparent',
                    background: 'transparent',
                    color: isPlayerActive ? '#4a220f' : '#a0a0a0',
                    fontWeight: '800',
                    fontSize: '14px',
                    padding: '4px 8px',
                    outline: 'none'
                  }}
                />
              </div>
            );
          })}
        </div>

        <div className="fee-badge" style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          gap: '6px',
          fontWeight: '800',
          color: '#8c4e20',
          fontSize: '14px',
          marginTop: '10px'
        }}>
          Entry Fee: <span className="coin-glow" style={{ color: '#e6a100' }}>🪙 200 Gold</span>
        </div>

        <button
          className="btn-3d btn-3d-green"
          style={{ width: '100%', height: '48px', marginTop: '4px' }}
          onClick={handleStartLocalGame}
        >
          <Play size={16} fill="#ffffff" /> PLAY PASS & PLAY
        </button>
      </div>
    );
  };

  const renderAISetup = () => {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <div>
          <label style={{ display: 'block', fontSize: '12px', fontWeight: '800', color: '#8c4e20', marginBottom: '6px', textTransform: 'uppercase' }}>Your Name</label>
          <input
            type="text"
            className="capsule-input-container"
            style={{
              backgroundColor: '#ffffff',
              border: '3px solid #4a220f',
              borderRadius: '20px',
              color: '#4a220f',
              fontWeight: '700',
              padding: '12px 18px',
              width: '100%',
              outline: 'none'
            }}
            value={playerName}
            onChange={(e) => setPlayerName(e.target.value)}
            placeholder="Enter Username"
            maxLength={12}
          />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '14px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: '800', color: '#8c4e20', marginBottom: '6px', textTransform: 'uppercase' }}>Your Color</label>
            <select
              style={{
                backgroundColor: '#ffffff',
                border: '3px solid #4a220f',
                borderRadius: '20px',
                color: '#4a220f',
                fontWeight: '700',
                padding: '12px 18px',
                width: '100%',
                outline: 'none',
                textTransform: 'capitalize',
                cursor: 'pointer'
              }}
              value={playerColor}
              onChange={(e) => setPlayerColor(e.target.value)}
            >
              <option value="random">🎲 Random Color</option>
              <option value="yellow">Yellow</option>
              <option value="green">Green</option>
              <option value="red">Red</option>
              <option value="blue">Blue</option>
            </select>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: '800', color: '#8c4e20', marginBottom: '6px', textTransform: 'uppercase' }}>Opponents</label>
            <select
              style={{
                backgroundColor: '#ffffff',
                border: '3px solid #4a220f',
                borderRadius: '20px',
                color: '#4a220f',
                fontWeight: '700',
                padding: '12px 18px',
                width: '100%',
                outline: 'none',
                cursor: 'pointer'
              }}
              value={aiOpponents}
              onChange={(e) => setAiOpponents(parseInt(e.target.value, 10))}
            >
              <option value={1}>1 Computer</option>
              <option value={2}>2 Computers</option>
              <option value={3}>3 Computers</option>
            </select>
          </div>
        </div>

        <div className="fee-badge" style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          gap: '6px',
          fontWeight: '800',
          color: '#8c4e20',
          fontSize: '14px',
          marginTop: '10px'
        }}>
          Entry Fee: <span className="coin-glow" style={{ color: '#e6a100' }}>🪙 100 Gold</span>
        </div>

        <button
          className="btn-3d btn-3d-yellow"
          style={{ width: '100%', height: '48px', marginTop: '4px' }}
          onClick={handleStartAIGame}
        >
          <Play size={16} fill="#ffffff" /> PLAY VS COMPUTER
        </button>
      </div>
    );
  };

  const renderInsufficientModal = () => {
    if (!insufficientModal.show) return null;
    return (
      <div className="modal-overlay" style={{ zIndex: 10000 }}>
        <div className="modal-content glass-panel" style={{
          padding: '30px',
          maxWidth: '360px',
          border: '4px solid #4a220f',
          background: 'linear-gradient(to bottom, #fdf1e1 0%, #edd3b8 100%)',
          color: '#4a220f',
          boxShadow: '0 20px 40px rgba(0,0,0,0.5)'
        }}>
          <div style={{ fontSize: '48px', marginBottom: '16px', animation: 'bounce 2s infinite' }}>🪙</div>
          <h2 style={{ color: '#4a220f', fontSize: '22px', fontWeight: '800', marginBottom: '12px' }}>Insufficient Coins!</h2>
          <p style={{ fontSize: '14px', color: '#8c4e20', fontWeight: '600', lineHeight: '1.5', marginBottom: '24px' }}>
            Starting a <strong style={{ color: '#4a220f' }}>{insufficientModal.mode}</strong> match requires <strong style={{ color: '#4a220f' }}>{insufficientModal.fee}</strong> coins.<br />
            You currently have <strong style={{ color: '#d28c00' }}>{coins}</strong> coins.
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <button
              className="btn-3d btn-3d-green"
              style={{ width: '100%', height: '48px', fontSize: '15px' }}
              onClick={handleClaimCoins}
            >
              🎉 CLAIM 1,000 COINS!
            </button>
            <button
              className="btn-3d btn-3d-cyan"
              style={{ width: '100%', height: '44px', fontSize: '14px' }}
              onClick={() => setInsufficientModal({ show: false, mode: '', fee: 0 })}
            >
              CANCEL
            </button>
          </div>
        </div>
      </div>
    );
  };

  const localPlayerObj = lobbyPlayers.find(p => p.id === myPlayerId);
  const isHost = localPlayerObj ? localPlayerObj.isHost : false;

  return (
    <div style={{ maxWidth: '420px', width: '100%', margin: '0 auto', padding: '10px' }}>
      {showBurst && <CoinBurst onComplete={() => setShowBurst(false)} />}
      {renderInsufficientModal()}
      
      <div className="wooden-plaque">
        <div className="wooden-banner">
          <h2>{roomId ? 'Room Lobby' : 'Ludo Pro Setup'}</h2>
        </div>

        {/* Main Mode Selection Tab Bar */}
        {!roomId && (
          <div className="wooden-tab-bar mode-tabs" style={{ gridTemplateColumns: 'repeat(3, 1fr)', gap: '6px' }}>
            <button
              className={`wooden-tab ${gameModeTab === 'ai' ? 'active' : ''}`}
              onClick={() => { setGameModeTab('ai'); setLocalError(''); }}
            >
              VS AI
            </button>
            <button
              className={`wooden-tab ${gameModeTab === 'local' ? 'active' : ''}`}
              onClick={() => { setGameModeTab('local'); setLocalError(''); }}
            >
              Local
            </button>
            <button
              className={`wooden-tab ${gameModeTab === 'online' ? 'active' : ''}`}
              onClick={() => { setGameModeTab('online'); setLocalError(''); }}
            >
              Online
            </button>
          </div>
        )}

        <div className="wooden-card" style={{ borderRadius: roomId ? '0 0 20px 20px' : '0 0 20px 20px' }}>
          
          {/* Wallet Widget inside Card */}
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '16px',
            background: 'rgba(74, 34, 15, 0.05)',
            padding: '10px 14px',
            borderRadius: '16px',
            border: '2px solid rgba(74,34,15,0.08)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '20px' }}>🪙</span>
              <span style={{ fontSize: '13px', fontWeight: '800', color: '#4a220f', letterSpacing: '0.5px' }}>GOLD WALLET</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span className="coin-glow" style={{ fontSize: '16px', fontWeight: '800', color: '#d28c00' }}>{coins.toLocaleString()}</span>
              <button
                className="btn-3d btn-3d-cyan"
                style={{ width: '28px', height: '28px', fontSize: '16px', padding: '0', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                onClick={() => { addCoins(1000); setShowBurst(true); }}
                title="Claim 1,000 Free Coins"
              >
                +
              </button>
            </div>
          </div>

          {localError && (
            <div style={{ background: '#ffdddd', border: '2px solid #ff5e57', color: '#b33939', padding: '10px 14px', borderRadius: '12px', fontSize: '13px', marginBottom: '16px', fontWeight: 'bold', textAlign: 'center' }}>
              ⚠️ {localError}
            </div>
          )}

          {/* Lobby Waiting Room for Online Active Match */}
          {roomId ? (
            <div>
              {lobbyPlayers.length <= 1 ? (
                <div className="invite-instructions-box">
                  <div className="invite-instruction-row">
                    <div className="instruction-num">1</div>
                    <span>TAP SHARE TO INVITE FRIENDS</span>
                  </div>
                  <div className="invite-instruction-row">
                    <div className="instruction-num">2</div>
                    <span>WAIT FOR THEM TO JOIN</span>
                  </div>
                  <div className="invite-instruction-row">
                    <div className="instruction-num">3</div>
                    <span>TAP 'START' AND PLAY!</span>
                  </div>
                </div>
              ) : (
                renderSlotsGrid()
              )}

              <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '14px', marginTop: '16px', alignItems: 'center' }}>
                <div className="capsule-room-box">
                  <span style={{ fontSize: '11px', fontWeight: '800', color: '#8c4e20', letterSpacing: '0.5px' }}>ROOM ID</span>
                  <span style={{ fontSize: '24px', fontWeight: '800', color: '#4a220f', letterSpacing: '1px', lineHeight: '1' }}>{roomId}</span>
                </div>
                
                <button
                  className="btn-3d btn-3d-cyan"
                  style={{ height: '48px', width: '100%' }}
                  onClick={handleShare}
                >
                  <Share2 size={16} /> SHARE
                </button>
              </div>

              <div style={{ marginTop: '24px', textAlign: 'center' }}>
                {isHost ? (
                  <>
                    <p style={{ fontSize: '12px', fontWeight: '800', color: '#8c4e20', marginBottom: '10px', textTransform: 'uppercase' }}>
                      WHEN YOU'RE READY, PRESS 'START' TO PLAY
                    </p>
                    <button
                      className="btn-3d btn-3d-green"
                      style={{ width: '100%', height: '52px', fontSize: '18px' }}
                      disabled={lobbyPlayers.length < 2 || loading}
                      onClick={startOnlineGame}
                    >
                      <Play size={18} fill="#ffffff" /> START
                    </button>
                  </>
                ) : (
                  <div style={{ background: 'rgba(140,82,41,0.06)', border: '2px solid rgba(74,34,15,0.1)', color: '#8c4e20', padding: '14px', borderRadius: '16px', fontWeight: 'bold', fontSize: '14px' }}>
                    <span style={{ display: 'inline-block', animation: 'pulse 1.5s infinite', marginRight: '6px' }}>⏳</span>
                    Waiting for host to start the game...
                  </div>
                )}
              </div>
            </div>
          ) : (
            /* Subcard view depending on selected Game Mode */
            <div>
              {gameModeTab === 'ai' && renderAISetup()}
              
              {gameModeTab === 'local' && renderLocalPlayersSetup()}

              {gameModeTab === 'online' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  {/* Tab Selection */}
                  <div className="wooden-tab-bar" style={{ marginBottom: '8px' }}>
                    <button
                      className={`wooden-tab ${currentTab === 'invite' ? 'active' : ''}`}
                      onClick={() => setActiveTab('invite')}
                    >
                      Invite
                    </button>
                    <button
                      className={`wooden-tab ${currentTab === 'join' ? 'active' : ''}`}
                      onClick={() => setActiveTab('join')}
                    >
                      Join
                    </button>
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: '800', color: '#8c4e20', marginBottom: '6px', textTransform: 'uppercase' }}>Your Name</label>
                    <input
                      type="text"
                      className="capsule-input-container"
                      style={{
                        backgroundColor: '#ffffff',
                        border: '3px solid #4a220f',
                        borderRadius: '20px',
                        color: '#4a220f',
                        fontWeight: '700',
                        padding: '12px 18px',
                        width: '100%',
                        outline: 'none'
                      }}
                      value={playerName}
                      onChange={(e) => setPlayerName(e.target.value)}
                      placeholder="Enter Username"
                      maxLength={12}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: '800', color: '#8c4e20', marginBottom: '6px', textTransform: 'uppercase' }}>Preferred Color</label>
                    <select
                      style={{
                        backgroundColor: '#ffffff',
                        border: '3px solid #4a220f',
                        borderRadius: '20px',
                        color: '#4a220f',
                        fontWeight: '700',
                        padding: '12px 18px',
                        width: '100%',
                        outline: 'none',
                        textTransform: 'capitalize',
                        cursor: 'pointer'
                      }}
                      value={playerColor}
                      onChange={(e) => setPlayerColor(e.target.value)}
                    >
                      <option value="random">🎲 Random Color</option>
                      <option value="yellow">Yellow</option>
                      <option value="green">Green</option>
                      <option value="red">Red</option>
                      <option value="blue">Blue</option>
                    </select>
                  </div>

                  <hr style={{ border: '0', borderTop: '2px dashed rgba(74,34,15,0.15)', margin: '4px 0' }} />

                  {activeTab === 'invite' ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                      <div className="fee-badge" style={{
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                        gap: '6px',
                        fontWeight: '800',
                        color: '#8c4e20',
                        fontSize: '14px',
                        marginBottom: '4px'
                      }}>
                        Entry Fee: <span className="coin-glow" style={{ color: '#e6a100' }}>🪙 500 Gold</span>
                      </div>
                      <button
                        className="btn-3d btn-3d-yellow"
                        style={{ width: '100%', height: '48px' }}
                        disabled={loading}
                        onClick={handleCreateOnline}
                      >
                        <Plus size={16} strokeWidth={3} /> CREATE ROOM
                      </button>
                    </div>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                      <div className="fee-badge" style={{
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                        gap: '6px',
                        fontWeight: '800',
                        color: '#8c4e20',
                        fontSize: '14px'
                      }}>
                        Entry Fee: <span className="coin-glow" style={{ color: '#e6a100' }}>🪙 500 Gold</span>
                      </div>
                      <div className="capsule-input-container">
                        <input
                          type="text"
                          placeholder="ENTER 4-DIGIT ROOM ID..."
                          value={roomInput}
                          onChange={(e) => {
                            const val = e.target.value.replace(/[^0-9]/g, '');
                            if (val.length <= 4) setRoomInput(val);
                          }}
                        />
                        <button
                          className="capsule-input-arrow-btn"
                          disabled={loading}
                          onClick={handleJoinOnline}
                          title="Join Room"
                        >
                          <ArrowRight size={20} strokeWidth={3} />
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Coin burst particle animation helper component
const CoinBurst = ({ onComplete }) => {
  const [coinsList, setCoinsList] = useState([]);

  useEffect(() => {
    const list = Array.from({ length: 35 }).map((_, i) => {
      const angle = Math.random() * Math.PI * 2;
      const velocity = 5 + Math.random() * 15;
      const rotationSpeed = (Math.random() - 0.5) * 720;
      return {
        id: i,
        x: window.innerWidth / 2,
        y: window.innerHeight / 2,
        vx: Math.cos(angle) * velocity,
        vy: Math.sin(angle) * velocity - 10,
        rotation: Math.random() * 360,
        vr: rotationSpeed,
        scale: 0.5 + Math.random() * 0.7,
        alpha: 1
      };
    });
    setCoinsList(list);

    let animationFrame;
    const startTime = Date.now();
    const update = () => {
      const elapsed = Date.now() - startTime;
      if (elapsed > 1200) {
        onComplete();
        return;
      }
      setCoinsList(prev => prev.map(c => {
        const newVy = c.vy + 0.8; // gravity
        return {
          ...c,
          x: c.x + c.vx,
          y: c.y + c.vy,
          vy: newVy,
          rotation: c.rotation + c.vr * 0.016,
          alpha: Math.max(0, 1 - elapsed / 1200)
        };
      }));
      animationFrame = requestAnimationFrame(update);
    };

    animationFrame = requestAnimationFrame(update);
    return () => cancelAnimationFrame(animationFrame);
  }, [onComplete]);

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100vw',
      height: '100vh',
      pointerEvents: 'none',
      zIndex: 9999,
      overflow: 'hidden'
    }}>
      {coinsList.map(c => (
        <div
          key={c.id}
          style={{
            position: 'absolute',
            left: `${c.x}px`,
            top: `${c.y}px`,
            width: '28px',
            height: '28px',
            borderRadius: '50%',
            background: 'radial-gradient(circle, #ffe066 30%, #e6a100 80%, #996b00 100%)',
            border: '2px solid #fff5cc',
            boxShadow: '0 4px 8px rgba(0,0,0,0.3), inset 0 2px 2px rgba(255,255,255,0.6)',
            transform: `translate(-50%, -50%) rotate(${c.rotation}deg) scale(${c.scale})`,
            opacity: c.alpha,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontWeight: 'bold',
            color: '#4a220f',
            fontSize: '11px',
            fontFamily: 'sans-serif'
          }}
        >
          $
        </div>
      ))}
    </div>
  );
};

export default Lobby;
