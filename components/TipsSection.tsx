
import React from 'react';

interface TipsSectionProps {
  tips: string[];
}

export const TipsSection: React.FC<TipsSectionProps> = ({ tips }) => {
  return (
    <div className="bg-gray-800 rounded-lg shadow-lg p-6">
      <h2 className="text-xl font-bold mb-4 text-[var(--color-text-accent)]">Tips for Success</h2>
      <ul className="space-y-3">
        {tips.map((tip, index) => (
          <li key={index} className="flex items-start">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-3 text-[var(--color-accent-500)] flex-shrink-0 mt-1" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            <span className="text-gray-300">{tip}</span>
          </li>
        ))}
      </ul>
    </div>
  );
};