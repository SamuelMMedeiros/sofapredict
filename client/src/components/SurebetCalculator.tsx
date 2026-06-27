import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { AlertCircle, Check, X } from "lucide-react";

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

export default function SurebetCalculator() {
  const [odds, setOdds] = useState<Odd[]>([
    { bookmaker: "Pinnacle", home: 1.95, draw: 3.40, away: 4.20 },
    { bookmaker: "bet365", home: 1.92, draw: 3.50, away: 4.10 },
  ]);
  const [stake, setStake] = useState("100");
  const [result, setResult] = useState<SurebetResult | null>(null);

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
    setOdds([...odds, { bookmaker: "Nova Casa", home: 2.0, draw: 3.5, away: 4.0 }]);
  };

  const removeBookmaker = (index: number) => {
    setOdds(odds.filter((_, i) => i !== index));
  };

  const updateOdd = (index: number, field: "home" | "draw" | "away", value: string) => {
    const newOdds = [...odds];
    newOdds[index] = {
      ...newOdds[index],
      [field]: parseFloat(value) || 0,
    };
    setOdds(newOdds);
  };

  const updateBookmaker = (index: number, value: string) => {
    const newOdds = [...odds];
    newOdds[index].bookmaker = value;
    setOdds(newOdds);
  };

  return (
    <div className="space-y-4">
      <Card className="bg-[#111827] border-[#1e293b]">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <AlertCircle size={20} className="text-[#10b981]" />
            Calculadora de Arbitragem (Surebets)
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Bookmakers Input */}
          <div className="space-y-3">
            <h3 className="text-white font-semibold text-sm">Casas de Apostas</h3>
            {odds.map((odd, index) => (
              <div key={index} className="bg-[#0c1322] border border-[#1e293b] rounded-lg p-3 space-y-2">
                <div className="flex gap-2">
                  <Input
                    value={odd.bookmaker}
                    onChange={e => updateBookmaker(index, e.target.value)}
                    placeholder="Nome da casa"
                    className="bg-[#111827] border-[#1e293b] text-white text-sm flex-1"
                  />
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => removeBookmaker(index)}
                    className="px-2"
                  >
                    <X size={16} />
                  </Button>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <label className="text-[#94a3b8] text-xs">Vitória (1)</label>
                    <Input
                      type="number"
                      step="0.01"
                      value={odd.home}
                      onChange={e => updateOdd(index, "home", e.target.value)}
                      className="bg-[#111827] border-[#1e293b] text-white text-sm mt-1"
                    />
                  </div>
                  <div>
                    <label className="text-[#94a3b8] text-xs">Empate (X)</label>
                    <Input
                      type="number"
                      step="0.01"
                      value={odd.draw}
                      onChange={e => updateOdd(index, "draw", e.target.value)}
                      className="bg-[#111827] border-[#1e293b] text-white text-sm mt-1"
                    />
                  </div>
                  <div>
                    <label className="text-[#94a3b8] text-xs">Derrota (2)</label>
                    <Input
                      type="number"
                      step="0.01"
                      value={odd.away}
                      onChange={e => updateOdd(index, "away", e.target.value)}
                      className="bg-[#111827] border-[#1e293b] text-white text-sm mt-1"
                    />
                  </div>
                </div>
              </div>
            ))}
            <Button
              variant="outline"
              size="sm"
              onClick={addBookmaker}
              className="w-full text-xs"
            >
              + Adicionar Casa
            </Button>
          </div>

          {/* Stake Input */}
          <div>
            <label className="text-white text-sm font-semibold">Valor Total da Aposta (R$)</label>
            <Input
              type="number"
              step="0.01"
              value={stake}
              onChange={e => setStake(e.target.value)}
              placeholder="100.00"
              className="bg-[#0c1322] border-[#1e293b] text-white mt-2"
            />
          </div>

          {/* Calculate Button */}
          <Button
            onClick={calculateSurebet}
            className="w-full bg-[#10b981] hover:bg-[#059669] text-white"
          >
            Calcular Arbitragem
          </Button>

          {/* Results */}
          {result && (
            <div className="mt-4 space-y-3 bg-[#0c1322] border border-[#1e293b] rounded-lg p-4">
              <div className="flex items-center justify-between">
                <span className="text-white font-semibold">Status:</span>
                <div className="flex items-center gap-2">
                  {result.isSurebet ? (
                    <>
                      <Check size={20} className="text-[#10b981]" />
                      <span className="text-[#10b981] font-bold">SUREBET ENCONTRADA!</span>
                    </>
                  ) : (
                    <>
                      <X size={20} className="text-red-500" />
                      <span className="text-red-500 font-bold">Sem arbitragem</span>
                    </>
                  )}
                </div>
              </div>

              {result.isSurebet && (
                <>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div>
                      <p className="text-[#94a3b8]">ROI</p>
                      <p className="text-[#10b981] font-bold">{result.roi.toFixed(2)}%</p>
                    </div>
                    <div>
                      <p className="text-[#94a3b8]">Lucro</p>
                      <p className="text-[#10b981] font-bold">R$ {result.profit.toFixed(2)}</p>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <p className="text-white text-xs font-semibold">Distribuição de Apostas:</p>
                    {result.bestSelection.map((sel, i) => (
                      <div key={i} className="bg-[#111827] rounded p-2 text-xs">
                        <div className="flex justify-between">
                          <span className="text-[#94a3b8]">
                            {sel.option === "1" ? "Vitória" : sel.option === "X" ? "Empate" : "Derrota"}
                          </span>
                          <span className="text-white">{sel.bookmaker}</span>
                        </div>
                        <div className="flex justify-between mt-1">
                          <span className="text-[#94a3b8]">Odd: {sel.odd.toFixed(2)}</span>
                          <span className="text-[#10b981]">Retorno: R$ {(result.totalReturn / 3).toFixed(2)}</span>
                        </div>
                      </div>
                    ))}
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
