import React, { useState } from 'react';
import { getOptimizedTactics } from '../services/geminiService';
import type { MatchData, DetailedTactic, TacticSuggestion, OptimizedTacticCandidate } from '../types';
import { Accordion, AccordionItem } from './Accordion';

const convertSuggestionToDetailedTactic = (suggestion: TacticSuggestion, name: string, predictedPci: number): DetailedTactic => {
  const formatInstructions = (obj: object): string => {
    return Object.entries(obj)
      .map(([key, value]) => {
        const formattedKey = key.replace(/([A-Z])/g, ' $1').replace(/^./, (str) => str.toUpperCase());
        const formattedValue = typeof value === 'boolean' ? (value ? 'Yes' : 'No') : value;
        return `${formattedKey}: ${formattedValue}`;
      })
      .join('; ');
  };

  return {
    tacticName: name,
    formation: suggestion.formation,
    keyRoles: suggestion.playerRoles.map(kr => `${kr.position}: ${kr.role}`).join('; '),
    generalInstructions: formatInstructions(suggestion.general),
    attackInstructions: formatInstructions(suggestion.attack),
    defenceInstructions: formatInstructions(suggestion.defence),
    bestForTips: `[AI Optimized - Predicted PCI: ${Math.round(predictedPci)}] ${suggestion.justification}`,
    isFavorite: false,
  };
};


interface TacticOptimizerProps {
  matchHistory: MatchData[];
  onSaveTactic: (tactic: DetailedTactic) => void;
}

const LoadingState: React.FC<{ progress: string }> = ({ progress }) => (
    <div className="flex flex-col items-center justify-center min-h-[300px]">
        <svg className="animate-spin h-10 w-10 text-white mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
        <p className="text-lg text-gray-300">Optimizing...</p>
        <p className="text-sm text-gray-400 mt-1">{progress}</p>
    </div>
);


export const TacticOptimizer: React.FC<TacticOptimizerProps> = ({ matchHistory, onSaveTactic }) => {
    const [isLoading, setIsLoading] = useState(false);
    const [progress, setProgress] = useState('');
    const [error, setError] = useState('');
    const [results, setResults] = useState<OptimizedTacticCandidate[]>([]);
    
    const minMatches = 20;

    const handleOptimize = async () => {
        navigator.vibrate?.(50);
        setIsLoading(true);
        setError('');
        setResults([]);
        
        let progressIndex = 0;
        const messages = [
            "Analyzing match history...",
            "Building surrogate model to predict performance...",
            "Initializing genetic algorithm...",
            "Evolving tactical population...",
            "Scoring candidates based on predicted PCI...",
            "Finalizing top candidates..."
        ];
        setProgress(messages[progressIndex]);

        const progressInterval = setInterval(() => {
            progressIndex = (progressIndex + 1) % messages.length;
            setProgress(messages[progressIndex]);
        }, 3000);

        try {
            const optimizedTactics = await getOptimizedTactics(matchHistory);
            setResults(optimizedTactics);
        } catch (err) {
            setError(err instanceof Error ? err.message : "An unknown error occurred during optimization.");
        } finally {
            clearInterval(progressInterval);
            setProgress('');
            setIsLoading(false);
        }
    };

    const handleSave = (candidate: OptimizedTacticCandidate) => {
        navigator.vibrate?.(30);
        const name = `Optimized ${candidate.tactic.formation} (${Math.round(candidate.predictedPciScore)} PCI)`;
        const detailedTactic = convertSuggestionToDetailedTactic(candidate.tactic, name, candidate.predictedPciScore);
        onSaveTactic(detailedTactic);
        alert(`Tactic "${detailedTactic.tacticName}" has been saved! You can view it in the Tactics Library.`);
    };

    return (
        <div className="bg-gray-800 rounded-lg shadow-lg p-6">
            <h2 className="text-2xl font-bold mb-4 text-[var(--color-text-accent)]">Advanced Tactic Optimizer</h2>
            <p className="text-gray-400 mb-4">
                This powerful tool uses an AI pipeline inspired by machine learning to analyze your entire match history and discover brand new, optimized tactics predicted to yield the highest Pitch Control Index (PCI). Requires at least {minMatches} logged matches.
            </p>

            <div className="text-center">
                <button
                    onClick={handleOptimize}
                    disabled={isLoading || matchHistory.length < minMatches}
                    className="bg-purple-600 hover:bg-purple-700 disabled:bg-gray-500 text-white font-bold py-3 px-6 rounded-md transition-colors text-lg"
                >
                    Start Optimization
                </button>
                {matchHistory.length < minMatches && (
                    <p className="text-sm text-yellow-400 mt-2">
                        You have {matchHistory.length}/{minMatches} matches. Please log more matches to unlock this feature.
                    </p>
                )}
            </div>
            
            {error && <p className="text-red-400 mt-4 text-center">{error}</p>}
            
            <div className="mt-6">
                {isLoading && <LoadingState progress={progress} />}
                {results.length > 0 && (
                    <div>
                        <h3 className="text-xl font-bold text-white mb-3">Top Optimized Candidates</h3>
                        <Accordion>
                            {results.map((candidate, index) => (
                                <AccordionItem key={index} title={`Candidate #${index + 1}: ${candidate.tactic.formation} (Predicted PCI: ${Math.round(candidate.predictedPciScore)})`}>
                                    <div className="bg-gray-900/50 p-4 space-y-3">
                                        <div><h4 className="font-semibold text-gray-300">Player Roles</h4><p className="text-sm text-gray-400">{candidate.tactic.playerRoles.map(r => `${r.position}: ${r.role}`).join('; ')}</p></div>
                                        <div><h4 className="font-semibold text-gray-300">General</h4><p className="text-sm text-gray-400">{Object.entries(candidate.tactic.general).map(([k, v]) => `${k.charAt(0).toUpperCase() + k.slice(1)}: ${v}`).join('; ')}</p></div>
                                        <div><h4 className="font-semibold text-gray-300">Attack</h4><p className="text-sm text-gray-400">{Object.entries(candidate.tactic.attack).map(([k, v]) => `${k.charAt(0).toUpperCase() + k.slice(1)}: ${v}`).join('; ')}</p></div>
                                        <div><h4 className="font-semibold text-gray-300">Defence</h4><p className="text-sm text-gray-400">{Object.entries(candidate.tactic.defence).map(([k, v]) => `${k.charAt(0).toUpperCase() + k.slice(1)}: ${v}`).join('; ')}</p></div>
                                        <div><h4 className="font-semibold text-gray-300">Justification</h4><p className="text-sm text-gray-400">{candidate.tactic.justification}</p></div>
                                        <div className="text-right">
                                            <button onClick={() => handleSave(candidate)} className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-1 px-3 text-sm rounded-md">
                                                Save This Tactic
                                            </button>
                                        </div>
                                    </div>
                                </AccordionItem>
                            ))}
                        </Accordion>
                    </div>
                )}
            </div>
        </div>
    );
};