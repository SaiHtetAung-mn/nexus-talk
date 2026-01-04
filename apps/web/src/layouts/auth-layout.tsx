import { Outlet } from "react-router-dom";
import { MessageCircle, Sparkles, Video } from "lucide-react";

const highlights = [
  {
    label: "Drop-in chats",
    description: "Spin up conversations instantly and keep history synced.",
    icon: MessageCircle,
  },
  {
    label: "Room-ready video",
    description: "Hop into playful WebRTC rooms with a single tap.",
    icon: Video,
  },
  {
    label: "Expressive presence",
    description: "Share vibes, statuses, and moods with fun badges.",
    icon: Sparkles,
  },
];

export function AuthLayout() {
  return (
    <div className="flex min-h-screen bg-background">
      <section className="hidden w-full max-w-lg flex-col justify-between border-r bg-gradient-to-br from-primary/15 via-primary/10 to-transparent px-10 py-12 lg:flex">
        <div className="space-y-4">
          <div className="inline-flex items-center gap-2 rounded-full border border-primary/40 bg-primary/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.3em] text-primary">
            Nexus Talk
          </div>
          <h1 className="text-3xl font-semibold text-foreground">
            Chat, call, vibe.
          </h1>
          <p className="text-sm text-muted-foreground">
            Fun, consumer-first messaging with instant calls and playful
            presence indicators.
          </p>
        </div>
        <div className="space-y-5">
          {highlights.map((item) => (
            <div
              key={item.label}
              className="flex items-start gap-4 rounded-2xl border bg-background/80 p-4"
            >
              <span className="rounded-full bg-primary/10 p-2 text-primary">
                <item.icon className="h-4 w-4" />
              </span>
              <div>
                <p className="text-base font-semibold text-foreground">
                  {item.label}
                </p>
                <p className="text-sm text-muted-foreground">
                  {item.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="flex flex-1 items-center justify-center px-6 py-12">
        <div className="w-full max-w-md rounded-3xl border bg-card/95 p-8 shadow-2xl">
          <header className="mb-6 text-center">
            <p className="text-xs uppercase tracking-[0.4em] text-primary">
              Welcome back
            </p>
          </header>
          <Outlet />
        </div>
      </section>
    </div>
  );
}
