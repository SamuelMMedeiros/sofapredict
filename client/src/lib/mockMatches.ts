export interface Match {
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
  date?: string;
}

// Real leagues and teams
const LEAGUES = {
  "Brasileirão": {
    teams: [
      "Flamengo", "Palmeiras", "São Paulo", "Corinthians", "Botafogo",
      "Atlético Mineiro", "Grêmio", "Internacional", "Fortaleza", "Bahia"
    ]
  },
  "Premier League": {
    teams: [
      "Manchester City", "Arsenal", "Liverpool", "Chelsea", "Manchester United",
      "Tottenham", "Newcastle", "Aston Villa", "Brighton", "West Ham"
    ]
  },
  "La Liga": {
    teams: [
      "Real Madrid", "Barcelona", "Atlético Madrid", "Sevilla", "Real Sociedad",
      "Villarreal", "Athletic Bilbao", "Valencia", "Betis", "Osasuna"
    ]
  },
  "Serie A": {
    teams: [
      "Inter Milan", "AC Milan", "Juventus", "Napoli", "Roma",
      "Lazio", "Fiorentina", "Atalanta", "Torino", "Sassuolo"
    ]
  },
  "Ligue 1": {
    teams: [
      "PSG", "Marseille", "Monaco", "Lyon", "Lens",
      "Nice", "Rennes", "Lille", "Strasbourg", "Nantes"
    ]
  }
};

function generateRandomOdds() {
  const homeOdd = parseFloat((Math.random() * 2 + 1.5).toFixed(2));
  const awayOdd = parseFloat((Math.random() * 2.5 + 2.5).toFixed(2));
  const drawOdd = parseFloat((Math.random() * 1.5 + 2.8).toFixed(2));

  return {
    home: homeOdd,
    draw: drawOdd,
    away: awayOdd,
  };
}

function generateRandomConfidence() {
  return Math.floor(Math.random() * 30) + 55; // 55-85
}

function getRandomTeams(league: string): [string, string] {
  const teams = LEAGUES[league as keyof typeof LEAGUES].teams;
  const home = teams[Math.floor(Math.random() * teams.length)];
  let away = teams[Math.floor(Math.random() * teams.length)];
  while (away === home) {
    away = teams[Math.floor(Math.random() * teams.length)];
  }
  return [home, away];
}

function generateMatchTime() {
  const hours = Math.floor(Math.random() * 12) + 10; // 10:00 to 22:00
  const minutes = Math.random() > 0.5 ? "00" : "30";
  return `${String(hours).padStart(2, "0")}:${minutes}`;
}

export function generateMockMatches(count: number = 15): Match[] {
  const matches: Match[] = [];
  const leagues = Object.keys(LEAGUES);
  const now = new Date();

  for (let i = 0; i < count; i++) {
    const league = leagues[Math.floor(Math.random() * leagues.length)];
    const [homeTeam, awayTeam] = getRandomTeams(league);
    const matchDate = new Date(now.getTime() + Math.random() * 7 * 24 * 60 * 60 * 1000);
    
    matches.push({
      id: i + 1,
      homeTeam,
      awayTeam,
      league,
      odds: generateRandomOdds(),
      confidence: generateRandomConfidence(),
      time: generateMatchTime(),
      status: Math.random() > 0.7 ? "live" : "upcoming",
      homeScore: Math.random() > 0.7 ? Math.floor(Math.random() * 3) : undefined,
      awayScore: Math.random() > 0.7 ? Math.floor(Math.random() * 3) : undefined,
      date: matchDate.toISOString().split("T")[0],
    });
  }

  return matches;
}

export const MOCK_MATCHES = generateMockMatches(20);
