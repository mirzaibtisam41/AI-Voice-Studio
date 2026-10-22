'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { Mic, RotateCcw, SendHorizontal } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Panel } from '@/components/ui/Panel';
import { findAgentReply } from '@/features/agents/agentReplies';
import { cn } from '@/lib/utils';

const REPLY_DELAY_MS = 1000;

function createGreeting(agent) {
  return [{ id: 'greeting', role: 'agent', text: agent.greeting }];
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

function ChatWindow({ agent }) {
  const [messages, setMessages] = useState(() => createGreeting(agent));
  const [draft, setDraft] = useState('');
  const [typing, setTyping] = useState(false);
  const scrollRef = useRef(null);
  const timersRef = useRef([]);

  useEffect(() => {
    const timers = timersRef.current;

    return () => timers.forEach((timer) => clearTimeout(timer));
  }, []);

  useEffect(() => {
    const container = scrollRef.current;

    if (container) {
      container.scrollTo({ top: container.scrollHeight, behavior: 'smooth' });
    }
  }, [messages.length, typing]);

  const sendMessage = (event) => {
    event.preventDefault();
    const text = draft.trim();

    if (!text || typing) return;

    const sentAt = Date.now();

    setMessages((current) => [
      ...current,
      { id: `user-${sentAt}`, role: 'user', text },
    ]);
    setDraft('');
    setTyping(true);

    timersRef.current.push(
      setTimeout(() => {
        setMessages((current) => [
          ...current,
          { id: `agent-${sentAt}`, role: 'agent', text: findAgentReply(text) },
        ]);
        setTyping(false);
      }, REPLY_DELAY_MS),
    );
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
          disabled={!draft.trim() || typing}
        >
          <SendHorizontal aria-hidden="true" />
        </Button>
      </form>
    </div>
  );
}

export function AgentTestChat({ agent }) {
  const [resetCount, setResetCount] = useState(0);

  return (
    <Panel
      title="Test agent"
      description={`Chat with ${agent.name} to check its answers.`}
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
            <Link href="/app/playground">
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
      />
    </Panel>
  );
}
