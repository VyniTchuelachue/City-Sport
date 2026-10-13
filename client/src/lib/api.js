import { useCallback, useEffect, useState } from 'react';

export async function api(path, { method = 'GET', body } = {}) {
  let res;
  try {
    res = await fetch('/api' + path, {
      method,
      headers: body ? { 'Content-Type': 'application/json' } : undefined,
      body: body ? JSON.stringify(body) : undefined,
    });
  } catch {
    const err = new Error('network');
    err.code = 'network';
    throw err;
  }
  const data = await res.json().catch(() => null);
  if (!res.ok) {
    const err = new Error(data?.error || 'server_error');
    err.code = data?.error || 'server_error';
    err.status = res.status;
    err.fields = data?.fields;
    throw err;
  }
  return data;
}

// Fetches on mount and whenever the path changes. The previous result stays
// on screen while the next one loads, so filter changes do not flash empty.
export function useApi(path) {
  const [state, setState] = useState({ data: null, error: null, loading: true, path: null });
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    if (!path) return;
    let alive = true;
    setState((s) => ({ ...s, loading: true, error: null }));
    api(path)
      .then((data) => alive && setState({ data, error: null, loading: false, path }))
      .catch((error) => alive && setState({ data: null, error, loading: false, path }));
    return () => {
      alive = false;
    };
  }, [path, attempt]);

  const retry = useCallback(() => setAttempt((n) => n + 1), []);
  return { ...state, retry };
}
