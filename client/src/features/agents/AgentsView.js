'use client';

import { useState } from 'react';
import { toast } from 'sonner';
import { FormAlert } from '@/components/ui/FormAlert';
import { Panel } from '@/components/ui/Panel';
import { Skeleton } from '@/components/ui/skeleton';
import { getErrorMessage } from '@/lib/apiError';
import { AgentAnalytics } from '@/features/agents/AgentAnalytics';
import { AgentFormSheet } from '@/features/agents/AgentFormSheet';
import { AgentList } from '@/features/agents/AgentList';
import { AgentStats } from '@/features/agents/AgentStats';
import { AgentTestChat } from '@/features/agents/AgentTestChat';
import {
  useCreateAgentMutation,
  useDeleteAgentMutation,
  useDuplicateAgentMutation,
  useListAgentsQuery,
  useUpdateAgentMutation,
  useUpdateAgentStatusMutation,
} from '@/features/agents/agentsApi';
import { useGetRealtimeOptionsQuery } from '@/features/playground/realtimeApi';

function LoadingAgents() {
  return (
    <Panel title="Your agents">
      <div className="flex flex-col gap-2">
        <Skeleton className="h-16 w-full" />
        <Skeleton className="h-16 w-full" />
      </div>
    </Panel>
  );
}

export function AgentsView() {
  const agentsQuery = useListAgentsQuery();
  const { data: options } = useGetRealtimeOptionsQuery();
  const [createAgent] = useCreateAgentMutation();
  const [updateAgent] = useUpdateAgentMutation();
  const [updateAgentStatus] = useUpdateAgentStatusMutation();
  const [duplicateAgent] = useDuplicateAgentMutation();
  const [deleteAgent] = useDeleteAgentMutation();

  const [selectedId, setSelectedId] = useState(null);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [editingAgent, setEditingAgent] = useState(null);
  const [days, setDays] = useState(7);

  const agents = agentsQuery.data ?? [];
  const voices = options?.voices ?? [];
  const selected =
    agents.find((agent) => agent.id === selectedId) ?? agents[0] ?? null;

  const openCreate = () => {
    setEditingAgent(null);
    setSheetOpen(true);
  };

  const openEdit = (agent) => {
    setEditingAgent(agent);
    setSheetOpen(true);
  };

  const saveAgent = async (values) => {
    if (editingAgent) {
      await updateAgent({ id: editingAgent.id, ...values }).unwrap();
      toast.success(`${values.name} updated`);
    } else {
      const created = await createAgent(values).unwrap();

      setSelectedId(created.id);
      toast.success(`${created.name} created`, {
        description:
          created.status === 'live'
            ? 'The agent is live and ready to answer.'
            : 'Saved as a draft. Test it before going live.',
      });
    }
    setSheetOpen(false);
  };

  const handleDuplicate = async (source) => {
    try {
      const copy = await duplicateAgent(source.id).unwrap();

      setSelectedId(copy.id);
      toast.success(`Duplicated as “${copy.name}”`);
    } catch (error) {
      toast.error(getErrorMessage(error));
    }
  };

  const toggleLive = async (target) => {
    const status = target.status === 'live' ? 'paused' : 'live';

    try {
      await updateAgentStatus({ id: target.id, status }).unwrap();
      toast.success(
        status === 'live' ? `${target.name} is live` : `${target.name} paused`,
      );
    } catch (error) {
      toast.error(getErrorMessage(error));
    }
  };

  const handleDelete = async (target) => {
    try {
      await deleteAgent(target.id).unwrap();
      if (selected?.id === target.id) setSelectedId(null);
      toast.success(`${target.name} deleted`);
    } catch (error) {
      toast.error(getErrorMessage(error));
    }
  };

  return (
    <>
      <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_360px]">
        <div className="flex min-w-0 flex-col gap-4">
          {agentsQuery.isLoading ? (
            <LoadingAgents />
          ) : agentsQuery.isError ? (
            <Panel title="Your agents">
              <FormAlert>{getErrorMessage(agentsQuery.error)}</FormAlert>
            </Panel>
          ) : (
            <AgentList
              agents={agents}
              voices={voices}
              selectedId={selected?.id}
              onSelect={setSelectedId}
              onCreate={openCreate}
              onEdit={openEdit}
              onDuplicate={handleDuplicate}
              onToggleLive={toggleLive}
              onDelete={handleDelete}
              canCreate={voices.length > 0}
            />
          )}
          {selected ? (
            <>
              <AgentTestChat agent={selected} />
              <AgentAnalytics
                agent={selected}
                days={days}
                onDaysChange={setDays}
              />
            </>
          ) : null}
        </div>
        {selected ? (
          <AgentStats
            agent={selected}
            options={options}
            days={days}
            onEdit={openEdit}
          />
        ) : null}
      </div>
      <AgentFormSheet
        open={sheetOpen}
        agent={editingAgent}
        voices={voices}
        onOpenChange={setSheetOpen}
        onSave={saveAgent}
      />
    </>
  );
}
