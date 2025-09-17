
import React, { useState } from 'react';
import { getMatchPrediction } from '../services/geminiService';
import type { MatchPrediction } from '../types';

const LoadingSkeleton: React.FC = () => (
    <div className="animate-pulse space-y-4">
        <div className="h-8 bg-gray-700 rounded w-1/2"></div>
        <div className="h-12 bg-gray-700 rounded"></div>
        <div className="space-y-2">
            <div className="h-4 bg-gray-700 rounded"></div>
            <div className="h-4 bg-gray-700 rounded w-5/6"></div>
        </div>
    </div>
);

export const MatchPredictor: React.FC = () => {
    const [teamA, setTeamA] = useState('');
    const [teamB, setTeamB] = useState('');
    const [prediction, setPrediction] = useState<MatchPrediction | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!teamA.trim() || !teamB.trim()) {
            setError('Please describe both teams.');
            return;
        }
        navigator.vibrate?.(50);
        setIsLoading(true);
        setError(null);
        setPrediction(null);
        try {
            const result = await getMatchPrediction(teamA, teamB);
            setPrediction(result);
        } catch (err) {
            setError('Failed to get match prediction. Please try again.');
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="bg-gray-800 rounded-lg shadow-lg p-6">
            <h2 className="text-2xl font-bold mb-4 text-[var(--color-text-accent)]">AI Match Predictor</h2>
            <p className="text-gray-400 mb-4">Describe your team and your opponent to get an AI-powered match prediction.</p>
            <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <textarea value={teamA} onChange={e => setTeamA(e.target.value)} placeholder="Describe your team (e.g., 'Playing a 4-3-3 counter-attack with fast wingers...')" className="w-full h-24 p-3 bg-gray-700 border border-gray-600 rounded-md text-white placeholder-gray-500" />
                    <textarea value={teamB} onChange={e => setTeamB(e.target.value)} placeholder="Describe the opponent (e.g., 'They use a 5-3-2 defensive setup and are strong physically...')" className="w-full h-24 p-3 bg-gray-700 border border-gray-600 rounded-md text-white placeholder-gray-500" />
                </div>
                <button type="submit" disabled={isLoading} className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-500 text-white font-bold py-3 px-4 rounded-md transition-colors">
                    {isLoading ? 'Predicting...' : 'Predict Outcome'}
                </button>
            </form>

            {error && <p className="mt-4 text-red-400 text-center">{error}</p>}
            
            <div className="mt-6">
                {isLoading && <LoadingSkeleton />}
                {prediction && (
                    <div className="bg-gray-900/50 p-4 rounded-lg border border-gray-700">
                        <h3 className="text-xl font-bold text-center text-white mb-2">Prediction Result</h3>
                        <p className="text-4xl font-bold text-center text-[var(--color-text-accent)] mb-4">{prediction.predictedScore}</p>
                        
                        <div className="w-full bg-gray-700 rounded-full h-6 flex overflow-hidden mb-4">
                            <div className="bg-green-500 h-6 text-xs font-medium text-blue-100 text-center p-1 leading-none rounded-l-full" style={{ width: `${prediction.winProbability.teamA}%` }}>{prediction.winProbability.teamA}%</div>
                            <div className="bg-gray-500 h-6 text-xs font-medium text-blue-100 text-center p-1 leading-none" style={{ width: `${prediction.winProbability.draw}%` }}>{prediction.winProbability.draw}%</div>
                            <div className="bg-red-500 h-6 text-xs font-medium text-blue-100 text-center p-1 leading-none rounded-r-full" style={{ width: `${prediction.winProbability.teamB}%` }}>{prediction.winProbability.teamB}%</div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="bg-gray-700 p-3 rounded-lg">
                                <h4 className="font-semibold text-gray-200 mb-2">Key Events</h4>
                                <ul className="list-disc list-inside space-y-1 text-gray-300">
                                    {prediction.keyEvents.map((event, i) => <li key={i}>{event}</li>)}
                                </ul>
                            </div>
                            <div className="bg-gray-700 p-3 rounded-lg">
                                <h4 className="font-semibold text-gray-200 mb-2">Justification</h4>
                                <p className="text-gray-300 text-sm">{prediction.justification}</p>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};
