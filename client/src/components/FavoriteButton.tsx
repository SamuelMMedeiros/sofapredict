import { Heart } from "lucide-react";
import { Button } from "@/components/ui/button";

interface FavoriteButtonProps {
  isFavorite: boolean;
  onToggle: () => void;
  size?: "sm" | "md" | "lg";
  variant?: "default" | "outline";
}

export default function FavoriteButton({
  isFavorite,
  onToggle,
  size = "md",
  variant = "default",
}: FavoriteButtonProps) {
  const sizeClasses = {
    sm: "p-1",
    md: "p-2",
    lg: "p-3",
  };

  const iconSizes = {
    sm: 16,
    md: 20,
    lg: 24,
  };

  return (
    <Button
      onClick={onToggle}
      className={`${sizeClasses[size]} ${
        isFavorite
          ? "bg-[#ef4444] hover:bg-[#dc2626] text-white"
          : "bg-[#1e293b] hover:bg-[#334155] text-[#94a3b8]"
      } transition-colors`}
      title={isFavorite ? "Remover dos favoritos" : "Adicionar aos favoritos"}
    >
      <Heart
        size={iconSizes[size]}
        fill={isFavorite ? "currentColor" : "none"}
      />
    </Button>
  );
}
