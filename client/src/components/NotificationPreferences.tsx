import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Bell, Mail, Smartphone } from "lucide-react";
import { toast } from "sonner";

interface NotificationPreferences {
  emailNotifications: boolean;
  pushNotifications: boolean;
  smsNotifications: boolean;
  trialExpiringAlert: boolean;
  paymentConfirmation: boolean;
  betResultsAlert: boolean;
  arbitrageOpportunities: boolean;
  aiRecommendations: boolean;
  marketingEmails: boolean;
}

interface NotificationPreferencesProps {
  preferences?: NotificationPreferences;
  onSave?: (preferences: NotificationPreferences) => Promise<void>;
}

export default function NotificationPreferences({
  preferences: initialPreferences,
  onSave,
}: NotificationPreferencesProps) {
  const [preferences, setPreferences] = useState<NotificationPreferences>(
    initialPreferences || {
      emailNotifications: true,
      pushNotifications: true,
      smsNotifications: false,
      trialExpiringAlert: true,
      paymentConfirmation: true,
      betResultsAlert: true,
      arbitrageOpportunities: true,
      aiRecommendations: true,
      marketingEmails: false,
    }
  );

  const [isSaving, setIsSaving] = useState(false);

  const handleToggle = (key: keyof NotificationPreferences) => {
    setPreferences((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await onSave?.(preferences);
      toast.success("Preferências de notificação salvas com sucesso!");
    } catch (error) {
      toast.error("Erro ao salvar preferências");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Canais de Notificação */}
      <Card className="bg-[#111827] border-[#1e293b]">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Bell size={20} className="text-[#10b981]" />
            Canais de Notificação
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Email */}
          <div className="flex items-center justify-between p-3 bg-[#0c1322] rounded-lg">
            <div className="flex items-center gap-3">
              <Mail size={18} className="text-[#10b981]" />
              <div>
                <Label className="text-white font-semibold">
                  Notificações por Email
                </Label>
                <p className="text-xs text-[#64748b]">
                  Receba atualizações importantes por email
                </p>
              </div>
            </div>
            <Switch
              checked={preferences.emailNotifications}
              onCheckedChange={() => handleToggle("emailNotifications")}
              className="data-[state=checked]:bg-[#10b981]"
            />
          </div>

          {/* Push Notifications */}
          <div className="flex items-center justify-between p-3 bg-[#0c1322] rounded-lg">
            <div className="flex items-center gap-3">
              <Smartphone size={18} className="text-[#10b981]" />
              <div>
                <Label className="text-white font-semibold">
                  Notificações Push
                </Label>
                <p className="text-xs text-[#64748b]">
                  Alertas em tempo real no seu navegador
                </p>
              </div>
            </div>
            <Switch
              checked={preferences.pushNotifications}
              onCheckedChange={() => handleToggle("pushNotifications")}
              className="data-[state=checked]:bg-[#10b981]"
            />
          </div>

          {/* SMS */}
          <div className="flex items-center justify-between p-3 bg-[#0c1322] rounded-lg opacity-50">
            <div className="flex items-center gap-3">
              <Smartphone size={18} className="text-[#64748b]" />
              <div>
                <Label className="text-white font-semibold">
                  Notificações por SMS
                </Label>
                <p className="text-xs text-[#64748b]">
                  Disponível apenas para planos Premium
                </p>
              </div>
            </div>
            <Switch
              checked={preferences.smsNotifications}
              disabled
              className="data-[state=checked]:bg-[#10b981]"
            />
          </div>
        </CardContent>
      </Card>

      {/* Tipos de Notificação */}
      <Card className="bg-[#111827] border-[#1e293b]">
        <CardHeader>
          <CardTitle className="text-white">Tipos de Notificação</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Trial Expiring */}
          <div className="flex items-center justify-between p-3 bg-[#0c1322] rounded-lg">
            <div>
              <Label className="text-white font-semibold">
                Alerta de Trial Expirando
              </Label>
              <p className="text-xs text-[#64748b]">
                Notificação quando seu período de teste está acabando
              </p>
            </div>
            <Switch
              checked={preferences.trialExpiringAlert}
              onCheckedChange={() => handleToggle("trialExpiringAlert")}
              className="data-[state=checked]:bg-[#10b981]"
            />
          </div>

          {/* Payment Confirmation */}
          <div className="flex items-center justify-between p-3 bg-[#0c1322] rounded-lg">
            <div>
              <Label className="text-white font-semibold">
                Confirmação de Pagamento
              </Label>
              <p className="text-xs text-[#64748b]">
                Receba confirmação quando seu pagamento for processado
              </p>
            </div>
            <Switch
              checked={preferences.paymentConfirmation}
              onCheckedChange={() => handleToggle("paymentConfirmation")}
              className="data-[state=checked]:bg-[#10b981]"
            />
          </div>

          {/* Bet Results */}
          <div className="flex items-center justify-between p-3 bg-[#0c1322] rounded-lg">
            <div>
              <Label className="text-white font-semibold">
                Resultados de Apostas
              </Label>
              <p className="text-xs text-[#64748b]">
                Notificação quando suas apostas são finalizadas
              </p>
            </div>
            <Switch
              checked={preferences.betResultsAlert}
              onCheckedChange={() => handleToggle("betResultsAlert")}
              className="data-[state=checked]:bg-[#10b981]"
            />
          </div>

          {/* Arbitrage Opportunities */}
          <div className="flex items-center justify-between p-3 bg-[#0c1322] rounded-lg">
            <div>
              <Label className="text-white font-semibold">
                Oportunidades de Arbitragem
              </Label>
              <p className="text-xs text-[#64748b]">
                Alertas quando surebets são detectadas
              </p>
            </div>
            <Switch
              checked={preferences.arbitrageOpportunities}
              onCheckedChange={() => handleToggle("arbitrageOpportunities")}
              className="data-[state=checked]:bg-[#10b981]"
            />
          </div>

          {/* AI Recommendations */}
          <div className="flex items-center justify-between p-3 bg-[#0c1322] rounded-lg">
            <div>
              <Label className="text-white font-semibold">
                Recomendações de IA
              </Label>
              <p className="text-xs text-[#64748b]">
                Receba sugestões de apostas baseadas em IA
              </p>
            </div>
            <Switch
              checked={preferences.aiRecommendations}
              onCheckedChange={() => handleToggle("aiRecommendations")}
              className="data-[state=checked]:bg-[#10b981]"
            />
          </div>

          {/* Marketing Emails */}
          <div className="flex items-center justify-between p-3 bg-[#0c1322] rounded-lg">
            <div>
              <Label className="text-white font-semibold">
                Emails de Marketing
              </Label>
              <p className="text-xs text-[#64748b]">
                Receba promoções e novidades sobre a plataforma
              </p>
            </div>
            <Switch
              checked={preferences.marketingEmails}
              onCheckedChange={() => handleToggle("marketingEmails")}
              className="data-[state=checked]:bg-[#10b981]"
            />
          </div>
        </CardContent>
      </Card>

      {/* Save Button */}
      <Button
        onClick={handleSave}
        disabled={isSaving}
        className="w-full bg-[#10b981] hover:bg-[#059669] text-white"
      >
        {isSaving ? "Salvando..." : "Salvar Preferências"}
      </Button>
    </div>
  );
}
