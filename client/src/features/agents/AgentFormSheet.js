'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { ChoiceChips } from '@/components/ui/ChoiceChips';
import { Field } from '@/components/ui/Field';
import { FormAlert } from '@/components/ui/FormAlert';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { Spinner } from '@/components/ui/Spinner';
import { Textarea } from '@/components/ui/textarea';
import { getErrorMessage, readFieldErrors } from '@/lib/apiError';
import {
  AGENT_LIMITS,
  AGENT_RESPONSE_STYLES,
  AGENT_TOOLS,
} from '@/features/agents/agentOptions';

const STATUS_OPTIONS = [
  { value: 'draft', label: 'Draft' },
  { value: 'live', label: 'Live' },
];

const EMPTY_FORM = {
  name: '',
  description: '',
  voiceCode: '',
  greeting: '',
  instructions: '',
  responseStyle: 'balanced',
  tools: [],
  knowledge: '',
  status: 'draft',
};

function toForm(agent, voices) {
  if (!agent) return { ...EMPTY_FORM, voiceCode: voices[0]?.code ?? '' };

  return {
    name: agent.name,
    description: agent.description ?? '',
    voiceCode: agent.voiceCode,
    greeting: agent.greeting ?? '',
    instructions: agent.instructions,
    responseStyle: agent.responseStyle,
    tools: agent.tools,
    knowledge: agent.knowledge ?? '',
    status: agent.status,
  };
}

function validate(form) {
  const errors = {};

  if (form.name.trim().length < 2) {
    errors.name = 'Give the agent a name of at least 2 characters.';
  }
  if (!form.voiceCode) errors.voiceCode = 'Choose a voice.';
  if (form.instructions.trim().length < AGENT_LIMITS.instructionsMin) {
    errors.instructions =
      'Write at least 20 characters so the agent knows how to behave.';
  }

  return errors;
}

function AgentForm({ agent, voices, onSave, onCancel }) {
  const [form, setForm] = useState(() => toForm(agent, voices));
  const [errors, setErrors] = useState({});
  const [formError, setFormError] = useState('');
  const [saving, setSaving] = useState(false);
  const statusOptions =
    agent?.status === 'paused'
      ? [...STATUS_OPTIONS, { value: 'paused', label: 'Paused' }]
      : STATUS_OPTIONS;

  const update = (key) => (value) => {
    setForm((current) => ({ ...current, [key]: value }));
    if (errors[key]) setErrors((current) => ({ ...current, [key]: undefined }));
  };

  const toggleTool = (toolId, checked) => {
    update('tools')(
      checked
        ? [...form.tools, toolId]
        : form.tools.filter((id) => id !== toolId),
    );
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const nextErrors = validate(form);

    setErrors(nextErrors);
    setFormError('');
    if (Object.keys(nextErrors).length > 0) return;

    setSaving(true);

    try {
      await onSave({
        ...form,
        name: form.name.trim(),
        description: form.description.trim(),
        instructions: form.instructions.trim(),
        greeting: form.greeting.trim(),
        knowledge: form.knowledge.trim(),
      });
    } catch (error) {
      setErrors(readFieldErrors(error));
      setFormError(getErrorMessage(error));
      setSaving(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      noValidate
      className="flex min-h-0 flex-1 flex-col"
    >
      <div className="flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto px-4 pb-4 sm:px-6">
        <FormAlert>{formError}</FormAlert>
        <Field id="agent-name" label="Name" error={errors.name}>
          <Input
            id="agent-name"
            value={form.name}
            onChange={(event) => update('name')(event.target.value)}
            placeholder="e.g. Support Concierge"
            aria-invalid={Boolean(errors.name)}
            aria-describedby={errors.name ? 'agent-name-error' : undefined}
            maxLength={AGENT_LIMITS.name}
          />
        </Field>
        <Field
          id="agent-description"
          label="Description"
          error={errors.description}
        >
          <Input
            id="agent-description"
            value={form.description}
            onChange={(event) => update('description')(event.target.value)}
            placeholder="What this agent helps with"
            maxLength={AGENT_LIMITS.description}
          />
        </Field>
        <Field id="agent-voice" label="Voice" error={errors.voiceCode}>
          <Select value={form.voiceCode} onValueChange={update('voiceCode')}>
            <SelectTrigger id="agent-voice">
              <SelectValue placeholder="Choose a voice" />
            </SelectTrigger>
            <SelectContent>
              {voices.map((voice) => (
                <SelectItem key={voice.code} value={voice.code}>
                  {voice.name}
                  {voice.accent ? ` — ${voice.accent}` : ''}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Field>
        <Field
          id="agent-greeting"
          label="Greeting message"
          error={errors.greeting}
          hint="The first thing the agent says. Leave empty for a default greeting."
        >
          <Input
            id="agent-greeting"
            value={form.greeting}
            onChange={(event) => update('greeting')(event.target.value)}
            placeholder="Hi! How can I help today?"
            aria-describedby="agent-greeting-hint"
            maxLength={AGENT_LIMITS.greeting}
          />
        </Field>
        <Field
          id="agent-instructions"
          label="Instructions"
          error={errors.instructions}
          hint="The system prompt: role, tone and when to hand off."
        >
          <Textarea
            id="agent-instructions"
            rows={5}
            value={form.instructions}
            onChange={(event) => update('instructions')(event.target.value)}
            placeholder="You are a friendly support agent for..."
            maxLength={AGENT_LIMITS.instructions}
            aria-invalid={Boolean(errors.instructions)}
            aria-describedby={
              errors.instructions
                ? 'agent-instructions-error'
                : 'agent-instructions-hint'
            }
          />
        </Field>
        <fieldset className="flex flex-col gap-2">
          <legend className="mb-2 text-sm font-medium">Response style</legend>
          <ChoiceChips
            label="Response style"
            options={AGENT_RESPONSE_STYLES}
            value={form.responseStyle}
            onChange={update('responseStyle')}
          />
        </fieldset>
        <fieldset className="flex flex-col gap-2">
          <legend className="mb-2 text-sm font-medium">Tools</legend>
          <p className="-mt-1 text-[12px] text-ink-3">
            Saved with the agent for when tool actions are connected.
          </p>
          <ul className="flex flex-col gap-2">
            {AGENT_TOOLS.map((tool) => {
              const checkboxId = `agent-tool-${tool.id}`;

              return (
                <li
                  key={tool.id}
                  className="flex items-start gap-3 rounded-lg border bg-field/50 p-3"
                >
                  <Checkbox
                    id={checkboxId}
                    checked={form.tools.includes(tool.id)}
                    onCheckedChange={(checked) =>
                      toggleTool(tool.id, checked === true)
                    }
                    aria-describedby={`${checkboxId}-description`}
                    className="mt-0.5"
                  />
                  <label
                    htmlFor={checkboxId}
                    className="min-w-0 cursor-pointer"
                  >
                    <span className="block text-[13px] font-medium">
                      {tool.label}
                    </span>
                    <span
                      id={`${checkboxId}-description`}
                      className="block text-[12px] text-ink-3"
                    >
                      {tool.description}
                    </span>
                  </label>
                </li>
              );
            })}
          </ul>
        </fieldset>
        <Field
          id="agent-knowledge"
          label="Knowledge notes"
          error={errors.knowledge}
          hint="Facts the agent can use, like prices or opening hours."
        >
          <Textarea
            id="agent-knowledge"
            rows={3}
            value={form.knowledge}
            onChange={(event) => update('knowledge')(event.target.value)}
            maxLength={AGENT_LIMITS.knowledge}
            aria-describedby="agent-knowledge-hint"
          />
        </Field>
        <fieldset className="flex flex-col gap-2">
          <legend className="mb-2 text-sm font-medium">Status</legend>
          <ChoiceChips
            label="Status"
            options={statusOptions}
            value={form.status}
            onChange={update('status')}
          />
        </fieldset>
      </div>
      <SheetFooter className="mt-0 flex-row justify-end border-t px-4 sm:px-6">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={saving}
        >
          Cancel
        </Button>
        <Button type="submit" disabled={saving}>
          {saving ? <Spinner /> : null}
          {saving ? 'Saving…' : agent ? 'Save changes' : 'Create agent'}
        </Button>
      </SheetFooter>
    </form>
  );
}

export function AgentFormSheet({ open, agent, voices, onOpenChange, onSave }) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full gap-0 sm:max-w-lg">
        <SheetHeader className="border-b px-4 sm:px-6">
          <SheetTitle>{agent ? `Edit ${agent.name}` : 'New agent'}</SheetTitle>
          <SheetDescription>
            Set the voice, instructions and tools for this agent.
          </SheetDescription>
        </SheetHeader>
        <div className="flex min-h-0 flex-1 flex-col pt-4">
          <AgentForm
            key={agent?.id ?? 'new'}
            agent={agent}
            voices={voices}
            onSave={onSave}
            onCancel={() => onOpenChange(false)}
          />
        </div>
      </SheetContent>
    </Sheet>
  );
}
