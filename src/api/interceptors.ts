// api/interceptors.ts
import type { AxiosError, AxiosInstance, AxiosRequestConfig, AxiosResponse, InternalAxiosRequestConfig } from 'axios';
import * as SecureStore from 'expo-secure-store';

const ACCESS_TOKEN_KEY = 'access_token';
const REFRESH_TOKEN_KEY = 'refresh_token';

async function getAccessToken(): Promise<string | null> {
  return SecureStore.getItemAsync(ACCESS_TOKEN_KEY);
}

async function getRefreshToken(): Promise<string | null> {
  return SecureStore.getItemAsync(REFRESH_TOKEN_KEY);
}

// If you support refresh tokens, add helpers:
async function refreshAccessToken(): Promise<string | null> {
  const refreshToken = await getRefreshToken();
  if (!refreshToken) {
    return null;
  }
  const res = await fetch(
    `${process.env.EXPO_PUBLIC_API_BASE_URL ?? ''}/auth/refresh`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify({ refresh_token: refreshToken }),
    },
  );

  if (!res.ok) {
      return null;
  }

  const json = await res.json();

  // Adjust these property names to match your backend response
  const newAccess = json?.access_token ?? json?.token ?? null;
  const newRefresh = json?.refresh_token ?? null;

  if (newAccess) {
    await SecureStore.setItemAsync(ACCESS_TOKEN_KEY, newAccess);
  }
  if (newRefresh) {
    await SecureStore.setItemAsync(REFRESH_TOKEN_KEY, newRefresh);
  }

  return newAccess;
}

/** ————— Small request-id helper (useful in logs) ————— */
function randomId(len = 8) {
  return Math.random().toString(36).slice(2, 2 + len);
}

/** ————— Transient retry policy ————— */
async function retryIfTransient(error: AxiosError, attempt: number, max = 2) {
  const status = error.response?.status;
  const isNetwork = !error.response && !!error.message;
  const is5xx = typeof status === 'number' && status >= 500 && status < 600;

  if ((isNetwork || is5xx) && attempt < max) {
    const wait = 300 * Math.pow(2, attempt); // 300ms, 600ms
    await new Promise((r) => setTimeout(r, wait));
    return true;
  }
  return false;
}

/** ————— Single-flight 401 refresh queue ————— */
let isRefreshing = false;
let pendingQueue: Array<(token: string | null) => void> = [];

function enqueue(cb: (token: string | null) => void) {
  pendingQueue.push(cb);
}
function flushQueue(token: string | null) {
  pendingQueue.forEach((cb) => cb(token));
  pendingQueue = [];
}

/** ————— Error normalization ————— */
export type NormalizedError = {
  code: string; // 'NETWORK', 'UNAUTHORIZED', ...
  status?: number;
  message: string;
  details?: any;
};

function normalizeError(err: AxiosError): NormalizedError {
  if (!err.response) {
    return { code: 'NETWORK', message: err.message || 'Network error' };
  }
  const { status, data }: any = err.response;
  /*if (status === 401) return { code: 'UNAUTHORIZED', status, message: 'Unauthorized' };
  if (status === 403) return { code: 'FORBIDDEN', status, message: 'Forbidden' };
  if (status === 404) return { code: 'NOT_FOUND', status, message: 'Not found' };*/
  if (status === 422) {
    return {
      code: 'VALIDATION',
      status,
      message: 'Validation failed',
      details: data?.errors,
    };
  }
  return {
    code: 'HTTP_ERROR',
    status,
    message: data?.message ?? `HTTP ${status}`,
    details: data,
  };
}

/** ————— Public API ————— */
export function attachInterceptors(api: AxiosInstance) {
  api.interceptors.request.use(
    async (config: InternalAxiosRequestConfig) => {
      if (!config.headers) config.headers = {} as any;
      (config.headers as any)['X-REQUEST-ID'] = randomId();

      const token = await getAccessToken();
      if (token) {
        (config.headers as any).Authorization = `Bearer ${token}`;
      }

      (config as any).__attempt = ((config as any).__attempt ?? 0) as number;

      // no need to re-set X-App-Platform or User-Agent here,
      // api.ts already did that.

      return config;
    },
    (error) => Promise.reject(error),
  );

  api.interceptors.response.use(
    (response: AxiosResponse) => response,
    async (error: AxiosError) => {
      const original = error.config as AxiosRequestConfig & {
        __attempt?: number;
        __isRetry401?: boolean;
      };

      const attempt = (original?.__attempt ?? 0) + 1;
      (original as any).__attempt = attempt;

      if (await retryIfTransient(error, attempt)) {
        return api.request(original);
      }

      const status = error.response?.status;

      if (status === 401 && !original?.__isRetry401) {
        if (isRefreshing) {
          return new Promise((resolve) => {
            enqueue((newToken) => {
              if (newToken) {
                (original.headers ||= {});
                (original.headers as any).Authorization = `Bearer ${newToken}`;
              }
              (original as any).__isRetry401 = true;
              resolve(api.request(original));
            });
          });
        }

        isRefreshing = true;
        try {
          const newToken = await refreshAccessToken();
          flushQueue(newToken);
          if (newToken) {
            (original.headers ||= {});
            (original.headers as any).Authorization = `Bearer ${newToken}`;
            (original as any).__isRetry401 = true;
            return api.request(original);
          }
        } catch {
          flushQueue(null);
        } finally {
          isRefreshing = false;
        }
      }

      const norm = normalizeError(error);
      return Promise.reject(norm);
    },
  );
}