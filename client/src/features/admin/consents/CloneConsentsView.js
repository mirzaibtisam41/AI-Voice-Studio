'use client';

import { useState } from 'react';
import { Check, CircleAlert, CircleCheck, X } from 'lucide-react';
import { toast } from 'sonner';
import { PlayButton } from '@/components/audio/AudioPlayer';
import { useMockPlayback } from '@/components/audio/playbackStore';
import { EmptyState } from '@/components/ui/EmptyState';
import { Field } from '@/components/ui/Field';
import { Spinner } from '@/components/ui/Spinner';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogTitle,
} from '@/components/ui/dialog';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { AdminPageHeader } from '@/features/admin/shared/AdminToolbar';
import { NoticeAlert } from '@/features/admin/shared/NoticeAlert';
import { simulateWork } from '@/features/admin/shared/adminFormat';
import { formatDateTime, formatDuration } from '@/lib/format';
import { cn } from '@/lib/utils';
import { CLONE_REQUESTS } from '@/mocks/adminConsents';

const TABS = [
  { value: 'pending', label: 'Pending' },
  { value: 'approved', label: 'Approved' },
  { value: 'rejected', label: 'Rejected' },
];

const STATUS_TONES = {
  pending: { tone: 'warning', label: 'Pending review' },
  approved: { tone: 'success', label: 'Approved' },
  rejected: { tone: 'danger', label: 'Rejected' },
};

function SampleChip({ sample }) {
  const { isPlaying, toggle } = useMockPlayback(sample.id, sample.duration);

  return (
    <div className="flex items-center gap-2 rounded-lg border bg-field/60 py-1.5 pr-3 pl-1.5">
      <PlayButton
        isPlaying={isPlaying}
        onClick={toggle}
        label={sample.label}
        className="size-7"
      />
      <span className="max-w-40 truncate font-mono text-[11.5px]">
        {sample.label}
      </span>
      <span className="font-mono text-[11px] text-ink-3">
        {formatDuration(sample.duration)}
      </span>
    </div>
  );
}

function RequestCard({ request, busy, onApprove, onReject }) {
  const status = STATUS_TONES[request.status];

  return (
    <article className="flex flex-col gap-4 rounded-2xl border bg-card p-4 sm:p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-mono text-[12px] text-ink-3">
              {request.id}
            </span>
            <StatusBadge tone={status.tone}>{status.label}</StatusBadge>
          </div>
          <h3 className="mt-1 text-[14.5px] font-semibold">
            {request.voiceName}
          </h3>
          <p className="text-[12.5px] text-muted-foreground">
            {request.userName} · {request.userEmail}
          </p>
        </div>
        <span className="font-mono text-[11.5px] text-ink-3">
          Submitted {formatDateTime(request.submittedAt)}
        </span>
      </div>

      <div className="flex flex-col gap-2">
        <p className="text-[12px] text-ink-3">
          {request.samples.length}{' '}
          {request.samples.length === 1 ? 'sample' : 'samples'}
        </p>
        <div className="flex flex-wrap gap-2">
          {request.samples.map((sample) => (
            <SampleChip key={sample.id} sample={sample} />
          ))}
        </div>
      </div>

      <div
        className={cn(
          'flex items-start gap-2.5 rounded-xl border px-3 py-2.5',
          request.consentConfirmed
            ? 'border-success/30 bg-success/8'
            : 'border-danger/30 bg-danger/8',
        )}
      >
        {request.consentConfirmed ? (
          <CircleCheck
            className="mt-0.5 size-4 shrink-0 text-success"
            aria-hidden="true"
          />
        ) : (
          <CircleAlert
            className="mt-0.5 size-4 shrink-0 text-danger"
            aria-hidden="true"
          />
        )}
        <div className="min-w-0">
          <p
            className={cn(
              'text-[12.5px] font-semibold',
              request.consentConfirmed ? 'text-success' : 'text-danger',
            )}
          >
            {request.consentConfirmed
              ? 'Consent statement confirmed'
              : 'Consent not confirmed'}
          </p>
          <p className="text-[12.5px] text-muted-foreground">
            {request.consentStatement}
          </p>
        </div>
      </div>

      {request.status === 'rejected' && request.rejectionReason ? (
        <p className="text-[12.5px] text-ink-3">
          <span className="font-medium text-foreground">Reason: </span>
          {request.rejectionReason}
        </p>
      ) : null}

      {request.status === 'pending' ? (
        <div className="flex flex-wrap justify-end gap-2 border-t pt-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onReject(request.id)}
            disabled={busy}
            className="bg-danger/10 text-danger hover:bg-danger/20 hover:text-danger"
          >
            <X />
            Reject
          </Button>
          <Button
            size="sm"
            onClick={() => onApprove(request)}
            disabled={busy}
            className="bg-success text-white shadow-none hover:bg-success/90"
          >
            {busy ? <Spinner /> : <Check />}
            Approve
          </Button>
        </div>
      ) : null}
    </article>
  );
}

function RejectForm({ request, onSubmit, onCancel }) {
  const [reason, setReason] = useState('');
  const [saving, setSaving] = useState(false);

  function handleSubmit(event) {
    event.preventDefault();
    if (!reason.trim()) return;
    setSaving(true);
    simulateWork(() => {
      setSaving(false);
      onSubmit(request, reason.trim());
    });
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <Field
        id="reject-reason"
        label="Reason"
        hint="Shared with the user by email."
      >
        <Textarea
          id="reject-reason"
          rows={3}
          value={reason}
          onChange={(event) => setReason(event.target.value)}
          placeholder="e.g. Samples include a second speaker"
        />
      </Field>
      <DialogFooter>
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button
          type="submit"
          variant="destructive"
          disabled={!reason.trim() || saving}
        >
          {saving ? <Spinner /> : null}
          Reject request
        </Button>
      </DialogFooter>
    </form>
  );
}

export function CloneConsentsView() {
  const [requests, setRequests] = useState(CLONE_REQUESTS);
  const [tab, setTab] = useState('pending');
  const [approvingId, setApprovingId] = useState(null);
  const [rejectingId, setRejectingId] = useState(null);
  const rejectingRequest = requests.find(
    (request) => request.id === rejectingId,
  );
  const visible = requests.filter((request) => request.status === tab);
  const counts = Object.fromEntries(
    TABS.map(({ value }) => [
      value,
      requests.filter((request) => request.status === value).length,
    ]),
  );

  function updateRequest(id, changes) {
    setRequests((current) =>
      current.map((request) =>
        request.id === id ? { ...request, ...changes } : request,
      ),
    );
  }

  function handleApprove(request) {
    if (!request.consentConfirmed) {
      toast.error(
        'Consent is not confirmed. Reject or ask the user to confirm.',
      );
      return;
    }
    setApprovingId(request.id);
    simulateWork(() => {
      updateRequest(request.id, { status: 'approved' });
      setApprovingId(null);
      toast.success(`${request.voiceName} approved`);
    }, 1200);
  }

  function handleReject(request, reason) {
    updateRequest(request.id, { status: 'rejected', rejectionReason: reason });
    setRejectingId(null);
    toast.success(`${request.voiceName} rejected`);
  }

  return (
    <div className="flex flex-col gap-4">
      <AdminPageHeader
        title="Clone consent review"
        count={`${counts.pending} pending`}
      />
      <NoticeAlert tone="info">
        Voice cloning needs OpenAI custom voice approval. Approved requests are
        queued for submission to OpenAI and stay unavailable to the user until
        that approval arrives.
      </NoticeAlert>

      <Tabs value={tab} onValueChange={setTab} className="gap-4">
        <TabsList>
          {TABS.map(({ value, label }) => (
            <TabsTrigger key={value} value={value}>
              {label}
              <span className="ml-1.5 font-mono text-[11px] text-ink-3">
                {counts[value]}
              </span>
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>

      {visible.length ? (
        <div className="grid gap-4 xl:grid-cols-2">
          {visible.map((request) => (
            <RequestCard
              key={request.id}
              request={request}
              busy={approvingId === request.id}
              onApprove={handleApprove}
              onReject={setRejectingId}
            />
          ))}
        </div>
      ) : (
        <div className="rounded-2xl border bg-card">
          <EmptyState
            icon={CircleCheck}
            title={`No ${tab} requests`}
            description={
              tab === 'pending'
                ? 'The review queue is clear.'
                : 'Requests appear here after review.'
            }
          />
        </div>
      )}

      <Dialog
        open={Boolean(rejectingRequest)}
        onOpenChange={(open) => {
          if (!open) setRejectingId(null);
        }}
      >
        <DialogContent>
          <div className="flex flex-col gap-1.5 pr-6">
            <DialogTitle>Reject clone request</DialogTitle>
            <DialogDescription>
              {rejectingRequest
                ? `${rejectingRequest.voiceName} · ${rejectingRequest.userName}`
                : null}
            </DialogDescription>
          </div>
          {rejectingRequest ? (
            <RejectForm
              key={rejectingRequest.id}
              request={rejectingRequest}
              onSubmit={handleReject}
              onCancel={() => setRejectingId(null)}
            />
          ) : null}
        </DialogContent>
      </Dialog>
    </div>
  );
}
