import { useState } from "react";
import { Link, useParams } from "wouter";
import { ArrowLeft, BarChart3, Brain, Clock3, Loader2, Trophy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { trpc } from "@/lib/trpc";

function readQuery(name: string) {
  return new URLSearchParams(window.location.search).get(name) || "";
}

function unwrapResponse(value: unknown): Record<string, any> {
  if (!value || typeof value !== "object") return {};
  const data = value as Record<string, any>;
  if (Array.isArray(data.response)) return data.response[0] || {};
  return data;
}

function formatValue(value: unknown): string {
  if (value === null || value === undefined || value === "") return "-";
  if (typeof value === "object") return JSON.stringify(value);
  return String(value);
}

export default function MatchDetails() {
  const params = useParams<{ id: string }>();
  const fixtureId = Number(params.id);
  const homeTeam = readQuery("home") || "Casa";
  const awayTeam = readQuery("away") || "Fora";
  const league = readQuery("league") || "Partida";
  const fallbackOdds = {
    home: Number(readQuery("homeOdd")) || 0,
    draw: Number(readQuery("drawOdd")) || 0,
    away: Number(readQuery("awayOdd")) || 0,
  };
  const [analysisEnabled, setAnalysisEnabled] = useState(false);

  const detailsQuery = trpc.api.getMatchDetails.useQuery(
    { fixtureId },
    { enabled: Number.isInteger(fixtureId) && fixtureId > 0, retry: false }
  );
  const oddsQuery = trpc.api.getLiveOdds.useQuery(
    { matchId: params.id || "" },
    { enabled: Boolean(params.id), retry: false }
  );
  const analysisQuery = trpc.ai.analyzeMatch.useQuery(
    {
      homeTeam,
      awayTeam,
      league,
      homeStats: {},
      awayStats: {},
      recentForm: { home: [], away: [] },
    },
    { enabled: analysisEnabled, retry: false }
  );

  const details = unwrapResponse(detailsQuery.data);
  const fixture = details.fixture || details;
  const teams = details.teams || fixture.teams || {};
  const goals = details.goals || fixture.goals || {};
  const stats = Array.isArray(details.statistics) ? details.statistics : [];
  const bookmakers = unwrapResponse(oddsQuery.data);
  const isLoading = detailsQuery.isLoading || oddsQuery.isLoading;
  const actualHome = teams.home?.name || homeTeam;
  const actualAway = teams.away?.name || awayTeam;
  const actualLeague = details.league?.name || league;
  const status = fixture.status?.long || fixture.status?.short || "Programada";
  const kickoff = fixture.date ? new Date(fixture.date).toLocaleString("pt-BR") : "Horário não informado";

  return (
    <div className="min-h-screen bg-[#090d16] text-white">
      <header className="sticky top-0 z-20 border-b border-[#1e293b] bg-[#111827]/95 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
          <Link href="/explore">
            <Button variant="ghost" className="text-[#94a3b8] hover:text-white">
              <ArrowLeft size={18} className="mr-2" /> Voltar às partidas
            </Button>
          </Link>
          <span className="text-sm text-[#64748b]">Detalhes gratuitos</span>
        </div>
      </header>

      <main className="mx-auto max-w-6xl space-y-6 px-4 py-8">
        <section className="rounded-xl border border-[#10b981]/30 bg-gradient-to-br from-[#10251f] to-[#111827] p-6 md:p-10">
          <div className="mb-6 flex flex-wrap items-center gap-2 text-sm text-[#94a3b8]">
            <Trophy size={16} className="text-[#10b981]" />
            <span>{actualLeague}</span>
            <span>•</span>
            <span>{status}</span>
          </div>
          <div className="grid items-center gap-6 md:grid-cols-[1fr_auto_1fr]">
            <div className="text-center md:text-right">
              <p className="text-2xl font-bold md:text-4xl">{actualHome}</p>
              <p className="mt-2 text-[#94a3b8]">Casa</p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-black text-[#10b981]">
                {goals.home ?? "-"} : {goals.away ?? "-"}
              </p>
              <p className="mt-2 flex items-center justify-center gap-1 text-xs text-[#94a3b8]">
                <Clock3 size={14} /> {kickoff}
              </p>
            </div>
            <div className="text-center md:text-left">
              <p className="text-2xl font-bold md:text-4xl">{actualAway}</p>
              <p className="mt-2 text-[#94a3b8]">Fora</p>
            </div>
          </div>
        </section>

        {isLoading && (
          <div className="flex items-center justify-center gap-2 py-8 text-[#94a3b8]">
            <Loader2 className="animate-spin" size={20} /> Buscando dados atualizados...
          </div>
        )}

        <div className="grid gap-6 lg:grid-cols-2">
          <Card className="border-[#1e293b] bg-[#111827]">
            <CardHeader>
              <CardTitle className="text-white">Odds disponíveis</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-3 gap-3">
                {[
                  ["Casa", fallbackOdds.home],
                  ["Empate", fallbackOdds.draw],
                  ["Fora", fallbackOdds.away],
                ].map(([label, odd]) => (
                  <div key={String(label)} className="rounded-lg bg-[#0c1322] p-4 text-center">
                    <p className="text-xs text-[#94a3b8]">{label}</p>
                    <p className="mt-1 text-2xl font-bold text-[#10b981]">{odd || "-"}</p>
                  </div>
                ))}
              </div>
              <div className="rounded-lg border border-[#1e293b] bg-[#0c1322] p-4">
                <p className="mb-2 text-sm font-semibold text-white">Mercados retornados pela API</p>
                {Object.keys(bookmakers).length > 0 ? (
                  <pre className="max-h-48 overflow-auto whitespace-pre-wrap text-xs text-[#94a3b8]">
                    {JSON.stringify(bookmakers, null, 2)}
                  </pre>
                ) : (
                  <p className="text-sm text-[#64748b]">Odds detalhadas indisponíveis para esta partida.</p>
                )}
              </div>
            </CardContent>
          </Card>

          <Card className="border-[#1e293b] bg-[#111827]">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-white">
                <Brain size={20} className="text-[#10b981]" /> Indicação SofaPredict
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {!analysisEnabled && (
                <>
                  <p className="text-sm leading-6 text-[#94a3b8]">
                    Gere uma leitura baseada nos dados desta partida e veja confiança, fatores e mercados sugeridos.
                  </p>
                  <Button onClick={() => setAnalysisEnabled(true)} className="bg-[#10b981] text-white hover:bg-[#059669]">
                    <Brain size={16} className="mr-2" /> Gerar análise gratuita
                  </Button>
                </>
              )}
              {analysisQuery.isLoading && <p className="text-[#94a3b8]">Analisando...</p>}
              {analysisQuery.error && (
                <p className="text-sm text-amber-300">Configure GEMINI_API_KEY para gerar a indicação automática.</p>
              )}
              {analysisQuery.data && (
                <div className="space-y-3">
                  <p className="text-2xl font-bold text-[#10b981]">
                    {analysisQuery.data.prediction} · {analysisQuery.data.confidence}%
                  </p>
                  <p className="text-sm leading-6 text-[#cbd5e1]">{analysisQuery.data.analysis}</p>
                  <ul className="list-disc space-y-1 pl-5 text-sm text-[#94a3b8]">
                    {analysisQuery.data.keyFactors.map(factor => <li key={factor}>{factor}</li>)}
                  </ul>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <Card className="border-[#1e293b] bg-[#111827]">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-white">
              <BarChart3 size={20} className="text-[#10b981]" /> Estatísticas da partida
            </CardTitle>
          </CardHeader>
          <CardContent>
            {stats.length > 0 ? (
              <div className="grid gap-3 md:grid-cols-2">
                {stats.map((teamStats: any, index: number) => (
                  <div key={teamStats.team?.id || index} className="rounded-lg bg-[#0c1322] p-4">
                    <p className="mb-3 font-semibold text-white">{teamStats.team?.name || `Time ${index + 1}`}</p>
                    <div className="space-y-2 text-sm text-[#94a3b8]">
                      {(teamStats.statistics || []).slice(0, 8).map((stat: any) => (
                        <div key={stat.type} className="flex justify-between gap-4">
                          <span>{stat.type}</span><strong className="text-white">{formatValue(stat.value)}</strong>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-[#64748b]">As estatísticas detalhadas aparecerão quando a API retornar o fixture.</p>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
