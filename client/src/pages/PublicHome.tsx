import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/_core/hooks/useAuth";
import { Link } from "wouter";
import {
  Zap,
  TrendingUp,
  BarChart3,
  Shield,
  Users,
  ArrowRight,
  CheckCircle,
  Smartphone,
} from "lucide-react";

export default function PublicHome() {
  const { user, isAuthenticated } = useAuth();

  return (
    <div className="min-h-screen bg-[#090d16]">
      {/* Navigation */}
      <nav className="border-b border-[#1e293b] bg-[#0c1322]/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-[#10b981] rounded-lg flex items-center justify-center">
              <span className="text-white font-bold">SP</span>
            </div>
            <span className="text-white font-bold text-xl">SofaPredict</span>
          </div>

          <div className="flex items-center gap-4">
            <a href="#features" className="text-[#94a3b8] hover:text-white transition">
              Recursos
            </a>
            <a href="#pricing" className="text-[#94a3b8] hover:text-white transition">
              Planos
            </a>

            {isAuthenticated ? (
              <div className="flex items-center gap-3">
                <span className="text-[#94a3b8] text-sm">{user?.name}</span>
                <Link href="/dashboard">
                  <Button className="bg-[#10b981] hover:bg-[#059669] text-white">
                    Dashboard
                  </Button>
                </Link>
              </div>
            ) : null}
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-4 py-20 text-center space-y-8">
        <div className="space-y-4">
          <h1 className="text-5xl md:text-6xl font-bold text-white">
            Análise Inteligente de Apostas Esportivas
          </h1>
          <p className="text-xl text-[#94a3b8] max-w-2xl mx-auto">
            Use inteligência artificial para analisar partidas, detectar arbitragens e gerar
            recomendações baseadas em dados. Todos os recursos disponíveis gratuitamente para teste.
          </p>
        </div>

        <div className="flex flex-col md:flex-row gap-4 justify-center pt-4">
          <Link href="/explore">
            <Button className="bg-[#10b981] hover:bg-[#059669] text-white px-8 py-6 text-lg">
              Explorar Grátis <ArrowRight className="ml-2" size={20} />
            </Button>
          </Link>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 pt-12 max-w-2xl mx-auto">
          <div>
            <p className="text-3xl font-bold text-[#10b981]">10K+</p>
            <p className="text-[#94a3b8]">Partidas Analisadas</p>
          </div>
          <div>
            <p className="text-3xl font-bold text-[#10b981]">87%</p>
            <p className="text-[#94a3b8]">Taxa de Acerto</p>
          </div>
          <div>
            <p className="text-3xl font-bold text-[#10b981]">24/7</p>
            <p className="text-[#94a3b8]">Análise em Tempo Real</p>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="bg-[#0c1322] border-y border-[#1e293b] py-20">
        <div className="max-w-7xl mx-auto px-4 space-y-12">
          <div className="text-center space-y-4">
            <h2 className="text-4xl font-bold text-white">Recursos Disponíveis</h2>
            <p className="text-[#94a3b8] max-w-2xl mx-auto">
              Todas essas funcionalidades estão disponíveis gratuitamente para você testar
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Feature 1 */}
            <Card className="bg-[#111827] border-[#1e293b] hover:border-[#10b981]/50 transition">
              <CardHeader>
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 bg-[#10b981]/20 rounded-lg flex items-center justify-center">
                    <Zap size={20} className="text-[#10b981]" />
                  </div>
                  <CardTitle className="text-white">Análise com IA</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-[#94a3b8]">
                  Inteligência artificial analisa estatísticas de times, histórico e contexto
                  para gerar predições precisas.
                </p>
              </CardContent>
            </Card>

            {/* Feature 2 */}
            <Card className="bg-[#111827] border-[#1e293b] hover:border-[#10b981]/50 transition">
              <CardHeader>
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 bg-[#10b981]/20 rounded-lg flex items-center justify-center">
                    <BarChart3 size={20} className="text-[#10b981]" />
                  </div>
                  <CardTitle className="text-white">Calculadora de Arbitragem</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-[#94a3b8]">
                  Detecte surebets cruzando odds de múltiplas casas de apostas. Identifique
                  apostas sem risco.
                </p>
              </CardContent>
            </Card>

            {/* Feature 3 */}
            <Card className="bg-[#111827] border-[#1e293b] hover:border-[#10b981]/50 transition">
              <CardHeader>
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 bg-[#10b981]/20 rounded-lg flex items-center justify-center">
                    <TrendingUp size={20} className="text-[#10b981]" />
                  </div>
                  <CardTitle className="text-white">Radar Tático</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-[#94a3b8]">
                  Visualize estatísticas detalhadas de times: posse de bola, chutes,
                  escanteios, cartões e mais.
                </p>
              </CardContent>
            </Card>

            {/* Feature 4 */}
            <Card className="bg-[#111827] border-[#1e293b] hover:border-[#10b981]/50 transition">
              <CardHeader>
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 bg-[#10b981]/20 rounded-lg flex items-center justify-center">
                    <Shield size={20} className="text-[#10b981]" />
                  </div>
                  <CardTitle className="text-white">Gerador de Tripla</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-[#94a3b8]">
                  IA recomenda as melhores combinações de apostas com justificativa e índice
                  de confiança.
                </p>
              </CardContent>
            </Card>

            {/* Feature 5 */}
            <Card className="bg-[#111827] border-[#1e293b] hover:border-[#10b981]/50 transition">
              <CardHeader>
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 bg-[#10b981]/20 rounded-lg flex items-center justify-center">
                    <Users size={20} className="text-[#10b981]" />
                  </div>
                  <CardTitle className="text-white">Filtros Avançados</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-[#94a3b8]">
                  Filtre partidas por liga, odds range, nível de confiança e muito mais para
                  encontrar as melhores oportunidades.
                </p>
              </CardContent>
            </Card>

            {/* Feature 6 */}
            <Card className="bg-[#111827] border-[#1e293b] hover:border-[#10b981]/50 transition">
              <CardHeader>
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 bg-[#10b981]/20 rounded-lg flex items-center justify-center">
                    <Smartphone size={20} className="text-[#10b981]" />
                  </div>
                  <CardTitle className="text-white">Totalmente Responsivo</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-[#94a3b8]">
                  Use em qualquer dispositivo. Desktop, tablet ou mobile - a experiência é
                  perfeita em todos.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="max-w-7xl mx-auto px-4 py-20 space-y-12">
        <div className="text-center space-y-4">
          <h2 className="text-4xl font-bold text-white">Como Funciona</h2>
          <p className="text-[#94a3b8]">Comece a testar agora mesmo</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="text-center space-y-4">
            <div className="w-16 h-16 bg-[#10b981] rounded-full flex items-center justify-center mx-auto">
              <span className="text-2xl font-bold text-white">1</span>
            </div>
            <h3 className="text-xl font-bold text-white">Explore Grátis</h3>
            <p className="text-[#94a3b8]">
              Acesse todos os recursos sem necessidade de criar conta. Teste a plataforma
              livremente com todas as funcionalidades.
            </p>
          </div>

          <div className="text-center space-y-4">
            <div className="w-16 h-16 bg-[#10b981] rounded-full flex items-center justify-center mx-auto">
              <span className="text-2xl font-bold text-white">2</span>
            </div>
            <h3 className="text-xl font-bold text-white">Salve Seus Dados</h3>
            <p className="text-[#94a3b8]">
              Crie uma conta quando quiser salvar seu histórico de apostas e acessar recursos
              premium com mais análises.
            </p>
          </div>

          <div className="text-center space-y-4">
            <div className="w-16 h-16 bg-[#10b981] rounded-full flex items-center justify-center mx-auto">
              <span className="text-2xl font-bold text-white">3</span>
            </div>
            <h3 className="text-xl font-bold text-white">Escolha um Plano</h3>
            <p className="text-[#94a3b8]">
              Selecione o plano que melhor se adequa às suas necessidades e desbloqueie recursos
              avançados.
            </p>
          </div>
        </div>
      </section>

      {/* Pricing Preview */}
      <section id="pricing" className="bg-[#0c1322] border-y border-[#1e293b] py-20">
        <div className="max-w-7xl mx-auto px-4 space-y-12">
          <div className="text-center space-y-4">
            <h2 className="text-4xl font-bold text-white">Planos Simples e Transparentes</h2>
            <p className="text-[#94a3b8]">Escolha o plano que melhor se adequa a você</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Free */}
            <Card className="bg-[#111827] border-[#1e293b]">
              <CardHeader>
                <CardTitle className="text-white">Free</CardTitle>
                <p className="text-[#94a3b8] text-sm mt-1">Para experimentar</p>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-3xl font-bold text-white">R$ 0</p>
                <ul className="space-y-2">
                  <li className="flex items-center gap-2 text-[#94a3b8]">
                    <CheckCircle size={16} className="text-[#10b981]" />
                    Listar partidas
                  </li>
                  <li className="flex items-center gap-2 text-[#94a3b8]">
                    <CheckCircle size={16} className="text-[#10b981]" />
                    Filtros básicos
                  </li>
                  <li className="flex items-center gap-2 text-[#94a3b8]">
                    <CheckCircle size={16} className="text-[#10b981]" />
                    Radar tático
                  </li>
                  <li className="flex items-center gap-2 text-[#94a3b8]">
                    <CheckCircle size={16} className="text-[#10b981]" />
                    Análise com IA
                  </li>
                </ul>
                <Link href="/dashboard">
                  <Button className="w-full bg-[#10b981] hover:bg-[#059669] text-white">
                    Começar Agora
                  </Button>
                </Link>
              </CardContent>
            </Card>

            {/* Pro */}
            <Card className="bg-[#111827] border-[#10b981] ring-2 ring-[#10b981]/50 transform scale-105">
              <CardHeader>
                <CardTitle className="text-white">Pro</CardTitle>
                <p className="text-[#10b981] text-sm mt-1">Mais análises</p>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-3xl font-bold text-white">
                  R$ 29,90<span className="text-lg text-[#94a3b8]">/mês</span>
                </p>
                <ul className="space-y-2">
                  <li className="flex items-center gap-2 text-[#94a3b8]">
                    <CheckCircle size={16} className="text-[#10b981]" />
                    Tudo do Free
                  </li>
                  <li className="flex items-center gap-2 text-[#94a3b8]">
                    <CheckCircle size={16} className="text-[#10b981]" />
                    Calculadora de arbitragem
                  </li>
                  <li className="flex items-center gap-2 text-[#94a3b8]">
                    <CheckCircle size={16} className="text-[#10b981]" />
                    Gerador de tripla
                  </li>
                  <li className="flex items-center gap-2 text-[#94a3b8]">
                    <CheckCircle size={16} className="text-[#10b981]" />
                    Histórico completo
                  </li>
                </ul>
                <Link href="/pricing">
                  <Button className="w-full bg-[#10b981] hover:bg-[#059669] text-white">
                    Começar Trial (14 dias)
                  </Button>
                </Link>
              </CardContent>
            </Card>

            {/* Premium */}
            <Card className="bg-[#111827] border-[#1e293b]">
              <CardHeader>
                <CardTitle className="text-white">Premium</CardTitle>
                <p className="text-[#94a3b8] text-sm mt-1">Acesso completo</p>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-3xl font-bold text-white">
                  R$ 79,90<span className="text-lg text-[#94a3b8]">/mês</span>
                </p>
                <ul className="space-y-2">
                  <li className="flex items-center gap-2 text-[#94a3b8]">
                    <CheckCircle size={16} className="text-[#10b981]" />
                    Tudo do Pro
                  </li>
                  <li className="flex items-center gap-2 text-[#94a3b8]">
                    <CheckCircle size={16} className="text-[#10b981]" />
                    Análises ilimitadas
                  </li>
                  <li className="flex items-center gap-2 text-[#94a3b8]">
                    <CheckCircle size={16} className="text-[#10b981]" />
                    Suporte prioritário
                  </li>
                  <li className="flex items-center gap-2 text-[#94a3b8]">
                    <CheckCircle size={16} className="text-[#10b981]" />
                    API access
                  </li>
                </ul>
                <Link href="/pricing">
                  <Button className="w-full bg-[#0c1322] hover:bg-[#1e293b] text-white border border-[#1e293b]">
                    Começar Trial (14 dias)
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="max-w-7xl mx-auto px-4 py-20 text-center space-y-8">
        <div className="space-y-4">
          <h2 className="text-4xl font-bold text-white">Pronto para começar?</h2>
          <p className="text-xl text-[#94a3b8]">
            Explore todos os recursos gratuitamente. Sem cartão de crédito necessário.
          </p>
        </div>

        <Link href="/dashboard">
          <Button className="bg-[#10b981] hover:bg-[#059669] text-white px-8 py-6 text-lg">
            Explorar Agora <ArrowRight className="ml-2" size={20} />
          </Button>
        </Link>
      </section>

      {/* Footer */}
      <footer className="border-t border-[#1e293b] bg-[#0c1322] py-12">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            <div>
              <h3 className="text-white font-bold mb-4">SofaPredict</h3>
              <p className="text-[#94a3b8] text-sm">
                Análise inteligente de apostas esportivas com IA
              </p>
            </div>
            <div>
              <h4 className="text-white font-bold mb-4">Produto</h4>
              <ul className="space-y-2 text-[#94a3b8] text-sm">
                <li><a href="#features" className="hover:text-white transition">Recursos</a></li>
                <li><a href="#pricing" className="hover:text-white transition">Preços</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-bold mb-4">Legal</h4>
              <ul className="space-y-2 text-[#94a3b8] text-sm">
                <li><Link href="/lgpd-consent"><a className="hover:text-white transition">Privacidade</a></Link></li>
                <li><a href="#" className="hover:text-white transition">Termos</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-bold mb-4">Contato</h4>
              <ul className="space-y-2 text-[#94a3b8] text-sm">
                <li><a href="mailto:support@sofapredict.com" className="hover:text-white transition">support@sofapredict.com</a></li>
              </ul>
            </div>
          </div>

          <div className="border-t border-[#1e293b] pt-8 text-center text-[#94a3b8] text-sm">
            <p>&copy; 2026 SofaPredict. Todos os direitos reservados.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
