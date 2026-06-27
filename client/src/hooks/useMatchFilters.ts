import { useMemo } from "react";
import type { MatchFiltersState } from "@/components/MatchFilters";

export interface Match {
  id: number;
  homeTeam: string;
  awayTeam: string;
  league: string;
  odds: { home: number; draw: number; away: number };
  confidence: number;
  time: string;
}

export function useMatchFilters(matches: Match[], filters: MatchFiltersState) {
  return useMemo(() => {
    let filtered = [...matches];

    // Filter by league
    if (filters.league !== "all") {
      filtered = filtered.filter((match) => {
        const leagueMap: Record<string, string> = {
          brasileirao: "Brasileirão",
          "premier-league": "Premier League",
          "la-liga": "La Liga",
          "serie-a": "Serie A",
          "ligue-1": "Ligue 1",
          champions: "Champions League",
          "europa-league": "Europa League",
        };
        return match.league === leagueMap[filters.league];
      });
    }

    // Filter by team search
    if (filters.searchTeam.trim()) {
      const search = filters.searchTeam.toLowerCase();
      filtered = filtered.filter(
        (match) =>
          match.homeTeam.toLowerCase().includes(search) ||
          match.awayTeam.toLowerCase().includes(search)
      );
    }

    // Filter by confidence
    filtered = filtered.filter((match) => match.confidence >= filters.minConfidence);

    // Filter by odds range
    const avgOdds = (odds: { home: number; draw: number; away: number }) => {
      return (odds.home + odds.draw + odds.away) / 3;
    };

    filtered = filtered.filter((match) => {
      const avg = avgOdds(match.odds);
      return avg >= filters.minOdds && avg <= filters.maxOdds;
    });

    // Sort
    switch (filters.sortBy) {
      case "confidence":
        filtered.sort((a, b) => b.confidence - a.confidence);
        break;
      case "odds":
        filtered.sort((a, b) => {
          const avgA = avgOdds(a.odds);
          const avgB = avgOdds(b.odds);
          return avgB - avgA;
        });
        break;
      case "time":
        filtered.sort((a, b) => {
          const timeA = new Date(`2024-01-01 ${a.time}`).getTime();
          const timeB = new Date(`2024-01-01 ${b.time}`).getTime();
          return timeA - timeB;
        });
        break;
    }

    return filtered;
  }, [matches, filters]);
}
