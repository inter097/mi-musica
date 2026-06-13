import * as SecureStore from 'expo-secure-store';
import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { SubsonicClient } from '../api/subsonic';
import type { SubsonicCredentials } from '../types/subsonic';

const CREDENTIALS_KEY = 'mi_musica_credentials';

interface AuthContextValue {
  client: SubsonicClient | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (serverUrl: string, username: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

function normalizeServerUrl(url: string): string {
  let normalized = url.trim().replace(/\/+$/, '');
  if (!/^https?:\/\//i.test(normalized)) {
    normalized = `https://${normalized}`;
  }
  return normalized;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [client, setClient] = useState<SubsonicClient | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const stored = await SecureStore.getItemAsync(CREDENTIALS_KEY);
        if (stored) {
          const credentials: SubsonicCredentials = JSON.parse(stored);
          const newClient = new SubsonicClient(
            credentials.serverUrl,
            credentials.username,
            credentials.password
          );
          await newClient.ping();
          setClient(newClient);
        }
      } catch {
        await SecureStore.deleteItemAsync(CREDENTIALS_KEY);
      } finally {
        setIsLoading(false);
      }
    })();
  }, []);

  const login = useCallback(async (serverUrl: string, username: string, password: string) => {
    const normalizedUrl = normalizeServerUrl(serverUrl);
    const newClient = new SubsonicClient(normalizedUrl, username, password);
    await newClient.ping();

    const credentials: SubsonicCredentials = { serverUrl: normalizedUrl, username, password };
    await SecureStore.setItemAsync(CREDENTIALS_KEY, JSON.stringify(credentials));
    setClient(newClient);
  }, []);

  const logout = useCallback(async () => {
    await SecureStore.deleteItemAsync(CREDENTIALS_KEY);
    setClient(null);
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({ client, isLoading, isAuthenticated: client !== null, login, logout }),
    [client, isLoading, login, logout]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth debe usarse dentro de AuthProvider');
  }
  return context;
}
