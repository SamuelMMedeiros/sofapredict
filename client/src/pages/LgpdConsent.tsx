import { useState } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { useLocation } from "wouter";
import { toast } from "sonner";

export default function LgpdConsent() {
  const { user } = useAuth();
  const [, navigate] = useLocation();
  const [consents, setConsents] = useState({
    dataProcessing: false,
    marketing: false,
    analytics: false,
  });
  const [loading, setLoading] = useState(false);

  const storeLgpdConsent = trpc.user.storeLgpdConsent.useMutation();

  const handleConsent = async (type: "data_processing" | "marketing" | "analytics", value: boolean) => {
    setConsents(prev => ({
      ...prev,
      [type === "data_processing" ? "dataProcessing" : type === "marketing" ? "marketing" : "analytics"]: value,
    }));
  };

  const handleSubmit = async () => {
    if (!consents.dataProcessing) {
      toast.error("Você deve consentir com o processamento de dados para continuar");
      return;
    }

    setLoading(true);
    try {
      // Store all consents
      await Promise.all([
        storeLgpdConsent.mutateAsync({
          consentType: "data_processing",
          consentGiven: consents.dataProcessing,
        }),
        storeLgpdConsent.mutateAsync({
          consentType: "marketing",
          consentGiven: consents.marketing,
        }),
        storeLgpdConsent.mutateAsync({
          consentType: "analytics",
          consentGiven: consents.analytics,
        }),
      ]);

      toast.success("Consentimento registrado com sucesso");
      navigate("/");
    } catch (error) {
      toast.error("Erro ao registrar consentimento");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#090d16] flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        <Card className="bg-[#111827] border-[#1e293b]">
          <CardHeader>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-tr from-[#10b981] to-[#047857] flex items-center justify-center">
                <span className="text-white font-extrabold">SP</span>
              </div>
              <div>
                <CardTitle className="text-white">
                  Sofa<span className="text-[#10b981]">Predict</span>
                </CardTitle>
                <p className="text-[#94a3b8] text-xs">Conformidade LGPD</p>
              </div>
            </div>
          </CardHeader>

          <CardContent className="space-y-6">
            {/* Introduction */}
            <div>
              <h2 className="text-white font-bold text-lg mb-2">Proteção de Dados Pessoais</h2>
              <p className="text-[#94a3b8] text-sm leading-relaxed">
                A SofaPredict está comprometida em proteger seus dados pessoais de acordo com a Lei Geral de Proteção de Dados (LGPD).
                Antes de continuar, precisamos do seu consentimento explícito para processar suas informações.
              </p>
            </div>

            {/* Consent Options */}
            <div className="space-y-3">
              {/* Data Processing - Required */}
              <div className="border border-[#1e293b] rounded-lg p-4 bg-[#0c1322]">
                <div className="flex items-start gap-3">
                  <Checkbox
                    id="data-processing"
                    checked={consents.dataProcessing}
                    onCheckedChange={(checked: boolean) => handleConsent("data_processing", checked)}
                    className="mt-1"
                  />
                  <div className="flex-1">
                    <label htmlFor="data-processing" className="text-white font-semibold text-sm cursor-pointer">
                      Processamento de Dados Pessoais *
                    </label>
                    <p className="text-[#94a3b8] text-xs mt-1">
                      Consentimento obrigatório para usar a plataforma. Seus dados serão usados para autenticação, análise de apostas,
                      cálculo de estatísticas e melhoria do serviço.
                    </p>
                  </div>
                </div>
              </div>

              {/* Marketing */}
              <div className="border border-[#1e293b] rounded-lg p-4 bg-[#0c1322]">
                <div className="flex items-start gap-3">
                  <Checkbox
                    id="marketing"
                    checked={consents.marketing}
                    onCheckedChange={(checked: boolean) => handleConsent("marketing", checked)}
                    className="mt-1"
                  />
                  <div className="flex-1">
                    <label htmlFor="marketing" className="text-white font-semibold text-sm cursor-pointer">
                      Comunicações de Marketing
                    </label>
                    <p className="text-[#94a3b8] text-xs mt-1">
                      Opcional. Receba notificações sobre novas funcionalidades, promoções e atualizações da plataforma.
                    </p>
                  </div>
                </div>
              </div>

              {/* Analytics */}
              <div className="border border-[#1e293b] rounded-lg p-4 bg-[#0c1322]">
                <div className="flex items-start gap-3">
                  <Checkbox
                    id="analytics"
                    checked={consents.analytics}
                    onCheckedChange={(checked: boolean) => handleConsent("analytics", checked)}
                    className="mt-1"
                  />
                  <div className="flex-1">
                    <label htmlFor="analytics" className="text-white font-semibold text-sm cursor-pointer">
                      Análise de Uso
                    </label>
                    <p className="text-[#94a3b8] text-xs mt-1">
                      Opcional. Nos ajude a melhorar a plataforma coletando dados anônimos sobre como você usa o SofaPredict.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Privacy Notice */}
            <div className="bg-[#0c1322] border border-[#1e293b] rounded-lg p-4">
              <h3 className="text-white font-semibold text-sm mb-2">Seus Direitos LGPD</h3>
              <ul className="text-[#94a3b8] text-xs space-y-1">
                <li>• <strong>Direito de Acesso:</strong> Solicitar cópia de seus dados</li>
                <li>• <strong>Direito de Retificação:</strong> Corrigir dados incorretos</li>
                <li>• <strong>Direito de Exclusão:</strong> Solicitar exclusão de seus dados</li>
                <li>• <strong>Direito de Portabilidade:</strong> Exportar seus dados em formato aberto</li>
              </ul>
              <p className="text-[#94a3b8] text-xs mt-3">
                Para exercer seus direitos, entre em contato conosco através do email: privacy@sofapredict.com
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={() => navigate("/")}
                disabled={loading}
                className="flex-1"
              >
                Voltar
              </Button>
              <Button
                onClick={handleSubmit}
                disabled={loading || !consents.dataProcessing}
                className="flex-1 bg-[#10b981] hover:bg-[#059669] text-white"
              >
                {loading ? "Processando..." : "Concordar e Continuar"}
              </Button>
            </div>

            {/* Footer Note */}
            <p className="text-[#94a3b8] text-xs text-center">
              * Consentimento obrigatório para usar a plataforma
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
