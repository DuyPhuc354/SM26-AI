import React, { useState, useEffect, useRef } from 'react';
import { Header } from './components/Header';
import { InteractiveAssistant } from './components/InteractiveAssistant';
import { Accordion, AccordionItem } from './components/Accordion';
import { TacticsLibrary } from './components/TacticsTable';
import { TipsSection } from './components/TipsSection';
import { TacticImporter } from './components/TacticImporter';
import { MatchHistoryImporter } from './components/MatchHistoryImporter';
import { MatchPerformanceTracker } from './components/MatchPerformanceTracker';
import { FormationPlanner } from './components/FormationPlanner';
import { TacticOptimizer } from './components/TacticOptimizer';
import { Badges } from './components/Badges';
import { UpdateNotification } from './components/UpdateNotification';
import { PlayerRoleFinder } from './components/PlayerRoleFinder';
import { KnowledgeManager } from './components/KnowledgeManager';
import { ChatBot } from './components/ChatBot';
import { ImageAnalyzer } from './components/ImageAnalyzer';
import { AudioTranscriber } from './components/AudioTranscriber';
import { TacticImprovementModal } from './components/TacticImprovementModal';
import { guideContent, communityTactics, tips } from './constants';
import { getTacticImprovementSuggestion, synthesizeKnowledge } from './services/geminiService';
import type { DetailedTactic, MatchData, Badge, TacticImprovementSuggestion, ProfileData, TacticGroup } from './types';

const APP_UPDATE_VERSION = 'v1.4'; // Increment to show update modal again

const initialProfileData: ProfileData = {
  savedTactics: [],
  matchHistory: [],
  aiKnowledge: '',
  tacticGroups: [],
};

// --- Helper functions from original App.tsx ---
const deltaRatio = (a: number | undefined, b: number | undefined): number => {
    const valA = a ?? 0; const valB = b ?? 0;
    if (valA + valB === 0) return 0.0;
    return (valA - valB) / (valA + valB);
};

const calculatePitchControl = (match: Partial<Omit<MatchData, 'id' | 'matchNumber'>>): number => {
    const wP = 0.25; const wS = 0.20; const wT = 0.20; const wG = 0.25; const wG_extra = 0.10; const w_pen = 0.05; const w_pen_extra = 0.15; const score_scale = 2.0; const boost_scale = 1.0; const penalty_boost_scale = 1.0; const penalty_gen_scale = 2.0; const res_win = 0.08; const res_draw = 0.02; const res_loss = -0.08;
    const { score, possession, shots, shotsOnTarget, opponentPossession, opponentShots, opponentShotsOnTarget } = match;
    let goalsFor = 0; let goalsAgainst = 0;
    if (score) { const scoreParts = score.split('-').map(Number); if (scoreParts.length === 2 && !isNaN(scoreParts[0]) && !isNaN(scoreParts[1])) { goalsFor = scoreParts[0]; goalsAgainst = scoreParts[1]; } }
    const pos_own = possession ?? 50; const pos_opp = opponentPossession ?? (100 - pos_own); const shots_own = shots ?? 0; const shots_opp = opponentShots ?? 0; const sot_own = shotsOnTarget ?? 0; const sot_opp = opponentShotsOnTarget ?? 0;
    const dP = deltaRatio(pos_own, pos_opp); const dS = deltaRatio(shots_own, shots_opp); const dT = deltaRatio(sot_own, sot_opp);
    const raw_g = goalsFor - goalsAgainst; const dG_base = Math.tanh(raw_g / score_scale); const boost = Math.tanh(Math.max(0, goalsFor - 2) / boost_scale); const pen_extra = Math.tanh(Math.max(0, goalsAgainst - 2) / penalty_boost_scale); const pen_gen = Math.tanh(goalsAgainst / penalty_gen_scale);
    let res = res_loss; if (goalsFor > goalsAgainst) res = res_win; else if (goalsFor === goalsAgainst) res = res_draw;
    const total = (wP * dP + wS * dS + wT * dT + wG * dG_base) + wG_extra * boost - w_pen * pen_gen - w_pen_extra * pen_extra + res;
    return Math.round(Math.max(0, Math.min(100, 50 * (1 + total))));
};

const mergeInstructionStrings = (original: string, changes: string | undefined): string => {
  if (!changes || changes.trim() === '') return original;
  const instructionToMap = (str: string): Map<string, string> => {
    const map = new Map<string, string>(); if (!str) return map;
    str.split(';').forEach(part => { const trimmedPart = part.trim(); if (trimmedPart) { const separatorIndex = trimmedPart.indexOf(':'); if (separatorIndex > 0) { const key = trimmedPart.substring(0, separatorIndex).trim(); const value = trimmedPart.substring(separatorIndex + 1).trim(); if (key && value) map.set(key, value); } } }); return map;
  };
  const originalMap = instructionToMap(original); const changesMap = instructionToMap(changes);
  changesMap.forEach((value, key) => originalMap.set(key, value));
  return Array.from(originalMap.entries()).map(([key, value]) => `${key}: ${value}`).join('; ');
};

// --- Profile Manager Component ---
interface ProfileManagerProps {
  profiles: Record<string, ProfileData>;
  onSelectProfile: (name: string) => void;
  onCreateProfile: (name: string) => void;
  onDeleteProfile: (name: string) => void;
  onImportProfile: (file: File) => void;
  onExportProfile: (name: string) => void;
}

const ProfileManager: React.FC<ProfileManagerProps> = ({ profiles, onSelectProfile, onCreateProfile, onDeleteProfile, onImportProfile, onExportProfile }) => {
  const [newProfileName, setNewProfileName] = useState('');
  const importInputRef = useRef<HTMLInputElement>(null);

  const handleCreate = () => {
    if (newProfileName.trim() && !profiles[newProfileName.trim()]) {
      onCreateProfile(newProfileName.trim());
      setNewProfileName('');
    }
  };

  return (
    <div className="min-h-screen text-gray-200 font-sans flex items-center justify-center p-4">
      <div className="w-full max-w-2xl bg-gray-800/80 backdrop-blur-md rounded-lg shadow-2xl p-8 border border-gray-700">
        <div className="text-center mb-6">
          <h1 className="text-4xl font-bold text-white">Soccer Manager 2026</h1>
          <p className="text-[var(--color-text-accent)] mt-2">Tactics Assistant</p>
        </div>

        <div className="space-y-4 mb-6 max-h-[30vh] overflow-y-auto pr-2">
          {Object.keys(profiles).length > 0 ? (
            Object.keys(profiles).sort().map(name => (
              <div key={name} className="flex items-center justify-between bg-gray-700/50 p-3 rounded-lg">
                <span className="font-semibold text-lg text-white">{name}</span>
                <div className="flex items-center gap-x-2">
                  <button onClick={() => onExportProfile(name)} className="text-gray-400 hover:text-green-400 text-sm">Export</button>
                  <button onClick={() => onDeleteProfile(name)} className="text-gray-400 hover:text-red-400 text-sm">Delete</button>
                  <button onClick={() => onSelectProfile(name)} className="bg-[var(--color-accent-600)] hover:bg-[var(--color-accent-700)] text-white font-bold py-1 px-4 rounded-md text-sm">Load</button>
                </div>
              </div>
            ))
          ) : (
            <p className="text-center text-gray-400">No profiles found. Create one to get started!</p>
          )}
        </div>

        <div className="border-t border-gray-700 pt-6">
          <div className="flex gap-x-2 mb-4">
            <input type="text" value={newProfileName} onChange={e => setNewProfileName(e.target.value)} onKeyPress={e => e.key === 'Enter' && handleCreate()} placeholder="New Profile Name (e.g., My Club)" className="flex-1 bg-gray-700 border border-gray-600 rounded-md p-2 text-white placeholder-gray-400" />
            <button onClick={handleCreate} className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-md">Create</button>
          </div>
          <input type="file" ref={importInputRef} accept=".json" onChange={e => e.target.files && onImportProfile(e.target.files[0])} className="hidden" />
          <button onClick={() => importInputRef.current?.click()} className="w-full bg-gray-600 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded-md">Import Profile from File</button>
        </div>
      </div>
    </div>
  );
};


// --- Main App Component (now with profile logic) ---
const App: React.FC = () => {
  const [profiles, setProfiles] = useState<Record<string, ProfileData>>({});
  const [activeProfile, setActiveProfile] = useState<string | null>(null);

  // States moved from original App.tsx
  const [isImporterOpen, setIsImporterOpen] = useState(false);
  const [isHistoryImporterOpen, setIsHistoryImporterOpen] = useState(false);
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'dashboard' | 'tactics' | 'tools'>('dashboard');
  const [isGeneratingKnowledge, setIsGeneratingKnowledge] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [tacticToImprove, setTacticToImprove] = useState<DetailedTactic | null>(null);
  const [improvementSuggestion, setImprovementSuggestion] = useState<TacticImprovementSuggestion | null>(null);
  const [isAnalyzingSuggestion, setIsAnalyzingSuggestion] = useState(false);
  const [analysisSuggestionError, setAnalysisSuggestionError] = useState('');

  // Current profile's data
  const profileData = activeProfile ? profiles[activeProfile] : initialProfileData;

  // Load profiles from localStorage on mount
  useEffect(() => {
    try {
      const storedProfilesRaw = localStorage.getItem('sm26_profiles');
      let storedProfiles = storedProfilesRaw ? JSON.parse(storedProfilesRaw) : null;

      // One-time migration for existing users
      if (!storedProfiles) {
        const oldTactics = localStorage.getItem('sm26_saved_tactics');
        const oldHistory = localStorage.getItem('sm26_match_history');
        const oldKnowledge = localStorage.getItem('sm26_ai_knowledge');
        
        if (oldTactics || oldHistory || oldKnowledge) {
          const defaultProfile: ProfileData = {
            savedTactics: oldTactics ? JSON.parse(oldTactics) : [],
            matchHistory: oldHistory ? JSON.parse(oldHistory) : [],
            aiKnowledge: oldKnowledge || '',
            tacticGroups: [],
          };
          const defaultProfileName = "My First Club";
          storedProfiles = { [defaultProfileName]: defaultProfile };
          
          localStorage.setItem('sm26_profiles', JSON.stringify(storedProfiles));
          localStorage.setItem('sm26_active_profile', defaultProfileName);
          localStorage.removeItem('sm26_saved_tactics');
          localStorage.removeItem('sm26_match_history');
          localStorage.removeItem('sm26_ai_knowledge');
        }
      }
      
      setProfiles(storedProfiles || {});
      const lastActive = localStorage.getItem('sm26_active_profile');
      if (lastActive && storedProfiles?.[lastActive]) {
        setActiveProfile(lastActive);
      }

      const lastUpdateViewed = localStorage.getItem('sm26_update_viewed');
      if (lastUpdateViewed !== APP_UPDATE_VERSION) {
        setIsUpdateModalOpen(true);
      }
    } catch (error) {
      console.error("Failed to load profile data from localStorage", error);
    }
  }, []);

  // Handler to update a part of the active profile's data and save to localStorage
  const updateProfileData = (updatedData: Partial<ProfileData>) => {
    if (!activeProfile) return;
    try {
      const newProfileData = { ...profileData, ...updatedData };
      const newProfiles = { ...profiles, [activeProfile]: newProfileData };
      setProfiles(newProfiles);
      localStorage.setItem('sm26_profiles', JSON.stringify(newProfiles));
    } catch (error) {
      console.error("Failed to save profile data:", error);
      alert("Error: Could not save data. Your browser's storage might be full.");
    }
  };
  
  // Profile Management Handlers
  const handleSelectProfile = (name: string) => {
    setActiveProfile(name);
    localStorage.setItem('sm26_active_profile', name);
    navigator.vibrate?.(50);
  };

  const handleCreateProfile = (name: string) => {
    const newProfiles = { ...profiles, [name]: initialProfileData };
    setProfiles(newProfiles);
    localStorage.setItem('sm26_profiles', JSON.stringify(newProfiles));
    handleSelectProfile(name);
  };
  
  const handleDeleteProfile = (name: string) => {
    if (!window.confirm(`Are you sure you want to delete the profile "${name}"? This cannot be undone.`)) return;
    const newProfiles = { ...profiles };
    delete newProfiles[name];
    setProfiles(newProfiles);
    localStorage.setItem('sm26_profiles', JSON.stringify(newProfiles));
    if (activeProfile === name) {
      setActiveProfile(null);
      localStorage.removeItem('sm26_active_profile');
    }
    navigator.vibrate?.(100);
  };

  const handleSwitchProfile = () => {
    setActiveProfile(null);
    localStorage.removeItem('sm26_active_profile');
    navigator.vibrate?.(50);
  };
  
  const handleExportProfile = (name: string) => {
    navigator.vibrate?.(50);
    const data = profiles[name];
    const jsonString = JSON.stringify(data, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `sm26_profile_${name.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.json`;
    a.click();
    URL.revokeObjectURL(url);
    a.remove();
  };
  
  const handleImportProfile = (file: File) => {
    navigator.vibrate?.(20);
    const reader = new FileReader();
    reader.onload = (event) => {
        try {
            const data = JSON.parse(event.target?.result as string) as ProfileData;
            // Validate data
            if ('savedTactics' in data && 'matchHistory' in data && 'aiKnowledge' in data) {
                let name = file.name.replace(/\.json$/, '').replace(/^sm26_profile_/, '');
                let counter = 1;
                while(profiles[name]) {
                    name = `${name} (${counter++})`;
                }
                const newProfiles = { ...profiles, [name]: { ...initialProfileData, ...data } };
                setProfiles(newProfiles);
                localStorage.setItem('sm26_profiles', JSON.stringify(newProfiles));
            } else {
                alert("Invalid profile file format.");
            }
        } catch (e) {
            alert("Error parsing profile file.");
        }
    };
    reader.readAsText(file);
  };

  // --- Tactic Group Handlers (Rewritten for stability) ---
  const handleCreateTacticGroup = (name: string, tacticNameToMove?: string) => {
    if (!name.trim() || !activeProfile) return;

    const newProfiles = { ...profiles };
    const currentProfile = newProfiles[activeProfile];
    let currentGroups = currentProfile.tacticGroups ? [...currentProfile.tacticGroups] : [];

    // If moving a tactic, first remove it from any existing group
    if (tacticNameToMove) {
        currentGroups = currentGroups.map(group => ({
            ...group,
            tacticNames: group.tacticNames.filter(tn => tn !== tacticNameToMove)
        }));
    }

    const newGroup: TacticGroup = {
        id: `${Date.now()}-${Math.random()}`, // More robust ID
        name: name.trim(),
        tacticNames: tacticNameToMove ? [tacticNameToMove] : []
    };
    
    const updatedGroups = [...currentGroups, newGroup];
    
    newProfiles[activeProfile] = {
        ...currentProfile,
        tacticGroups: updatedGroups
    };
    
    setProfiles(newProfiles);
    localStorage.setItem('sm26_profiles', JSON.stringify(newProfiles));
    triggerVibration();
  };

  const handleDeleteTacticGroup = (groupId: string) => {
    if (!window.confirm("Are you sure you want to delete this group? The tactics inside will not be deleted.") || !activeProfile) return;

    const newProfiles = { ...profiles };
    const currentProfile = newProfiles[activeProfile];
    const updatedGroups = (currentProfile.tacticGroups || []).filter(g => g.id !== groupId);

    newProfiles[activeProfile] = {
        ...currentProfile,
        tacticGroups: updatedGroups,
    };

    setProfiles(newProfiles);
    localStorage.setItem('sm26_profiles', JSON.stringify(newProfiles));
    navigator.vibrate?.(100);
  };

  const handleRenameTacticGroup = (groupId: string, newName: string) => {
    if (!newName.trim()) return;
    const updatedGroups = (profileData.tacticGroups || []).map(g => 
        g.id === groupId ? { ...g, name: newName.trim() } : g
    );
    updateProfileData({ tacticGroups: updatedGroups });
    triggerVibration();
  };
  
  const handleMoveTacticToGroup = (tacticName: string, targetGroupId: string | null) => {
      let updatedGroups = [...(profileData.tacticGroups || [])];
      
      // Remove from all groups first
      updatedGroups = updatedGroups.map(g => ({
          ...g,
          tacticNames: g.tacticNames.filter(name => name !== tacticName)
      }));
        
      // Add to the target group if one is specified
      if(targetGroupId) {
          updatedGroups = updatedGroups.map(g => 
              g.id === targetGroupId 
                  ? { ...g, tacticNames: [...g.tacticNames, tacticName] } 
                  : g
          );
      }
      
      updateProfileData({ tacticGroups: updatedGroups });
      triggerVibration();
  };


  // --- Logic Handlers (adapted from original App.tsx) ---
  const triggerVibration = () => navigator.vibrate?.(50);
  
  const handleSaveTactic = (tactic: DetailedTactic) => {
    const existingTactic = profileData.savedTactics.find(st => st.tacticName === tactic.tacticName);
    if (existingTactic) {
        if (window.confirm(`A tactic with the name "${tactic.tacticName}" already exists. Do you want to overwrite it?`)) {
            const updatedTactics = profileData.savedTactics.map(st => st.tacticName === tactic.tacticName ? tactic : st);
            updateProfileData({ savedTactics: updatedTactics });
        } else if (window.confirm('Do you want to save it as a new version instead? (e.g., v2, v3)')) {
            const baseName = tactic.tacticName.replace(/\s+v\d+(\.\d+)?$/, '').trim();
            let version = 2; let newName = `${baseName} v${version}`;
            while (profileData.savedTactics.some(t => t.tacticName === newName)) { newName = `${baseName} v${++version}`; }
            const newTactic = { ...tactic, tacticName: newName };
            updateProfileData({ savedTactics: [...profileData.savedTactics, newTactic] });
        }
    } else {
        updateProfileData({ savedTactics: [...profileData.savedTactics, tactic] });
    }
    triggerVibration();
  };

  const handleImportTactics = (tacticsToImport: DetailedTactic[]) => {
    let currentTactics = [...profileData.savedTactics];
    const newTacticsToAdd: DetailedTactic[] = [];
    let importedCount = 0;

    tacticsToImport.forEach(tactic => {
        if (!tactic || typeof tactic.tacticName !== 'string') return; // Skip invalid tactic objects

        const tacticName = tactic.tacticName.trim();
        let finalName = tacticName;
        
        // Auto-rename conflicts without prompting
        let version = 2;
        const baseName = tacticName.replace(/\s+v\d+(\.\d+)?$/, '').trim();

        while (currentTactics.some(st => st.tacticName === finalName) || newTacticsToAdd.some(nt => nt.tacticName === finalName)) {
            finalName = `${baseName} v${version++}`;
        }

        const newTactic = { ...tactic, tacticName: finalName, isFavorite: false, ratings: [] };
        newTacticsToAdd.push(newTactic);
        importedCount++;
    });

    if (newTacticsToAdd.length > 0) {
        updateProfileData({ savedTactics: [...currentTactics, ...newTacticsToAdd] });
        alert(`${importedCount} tactic(s) imported successfully!`);
    }
    
    setIsImporterOpen(false);
    triggerVibration();
  };


  const handleImportHistory = (importedMatches: Omit<MatchData, 'id' | 'matchNumber'>[]) => {
    const maxMatchNumber = profileData.matchHistory.length > 0 ? Math.max(...profileData.matchHistory.map(m => m.matchNumber)) : 0;
    const newMatches: MatchData[] = importedMatches.map((match, index) => ({
        ...match, pitchControl: match.pitchControl ?? calculatePitchControl(match), id: new Date().toISOString() + Math.random() + index, matchNumber: maxMatchNumber + 1 + index,
    }));
    updateProfileData({ matchHistory: [...profileData.matchHistory, ...newMatches] });
    setIsHistoryImporterOpen(false);
    triggerVibration();
  };

  const handleDeleteTactic = (tacticName: string) => {
    // Also remove from any groups
    const newGroups = (profileData.tacticGroups || []).map(g => ({
        ...g,
        tacticNames: g.tacticNames.filter(name => name !== tacticName)
    }));
    updateProfileData({ 
        savedTactics: profileData.savedTactics.filter(t => t.tacticName !== tacticName),
        tacticGroups: newGroups
    });
    navigator.vibrate?.(100);
  };
  
  const handleToggleFavoriteTactic = (tacticName: string) => {
    const updatedTactics = profileData.savedTactics.map(t => t.tacticName === tacticName ? { ...t, isFavorite: !t.isFavorite } : t);
    updateProfileData({ savedTactics: updatedTactics });
    navigator.vibrate?.(30);
  };

  const handleAddMatch = (match: Omit<MatchData, 'id' | 'matchNumber'>) => {
    const newMatch: MatchData = {
        ...match, pitchControl: calculatePitchControl(match), id: new Date().toISOString() + Math.random(), matchNumber: profileData.matchHistory.length > 0 ? Math.max(...profileData.matchHistory.map(m => m.matchNumber)) + 1 : 1,
    };
    updateProfileData({ matchHistory: [...profileData.matchHistory, newMatch] });
    triggerVibration();
  };
  
  const handleAddMatches = (matchesToAdd: Omit<MatchData, 'id' | 'matchNumber'>[]) => {
    const maxMatchNumber = profileData.matchHistory.length > 0 ? Math.max(...profileData.matchHistory.map(m => m.matchNumber)) : 0;
    const newMatches: MatchData[] = matchesToAdd.map((match, index) => ({
        ...match, pitchControl: calculatePitchControl(match), id: new Date().toISOString() + Math.random() + index, matchNumber: maxMatchNumber + 1 + index,
    }));
    updateProfileData({ matchHistory: [...profileData.matchHistory, ...newMatches] });
    triggerVibration();
  };

  const handleDeleteMatch = (matchId: string) => {
    updateProfileData({ matchHistory: profileData.matchHistory.filter(match => match.id !== matchId) });
    navigator.vibrate?.(100);
  };

  const handleClearHistory = () => {
      if (window.confirm("Are you sure you want to delete all match history for this profile?")) {
          updateProfileData({ matchHistory: [] });
          navigator.vibrate?.([100, 50, 100]);
      }
  };

  const handleUpdateKnowledge = (newKnowledge: string) => {
    updateProfileData({ aiKnowledge: newKnowledge });
    triggerVibration();
  };

  const handleGenerateKnowledge = async () => {
    if (profileData.matchHistory.length < 5) { alert("Please log at least 5 matches to generate a meaningful knowledge summary."); return; }
    triggerVibration(); setIsGeneratingKnowledge(true);
    try {
      const summary = await synthesizeKnowledge(profileData.matchHistory);
      handleUpdateKnowledge(summary);
    } catch (e) { alert(e instanceof Error ? e.message : "An unknown error occurred."); } finally { setIsGeneratingKnowledge(false); }
  };
  
  const handleExportKnowledge = () => {
    if (!profileData.aiKnowledge) return; triggerVibration();
    const blob = new Blob([profileData.aiKnowledge], { type: 'text/plain' });
    const url = URL.createObjectURL(blob); const a = document.createElement('a'); a.href = url; a.download = 'sm26_ai_knowledge.txt'; document.body.appendChild(a); a.click(); document.body.removeChild(a); URL.revokeObjectURL(url);
  };

  const handleImportKnowledge = (file: File) => {
    navigator.vibrate?.(20); const reader = new FileReader();
    reader.onload = (event) => { const fileContent = event.target?.result as string; if (fileContent) handleUpdateKnowledge(fileContent); else alert('Could not read file.'); };
    reader.onerror = () => alert('Error reading file.'); reader.readAsText(file);
  };

  const handleRateTactic = (tacticName: string, rating: number) => {
    const updatedTactics = profileData.savedTactics.map(t => { if (t.tacticName === tacticName) { return { ...t, ratings: [...(t.ratings || []), rating] }; } return t; });
    updateProfileData({ savedTactics: updatedTactics });
    triggerVibration();
  };
  
  const handleRequestImprovement = async (tactic: DetailedTactic) => {
    navigator.vibrate?.(30); setIsAnalyzingSuggestion(true); setTacticToImprove(tactic); setAnalysisSuggestionError(''); setImprovementSuggestion(null);
    try { const suggestion = await getTacticImprovementSuggestion(tactic, profileData.matchHistory); setImprovementSuggestion(suggestion); } catch (err) { setAnalysisSuggestionError(err instanceof Error ? err.message : "An unknown error occurred."); } finally { setIsAnalyzingSuggestion(false); }
  };

  const handleSaveImprovedTactic = (originalTactic: DetailedTactic, suggestion: TacticImprovementSuggestion) => {
      const newTactic: DetailedTactic = JSON.parse(JSON.stringify(originalTactic));
      newTactic.generalInstructions = mergeInstructionStrings(newTactic.generalInstructions, suggestion.suggestedChanges.general); newTactic.attackInstructions = mergeInstructionStrings(newTactic.attackInstructions, suggestion.suggestedChanges.attack); newTactic.defenceInstructions = mergeInstructionStrings(newTactic.defenceInstructions, suggestion.suggestedChanges.defence); newTactic.keyRoles = mergeInstructionStrings(newTactic.keyRoles, suggestion.suggestedChanges.keyRoles);
      const baseName = originalTactic.tacticName.replace(/\s+v\d+(\.\d+)?$/, '').trim(); let version = 2; let newName = `${baseName} v${version}`;
      while (profileData.savedTactics.some(t => t.tacticName === newName)) { newName = `${baseName} v${++version}`; }
      newTactic.tacticName = newName; newTactic.isFavorite = false; newTactic.ratings = []; newTactic.bestForTips = `Improved based on AI analysis. Original Analysis:\n${suggestion.analysis}\n\nJustification for changes:\n${suggestion.justification}`;
      updateProfileData({ savedTactics: [...profileData.savedTactics, newTactic] });
      triggerVibration();
  };

  const handleCloseUpdateModal = () => { setIsUpdateModalOpen(false); localStorage.setItem('sm26_update_viewed', APP_UPDATE_VERSION); };

  if (!activeProfile) {
    return <ProfileManager profiles={profiles} onSelectProfile={handleSelectProfile} onCreateProfile={handleCreateProfile} onDeleteProfile={handleDeleteProfile} onImportProfile={handleImportProfile} onExportProfile={handleExportProfile} />;
  }

  // --- Main App Render ---
  const { savedTactics, matchHistory, aiKnowledge, tacticGroups } = profileData;
  const allTactics = [...communityTactics, ...savedTactics];
  const allBadges: Badge[] = [
    { id: 'newcomer', name: 'Newcomer', description: 'Saved your first tactic.', icon: '🏆', achieved: savedTactics.length >= 1 },
    { id: 'collector', name: 'Tactic Collector', description: 'Saved 5 different tactics.', icon: '📚', achieved: savedTactics.length >= 5 },
    { id: 'maestro', name: 'Tactical Maestro', description: 'Saved 10 different tactics.', icon: '👑', achieved: savedTactics.length >= 10 },
    { id: 'first_match', name: 'First Match', description: 'Logged your first match result.', icon: '⚽', achieved: matchHistory.length >= 1 },
    { id: 'seasoned', name: 'Seasoned Manager', description: 'Logged 10 match results.', icon: '📊', achieved: matchHistory.length >= 10 },
    { id: 'centurion', name: 'Centurion', description: 'Logged 25 match results.', icon: '📈', achieved: matchHistory.length >= 25 },
  ];
  
  const TabButton: React.FC<{tab: 'dashboard' | 'tactics' | 'tools', label: string, icon: string}> = ({ tab, label, icon }) => (
    <button onClick={() => { setActiveTab(tab); navigator.vibrate?.(20); }} className={`flex-1 py-3 px-2 text-center text-sm sm:text-base font-bold transition-all duration-300 border-b-4 flex items-center justify-center gap-x-2 ${activeTab === tab ? 'text-[var(--color-text-accent)] border-[var(--color-accent-500)]' : 'text-gray-400 hover:text-white border-transparent hover:bg-gray-700/50'}`}>
      <span className="text-xl">{icon}</span> {label}
    </button>
  );

  return (
    <div className="min-h-screen text-gray-200 font-sans">
      <Header activeProfileName={activeProfile} onSwitchProfile={handleSwitchProfile} />
      <nav className="bg-gray-800/80 backdrop-blur-sm sticky top-[73px] z-30 shadow-md">
        <div className="container mx-auto flex">
          <TabButton tab="dashboard" label="Dashboard" icon="🏠" />
          <TabButton tab="tactics" label="Tactics Library" icon="📚" />
          <TabButton tab="tools" label="Analysis & Tools" icon="🛠️" />
        </div>
      </nav>
      <main className="container mx-auto px-4 py-8">
        <div className={activeTab === 'dashboard' ? '' : 'hidden'}>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="space-y-8">
                  <InteractiveAssistant onSaveTactic={handleSaveTactic} matchHistory={matchHistory} knowledge={aiKnowledge} />
                   <KnowledgeManager knowledge={aiKnowledge} isGenerating={isGeneratingKnowledge} onGenerate={handleGenerateKnowledge} onImport={handleImportKnowledge} onExport={handleExportKnowledge} onUpdateKnowledge={handleUpdateKnowledge} />
              </div>
              <MatchPerformanceTracker matchHistory={matchHistory} allTactics={allTactics} onAddMatch={handleAddMatch} onAddMatches={handleAddMatches} onDeleteMatch={handleDeleteMatch} onClearHistory={handleClearHistory} onOpenHistoryImporter={() => { setIsHistoryImporterOpen(true); navigator.vibrate?.(20); }} onUpdateKnowledge={handleUpdateKnowledge} onRequestImprovement={handleRequestImprovement} />
          </div>
        </div>
        <div className={activeTab === 'tactics' ? '' : 'hidden'}><TacticsLibrary communityTactics={communityTactics} savedTactics={savedTactics} onDeleteTactic={handleDeleteTactic} onToggleFavorite={handleToggleFavoriteTactic} onOpenImporter={() => { setIsImporterOpen(true); navigator.vibrate?.(20); }} matchHistory={matchHistory} onSaveTactic={handleSaveTactic} onRateTactic={handleRateTactic} onImproveTactic={handleRequestImprovement} tacticGroups={tacticGroups || []} onCreateTacticGroup={handleCreateTacticGroup} onDeleteTacticGroup={handleDeleteTacticGroup} onRenameTacticGroup={handleRenameTacticGroup} onMoveTacticToGroup={handleMoveTacticToGroup} /></div>
        <div className={activeTab === 'tools' ? '' : 'hidden'}><div className="grid grid-cols-1 lg:grid-cols-2 gap-8"><div className="space-y-8"><FormationPlanner /><PlayerRoleFinder /><ImageAnalyzer /><AudioTranscriber /></div><div className="space-y-8"><TacticOptimizer matchHistory={matchHistory} onSaveTactic={handleSaveTactic} /><Badges allBadges={allBadges} /><TipsSection tips={tips} /><div className="bg-gray-800 rounded-lg shadow-lg p-6"><h2 className="text-2xl font-bold mb-4 text-[var(--color-text-accent)]">Tactics Creation Guide</h2><Accordion>{guideContent.map((item, index) => (<AccordionItem key={index} title={item.title}><div className="space-y-4">{item.content.map((p, i) => (<p key={i}>{p}</p>))}{item.list && (<ul>{item.list.map((li, i) => (<li key={i}>{li}</li>))}</ul>)}</div></AccordionItem>))}</Accordion></div></div></div></div>
      </main>
      <footer className="text-center py-4 mt-8 text-gray-500 text-sm"><p>Built for Soccer Manager Enthusiasts</p></footer>
      {isChatOpen && <ChatBot onClose={() => setIsChatOpen(false)} />}
      <button onClick={() => { setIsChatOpen(!isChatOpen); navigator.vibrate?.(30); }} className="fixed bottom-6 right-6 bg-[var(--color-accent-600)] hover:bg-[var(--color-accent-700)] text-white w-16 h-16 rounded-full shadow-lg flex items-center justify-center z-50 transform transition-transform hover:scale-110" aria-label={isChatOpen ? 'Close Chat' : 'Open Chat'}><svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" viewBox="0 0 20 20" fill="currentColor"><path d="M2 5a2 2 0 012-2h7a2 2 0 012 2v4a2 2 0 01-2 2H9l-3 3v-3H4a2 2 0 01-2-2V5z" /><path d="M15 7v2a4 4 0 01-4 4H9.828l-1.766 1.767c.28.149.599.233.938.233h7a2 2 0 002-2V9a2 2 0 00-2-2h-1z" /></svg></button>
      {isImporterOpen && <TacticImporter onClose={() => setIsImporterOpen(false)} onImport={handleImportTactics} />}
      {isHistoryImporterOpen && <MatchHistoryImporter onClose={() => setIsHistoryImporterOpen(false)} onImport={handleImportHistory} />}
      {isUpdateModalOpen && <UpdateNotification onClose={handleCloseUpdateModal} />}
       {tacticToImprove && (<TacticImprovementModal originalTactic={tacticToImprove} suggestion={improvementSuggestion} isLoading={isAnalyzingSuggestion} error={analysisSuggestionError} onClose={() => setTacticToImprove(null)} onSaveNewVersion={handleSaveImprovedTactic} avgPitchControl={(() => { const matches = matchHistory.filter(m => m.tacticUsed === tacticToImprove.tacticName); if (matches.length === 0) return null; return Math.round(matches.reduce((sum, m) => sum + (m.pitchControl ?? 50), 0) / matches.length); })()} />)}
    </div>
  );
};

export default App;