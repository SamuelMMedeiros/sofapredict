import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { trpc } from "@/lib/trpc";
import { getLoginUrl } from "@/const";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { TrendingUp, TrendingDown, Calendar, DollarSign } from "lucide-react";
import { Link } from "wouter";

export default function BettingHistory() {
  const { user, isAuthenticated } = useAuth();
  const { data: bets, isLoading } = trpc.bets.getHistory.useQuery(undefined, {
    enabled: isAuthenticated,
  });

  const { data: stats } = trpc.user.getStats.useQuery(undefined, {
    enabled: isAuthenticated,
  });

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#090d16] flex items-center justify-center">
        <Card className="bg-[#111827] border-[#1e293b] max-w-md w-full mx-4">
          <CardHeader>
            <CardTitle className="text-white">Acesso Restrito</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-[#94a3b8]">
              Você precisa estar logado para visualizar seu histórico de apostas.
            </p>
            <Button
              onClick={() => (window.location.href = getLoginUrl())}
              className="w-full bg-[#10b981] hover:bg-[#059669] text-white"
            >
              Fazer Login
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#090d16]">
      {/* Header */}
      <div className="border-b border-[#1e293b] bg-[#0c1322] sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/dashboard">
              <Button variant="ghost" className="text-[#94a3b8] hover:text-white">
                ← Dashboard
              </Button>
            </Link>
            <h1 className="text-2xl font-bold text-white">Histórico de Apostas</h1>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8 space-y-8">
        {/* Stats Overview */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card className="bg-[#111827] border-[#1e293b]">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm text-[#94a3b8]">Total de Apostas</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold text-white">{stats.totalBets}</p>
              </CardContent>
            </Card>

            <Card className="bg-[#111827] border-[#1e293b]">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm text-[#94a3b8]">Taxa de Acerto</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold text-white">
                  {stats.winRate ? (typeof stats.winRate === 'string' ? parseFloat(stats.winRate) : stats.winRate).toFixed(1) : '0'}%
                </p>
              </CardContent>
            </Card>

            <Card className="bg-[#111827] border-[#1e293b]">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm text-[#94a3b8]">ROI</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2">
                  {stats.roi !== null ? (
                    <>
                      <p className="text-3xl font-bold text-white">
                        {(typeof stats.roi === 'string' ? parseFloat(stats.roi) : stats.roi).toFixed(1)}%
                      </p>
                      {(typeof stats.roi === 'string' ? parseFloat(stats.roi) : stats.roi) >= 0 ? (
                        <TrendingUp size={24} className="text-[#10b981]" />
                      ) : (
                        <TrendingDown size={24} className="text-red-500" />
                      )}
                    </>
                  ) : (
                    <p className="text-3xl font-bold text-white">0%</p>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card className="bg-[#111827] border-[#1e293b]">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm text-[#94a3b8]">Sequência</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold text-white">{stats.currentStreak}</p>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Bets Table */}
        <Card className="bg-[#111827] border-[#1e293b]">
          <CardHeader>
            <CardTitle className="text-white">Suas Apostas</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="text-center py-8 text-[#94a3b8]">Carregando...</div>
            ) : !bets || bets.length === 0 ? (
              <div className="text-center py-8 text-[#94a3b8]">
                Você ainda não fez nenhuma aposta. Comece a explorar!
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-[#1e293b]">
                      <th className="text-left py-3 px-4 text-[#94a3b8] font-semibold">Data</th>
                      <th className="text-left py-3 px-4 text-[#94a3b8] font-semibold">Partida</th>
                      <th className="text-left py-3 px-4 text-[#94a3b8] font-semibold">Tipo</th>
                      <th className="text-left py-3 px-4 text-[#94a3b8] font-semibold">Odds</th>
                      <th className="text-left py-3 px-4 text-[#94a3b8] font-semibold">Valor</th>
                      <th className="text-left py-3 px-4 text-[#94a3b8] font-semibold">Retorno</th>
                      <th className="text-left py-3 px-4 text-[#94a3b8] font-semibold">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {bets.map((bet: any) => (
                      <tr
                        key={bet.id}
                        className="border-b border-[#1e293b] hover:bg-[#0c1322] transition"
                      >
                        <td className="py-3 px-4 text-white">
                          <div className="flex items-center gap-2">
                            <Calendar size={16} className="text-[#94a3b8]" />
                            {format(new Date(bet.createdAt), "dd MMM yyyy", { locale: ptBR })}
                          </div>
                        </td>
                        <td className="py-3 px-4 text-white">{bet.matchName}</td>
                        <td className="py-3 px-4">
                          <Badge className="bg-[#10b981]/20 text-[#10b981]">{bet.betType}</Badge>
                        </td>
                        <td className="py-3 px-4 text-white">{bet.odds.toFixed(2)}</td>
                        <td className="py-3 px-4 text-white">
                          <div className="flex items-center gap-1">
                            <DollarSign size={14} />
                            {bet.amount.toFixed(2)}
                          </div>
                        </td>
                        <td className="py-3 px-4 text-white">
                          {bet.status === "won" ? (
                            <span className="text-[#10b981]">
                              +R$ {(bet.amount * bet.odds).toFixed(2)}
                            </span>
                          ) : bet.status === "lost" ? (
                            <span className="text-red-500">-R$ {bet.amount.toFixed(2)}</span>
                          ) : (
                            <span className="text-[#94a3b8]">Pendente</span>
                          )}
                        </td>
                        <td className="py-3 px-4">
                          {bet.status === "won" && (
                            <Badge className="bg-[#10b981]/20 text-[#10b981]">✓ Ganhou</Badge>
                          )}
                          {bet.status === "lost" && (
                            <Badge className="bg-red-500/20 text-red-500">✗ Perdeu</Badge>
                          )}
                          {bet.status === "pending" && (
                            <Badge className="bg-[#94a3b8]/20 text-[#94a3b8]">⏳ Pendente</Badge>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Filters & Export */}
        <div className="flex gap-4">
          <Button
            variant="outline"
            className="border-[#1e293b] text-white hover:bg-[#1e293b]"
          >
            📊 Exportar como CSV
          </Button>
          <Button
            variant="outline"
            className="border-[#1e293b] text-white hover:bg-[#1e293b]"
          >
            📈 Gerar Relatório
          </Button>
        </div>
      </div>
    </div>
  );
}
