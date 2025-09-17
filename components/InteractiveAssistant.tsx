import React, { useState, useEffect, useRef } from 'react';
import { getTacticSuggestion } from '../services/geminiService';
import type { TacticSuggestion, DetailedTactic } from '../types';
import { PLAYER_ROLE_DESCRIPTIONS, POSITION_TO_ROLES_MAP } from '../constants';
import { Tooltip } from './Tooltip';

// Helper to create a deep copy of a suggestion
const deepCopy = <T,>(obj: T): T => JSON.parse(JSON.stringify(obj));

const SQUAD_POSITIONS = [
    { key: 'dc', label: 'Central Defenders (DC)' },
    { key: 'dl', label: 'Left Backs (DL)' },
    { key: 'dr', label: 'Right Backs (DR)' },
    { key: 'dml', label: 'Defensive Mid. Left (DML)' },
    { key: 'dmr', label: 'Defensive Mid. Right (DMR)' },
    { key: 'dmc', label: 'Defensive Midfielders (DMC)' },
    { key: 'mc', label: 'Central Midfielders (MC)' },
    { key: 'ml', label: 'Left Midfielders (ML)' },
    { key: 'mr', label: 'Right Midfielders (MR)' },
    { key: 'amc', label: 'Attacking Midfielders (AMC)' },
    { key: 'aml', label: 'Left Wingers (AML)' },
    { key: 'amr', label: 'Right Wingers (AMR)' },
    { key: 'fl', label: 'Forward Left (FL)' },
    { key: 'fr', label: 'Forward Right (FR)' },
    { key: 'st', label: 'Strikers (ST/FC)' },
];


const initialSquadComposition = SQUAD_POSITIONS.reduce((acc, pos) => ({ ...acc, [pos.key]: 0 }), {});

const InstructionInput: React.FC<{label: string, value: string | boolean, category: string, field: string, onChange: (category: string, field: string, value: any) => void}> = ({label, value, category, field, onChange}) => {
    const options: Record<string, string[]> = {
        width: ['Narrow', 'Normal', 'Wide'],
        mentality: ['V.Defensive', 'Defensive', 'Normal', 'Attacking', 'V.Attacking'],
        tempo: ['Slow', 'Normal', 'Fast'],
        fluidity: ['Disciplined', 'Normal', 'Adventurous'],
        workRate: ['Slow', 'Normal', 'Fast'],
        creativity: ['Cautious', 'Balanced', 'Bold'],
        passingStyle: ['Short', 'Mixed', 'Direct', 'Long Ball'],
        attackingStyle: ['Mixed', 'Down Both Flanks', 'Down Left Flank', 'Down Right Flank', 'Through the Middle'],
        forwards: ['Work ball into box', 'Shoot on sight', 'Mixed'],
        widePlay: ['Byline crosses', 'Play early crosses', 'Mixed', 'Work ball into box'],
        buildUp: ['Slow', 'Normal', 'Fast'],
        pressing: ['Own Area', 'Own Half', 'All Over'],
        tacklingStyle: ['Normal', 'Hard', 'Aggressive'],
        backLine: ['Low', 'Normal', 'High'],
        timeWasting: ['Low', 'Normal', 'High'],
    };

    if (typeof value === 'boolean') {
        return (
             <div>
                <label className="text-xs text-gray-400 uppercase tracking-wider">{label}</label>
                <select 
                    value={value ? 'Yes' : 'No'} 
                    onChange={(e) => onChange(category, field, e.target.value === 'Yes')}
                    className="w-full bg-gray-600 text-white rounded p-1 text-sm border border-gray-500"
                >
                    <option>Yes</option>
                    <option>No</option>
                </select>
            </div>
        )
    }

    return (
        <div>
            <label className="text-xs text-gray-400 uppercase tracking-wider">{label}</label>
            <select 
                value={value} 
                onChange={(e) => onChange(category, field, e.target.value)}
                className="w-full bg-gray-600 text-white rounded p-1 text-sm border border-gray-500"
            >
                {options[field]?.map(opt => <option key={opt} value={opt}>{opt}</option>)}
            </select>
        </div>
    )
};


const SuggestionDetail: React.FC<{ label: string; value: string | boolean }> = ({ label, value }) => (
    <div>
        <p className="text-xs text-gray-400 uppercase tracking-wider">{label}</p>
        <p className="text-md font-semibold">{typeof value === 'boolean' ? (value ? 'Yes' : 'No') : value}</p>
    </div>
);

const convertSuggestionToDetailedTactic = (suggestion: TacticSuggestion, name: string): DetailedTactic => {
  const formatInstructions = (obj: object): string => {
    return Object.entries(obj)
      .map(([key, value]) => {
        const formattedKey = key.replace(/([A-Z])/g, ' $1').replace(/^./, (str) => str.toUpperCase());
        const formattedValue = typeof value === 'boolean' ? (value ? 'Yes' : 'No') : value;
        return `${formattedKey}: ${formattedValue}`;
      })
      .join('; ');
  };

  return {
    tacticName: name,
    formation: suggestion.formation,
    keyRoles: suggestion.playerRoles.map(kr => `${kr.position}: ${kr.role}`).join('; '),
    generalInstructions: formatInstructions(suggestion.general),
    attackInstructions: formatInstructions(suggestion.attack),
    defenceInstructions: formatInstructions(suggestion.defence),
    bestForTips: suggestion.justification,
    isFavorite: false,
  };
};

interface InteractiveAssistantProps {
  onSaveTactic: (tactic: DetailedTactic) => void;
}

export const InteractiveAssistant: React.FC<InteractiveAssistantProps> = ({ onSaveTactic }) => {
  const [squadComposition, setSquadComposition] = useState<{[key: string]: number}>(initialSquadComposition);
  const [playstyle, setPlaystyle] = useState('');
  
  const [originalSuggestion, setOriginalSuggestion] = useState<TacticSuggestion | null>(null);
  const [editableSuggestion, setEditableSuggestion] = useState<TacticSuggestion | null>(null);
  
  const [history, setHistory] = useState<TacticSuggestion[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);

  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [tacticName, setTacticName] = useState('');
  const [saveMessage, setSaveMessage] = useState('');
  
  const totalPlayers = Object.values(squadComposition).reduce((sum, count) => sum + count, 0);
  const isValidSquad = totalPlayers === 10;

  const handleCompositionChange = (positionKey: string, value: string) => {
      const count = parseInt(value, 10);
      if (isNaN(count) || count < 0 || count > 10) return;
      setSquadComposition(prev => ({...prev, [positionKey]: count}));
  };

  const updateEditableSuggestion = (newSuggestion: TacticSuggestion) => {
    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push(newSuggestion);
    setHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
    setEditableSuggestion(newSuggestion);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    navigator.vibrate?.(50);
    if (!isValidSquad) {
      setError(`You must select exactly 10 outfield players. You have selected ${totalPlayers}.`);
      return;
    }
    
    setIsLoading(true);
    setError(null);
    setOriginalSuggestion(null);
    setEditableSuggestion(null);
    setHistory([]);
    setHistoryIndex(-1);
    setIsEditing(false);
    setTacticName('');
    setSaveMessage('');

    try {
      const result = await getTacticSuggestion(squadComposition, playstyle);
      const copiedResult = deepCopy(result);
      setOriginalSuggestion(copiedResult);
      setEditableSuggestion(deepCopy(copiedResult));
      setHistory([deepCopy(copiedResult)]);
      setHistoryIndex(0);
    } catch (err) {
      setError('Failed to get suggestion. Please try again.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = () => {
    if (!tacticName.trim()) {
      setSaveMessage('Please enter a name for your tactic.');
      return;
    }
    if (editableSuggestion) {
      const detailedTactic = convertSuggestionToDetailedTactic(editableSuggestion, tacticName);
      onSaveTactic(detailedTactic);
      setSaveMessage(`Tactic "${tacticName}" saved successfully!`);
      setIsEditing(false);
      setTimeout(() => setSaveMessage(''), 3000);
    }
  };

  const handleDownload = () => {
    if (!tacticName.trim()) {
        setSaveMessage('Please enter a name to use for the filename.');
        setTimeout(() => setSaveMessage(''), 3000);
        return;
    }
    if (editableSuggestion) {
        navigator.vibrate?.(50);
        const detailedTactic = convertSuggestionToDetailedTactic(editableSuggestion, tacticName);
        const jsonString = JSON.stringify(detailedTactic, null, 2);
        const blob = new Blob([jsonString], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        const fileName = `${tacticName.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.json`;
        a.download = fileName;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }
  };

  const handleInstructionChange = (category: string, field: string, value: any) => {
    if (!editableSuggestion) return;
    const newSuggestion = deepCopy(editableSuggestion);
    (newSuggestion as any)[category][field] = value;
    updateEditableSuggestion(newSuggestion);
  };

  const handleRoleChange = (index: number, newRole: string) => {
    if (!editableSuggestion) return;
    const newSuggestion = deepCopy(editableSuggestion);
    newSuggestion.playerRoles[index].role = newRole;
    updateEditableSuggestion(newSuggestion);
  };

  const handleUndo = () => {
    if (historyIndex > 0) {
      const newIndex = historyIndex - 1;
      setHistoryIndex(newIndex);
      setEditableSuggestion(deepCopy(history[newIndex]));
      navigator.vibrate?.(30);
    }
  };
  
  const handleRedo = () => {
    if (historyIndex < history.length - 1) {
      const newIndex = historyIndex + 1;
      setHistoryIndex(newIndex);
      setEditableSuggestion(deepCopy(history[newIndex]));
      navigator.vibrate?.(30);
    }
  };

  const handleReset = () => {
    if (originalSuggestion) {
      updateEditableSuggestion(deepCopy(originalSuggestion));
      navigator.vibrate?.(100);
    }
  };


  return (
    <div className="bg-gray-800 rounded-lg shadow-lg p-6">
      <h2 className="text-2xl font-bold mb-4 text-[var(--color-text-accent)]">AI Tactic Assistant</h2>
      <p className="text-gray-400 mb-4">
        Define your available squad by entering the number of players you have for each position. The AI will create the best tactic for your team's structure.
      </p>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
            <div className="flex justify-between items-center mb-2">
                <h3 className="font-semibold text-lg text-gray-200">Define Your Squad</h3>
                <div className={`font-bold text-lg p-2 rounded-md ${isValidSquad ? 'bg-green-800 text-green-300' : 'bg-red-800 text-red-300'}`}>
                    Total Players: {totalPlayers} / 10
                </div>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 bg-gray-900/50 p-4 rounded-lg">
                {SQUAD_POSITIONS.map(pos => (
                    <div key={pos.key}>
                        <label htmlFor={pos.key} className="block text-sm font-medium text-gray-300">{pos.label}</label>
                        <input
                            type="number"
                            id={pos.key}
                            name={pos.key}
                            value={squadComposition[pos.key]}
                            onChange={(e) => handleCompositionChange(pos.key, e.target.value)}
                            min="0"
                            max="10"
                            className="mt-1 block w-full p-2 bg-gray-700 border border-gray-600 rounded-md text-white text-center"
                        />
                    </div>
                ))}
            </div>
        </div>

        <div>
          <label htmlFor="playstyle" className="block text-sm font-medium text-gray-300">
              Team Playstyle & Key Players (Optional)
          </label>
          <textarea
              id="playstyle"
              name="playstyle"
              value={playstyle}
              onChange={(e) => setPlaystyle(e.target.value)}
              rows={3}
              className="mt-1 block w-full p-2 bg-gray-700 border border-gray-600 rounded-md text-white placeholder-gray-400"
              placeholder="e.g., 'We have a fast striker who is great at finishing. Our defense is slow but strong in the air...'"
          />
          <p className="text-xs text-gray-500 mt-1">Provide more context about your team for a more tailored tactic.</p>
        </div>


        <button
          type="submit"
          disabled={isLoading || !isValidSquad}
          className="w-full bg-[var(--color-accent-600)] hover:bg-[var(--color-accent-700)] disabled:bg-gray-500 disabled:cursor-not-allowed text-white font-bold py-3 px-4 rounded-md transition-all duration-200 flex items-center justify-center"
        >
          {isLoading ? (
            <>
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Analyzing...
            </>
          ) : (
            'Get Tactic Suggestion'
          )}
        </button>
      </form>
      {error && <p className="mt-4 text-red-400 text-center" role="alert">{error}</p>}
      
      {editableSuggestion && (
        <div className="mt-6 p-4 bg-gray-900/50 rounded-lg border border-gray-700" aria-live="polite">
          <div className="flex justify-between items-center mb-3">
             <h3 className="text-xl font-bold text-[var(--color-text-accent)]">Recommended Tactic: {editableSuggestion.formation}</h3>
             {!isEditing ? (
                <button onClick={() => { setIsEditing(true); navigator.vibrate?.(20); }} className="text-sm bg-yellow-600 hover:bg-yellow-700 text-white font-bold py-1 px-3 rounded-md">Edit</button>
             ) : (
                <button onClick={() => { setIsEditing(false); navigator.vibrate?.(20); }} className="text-sm bg-yellow-600 hover:bg-yellow-700 text-white font-bold py-1 px-3 rounded-md">Finish Editing</button>
             )}
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
             {Object.entries({general: 'General', attack: 'Attack', defence: 'Defence'}).map(([category, title]) => (
                <div key={category} className="bg-gray-700 p-4 rounded-lg">
                    <h4 className="font-bold text-lg mb-2 text-gray-200">{title}</h4>
                    <div className="grid grid-cols-2 gap-x-4 gap-y-2">
                        {Object.entries((editableSuggestion as any)[category]).map(([field, value]) => (
                            isEditing ? 
                            <InstructionInput key={field} label={field.replace(/([A-Z])/g, ' $1')} value={value as any} category={category} field={field} onChange={handleInstructionChange} /> :
                            <SuggestionDetail key={field} label={field.replace(/([A-Z])/g, ' $1')} value={value as any} />
                        ))}
                    </div>
                </div>
             ))}
          </div>

          <div className="bg-gray-700 p-4 rounded-lg mb-4">
            <h4 className="font-bold text-lg mb-2 text-gray-200">Player Roles (11 Positions)</h4>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-x-4 gap-y-2">
              {editableSuggestion.playerRoles.map((role, i) => {
                  const availableRolesForPosition = POSITION_TO_ROLES_MAP[role.position.toUpperCase()] || Object.keys(PLAYER_ROLE_DESCRIPTIONS);
                  const finalRoleOptions = availableRolesForPosition.includes(role.role) 
                    ? availableRolesForPosition 
                    : [role.role, ...availableRolesForPosition];

                  return (
                    <div key={i}>
                        <label className="font-semibold text-white">{role.position}:</label>
                        {isEditing ? (
                            <select 
                                value={role.role}
                                onChange={(e) => handleRoleChange(i, e.target.value)}
                                className="w-full bg-gray-600 text-white rounded p-1 mt-1 text-sm border border-gray-500"
                            >
                                {finalRoleOptions.map(roleName => <option key={roleName} value={roleName}>{roleName}</option>)}
                            </select>
                        ) : (
                            <Tooltip text={PLAYER_ROLE_DESCRIPTIONS[role.role] || 'No description available.'}>
                                <p className="text-gray-300 underline decoration-dotted cursor-help">{role.role}</p>
                            </Tooltip>
                        )}
                    </div>
                  );
              })}
            </div>
          </div>

          <div className="bg-gray-700 p-4 rounded-lg mb-4">
            <h4 className="font-bold text-lg mb-1 text-gray-200">Justification</h4>
            <p className="text-gray-300 leading-relaxed">{editableSuggestion.justification}</p>
          </div>

          {isEditing ? (
             <div className="mt-4 p-4 bg-gray-700 rounded-lg">
                <h4 className="font-bold text-lg mb-2 text-gray-200">Save Your Custom Tactic</h4>
                 <div className="flex flex-col sm:flex-row gap-2">
                    <input
                        type="text"
                        value={tacticName}
                        onChange={(e) => setTacticName(e.target.value)}
                        placeholder="Enter tactic name..."
                        className="flex-grow p-2 bg-gray-600 border border-gray-500 rounded-md text-white placeholder-gray-400"
                        aria-label="Tactic Name"
                    />
                    <div className="flex items-center gap-x-2">
                       <button onClick={handleUndo} disabled={historyIndex <= 0} className="bg-gray-500 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded-md disabled:opacity-50 disabled:cursor-not-allowed">Undo</button>
                       <button onClick={handleRedo} disabled={historyIndex >= history.length - 1} className="bg-gray-500 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded-md disabled:opacity-50 disabled:cursor-not-allowed">Redo</button>
                       <button onClick={handleReset} className="bg-orange-600 hover:bg-orange-700 text-white font-bold py-2 px-4 rounded-md">Reset</button>
                    </div>
                    <button onClick={handleDownload} className="bg-[var(--color-accent-600)] hover:bg-[var(--color-accent-700)] text-white font-bold py-2 px-4 rounded-md">Download</button>
                    <button onClick={handleSave} className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-md">Save Tactic</button>
                </div>
                 {saveMessage && <p className="mt-2 text-sm text-[var(--color-text-accent)]">{saveMessage}</p>}
             </div>
          ) : (
             <div className="mt-4 p-4 bg-gray-700 rounded-lg">
                <h4 className="font-bold text-lg mb-2 text-gray-200">Save or Download This Tactic</h4>
                <div className="flex flex-col sm:flex-row gap-2">
                    <input
                        type="text"
                        value={tacticName}
                        onChange={(e) => setTacticName(e.target.value)}
                        placeholder="Enter tactic name..."
                        className="flex-grow p-2 bg-gray-600 border border-gray-500 rounded-md text-white placeholder-gray-400"
                        aria-label="Tactic Name"
                    />
                    <button onClick={handleDownload} className="bg-[var(--color-accent-600)] hover:bg-[var(--color-accent-700)] text-white font-bold py-2 px-4 rounded-md transition-colors">
                        Download
                    </button>
                    <button onClick={handleSave} className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-md transition-colors">
                        Save
                    </button>
                </div>
                 {saveMessage && <p className="mt-2 text-sm text-[var(--color-text-accent)]">{saveMessage}</p>}
            </div>
          )}
        </div>
      )}
    </div>
  );
};