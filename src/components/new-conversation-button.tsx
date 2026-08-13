"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function NewConversationButton() {
  const router = useRouter();
  const [isCreating, setIsCreating] = useState(false);

  async function handleClick() {
    setIsCreating(true);
    try {
      const response = await fetch("/api/chats", { method: "POST" });
      if (!response.ok) return;
      const { chat } = await response.json();
      router.push(`/chat/${chat.id}`);
      router.refresh();
    } finally {
      setIsCreating(false);
    }
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={isCreating}
      className="flex w-full items-center justify-center gap-2 rounded-lg bg-atlas-lime-400 px-3 py-2.5 text-sm font-semibold text-atlas-navy-950 transition hover:bg-atlas-lime-300 disabled:cursor-not-allowed disabled:opacity-60"
    >
      <span aria-hidden="true" className="text-base leading-none">
        +
      </span>
      {isCreating ? "Creating..." : "New conversation"}
    </button>
  );
}
