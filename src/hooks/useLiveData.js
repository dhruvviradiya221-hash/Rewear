import { useCallback, useEffect, useRef, useState } from 'react';
import { api, subscribeToUpdates } from '../api/client';

const POLL_MS = 15000;

export function useLiveData(fetcher, deps = []) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [lastUpdated, setLastUpdated] = useState(null);
  const versionRef = useRef(null);
  const fetcherRef = useRef(fetcher);

  fetcherRef.current = fetcher;

  const load = useCallback(async (silent = false) => {
    if (!silent) setLoading(true);
    setError('');
    try {
      const result = await fetcherRef.current();
      setData(result);
      setLastUpdated(new Date());
      const sync = await api.sync().catch(() => null);
      if (sync?.version) versionRef.current = sync.version;
    } catch (e) {
      setError(e.message || 'Failed to load data');
    } finally {
      if (!silent) setLoading(false);
    }
  }, []);

  const refresh = useCallback(() => load(false), [load]);

  useEffect(() => {
    load(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  useEffect(() => {
    const unsubscribe = subscribeToUpdates((payload) => {
      if (payload?.version && payload.version !== versionRef.current) {
        versionRef.current = payload.version;
        load(true);
      }
    });

    const pollId = setInterval(async () => {
      try {
        const sync = await api.sync();
        if (sync?.version && sync.version !== versionRef.current) {
          versionRef.current = sync.version;
          load(true);
        }
      } catch {
        /* backend may be restarting */
      }
    }, POLL_MS);

    const onFocus = () => load(true);
    window.addEventListener('focus', onFocus);
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'visible') load(true);
    });

    return () => {
      unsubscribe();
      clearInterval(pollId);
      window.removeEventListener('focus', onFocus);
    };
  }, [load]);

  return { data, loading, error, lastUpdated, refresh, setData };
}
