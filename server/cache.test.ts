import { describe, it, expect, beforeEach, vi } from "vitest";
import { generateCacheKey, withCache } from "./cache";

describe("Cache System", () => {
  describe("generateCacheKey", () => {
    it("should generate consistent cache keys", () => {
      const params = { league: 71, season: 2024 };
      const key1 = generateCacheKey("rapidapi", params);
      const key2 = generateCacheKey("rapidapi", params);

      expect(key1).toBe(key2);
      expect(key1).toContain("rapidapi:");
    });

    it("should generate different keys for different sources", () => {
      const params = { league: 71 };
      const key1 = generateCacheKey("rapidapi", params);
      const key2 = generateCacheKey("gemini", params);

      expect(key1).not.toBe(key2);
    });

    it("should generate different keys for different params", () => {
      const key1 = generateCacheKey("rapidapi", { league: 71 });
      const key2 = generateCacheKey("rapidapi", { league: 72 });

      expect(key1).not.toBe(key2);
    });
  });

  describe("withCache", () => {
    it("should call fetch function and cache result", async () => {
      const mockFetch = vi.fn(async () => ({ data: "test" }));
      const result = await withCache("test-key", "rapidapi", 60, mockFetch);

      expect(result).toEqual({ data: "test" });
      expect(mockFetch).toHaveBeenCalledOnce();
    });

    it("should return cached data on second call", async () => {
      const mockFetch = vi.fn(async () => ({ data: "test" }));

      // First call
      await withCache("test-key-2", "rapidapi", 60, mockFetch);
      expect(mockFetch).toHaveBeenCalledTimes(1);

      // Second call should use cache
      const result = await withCache("test-key-2", "rapidapi", 60, mockFetch);
      expect(result).toEqual({ data: "test" });
      expect(mockFetch).toHaveBeenCalledTimes(1); // Still 1, not 2
    });

    it("should handle fetch errors gracefully", async () => {
      const mockFetch = vi.fn(async () => {
        throw new Error("API Error");
      });

      await expect(withCache("error-key", "rapidapi", 60, mockFetch)).rejects.toThrow("API Error");
    });
  });
});
