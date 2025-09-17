import React, { useState, useEffect, useRef } from 'react';
import type { DetailedTactic } from '../types';

interface TacticImporterProps {
  onClose: () => void;
  onImport: (tactic: DetailedTactic) => void;
}

const exampleFormat = `{
  "tacticName": "My Custom Tactic",
  "formation": "4-4-2",
  "keyRoles": "GK: Goalkeeper; ...",
  "generalInstructions": "Width: Normal; ...",
  "attackInstructions": "Passing: Mixed; ...",
  "defenceInstructions": "Pressing: Own Half; ...",
  "bestForTips": "Good for a balanced approach."
}`;

export const TacticImporter: React.FC<TacticImporterProps> = ({ onClose, onImport }) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [onClose]);

  const validateAndImport = (fileContent: string) => {
    try {
      const parsed = JSON.parse(fileContent);
      
      // Basic validation
      if (
        !parsed.tacticName || typeof parsed.tacticName !== 'string' ||
        !parsed.formation || typeof parsed.formation !== 'string' ||
        !parsed.keyRoles || typeof parsed.keyRoles !== 'string' ||
        !parsed.generalInstructions || typeof parsed.generalInstructions !== 'string' ||
        !parsed.attackInstructions || typeof parsed.attackInstructions !== 'string' ||
        !parsed.defenceInstructions || typeof parsed.defenceInstructions !== 'string' ||
        !parsed.bestForTips || typeof parsed.bestForTips !== 'string'
      ) {
        throw new Error('Invalid or incomplete tactic format.');
      }
      
      const tacticToImport: DetailedTactic = {
        ...parsed,
        isFavorite: false,
      };

      onImport(tacticToImport);

    } catch (e) {
      if (e instanceof Error) {
        setError(`Failed to import: ${e.message}`);
      } else {
        setError('An unknown error occurred during import.');
      }
      console.error(e);
      setSelectedFile(null); // Clear file on error
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

  const handleImport = () => {
    setError('');
    if (!selectedFile) {
      setError('Please select a file to import.');
      return;
    }
    navigator.vibrate?.(20);

    const reader = new FileReader();
    reader.onload = (event) => {
      const fileContent = event.target?.result as string;
      if (fileContent) {
        validateAndImport(fileContent);
      } else {
        setError('Could not read the file.');
      }
    };
    reader.onerror = () => {
        setError('Error reading the file.');
    };
    reader.readAsText(selectedFile);
  };
  
  const commonDragEvents = {
      onDragEnter: (e: React.DragEvent) => {
          e.preventDefault();
          e.stopPropagation();
          setIsDragging(true);
      },
      onDragLeave: (e: React.DragEvent) => {
          e.preventDefault();
          e.stopPropagation();
          setIsDragging(false);
      },
      onDragOver: (e: React.DragEvent) => {
          e.preventDefault();
          e.stopPropagation();
      },
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
      role="dialog"
      aria-modal="true"
      aria-labelledby="importer-title"
      {...commonDragEvents}
    >
      <div 
        className="bg-gray-800/80 rounded-lg shadow-xl p-6 w-full max-w-lg text-white border border-gray-700"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-4">
          <h2 id="importer-title" className="text-2xl font-bold text-[var(--color-text-accent)]">Import Tactic</h2>
          <button onClick={() => { onClose(); navigator.vibrate?.(20); }} className="text-gray-400 hover:text-white">&times;</button>
        </div>
        
        <p className="text-gray-400 mb-2">Upload a tactic file (.json) or drag and drop it below.</p>
        
        <div
            onClick={() => fileInputRef.current?.click()}
            className={`w-full h-48 p-3 bg-gray-900 border-2 border-dashed border-gray-600 rounded-md text-white placeholder-gray-500 focus:ring-2 focus:ring-[var(--color-accent-500)] flex flex-col items-center justify-center cursor-pointer transition-colors ${isDragging ? 'border-[var(--color-accent-500)] bg-gray-700/50' : ''}`}
            aria-label="Tactic file upload zone"
        >
            <input
                ref={fileInputRef}
                type="file"
                accept=".json,application/json"
                onChange={(e) => handleFileChange(e.target.files)}
                className="hidden"
            />
            {selectedFile ? (
                <div className="text-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto text-green-400" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <p className="mt-2 font-semibold">{selectedFile.name}</p>
                    <p className="text-xs text-gray-400">Ready to import!</p>
                </div>
            ) : (
                 <div className="text-center text-gray-400">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                    </svg>
                    <p className="mt-2">Drag & drop your file here</p>
                    <p className="text-xs">or click to browse</p>
                </div>
            )}
        </div>

        {error && <p className="mt-2 text-red-400 text-sm">{error}</p>}

        <div className="mt-4 flex justify-end gap-x-3">
          <button onClick={() => { onClose(); navigator.vibrate?.(20); }} className="bg-gray-600 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded-md">
            Cancel
          </button>
          <button onClick={handleImport} disabled={!selectedFile} className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-500 disabled:cursor-not-allowed text-white font-bold py-2 px-4 rounded-md">
            Import Tactic
          </button>
        </div>

        <details className="mt-4 text-sm">
            <summary className="cursor-pointer text-gray-500">View required format</summary>
            <pre className="bg-gray-900 p-2 mt-2 rounded-md text-gray-400 text-xs overflow-auto">
                <code>{exampleFormat}</code>
            </pre>
        </details>
      </div>
    </div>
  );
};