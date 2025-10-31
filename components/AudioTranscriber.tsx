import React, { useState, useRef } from 'react';
import { transcribeAudio } from '../services/geminiService';

const blobToBase64 = (blob: Blob): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64data = reader.result as string;
      resolve(base64data.split(',')[1]); 
    };
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
};

export const AudioTranscriber: React.FC = () => {
    const [isRecording, setIsRecording] = useState(false);
    const [transcript, setTranscript] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const audioChunksRef = useRef<Blob[]>([]);

    const startRecording = async () => {
        setError('');
        setTranscript('');
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            mediaRecorderRef.current = new MediaRecorder(stream);
            mediaRecorderRef.current.ondataavailable = (event) => {
                audioChunksRef.current.push(event.data);
            };
            mediaRecorderRef.current.onstop = handleStopRecording;
            audioChunksRef.current = [];
            mediaRecorderRef.current.start();
            setIsRecording(true);
            navigator.vibrate?.(20);
        } catch (err) {
            console.error("Error accessing microphone:", err);
            setError("Could not access microphone. Please check permissions.");
        }
    };
    
    const stopRecording = () => {
        if (mediaRecorderRef.current && isRecording) {
            mediaRecorderRef.current.stop();
            setIsRecording(false);
            navigator.vibrate?.(20);
        }
    };

    const handleStopRecording = async () => {
        setIsLoading(true);
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        
        try {
            const base64Audio = await blobToBase64(audioBlob);
            const result = await transcribeAudio({
                mimeType: 'audio/webm',
                data: base64Audio,
            });
            setTranscript(result);
        } catch (err) {
            setError(err instanceof Error ? err.message : "Transcription failed.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="bg-gray-800 rounded-lg shadow-lg p-6">
            <h2 className="text-2xl font-bold mb-4 text-[var(--color-text-accent)]">Audio Transcriber</h2>
            <p className="text-gray-400 mb-4">
                Record a short audio clip using your microphone and let the AI transcribe it into text.
            </p>
            <div className="flex justify-center space-x-4 mb-4">
                <button
                    onClick={startRecording}
                    disabled={isRecording || isLoading}
                    className="bg-green-600 hover:bg-green-700 disabled:bg-gray-500 text-white font-bold py-2 px-6 rounded-md"
                    aria-label="Start recording"
                >
                    Start
                </button>
                <button
                    onClick={stopRecording}
                    disabled={!isRecording || isLoading}
                    className="bg-red-600 hover:bg-red-700 disabled:bg-gray-500 text-white font-bold py-2 px-6 rounded-md"
                    aria-label="Stop recording"
                >
                    Stop
                </button>
            </div>
             {isRecording && (
                <div className="flex items-center justify-center text-red-400 mb-2">
                    <div className="w-3 h-3 bg-red-500 rounded-full mr-2 animate-pulse"></div>
                    Recording...
                </div>
            )}
            <textarea
                readOnly
                value={isLoading ? 'Transcribing...' : transcript}
                placeholder="Your transcribed text will appear here..."
                className="w-full h-32 p-3 bg-gray-900 border border-gray-600 rounded-md text-gray-300"
                aria-label="Transcription output"
            />
            {error && <p className="text-red-400 mt-2 text-center">{error}</p>}
        </div>
    );
};
