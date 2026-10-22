'use client';

import { useId, useState } from 'react';
import { FileAudio, Upload, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { formatBytes } from '@/lib/format';
import { cn } from '@/lib/utils';

const DEFAULT_ACCEPT = '.mp3,.wav,.m4a,audio/mpeg,audio/wav,audio/mp4';

export function AudioDropzone({
  hint = 'MP3, WAV or M4A up to 200MB',
  maxBytes = 200 * 1024 * 1024,
  accept = DEFAULT_ACCEPT,
  multiple = false,
  files,
  onFilesChange,
  onError,
}) {
  const inputId = useId();
  const [isDragging, setIsDragging] = useState(false);

  function addFiles(list) {
    const picked = Array.from(list);
    const tooBig = picked.find((file) => file.size > maxBytes);

    if (tooBig) {
      onError?.(`${tooBig.name} is larger than ${formatBytes(maxBytes)}.`);
      return;
    }

    const audio = picked.filter(
      (file) =>
        file.type.startsWith('audio/') || /\.(mp3|wav|m4a)$/i.test(file.name),
    );

    if (audio.length === 0) {
      onError?.('Choose an MP3, WAV or M4A file.');
      return;
    }

    onFilesChange(multiple ? [...files, ...audio] : audio.slice(0, 1));
  }

  function removeFile(index) {
    onFilesChange(files.filter((_, fileIndex) => fileIndex !== index));
  }

  const showDropArea = multiple || files.length === 0;

  return (
    <div className="flex flex-col gap-3">
      {showDropArea ? (
        <label
          htmlFor={inputId}
          onDragOver={(event) => {
            event.preventDefault();
            setIsDragging(true);
          }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={(event) => {
            event.preventDefault();
            setIsDragging(false);
            addFiles(event.dataTransfer.files);
          }}
          className={cn(
            'flex cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border border-dashed px-4 py-10 text-center transition-colors',
            isDragging
              ? 'border-brand bg-brand-tint'
              : 'border-input hover:border-brand/60',
          )}
        >
          <span className="flex size-9 items-center justify-center rounded-lg bg-brand-tint text-brand">
            <Upload className="size-4" aria-hidden="true" />
          </span>
          <span className="text-[13px] font-semibold">
            Drop an audio file here, or click to browse
          </span>
          <span className="text-[12px] text-ink-3">{hint}</span>
          <input
            id={inputId}
            type="file"
            accept={accept}
            multiple={multiple}
            className="sr-only"
            onChange={(event) => {
              addFiles(event.target.files);
              event.target.value = '';
            }}
          />
        </label>
      ) : null}

      {files.length > 0 ? (
        <ul className="flex flex-col gap-2">
          {files.map((file, index) => (
            <li
              key={`${file.name}-${index}`}
              className="flex items-center gap-3 rounded-xl border bg-field px-3 py-2.5"
            >
              <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-brand-tint text-brand">
                <FileAudio className="size-4" aria-hidden="true" />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block truncate text-[13px] font-medium">
                  {file.name}
                </span>
                <span className="block font-mono text-[11.5px] text-ink-3">
                  {formatBytes(file.size)}
                </span>
              </span>
              <Button
                type="button"
                variant="ghost"
                size="icon-sm"
                aria-label={`Remove ${file.name}`}
                onClick={() => removeFile(index)}
              >
                <X />
              </Button>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}
