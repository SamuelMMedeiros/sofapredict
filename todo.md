# SofaPredict - Project TODO

## Database & Backend
- [ ] Configure Supabase schema (users_profiles, user_bets_history, cache_table)
- [ ] Implement RLS (Row Level Security) policies
- [ ] Create migration scripts for database initialization
- [ ] Setup server-side cache layer with TTL configuration
- [ ] Implement cache invalidation logic

## Authentication & Security
- [ ] Setup user authentication with Manus OAuth
- [ ] Create user profile management (name, email, preferences)
- [ ] Implement LGPD compliance with consent screen
- [ ] Setup secure API key storage for RapidAPI
- [ ] Create modal for secure API key input
- [ ] Implement rate limiting and request validation

## Frontend - Core Layout
- [ ] Design visual direction (color palette, typography, spacing)
- [ ] Implement responsive 3-column layout (desktop/mobile)
- [ ] Create header with logo, auth status, and toggles
- [ ] Build column 1: Home dashboard with filters and favorites
- [ ] Build column 2: Match details and live statistics
- [ ] Build column 3: Betting slip and tools
- [ ] Implement OLED/dark mode toggle
- [ ] Add sound notification toggle

## Frontend - Features
- [ ] Implement favorites system (follow up to 5 teams)
- [ ] Create match filtering (sport, odds range, confidence level)
- [ ] Build live match list with odds and confidence display
- [ ] Implement tactical radar visualization (SVG spider chart)
- [ ] Create betting slip with multiple selections
- [ ] Build surebet calculator (arbitrage detection)
- [ ] Implement AI-recommended triple generator
- [ ] Create user metrics dashboard (win rate, ROI, streak)
- [ ] Add match sharing functionality
- [ ] Implement real-time odds updates (simulated)

## Backend - API Integration
- [ ] Setup RapidAPI (API-Football) integration with caching
- [ ] Create endpoints for live matches
- [ ] Create endpoints for match statistics
- [ ] Create endpoints for team data
- [ ] Implement cache refresh logic with configurable TTL
- [ ] Add error handling and fallback responses

## Backend - AI Integration
- [ ] Setup Google Gemini API integration
- [ ] Implement match analysis generation
- [ ] Create AI-recommended bets with justification
- [ ] Implement confidence index calculation
- [ ] Add response caching for Gemini calls
- [ ] Create batch analysis processing

## User Data Management
- [ ] Create betting history storage
- [ ] Implement bet tracking (entry, status, returns)
- [ ] Build bankroll management system
- [ ] Create user statistics calculation (ROI, win rate, streak)
- [ ] Implement data export functionality (LGPD requirement)
- [ ] Create account deletion endpoint (LGPD requirement)

## Testing & Quality
- [ ] Write unit tests for cache logic
- [ ] Write unit tests for calculations (odds, arbitrage)
- [ ] Write integration tests for API endpoints
- [ ] Test LGPD compliance flows
- [ ] Security audit of API key handling
- [ ] Performance testing and optimization
- [ ] Mobile responsiveness testing

## Deployment & Documentation
- [ ] Setup GitHub repository
- [ ] Create deployment configuration for Netlify
- [ ] Document environment variables
- [ ] Create API documentation
- [ ] Write user guide for features
- [ ] Setup monitoring and error tracking
- [ ] Create LGPD privacy policy document

## Completed Features

### Phase 1-2 Completed
- [x] Database schema with all tables (users, profiles, bets, stats, cache, LGPD log)
- [x] Cache system with TTL and automatic expiration
- [x] RapidAPI integration with caching layer
- [x] Google Gemini integration for AI analysis
- [x] User profile and preferences management
- [x] LGPD compliance page and consent storage
- [x] tRPC routers for all features
- [x] Responsive 3-column dashboard layout
- [x] Dark/OLED mode toggle
- [x] Sound alerts toggle
- [x] Basic unit tests for cache
