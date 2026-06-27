import { withCache, CACHE_TTL, generateCacheKey } from "./cache";
import { invokeLLM } from "./_core/llm";

/**
 * Google Gemini AI integration for match analysis and predictions
 * All responses are cached to minimize API calls
 */

interface MatchAnalysisInput {
  homeTeam: string;
  awayTeam: string;
  league: string;
  homeStats: Record<string, any>;
  awayStats: Record<string, any>;
  recentForm: {
    home: string[];
    away: string[];
  };
  headToHead?: Record<string, any>;
}

interface MatchAnalysisResult {
  prediction: "1" | "X" | "2";
  confidence: number;
  analysis: string;
  keyFactors: string[];
  recommendedBets: Array<{
    type: string;
    odds: number;
    reasoning: string;
    confidence: number;
  }>;
}

/**
 * Generate match analysis using Gemini
 */
export async function analyzeMatch(input: MatchAnalysisInput): Promise<MatchAnalysisResult> {
  const cacheKey = generateCacheKey("gemini", {
    endpoint: "analyzeMatch",
    homeTeam: input.homeTeam,
    awayTeam: input.awayTeam,
    league: input.league,
  });

  return withCache(cacheKey, "gemini", CACHE_TTL.GEMINI_ANALYSIS, async () => {
    const prompt = buildMatchAnalysisPrompt(input);

    const response = await invokeLLM({
      messages: [
        {
          role: "system",
          content: `You are an expert sports analyst specializing in football predictions. 
          Provide detailed match analysis with confidence scores and betting recommendations.
          Always respond with valid JSON.`,
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      response_format: {
        type: "json_schema",
        json_schema: {
          name: "match_analysis",
          strict: true,
          schema: {
            type: "object",
            properties: {
              prediction: {
                type: "string",
                enum: ["1", "X", "2"],
                description: "Match prediction: 1 (home win), X (draw), 2 (away win)",
              },
              confidence: {
                type: "number",
                minimum: 0,
                maximum: 100,
                description: "Confidence level of prediction (0-100)",
              },
              analysis: {
                type: "string",
                description: "Detailed analysis of the match",
              },
              keyFactors: {
                type: "array",
                items: { type: "string" },
                description: "Key factors influencing the prediction",
              },
              recommendedBets: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    type: { type: "string" },
                    odds: { type: "number" },
                    reasoning: { type: "string" },
                    confidence: { type: "number" },
                  },
                  required: ["type", "odds", "reasoning", "confidence"],
                },
              },
            },
            required: ["prediction", "confidence", "analysis", "keyFactors", "recommendedBets"],
          },
        },
      },
    });

    const content = response.choices[0]?.message.content;
    if (!content || typeof content !== "string") {
      throw new Error("No response from Gemini");
    }

    const parsed = JSON.parse(content);
    return {
      prediction: parsed.prediction,
      confidence: Math.min(100, Math.max(0, parsed.confidence)),
      analysis: parsed.analysis,
      keyFactors: parsed.keyFactors || [],
      recommendedBets: parsed.recommendedBets || [],
    };
  });
}

/**
 * Generate AI-recommended triple (3 matches)
 */
export async function generateRecommendedTriple(matches: MatchAnalysisInput[]): Promise<{
  matches: Array<MatchAnalysisResult & { matchId: string }>;
  compositeOdds: number;
  overallConfidence: number;
  reasoning: string;
}> {
  const cacheKey = generateCacheKey("gemini", {
    endpoint: "recommendedTriple",
    matchIds: matches.map(m => `${m.homeTeam}-${m.awayTeam}`).join("|"),
  });

  return withCache(cacheKey, "gemini", CACHE_TTL.GEMINI_ANALYSIS, async () => {
    const analyses = await Promise.all(matches.map(m => analyzeMatch(m)));

    const prompt = `
    Based on these three match analyses, create a recommended triple bet:
    
    ${analyses
      .map(
        (a, i) => `
    Match ${i + 1}:
    - Prediction: ${a.prediction}
    - Confidence: ${a.confidence}%
    - Analysis: ${a.analysis}
    `
      )
      .join("\n")}
    
    Provide:
    1. The best selection for each match
    2. Composite odds calculation
    3. Overall confidence for the triple
    4. Reasoning for this combination
    
    Respond with valid JSON.
    `;

    const response = await invokeLLM({
      messages: [
        {
          role: "system",
          content: `You are an expert sports betting analyst. 
          Analyze multiple matches and recommend the best triple bet combination.
          Always respond with valid JSON.`,
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      response_format: {
        type: "json_schema",
        json_schema: {
          name: "recommended_triple",
          strict: true,
          schema: {
            type: "object",
            properties: {
              selections: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    matchIndex: { type: "number" },
                    selection: { type: "string" },
                    odds: { type: "number" },
                  },
                },
              },
              compositeOdds: { type: "number" },
              overallConfidence: { type: "number" },
              reasoning: { type: "string" },
            },
            required: ["selections", "compositeOdds", "overallConfidence", "reasoning"],
          },
        },
      },
    });

    const content = response.choices[0]?.message.content;
    if (!content || typeof content !== "string") {
      throw new Error("No response from Gemini");
    }

    const parsed = JSON.parse(content);

    return {
      matches: analyses.map((a, i) => ({
        ...a,
        matchId: `${matches[i].homeTeam}-${matches[i].awayTeam}`,
      })),
      compositeOdds: parsed.compositeOdds || 0,
      overallConfidence: Math.min(100, Math.max(0, parsed.overallConfidence)),
      reasoning: parsed.reasoning || "",
    };
  });
}

/**
 * Build detailed prompt for match analysis
 */
function buildMatchAnalysisPrompt(input: MatchAnalysisInput): string {
  return `
  Analyze this football match:
  
  **Match Details:**
  - Home Team: ${input.homeTeam}
  - Away Team: ${input.awayTeam}
  - League: ${input.league}
  
  **Home Team Statistics:**
  ${JSON.stringify(input.homeStats, null, 2)}
  
  **Away Team Statistics:**
  ${JSON.stringify(input.awayStats, null, 2)}
  
  **Recent Form:**
  - ${input.homeTeam}: ${input.recentForm.home.join(", ")}
  - ${input.awayTeam}: ${input.recentForm.away.join(", ")}
  
  ${
    input.headToHead
      ? `**Head-to-Head History:**
  ${JSON.stringify(input.headToHead, null, 2)}`
      : ""
  }
  
  Provide a comprehensive match analysis with:
  1. Match prediction (1, X, or 2)
  2. Confidence level (0-100)
  3. Detailed analysis
  4. Key factors influencing the prediction
  5. Recommended bets with odds and reasoning
  `;
}

/**
 * Generate injury impact analysis
 */
export async function analyzeInjuryImpact(
  team: string,
  injuries: Array<{ player: string; position: string; severity: string }>
): Promise<{
  overallImpact: number;
  affectedPositions: string[];
  analysis: string;
  oddsAdjustment: number;
}> {
  const cacheKey = generateCacheKey("gemini", {
    endpoint: "injuryImpact",
    team,
    injuries: injuries.map(i => i.player).join("|"),
  });

  return withCache(cacheKey, "gemini", CACHE_TTL.GEMINI_ANALYSIS, async () => {
    const prompt = `
    Analyze the impact of these injuries on ${team}:
    
    ${injuries.map(i => `- ${i.player} (${i.position}): ${i.severity}`).join("\n")}
    
    Provide:
    1. Overall impact percentage (0-100)
    2. Affected positions
    3. Analysis of tactical implications
    4. Suggested odds adjustment (e.g., -0.05 for worse odds)
    
    Respond with valid JSON.
    `;

    const response = await invokeLLM({
      messages: [
        {
          role: "system",
          content: "You are an expert football analyst. Analyze injury impacts on team performance.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      response_format: {
        type: "json_schema",
        json_schema: {
          name: "injury_impact",
          strict: true,
          schema: {
            type: "object",
            properties: {
              overallImpact: { type: "number" },
              affectedPositions: { type: "array", items: { type: "string" } },
              analysis: { type: "string" },
              oddsAdjustment: { type: "number" },
            },
            required: ["overallImpact", "affectedPositions", "analysis", "oddsAdjustment"],
          },
        },
      },
    });

    const content = response.choices[0]?.message.content;
    if (!content || typeof content !== "string") {
      throw new Error("No response from Gemini");
    }

    const parsed = JSON.parse(content);
    return {
      overallImpact: Math.min(100, Math.max(0, parsed.overallImpact)),
      affectedPositions: parsed.affectedPositions || [],
      analysis: parsed.analysis || "",
      oddsAdjustment: parsed.oddsAdjustment || 0,
    };
  });
}
