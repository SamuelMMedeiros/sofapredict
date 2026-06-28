import { invokeLLM } from "./_core/llm";
import { getDb } from "./db";
import { eq } from "drizzle-orm";
import { apiCache } from "../drizzle/schema";
import { z } from "zod";

export interface MatchAnalysis {
  matchId: string | number;
  homeTeam: string;
  awayTeam: string;
  analysis: string;
  confidence: number;
  prediction: "home" | "draw" | "away";
  keyFactors: string[];
  riskLevel: "low" | "medium" | "high";
}

/**
 * Generate AI analysis for a match using Gemini
 * Results are cached to avoid duplicate API calls
 */
export async function generateMatchAnalysis(
  matchId: string | number,
  homeTeam: string,
  awayTeam: string,
  league: string,
  homeStats?: {
    wins: number;
    draws: number;
    losses: number;
    goalsFor: number;
    goalsAgainst: number;
  },
  awayStats?: {
    wins: number;
    draws: number;
    losses: number;
    goalsFor: number;
    goalsAgainst: number;
  }
): Promise<MatchAnalysis> {
  try {
    // Check cache first
    const db = await getDb();
    if (db) {
      try {
        const cached = await db
          .select()
          .from(apiCache)
          .where(eq(apiCache.cacheKey, `gemini_analysis_${matchId}`))
          .limit(1);

        if (cached.length > 0) {
          const cachedData = JSON.parse(cached[0].data as string);
          if (new Date().getTime() - cachedData.timestamp < 3600000) {
            // 1 hour cache
            return cachedData.analysis;
          }
        }
      } catch (error) {
        console.warn("[Cache] Failed to read cache:", error);
      }
    }

    // Build prompt for Gemini
    const prompt = `Analyze this football match and provide a prediction with confidence level:

Match: ${homeTeam} vs ${awayTeam}
League: ${league}

${
  homeStats
    ? `${homeTeam} Recent Form: ${homeStats.wins}W-${homeStats.draws}D-${homeStats.losses}L, ${homeStats.goalsFor}GF-${homeStats.goalsAgainst}GA`
    : ""
}
${
  awayStats
    ? `${awayTeam} Recent Form: ${awayStats.wins}W-${awayStats.draws}D-${awayStats.losses}L, ${awayStats.goalsFor}GF-${awayStats.goalsAgainst}GA`
    : ""
}

Please provide:
1. A brief analysis (2-3 sentences)
2. Your prediction (1, X, or 2)
3. Confidence level (0-100)
4. Key factors affecting the match (3-4 points)
5. Risk level (low/medium/high)

Format your response as JSON with keys: analysis, prediction, confidence, keyFactors (array), riskLevel`;

    const response = await invokeLLM({
      messages: [
        {
          role: "system",
          content:
            "You are an expert football analyst. Provide accurate match predictions based on team statistics and form. Always respond with valid JSON.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
    });

    // Parse Gemini response
    const responseText =
      typeof response.choices[0].message.content === "string"
        ? response.choices[0].message.content
        : "";

    // Extract JSON from response
    const jsonMatch = responseText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error("Failed to parse Gemini response");
    }

    const analysisData = JSON.parse(jsonMatch[0]);

    const analysis: MatchAnalysis = {
      matchId,
      homeTeam,
      awayTeam,
      analysis: analysisData.analysis || "Unable to generate analysis",
      confidence: Math.min(100, Math.max(0, analysisData.confidence || 65)),
      prediction: ((analysisData.prediction || "X").toLowerCase() === "1" ? "home" : (analysisData.prediction || "X").toLowerCase() === "2" ? "away" : "draw") as "home" | "draw" | "away",
      keyFactors: Array.isArray(analysisData.keyFactors) ? analysisData.keyFactors : [],
      riskLevel: (analysisData.riskLevel || "medium") as "low" | "medium" | "high",
    };

    // Cache the result
    if (db) {
      try {
        await db
          .insert(apiCache)
          .values({
            cacheKey: `gemini_analysis_${matchId}`,
            data: JSON.stringify({
              analysis,
              timestamp: new Date().getTime(),
            }),
            expiresAt: new Date(Date.now() + 3600000), // 1 hour
          })
          .onDuplicateKeyUpdate({
            set: {
              data: JSON.stringify({
                analysis,
                timestamp: new Date().getTime(),
              }),
              expiresAt: new Date(Date.now() + 3600000),
            },
          });
      } catch (cacheError) {
        console.warn("[Cache] Failed to cache analysis:", cacheError);
      }
    }

    return analysis;
  } catch (error) {
    console.error("[Gemini Analysis] Error:", error);

    // Return fallback analysis
    return {
      matchId,
      homeTeam,
      awayTeam,
      analysis: "Análise indisponível no momento. Tente novamente mais tarde.",
      confidence: 0,
      prediction: "draw",
      keyFactors: ["Dados insuficientes para análise"],
      riskLevel: "high",
    };
  }
}

/**
 * Batch generate analysis for multiple matches
 */
export async function generateBatchAnalysis(
  matches: Array<{
    id: string | number;
    homeTeam: string;
    awayTeam: string;
    league: string;
  }>
): Promise<MatchAnalysis[]> {
  return Promise.all(
    matches.map((match) =>
      generateMatchAnalysis(match.id, match.homeTeam, match.awayTeam, match.league)
    )
  );
}
