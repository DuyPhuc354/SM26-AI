import React, { useState, useEffect, useRef } from 'react';
import { getPlayerRoleSuggestion } from '../services/geminiService';
import type { PlayerRoleSuggestion } from '../types';
import { POSITION_TO_ROLES_MAP } from '../constants';

// Fix: Add type definition for the SpeechRecognition API to resolve "Cannot find name 'SpeechRecognition'" error.
interface SpeechRecognition {
    continuous: boolean;
    interimResults: boolean;
    lang: string;
    onresult: (event: any) => void;
    onerror: (event: any) => void;
    onend: () => void;
    start: () => void;
    stop: () => void;
}

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
    const [position, setPosition] = useState('ST');
    const [results, setResults] = useState<PlayerRoleSuggestion[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [isListening, setIsListening] = useState(false);
    const recognitionRef = useRef<SpeechRecognition | null>(null);

    useEffect(() => {
        // @ts-ignore - for cross-browser compatibility
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (SpeechRecognition) {
            recognitionRef.current = new SpeechRecognition();
            const recognition = recognitionRef.current;
            if (recognition) {
                recognition.continuous = false;
                recognition.interimResults = false;
                recognition.lang = 'en-US';

                recognition.onresult = (event) => {
                    const transcript = event.results[0][0].transcript;
                    setDescription(prev => (prev ? `${prev} ${transcript}` : transcript).trim());
                };

                recognition.onerror = (event) => {
                    console.error('Speech recognition error', event.error);
                    if (event.error === 'not-allowed' || event.error === 'service-not-allowed') {
                        setError("Microphone access denied. Please allow it in your browser settings.");
                    } else {
                        setError('Voice input failed. Please try again.');
                    }
                    setIsListening(false);
                };

                recognition.onend = () => {
                    setIsListening(false);
                };
            }
        }
    }, []);

    const toggleListening = () => {
        if (!recognitionRef.current) {
            setError("Voice input is not supported by your browser.");
            return;
        }
        navigator.vibrate?.(20);

        if (isListening) {
            recognitionRef.current.stop();
        } else {
            setError(null);
            recognitionRef.current.start();
        }
        setIsListening(!isListening);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (isListening && recognitionRef.current) {
            recognitionRef.current.stop();
            setIsListening(false);
        }
        if (!description.trim()) {
            setError('Please describe the player.');
            return;
        }
        navigator.vibrate?.(50);
        setIsLoading(true);
        setError(null);
        setResults([]);
        try {
            const suggestions = await getPlayerRoleSuggestion(description, position);
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
            <p className="text-gray-400 mb-4">Select a position, describe a player's skills, and get AI-powered role suggestions with compatibility scores.</p>
            <form onSubmit={handleSubmit}>
                <div className="mb-2">
                    <label htmlFor="playerPosition" className="block text-sm font-medium text-gray-300 mb-1">Player's Position</label>
                    <select
                        id="playerPosition"
                        value={position}
                        onChange={e => setPosition(e.target.value)}
                        className="w-full p-2 bg-gray-700 border border-gray-600 rounded-md text-white"
                        disabled={isLoading}
                    >
                        {Object.keys(POSITION_TO_ROLES_MAP).map(pos => (
                            <option key={pos} value={pos}>{pos}</option>
                        ))}
                    </select>
                </div>
                 <div className="relative">
                    <textarea
                        value={description}
                        onChange={e => setDescription(e.target.value)}
                        placeholder="e.g., 'A young striker, very fast with great finishing, but poor heading and passing...'"
                        className="w-full h-24 p-3 pr-12 bg-gray-700 border border-gray-600 rounded-md text-white placeholder-gray-500 resize-none"
                        disabled={isLoading}
                    />
                    {recognitionRef.current && (
                        <button
                            type="button"
                            onClick={toggleListening}
                            disabled={isLoading}
                            className={`absolute top-3 right-3 p-2 rounded-full transition-all duration-200 ${
                                isListening ? 'bg-red-600 hover:bg-red-700 scale-110' : 'bg-gray-600 hover:bg-gray-500'
                            } disabled:opacity-50 disabled:cursor-not-allowed`}
                            aria-label={isListening ? 'Stop listening' : 'Start voice input'}
                        >
                            {isListening && <span className="absolute -inset-1 bg-red-500 rounded-full animate-ping"></span>}
                             <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white relative" viewBox="0 0 20 20" fill="currentColor">
                                <path d="M7 3a3 3 0 016 0v6a3 3 0 11-6 0V3z" />
                                <path d="M4 10a1 1 0 00-1 1v1a5 5 0 0010 0v-1a1 1 0 00-1-1H4z" />
                            </svg>
                        </button>
                    )}
                </div>
                <button type="submit" disabled={isLoading} className="mt-2 w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-500 text-white font-bold py-2 px-4 rounded-md transition-colors">
                    {isLoading ? 'Analyzing...' : 'Find Best Roles'}
                </button>
            </form>

            {error && <p className="mt-3 text-red-400 text-center">{error}</p>}
            
            <div className="mt-4">
                {isLoading && <LoadingSkeleton />}
                {results.length > 0 && (
                    <div className="space-y-3">
                        <h3 className="font-semibold text-lg text-white">Top Roles for {position}:</h3>
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