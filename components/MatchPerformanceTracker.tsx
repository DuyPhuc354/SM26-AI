
import React, { useState, useEffect, useRef } from 'react';
import type { MatchData, DetailedTactic, TacticImprovementSuggestion } from '../types';
import { getTacticImprovementSuggestion, analyzeMatchImage, analyzeMatchHistoryImage } from '../services/geminiService';
import { TacticImprovementModal } from './TacticImprovementModal';

interface MatchPerformanceTrackerProps {
  matchHistory: MatchData[];
  allTactics: DetailedTactic[];
  onAddMatch: (match: Omit<MatchData, 'id' | 'matchNumber'>) => void;
  onAddMatches: (matches: Omit<MatchData, 'id' | 'matchNumber'>[]) => void;
  onDeleteMatch: (matchId: string) => void;
  onClearHistory: () => void;
  onOpenHistoryImporter: () => void;
}

const initialMatchState: Omit<MatchData, 'id' | 'matchNumber'> = {
  tacticUsed: '',
  opponent: '',
  score: '',
  possession: 50,
  shots: 0,
  shotsOnTarget: 0,
  notes: '',
  matchImages: [],
};

const DRAFT_KEY = 'sm26_match_form_draft';

export const MatchPerformanceTracker: React.FC<MatchPerformanceTrackerProps> = ({
  matchHistory, allTactics, onAddMatch, onAddMatches, onDeleteMatch, onClearHistory, onOpenHistoryImporter
}) => {
  const [newMatch, setNewMatch] = useState<Omit<MatchData, 'id' | 'matchNumber'>>(initialMatchState);
  const [error, setError] = useState('');
  const [step, setStep] = useState(0);

  // AI Analysis State
  const [tacticToAnalyze, setTacticToAnalyze] = useState<string>('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisError, setAnalysisError] = useState('');
  const [suggestion, setSuggestion] = useState<TacticImprovementSuggestion | null>(null);
  const [analysisDetail, setAnalysisDetail] = useState<'full' | 'scores_only'>('full');

  // Image Scan State
  const [isScanning, setIsScanning] = useState(false);
  const [scanError, setScanError] = useState('');
  const [viewingImages, setViewingImages] = useState<string[] | null>(null);

  // History Screenshot Scan State
  const [scannedMatches, setScannedMatches] = useState<Omit<MatchData, 'id' | 'matchNumber'>[] | null>(null);
  const [bulkImportTactic, setBulkImportTactic] = useState('');
  const [isScanningHistory, setIsScanningHistory] = useState(false);
  const [scanHistoryError, setScanHistoryError] = useState('');
  const historyScanInputRef = useRef<HTMLInputElement>(null);

  // Load draft on initial render, pre-filling the tactic
  useEffect(() => {
    try {
      const savedDraft = localStorage.getItem(DRAFT_KEY);
      const defaultTactic = matchHistory.length > 0 ? matchHistory[matchHistory.length - 1].tacticUsed : allTactics[0]?.tacticName;

      if (savedDraft) {
        const parsedDraft = JSON.parse(savedDraft);
        if (!parsedDraft.tacticUsed && allTactics.length > 0) {
          parsedDraft.tacticUsed = defaultTactic || '';
        }
        // Merge draft with initial state to ensure all fields (like matchImages) are present
        setNewMatch({ ...initialMatchState, ...parsedDraft });
      } else if (allTactics.length > 0) {
        setNewMatch(prev => ({ ...prev, tacticUsed: defaultTactic || '' }));
      }
    } catch (err) {
      console.error("Failed to load match draft", err);
    }
  }, [allTactics, matchHistory]);


  // Autosave draft on any change, excluding large image data.
  useEffect(() => {
    try {
      // Exclude `matchImages` from the saved draft to prevent exceeding localStorage quota.
      const { matchImages, ...draftToSave } = newMatch;
      localStorage.setItem(DRAFT_KEY, JSON.stringify(draftToSave));
    } catch (err) {
      if (err instanceof DOMException && err.name === 'QuotaExceededError') {
          console.error("Failed to save match draft: LocalStorage quota exceeded. This can happen if notes are extremely long.");
      } else {
          console.error("Failed to save match draft", err);
      }
    }
  }, [newMatch]);

  // Set default tactic to analyze
  useEffect(() => {
    if (!tacticToAnalyze && allTactics.length > 0) {
      setTacticToAnalyze(allTactics[0].tacticName);
    }
  }, [allTactics, tacticToAnalyze]);

  // Set default tactic for bulk import
  useEffect(() => {
    if (allTactics.length > 0 && !bulkImportTactic) {
        setBulkImportTactic(allTactics[0].tacticName);
    }
  }, [allTactics, bulkImportTactic]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setNewMatch(prev => ({
      ...prev,
      [name]: type === 'number' ? parseFloat(value) || 0 : value,
    }));
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!newMatch.opponent.trim() || !newMatch.score.trim()) {
        setError("Opponent and Score are required fields.");
        return;
    }
    onAddMatch(newMatch);
    setNewMatch(initialMatchState);
    setStep(0);
    localStorage.removeItem(DRAFT_KEY);
    navigator.vibrate?.(50);
  }

  const handleClearDraft = () => {
    if (window.confirm("Are you sure you want to clear the form? Any unsaved data will be lost.")) {
        localStorage.removeItem(DRAFT_KEY);
        const defaultTactic = matchHistory.length > 0 ? matchHistory[matchHistory.length - 1].tacticUsed : allTactics[0]?.tacticName;
        setNewMatch({ ...initialMatchState, tacticUsed: defaultTactic || '' });
        setStep(0); 
        navigator.vibrate?.(100);
    }
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
        setScanError('');
        const filePromises = Array.from(files).map(file => {
            return new Promise<string>((resolve, reject) => {
                if (file.type.startsWith('image/')) {
                    const reader = new FileReader();
                    reader.onload = (event) => resolve(event.target?.result as string);
                    reader.onerror = () => reject(new Error("Failed to read one of the image files."));
                    reader.readAsDataURL(file);
                } else {
                    resolve(''); 
                }
            });
        });

        Promise.all(filePromises).then(imageDataUrls => {
            const validUrls = imageDataUrls.filter(url => url);
            if(validUrls.length < files.length) {
                setScanError("Some files were not valid images and were ignored.");
            }
            setNewMatch(prev => ({
                ...prev,
                matchImages: [...(prev.matchImages || []), ...validUrls]
            }));
        }).catch(err => setScanError(err.message));
    }
  }

  const handleClearImage = () => {
    setNewMatch(prev => ({ ...prev, matchImages: [] }));
    const fileInput = document.getElementById('match-image-input') as HTMLInputElement;
    if(fileInput) fileInput.value = "";
    navigator.vibrate?.(50);
  }

  const handleImageScan = async () => {
    if (!newMatch.matchImages || newMatch.matchImages.length === 0) return;
    navigator.vibrate?.(30);
    setIsScanning(true);
    setScanError('');
    try {
        const scannedDataArray = await analyzeMatchImage(newMatch.matchImages);
        
        if (scannedDataArray.length === 0) {
            setScanError("AI could not detect any match data in the image(s).");
        } else if (scannedDataArray.length === 1) {
            setNewMatch(prev => ({ ...prev, ...scannedDataArray[0] }));
        } else {
            setScannedMatches(scannedDataArray.map(match => ({
                ...initialMatchState,
                ...match,
                matchImages: [],
            })));
            handleClearImage();
        }
    } catch (err) {
        setScanError(err instanceof Error ? err.message : 'An unknown error occurred during scan.');
    } finally {
        setIsScanning(false);
    }
  }

  const handleDownload = () => {
    if (matchHistory.length === 0) return;
    navigator.vibrate?.(50);
    const jsonString = JSON.stringify(matchHistory, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `sm26_match_history.json`;
    a.click();
    URL.revokeObjectURL(url);
    a.remove();
  };

  const handleAnalyzeTactic = async () => {
    const tactic = allTactics.find(t => t.tacticName === tacticToAnalyze);
    if (!tactic) {
      setAnalysisError("Selected tactic not found.");
      return;
    }

    navigator.vibrate?.(30);
    setIsAnalyzing(true);
    setAnalysisError('');
    setSuggestion(null);

    try {
      const result = await getTacticImprovementSuggestion(tactic, matchHistory, analysisDetail);
      setSuggestion(result);
    } catch (err) {
      setAnalysisError(err instanceof Error ? err.message : "An unknown error occurred.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleHistoryScanClick = () => {
    historyScanInputRef.current?.click();
  };

  const handleHistoryImageSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsScanningHistory(true);
    setScanHistoryError('');
    setScannedMatches(null);

    const reader = new FileReader();
    reader.onload = async (event) => {
        try {
            const imageDataUrl = event.target?.result as string;
            const results = await analyzeMatchHistoryImage(imageDataUrl); 
            if (results.length === 0) {
                setScanHistoryError("AI could not find any matches in the screenshot.");
            } else {
                setScannedMatches(results.map(r => ({ ...initialMatchState, ...r, matchImages: [] })));
            }
        } catch (err) {
             setScanHistoryError(err instanceof Error ? err.message : 'An unknown error occurred during AI analysis.');
        } finally {
            setIsScanningHistory(false);
        }
    };
    reader.onerror = () => {
         setScanHistoryError("Failed to read the image file.");
         setIsScanningHistory(false);
    };
    reader.readAsDataURL(file);

    e.target.value = '';
  };

  const handleConfirmBulkImport = () => {
    if (!scannedMatches || !bulkImportTactic) return;
    navigator.vibrate?.(20);

    const matchesToAdd = scannedMatches.map(match => ({
        ...match,
        tacticUsed: bulkImportTactic,
    }));
    onAddMatches(matchesToAdd);

    setScannedMatches(null);
  };

  const tacticForAnalysis = allTactics.find(t => t.tacticName === tacticToAnalyze);
  const wizardSteps = ["Tactic", "Images", "Details"];

  const renderCurrentStep = () => {
      switch(step) {
          case 0:
              return (
                  <div>
                      <label htmlFor="tacticUsed" className="block text-sm font-medium text-gray-300 mb-1">Which tactic did you use?</label>
                      <select id="tacticUsed" name="tacticUsed" value={newMatch.tacticUsed} onChange={handleChange} className="block w-full p-2 bg-gray-700 border border-gray-600 rounded-md text-white">
                          {allTactics.map(t => <option key={t.tacticName} value={t.tacticName}>{t.tacticName}</option>)}
                      </select>
                  </div>
              );
          case 1:
              return (
                  <div>
                      <label htmlFor="match-image-input" className="block text-sm font-medium text-gray-300 mb-2">Upload Match Screenshots (Optional)</label>
                      <input id="match-image-input" type="file" accept="image/*" multiple onChange={handleImageSelect} className="block w-full text-sm text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-[var(--color-accent-600)] file:text-white hover:file:bg-[var(--color-accent-700)]"/>
                      
                      {newMatch.matchImages && newMatch.matchImages.length > 0 && (
                          <div className="mt-4 p-2 bg-gray-700 rounded-md">
                               <div className="flex overflow-x-auto space-x-2 pb-2">
                                    {newMatch.matchImages.map((image, index) => (
                                        <img key={index} src={image} alt={`Match preview ${index + 1}`} className="h-24 w-auto rounded-md object-cover flex-shrink-0" />
                                    ))}
                                </div>
                              <div className="flex gap-2 mt-2">
                                  <button type="button" onClick={handleImageScan} disabled={isScanning} className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-500 text-white font-bold py-2 px-3 rounded-md text-sm">
                                      {isScanning ? 'Scanning...' : `Scan ${newMatch.matchImages.length} Image(s) with AI`}
                                  </button>
                                  <button type="button" onClick={handleClearImage} className="bg-red-600 hover:red-700 text-white font-bold py-2 px-3 rounded-md text-sm">Clear All</button>
                              </div>
                          </div>
                      )}
                      {scanError && <p className="text-red-400 text-sm mt-2">{scanError}</p>}
                  </div>
              );
          case 2:
              return (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                          <label htmlFor="opponent" className="block text-sm font-medium text-gray-300">Opponent*</label>
                          <input type="text" name="opponent" id="opponent" value={newMatch.opponent} onChange={handleChange} placeholder="Team Name" className="mt-1 block w-full p-2 bg-gray-700 border border-gray-600 rounded-md text-white" />
                      </div>
                      <div>
                          <label htmlFor="score" className="block text-sm font-medium text-gray-300">Final Score*</label>
                          <input type="text" name="score" id="score" value={newMatch.score} onChange={handleChange} placeholder="e.g., 2-1" className="mt-1 block w-full p-2 bg-gray-700 border border-gray-600 rounded-md text-white" />
                      </div>
                       <div>
                          <label htmlFor="possession" className="block text-sm font-medium text-gray-300">Possession %</label>
                          <input type="number" name="possession" id="possession" value={newMatch.possession} onChange={handleChange} className="mt-1 block w-full p-2 bg-gray-700 border border-gray-600 rounded-md text-white" />
                      </div>
                       <div>
                          <label htmlFor="shots" className="block text-sm font-medium text-gray-300">Shots</label>
                          <input type="number" name="shots" id="shots" value={newMatch.shots} onChange={handleChange} className="mt-1 block w-full p-2 bg-gray-700 border border-gray-600 rounded-md text-white" />
                      </div>
                      <div>
                          <label htmlFor="shotsOnTarget" className="block text-sm font-medium text-gray-300">On Target</label>
                          <input type="number" name="shotsOnTarget" id="shotsOnTarget" value={newMatch.shotsOnTarget} onChange={handleChange} className="mt-1 block w-full p-2 bg-gray-700 border border-gray-600 rounded-md text-white" />
                      </div>
                       <div className="md:col-span-2">
                          <label htmlFor="notes" className="block text-sm font-medium text-gray-300">Notes</label>
                          <textarea name="notes" id="notes" value={newMatch.notes} onChange={handleChange} rows={2} className="mt-1 block w-full p-2 bg-gray-700 border border-gray-600 rounded-md text-white" placeholder="Any key events or observations..."></textarea>
                      </div>
                  </div>
              )
          default:
              return null;
      }
  }

  return (
    <div className="bg-gray-800 rounded-lg shadow-lg p-6">
      <h2 className="text-xl font-bold text-[var(--color-text-accent)] mb-4">Match Performance Tracker</h2>
      
      <div className="bg-gray-900/50 p-4 rounded-lg">
          <div className="flex justify-between items-center mb-3">
            <h3 className="font-semibold text-lg text-white">Log Next Match (Match #{matchHistory.length > 0 ? Math.max(...matchHistory.map(m => m.matchNumber)) + 1 : 1})</h3>
            <button 
                type="button" 
                onClick={handleClearDraft}
                className="text-xs bg-gray-600 hover:bg-gray-700 text-white font-bold py-1 px-2 rounded-md transition-colors"
                aria-label="Clear and reset the match form"
            >
                Clear Form
            </button>
          </div>

          <div className="flex items-center justify-center mb-4">
              {wizardSteps.map((s, index) => (
                  <React.Fragment key={s}>
                      <div className="flex items-center">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${step >= index ? 'bg-[var(--color-accent-600)] text-white' : 'bg-gray-700 text-gray-400'}`}>
                              {index + 1}
                          </div>
                          <p className={`ml-2 text-sm ${step >= index ? 'text-white' : 'text-gray-500'}`}>{s}</p>
                      </div>
                      {index < wizardSteps.length - 1 && <div className={`flex-auto border-t-2 mx-2 ${step > index ? 'border-[var(--color-accent-500)]' : 'border-gray-700'}`}></div>}
                  </React.Fragment>
              ))}
          </div>
          
          <form onSubmit={handleSubmit}>
              <div className="min-h-[150px]">
                {renderCurrentStep()}
              </div>
              {error && <p className="text-red-400 text-sm mt-2 text-center">{error}</p>}
              <div className="flex justify-between items-center pt-4 mt-4 border-t border-gray-700">
                  <button type="button" onClick={() => { setStep(s => s - 1); navigator.vibrate?.(20); }} disabled={step === 0} className="bg-gray-600 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded-md disabled:opacity-50">Back</button>
                  {step < wizardSteps.length - 1 ? 
                      <button type="button" onClick={() => { setStep(s => s + 1); navigator.vibrate?.(20); }} disabled={!newMatch.tacticUsed} className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-md disabled:opacity-50">Next</button> :
                      <button type="submit" className="bg-[var(--color-accent-600)] hover:bg-[var(--color-accent-700)] text-white font-bold py-2 px-4 rounded-md">Log Match</button>
                  }
              </div>
          </form>
      </div>
      
      {matchHistory.length > 0 && (
        <div className="mt-6 border-t border-gray-700 pt-4">
          <h3 className="font-semibold text-lg text-white mb-2">Match History</h3>
          <div className="space-y-2 max-h-60 overflow-y-auto pr-2">
            {[...matchHistory].sort((a,b) => b.matchNumber - a.matchNumber).map(match => (
              <div key={match.id} className="bg-gray-700/50 p-2 rounded-md text-sm flex justify-between items-center">
                <div className="flex items-center gap-x-3">
                    {match.matchImages && match.matchImages.length > 0 && (
                        <button onClick={() => setViewingImages(match.matchImages!)} aria-label="View match screenshots">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-400 hover:text-white" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" /></svg>
                        </button>
                    )}
                    <div>
                        <p><b>#{match.matchNumber}:</b> {match.tacticUsed} vs {match.opponent} (<b>{match.score}</b>)</p>
                        <p className="text-xs text-gray-400">Poss: {match.possession}%, Shots: {match.shots} ({match.shotsOnTarget})</p>
                    </div>
                </div>
                <button onClick={() => onDeleteMatch(match.id)} className="text-gray-400 hover:text-red-500 p-1" aria-label={`Delete match #${match.matchNumber}`}>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" /></svg>
                </button>
              </div>
            ))}
          </div>
          {scanHistoryError && <p className="text-red-400 text-sm mt-2">{scanHistoryError}</p>}
           <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-4 text-sm">
            <input type="file" accept="image/*" ref={historyScanInputRef} onChange={handleHistoryImageSelect} className="hidden" />
            <button onClick={handleHistoryScanClick} disabled={isScanningHistory} className="bg-purple-600 hover:bg-purple-700 disabled:bg-gray-500 text-white font-bold py-1 px-3 rounded-md">
              {isScanningHistory ? 'Scanning...' : 'Scan Screenshot'}
            </button>
            <button onClick={handleDownload} className="bg-gray-600 hover:bg-gray-700 text-white font-bold py-1 px-3 rounded-md">Download</button>
            <button onClick={onOpenHistoryImporter} className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-1 px-3 rounded-md">Import</button>
            <button onClick={onClearHistory} className="bg-red-600 hover:bg-red-700 text-white font-bold py-1 px-3 rounded-md">Clear</button>
          </div>
        </div>
      )}

      {matchHistory.length > 0 && allTactics.length > 0 && (
        <div className="mt-6 border-t border-gray-700 pt-4">
            <h3 className="font-semibold text-lg text-white mb-2">AI Tactical Analysis</h3>
            <p className="text-sm text-gray-400 mb-3">Select a tactic and detail level to get AI-powered improvement suggestions based on your match history.</p>
            
            <fieldset className="mb-3">
                <legend className="text-sm font-medium text-gray-300 mb-1">Analysis Detail Level</legend>
                <div className="flex gap-x-4">
                    <label className="flex items-center text-sm text-gray-400 cursor-pointer">
                        <input 
                        type="radio" 
                        name="analysisDetail" 
                        value="full" 
                        checked={analysisDetail === 'full'} 
                        onChange={() => setAnalysisDetail('full')} 
                        className="w-4 h-4 text-[var(--color-accent-600)] bg-gray-700 border-gray-600 focus:ring-[var(--color-accent-500)]" 
                        />
                        <span className="ml-2">Full Match Details</span>
                    </label>
                    <label className="flex items-center text-sm text-gray-400 cursor-pointer">
                        <input 
                        type="radio" 
                        name="analysisDetail" 
                        value="scores_only" 
                        checked={analysisDetail === 'scores_only'} 
                        onChange={() => setAnalysisDetail('scores_only')} 
                        className="w-4 h-4 text-[var(--color-accent-600)] bg-gray-700 border-gray-600 focus:ring-[var(--color-accent-500)]" 
                        />
                        <span className="ml-2">Scores Only</span>
                    </label>
                </div>
            </fieldset>

            <div className="flex gap-2">
                <select 
                    value={tacticToAnalyze} 
                    onChange={e => setTacticToAnalyze(e.target.value)}
                    className="flex-grow p-2 bg-gray-700 border border-gray-600 rounded-md text-white"
                >
                    {allTactics.map(t => <option key={t.tacticName} value={t.tacticName}>{t.tacticName}</option>)}
                </select>
                <button 
                    onClick={handleAnalyzeTactic} 
                    disabled={isAnalyzing}
                    className="bg-[var(--color-accent-600)] hover:bg-[var(--color-accent-700)] disabled:bg-gray-500 text-white font-bold py-2 px-4 rounded-md"
                >
                    {isAnalyzing ? 'Analyzing...' : 'Analyze'}
                </button>
            </div>
            {analysisError && <p className="text-red-400 text-sm mt-2">{analysisError}</p>}
        </div>
      )}

      {suggestion && tacticForAnalysis && (
        <TacticImprovementModal 
            suggestion={suggestion} 
            originalTactic={tacticForAnalysis} 
            onClose={() => setSuggestion(null)}
        />
      )}
      
      {viewingImages && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50" onClick={() => { setViewingImages(null); navigator.vibrate?.(20); }}>
            <div className="bg-gray-900 p-4 rounded-lg shadow-xl max-w-6xl w-full max-h-[90vh]" onClick={e => e.stopPropagation()}>
                <h3 className="text-lg font-bold text-white mb-4">Match Screenshots ({viewingImages.length})</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 overflow-y-auto max-h-[calc(90vh-80px)]">
                  {viewingImages.map((image, index) => (
                    <img key={index} src={image} alt={`Match Screenshot ${index + 1}`} className="w-full h-auto object-contain rounded-md"/>
                  ))}
                </div>
            </div>
        </div>
      )}

      {scannedMatches && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50" onClick={() => { setScannedMatches(null); navigator.vibrate?.(20); }}>
            <div className="bg-gray-800 p-6 rounded-lg shadow-xl max-w-lg w-full" onClick={e => e.stopPropagation()}>
                <h3 className="text-xl font-bold text-white mb-3">Confirm Scanned Matches</h3>
                <p className="text-gray-400 mb-4">The AI found {scannedMatches.length} matches. Please select the tactic used for these games and confirm to import.</p>
                <div className="mb-4">
                    <label htmlFor="bulkImportTactic" className="block text-sm font-medium text-gray-300 mb-1">Tactic Used</label>
                    <select id="bulkImportTactic" value={bulkImportTactic} onChange={e => setBulkImportTactic(e.target.value)} className="w-full p-2 bg-gray-700 border border-gray-600 rounded-md text-white">
                       {allTactics.map(t => <option key={t.tacticName} value={t.tacticName}>{t.tacticName}</option>)}
                    </select>
                </div>
                <div className="max-h-60 overflow-y-auto bg-gray-900/50 p-2 rounded-md mb-4">
                    <table className="w-full text-sm text-left">
                        <thead className="text-xs text-gray-400 uppercase">
                            <tr><th className="px-4 py-2">Opponent</th><th className="px-4 py-2">Score</th></tr>
                        </thead>
                        <tbody className="text-white">
                            {scannedMatches.map((match, index) => (
                                <tr key={index} className="border-b border-gray-700"><td className="px-4 py-2">{match.opponent}</td><td className="px-4 py-2">{match.score}</td></tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                <div className="flex justify-end gap-x-3">
                    <button onClick={() => { setScannedMatches(null); navigator.vibrate?.(20); }} className="bg-gray-600 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded-md">Cancel</button>
                    <button onClick={handleConfirmBulkImport} className="bg-[var(--color-accent-600)] hover:bg-[var(--color-accent-700)] text-white font-bold py-2 px-4 rounded-md">Import {scannedMatches.length} Matches</button>
                </div>
            </div>
        </div>
      )}
    </div>
  );
};
