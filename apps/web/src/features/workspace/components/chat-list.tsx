import { Search, Plus } from "lucide-react";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const pinnedChats = [
  {
    title: "Design Squad",
    description: "Exploring playful video call UI.",
    status: "Active",
  },
  {
    title: "Product Insights",
    description: "Research notes for new chat flows.",
    status: "Pinned",
  },
];

const recentChats = [
  {
    id: "alex",
    name: "Alex Chen",
    snippet: "I'll push the call prototype today.",
    timestamp: "2m ago",
  },
  {
    id: "standup",
    name: "Daily Standup",
    snippet: "Recording and summary are ready.",
    timestamp: "1h ago",
  },
  {
    id: "marketing",
    name: "Marketing Weekly",
    snippet: "Shared the updated messaging docs.",
    timestamp: "3h ago",
  },
];

export type ChatListProps = {
  onSelectChat?: (chatId: string) => void;
  selectedChatId?: string | null;
};

export function ChatList({ onSelectChat, selectedChatId }: ChatListProps) {
  return (
    <div className="flex h-full flex-col rounded-2xl border bg-card/80 shadow-sm">
      <div className="space-y-3 border-b px-4 py-4">
        <div className="flex items-center gap-2 rounded-lg border bg-muted/40 px-3 py-2">
          <Search className="h-4 w-4 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Search chats"
            className="h-auto border-0 bg-transparent p-0 text-sm shadow-none focus-visible:ring-0"
          />
        </div>
        <Button size="sm" className="w-full justify-start gap-2">
          <Plus className="h-4 w-4" />
          Start a chat
        </Button>
      </div>
      <div className="flex-1 space-y-6 overflow-y-auto px-4 py-4">
        <section className="space-y-3">
          <div>
            <p className="text-sm font-semibold uppercase text-muted-foreground">
              Pinned
            </p>
            <p className="text-sm text-muted-foreground">
              Rooms you keep close to the top.
            </p>
          </div>
          {pinnedChats.map((chat) => (
            <div
              key={chat.title}
              className="rounded-xl border border-transparent bg-background/80 px-3 py-3 transition hover:border-border hover:bg-background"
            >
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold">{chat.title}</h3>
                <span className="text-xs text-muted-foreground">
                  {chat.status}
                </span>
              </div>
              <p className="text-xs text-muted-foreground">
                {chat.description}
              </p>
            </div>
          ))}
        </section>

        <section className="space-y-3">
          <div>
            <p className="text-sm font-semibold uppercase text-muted-foreground">
              Recents
            </p>
            <p className="text-sm text-muted-foreground">
              Conversations you&apos;ve touched today.
            </p>
          </div>
          <div className="divide-y divide-border text-sm">
          {recentChats.map((chat) => (
            <button
              key={chat.id}
              type="button"
              onClick={() => onSelectChat?.(chat.id)}
              className={cn(
                "flex w-full flex-col space-y-1 rounded-lg px-3 py-2 text-left transition",
                chat.id === selectedChatId
                  ? "bg-primary/10 text-primary"
                  : "hover:bg-muted/40",
              )}
            >
              <div className="flex items-center justify-between">
                <p className="font-semibold">{chat.name}</p>
                <span className="text-xs text-muted-foreground">
                  {chat.timestamp}
                </span>
              </div>
              <p className="text-xs text-muted-foreground">{chat.snippet}</p>
            </button>
          ))}
          </div>
        </section>
      </div>
    </div>
  );
}
