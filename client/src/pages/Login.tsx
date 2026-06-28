import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Link } from "wouter";
import { ArrowLeft, LogIn, Zap, TrendingUp, Shield, Clock } from "lucide-react";
import { useAuth } from "@/_core/hooks/useAuth";
import { getLoginUrl } from "@/const";

export default function LoginPage() {
  const { isAuthenticated } = useAuth();

  if (isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#090d16] via-[#0f1419] to-[#0a0e17] flex items-center justify-center p-4">
        <Card className="bg-[#111827]/80 backdrop-blur-xl border-[#10b981]/20 w-full max-w-md shadow-2xl">
          <CardHeader className="text-center">
            <div className="mb-4 flex justify-center">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#10b981] to-[#059669] flex items-center justify-center">
                <span className="text-white font-bold text-2xl">✓</span>
              </div>
            </div>
            <CardTitle className="text-white text-2xl">Já Autenticado</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-[#94a3b8] text-center">Você já está conectado ao SofaPredict.</p>
            <Link href="/dashboard">
              <Button className="w-full bg-gradient-to-r from-[#10b981] to-[#059669] hover:from-[#059669] hover:to-[#047857] text-white font-semibold py-6 text-base">
                Ir para Dashboard
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#090d16] via-[#0f1419] to-[#0a0e17] overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-[#10b981]/5 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-[#059669]/5 rounded-full blur-3xl animate-pulse" style={{ animationDelay: "1s" }}></div>
      </div>

      {/* Header */}
      <header className="border-b border-[#1e293b]/50 bg-[#111827]/50 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/">
            <div className="flex items-center gap-2 cursor-pointer hover:opacity-80 transition-all duration-300 group">
              <ArrowLeft size={20} className="text-[#10b981] group-hover:-translate-x-1 transition-transform" />
              <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-[#10b981] to-[#047857] flex items-center justify-center shadow-lg">
                <span className="text-white font-bold text-sm">SP</span>
              </div>
              <span className="text-white font-bold">SofaPredict</span>
            </div>
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-12 md:py-20 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Left Column - Benefits */}
          <div className="space-y-8 animate-fade-in">
            <div>
              <h1 className="text-5xl md:text-6xl font-bold text-white mb-6 leading-tight">
                Desbloqueie <span className="bg-gradient-to-r from-[#10b981] to-[#059669] bg-clip-text text-transparent">Recursos Premium</span>
              </h1>
              <p className="text-xl text-[#94a3b8] leading-relaxed">
                Faça login para acessar análises avançadas, histórico de apostas e planos premium com dados em tempo real.
              </p>
            </div>

            <div className="space-y-4">
              {/* Benefit 1 */}
              <div className="flex gap-4 group cursor-pointer">
                <div className="w-12 h-12 bg-gradient-to-br from-[#10b981]/20 to-[#059669]/10 rounded-lg flex items-center justify-center flex-shrink-0 group-hover:from-[#10b981]/30 group-hover:to-[#059669]/20 transition-all duration-300 shadow-lg">
                  <TrendingUp size={24} className="text-[#10b981]" />
                </div>
                <div>
                  <h3 className="text-white font-bold mb-1 group-hover:text-[#10b981] transition-colors">Análises em Tempo Real</h3>
                  <p className="text-[#94a3b8] text-sm">Dados atualizados constantemente de múltiplas casas de apostas</p>
                </div>
              </div>

              {/* Benefit 2 */}
              <div className="flex gap-4 group cursor-pointer">
                <div className="w-12 h-12 bg-gradient-to-br from-[#10b981]/20 to-[#059669]/10 rounded-lg flex items-center justify-center flex-shrink-0 group-hover:from-[#10b981]/30 group-hover:to-[#059669]/20 transition-all duration-300 shadow-lg">
                  <Zap size={24} className="text-[#10b981]" />
                </div>
                <div>
                  <h3 className="text-white font-bold mb-1 group-hover:text-[#10b981] transition-colors">Detecção de Arbitragem</h3>
                  <p className="text-[#94a3b8] text-sm">Identifique oportunidades de lucro garantido entre bookmakers</p>
                </div>
              </div>

              {/* Benefit 3 */}
              <div className="flex gap-4 group cursor-pointer">
                <div className="w-12 h-12 bg-gradient-to-br from-[#10b981]/20 to-[#059669]/10 rounded-lg flex items-center justify-center flex-shrink-0 group-hover:from-[#10b981]/30 group-hover:to-[#059669]/20 transition-all duration-300 shadow-lg">
                  <Clock size={24} className="text-[#10b981]" />
                </div>
                <div>
                  <h3 className="text-white font-bold mb-1 group-hover:text-[#10b981] transition-colors">Histórico Sincronizado</h3>
                  <p className="text-[#94a3b8] text-sm">Acompanhe todas as suas apostas em qualquer dispositivo</p>
                </div>
              </div>

              {/* Benefit 4 */}
              <div className="flex gap-4 group cursor-pointer">
                <div className="w-12 h-12 bg-gradient-to-br from-[#10b981]/20 to-[#059669]/10 rounded-lg flex items-center justify-center flex-shrink-0 group-hover:from-[#10b981]/30 group-hover:to-[#059669]/20 transition-all duration-300 shadow-lg">
                  <Shield size={24} className="text-[#10b981]" />
                </div>
                <div>
                  <h3 className="text-white font-bold mb-1 group-hover:text-[#10b981] transition-colors">Segurança Garantida</h3>
                  <p className="text-[#94a3b8] text-sm">Seus dados protegidos com criptografia de ponta</p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Login Card */}
          <div className="animate-slide-in-up">
            <Card className="bg-[#111827]/80 backdrop-blur-xl border-[#10b981]/20 shadow-2xl hover:shadow-[0_0_60px_rgba(16,185,129,0.1)] transition-all duration-500">
              <CardHeader className="bg-gradient-to-r from-[#10b981]/5 to-[#059669]/5 border-b border-[#1e293b]/50">
                <CardTitle className="text-white text-3xl">Bem-vindo</CardTitle>
                <p className="text-[#94a3b8] text-sm mt-2">
                  Conecte-se com sua conta Manus para começar
                </p>
              </CardHeader>
              <CardContent className="space-y-6 pt-8">
                {/* Security notice */}
                <div className="bg-gradient-to-r from-[#10b981]/10 to-[#059669]/10 p-4 rounded-lg border border-[#10b981]/20">
                  <p className="text-[#94a3b8] text-sm flex items-start gap-2">
                    <Shield size={16} className="text-[#10b981] flex-shrink-0 mt-0.5" />
                    <span>Você será redirecionado para o portal de autenticação seguro do Manus.</span>
                  </p>
                </div>

                {/* Login button */}
                <a href={getLoginUrl()} className="block">
                  <Button className="w-full bg-gradient-to-r from-[#10b981] to-[#059669] hover:from-[#059669] hover:to-[#047857] text-white py-6 text-base font-semibold shadow-lg hover:shadow-[0_0_30px_rgba(16,185,129,0.3)] transition-all duration-300 transform hover:scale-105 active:scale-95 flex items-center justify-center gap-2">
                    <LogIn size={20} />
                    Conectar com Manus
                  </Button>
                </a>

                {/* Divider */}
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-[#1e293b]/50"></div>
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-2 bg-[#111827] text-[#64748b]">ou</span>
                  </div>
                </div>

                {/* Info section */}
                <div className="space-y-4">
                  <p className="text-[#94a3b8] text-sm text-center">
                    Não tem uma conta? Você pode criar uma durante o login.
                  </p>
                  <Link href="/">
                    <Button 
                      variant="outline" 
                      className="w-full border-[#1e293b] text-[#94a3b8] hover:text-white hover:bg-[#1e293b]/50 transition-all duration-300"
                    >
                      Voltar para Home
                    </Button>
                  </Link>
                </div>

                {/* Tip box */}
                <div className="bg-gradient-to-r from-[#10b981]/5 to-[#059669]/5 p-4 rounded-lg border border-[#1e293b]/50">
                  <p className="text-[#94a3b8] text-xs leading-relaxed">
                    💡 <strong>Dica:</strong> Você pode explorar todos os recursos gratuitamente sem fazer login. Faça login apenas para salvar seu histórico e acessar planos premium com dados em tempo real.
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-4 mt-8">
              <div className="text-center p-4 rounded-lg bg-[#111827]/50 border border-[#1e293b]/50 hover:border-[#10b981]/20 transition-all">
                <p className="text-2xl font-bold text-[#10b981]">10K+</p>
                <p className="text-xs text-[#64748b] mt-1">Partidas Analisadas</p>
              </div>
              <div className="text-center p-4 rounded-lg bg-[#111827]/50 border border-[#1e293b]/50 hover:border-[#10b981]/20 transition-all">
                <p className="text-2xl font-bold text-[#10b981]">87%</p>
                <p className="text-xs text-[#64748b] mt-1">Taxa de Acerto</p>
              </div>
              <div className="text-center p-4 rounded-lg bg-[#111827]/50 border border-[#1e293b]/50 hover:border-[#10b981]/20 transition-all">
                <p className="text-2xl font-bold text-[#10b981]">24/7</p>
                <p className="text-xs text-[#64748b] mt-1">Análise em Tempo Real</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
