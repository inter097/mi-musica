import React, { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import { PermissionsAndroid, Platform } from 'react-native';
import TrackPlayer, {
  AppKilledPlaybackBehavior,
  Capability,
  type Track,
} from 'react-native-track-player';

interface PlayerContextValue {
  isReady: boolean;
  playQueue: (tracks: Track[], startIndex?: number) => Promise<void>;
}

const PlayerContext = createContext<PlayerContextValue | undefined>(undefined);

async function requestNotificationPermission() {
  if (Platform.OS === 'android' && Platform.Version >= 33) {
    try {
      await PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS);
    } catch {
      // Ignorar si no se puede solicitar el permiso
    }
  }
}

export function PlayerProvider({ children }: { children: React.ReactNode }) {
  const [isReady, setIsReady] = useState(false);
  const setupStarted = useRef(false);

  useEffect(() => {
    if (setupStarted.current) return;
    setupStarted.current = true;

    (async () => {
      await requestNotificationPermission();
      await TrackPlayer.setupPlayer({ minBuffer: 30, maxBuffer: 60 });
      await TrackPlayer.updateOptions({
        android: {
          appKilledPlaybackBehavior: AppKilledPlaybackBehavior.ContinuePlayback,
        },
        capabilities: [
          Capability.Play,
          Capability.Pause,
          Capability.SkipToNext,
          Capability.SkipToPrevious,
          Capability.SeekTo,
          Capability.Stop,
        ],
        compactCapabilities: [Capability.Play, Capability.Pause, Capability.SkipToNext],
        notificationCapabilities: [
          Capability.Play,
          Capability.Pause,
          Capability.SkipToNext,
          Capability.SkipToPrevious,
        ],
        progressUpdateEventInterval: 2,
      });
      setIsReady(true);
    })();
  }, []);

  const playQueue = useCallback(async (tracks: Track[], startIndex = 0) => {
    await TrackPlayer.reset();
    await TrackPlayer.add(tracks);
    await TrackPlayer.skip(startIndex);
    await TrackPlayer.play();
  }, []);

  return <PlayerContext.Provider value={{ isReady, playQueue }}>{children}</PlayerContext.Provider>;
}

export function usePlayer(): PlayerContextValue {
  const context = useContext(PlayerContext);
  if (!context) {
    throw new Error('usePlayer debe usarse dentro de PlayerProvider');
  }
  return context;
}
