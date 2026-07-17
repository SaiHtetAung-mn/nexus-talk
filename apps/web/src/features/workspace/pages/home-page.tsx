import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { ChevronLeft, Phone, Video } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ChatList } from "@/features/workspace/components/chat-list";
import { ProfileAvatar } from "@/components/profile-avatar";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/features/auth/store/auth-store";
import type { UserPayload } from "@/features/auth/api/types";
import { createDirectConversation } from "@/features/workspace/api/create-direct-conversation";
import { discoverUsers } from "@/features/workspace/api/discover-users";
import { listConversations } from "@/features/workspace/api/list-conversations";
import { listMessages } from "@/features/workspace/api/list-messages";
import { sendMessage } from "@/features/workspace/api/send-message";
import { startVideoCall } from "@/features/workspace/api/start-video-call";
import type {
  ConversationPreview,
  WorkspaceMessage,
} from "@/features/workspace/api/types";
import { openCallWindow } from "@/features/workspace/lib/open-call-window";
import { getRealtimeSocket } from "@/features/workspace/lib/realtime-client";

function formatTime(value: string | null) {
  if (!value) {
    return "";
  }

  try {
    return new Intl.DateTimeFormat(undefined, {
      hour: "numeric",
      minute: "2-digit",
    }).format(new Date(value));
  } catch {
    return "";
  }
}

function getSenderLabel(
  message: WorkspaceMessage,
  currentUser: UserPayload | null,
  conversation: ConversationPreview | null,
) {
  if (message.senderId === currentUser?._id) {
    return "You";
  }

  const sender = conversation?.members.find(
    (member) => member._id === message.senderId,
  );

  return sender?.name ?? "Someone";
}

function upsertMessage(
  previous: Record<string, WorkspaceMessage[]>,
  message: WorkspaceMessage,
) {
  const currentMessages = previous[message.conversationId] ?? [];
  if (currentMessages.some((entry) => entry._id === message._id)) {
    return previous;
  }

  return {
    ...previous,
    [message.conversationId]: [...currentMessages, message].sort(
      (left, right) => left.sequence - right.sequence,
    ),
  };
}

export function HomePage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const currentUser = useAuthStore((state) => state.user);
  const selectedConversationId = searchParams.get("chat");
  const [conversations, setConversations] = useState<ConversationPreview[]>([]);
  const [contacts, setContacts] = useState<UserPayload[]>([]);
  const [messagesByConversation, setMessagesByConversation] = useState<
    Record<string, WorkspaceMessage[]>
  >({});
  const [draftMessage, setDraftMessage] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const messageListEndRef = useRef<HTMLDivElement | null>(null);
  const composerInputRef = useRef<HTMLInputElement | null>(null);

  const activeConversation = useMemo(() => {
    if (!selectedConversationId) {
      return null;
    }

    return (
      conversations.find((conversation) => conversation._id === selectedConversationId) ??
      null
    );
  }, [conversations, selectedConversationId]);

  const activeMessages = selectedConversationId
    ? messagesByConversation[selectedConversationId] ?? []
    : [];

  useEffect(() => {
    let active = true;

    async function loadWorkspace() {
      try {
        const [conversationItems, contactItems] = await Promise.all([
          listConversations(),
          discoverUsers(""),
        ]);

        if (!active) {
          return;
        }

        setConversations(conversationItems);
        setContacts(contactItems);
      } catch (error) {
        const message =
          error instanceof Error
            ? error.message
            : "Unable to load workspace right now.";
        toast.error(message);
      } finally {
        if (active) {
          setIsLoading(false);
        }
      }
    }

    void loadWorkspace();

    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    if (!selectedConversationId) {
      return;
    }

    const conversationId = selectedConversationId;

    if (messagesByConversation[conversationId]) {
      return;
    }

    let active = true;

    async function loadConversationMessages() {
      try {
        const items = await listMessages(conversationId);
        if (!active) {
          return;
        }

        setMessagesByConversation((previous) => ({
          ...previous,
          [conversationId]: items,
        }));
      } catch (error) {
        const message =
          error instanceof Error
            ? error.message
            : "Unable to load messages.";
        toast.error(message);
      }
    }

    void loadConversationMessages();

    return () => {
      active = false;
    };
  }, [messagesByConversation, selectedConversationId]);

  useEffect(() => {
    const socket = getRealtimeSocket();

    function handleMessageCreated(message: WorkspaceMessage) {
      setMessagesByConversation((previous) => upsertMessage(previous, message));
    }

    async function handleConversationUpdated(payload: { conversationId: string }) {
      if (!payload.conversationId) {
        return;
      }

      try {
        const items = await listConversations();
        setConversations(items);
      } catch {
        // keep current view if refresh fails
      }
    }

    socket.on("chat.message.created", handleMessageCreated);
    socket.on("chat.conversation.updated", handleConversationUpdated);

    return () => {
      socket.off("chat.message.created", handleMessageCreated);
      socket.off("chat.conversation.updated", handleConversationUpdated);
    };
  }, []);

  useEffect(() => {
    if (!selectedConversationId) {
      return;
    }

    const socket = getRealtimeSocket();
    socket.emit("chat.conversation.join", {
      conversationId: selectedConversationId,
    });
  }, [selectedConversationId]);

  useEffect(() => {
    if (!selectedConversationId) {
      return;
    }

    const timer = window.setTimeout(() => {
      composerInputRef.current?.focus();
      messageListEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, 50);

    return () => window.clearTimeout(timer);
  }, [selectedConversationId]);

  useEffect(() => {
    messageListEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [activeMessages.length]);

  function handleBack() {
    navigate("/", { replace: true });
  }

  function openConversation(conversationId: string) {
    navigate(`/?chat=${encodeURIComponent(conversationId)}`, { replace: true });
  }

  async function handleStartChat(contact: UserPayload) {
    try {
      const conversation = await createDirectConversation(contact._id);
      setConversations((previous) => {
        const exists = previous.some((item) => item._id === conversation._id);
        if (exists) {
          return previous.map((item) =>
            item._id === conversation._id ? conversation : item,
          );
        }

        return [conversation, ...previous];
      });
      openConversation(conversation._id);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Unable to start chat.";
      toast.error(message);
    }
  }

  async function handleSendMessage() {
    if (!selectedConversationId || !draftMessage.trim()) {
      return;
    }

    setIsSending(true);
    try {
      const message = await sendMessage(selectedConversationId, draftMessage);
      setMessagesByConversation((previous) => upsertMessage(previous, message));
      setDraftMessage("");
      const items = await listConversations();
      setConversations(items);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Unable to send message.";
      toast.error(message);
    } finally {
      setIsSending(false);
    }
  }

  async function handleStartVideoCall() {
    if (!selectedConversationId) {
      return;
    }

    const popup = openCallWindow();
    if (popup.isPopupBlocked) {
      toast.message("Popup was blocked. Opening call in this tab.");
    }

    try {
      const call = await startVideoCall(selectedConversationId);
      toast.success("Video call started");
      popup.navigateTo(call._id);
    } catch (error) {
      popup.close();
      const message =
        error instanceof Error ? error.message : "Unable to start video call.";
      toast.error(message);
    }
  }

  return (
    <section className="-mx-4 -my-4 grid gap-0 bg-background lg:mx-0 lg:my-0 lg:grid-cols-[360px,1fr] lg:gap-4 lg:bg-transparent">
      <div
        className={cn(
          "h-[calc(100vh-7rem)]",
          selectedConversationId ? "hidden lg:block" : "block",
        )}
      >
        <ChatList
          conversations={conversations}
          contacts={contacts}
          selectedConversationId={selectedConversationId}
          onSelectConversation={openConversation}
          onStartChat={handleStartChat}
        />
      </div>

      <div
        className={cn(
          "flex flex-col bg-background lg:h-[calc(100vh-7rem)] lg:rounded-2xl lg:border lg:bg-card/80 lg:shadow-sm",
          !selectedConversationId && "hidden lg:flex",
          selectedConversationId &&
            "fixed inset-0 z-40 h-[100dvh] lg:static lg:inset-auto lg:z-auto",
        )}
      >
        {activeConversation ? (
          <>
            <div className="sticky top-0 z-10 flex items-center justify-between border-b bg-background/95 px-4 py-3 backdrop-blur lg:static lg:bg-transparent lg:backdrop-blur-none">
              <div className="flex items-center gap-3">
                <Button
                  type="button"
                  size="icon"
                  variant="ghost"
                  className="-ml-2 lg:hidden"
                  onClick={handleBack}
                  aria-label="Back"
                >
                  <ChevronLeft className="h-5 w-5" />
                </Button>
                <ProfileAvatar
                  name={activeConversation.title}
                  className="h-12 w-12 text-sm"
                />
                <div>
                  <p className="text-base font-semibold">
                    {activeConversation.title}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {activeConversation.subtitle
                      ? `@${activeConversation.subtitle}`
                      : "Conversation"}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-1">
                <Button
                  type="button"
                  size="icon"
                  variant="ghost"
                  aria-label="Start audio call"
                >
                  <Phone className="h-5 w-5" />
                </Button>
                <Button
                  type="button"
                  size="icon"
                  variant="ghost"
                  aria-label="Start video call"
                  onClick={handleStartVideoCall}
                >
                  <Video className="h-5 w-5" />
                </Button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto px-4 py-4 text-sm">
              {activeMessages.length ? (
                <div className="flex flex-col gap-3">
                  {activeMessages.map((message, index) => {
                    const senderLabel = getSenderLabel(
                      message,
                      currentUser,
                      activeConversation,
                    );
                    const isSelf = message.senderId === currentUser?._id;
                    const previous = activeMessages[index - 1];
                    const next = activeMessages[index + 1];
                    const isFirstInGroup = previous?.senderId !== message.senderId;
                    const isLastInGroup = next?.senderId !== message.senderId;

                    return (
                      <div
                        key={message._id}
                        className={cn(
                          "flex w-full gap-2",
                          isSelf ? "justify-end" : "justify-start",
                        )}
                      >
                        {!isSelf && isFirstInGroup ? (
                          <ProfileAvatar
                            name={senderLabel}
                            className="mt-auto h-8 w-8 text-[10px]"
                          />
                        ) : !isSelf ? (
                          <div className="w-8 shrink-0" />
                        ) : null}

                        <div
                          className={cn(
                            "flex max-w-[78%] flex-col space-y-1",
                            isSelf && "items-end text-right",
                          )}
                        >
                          {isFirstInGroup ? (
                            <p className="px-1 text-xs text-muted-foreground">
                              {senderLabel}
                            </p>
                          ) : null}
                          <div
                            className={cn(
                              "rounded-2xl px-4 py-3",
                              isSelf
                                ? "bg-primary text-primary-foreground"
                                : "bg-muted text-foreground",
                              !isLastInGroup && "rounded-b-md",
                            )}
                          >
                            <p className="whitespace-pre-wrap leading-6">
                              {message.body}
                            </p>
                          </div>
                          {isLastInGroup ? (
                            <p className="px-1 text-[11px] text-muted-foreground">
                              {formatTime(message.createdAt)}
                            </p>
                          ) : null}
                        </div>
                      </div>
                    );
                  })}
                  <div ref={messageListEndRef} />
                </div>
              ) : (
                <div className="flex h-full min-h-[360px] items-center justify-center text-center text-sm text-muted-foreground">
                  Start the conversation with {activeConversation.title}.
                </div>
              )}
            </div>

            <div className="border-t bg-background/90 px-4 py-3 lg:bg-transparent">
              <div className="flex items-end gap-3">
                <Input
                  ref={composerInputRef}
                  value={draftMessage}
                  onChange={(event) => setDraftMessage(event.target.value)}
                  onKeyDown={(event) => {
                    if (event.key === "Enter" && !event.shiftKey) {
                      event.preventDefault();
                      void handleSendMessage();
                    }
                  }}
                  className="min-h-11"
                  placeholder={`Message ${activeConversation.title}`}
                />
                <Button
                  type="button"
                  onClick={() => void handleSendMessage()}
                  disabled={isSending || !draftMessage.trim()}
                >
                  {isSending ? "Sending..." : "Send"}
                </Button>
              </div>
            </div>
          </>
        ) : (
          <div className="hidden h-full items-center justify-center text-center text-sm text-muted-foreground lg:flex">
            {isLoading
              ? "Loading conversations..."
              : "Pick a conversation or start a new chat from the sidebar."}
          </div>
        )}
      </div>
    </section>
  );
}
