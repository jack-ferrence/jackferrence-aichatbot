"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { TopBar } from "@/components/top-bar";
import { MessageBubble, type MessageRole } from "@/components/message-bubble";
import { Composer } from "@/components/composer";
import { AtlasIcon } from "@/components/atlas-icon";
import { pendingMessageKey } from "@/lib/pending-message";

type Message = {
  id: string;
  role: MessageRole;
  content: string;
};

export function ChatView({
  chatId,
  title,
  initialMessages,
}: {
  chatId: string;
  title: string;
  initialMessages: Message[];
}) {
  const router = useRouter();
  const [messages, setMessages] = useState(initialMessages);
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const scrollAnchorRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollAnchorRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isSending]);

  // Conversations started from the empty state hand off their first
  // message here, so it goes through the same send/error/retry path as
  // every later message instead of a separate code path on the home page.
  useEffect(() => {
    const key = pendingMessageKey(chatId);
    const pending = sessionStorage.getItem(key);
    if (!pending) return;
    sessionStorage.removeItem(key);
    handleSend(pending);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [chatId]);

  async function handleSend(content: string) {
    setError(null);
    setMessages((current) => [
      ...current,
      { id: `pending-${Date.now()}`, role: "user", content },
    ]);
    setIsSending(true);

    try {
      const response = await fetch(`/api/chats/${chatId}/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content }),
      });

      if (!response.ok) {
        const data = await response.json().catch(() => null);
        throw new Error(data?.error ?? "Failed to send message");
      }

      const data = await response.json();
      setMessages((current) => [
        ...current.slice(0, -1),
        data.userMessage,
        data.assistantMessage,
      ]);
      router.refresh();
    } catch (err) {
      setMessages((current) => current.slice(0, -1));
      setError(err instanceof Error ? err.message : "Failed to send message");
    } finally {
      setIsSending(false);
    }
  }

  return (
    <div className="flex h-screen flex-1 flex-col">
      <TopBar title={title} />

      <div className="flex-1 overflow-y-auto px-4 py-6 sm:px-8">
        <div className="mx-auto flex max-w-3xl flex-col gap-5">
          {messages.map((message) => (
            <MessageBubble key={message.id} role={message.role} content={message.content} />
          ))}

          {isSending && (
            <div className="flex items-center gap-3">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-atlas-navy-900">
                <AtlasIcon className="h-4 w-4" />
              </div>
              <div className="flex items-center gap-1.5 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm text-atlas-slate-400">
                <span className="animate-pulse">Thinking...</span>
              </div>
            </div>
          )}

          {error && (
            <p role="alert" className="rounded-lg bg-amber-50 px-3 py-2 text-sm text-amber-700">
              {error}
            </p>
          )}

          <div ref={scrollAnchorRef} />
        </div>
      </div>

      <Composer onSend={handleSend} disabled={isSending} />
    </div>
  );
}
