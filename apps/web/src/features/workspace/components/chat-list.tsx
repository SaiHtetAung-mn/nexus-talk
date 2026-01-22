import { useEffect, useMemo, useRef, useState } from "react";
import { Search, Plus, X } from "lucide-react";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { ProfileAvatar } from "@/components/profile-avatar";

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

export type ChatListRecent = {
  id: string;
  name: string;
  snippet?: string;
  timestamp?: string;
};

export type ChatListContact = {
  id: string;
  name: string;
  subtitle?: string;
};

export type ChatListProps = {
  onSelectChat?: (chatId: string) => void;
  selectedChatId?: string | null;
  recents: ChatListRecent[];
  contacts: ChatListContact[];
  onStartChat?: (contact: ChatListContact) => void;
};

export function ChatList({
  onSelectChat,
  selectedChatId,
  recents,
  contacts,
  onStartChat,
}: ChatListProps) {
  const [isStartingChat, setIsStartingChat] = useState(false);
  const [contactQuery, setContactQuery] = useState("");
  const contactInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (!isStartingChat) return;
    const id = setTimeout(() => contactInputRef.current?.focus(), 50);
    return () => clearTimeout(id);
  }, [isStartingChat]);

  const filteredContacts = useMemo(() => {
    const normalized = contactQuery.trim().toLowerCase();
    if (!normalized) return contacts;
    return contacts.filter((contact) => {
      return (
        contact.name.toLowerCase().includes(normalized) ||
        (contact.subtitle?.toLowerCase().includes(normalized) ?? false)
      );
    });
  }, [contactQuery, contacts]);

  function handleStartChat(contact: ChatListContact) {
    onStartChat?.(contact);
    setIsStartingChat(false);
    setContactQuery("");
  }

  return (
    <div className="flex h-full flex-col bg-background lg:rounded-2xl lg:border lg:bg-card/80 lg:shadow-sm">
      <div className="space-y-3 border-b px-4 py-4 lg:border-b">
        <div className="flex items-center gap-2 rounded-lg border border-transparent bg-muted/40 px-3 py-2 focus-within:border-border">
          <Search className="h-4 w-4 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Search chats"
            className="h-auto border-0 bg-transparent p-0 text-sm shadow-none focus-visible:ring-0 focus-visible:ring-offset-0 focus-visible:outline-none"
          />
        </div>

        {isStartingChat ? (
          <div className="space-y-2 rounded-xl border bg-background/70 p-3">
            <div className="flex items-center justify-between gap-2">
              <p className="text-xs font-semibold uppercase text-muted-foreground">
                New chat
              </p>
              <Button
                size="sm"
                variant="ghost"
                className="h-8 px-2"
                onClick={() => {
                  setIsStartingChat(false);
                  setContactQuery("");
                }}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            <Input
              ref={contactInputRef}
              value={contactQuery}
              onChange={(event) => setContactQuery(event.target.value)}
              placeholder="Search contacts"
              className="h-9"
            />
            <div className="max-h-48 space-y-1 overflow-y-auto">
              {filteredContacts.length ? (
                filteredContacts.map((contact) => (
                  <button
                    key={contact.id}
                    type="button"
                    onClick={() => handleStartChat(contact)}
                    className="flex w-full items-center gap-3 rounded-lg border border-transparent px-2 py-2 text-left hover:bg-muted/60"
                  >
                    <ProfileAvatar name={contact.name} className="h-8 w-8 text-[10px]" />
                    <div className="flex-1">
                      <p className="text-sm font-semibold">{contact.name}</p>
                      {contact.subtitle ? (
                        <p className="text-xs text-muted-foreground">
                          {contact.subtitle}
                        </p>
                      ) : null}
                    </div>
                  </button>
                ))
              ) : (
                <p className="px-2 py-3 text-xs text-muted-foreground">
                  No contacts match "{contactQuery.trim()}".
                </p>
              )}
            </div>
          </div>
        ) : (
          <Button
            size="sm"
            className="w-full justify-start gap-2"
            onClick={() => setIsStartingChat(true)}
          >
            <Plus className="h-4 w-4" />
            Start a chat
          </Button>
        )}
      </div>
      <div className="flex-1 space-y-6 overflow-y-auto px-4 py-4">
        <section className="space-y-3">
          <div>
            <p className="text-xs font-semibold uppercase text-muted-foreground">
              Pinned
            </p>
          </div>
          {pinnedChats.map((chat) => (
            <div
              key={chat.title}
              className="rounded-xl border border-transparent bg-background/80 px-3 py-3 hover:border-border hover:bg-background"
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
            <p className="text-xs font-semibold uppercase text-muted-foreground">
              Recents
            </p>
          </div>
          <div className="text-sm">
            {recents.map((chat) => (
              <button
                key={chat.id}
                type="button"
                onClick={() => onSelectChat?.(chat.id)}
                className={cn(
                  "flex w-full items-start gap-3 rounded-xl border border-transparent p-3 text-left transition",
                  chat.id === selectedChatId && "bg-primary/10 text-primary",
                  chat.id !== selectedChatId && "hover:bg-muted/60"
                )}
              >
                <ProfileAvatar
                  name={chat.name}
                  className="h-10 w-10 text-xs"
                />
                <div className="flex-1 space-y-1">
                  <div className="flex items-center justify-between">
                    <p className="font-semibold">{chat.name}</p>
                    <span className="text-xs text-muted-foreground">
                      {chat.timestamp ?? ""}
                    </span>
                  </div>
                  {chat.snippet ? (
                    <p className="text-xs text-muted-foreground">
                      {chat.snippet}
                    </p>
                  ) : null}
                </div>
              </button>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
