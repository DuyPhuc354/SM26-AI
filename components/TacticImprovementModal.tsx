
import React from 'react';
import type { TacticImprovementSuggestion, DetailedTactic } from '../types';

interface TacticImprovementModalProps {
  suggestion: TacticImprovementSuggestion;
  originalTactic: DetailedTactic;
  onClose: () => void;
}

const ChangeItem: React.FC<{ title: string, change?: string }> = ({ title, change }) => {
    if (!change) return null;
    return (
        <div className="bg-gray-900/70 p-3 rounded-md">
            <h5 className="font-semibold text-gray-400 capitalize">{title}</h5>
            <p className="text-yellow-300">{change}</p>
        </div>
    );
};


export const TacticImprovementModal: React.FC<TacticImprovementModalProps> = ({ suggestion, originalTactic, onClose }) => {
  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50" onClick={() => { onClose(); navigator.vibrate?.(20); }}>
      <div className="bg-gray-800/90 rounded-lg shadow-xl p-6 w-full max-w-2xl text-white border border-gray-700 max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold text-[var(--color-text-accent)]">AI Tactic Analysis</h2>
          <button onClick={() => { onClose(); navigator.vibrate?.(20); }} className="text-gray-400 hover:text-white text-3xl">&times;</button>
        </div>
        
        <p className="text-gray-300 mb-4">Based on your match history for <strong className="text-white">{originalTactic.tacticName}</strong>, here are the AI's recommendations:</p>

        <div className="space-y-4">
            <div className="bg-gray-700 p-4 rounded-lg">
                <h3 className="font-bold text-lg text-white mb-2">
                    <span className="text-2xl mr-2">📊</span>Performance Analysis
                </h3>
                <p className="text-gray-300">{suggestion.analysis}</p>
            </div>

            <div className="bg-gray-700 p-4 rounded-lg">
                <h3 className="font-bold text-lg text-white mb-2">
                     <span className="text-2xl mr-2">🔧</span>Suggested Changes
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <ChangeItem title="General" change={suggestion.suggestedChanges.general} />
                    <ChangeItem title="Attack" change={suggestion.suggestedChanges.attack} />
                    <ChangeItem title="Defence" change={suggestion.suggestedChanges.defence} />
                    <ChangeItem title="Key Roles" change={suggestion.suggestedChanges.keyRoles} />
                </div>
            </div>

            <div className="bg-gray-700 p-4 rounded-lg">
                <h3 className="font-bold text-lg text-white mb-2">
                    <span className="text-2xl mr-2">🧠</span>Justification
                </h3>
                <p className="text-gray-300">{suggestion.justification}</p>
            </div>
        </div>

        <div className="mt-6 text-right">
          <button onClick={() => { onClose(); navigator.vibrate?.(20); }} className="bg-[var(--color-accent-600)] hover:bg-[var(--color-accent-700)] text-white font-bold py-2 px-6 rounded-md">
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
