import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import {
  loggedOut,
  selectAccessToken,
  sessionStarted,
} from '@/features/auth/authSlice';
import { API_URL } from '@/lib/apiUrl';

const URLS_THAT_SKIP_REFRESH = [
  '/api/auth/login',
  '/api/auth/register',
  '/api/auth/refresh',
  '/api/auth/logout',
];

const SECOND_REFRESH_DELAY_MS = 500;

const rawBaseQuery = fetchBaseQuery({
  baseUrl: API_URL,
  credentials: 'include',
  prepareHeaders: (headers, { getState }) => {
    const accessToken = selectAccessToken(getState());

    if (accessToken) headers.set('authorization', `Bearer ${accessToken}`);

    return headers;
  },
});

async function callRefreshEndpoint() {
  try {
    const response = await fetch(`${API_URL}/api/auth/refresh`, {
      method: 'POST',
      credentials: 'include',
    });

    if (!response.ok) return null;

    const body = await response.json();

    return body.data;
  } catch {
    return null;
  }
}

let refreshInProgress = null;

export function refreshSession() {
  if (!refreshInProgress) {
    refreshInProgress = (async () => {
      const session = await callRefreshEndpoint();

      if (session) return session;

      await new Promise((resolve) =>
        setTimeout(resolve, SECOND_REFRESH_DELAY_MS),
      );

      return callRefreshEndpoint();
    })().finally(() => {
      refreshInProgress = null;
    });
  }

  return refreshInProgress;
}

export async function getFreshAccessToken({ getState, dispatch }) {
  const current = selectAccessToken(getState());

  if (current) return current;

  const session = await refreshSession();

  if (!session) return null;

  dispatch(sessionStarted(session));

  return session.accessToken;
}

async function baseQueryWithRefresh(args, api, extraOptions) {
  const result = await rawBaseQuery(args, api, extraOptions);
  const url = typeof args === 'string' ? args : args.url;

  if (result.error?.status !== 401 || URLS_THAT_SKIP_REFRESH.includes(url)) {
    return result;
  }

  const session = await refreshSession();

  if (!session) {
    api.dispatch(loggedOut());

    return result;
  }

  api.dispatch(sessionStarted(session));

  return rawBaseQuery(args, api, extraOptions);
}

export const baseApi = createApi({
  reducerPath: 'api',
  baseQuery: baseQueryWithRefresh,
  refetchOnFocus: true,
  refetchOnReconnect: true,
  tagTypes: [
    'Me',
    'Sessions',
    'UserSettings',
    'Wallet',
    'Transactions',
    'Usage',
    'Generations',
    'Voices',
    'AudioFiles',
    'Transcriptions',
    'RealtimeSessions',
    'Agents',
    'AgentAnalytics',
    'Platform',
    'AdminUsers',
    'AdminUserWallet',
    'CreditAdjustments',
    'AiProviders',
    'AiModels',
    'AdminVoices',
    'PlatformSettings',
    'AdminGenerations',
    'AuditLogs',
    'Analytics',
  ],
  endpoints: () => ({}),
});
