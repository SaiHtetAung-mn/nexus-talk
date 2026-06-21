import { Outlet } from "react-router-dom";
import { MessageCircle } from "lucide-react";

import { MessagingCanvas } from "@/features/auth/components/messaging-canvas";

export function AuthLayout() {
  return (
    <div className="grid min-h-screen bg-background lg:grid-cols-[minmax(0,1fr)_minmax(420px,520px)]">
      <section className="hidden min-h-screen flex-col justify-center px-10 py-12 lg:flex xl:px-16">
        <div className="mx-auto flex w-full max-w-xl flex-col gap-10">
          <div className="flex items-center gap-3">
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <MessageCircle className="h-5 w-5" />
            </span>
            <div>
              <p className="text-sm font-semibold text-foreground">
                Nexus Talk
              </p>
              <p className="text-xs text-muted-foreground">
                Messages and calls in one workspace.
              </p>
            </div>
          </div>

          <div className="aspect-[4/3] w-full overflow-hidden rounded-lg border bg-muted/20">
            <MessagingCanvas />
          </div>
        </div>
      </section>

      <section className="flex min-h-screen items-center justify-center px-6 py-10 lg:border-l">
        <div className="w-full max-w-md space-y-8">
          <div className="flex justify-center lg:hidden">
            <div className="inline-flex items-center gap-2 rounded-full border border-primary/40 bg-primary/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.3em] text-primary">
              Nexus Talk
            </div>
          </div>
          <Outlet />
        </div>
      </section>
    </div>
  );
}
