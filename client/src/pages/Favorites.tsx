import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, Trash2, Heart, Search } from "lucide-react";
import { Link } from "wouter";
import { useFavorites } from "@/hooks/useFavorites";
import FavoriteButton from "@/components/FavoriteButton";

export default function Favorites() {
  const { favoriteTeams, favoriteMatches, removeFavoriteTeam, removeFavoriteMatch, isFavoriteMatch } = useFavorites();
  const [searchTeam, setSearchTeam] = useState("");
  const [searchMatch, setSearchMatch] = useState("");
  const [sortBy, setSortBy] = useState<"name" | "league">("name");

  // Filter teams
  const filteredTeams = favoriteTeams
    .filter((team) => team.name.toLowerCase().includes(searchTeam.toLowerCase()))
    .sort((a, b) => {
      if (sortBy === "name") {
        return a.name.localeCompare(b.name);
      }
      return a.league.localeCompare(b.league);
    });

  // Filter matches
  const filteredMatches = favoriteMatches
    .filter(
      (match) =>
        match.homeTeam.toLowerCase().includes(searchMatch.toLowerCase()) ||
        match.awayTeam.toLowerCase().includes(searchMatch.toLowerCase()) ||
        match.league.toLowerCase().includes(searchMatch.toLowerCase())
    )
    .sort((a, b) => new Date(a.time).getTime() - new Date(b.time).getTime());

  return (
    <div className="min-h-screen bg-[#090d16]">
      {/* Header */}
      <header className="border-b border-[#1e293b] bg-[#111827] sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/explore">
              <Button variant="ghost" size="icon" className="text-[#94a3b8] hover:text-white">
                <ArrowLeft size={20} />
              </Button>
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-white">Meus Favoritos</h1>
              <p className="text-sm text-[#64748b]">
                {favoriteTeams.length} times e {favoriteMatches.length} partidas salvos
              </p>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        <Tabs defaultValue="teams" className="w-full">
          <TabsList className="bg-[#111827] border border-[#1e293b]">
            <TabsTrigger value="teams" className="text-[#94a3b8] data-[state=active]:text-white">
              Times Favoritos ({favoriteTeams.length})
            </TabsTrigger>
            <TabsTrigger value="matches" className="text-[#94a3b8] data-[state=active]:text-white">
              Partidas Favoritas ({favoriteMatches.length})
            </TabsTrigger>
          </TabsList>

          {/* Teams Tab */}
          <TabsContent value="teams" className="space-y-6 mt-6">
            {favoriteTeams.length === 0 ? (
              <Card className="bg-[#111827] border-[#1e293b]">
                <CardContent className="py-12 text-center">
                  <Heart className="mx-auto mb-4 text-[#64748b]" size={48} />
                  <p className="text-[#94a3b8] text-lg">Nenhum time favorito ainda</p>
                  <p className="text-[#64748b] text-sm mt-2">Adicione times aos favoritos para acompanhá-los</p>
                  <Link href="/explore">
                    <Button className="mt-4 bg-[#10b981] hover:bg-[#059669] text-white">
                      Explorar Times
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            ) : (
              <>
                {/* Search and Sort */}
                <div className="flex gap-4 flex-col md:flex-row">
                  <div className="flex-1 relative">
                    <Search className="absolute left-3 top-3 text-[#64748b]" size={18} />
                    <Input
                      placeholder="Buscar time..."
                      value={searchTeam}
                      onChange={(e) => setSearchTeam(e.target.value)}
                      className="pl-10 bg-[#111827] border-[#1e293b] text-white placeholder-[#64748b]"
                    />
                  </div>
                  <Select value={sortBy} onValueChange={(value) => setSortBy(value as "name" | "league")}>
                    <SelectTrigger className="w-full md:w-48 bg-[#111827] border-[#1e293b] text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-[#111827] border-[#1e293b]">
                      <SelectItem value="name" className="text-white">
                        Ordenar por Nome
                      </SelectItem>
                      <SelectItem value="league" className="text-white">
                        Ordenar por Liga
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Teams Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filteredTeams.map((team) => (
                    <Card key={team.id} className="bg-[#111827] border-[#1e293b] hover:border-[#10b981] transition">
                      <CardHeader>
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <CardTitle className="text-white">{team.name}</CardTitle>
                            <p className="text-sm text-[#94a3b8] mt-1">{team.league}</p>
                          </div>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => removeFavoriteTeam(team.id)}
                            className="text-[#ef4444] hover:bg-[#ef4444]/10"
                          >
                            <Trash2 size={18} />
                          </Button>
                        </div>
                      </CardHeader>
                    </Card>
                  ))}
                </div>

                {filteredTeams.length === 0 && (
                  <Card className="bg-[#111827] border-[#1e293b]">
                    <CardContent className="py-8 text-center">
                      <p className="text-[#94a3b8]">Nenhum time encontrado com "{searchTeam}"</p>
                    </CardContent>
                  </Card>
                )}
              </>
            )}
          </TabsContent>

          {/* Matches Tab */}
          <TabsContent value="matches" className="space-y-6 mt-6">
            {favoriteMatches.length === 0 ? (
              <Card className="bg-[#111827] border-[#1e293b]">
                <CardContent className="py-12 text-center">
                  <Heart className="mx-auto mb-4 text-[#64748b]" size={48} />
                  <p className="text-[#94a3b8] text-lg">Nenhuma partida favorita ainda</p>
                  <p className="text-[#64748b] text-sm mt-2">Adicione partidas aos favoritos para acompanhá-las</p>
                  <Link href="/explore">
                    <Button className="mt-4 bg-[#10b981] hover:bg-[#059669] text-white">
                      Explorar Partidas
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            ) : (
              <>
                {/* Search */}
                <div className="relative">
                  <Search className="absolute left-3 top-3 text-[#64748b]" size={18} />
                  <Input
                    placeholder="Buscar partida por time ou liga..."
                    value={searchMatch}
                    onChange={(e) => setSearchMatch(e.target.value)}
                    className="pl-10 bg-[#111827] border-[#1e293b] text-white placeholder-[#64748b]"
                  />
                </div>

                {/* Matches List */}
                <div className="space-y-4">
                  {filteredMatches.map((match) => (
                    <Card key={match.id} className="bg-[#111827] border-[#1e293b] hover:border-[#10b981] transition">
                      <CardHeader>
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <CardTitle className="text-white">
                              {match.homeTeam} vs {match.awayTeam}
                            </CardTitle>
                            <p className="text-sm text-[#94a3b8] mt-1">
                              {match.league} • {match.time}
                            </p>
                          </div>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => removeFavoriteMatch(match.id)}
                            className="text-[#ef4444] hover:bg-[#ef4444]/10"
                          >
                            <Trash2 size={18} />
                          </Button>
                        </div>
                      </CardHeader>
                    </Card>
                  ))}
                </div>

                {filteredMatches.length === 0 && (
                  <Card className="bg-[#111827] border-[#1e293b]">
                    <CardContent className="py-8 text-center">
                      <p className="text-[#94a3b8]">Nenhuma partida encontrada com "{searchMatch}"</p>
                    </CardContent>
                  </Card>
                )}
              </>
            )}
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
