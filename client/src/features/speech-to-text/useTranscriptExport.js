'use client';

import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { selectAccessToken, sessionStarted } from '@/features/auth/authSlice';
import { API_URL } from '@/lib/apiUrl';
import { refreshSession } from '@/store/baseApi';

const UNAUTHORIZED = 401;
const FALLBACK_ERROR = 'Could not download the transcript. Please try again.';

function readFileName(response, fallback) {
  const header = response.headers.get('content-disposition') ?? '';
  const match = header.match(/filename="([^"]+)"/);

  return match?.[1] ?? fallback;
}

async function readErrorMessage(response) {
  try {
    const body = await response.json();

    return body.message || FALLBACK_ERROR;
  } catch {
    return FALLBACK_ERROR;
  }
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

export function useTranscriptExport() {
  const dispatch = useDispatch();
  const accessToken = useSelector(selectAccessToken);
  const [isExporting, setIsExporting] = useState(false);

  async function request(path, token) {
    return fetch(`${API_URL}${path}`, {
      headers: token ? { authorization: `Bearer ${token}` } : {},
      credentials: 'include',
    });
  }

  async function exportTranscript({ transcriptionId, format, fileName }) {
    const path = `/api/transcriptions/${transcriptionId}/export?format=${format}`;

    setIsExporting(true);

    try {
      let response = await request(path, accessToken);

      if (response.status === UNAUTHORIZED) {
        const session = await refreshSession();

        if (session) {
          dispatch(sessionStarted(session));
          response = await request(path, session.accessToken);
        }
      }

      if (!response.ok) throw new Error(await readErrorMessage(response));

      saveBlob(await response.blob(), readFileName(response, fileName));
    } catch (error) {
      throw new Error(
        error instanceof TypeError ? FALLBACK_ERROR : error.message,
      );
    } finally {
      setIsExporting(false);
    }
  }

  return { exportTranscript, isExporting };
}
