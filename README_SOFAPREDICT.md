# SofaPredict - Plataforma de Análise e Gestão de Apostas Esportivas

## 📋 Visão Geral

SofaPredict é uma plataforma web premium para análise inteligente de apostas esportivas, desenvolvida com foco em desempenho, segurança e experiência do usuário. Integra múltiplas APIs de esportes em tempo real com cache server-side agressivo e análises de IA via Google Gemini.

## 🎯 Funcionalidades Principais

### 1. Dashboard Responsivo 3-Colunas
- **Coluna 1:** Painel home com filtros, estatísticas do usuário (ROI, apostas, sequência)
- **Coluna 2:** Detalhes da partida com estatísticas e radar tático visual
- **Coluna 3:** Bilhete de apostas, calculadora de arbitragem, gerador de tripla recomendada

### 2. Autenticação e Perfil
- Autenticação via Manus OAuth
- Perfil individual com preferências personalizadas
- Seguir até 5 times favoritos
- Toggle de modo OLED/dark
- Toggle de alertas sonoros

### 3. Análise de Partidas
- Listagem e filtragem de partidas (ligas, odds, confiança IA)
- Odds em tempo real de 300+ casas de apostas
- Estatísticas detalhadas (posse, chutes, escanteios, cartões)
- Radar tático visual com comparação de times

### 4. Ferramentas de Apostas
- **Calculadora de Arbitragem:** Detecta surebets (apostas sem risco) cruzando odds
- **Gerador de Tripla:** IA recomenda melhor combinação de 3 apostas
- **Bilhete de Apostas:** Registro de entradas com histórico completo
- **Gerenciador de Bankroll:** Controle de lucro/prejuízo e sequência

### 5. Análises de IA
- Google Gemini para análises textuais de partidas
- Índice de confiança baseado em dados históricos
- Sugestões de apostas com justificativa
- Análise de impacto de lesões

### 6. Conformidade LGPD
- Tela de consentimento explícito na primeira acesso
- Direitos LGPD claramente explicados (acesso, retificação, exclusão, portabilidade)
- Registro de consentimento com IP e user-agent
- Endpoints para exportação e exclusão de dados

## 🏗️ Arquitetura Técnica

### Stack Tecnológico
- **Frontend:** React 19 + Tailwind CSS 4 + Wouter
- **Backend:** Express.js + tRPC 11 + Drizzle ORM
- **Banco de Dados:** Supabase (PostgreSQL) com RLS
- **IA:** Google Gemini para análises
- **APIs Externas:** SportAPI, OddsPapi, Football Prediction, Today Prediction, Sportsbook
- **Autenticação:** Manus OAuth
- **Hospedagem:** Netlify (frontend) + Node.js (backend)

### Estratégia de Cache Server-Side

| Tipo de Dados | TTL | Motivo |
|---|---|---|
| Odds ao vivo | 60s | Mercado muito volátil |
| Partidas ao vivo | 120s | Atualiza frequentemente |
| Próximas partidas | 300s | Muda menos frequentemente |
| Estatísticas de time | 3600s | Muda uma vez por dia |
| Classificação | 3600s | Atualiza após jogos |
| Predições | 7200s | Baseado em análise histórica |
| Info de time | 86400s | Raramente muda |

### Fluxo de Cache

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

## 📦 APIs Integradas

### 1. SportAPI (RapidAPI)
- Partidas ao vivo e próximas
- Estatísticas de times
- Classificações
- Informações de jogadores
- Head-to-head

### 2. OddsPapi (RapidAPI)
- Odds em tempo real de 300+ casas
- Histórico de odds
- Bookmakers disponíveis

### 3. Football Prediction API
- Predições de partidas
- Histórico de performance
- Odds médias

### 4. Today Football Prediction
- Predições em tempo real
- Análise detalhada de partidas

### 5. Sportsbook API
- Odds de casas americanas
- Linhas de apostas

## 🔐 Segurança

- ✅ Chave RapidAPI armazenada apenas no servidor (nunca exposta)
- ✅ RLS (Row Level Security) no Supabase para isolamento de dados
- ✅ Validação e sanitização de todas as entradas
- ✅ Autenticação via Manus OAuth
- ✅ Conformidade LGPD completa
- ✅ Proteção contra CSRF e XSS

## 🎨 Design Visual

- **Paleta:** Azul-escuro profundo (#090d16) com acentos verde neon (#10b981)
- **Tipografia:** Inter/Poppins para clareza
- **Componentes:** shadcn/ui para consistência
- **Modo OLED:** Preto absoluto (#000000) para economia de energia
- **Animações:** Transições suaves (180-250ms) sem excesso

## 📊 Estrutura de Dados

### Tabelas Principais
- `users` - Usuários com autenticação OAuth
- `user_profiles` - Perfis com preferências
- `user_bets_history` - Histórico de apostas
- `user_stats` - Estatísticas agregadas (ROI, taxa de acerto, sequência)
- `api_cache` - Cache de dados das APIs
- `lgpd_consent_log` - Registro de consentimento LGPD

## 🚀 Deployment

### Variáveis de Ambiente Obrigatórias
```
RAPIDAPI_KEY=seu-rapidapi-key
GEMINI_API_KEY=seu-gemini-key
DATABASE_URL=sua-database-url
JWT_SECRET=seu-jwt-secret
VITE_APP_ID=seu-app-id
```

### Cache TTL Configurável
```
CACHE_TTL_ODDS=60
CACHE_TTL_LIVE_MATCHES=120
CACHE_TTL_UPCOMING=300
CACHE_TTL_TEAM_STATS=3600
CACHE_TTL_STANDINGS=3600
CACHE_TTL_PREDICTIONS=7200
CACHE_TTL_TEAM_INFO=86400
```

## 📱 Responsividade

- ✅ Desktop (1280px+)
- ✅ Tablet (768px - 1279px)
- ✅ Mobile (< 768px)
- ✅ Layout 3-colunas colapsável em mobile

## 🧪 Testes

```bash
# Executar testes
pnpm test

# Testes incluem:
- Cache system validation
- API integration tests
- LGPD compliance flows
- Security audit
```

## 📚 Documentação

- `API_INTEGRATION_GUIDE.md` - Guia completo de integração com APIs
- `API_FOOTBALL_ENDPOINTS.md` - Endpoints disponíveis
- `CACHE_STRATEGY.md` - Estratégia de cache detalhada

## 🛠️ Desenvolvimento

### Instalar dependências
```bash
pnpm install
```

### Iniciar dev server
```bash
pnpm dev
```

### Build para produção
```bash
pnpm build
pnpm start
```

### Verificar tipos
```bash
pnpm check
```

## 📝 Notas Importantes

1. **Custo Zero:** Toda a arquitetura foi otimizada para minimizar requisições pagas
2. **Cache Agressivo:** Dados são cacheados no servidor para reduzir chamadas externas
3. **Segurança:** Chaves de API nunca são expostas ao frontend
4. **LGPD Compliant:** Conformidade total com Lei Geral de Proteção de Dados
5. **Escalável:** Preparado para crescimento com múltiplas ligas e esportes

## 📞 Suporte

Para questões sobre LGPD e privacidade: privacy@sofapredict.com

## 📄 Licença

MIT

---

**Desenvolvido com ❤️ para análise inteligente de apostas esportivas**
