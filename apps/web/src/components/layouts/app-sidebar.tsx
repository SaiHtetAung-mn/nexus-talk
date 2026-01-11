import { Search } from "lucide-react";
import type { NavigationItem } from "@/layouts/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

const chats = [
  { name: "Design Squad", lastMessage: "Reviewed the mockups.", time: "2m" },
  { name: "Alex Chen", lastMessage: "Let's hop on a call?", time: "12m" },
  { name: "Daily Standup", lastMessage: "Recording is uploaded.", time: "1h" },
];

const contacts = [
  { name: "Maya Patel", status: "Available" },
  { name: "Luca Marin", status: "Away" },
  { name: "Austin Wu", status: "Do not disturb" },
];

const recentCalls = [
  { name: "Marketing Weekly", type: "Group call", time: "Yesterday" },
  { name: "Priya Kumar", type: "Video call", time: "Tue" },
  { name: "Dev Sync", type: "Missed", time: "Mon" },
];

type AppSidebarProps = {
  activeSection?: NavigationItem;
  variant?: "desktop" | "mobile";
};

function SidebarContent({
  activeSection,
}: {
  activeSection?: NavigationItem;
}) {
  function renderSection() {
    switch (activeSection?.to) {
      case "/":
        return (
          <>
            <div className="border-b px-4 py-4">
              <div className="flex items-center gap-2 rounded-lg border bg-muted/40 px-3 py-2">
                <Search className="h-4 w-4 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder="Search chats"
                  className="h-auto border-0 bg-transparent p-0 text-sm shadow-none focus-visible:ring-0"
                />
              </div>
              <Button className="mt-4 w-full justify-start gap-2" size="sm">
                Start a chat
              </Button>
            </div>
            <div className="flex-1 space-y-2 px-3 py-4">
              <p className="text-xs uppercase tracking-wide text-muted-foreground">
                Recent chats
              </p>
              {chats.map((chat) => (
                <div
                  key={chat.name}
                  className="rounded-lg border border-transparent px-3 py-2 hover:border-border hover:bg-muted/40"
                >
                  <p className="text-sm font-semibold">{chat.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {chat.lastMessage}
                  </p>
                  <span className="text-[10px] text-muted-foreground">
                    {chat.time}
                  </span>
                </div>
              ))}
            </div>
          </>
        );
      case "/contacts":
        return (
          <div className="flex-1 space-y-3 px-4 py-4">
            <div className="flex items-center justify-between">
              <p className="text-sm font-semibold">Contacts</p>
              <Button variant="ghost" size="sm">
                Invite
              </Button>
            </div>
            {contacts.map((contact) => (
              <div
                key={contact.name}
                className="rounded-lg border border-transparent px-3 py-2 hover:border-border hover:bg-muted/40"
              >
                <p className="text-sm font-semibold">{contact.name}</p>
                <p className="text-xs text-muted-foreground">
                  {contact.status}
                </p>
              </div>
            ))}
          </div>
        );
      case "/calls":
        return (
          <div className="flex-1 space-y-3 px-4 py-4">
            <Button className="w-full justify-center">Start call</Button>
            <p className="text-xs uppercase tracking-wide text-muted-foreground">
              Recent
            </p>
            {recentCalls.map((call) => (
              <div
                key={call.name}
                className="rounded-lg border border-transparent px-3 py-2 hover:border-border hover:bg-muted/40"
              >
                <p className="text-sm font-semibold">{call.name}</p>
                <p className="text-xs text-muted-foreground">{call.type}</p>
                <span className="text-[10px] text-muted-foreground">
                  {call.time}
                </span>
              </div>
            ))}
          </div>
        );
      case "/profile":
        return (
          <div className="flex-1 space-y-3 px-4 py-4">
            <p className="text-sm font-semibold">Account quick links</p>
            <div className="space-y-2">
              <Button variant="outline" className="w-full justify-start">
                Edit profile
              </Button>
              <Button variant="outline" className="w-full justify-start">
                Notification settings
              </Button>
              <Button variant="outline" className="w-full justify-start">
                Privacy & security
              </Button>
            </div>
          </div>
        );
      default:
        return (
          <div className="flex flex-1 flex-col items-center justify-center px-4 py-6 text-center text-sm text-muted-foreground">
            <p>Select a section to see its workspace.</p>
          </div>
        );
    }
  }

  return <div className="flex h-full flex-col">{renderSection()}</div>;
}

export function AppSidebar({ activeSection, variant = "desktop" }: AppSidebarProps) {
  const classes =
    variant === "mobile"
      ? "block w-full md:hidden"
      : "hidden w-72 border-r md:flex";

  return (
    <aside className={classes}>
      <SidebarContent activeSection={activeSection} />
    </aside>
  );
}
