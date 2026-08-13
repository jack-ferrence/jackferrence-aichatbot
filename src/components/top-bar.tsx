export function TopBar({ title }: { title: string }) {
  return (
    <header className="flex items-center justify-between border-b border-slate-200 px-6 py-4 sm:px-8">
      <h1 className="truncate text-sm font-semibold text-atlas-navy-900">{title}</h1>
      <div className="flex shrink-0 items-center gap-1.5 rounded-full border border-slate-200 bg-slate-50 px-3 py-1">
        <span className="h-1.5 w-1.5 rounded-full bg-atlas-lime-400" />
        <span className="text-xs font-medium text-atlas-slate-400">Secure workspace</span>
      </div>
    </header>
  );
}
