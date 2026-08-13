"use client";

import { signOut } from "next-auth/react";

export function SignOutButton() {
  return (
    <button
      type="button"
      onClick={() => signOut({ callbackUrl: "/sign-in" })}
      className="rounded-lg border border-atlas-navy-700 px-3 py-1.5 text-xs font-medium text-atlas-slate-300 transition hover:border-atlas-blue-400 hover:text-white"
    >
      Sign out
    </button>
  );
}
