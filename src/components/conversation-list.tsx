"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

type ChatSummary = {
  id: string;
  title: string;
  updatedAt: string;
};

function formatDate(iso: string) {
  const date = new Date(iso);
  const now = new Date();
  const sameDay = date.toDateString() === now.toDateString();
  if (sameDay) {
    return date.toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" });
  }
  return date.toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

export function ConversationList({ chats }: { chats: ChatSummary[] }) {
  const pathname = usePathname();

  if (chats.length === 0) {
    return (
      <p className="px-2 py-4 text-sm text-atlas-slate-400">
        No conversations yet.
      </p>
    );
  }

  return (
    <ul className="flex flex-col gap-1">
      {chats.map((chat) => {
        const href = `/chat/${chat.id}`;
        const isActive = pathname === href;
        return (
          <li key={chat.id}>
            <Link
              href={href}
              className={`flex items-center justify-between gap-2 rounded-lg px-3 py-2.5 text-sm transition ${
                isActive
                  ? "bg-atlas-navy-800 text-white ring-1 ring-inset ring-atlas-lime-400/40"
                  : "text-atlas-slate-300 hover:bg-atlas-navy-800/60 hover:text-white"
              }`}
            >
              <span className="truncate">{chat.title}</span>
              <span className="shrink-0 text-xs text-atlas-slate-400">
                {formatDate(chat.updatedAt)}
              </span>
            </Link>
          </li>
        );
      })}
    </ul>
  );
}
