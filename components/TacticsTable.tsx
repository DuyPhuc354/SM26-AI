import React, { useState, useEffect, useRef } from 'react';
import type { DetailedTactic } from '../types';

const ShareTacticModal: React.FC<{tactic: DetailedTactic, onClose: () => void}> = ({ tactic, onClose }) => {
  const [textCopied, setTextCopied] = useState(false);
  const [linkCopied, setLinkCopied] = useState(false);

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
  
  const tacticId = encodeURIComponent(tactic.tacticName.toLowerCase().replace(/\s+/g, '-'));
  const shareableLink = `${window.location.origin}/tactics?id=${tacticId}`;

  const tacticAsText = `
Tactic Name: ${tactic.tacticName}
Formation: ${tactic.formation}

Key Roles:
${tactic.keyRoles}

General Instructions:
${tactic.generalInstructions}

Attack Instructions:
${tactic.attackInstructions}

Defence Instructions:
${tactic.defenceInstructions}

Best For / Tips:
${tactic.bestForTips}
  `.trim();

  const handleCopyText = () => {
    navigator.clipboard.writeText(tacticAsText);
    setTextCopied(true);
    navigator.vibrate?.(50);
    setTimeout(() => setTextCopied(false), 2000);
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(shareableLink);
    setLinkCopied(true);
    navigator.vibrate?.(50);
    setTimeout(() => setLinkCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50" onClick={onClose}>
      <div className="bg-gray-800/80 rounded-lg shadow-xl p-6 w-full max-w-lg text-white border border-gray-700" onClick={e => e.stopPropagation()}>
        <h2 className="text-2xl font-bold text-[var(--color-text-accent)] mb-4">Share Tactic</h2>

        <div className="mb-4">
            <label htmlFor="share-link" className="block text-sm font-medium text-gray-300 mb-1">Shareable Link</label>
            <div className="flex">
                <input
                    id="share-link"
                    type="text"
                    value={shareableLink}
                    readOnly
                    className="flex-1 bg-gray-900 border border-r-0 border-gray-600 rounded-l-md p-2 text-gray-400 text-sm focus:outline-none"
                    aria-label="Shareable tactic link"
                />
                <button
                    onClick={handleCopyLink}
                    className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-3 rounded-r-md text-sm transition-colors"
                >
                    {linkCopied ? 'Copied!' : 'Copy'}
                </button>
            </div>
        </div>

        <textarea readOnly value={tacticAsText} className="w-full h-52 p-2 bg-gray-900 border border-gray-600 rounded-md text-gray-300" />
        
        <div className="mt-4 flex justify-end gap-x-3">
          <button onClick={() => { onClose(); navigator.vibrate?.(20); }} className="bg-gray-600 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded-md">Close</button>
          <button onClick={handleCopyText} className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-md">{textCopied ? 'Copied!' : 'Copy Text'}</button>
        </div>
      </div>
    </div>
  );
};


const HighlightDiffs: React.FC<{ val1: string; val2: string; title: string }> = ({ val1, val2, title }) => {
  const isDifferent = val1 !== val2;
  return (
    <div className={isDifferent ? "bg-yellow-900/50 p-2 rounded-lg border border-yellow-700" : "p-2"}>
      <h5 className="font-semibold text-gray-300 capitalize flex items-center">
         {isDifferent && <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2 text-yellow-400" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M8.257 3.099c.636-1.21 2.37-1.21 3.006 0l4.5 8.625a1.75 1.75 0 01-1.503 2.526H5.254a1.75 1.75 0 01-1.503-2.526l4.5-8.625zm1.743 9.401a.75.75 0 01-1.5 0V9.25a.75.75 0 011.5 0v3.25zm0 2.5a.75.75 0 11-1.5 0 .75.75 0 011.5 0z" clipRule="evenodd" /></svg>}
        {title.replace(/([A-Z])/g, ' $1')}
      </h5>
      <div className="grid grid-cols-2 gap-x-4">
        <p className="text-gray-400">{val1}</p>
        <p className={isDifferent ? "text-yellow-300" : "text-gray-400"}>{val2}</p>
      </div>
    </div>
  );
};


const CompareTactics: React.FC<{tactic1: DetailedTactic, tactic2: DetailedTactic}> = ({tactic1, tactic2}) => {
  return (
    <div className="mt-6 bg-gray-900/50 p-4 rounded-lg border border-gray-600">
      <h3 className="text-xl font-bold mb-3 text-yellow-400">Tactic Comparison</h3>
      <div className="grid grid-cols-2 gap-x-4 mb-3">
        <h4 className="font-bold text-lg text-white">{tactic1.tacticName}</h4>
        <h4 className="font-bold text-lg text-white">{tactic2.tacticName}</h4>
      </div>
      <div className="space-y-2">
        <HighlightDiffs title="Formation" val1={tactic1.formation} val2={tactic2.formation} />
        <HighlightDiffs title="Key Roles" val1={tactic1.keyRoles} val2={tactic2.keyRoles} />
        <HighlightDiffs title="General" val1={tactic1.generalInstructions} val2={tactic2.generalInstructions} />
        <HighlightDiffs title="Attack" val1={tactic1.attackInstructions} val2={tactic2.attackInstructions} />
        <HighlightDiffs title="Defence" val1={tactic1.defenceInstructions} val2={tactic2.defenceInstructions} />
        <HighlightDiffs title="Best For / Tips" val1={tactic1.bestForTips} val2={tactic2.bestForTips} />
      </div>
    </div>
  )
}

const TacticActions: React.FC<{
    tactic: DetailedTactic;
    isSaved: boolean;
    onDelete?: (name: string) => void;
    onShare: (tactic: DetailedTactic) => void;
    onSelect: (tactic: DetailedTactic) => void;
    onToggleFavorite?: (name: string) => void;
    isSelected: boolean;
    isSelectionDisabled: boolean;
}> = ({ tactic, isSaved, onDelete, onShare, onSelect, onToggleFavorite, isSelected, isSelectionDisabled }) => (
    <div className="flex items-center gap-x-2">
        <button onClick={() => { onShare(tactic); navigator.vibrate?.(20); }} className="text-gray-400 hover:text-blue-400 transition-colors" aria-label={`Share ${tactic.tacticName}`}>
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path d="M15 8a3 3 0 10-2.977-2.63l-4.94 2.47a3 3 0 100 4.319l4.94 2.47a3 3 0 10.895-1.789l-4.94-2.47a3.027 3.027 0 000-.74l4.94-2.47C13.456 7.68 14.19 8 15 8z" /></svg>
        </button>
        {isSaved && onToggleFavorite && (
            <button onClick={() => { onToggleFavorite(tactic.tacticName); navigator.vibrate?.(20); }} className="text-gray-400 hover:text-yellow-400 transition-colors" aria-label={`Favorite ${tactic.tacticName}`}>
                {tactic.isFavorite ? (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.783-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                    </svg>
                )}
            </button>
        )}
        {isSaved && onDelete && (
            <button onClick={() => onDelete(tactic.tacticName)} className="text-gray-400 hover:text-red-500 transition-colors" aria-label={`Delete ${tactic.tacticName}`}>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm4 0a1 1 0 012 0v6a1 1 0 11-2 0V8z" clipRule="evenodd" /></svg>
            </button>
        )}
        <div className="flex items-center">
            <input type="checkbox" id={`compare-${tactic.tacticName}`} checked={isSelected} onChange={() => { onSelect(tactic); navigator.vibrate?.(20); }} disabled={isSelectionDisabled && !isSelected} className="w-4 h-4 text-[var(--color-accent-600)] bg-gray-500 border-gray-400 rounded focus:ring-[var(--color-accent-500)]" />
            <label htmlFor={`compare-${tactic.tacticName}`} className="ml-2 text-sm font-medium text-gray-300">Compare</label>
        </div>
    </div>
);

const TacticCard: React.FC<{
  tactic: DetailedTactic;
  isSaved: boolean;
  onDelete?: (name: string) => void;
  onShare: (tactic: DetailedTactic) => void;
  onSelect: (tactic: DetailedTactic) => void;
  onToggleFavorite?: (name: string) => void;
  isSelected: boolean;
  isSelectionDisabled: boolean;
}> = ({ tactic, isSaved, onDelete, onShare, onSelect, onToggleFavorite, isSelected, isSelectionDisabled }) => (
  <div className={`bg-gray-800/80 p-4 rounded-lg border transition-colors ${tactic.isFavorite ? 'border-yellow-500/50' : 'border-gray-700/80'}`}>
    <div className="flex justify-between items-start">
      <h3 className="text-lg font-bold text-white mb-2 pr-2">
        {tactic.isFavorite && <span className="text-yellow-400" aria-label="Favorite">★ </span>}
        {tactic.tacticName} - <span className="text-[var(--color-text-accent)]">{tactic.formation}</span>
      </h3>
      <TacticActions {...{tactic, isSaved, onDelete, onShare, onSelect, onToggleFavorite, isSelected, isSelectionDisabled}}/>
    </div>
    
    <div className="mt-2 border-t border-gray-700 pt-3">
      <h4 className="font-semibold text-gray-200 mb-1">Player Roles:</h4>
      <p className="text-sm text-gray-300">{tactic.keyRoles}</p>
    </div>

    <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4 text-sm border-t border-gray-700 pt-3">
        <div><h5 className="font-semibold text-gray-300">General</h5><p className="text-gray-400">{tactic.generalInstructions}</p></div>
        <div><h5 className="font-semibold text-gray-300">Attack</h5><p className="text-gray-400">{tactic.attackInstructions}</p></div>
        <div><h5 className="font-semibold text-gray-300">Defence</h5><p className="text-gray-400">{tactic.defenceInstructions}</p></div>
    </div>
    
    <div className="mt-4 border-t border-gray-700 pt-3">
      <h4 className="font-semibold text-gray-200 mb-1">Best For / Tips:</h4>
      <p className="text-sm text-gray-300">{tactic.bestForTips}</p>
    </div>
  </div>
);

const TacticRow: React.FC<any> = ({ tactic, isSaved, onDelete, onShare, onSelect, onToggleFavorite, isSelected, isSelectionDisabled }) => (
    <div className={`flex items-center justify-between p-2 rounded-md hover:bg-gray-800/50 text-sm transition-colors ${tactic.isFavorite ? 'bg-yellow-900/20' : ''}`}>
        <div className="flex-1 min-w-0 flex items-center">
            {tactic.isFavorite && <span className="text-yellow-400 mr-2" aria-label="Favorite">★</span>}
            <div>
                <p className="font-bold text-white truncate">{tactic.tacticName}</p>
                <p className="text-gray-400">{tactic.formation}</p>
            </div>
        </div>
        <div className="flex-shrink-0">
            <TacticActions {...{tactic, isSaved, onDelete, onShare, onSelect, onToggleFavorite, isSelected, isSelectionDisabled}}/>
        </div>
    </div>
);

export const TacticsLibrary: React.FC<{
  communityTactics: DetailedTactic[];
  savedTactics: DetailedTactic[];
  onDeleteTactic: (tacticName: string) => void;
  onToggleFavorite: (tacticName: string) => void;
  onOpenImporter: () => void;
}> = ({ communityTactics, savedTactics, onDeleteTactic, onToggleFavorite, onOpenImporter }) => {
  const [selectedToCompare, setSelectedToCompare] = useState<DetailedTactic[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchHistory, setSearchHistory] = useState<string[]>([]);
  const [viewMode, setViewMode] = useState<'card' | 'list'>('card');
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);
  const [tacticToShare, setTacticToShare] = useState<DetailedTactic | null>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const history = localStorage.getItem('sm26_tactic_search_history');
    if (history) setSearchHistory(JSON.parse(history));
  }, []);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
        if ((event.metaKey || event.ctrlKey) && event.key === 'k') {
            event.preventDefault();
            searchInputRef.current?.focus();
        }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => {
        window.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  const handleSearchChange = (query: string) => {
    setSearchQuery(query);
  };

  const handleSearchSubmit = () => {
    if (!searchQuery.trim() || searchHistory.includes(searchQuery)) return;
    const newHistory = [searchQuery, ...searchHistory].slice(0, 5);
    setSearchHistory(newHistory);
    localStorage.setItem('sm26_tactic_search_history', JSON.stringify(newHistory));
  };

  const handleSelectTactic = (tactic: DetailedTactic) => {
    setSelectedToCompare(prev => {
      if (prev.find(t => t.tacticName === tactic.tacticName)) return prev.filter(t => t.tacticName !== tactic.tacticName);
      if (prev.length < 2) return [...prev, tactic];
      return prev;
    });
  };

  const TacticComponent = viewMode === 'card' ? TacticCard : TacticRow;
  const commonTacticProps = (tactic: DetailedTactic, isSaved: boolean) => ({
      key: tactic.tacticName,
      tactic,
      isSaved,
      onDelete: isSaved ? onDeleteTactic : undefined,
      onShare: setTacticToShare,
      onSelect: handleSelectTactic,
      onToggleFavorite: isSaved ? onToggleFavorite : undefined,
      isSelected: !!selectedToCompare.find(t => t.tacticName === tactic.tacticName),
      isSelectionDisabled: selectedToCompare.length >= 2,
  });

  const filterAndSortSavedTactics = (tactics: DetailedTactic[]) => {
    const filtered = tactics.filter(tactic =>
      (tactic.tacticName.toLowerCase().includes(searchQuery.toLowerCase()) ||
       tactic.formation.toLowerCase().includes(searchQuery.toLowerCase())) &&
      (!showFavoritesOnly || tactic.isFavorite)
    );
    // Sort favorites to the top
    return filtered.sort((a, b) => (b.isFavorite ? 1 : 0) - (a.isFavorite ? 1 : 0));
  };

  const filterCommunityTactics = (tactics: DetailedTactic[]) => tactics.filter(tactic =>
    tactic.tacticName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    tactic.formation.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const displayedSavedTactics = filterAndSortSavedTactics(savedTactics);
  const displayedCommunityTactics = filterCommunityTactics(communityTactics);

  return (
    <div className="bg-gray-800 rounded-lg shadow-lg p-6">
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-y-4 mb-4">
        <h2 className="text-2xl font-bold text-[var(--color-text-accent)]">Tactics Library</h2>
        <div className="flex items-center gap-x-3">
            <label htmlFor="favorites-toggle" className="flex items-center cursor-pointer">
              <span className="mr-2 text-sm text-gray-300">Favorites</span>
              <div className="relative">
                <input type="checkbox" id="favorites-toggle" className="sr-only peer" checked={showFavoritesOnly} onChange={() => { setShowFavoritesOnly(!showFavoritesOnly); navigator.vibrate?.(20); }} />
                <div className="block bg-gray-600 w-10 h-6 rounded-full peer-checked:bg-yellow-500 transition-colors"></div>
                <div className="dot absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform peer-checked:translate-x-full"></div>
              </div>
            </label>
            <div className="flex items-center gap-x-2 p-1 bg-gray-700 rounded-md">
                <button onClick={() => { setViewMode('card'); navigator.vibrate?.(20); }} className={`px-2 py-1 text-xs rounded ${viewMode === 'card' ? 'bg-gray-600 text-white' : 'text-gray-400'}`}>Card</button>
                <button onClick={() => { setViewMode('list'); navigator.vibrate?.(20); }} className={`px-2 py-1 text-xs rounded ${viewMode === 'list' ? 'bg-gray-600 text-white' : 'text-gray-400'}`}>List</button>
            </div>
             <button onClick={onOpenImporter} className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-1.5 px-3 text-sm rounded-md transition-colors">Import Tactic</button>
        </div>
      </div>

      <div className="relative mb-4">
        <input 
            ref={searchInputRef}
            type="text" 
            placeholder="Search by name or formation..." 
            value={searchQuery} 
            onChange={(e) => handleSearchChange(e.target.value)} 
            onBlur={handleSearchSubmit} 
            onKeyDown={e => e.key === 'Enter' && handleSearchSubmit()} 
            className="w-full p-2 pl-4 pr-16 bg-gray-700 border border-gray-600 rounded-md text-white placeholder-gray-500 focus:ring-2 focus:ring-[var(--color-accent-500)]" 
            aria-label="Search tactics" 
        />
        <div className="absolute inset-y-0 right-0 flex items-center pr-3">
            <kbd className="inline-flex items-center px-2 py-1 text-xs font-sans font-medium text-gray-400 bg-gray-600 border border-gray-500 rounded">
                Ctrl+K
            </kbd>
        </div>
        {searchHistory.length > 0 && <div className="flex flex-wrap gap-1 mt-2">
            <span className="text-xs text-gray-400 mr-1">Recent:</span>
            {searchHistory.map(term => <button key={term} onClick={() => setSearchQuery(term)} className="text-xs bg-gray-600 px-2 py-0.5 rounded-full hover:bg-gray-500">{term}</button>)}
        </div>}
      </div>
      
      {savedTactics.length > 0 && (
         <div className="mb-8">
            <h3 className="text-xl font-semibold text-gray-200 mb-3">Your Saved Tactics</h3>
            <div className="space-y-4">
              {displayedSavedTactics.length > 0 ? (
                displayedSavedTactics.map(tactic => <TacticComponent {...commonTacticProps(tactic, true)} />)
              ) : <p className="text-gray-400 text-center py-2">No saved tactics match your search.</p>}
            </div>
         </div>
      )}
      
      {!showFavoritesOnly && (
        <>
          <h3 className="text-xl font-semibold text-gray-200 mb-3 border-t border-gray-700 pt-6">SM26 Meta Tactics</h3>
          <div className="space-y-4">
            {displayedCommunityTactics.length > 0 ? (
              displayedCommunityTactics.map(tactic => <TacticComponent {...commonTacticProps(tactic, false)} />)
            ) : <p className="text-gray-400 text-center py-2">No community tactics match your search.</p>}
          </div>
        </>
      )}


      {selectedToCompare.length === 2 && <CompareTactics tactic1={selectedToCompare[0]} tactic2={selectedToCompare[1]} />}
      {tacticToShare && <ShareTacticModal tactic={tacticToShare} onClose={() => setTacticToShare(null)} />}
    </div>
  );
};