import { Mic, Upload } from 'lucide-react';
import { formatDuration } from '@/lib/format';

export const LIBRARY_TYPE_META = {
  generated: { label: 'Generated', icon: Mic },
  uploaded: { label: 'Uploaded', icon: Upload },
};

export const LIBRARY_FILTERS = [
  { value: 'all', label: 'All' },
  { value: 'generated', label: 'Generated' },
  { value: 'uploaded', label: 'Uploaded' },
  { value: 'transcribed', label: 'Transcribed' },
];

export const LIBRARY_SORTS = [
  { value: 'newest', label: 'Newest first' },
  { value: 'oldest', label: 'Oldest first' },
  { value: 'longest', label: 'Longest' },
  { value: 'name', label: 'Name A–Z' },
];

export const LIBRARY_TITLE_MAX_LENGTH = 150;

export function getLibraryTypeMeta(type) {
  return LIBRARY_TYPE_META[type] ?? LIBRARY_TYPE_META.generated;
}

export function buildLibraryParams({
  type,
  search,
  sort,
  favoritesOnly,
  page,
  limit,
}) {
  const params = { page, limit, sort };

  if (type === 'generated' || type === 'uploaded') params.kind = type;
  if (type === 'transcribed') params.transcribed = true;
  if (favoritesOnly) params.favorite = true;
  if (search.trim()) params.search = search.trim();

  return params;
}

export function formatAudioDuration(durationSeconds) {
  return durationSeconds == null ? '—' : formatDuration(durationSeconds);
}
