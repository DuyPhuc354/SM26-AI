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