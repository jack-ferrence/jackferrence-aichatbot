import { AtlasIcon } from "@/components/atlas-icon";

export default function WorkspaceLoading() {
  return (
    <div className="flex h-screen w-full items-center justify-center bg-white">
      <div className="flex flex-col items-center gap-3">
        <AtlasIcon className="h-8 w-8 animate-pulse" />
        <p className="text-sm text-atlas-slate-400">Loading workspace...</p>
      </div>
    </div>
  );
}
