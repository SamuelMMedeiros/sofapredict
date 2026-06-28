import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Link } from "wouter";
import { ArrowLeft, LogIn } from "lucide-react";
import { useAuth } from "@/_core/hooks/useAuth";
import { getLoginUrl } from "@/const";

export default function LoginPage() {
  const { isAuthenticated } = useAuth();

  if (isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#090d16] flex items-center justify-center">
        <Card className="bg-[#111827] border-[#1e293b] w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-white">Já Autenticado</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-[#94a3b8]">Você já está conectado ao SofaPredict.</p>
            <Link href="/dashboard">
              <Button className="w-full bg-[#10b981] hover:bg-[#059669] text-white">
                Ir para Dashboard
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#090d16]">
      {/* Header */}
      <header className="border-b border-[#1e293b] bg-[#111827] sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/">
            <div className="flex items-center gap-2 cursor-pointer hover:opacity-80 transition">
              <ArrowLeft size={20} className="text-[#10b981]" />
              <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-[#10b981] to-[#047857] flex items-center justify-center">
                <span className="text-white font-bold text-sm">SP</span>
              </div>
              <span className="text-white font-bold">SofaPredict</span>
            </div>
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-20">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          {/* Left Column - Benefits */}
          <div className="space-y-8">
            <div>
              <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
                Desbloqueie Recursos Premium
              </h1>
              <p className="text-xl text-[#94a3b8]">
                Faça login para acessar análises avançadas, histórico de apostas e planos premium.
              </p>
            </div>

            <div className="space-y-4">
              <div className="flex gap-4">
                <div className="w-12 h-12 bg-[#10b981]/20 rounded-lg flex items-center justify-center flex-shrink-0">
                  <span className="text-[#10b981] font-bold">✓</span>
                </div>
                <div>
                  <h3 className="text-white font-bold mb-1">Salve seu Histórico</h3>
                  <p className="text-[#94a3b8]">Acompanhe todas as suas apostas e análises</p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="w-12 h-12 bg-[#10b981]/20 rounded-lg flex items-center justify-center flex-shrink-0">
                  <span className="text-[#10b981] font-bold">✓</span>
                </div>
                <div>
                  <h3 className="text-white font-bold mb-1">Acesso a Planos Premium</h3>
                  <p className="text-[#94a3b8]">Desbloqueie análises ilimitadas e recursos avançados</p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="w-12 h-12 bg-[#10b981]/20 rounded-lg flex items-center justify-center flex-shrink-0">
                  <span className="text-[#10b981] font-bold">✓</span>
                </div>
                <div>
                  <h3 className="text-white font-bold mb-1">Sincronização em Tempo Real</h3>
                  <p className="text-[#94a3b8]">Acesse seus dados em qualquer dispositivo</p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Login Card */}
          <div>
            <Card className="bg-[#111827] border-[#1e293b]">
              <CardHeader>
                <CardTitle className="text-white text-2xl">Fazer Login</CardTitle>
                <p className="text-[#94a3b8] text-sm mt-2">
                  Use sua conta Manus para acessar o SofaPredict
                </p>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="bg-[#0c1322] p-4 rounded-lg border border-[#1e293b]">
                  <p className="text-[#94a3b8] text-sm mb-4">
                    Você será redirecionado para o portal de autenticação seguro do Manus.
                  </p>
                  <a href={getLoginUrl()}>
                    <Button className="w-full bg-[#10b981] hover:bg-[#059669] text-white py-6 text-base flex items-center justify-center gap-2">
                      <LogIn size={20} />
                      Conectar com Manus
                    </Button>
                  </a>
                </div>

                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-[#1e293b]"></div>
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-2 bg-[#111827] text-[#94a3b8]">ou</span>
                  </div>
                </div>

                <div className="space-y-3">
                  <p className="text-[#94a3b8] text-sm">
                    Não tem uma conta? Você pode criar uma durante o login.
                  </p>
                  <Link href="/">
                    <Button variant="outline" className="w-full border-[#1e293b] text-[#94a3b8] hover:text-white hover:bg-[#1e293b]">
                      Voltar para Home
                    </Button>
                  </Link>
                </div>

                <div className="bg-[#0c1322] p-4 rounded-lg border border-[#1e293b]">
                  <p className="text-[#94a3b8] text-xs">
                    💡 <strong>Dica:</strong> Você pode explorar todos os recursos gratuitamente sem fazer login. 
                    Faça login apenas para salvar seu histórico e acessar planos premium.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
