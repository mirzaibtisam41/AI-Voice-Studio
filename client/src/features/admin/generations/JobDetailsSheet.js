'use client';

import { useState } from 'react';
import { Undo2 } from 'lucide-react';
import { Spinner } from '@/components/ui/Spinner';
import { StatusBadge, Tag } from '@/components/ui/StatusBadge';
import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import {
  formatCredits,
  simulateWork,
} from '@/features/admin/shared/adminFormat';
import { formatDateTime, formatDuration } from '@/lib/format';
import { JOB_STATUSES } from '@/mocks/adminJobs';

function DetailRow({ label, children, mono }) {
  return (
    <div className="flex items-start justify-between gap-4 py-2.5">
      <dt className="shrink-0 text-[12.5px] text-ink-3">{label}</dt>
      <dd
        className={
          mono ? 'text-right font-mono text-[12.5px]' : 'text-right text-[13px]'
        }
      >
        {children}
      </dd>
    </div>
  );
}

function RefundButton({ job, onRefund }) {
  const [refunding, setRefunding] = useState(false);

  function handleRefund() {
    setRefunding(true);
    simulateWork(() => {
      setRefunding(false);
      onRefund(job);
    }, 1200);
  }

  return (
    <Button onClick={handleRefund} disabled={refunding || job.refunded}>
      {refunding ? <Spinner /> : <Undo2 />}
      {job.refunded
        ? 'Credits refunded'
        : `Refund ${formatCredits(job.creditsHeld)} credits`}
    </Button>
  );
}

export function JobDetailsSheet({ job, onOpenChange, onRefund }) {
  const status = job ? JOB_STATUSES[job.status] : null;
  const failed = job?.status === 'failed';

  return (
    <Sheet open={Boolean(job)} onOpenChange={onOpenChange}>
      <SheetContent className="w-full overflow-y-auto sm:max-w-md">
        {job ? (
          <>
            <SheetHeader className="border-b p-5">
              <SheetTitle className="font-mono text-[15px]">
                {job.id}
              </SheetTitle>
              <SheetDescription className="flex flex-wrap items-center gap-2">
                <Tag>{job.type}</Tag>
                <StatusBadge tone={status.tone}>{status.label}</StatusBadge>
              </SheetDescription>
            </SheetHeader>
            <div className="flex flex-col gap-5 px-5">
              <dl className="divide-y">
                <DetailRow label="User">{job.userName}</DetailRow>
                <DetailRow label="Model" mono>
                  {job.model}
                </DetailRow>
                <DetailRow label="Input">{job.input}</DetailRow>
                <DetailRow label="Started" mono>
                  {formatDateTime(job.startedAt)}
                </DetailRow>
                <DetailRow label="Duration" mono>
                  {job.durationSec ? formatDuration(job.durationSec) : '—'}
                </DetailRow>
                <DetailRow label="Credits charged" mono>
                  {formatCredits(job.credits)}
                </DetailRow>
                <DetailRow label="Credits held" mono>
                  {formatCredits(job.creditsHeld)}
                </DetailRow>
                {failed ? (
                  <DetailRow label="Credits refunded" mono>
                    {job.refunded ? formatCredits(job.creditsHeld) : '0'}
                  </DetailRow>
                ) : null}
              </dl>
              {failed ? (
                <section className="flex flex-col gap-2 rounded-xl border border-danger/30 bg-danger/8 p-3.5">
                  <div className="flex items-center justify-between gap-2">
                    <h3 className="text-[13px] font-semibold">Error</h3>
                    <span className="font-mono text-[12px] text-danger">
                      {job.errorCategory}
                    </span>
                  </div>
                  <p className="text-[12.5px] text-muted-foreground">
                    {job.errorMessage}
                  </p>
                </section>
              ) : null}
            </div>
            {failed ? (
              <SheetFooter className="border-t p-5">
                <RefundButton key={job.id} job={job} onRefund={onRefund} />
              </SheetFooter>
            ) : null}
          </>
        ) : null}
      </SheetContent>
    </Sheet>
  );
}
