import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { Trash2, Plus, TrendingUp } from "lucide-react";

interface BetSelection {
  matchId: string;
  league: string;
  homeTeam: string;
  awayTeam: string;
  selectionLabel: string;
  odd: number;
  type: "1" | "X" | "2";
}

export default function BettingSlipManager() {
  const [selections, setSelections] = useState<BetSelection[]>([]);
  const [stake, setStake] = useState("100");
  const [notes, setNotes] = useState("");

  const createSlip = trpc.bets.createSlip.useMutation();
  const getHistory = trpc.bets.getHistory.useQuery();

  const compositeOdds = selections.reduce((acc, sel) => acc * sel.odd, 1);
  const projectedReturn = (parseFloat(stake) || 0) * compositeOdds;
  const profit = projectedReturn - (parseFloat(stake) || 0);

  const handleAddSelection = () => {
    const newSelection: BetSelection = {
      matchId: `match-${Date.now()}`,
      league: "Série A",
      homeTeam: "Time A",
      awayTeam: "Time B",
      selectionLabel: "Vitória",
      odd: 2.0,
      type: "1",
    };
    setSelections([...selections, newSelection]);
  };

  const handleRemoveSelection = (index: number) => {
    setSelections(selections.filter((_, i) => i !== index));
  };

  const handleSubmitBet = async () => {
    if (selections.length === 0) {
      toast.error("Adicione pelo menos uma seleção");
      return;
    }

    try {
      await createSlip.mutateAsync({
        compositeOdds: compositeOdds.toFixed(2),
        investedAmount: stake,
        projectedReturn: projectedReturn.toFixed(2),
        selections,
        notes,
      });

      toast.success("Aposta registrada com sucesso!");
      setSelections([]);
      setStake("100");
      setNotes("");
      getHistory.refetch();
    } catch (error) {
      toast.error("Erro ao registrar aposta");
      console.error(error);
    }
  };

  return (
    <div className="space-y-4">
      <Tabs defaultValue="slip" className="w-full">
        <TabsList className="grid w-full grid-cols-2 bg-[#111827] border-[#1e293b]">
          <TabsTrigger value="slip" className="text-xs">
            Bilhete
          </TabsTrigger>
          <TabsTrigger value="history" className="text-xs">
            Histórico
          </TabsTrigger>
        </TabsList>

        {/* Betting Slip Tab */}
        <TabsContent value="slip" className="space-y-3">
          <Card className="bg-[#111827] border-[#1e293b]">
            <CardHeader>
              <CardTitle className="text-white text-base flex items-center gap-2">
                <TrendingUp size={20} className="text-[#10b981]" />
                Bilhete de Apostas
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Selections */}
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <h3 className="text-white font-semibold text-sm">Seleções ({selections.length})</h3>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={handleAddSelection}
                    className="text-xs gap-1"
                  >
                    <Plus size={14} />
                    Adicionar
                  </Button>
                </div>

                {selections.length === 0 ? (
                  <div className="bg-[#0c1322] border border-[#1e293b] rounded-lg p-4 text-center">
                    <p className="text-[#94a3b8] text-sm">Nenhuma seleção adicionada</p>
                  </div>
                ) : (
                  selections.map((sel, index) => (
                    <div key={index} className="bg-[#0c1322] border border-[#1e293b] rounded-lg p-3">
                      <div className="flex justify-between items-start mb-2">
                        <div className="flex-1">
                          <p className="text-white font-semibold text-sm">
                            {sel.homeTeam} vs {sel.awayTeam}
                          </p>
                          <p className="text-[#94a3b8] text-xs">{sel.league}</p>
                        </div>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => handleRemoveSelection(index)}
                          className="px-2"
                        >
                          <Trash2 size={14} />
                        </Button>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-[#94a3b8] text-xs">{sel.selectionLabel}</span>
                        <span className="text-[#10b981] font-bold text-sm">{sel.odd.toFixed(2)}</span>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Odds Summary */}
              {selections.length > 0 && (
                <div className="bg-[#0c1322] border border-[#1e293b] rounded-lg p-3 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-[#94a3b8]">Odds Combinada:</span>
                    <span className="text-white font-bold">{compositeOdds.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-[#94a3b8]">Retorno Projetado:</span>
                    <span className="text-[#10b981] font-bold">R$ {projectedReturn.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-[#94a3b8]">Lucro Potencial:</span>
                    <span className={`font-bold ${profit > 0 ? "text-[#10b981]" : "text-red-500"}`}>
                      R$ {profit.toFixed(2)}
                    </span>
                  </div>
                </div>
              )}

              {/* Stake Input */}
              <div>
                <label className="text-white text-sm font-semibold">Valor da Aposta (R$)</label>
                <Input
                  type="number"
                  step="0.01"
                  value={stake}
                  onChange={e => setStake(e.target.value)}
                  placeholder="100.00"
                  className="bg-[#0c1322] border-[#1e293b] text-white mt-2"
                />
              </div>

              {/* Notes */}
              <div>
                <label className="text-white text-sm font-semibold">Notas (opcional)</label>
                <textarea
                  value={notes}
                  onChange={e => setNotes(e.target.value)}
                  placeholder="Adicione observações sobre esta aposta..."
                  className="w-full bg-[#0c1322] border border-[#1e293b] rounded text-white text-sm p-2 mt-2 resize-none"
                  rows={3}
                />
              </div>

              {/* Submit Button */}
              <Button
                onClick={handleSubmitBet}
                disabled={selections.length === 0 || createSlip.isPending}
                className="w-full bg-[#10b981] hover:bg-[#059669] text-white"
              >
                {createSlip.isPending ? "Processando..." : "Confirmar Aposta"}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* History Tab */}
        <TabsContent value="history" className="space-y-3">
          <Card className="bg-[#111827] border-[#1e293b]">
            <CardHeader>
              <CardTitle className="text-white text-base">Histórico de Apostas</CardTitle>
            </CardHeader>
            <CardContent>
              {getHistory.isLoading ? (
                <div className="text-center py-8">
                  <p className="text-[#94a3b8]">Carregando...</p>
                </div>
              ) : getHistory.data && getHistory.data.length > 0 ? (
                <div className="space-y-2">
                  {getHistory.data.map((bet, index) => (
                    <div key={index} className="bg-[#0c1322] border border-[#1e293b] rounded-lg p-3">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <p className="text-white font-semibold text-sm">
                            {bet.selections?.length || 0} seleções
                          </p>
                          <p className="text-[#94a3b8] text-xs">
                            {new Date(bet.createdAt).toLocaleDateString("pt-BR")}
                          </p>
                        </div>
                        <span
                          className={`px-2 py-1 rounded text-xs font-bold ${
                            bet.status === "won"
                              ? "bg-[#10b981]/20 text-[#10b981]"
                              : bet.status === "lost"
                                ? "bg-red-500/20 text-red-500"
                                : "bg-yellow-500/20 text-yellow-500"
                          }`}
                        >
                          {bet.status === "won" ? "Ganho" : bet.status === "lost" ? "Perdido" : "Pendente"}
                        </span>
                      </div>
                      <div className="grid grid-cols-3 gap-2 text-xs">
                        <div>
                          <p className="text-[#94a3b8]">Aposta</p>
                          <p className="text-white font-bold">R$ {bet.investedAmount}</p>
                        </div>
                        <div>
                          <p className="text-[#94a3b8]">Odds</p>
                          <p className="text-white font-bold">{bet.compositeOdds}</p>
                        </div>
                        <div>
                          <p className="text-[#94a3b8]">Retorno</p>
                          <p className="text-[#10b981] font-bold">R$ {bet.actualReturn || bet.projectedReturn}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-[#94a3b8]">Nenhuma aposta registrada</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
