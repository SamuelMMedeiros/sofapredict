import axios from "axios";
import { withCache, CACHE_TTL, generateCacheKey } from "./cache";

/**
 * RapidAPI (API-Football) integration with caching
 * All API calls are cached server-side to minimize external requests
 */

const RAPIDAPI_HOST = "api-football-v1.p.rapidapi.com";
const RAPIDAPI_BASE_URL = "https://api-football-v1.p.rapidapi.com/v3";

/**
 * Get RapidAPI key from environment or user profile
 */
function getRapidApiKey(): string {
  const key = process.env.RAPIDAPI_KEY;
  if (!key) {
    throw new Error("RAPIDAPI_KEY not configured in environment");
  }
  return key;
}

/**
 * Create axios instance for RapidAPI calls
 */
function createRapidApiClient() {
  return axios.create({
    baseURL: RAPIDAPI_BASE_URL,
    headers: {
      "x-rapidapi-key": getRapidApiKey(),
      "x-rapidapi-host": RAPIDAPI_HOST,
    },
  });
}

/**
 * Fetch live matches for a specific league
 */
export async function getLiveMatches(leagueId: number, season: number) {
  const cacheKey = generateCacheKey("rapidapi", { endpoint: "fixtures", live: "all", league: leagueId, season });

  return withCache(cacheKey, "rapidapi", CACHE_TTL.MATCHES, async () => {
    const client = createRapidApiClient();
    const response = await client.get("/fixtures", {
      params: {
        live: "all",
        league: leagueId,
        season,
      },
    });
    return response.data;
  });
}

/**
 * Fetch upcoming matches for a specific league
 */
export async function getUpcomingMatches(leagueId: number, season: number, days: number = 7) {
  const fromDate = new Date().toISOString().split("T")[0];
  const toDate = new Date(Date.now() + days * 24 * 60 * 60 * 1000).toISOString().split("T")[0];

  const cacheKey = generateCacheKey("rapidapi", {
    endpoint: "fixtures",
    league: leagueId,
    season,
    from: fromDate,
    to: toDate,
  });

  return withCache(cacheKey, "rapidapi", CACHE_TTL.MATCHES, async () => {
    const client = createRapidApiClient();
    const response = await client.get("/fixtures", {
      params: {
        league: leagueId,
        season,
        from: fromDate,
        to: toDate,
      },
    });
    return response.data;
  });
}

/**
 * Fetch match details and statistics
 */
export async function getMatchDetails(fixtureId: number) {
  const cacheKey = generateCacheKey("rapidapi", { endpoint: "fixtures", id: fixtureId });

  return withCache(cacheKey, "rapidapi", CACHE_TTL.MATCHES, async () => {
    const client = createRapidApiClient();
    const response = await client.get("/fixtures", {
      params: {
        id: fixtureId,
      },
    });
    return response.data;
  });
}

/**
 * Fetch team statistics
 */
export async function getTeamStats(teamId: number, season: number, leagueId: number) {
  const cacheKey = generateCacheKey("rapidapi", {
    endpoint: "teams/statistics",
    team: teamId,
    season,
    league: leagueId,
  });

  return withCache(cacheKey, "rapidapi", CACHE_TTL.TEAM_STATS, async () => {
    const client = createRapidApiClient();
    const response = await client.get("/teams/statistics", {
      params: {
        team: teamId,
        season,
        league: leagueId,
      },
    });
    return response.data;
  });
}

/**
 * Fetch league standings
 */
export async function getLeagueStandings(leagueId: number, season: number) {
  const cacheKey = generateCacheKey("rapidapi", {
    endpoint: "standings",
    league: leagueId,
    season,
  });

  return withCache(cacheKey, "rapidapi", CACHE_TTL.STANDINGS, async () => {
    const client = createRapidApiClient();
    const response = await client.get("/standings", {
      params: {
        league: leagueId,
        season,
      },
    });
    return response.data;
  });
}

/**
 * Fetch team information
 */
export async function getTeamInfo(teamId: number) {
  const cacheKey = generateCacheKey("rapidapi", { endpoint: "teams", id: teamId });

  return withCache(cacheKey, "rapidapi", CACHE_TTL.TEAM_STATS, async () => {
    const client = createRapidApiClient();
    const response = await client.get("/teams", {
      params: {
        id: teamId,
      },
    });
    return response.data;
  });
}

/**
 * Fetch player information
 */
export async function getPlayerInfo(playerId: number) {
  const cacheKey = generateCacheKey("rapidapi", { endpoint: "players", id: playerId });

  return withCache(cacheKey, "rapidapi", CACHE_TTL.TEAM_STATS, async () => {
    const client = createRapidApiClient();
    const response = await client.get("/players", {
      params: {
        id: playerId,
      },
    });
    return response.data;
  });
}

/**
 * Fetch head-to-head match history
 */
export async function getHeadToHead(teamId1: number, teamId2: number, last: number = 10) {
  const cacheKey = generateCacheKey("rapidapi", {
    endpoint: "fixtures/headtohead",
    h2h: `${teamId1}-${teamId2}`,
    last,
  });

  return withCache(cacheKey, "rapidapi", CACHE_TTL.TEAM_STATS, async () => {
    const client = createRapidApiClient();
    const response = await client.get("/fixtures/headtohead", {
      params: {
        h2h: `${teamId1}-${teamId2}`,
        last,
      },
    });
    return response.data;
  });
}

/**
 * Fetch referee information
 */
export async function getRefereeInfo(refereeId: number) {
  const cacheKey = generateCacheKey("rapidapi", { endpoint: "referees", id: refereeId });

  return withCache(cacheKey, "rapidapi", CACHE_TTL.TEAM_STATS, async () => {
    const client = createRapidApiClient();
    const response = await client.get("/referees", {
      params: {
        id: refereeId,
      },
    });
    return response.data;
  });
}
