
import React, { useState } from 'react';
import { getPlayerRoleSuggestion } from '../services/geminiService';
import type { PlayerRoleSuggestion } from '../types';

const LoadingSkeleton: React.FC = () => (
    <div className="animate-pulse space-y-3 mt-4">
        {[...Array(3)].map((_, i) => (
            <div key={i} className="bg-gray-700 p-3 rounded-lg">
                <div className="flex justify-between items-center">
                    <div className="h-5 bg-gray-600 rounded w-1/3"></div>
                    <div className="h-5 bg-gray-600 rounded w-1/4"></div>
                </div>
                <div className="mt-2 h-4 bg-gray-600 rounded w-full"></div>
                <div className="h-4 bg-gray-600 rounded w-5/6 mt-1"></div>
            </div>
        ))}
    </div>
);

const ScoreBar: React.FC<{ score: number }> = ({ score }) => {
    const getColor = (s: number) => {
        if (s > 85) return 'bg-green-500';
        if (s > 70) return 'bg-yellow-500';
        return 'bg-orange-500';
    };
    return (
        <div className="w-full bg-gray-600 rounded-full h-2.5">
            <div className={`${getColor(score)} h-2.5 rounded-full`} style={{ width: `${score}%` }}></div>
        </div>
    );
};

export const PlayerRoleFinder: React.FC = () => {
    const [description, setDescription] = useState('');
    const [results, setResults] = useState<PlayerRoleSuggestion[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!description.trim()) {
            setError('Please describe the player.');
            return;
        }
        navigator.vibrate?.(50);
        setIsLoading(true);
        setError(null);
        setResults([]);
        try {
            const suggestions = await getPlayerRoleSuggestion(description);
            setResults(suggestions);
        } catch (err) {
            setError('Failed to get suggestions. Please try again.');
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="bg-gray-800 rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-bold mb-4 text-[var(--color-text-accent)]">Player Role Finder</h2>
            <p className="text-gray-400 mb-4">Describe a player's skills and get AI-powered role suggestions with compatibility scores.</p>
            <form onSubmit={handleSubmit}>
                <textarea
                    value={description}
                    onChange={e => setDescription(e.target.value)}
                    placeholder="e.g., 'A young striker, very fast with great finishing, but poor heading and passing...'"
                    className="w-full h-24 p-3 bg-gray-700 border border-gray-600 rounded-md text-white placeholder-gray-500"
                    disabled={isLoading}
                />
                <button type="submit" disabled={isLoading} className="mt-2 w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-500 text-white font-bold py-2 px-4 rounded-md transition-colors">
                    {isLoading ? 'Analyzing...' : 'Find Best Roles'}
                </button>
            </form>

            {error && <p className="mt-3 text-red-400 text-center">{error}</p>}
            
            <div className="mt-4">
                {isLoading && <LoadingSkeleton />}
                {results.length > 0 && (
                    <div className="space-y-3">
                        <h3 className="font-semibold text-lg text-white">Top Roles:</h3>
                        {results.map(res => (
                            <div key={res.role} className="bg-gray-700/50 p-3 rounded-lg border border-gray-600">
                                <div className="flex justify-between items-center mb-2">
                                    <h4 className="font-bold text-md text-[var(--color-text-accent)]">{res.role}</h4>
                                    <p className="font-bold text-lg text-white">{res.score}<span className="text-sm text-gray-400">/100</span></p>
                                </div>
                                <ScoreBar score={res.score} />
                                <p className="text-sm text-gray-300 mt-2">{res.justification}</p>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};
