// FIX: Removed self-referencing import which caused compilation errors.

export interface TacticSuggestion {
  formation: string;
  general: {
    width: string;
    mentality: string;
    tempo: string;
    fluidity: string;
    workRate: string;
    creativity: string;
  };
  attack: {
    passingStyle: string;
    attackingStyle: string;
    forwards: string;
    widePlay: string;
    buildUp: string;
    counterAttack: boolean;
  };
  defence: {
    pressing: string;
    tacklingStyle: string;
    backLine: string;
    sweeperKeeper: boolean;
    timeWasting: string;
  };
  playerRoles: {
    position: string;
    role: string;
  }[];
  justification: string;
}

export interface DetailedTactic {
  tacticName: string;
  formation: string;
  keyRoles: string;
  generalInstructions: string;
  attackInstructions: string;
  defenceInstructions: string;
  bestForTips: string;
  isFavorite?: boolean;
  ratings?: number[];
}

export interface MatchData {
  id: string;
  matchNumber: number;
  tacticUsed: string;
  opponent: string;
  score: string;
  possession: number;
  shots: number;
  shotsOnTarget: number;
  notes: string;
  matchImages?: string[];
  opponentPossession?: number;
  opponentShots?: number;
  opponentShotsOnTarget?: number;
  pitchControl?: number;
}

export interface Player {
  id: number;
  label: string;
  position: { x: number; y: number }; // Percentage-based coordinates
  onPitch: boolean;
}

export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  achieved: boolean;
}

export interface MatchPrediction {
  predictedScore: string;
  keyEvents: string[];
  justification: string;
  winProbability: {
    teamA: number;
    draw: number;
    teamB: number;
  };
}

export interface PlayerRoleSuggestion {
  role: string;
  score: number;
  justification: string;
}

export interface TacticImprovementSuggestion {
  analysis: string;
  suggestedChanges: {
    general?: string;
    attack?: string;
    defence?: string;
    keyRoles?: string;
  };
  justification: string;
}

export interface OptimizedTacticCandidate {
  predictedPciScore: number;
  tactic: TacticSuggestion;
}


// FIX: Updated props for MatchPerformanceTracker to align with its usage.
// This resolves type errors where the component was passed `onShowEvolutionReport`
// but the prop was not defined in this interface. The unused `onSaveNewVersion` was also removed.
export interface MatchPerformanceTrackerProps {
  matchHistory: MatchData[];
  allTactics: DetailedTactic[];
  onAddMatch: (match: Omit<MatchData, 'id' | 'matchNumber'>) => void;
  onDeleteMatch: (matchId: string) => void;
  onClearHistory: () => void;
  onUpdateKnowledge: (newKnowledge: string) => void;
  onAddMatches: (matches: Omit<MatchData, 'id' | 'matchNumber'>[]) => void;
  onOpenHistoryImporter: () => void;
  onRequestImprovement: (tactic: DetailedTactic) => void;
}