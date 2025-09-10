import { Button } from "@/components/ui/button";
import { Heart } from "lucide-react";

interface FavoritesFilterProps {
  showFavoritesOnly: boolean;
  onToggle: () => void;
  favoritesCount: number;
}

export const FavoritesFilter = ({ 
  showFavoritesOnly, 
  onToggle, 
  favoritesCount 
}: FavoritesFilterProps) => {
  return (
    <Button
      variant={showFavoritesOnly ? "default" : "outline"}
      onClick={onToggle}
      className="flex items-center gap-2"
      size="sm"
    >
      <Heart className={`w-4 h-4 ${showFavoritesOnly ? 'fill-current' : ''}`} />
      {showFavoritesOnly ? `المفضلة (${favoritesCount})` : 'عرض المفضلة'}
    </Button>
  );
};