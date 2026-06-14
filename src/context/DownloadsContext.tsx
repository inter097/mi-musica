import { Directory, File, Paths } from 'expo-file-system';
import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { useAuth } from './AuthContext';
import type { SubsonicSong } from '../types/subsonic';

export interface DownloadedSong {
  id: string;
  title: string;
  artist?: string;
  album?: string;
  coverArt?: string;
  duration?: number;
  localUri: string;
}

interface DownloadsContextValue {
  downloads: DownloadedSong[];
  downloadingIds: Set<string>;
  progress: Record<string, number>;
  isDownloaded: (id: string) => boolean;
  getLocalUri: (id: string) => string | undefined;
  download: (song: SubsonicSong) => Promise<void>;
  remove: (id: string) => Promise<void>;
}

const DownloadsContext = createContext<DownloadsContextValue | undefined>(undefined);

const DOWNLOADS_DIR_NAME = 'downloads';
const MANIFEST_NAME = 'downloads.json';

function getDownloadsDir(): Directory {
  return new Directory(Paths.document, DOWNLOADS_DIR_NAME);
}

function getManifestFile(): File {
  return new File(Paths.document, MANIFEST_NAME);
}

function readManifest(): DownloadedSong[] {
  const file = getManifestFile();
  if (!file.exists) return [];
  try {
    return JSON.parse(file.textSync()) as DownloadedSong[];
  } catch {
    return [];
  }
}

function writeManifest(downloads: DownloadedSong[]) {
  getManifestFile().write(JSON.stringify(downloads));
}

export function DownloadsProvider({ children }: { children: React.ReactNode }) {
  const { client } = useAuth();
  const [downloads, setDownloads] = useState<DownloadedSong[]>([]);
  const [downloadingIds, setDownloadingIds] = useState<Set<string>>(new Set());
  const [progress, setProgress] = useState<Record<string, number>>({});

  useEffect(() => {
    setDownloads(readManifest());
  }, []);

  const isDownloaded = useCallback((id: string) => downloads.some((d) => d.id === id), [downloads]);

  const getLocalUri = useCallback(
    (id: string) => downloads.find((d) => d.id === id)?.localUri,
    [downloads]
  );

  const download = useCallback(
    async (song: SubsonicSong) => {
      if (!client) return;
      if (isDownloaded(song.id) || downloadingIds.has(song.id)) return;

      setDownloadingIds((prev) => new Set(prev).add(song.id));
      setProgress((prev) => ({ ...prev, [song.id]: 0 }));

      try {
        const dir = getDownloadsDir();
        if (!dir.exists) dir.create();

        const extension = song.suffix ?? 'mp3';
        const destination = new File(dir, `${song.id}.${extension}`);
        const url = client.getStreamUrl(song.id);

        const file = await File.downloadFileAsync(url, destination, {
          idempotent: true,
          onProgress: ({ bytesWritten, totalBytes }) => {
            if (totalBytes > 0) {
              setProgress((prev) => ({ ...prev, [song.id]: bytesWritten / totalBytes }));
            }
          },
        });

        const entry: DownloadedSong = {
          id: song.id,
          title: song.title,
          artist: song.artist,
          album: song.album,
          coverArt: song.coverArt,
          duration: song.duration,
          localUri: file.uri,
        };

        setDownloads((prev) => {
          const next = [...prev, entry];
          writeManifest(next);
          return next;
        });
      } finally {
        setDownloadingIds((prev) => {
          const next = new Set(prev);
          next.delete(song.id);
          return next;
        });
        setProgress((prev) => {
          const next = { ...prev };
          delete next[song.id];
          return next;
        });
      }
    },
    [client, isDownloaded, downloadingIds]
  );

  const remove = useCallback(
    async (id: string) => {
      const entry = downloads.find((d) => d.id === id);
      if (entry) {
        try {
          const file = new File(entry.localUri);
          if (file.exists) file.delete();
        } catch {
          // El archivo ya no existe en disco; igual lo quitamos del manifiesto.
        }
      }

      setDownloads((prev) => {
        const next = prev.filter((d) => d.id !== id);
        writeManifest(next);
        return next;
      });
    },
    [downloads]
  );

  const value = useMemo<DownloadsContextValue>(
    () => ({ downloads, downloadingIds, progress, isDownloaded, getLocalUri, download, remove }),
    [downloads, downloadingIds, progress, isDownloaded, getLocalUri, download, remove]
  );

  return <DownloadsContext.Provider value={value}>{children}</DownloadsContext.Provider>;
}

export function useDownloads(): DownloadsContextValue {
  const context = useContext(DownloadsContext);
  if (!context) {
    throw new Error('useDownloads debe usarse dentro de DownloadsProvider');
  }
  return context;
}
