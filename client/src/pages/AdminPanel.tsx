import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { useAuth } from "@/_core/hooks/useAuth";
import { toast } from "sonner";
import { BarChart3, Settings, Zap, DollarSign, Users } from "lucide-react";

interface Plan {
  id: number;
  name: string;
  priceMonthly: string;
  priceYearly?: string;
  maxFavoriteTeams: number;
  maxBetsPerMonth: number;
  accessToAiAnalysis: boolean;
  accessToSurebet: boolean;
  accessToRadar: boolean;
  accessToMetrics: boolean;
  accessToExport: boolean;
  isActive: boolean;
}

const DEFAULT_PLANS: Plan[] = [
  {
    id: 1,
    name: "Free",
    priceMonthly: "0.00",
    maxFavoriteTeams: 1,
    maxBetsPerMonth: 5,
    accessToAiAnalysis: false,
    accessToSurebet: false,
    accessToRadar: false,
    accessToMetrics: false,
    accessToExport: false,
    isActive: true,
  },
  {
    id: 2,
    name: "Pro",
    priceMonthly: "29.90",
    priceYearly: "299.00",
    maxFavoriteTeams: 5,
    maxBetsPerMonth: 50,
    accessToAiAnalysis: true,
    accessToSurebet: true,
    accessToRadar: true,
    accessToMetrics: true,
    accessToExport: false,
    isActive: true,
  },
  {
    id: 3,
    name: "Premium",
    priceMonthly: "79.90",
    priceYearly: "799.00",
    maxFavoriteTeams: 10,
    maxBetsPerMonth: 200,
    accessToAiAnalysis: true,
    accessToSurebet: true,
    accessToRadar: true,
    accessToMetrics: true,
    accessToExport: true,
    isActive: true,
  },
];

export default function AdminPanel() {
  const { user } = useAuth();
  const [plans, setPlans] = useState<Plan[]>(DEFAULT_PLANS);
  const [editingPlan, setEditingPlan] = useState<Plan | null>(null);
  const [showNewPlanForm, setShowNewPlanForm] = useState(false);
  const [activeTab, setActiveTab] = useState<"plans" | "payments" | "analytics">("plans");

  // Check if user is admin
  if (user?.role !== "admin") {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card className="bg-[#111827] border-[#1e293b] max-w-md">
          <CardContent className="pt-6">
            <p className="text-white text-center">Acesso negado. Apenas administradores podem acessar este painel.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const handleSavePlan = (plan: Plan) => {
    if (editingPlan) {
      setPlans(plans.map(p => (p.id === plan.id ? plan : p)));
      toast.success("Plano atualizado com sucesso");
    } else {
      setPlans([...plans, { ...plan, id: Math.max(...plans.map(p => p.id)) + 1 }]);
      toast.success("Plano criado com sucesso");
    }
    setEditingPlan(null);
    setShowNewPlanForm(false);
  };

  const handleDeletePlan = (planId: number) => {
    if (planId === 1) {
      toast.error("Não é possível deletar o plano Free");
      return;
    }
    setPlans(plans.filter(p => p.id !== planId));
    toast.success("Plano deletado com sucesso");
  };

  return (
    <div className="space-y-6 max-w-6xl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white flex items-center gap-2">
            <Settings size={32} className="text-[#10b981]" />
            Painel de Administração
          </h1>
          <p className="text-[#94a3b8] mt-1">Gerencie planos, pagamentos e métricas</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-[#1e293b]">
        <button
          onClick={() => setActiveTab("plans")}
          className={`px-4 py-2 font-semibold transition-colors ${
            activeTab === "plans"
              ? "text-[#10b981] border-b-2 border-[#10b981]"
              : "text-[#94a3b8] hover:text-white"
          }`}
        >
          <Zap size={16} className="inline mr-2" />
          Planos
        </button>
        <button
          onClick={() => setActiveTab("payments")}
          className={`px-4 py-2 font-semibold transition-colors ${
            activeTab === "payments"
              ? "text-[#10b981] border-b-2 border-[#10b981]"
              : "text-[#94a3b8] hover:text-white"
          }`}
        >
          <DollarSign size={16} className="inline mr-2" />
          Pagamentos
        </button>
        <button
          onClick={() => setActiveTab("analytics")}
          className={`px-4 py-2 font-semibold transition-colors ${
            activeTab === "analytics"
              ? "text-[#10b981] border-b-2 border-[#10b981]"
              : "text-[#94a3b8] hover:text-white"
          }`}
        >
          <BarChart3 size={16} className="inline mr-2" />
          Análise
        </button>
      </div>

      {/* Plans Tab */}
      {activeTab === "plans" && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-bold text-white">Planos de Cobrança</h2>
            <Button
              onClick={() => setShowNewPlanForm(true)}
              className="bg-[#10b981] hover:bg-[#059669] text-white"
            >
              + Novo Plano
            </Button>
          </div>

          {/* Plans Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {plans.map(plan => (
              <Card key={plan.id} className="bg-[#111827] border-[#1e293b]">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <CardTitle className="text-white">{plan.name}</CardTitle>
                    <Switch
                      checked={plan.isActive}
                      onCheckedChange={checked => {
                        setPlans(
                          plans.map(p =>
                            p.id === plan.id ? { ...p, isActive: checked } : p
                          )
                        );
                      }}
                    />
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Price */}
                  <div>
                    <p className="text-[#94a3b8] text-sm">Preço Mensal</p>
                    <p className="text-white font-bold text-2xl">
                      R$ {parseFloat(plan.priceMonthly).toFixed(2)}
                    </p>
                  </div>

                  {/* Features */}
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between text-[#94a3b8]">
                      <span>Times Favoritos:</span>
                      <span className="text-white font-semibold">{plan.maxFavoriteTeams}</span>
                    </div>
                    <div className="flex justify-between text-[#94a3b8]">
                      <span>Apostas/Mês:</span>
                      <span className="text-white font-semibold">{plan.maxBetsPerMonth}</span>
                    </div>
                    <div className="flex justify-between text-[#94a3b8]">
                      <span>Análise IA:</span>
                      <span className={plan.accessToAiAnalysis ? "text-[#10b981]" : "text-red-500"}>
                        {plan.accessToAiAnalysis ? "✓" : "✗"}
                      </span>
                    </div>
                    <div className="flex justify-between text-[#94a3b8]">
                      <span>Arbitragem:</span>
                      <span className={plan.accessToSurebet ? "text-[#10b981]" : "text-red-500"}>
                        {plan.accessToSurebet ? "✓" : "✗"}
                      </span>
                    </div>
                    <div className="flex justify-between text-[#94a3b8]">
                      <span>Radar Tático:</span>
                      <span className={plan.accessToRadar ? "text-[#10b981]" : "text-red-500"}>
                        {plan.accessToRadar ? "✓" : "✗"}
                      </span>
                    </div>
                    <div className="flex justify-between text-[#94a3b8]">
                      <span>Métricas:</span>
                      <span className={plan.accessToMetrics ? "text-[#10b981]" : "text-red-500"}>
                        {plan.accessToMetrics ? "✓" : "✗"}
                      </span>
                    </div>
                    <div className="flex justify-between text-[#94a3b8]">
                      <span>Exportar:</span>
                      <span className={plan.accessToExport ? "text-[#10b981]" : "text-red-500"}>
                        {plan.accessToExport ? "✓" : "✗"}
                      </span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2 pt-2">
                    <Button
                      onClick={() => setEditingPlan(plan)}
                      variant="outline"
                      className="flex-1 text-xs"
                    >
                      Editar
                    </Button>
                    {plan.id !== 1 && (
                      <Button
                        onClick={() => handleDeletePlan(plan.id)}
                        variant="destructive"
                        className="flex-1 text-xs"
                      >
                        Deletar
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Payments Tab */}
      {activeTab === "payments" && (
        <Card className="bg-[#111827] border-[#1e293b]">
          <CardHeader>
            <CardTitle className="text-white">Configuração de Pagamentos</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Pix Configuration */}
            <div className="border-b border-[#1e293b] pb-6">
              <h3 className="text-white font-semibold mb-4">Pix (Asaas)</h3>
              <div className="space-y-3">
                <div>
                  <label className="text-[#94a3b8] text-sm">Chave API Asaas</label>
                  <Input
                    type="password"
                    placeholder="Insira sua chave API do Asaas"
                    className="bg-[#0c1322] border-[#1e293b] text-white mt-1"
                  />
                  <p className="text-[#94a3b8] text-xs mt-1">
                    Obtenha em: https://asaas.com/api
                  </p>
                </div>
              </div>
            </div>

            {/* Credit Card Configuration */}
            <div className="border-b border-[#1e293b] pb-6">
              <h3 className="text-white font-semibold mb-4">Cartão de Crédito (Stripe)</h3>
              <div className="space-y-3">
                <div>
                  <label className="text-[#94a3b8] text-sm">Chave Secreta Stripe</label>
                  <Input
                    type="password"
                    placeholder="sk_live_..."
                    className="bg-[#0c1322] border-[#1e293b] text-white mt-1"
                  />
                </div>
                <div>
                  <label className="text-[#94a3b8] text-sm">Chave Pública Stripe</label>
                  <Input
                    type="text"
                    placeholder="pk_live_..."
                    className="bg-[#0c1322] border-[#1e293b] text-white mt-1"
                  />
                </div>
                <p className="text-[#94a3b8] text-xs">
                  Obtenha em: https://dashboard.stripe.com/apikeys
                </p>
              </div>
            </div>

            {/* PayPal Configuration */}
            <div className="border-b border-[#1e293b] pb-6">
              <h3 className="text-white font-semibold mb-4">PayPal</h3>
              <div className="space-y-3">
                <div>
                  <label className="text-[#94a3b8] text-sm">Client ID</label>
                  <Input
                    type="password"
                    placeholder="Insira seu Client ID"
                    className="bg-[#0c1322] border-[#1e293b] text-white mt-1"
                  />
                </div>
                <div>
                  <label className="text-[#94a3b8] text-sm">Client Secret</label>
                  <Input
                    type="password"
                    placeholder="Insira seu Client Secret"
                    className="bg-[#0c1322] border-[#1e293b] text-white mt-1"
                  />
                </div>
                <p className="text-[#94a3b8] text-xs">
                  Obtenha em: https://developer.paypal.com/dashboard
                </p>
              </div>
            </div>

            {/* Telegram Stars Configuration */}
            <div>
              <h3 className="text-white font-semibold mb-4">Telegram Stars</h3>
              <div className="space-y-3">
                <div>
                  <label className="text-[#94a3b8] text-sm">Token do Bot Telegram</label>
                  <Input
                    type="password"
                    placeholder="Insira seu token do bot"
                    className="bg-[#0c1322] border-[#1e293b] text-white mt-1"
                  />
                </div>
                <p className="text-[#94a3b8] text-xs">
                  Obtenha em: https://t.me/BotFather
                </p>
              </div>
            </div>

            <Button className="w-full bg-[#10b981] hover:bg-[#059669] text-white">
              Salvar Configurações de Pagamento
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Analytics Tab */}
      {activeTab === "analytics" && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="bg-[#111827] border-[#1e293b]">
            <CardHeader>
              <CardTitle className="text-[#94a3b8] text-sm">Usuários Totais</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-white">1,234</p>
              <p className="text-[#10b981] text-xs mt-1">+12% vs mês anterior</p>
            </CardContent>
          </Card>

          <Card className="bg-[#111827] border-[#1e293b]">
            <CardHeader>
              <CardTitle className="text-[#94a3b8] text-sm">Assinantes Ativos</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-white">456</p>
              <p className="text-[#10b981] text-xs mt-1">+8% vs mês anterior</p>
            </CardContent>
          </Card>

          <Card className="bg-[#111827] border-[#1e293b]">
            <CardHeader>
              <CardTitle className="text-[#94a3b8] text-sm">Receita Mensal</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-white">R$ 15.234</p>
              <p className="text-[#10b981] text-xs mt-1">+23% vs mês anterior</p>
            </CardContent>
          </Card>

          <Card className="bg-[#111827] border-[#1e293b]">
            <CardHeader>
              <CardTitle className="text-[#94a3b8] text-sm">Taxa de Retenção</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-white">87%</p>
              <p className="text-[#10b981] text-xs mt-1">+2% vs mês anterior</p>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
