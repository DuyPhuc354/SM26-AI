import { GoogleGenAI, Type } from "@google/genai";
import { SM_TACTICS_GUIDE_CONTEXT, PLAYER_ROLE_DESCRIPTIONS } from "../constants";
import type { TacticSuggestion, MatchPrediction, PlayerRoleSuggestion, DetailedTactic, MatchData, TacticImprovementSuggestion } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });

/**
 * Extracts a JSON string from a larger string, which may contain markdown code fences
 * or other conversational text.
 * @param text The raw string response from the model.
 * @returns A string that is likely to be parsable JSON.
 */
const extractJson = (text: string): string => {
  // First, try to find a JSON string within ```json ... ``` or ``` ... ```
  const codeBlockMatch = text.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
  if (codeBlockMatch && codeBlockMatch[1]) {
    return codeBlockMatch[1].trim();
  }

  // If no code block, find the first string that looks like a JSON object or array
  const jsonMatch = text.match(/\{[\s\S]*\}|\[[\s\S]*\]/);
  if (jsonMatch && jsonMatch[0]) {
    return jsonMatch[0];
  }

  // Fallback to the original text if no specific JSON structure is found
  return text.trim();
};

const responseSchema = {
  type: Type.OBJECT,
  properties: {
    formation: {
      type: Type.STRING,
      description: "The recommended formation, e.g., '4-3-3' or '4-2-3-1'."
    },
    general: {
        type: Type.OBJECT,
        properties: {
            width: { type: Type.STRING, description: "Options: Narrow, Normal, Wide." },
            mentality: { type: Type.STRING, description: "Options: V.Defensive, Defensive, Normal, Attacking, V.Attacking." },
            tempo: { type: Type.STRING, description: "Options: Slow, Normal, Fast." },
            fluidity: { type: Type.STRING, description: "Options: Disciplined, Normal, Adventurous." },
            workRate: { type: Type.STRING, description: "Options: Slow, Normal, Fast." },
            creativity: { type: Type.STRING, description: "Options: Cautious, Balanced, Bold." },
        },
        required: ["width", "mentality", "tempo", "fluidity", "workRate", "creativity"]
    },
    attack: {
        type: Type.OBJECT,
        properties: {
            passingStyle: { type: Type.STRING, description: "Options: Short, Mixed, Direct, Long Ball." },
            attackingStyle: { type: Type.STRING, description: "Options: Mixed, Down Both Flanks, Through the Middle." },
            forwards: { type: Type.STRING, description: "Forwards instructions. Options: Work ball into box, Shoot on sight, Mixed." },
            widePlay: { type: Type.STRING, description: "Wide play instructions. Options: Byline crosses, Play early crosses, Mixed, work ball into box." },
            buildUp: { type: Type.STRING, description: "Build up speed. Options: Slow, Normal, Fast." },
            counterAttack: { type: Type.BOOLEAN, description: "Whether to enable counter attacks (true for Yes, false for No)." }
        },
        required: ["passingStyle", "attackingStyle", "forwards", "widePlay", "buildUp", "counterAttack"]
    },
    defence: {
        type: Type.OBJECT,
        properties: {
            pressing: { type: Type.STRING, description: "Options: Own Area, Own Half, All Over." },
            tacklingStyle: { type: Type.STRING, description: "Options: Normal, Hard, Aggressive." },
            backLine: { type: Type.STRING, description: "Options: Low, Normal, High." },
            sweeperKeeper: { type: Type.BOOLEAN, description: "Whether to use a sweeper keeper (true for Yes, false for No)." },
            timeWasting: { type: Type.STRING, description: "Time wasting strategy. Options: Low, Normal, High." },
        },
        required: ["pressing", "tacklingStyle", "backLine", "sweeperKeeper", "timeWasting"]
    },
    playerRoles: {
      type: Type.ARRAY,
      description: "A complete list of roles for all 11 player positions suitable for the chosen formation. Example: [{position: 'GK', role: 'Goalkeeper'}, {position: 'DC', role: 'Stopper'}, ...]",
      items: {
        type: Type.OBJECT,
        properties: {
          position: { type: Type.STRING, description: "The position on the pitch, e.g., 'GK', 'DC', 'FC' or 'MC'." },
          role: { type: Type.STRING, description: "The specific Soccer Manager role, e.g., 'Target Man' or 'Advanced Playmaker'." }
        },
        required: ["position", "role"],
      }
    },
    justification: {
      type: Type.STRING,
      description: "A detailed explanation for why this tactic and these instructions are suitable for the user's team, referencing the provided guide context and chosen difficulty."
    }
  },
  required: ["formation", "general", "attack", "defence", "playerRoles", "justification"],
};

export const getTacticSuggestion = async (squadComposition: { [key: string]: number }, playstyle: string): Promise<TacticSuggestion> => {
  const squadPrompt = Object.entries(squadComposition)
    .map(([pos, count]) => `- ${pos.toUpperCase()}: ${count}`)
    .join('\n');

  const playstylePrompt = playstyle.trim() ? `
USER'S TEAM PLAYSTYLE AND KEY PLAYERS:
"${playstyle}"
` : '';

  const prompt = `
CONTEXT:
${SM_TACTICS_GUIDE_CONTEXT}

---

USER'S SQUAD COMPOSITION:
The user has the following number of outfield players available for each position. The total is exactly 10.
${squadPrompt}

${playstylePrompt}
---

INSTRUCTIONS:
Based on the Soccer Manager 2026 CONTEXT, the user's SQUAD COMPOSITION, and their TEAM PLAYSTYLE (if provided):
1.  **Strict Formation:** Devise a logical and balanced formation that uses EXACTLY the number of players specified for each position. For example, if the user provides 3 for DC, the formation MUST use 3 central defenders.
2.  **Assign Roles:** Provide a role for ALL 11 PLAYER POSITIONS (add a Goalkeeper automatically). The roles should complement the formation, the likely strengths of a team with this player distribution, AND the described playstyle.
3.  **Set Instructions:** Provide a complete set of General, Attack, and Defence instructions that are tactically sound for the generated formation and playstyle.
4.  **Justify:** Explain your reasoning, detailing why the chosen formation and instructions are the most effective approach for the given squad structure and playstyle, referencing the SM26 meta.
`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: responseSchema,
        temperature: 0.7,
      },
    });

    const rawText = response.text;
    if (!rawText) {
      throw new Error("Received an empty response from the API.");
    }
    
    const jsonText = extractJson(rawText);
    const parsedJson = JSON.parse(jsonText);
    return parsedJson as TacticSuggestion;
    
  } catch (error) {
    console.error("Error calling Gemini API:", error);
    throw new Error("Failed to generate tactic suggestion from Gemini API.");
  }
};

const predictionSchema = {
    type: Type.OBJECT,
    properties: {
        predictedScore: { type: Type.STRING, description: "The most likely final score, e.g., '2-1'." },
        keyEvents: { type: Type.ARRAY, items: { type: Type.STRING }, description: "A list of 3-4 key events that might happen in the match."},
        justification: { type: Type.STRING, description: "A detailed justification for the prediction, analyzing both teams' strengths and weaknesses based on the provided descriptions and general SM26 meta knowledge."},
        winProbability: {
            type: Type.OBJECT,
            properties: {
                teamA: { type: Type.NUMBER, description: "Win probability for Team A (user's team) from 0 to 100." },
                draw: { type: Type.NUMBER, description: "Probability of a draw from 0 to 100." },
                teamB: { type: Type.NUMBER, description: "Win probability for Team B (opponent) from 0 to 100." },
            },
            required: ["teamA", "draw", "teamB"]
        },
    },
    required: ["predictedScore", "keyEvents", "justification", "winProbability"],
};

export const getMatchPrediction = async (teamADescription: string, teamBDescription: string): Promise<MatchPrediction> => {
    const prompt = `
    CONTEXT:
    You are a Soccer Manager 2026 (SM26) expert analyst. The game's meta favors fast forwards, central attacks, high pressing, and counter-attacks. Analyze the following two team descriptions and predict the outcome of a match between them.

    TEAM A (My Team):
    "${teamADescription}"

    TEAM B (Opponent):
    "${teamBDescription}"

    INSTRUCTIONS:
    1.  Predict the final score.
    2.  Estimate the win probabilities for Team A, a Draw, and Team B. The total must sum to 100.
    3.  List 3-4 likely key events in the match.
    4.  Provide a justification explaining your reasoning, comparing the tactical matchups.
    `;

    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: predictionSchema,
                temperature: 0.5,
            },
        });

        const rawText = response.text;
        if (!rawText) {
          throw new Error("Received an empty response from the API.");
        }
        
        const jsonText = extractJson(rawText);
        const parsedJson = JSON.parse(jsonText);
        return parsedJson as MatchPrediction;

    } catch (error) {
        console.error("Error calling Gemini API for prediction:", error);
        throw new Error("Failed to generate match prediction from Gemini API.");
    }
};

const roleSuggestionSchema = {
    type: Type.ARRAY,
    description: "An array of 3-5 suggested player roles, ordered by score.",
    items: {
        type: Type.OBJECT,
        properties: {
            role: { type: Type.STRING, description: "A specific player role from Soccer Manager 2026." },
            score: { type: Type.NUMBER, description: "A compatibility score from 1 to 100 indicating how well the player fits this role." },
            justification: { type: Type.STRING, description: "A brief justification for the score, referencing the player's attributes and the role's requirements in SM26." },
        },
        required: ["role", "score", "justification"],
    }
};

export const getPlayerRoleSuggestion = async (playerDescription: string): Promise<PlayerRoleSuggestion[]> => {
    const prompt = `
    CONTEXT:
    You are a world-class Soccer Manager 2026 (SM26) scout. Your task is to analyze a player's description and determine their best roles on the pitch. Use the provided list of roles and the general SM26 meta (fast players, technical ability, etc.) to make your assessment.

    AVAILABLE PLAYER ROLES:
    ${Object.keys(PLAYER_ROLE_DESCRIPTIONS).join(', ')}

    PLAYER DESCRIPTION:
    "${playerDescription}"

    INSTRUCTIONS:
    1.  Based on the description, identify the 3-5 most suitable roles for this player.
    2.  For each role, provide a compatibility score from 1 to 100.
    3.  Provide a short justification for each score.
    4.  Return the results as an array of objects, ordered from the highest score to the lowest.
    `;
    
    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: roleSuggestionSchema,
                temperature: 0.3,
            },
        });

        const rawText = response.text;
        if (!rawText) {
          throw new Error("Received an empty response from the API.");
        }
        
        const jsonText = extractJson(rawText);
        const parsedJson = JSON.parse(jsonText);
        return parsedJson as PlayerRoleSuggestion[];

    } catch (error) {
        console.error("Error calling Gemini API for role suggestion:", error);
        throw new Error("Failed to generate player role suggestion from Gemini API.");
    }
};

const improvementSchema = {
    type: Type.OBJECT,
    properties: {
      analysis: { type: Type.STRING, description: "A summary of the team's performance based on match history, identifying key weaknesses revealed by the data." },
      suggestedChanges: {
        type: Type.OBJECT,
        properties: {
          general: { type: Type.STRING, description: "Suggested change to ONE General instruction. e.g., 'Change Width from Wide to Normal to be more compact.'" },
          attack: { type: Type.STRING, description: "Suggested change to ONE Attack instruction." },
          defence: { type: Type.STRING, description: "Suggested change to ONE Defence instruction." },
          keyRoles: { type: Type.STRING, description: "Suggested change to ONE or TWO key player roles. e.g., 'Switch Box-to-box Midfielder to a Ball-Winning Midfielder.'" },
        },
      },
      justification: { type: Type.STRING, description: "Detailed reasoning for why these specific changes will improve performance, directly referencing the performance analysis." },
    },
    required: ["analysis", "suggestedChanges", "justification"],
};
  
export const getTacticImprovementSuggestion = async (
    tactic: DetailedTactic,
    history: MatchData[],
    detailLevel: 'full' | 'scores_only' = 'full'
): Promise<TacticImprovementSuggestion> => {
    const relevantHistory = history.filter(m => m.tacticUsed === tactic.tacticName).slice(-10); // Use last 10 matches for this tactic

    if (relevantHistory.length < 3) {
        throw new Error("Not enough match data for this tactic. Please log at least 3 matches to get an analysis.");
    }

    const historySummary = relevantHistory.map(m => {
        if (detailLevel === 'scores_only') {
            return `vs ${m.opponent}: ${m.score}`;
        }
        return `vs ${m.opponent}: ${m.score}, Poss: ${m.possession}%, Shots: ${m.shots}(${m.shotsOnTarget})`;
    }).join('; ');

    const historyPromptSection = detailLevel === 'scores_only'
        ? `RECENT MATCH RESULTS (scores only):`
        : `RECENT MATCH HISTORY (full details):`;


    const prompt = `
    CONTEXT:
    You are an expert Soccer Manager 2026 tactical analyst. Your task is to analyze a tactic and its recent match results to provide concrete improvement suggestions.
    You MUST adhere strictly to the valid instructions and roles defined in the guide below. Do not invent new roles or instruction values.

    --- TACTICAL GUIDE ---
    ${SM_TACTICS_GUIDE_CONTEXT}
    --- END GUIDE ---

    TACTIC TO ANALYZE:
    - Name: ${tactic.tacticName}
    - Formation: ${tactic.formation}
    - Key Roles: ${tactic.keyRoles}
    - General: ${tactic.generalInstructions}
    - Attack: ${tactic.attackInstructions}
    - Defence: ${tactic.defenceInstructions}

    ${historyPromptSection}
    ${historySummary}

    INSTRUCTIONS:
    1.  **Analyze Performance**: Based on the match data, identify the tactic's main weaknesses.
    2.  **Suggest Key Changes**: Propose a few (1-4) specific, high-impact changes to the tactic's instructions or key player roles. The suggested changes MUST come from the options in the TACTICAL GUIDE. For example, if you suggest changing "Width", the new value must be "Narrow", "Normal", or "Wide".
    3.  **Justify Your Suggestions**: Explain how your proposed changes will address the identified weaknesses.
    `;

    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: improvementSchema,
                temperature: 0.5,
            },
        });

        const rawText = response.text;
        if (!rawText) throw new Error("Received an empty response from the API.");
        
        const jsonText = extractJson(rawText);
        return JSON.parse(jsonText) as TacticImprovementSuggestion;

    } catch (error) {
        console.error("Error calling Gemini API for tactic improvement:", error);
        throw new Error("Failed to generate tactic improvement suggestion.");
    }
};

const matchImageAnalysisSchema = {
    type: Type.ARRAY,
    description: "An array of match data objects, one for each distinct match found in the images. If multiple images are for one match, consolidate them.",
    items: {
        type: Type.OBJECT,
        properties: {
            opponent: { type: Type.STRING, description: "The name of the opponent team. This is a required field." },
            score: { type: Type.STRING, description: "The final score for the user's team vs opponent, e.g., '3-1'. Null if not found." },
            possession: { type: Type.NUMBER, description: "The user's team possession percentage as a number (0-100). Null if not found." },
            shots: { type: Type.NUMBER, description: "Total shots for the user's team. Null if not found." },
            shotsOnTarget: { type: Type.NUMBER, description: "Shots on target for the user's team. Null if not found." },
        },
        required: ["opponent"],
    },
};


export const analyzeMatchImage = async (imageDataUrls: string[]): Promise<Partial<MatchData>[]> => {
    if (imageDataUrls.length === 0) {
        throw new Error("No images provided for analysis.");
    }

    const imageParts = imageDataUrls.map(url => {
        const match = url.match(/^data:(.+);base64,(.+)$/);
        if (!match) {
            throw new Error("Invalid image data URL format.");
        }
        const mimeType = match[1];
        const base64ImageData = match[2];
        return {
            inlineData: { mimeType, data: base64ImageData },
        };
    });


    const textPart = {
        text: `Analyze the provided Soccer Manager 2026 match result screenshot(s). Each image could represent a different match, or multiple images could be for the same match.

**Primary Goal:** Identify all distinct matches and extract their data.

**INSTRUCTIONS:**
1.  **Identify User's Team:** A single team name will likely appear in all or most of the images if multiple matches from the same season are provided. This is the **user's team**. All other team names are opponents. This is a crucial step for correctly identifying the opponent. For example, if 'Liverpool' appears in 4 out of 5 images, 'Liverpool' is the user's team.
2.  **Group and Extract:** Group screenshots that belong to the same match (e.g., one for score, one for stats). Then for each distinct match, extract the following information for the user's team:
    - opponent: The name of the opponent team.
    - score: The final score.
    - possession: The user's possession percentage.
    - shots: The user's total shots.
    - shotsOnTarget: The user's shots on target.
3.  **Score Interpretation (CRITICAL):** You MUST determine the final score based on the color of the score box.
    - If the box is **GREEN**, the user's team **WON**. Their score is the higher of the two numbers.
    - If the box is **RED**, the user's team **LOST**. Their score is the lower of the two numbers.
    - If the box is **GRAY/NEUTRAL**, it's a **DRAW**.
    - **Format the score:** Always return the score as 'user_score-opponent_score'.
4.  **Return Format:** Return a JSON array of objects, with one object for each distinct match you identify. If a stat isn't visible in an image for a match, return null for that field. Ensure the 'opponent' field is always populated.`,
    };

    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: { parts: [textPart, ...imageParts] },
            config: {
                responseMimeType: "application/json",
                responseSchema: matchImageAnalysisSchema,
            },
        });

        const rawText = response.text;
        if (!rawText) {
            throw new Error("Received an empty response from the API.");
        }
        
        const jsonText = extractJson(rawText);
        const parsedJson = JSON.parse(jsonText);
        
        if (!Array.isArray(parsedJson)) {
            throw new Error("API did not return an array of matches as expected.");
        }

        return (parsedJson as any[]).map(match => {
            const cleanedData: Partial<MatchData> = {};
            for (const key in match) {
                if (match[key] !== null && match[key] !== undefined) {
                    (cleanedData as any)[key] = match[key];
                }
            }
            return cleanedData;
        }).filter(match => match.opponent); // Filter out entries without an opponent

    } catch (error) {
        console.error("Error calling Gemini API for image analysis:", error);
        throw new Error("Failed to analyze match image with Gemini API.");
    }
};

const matchHistoryAnalysisSchema = {
    type: Type.ARRAY,
    description: "An array of match data objects extracted from the image. Each object represents one match.",
    items: {
        type: Type.OBJECT,
        properties: {
            opponent: { type: Type.STRING, description: "The name of the opponent team." },
            score: { type: Type.STRING, description: "The final score, formatted as 'user_score-opponent_score' based on the color rule. E.g., '5-3'." },
        },
        required: ["opponent", "score"],
    }
};

export const analyzeMatchHistoryImage = async (imageDataUrl: string): Promise<Omit<MatchData, 'id' | 'matchNumber' | 'tacticUsed' | 'possession' | 'shots' | 'shotsOnTarget' | 'notes' | 'matchImages'>[]> => {
    const match = imageDataUrl.match(/^data:(.+);base64,(.+)$/);
    if (!match) {
        throw new Error("Invalid image data URL format.");
    }
    const mimeType = match[1];
    const base64ImageData = match[2];
    
    const imagePart = { inlineData: { mimeType, data: base64ImageData } };

    const textPart = {
        text: `Analyze the provided Soccer Manager 2026 match history screenshot. For each match in the list, extract the opponent's name and the final score.

**INSTRUCTIONS FOR SCORE INTERPRETATION:**
You MUST determine the final score for each match based on the color of its score box. This is the most important rule.
1.  **Identify the color:** Look for a GREEN (win), RED (loss), or GRAY/NEUTRAL (draw) color for each score.
2.  **Apply the rule:**
    - If the box is **GREEN**, the user's team **WON**. Their score is the higher of the two numbers.
    - If the box is **RED**, the user's team **LOST**. Their score is the lower of the two numbers.
    - If the box is **GRAY/NEUTRAL**, it's a **DRAW**.
3.  **Format the score:** Always format the final score as 'user_score-opponent_score'.

**Examples:**
- Score '3-5' in a GREEN box means a WIN -> Format as '5-3'.
- Score '1-2' in a GREEN box means a WIN -> Format as '2-1'.
- Score '4-1' in a RED box means a LOSS -> Format as '1-4'.
- Score '2-0' in a GREEN box means a WIN -> Format as '2-0'.

**Data to Extract:**
For each match found, return an object containing:
- opponent: The name of the opponent team.
- score: The final score, correctly interpreted using the color rule.`,
    };

    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: { parts: [textPart, imagePart] },
            config: {
                responseMimeType: "application/json",
                responseSchema: matchHistoryAnalysisSchema,
            },
        });

        const rawText = response.text;
        if (!rawText) throw new Error("Received an empty response from the API.");
        
        const jsonText = extractJson(rawText);
        const parsedJson = JSON.parse(jsonText);
        return parsedJson;

    } catch (error) {
        console.error("Error calling Gemini API for history image analysis:", error);
        throw new Error("Failed to analyze match history image with Gemini API.");
    }
};