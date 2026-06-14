import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { useAuth } from './AuthContext';
import type { SubsonicSong } from '../types/subsonic';

interface FavoritesContextValue {
  favoriteSongs: SubsonicSong[];
  loading: boolean;
  isFavorite: (id: string) => boolean;
  toggleFavorite: (song: SubsonicSong) => Promise<void>;
  refetch: () => void;
}

const FavoritesContext = createContext<FavoritesContextValue | undefined>(undefined);

export function FavoritesProvider({ children }: { children: React.ReactNode }) {
  const { client } = useAuth();
  const [favoriteSongs, setFavoriteSongs] = useState<SubsonicSong[]>([]);
  const [loading, setLoading] = useState(true);
  const [reloadToken, setReloadToken] = useState(0);

  const refetch = useCallback(() => setReloadToken((token) => token + 1), []);

  useEffect(() => {
    if (!client) {
      setFavoriteSongs([]);
      setLoading(false);
      return;
    }

    let cancelled = false;
    setLoading(true);

    client
      .getStarred2()
      .then((result) => {
        if (!cancelled) setFavoriteSongs(result.song ?? []);
      })
      .catch(() => {
        if (!cancelled) setFavoriteSongs([]);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [client, reloadToken]);

  const isFavorite = useCallback(
    (id: string) => favoriteSongs.some((song) => song.id === id),
    [favoriteSongs]
  );

  const toggleFavorite = useCallback(
    async (song: SubsonicSong) => {
      if (!client) return;

      if (isFavorite(song.id)) {
        setFavoriteSongs((prev) => prev.filter((s) => s.id !== song.id));
        try {
          await client.unstar(song.id);
        } catch {
          setFavoriteSongs((prev) => [...prev, song]);
        }
      } else {
        setFavoriteSongs((prev) => [...prev, song]);
        try {
          await client.star(song.id);
        } catch {
          setFavoriteSongs((prev) => prev.filter((s) => s.id !== song.id));
        }
      }
    },
    [client, isFavorite]
  );

  const value = useMemo<FavoritesContextValue>(
    () => ({ favoriteSongs, loading, isFavorite, toggleFavorite, refetch }),
    [favoriteSongs, loading, isFavorite, toggleFavorite, refetch]
  );

  return <FavoritesContext.Provider value={value}>{children}</FavoritesContext.Provider>;
}

export function useFavorites(): FavoritesContextValue {
  const context = useContext(FavoritesContext);
  if (!context) {
    throw new Error('useFavorites debe usarse dentro de FavoritesProvider');
  }
  return context;
}
