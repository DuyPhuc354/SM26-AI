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
import type { DetailedTactic, MatchData, Badge, TacticImprovementSuggestion } from './types';

// Helper for normalized difference, mirroring the Python `delta_ratio`
const deltaRatio = (a: number | undefined, b: number | undefined): number => {
    const valA = a ?? 0;
    const valB = b ?? 0;
    if (valA + valB === 0) return 0.0;
    return (valA - valB) / (valA + valB);
};

// New PCI calculation based on user's Python code
const calculatePitchControl = (match: Partial<Omit<MatchData, 'id' | 'matchNumber'>>): number => {
    // --- New weights and scales from user's python code ---
    const wP = 0.25;
    const wS = 0.20;
    const wT = 0.20;
    const wG = 0.25;
    const wG_extra = 0.10;
    const w_pen = 0.05;
    const w_pen_extra = 0.15;

    const score_scale = 2.0;
    const boost_scale = 1.0;
    const penalty_boost_scale = 1.0;
    const penalty_gen_scale = 2.0;
    
    const res_win = 0.08;
    const res_draw = 0.02;
    const res_loss = -0.08;

    const {
        score,
        possession,
        shots,
        shotsOnTarget,
        opponentPossession,
        opponentShots,
        opponentShotsOnTarget
    } = match;

    // 1. Parse score to get GF (goalsFor) and GA (goalsAgainst)
    let goalsFor = 0;
    let goalsAgainst = 0;
    if (score) {
        const scoreParts = score.split('-').map(Number);
        if (scoreParts.length === 2 && !isNaN(scoreParts[0]) && !isNaN(scoreParts[1])) {
            goalsFor = scoreParts[0];
            goalsAgainst = scoreParts[1];
        }
    }

    // 2. Prepare stat pairs with fallbacks
    const pos_own = possession ?? 50;
    const pos_opp = opponentPossession ?? (100 - pos_own);
    const shots_own = shots ?? 0;
    const shots_opp = opponentShots ?? 0;
    const sot_own = shotsOnTarget ?? 0;
    const sot_opp = opponentShotsOnTarget ?? 0;

    // 3. Calculate deltas
    const dP = deltaRatio(pos_own, pos_opp);
    const dS = deltaRatio(shots_own, shots_opp);
    const dT = deltaRatio(sot_own, sot_opp);

    // 4. New calculations based on user's formula
    const raw_g = goalsFor - goalsAgainst;
    // base goal advantage bounded
    const dG_base = Math.tanh(raw_g / score_scale);
    
    // extra boost if GF >= 3 (activation at GF>2)
    const boost = Math.tanh(Math.max(0, goalsFor - 2) / boost_scale);

    // extra penalty if GA >= 3
    const pen_extra = Math.tanh(Math.max(0, goalsAgainst - 2) / penalty_boost_scale);
    
    // general penalty from any goals conceded (smooth)
    const pen_gen = Math.tanh(goalsAgainst / penalty_gen_scale);

    // result term
    let res = 0;
    if (goalsFor > goalsAgainst) {
        res = res_win;
    } else if (goalsFor === goalsAgainst) {
        res = res_draw;
    } else {
        res = res_loss;
    }

    // 5. Calculate weighted sum
    const base = wP * dP + wS * dS + wT * dT + wG * dG_base;
    const total = base + wG_extra * boost - w_pen * pen_gen - w_pen_extra * pen_extra + res;

    // 6. Final PCI calculation
    const pci = 50 * (1 + total);

    // Clamp the result between 0 and 100 for safety and return as an integer
    return Math.round(Math.max(0, Math.min(100, pci)));
};


// A more robust helper function to merge instruction strings.
const mergeInstructionStrings = (original: string, changes: string | undefined): string => {
  if (!changes || changes.trim() === '') {
    return original;
  }

  const instructionToMap = (str: string): Map<string, string> => {
    const map = new Map<string, string>();
    if (!str) return map;

    str.split(';').forEach(part => {
      const trimmedPart = part.trim();
      if (trimmedPart) {
        const separatorIndex = trimmedPart.indexOf(':');
        if (separatorIndex > 0) { // Key cannot be empty
          const key = trimmedPart.substring(0, separatorIndex).trim();
          const value = trimmedPart.substring(separatorIndex + 1).trim();
          if (key && value) {
            map.set(key, value);
          }
        }
      }
    });
    return map;
  };

  const originalMap = instructionToMap(original);
  const changesMap = instructionToMap(changes);

  changesMap.forEach((value, key) => {
    originalMap.set(key, value);
  });

  return Array.from(originalMap.entries())
    .map(([key, value]) => `${key}: ${value}`)
    .join('; ');
};


const APP_UPDATE_VERSION = 'v1.3'; // Increment to show update modal again

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
  const [isChatOpen, setIsChatOpen] = useState(false);
  
  // State for Tactic Improvement Modal
  const [tacticToImprove, setTacticToImprove] = useState<DetailedTactic | null>(null);
  const [improvementSuggestion, setImprovementSuggestion] = useState<TacticImprovementSuggestion | null>(null);
  const [isAnalyzingSuggestion, setIsAnalyzingSuggestion] = useState(false);
  const [analysisSuggestionError, setAnalysisSuggestionError] = useState('');


  useEffect(() => {
    try {
      const storedTactics = localStorage.getItem('sm26_saved_tactics');
      if (storedTactics) {
        setSavedTactics(JSON.parse(storedTactics));
      }
      const storedHistory = localStorage.getItem('sm26_match_history');
      if (storedHistory) {
        let history: MatchData[] = JSON.parse(storedHistory);
        let wasUpdated = false;
        // Migration to calculate pitchControl for old entries
        history = history.map(match => {
            const oldPitchControl = match.pitchControl;
            const newPitchControl = calculatePitchControl(match);
            if (oldPitchControl !== newPitchControl) {
                 wasUpdated = true;
                 return { ...match, pitchControl: newPitchControl };
            }
            return match;
        });
        setMatchHistory(history);
        if (wasUpdated) {
            localStorage.setItem('sm26_match_history', JSON.stringify(history));
        }
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
    const existingTactic = savedTactics.find(st => st.tacticName === tactic.tacticName);

    if (existingTactic) {
        if (window.confirm(`A tactic with the name "${tactic.tacticName}" already exists. Do you want to overwrite it?`)) {
            // Overwrite
            const updatedTactics = savedTactics.map(st => st.tacticName === tactic.tacticName ? tactic : st);
            setSavedTactics(updatedTactics);
            localStorage.setItem('sm26_saved_tactics', JSON.stringify(updatedTactics));
            triggerVibration();
        } else if (window.confirm('Do you want to save it as a new version instead? (e.g., v2, v3)')) {
            // Save as new version
            const baseName = tactic.tacticName.replace(/\s+v\d+(\.\d+)?$/, '').trim();
            let version = 2;
            let newName = `${baseName} v${version}`;

            const existingNames = savedTactics.map(t => t.tacticName);
            while (existingNames.includes(newName)) {
                version++;
                newName = `${baseName} v${version}`;
            }
            
            const newTactic = { ...tactic, tacticName: newName };
            const updatedTactics = [...savedTactics, newTactic];
            setSavedTactics(updatedTactics);
            localStorage.setItem('sm26_saved_tactics', JSON.stringify(updatedTactics));
            triggerVibration();
        }
        return; // Either way, we stop here.
    }

    // Tactic does not exist, save normally.
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
        pitchControl: match.pitchControl ?? calculatePitchControl(match), // Calculate if missing
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
        pitchControl: calculatePitchControl(match),
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
        pitchControl: calculatePitchControl(match),
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

  const handleRateTactic = (tacticName: string, rating: number) => {
    const updatedTactics = savedTactics.map(t => {
        if (t.tacticName === tacticName) {
            const newRatings = [...(t.ratings || []), rating];
            return { ...t, ratings: newRatings };
        }
        return t;
    });
    setSavedTactics(updatedTactics);
    localStorage.setItem('sm26_saved_tactics', JSON.stringify(updatedTactics));
    triggerVibration();
  };

  const handleRequestImprovement = async (tactic: DetailedTactic) => {
      navigator.vibrate?.(30);
      setIsAnalyzingSuggestion(true);
      setTacticToImprove(tactic);
      setAnalysisSuggestionError('');
      setImprovementSuggestion(null);

      try {
          const suggestion = await getTacticImprovementSuggestion(tactic, matchHistory);
          setImprovementSuggestion(suggestion);
      } catch (err) {
          const errorMessage = err instanceof Error ? err.message : "An unknown error occurred during analysis.";
          setAnalysisSuggestionError(errorMessage);
      } finally {
          setIsAnalyzingSuggestion(false);
      }
  };

  const handleSaveImprovedTactic = (originalTactic: DetailedTactic, suggestion: TacticImprovementSuggestion) => {
      const newTactic = JSON.parse(JSON.stringify(originalTactic));

      newTactic.generalInstructions = mergeInstructionStrings(newTactic.generalInstructions, suggestion.suggestedChanges.general);
      newTactic.attackInstructions = mergeInstructionStrings(newTactic.attackInstructions, suggestion.suggestedChanges.attack);
      newTactic.defenceInstructions = mergeInstructionStrings(newTactic.defenceInstructions, suggestion.suggestedChanges.defence);
      newTactic.keyRoles = mergeInstructionStrings(newTactic.keyRoles, suggestion.suggestedChanges.keyRoles);
      
      const baseName = originalTactic.tacticName.replace(/\s+v\d+(\.\d+)?$/, '').trim();
      let version = 2;
      let newName = `${baseName} v${version}`;
      const existingNames = savedTactics.map(t => t.tacticName);

      while (existingNames.includes(newName)) {
          version++;
          newName = `${baseName} v${version}`;
      }
      
      newTactic.tacticName = newName;
      newTactic.isFavorite = false;
      newTactic.ratings = []; // Reset ratings for new version
      newTactic.bestForTips = `Improved based on AI analysis. Original Analysis:\n${suggestion.analysis}\n\nJustification for changes:\n${suggestion.justification}`;

      const updatedTactics = [...savedTactics, newTactic];
      setSavedTactics(updatedTactics);
      localStorage.setItem('sm26_saved_tactics', JSON.stringify(updatedTactics));
      triggerVibration();
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
              <div className="space-y-8">
                  <InteractiveAssistant onSaveTactic={handleSaveTactic} matchHistory={matchHistory} knowledge={aiKnowledge} />
                   <KnowledgeManager
                      knowledge={aiKnowledge}
                      isGenerating={isGeneratingKnowledge}
                      onGenerate={handleGenerateKnowledge}
                      onImport={handleImportKnowledge}
                      onExport={handleExportKnowledge}
                      onUpdateKnowledge={handleUpdateKnowledge}
                  />
              </div>
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
                onUpdateKnowledge={handleUpdateKnowledge}
                onRequestImprovement={handleRequestImprovement}
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
            matchHistory={matchHistory}
            onSaveTactic={handleSaveTactic}
            onRateTactic={handleRateTactic}
            onImproveTactic={handleRequestImprovement}
          />
        </div>

        <div className={activeTab === 'tools' ? '' : 'hidden'}>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="space-y-8">
                <FormationPlanner />
                <PlayerRoleFinder />
                <ImageAnalyzer />
                <AudioTranscriber />
              </div>
              <div className="space-y-8">
                <TacticOptimizer matchHistory={matchHistory} onSaveTactic={handleSaveTactic} />
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

      {isChatOpen && <ChatBot onClose={() => setIsChatOpen(false)} />}
      <button
        onClick={() => {
          setIsChatOpen(!isChatOpen);
          navigator.vibrate?.(30);
        }}
        className="fixed bottom-6 right-6 bg-[var(--color-accent-600)] hover:bg-[var(--color-accent-700)] text-white w-16 h-16 rounded-full shadow-lg flex items-center justify-center z-50 transform transition-transform hover:scale-110"
        aria-label={isChatOpen ? 'Close Chat' : 'Open Chat'}
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" viewBox="0 0 20 20" fill="currentColor">
          <path d="M2 5a2 2 0 012-2h7a2 2 0 012 2v4a2 2 0 01-2 2H9l-3 3v-3H4a2 2 0 01-2-2V5z" />
          <path d="M15 7v2a4 4 0 01-4 4H9.828l-1.766 1.767c.28.149.599.233.938.233h7a2 2 0 002-2V9a2 2 0 00-2-2h-1z" />
        </svg>
      </button>

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
       {tacticToImprove && (
        <TacticImprovementModal
            originalTactic={tacticToImprove}
            suggestion={improvementSuggestion}
            isLoading={isAnalyzingSuggestion}
            error={analysisSuggestionError}
            onClose={() => setTacticToImprove(null)}
            onSaveNewVersion={handleSaveImprovedTactic}
            avgPitchControl={(() => {
                const matches = matchHistory.filter(m => m.tacticUsed === tacticToImprove.tacticName);
                if (matches.length === 0) return null;
                return Math.round(matches.reduce((sum, m) => sum + (m.pitchControl ?? 50), 0) / matches.length);
            })()}
        />
      )}
    </div>
  );
};

export default App;