import React from 'react';
import type { TacticImprovementSuggestion, DetailedTactic } from '../types';

interface TacticImprovementModalProps {
  suggestion: TacticImprovementSuggestion | null;
  originalTactic: DetailedTactic;
  onClose: () => void;
  onSaveNewVersion: (originalTactic: DetailedTactic, suggestion: TacticImprovementSuggestion) => void;
  avgPitchControl: number | null;
  isLoading: boolean;
  error: string;
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


export const TacticImprovementModal: React.FC<TacticImprovementModalProps> = ({ suggestion, originalTactic, onClose, onSaveNewVersion, avgPitchControl, isLoading, error }) => {
  const handleApplyAndSave = () => {
    if(!suggestion) return;
    onSaveNewVersion(originalTactic, suggestion);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50" onClick={() => { onClose(); navigator.vibrate?.(20); }}>
      <div className="bg-gray-800/90 rounded-lg shadow-xl p-6 w-full max-w-2xl text-white border border-gray-700 max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold text-[var(--color-text-accent)]">AI Tactic Analysis</h2>
          <button onClick={() => { onClose(); navigator.vibrate?.(20); }} className="text-gray-400 hover:text-white text-3xl">&times;</button>
        </div>
        
        {isLoading && (
            <div className="flex flex-col items-center justify-center min-h-[300px]">
                <svg className="animate-spin h-10 w-10 text-white mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <p className="text-lg text-gray-300">AI is analyzing your tactic...</p>
                <p className="text-sm text-gray-400">This might take a moment.</p>
            </div>
        )}

        {error && (
             <div className="flex flex-col items-center justify-center min-h-[300px] text-center">
                <p className="text-lg text-red-400">Analysis Failed</p>
                <p className="text-sm text-gray-400 mt-2">{error}</p>
             </div>
        )}
        
        {!isLoading && !error && suggestion && (
          <>
            <p className="text-gray-300 mb-4">Based on your match history for <strong className="text-white">{originalTactic.tacticName}</strong>, here are the AI's recommendations:</p>
            {avgPitchControl !== null && (
                <div className="bg-gray-900/50 p-4 rounded-lg mb-4 text-center border border-[var(--color-accent-500)]/30">
                    <h3 className="text-lg font-semibold text-gray-300 uppercase tracking-wider">Average Pitch Control</h3>
                    <p className="text-6xl font-bold text-[var(--color-text-accent)] my-2">{avgPitchControl}</p>
                    <p className="text-sm text-gray-400">This score represents your tactic's overall dominance. The AI's goal is to improve this number.</p>
                </div>
            )}
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
          </>
        )}

        <div className="mt-6 flex justify-end gap-x-3">
          {!isLoading && !error && suggestion && (
            <button onClick={handleApplyAndSave} className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-md">
              Apply & Save as New
            </button>
          )}
          <button onClick={() => { onClose(); navigator.vibrate?.(20); }} className="bg-gray-600 hover:bg-gray-700 text-white font-bold py-2 px-6 rounded-md">
            Close
          </button>
        </div>
      </div>
    </div>
  );
};