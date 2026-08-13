"use client";

import { useEffect } from "react";

export default function WorkspaceError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex h-screen w-full flex-col items-center justify-center gap-4 bg-white px-6 text-center">
      <p className="text-sm font-medium text-amber-700">
        Something went wrong loading Atlas Chat.
      </p>
      <button
        type="button"
        onClick={reset}
        className="rounded-lg bg-atlas-blue-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-atlas-blue-400"
      >
        Try again
      </button>
    </div>
  );
}
