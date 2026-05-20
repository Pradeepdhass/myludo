// Ludo Board Component
import React from 'react';
import { COLORS, getTokenCoordinates, START_CELLS, SAFE_CELLS } from '../hooks/useLudo';

export const GameBoard = ({ positions, playableTokens, onTokenClick, turn }) => {
  
  // 1. Group tokens by coordinates to handle stacks/collisions
  const getOccupancyMap = () => {
    const map = {};
    COLORS.forEach(color => {
      positions[color].forEach((pos, tokenIdx) => {
        // Skip yard tokens since they are drawn in their own slots
        if (pos === -1) return;

        const coord = getTokenCoordinates(color, tokenIdx, pos);
        const key = `${coord.x},${coord.y}`;
        if (!map[key]) {
          map[key] = [];
        }
        map[key].push({ color, tokenIdx, pos });
      });
    });
    return map;
  };

  const occupancyMap = getOccupancyMap();

  // Helper to render yard bases
  const renderYard = (color) => {
    return (
      <div key={`yard-${color}`} className={`home-yard ${color}`}>
        <div className="yard-inner">
          {[0, 1, 2, 3].map(tokenIdx => {
            const pos = positions[color][tokenIdx];
            const isPlayable = playableTokens.includes(tokenIdx) && turn === color;
            
            return (
              <div key={tokenIdx} className="yard-slot">
                {pos === -1 && (
                  <div 
                    className={`ludo-token ${color} ${isPlayable ? 'playable' : ''}`}
                    onClick={isPlayable ? () => onTokenClick(color, tokenIdx) : undefined}
                    style={{ 
                      color: `var(--color-${color})`,
                      width: '80%',
                      height: '80%'
                    }}
                    title={`${color.toUpperCase()} Token ${tokenIdx + 1}`}
                  />
                )}
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  // Render the center home area split in 4 triangles
  const renderCenterHome = () => {
    return (
      <div key="center-home" className="central-home">
        <svg viewBox="0 0 100 100">
          {/* Yellow Triangle (Left) */}
          <polygon points="0,0 50,50 0,100" fill="var(--color-yellow)" />
          {/* Green Triangle (Top) */}
          <polygon points="0,0 50,50 100,0" fill="var(--color-green)" />
          {/* Red Triangle (Right) */}
          <polygon points="100,0 50,50 100,100" fill="var(--color-red)" />
          {/* Blue Triangle (Bottom) */}
          <polygon points="0,100 50,50 100,100" fill="var(--color-blue)" />
          
          {/* Central dividers */}
          <polygon points="0,0 100,0 100,100 0,100" fill="none" stroke="#ffffff" strokeWidth="2" />
          <line x1="0" y1="0" x2="100" y2="100" stroke="#ffffff" strokeWidth="2" />
          <line x1="100" y1="0" x2="0" y2="100" stroke="#ffffff" strokeWidth="2" />
          
          {/* Center crown logo or text */}
          <circle cx="50" cy="50" r="14" fill="#ffffff" stroke="#1e293b" strokeWidth="2" />
          <text x="50" y="54" fontSize="12" fontWeight="bold" textAnchor="middle" fill="#1e293b">👑</text>
        </svg>
      </div>
    );
  };

  // Build the cell coordinates layout to render dynamically in order
  const cells = [];
  
  // We process cells row-by-row (y = 0 to 14) and col-by-col (x = 0 to 14)
  for (let y = 0; y < 15; y++) {
    for (let x = 0; x < 15; x++) {
      // 1. Top-Left Yard area (Rows 0-5, Cols 0-5)
      if (x === 0 && y === 0) {
        cells.push(renderYard('yellow'));
        x = 5; // Skip columns in this area
        continue;
      }
      // 2. Top-Right Yard area (Rows 0-5, Cols 9-14)
      if (x === 9 && y === 0) {
        cells.push(renderYard('green'));
        x = 14;
        continue;
      }
      // 3. Bottom-Left Yard area (Rows 9-14, Cols 0-5)
      if (x === 0 && y === 9) {
        cells.push(renderYard('blue'));
        x = 5;
        continue;
      }
      // 4. Bottom-Right Yard area (Rows 9-14, Cols 9-14)
      if (x === 9 && y === 9) {
        cells.push(renderYard('red'));
        x = 14;
        continue;
      }
      // 5. Central Home area (Rows 6-8, Cols 6-8)
      if (x === 6 && y === 6) {
        cells.push(renderCenterHome());
        x = 8;
        continue;
      }
      
      // Skip cells inside yard areas
      if (y < 6 && x < 6) continue;
      if (y < 6 && x > 8) continue;
      if (y > 8 && x < 6) continue;
      if (y > 8 && x > 8) continue;
      if (y >= 6 && y <= 8 && x >= 6 && x <= 8) continue;

      // 6. Track cells rendering
      let cellClass = 'board-cell';
      let isSafe = false;
      let isStar = false;

      // Start zones
      if (x === 1 && y === 6) cellClass += ' start-yellow';
      else if (x === 8 && y === 1) cellClass += ' start-green';
      else if (x === 13 && y === 8) cellClass += ' start-red';
      else if (x === 6 && y === 13) cellClass += ' start-blue';

      // Home run lanes
      else if (y === 7 && x >= 1 && x <= 5) cellClass += ' homerun-yellow';
      else if (x === 7 && y >= 1 && y <= 5) cellClass += ' homerun-green';
      else if (y === 7 && x >= 9 && x <= 13) cellClass += ' homerun-red';
      else if (x === 7 && y >= 9 && y <= 13) cellClass += ' homerun-blue';

      // Safe star cells
      const isStarCoord = (x === 2 && y === 8) || (x === 6 && y === 2) || (x === 12 && y === 6) || (x === 8 && y === 12);
      if (isStarCoord) {
        cellClass += ' safe-zone star-cell';
        isSafe = true;
        isStar = true;
      }

      // Check if standard starting zones (which are also safe cells)
      const absIdx = (y === 6 && x === 1) || (y === 1 && x === 8) || (y === 8 && x === 13) || (y === 13 && x === 6);
      if (absIdx) {
        isSafe = true;
      }

      // Light background coloring for path visual
      if (!isSafe && cellClass === 'board-cell') {
        if (y === 6 && x >= 0 && x <= 5) cellClass += ' path-yellow';
        else if (x === 6 && y >= 0 && y <= 5) cellClass += ' path-yellow'; // yellow route continues up
        
        else if (x === 8 && y >= 0 && y <= 5) cellClass += ' path-green';
        else if (y === 6 && x >= 9 && x <= 14) cellClass += ' path-green'; // green route continues right
        
        else if (y === 8 && x >= 9 && x <= 14) cellClass += ' path-red';
        else if (x === 8 && y >= 9 && y <= 14) cellClass += ' path-red'; // red route continues down
        
        else if (x === 6 && y >= 9 && y <= 14) cellClass += ' path-blue';
        else if (y === 8 && x >= 0 && x <= 5) cellClass += ' path-blue'; // blue route continues left
      }

      // 7. Find overlapping tokens on this cell
      const key = `${x},${y}`;
      const cellOccupants = occupancyMap[key] || [];

      cells.push(
        <div key={`cell-${x}-${y}`} className={cellClass} data-x={x} data-y={y}>
          {cellOccupants.map((occ, idx) => {
            const isPlayable = playableTokens.includes(occ.tokenIdx) && turn === occ.color;
            const stackClass = cellOccupants.length > 1 ? `stack-${idx}` : '';

            return (
              <div
                key={`${occ.color}-${occ.tokenIdx}`}
                className={`ludo-token ${occ.color} ${isPlayable ? 'playable' : ''} ${stackClass}`}
                onClick={isPlayable ? () => onTokenClick(occ.color, occ.tokenIdx) : undefined}
                style={{ color: `var(--color-${occ.color})` }}
                title={`${occ.color.toUpperCase()} Token ${occ.tokenIdx + 1}`}
              />
            );
          })}
        </div>
      );
    }
  }

  return (
    <div className="board-container">
      <div className="ludo-board">
        {cells}
      </div>
    </div>
  );
};
export default GameBoard;
