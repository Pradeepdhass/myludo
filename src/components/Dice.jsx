// Premium Dice Component matching the wood/flat-3D interface design
import React from 'react';

export const Dice = ({ value, state, onClick, disabled, isMyTurn, color }) => {
  const isRolling = state === 'rolling';

  // SVG Blue Circular Spiral Arrow Icon (representing ready to roll)
  const renderRollIcon = () => (
    <svg viewBox="0 0 24 24" className="dice-roll-icon-svg" fill="none" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21.5 2v6h-6" />
      <path d="M21.34 15.57a10 10 0 1 1-.57-8.38l5.67-5.67" />
    </svg>
  );

  // Render dots 1 to 6 dynamically using CSS Grid
  const renderDots = (val, activeColor) => {
    const dotColorClass = `dot-${activeColor}`;
    switch (val) {
      case 1:
        return (
          <div className="dice-dots-grid one-dot">
            <div className={`dice-dot ${dotColorClass}`} />
          </div>
        );
      case 2:
        return (
          <div className="dice-dots-grid two-dots">
            <div className={`dice-dot ${dotColorClass}`} />
            <div className={`dice-dot ${dotColorClass}`} />
          </div>
        );
      case 3:
        return (
          <div className="dice-dots-grid three-dots">
            <div className={`dice-dot ${dotColorClass}`} />
            <div className={`dice-dot ${dotColorClass}`} />
            <div className={`dice-dot ${dotColorClass}`} />
          </div>
        );
      case 4:
        return (
          <div className="dice-dots-grid four-dots">
            <div className={`dice-dot ${dotColorClass}`} />
            <div className={`dice-dot ${dotColorClass}`} />
            <div className={`dice-dot ${dotColorClass}`} />
            <div className={`dice-dot ${dotColorClass}`} />
          </div>
        );
      case 5:
        return (
          <div className="dice-dots-grid five-dots">
            <div className={`dice-dot ${dotColorClass}`} />
            <div className={`dice-dot ${dotColorClass}`} />
            <div className={`dice-dot ${dotColorClass}`} />
            <div className={`dice-dot ${dotColorClass}`} />
            <div className={`dice-dot ${dotColorClass}`} />
          </div>
        );
      case 6:
        return (
          <div className="dice-dots-grid six-dots">
            <div className={`dice-dot ${dotColorClass}`} />
            <div className={`dice-dot ${dotColorClass}`} />
            <div className={`dice-dot ${dotColorClass}`} />
            <div className={`dice-dot ${dotColorClass}`} />
            <div className={`dice-dot ${dotColorClass}`} />
            <div className={`dice-dot ${dotColorClass}`} />
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div 
      className={`premium-dice-container ${color}-theme-border ${isMyTurn ? 'pulse-glow' : ''} ${disabled ? 'disabled-dice' : ''}`}
      onClick={disabled || isRolling ? undefined : onClick}
    >
      <div className={`premium-dice-face ${isRolling ? 'dice-rolling-anim' : ''}`}>
        {isRolling ? (
          <div className="dice-dots-grid five-dots rolling-overlay">
            <div className="dice-dot dot-rolling" />
            <div className="dice-dot dot-rolling" />
            <div className="dice-dot dot-rolling" />
            <div className="dice-dot dot-rolling" />
            <div className="dice-dot dot-rolling" />
          </div>
        ) : state === 'idle' && isMyTurn ? (
          renderRollIcon()
        ) : (
          renderDots(value, color)
        )}
      </div>
    </div>
  );
};

export default Dice;
