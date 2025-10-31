import React, { useState } from 'react';
import { analyzeGenericImage } from '../services/geminiService';

export const ImageAnalyzer: React.FC = () => {
    const [image, setImage] = useState<string | null>(null);
    const [prompt, setPrompt] = useState('');
    const [result, setResult] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file && file.type.startsWith('image/')) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setImage(reader.result as string);
                setError('');
            };
            reader.readAsDataURL(file);
        } else {
            setImage(null);
            setError('Please select a valid image file.');
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!image || !prompt.trim()) {
            setError('Please upload an image and enter a prompt.');
            return;
        }
        navigator.vibrate?.(50);
        setIsLoading(true);
        setError('');
        setResult('');

        try {
            const analysis = await analyzeGenericImage(image, prompt);
            setResult(analysis);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An unknown error occurred.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="bg-gray-800 rounded-lg shadow-lg p-6">
            <h2 className="text-2xl font-bold mb-4 text-[var(--color-text-accent)]">Image Analyzer</h2>
            <p className="text-gray-400 mb-4">
                Upload any soccer-related image (e.g., a formation, player stats) and ask the AI a question about it.
            </p>
            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label htmlFor="image-upload" className="block text-sm font-medium text-gray-300 mb-1">Upload Image</label>
                    <input id="image-upload" type="file" accept="image/*" onChange={handleImageChange} className="block w-full text-sm text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-gray-600 file:text-white hover:file:bg-gray-700"/>
                </div>
                {image && (
                    <div>
                        <img src={image} alt="Preview" className="max-h-48 rounded-md mx-auto" />
                    </div>
                )}
                <div>
                    <label htmlFor="image-prompt" className="block text-sm font-medium text-gray-300 mb-1">Your Question</label>
                    <textarea
                        id="image-prompt"
                        value={prompt}
                        onChange={(e) => setPrompt(e.target.value)}
                        placeholder="e.g., 'What formation is this?' or 'What are this player's main strengths?'"
                        className="w-full h-20 p-2 bg-gray-700 border border-gray-600 rounded-md text-white"
                        disabled={isLoading}
                    />
                </div>
                <button type="submit" disabled={isLoading || !image} className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-500 text-white font-bold py-2 px-4 rounded-md">
                    {isLoading ? 'Analyzing...' : 'Analyze Image'}
                </button>
            </form>
            {error && <p className="text-red-400 mt-2 text-center">{error}</p>}
            {result && (
                <div className="mt-4 p-3 bg-gray-900/50 rounded-md border border-gray-700">
                    <h3 className="font-semibold text-white mb-2">Analysis Result:</h3>
                    <p className="text-gray-300 whitespace-pre-wrap">{result}</p>
                </div>
            )}
        </div>
    );
};
