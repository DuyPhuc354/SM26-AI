
import React, { useState, useEffect, useRef } from 'react';
import type { MatchData } from '../types';

interface MatchHistoryImporterProps {
  onClose: () => void;
  onImport: (matches: MatchData[]) => void;
}

export const MatchHistoryImporter: React.FC<MatchHistoryImporterProps> = ({ onClose, onImport }) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  const validateAndImport = (fileContent: string) => {
    try {
      const parsed = JSON.parse(fileContent);
      if (!Array.isArray(parsed)) {
        throw new Error('Invalid format. The file must contain a JSON array of match data.');
      }

      // Basic validation of the first item to ensure it's likely correct
      if (parsed.length > 0) {
          const firstMatch = parsed[0];
          if (typeof firstMatch.opponent !== 'string' || typeof firstMatch.score !== 'string') {
              throw new Error('Match data objects are missing required fields like "opponent" or "score".');
          }
      }
      
      onImport(parsed as MatchData[]);
    } catch (e) {
      setError(`Failed to import: ${e instanceof Error ? e.message : 'Unknown error'}`);
      setSelectedFile(null);
    }
  };
  
  const handleFileChange = (files: FileList | null) => {
    setError('');
    if (files && files.length > 0) {
      const file = files[0];
      if (file.type !== 'application/json') {
          setError('Invalid file type. Please upload a .json file.');
          return;
      }
      setSelectedFile(file);
    }
  };

  const handleImportClick = () => {
    if (!selectedFile) {
      setError('Please select a file to import.');
      return;
    }
    navigator.vibrate?.(20);
    const reader = new FileReader();
    reader.onload = (event) => {
      validateAndImport(event.target?.result as string);
    };
    reader.onerror = () => setError('Error reading the file.');
    reader.readAsText(selectedFile);
  };
  
  const dragHandlers = {
      onDragEnter: (e: React.DragEvent) => { e.preventDefault(); e.stopPropagation(); setIsDragging(true); },
      onDragLeave: (e: React.DragEvent) => { e.preventDefault(); e.stopPropagation(); setIsDragging(false); },
      onDragOver: (e: React.DragEvent) => { e.preventDefault(); e.stopPropagation(); },
      onDrop: (e: React.DragEvent) => {
          e.preventDefault();
          e.stopPropagation();
          setIsDragging(false);
          handleFileChange(e.dataTransfer.files);
      },
  };

  return (
    <div 
      className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50"
      onClick={() => { onClose(); navigator.vibrate?.(20); }}
      {...dragHandlers}
    >
      <div 
        className="bg-gray-800/80 rounded-lg shadow-xl p-6 w-full max-w-lg text-white border border-gray-700"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-2xl font-bold text-[var(--color-text-accent)] mb-4">Import Match History</h2>
        <p className="text-gray-400 mb-4">Upload a .json file containing your match history array.</p>
        
        <div
            onClick={() => fileInputRef.current?.click()}
            className={`w-full h-48 p-3 bg-gray-900 border-2 border-dashed border-gray-600 rounded-md flex flex-col items-center justify-center cursor-pointer transition-colors ${isDragging ? 'border-[var(--color-accent-500)] bg-gray-700/50' : ''}`}
        >
            <input ref={fileInputRef} type="file" accept=".json,application/json" onChange={(e) => handleFileChange(e.target.files)} className="hidden"/>
            {selectedFile ? (
                <div className="text-center">
                    <p className="mt-2 font-semibold">{selectedFile.name}</p>
                    <p className="text-xs text-gray-400">Ready to import!</p>
                </div>
            ) : (
                 <div className="text-center text-gray-400">
                    <p>Drag & drop your file here or click to browse</p>
                </div>
            )}
        </div>

        {error && <p className="mt-2 text-red-400 text-sm">{error}</p>}

        <div className="mt-4 flex justify-end gap-x-3">
          <button onClick={() => { onClose(); navigator.vibrate?.(20); }} className="bg-gray-600 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded-md">Cancel</button>
          <button onClick={handleImportClick} disabled={!selectedFile} className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-500 text-white font-bold py-2 px-4 rounded-md">Import History</button>
        </div>
      </div>
    </div>
  );
};
