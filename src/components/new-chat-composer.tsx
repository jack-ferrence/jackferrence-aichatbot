"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Composer } from "@/components/composer";
import { pendingMessageKey } from "@/lib/pending-message";

export function NewChatComposer() {
  const router = useRouter();
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSend(content: string) {
    setError(null);
    setIsCreating(true);

    const chatResponse = await fetch("/api/chats", { method: "POST" });
    if (!chatResponse.ok) {
      setError("Failed to start a conversation. Please try again.");
      setIsCreating(false);
      return;
    }
    const { chat } = await chatResponse.json();

    // Hand the first message off to the chat view itself (via sessionStorage)
    // so it goes through the same send/error/retry path as every later
    // message, instead of duplicating that logic here.
    sessionStorage.setItem(pendingMessageKey(chat.id), content);
    router.push(`/chat/${chat.id}`);
  }

  return (
    <div className="flex h-screen flex-1 flex-col">
      <div className="flex flex-1 flex-col items-center justify-center px-6 text-center">
        <h1 className="text-2xl font-semibold tracking-tight text-atlas-navy-900">
          What can Atlas help you solve?
        </h1>
        <p className="mt-2 max-w-md text-sm text-atlas-slate-400">
          Start a new conversation below. Every message is scoped to your account.
        </p>
        {error && (
          <p role="alert" className="mt-4 rounded-lg bg-amber-50 px-3 py-2 text-sm text-amber-700">
            {error}
          </p>
        )}
      </div>
      <Composer onSend={handleSend} disabled={isCreating} placeholder="Ask Atlas anything..." />
    </div>
  );
}
