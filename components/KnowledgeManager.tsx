
import React, { useRef } from 'react';

interface KnowledgeManagerProps {
  knowledge: string;
  isGenerating: boolean;
  onGenerate: () => void;
  onImport: (file: File) => void;
  onExport: () => void;
}

export const KnowledgeManager: React.FC<KnowledgeManagerProps> = ({ knowledge, isGenerating, onGenerate, onImport, onExport }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onImport(file);
    }
  };

  return (
    <div className="bg-gray-800 rounded-lg shadow-lg p-6">
      <h2 className="text-2xl font-bold mb-4 text-[var(--color-text-accent)]">AI Knowledge Base</h2>
      <p className="text-gray-400 mb-4">
        Synthesize the AI's tactical learnings from your match history into a persistent knowledge base. You can export this knowledge to save it and import it back later to restore the AI's memory.
      </p>

      <div className="flex flex-wrap gap-2 mb-4">
        <button
          onClick={onGenerate}
          disabled={isGenerating}
          className="flex-1 bg-[var(--color-accent-600)] hover:bg-[var(--color-accent-700)] disabled:bg-gray-500 text-white font-bold py-2 px-4 rounded-md transition-colors flex items-center justify-center min-w-[180px]"
        >
          {isGenerating ? (
            <>
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Generating...
            </>
          ) : 'Generate / Update Knowledge'}
        </button>
        <button
          onClick={onExport}
          disabled={!knowledge}
          className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-500 text-white font-bold py-2 px-4 rounded-md transition-colors"
        >
          Export Knowledge
        </button>
        <button
          onClick={handleImportClick}
          className="bg-gray-600 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded-md transition-colors"
        >
          Import Knowledge
        </button>
        <input
          type="file"
          ref={fileInputRef}
          accept=".txt,text/plain"
          onChange={handleFileChange}
          className="hidden"
        />
      </div>

      <textarea
        readOnly
        value={knowledge}
        placeholder="No knowledge generated yet. Log at least 5 matches and click 'Generate' to begin."
        className="w-full h-48 p-3 bg-gray-900 border border-gray-600 rounded-md text-gray-300 placeholder-gray-500 font-mono text-sm"
        aria-label="AI Knowledge Base content"
      />
    </div>
  );
};
