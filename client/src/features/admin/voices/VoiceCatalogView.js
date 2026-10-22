'use client';

import { useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';
import { PlayButton } from '@/components/audio/AudioPlayer';
import { usePlayback } from '@/components/audio/playbackStore';
import { VoiceInitial } from '@/components/audio/VoicePicker';
import { Field } from '@/components/ui/Field';
import { FormAlert } from '@/components/ui/FormAlert';
import { Spinner } from '@/components/ui/Spinner';
import { Tag } from '@/components/ui/StatusBadge';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { TableRow } from '@/components/ui/table';
import { Textarea } from '@/components/ui/textarea';
import {
  useListAdminVoicesQuery,
  useUpdateAdminVoiceMutation,
} from '@/features/admin/adminApi';
import {
  AdminCell,
  AdminTable,
  TableStateRows,
} from '@/features/admin/shared/AdminTable';
import {
  AdminPageHeader,
  SearchField,
} from '@/features/admin/shared/AdminToolbar';
import { useLazyGetVoicePreviewQuery } from '@/features/voices/voicesApi';
import { getErrorMessage, readFieldErrors } from '@/lib/apiError';

const COLUMNS = [
  'Voice',
  'Accent',
  'Gender',
  'Tags',
  'Order',
  'Preview',
  'Enabled',
  { key: 'actions', label: 'Actions', srOnly: true },
];

const GENDERS = [
  { value: 'female', label: 'Female' },
  { value: 'male', label: 'Male' },
  { value: 'neutral', label: 'Neutral' },
];

const MAX_TAGS = 8;

function genderLabel(value) {
  return GENDERS.find((gender) => gender.value === value)?.label ?? value;
}

function PreviewButton({ voice }) {
  const [url, setUrl] = useState(null);
  const pendingPlay = useRef(false);
  const [loadPreview, { isFetching }] = useLazyGetVoicePreviewQuery();
  const { isPlaying, toggle, error } = usePlayback(`admin-voice-${voice.id}`, {
    src: url ?? undefined,
  });

  useEffect(() => {
    if (url && pendingPlay.current) {
      pendingPlay.current = false;
      toggle();
    }
  }, [url, toggle]);

  useEffect(() => {
    if (error) toast.error(error);
  }, [error]);

  async function handleClick() {
    if (url) {
      toggle();
      return;
    }

    try {
      const previewUrl = await loadPreview(voice.id, true).unwrap();

      pendingPlay.current = true;
      setUrl(previewUrl);
    } catch (previewError) {
      toast.error(getErrorMessage(previewError));
    }
  }

  if (isFetching) {
    return (
      <span className="flex size-8 items-center justify-center rounded-lg bg-field">
        <Spinner />
      </span>
    );
  }

  return (
    <PlayButton
      isPlaying={isPlaying}
      onClick={handleClick}
      disabled={!voice.enabled}
      label={`${voice.name} preview`}
      className="bg-field text-foreground hover:bg-accent"
    />
  );
}

function VoiceRow({ voice, pending, onToggle, onEdit }) {
  return (
    <TableRow>
      <AdminCell>
        <div className="flex items-center gap-3">
          <VoiceInitial voice={voice} />
          <div className="min-w-0">
            <p className="truncate text-[13px] font-semibold">{voice.name}</p>
            <p className="font-mono text-[11.5px] text-ink-3">{voice.code}</p>
          </div>
        </div>
      </AdminCell>
      <AdminCell className="text-muted-foreground">{voice.accent}</AdminCell>
      <AdminCell className="text-muted-foreground">
        {genderLabel(voice.gender)}
      </AdminCell>
      <AdminCell>
        <div className="flex flex-wrap gap-1.5">
          {voice.tags.map((tag) => (
            <Tag key={tag}>{tag}</Tag>
          ))}
        </div>
      </AdminCell>
      <AdminCell className="font-mono text-[12.5px] text-muted-foreground">
        {voice.sortOrder}
      </AdminCell>
      <AdminCell>
        <PreviewButton voice={voice} />
      </AdminCell>
      <AdminCell>
        <Switch
          checked={voice.enabled}
          disabled={pending}
          onCheckedChange={(enabled) => onToggle(voice, enabled)}
          aria-label={`${voice.name} enabled`}
        />
      </AdminCell>
      <AdminCell className="text-right">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onEdit(voice.id)}
          aria-label={`Edit ${voice.name}`}
        >
          Edit
        </Button>
      </AdminCell>
    </TableRow>
  );
}

function EditVoiceForm({ voice, onDone, onCancel }) {
  const [name, setName] = useState(voice.name);
  const [accent, setAccent] = useState(voice.accent);
  const [gender, setGender] = useState(voice.gender);
  const [tags, setTags] = useState(voice.tags.join(', '));
  const [description, setDescription] = useState(voice.description ?? '');
  const [sortOrder, setSortOrder] = useState(String(voice.sortOrder ?? 0));
  const [updateVoice, { isLoading, error }] = useUpdateAdminVoiceMutation();
  const fieldErrors = readFieldErrors(error);
  const tagList = tags
    .split(',')
    .map((tag) => tag.trim())
    .filter(Boolean);
  const order = Number(sortOrder);
  const orderValid =
    sortOrder !== '' && Number.isInteger(order) && order >= 0 && order <= 10000;
  const tagsValid =
    tagList.length <= MAX_TAGS && tagList.every((tag) => tag.length <= 30);
  const canSubmit = name.trim() && accent.trim() && orderValid && tagsValid;

  async function handleSubmit(event) {
    event.preventDefault();
    if (!canSubmit || isLoading) return;

    try {
      await updateVoice({
        id: voice.id,
        name: name.trim(),
        accent: accent.trim(),
        gender,
        tags: tagList,
        description: description.trim() || null,
        sortOrder: order,
      }).unwrap();
      toast.success(`${name.trim()} updated`);
      onDone();
    } catch {
      return;
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <FormAlert>{error ? getErrorMessage(error) : null}</FormAlert>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field id="voice-name" label="Display name" error={fieldErrors.name}>
          <Input
            id="voice-name"
            value={name}
            maxLength={60}
            onChange={(event) => setName(event.target.value)}
          />
        </Field>
        <Field id="voice-accent" label="Accent" error={fieldErrors.accent}>
          <Input
            id="voice-accent"
            value={accent}
            maxLength={60}
            onChange={(event) => setAccent(event.target.value)}
          />
        </Field>
        <Field id="voice-gender" label="Gender">
          <Select value={gender} onValueChange={setGender}>
            <SelectTrigger id="voice-gender">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {GENDERS.map((item) => (
                <SelectItem key={item.value} value={item.value}>
                  {item.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Field>
        <Field
          id="voice-order"
          label="Sort order"
          hint="Lower numbers show first."
          error={orderValid ? fieldErrors.sortOrder : '0 to 10000'}
        >
          <Input
            id="voice-order"
            type="number"
            min="0"
            max="10000"
            step="1"
            value={sortOrder}
            onChange={(event) => setSortOrder(event.target.value)}
            className="font-mono"
          />
        </Field>
      </div>
      <Field
        id="voice-tags"
        label="Tags"
        hint="Separate tags with commas. Up to 8."
        error={
          tagsValid ? fieldErrors.tags : 'Up to 8 tags, 30 characters each.'
        }
      >
        <Input
          id="voice-tags"
          value={tags}
          onChange={(event) => setTags(event.target.value)}
        />
      </Field>
      <Field
        id="voice-description"
        label="Description"
        error={fieldErrors.description}
      >
        <Textarea
          id="voice-description"
          rows={3}
          maxLength={300}
          value={description}
          onChange={(event) => setDescription(event.target.value)}
        />
      </Field>
      <DialogFooter>
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" disabled={!canSubmit || isLoading}>
          {isLoading ? <Spinner /> : null}
          Save voice
        </Button>
      </DialogFooter>
    </form>
  );
}

export function VoiceCatalogView() {
  const { data: voices = [], isLoading, error } = useListAdminVoicesQuery();
  const [updateVoice] = useUpdateAdminVoiceMutation();
  const [query, setQuery] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [pendingId, setPendingId] = useState(null);
  const editingVoice = voices.find((voice) => voice.id === editingId);
  const term = query.trim().toLowerCase();
  const filtered = voices.filter((voice) =>
    [voice.name, voice.code, voice.accent, voice.gender, ...voice.tags]
      .join(' ')
      .toLowerCase()
      .includes(term),
  );
  const enabledCount = voices.filter((voice) => voice.enabled).length;

  async function handleToggle(voice, enabled) {
    setPendingId(voice.id);
    try {
      await updateVoice({ id: voice.id, enabled }).unwrap();
      toast.success(
        `${voice.name} ${enabled ? 'enabled for' : 'hidden from'} users`,
      );
    } catch (toggleError) {
      toast.error(getErrorMessage(toggleError));
    } finally {
      setPendingId(null);
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <AdminPageHeader
        title="Voice catalog"
        count={
          voices.length ? `${enabledCount} of ${voices.length} enabled` : null
        }
      >
        <SearchField
          value={query}
          onChange={setQuery}
          placeholder="Search voices..."
        />
      </AdminPageHeader>

      <AdminTable columns={COLUMNS} tableClassName="min-w-[880px]">
        <TableStateRows
          colSpan={COLUMNS.length}
          isLoading={isLoading}
          error={error}
          isEmpty={!isLoading && !error && filtered.length === 0}
          empty={query ? `No voices match “${query}”.` : 'No voices yet.'}
        />
        {filtered.map((voice) => (
          <VoiceRow
            key={voice.id}
            voice={voice}
            pending={pendingId === voice.id}
            onToggle={handleToggle}
            onEdit={setEditingId}
          />
        ))}
      </AdminTable>

      <Dialog
        open={Boolean(editingVoice)}
        onOpenChange={(open) => {
          if (!open) setEditingId(null);
        }}
      >
        <DialogContent className="max-w-lg">
          <div className="flex flex-col gap-1.5 pr-6">
            <DialogTitle>Edit voice</DialogTitle>
            <DialogDescription>
              Provider voice{' '}
              <span className="font-mono">{editingVoice?.code}</span>. Changes
              only affect how it appears in AI Voice Studio.
            </DialogDescription>
          </div>
          {editingVoice ? (
            <EditVoiceForm
              key={editingVoice.id}
              voice={editingVoice}
              onDone={() => setEditingId(null)}
              onCancel={() => setEditingId(null)}
            />
          ) : null}
        </DialogContent>
      </Dialog>
    </div>
  );
}
