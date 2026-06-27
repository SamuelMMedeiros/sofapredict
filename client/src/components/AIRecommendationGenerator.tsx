import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { Loader2, Sparkles, TrendingUp } from "lucide-react";
import { Streamdown } from "streamdown";

interface Match {
  id: string;
  homeTeam: string;
  awayTeam: string;
  league: string;
  homeOdd: number;
  drawOdd: number;
  awayOdd: number;
}

interface Recommendation {
  match1: {
    name: string;
    selection: string;
    odd: number;
  };
  match2: {
    name: string;
    selection: string;
    odd: number;
  };
  match3: {
    name: string;
    selection: string;
    odd: number;
  };
  compositeOdd: number;
  confidence: number;
  analysis: string;
  reasoning: string;
}

export default function AIRecommendationGenerator() {
  const [selectedMatches, setSelectedMatches] = useState<Match[]>([]);
  const [recommendation, setRecommendation] = useState<Recommendation | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Mock data for now - will be connected to real API
  const mockMatches: Match[] = [
    {
      id: "1",
      homeTeam: "Flamengo",
      awayTeam: "Palmeiras",
      league: "Série A",
      homeOdd: 2.1,
      drawOdd: 3.4,
      awayOdd: 3.8,
    },
    {
      id: "2",
      homeTeam: "São Paulo",
      awayTeam: "Corinthians",
      league: "Série A",
      homeOdd: 1.95,
      drawOdd: 3.5,
      awayOdd: 4.2,
    },
    {
      id: "3",
      homeTeam: "Botafogo",
      awayTeam: "Vasco",
      league: "Série A",
      homeOdd: 2.3,
      drawOdd: 3.2,
      awayOdd: 3.5,
    },
    {
      id: "4",
      homeTeam: "Grêmio",
      awayTeam: "Internacional",
      league: "Série A",
      homeOdd: 2.0,
      drawOdd: 3.6,
      awayOdd: 4.0,
    },
  ];

  const handleGenerateRecommendation = async () => {
    if (selectedMatches.length < 3) {
      toast.error("Selecione pelo menos 3 partidas");
      return;
    }

    setIsLoading(true);
    try {
      // Simulate AI analysis
      await new Promise(resolve => setTimeout(resolve, 2000));

      const mockRecommendation: Recommendation = {
        match1: {
          name: selectedMatches[0].homeTeam + " vs " + selectedMatches[0].awayTeam,
          selection: "Vitória do " + selectedMatches[0].homeTeam,
          odd: selectedMatches[0].homeOdd,
        },
        match2: {
          name: selectedMatches[1].homeTeam + " vs " + selectedMatches[1].awayTeam,
          selection: "Vitória do " + selectedMatches[1].homeTeam,
          odd: selectedMatches[1].homeOdd,
        },
        match3: {
          name: selectedMatches[2].homeTeam + " vs " + selectedMatches[2].awayTeam,
          selection: "Vitória do " + selectedMatches[2].homeTeam,
          odd: selectedMatches[2].homeOdd,
        },
        compositeOdd:
          selectedMatches[0].homeOdd * selectedMatches[1].homeOdd * selectedMatches[2].homeOdd,
        confidence: 72.5,
        analysis:
          "**Análise Detalhada:**\n\nA combinação selecionada apresenta bom potencial baseado em:\n\n- Histórico recente dos times\n- Estatísticas de confrontos diretos\n- Forma atual e lesões\n- Condições climáticas e localização\n\nOs times selecionados têm taxa de vitória em casa acima de 60% na temporada.",
        reasoning:
          "**Justificativa da IA:**\n\n1. **Primeira Partida**: Time em excelente forma, com 5 vitórias consecutivas\n2. **Segunda Partida**: Favorito histórico com vantagem tática\n3. **Terceira Partida**: Combinação estatisticamente mais provável\n\nRisco moderado com retorno potencial interessante.",
      };

      setRecommendation(mockRecommendation);
      toast.success("Tripla recomendada gerada com sucesso!");
    } catch (error) {
      toast.error("Erro ao gerar recomendação");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const addMatch = (match: Match) => {
    if (selectedMatches.find(m => m.id === match.id)) {
      setSelectedMatches(selectedMatches.filter(m => m.id !== match.id));
    } else if (selectedMatches.length < 5) {
      setSelectedMatches([...selectedMatches, match]);
    } else {
      toast.error("Máximo de 5 partidas por análise");
    }
  };

  return (
    <div className="space-y-4">
      <Card className="bg-[#111827] border-[#1e293b]">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Sparkles size={20} className="text-[#10b981]" />
            Gerador de Tripla Recomendada (IA)
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Available Matches */}
          <div>
            <h3 className="text-white font-semibold text-sm mb-2">Partidas Disponíveis</h3>
            <div className="grid grid-cols-1 gap-2 max-h-64 overflow-y-auto">
              {mockMatches.map(match => (
                <div
                  key={match.id}
                  onClick={() => addMatch(match)}
                  className={`p-3 rounded-lg cursor-pointer transition-all ${
                    selectedMatches.find(m => m.id === match.id)
                      ? "bg-[#10b981]/20 border border-[#10b981]"
                      : "bg-[#0c1322] border border-[#1e293b] hover:border-[#10b981]"
                  }`}
                >
                  <div className="flex justify-between items-start mb-1">
                    <div>
                      <p className="text-white font-semibold text-sm">
                        {match.homeTeam} vs {match.awayTeam}
                      </p>
                      <p className="text-[#94a3b8] text-xs">{match.league}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-[#94a3b8] text-xs">Odds</p>
                      <p className="text-white text-xs">
                        {match.homeOdd.toFixed(2)} | {match.drawOdd.toFixed(2)} | {match.awayOdd.toFixed(2)}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Selected Matches Summary */}
          {selectedMatches.length > 0 && (
            <div className="bg-[#0c1322] border border-[#1e293b] rounded-lg p-3">
              <p className="text-white text-sm font-semibold mb-2">
                Selecionadas: {selectedMatches.length} partidas
              </p>
              <div className="space-y-1">
                {selectedMatches.map((match, i) => (
                  <div key={i} className="text-xs text-[#94a3b8]">
                    {i + 1}. {match.homeTeam} vs {match.awayTeam}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Generate Button */}
          <Button
            onClick={handleGenerateRecommendation}
            disabled={selectedMatches.length < 3 || isLoading}
            className="w-full bg-[#10b981] hover:bg-[#059669] text-white gap-2"
          >
            {isLoading ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                Analisando com IA...
              </>
            ) : (
              <>
                <Sparkles size={16} />
                Gerar Recomendação
              </>
            )}
          </Button>

          {/* Recommendation Result */}
          {recommendation && (
            <div className="space-y-3 bg-[#0c1322] border border-[#1e293b] rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-white font-bold text-sm flex items-center gap-2">
                  <TrendingUp size={16} className="text-[#10b981]" />
                  Tripla Recomendada
                </h4>
                <div className="text-right">
                  <p className="text-[#94a3b8] text-xs">Odds Combinada</p>
                  <p className="text-[#10b981] font-bold text-lg">{recommendation.compositeOdd.toFixed(2)}</p>
                </div>
              </div>

              {/* Confidence Score */}
              <div className="bg-[#111827] rounded p-2">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-[#94a3b8] text-xs">Nível de Confiança</span>
                  <span className="text-[#10b981] font-bold text-sm">{recommendation.confidence.toFixed(1)}%</span>
                </div>
                <div className="w-full bg-[#0c1322] rounded-full h-2">
                  <div
                    className="bg-[#10b981] h-2 rounded-full transition-all"
                    style={{ width: `${recommendation.confidence}%` }}
                  />
                </div>
              </div>

              {/* Selections */}
              <div className="space-y-2">
                {[recommendation.match1, recommendation.match2, recommendation.match3].map((match, i) => (
                  <div key={i} className="bg-[#111827] rounded p-2">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="text-white text-xs font-semibold">{i + 1}. {match.name}</p>
                        <p className="text-[#94a3b8] text-xs">{match.selection}</p>
                      </div>
                      <span className="text-[#10b981] font-bold text-sm">{match.odd.toFixed(2)}</span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Analysis */}
              <div className="space-y-2">
                <h5 className="text-white text-xs font-semibold">Análise da IA</h5>
                <div className="bg-[#111827] rounded p-2 text-xs text-[#94a3b8] max-h-32 overflow-y-auto">
                  <Streamdown>{recommendation.analysis}</Streamdown>
                </div>
              </div>

              {/* Reasoning */}
              <div className="space-y-2">
                <h5 className="text-white text-xs font-semibold">Justificativa</h5>
                <div className="bg-[#111827] rounded p-2 text-xs text-[#94a3b8] max-h-32 overflow-y-auto">
                  <Streamdown>{recommendation.reasoning}</Streamdown>
                </div>
              </div>

              {/* Add to Slip Button */}
              <Button className="w-full bg-[#10b981] hover:bg-[#059669] text-white text-sm">
                Adicionar ao Bilhete
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
