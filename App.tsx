import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { InteractiveAssistant } from './components/InteractiveAssistant';
import { Accordion, AccordionItem } from './components/Accordion';
import { TacticsLibrary } from './components/TacticsTable';
import { TipsSection } from './components/TipsSection';
import { TacticImporter } from './components/TacticImporter';
import { MatchHistoryImporter } from './components/MatchHistoryImporter';
import { MatchPerformanceTracker } from './components/MatchPerformanceTracker';
import { FormationPlanner } from './components/FormationPlanner';
import { MatchPredictor } from './components/MatchPredictor';
import { Badges } from './components/Badges';
import { UpdateNotification } from './components/UpdateNotification';
import { PlayerRoleFinder } from './components/PlayerRoleFinder';
import { KnowledgeManager } from './components/KnowledgeManager';
import { guideContent, communityTactics, tips } from './constants';
import { synthesizeKnowledge } from './services/geminiService';
import type { DetailedTactic, MatchData, Badge, TacticImprovementSuggestion } from './types';

const APP_UPDATE_VERSION = 'v1.2'; // Increment to show update modal again

type Tab = 'dashboard' | 'tactics' | 'tools';

const App: React.FC = () => {
  const [savedTactics, setSavedTactics] = useState<DetailedTactic[]>([]);
  const [matchHistory, setMatchHistory] = useState<MatchData[]>([]);
  const [isImporterOpen, setIsImporterOpen] = useState(false);
  const [isHistoryImporterOpen, setIsHistoryImporterOpen] = useState(false);
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<Tab>('dashboard');
  const [aiKnowledge, setAiKnowledge] = useState<string>('');
  const [isGeneratingKnowledge, setIsGeneratingKnowledge] = useState(false);

  useEffect(() => {
    try {
      const storedTactics = localStorage.getItem('sm26_saved_tactics');
      if (storedTactics) {
        setSavedTactics(JSON.parse(storedTactics));
      }
      const storedHistory = localStorage.getItem('sm26_match_history');
      if (storedHistory) {
        setMatchHistory(JSON.parse(storedHistory));
      }
      const storedKnowledge = localStorage.getItem('sm26_ai_knowledge');
      if (storedKnowledge) {
        setAiKnowledge(storedKnowledge);
      }

      const lastUpdateViewed = localStorage.getItem('sm26_update_viewed');
      if (lastUpdateViewed !== APP_UPDATE_VERSION) {
        setIsUpdateModalOpen(true);
      }
    } catch (error)
      {
      console.error("Failed to load data from localStorage", error);
    }
  }, []);

  const handleCloseUpdateModal = () => {
    setIsUpdateModalOpen(false);
    localStorage.setItem('sm26_update_viewed', APP_UPDATE_VERSION);
  };

  const triggerVibration = () => navigator.vibrate?.(50);

  const handleSaveTactic = (tactic: DetailedTactic) => {
    if (savedTactics.some(st => st.tacticName === tactic.tacticName)) {
      alert(`A tactic with the name "${tactic.tacticName}" already exists. Please choose a different name.`);
      return;
    }
    const updatedTactics = [...savedTactics, tactic];
    setSavedTactics(updatedTactics);
    localStorage.setItem('sm26_saved_tactics', JSON.stringify(updatedTactics));
    triggerVibration();
  };

  const handleImportTactic = (tactic: DetailedTactic) => {
    handleSaveTactic(tactic);
    setIsImporterOpen(false);
  };

  const handleImportHistory = (importedMatches: Omit<MatchData, 'id' | 'matchNumber'>[]) => {
    const maxMatchNumber = matchHistory.length > 0 ? Math.max(...matchHistory.map(m => m.matchNumber)) : 0;
    const newMatches: MatchData[] = importedMatches.map((match, index) => ({
        ...match,
        id: new Date().toISOString() + Math.random() + index,
        matchNumber: maxMatchNumber + 1 + index,
    }));

    const updatedHistory = [...matchHistory, ...newMatches];
    setMatchHistory(updatedHistory);
    localStorage.setItem('sm26_match_history', JSON.stringify(updatedHistory));
    setIsHistoryImporterOpen(false);
    triggerVibration();
  };


  const handleDeleteTactic = (tacticName: string) => {
    const updatedTactics = savedTactics.filter(t => t.tacticName !== tacticName);
    setSavedTactics(updatedTactics);
    localStorage.setItem('sm26_saved_tactics', JSON.stringify(updatedTactics));
    navigator.vibrate?.(100);
  };

  const handleToggleFavoriteTactic = (tacticName: string) => {
    const updatedTactics = savedTactics.map(t => 
      t.tacticName === tacticName ? { ...t, isFavorite: !t.isFavorite } : t
    );
    setSavedTactics(updatedTactics);
    localStorage.setItem('sm26_saved_tactics', JSON.stringify(updatedTactics));
    navigator.vibrate?.(30);
  };

  const handleAddMatch = (match: Omit<MatchData, 'id' | 'matchNumber'>) => {
    const newMatch: MatchData = {
        ...match,
        id: new Date().toISOString() + Math.random(),
        matchNumber: matchHistory.length > 0 ? Math.max(...matchHistory.map(m => m.matchNumber)) + 1 : 1,
    };
    const updatedHistory = [...matchHistory, newMatch];
    setMatchHistory(updatedHistory);
    localStorage.setItem('sm26_match_history', JSON.stringify(updatedHistory));
    triggerVibration();
  };

  const handleAddMatches = (matchesToAdd: Omit<MatchData, 'id' | 'matchNumber'>[]) => {
    const maxMatchNumber = matchHistory.length > 0 ? Math.max(...matchHistory.map(m => m.matchNumber)) : 0;
    const newMatches: MatchData[] = matchesToAdd.map((match, index) => ({
        ...match,
        id: new Date().toISOString() + Math.random() + index,
        matchNumber: maxMatchNumber + 1 + index,
    }));

    const updatedHistory = [...matchHistory, ...newMatches];
    setMatchHistory(updatedHistory);
    localStorage.setItem('sm26_match_history', JSON.stringify(updatedHistory));
    triggerVibration();
  };

  const handleDeleteMatch = (matchId: string) => {
    const updatedHistory = matchHistory.filter(match => match.id !== matchId);
    setMatchHistory(updatedHistory);
    localStorage.setItem('sm26_match_history', JSON.stringify(updatedHistory));
    navigator.vibrate?.(100);
  };

  const handleClearHistory = () => {
      if (window.confirm("Are you sure you want to delete all match history? This action cannot be undone.")) {
          setMatchHistory([]);
          localStorage.removeItem('sm26_match_history');
          navigator.vibrate?.([100, 50, 100]);
      }
  };

  const handleUpdateKnowledge = (newKnowledge: string) => {
    setAiKnowledge(newKnowledge);
    localStorage.setItem('sm26_ai_knowledge', newKnowledge);
    triggerVibration();
  };

  const handleGenerateKnowledge = async () => {
    if (matchHistory.length < 5) {
      alert("Please log at least 5 matches to generate a meaningful knowledge summary.");
      return;
    }
    triggerVibration();
    setIsGeneratingKnowledge(true);
    try {
      const summary = await synthesizeKnowledge(matchHistory);
      handleUpdateKnowledge(summary);
    } catch (e) {
      console.error("Failed to generate knowledge", e);
      alert(e instanceof Error ? e.message : "An unknown error occurred while generating knowledge.");
    } finally {
      setIsGeneratingKnowledge(false);
    }
  };

  const handleExportKnowledge = () => {
    if (!aiKnowledge) return;
    triggerVibration();
    const blob = new Blob([aiKnowledge], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'sm26_ai_knowledge.txt';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleImportKnowledge = (file: File) => {
    navigator.vibrate?.(20);
    const reader = new FileReader();
    reader.onload = (event) => {
      const fileContent = event.target?.result as string;
      if (fileContent) {
        handleUpdateKnowledge(fileContent);
      } else {
        alert('Could not read the file.');
      }
    };
    reader.onerror = () => {
        alert('Error reading the file.');
    };
    reader.readAsText(file);
  };

  const handleSaveTacticVersion = (originalTactic: DetailedTactic, suggestion: TacticImprovementSuggestion) => {
    triggerVibration();

    const applyTacticChanges = (tactic: DetailedTactic, changes: TacticImprovementSuggestion): DetailedTactic => {
        const newTactic = JSON.parse(JSON.stringify(tactic));
        const { general, attack, defence, keyRoles } = changes.suggestedChanges;

        const instructionChangeRegex = /change\s+([\w\s]+)\s+from\s+.+?\s+to\s+([\w\s\d.-]+)/i;
        
        const applyInstructionChange = (instructionString: string, change: string | undefined): string => {
            if (!change) return instructionString;
            
            const match = change.match(instructionChangeRegex);
            if (!match) return instructionString;
            
            const [, rawInstructionName, rawNewValue] = match;
            const instructionName = rawInstructionName.trim();
            const newValue = rawNewValue.trim().replace(/[.,]$/, '');

            const instructions: Record<string, string> = {};
            const originalKeys: string[] = [];
            instructionString.split(';').forEach(part => {
                const separatorIndex = part.indexOf(':');
                if (separatorIndex > -1) {
                    const key = part.substring(0, separatorIndex).trim();
                    const value = part.substring(separatorIndex + 1).trim();
                    if (key) {
                        instructions[key] = value;
                        originalKeys.push(key);
                    }
                }
            });

            const keyToUpdate = Object.keys(instructions).find(k => k.toLowerCase() === instructionName.toLowerCase());

            if (keyToUpdate) {
                instructions[keyToUpdate] = newValue;
            } else {
                console.warn(`Could not find instruction key for "${instructionName}" in "${instructionString}"`);
                return instructionString;
            }

            return originalKeys.map(key => `${key}: ${instructions[key]}`).join('; ');
        };

        newTactic.generalInstructions = applyInstructionChange(newTactic.generalInstructions, general);
        newTactic.attackInstructions = applyInstructionChange(newTactic.attackInstructions, attack);
        newTactic.defenceInstructions = applyInstructionChange(newTactic.defenceInstructions, defence);

        const roleChangeRegex = /switch\s+([\w\s-]+)\s+to\s+a?\s*([\w\s-]+)/i;
        if (keyRoles) {
            const match = keyRoles.match(roleChangeRegex);
            if (match) {
                const [, rawOldRole, rawNewRole] = match;
                const oldRole = rawOldRole.trim().replace(/[.,]$/, '');
                const newRole = rawNewRole.trim().replace(/[.,]$/, '');
                
                let isReplaced = false;

                if (newTactic.keyRoles.includes(oldRole)) {
                    newTactic.keyRoles = newTactic.keyRoles.replace(oldRole, newRole);
                    isReplaced = true;
                } else {
                    const oldRoleShort = oldRole.replace(/\s+(?:midfielder|defender|forward|keeper|striker)$/i, '').trim();
                    if (oldRoleShort !== oldRole && newTactic.keyRoles.includes(oldRoleShort)) {
                        newTactic.keyRoles = newTactic.keyRoles.replace(oldRoleShort, newRole);
                        isReplaced = true;
                    }
                }

                if (!isReplaced) {
                     console.warn(`Could not apply role change for "${oldRole}"`);
                }
            }
        }
        return newTactic;
    };

    const modifiedTactic = applyTacticChanges(originalTactic, suggestion);

    const baseName = originalTactic.tacticName.replace(/\s+v\d+(\.\d+)?$/, '');
    let version = 2;
    let newName = `${baseName} v${version}`;

    const existingNames = savedTactics.map(t => t.tacticName);
    while (existingNames.includes(newName)) {
        version++;
        newName = `${baseName} v${version}`;
    }

    modifiedTactic.tacticName = newName;
    handleSaveTactic(modifiedTactic);
  };
  
  const allTactics = [...communityTactics, ...savedTactics];

  const allBadges: Badge[] = [
    { id: 'newcomer', name: 'Newcomer', description: 'Saved your first tactic.', icon: '🏆', achieved: savedTactics.length >= 1 },
    { id: 'collector', name: 'Tactic Collector', description: 'Saved 5 different tactics.', icon: '📚', achieved: savedTactics.length >= 5 },
    { id: 'maestro', name: 'Tactical Maestro', description: 'Saved 10 different tactics.', icon: '👑', achieved: savedTactics.length >= 10 },
    { id: 'first_match', name: 'First Match', description: 'Logged your first match result.', icon: '⚽', achieved: matchHistory.length >= 1 },
    { id: 'seasoned', name: 'Seasoned Manager', description: 'Logged 10 match results.', icon: '📊', achieved: matchHistory.length >= 10 },
    { id: 'centurion', name: 'Centurion', description: 'Logged 25 match results.', icon: '📈', achieved: matchHistory.length >= 25 },
  ];
  
  const TabButton: React.FC<{tab: Tab, label: string, icon: string}> = ({ tab, label, icon }) => (
    <button
      onClick={() => {
        setActiveTab(tab);
        navigator.vibrate?.(20);
      }}
      className={`flex-1 py-3 px-2 text-center text-sm sm:text-base font-bold transition-all duration-300 border-b-4 flex items-center justify-center gap-x-2 ${
        activeTab === tab 
          ? 'text-[var(--color-text-accent)] border-[var(--color-accent-500)]' 
          : 'text-gray-400 hover:text-white border-transparent hover:bg-gray-700/50'
      }`}
    >
      <span className="text-xl">{icon}</span> {label}
    </button>
  );

  return (
    <div className="min-h-screen text-gray-200 font-sans">
      <Header />
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
            <InteractiveAssistant onSaveTactic={handleSaveTactic} matchHistory={matchHistory} knowledge={aiKnowledge} />
            <MatchPerformanceTracker
              matchHistory={matchHistory}
              allTactics={allTactics}
              onAddMatch={handleAddMatch}
              onAddMatches={handleAddMatches}
              onDeleteMatch={handleDeleteMatch}
              onClearHistory={handleClearHistory}
              onOpenHistoryImporter={() => {
                setIsHistoryImporterOpen(true);
                navigator.vibrate?.(20);
              }}
              onSaveNewVersion={handleSaveTacticVersion}
            />
          </div>
        </div>

        <div className={activeTab === 'tactics' ? '' : 'hidden'}>
          <TacticsLibrary 
            communityTactics={communityTactics}
            savedTactics={savedTactics}
            onDeleteTactic={handleDeleteTactic}
            onToggleFavorite={handleToggleFavoriteTactic}
            onOpenImporter={() => {
              setIsImporterOpen(true);
              navigator.vibrate?.(20);
            }}
          />
        </div>

        <div className={activeTab === 'tools' ? '' : 'hidden'}>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="space-y-8">
                <FormationPlanner />
                <PlayerRoleFinder />
                <KnowledgeManager
                    knowledge={aiKnowledge}
                    isGenerating={isGeneratingKnowledge}
                    onGenerate={handleGenerateKnowledge}
                    onImport={handleImportKnowledge}
                    onExport={handleExportKnowledge}
                />
              </div>
              <div className="space-y-8">
                <MatchPredictor />
                <Badges allBadges={allBadges} />
                <TipsSection tips={tips} />
                <div className="bg-gray-800 rounded-lg shadow-lg p-6">
                    <h2 className="text-2xl font-bold mb-4 text-[var(--color-text-accent)]">Tactics Creation Guide</h2>
                    <Accordion>
                        {guideContent.map((item, index) => (
                        <AccordionItem key={index} title={item.title}>
                            <div className="space-y-4">
                            {item.content.map((paragraph, pIndex) => (
                                <p key={pIndex} className="text-gray-300 leading-relaxed">{paragraph}</p>
                            ))}
                            {item.list && (
                                <ul className="list-disc list-inside space-y-2 pl-4 text-gray-300">
                                {item.list.map((listItem, lIndex) => (
                                    <li key={lIndex}>{listItem}</li>
                                ))}
                                </ul>
                            )}
                            </div>
                        </AccordionItem>
                        ))}
                    </Accordion>
                </div>
              </div>
          </div>
        </div>
      </main>
      <footer className="text-center py-4 mt-8 text-gray-500 text-sm">
        <p>Built for Soccer Manager Enthusiasts</p>
      </footer>
      {isImporterOpen && (
        <TacticImporter 
          onClose={() => setIsImporterOpen(false)}
          onImport={handleImportTactic}
        />
      )}
      {isHistoryImporterOpen && (
        <MatchHistoryImporter
            onClose={() => setIsHistoryImporterOpen(false)}
            onImport={handleImportHistory}
        />
      )}
      {isUpdateModalOpen && <UpdateNotification onClose={handleCloseUpdateModal} />}
    </div>
  );
};

export default App;