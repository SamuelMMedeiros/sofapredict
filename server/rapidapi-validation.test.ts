import { describe, it, expect } from "vitest";

describe("RapidAPI Configuration", () => {
  it("should have RapidAPI key configured", () => {
    const rapidApiKey = process.env.RAPIDAPI_KEY;
    expect(rapidApiKey).toBeDefined();
    expect(rapidApiKey).toBeTruthy();
    expect(rapidApiKey?.length).toBeGreaterThan(10);
    console.log("✅ RapidAPI key is configured");
  });

  it("should have all cache TTL variables configured", () => {
    const ttlVars = [
      "CACHE_TTL_ODDS",
      "CACHE_TTL_LIVE_MATCHES",
      "CACHE_TTL_UPCOMING",
      "CACHE_TTL_TEAM_STATS",
      "CACHE_TTL_STANDINGS",
      "CACHE_TTL_PREDICTIONS",
      "CACHE_TTL_TEAM_INFO",
    ];

    ttlVars.forEach(varName => {
      const value = process.env[varName];
      expect(value).toBeDefined();
      const ttl = parseInt(value || "0");
      expect(ttl).toBeGreaterThan(0);
    });

    console.log("✅ All cache TTL variables are valid");
  });

  it("should have Gemini API key configured", () => {
    const geminiKey = process.env.GEMINI_API_KEY;
    expect(geminiKey).toBeDefined();
    expect(geminiKey).toBeTruthy();
    console.log("✅ Gemini API key is configured");
  });
});
