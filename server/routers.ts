import { COOKIE_NAME } from "../shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, router, protectedProcedure } from "./_core/trpc";
import { z } from "zod";
import * as userQueries from "./user-queries";
import * as apiIntegrations from "./api-integrations";
import * as geminiIntegration from "./gemini-integration";
import * as betMinerIntegration from "./betminer-integration";
import * as sofaScoreIntegration from "./sofascore-integration";
import { TRPCError } from "@trpc/server";

export const appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
  }),

  // User profile and preferences
  user: router({
    getProfile: protectedProcedure.query(async ({ ctx }) => {
      if (!ctx.user) throw new TRPCError({ code: "UNAUTHORIZED" });
      return await userQueries.getOrCreateUserProfile(ctx.user.id);
    }),

    updatePreferences: protectedProcedure
      .input(
        z.object({
          favoriteTeams: z.array(z.string()).max(5).optional(),
          oledModeActive: z.boolean().optional(),
          soundAlertsActive: z.boolean().optional(),
        })
      )
      .mutation(async ({ ctx, input }) => {
        if (!ctx.user) throw new TRPCError({ code: "UNAUTHORIZED" });
        const success = await userQueries.updateUserPreferences(ctx.user.id, input);
        if (!success) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
        return { success: true };
      }),

    getStats: protectedProcedure.query(async ({ ctx }) => {
      if (!ctx.user) throw new TRPCError({ code: "UNAUTHORIZED" });
      return await userQueries.getOrCreateUserStats(ctx.user.id);
    }),

    storeLgpdConsent: protectedProcedure
      .input(
        z.object({
          consentType: z.enum(["data_processing", "marketing", "analytics"]),
          consentGiven: z.boolean(),
        })
      )
      .mutation(async ({ ctx, input }) => {
        if (!ctx.user) throw new TRPCError({ code: "UNAUTHORIZED" });
        const success = await userQueries.storeLgpdConsent(
          ctx.user.id,
          input.consentType,
          input.consentGiven,
          ctx.req.ip,
          ctx.req.headers["user-agent"] as string
        );
        if (!success) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
        return { success: true };
      }),

    exportData: protectedProcedure.query(async ({ ctx }) => {
      if (!ctx.user) throw new TRPCError({ code: "UNAUTHORIZED" });
      const data = await userQueries.getUserDataForExport(ctx.user.id);
      if (!data) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
      return data;
    }),

    deleteAccount: protectedProcedure.mutation(async ({ ctx }) => {
      if (!ctx.user) throw new TRPCError({ code: "UNAUTHORIZED" });
      const success = await userQueries.deleteUserData(ctx.user.id);
      if (!success) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
      return { success: true };
    }),
  }),

  // Betting slips and history
  bets: router({
    createSlip: protectedProcedure
      .input(
        z.object({
          compositeOdds: z.string(),
          investedAmount: z.string(),
          projectedReturn: z.string(),
          selections: z.array(
            z.object({
              matchId: z.string(),
              league: z.string(),
              homeTeam: z.string(),
              awayTeam: z.string(),
              selectionLabel: z.string(),
              odd: z.number(),
              type: z.enum(["1", "X", "2"]),
            })
          ),
          notes: z.string().optional(),
        })
      )
      .mutation(async ({ ctx, input }) => {
        if (!ctx.user) throw new TRPCError({ code: "UNAUTHORIZED" });
        const result = await userQueries.createBettingSlip(ctx.user.id, input);
        if (!result) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
        return result;
      }),

    getHistory: protectedProcedure.query(async ({ ctx }) => {
      if (!ctx.user) throw new TRPCError({ code: "UNAUTHORIZED" });
      return await userQueries.getUserBettingHistory(ctx.user.id);
    }),

    updateStatus: protectedProcedure
      .input(
        z.object({
          betId: z.number(),
          status: z.enum(["pending", "won", "lost", "cancelled"]),
          actualReturn: z.string().optional(),
        })
      )
      .mutation(async ({ ctx, input }) => {
        if (!ctx.user) throw new TRPCError({ code: "UNAUTHORIZED" });
        const success = await userQueries.updateBetStatus(input.betId, input.status, input.actualReturn);
        if (!success) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
        await userQueries.updateUserStats(ctx.user.id);
        return { success: true };
      }),
  }),

  // API integrations
  api: router({
    getLiveMatches: publicProcedure
      .input(z.object({ leagueId: z.number(), season: z.number() }))
      .query(async ({ input }) => {
        try {
          return await apiIntegrations.getLiveMatches(input.leagueId, input.season);
        } catch (error) {
          console.error("[API] Error getting live matches:", error);
          throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
        }
      }),

    getUpcomingMatches: publicProcedure
      .input(z.object({ leagueId: z.number(), season: z.number(), days: z.number().optional() }))
      .query(async ({ input }) => {
        try {
          return await apiIntegrations.getUpcomingMatches(input.leagueId, input.season, input.days);
        } catch (error) {
          console.error("[API] Error getting upcoming matches:", error);
          throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
        }
      }),

    getMatchDetails: publicProcedure
      .input(z.object({ fixtureId: z.number() }))
      .query(async ({ input }) => {
        try {
          return await apiIntegrations.getMatchDetails(input.fixtureId);
        } catch (error) {
          console.error("[API] Error getting match details:", error);
          throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
        }
      }),

    getTeamStats: publicProcedure
      .input(z.object({ teamId: z.number(), season: z.number(), leagueId: z.number() }))
      .query(async ({ input }) => {
        try {
          return await apiIntegrations.getTeamStats(input.teamId, input.season, input.leagueId);
        } catch (error) {
          console.error("[API] Error getting team stats:", error);
          throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
        }
      }),

    getLeagueStandings: publicProcedure
      .input(z.object({ leagueId: z.number(), season: z.number() }))
      .query(async ({ input }) => {
        try {
          return await apiIntegrations.getLeagueStandings(input.leagueId, input.season);
        } catch (error) {
          console.error("[API] Error getting standings:", error);
          throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
        }
      }),

    getLiveOdds: publicProcedure
      .input(z.object({ matchId: z.string().or(z.number()) }))
      .query(async ({ input }) => {
        try {
          return await betMinerIntegration.getBetMinerLiveOdds(input.matchId);
        } catch (error) {
          console.error("[BetMiner] Error, trying SofaScore:", error);
          try {
            return await sofaScoreIntegration.getSofaScoreLiveMatches();
          } catch (sofaError) {
            console.error("[SofaScore] Fallback failed:", sofaError);
            throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
          }
        }
      }),

    getBookmakers: publicProcedure.query(async () => {
      try {
        return await betMinerIntegration.getBetMinerBookmakers();
      } catch (error) {
        console.error("[BetMiner] Error:", error);
        return [];
      }
    }),

    getSofaScoreLiveMatches: publicProcedure.query(async () => {
      try {
        const result = await sofaScoreIntegration.getSofaScoreLiveMatches();
        return result || [];
      } catch (error) {
        console.error("[SofaScore] Error:", error);
        return [];
      }
    }),

    getSofaScoreUpcomingMatches: publicProcedure
      .input(z.object({ days: z.number().optional() }))
      .query(async ({ input }) => {
        try {
          const result = await sofaScoreIntegration.getSofaScoreUpcomingMatches(input.days);
          return result || [];
        } catch (error) {
          console.error("[SofaScore] Error:", error);
          return [];
        }
      }),
  }),

  // AI analysis
  ai: router({
    analyzeMatch: publicProcedure
      .input(
        z.object({
          homeTeam: z.string(),
          awayTeam: z.string(),
          league: z.string(),
          homeStats: z.record(z.string(), z.any()),
          awayStats: z.record(z.string(), z.any()),
          recentForm: z.object({
            home: z.array(z.string()),
            away: z.array(z.string()),
          }),
          headToHead: z.record(z.string(), z.any()).optional(),
        })
      )
      .query(async ({ input }) => {
        try {
          return await geminiIntegration.analyzeMatch(input);
        } catch (error) {
          console.error("[AI] Error analyzing match:", error);
          throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
        }
      }),

    generateRecommendedTriple: publicProcedure
      .input(
        z.array(
          z.object({
            homeTeam: z.string(),
            awayTeam: z.string(),
            league: z.string(),
            homeStats: z.record(z.string(), z.any()),
            awayStats: z.record(z.string(), z.any()),
            recentForm: z.object({
              home: z.array(z.string()),
              away: z.array(z.string()),
            }),
            headToHead: z.record(z.string(), z.any()).optional(),
          })
        )
      )
      .query(async ({ input }) => {
        try {
          return await geminiIntegration.generateRecommendedTriple(input);
        } catch (error) {
          console.error("[AI] Error generating triple:", error);
          throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
        }
      }),

    analyzeInjuryImpact: publicProcedure
      .input(
        z.object({
          team: z.string(),
          injuries: z.array(
            z.object({
              player: z.string(),
              position: z.string(),
              severity: z.string(),
            })
          ),
        })
      )
      .query(async ({ input }) => {
        try {
          return await geminiIntegration.analyzeInjuryImpact(input.team, input.injuries);
        } catch (error) {
          console.error("[AI] Error analyzing injury impact:", error);
          throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
        }
      }),
  }),
});

export type AppRouter = typeof appRouter;
