import { Plus, Search, Sparkles, MessageSquare, ChevronDown } from "lucide-react";
import { CHAT_HISTORY } from "@/lib/pil-data";

export function ChatSidebar({ onNewChat }: { onNewChat: () => void }) {
  return (
    <aside className="flex h-full w-64 shrink-0 flex-col bg-sidebar text-sidebar-foreground">
      <div className="flex items-center justify-between px-4 py-4">
        <div className="flex items-center gap-2">
          <span className="flex size-7 items-center justify-center rounded-full bg-foreground text-background">
            <Sparkles className="size-4" />
          </span>
          <span className="font-semibold">ChatGPT</span>
        </div>
        <button className="text-muted-foreground transition-colors hover:text-foreground">
          <Search className="size-4" />
        </button>
      </div>

      <button
        onClick={onNewChat}
        className="mx-3 mb-3 flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors hover:bg-sidebar-accent"
      >
        <Plus className="size-4" />
        New chat
      </button>

      <nav className="flex-1 overflow-y-auto px-2 pb-4">
        {Object.entries(CHAT_HISTORY).map(([group, items]) => (
          <div key={group} className="mb-4">
            <p className="px-2 py-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
              {group}
            </p>
            {items.map((item, i) => (
              <button
                key={item}
                className={`flex w-full items-center gap-2 truncate rounded-lg px-2 py-2 text-left text-sm transition-colors hover:bg-sidebar-accent ${
                  group === "Today" && i === 0 ? "bg-sidebar-accent" : ""
                }`}
              >
                <MessageSquare className="size-4 shrink-0 text-muted-foreground" />
                <span className="truncate">{item}</span>
              </button>
            ))}
          </div>
        ))}
      </nav>

      <div className="flex items-center justify-between border-t border-sidebar-border px-3 py-3">
        <div className="flex items-center gap-2">
          <span className="flex size-7 items-center justify-center rounded-full bg-primary/80 text-xs font-semibold text-primary-foreground">
            U
          </span>
          <span className="text-sm">User</span>
        </div>
        <ChevronDown className="size-4 text-muted-foreground" />
      </div>
    </aside>
  );
}
