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
  myPlayerId
}) => {
  const [playerName, setPlayerName] = useState(() => localStorage.getItem('ludo_player_name') || 'Player');
  const [playerColor, setPlayerColor] = useState('random');
  const [roomInput, setRoomInput] = useState('');
  const [activeTab, setActiveTab] = useState('invite'); // 'invite' or 'join'
  const [loading, setLoading] = useState(false);
  const [localError, setLocalError] = useState('');

  // Handle URL parameter prefilling
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const roomParam = params.get('room');
    if (roomParam) {
      setRoomInput(roomParam);
      setActiveTab('join');
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('ludo_player_name', playerName);
  }, [playerName]);

  // Lock tab to Invite when connected to an online room
  const currentTab = roomId ? 'invite' : activeTab;

  const generateRandomRoomId = () => {
    return Math.floor(1000 + Math.random() * 9000).toString();
  };

  const handleCreateOnline = async () => {
    setLocalError('');
    if (!playerName.trim()) {
      setLocalError("Please enter your name first!");
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
    
    setLoading(true);
    try {
      await joinOnlineRoom(roomInput.trim().toUpperCase(), playerName, playerColor);
    } catch (e) {
      setLocalError(e.message);
    } finally {
      setLoading(false);
    }
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

  // Determine if local player is host
  const localPlayerObj = lobbyPlayers.find(p => p.id === myPlayerId);
  const isHost = localPlayerObj ? localPlayerObj.isHost : false;

  return (
    <div style={{ maxWidth: '420px', width: '100%', margin: '0 auto', padding: '10px' }}>
      <div className="wooden-plaque">
        {/* Play with Friends banner plate */}
        <div className="wooden-banner">
          <h2>Play With Friends</h2>
        </div>

        {/* Tab Selection */}
        <div className="wooden-tab-bar">
          <button
            className={`wooden-tab ${currentTab === 'invite' ? 'active' : ''}`}
            disabled={!!roomId}
            onClick={() => setActiveTab('invite')}
          >
            Invite
          </button>
          <button
            className={`wooden-tab ${currentTab === 'join' ? 'active' : ''}`}
            disabled={!!roomId}
            onClick={() => setActiveTab('join')}
          >
            Join
          </button>
        </div>

        {/* Beige Board Contents */}
        <div className="wooden-card">
          {localError && (
            <div style={{ background: '#ffdddd', border: '2px solid #ff5e57', color: '#b33939', padding: '10px 14px', borderRadius: '12px', fontSize: '13px', marginBottom: '16px', fontWeight: 'bold', textAlign: 'center' }}>
              ⚠️ {localError}
            </div>
          )}

          {/* Connected Lobby Waiting Room */}
          {roomId ? (
            <div>
              {lobbyPlayers.length <= 1 ? (
                // 1 Player: Show standard instructions
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
                // 2+ Players: Show Grid Slots representation
                renderSlotsGrid()
              )}

              {/* Room ID and Share Button row */}
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

              {/* Host Start / Guest Waiting controls */}
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
            /* Setup forms (Create / Join options) */
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
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
                /* Host View setup */
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  <p style={{ fontSize: '13px', color: '#8c4e20', textAlign: 'center', margin: '0 0 4px 0', fontWeight: '600' }}>
                    Create a new room and invite your friends!
                  </p>
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
                /* Join View setup */
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <p style={{ fontSize: '13px', color: '#8c4e20', textAlign: 'center', margin: '0 0 4px 0', fontWeight: '600' }}>
                    ENTER THE ROOM ID TO PLAY WITH YOUR FRIENDS
                  </p>
                  <div className="capsule-input-container">
                    <input
                      type="text"
                      placeholder="ENTER THE ROOM ID HERE..."
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
      </div>
    </div>
  );
};

export default Lobby;
