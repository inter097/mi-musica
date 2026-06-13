import { useCallback, useEffect, useState } from 'react';
import type { SubsonicClient } from '../api/subsonic';
import { useAuth } from '../context/AuthContext';

interface QueryState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
}

/** Runs a Subsonic API call against the authenticated client and tracks loading/error state. */
export function useSubsonicQuery<T>(
  fetcher: (client: SubsonicClient) => Promise<T>,
  deps: React.DependencyList = []
): QueryState<T> & { refetch: () => void } {
  const { client } = useAuth();
  const [state, setState] = useState<QueryState<T>>({ data: null, loading: true, error: null });
  const [reloadToken, setReloadToken] = useState(0);

  const refetch = useCallback(() => setReloadToken((token) => token + 1), []);

  useEffect(() => {
    if (!client) return;
    let cancelled = false;

    setState((prev) => ({ ...prev, loading: true, error: null }));

    fetcher(client)
      .then((data) => {
        if (!cancelled) setState({ data, loading: false, error: null });
      })
      .catch((error: unknown) => {
        if (!cancelled) {
          setState({
            data: null,
            loading: false,
            error: error instanceof Error ? error.message : 'Error desconocido',
          });
        }
      });

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [client, reloadToken, ...deps]);

  return { ...state, refetch };
}
