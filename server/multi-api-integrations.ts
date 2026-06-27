import axios from "axios";
import { withCache, CACHE_TTL, generateCacheKey } from "./cache";

/**
 * Multi-API Integration for SofaPredict
 * Integrates SportAPI, OddsPapi, Football Prediction, and more
 * All calls are cached server-side to minimize external requests
 */

const RAPIDAPI_KEY = process.env.RAPIDAPI_KEY;

// ============================================================================
// SPORTAPI - Live scores, fixtures, team stats, standings
// ============================================================================

const SPORTAPI_HOST = "sportapi7.p.rapidapi.com";
const SPORTAPI_BASE_URL = "https://sportapi7.p.rapidapi.com";

function createSportAPIClient() {
  return axios.create({
    baseURL: SPORTAPI_BASE_URL,
    headers: {
      "x-rapidapi-key": RAPIDAPI_KEY,
      "x-rapidapi-host": SPORTAPI_HOST,
    },
  });
}

/**
 * Get live matches across all sports
 */
export async function getSportAPILiveMatches(sportId?: number, leagueId?: number) {
  const cacheKey = generateCacheKey("sportapi", {
    endpoint: "events/live",
    sport: sportId,
    league: leagueId,
  });

  return withCache(cacheKey, "rapidapi", 60, async () => {
    const client = createSportAPIClient();
    const params: any = {};
    if (sportId) params.sport_id = sportId;
    if (leagueId) params.league_id = leagueId;

    const response = await client.get("/events/live", { params });
    return response.data;
  });
}

/**
 * Get upcoming matches
 */
export async function getSportAPIUpcomingMatches(
  sportId?: number,
  leagueId?: number,
  dateFrom?: string,
  dateTo?: string
) {
  const cacheKey = generateCacheKey("sportapi", {
    endpoint: "events/upcoming",
    sport: sportId,
    league: leagueId,
    from: dateFrom,
    to: dateTo,
  });

  return withCache(cacheKey, "rapidapi", 300, async () => {
    const client = createSportAPIClient();
    const params: any = {};
    if (sportId) params.sport_id = sportId;
    if (leagueId) params.league_id = leagueId;
    if (dateFrom) params.date_from = dateFrom;
    if (dateTo) params.date_to = dateTo;

    const response = await client.get("/events/upcoming", { params });
    return response.data;
  });
}

/**
 * Get event/match details
 */
export async function getSportAPIEventDetails(eventId: number) {
  const cacheKey = generateCacheKey("sportapi", {
    endpoint: "events",
    id: eventId,
  });

  return withCache(cacheKey, "rapidapi", 120, async () => {
    const client = createSportAPIClient();
    const response = await client.get(`/events/${eventId}`);
    return response.data;
  });
}

/**
 * Get team statistics
 */
export async function getSportAPITeamStats(teamId: number, leagueId?: number, season?: number) {
  const cacheKey = generateCacheKey("sportapi", {
    endpoint: "teams/statistics",
    team: teamId,
    league: leagueId,
    season,
  });

  return withCache(cacheKey, "rapidapi", CACHE_TTL.TEAM_STATS, async () => {
    const client = createSportAPIClient();
    const params: any = {};
    if (leagueId) params.league_id = leagueId;
    if (season) params.season = season;

    const response = await client.get(`/teams/${teamId}/statistics`, { params });
    return response.data;
  });
}

/**
 * Get standings/table
 */
export async function getSportAPIStandings(leagueId: number, season?: number) {
  const cacheKey = generateCacheKey("sportapi", {
    endpoint: "standings",
    league: leagueId,
    season,
  });

  return withCache(cacheKey, "rapidapi", CACHE_TTL.STANDINGS, async () => {
    const client = createSportAPIClient();
    const params: any = { league_id: leagueId };
    if (season) params.season = season;

    const response = await client.get("/standings", { params });
    return response.data;
  });
}

/**
 * Get team info
 */
export async function getSportAPITeamInfo(teamId: number) {
  const cacheKey = generateCacheKey("sportapi", {
    endpoint: "teams",
    id: teamId,
  });

  return withCache(cacheKey, "rapidapi", 86400, async () => {
    const client = createSportAPIClient();
    const response = await client.get(`/teams/${teamId}`);
    return response.data;
  });
}

/**
 * Get team players
 */
export async function getSportAPITeamPlayers(teamId: number) {
  const cacheKey = generateCacheKey("sportapi", {
    endpoint: "teams/players",
    id: teamId,
  });

  return withCache(cacheKey, "rapidapi", 86400, async () => {
    const client = createSportAPIClient();
    const response = await client.get(`/teams/${teamId}/players`);
    return response.data;
  });
}

/**
 * Get head-to-head history
 */
export async function getSportAPIHeadToHead(team1Id: number, team2Id: number, limit: number = 10) {
  const cacheKey = generateCacheKey("sportapi", {
    endpoint: "events/h2h",
    team1: team1Id,
    team2: team2Id,
    limit,
  });

  return withCache(cacheKey, "rapidapi", 7200, async () => {
    const client = createSportAPIClient();
    const response = await client.get("/events/h2h", {
      params: {
        team1_id: team1Id,
        team2_id: team2Id,
        limit,
      },
    });
    return response.data;
  });
}

// ============================================================================
// ODDSPAPI - Real-time odds from 300+ sportsbooks
// ============================================================================

const ODDSPAPI_HOST = "odds-api1.p.rapidapi.com";
const ODDSPAPI_BASE_URL = "https://odds-api1.p.rapidapi.com";

function createOddsPapiClient() {
  return axios.create({
    baseURL: ODDSPAPI_BASE_URL,
    headers: {
      "x-rapidapi-key": RAPIDAPI_KEY,
      "x-rapidapi-host": ODDSPAPI_HOST,
    },
  });
}

/**
 * Get live odds
 */
export async function getOddsLive(sport: string, league?: string, marketType?: string) {
  const cacheKey = generateCacheKey("oddspapi", {
    endpoint: "live-odds",
    sport,
    league,
    market: marketType,
  });

  return withCache(cacheKey, "rapidapi", 60, async () => {
    const client = createOddsPapiClient();
    const params: any = { sport };
    if (league) params.league = league;
    if (marketType) params.market_type = marketType;

    const response = await client.get("/live-odds", { params });
    return response.data;
  });
}

/**
 * Get odds for specific fixture
 */
export async function getOddsForFixture(fixtureId: number, bookmakers?: string[]) {
  const cacheKey = generateCacheKey("oddspapi", {
    endpoint: "odds/fixture",
    id: fixtureId,
    bookmakers: bookmakers?.join(","),
  });

  return withCache(cacheKey, "rapidapi", 60, async () => {
    const client = createOddsPapiClient();
    const params: any = {};
    if (bookmakers) params.bookmakers = bookmakers.join(",");

    const response = await client.get(`/odds/fixture/${fixtureId}`, { params });
    return response.data;
  });
}

/**
 * Get odds history
 */
export async function getOddsHistory(fixtureId: number, bookmaker?: string) {
  const cacheKey = generateCacheKey("oddspapi", {
    endpoint: "odds/history",
    fixture: fixtureId,
    bookmaker,
  });

  return withCache(cacheKey, "rapidapi", 3600, async () => {
    const client = createOddsPapiClient();
    const params: any = {};
    if (bookmaker) params.bookmaker = bookmaker;

    const response = await client.get(`/odds/history`, {
      params: { fixture_id: fixtureId, ...params },
    });
    return response.data;
  });
}

/**
 * Get available bookmakers
 */
export async function getAvailableBookmakers() {
  const cacheKey = generateCacheKey("oddspapi", {
    endpoint: "bookmakers",
  });

  return withCache(cacheKey, "rapidapi", 86400, async () => {
    const client = createOddsPapiClient();
    const response = await client.get("/bookmakers");
    return response.data;
  });
}

// ============================================================================
// FOOTBALL PREDICTION API - Predictions with confidence
// ============================================================================

const PREDICTION_HOST = "boggio-analytics.p.rapidapi.com";
const PREDICTION_BASE_URL = "https://boggio-analytics.p.rapidapi.com";

function createPredictionClient() {
  return axios.create({
    baseURL: PREDICTION_BASE_URL,
    headers: {
      "x-rapidapi-key": RAPIDAPI_KEY,
      "x-rapidapi-host": PREDICTION_HOST,
    },
  });
}

/**
 * Get prediction for specific match
 */
export async function getMatchPrediction(fixtureId: number, leagueId?: number) {
  const cacheKey = generateCacheKey("prediction", {
    endpoint: "prediction",
    fixture: fixtureId,
    league: leagueId,
  });

  return withCache(cacheKey, "rapidapi", CACHE_TTL.GEMINI_ANALYSIS, async () => {
    const client = createPredictionClient();
    const params: any = { fixture_id: fixtureId };
    if (leagueId) params.league_id = leagueId;

    const response = await client.get("/prediction", { params });
    return response.data;
  });
}

/**
 * Get today's predictions
 */
export async function getTodayPredictions(leagueId?: number) {
  const cacheKey = generateCacheKey("prediction", {
    endpoint: "predictions/today",
    league: leagueId,
  });

  return withCache(cacheKey, "rapidapi", 3600, async () => {
    const client = createPredictionClient();
    const params: any = {};
    if (leagueId) params.league_id = leagueId;

    const response = await client.get("/predictions/today", { params });
    return response.data;
  });
}

/**
 * Get prediction performance
 */
export async function getPredictionPerformance(period: "week" | "month" | "season" = "week") {
  const cacheKey = generateCacheKey("prediction", {
    endpoint: "predictions/performance",
    period,
  });

  return withCache(cacheKey, "rapidapi", 86400, async () => {
    const client = createPredictionClient();
    const response = await client.get("/predictions/performance", {
      params: { period },
    });
    return response.data;
  });
}

// ============================================================================
// TODAY FOOTBALL PREDICTION - Real-time predictions
// ============================================================================

const TODAY_PREDICTION_HOST = "today-football-prediction.p.rapidapi.com";
const TODAY_PREDICTION_BASE_URL = "https://today-football-prediction.p.rapidapi.com";

function createTodayPredictionClient() {
  return axios.create({
    baseURL: TODAY_PREDICTION_BASE_URL,
    headers: {
      "x-rapidapi-key": RAPIDAPI_KEY,
      "x-rapidapi-host": TODAY_PREDICTION_HOST,
    },
  });
}

/**
 * Get today's match predictions
 */
export async function getTodayMatchPredictions(league?: string, country?: string) {
  const cacheKey = generateCacheKey("today-prediction", {
    endpoint: "predictions",
    league,
    country,
  });

  return withCache(cacheKey, "rapidapi", 3600, async () => {
    const client = createTodayPredictionClient();
    const params: any = {};
    if (league) params.league = league;
    if (country) params.country = country;

    const response = await client.get("/predictions", { params });
    return response.data;
  });
}

/**
 * Get detailed match analysis
 */
export async function getTodayMatchAnalysis(matchId: string) {
  const cacheKey = generateCacheKey("today-prediction", {
    endpoint: "match-analysis",
    id: matchId,
  });

  return withCache(cacheKey, "rapidapi", CACHE_TTL.GEMINI_ANALYSIS, async () => {
    const client = createTodayPredictionClient();
    const response = await client.get(`/match-analysis/${matchId}`);
    return response.data;
  });
}

// ============================================================================
// SPORTSBOOK API - US Sportsbooks odds
// ============================================================================

const SPORTSBOOK_HOST = "sportsbook-api2.p.rapidapi.com";
const SPORTSBOOK_BASE_URL = "https://sportsbook-api2.p.rapidapi.com";

function createSportsbookClient() {
  return axios.create({
    baseURL: SPORTSBOOK_BASE_URL,
    headers: {
      "x-rapidapi-key": RAPIDAPI_KEY,
      "x-rapidapi-host": SPORTSBOOK_HOST,
    },
  });
}

/**
 * Get US sportsbook odds
 */
export async function getUSBookOdds(sport: string, league?: string, date?: string) {
  const cacheKey = generateCacheKey("sportsbook", {
    endpoint: "odds",
    sport,
    league,
    date,
  });

  return withCache(cacheKey, "rapidapi", 60, async () => {
    const client = createSportsbookClient();
    const params: any = { sport };
    if (league) params.league = league;
    if (date) params.date = date;

    const response = await client.get("/odds", { params });
    return response.data;
  });
}

/**
 * Get betting lines
 */
export async function getUSBookLines(sport: string, league?: string, date?: string) {
  const cacheKey = generateCacheKey("sportsbook", {
    endpoint: "lines",
    sport,
    league,
    date,
  });

  return withCache(cacheKey, "rapidapi", 30, async () => {
    const client = createSportsbookClient();
    const params: any = { sport };
    if (league) params.league = league;
    if (date) params.date = date;

    const response = await client.get("/lines", { params });
    return response.data;
  });
}

// ============================================================================
// Utility Functions
// ============================================================================

/**
 * Aggregate odds from multiple sources for arbitrage detection
 */
export async function aggregateOdds(fixtureId: number, sport: string) {
  const [oddsPapi, sportsbook] = await Promise.allSettled([
    getOddsForFixture(fixtureId),
    getUSBookOdds(sport),
  ]);

  return {
    oddsPapi: oddsPapi.status === "fulfilled" ? oddsPapi.value : null,
    sportsbook: sportsbook.status === "fulfilled" ? sportsbook.value : null,
  };
}

/**
 * Combine match data from multiple sources
 */
export async function getEnrichedMatchData(eventId: number, fixtureId: number) {
  const [matchData, odds, prediction] = await Promise.allSettled([
    getSportAPIEventDetails(eventId),
    getOddsForFixture(fixtureId),
    getMatchPrediction(fixtureId),
  ]);

  return {
    match: matchData.status === "fulfilled" ? matchData.value : null,
    odds: odds.status === "fulfilled" ? odds.value : null,
    prediction: prediction.status === "fulfilled" ? prediction.value : null,
  };
}
