import React, { useState, useEffect, useRef, useMemo } from 'react';
import type { DetailedTactic, MatchData, TacticGroup } from '../types';
import { AccordionItem } from './Accordion';
import { Tooltip } from './Tooltip';

// --- Modals ---

const ShareTacticModal: React.FC<{tactic: DetailedTactic, onClose: () => void}> = ({ tactic, onClose }) => {
  const [textCopied, setTextCopied] = useState(false);
  const [linkCopied, setLinkCopied] = useState(false);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);
  
  const tacticId = encodeURIComponent(tactic.tacticName.toLowerCase().replace(/\s+/g, '-'));
  const shareableLink = `${window.location.origin}/tactics?id=${tacticId}`;

  const tacticAsText = `
Tactic Name: ${tactic.tacticName}
Formation: ${tactic.formation}
Key Roles: ${tactic.keyRoles}
General Instructions: ${tactic.generalInstructions}
Attack Instructions: ${tactic.attackInstructions}
Defence Instructions: ${tactic.defenceInstructions}
Best For / Tips: ${tactic.bestForTips}
  `.trim();

  const handleCopyText = () => { navigator.clipboard.writeText(tacticAsText); setTextCopied(true); navigator.vibrate?.(50); setTimeout(() => setTextCopied(false), 2000); };
  const handleCopyLink = () => { navigator.clipboard.writeText(shareableLink); setLinkCopied(true); navigator.vibrate?.(50); setTimeout(() => setLinkCopied(false), 2000); };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50" onClick={onClose}>
      <div className="bg-gray-800/80 rounded-lg shadow-xl p-6 w-full max-w-lg text-white border border-gray-700" onClick={e => e.stopPropagation()}>
        <h2 className="text-2xl font-bold text-[var(--color-text-accent)] mb-4">Share Tactic</h2>
        <div className="mb-4">
            <label htmlFor="share-link" className="block text-sm font-medium text-gray-300 mb-1">Shareable Link</label>
            <div className="flex">
                <input id="share-link" type="text" value={shareableLink} readOnly className="flex-1 bg-gray-900 border border-r-0 border-gray-600 rounded-l-md p-2 text-gray-400 text-sm focus:outline-none" aria-label="Shareable tactic link" />
                <button onClick={handleCopyLink} className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-3 rounded-r-md text-sm transition-colors">{linkCopied ? 'Copied!' : 'Copy'}</button>
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

const ManageGroupModal: React.FC<{
  tacticName: string;
  groups: TacticGroup[];
  onCreateGroup: (name: string, tacticToAdd: string) => void;
  onMoveTacticToGroup: (tacticName: string, groupId: string | null) => void;
  onClose: () => void;
}> = ({ tacticName, groups, onCreateGroup, onMoveTacticToGroup, onClose }) => {
  const [isCreating, setIsCreating] = useState(false);
  const [newGroupName, setNewGroupName] = useState('');

  const handleCreate = () => {
    if (newGroupName.trim()) {
      onCreateGroup(newGroupName.trim(), tacticName);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[51]" onClick={onClose}>
      <div className="bg-gray-800 rounded-lg shadow-xl p-6 w-full max-w-md text-white border border-gray-700" onClick={e => e.stopPropagation()}>
        <h2 className="text-xl font-bold text-white mb-4">{tacticName ? `Move "${tacticName}" to...` : "Create New Group"}</h2>
        {isCreating || !tacticName ? (
          <div className="flex gap-x-2">
            <input type="text" value={newGroupName} onChange={e => setNewGroupName(e.target.value)} placeholder="New group name" className="flex-1 bg-gray-700 border border-gray-600 rounded-md p-2 text-white placeholder-gray-400" autoFocus onKeyPress={e => e.key === 'Enter' && handleCreate()} />
            <button onClick={handleCreate} className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-md">Create</button>
          </div>
        ) : (
          <div className="space-y-2">
            {groups.map(group => (
              <button key={group.id} onClick={() => { onMoveTacticToGroup(tacticName, group.id); onClose(); }} className="w-full text-left p-2 bg-gray-700 hover:bg-gray-600 rounded-md">{group.name}</button>
            ))}
             <button onClick={() => onMoveTacticToGroup(tacticName, null)} className="w-full text-left p-2 bg-gray-700 hover:bg-gray-600 rounded-md text-yellow-400">Ungroup Tactic</button>
            <button onClick={() => setIsCreating(true)} className="w-full p-2 bg-green-600 hover:bg-green-700 rounded-md mt-4">Create New Group & Move</button>
          </div>
        )}
      </div>
    </div>
  );
};


// --- Components ---
const StarRating: React.FC<{rating: number, onRate: (rating: number) => void}> = ({ rating, onRate }) => {
    return (
        <div className="flex items-center">
            {[...Array(5)].map((_, i) => (
                <button key={i} onClick={() => onRate(i + 1)}>
                    <svg className={`w-4 h-4 ${i < rating ? 'text-yellow-400' : 'text-gray-500'}`} fill="currentColor" viewBox="0 0 20 20">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                </button>
            ))}
        </div>
    );
};

const TacticActions: React.FC<{
    tactic: DetailedTactic; isSaved: boolean; onDelete?: (name: string) => void; onShare: (tactic: DetailedTactic) => void; onExport: (tactic: DetailedTactic) => void; onSelect: (tactic: DetailedTactic) => void; onToggleFavorite?: (name: string) => void; isSelected: boolean; isSelectionDisabled: boolean; onImproveTactic: (tactic: DetailedTactic) => void; matchCount: number; avgRating: number; onRate: (name: string, rating: number) => void; onMove: (tacticName: string) => void;
}> = ({ tactic, isSaved, onDelete, onShare, onExport, onSelect, onToggleFavorite, isSelected, isSelectionDisabled, onImproveTactic, matchCount, avgRating, onRate, onMove }) => (
    <div className="flex items-center flex-wrap gap-x-2 gap-y-1">
        {isSaved && <StarRating rating={avgRating} onRate={(r) => onRate(tactic.tacticName, r)} />}
        {isSaved && (<Tooltip text="Move to group"><button onClick={() => onMove(tactic.tacticName)} className="text-gray-400 hover:text-blue-400 transition-colors"><svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path d="M2 6a2 2 0 012-2h5l2 2h5a2 2 0 012 2v6a2 2 0 01-2 2H4a2 2 0 01-2-2V6z" /></svg></button></Tooltip>)}
        <Tooltip text="Share"><button onClick={() => { onShare(tactic); navigator.vibrate?.(20); }} className="text-gray-400 hover:text-blue-400 transition-colors" aria-label={`Share ${tactic.tacticName}`}><svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path d="M15 8a3 3 0 10-2.977-2.63l-4.94 2.47a3 3 0 100 4.319l4.94 2.47a3 3 0 10.895-1.789l-4.94-2.47a3.027 3.027 0 000-.74l4.94-2.47C13.456 7.68 14.19 8 15 8z" /></svg></button></Tooltip>
        <Tooltip text="Export"><button onClick={() => onExport(tactic)} className="text-gray-400 hover:text-green-400 transition-colors" aria-label={`Export ${tactic.tacticName}`}><svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" /></svg></button></Tooltip>
        {isSaved && onImproveTactic && (<Tooltip text={matchCount < 3 ? `Log at least 3 matches to enable AI analysis` : `Analyze and improve this tactic (${matchCount} logged)`}><button onClick={() => onImproveTactic(tactic)} disabled={matchCount < 3} className="text-gray-400 hover:text-purple-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed" aria-label={`Improve ${tactic.tacticName}`}><svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 14.464A1 1 0 106.465 13.05l-.707-.707a1 1 0 00-1.414 1.414l.707.707zm-1.414-2.12a1 1 0 011.414 0l.707.707a1 1 0 11-1.414 1.414l-.707-.707a1 1 0 010-1.414zM4 11a1 1 0 100-2H3a1 1 0 100 2h1z" /></svg></button></Tooltip>)}
        {isSaved && onToggleFavorite && (<Tooltip text="Favorite"><button onClick={() => { onToggleFavorite(tactic.tacticName); navigator.vibrate?.(20); }} className="text-gray-400 hover:text-yellow-400 transition-colors" aria-label={`Favorite ${tactic.tacticName}`}>{tactic.isFavorite ? <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg> : <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976-2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.783-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" /></svg>}</button></Tooltip>)}
        {isSaved && onDelete && (<Tooltip text="Delete"><button onClick={() => onDelete(tactic.tacticName)} className="text-gray-400 hover:text-red-500 transition-colors" aria-label={`Delete ${tactic.tacticName}`}><svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm4 0a1 1 0 012 0v6a1 1 0 11-2 0V8z" clipRule="evenodd" /></svg></button></Tooltip>)}
        <div className="flex items-center"><input type="checkbox" id={`compare-${tactic.tacticName}`} checked={isSelected} onChange={() => { onSelect(tactic); navigator.vibrate?.(20); }} disabled={isSelectionDisabled && !isSelected} className="w-4 h-4 text-[var(--color-accent-600)] bg-gray-500 border-gray-400 rounded focus:ring-[var(--color-accent-500)]" /><label htmlFor={`compare-${tactic.tacticName}`} className="ml-2 text-sm font-medium text-gray-300 sr-only">Compare</label></div>
    </div>
);

const TacticCard = React.memo<any>(({ tactic, isSaved, ...props }) => (
    <div className="bg-gray-700/50 rounded-lg p-4 space-y-3">
        <div className="flex justify-between items-start">
            <div>
                <h4 className="font-bold text-white text-lg">{tactic.tacticName}</h4>
                <p className="text-sm text-gray-400">{tactic.formation}</p>
            </div>
            {isSaved && tactic.isFavorite && <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-yellow-400 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>}
        </div>
        <p className="text-sm text-gray-300 line-clamp-2 min-h-[40px]">{tactic.bestForTips}</p>
        <AccordionItem title="Details">
            <div className="text-xs text-gray-400 space-y-2 mt-2">
                <p><strong>Key Roles:</strong> {tactic.keyRoles}</p>
                <p><strong>General:</strong> {tactic.generalInstructions}</p>
                <p><strong>Attack:</strong> {tactic.attackInstructions}</p>
                <p><strong>Defence:</strong> {tactic.defenceInstructions}</p>
            </div>
        </AccordionItem>
        <div className="border-t border-gray-600 pt-3">
            <TacticActions tactic={tactic} isSaved={isSaved} {...props} />
        </div>
    </div>
));

const TacticRow = React.memo<any>(({ tactic, isSaved, ...props }) => (
    <details className="bg-gray-700/50 rounded-md group">
        <summary className="p-2 flex items-center justify-between cursor-pointer list-none">
            <div className="flex items-center gap-x-4">
                <span className="text-yellow-400 flex-shrink-0 transition-transform group-open:rotate-90">{isSaved && tactic.isFavorite ? '★' : '›'}</span>
                <div>
                    <p className="font-semibold text-white">{tactic.tacticName}</p>
                    <p className="text-xs text-gray-400">{tactic.formation}</p>
                </div>
            </div>
            <TacticActions tactic={tactic} isSaved={isSaved} {...props} />
        </summary>
        <div className="border-t border-gray-600 p-3 text-xs text-gray-400 space-y-2">
             <p><strong>Tips:</strong> {tactic.bestForTips}</p>
             <p><strong>Roles:</strong> {tactic.keyRoles}</p>
        </div>
    </details>
));

// --- Main Library Component ---
export const TacticsLibrary: React.FC<{
  communityTactics: DetailedTactic[]; savedTactics: DetailedTactic[]; onDeleteTactic: (tacticName: string) => void; onToggleFavorite: (tacticName: string) => void; onOpenImporter: () => void; matchHistory: MatchData[]; onSaveTactic: (tactic: DetailedTactic) => void; onRateTactic: (tacticName: string, rating: number) => void; onImproveTactic: (tactic: DetailedTactic) => void; tacticGroups: TacticGroup[]; onCreateTacticGroup: (name: string, tacticNameToMove?: string) => void; onDeleteTacticGroup: (groupId: string) => void; onRenameTacticGroup: (groupId: string, newName: string) => void; onMoveTacticToGroup: (tacticName: string, groupId: string | null) => void;
}> = ({ communityTactics, savedTactics, onDeleteTactic, onToggleFavorite, onOpenImporter, matchHistory, onSaveTactic, onRateTactic, onImproveTactic, tacticGroups, onCreateTacticGroup, onDeleteTacticGroup, onRenameTacticGroup, onMoveTacticToGroup }) => {
  const [selectedToCompare, setSelectedToCompare] = useState<DetailedTactic[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'card' | 'list'>('card');
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);
  const [tacticToShare, setTacticToShare] = useState<DetailedTactic | null>(null);
  const [tacticToMove, setTacticToMove] = useState<string | null>(null);
  const [editingGroup, setEditingGroup] = useState<{ id: string, name: string } | null>(null);
  const [isCreatingGroup, setIsCreatingGroup] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);

  const handleExportTactic = (tactic: DetailedTactic) => {
    navigator.vibrate?.(50);
    const jsonString = JSON.stringify(tactic, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${tactic.tacticName.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.json`;
    a.click();
    URL.revokeObjectURL(url);
    a.remove();
  };
  
  const handleSelectTactic = (tactic: DetailedTactic) => {
    setSelectedToCompare(prev => {
        const isSelected = prev.find(t => t.tacticName === tactic.tacticName);
        if (isSelected) {
            return prev.filter(t => t.tacticName !== tactic.tacticName);
        }
        if (prev.length < 2) {
            return [...prev, tactic];
        }
        return prev;
    });
  };
  
  const filteredSavedTactics = useMemo(() => 
    savedTactics.filter(tactic =>
      (tactic.tacticName.toLowerCase().includes(searchQuery.toLowerCase()) ||
       tactic.formation.toLowerCase().includes(searchQuery.toLowerCase())) &&
      (!showFavoritesOnly || tactic.isFavorite)
    ), [savedTactics, searchQuery, showFavoritesOnly]);

  const { groupedTactics, ungroupedTactics } = useMemo(() => {
    const currentGroups = tacticGroups || [];
    const groupedNames = new Set(currentGroups.flatMap(g => g.tacticNames));
    const ungrouped = filteredSavedTactics.filter(t => !groupedNames.has(t.tacticName));
    const grouped = currentGroups.map(group => ({
      ...group,
      tactics: filteredSavedTactics.filter(t => group.tacticNames.includes(t.tacticName))
    })).sort((a,b) => a.name.localeCompare(b.name));
    return { groupedTactics: grouped, ungroupedTactics: ungrouped };
  }, [tacticGroups, filteredSavedTactics]);

  const TacticComponent = viewMode === 'card' ? TacticCard : TacticRow;
  const commonTacticProps = (tactic: DetailedTactic, isSaved: boolean) => ({
      key: tactic.tacticName, tactic, isSaved,
      onDelete: isSaved ? onDeleteTactic : undefined,
      onShare: setTacticToShare, onExport: handleExportTactic, onSelect: handleSelectTactic,
      onToggleFavorite: isSaved ? onToggleFavorite : undefined,
      isSelected: !!selectedToCompare.find(t => t.tacticName === tactic.tacticName),
      isSelectionDisabled: selectedToCompare.length >= 2,
      onImproveTactic,
      matchCount: matchHistory.filter(m => m.tacticUsed === tactic.tacticName).length,
      avgRating: tactic.ratings && tactic.ratings.length > 0 ? Math.round(tactic.ratings.reduce((a, b) => a + b, 0) / tactic.ratings.length) : 0,
      onRate: onRateTactic,
      onMove: setTacticToMove
  });

  return (
    <div className="bg-gray-800 rounded-lg shadow-lg p-6">
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-y-4 mb-4">
        <h2 className="text-2xl font-bold text-[var(--color-text-accent)]">Tactics Library</h2>
        <div className="flex items-center gap-x-3">
            <button onClick={() => setIsCreatingGroup(true)} className="bg-green-600 hover:bg-green-700 text-white font-bold py-1.5 px-3 text-sm rounded-md transition-colors">Create Group</button>
            <button onClick={onOpenImporter} className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-1.5 px-3 text-sm rounded-md transition-colors">Import Tactic(s)</button>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-y-4 mb-4">
        <div className="relative flex-grow"><input ref={searchInputRef} type="text" placeholder="Search by name or formation..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-full p-2 pl-4 pr-16 bg-gray-700 border border-gray-600 rounded-md text-white placeholder-gray-500 focus:ring-2 focus:ring-[var(--color-accent-500)]" aria-label="Search tactics" /></div>
        <div className="flex items-center gap-x-3 flex-shrink-0 sm:ml-4">
            <label htmlFor="favorites-toggle" className="flex items-center cursor-pointer"><span className="mr-2 text-sm text-gray-300">Favorites</span><div className="relative"><input type="checkbox" id="favorites-toggle" className="sr-only peer" checked={showFavoritesOnly} onChange={() => { setShowFavoritesOnly(!showFavoritesOnly); navigator.vibrate?.(20); }} /><div className="block bg-gray-600 w-10 h-6 rounded-full peer-checked:bg-yellow-500 transition-colors"></div><div className="dot absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform peer-checked:translate-x-full"></div></div></label>
            <div className="flex items-center gap-x-1 p-1 bg-gray-700 rounded-md">
                <button onClick={() => { setViewMode('card'); navigator.vibrate?.(20); }} className={`px-2 py-1 text-xs rounded ${viewMode === 'card' ? 'bg-gray-600 text-white' : 'text-gray-400'}`}>Card</button>
                <button onClick={() => { setViewMode('list'); navigator.vibrate?.(20); }} className={`px-2 py-1 text-xs rounded ${viewMode === 'list' ? 'bg-gray-600 text-white' : 'text-gray-400'}`}>List</button>
            </div>
        </div>
      </div>
      
      {savedTactics.length > 0 && (
         <div className="mb-8">
            <h3 className="text-xl font-semibold text-gray-200 mb-3">Your Saved Tactics</h3>
            <div className="max-h-[60vh] overflow-y-auto space-y-2 pr-2">
              {groupedTactics.map(group => {
                  if (group.tactics.length === 0 && searchQuery) return null;
                  return (
                    <AccordionItem 
                        key={group.id} 
                        title={
                           <div className="flex items-center justify-between w-full">
                                {editingGroup?.id === group.id ? (
                                    <input type="text" value={editingGroup.name} onChange={e => setEditingGroup({...editingGroup, name: e.target.value})} onBlur={() => { onRenameTacticGroup(group.id, editingGroup.name); setEditingGroup(null); }} onKeyPress={e => e.key === 'Enter' && e.currentTarget.blur()} autoFocus className="bg-gray-600 text-white p-1 rounded-md text-lg font-semibold"/>
                                ) : (
                                    <span>{group.name} ({group.tactics.length})</span>
                                )}
                                <div className="flex items-center gap-x-2 pr-4" onClick={e => e.stopPropagation()}>
                                    <button onClick={() => setEditingGroup({id: group.id, name: group.name})} className="text-gray-400 hover:text-yellow-400"><svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor"><path d="M17.414 2.586a2 2 0 00-2.828 0L7 10.172V13h2.828l7.586-7.586a2 2 0 000-2.828z" /><path fillRule="evenodd" d="M2 6a2 2 0 012-2h4a1 1 0 010 2H4v10h10v-4a1 1 0 112 0v4a2 2 0 01-2 2H4a2 2 0 01-2-2V6z" clipRule="evenodd" /></svg></button>
                                    <button onClick={() => onDeleteTacticGroup(group.id)} className="text-gray-400 hover:text-red-400"><svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm4 0a1 1 0 012 0v6a1 1 0 11-2 0V8z" clipRule="evenodd" /></svg></button>
                                </div>
                            </div>
                        }
                    >
                      <div className={`${viewMode === 'card' ? 'grid grid-cols-1 lg:grid-cols-2 gap-4' : 'space-y-2'} p-2 bg-gray-800/50`}>
                          {group.tactics.map(tactic => <TacticComponent {...commonTacticProps(tactic, true)} />)}
                          {group.tactics.length === 0 && <p className="text-gray-400 text-center py-2 lg:col-span-2">This group is empty.</p>}
                      </div>
                    </AccordionItem>
                  )
              })}
              {ungroupedTactics.length > 0 && (
                 <AccordionItem key="ungrouped" title={`Ungrouped Tactics (${ungroupedTactics.length})`}>
                    <div className={`${viewMode === 'card' ? 'grid grid-cols-1 lg:grid-cols-2 gap-4' : 'space-y-2'} p-2 bg-gray-800/50`}>
                        {ungroupedTactics.map(tactic => <TacticComponent {...commonTacticProps(tactic, true)} />)}
                    </div>
                  </AccordionItem>
              )}
            </div>
         </div>
      )}
      
      {!showFavoritesOnly && (
        <>
          <h3 className="text-xl font-semibold text-gray-200 mb-3 border-t border-gray-700 pt-6">SM26 Meta Tactics</h3>
          <div className={`${viewMode === 'card' ? 'grid grid-cols-1 lg:grid-cols-2 gap-4' : 'space-y-2'} max-h-[60vh] overflow-y-auto pr-2`}>
            {communityTactics.filter(t => t.tacticName.toLowerCase().includes(searchQuery.toLowerCase()) || t.formation.toLowerCase().includes(searchQuery.toLowerCase())).map(tactic => <TacticComponent {...commonTacticProps(tactic, false)} />)}
          </div>
        </>
      )}

      {selectedToCompare.length === 2 && <div className="bg-gray-900/50 p-4 mt-6 rounded-lg"><h3 className="text-xl font-bold text-white mb-2">Compare Tactics</h3><p>Compare logic to be implemented here.</p></div>}
      {tacticToShare && <ShareTacticModal tactic={tacticToShare} onClose={() => setTacticToShare(null)} />}
      {tacticToMove && <ManageGroupModal tacticName={tacticToMove} groups={tacticGroups} onCreateGroup={onCreateTacticGroup} onMoveTacticToGroup={onMoveTacticToGroup} onClose={() => setTacticToMove(null)} />}
      {isCreatingGroup && <ManageGroupModal tacticName="" groups={[]} onCreateGroup={(name) => onCreateTacticGroup(name)} onMoveTacticToGroup={() => {}} onClose={() => setIsCreatingGroup(false)} />}
    </div>
  );
};