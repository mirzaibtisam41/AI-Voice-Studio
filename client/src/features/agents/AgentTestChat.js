'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { Mic, RotateCcw, SendHorizontal } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { FormAlert } from '@/components/ui/FormAlert';
import { Input } from '@/components/ui/input';
import { Panel } from '@/components/ui/Panel';
import { getErrorMessage } from '@/lib/apiError';
import { cn } from '@/lib/utils';
import { useChatWithAgentMutation } from '@/features/agents/agentsApi';
import { usePublicPlatformQuery } from '@/features/marketing/platformApi';

function createGreeting(agent) {
  return agent.greeting
    ? [{ id: 'greeting', role: 'agent', text: agent.greeting }]
    : [];
}

function TypingIndicator() {
  return (
    <li className="self-start">
      <span
        className="flex items-center gap-1 rounded-2xl rounded-tl-md border bg-field px-3.5 py-3"
        aria-label="Agent is typing"
        role="status"
      >
        {[0, 1, 2].map((dot) => (
          <span
            key={dot}
            aria-hidden="true"
            className="size-1.5 animate-bounce rounded-full bg-ink-3"
            style={{ animationDelay: `${dot * 150}ms` }}
          />
        ))}
      </span>
    </li>
  );
}

function toApiMessages(messages) {
  return messages.map((message) => ({
    role: message.role === 'agent' ? 'assistant' : 'user',
    content: message.text,
  }));
}

function ChatWindow({ agent, maxMessages }) {
  const [messages, setMessages] = useState(() => createGreeting(agent));
  const [draft, setDraft] = useState('');
  const [error, setError] = useState(null);
  const [chatWithAgent, { isLoading: typing }] = useChatWithAgentMutation();
  const scrollRef = useRef(null);
  const isFull = maxMessages ? messages.length + 1 > maxMessages : false;

  useEffect(() => {
    const container = scrollRef.current;

    if (container) {
      container.scrollTo({ top: container.scrollHeight, behavior: 'smooth' });
    }
  }, [messages.length, typing]);

  const sendMessage = async (event) => {
    event.preventDefault();
    const text = draft.trim();

    if (!text || typing || isFull) return;

    const sentAt = Date.now();
    const next = [...messages, { id: `user-${sentAt}`, role: 'user', text }];

    setMessages(next);
    setDraft('');
    setError(null);

    try {
      const data = await chatWithAgent({
        id: agent.id,
        messages: toApiMessages(next),
      }).unwrap();

      setMessages((current) => [
        ...current,
        { id: `agent-${sentAt}`, role: 'agent', text: data.reply },
      ]);
    } catch (chatError) {
      setMessages((current) =>
        current.filter((message) => message.id !== `user-${sentAt}`),
      );
      setDraft(text);
      setError({
        message: getErrorMessage(chatError),
        needsCredits: chatError?.status === 402,
      });
    }
  };

  return (
    <div className="flex flex-col gap-3">
      <div
        ref={scrollRef}
        className="h-80 overflow-y-auto rounded-xl border bg-background/40 p-3 sm:p-4"
      >
        <ol className="flex flex-col gap-2.5" aria-live="polite">
          {messages.map((message) => (
            <li
              key={message.id}
              className={cn(
                'max-w-[85%] rounded-2xl px-3.5 py-2 text-[13px] leading-relaxed',
                message.role === 'agent'
                  ? 'self-start rounded-tl-md border bg-field'
                  : 'self-end rounded-tr-md bg-brand-tint text-foreground',
              )}
            >
              <span className="sr-only">
                {message.role === 'agent' ? `${agent.name}: ` : 'You: '}
              </span>
              {message.text}
            </li>
          ))}
          {typing ? <TypingIndicator /> : null}
        </ol>
      </div>
      {error ? (
        <FormAlert>
          {error.message}
          {error.needsCredits ? (
            <>
              {' '}
              <Link href="/app/credits" className="underline">
                View credits
              </Link>
            </>
          ) : null}
        </FormAlert>
      ) : null}
      {isFull ? (
        <p className="text-[12.5px] text-ink-3">
          This test chat is full. Reset it to keep testing.
        </p>
      ) : null}
      <form onSubmit={sendMessage} className="flex items-center gap-2">
        <label htmlFor="agent-test-message" className="sr-only">
          Message
        </label>
        <Input
          id="agent-test-message"
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
          placeholder="Type a message to test the agent..."
          autoComplete="off"
        />
        <Button
          type="submit"
          size="icon-lg"
          aria-label="Send message"
          disabled={!draft.trim() || typing || isFull}
        >
          <SendHorizontal aria-hidden="true" />
        </Button>
      </form>
    </div>
  );
}

export function AgentTestChat({ agent }) {
  const [resetCount, setResetCount] = useState(0);
  const { data: platform } = usePublicPlatformQuery();
  const chatRate = platform?.rates.find(
    (rate) => rate.capability === 'agent_chat',
  )?.creditsPerUnit;
  const maxMessages = platform?.settings.agentChatMaxMessages;

  return (
    <Panel
      title="Test agent"
      description={
        chatRate
          ? `Chat with ${agent.name} to check its answers · ${chatRate} ${chatRate === 1 ? 'credit' : 'credits'} per message.`
          : `Chat with ${agent.name} to check its answers.`
      }
      action={
        <div className="flex shrink-0 items-center gap-1.5">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setResetCount((count) => count + 1)}
          >
            <RotateCcw aria-hidden="true" />
            Reset
          </Button>
          <Button variant="outline" size="sm" asChild>
            <Link href={`/app/playground?agentId=${agent.id}`}>
              <Mic aria-hidden="true" />
              Voice test
            </Link>
          </Button>
        </div>
      }
    >
      <ChatWindow
        key={`${agent.id}-${agent.greeting}-${resetCount}`}
        agent={agent}
        maxMessages={maxMessages}
      />
    </Panel>
  );
}
