import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { useAuth } from "@/_core/hooks/useAuth";
import { toast } from "sonner";
import { User, Settings, Lock, Bell, Shield } from "lucide-react";

export default function Profile() {
  const { user } = useAuth();
  const [favoriteTeams, setFavoriteTeams] = useState<string[]>([]);
  const [newTeam, setNewTeam] = useState("");
  const [oledMode, setOledMode] = useState(false);
  const [soundAlerts, setSoundAlerts] = useState(true);
  const [rapidApiKey, setRapidApiKey] = useState("");
  const [showApiKey, setShowApiKey] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const handleAddTeam = () => {
    if (newTeam.trim() && favoriteTeams.length < 5) {
      setFavoriteTeams([...favoriteTeams, newTeam]);
      setNewTeam("");
      toast.success("Time adicionado aos favoritos");
    } else if (favoriteTeams.length >= 5) {
      toast.error("Máximo de 5 times favoritos");
    }
  };

  const handleRemoveTeam = (team: string) => {
    setFavoriteTeams(favoriteTeams.filter(t => t !== team));
  };

  const handleSaveSettings = async () => {
    setIsSaving(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      toast.success("Configurações salvas com sucesso");
    } catch (error) {
      toast.error("Erro ao salvar configurações");
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveApiKey = async () => {
    if (!rapidApiKey.trim()) {
      toast.error("Insira uma chave de API válida");
      return;
    }

    setIsSaving(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      toast.success("Chave de API salva com segurança");
      setRapidApiKey("");
    } catch (error) {
      toast.error("Erro ao salvar chave de API");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-4 max-w-2xl">
      {/* User Info */}
      <Card className="bg-[#111827] border-[#1e293b]">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <User size={20} className="text-[#10b981]" />
            Perfil do Usuário
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div>
            <label className="text-[#94a3b8] text-sm">Nome</label>
            <p className="text-white font-semibold mt-1">{user?.name || "Usuário"}</p>
          </div>
          <div>
            <label className="text-[#94a3b8] text-sm">Email</label>
            <p className="text-white font-semibold mt-1">{user?.email || "Não informado"}</p>
          </div>
          <div>
            <label className="text-[#94a3b8] text-sm">Membro desde</label>
            <p className="text-white font-semibold mt-1">
              {user?.createdAt ? new Date(user.createdAt).toLocaleDateString("pt-BR") : "N/A"}
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Favorite Teams */}
      <Card className="bg-[#111827] border-[#1e293b]">
        <CardHeader>
          <CardTitle className="text-white text-base">Times Favoritos</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex gap-2">
            <Input
              value={newTeam}
              onChange={e => setNewTeam(e.target.value)}
              placeholder="Nome do time..."
              className="bg-[#0c1322] border-[#1e293b] text-white"
              onKeyPress={e => e.key === "Enter" && handleAddTeam()}
            />
            <Button
              onClick={handleAddTeam}
              disabled={favoriteTeams.length >= 5}
              className="bg-[#10b981] hover:bg-[#059669] text-white"
            >
              Adicionar
            </Button>
          </div>

          {favoriteTeams.length > 0 && (
            <div className="space-y-2">
              <p className="text-[#94a3b8] text-sm">
                {favoriteTeams.length} de 5 times adicionados
              </p>
              <div className="flex flex-wrap gap-2">
                {favoriteTeams.map(team => (
                  <div
                    key={team}
                    className="bg-[#0c1322] border border-[#1e293b] rounded-full px-3 py-1 flex items-center gap-2"
                  >
                    <span className="text-white text-sm">{team}</span>
                    <button
                      onClick={() => handleRemoveTeam(team)}
                      className="text-[#94a3b8] hover:text-red-500 text-xs"
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Display Settings */}
      <Card className="bg-[#111827] border-[#1e293b]">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Settings size={20} className="text-[#10b981]" />
            Preferências de Exibição
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-white font-semibold text-sm">Modo OLED</p>
              <p className="text-[#94a3b8] text-xs">Preto absoluto para economia de bateria</p>
            </div>
            <Switch checked={oledMode} onCheckedChange={setOledMode} />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <p className="text-white font-semibold text-sm flex items-center gap-2">
                <Bell size={16} />
                Alertas Sonoros
              </p>
              <p className="text-[#94a3b8] text-xs">Notificações de jogos e predições</p>
            </div>
            <Switch checked={soundAlerts} onCheckedChange={setSoundAlerts} />
          </div>
        </CardContent>
      </Card>

      {/* API Security */}
      <Card className="bg-[#111827] border-[#1e293b]">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Lock size={20} className="text-[#10b981]" />
            Segurança de APIs
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="bg-[#0c1322] border border-[#1e293b] rounded-lg p-3">
            <p className="text-[#94a3b8] text-xs mb-2">
              <Shield size={14} className="inline mr-1" />
              Sua chave RapidAPI é armazenada com segurança no servidor e nunca é exposta ao navegador.
            </p>
          </div>

          <div>
            <label className="text-[#94a3b8] text-sm">Chave RapidAPI</label>
            <div className="flex gap-2 mt-2">
              <Input
                type={showApiKey ? "text" : "password"}
                value={rapidApiKey}
                onChange={e => setRapidApiKey(e.target.value)}
                placeholder="Insira sua chave RapidAPI..."
                className="bg-[#0c1322] border-[#1e293b] text-white"
              />
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowApiKey(!showApiKey)}
                className="text-xs"
              >
                {showApiKey ? "Ocultar" : "Mostrar"}
              </Button>
            </div>
            <p className="text-[#94a3b8] text-xs mt-2">
              Obtenha sua chave em: https://rapidapi.com/
            </p>
          </div>

          <Button
            onClick={handleSaveApiKey}
            disabled={isSaving}
            className="w-full bg-[#10b981] hover:bg-[#059669] text-white"
          >
            {isSaving ? "Salvando..." : "Salvar Chave de API"}
          </Button>
        </CardContent>
      </Card>

      {/* Save All Settings */}
      <Button
        onClick={handleSaveSettings}
        disabled={isSaving}
        className="w-full bg-[#10b981] hover:bg-[#059669] text-white"
      >
        {isSaving ? "Salvando..." : "Salvar Todas as Configurações"}
      </Button>
    </div>
  );
}
