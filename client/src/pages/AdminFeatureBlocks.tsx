import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import {
  Zap,
  BarChart3,
  TrendingUp,
  Shield,
  Users,
  Smartphone,
  Clock,
  DollarSign,
  AlertCircle,
} from "lucide-react";

interface FeatureBlock {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  freeTrialEnabled: boolean;
  proEnabled: boolean;
  premiumEnabled: boolean;
  trialDays: number;
}

export default function AdminFeatureBlocks() {
  const { user, isAuthenticated } = useAuth();
  const [featureBlocks, setFeatureBlocks] = useState<FeatureBlock[]>([
    {
      id: "ai-analysis",
      name: "Análise com IA",
      description: "Inteligência artificial para predições de partidas",
      icon: <Zap size={20} />,
      freeTrialEnabled: true,
      proEnabled: true,
      premiumEnabled: true,
      trialDays: 14,
    },
    {
      id: "surebet-calculator",
      name: "Calculadora de Arbitragem",
      description: "Detectar surebets cruzando odds de múltiplas casas",
      icon: <BarChart3 size={20} />,
      freeTrialEnabled: false,
      proEnabled: true,
      premiumEnabled: true,
      trialDays: 0,
    },
    {
      id: "tactical-radar",
      name: "Radar Tático",
      description: "Visualizar estatísticas detalhadas de times",
      icon: <TrendingUp size={20} />,
      freeTrialEnabled: true,
      proEnabled: true,
      premiumEnabled: true,
      trialDays: 14,
    },
    {
      id: "triple-generator",
      name: "Gerador de Tripla",
      description: "IA recomenda combinações de apostas",
      icon: <Shield size={20} />,
      freeTrialEnabled: false,
      proEnabled: true,
      premiumEnabled: true,
      trialDays: 0,
    },
    {
      id: "advanced-filters",
      name: "Filtros Avançados",
      description: "Filtrar partidas por múltiplos critérios",
      icon: <Users size={20} />,
      freeTrialEnabled: true,
      proEnabled: true,
      premiumEnabled: true,
      trialDays: 14,
    },
    {
      id: "betting-history",
      name: "Histórico de Apostas",
      description: "Salvar e rastrear histórico de apostas",
      icon: <Smartphone size={20} />,
      freeTrialEnabled: false,
      proEnabled: true,
      premiumEnabled: true,
      trialDays: 0,
    },
  ]);

  const [globalTrialDays, setGlobalTrialDays] = useState(14);
  const [isSaving, setIsSaving] = useState(false);

  // Check if user is admin
  if (!isAuthenticated || user?.role !== "admin") {
    return (
      <div className="min-h-screen bg-[#090d16] flex items-center justify-center">
        <Card className="bg-[#111827] border-[#1e293b] max-w-md">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <AlertCircle className="text-red-500" />
              Acesso Negado
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-[#94a3b8]">
              Você não tem permissão para acessar o painel admin. Entre em contato com o administrador.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const handleToggleFeature = (blockId: string, tier: "freeTrialEnabled" | "proEnabled" | "premiumEnabled") => {
    setFeatureBlocks((prev) =>
      prev.map((block) =>
        block.id === blockId
          ? { ...block, [tier]: !block[tier] }
          : block
      )
    );
  };

  const handleSaveChanges = async () => {
    setIsSaving(true);
    try {
      // TODO: Implement API call to save feature blocks
      // await trpc.admin.updateFeatureBlocks.mutate({ blocks: featureBlocks, trialDays: globalTrialDays });
      
      toast.success("Configurações salvas com sucesso!");
    } catch (error) {
      toast.error("Erro ao salvar configurações");
    } finally {
      setIsSaving(false);
    }
  };

  const handleResetToDefaults = () => {
    if (confirm("Tem certeza que deseja restaurar as configurações padrão?")) {
      setFeatureBlocks([
        {
          id: "ai-analysis",
          name: "Análise com IA",
          description: "Inteligência artificial para predições de partidas",
          icon: <Zap size={20} />,
          freeTrialEnabled: true,
          proEnabled: true,
          premiumEnabled: true,
          trialDays: 14,
        },
        {
          id: "surebet-calculator",
          name: "Calculadora de Arbitragem",
          description: "Detectar surebets cruzando odds de múltiplas casas",
          icon: <BarChart3 size={20} />,
          freeTrialEnabled: false,
          proEnabled: true,
          premiumEnabled: true,
          trialDays: 0,
        },
        {
          id: "tactical-radar",
          name: "Radar Tático",
          description: "Visualizar estatísticas detalhadas de times",
          icon: <TrendingUp size={20} />,
          freeTrialEnabled: true,
          proEnabled: true,
          premiumEnabled: true,
          trialDays: 14,
        },
        {
          id: "triple-generator",
          name: "Gerador de Tripla",
          description: "IA recomenda combinações de apostas",
          icon: <Shield size={20} />,
          freeTrialEnabled: false,
          proEnabled: true,
          premiumEnabled: true,
          trialDays: 0,
        },
        {
          id: "advanced-filters",
          name: "Filtros Avançados",
          description: "Filtrar partidas por múltiplos critérios",
          icon: <Users size={20} />,
          freeTrialEnabled: true,
          proEnabled: true,
          premiumEnabled: true,
          trialDays: 14,
        },
        {
          id: "betting-history",
          name: "Histórico de Apostas",
          description: "Salvar e rastrear histórico de apostas",
          icon: <Smartphone size={20} />,
          freeTrialEnabled: false,
          proEnabled: true,
          premiumEnabled: true,
          trialDays: 0,
        },
      ]);
      setGlobalTrialDays(14);
      toast.success("Configurações restauradas aos padrões");
    }
  };

  return (
    <div className="min-h-screen bg-[#090d16] p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="space-y-2">
          <h1 className="text-4xl font-bold text-white">Painel Admin - Blocos de Recursos</h1>
          <p className="text-[#94a3b8]">
            Configure quais recursos estão disponíveis em cada plano e período de teste
          </p>
        </div>

        {/* Global Settings */}
        <Card className="bg-[#111827] border-[#1e293b]">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Clock size={20} className="text-[#10b981]" />
              Configurações Globais
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label className="text-[#94a3b8]">Dias de Teste Gratuito</Label>
              <div className="flex items-center gap-4">
                <Input
                  type="number"
                  min="1"
                  max="90"
                  value={globalTrialDays}
                  onChange={(e) => setGlobalTrialDays(parseInt(e.target.value))}
                  className="bg-[#0c1322] border-[#1e293b] text-white max-w-xs"
                />
                <span className="text-[#94a3b8]">dias</span>
              </div>
              <p className="text-sm text-[#64748b]">
                Período padrão oferecido para novos usuários antes de cobrar
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Feature Blocks Grid */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-white">Blocos de Recursos</h2>
            <div className="flex gap-2">
              <Button
                variant="outline"
                className="border-[#1e293b] text-[#94a3b8] hover:text-white"
                onClick={handleResetToDefaults}
              >
                Restaurar Padrão
              </Button>
              <Button
                className="bg-[#10b981] hover:bg-[#059669] text-white"
                onClick={handleSaveChanges}
                disabled={isSaving}
              >
                {isSaving ? "Salvando..." : "Salvar Alterações"}
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {featureBlocks.map((block) => (
              <Card key={block.id} className="bg-[#111827] border-[#1e293b]">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 bg-[#10b981]/20 rounded-lg flex items-center justify-center flex-shrink-0 mt-1">
                        <span className="text-[#10b981]">{block.icon}</span>
                      </div>
                      <div>
                        <CardTitle className="text-white">{block.name}</CardTitle>
                        <p className="text-sm text-[#64748b] mt-1">{block.description}</p>
                      </div>
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="space-y-4">
                  {/* Free Trial */}
                  <div className="space-y-3 pb-4 border-b border-[#1e293b]">
                    <div className="flex items-center justify-between">
                      <div>
                        <Label className="text-[#94a3b8] font-semibold">Período de Teste Gratuito</Label>
                        <p className="text-xs text-[#64748b] mt-1">
                          Disponível para todos os novos usuários
                        </p>
                      </div>
                      <Switch
                        checked={block.freeTrialEnabled}
                        onCheckedChange={() =>
                          handleToggleFeature(block.id, "freeTrialEnabled")
                        }
                        className="data-[state=checked]:bg-[#10b981]"
                      />
                    </div>
                    {block.freeTrialEnabled && (
                      <div className="bg-[#0c1322] rounded p-2 text-xs text-[#64748b]">
                        ✓ Ativado para {globalTrialDays} dias
                      </div>
                    )}
                  </div>

                  {/* Pro Plan */}
                  <div className="space-y-3 pb-4 border-b border-[#1e293b]">
                    <div className="flex items-center justify-between">
                      <div>
                        <Label className="text-[#94a3b8] font-semibold flex items-center gap-2">
                          <DollarSign size={14} />
                          Plano Pro (R$ 29,90/mês)
                        </Label>
                        <p className="text-xs text-[#64748b] mt-1">
                          Disponível para assinantes Pro
                        </p>
                      </div>
                      <Switch
                        checked={block.proEnabled}
                        onCheckedChange={() =>
                          handleToggleFeature(block.id, "proEnabled")
                        }
                        className="data-[state=checked]:bg-[#10b981]"
                      />
                    </div>
                    {block.proEnabled && (
                      <div className="bg-[#0c1322] rounded p-2 text-xs text-[#64748b]">
                        ✓ Incluído no plano Pro
                      </div>
                    )}
                  </div>

                  {/* Premium Plan */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <Label className="text-[#94a3b8] font-semibold flex items-center gap-2">
                          <DollarSign size={14} />
                          Plano Premium (R$ 79,90/mês)
                        </Label>
                        <p className="text-xs text-[#64748b] mt-1">
                          Disponível para assinantes Premium
                        </p>
                      </div>
                      <Switch
                        checked={block.premiumEnabled}
                        onCheckedChange={() =>
                          handleToggleFeature(block.id, "premiumEnabled")
                        }
                        className="data-[state=checked]:bg-[#10b981]"
                      />
                    </div>
                    {block.premiumEnabled && (
                      <div className="bg-[#0c1322] rounded p-2 text-xs text-[#64748b]">
                        ✓ Incluído no plano Premium
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Summary */}
        <Card className="bg-[#0c1322] border-[#10b981]">
          <CardHeader>
            <CardTitle className="text-white">Resumo de Configuração</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <p className="text-[#94a3b8] text-sm">Recursos no Teste Gratuito</p>
                <p className="text-2xl font-bold text-[#10b981]">
                  {featureBlocks.filter((b) => b.freeTrialEnabled).length}/{featureBlocks.length}
                </p>
              </div>
              <div>
                <p className="text-[#94a3b8] text-sm">Recursos no Plano Pro</p>
                <p className="text-2xl font-bold text-[#10b981]">
                  {featureBlocks.filter((b) => b.proEnabled).length}/{featureBlocks.length}
                </p>
              </div>
              <div>
                <p className="text-[#94a3b8] text-sm">Recursos no Plano Premium</p>
                <p className="text-2xl font-bold text-[#10b981]">
                  {featureBlocks.filter((b) => b.premiumEnabled).length}/{featureBlocks.length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
