'use client';

import { useState } from 'react';
import {
  Bot,
  Copy,
  MoreHorizontal,
  Pause,
  Pencil,
  Play,
  Plus,
  Trash2,
} from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { EmptyState } from '@/components/ui/EmptyState';
import { Panel } from '@/components/ui/Panel';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { cn } from '@/lib/utils';
import { AGENT_STATUSES, findVoiceName } from '@/features/agents/agentOptions';

function AgentRow({
  agent,
  voices,
  selected,
  onSelect,
  onEdit,
  onDuplicate,
  onToggleLive,
  onRequestDelete,
}) {
  const status = AGENT_STATUSES[agent.status];

  return (
    <li
      className={cn(
        'flex items-center gap-2 rounded-xl border bg-field/40 pr-2 transition-colors',
        selected ? 'border-brand bg-brand-tint/40' : 'hover:bg-accent/60',
      )}
    >
      <button
        type="button"
        onClick={() => onSelect(agent.id)}
        aria-pressed={selected}
        className="flex min-w-0 flex-1 items-center gap-3 rounded-xl p-3 text-left outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50"
      >
        <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-brand-tint text-brand">
          <Bot className="size-5" aria-hidden="true" />
        </span>
        <span className="min-w-0 flex-1">
          <span className="block truncate text-[13.5px] font-semibold">
            {agent.name}
          </span>
          <span className="block truncate text-[12px] text-ink-3">
            Voice: {findVoiceName(voices, agent.voiceCode)}
            {agent.description ? ` · ${agent.description}` : ''}
          </span>
        </span>
        <StatusBadge tone={status.tone} className="shrink-0">
          {status.label}
        </StatusBadge>
      </button>
      <DropdownMenu modal={false}>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="icon-sm"
            aria-label={`Actions for ${agent.name}`}
          >
            <MoreHorizontal aria-hidden="true" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-44">
          <DropdownMenuItem onSelect={() => onEdit(agent)}>
            <Pencil aria-hidden="true" />
            Edit
          </DropdownMenuItem>
          <DropdownMenuItem onSelect={() => onDuplicate(agent)}>
            <Copy aria-hidden="true" />
            Duplicate
          </DropdownMenuItem>
          <DropdownMenuItem onSelect={() => onToggleLive(agent)}>
            {agent.status === 'live' ? (
              <>
                <Pause aria-hidden="true" />
                Pause
              </>
            ) : (
              <>
                <Play aria-hidden="true" />
                Go live
              </>
            )}
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            variant="destructive"
            onSelect={() => onRequestDelete(agent)}
          >
            <Trash2 aria-hidden="true" />
            Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </li>
  );
}

export function AgentList({
  agents,
  voices,
  canCreate,
  selectedId,
  onSelect,
  onCreate,
  onEdit,
  onDuplicate,
  onToggleLive,
  onDelete,
}) {
  const [pendingDelete, setPendingDelete] = useState(null);

  return (
    <Panel
      title="Your agents"
      description="Voice agents that answer calls and chats for you."
      action={
        <Button
          size="sm"
          onClick={onCreate}
          disabled={!canCreate}
          className="shrink-0"
        >
          <Plus aria-hidden="true" />
          New agent
        </Button>
      }
    >
      {agents.length === 0 ? (
        <EmptyState
          icon={Bot}
          title="No agents yet"
          description="Create your first voice agent to answer questions with your own instructions."
        />
      ) : (
        <ul className="flex flex-col gap-2">
          {agents.map((agent) => (
            <AgentRow
              key={agent.id}
              agent={agent}
              voices={voices}
              selected={agent.id === selectedId}
              onSelect={onSelect}
              onEdit={onEdit}
              onDuplicate={onDuplicate}
              onToggleLive={onToggleLive}
              onRequestDelete={setPendingDelete}
            />
          ))}
        </ul>
      )}
      <AlertDialog
        open={Boolean(pendingDelete)}
        onOpenChange={(open) => {
          if (!open) setPendingDelete(null);
        }}
      >
        <AlertDialogContent>
          <AlertDialogTitle>Delete {pendingDelete?.name}?</AlertDialogTitle>
          <AlertDialogDescription>
            The agent and its settings are removed. Past conversations stay in
            your history. This cannot be undone.
          </AlertDialogDescription>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              variant="destructive"
              onClick={() => {
                onDelete(pendingDelete);
                setPendingDelete(null);
              }}
            >
              Delete agent
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Panel>
  );
}
