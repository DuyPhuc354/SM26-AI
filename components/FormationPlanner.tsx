
import React, { useState, useRef, useEffect } from 'react';
import type { Player } from '../types';
import { SoccerPitch } from './SoccerPitch';

const initialPlayersState: Player[] = [
  // On Pitch (4-4-2)
  { id: 1, label: 'GK', position: { x: 50, y: 92 }, onPitch: true },
  { id: 2, label: 'DR', position: { x: 85, y: 75 }, onPitch: true },
  { id: 3, label: 'DC', position: { x: 65, y: 80 }, onPitch: true },
  { id: 4, label: 'DC', position: { x: 35, y: 80 }, onPitch: true },
  { id: 5, label: 'DL', position: { x: 15, y: 75 }, onPitch: true },
  { id: 6, label: 'MR', position: { x: 80, y: 50 }, onPitch: true },
  { id: 7, label: 'MC', position: { x: 60, y: 55 }, onPitch: true },
  { id: 8, label: 'MC', position: { x: 40, y: 55 }, onPitch: true },
  { id: 9, label: 'ML', position: { x: 20, y: 50 }, onPitch: true },
  { id: 10, label: 'ST', position: { x: 60, y: 25 }, onPitch: true },
  { id: 11, label: 'ST', position: { x: 40, y: 25 }, onPitch: true },
  // On Bench
  { id: 12, label: 'SUB', position: { x: 0, y: 0 }, onPitch: false },
  { id: 13, label: 'SUB', position: { x: 0, y: 0 }, onPitch: false },
  { id: 14, label: 'SUB', position: { x: 0, y: 0 }, onPitch: false },
  { id: 15, label: 'SUB', position: { x: 0, y: 0 }, onPitch: false },
  { id: 16, label: 'SUB', position: { x: 0, y: 0 }, onPitch: false },
  { id: 17, label: 'SUB', position: { x: 0, y: 0 }, onPitch: false },
  { id: 18, label: 'SUB', position: { x: 0, y: 0 }, onPitch: false },
];

export const FormationPlanner: React.FC = () => {
  const [players, setPlayers] = useState<Player[]>(() => JSON.parse(JSON.stringify(initialPlayersState)));
  const [draggingPlayerId, setDraggingPlayerId] = useState<number | null>(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const pitchContainerRef = useRef<HTMLDivElement>(null);
  const benchRef = useRef<HTMLDivElement>(null);

  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>, playerId: number) => {
    e.preventDefault();
    setDraggingPlayerId(playerId);
    navigator.vibrate?.(20);
    
    const playerElement = e.currentTarget;
    const rect = playerElement.getBoundingClientRect();
    setDragOffset({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    });

    const currentPlayers = players.map(p => p.id === playerId ? { ...p, onPitch: true } : p);
    setPlayers(currentPlayers);
  };
  
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (draggingPlayerId === null || !pitchContainerRef.current) return;
    
    const pitchRect = pitchContainerRef.current.getBoundingClientRect();
    
    let x = ((e.clientX - pitchRect.left - dragOffset.x) / pitchRect.width) * 100;
    let y = ((e.clientY - pitchRect.top - dragOffset.y) / pitchRect.height) * 100;

    // Constrain player to the pitch boundaries
    const playerWidthPercent = (40 / pitchRect.width) * 100;
    const playerHeightPercent = (40 / pitchRect.height) * 100;
    x = Math.max(0, Math.min(x, 100 - playerWidthPercent));
    y = Math.max(0, Math.min(y, 100 - playerHeightPercent));

    setPlayers(prevPlayers =>
      prevPlayers.map(p =>
        p.id === draggingPlayerId ? { ...p, position: { x, y } } : p
      )
    );
  };

  const handleMouseUp = (e: React.MouseEvent<HTMLDivElement>) => {
    if (draggingPlayerId === null) return;

    if(benchRef.current) {
      const benchRect = benchRef.current.getBoundingClientRect();
      const isOverBench = e.clientX >= benchRect.left && e.clientX <= benchRect.right &&
                          e.clientY >= benchRect.top && e.clientY <= benchRect.bottom;
      
      if (isOverBench) {
          setPlayers(prevPlayers =>
              prevPlayers.map(p =>
                  p.id === draggingPlayerId ? { ...p, onPitch: false } : p
              )
          );
      }
    }


    setDraggingPlayerId(null);
    navigator.vibrate?.(20);
  };
  
  const handleReset = () => {
      setPlayers(JSON.parse(JSON.stringify(initialPlayersState)));
      navigator.vibrate?.(100);
  }

  const playersOnPitch = players.filter(p => p.onPitch);
  const playersOnBench = players.filter(p => !p.onPitch);

  return (
    <div className="bg-gray-800 rounded-lg shadow-lg p-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold text-[var(--color-text-accent)]">Formation Planner</h2>
        <button onClick={handleReset} className="bg-red-600 hover:bg-red-700 text-white font-bold py-1 px-3 text-sm rounded-md transition-colors">
            Reset Formation
        </button>
      </div>
      <p className="text-gray-400 mb-4">
        Drag players between the pitch and the bench to create your formation.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6" onMouseMove={handleMouseMove} onMouseUp={handleMouseUp} onMouseLeave={handleMouseUp}>
        <div ref={pitchContainerRef} className="md:col-span-3 relative w-full" style={{ aspectRatio: '68 / 105' }}>
          <SoccerPitch />
          {playersOnPitch.map(player => (
            <div
              key={player.id}
              onMouseDown={(e) => handleMouseDown(e, player.id)}
              className={`absolute w-10 h-10 rounded-full flex items-center justify-center font-bold text-white cursor-pointer select-none transition-shadow ${player.id === draggingPlayerId ? 'shadow-lg scale-110 z-20 cursor-grabbing' : 'hover:scale-105 z-10'}`}
              style={{
                left: `${player.position.x}%`,
                top: `${player.position.y}%`,
                backgroundColor: player.label === 'GK' ? '#f59e0b' : 'var(--color-accent-600)',
                border: '2px solid rgba(255, 255, 255, 0.7)',
              }}
            >
              {player.label}
            </div>
          ))}
        </div>
        
        <div ref={benchRef} className="md:col-span-1 bg-gray-900/50 p-3 rounded-lg border border-gray-700">
            <h3 className="font-semibold text-center text-gray-300 mb-3">Bench ({playersOnBench.length})</h3>
            <div className="flex flex-wrap gap-2 justify-center">
                {playersOnBench.map(player => (
                    <div
                        key={player.id}
                        onMouseDown={(e) => handleMouseDown(e, player.id)}
                        className="w-12 h-12 bg-gray-600 rounded-full flex items-center justify-center font-bold text-white cursor-pointer select-none hover:bg-gray-500 transition-colors"
                        style={{ border: '2px solid rgba(255, 255, 255, 0.2)' }}
                    >
                        {player.label}
                    </div>
                ))}
                {playersOnBench.length === 0 && <p className="text-gray-500 text-sm">Bench is empty</p>}
            </div>
        </div>
      </div>
       {draggingPlayerId !== null && <div className="fixed inset-0 z-0 cursor-grabbing" />}
    </div>
  );
};
