import { useEffect, useMemo, useRef, useState } from "react";

import { ChatList } from "@/features/workspace/components/chat-list";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { ProfileAvatar } from "@/components/profile-avatar";

import type {
  ChatListContact,
  ChatListRecent,
} from "@/features/workspace/components/chat-list";

type ConversationMessage = { from: string; body: string };
type Conversation = {
  id: string;
  title: string;
  participants: string;
  messages: ConversationMessage[];
};

function makeMessage(from: string, body: string): ConversationMessage {
  return { from, body };
}

function formatTime(value: string | number | Date) {
  try {
    const date = value instanceof Date ? value : new Date(value);
    return new Intl.DateTimeFormat(undefined, {
      hour: "numeric",
      minute: "2-digit",
    }).format(date);
  } catch {
    return "";
  }
}

const initialConversations: Record<string, Conversation> = {
  alex: {
    id: "alex",
    title: "Alex Chen",
    participants: "You, Alex",
    messages: [
      makeMessage("Alex", "I'll push the call prototype today."),
      makeMessage("You", "Amazing! I'll prep the review deck."),
    ],
  },
  standup: {
    id: "standup",
    title: "Daily Standup",
    participants: "Design Squad",
    messages: [
      makeMessage("Nadia", "Recording and summary are uploaded."),
      makeMessage("You", "Great, adding them to the notes doc."),
    ],
  },
  marketing: {
    id: "marketing",
    title: "Marketing Weekly",
    participants: "Marketing squad",
    messages: [
      makeMessage("Priya", "Shared the updated messaging docs."),
      makeMessage("You", "Reviewing now, thanks!"),
    ],
  },
};

const initialRecents: ChatListRecent[] = [
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

const contactsSeed: ChatListContact[] = [
  { id: "alex", name: "Alex Chen", subtitle: "Designer" },
  { id: "nadia", name: "Nadia Patel", subtitle: "Ops" },
  { id: "priya", name: "Priya Singh", subtitle: "Marketing" },
  { id: "sam", name: "Sam Rivera", subtitle: "Engineering" },
];

export function HomePage() {
  const [selectedChatId, setSelectedChatId] = useState<string | null>(null);
  const [recents, setRecents] = useState<ChatListRecent[]>(initialRecents);
  const [conversations, setConversations] = useState<Record<string, Conversation>>(
    initialConversations,
  );
  const [draftMessage, setDraftMessage] = useState("");
  const messageListEndRef = useRef<HTMLDivElement | null>(null);
  const composerInputRef = useRef<HTMLInputElement | null>(null);

  const activeConversation = useMemo(() => {
    if (!selectedChatId) return null;
    return conversations[selectedChatId] ?? null;
  }, [selectedChatId, conversations]);

  useEffect(() => {
    if (!selectedChatId) return;
    const id = setTimeout(() => {
      composerInputRef.current?.focus();
      messageListEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, 50);
    return () => clearTimeout(id);
  }, [selectedChatId]);

  useEffect(() => {
    if (!selectedChatId) return;
    messageListEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [selectedChatId, activeConversation?.messages.length]);

  const handleBack = () => setSelectedChatId(null);

  function ensureRecentAtTop(chat: ChatListRecent) {
    setRecents((prev) => {
      const without = prev.filter((item) => item.id !== chat.id);
      return [chat, ...without];
    });
  }

  function handleStartChat(contact: ChatListContact) {
    setConversations((prev) => {
      if (prev[contact.id]) return prev;
      const created: Conversation = {
        id: contact.id,
        title: contact.name,
        participants: `You, ${contact.name.split(" ")[0] ?? contact.name}`,
        messages: [],
      };
      return { ...prev, [contact.id]: created };
    });

    ensureRecentAtTop({
      id: contact.id,
      name: contact.name,
      snippet: "Say hello 👋",
      timestamp: "now",
    });

    setSelectedChatId(contact.id);
  }

  function handleSendMessage() {
    if (!selectedChatId) return;
    const body = draftMessage.trim();
    if (!body) return;

    setConversations((prev) => {
      const current = prev[selectedChatId];
      if (!current) return prev;
      const next: Conversation = {
        ...current,
        messages: [...current.messages, makeMessage("You", body)],
      };
      return { ...prev, [selectedChatId]: next };
    });

    ensureRecentAtTop({
      id: selectedChatId,
      name: activeConversation?.title ?? "Conversation",
      snippet: body,
      timestamp: "now",
    });

    setDraftMessage("");
  }

  return (
    <section className="grid gap-4 lg:grid-cols-[360px,1fr]">
      <div
        className={cn(
          "h-[calc(100vh-7rem)]",
          selectedChatId ? "hidden lg:block" : "block",
        )}
      >
        <ChatList
          onSelectChat={(id) => setSelectedChatId(id)}
          selectedChatId={selectedChatId}
          recents={recents}
          contacts={contactsSeed}
          onStartChat={handleStartChat}
        />
      </div>

      <div
        className={cn(
          "flex h-[calc(100vh-7rem)] flex-col rounded-2xl border bg-card/80 shadow-sm",
          !selectedChatId && "hidden lg:flex",
        )}
      >
        {activeConversation ? (
          <>
            <div className="flex items-center justify-between border-b px-4 py-3">
              <div className="flex items-center gap-3">
                <ProfileAvatar
                  name={activeConversation.title}
                  className="h-12 w-12 text-sm"
                />
                <div>
                  <p className="text-base font-semibold">
                    {activeConversation.title}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {activeConversation.participants}
                  </p>
                </div>
              </div>
              <Button
                size="sm"
                variant="ghost"
                className="lg:hidden"
                onClick={handleBack}
              >
                Back
              </Button>
            </div>
            <div className="flex-1 overflow-y-auto px-4 py-4 text-sm">
              {activeConversation.messages.length ? (
                <div className="flex flex-col gap-3">
                  {activeConversation.messages.map((message, index) => {
                    const isSelf = message.from === "You";
                    const previous = activeConversation.messages[index - 1];
                    const next = activeConversation.messages[index + 1];
                    const isFirstInGroup = previous?.from !== message.from;
                    const isLastInGroup = next?.from !== message.from;
                    const showAvatar = isFirstInGroup;
                    const avatarName = isSelf ? "You" : message.from;
                    const isLastMessage = index === activeConversation.messages.length - 1;

                    return (
                      <div
                        key={`${message.from}-${index}`}
                        className={cn(
                          "flex items-end gap-2",
                          isSelf ? "justify-end" : "justify-start",
                        )}
                      >
                        {!isSelf ? (
                          <div className={cn("w-9", !showAvatar && "invisible")}>
                            <ProfileAvatar
                              name={avatarName}
                              className="h-9 w-9 text-[10px]"
                            />
                          </div>
                        ) : null}

                        <div className={cn("max-w-[78%]", isSelf ? "items-end" : "items-start")}>
                          {!isSelf && isFirstInGroup ? (
                            <p className="mb-1 pl-1 text-[11px] font-semibold text-muted-foreground">
                              {message.from}
                            </p>
                          ) : null}

                          <div
                            className={cn(
                              "rounded-2xl px-3 py-2",
                              isSelf
                                ? "bg-primary text-primary-foreground"
                                : "bg-muted/70 text-foreground",
                              isSelf ? "rounded-br-md" : "rounded-bl-md",
                              isFirstInGroup && (isSelf ? "rounded-tr-2xl" : "rounded-tl-2xl"),
                              !isFirstInGroup && (isSelf ? "rounded-tr-md" : "rounded-tl-md"),
                            )}
                          >
                            <p className="whitespace-pre-wrap break-words leading-relaxed">
                              {message.body}
                            </p>
                          </div>

                          {isLastInGroup ? (
                            <div
                              className={cn(
                                "mt-1 px-1 text-[11px] text-muted-foreground",
                                isSelf ? "text-right" : "text-left",
                              )}
                            >
                              {formatTime(new Date())}
                              {isSelf && isLastMessage ? " · Seen" : ""}
                            </div>
                          ) : null}
                        </div>

                        {isSelf ? (
                          <div className={cn("w-9", !showAvatar && "invisible")}>
                            <ProfileAvatar
                              name={avatarName}
                              className="h-9 w-9 text-[10px]"
                            />
                          </div>
                        ) : null}
                      </div>
                    );
                  })}
                  <div ref={messageListEndRef} />
                </div>
              ) : (
                <div className="rounded-xl border border-dashed bg-background/60 px-4 py-6 text-center text-xs text-muted-foreground">
                  No messages yet. Send the first message to start the conversation.
                </div>
              )}
            </div>
            <div className="border-t px-4 py-3">
              <div className="flex items-center gap-2">
                <Input
                  ref={composerInputRef}
                  value={draftMessage}
                  onChange={(event) => setDraftMessage(event.target.value)}
                  placeholder="Type a message"
                  className="h-10"
                  onKeyDown={(event) => {
                    if (event.key === "Enter") handleSendMessage();
                  }}
                />
                <Button onClick={handleSendMessage} disabled={!draftMessage.trim()}>
                  Send
                </Button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex flex-1 items-center justify-center px-6 text-center text-sm text-muted-foreground">
            Select a conversation on the left to open it.
          </div>
        )}
      </div>
    </section>
  );
}
