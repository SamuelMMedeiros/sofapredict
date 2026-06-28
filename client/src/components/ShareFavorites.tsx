import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Share2, Copy, MessageCircle, Check } from "lucide-react";
import { toast } from "sonner";

interface ShareFavoritesProps {
  favoriteTeams: Array<{ id: string; name: string; league?: string }>;
  favoriteMatches: Array<{ id: number | string; homeTeam: string; awayTeam: string; league?: string }>;
}

export default function ShareFavorites({ favoriteTeams, favoriteMatches }: ShareFavoritesProps) {
  const [copied, setCopied] = useState(false);

  const generateShareText = () => {
    let text = "🎯 Meus Favoritos no SofaPredict:\n\n";

    if (favoriteTeams.length > 0) {
      text += "⚽ Times Favoritos:\n";
      favoriteTeams.forEach((team) => {
        text += `• ${team.name} (${team.league || "Liga"})\n`;
      });
      text += "\n";
    }

    if (favoriteMatches.length > 0) {
      text += "🏆 Partidas Favoritas:\n";
      favoriteMatches.forEach((match) => {
        text += `• ${match.homeTeam} vs ${match.awayTeam}\n`;
      });
      text += "\n";
    }

    text += `Confira em: ${window.location.origin}/explore`;
    return text;
  };

  const shareText = generateShareText();

  const handleCopyLink = () => {
    const shareUrl = `${window.location.origin}/favorites`;
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    toast.success("Link copiado para a área de transferência!");
    setTimeout(() => setCopied(false), 2000);
  };

  const handleShareWhatsApp = () => {
    const encodedText = encodeURIComponent(shareText);
    const whatsappUrl = `https://wa.me/?text=${encodedText}`;
    window.open(whatsappUrl, "_blank");
    toast.success("Abrindo WhatsApp...");
  };

  const handleShareTwitter = () => {
    const encodedText = encodeURIComponent(shareText);
    const twitterUrl = `https://twitter.com/intent/tweet?text=${encodedText}`;
    window.open(twitterUrl, "_blank");
    toast.success("Abrindo Twitter...");
  };

  const totalFavorites = favoriteTeams.length + favoriteMatches.length;

  if (totalFavorites === 0) {
    return null;
  }

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button className="bg-[#10b981] hover:bg-[#059669] text-white gap-2">
          <Share2 size={18} />
          Compartilhar
        </Button>
      </DialogTrigger>
      <DialogContent className="bg-[#111827] border-[#1e293b] text-white">
        <DialogHeader>
          <DialogTitle>Compartilhar Favoritos</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Preview */}
          <div className="bg-[#0c1322] rounded p-4 text-sm text-[#94a3b8] max-h-48 overflow-y-auto">
            <pre className="whitespace-pre-wrap break-words font-sans text-xs">{shareText}</pre>
          </div>

          {/* Share Buttons */}
          <div className="grid grid-cols-2 gap-3">
            {/* Copy Link */}
            <Button
              onClick={handleCopyLink}
              className="bg-[#1e293b] hover:bg-[#334155] text-white gap-2"
            >
              {copied ? <Check size={18} /> : <Copy size={18} />}
              {copied ? "Copiado!" : "Copiar Link"}
            </Button>

            {/* WhatsApp */}
            <Button
              onClick={handleShareWhatsApp}
              className="bg-[#25d366] hover:bg-[#1fad50] text-white gap-2"
            >
              <MessageCircle size={18} />
              WhatsApp
            </Button>

            {/* Twitter */}
            <Button
              onClick={handleShareTwitter}
              className="bg-[#1da1f2] hover:bg-[#1a91da] text-white gap-2 col-span-2"
            >
              <Share2 size={18} />
              Twitter/X
            </Button>
          </div>

          {/* Stats */}
          <div className="bg-[#0c1322] rounded p-3 text-sm">
            <p className="text-[#64748b]">
              Você está compartilhando {favoriteTeams.length} time(s) e {favoriteMatches.length} partida(s)
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
