import { useEffect, useState } from 'react';
import { api } from './api';

interface State<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
}

export function useApi<T>(url: string): State<T> {
  const [state, setState] = useState<State<T>>({ data: null, loading: true, error: null });

  useEffect(() => {
    let active = true;
    setState({ data: null, loading: true, error: null });
    api.get<T>(url)
      .then(res => {
        if (active) setState({ data: res.data, loading: false, error: null });
      })
      .catch(err => {
        if (active) {
          const msg = err?.response?.data?.error ?? 'Ошибка загрузки';
          setState({ data: null, loading: false, error: msg });
        }
      });
    return () => {
      active = false;
    };
  }, [url]);

  return state;
}
