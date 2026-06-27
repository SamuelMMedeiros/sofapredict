# SofaPredict - API Integration Guide

## Overview

SofaPredict integra múltiplas APIs de esportes para fornecer análise completa de apostas. Este documento descreve como integrar cada API com o sistema de cache server-side.

---

## 1. SportAPI (RapidAPI)

**Base URL:** `https://sportapi7.p.rapidapi.com`

**Descrição:** API completa com suporte a 20+ esportes, 5000+ ligas e milhões de eventos. Ideal para dados em tempo real.

### Headers Obrigatórios
```
X-RapidAPI-Key: YOUR_API_KEY
X-RapidAPI-Host: sportapi7.p.rapidapi.com
```

### Principais Endpoints

#### Partidas ao Vivo
```
GET /events/live
Query: sport_id, league_id, limit, offset
Response: Array de eventos ao vivo com scores, estatísticas
Cache TTL: 60-120 segundos
```

#### Partidas Próximas
```
GET /events/upcoming
Query: sport_id, league_id, date_from, date_to, limit
Response: Fixtures com odds, times, horários
Cache TTL: 300 segundos
```

#### Detalhes da Partida
```
GET /events/{event_id}
Response: Placar completo, estatísticas, lineups, eventos do jogo
Cache TTL: 120 segundos (atualizar durante o jogo)
```

#### Estatísticas do Time
```
GET /teams/{team_id}/statistics
Query: season, league_id
Response: Posse, chutes, cartões, escanteios, etc.
Cache TTL: 3600 segundos
```

#### Classificação
```
GET /standings
Query: league_id, season
Response: Tabela com pontos, vitórias, derrotas
Cache TTL: 3600 segundos
```

#### Informações do Time
```
GET /teams/{team_id}
Response: Nome, logo, país, estádio, técnico
Cache TTL: 86400 segundos (1 dia)
```

#### Jogadores
```
GET /teams/{team_id}/players
Response: Elenco com posição, número, foto
Cache TTL: 86400 segundos
```

#### Head-to-Head
```
GET /events/h2h
Query: team1_id, team2_id, limit
Response: Histórico de confrontos
Cache TTL: 7200 segundos
```

---

## 2. OddsPapi (RapidAPI)

**Base URL:** `https://odds-api1.p.rapidapi.com`

**Descrição:** Odds em tempo real de 300+ casas de apostas (Pinnacle, bet365, BetFair, FanDuel, DraftKings, Stake, etc.)

### Headers Obrigatórios
```
X-RapidAPI-Key: YOUR_API_KEY
X-RapidAPI-Host: odds-api1.p.rapidapi.com
```

### Principais Endpoints

#### Odds Ao Vivo
```
GET /live-odds
Query: sport, league, market_type (1x2, over_under, etc)
Response: Odds de múltiplas casas, movimento de mercado
Cache TTL: 30-60 segundos (mercado muito volátil)
```

#### Odds de Partida Específica
```
GET /odds/fixture/{fixture_id}
Query: bookmakers (pinnacle, bet365, draftkings, etc)
Response: Odds 1X2, Over/Under, Props
Cache TTL: 60 segundos
```

#### Histórico de Odds
```
GET /odds/history
Query: fixture_id, bookmaker
Response: Movimento de odds ao longo do tempo
Cache TTL: 3600 segundos
```

#### Bookmakers Disponíveis
```
GET /bookmakers
Response: Lista de casas de apostas suportadas com IDs
Cache TTL: 86400 segundos
```

---

## 3. Sportsbook API (RapidAPI)

**Base URL:** `https://sportsbook-api2.p.rapidapi.com`

**Descrição:** Odds de 10+ casas de apostas americanas (DraftKings, FanDuel, BetMGM, Caesars, etc.)

### Principais Endpoints

#### Odds Disponíveis
```
GET /odds
Query: sport, league, date
Response: Odds 1X2, Spreads, Over/Under
Cache TTL: 60 segundos
```

#### Linhas de Apostas
```
GET /lines
Query: sport, league, date
Response: Linhas atualizadas de múltiplas casas
Cache TTL: 30 segundos
```

---

## 4. Football Prediction API (RapidAPI)

**URL:** `https://boggio-analytics.p.rapidapi.com/football-prediction`

**Descrição:** Predições de partidas com odds médias e histórico de performance.

### Principais Endpoints

#### Predições para Partida
```
GET /prediction
Query: fixture_id, league_id
Response: {
  prediction: "1" | "X" | "2",
  probability: { home: 0.45, draw: 0.30, away: 0.25 },
  average_odds: { home: 2.20, draw: 3.50, away: 3.80 },
  confidence: 0.75
}
Cache TTL: 7200 segundos
```

#### Predições Diárias
```
GET /predictions/today
Query: league_id
Response: Array de predições para hoje
Cache TTL: 3600 segundos
```

#### Performance Histórica
```
GET /predictions/performance
Query: period (week, month, season)
Response: Taxa de acerto, ROI, estatísticas
Cache TTL: 86400 segundos
```

---

## 5. Today Football Prediction API (RapidAPI)

**URL:** `https://today-football-prediction.p.rapidapi.com`

**Descrição:** Predições em tempo real com análise de dados e algoritmos avançados.

### Principais Endpoints

#### Predições de Hoje
```
GET /predictions
Query: league, country
Response: {
  match: "Team A vs Team B",
  prediction: "1",
  confidence: 0.82,
  analysis: "Análise textual da predição",
  recommended_odds: [1.95, 3.40, 4.20]
}
Cache TTL: 3600 segundos
```

#### Análise de Partida
```
GET /match-analysis/{match_id}
Response: Análise detalhada com estatísticas históricas
Cache TTL: 7200 segundos
```

---

## Estratégia de Integração Recomendada

### 1. Priorização de APIs

**Tier 1 (Crítico):**
- SportAPI: Dados base (partidas, times, estatísticas)
- OddsPapi: Odds em tempo real

**Tier 2 (Importante):**
- Football Prediction API: Predições com histórico confiável
- Today Football Prediction: Predições em tempo real

**Tier 3 (Complementar):**
- Sportsbook API: Odds americanas (opcional)

### 2. Fluxo de Cache

```
Requisição do Frontend
    ↓
Verificar Cache Local (TTL)
    ↓
Se Cache Válido → Retornar Dados
    ↓
Se Cache Expirado → Buscar da API
    ↓
Armazenar em Cache com TTL
    ↓
Retornar ao Frontend
```

### 3. TTL Recomendado por Tipo

| Tipo de Dados | TTL | Motivo |
|---|---|---|
| Odds ao vivo | 30-60s | Mercado muito volátil |
| Placar ao vivo | 60-120s | Atualiza frequentemente |
| Partidas próximas | 300s | Muda menos frequentemente |
| Estatísticas de time | 3600s | Muda uma vez por dia |
| Classificação | 3600s | Atualiza após jogos |
| Informações de time | 86400s | Raramente muda |
| Predições | 7200s | Baseado em análise histórica |

### 4. Tratamento de Erros

```typescript
// Fallback Strategy
try {
  const data = await fetchFromAPI();
  await cacheData(data);
  return data;
} catch (error) {
  // Tentar dados em cache mesmo expirados
  const staleData = await getStaleCache();
  if (staleData) return staleData;
  
  // Retornar dados padrão/vazio
  return getDefaultData();
}
```

### 5. Monitoramento de Quota

```typescript
// Rastrear uso de API
interface APIUsage {
  endpoint: string;
  calls: number;
  cacheHits: number;
  cacheMisses: number;
  timestamp: Date;
}

// Implementar alertas quando quota estiver próxima do limite
```

---

## Implementação no SofaPredict

### Arquivo: `server/multi-api-integrations.ts`

```typescript
import axios from "axios";
import { withCache, CACHE_TTL, generateCacheKey } from "./cache";

// SportAPI
export async function getSportAPILiveMatches(sportId: number, leagueId: number) {
  const cacheKey = generateCacheKey("sportapi", { 
    endpoint: "events/live", 
    sport: sportId, 
    league: leagueId 
  });
  
  return withCache(cacheKey, "rapidapi", 60, async () => {
    const response = await axios.get("https://sportapi7.p.rapidapi.com/events/live", {
      params: { sport_id: sportId, league_id: leagueId },
      headers: {
        "x-rapidapi-key": process.env.RAPIDAPI_KEY,
        "x-rapidapi-host": "sportapi7.p.rapidapi.com"
      }
    });
    return response.data;
  });
}

// OddsPapi
export async function getOddsLive(sport: string, league: string) {
  const cacheKey = generateCacheKey("oddspapi", { 
    endpoint: "live-odds", 
    sport, 
    league 
  });
  
  return withCache(cacheKey, "rapidapi", 60, async () => {
    const response = await axios.get("https://odds-api1.p.rapidapi.com/live-odds", {
      params: { sport, league },
      headers: {
        "x-rapidapi-key": process.env.RAPIDAPI_KEY,
        "x-rapidapi-host": "odds-api1.p.rapidapi.com"
      }
    });
    return response.data;
  });
}

// Football Prediction
export async function getPredictions(leagueId: number) {
  const cacheKey = generateCacheKey("prediction", { 
    endpoint: "predictions", 
    league: leagueId 
  });
  
  return withCache(cacheKey, "rapidapi", CACHE_TTL.GEMINI_ANALYSIS, async () => {
    const response = await axios.get("https://boggio-analytics.p.rapidapi.com/football-prediction/predictions/today", {
      params: { league_id: leagueId },
      headers: {
        "x-rapidapi-key": process.env.RAPIDAPI_KEY,
        "x-rapidapi-host": "boggio-analytics.p.rapidapi.com"
      }
    });
    return response.data;
  });
}
```

---

## Próximos Passos

1. ✅ Documentar todas as APIs
2. ⏳ Implementar integração multi-API no backend
3. ⏳ Criar tRPC routers para cada API
4. ⏳ Testar cache e fallback
5. ⏳ Monitorar quota e performance
6. ⏳ Otimizar TTL baseado em uso real

---

## Referências

- [SportAPI RapidAPI](https://rapidapi.com/rapidsportapi/api/sportapi7)
- [OddsPapi RapidAPI](https://rapidapi.com/odds-papi-odds-papi-default/api/odds-api1)
- [Football Prediction API](https://rapidapi.com/boggio-analytics/api/football-prediction)
- [Today Football Prediction](https://rapidapi.com/casedoweb-sXAtnI-JXY/api/today-football-prediction)
- [Sportsbook API](https://rapidapi.com/sportsbook-api-sportsbook-api-default/api/sportsbook-api2)
