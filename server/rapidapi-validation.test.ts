import { describe, it, expect } from "vitest";
import { CACHE_TTL } from "./cache";

describe("RapidAPI Configuration", () => {
  it.skipIf(!process.env.RAPIDAPI_KEY)("should have RapidAPI key configured", () => {
    const rapidApiKey = process.env.RAPIDAPI_KEY;
    expect(rapidApiKey).toBeDefined();
    expect(rapidApiKey).toBeTruthy();
    expect(rapidApiKey?.length).toBeGreaterThan(10);
    console.log("✅ RapidAPI key is configured");
  });

  it("should have positive cache defaults", () => {
    expect(CACHE_TTL.MATCHES).toBeGreaterThan(0);
    expect(CACHE_TTL.TEAM_STATS).toBeGreaterThan(0);
    expect(CACHE_TTL.GEMINI_ANALYSIS).toBeGreaterThan(0);
    expect(CACHE_TTL.STANDINGS).toBeGreaterThan(0);
  });

  it.skipIf(!process.env.GEMINI_API_KEY)("should have Gemini API key configured", () => {
    const geminiKey = process.env.GEMINI_API_KEY;
    expect(geminiKey).toBeDefined();
    expect(geminiKey).toBeTruthy();
    console.log("✅ Gemini API key is configured");
  });
});
