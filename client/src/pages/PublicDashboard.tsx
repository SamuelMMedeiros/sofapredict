import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Menu, X, LogIn, ArrowLeft } from "lucide-react";
import { Link } from "wouter";
import SurebetCalculator from "@/components/SurebetCalculator";
import TacticalRadar from "@/components/TacticalRadar";
import AIRecommendationGenerator from "@/components/AIRecommendationGenerator";
import BettingSlipManager from "@/components/BettingSlipManager";
import { getLoginUrl } from "@/const";

export default function PublicDashboard() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const mockMatches = [
    {
      id: 1,
      homeTeam: "Flamengo",
      awayTeam: "Palmeiras",
      league: "Brasileirão",
      odds: { home: 2.1, draw: 3.2, away: 3.5 },
      confidence: 78,
      time: "20:00",
    },
    {
      id: 2,
      homeTeam: "São Paulo",
      awayTeam: "Corinthians",
      league: "Brasileirão",
      odds: { home: 1.95, draw: 3.4, away: 3.8 },
      confidence: 72,
      time: "21:30",
    },
    {
      id: 3,
      homeTeam: "Manchester City",
      awayTeam: "Liverpool",
      league: "Premier League",
      odds: { home: 2.3, draw: 3.1, away: 3.2 },
      confidence: 81,
      time: "19:00",
    },
  ];

  return (
    <div className="min-h-screen bg-[#090d16]">
      {/* Header */}
      <header className="border-b border-[#1e293b] bg-[#111827] sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/">
            <div className="flex items-center gap-2 cursor-pointer hover:opacity-80 transition">
              <ArrowLeft size={20} className="text-[#10b981]" />
              <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-[#10b981] to-[#047857] flex items-center justify-center">
                <span className="text-white font-bold text-sm">SP</span>
              </div>
              <span className="text-white font-bold">SofaPredict</span>
            </div>
          </Link>

          <div className="hidden md:flex items-center gap-4">
            <span className="text-[#94a3b8] text-sm">Modo Exploração Gratuita</span>
            <a href={getLoginUrl()}>
              <Button className="bg-[#10b981] hover:bg-[#059669] text-white flex items-center gap-2">
                <LogIn size={16} />
                Fazer Login
              </Button>
            </a>
          </div>

          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 hover:bg-[#1e293b] rounded transition"
          >
            {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-[#1e293b] p-4 space-y-3">
            <p className="text-[#94a3b8] text-sm">Modo Exploração Gratuita</p>
            <a href={getLoginUrl()} className="block">
              <Button className="w-full bg-[#10b981] hover:bg-[#059669] text-white">
                Fazer Login
              </Button>
            </a>
          </div>
        )}
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* Welcome Section */}
        <div className="mb-8 p-6 bg-gradient-to-r from-[#10b981]/10 to-[#047857]/10 border border-[#10b981]/30 rounded-lg">
          <h1 className="text-3xl font-bold text-white mb-2">Bem-vindo ao SofaPredict</h1>
          <p className="text-[#94a3b8] mb-4">
            Explore todos os recursos gratuitamente. Crie uma conta para salvar seus dados e acessar recursos premium.
          </p>
          <div className="flex gap-3">
            <a href={getLoginUrl()}>
              <Button className="bg-[#10b981] hover:bg-[#059669] text-white">
                Criar Conta Gratuita
              </Button>
            </a>
            <Button variant="outline" className="border-[#1e293b] text-[#94a3b8]">
              Ver Planos
            </Button>
          </div>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="matches" className="space-y-6">
          <TabsList className="bg-[#111827] border border-[#1e293b]">
            <TabsTrigger value="matches" className="data-[state=active]:bg-[#10b981]">
              Partidas ao Vivo
            </TabsTrigger>
            <TabsTrigger value="arbitrage" className="data-[state=active]:bg-[#10b981]">
              Calculadora de Arbitragem
            </TabsTrigger>
            <TabsTrigger value="ai" className="data-[state=active]:bg-[#10b981]">
              Recomendações IA
            </TabsTrigger>
            <TabsTrigger value="tactical" className="data-[state=active]:bg-[#10b981]">
              Radar Tático
            </TabsTrigger>
          </TabsList>

          {/* Matches Tab */}
          <TabsContent value="matches" className="space-y-4">
            <div className="grid gap-4">
              {mockMatches.map((match) => (
                <Card key={match.id} className="bg-[#111827] border-[#1e293b]">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="text-white">
                          {match.homeTeam} vs {match.awayTeam}
                        </CardTitle>
                        <p className="text-sm text-[#94a3b8] mt-1">
                          {match.league} • {match.time}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-bold text-[#10b981]">{match.confidence}%</p>
                        <p className="text-xs text-[#64748b]">Confiança IA</p>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-3 gap-4">
                      <div className="text-center p-3 bg-[#0c1322] rounded">
                        <p className="text-[#94a3b8] text-sm">Vitória Casa</p>
                        <p className="text-xl font-bold text-white">{match.odds.home}</p>
                      </div>
                      <div className="text-center p-3 bg-[#0c1322] rounded">
                        <p className="text-[#94a3b8] text-sm">Empate</p>
                        <p className="text-xl font-bold text-white">{match.odds.draw}</p>
                      </div>
                      <div className="text-center p-3 bg-[#0c1322] rounded">
                        <p className="text-[#94a3b8] text-sm">Vitória Fora</p>
                        <p className="text-xl font-bold text-white">{match.odds.away}</p>
                      </div>
                    </div>
                    <p className="text-xs text-[#64748b]">
                      💡 Dica: Crie uma conta para salvar suas apostas e acompanhar o histórico
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Arbitrage Tab */}
          <TabsContent value="arbitrage">
            <Card className="bg-[#111827] border-[#1e293b]">
              <CardHeader>
                <CardTitle className="text-white">Calculadora de Arbitragem (Surebets)</CardTitle>
              </CardHeader>
              <CardContent>
                <SurebetCalculator />
              </CardContent>
            </Card>
          </TabsContent>

          {/* AI Tab */}
          <TabsContent value="ai">
            <Card className="bg-[#111827] border-[#1e293b]">
              <CardHeader>
                <CardTitle className="text-white">Gerador de Recomendações com IA</CardTitle>
              </CardHeader>
              <CardContent>
                <AIRecommendationGenerator />
              </CardContent>
            </Card>
          </TabsContent>

          {/* Tactical Tab */}
          <TabsContent value="tactical">
            <Card className="bg-[#111827] border-[#1e293b]">
              <CardHeader>
                <CardTitle className="text-white">Radar Tático</CardTitle>
              </CardHeader>
              <CardContent>
                <TacticalRadar
                  homeTeam={{
                    name: "Flamengo",
                    possession: 58,
                    shots: 12,
                    shotsOnTarget: 5,
                    corners: 5,
                    fouls: 8,
                    passes: 450,
                    passAccuracy: 82,
                  }}
                  awayTeam={{
                    name: "Palmeiras",
                    possession: 42,
                    shots: 8,
                    shotsOnTarget: 3,
                    corners: 3,
                    fouls: 6,
                    passes: 320,
                    passAccuracy: 79,
                  }}
                />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* CTA Section */}
        <div className="mt-12 p-8 bg-gradient-to-r from-[#10b981]/10 to-[#047857]/10 border border-[#10b981]/30 rounded-lg text-center">
          <h2 className="text-2xl font-bold text-white mb-3">Pronto para começar?</h2>
          <p className="text-[#94a3b8] mb-6 max-w-2xl mx-auto">
            Crie uma conta gratuita para salvar suas análises, acompanhar histórico de apostas e acessar recursos premium.
          </p>
          <div className="flex gap-3 justify-center flex-wrap">
            <a href={getLoginUrl()}>
              <Button className="bg-[#10b981] hover:bg-[#059669] text-white px-8">
                Criar Conta Gratuita
              </Button>
            </a>
            <Button variant="outline" className="border-[#10b981] text-[#10b981] hover:bg-[#10b981]/10 px-8">
              Ver Planos Premium
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
}
