"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";

export function SignUpForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setIsSubmitting(true);

    const response = await fetch("/api/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    if (!response.ok) {
      const data = await response.json().catch(() => null);
      setError(data?.error ?? "Something went wrong. Please try again.");
      setIsSubmitting(false);
      return;
    }

    const result = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    setIsSubmitting(false);

    if (result?.error) {
      setError("Account created, but sign-in failed. Please sign in manually.");
      return;
    }

    router.push("/");
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div className="flex flex-col gap-1.5">
        <label htmlFor="email" className="text-sm font-medium text-atlas-navy-800">
          Email
        </label>
        <input
          id="email"
          type="email"
          required
          autoComplete="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          className="rounded-lg border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-atlas-navy-900 outline-none transition focus:border-atlas-blue-500 focus:ring-2 focus:ring-atlas-blue-500/20"
        />
      </div>
      <div className="flex flex-col gap-1.5">
        <label htmlFor="password" className="text-sm font-medium text-atlas-navy-800">
          Password
        </label>
        <input
          id="password"
          type="password"
          required
          minLength={8}
          autoComplete="new-password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          className="rounded-lg border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-atlas-navy-900 outline-none transition focus:border-atlas-blue-500 focus:ring-2 focus:ring-atlas-blue-500/20"
        />
        <p className="text-xs text-atlas-slate-400">At least 8 characters.</p>
      </div>

      {error && (
        <p role="alert" className="rounded-lg bg-amber-50 px-3 py-2 text-sm text-amber-700">
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={isSubmitting}
        className="mt-2 rounded-lg bg-atlas-blue-500 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-atlas-blue-400 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {isSubmitting ? "Creating account..." : "Create account"}
      </button>
    </form>
  );
}
