import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { X, Filter } from "lucide-react";

export interface MatchFiltersState {
  league: string;
  minConfidence: number;
  maxOdds: number;
  minOdds: number;
  sortBy: "confidence" | "odds" | "time";
  searchTeam: string;
}

interface MatchFiltersProps {
  onFiltersChange?: (filters: MatchFiltersState) => void;
  onReset?: () => void;
}

const LEAGUES = [
  { value: "all", label: "Todas as Ligas" },
  { value: "brasileirao", label: "Brasileirão" },
  { value: "premier-league", label: "Premier League" },
  { value: "la-liga", label: "La Liga" },
  { value: "serie-a", label: "Serie A" },
  { value: "ligue-1", label: "Ligue 1" },
  { value: "champions", label: "Champions League" },
  { value: "europa-league", label: "Europa League" },
];

export default function MatchFilters({ onFiltersChange, onReset }: MatchFiltersProps) {
  const [filters, setFilters] = useState<MatchFiltersState>({
    league: "all",
    minConfidence: 0,
    maxOdds: 10,
    minOdds: 1,
    sortBy: "confidence",
    searchTeam: "",
  });

  const [isExpanded, setIsExpanded] = useState(false);

  const handleFilterChange = (key: keyof MatchFiltersState, value: any) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    onFiltersChange?.(newFilters);
  };

  const handleReset = () => {
    const defaultFilters: MatchFiltersState = {
      league: "all",
      minConfidence: 0,
      maxOdds: 10,
      minOdds: 1,
      sortBy: "confidence",
      searchTeam: "",
    };
    setFilters(defaultFilters);
    onReset?.();
    onFiltersChange?.(defaultFilters);
  };

  return (
    <Card className="bg-[#111827] border-[#1e293b]">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Filter size={20} className="text-[#10b981]" />
            <CardTitle className="text-white">Filtros e Ordenação</CardTitle>
          </div>
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-1 hover:bg-[#1e293b] rounded transition"
          >
            {isExpanded ? <X size={20} /> : <Filter size={20} />}
          </button>
        </div>
      </CardHeader>

      {isExpanded && (
        <CardContent className="space-y-6">
          {/* Search by Team */}
          <div className="space-y-2">
            <Label className="text-white">Buscar por Time</Label>
            <Input
              placeholder="Ex: Flamengo, Manchester City..."
              value={filters.searchTeam}
              onChange={(e) => handleFilterChange("searchTeam", e.target.value)}
              className="bg-[#0c1322] border-[#1e293b] text-white placeholder:text-[#64748b]"
            />
          </div>

          {/* League Filter */}
          <div className="space-y-2">
            <Label className="text-white">Liga</Label>
            <Select value={filters.league} onValueChange={(value) => handleFilterChange("league", value)}>
              <SelectTrigger className="bg-[#0c1322] border-[#1e293b] text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-[#111827] border-[#1e293b]">
                {LEAGUES.map((league) => (
                  <SelectItem key={league.value} value={league.value} className="text-white">
                    {league.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Confidence Level */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label className="text-white">Confiança Mínima da IA</Label>
              <span className="text-[#10b981] font-semibold">{filters.minConfidence}%</span>
            </div>
            <Slider
              value={[filters.minConfidence]}
              onValueChange={(value) => handleFilterChange("minConfidence", value[0])}
              min={0}
              max={100}
              step={5}
              className="w-full"
            />
            <div className="flex gap-2 text-xs text-[#64748b]">
              <span>Baixa</span>
              <span className="flex-1"></span>
              <span>Alta</span>
            </div>
          </div>

          {/* Odds Range */}
          <div className="space-y-3">
            <Label className="text-white">Intervalo de Odds</Label>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label className="text-xs text-[#94a3b8]">Mínima</Label>
                <Input
                  type="number"
                  min="1"
                  max={filters.maxOdds}
                  step="0.1"
                  value={filters.minOdds}
                  onChange={(e) => handleFilterChange("minOdds", parseFloat(e.target.value))}
                  className="bg-[#0c1322] border-[#1e293b] text-white"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-xs text-[#94a3b8]">Máxima</Label>
                <Input
                  type="number"
                  min={filters.minOdds}
                  max="20"
                  step="0.1"
                  value={filters.maxOdds}
                  onChange={(e) => handleFilterChange("maxOdds", parseFloat(e.target.value))}
                  className="bg-[#0c1322] border-[#1e293b] text-white"
                />
              </div>
            </div>
          </div>

          {/* Sort By */}
          <div className="space-y-2">
            <Label className="text-white">Ordenar Por</Label>
            <Select value={filters.sortBy} onValueChange={(value: any) => handleFilterChange("sortBy", value)}>
              <SelectTrigger className="bg-[#0c1322] border-[#1e293b] text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-[#111827] border-[#1e293b]">
                <SelectItem value="confidence" className="text-white">
                  🤖 Maior Confiança
                </SelectItem>
                <SelectItem value="odds" className="text-white">
                  📊 Melhores Odds
                </SelectItem>
                <SelectItem value="time" className="text-white">
                  ⏰ Próximas a Começar
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2 pt-4">
            <Button
              onClick={handleReset}
              variant="outline"
              className="flex-1 border-[#1e293b] text-[#94a3b8] hover:bg-[#1e293b]"
            >
              Limpar Filtros
            </Button>
            <Button
              onClick={() => setIsExpanded(false)}
              className="flex-1 bg-[#10b981] hover:bg-[#059669] text-white"
            >
              Aplicar
            </Button>
          </div>
        </CardContent>
      )}
    </Card>
  );
}
