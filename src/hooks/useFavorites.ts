import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';

interface FavoriteItem {
  id: number;
  type: 'video' | 'article';
  timestamp: number;
}

export const useFavorites = () => {
  const [favorites, setFavorites] = useState<FavoriteItem[]>([]);
  const { toast } = useToast();

  // Load favorites from localStorage on mount
  useEffect(() => {
    const savedFavorites = localStorage.getItem('pregnancy-app-favorites');
    if (savedFavorites) {
      try {
        setFavorites(JSON.parse(savedFavorites));
      } catch (error) {
        console.error('Error loading favorites:', error);
      }
    }
  }, []);

  // Save favorites to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('pregnancy-app-favorites', JSON.stringify(favorites));
  }, [favorites]);

  const addToFavorites = (id: number, type: 'video' | 'article') => {
    const existingFavorite = favorites.find(fav => fav.id === id && fav.type === type);
    
    if (existingFavorite) {
      toast({
        title: "مُضاف مسبقاً",
        description: "هذا العنصر موجود في المفضلة بالفعل",
        variant: "default"
      });
      return;
    }

    const newFavorite: FavoriteItem = {
      id,
      type,
      timestamp: Date.now()
    };

    setFavorites(prev => [newFavorite, ...prev]);
    
    toast({
      title: "تمت الإضافة للمفضلة ❤️",
      description: type === 'video' ? "تم إضافة الفيديو للمفضلة" : "تم إضافة المقال للمفضلة",
    });
  };

  const removeFromFavorites = (id: number, type: 'video' | 'article') => {
    setFavorites(prev => prev.filter(fav => !(fav.id === id && fav.type === type)));
    
    toast({
      title: "تم الحذف من المفضلة",
      description: type === 'video' ? "تم حذف الفيديو من المفضلة" : "تم حذف المقال من المفضلة",
    });
  };

  const isFavorite = (id: number, type: 'video' | 'article') => {
    return favorites.some(fav => fav.id === id && fav.type === type);
  };

  const toggleFavorite = (id: number, type: 'video' | 'article') => {
    if (isFavorite(id, type)) {
      removeFromFavorites(id, type);
    } else {
      addToFavorites(id, type);
    }
  };

  const getFavoriteVideos = () => {
    return favorites.filter(fav => fav.type === 'video').map(fav => fav.id);
  };

  const getFavoriteArticles = () => {
    return favorites.filter(fav => fav.type === 'article').map(fav => fav.id);
  };

  return {
    favorites,
    addToFavorites,
    removeFromFavorites,
    isFavorite,
    toggleFavorite,
    getFavoriteVideos,
    getFavoriteArticles,
    favoritesCount: favorites.length
  };
};