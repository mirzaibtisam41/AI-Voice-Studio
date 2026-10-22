'use client';

import { useState } from 'react';
import { toast } from 'sonner';
import { PlayButton } from '@/components/audio/AudioPlayer';
import { useMockPlayback } from '@/components/audio/playbackStore';
import { VoiceInitial } from '@/components/audio/VoicePicker';
import { Field } from '@/components/ui/Field';
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
import { Switch } from '@/components/ui/switch';
import { TableRow } from '@/components/ui/table';
import { Textarea } from '@/components/ui/textarea';
import {
  AdminCell,
  AdminTable,
  EmptyTableRow,
} from '@/features/admin/shared/AdminTable';
import {
  AdminPageHeader,
  SearchField,
} from '@/features/admin/shared/AdminToolbar';
import { simulateWork } from '@/features/admin/shared/adminFormat';
import { VOICES } from '@/mocks/voices';

const COLUMNS = [
  'Voice',
  'Accent',
  'Gender',
  'Tags',
  'Preview',
  'Enabled',
  { key: 'actions', label: 'Actions', srOnly: true },
];

const INITIAL_VOICES = VOICES.map((voice) => ({
  ...voice,
  description: `${voice.style} ${voice.gender.toLowerCase()} voice with a ${voice.accent} accent, suited to ${voice.tags.at(-1).toLowerCase()}.`,
}));

function VoiceRow({ voice, onToggle, onEdit }) {
  const { isPlaying, toggle } = useMockPlayback(`admin-voice-${voice.id}`, 5);

  return (
    <TableRow>
      <AdminCell>
        <div className="flex items-center gap-3">
          <VoiceInitial voice={voice} />
          <div className="min-w-0">
            <p className="truncate text-[13px] font-semibold">{voice.name}</p>
            <p className="font-mono text-[11.5px] text-ink-3">{voice.id}</p>
          </div>
        </div>
      </AdminCell>
      <AdminCell className="text-muted-foreground">{voice.accent}</AdminCell>
      <AdminCell className="text-muted-foreground">{voice.gender}</AdminCell>
      <AdminCell>
        <div className="flex flex-wrap gap-1.5">
          {voice.tags.map((tag) => (
            <Tag key={tag}>{tag}</Tag>
          ))}
        </div>
      </AdminCell>
      <AdminCell>
        <PlayButton
          isPlaying={isPlaying}
          onClick={toggle}
          label={`${voice.name} preview`}
          className="bg-field text-foreground hover:bg-accent"
        />
      </AdminCell>
      <AdminCell>
        <Switch
          checked={voice.enabled}
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

function EditVoiceForm({ voice, onSave, onCancel }) {
  const [name, setName] = useState(voice.name);
  const [accent, setAccent] = useState(voice.accent);
  const [tags, setTags] = useState(voice.tags.join(', '));
  const [description, setDescription] = useState(voice.description);
  const [saving, setSaving] = useState(false);
  const canSubmit = name.trim() && accent.trim();

  function handleSubmit(event) {
    event.preventDefault();
    if (!canSubmit) return;
    setSaving(true);
    simulateWork(() => {
      setSaving(false);
      onSave({
        name: name.trim(),
        accent: accent.trim(),
        tags: tags
          .split(',')
          .map((tag) => tag.trim())
          .filter(Boolean),
        description: description.trim(),
      });
    });
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <Field id="voice-name" label="Display name">
          <Input
            id="voice-name"
            value={name}
            onChange={(event) => setName(event.target.value)}
          />
        </Field>
        <Field id="voice-accent" label="Accent">
          <Input
            id="voice-accent"
            value={accent}
            onChange={(event) => setAccent(event.target.value)}
          />
        </Field>
      </div>
      <Field id="voice-tags" label="Tags" hint="Separate tags with commas.">
        <Input
          id="voice-tags"
          value={tags}
          onChange={(event) => setTags(event.target.value)}
        />
      </Field>
      <Field id="voice-description" label="Description">
        <Textarea
          id="voice-description"
          rows={3}
          value={description}
          onChange={(event) => setDescription(event.target.value)}
        />
      </Field>
      <DialogFooter>
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" disabled={!canSubmit || saving}>
          {saving ? <Spinner /> : null}
          Save voice
        </Button>
      </DialogFooter>
    </form>
  );
}

export function VoiceCatalogView() {
  const [voices, setVoices] = useState(INITIAL_VOICES);
  const [query, setQuery] = useState('');
  const [editingId, setEditingId] = useState(null);
  const editingVoice = voices.find((voice) => voice.id === editingId);
  const term = query.trim().toLowerCase();
  const filtered = voices.filter((voice) =>
    [voice.name, voice.id, voice.accent, voice.gender, ...voice.tags]
      .join(' ')
      .toLowerCase()
      .includes(term),
  );
  const enabledCount = voices.filter((voice) => voice.enabled).length;

  function updateVoice(id, changes) {
    setVoices((current) =>
      current.map((voice) =>
        voice.id === id ? { ...voice, ...changes } : voice,
      ),
    );
  }

  function handleToggle(voice, enabled) {
    updateVoice(voice.id, { enabled });
    toast.success(
      `${voice.name} ${enabled ? 'enabled for' : 'hidden from'} users`,
    );
  }

  function handleSave(changes) {
    updateVoice(editingId, changes);
    setEditingId(null);
    toast.success(`${changes.name} updated`);
  }

  return (
    <div className="flex flex-col gap-4">
      <AdminPageHeader
        title="Voice catalog"
        count={`${enabledCount} of ${voices.length} enabled`}
      >
        <SearchField
          value={query}
          onChange={setQuery}
          placeholder="Search voices..."
        />
      </AdminPageHeader>

      <AdminTable columns={COLUMNS} tableClassName="min-w-[820px]">
        {filtered.length ? (
          filtered.map((voice) => (
            <VoiceRow
              key={voice.id}
              voice={voice}
              onToggle={handleToggle}
              onEdit={setEditingId}
            />
          ))
        ) : (
          <EmptyTableRow colSpan={COLUMNS.length}>
            No voices match “{query}”.
          </EmptyTableRow>
        )}
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
              OpenAI voice <span className="font-mono">{editingVoice?.id}</span>
              . Changes only affect how it appears in AI Voice Studio.
            </DialogDescription>
          </div>
          {editingVoice ? (
            <EditVoiceForm
              key={editingVoice.id}
              voice={editingVoice}
              onSave={handleSave}
              onCancel={() => setEditingId(null)}
            />
          ) : null}
        </DialogContent>
      </Dialog>
    </div>
  );
}
