// 3D Cube Dice Component
import React from 'react';

export const Dice = ({ value, state, onClick, disabled, isMyTurn, turnName }) => {
  
  // Decide which orientation class to show for the 3D cube based on value
  const getCubeShowClass = () => {
    switch (value) {
      case 1: return 'show-1';
      case 2: return 'show-2';
      case 3: return 'show-3';
      case 4: return 'show-4';
      case 5: return 'show-5';
      case 6: return 'show-6';
      default: return 'show-1';
    }
  };

  const isRolling = state === 'rolling';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%' }}>
      <div 
        className="dice-container"
        style={{
          cursor: disabled || isRolling ? 'not-allowed' : 'pointer',
          position: 'relative'
        }}
        onClick={disabled || isRolling ? undefined : onClick}
      >
        <div className={`cube ${isRolling ? 'rolling' : getCubeShowClass()}`}>
          {/* Face 1 */}
          <div className="cube-face face-1">
            <div className="dot"></div>
          </div>
          {/* Face 2 */}
          <div className="cube-face face-2">
            <div className="dot"></div>
            <div className="dot"></div>
          </div>
          {/* Face 3 */}
          <div className="cube-face face-3">
            <div className="dot"></div>
            <div className="dot"></div>
            <div className="dot"></div>
          </div>
          {/* Face 4 */}
          <div className="cube-face face-4">
            <div className="dot"></div>
            <div className="dot"></div>
            <div className="dot"></div>
            <div className="dot"></div>
          </div>
          {/* Face 5 */}
          <div className="cube-face face-5">
            <div className="dot"></div>
            <div className="dot"></div>
            <div className="dot"></div>
            <div className="dot"></div>
            <div className="dot"></div>
          </div>
          {/* Face 6 */}
          <div className="cube-face face-6">
            <div className="dot"></div>
            <div className="dot"></div>
            <div className="dot"></div>
            <div className="dot"></div>
            <div className="dot"></div>
            <div className="dot"></div>
          </div>
        </div>
      </div>
      
      <button
        className="glass-button"
        style={{
          width: '100%',
          marginTop: '12px',
          background: isMyTurn ? 'var(--color-yellow)' : 'rgba(255,255,255,0.05)',
          color: isMyTurn ? '#000000' : 'var(--text-primary)',
          borderColor: isMyTurn ? 'transparent' : 'rgba(255,255,255,0.1)',
          boxShadow: isMyTurn ? '0 0 15px var(--color-yellow-glow)' : 'none',
          animation: isMyTurn && !isRolling ? 'pulse 1.5s infinite' : 'none'
        }}
        disabled={disabled || isRolling}
        onClick={onClick}
      >
        {isRolling ? (
          <span>Rolling...</span>
        ) : isMyTurn ? (
          <span>ROLL DICE!</span>
        ) : (
          <span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
            Waiting for {turnName || 'player'}
          </span>
        )}
      </button>
    </div>
  );
};
export default Dice;
