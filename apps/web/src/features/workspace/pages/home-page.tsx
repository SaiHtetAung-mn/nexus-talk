import { useState } from "react";

import { ChatList } from "@/features/workspace/components/chat-list";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const conversationDetails: Record<
  string,
  { title: string; participants: string; messages: Array<{ from: string; body: string }> }
> = {
  alex: {
    title: "Alex Chen",
    participants: "You, Alex",
    messages: [
      { from: "Alex", body: "I'll push the call prototype today." },
      { from: "You", body: "Amazing! I'll prep the review deck." },
    ],
  },
  standup: {
    title: "Daily Standup",
    participants: "Design Squad",
    messages: [
      { from: "Nadia", body: "Recording and summary are uploaded." },
      { from: "You", body: "Great, adding them to the notes doc." },
    ],
  },
  marketing: {
    title: "Marketing Weekly",
    participants: "Marketing squad",
    messages: [
      { from: "Priya", body: "Shared the updated messaging docs." },
      { from: "You", body: "Reviewing now, thanks!" },
    ],
  },
};

export function HomePage() {
  const [selectedChatId, setSelectedChatId] = useState<string | null>(null);
  const activeConversation = selectedChatId
    ? conversationDetails[selectedChatId]
    : null;

  const handleBack = () => setSelectedChatId(null);

  return (
    <section className="grid gap-4 lg:grid-cols-[360px,1fr]">
      <div
        className={cn(
          "h-[calc(100vh-7rem)] transition-all duration-300",
          selectedChatId ? "hidden lg:block" : "block",
        )}
      >
        <ChatList
          onSelectChat={(id) => setSelectedChatId(id)}
          selectedChatId={selectedChatId}
        />
      </div>

      <div
        className={cn(
          "flex h-[calc(100vh-7rem)] flex-col rounded-2xl border bg-card/80 shadow-sm transition-all duration-300",
          !selectedChatId && "hidden lg:flex",
        )}
      >
        {activeConversation ? (
          <>
            <div className="flex items-center justify-between border-b px-4 py-3">
              <div>
                <p className="text-base font-semibold">
                  {activeConversation.title}
                </p>
                <p className="text-xs text-muted-foreground">
                  {activeConversation.participants}
                </p>
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
            <div className="flex-1 space-y-3 overflow-y-auto px-4 py-4 text-sm">
              {activeConversation.messages.map((message, index) => (
                <div
                  key={`${message.from}-${index}`}
                  className="rounded-xl border bg-background/80 px-3 py-2"
                >
                  <p className="text-xs font-semibold text-muted-foreground">
                    {message.from}
                  </p>
                  <p>{message.body}</p>
                </div>
              ))}
            </div>
            <div className="border-t px-4 py-3 text-sm text-muted-foreground">
              This is a preview of the conversation layout. Selecting another
              chat updates the view.
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
