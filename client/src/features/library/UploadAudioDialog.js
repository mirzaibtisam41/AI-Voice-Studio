'use client';

import { useState } from 'react';
import { toast } from 'sonner';
import { AudioDropzone } from '@/components/audio/AudioDropzone';
import { FormAlert } from '@/components/ui/FormAlert';
import { Spinner } from '@/components/ui/Spinner';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogTitle,
} from '@/components/ui/dialog';
import { useGetPublicPlatformQuery } from '@/features/credits/creditsApi';
import { useUploadAudioFileMutation } from '@/features/library/libraryApi';
import { getErrorMessage } from '@/lib/apiError';

const UPLOAD_ACCEPT =
  '.mp3,.wav,.m4a,.webm,.ogg,.flac,audio/mpeg,audio/wav,audio/mp4,audio/webm,audio/ogg,audio/flac';
const DEFAULT_UPLOAD_MEGABYTES = 25;

function UploadForm({ onDone, onCancel }) {
  const { data: platform } = useGetPublicPlatformQuery();
  const [uploadAudioFile, { isLoading }] = useUploadAudioFileMutation();
  const [files, setFiles] = useState([]);
  const [error, setError] = useState('');
  const maxMegabytes =
    platform?.settings.uploadMaxMegabytes ?? DEFAULT_UPLOAD_MEGABYTES;

  const changeFiles = (next) => {
    setFiles(next);
    setError('');
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!files[0]) return;

    const formData = new FormData();

    formData.append('file', files[0]);

    try {
      const audioFile = await uploadAudioFile(formData).unwrap();

      toast.success(`Uploaded “${audioFile.title}”`);
      onDone();
    } catch (uploadError) {
      setError(getErrorMessage(uploadError));
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <AudioDropzone
        files={files}
        onFilesChange={changeFiles}
        onError={setError}
        accept={UPLOAD_ACCEPT}
        hint={`MP3, WAV, M4A, WebM, OGG or FLAC up to ${maxMegabytes} MB`}
        maxBytes={maxMegabytes * 1024 * 1024}
      />
      <FormAlert>{error}</FormAlert>
      <DialogFooter>
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" disabled={!files[0] || isLoading}>
          {isLoading ? <Spinner /> : null}
          Upload
        </Button>
      </DialogFooter>
    </form>
  );
}

export function UploadAudioDialog({ open, onOpenChange }) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <div className="flex flex-col gap-1">
          <DialogTitle>Upload audio</DialogTitle>
          <DialogDescription>
            Add an audio file to your library. Uploading is free.
          </DialogDescription>
        </div>
        {open ? (
          <UploadForm
            onDone={() => onOpenChange(false)}
            onCancel={() => onOpenChange(false)}
          />
        ) : null}
      </DialogContent>
    </Dialog>
  );
}
