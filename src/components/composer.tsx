"use client";

import { useState, type KeyboardEvent } from "react";

export function Composer({
  onSend,
  disabled,
  placeholder = "Message Atlas...",
}: {
  onSend: (content: string) => void;
  disabled?: boolean;
  placeholder?: string;
}) {
  const [value, setValue] = useState("");

  function submit() {
    const trimmed = value.trim();
    if (!trimmed || disabled) return;
    onSend(trimmed);
    setValue("");
  }

  function handleKeyDown(event: KeyboardEvent<HTMLTextAreaElement>) {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      submit();
    }
  }

  return (
    <div className="border-t border-slate-200 bg-white px-4 py-4 sm:px-8">
      <div className="mx-auto flex max-w-3xl items-end gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-2.5 shadow-sm focus-within:border-atlas-blue-500 focus-within:ring-2 focus-within:ring-atlas-blue-500/15">
        <textarea
          value={value}
          onChange={(event) => setValue(event.target.value)}
          onKeyDown={handleKeyDown}
          disabled={disabled}
          rows={1}
          placeholder={placeholder}
          className="max-h-40 flex-1 resize-none bg-transparent px-2.5 py-2 text-sm text-atlas-navy-900 outline-none placeholder:text-atlas-slate-400 disabled:opacity-60"
        />
        <button
          type="button"
          onClick={submit}
          disabled={disabled || !value.trim()}
          className="shrink-0 rounded-xl bg-atlas-blue-500 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-atlas-blue-400 disabled:cursor-not-allowed disabled:opacity-40"
        >
          Send
        </button>
      </div>
      <p className="mx-auto mt-2 max-w-3xl text-center text-xs text-atlas-slate-400">
        Enter to send &middot; Shift+Enter for a new line
      </p>
    </div>
  );
}
