import { useState, useEffect } from "react";

export interface FavoriteTeam {
  id: string;
  name: string;
  league: string;
}

export interface FavoriteMatch {
  id: number;
  homeTeam: string;
  awayTeam: string;
  league: string;
  time: string;
}

const FAVORITES_STORAGE_KEY = "sofapredict_favorites";
const FAVORITE_MATCHES_STORAGE_KEY = "sofapredict_favorite_matches";

export function useFavorites() {
  const [favoriteTeams, setFavoriteTeams] = useState<FavoriteTeam[]>([]);
  const [favoriteMatches, setFavoriteMatches] = useState<FavoriteMatch[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const storedTeams = localStorage.getItem(FAVORITES_STORAGE_KEY);
      const storedMatches = localStorage.getItem(FAVORITE_MATCHES_STORAGE_KEY);

      if (storedTeams) {
        setFavoriteTeams(JSON.parse(storedTeams));
      }
      if (storedMatches) {
        setFavoriteMatches(JSON.parse(storedMatches));
      }
    } catch (error) {
      console.error("Failed to load favorites:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Save teams to localStorage
  const addFavoriteTeam = (team: FavoriteTeam) => {
    setFavoriteTeams((prev) => {
      const exists = prev.some((t) => t.id === team.id);
      if (exists) return prev;

      const updated = [...prev, team];
      localStorage.setItem(FAVORITES_STORAGE_KEY, JSON.stringify(updated));
      return updated;
    });
  };

  const removeFavoriteTeam = (teamId: string) => {
    setFavoriteTeams((prev) => {
      const updated = prev.filter((t) => t.id !== teamId);
      localStorage.setItem(FAVORITES_STORAGE_KEY, JSON.stringify(updated));
      return updated;
    });
  };

  const isFavoriteTeam = (teamId: string) => {
    return favoriteTeams.some((t) => t.id === teamId);
  };

  // Save matches to localStorage
  const addFavoriteMatch = (match: FavoriteMatch) => {
    setFavoriteMatches((prev) => {
      const exists = prev.some((m) => m.id === match.id);
      if (exists) return prev;

      const updated = [...prev, match];
      localStorage.setItem(FAVORITE_MATCHES_STORAGE_KEY, JSON.stringify(updated));
      return updated;
    });
  };

  const removeFavoriteMatch = (matchId: number) => {
    setFavoriteMatches((prev) => {
      const updated = prev.filter((m) => m.id !== matchId);
      localStorage.setItem(FAVORITE_MATCHES_STORAGE_KEY, JSON.stringify(updated));
      return updated;
    });
  };

  const isFavoriteMatch = (matchId: number) => {
    return favoriteMatches.some((m) => m.id === matchId);
  };

  return {
    favoriteTeams,
    favoriteMatches,
    isLoading,
    addFavoriteTeam,
    removeFavoriteTeam,
    isFavoriteTeam,
    addFavoriteMatch,
    removeFavoriteMatch,
    isFavoriteMatch,
  };
}
