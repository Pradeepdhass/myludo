// Game Info and Logs Sidebar Component
import React, { useState } from 'react';
import { Volume2, VolumeX, LogOut, ShieldAlert, Award } from 'lucide-react';
import { audio } from '../services/audio';

export const GameLog = ({ 
  turn, 
  players, 
  logs, 
  onExit, 
  finishedPlayers,
  gameMode,
  roomId
}) => {
  const [muted, setMuted] = useState(false);

  const toggleMute = () => {
    const newVal = !muted;
    setMuted(newVal);
    audio.setMuted(newVal);
  };

  const getPlayerDisplayName = (color) => {
    return players[color]?.name || color.toUpperCase();
  };

  return (
    <div className="control-sidebar">
      {/* Turn Indicator & Status Card */}
      <div className="status-card glass-panel">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h2 style={{ fontSize: '18px', fontWeight: '800' }}>Active Match</h2>
          <button 
            className="glass-button" 
            style={{ padding: '6px', borderRadius: '50%' }} 
            onClick={toggleMute}
            title={muted ? 'Unmute Sound' : 'Mute Sound'}
          >
            {muted ? <VolumeX size={16} /> : <Volume2 size={16} />}
          </button>
        </div>

        {gameMode === 'online' && roomId && (
          <div style={{ padding: '6px 12px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '8px', fontSize: '12px', display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ color: 'var(--text-secondary)' }}>Online Room:</span>
            <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 'bold', color: 'var(--color-yellow)' }}>{roomId}</span>
          </div>
        )}

        <div className="turn-indicator">
          <span>Active Turn:</span>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span 
              className="turn-badge" 
              style={{ 
                color: `var(--color-${turn})`, 
                backgroundColor: `var(--color-${turn})` 
              }} 
            />
            <span style={{ textTransform: 'capitalize', fontWeight: 'bold' }}>
              {getPlayerDisplayName(turn)}
            </span>
          </div>
        </div>

        {/* Finished Players (Leaderboard) */}
        {finishedPlayers.length > 0 && (
          <div style={{ marginTop: '4px' }}>
            <span style={{ fontSize: '12px', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '8px' }}>
              <Award size={14} style={{ color: 'var(--color-yellow)' }} /> Standings
            </span>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              {finishedPlayers.map((color, idx) => (
                <div 
                  key={color} 
                  style={{ 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    padding: '6px 12px', 
                    borderRadius: '8px', 
                    background: 'rgba(255,255,255,0.02)',
                    borderLeft: `3px solid var(--color-${color})`,
                    fontSize: '13px'
                  }}
                >
                  <span style={{ fontWeight: '600' }}>#{idx + 1} {getPlayerDisplayName(color)}</span>
                  <span style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>FINISHED</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Logs Card */}
      <div className="logs-card glass-panel">
        <h3>Match feed</h3>
        <ul className="logs-list">
          {logs.map((log, idx) => (
            <li key={idx} className="log-item">
              <span className="log-time">[{log.time}]</span>
              <span>{log.text}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Exit Button */}
      <button 
        className="glass-button" 
        style={{ 
          background: 'rgba(239, 68, 68, 0.1)', 
          color: 'var(--color-red)', 
          borderColor: 'rgba(239, 68, 68, 0.2)',
          marginTop: 'auto'
        }}
        onClick={onExit}
      >
        <LogOut size={16} /> Exit Current Match
      </button>
    </div>
  );
};
export default GameLog;
