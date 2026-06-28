import { publicProcedure, router } from "./_core/trpc";
import { z } from "zod";
import { generateMatchAnalysis } from "./match-analysis";

export const analysisRouter = router({
  /**
   * Generate AI analysis for a single match
   */
  analyzeMatch: publicProcedure
    .input(
      z.object({
        matchId: z.union([z.string(), z.number()]),
        homeTeam: z.string(),
        awayTeam: z.string(),
        league: z.string(),
        homeStats: z
          .object({
            wins: z.number(),
            draws: z.number(),
            losses: z.number(),
            goalsFor: z.number(),
            goalsAgainst: z.number(),
          })
          .optional(),
        awayStats: z
          .object({
            wins: z.number(),
            draws: z.number(),
            losses: z.number(),
            goalsFor: z.number(),
            goalsAgainst: z.number(),
          })
          .optional(),
      })
    )
    .query(async ({ input }) => {
      return await generateMatchAnalysis(
        input.matchId,
        input.homeTeam,
        input.awayTeam,
        input.league,
        input.homeStats,
        input.awayStats
      );
    }),

  /**
   * Generate analysis for multiple matches (batch)
   */
  analyzeBatch: publicProcedure
    .input(
      z.array(
        z.object({
          matchId: z.union([z.string(), z.number()]),
          homeTeam: z.string(),
          awayTeam: z.string(),
          league: z.string(),
        })
      )
    )
    .query(async ({ input }) => {
      return Promise.all(
        input.map((match) =>
          generateMatchAnalysis(match.matchId, match.homeTeam, match.awayTeam, match.league)
        )
      );
    }),
});
