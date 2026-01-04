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

const statusItems = [
  { label: "Stack configured", status: "Ready" },
  { label: "Real-time layer", status: "Next up" },
  { label: "Feature modules", status: "Queued" },
];

export function HomePage() {
  return (
    <section className="grid gap-6 lg:grid-cols-[2fr,1fr]">
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
          {statusItems.map((item) => (
            <li
              key={item.label}
              className="flex items-center justify-between rounded-lg border px-3 py-2"
            >
              <span>{item.label}</span>
              <span
                className={
                  item.status === "Ready"
                    ? "font-semibold text-primary"
                    : "text-muted-foreground"
                }
              >
                {item.status}
              </span>
            </li>
          ))}
        </ul>
        <div className="rounded-xl border bg-background/80 p-4 text-sm">
          Kick off authentication and chat flows inside{" "}
          <code className="rounded bg-muted px-1">src/features</code>.
        </div>
      </div>
    </section>
  );
}
