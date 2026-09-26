import { useState, useEffect, useCallback, useRef } from 'react';
import type { SearchCatalog } from './homeSearchMatcher';

let _catalogCache: SearchCatalog | null = null;
let _catalogPromise: Promise<SearchCatalog | null> | null = null;

const getBaseUrl = (): string => {
  if (typeof import.meta !== 'undefined' && import.meta.env?.BASE_URL) {
    return import.meta.env.BASE_URL.endsWith('/')
      ? import.meta.env.BASE_URL
      : `${import.meta.env.BASE_URL}/`;
  }
  return '/';
};

export async function fetchSearchCatalog(): Promise<SearchCatalog | null> {
  if (_catalogCache) {
    return _catalogCache;
  }

  if (_catalogPromise) {
    return _catalogPromise;
  }

  _catalogPromise = (async () => {
    try {
      const baseUrl = getBaseUrl();
      const response = await fetch(`${baseUrl}homepage-search-catalog.json`, {
        headers: { Accept: 'application/json' },
      });

      if (!response.ok) {
        throw new Error(`Failed to load search catalog: HTTP ${response.status}`);
      }

      const data: SearchCatalog = await response.json();
      _catalogCache = data;
      return data;
    } catch (err) {
      console.warn('[HomeSearch] Could not load homepage search catalog:', err);
      _catalogPromise = null;
      throw err;
    }
  })();

  return _catalogPromise;
}

export function useHomeSearchCatalog(autoFetchOnMount = false) {
  const [catalog, setCatalog] = useState<SearchCatalog | null>(() => _catalogCache);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);
  const isMountedRef = useRef(true);

  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  const loadCatalog = useCallback(async () => {
    if (_catalogCache) {
      if (catalog !== _catalogCache) {
        setCatalog(_catalogCache);
      }
      return _catalogCache;
    }

    setIsLoading(true);
    setError(null);

    try {
      const data = await fetchSearchCatalog();
      if (isMountedRef.current) {
        setCatalog(data);
        setIsLoading(false);
      }
      return data;
    } catch (err: any) {
      if (isMountedRef.current) {
        setError(err);
        setIsLoading(false);
      }
      return null;
    }
  }, [catalog]);

  useEffect(() => {
    if (autoFetchOnMount && !_catalogCache) {
      void loadCatalog();
    }
  }, [autoFetchOnMount, loadCatalog]);

  return {
    catalog,
    isLoading,
    error,
    loadCatalog,
  };
}

// Test helpers
export function _setMockCatalogForTesting(mock: SearchCatalog | null) {
  _catalogCache = mock;
  _catalogPromise = mock ? Promise.resolve(mock) : null;
}

export function _resetCatalogCacheForTesting() {
  _catalogCache = null;
  _catalogPromise = null;
}
