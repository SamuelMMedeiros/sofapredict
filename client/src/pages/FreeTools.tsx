import { useMemo, useState } from "react";
import { Link } from "wouter";
import { ArrowLeft, Calculator, Copy, Download, Play, ShieldCheck, Star, Info, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

type Tool = {
  id: string;
  name: string;
  description: string;
  placeholder: string;
  howToUse: string;
  examples: string[];
  run: (value: string) => string;
};

const numberList = (value: string) => value.split(",").map(Number).filter(Number.isFinite);
const money = (value: number) => `R$ ${value.toFixed(2).replace(".", ",")}`;
const percent = (value: number) => `${value.toFixed(2).replace(".", ",")}%`;

const tools: Tool[] = [
  { id: "implied", name: "Probabilidade implícita", description: "Converta uma odd decimal em probabilidade.", placeholder: "Odd, ex.: 2.00", howToUse: "Informe uma odd decimal e a ferramenta transforma a chance implícita da casa em percentual.", examples: ["2.00", "3.50"], run: value => { const odd = Number(value); return odd > 1 ? percent(100 / odd) : "Informe uma odd maior que 1."; } },
  { id: "fair-odd", name: "Odd justa", description: "Calcule a odd justa a partir da probabilidade estimada.", placeholder: "Probabilidade %, ex.: 55", howToUse: "Use sua estimativa de chance em percentual para descobrir a odd justa equivalente.", examples: ["55", "62"], run: value => { const probability = Number(value); return probability > 0 && probability <= 100 ? (100 / probability).toFixed(2) : "Informe uma probabilidade entre 1 e 100."; } },
  { id: "return", name: "Retorno bruto", description: "Veja quanto uma aposta simples retorna.", placeholder: "Stake,odd. Ex.: 100,2.5", howToUse: "Digite o valor apostado e a odd para saber o retorno total antes de descontar o stake.", examples: ["100,2.5", "50,1.8"], run: value => { const [stake, odd] = numberList(value); return stake > 0 && odd > 1 ? money(stake * odd) : "Use stake,odd."; } },
  { id: "profit", name: "Lucro líquido", description: "Retorno menos o valor investido.", placeholder: "Stake,odd. Ex.: 100,2.5", howToUse: "Boa para avaliar quanto realmente sobra depois de um acerto.", examples: ["100,2.5", "80,2.2"], run: value => { const [stake, odd] = numberList(value); return stake > 0 && odd > 1 ? money(stake * (odd - 1)) : "Use stake,odd."; } },
  { id: "break-even", name: "Ponto de equilíbrio", description: "Probabilidade mínima para não perder valor esperado.", placeholder: "Odd, ex.: 1.80", howToUse: "Descubra a chance mínima necessária para uma odd ser financeiramente neutra.", examples: ["1.80", "2.10"], run: value => { const odd = Number(value); return odd > 1 ? percent(100 / odd) : "Informe uma odd maior que 1."; } },
  { id: "kelly", name: "Critério de Kelly", description: "Sugestão matemática de stake, sem promessa de lucro.", placeholder: "Probabilidade %,odd,banca. Ex.: 55,2,1000", howToUse: "Aplique probabilidade, odd e banca para obter uma sugestão de stake orientada por valor esperado.", examples: ["55,2,1000", "60,2.5,1200"], run: value => { const [probability, odd, bankroll] = numberList(value); const edge = probability / 100 * odd - 1; const fraction = edge / (odd - 1); return fraction > 0 && bankroll > 0 ? `${percent(fraction * 100)} da banca = ${money(bankroll * fraction)}` : "Sem valor positivo com esses dados."; } },
  { id: "units", name: "Conversor de unidades", description: "Transforme unidades em valor de stake.", placeholder: "Unidades,banca,unidade %. Ex.: 2,1000,1", howToUse: "Use a banca e o percentual de cada unidade para converter unidades em reais.", examples: ["2,1000,1", "3,1500,0.75"], run: value => { const [units, bankroll, unit] = numberList(value); return units > 0 && bankroll > 0 && unit > 0 ? money(bankroll * unit / 100 * units) : "Use unidades,banca,percentual."; } },
  { id: "overround", name: "Margem da casa", description: "Calcule o overround de um mercado 1X2.", placeholder: "Odds separadas por vírgula. Ex.: 2,3.4,3.2", howToUse: "Informe as odds do mercado e veja a margem total embutida na casa.", examples: ["2,3.4,3.2", "1.9,3.2,4.5"], run: value => { const odds = numberList(value); const total = odds.reduce((sum, odd) => sum + (odd > 1 ? 1 / odd : 0), 0); return odds.length > 1 ? percent(total * 100) : "Informe pelo menos duas odds."; } },
  { id: "surebet", name: "Margem de surebet", description: "Detecte margem teórica abaixo de 100%.", placeholder: "Melhores odds separadas por vírgula", howToUse: "Se a soma das probabilidades implícitas for menor que 100%, há margem teórica de arbitragem.", examples: ["2.1,3.1,3.5", "1.9,2.8,4.0"], run: value => { const odds = numberList(value); const total = odds.reduce((sum, odd) => sum + (odd > 1 ? 1 / odd : 0), 0); return total > 0 && total < 1 ? `Margem ${percent((1 - total) * 100)}: oportunidade teórica.` : "Sem surebet teórica."; } },
  { id: "hedge", name: "Hedge de aposta", description: "Calcule a stake para igualar um retorno.", placeholder: "Retorno desejado,odd hedge. Ex.: 250,2.2", howToUse: "Se você quer proteger uma posição, ele estima quanto apostar na contra parte.", examples: ["250,2.2", "180,1.9"], run: value => { const [target, odd] = numberList(value); return target > 0 && odd > 1 ? money(target / odd) : "Use retorno,odd."; } },
  { id: "dutching", name: "Dutching", description: "Distribua uma banca para retorno igual.", placeholder: "Banca,odds. Ex.: 100,2,3,4", howToUse: "Digite a banca e as odds de cada seleção para dividir o valor de forma equilibrada.", examples: ["100,2,3,4", "200,1.9,2.8"], run: value => { const values = numberList(value); const bankroll = values.shift() ?? 0; const total = values.reduce((sum, odd) => sum + (odd > 1 ? 1 / odd : 0), 0); return bankroll > 0 && total > 0 ? values.map((odd, index) => `Seleção ${index + 1}: ${money(bankroll * (1 / odd) / total)}`).join(" | ") : "Use banca,odd1,odd2..."; } },
  { id: "combo-odds", name: "Odds combinadas", description: "Multiplique odds para uma múltipla.", placeholder: "Odds separadas por vírgula", howToUse: "É útil para estimar o retorno bruto de uma combinação de resultados.", examples: ["1.8,2.2,2.5", "2.0,3.0"], run: value => { const odds = numberList(value); const result = odds.reduce((total, odd) => total * odd, 1); return odds.length > 0 && result > 1 ? result.toFixed(2) : "Informe odds válidas."; } },
  { id: "combo-return", name: "Retorno da múltipla", description: "Calcule retorno com stake e várias odds.", placeholder: "Stake,odd1,odd2...", howToUse: "Para uma aposta combinada, combine o valor apostado com todas as odds da seleção.", examples: ["20,1.8,2.2", "50,1.9,2.5,3.1"], run: value => { const values = numberList(value); const stake = values.shift() ?? 0; const odds = values; const combined = odds.reduce((total, odd) => total * odd, 1); return stake > 0 && combined > 1 ? money(stake * combined) : "Use stake,odd1,odd2..."; } },
  { id: "roi", name: "ROI", description: "Retorno sobre o total investido.", placeholder: "Lucro,investimento. Ex.: 250,1000", howToUse: "Compare o lucro obtido com o capital investido para avaliar eficiência.", examples: ["250,1000", "300,1500"], run: value => { const [profitValue, invested] = numberList(value); return invested > 0 ? percent(profitValue / invested * 100) : "Use lucro,investimento."; } },
  { id: "win-rate", name: "Taxa de acerto", description: "Calcule o percentual de vitórias.", placeholder: "Vitórias,total. Ex.: 7,10", howToUse: "Ajuda a mensurar a consistência do histórico em um período.", examples: ["7,10", "24,40"], run: value => { const [wins, total] = numberList(value); return total > 0 ? percent(wins / total * 100) : "Use vitórias,total."; } },
  { id: "average-odds", name: "Odd média", description: "Média simples das odds informadas.", placeholder: "Odds separadas por vírgula", howToUse: "Média as odds para ter uma visão rápida do mercado ou do histórico.", examples: ["1.8,2.1,2.4", "2.0,2.5"], run: value => { const odds = numberList(value); return odds.length ? (odds.reduce((sum, odd) => sum + odd, 0) / odds.length).toFixed(2) : "Informe odds."; } },
  { id: "bankroll", name: "Banca após aposta", description: "Atualize a banca com lucro ou prejuízo.", placeholder: "Banca,stake,odd,result (win/loss)", howToUse: "Use o resultado da aposta para ajustar a sua banca instantaneamente.", examples: ["1000,100,2.5,win", "1000,80,1.9,loss"], run: value => { const [bankroll, stake, odd] = numberList(value); const won = value.toLowerCase().includes("win"); return bankroll > 0 && stake > 0 && odd > 1 ? money(bankroll + (won ? stake * (odd - 1) : -stake)) : "Use banca,stake,odd,win ou loss."; } },
  { id: "loss-limit", name: "Limite de perda", description: "Calcule uma perda máxima responsável.", placeholder: "Banca,percentual limite. Ex.: 1000,2", howToUse: "Defina um teto prudente para não extrapolar a banca em uma sequência negativa.", examples: ["1000,2", "2500,5"], run: value => { const [bankroll, limit] = numberList(value); return bankroll > 0 && limit > 0 ? money(bankroll * limit / 100) : "Use banca,percentual."; } },
  { id: "cashout", name: "Ponto de cashout", description: "Compare cashout com o retorno potencial.", placeholder: "Stake,odd original,cashout", howToUse: "Ajuda a decidir se o cashout compensa mais do que seguir apostado até o fim.", examples: ["100,2.5,220", "80,1.9,130"], run: value => { const [stake, odd, cashout] = numberList(value); return stake > 0 && odd > 1 && cashout > 0 ? `Potencial ${money(stake * odd)} · Cashout ${money(cashout)} · ${cashout >= stake * odd ? "favorável" : "abaixo do potencial"}` : "Use stake,odd,cashout."; } },
  { id: "value", name: "Valor esperado", description: "Estime EV com probabilidade e odd.", placeholder: "Probabilidade %,odd,stake. Ex.: 55,2.2,100", howToUse: "Compare a sua estimativa com a odd para avaliar se o valor é positivo no longo prazo.", examples: ["55,2.2,100", "60,2.5,200"], run: value => { const [probability, odd, stake] = numberList(value); const ev = probability / 100 * (odd - 1) - (1 - probability / 100); return stake > 0 && odd > 1 ? `${percent(ev * 100)} · EV ${money(stake * ev)}` : "Use probabilidade,odd,stake."; } },
  { id: "form", name: "Resumo de forma", description: "Conte vitórias, empates e derrotas de uma sequência.", placeholder: "Resultados W,D,L,W...", howToUse: "Analise rapidamente o número de vitórias, empates e derrotas em um período.", examples: ["W,D,L,W,W", "W,W,D,L"], run: value => { const items = value.toUpperCase().split(",").map(item => item.trim()); return `V ${items.filter(item => item === "W").length} · E ${items.filter(item => item === "D").length} · D ${items.filter(item => item === "L").length}`; } },
  { id: "streak", name: "Sequência atual", description: "Conte a sequência final de resultados iguais.", placeholder: "Resultados W,W,L...", howToUse: "Veja se a última sequência está em alta ou em queda.", examples: ["W,W,W,L", "D,D,D"], run: value => { const items = value.toUpperCase().split(",").map(item => item.trim()).filter(Boolean); const last = items.at(-1); return last ? `${items.reverse().findIndex(item => item !== last) === -1 ? items.length : items.findIndex(item => item !== last)} em ${last}` : "Informe resultados."; } },
  { id: "note", name: "Nota de análise", description: "Guarde uma anotação local para a próxima partida.", placeholder: "Escreva sua nota", howToUse: "Use isso para manter observações sem depender de login ou API.", examples: ["Time favorito em casa", "Sem apostar em derbies"], run: value => { localStorage.setItem("sofapredict-match-note", value); return "Nota salva neste dispositivo."; } },
  { id: "copy", name: "Copiar resumo", description: "Copie o texto informado para compartilhar.", placeholder: "Texto para copiar", howToUse: "Copie qualquer texto ou cálculo para enviar por mensagem ou bloco de notas.", examples: ["Meu resumo", "Análise do mercado"], run: value => { void navigator.clipboard?.writeText(value); return "Resumo copiado."; } },
  { id: "export", name: "Exportar CSV", description: "Baixe os valores informados em CSV.", placeholder: "Linha de dados separada por vírgulas", howToUse: "Exporta os dados em um arquivo simples para importar em planilhas.", examples: ["valor,odd,resultado", "100,2.5,win"], run: value => { const blob = new Blob([`dados\n${value}\n`], { type: "text/csv" }); const url = URL.createObjectURL(blob); const link = document.createElement("a"); link.href = url; link.download = "sofapredict-dados.csv"; link.click(); URL.revokeObjectURL(url); return "CSV baixado."; } },
  { id: "favorite-note", name: "Lista local", description: "Salve uma lista curta de times para consultar offline.", placeholder: "Times separados por vírgula", howToUse: "Útil para manter uma shortlist de clubes ou mercados em uso frequente.", examples: ["Flamengo,Palmeiras,Grêmio", "Barcelona,Real Madrid"], run: value => { localStorage.setItem("sofapredict-teams", value); return "Lista de times salva."; } },
  { id: "refresh-tip", name: "Plano de atualização", description: "Crie um intervalo econômico para atualizar APIs.", placeholder: "Minutos entre atualizações. Ex.: 15", howToUse: "Ajuda a escolher um intervalo que balanceie freshness e custo de API.", examples: ["15", "30"], run: value => { const minutes = Number(value); return minutes >= 5 ? `Atualize a cada ${minutes} minutos para poupar chamadas.` : "Use pelo menos 5 minutos."; } },
  { id: "api-budget", name: "Orçamento de API", description: "Estime chamadas diárias disponíveis.", placeholder: "Limite mensal,dias restantes", howToUse: "Calcula um teto de chamadas diárias com base no orçamento mensal restante.", examples: ["5000,30", "2000,14"], run: value => { const [limit, days] = numberList(value); return limit > 0 && days > 0 ? `${Math.floor(limit / days)} chamadas/dia` : "Use limite mensal,dias restantes."; } },
  { id: "responsible", name: "Limite responsável", description: "Defina uma stake máxima por percentual da banca.", placeholder: "Banca,percentual por aposta. Ex.: 1000,1", howToUse: "Ajuda a manter disciplina e reduzir a variação de uma sequência ruim.", examples: ["1000,1", "2000,2"], run: value => { const [bankroll, percentage] = numberList(value); return bankroll > 0 && percentage > 0 ? `Stake máxima sugerida: ${money(bankroll * percentage / 100)}` : "Use banca,percentual."; } },
  { id: "share-link", name: "Link de análise", description: "Gere um link local com o texto da análise.", placeholder: "Texto curto da análise", howToUse: "Gera um link local pronto para compartilhar o resumo da análise com outra pessoa.", examples: ["Flamengo + contra vitória", "Valor em Palmeiras"], run: value => { const link = `${window.location.origin}/explore?note=${encodeURIComponent(value)}`; void navigator.clipboard?.writeText(link); return "Link copiado para a área de transferência."; } },
  { id: "offline", name: "Modo offline", description: "Verifique se suas notas locais estão disponíveis.", placeholder: "Digite qualquer coisa para verificar", howToUse: "Confirma se há algum conteúdo salvo localmente no navegador.", examples: ["teste", "qualquer texto"], run: () => localStorage.getItem("sofapredict-match-note") ? "Há uma nota salva offline." : "Nenhuma nota offline salva ainda." },
  { id: "responsible-check", name: "Checklist seguro", description: "Lembrete antes de confirmar uma aposta.", placeholder: "Digite OK para confirmar leitura", howToUse: "Use como checklist final antes de seguir com uma aposta maior.", examples: ["OK", "ok"], run: value => value.trim().toUpperCase() === "OK" ? "Checklist: limite definido, odds conferidas e sem chasing." : "Digite OK após conferir seus limites." },
];

export default function FreeTools() {
  const [selectedId, setSelectedId] = useState(tools[0].id);
  const [input, setInput] = useState("");
  const [result, setResult] = useState("Escolha uma ferramenta e informe os valores.");
  const [isInfoOpen, setIsInfoOpen] = useState(false);
  const selected = useMemo(() => tools.find(tool => tool.id === selectedId) || tools[0], [selectedId]);

  const runTool = () => setResult(selected.run(input));

  return (
    <div className="min-h-screen bg-[#090d16] text-white">
      <header className="border-b border-[#1e293b] bg-[#111827]">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4">
          <Link href="/explore"><Button variant="ghost" className="text-[#94a3b8] hover:text-white"><ArrowLeft size={18} className="mr-2" /> Explorar partidas</Button></Link>
          <div className="flex items-center gap-2 text-sm text-[#10b981]"><ShieldCheck size={16} /> Sem chamadas de API</div>
        </div>
      </header>
      <main className="mx-auto max-w-7xl space-y-6 px-4 py-8">
        <section>
          <p className="mb-2 text-sm font-semibold uppercase tracking-wide text-[#10b981]">Central gratuita</p>
          <h1 className="text-3xl font-bold md:text-4xl">30 ferramentas para analisar melhor</h1>
          <p className="mt-3 max-w-3xl text-[#94a3b8]">Calculadoras e utilidades locais para você testar estratégias sem consumir suas cotas de RapidAPI, BetMiner ou Gemini.</p>
        </section>
        <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
          <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {tools.map(tool => (
              <button key={tool.id} onClick={() => { setSelectedId(tool.id); setResult("Informe os valores e execute a ferramenta."); }} className={`rounded-lg border p-4 text-left transition ${selectedId === tool.id ? "border-[#10b981] bg-[#10251f]" : "border-[#1e293b] bg-[#111827] hover:border-[#10b981]/50"}`}>
                <div className="mb-3 flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2"><Calculator size={17} className="text-[#10b981]" /><strong>{tool.name}</strong></div>
                  <button
                    type="button"
                    onClick={event => {
                      event.stopPropagation();
                      setSelectedId(tool.id);
                      setIsInfoOpen(true);
                    }}
                    className="rounded-full border border-[#1e293b] p-1 text-[#94a3b8] hover:text-white"
                    aria-label={`Informações sobre ${tool.name}`}
                  >
                    <Info size={14} />
                  </button>
                </div>
                <p className="text-sm text-[#94a3b8]">{tool.description}</p>
              </button>
            ))}
          </section>
          <Card className="h-fit border-[#10b981]/30 bg-[#111827] lg:sticky lg:top-6">
            <CardHeader><CardTitle className="flex items-center gap-2 text-white"><Play size={18} className="text-[#10b981]" /> {selected.name}</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-[#94a3b8]">{selected.description}</p>
              <div className="rounded-md border border-[#10b981]/20 bg-[#0c1322] p-3 text-xs text-[#cbd5e1]">
                <p className="mb-1 font-semibold text-[#10b981]">Como usar</p>
                <p>{selected.howToUse}</p>
              </div>
              <input value={input} onChange={event => setInput(event.target.value)} onKeyDown={event => { if (event.key === "Enter") runTool(); }} placeholder={selected.placeholder} className="w-full rounded-md border border-[#334155] bg-[#0c1322] px-3 py-3 text-sm text-white outline-none focus:border-[#10b981]" />
              <Button onClick={runTool} className="w-full bg-[#10b981] text-white hover:bg-[#059669]">Executar</Button>
              <div className="rounded-lg border border-[#1e293b] bg-[#0c1322] p-4 text-sm text-[#cbd5e1]">{result}</div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={() => { void navigator.clipboard?.writeText(result); }}><Copy size={15} className="mr-1" /> Copiar</Button>
                <Button variant="outline" size="sm" onClick={() => { localStorage.setItem("sofapredict-last-tool", `${selected.name}: ${result}`); }}><Star size={15} className="mr-1" /> Salvar</Button>
                <Button variant="outline" size="sm" onClick={() => { const blob = new Blob([result], { type: "text/plain" }); const url = URL.createObjectURL(blob); const link = document.createElement("a"); link.href = url; link.download = "sofapredict-resultado.txt"; link.click(); URL.revokeObjectURL(url); }}><Download size={15} className="mr-1" /> Baixar</Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>

      <Dialog open={isInfoOpen} onOpenChange={setIsInfoOpen}>
        <DialogContent className="max-w-md border-[#1e293b] bg-[#111827] text-white">
          <DialogHeader className="flex items-center justify-between">
            <DialogTitle>{selected.name}</DialogTitle>
            <button type="button" onClick={() => setIsInfoOpen(false)} className="rounded-full border border-[#1e293b] p-1 text-[#94a3b8] hover:text-white" aria-label="Fechar ajuda da ferramenta">
              <X size={16} />
            </button>
          </DialogHeader>
          <div className="space-y-4 text-sm text-[#cbd5e1]">
            <p>{selected.description}</p>
            <div className="rounded-md border border-[#10b981]/20 bg-[#0c1322] p-3">
              <p className="mb-2 font-medium text-[#10b981]">Como usar</p>
              <p>{selected.howToUse}</p>
            </div>
            <div>
              <p className="mb-2 font-medium text-white">Exemplos</p>
              <ul className="list-disc space-y-1 pl-5 text-[#94a3b8]">
                {selected.examples.map(example => (
                  <li key={example}>{example}</li>
                ))}
              </ul>
            </div>
            <Button onClick={() => setIsInfoOpen(false)} className="w-full bg-[#10b981] text-white hover:bg-[#059669]">
              Entendi
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
