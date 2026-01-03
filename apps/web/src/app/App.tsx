import type { ComponentProps } from "react";

import {
  MessageCircle,
  Phone,
  UsersRound,
  Video,
  type LucideIcon,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { type AppView, useAppStore } from "@/store";

type QuickAction = {
  label: string;
  description: string;
  icon: LucideIcon;
  variant?: ComponentProps<typeof Button>["variant"];
};

type SidebarItem = {
  id: AppView;
  label: string;
  icon: LucideIcon;
};

const sidebarItems: SidebarItem[] = [
  { id: "inbox", label: "Inbox", icon: MessageCircle },
  { id: "calls", label: "Calls", icon: Phone },
  { id: "contacts", label: "Contacts", icon: UsersRound },
];

const quickActions: QuickAction[] = [
  {
    label: "Start chat",
    description: "Kick off a synced conversation",
    icon: MessageCircle,
  },
  {
    label: "Schedule call",
    description: "Send a link for later",
    icon: Phone,
    variant: "secondary",
  },
  {
    label: "Instant video",
    description: "Launch a WebRTC room",
    icon: Video,
    variant: "outline",
  },
];

const roadmapHighlights = [
  {
    title: "Authentication",
    body: "Email + magic link login with social fallback to keep onboarding frictionless.",
  },
  {
    title: "Messaging engine",
    body: "Real-time messaging over WebSockets with optimistic UI and delivery receipts.",
  },
  {
    title: "Video calls",
    body: "WebRTC media, TURN-backed relays, and call summaries once a room ends.",
  },
];

export function App() {
  const { activeView, isSidebarOpen, setActiveView, toggleSidebar } =
    useAppStore();

  return (
    <div className="flex min-h-screen bg-muted/40 text-foreground">
      <aside
        className={cn(
          "hidden border-r bg-background/80 transition-all duration-300 md:flex md:flex-col",
          isSidebarOpen ? "w-72" : "w-20",
        )}
      >
        <div className="flex items-center justify-between border-b px-4 py-6">
          <button
            aria-label="Toggle navigation width"
            className="rounded-md border bg-background px-3 py-2 text-xs font-semibold hover:bg-accent"
            onClick={toggleSidebar}
            type="button"
          >
            {isSidebarOpen ? "Collapse" : "Expand"}
          </button>
          {isSidebarOpen && (
            <span className="text-sm font-semibold">Nexus Talk</span>
          )}
        </div>
        <nav className="flex-1 space-y-1 px-2 py-4">
          {sidebarItems.map((item) => (
            <button
              key={item.id}
              className={cn(
                "flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition hover:bg-accent",
                activeView === item.id
                  ? "bg-primary text-primary-foreground hover:bg-primary"
                  : "text-muted-foreground",
                !isSidebarOpen && "justify-center",
              )}
              onClick={() => setActiveView(item.id)}
              type="button"
            >
              <item.icon className="h-4 w-4" />
              {isSidebarOpen && <span>{item.label}</span>}
            </button>
          ))}
        </nav>
        {isSidebarOpen && (
          <div className="border-t px-4 py-6 text-xs text-muted-foreground">
            v0.1 – Core platform scaffolding
          </div>
        )}
      </aside>

      <main className="flex flex-1 flex-col">
        <header className="flex flex-col gap-4 border-b bg-background/80 px-6 py-6 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm uppercase text-muted-foreground">
              Currently viewing
            </p>
            <h1 className="text-2xl font-semibold capitalize">
              {activeView}
            </h1>
            <p className="text-sm text-muted-foreground">
              Base React system wired with Tailwind, shadcn/ui, and Zustand.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            {quickActions.map((action) => (
              <Button
                key={action.label}
                variant={action.variant}
                className="w-full sm:w-auto"
              >
                <action.icon className="mr-2 h-4 w-4" />
                {action.label}
              </Button>
            ))}
          </div>
        </header>

        <section className="grid flex-1 gap-6 px-6 py-10 lg:grid-cols-[2fr,1fr]">
          <div className="space-y-4 rounded-2xl border bg-card/80 p-6 shadow-sm">
            <p className="text-sm font-semibold uppercase text-muted-foreground">
              Product pillars
            </p>
            <div className="space-y-4">
              {roadmapHighlights.map((item) => (
                <div
                  key={item.title}
                  className="rounded-xl border bg-background/80 p-4"
                >
                  <h2 className="text-lg font-semibold">{item.title}</h2>
                  <p className="text-sm text-muted-foreground">{item.body}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-4 rounded-2xl border bg-card/80 p-6 shadow-sm">
            <p className="text-sm font-semibold uppercase text-muted-foreground">
              System status
            </p>
            <ul className="space-y-3 text-sm">
              <li className="flex items-center justify-between rounded-lg border px-3 py-2">
                <span>Stack configured</span>
                <span className="font-semibold text-primary">Ready</span>
              </li>
              <li className="flex items-center justify-between rounded-lg border px-3 py-2">
                <span>Real-time layer</span>
                <span className="text-muted-foreground">Next up</span>
              </li>
              <li className="flex items-center justify-between rounded-lg border px-3 py-2">
                <span>Feature modules</span>
                <span className="text-muted-foreground">Queued</span>
              </li>
            </ul>
            <div className="rounded-xl border bg-background/80 p-4 text-sm">
              Kick off authentication and chat flows inside{" "}
              <code className="rounded bg-muted px-1">src/features</code>.
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}

export default App;
