import type { ReactNode } from "react";
import { AtlasIcon } from "@/components/atlas-icon";

export function AuthCard({
  title,
  subtitle,
  children,
  footer,
}: {
  title: string;
  subtitle: string;
  children: ReactNode;
  footer: ReactNode;
}) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-atlas-navy-950 px-4 py-12">
      <div className="w-full max-w-sm">
        <div className="mb-8 flex flex-col items-center gap-3">
          <AtlasIcon className="h-9 w-9" />
          <div className="text-center">
            <p className="text-lg font-semibold tracking-tight text-white">TakeHome</p>
            <p className="text-sm text-atlas-slate-300">{subtitle}</p>
          </div>
        </div>

        <div className="rounded-2xl border border-atlas-navy-700/60 bg-white p-7 shadow-2xl shadow-black/40">
          <h1 className="mb-6 text-lg font-semibold text-atlas-navy-900">{title}</h1>
          {children}
        </div>

        <p className="mt-6 text-center text-sm text-atlas-slate-300">{footer}</p>
      </div>
    </div>
  );
}
