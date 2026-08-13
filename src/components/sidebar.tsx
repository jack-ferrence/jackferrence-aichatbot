import { AtlasIcon } from "@/components/atlas-icon";
import { NewConversationButton } from "@/components/new-conversation-button";
import { ConversationList } from "@/components/conversation-list";
import { SignOutButton } from "@/components/sign-out-button";

type ChatSummary = {
  id: string;
  title: string;
  updatedAt: string;
};

export function Sidebar({
  chats,
  userEmail,
}: {
  chats: ChatSummary[];
  userEmail: string;
}) {
  return (
    <aside className="flex h-screen w-72 shrink-0 flex-col border-r border-atlas-navy-800 bg-atlas-navy-900">
      <div className="flex items-center gap-2.5 px-5 py-5">
        <AtlasIcon className="h-7 w-7" />
        <span className="text-base font-semibold tracking-tight text-white">
          TakeHome
        </span>
      </div>

      <div className="px-4">
        <NewConversationButton />
      </div>

      <nav className="mt-4 flex-1 overflow-y-auto px-3 pb-4">
        <ConversationList chats={chats} />
      </nav>

      <div className="flex items-center justify-between gap-2 border-t border-atlas-navy-800 px-4 py-4">
        <span className="truncate text-sm text-atlas-slate-300" title={userEmail}>
          {userEmail}
        </span>
        <SignOutButton />
      </div>
    </aside>
  );
}
