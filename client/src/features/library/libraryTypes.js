import { FileText, Mic, Sparkles, Upload } from 'lucide-react';

export const LIBRARY_TYPE_META = {
  generated: { label: 'Generated', icon: Mic },
  uploaded: { label: 'Uploaded', icon: Upload },
  transcription: { label: 'Transcription', icon: FileText },
  voice: { label: 'Voice', icon: Sparkles },
};

export function getLibraryTypeMeta(type) {
  return LIBRARY_TYPE_META[type] ?? LIBRARY_TYPE_META.generated;
}
