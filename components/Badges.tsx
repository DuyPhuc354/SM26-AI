import React from 'react';
import type { Badge } from '../types';
import { Tooltip } from './Tooltip';

interface BadgesProps {
  allBadges: Badge[];
}

export const Badges: React.FC<BadgesProps> = ({ allBadges }) => {
  const achievedCount = allBadges.filter(b => b.achieved).length;

  return (
    <div className="bg-gray-800 rounded-lg shadow-lg p-6">
      <h2 className="text-xl font-bold mb-4 text-[var(--color-text-accent)]">Achievements ({achievedCount}/{allBadges.length})</h2>
      <div className="grid grid-cols-3 gap-4">
        {allBadges.map(badge => (
          <Tooltip key={badge.id} text={`${badge.name}: ${badge.description}`}>
            <div className={`flex flex-col items-center justify-center p-2 rounded-lg aspect-square transition-opacity ${badge.achieved ? 'bg-gray-700 opacity-100' : 'bg-gray-900/50 opacity-50'}`}>
              <span className="text-3xl">{badge.icon}</span>
              <p className="text-xs text-center text-gray-300 mt-1 truncate">{badge.name}</p>
            </div>
          </Tooltip>
        ))}
      </div>
    </div>
  );
};