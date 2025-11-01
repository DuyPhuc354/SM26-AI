import React, { useEffect } from 'react';

interface EvolutionReportModalProps {
  report: string;
  onClose: () => void;
}

export const EvolutionReportModal: React.FC<EvolutionReportModalProps> = ({ report, onClose }) => {
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

  // A simple markdown-to-HTML conversion for presentation
  const formattedReport = report
    .replace(/### (.*?)\n/g, '<h3 class="text-xl font-bold text-[var(--color-text-accent)] mt-4 mb-2">$1</h3>')
    .replace(/\*\*Key Tactical Changes:\*\*/g, '<strong class="text-gray-200 block mt-3 font-semibold">Key Tactical Changes:</strong>')
    .replace(/\*\*Performance Impact:\*\*/g, '<strong class="text-gray-200 block mt-3 font-semibold">Performance Impact:</strong>')
    .replace(/\*\*Causality Analysis:\*\*/g, '<strong class="text-gray-200 block mt-3 font-semibold">Causality Analysis:</strong>')
    .replace(/-\s(.*?)\n/g, '<li class="ml-5 list-disc">$1</li>')
    .replace(/---(.*?)---/g, '<div class="border-t border-gray-600 my-4"></div>');


  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50" onClick={() => { onClose(); navigator.vibrate?.(20); }}>
      <div className="bg-gray-800/90 rounded-lg shadow-xl p-6 w-full max-w-3xl text-white border border-gray-700 max-h-[90vh] flex flex-col" onClick={e => e.stopPropagation()}>
        <div className="flex-shrink-0">
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-bold text-white">Tactic Evolution Report</h2>
                <button onClick={() => { onClose(); navigator.vibrate?.(20); }} className="text-gray-400 hover:text-white text-3xl">&times;</button>
            </div>
        </div>

        <div className="flex-grow overflow-y-auto pr-4 -mr-4 text-gray-300">
            <div dangerouslySetInnerHTML={{ __html: formattedReport }} />
        </div>

        <div className="mt-6 flex justify-end flex-shrink-0">
          <button onClick={() => { onClose(); navigator.vibrate?.(20); }} className="bg-gray-600 hover:bg-gray-700 text-white font-bold py-2 px-6 rounded-md">
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
