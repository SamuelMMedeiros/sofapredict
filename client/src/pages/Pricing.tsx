import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/_core/hooks/useAuth";
import { toast } from "sonner";
import { Check, CreditCard, Smartphone, Zap } from "lucide-react";

interface Plan {
  id: number;
  name: string;
  description: string;
  priceMonthly: number;
  priceYearly?: number;
  features: string[];
  highlighted: boolean;
  paymentMethods: string[];
}

const PLANS: Plan[] = [
  {
    id: 1,
    name: "Free",
    description: "Para experimentar",
    priceMonthly: 0,
    features: [
      "1 time favorito",
      "5 apostas por mês",
      "Filtros básicos",
      "Histórico de apostas",
    ],
    highlighted: false,
    paymentMethods: [],
  },
  {
    id: 2,
    name: "Pro",
    description: "Mais análises",
    priceMonthly: 29.9,
    priceYearly: 299,
    features: [
      "5 times favoritos",
      "50 apostas por mês",
      "Análise com IA",
      "Calculadora de arbitragem",
      "Radar tático",
      "Métricas detalhadas",
    ],
    highlighted: true,
    paymentMethods: ["pix", "credit_card", "telegram_stars"],
  },
  {
    id: 3,
    name: "Premium",
    description: "Acesso completo",
    priceMonthly: 79.9,
    priceYearly: 799,
    features: [
      "10 times favoritos",
      "200 apostas por mês",
      "Análise com IA avançada",
      "Calculadora de arbitragem",
      "Radar tático completo",
      "Métricas em tempo real",
      "Exportar dados",
      "Suporte prioritário",
    ],
    highlighted: false,
    paymentMethods: ["pix", "credit_card", "paypal", "telegram_stars"],
  },
];

export default function Pricing() {
  const { user } = useAuth();
  const [billingCycle, setBillingCycle] = useState<"monthly" | "yearly">("monthly");
  const [selectedPayment, setSelectedPayment] = useState<string | null>(null);

  const handleSelectPlan = (planId: number, paymentMethod: string) => {
    if (planId === 1) {
      toast.info("Você já tem acesso ao plano Free");
      return;
    }

    setSelectedPayment(`${planId}-${paymentMethod}`);
    toast.success(`Redirecionando para ${paymentMethod}...`);
    // Aqui você redirecionaria para o gateway de pagamento
  };

  const getPaymentMethodIcon = (method: string) => {
    switch (method) {
      case "pix":
        return "🔐";
      case "credit_card":
        return <CreditCard size={16} />;
      case "telegram_stars":
        return "⭐";
      case "paypal":
        return "🅿️";
      default:
        return "💳";
    }
  };

  const getPaymentMethodLabel = (method: string) => {
    switch (method) {
      case "pix":
        return "Pix";
      case "credit_card":
        return "Cartão";
      case "telegram_stars":
        return "Telegram Stars";
      case "paypal":
        return "PayPal";
      default:
        return method;
    }
  };

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      {/* Header */}
      <div className="text-center space-y-2">
        <h1 className="text-4xl font-bold text-white">Planos de Cobrança</h1>
        <p className="text-[#94a3b8]">Escolha o plano perfeito para suas necessidades</p>
      </div>

      {/* Billing Cycle Toggle */}
      <div className="flex justify-center items-center gap-4">
        <button
          onClick={() => setBillingCycle("monthly")}
          className={`px-6 py-2 rounded-lg font-semibold transition-all ${
            billingCycle === "monthly"
              ? "bg-[#10b981] text-white"
              : "bg-[#0c1322] text-[#94a3b8] hover:text-white"
          }`}
        >
          Mensal
        </button>
        <button
          onClick={() => setBillingCycle("yearly")}
          className={`px-6 py-2 rounded-lg font-semibold transition-all ${
            billingCycle === "yearly"
              ? "bg-[#10b981] text-white"
              : "bg-[#0c1322] text-[#94a3b8] hover:text-white"
          }`}
        >
          Anual (Economize 17%)
        </button>
      </div>

      {/* Plans Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {PLANS.map(plan => {
          const price =
            billingCycle === "yearly" && plan.priceYearly
              ? plan.priceYearly
              : plan.priceMonthly;
          const pricePerMonth =
            billingCycle === "yearly" && plan.priceYearly
              ? (plan.priceYearly / 12).toFixed(2)
              : plan.priceMonthly.toFixed(2);

          return (
            <Card
              key={plan.id}
              className={`bg-[#111827] border-[#1e293b] transition-all ${
                plan.highlighted
                  ? "border-[#10b981] ring-2 ring-[#10b981]/50 transform scale-105"
                  : ""
              }`}
            >
              <CardHeader>
                <CardTitle className="text-white">{plan.name}</CardTitle>
                <p className="text-[#94a3b8] text-sm mt-1">{plan.description}</p>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Price */}
                <div>
                  {plan.priceMonthly === 0 ? (
                    <p className="text-3xl font-bold text-white">Grátis</p>
                  ) : (
                    <>
                      <p className="text-3xl font-bold text-white">
                        R$ {pricePerMonth}
                      </p>
                      <p className="text-[#94a3b8] text-sm">
                        {billingCycle === "yearly"
                          ? `R$ ${price.toFixed(2)}/ano`
                          : "/mês"}
                      </p>
                    </>
                  )}
                </div>

                {/* Features */}
                <div className="space-y-2">
                  {plan.features.map((feature, i) => (
                    <div key={i} className="flex items-start gap-2">
                      <Check size={16} className="text-[#10b981] mt-1 flex-shrink-0" />
                      <span className="text-[#94a3b8] text-sm">{feature}</span>
                    </div>
                  ))}
                </div>

                {/* CTA Button */}
                {plan.priceMonthly === 0 ? (
                  <Button className="w-full bg-[#0c1322] hover:bg-[#1e293b] text-white border border-[#1e293b]">
                    Seu Plano Atual
                  </Button>
                ) : (
                  <div className="space-y-2">
                    <p className="text-[#94a3b8] text-xs text-center">
                      Formas de pagamento disponíveis:
                    </p>
                    <div className="grid grid-cols-2 gap-2">
                      {plan.paymentMethods.map(method => (
                        <Button
                          key={method}
                          onClick={() => handleSelectPlan(plan.id, method)}
                          variant="outline"
                          className="text-xs h-8"
                          disabled={selectedPayment === `${plan.id}-${method}`}
                        >
                          <span className="mr-1">{getPaymentMethodIcon(method)}</span>
                          {getPaymentMethodLabel(method)}
                        </Button>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* FAQ */}
      <div className="bg-[#111827] border border-[#1e293b] rounded-lg p-6 space-y-4">
        <h2 className="text-xl font-bold text-white">Perguntas Frequentes</h2>

        <div className="space-y-3">
          <details className="group">
            <summary className="cursor-pointer text-white font-semibold flex items-center gap-2">
              <span className="group-open:rotate-90 transition-transform">▶</span>
              Posso mudar de plano a qualquer momento?
            </summary>
            <p className="text-[#94a3b8] text-sm mt-2 ml-6">
              Sim! Você pode fazer upgrade ou downgrade do seu plano a qualquer momento. As mudanças
              entram em vigor no próximo ciclo de cobrança.
            </p>
          </details>

          <details className="group">
            <summary className="cursor-pointer text-white font-semibold flex items-center gap-2">
              <span className="group-open:rotate-90 transition-transform">▶</span>
              Há reembolso se eu cancelar?
            </summary>
            <p className="text-[#94a3b8] text-sm mt-2 ml-6">
              Não oferecemos reembolsos, mas você pode cancelar sua assinatura a qualquer momento.
              Você terá acesso até o final do seu período de cobrança.
            </p>
          </details>

          <details className="group">
            <summary className="cursor-pointer text-white font-semibold flex items-center gap-2">
              <span className="group-open:rotate-90 transition-transform">▶</span>
              Quais são os métodos de pagamento aceitos?
            </summary>
            <p className="text-[#94a3b8] text-sm mt-2 ml-6">
              Aceitamos Pix, Cartão de Crédito, PayPal e Telegram Stars. Escolha a opção mais
              conveniente para você no checkout.
            </p>
          </details>

          <details className="group">
            <summary className="cursor-pointer text-white font-semibold flex items-center gap-2">
              <span className="group-open:rotate-90 transition-transform">▶</span>
              Preciso de uma nota fiscal?
            </summary>
            <p className="text-[#94a3b8] text-sm mt-2 ml-6">
              Sim! Você receberá uma nota fiscal automaticamente por email após cada pagamento.
              Também pode acessá-la no seu painel de controle.
            </p>
          </details>
        </div>
      </div>

      {/* CTA */}
      <div className="bg-gradient-to-r from-[#10b981]/20 to-[#059669]/20 border border-[#10b981]/50 rounded-lg p-8 text-center space-y-4">
        <h2 className="text-2xl font-bold text-white">Comece Agora</h2>
        <p className="text-[#94a3b8]">
          Acesse análises inteligentes de apostas esportivas com IA
        </p>
        <Button className="bg-[#10b981] hover:bg-[#059669] text-white">
          Escolher Plano
        </Button>
      </div>
    </div>
  );
}
