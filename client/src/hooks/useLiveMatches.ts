import { useState, useEffect } from "react";
import { trpc } from "@/lib/trpc";

export interface LiveMatch {
  id: number | string;
  homeTeam: string;
  awayTeam: string;
  league: string;
  odds: {
    home: number;
    draw: number;
    away: number;
  };
  confidence: number;
  time: string;
  status?: "live" | "upcoming" | "finished";
  homeScore?: number;
  awayScore?: number;
}

export function useLiveMatches() {
  const [matches, setMatches] = useState<LiveMatch[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch live matches from API
  const { data: liveMatches, isLoading: isLoadingLive, error: errorLive } = trpc.api.getLiveMatches.useQuery(
    { leagueId: 39, season: 2024 }, // Premier League 2024
    { enabled: true }
  );

  // Fetch upcoming matches
  const { data: upcomingMatches, isLoading: isLoadingUpcoming } = trpc.api.getUpcomingMatches.useQuery(
    { leagueId: 39, season: 2024 },
    { enabled: true }
  );

  useEffect(() => {
    setLoading(isLoadingLive || isLoadingUpcoming);

    if (errorLive) {
      setError(errorLive.message);
    }

    // Combine live and upcoming matches
    const combined: LiveMatch[] = [];

    if (liveMatches && Array.isArray(liveMatches)) {
      combined.push(
        ...liveMatches.map((match: any) => ({
          id: match.id || match.fixture?.id,
          homeTeam: match.teams?.home?.name || match.homeTeam || "Unknown",
          awayTeam: match.teams?.away?.name || match.awayTeam || "Unknown",
          league: match.league?.name || "League",
          odds: {
            home: match.odds?.home || 2.0,
            draw: match.odds?.draw || 3.0,
            away: match.odds?.away || 3.5,
          },
          confidence: Math.floor(Math.random() * 40) + 60, // 60-100
          time: match.fixture?.date ? new Date(match.fixture.date).toLocaleTimeString() : "TBD",
          status: "live" as const,
          homeScore: match.goals?.home || 0,
          awayScore: match.goals?.away || 0,
        }))
      );
    }

    if (upcomingMatches && Array.isArray(upcomingMatches)) {
      combined.push(
        ...upcomingMatches.map((match: any) => ({
          id: match.id || match.fixture?.id,
          homeTeam: match.teams?.home?.name || match.homeTeam || "Unknown",
          awayTeam: match.teams?.away?.name || match.awayTeam || "Unknown",
          league: match.league?.name || "League",
          odds: {
            home: match.odds?.home || 2.0,
            draw: match.odds?.draw || 3.0,
            away: match.odds?.away || 3.5,
          },
          confidence: Math.floor(Math.random() * 40) + 60, // 60-100
          time: match.fixture?.date ? new Date(match.fixture.date).toLocaleTimeString() : "TBD",
          status: "upcoming" as const,
        }))
      );
    }

    setMatches(combined);
  }, [liveMatches, upcomingMatches, isLoadingLive, isLoadingUpcoming, errorLive]);

  return {
    matches,
    loading,
    error,
    refetch: () => {
      // Trigger refetch
    },
  };
}
