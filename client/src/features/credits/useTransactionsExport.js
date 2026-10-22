'use client';

import { useState } from 'react';
import { useStore } from 'react-redux';
import { sessionStarted } from '@/features/auth/authSlice';
import { getFreshAccessToken, refreshSession } from '@/store/baseApi';
import { API_URL } from '@/lib/apiUrl';

const EXPORT_PATH = '/api/wallet/transactions/export';
const FALLBACK_FILE_NAME = 'ai-voice-studio-transactions.csv';
const EXPORT_ERROR = 'Could not export your transactions. Please try again.';

function requestExport(query, accessToken) {
  const search = new URLSearchParams(query).toString();

  return fetch(`${API_URL}${EXPORT_PATH}${search ? `?${search}` : ''}`, {
    headers: accessToken ? { authorization: `Bearer ${accessToken}` } : {},
    credentials: 'include',
  });
}

async function readErrorMessage(response) {
  try {
    const body = await response.json();

    return body.message || EXPORT_ERROR;
  } catch {
    return EXPORT_ERROR;
  }
}

function readFileName(response) {
  const disposition = response.headers.get('content-disposition') ?? '';
  const match = disposition.match(/filename="?([^";]+)"?/i);

  return match?.[1] ?? FALLBACK_FILE_NAME;
}

function saveBlob(blob, fileName) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');

  link.href = url;
  link.download = fileName;
  document.body.append(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

export function useTransactionsExport() {
  const store = useStore();
  const [isExporting, setIsExporting] = useState(false);

  const exportCsv = async ({ type } = {}) => {
    const query = type ? { type } : {};

    setIsExporting(true);

    try {
      let response = await requestExport(
        query,
        await getFreshAccessToken(store),
      );

      if (response.status === 401) {
        const session = await refreshSession();

        if (session) {
          store.dispatch(sessionStarted(session));
          response = await requestExport(query, session.accessToken);
        }
      }

      if (!response.ok) throw new Error(await readErrorMessage(response));

      saveBlob(await response.blob(), readFileName(response));
    } catch (error) {
      if (error instanceof TypeError) {
        throw new Error(
          'Could not reach the server. Check your connection and try again.',
        );
      }

      throw error;
    } finally {
      setIsExporting(false);
    }
  };

  return { exportCsv, isExporting };
}
