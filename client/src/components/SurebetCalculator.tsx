import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { AlertCircle, Check, X, Plus, Trash2, Loader2 } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useState, useEffect } from "react";
import { trpc } from "@/lib/trpc";
import { BookmakersListSkeleton, LoadingSpinner } from "@/components/LoadingSkeletons";

interface Odd {
  bookmaker: string;
  home: number;
  draw: number;
  away: number;
}

interface SurebetResult {
  isSurebet: boolean;
  roi: number;
  bestSelection: {
    option: "1" | "X" | "2";
    bookmaker: string;
    odd: number;
  }[];
  totalStake: number;
  totalReturn: number;
  profit: number;
}

// Real bookmakers list
const BOOKMAKERS = [
  "Pinnacle",
  "bet365",
  "Betfair",
  "Unibet",
  "Bwin",
  "Betvictor",
  "Smarkets",
  "Matchbook",
];

export default function SurebetCalculator() {
  const [odds, setOdds] = useState<Odd[]>([
    { bookmaker: "Pinnacle", home: 1.95, draw: 3.40, away: 4.20 },
    { bookmaker: "bet365", home: 1.92, draw: 3.50, away: 4.10 },
  ]);
  const [stake, setStake] = useState("100");
  const [result, setResult] = useState<SurebetResult | null>(null);
  
  // Fetch real bookmakers from BetMiner
  const { data: betMinerBookmakers, isLoading: loadingBookmakers } = trpc.api.getBookmakers.useQuery();
  
  // Use BetMiner bookmakers if available, fallback to hardcoded list
  const availableBookmakers = (betMinerBookmakers && betMinerBookmakers.length > 0)
    ? betMinerBookmakers.map((bm: any) => typeof bm === 'string' ? bm : bm.name || bm)
    : BOOKMAKERS;

  const calculateSurebet = () => {
    if (odds.length < 2) {
      alert("Adicione pelo menos 2 casas de apostas");
      return;
    }

    // Find best odds for each outcome
    const bestHome = Math.max(...odds.map(o => o.home));
    const bestDraw = Math.max(...odds.map(o => o.draw));
    const bestAway = Math.max(...odds.map(o => o.away));

    // Calculate implied probability
    const impliedProb = 1 / bestHome + 1 / bestDraw + 1 / bestAway;

    // If less than 1, it's a surebet
    const isSurebet = impliedProb < 1;
    const roi = ((1 - impliedProb) / impliedProb) * 100;

    // Calculate stake distribution
    const totalStake = parseFloat(stake) || 100;
    const homeStake = (totalStake / bestHome) * (1 / impliedProb);
    const drawStake = (totalStake / bestDraw) * (1 / impliedProb);
    const awayStake = (totalStake / bestAway) * (1 / impliedProb);

    const homeReturn = homeStake * bestHome;
    const drawReturn = drawStake * bestDraw;
    const awayReturn = awayStake * bestAway;

    const totalReturn = Math.min(homeReturn, drawReturn, awayReturn);
    const profit = totalReturn - totalStake;

    setResult({
      isSurebet,
      roi,
      bestSelection: [
        {
          option: "1",
          bookmaker: odds.find(o => o.home === bestHome)?.bookmaker || "N/A",
          odd: bestHome,
        },
        {
          option: "X",
          bookmaker: odds.find(o => o.draw === bestDraw)?.bookmaker || "N/A",
          odd: bestDraw,
        },
        {
          option: "2",
          bookmaker: odds.find(o => o.away === bestAway)?.bookmaker || "N/A",
          odd: bestAway,
        },
      ],
      totalStake,
      totalReturn,
      profit,
    });
  };

  const addBookmaker = () => {
    const availableBookmakers = BOOKMAKERS.filter(
      b => !odds.some(o => o.bookmaker === b)
    );
    if (availableBookmakers.length > 0) {
      setOdds([...odds, { bookmaker: availableBookmakers[0], home: 2.0, draw: 3.5, away: 4.0 }]);
    }
  };

  const removeBookmaker = (index: number) => {
    setOdds(odds.filter((_, i) => i !== index));
  };

  const updateOdd = (index: number, field: "home" | "draw" | "away", value: string) => {
    const newOdds = [...odds];
    newOdds[index][field] = parseFloat(value) || 0;
    setOdds(newOdds);
  };

  const updateBookmaker = (index: number, bookmaker: string) => {
    const newOdds = [...odds];
    newOdds[index].bookmaker = bookmaker;
    setOdds(newOdds);
  };

  return (
    <div className="space-y-4">
      <Card className="bg-[#111827] border-[#1e293b]">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <span>🎯 Calculadora de Arbitragem (Surebet)</span>
          </CardTitle>
          <p className="text-[#94a3b8] text-sm mt-2">
            Encontre apostas sem risco cruzando odds de múltiplas casas
          </p>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Bookmakers Input */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-white font-semibold">Casas de Apostas</label>
              <Button
                onClick={addBookmaker}
                size="sm"
                className="bg-[#10b981] hover:bg-[#059669] text-white"
                disabled={odds.length >= BOOKMAKERS.length}
              >
                <Plus size={16} className="mr-1" />
                Adicionar
              </Button>
            </div>

            <div className="space-y-3 max-h-64 overflow-y-auto">
              {odds.map((odd, index) => (
                <div key={index} className="bg-[#0c1322] p-4 rounded-lg border border-[#1e293b] space-y-3">
                  <div className="flex gap-2 items-end">
                    <div className="flex-1">
                      <label className="text-[#94a3b8] text-sm">Casa de Apostas</label>
                      <Select value={odd.bookmaker} onValueChange={(v) => updateBookmaker(index, v)}>
                        <SelectTrigger className="bg-[#111827] border-[#1e293b] text-white">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-[#111827] border-[#1e293b]">
                          {BOOKMAKERS.map(bm => (
                            <SelectItem key={bm} value={bm} className="text-white">
                              {bm}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <Button
                      onClick={() => removeBookmaker(index)}
                      size="sm"
                      variant="ghost"
                      className="text-red-400 hover:text-red-300 hover:bg-red-400/10"
                    >
                      <Trash2 size={16} />
                    </Button>
                  </div>

                  <div className="grid grid-cols-3 gap-2">
                    <div>
                      <label className="text-[#94a3b8] text-xs">Casa (1)</label>
                      <Input
                        type="number"
                        step="0.01"
                        value={odd.home}
                        onChange={(e) => updateOdd(index, "home", e.target.value)}
                        className="bg-[#111827] border-[#1e293b] text-white"
                      />
                    </div>
                    <div>
                      <label className="text-[#94a3b8] text-xs">Empate (X)</label>
                      <Input
                        type="number"
                        step="0.01"
                        value={odd.draw}
                        onChange={(e) => updateOdd(index, "draw", e.target.value)}
                        className="bg-[#111827] border-[#1e293b] text-white"
                      />
                    </div>
                    <div>
                      <label className="text-[#94a3b8] text-xs">Visitante (2)</label>
                      <Input
                        type="number"
                        step="0.01"
                        value={odd.away}
                        onChange={(e) => updateOdd(index, "away", e.target.value)}
                        className="bg-[#111827] border-[#1e293b] text-white"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Stake Input */}
          <div>
            <label className="text-white font-semibold block mb-2">Valor Total da Aposta (R$)</label>
            <Input
              type="number"
              value={stake}
              onChange={(e) => setStake(e.target.value)}
              className="bg-[#0c1322] border-[#1e293b] text-white"
              placeholder="100"
            />
          </div>

          {/* Calculate Button */}
          <Button
            onClick={calculateSurebet}
            className="w-full bg-[#10b981] hover:bg-[#059669] text-white py-6 text-base"
          >
            Calcular Arbitragem
          </Button>

          {/* Results */}
          {result && (
            <div className="space-y-4 pt-4 border-t border-[#1e293b]">
              <div className={`p-4 rounded-lg flex items-start gap-3 ${
                result.isSurebet
                  ? "bg-[#10b981]/10 border border-[#10b981]/30"
                  : "bg-red-500/10 border border-red-500/30"
              }`}>
                {result.isSurebet ? (
                  <Check className="text-[#10b981] flex-shrink-0 mt-1" size={20} />
                ) : (
                  <AlertCircle className="text-red-400 flex-shrink-0 mt-1" size={20} />
                )}
                <div>
                  <p className={`font-bold ${result.isSurebet ? "text-[#10b981]" : "text-red-400"}`}>
                    {result.isSurebet ? "✓ Arbitragem Encontrada!" : "✗ Sem Arbitragem"}
                  </p>
                  <p className="text-[#94a3b8] text-sm">
                    {result.isSurebet
                      ? `ROI: ${result.roi.toFixed(2)}% - Lucro garantido de R$ ${result.profit.toFixed(2)}`
                      : "As odds não formam uma arbitragem lucrativa"}
                  </p>
                </div>
              </div>

              {result.isSurebet && (
                <>
                  <div className="bg-[#0c1322] p-4 rounded-lg border border-[#1e293b] space-y-3">
                    <h4 className="text-white font-semibold">Melhor Distribuição de Apostas:</h4>
                    {result.bestSelection.map((sel, idx) => (
                      <div key={idx} className="flex justify-between items-center">
                        <div>
                          <p className="text-[#94a3b8] text-sm">
                            {sel.option === "1" ? "Casa" : sel.option === "X" ? "Empate" : "Visitante"} - {sel.bookmaker}
                          </p>
                          <p className="text-white font-semibold">Odd: {sel.odd.toFixed(2)}</p>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="grid grid-cols-3 gap-2 text-center">
                    <div className="bg-[#0c1322] p-3 rounded-lg border border-[#1e293b]">
                      <p className="text-[#94a3b8] text-xs">Aposta Total</p>
                      <p className="text-[#10b981] font-bold">R$ {result.totalStake.toFixed(2)}</p>
                    </div>
                    <div className="bg-[#0c1322] p-3 rounded-lg border border-[#1e293b]">
                      <p className="text-[#94a3b8] text-xs">Retorno</p>
                      <p className="text-[#10b981] font-bold">R$ {result.totalReturn.toFixed(2)}</p>
                    </div>
                    <div className="bg-[#0c1322] p-3 rounded-lg border border-[#1e293b]">
                      <p className="text-[#94a3b8] text-xs">Lucro</p>
                      <p className="text-[#10b981] font-bold">R$ {result.profit.toFixed(2)}</p>
                    </div>
                  </div>
                </>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
