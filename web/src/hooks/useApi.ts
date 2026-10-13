import { useCallback, useEffect, useRef, useState } from "react";

interface UseApiState<T> {
  data: T | null;
  loading: boolean;
  error: Error | null;
}

interface UseApiOptions {
  retries?: number;
  retryDelay?: number;
}

interface UseApiResult<T> extends UseApiState<T> {
  refetch: () => void;
}

export function useApi<T>(fetcher: () => Promise<T>, options: UseApiOptions = {}): UseApiResult<T> {
  const { retries = 2, retryDelay = 1000 } = options;
  const [state, setState] = useState<UseApiState<T>>({
    data: null,
    loading: true,
    error: null,
  });

  const attemptRef = useRef(0);
  const fetcherRef = useRef(fetcher);
  fetcherRef.current = fetcher;

  const execute = useCallback(async () => {
    setState((prev) => ({ ...prev, loading: true, error: null }));
    try {
      const data = await fetcherRef.current();
      attemptRef.current = 0;
      setState({ data, loading: false, error: null });
    } catch (error) {
      if (attemptRef.current < retries) {
        attemptRef.current += 1;
        window.setTimeout(execute, retryDelay * attemptRef.current);
        return;
      }
      attemptRef.current = 0;
      setState({
        data: null,
        loading: false,
        error: error instanceof Error ? error : new Error(String(error)),
      });
    }
  }, [retries, retryDelay]);

  useEffect(() => {
    execute();
  }, [execute]);

  return { ...state, refetch: execute };
}
