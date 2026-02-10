import React, { useState, useEffect, useRef } from 'react';
import { Header } from './components/Header';
import { InteractiveAssistant } from './components/InteractiveAssistant';
import { TacticsLibrary } from './components/TacticsTable';
import { TacticImporter } from './components/TacticImporter';
import { MatchHistoryImporter } from './components/MatchHistoryImporter';
import { MatchPerformanceTracker } from './components/MatchPerformanceTracker';
import { UpdateNotification } from './components/UpdateNotification';
import { KnowledgeManager } from './components/KnowledgeManager';
import { ChatBot } from './components/ChatBot';
import { GoogleDriveSync } from './components/GoogleDriveSync';
import { communityTactics } from './constants';
import { synthesizeKnowledge } from './services/geminiService';
import type { DetailedTactic, MatchData, ProfileData, TacticGroup } from './types';

const APP_UPDATE_VERSION = 'v1.6'; // Simplified UI & Group Fix

const initialProfileData: ProfileData = {
  savedTactics: [],
  matchHistory: [],
  aiKnowledge: '',
  tacticGroups: [],
};

const calculatePitchControl = (match: Partial<Omit<MatchData, 'id' | 'matchNumber'>>): number => {
    const wP = 0.25; const wS = 0.20; const wT = 0.20; const wG = 0.25; const wG_extra = 0.10; const w_pen = 0.05; const w_pen_extra = 0.15; const score_scale = 2.0; const boost_scale = 1.0; const penalty_boost_scale = 1.0; const penalty_gen_scale = 2.0; const res_win = 0.08; const res_draw = 0.02; const res_loss = -0.08;
    const { score, possession, shots, shotsOnTarget, opponentPossession, opponentShots, opponentShotsOnTarget } = match;
    let goalsFor = 0; let goalsAgainst = 0;
    if (score) { const scoreParts = score.split('-').map(Number); if (scoreParts.length === 2 && !isNaN(scoreParts[0]) && !isNaN(scoreParts[1])) { goalsFor = scoreParts[0]; goalsAgainst = scoreParts[1]; } }
    const pos_own = possession ?? 50; const pos_opp = opponentPossession ?? (100 - pos_own); const shots_own = shots ?? 0; const shots_opp = opponentShots ?? 0; const sot_own = shotsOnTarget ?? 0; const sot_opp = opponentShotsOnTarget ?? 0;
    const dR = (a: number, b: number) => (a + b === 0) ? 0 : (a - b) / (a + b);
    const dP = dR(pos_own, pos_opp); const dS = dR(shots_own, shots_opp); const dT = dR(sot_own, sot_opp);
    const raw_g = goalsFor - goalsAgainst; const dG_base = Math.tanh(raw_g / score_scale); const boost = Math.tanh(Math.max(0, goalsFor - 2) / boost_scale); const pen_extra = Math.tanh(Math.max(0, goalsAgainst - 2) / penalty_boost_scale); const pen_gen = Math.tanh(goalsAgainst / penalty_gen_scale);
    let res = res_loss; if (goalsFor > goalsAgainst) res = res_win; else if (goalsFor === goalsAgainst) res = res_draw;
    const total = (wP * dP + wS * dS + wT * dT + wG * dG_base) + wG_extra * boost - w_pen * pen_gen - w_pen_extra * pen_extra + res;
    return Math.round(Math.max(0, Math.min(100, 50 * (1 + total))));
};

interface ProfileManagerProps {
  profiles: Record<string, ProfileData>;
  onSelectProfile: (name: string) => void;
  onCreateProfile: (name: string) => void;
  onDeleteProfile: (name: string) => void;
  onImportProfile: (file: File) => void;
  onExportProfile: (name: string) => void;
  onRestoreAll: (data: Record<string, ProfileData>) => void;
}

const ProfileManager: React.FC<ProfileManagerProps> = ({ profiles, onSelectProfile, onCreateProfile, onDeleteProfile, onImportProfile, onExportProfile, onRestoreAll }) => {
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
          <p className="text-[var(--color-text-accent)] mt-2">Tactics Assistant & Backup</p>
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
            <p className="text-center text-gray-400">No profiles found. Create one or sync from Drive.</p>
          )}
        </div>

        <div className="border-t border-gray-700 pt-6">
          <div className="flex gap-x-2 mb-4">
            <input type="text" value={newProfileName} onChange={e => setNewProfileName(e.target.value)} onKeyPress={e => e.key === 'Enter' && handleCreate()} placeholder="New Profile Name" className="flex-1 bg-gray-700 border border-gray-600 rounded-md p-2 text-white placeholder-gray-400" />
            <button onClick={handleCreate} className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-md">Create</button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <button onClick={() => importInputRef.current?.click()} className="bg-gray-600 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded-md text-sm">Import .json File</button>
            <GoogleDriveSync profiles={profiles} onRestore={onRestoreAll} />
          </div>
          <input type="file" ref={importInputRef} accept=".json" onChange={e => e.target.files && onImportProfile(e.target.files[0])} className="hidden" />
        </div>
      </div>
    </div>
  );
};

const App: React.FC = () => {
  const [profiles, setProfiles] = useState<Record<string, ProfileData>>({});
  const [activeProfile, setActiveProfile] = useState<string | null>(null);

  const [isImporterOpen, setIsImporterOpen] = useState(false);
  const [isHistoryImporterOpen, setIsHistoryImporterOpen] = useState(false);
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'dashboard' | 'tactics'>('dashboard');
  const [isGeneratingKnowledge, setIsGeneratingKnowledge] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);

  const profileData = activeProfile ? profiles[activeProfile] : initialProfileData;

  useEffect(() => {
    try {
      const storedProfilesRaw = localStorage.getItem('sm26_profiles');
      let storedProfiles = storedProfilesRaw ? JSON.parse(storedProfilesRaw) : null;

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
        }
      }
      setProfiles(storedProfiles || {});
      const lastActive = localStorage.getItem('sm26_active_profile');
      if (lastActive && storedProfiles?.[lastActive]) setActiveProfile(lastActive);
      const lastUpdateViewed = localStorage.getItem('sm26_update_viewed');
      if (lastUpdateViewed !== APP_UPDATE_VERSION) setIsUpdateModalOpen(true);
    } catch (error) { console.error(error); }
  }, []);

  const updateProfileData = (updatedData: Partial<ProfileData>) => {
    if (!activeProfile) return;
    try {
      const newProfileData = { ...profileData, ...updatedData };
      const newProfiles = { ...profiles, [activeProfile]: newProfileData };
      setProfiles(newProfiles);
      localStorage.setItem('sm26_profiles', JSON.stringify(newProfiles));
    } catch (error) { console.error(error); }
  };

  const handleSelectProfile = (name: string) => { setActiveProfile(name); localStorage.setItem('sm26_active_profile', name); navigator.vibrate?.(50); };
  const handleCreateProfile = (name: string) => {
    const newProfiles = { ...profiles, [name]: { ...initialProfileData, tacticGroups: [] } };
    setProfiles(newProfiles);
    localStorage.setItem('sm26_profiles', JSON.stringify(newProfiles));
    handleSelectProfile(name);
  };
  const handleDeleteProfile = (name: string) => {
    if (!window.confirm(`Delete profile "${name}"?`)) return;
    const newProfiles = { ...profiles };
    delete newProfiles[name];
    setProfiles(newProfiles);
    localStorage.setItem('sm26_profiles', JSON.stringify(newProfiles));
    if (activeProfile === name) { setActiveProfile(null); localStorage.removeItem('sm26_active_profile'); }
  };
  const handleSwitchProfile = () => { setActiveProfile(null); localStorage.removeItem('sm26_active_profile'); };
  const handleExportProfile = (name: string) => {
    const jsonString = JSON.stringify(profiles[name], null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = `sm26_profile_${name}.json`; a.click();
  };
  const handleImportProfile = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target?.result as string);
        let name = file.name.replace(/\.json$/, '');
        let counter = 1; let finalName = name;
        while(profiles[finalName]) finalName = `${name} (${counter++})`;
        const newProfiles = { ...profiles, [finalName]: { ...initialProfileData, ...data } };
        setProfiles(newProfiles); localStorage.setItem('sm26_profiles', JSON.stringify(newProfiles));
      } catch { alert("Invalid file"); }
    };
    reader.readAsText(file);
  };
  const handleRestoreAll = (data: Record<string, ProfileData>) => {
    setProfiles(data);
    localStorage.setItem('sm26_profiles', JSON.stringify(data));
    alert("Profiles synced and restored successfully!");
  };

  const handleSaveTactic = (tactic: DetailedTactic) => {
    const existing = profileData.savedTactics.find(st => st.tacticName === tactic.tacticName);
    if (existing && !window.confirm(`Overwrite "${tactic.tacticName}"?`)) return;
    const updated = existing 
      ? profileData.savedTactics.map(st => st.tacticName === tactic.tacticName ? tactic : st)
      : [...profileData.savedTactics, tactic];
    updateProfileData({ savedTactics: updated });
  };
  const handleImportTactics = (tacticsToImport: DetailedTactic[]) => {
    let current = [...profileData.savedTactics];
    tacticsToImport.forEach(t => {
      let name = t.tacticName; let v = 2;
      while(current.some(st => st.tacticName === name)) name = `${t.tacticName} v${v++}`;
      current.push({ ...t, tacticName: name });
    });
    updateProfileData({ savedTactics: current });
    setIsImporterOpen(false);
  };
  const handleImportHistory = (importedMatches: Omit<MatchData, 'id' | 'matchNumber'>[]) => {
    const maxNum = matchHistory.length > 0 ? Math.max(...matchHistory.map(m => m.matchNumber)) : 0;
    const newMatches = importedMatches.map((m, i) => ({ ...m, pitchControl: m.pitchControl ?? calculatePitchControl(m), id: Date.now() + Math.random().toString(), matchNumber: maxNum + 1 + i }));
    updateProfileData({ matchHistory: [...matchHistory, ...newMatches] });
    setIsHistoryImporterOpen(false);
  };
  const handleDeleteTactic = (name: string) => {
    const updatedTactics = profileData.savedTactics.filter(t => t.tacticName !== name);
    const updatedGroups = (profileData.tacticGroups || []).map(g => ({
      ...g,
      tacticNames: g.tacticNames.filter(n => n !== name)
    }));
    updateProfileData({ savedTactics: updatedTactics, tacticGroups: updatedGroups });
  };
  const handleToggleFavoriteTactic = (name: string) => updateProfileData({ savedTactics: profileData.savedTactics.map(t => t.tacticName === name ? { ...t, isFavorite: !t.isFavorite } : t) });
  const handleAddMatch = (match: Omit<MatchData, 'id' | 'matchNumber'>) => {
    const newMatch = { ...match, pitchControl: calculatePitchControl(match), id: Date.now() + Math.random().toString(), matchNumber: matchHistory.length + 1 };
    updateProfileData({ matchHistory: [...matchHistory, newMatch] });
  };
  const handleDeleteMatch = (id: string) => updateProfileData({ matchHistory: profileData.matchHistory.filter(m => m.id !== id) });
  const handleGenerateKnowledge = async () => {
    if (matchHistory.length < 5) { alert("Min 5 matches required"); return; }
    setIsGeneratingKnowledge(true);
    try { const s = await synthesizeKnowledge(matchHistory); updateProfileData({ aiKnowledge: s }); }
    finally { setIsGeneratingKnowledge(false); }
  };
  const handleRateTactic = (name: string, r: number) => updateProfileData({ savedTactics: profileData.savedTactics.map(t => t.tacticName === name ? { ...t, ratings: [...(t.ratings || []), r] } : t) });

  // Tactic Group Management
  const handleCreateTacticGroup = (name: string, tacticNameToMove?: string) => {
    const newGroup: TacticGroup = {
      id: Date.now().toString(),
      name,
      tacticNames: tacticNameToMove ? [tacticNameToMove] : []
    };
    const updatedGroups = [...(profileData.tacticGroups || []), newGroup];
    updateProfileData({ tacticGroups: updatedGroups });
  };

  const handleDeleteTacticGroup = (groupId: string) => {
    const updatedGroups = (profileData.tacticGroups || []).filter(g => g.id !== groupId);
    updateProfileData({ tacticGroups: updatedGroups });
  };

  const handleRenameTacticGroup = (groupId: string, newName: string) => {
    const updatedGroups = (profileData.tacticGroups || []).map(g => g.id === groupId ? { ...g, name: newName } : g);
    updateProfileData({ tacticGroups: updatedGroups });
  };

  const handleMoveTacticToGroup = (tacticName: string, groupId: string | null) => {
    // Remove from all groups first
    let updatedGroups = (profileData.tacticGroups || []).map(g => ({
      ...g,
      tacticNames: g.tacticNames.filter(name => name !== tacticName)
    }));
    
    // Add to the new group if groupId is provided
    if (groupId) {
      updatedGroups = updatedGroups.map(g => g.id === groupId ? { ...g, tacticNames: [...g.tacticNames, tacticName] } : g);
    }
    
    updateProfileData({ tacticGroups: updatedGroups });
  };

  if (!activeProfile) return <ProfileManager profiles={profiles} onSelectProfile={handleSelectProfile} onCreateProfile={handleCreateProfile} onDeleteProfile={handleDeleteProfile} onImportProfile={handleImportProfile} onExportProfile={handleExportProfile} onRestoreAll={handleRestoreAll} />;

  const { savedTactics, matchHistory, aiKnowledge, tacticGroups } = profileData;
  const allTactics = [...communityTactics, ...savedTactics];

  return (
    <div className="min-h-screen text-gray-200 font-sans">
      <Header activeProfileName={activeProfile} onSwitchProfile={handleSwitchProfile} />
      <nav className="bg-gray-800/80 backdrop-blur-sm sticky top-[73px] z-30 shadow-md">
        <div className="container mx-auto flex">
          <button onClick={() => setActiveTab('dashboard')} className={`flex-1 py-3 text-center text-sm font-bold border-b-4 ${activeTab === 'dashboard' ? 'text-[var(--color-text-accent)] border-[var(--color-accent-500)]' : 'text-gray-400'}`}>🏠 Dashboard</button>
          <button onClick={() => setActiveTab('tactics')} className={`flex-1 py-3 text-center text-sm font-bold border-b-4 ${activeTab === 'tactics' ? 'text-[var(--color-text-accent)] border-[var(--color-accent-500)]' : 'text-gray-400'}`}>📚 Tactics</button>
        </div>
      </nav>
      <main className="container mx-auto px-4 py-8">
        <div className={activeTab === 'dashboard' ? '' : 'hidden'}>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <InteractiveAssistant onSaveTactic={handleSaveTactic} matchHistory={matchHistory} knowledge={aiKnowledge} />
            <div className="space-y-8">
              <MatchPerformanceTracker matchHistory={matchHistory} allTactics={allTactics} onAddMatch={handleAddMatch} onDeleteMatch={handleDeleteMatch} onClearHistory={() => updateProfileData({ matchHistory: [] })} onUpdateKnowledge={(k) => updateProfileData({ aiKnowledge: k })} onAddMatches={(ms) => handleImportHistory(ms)} onOpenHistoryImporter={() => setIsHistoryImporterOpen(true)} onRequestImprovement={() => {}} />
              <KnowledgeManager knowledge={aiKnowledge} isGenerating={isGeneratingKnowledge} onGenerate={handleGenerateKnowledge} onImport={(f) => handleImportProfile(f)} onExport={() => handleExportProfile(activeProfile)} onUpdateKnowledge={(k) => updateProfileData({ aiKnowledge: k })} />
            </div>
          </div>
        </div>
        <div className={activeTab === 'tactics' ? '' : 'hidden'}>
          <TacticsLibrary communityTactics={communityTactics} savedTactics={savedTactics} onDeleteTactic={handleDeleteTactic} onToggleFavorite={handleToggleFavoriteTactic} onOpenImporter={() => setIsImporterOpen(true)} matchHistory={matchHistory} onSaveTactic={handleSaveTactic} onRateTactic={handleRateTactic} onImproveTactic={() => {}} tacticGroups={tacticGroups || []} onCreateTacticGroup={handleCreateTacticGroup} onDeleteTacticGroup={handleDeleteTacticGroup} onRenameTacticGroup={handleRenameTacticGroup} onMoveTacticToGroup={handleMoveTacticToGroup} />
        </div>
      </main>
      {isChatOpen && <ChatBot profileContext={profileData} onClose={() => setIsChatOpen(false)} />}
      <button onClick={() => setIsChatOpen(!isChatOpen)} className="fixed bottom-6 right-6 bg-[var(--color-accent-600)] hover:bg-[var(--color-accent-700)] text-white w-16 h-16 rounded-full shadow-lg flex items-center justify-center z-50 transition-transform hover:scale-110" aria-label="Chat"><svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" viewBox="0 0 20 20" fill="currentColor"><path d="M2 5a2 2 0 012-2h7a2 2 0 012 2v4a2 2 0 01-2 2H9l-3 3v-3H4a2 2 0 01-2-2V5z" /></svg></button>
      {isImporterOpen && <TacticImporter onClose={() => setIsImporterOpen(false)} onImport={handleImportTactics} />}
      {isHistoryImporterOpen && <MatchHistoryImporter onClose={() => setIsHistoryImporterOpen(false)} onImport={handleImportHistory} />}
      {isUpdateModalOpen && <UpdateNotification onClose={() => { setIsUpdateModalOpen(false); localStorage.setItem('sm26_update_viewed', APP_UPDATE_VERSION); }} />}
    </div>
  );
};

export default App;