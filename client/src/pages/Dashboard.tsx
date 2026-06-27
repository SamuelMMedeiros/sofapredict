import { useState, useEffect } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Menu, X } from "lucide-react";
import { useLocation } from "wouter";

export default function Dashboard() {
  const { user, loading: authLoading, isAuthenticated } = useAuth();
  const [, navigate] = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [oledMode, setOledMode] = useState(false);
  const [soundAlerts, setSoundAlerts] = useState(true);

  // Fetch user profile
  const { data: profile, isLoading: profileLoading } = trpc.user.getProfile.useQuery(undefined, {
    enabled: isAuthenticated,
  });

  // Fetch user stats
  const { data: stats } = trpc.user.getStats.useQuery(undefined, {
    enabled: isAuthenticated,
  });

  // Fetch live matches
  const { data: liveMatches, isLoading: matchesLoading } = trpc.api.getLiveMatches.useQuery(
    { leagueId: 71, season: 2024 }, // Brasileirão
    { enabled: isAuthenticated }
  );

  useEffect(() => {
    if (profile) {
      setOledMode(profile.oledModeActive || false);
      setSoundAlerts(profile.soundAlertsActive || true);
    }
  }, [profile]);

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#090d16]">
        <Loader2 className="animate-spin text-[#10b981]" size={48} />
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#090d16] p-4">
        <div className="text-center">
          <div className="w-16 h-16 rounded-lg bg-gradient-to-tr from-[#10b981] to-[#047857] flex items-center justify-center mx-auto mb-4 shadow-lg">
            <span className="text-white font-extrabold text-2xl">SP</span>
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">
            Sofa<span className="text-[#10b981]">Predict</span>
          </h1>
          <p className="text-[#94a3b8] mb-8">Análise inteligente de apostas esportivas</p>
          <Button
            onClick={() => navigate("/")}
            className="bg-[#10b981] hover:bg-[#059669] text-white px-8 py-2"
          >
            Fazer Login
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`min-h-screen transition-colors duration-500 ${
        oledMode ? "bg-[#000000]" : "bg-[#090d16]"
      }`}
    >
      {/* Header */}
      <header
        className={`border-b px-4 lg:px-6 py-4 flex items-center justify-between sticky top-0 z-40 transition-colors duration-500 ${
          oledMode ? "bg-[#000000] border-[#111111]" : "bg-[#111827] border-[#1e293b]"
        }`}
      >
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-[#10b981] to-[#047857] flex items-center justify-center shadow-lg">
            <span className="text-white font-extrabold text-sm">SP</span>
          </div>
          <div className="hidden sm:block">
            <span className="text-white font-black text-lg tracking-wide">
              Sofa<span className="text-[#10b981]">Predict</span>
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2 lg:gap-3">
          <button
            onClick={() => setSoundAlerts(!soundAlerts)}
            className={`p-2 rounded-lg transition-all ${
              soundAlerts
                ? "bg-emerald-500/10 text-[#10b981] border border-emerald-500/20"
                : "bg-red-500/10 text-red-500 border border-red-500/20"
            }`}
            title={soundAlerts ? "Som ativado" : "Som desativado"}
          >
            {soundAlerts ? "🔊" : "🔇"}
          </button>

          <button
            onClick={() => setOledMode(!oledMode)}
            className={`px-2 lg:px-3 py-1.5 rounded-lg text-[10px] font-black border uppercase tracking-wider transition-all ${
              oledMode ? "bg-purple-500/10 text-purple-400 border-purple-500/30" : "bg-slate-800 text-slate-300 border-slate-700"
            }`}
            title={oledMode ? "Modo OLED ativado" : "Modo OLED desativado"}
          >
            OLED {oledMode ? "ON" : "OFF"}
          </button>

          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-2 rounded-lg hover:bg-slate-700 transition-colors"
          >
            {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>

          <div className="hidden lg:flex items-center gap-2 pl-2 border-l border-[#1e293b]">
            <div className="text-right">
              <p className="text-white text-sm font-semibold">{user?.name || "Usuário"}</p>
              <p className="text-[#94a3b8] text-xs">{user?.email}</p>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content - 3 Columns */}
      <div className="flex flex-col lg:flex-row h-[calc(100vh-80px)] overflow-hidden">
        {/* Column 1: Home & Filters */}
        <div
          className={`w-full lg:w-[35%] flex flex-col border-r overflow-y-auto transition-colors duration-500 ${
            oledMode ? "bg-[#000000] border-[#111111]" : "bg-[#090d16] border-[#1e293b]/60"
          }`}
        >
          <div className="p-4 space-y-3">
            {/* AI Accuracy Banner */}
            <Card className={`border transition-colors ${oledMode ? "bg-[#0a0a0a] border-[#222222]" : "bg-[#111827] border-[#1e293b]"}`}>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <span className="bg-[#10b981]/15 text-[#10b981] text-[10px] font-bold px-2 py-0.5 rounded-full">
                    SISTEMA ATIVO
                  </span>
                  <span className="text-[10px] text-[#94a3b8]">Taxa de acerto: {stats?.winRate || "0"}%</span>
                </div>
              </CardHeader>
              <CardContent>
                <h3 className="text-white font-bold text-sm">Olá, {user?.name}!</h3>
                <p className="text-xs text-[#94a3b8] mt-1">
                  Bem-vindo ao SofaPredict. Análise inteligente de apostas esportivas com IA.
                </p>
              </CardContent>
            </Card>

            {/* Stats Overview */}
            <div className="grid grid-cols-3 gap-2">
              <Card className={`border transition-colors ${oledMode ? "bg-[#0a0a0a] border-[#222222]" : "bg-[#111827] border-[#1e293b]"}`}>
                <CardContent className="pt-4">
                  <p className="text-[#94a3b8] text-xs">ROI</p>
                  <p className="text-white font-bold text-lg">{stats?.roi || "0"}%</p>
                </CardContent>
              </Card>
              <Card className={`border transition-colors ${oledMode ? "bg-[#0a0a0a] border-[#222222]" : "bg-[#111827] border-[#1e293b]"}`}>
                <CardContent className="pt-4">
                  <p className="text-[#94a3b8] text-xs">Apostas</p>
                  <p className="text-white font-bold text-lg">{stats?.totalBets || "0"}</p>
                </CardContent>
              </Card>
              <Card className={`border transition-colors ${oledMode ? "bg-[#0a0a0a] border-[#222222]" : "bg-[#111827] border-[#1e293b]"}`}>
                <CardContent className="pt-4">
                  <p className="text-[#94a3b8] text-xs">Sequência</p>
                  <p className="text-white font-bold text-lg">{stats?.currentStreak || "0"}</p>
                </CardContent>
              </Card>
            </div>

            {/* Filters */}
            <div className="space-y-2">
              <h4 className="text-white text-sm font-semibold">Filtros</h4>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" className="flex-1 text-xs">
                  ⚽ Futebol
                </Button>
                <Button variant="outline" size="sm" className="flex-1 text-xs">
                  🏀 Basquete
                </Button>
              </div>
            </div>
          </div>

          {/* Matches List */}
          <div className="flex-1 overflow-y-auto px-4 pb-4 space-y-2">
            {matchesLoading ? (
              <div className="flex justify-center py-8">
                <Loader2 className="animate-spin text-[#10b981]" size={24} />
              </div>
            ) : (
              <div className="space-y-2">
                <p className="text-[#94a3b8] text-xs">Partidas ao vivo (simuladas)</p>
                <Card className={`border cursor-pointer hover:border-[#10b981] transition-all ${oledMode ? "bg-[#0a0a0a] border-[#222222]" : "bg-[#111827] border-[#1e293b]"}`}>
                  <CardContent className="pt-4">
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="text-white font-semibold text-sm">Flamengo vs Palmeiras</p>
                        <p className="text-[#94a3b8] text-xs">Série A • 45'</p>
                      </div>
                      <div className="text-right">
                        <p className="text-white font-bold">2 - 1</p>
                        <p className="text-[#10b981] text-xs">IA: 87%</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
          </div>
        </div>

        {/* Column 2: Match Details & Radar */}
        <div
          className={`hidden lg:flex w-[35%] flex-col border-r overflow-y-auto transition-colors duration-500 ${
            oledMode ? "bg-[#000000] border-[#111111]" : "bg-[#0c1322] border-[#1e293b]"
          }`}
        >
          <div className="p-4 space-y-4">
            <Card className={`border transition-colors ${oledMode ? "bg-[#0a0a0a] border-[#222222]" : "bg-[#111827] border-[#1e293b]"}`}>
              <CardHeader>
                <CardTitle className="text-white text-base">Análise do Jogo</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <p className="text-white font-semibold text-sm">Flamengo vs Palmeiras</p>
                  <p className="text-[#94a3b8] text-xs">Série A • 2024</p>
                </div>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <p className="text-[#94a3b8]">Posse de Bola</p>
                    <p className="text-white font-bold">58%</p>
                  </div>
                  <div>
                    <p className="text-[#94a3b8]">Chutes</p>
                    <p className="text-white font-bold">12</p>
                  </div>
                  <div>
                    <p className="text-[#94a3b8]">Escanteios</p>
                    <p className="text-white font-bold">7</p>
                  </div>
                  <div>
                    <p className="text-[#94a3b8]">Cartões</p>
                    <p className="text-white font-bold">2</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Tactical Radar Placeholder */}
            <Card className={`border transition-colors ${oledMode ? "bg-[#0a0a0a] border-[#222222]" : "bg-[#111827] border-[#1e293b]"}`}>
              <CardHeader>
                <CardTitle className="text-white text-base">Radar Tático</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-40 flex items-center justify-center text-[#94a3b8] text-xs">
                  [Gráfico de radar tático será renderizado aqui]
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Column 3: Betting Slip & Tools */}
        <div
          className={`w-full lg:w-[30%] flex flex-col overflow-y-auto transition-colors duration-500 ${
            oledMode ? "bg-[#000000]" : "bg-[#090d16]"
          }`}
        >
          <div className="p-4 space-y-3">
            {/* Betting Slip */}
            <Card className={`border transition-colors ${oledMode ? "bg-[#0a0a0a] border-[#222222]" : "bg-[#111827] border-[#1e293b]"}`}>
              <CardHeader>
                <CardTitle className="text-white text-base">Bilhete de Apostas</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <p className="text-[#94a3b8] text-xs mb-1">Seleções</p>
                  <p className="text-white font-bold text-sm">0 seleções</p>
                </div>
                <div className="space-y-2">
                  <div>
                    <label className="text-[#94a3b8] text-xs">Valor da Aposta (R$)</label>
                    <input
                      type="number"
                      placeholder="50.00"
                      className="w-full bg-[#0c1322] border border-[#1e293b] rounded px-2 py-1.5 text-white text-sm mt-1"
                    />
                  </div>
                  <div>
                    <p className="text-[#94a3b8] text-xs">Retorno Projetado</p>
                    <p className="text-[#10b981] font-bold text-sm">R$ 0.00</p>
                  </div>
                </div>
                <Button className="w-full bg-[#10b981] hover:bg-[#059669] text-white text-sm">
                  Confirmar Aposta
                </Button>
              </CardContent>
            </Card>

            {/* Surebet Calculator */}
            <Card className={`border transition-colors ${oledMode ? "bg-[#0a0a0a] border-[#222222]" : "bg-[#111827] border-[#1e293b]"}`}>
              <CardHeader>
                <CardTitle className="text-white text-sm">Calculadora de Arbitragem</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-xs">
                <p className="text-[#94a3b8]">Insira as odds para detectar surebets (apostas sem risco)</p>
                <Button variant="outline" size="sm" className="w-full text-xs">
                  Abrir Calculadora
                </Button>
              </CardContent>
            </Card>

            {/* AI Recommendation */}
            <Card className={`border transition-colors ${oledMode ? "bg-[#0a0a0a] border-[#222222]" : "bg-[#111827] border-[#1e293b]"}`}>
              <CardHeader>
                <CardTitle className="text-white text-sm">Tripla Recomendada</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-xs">
                <p className="text-[#94a3b8]">Análise de IA para melhor combinação de apostas</p>
                <Button variant="outline" size="sm" className="w-full text-xs">
                  Gerar Tripla
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
