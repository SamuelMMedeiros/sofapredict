import axios from "axios";
import { withCache, CACHE_TTL, generateCacheKey } from "./cache";

/**
 * BetMiner API integration for live odds and bookmaker data
 * Primary source for odds; SofaScore used as fallback
 */

const BETMINER_HOST = "betminer.p.rapidapi.com";
const BETMINER_BASE_URL = "https://betminer.p.rapidapi.com";

function getRapidApiKey(): string {
  const key = process.env.RAPIDAPI_KEY;
  if (!key) {
    throw new Error("RAPIDAPI_KEY not configured in environment");
  }
  return key;
}

function createBetMinerClient() {
  return axios.create({
    baseURL: BETMINER_BASE_URL,
    headers: {
      "x-rapidapi-key": getRapidApiKey(),
      "x-rapidapi-host": BETMINER_HOST,
    },
  });
}

/**
 * Get live odds from BetMiner for a specific match
 */
export async function getBetMinerLiveOdds(matchId: string | number) {
  const cacheKey = generateCacheKey("betminer", { 
    endpoint: "live-odds",
    matchId 
  });

  return withCache(cacheKey, "betminer", CACHE_TTL.MATCHES, async () => {
    try {
      const client = createBetMinerClient();
      const response = await client.get("/v1/odds/live", {
        params: {
          match_id: matchId,
        },
      });

      if (response.data?.odds) {
        return response.data.odds.map((odd: any) => ({
          bookmaker: odd.bookmaker || "Unknown",
          home: parseFloat(odd.home) || 2.0,
          draw: parseFloat(odd.draw) || 3.0,
          away: parseFloat(odd.away) || 3.5,
          timestamp: odd.timestamp || new Date().toISOString(),
        }));
      }
      return [];
    } catch (error) {
      console.error("BetMiner live odds error:", error);
      return [];
    }
  });
}

/**
 * Get available bookmakers from BetMiner
 */
export async function getBetMinerBookmakers() {
  const cacheKey = generateCacheKey("betminer", { endpoint: "bookmakers" });

  return withCache(cacheKey, "betminer", 86400, async () => {
    // Cache for 24 hours
    try {
      const client = createBetMinerClient();
      const response = await client.get("/v1/bookmakers");

      if (response.data?.bookmakers) {
        return response.data.bookmakers.map((bm: any) => ({
          id: bm.id,
          name: bm.name,
          country: bm.country,
          rating: bm.rating,
          isActive: bm.is_active,
        }));
      }
      return [];
    } catch (error) {
      console.error("BetMiner bookmakers error:", error);
      return [];
    }
  });
}

/**
 * Get odds comparison across bookmakers for a match
 */
export async function getBetMinerOddsComparison(matchId: string | number) {
  const cacheKey = generateCacheKey("betminer", { 
    endpoint: "odds-comparison",
    matchId 
  });

  return withCache(cacheKey, "betminer", CACHE_TTL.MATCHES, async () => {
    try {
      const client = createBetMinerClient();
      const response = await client.get("/v1/odds/comparison", {
        params: {
          match_id: matchId,
        },
      });

      if (response.data?.comparison) {
        return {
          matchId,
          bestOdds: {
            home: response.data.comparison.best_home,
            draw: response.data.comparison.best_draw,
            away: response.data.comparison.best_away,
          },
          bookmakers: response.data.comparison.bookmakers || [],
          timestamp: new Date().toISOString(),
        };
      }
      return null;
    } catch (error) {
      console.error("BetMiner odds comparison error:", error);
      return null;
    }
  });
}

/**
 * Get arbitrage opportunities from BetMiner
 */
export async function getBetMinerArbitrageOpportunities() {
  const cacheKey = generateCacheKey("betminer", { endpoint: "arbitrage" });

  return withCache(cacheKey, "betminer", 300, async () => {
    // Cache for 5 minutes - arbitrage opportunities change frequently
    try {
      const client = createBetMinerClient();
      const response = await client.get("/v1/arbitrage");

      if (response.data?.opportunities) {
        return response.data.opportunities.map((opp: any) => ({
          matchId: opp.match_id,
          homeTeam: opp.home_team,
          awayTeam: opp.away_team,
          league: opp.league,
          roi: parseFloat(opp.roi) || 0,
          bestOdds: {
            home: opp.best_odds.home,
            draw: opp.best_odds.draw,
            away: opp.best_odds.away,
          },
          bookmakers: opp.bookmakers,
          timestamp: opp.timestamp,
        }));
      }
      return [];
    } catch (error) {
      console.error("BetMiner arbitrage error:", error);
      throw error;
    }
  });
}

/**
 * Get market trends from BetMiner
 */
export async function getBetMinerMarketTrends(matchId: string | number) {
  const cacheKey = generateCacheKey("betminer", { 
    endpoint: "trends",
    matchId 
  });

  return withCache(cacheKey, "betminer", CACHE_TTL.MATCHES, async () => {
    try {
      const client = createBetMinerClient();
      const response = await client.get("/v1/trends", {
        params: {
          match_id: matchId,
        },
      });

      if (response.data?.trends) {
        return {
          matchId,
          homeOddsTrend: response.data.trends.home_trend,
          drawOddsTrend: response.data.trends.draw_trend,
          awayOddsTrend: response.data.trends.away_trend,
          publicBets: response.data.trends.public_bets,
          timestamp: new Date().toISOString(),
        };
      }
      return null;
    } catch (error) {
      console.error("BetMiner trends error:", error);
      throw error;
    }
  });
}
