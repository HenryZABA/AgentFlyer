import { useCallback, useEffect, useRef, useState } from 'react';

const STORAGE_KEY_URL = 'af-gateway-url';
const STORAGE_KEY_TOKEN = 'af-gateway-token';

function getGatewayUrl(): string {
  if (typeof window !== 'undefined' && window.__AF_PORT__) {
    return `http://127.0.0.1:${window.__AF_PORT__}`;
  }
  return localStorage.getItem(STORAGE_KEY_URL) ?? '';
}

function getToken(): string {
  if (typeof window !== 'undefined' && window.__AF_TOKEN__) {
    return window.__AF_TOKEN__;
  }
  return localStorage.getItem(STORAGE_KEY_TOKEN) ?? '';
}

export function isGatewayConfigured(): boolean {
  return getGatewayUrl() !== '';
}

export function setGatewayConnection(url: string, token: string): void {
  localStorage.setItem(STORAGE_KEY_URL, url.replace(/\/+$/, ''));
  localStorage.setItem(STORAGE_KEY_TOKEN, token);
}

export function clearGatewayConnection(): void {
  localStorage.removeItem(STORAGE_KEY_URL);
  localStorage.removeItem(STORAGE_KEY_TOKEN);
}

export function getGatewayConnection(): { url: string; token: string } {
  return { url: getGatewayUrl(), token: getToken() };
}

export async function rpc<T = unknown>(
  method: string,
  params?: unknown,
  signal?: AbortSignal,
): Promise<T> {
  const res = await fetch(`${getGatewayUrl()}/rpc`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${getToken()}`,
    },
    body: JSON.stringify({ id: 1, method, params }),
    signal,
  });
  if (!res.ok) throw new Error(`RPC HTTP ${res.status}`);
  const json = (await res.json()) as { result?: T; error?: { message: string } };
  if (json.error) throw new Error(json.error.message);
  return json.result as T;
}

export function useQuery<T>(
  fn: () => Promise<T>,
  deps: unknown[],
): { data: T | null; loading: boolean; error: string | null; refetch: () => void } {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const fnRef = useRef(fn);
  fnRef.current = fn;

  const run = useCallback(() => {
    setLoading(true);
    setError(null);
    fnRef
      .current()
      .then((d) => {
        setData(d);
        setLoading(false);
      })
      .catch((e: unknown) => {
        setError(e instanceof Error ? e.message : String(e));
        setLoading(false);
      });
  }, []);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    run();
  }, [...deps, run]);

  return { data, loading, error, refetch: run };
}
