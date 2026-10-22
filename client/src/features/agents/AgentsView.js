'use client';

import { useState } from 'react';
import { toast } from 'sonner';
import { AgentAnalytics } from '@/features/agents/AgentAnalytics';
import { AgentFormSheet } from '@/features/agents/AgentFormSheet';
import { AgentList } from '@/features/agents/AgentList';
import { AgentStats } from '@/features/agents/AgentStats';
import { AgentTestChat } from '@/features/agents/AgentTestChat';
import { AGENTS } from '@/mocks/agents';

function freshStats() {
  return {
    sessions: 0,
    weeklySessions: [0, 0, 0, 0, 0, 0, 0],
    avgDuration: 0,
    resolvedRate: null,
    resolvedTrend: undefined,
    intents: [],
  };
}

export function AgentsView() {
  const [agents, setAgents] = useState(AGENTS);
  const [selectedId, setSelectedId] = useState(AGENTS[0].id);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [editingAgent, setEditingAgent] = useState(null);

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

  const saveAgent = (values) => {
    if (editingAgent) {
      setAgents((current) =>
        current.map((agent) =>
          agent.id === editingAgent.id ? { ...agent, ...values } : agent,
        ),
      );
      toast.success(`${values.name} updated`);
    } else {
      const id = `agent-${Date.now()}`;

      setAgents((current) => [...current, { id, ...freshStats(), ...values }]);
      setSelectedId(id);
      toast.success(`${values.name} created`, {
        description:
          values.status === 'live'
            ? 'The agent is live and ready to answer.'
            : 'Saved as a draft. Test it before going live.',
      });
    }
    setSheetOpen(false);
  };

  const duplicateAgent = (source) => {
    const id = `agent-${Date.now()}`;
    const name = `${source.name} (copy)`;

    setAgents((current) => {
      const index = current.findIndex((agent) => agent.id === source.id);
      const copy = {
        ...source,
        ...freshStats(),
        id,
        name,
        status: 'draft',
      };

      return [
        ...current.slice(0, index + 1),
        copy,
        ...current.slice(index + 1),
      ];
    });
    setSelectedId(id);
    toast.success(`Duplicated as “${name}”`);
  };

  const toggleLive = (target) => {
    const nextStatus = target.status === 'live' ? 'paused' : 'live';

    setAgents((current) =>
      current.map((agent) =>
        agent.id === target.id ? { ...agent, status: nextStatus } : agent,
      ),
    );
    toast.success(
      nextStatus === 'live'
        ? `${target.name} is live`
        : `${target.name} paused`,
    );
  };

  const deleteAgent = (target) => {
    const remaining = agents.filter((agent) => agent.id !== target.id);

    setAgents(remaining);
    if (selected?.id === target.id) setSelectedId(remaining[0]?.id ?? null);
    toast.success(`${target.name} deleted`);
  };

  return (
    <>
      <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_360px]">
        <div className="flex min-w-0 flex-col gap-4">
          <AgentList
            agents={agents}
            selectedId={selected?.id}
            onSelect={setSelectedId}
            onCreate={openCreate}
            onEdit={openEdit}
            onDuplicate={duplicateAgent}
            onToggleLive={toggleLive}
            onDelete={deleteAgent}
          />
          {selected ? (
            <>
              <AgentTestChat agent={selected} />
              <AgentAnalytics agent={selected} />
            </>
          ) : null}
        </div>
        {selected ? <AgentStats agent={selected} onEdit={openEdit} /> : null}
      </div>
      <AgentFormSheet
        open={sheetOpen}
        agent={editingAgent}
        onOpenChange={setSheetOpen}
        onSave={saveAgent}
      />
    </>
  );
}
