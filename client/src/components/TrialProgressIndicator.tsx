import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Clock, AlertCircle, CheckCircle } from "lucide-react";
import { getLoginUrl } from "@/const";

interface TrialProgressIndicatorProps {
  trialEndsAt?: Date | null;
  isAuthenticated?: boolean;
  subscriptionStatus?: "trial" | "active" | "expired" | "none";
}

export default function TrialProgressIndicator({
  trialEndsAt,
  isAuthenticated = false,
  subscriptionStatus = "none",
}: TrialProgressIndicatorProps) {
  const [daysRemaining, setDaysRemaining] = useState(0);
  const [totalTrialDays, setTotalTrialDays] = useState(14);
  const [progressPercentage, setProgressPercentage] = useState(100);
  const [isExpired, setIsExpired] = useState(false);

  useEffect(() => {
    if (!trialEndsAt) {
      // Default trial: 14 days from now
      const defaultEnd = new Date();
      defaultEnd.setDate(defaultEnd.getDate() + 14);
      trialEndsAt = defaultEnd;
    }

    const now = new Date();
    const timeDiff = trialEndsAt.getTime() - now.getTime();
    const daysDiff = Math.ceil(timeDiff / (1000 * 3600 * 24));

    setDaysRemaining(Math.max(0, daysDiff));
    setTotalTrialDays(14); // Default trial period

    const usedDays = totalTrialDays - Math.max(0, daysDiff);
    const percentage = (usedDays / totalTrialDays) * 100;
    setProgressPercentage(Math.min(100, Math.max(0, percentage)));

    if (daysDiff <= 0) {
      setIsExpired(true);
    }
  }, [trialEndsAt, totalTrialDays]);

  // If user has active subscription, don't show trial indicator
  if (subscriptionStatus === "active") {
    return null;
  }

  // If trial is expired
  if (isExpired && !isAuthenticated) {
    return (
      <Card className="bg-gradient-to-r from-[#1e293b] to-[#0c1322] border-[#1e293b] mb-6">
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-orange-500/20 rounded-lg flex items-center justify-center">
                <AlertCircle size={20} className="text-orange-500" />
              </div>
              <div>
                <p className="text-white font-semibold">Período de Teste Expirado</p>
                <p className="text-[#94a3b8] text-sm">
                  Crie uma conta ou escolha um plano para continuar usando
                </p>
              </div>
            </div>
            <Button
              onClick={() => (window.location.href = getLoginUrl())}
              className="bg-[#10b981] hover:bg-[#059669] text-white whitespace-nowrap"
            >
              Escolher Plano
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  // If trial is expiring soon (less than 3 days)
  if (daysRemaining <= 3 && daysRemaining > 0 && !isAuthenticated) {
    return (
      <Card className="bg-gradient-to-r from-[#1e293b] to-[#0c1322] border-orange-500/50 mb-6">
        <CardContent className="pt-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-orange-500/20 rounded-lg flex items-center justify-center">
                  <Clock size={20} className="text-orange-500" />
                </div>
                <div>
                  <p className="text-white font-semibold">Teste Expirando em Breve</p>
                  <p className="text-[#94a3b8] text-sm">
                    {daysRemaining} {daysRemaining === 1 ? "dia" : "dias"} restante{daysRemaining !== 1 ? "s" : ""}
                  </p>
                </div>
              </div>
              <Button
                onClick={() => (window.location.href = getLoginUrl())}
                className="bg-orange-500 hover:bg-orange-600 text-white whitespace-nowrap"
              >
                Escolher Plano
              </Button>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-[#94a3b8]">Progresso do Teste</span>
                <span className="text-orange-500 font-semibold">
                  {Math.round(progressPercentage)}%
                </span>
              </div>
              <Progress value={progressPercentage} className="h-2 bg-[#0c1322]" />
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Normal trial progress indicator
  if (!isAuthenticated && daysRemaining > 0) {
    return (
      <Card className="bg-gradient-to-r from-[#111827] to-[#0c1322] border-[#10b981]/30 mb-6">
        <CardContent className="pt-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-[#10b981]/20 rounded-lg flex items-center justify-center">
                  <Clock size={20} className="text-[#10b981]" />
                </div>
                <div>
                  <p className="text-white font-semibold">Período de Teste Gratuito</p>
                  <p className="text-[#94a3b8] text-sm">
                    {daysRemaining} {daysRemaining === 1 ? "dia" : "dias"} restante{daysRemaining !== 1 ? "s" : ""}
                  </p>
                </div>
              </div>
              <Button
                variant="outline"
                className="border-[#10b981] text-[#10b981] hover:bg-[#10b981]/10 whitespace-nowrap"
                onClick={() => (window.location.href = getLoginUrl())}
              >
                Ver Planos
              </Button>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-[#94a3b8]">Progresso do Teste</span>
                <span className="text-[#10b981] font-semibold">
                  {Math.round(progressPercentage)}%
                </span>
              </div>
              <Progress value={progressPercentage} className="h-2 bg-[#0c1322]" />
            </div>

            <p className="text-xs text-[#64748b]">
              Você está testando todos os recursos gratuitamente. Crie uma conta para salvar seus dados e acessar recursos premium.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  // If user is authenticated with active trial
  if (isAuthenticated && subscriptionStatus === "trial" && daysRemaining > 0) {
    return (
      <Card className="bg-gradient-to-r from-[#111827] to-[#0c1322] border-[#10b981]/30 mb-6">
        <CardContent className="pt-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-[#10b981]/20 rounded-lg flex items-center justify-center">
                  <Clock size={20} className="text-[#10b981]" />
                </div>
                <div>
                  <p className="text-white font-semibold">Seu Teste Gratuito</p>
                  <p className="text-[#94a3b8] text-sm">
                    {daysRemaining} {daysRemaining === 1 ? "dia" : "dias"} restante{daysRemaining !== 1 ? "s" : ""}
                  </p>
                </div>
              </div>
              <Button
                className="bg-[#10b981] hover:bg-[#059669] text-white whitespace-nowrap"
                onClick={() => (window.location.href = getLoginUrl())}
              >
                Escolher Plano
              </Button>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-[#94a3b8]">Progresso</span>
                <span className="text-[#10b981] font-semibold">
                  {Math.round(progressPercentage)}%
                </span>
              </div>
              <Progress value={progressPercentage} className="h-2 bg-[#0c1322]" />
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return null;
}
