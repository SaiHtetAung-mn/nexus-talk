import { useEffect, useMemo, useRef, useState } from "react";
import { Plus, Search, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ProfileAvatar } from "@/components/profile-avatar";
import { cn } from "@/lib/utils";
import type { UserPayload } from "@/features/auth/api/types";
import type { ConversationPreview } from "@/features/workspace/api/types";

export type ChatListProps = {
  conversations: ConversationPreview[];
  contacts: UserPayload[];
  selectedConversationId?: string | null;
  onSelectConversation?: (conversationId: string) => void;
  onStartChat?: (contact: UserPayload) => void;
};

function formatRelativeLabel(value: string | null) {
  if (!value) {
    return "";
  }

  const timestamp = new Date(value).getTime();
  if (Number.isNaN(timestamp)) {
    return "";
  }

  const diffMinutes = Math.max(1, Math.round((Date.now() - timestamp) / 60000));

  if (diffMinutes < 60) {
    return `${diffMinutes}m`;
  }

  const diffHours = Math.round(diffMinutes / 60);
  if (diffHours < 24) {
    return `${diffHours}h`;
  }

  const diffDays = Math.round(diffHours / 24);
  return `${diffDays}d`;
}

export function ChatList({
  conversations,
  contacts,
  selectedConversationId,
  onSelectConversation,
  onStartChat,
}: ChatListProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [isStartingChat, setIsStartingChat] = useState(false);
  const [contactQuery, setContactQuery] = useState("");
  const contactInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (!isStartingChat) {
      return;
    }

    const timer = window.setTimeout(() => {
      contactInputRef.current?.focus();
    }, 50);

    return () => window.clearTimeout(timer);
  }, [isStartingChat]);

  const filteredConversations = useMemo(() => {
    const normalized = searchQuery.trim().toLowerCase();
    if (!normalized) {
      return conversations;
    }

    return conversations.filter((conversation) => {
      return (
        conversation.title.toLowerCase().includes(normalized) ||
        conversation.subtitle?.toLowerCase().includes(normalized) ||
        conversation.lastMessageText?.toLowerCase().includes(normalized)
      );
    });
  }, [conversations, searchQuery]);

  const filteredContacts = useMemo(() => {
    const normalized = contactQuery.trim().toLowerCase();
    if (!normalized) {
      return contacts;
    }

    return contacts.filter((contact) => {
      return (
        contact.name.toLowerCase().includes(normalized) ||
        contact.username.toLowerCase().includes(normalized) ||
        contact.email.toLowerCase().includes(normalized)
      );
    });
  }, [contacts, contactQuery]);

  function handleStart(contact: UserPayload) {
    onStartChat?.(contact);
    setIsStartingChat(false);
    setContactQuery("");
  }

  return (
    <div className="flex h-full flex-col bg-background lg:rounded-2xl lg:border lg:bg-card/80 lg:shadow-sm">
      <div className="space-y-3 border-b px-4 py-4">
        <div className="flex items-center gap-2 rounded-lg border border-transparent bg-muted/40 px-3 py-2 focus-within:border-border">
          <Search className="h-4 w-4 text-muted-foreground" />
          <Input
            type="text"
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.target.value)}
            placeholder="Search conversations"
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
                type="button"
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
              placeholder="Search people"
              className="h-9"
            />

            <div className="max-h-56 space-y-1 overflow-y-auto">
              {filteredContacts.length ? (
                filteredContacts.map((contact) => (
                  <button
                    key={contact._id}
                    type="button"
                    onClick={() => handleStart(contact)}
                    className="flex w-full items-center gap-3 rounded-lg border border-transparent px-2 py-2 text-left hover:bg-muted/60"
                  >
                    <ProfileAvatar name={contact.name} email={contact.email} />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold">
                        {contact.name}
                      </p>
                      <p className="truncate text-xs text-muted-foreground">
                        @{contact.username}
                      </p>
                    </div>
                  </button>
                ))
              ) : (
                <p className="px-2 py-3 text-xs text-muted-foreground">
                  No people match "{contactQuery.trim()}".
                </p>
              )}
            </div>
          </div>
        ) : (
          <Button
            type="button"
            size="sm"
            className="w-full justify-start gap-2"
            onClick={() => setIsStartingChat(true)}
          >
            <Plus className="h-4 w-4" />
            Start a chat
          </Button>
        )}
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-4">
        <section className="space-y-3">
          <p className="text-xs font-semibold uppercase text-muted-foreground">
            Recent conversations
          </p>

          {filteredConversations.length ? (
            <div className="space-y-2 text-sm">
              {filteredConversations.map((conversation) => (
                <button
                  key={conversation._id}
                  type="button"
                  onClick={() => onSelectConversation?.(conversation._id)}
                  className={cn(
                    "flex w-full items-start gap-3 rounded-xl border border-transparent p-3 text-left transition",
                    conversation._id === selectedConversationId
                      ? "bg-primary/10 text-primary"
                      : "hover:bg-muted/60",
                  )}
                >
                  <ProfileAvatar
                    name={conversation.title}
                    className="h-10 w-10 text-xs"
                  />
                  <div className="min-w-0 flex-1 space-y-1">
                    <div className="flex items-center justify-between gap-3">
                      <p className="truncate font-semibold">
                        {conversation.title}
                      </p>
                      <span className="shrink-0 text-xs text-muted-foreground">
                        {formatRelativeLabel(conversation.lastMessageAt)}
                      </span>
                    </div>
                    <p className="truncate text-xs text-muted-foreground">
                      {conversation.lastMessageText ??
                        conversation.subtitle ??
                        "No messages yet"}
                    </p>
                  </div>
                </button>
              ))}
            </div>
          ) : (
            <div className="rounded-xl border border-dashed px-4 py-6 text-sm text-muted-foreground">
              No conversations yet. Start with someone from your contacts.
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
