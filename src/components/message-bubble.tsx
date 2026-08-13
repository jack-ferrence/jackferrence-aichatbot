import { AtlasIcon } from "@/components/atlas-icon";

export type MessageRole = "user" | "assistant";

export function MessageBubble({
  role,
  content,
}: {
  role: MessageRole;
  content: string;
}) {
  const isUser = role === "user";

  return (
    <div className={`flex gap-3 ${isUser ? "justify-end" : "justify-start"}`}>
      {!isUser && (
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-atlas-navy-900">
          <AtlasIcon className="h-4 w-4" />
        </div>
      )}
      <div
        className={`max-w-[75%] whitespace-pre-wrap rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
          isUser
            ? "bg-atlas-blue-500 text-white"
            : "border border-slate-200 bg-slate-50 text-atlas-navy-900"
        }`}
      >
        {content}
      </div>
    </div>
  );
}
