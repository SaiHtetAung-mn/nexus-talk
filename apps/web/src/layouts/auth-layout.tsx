import { Outlet } from "react-router-dom";
import { MessageCircle } from "lucide-react";

import { MessagingCanvas } from "@/features/auth/components/messaging-canvas";

export function AuthLayout() {
  return (
    <div className="grid min-h-screen bg-background lg:grid-cols-[minmax(420px,520px)_minmax(0,1fr)]">
      <section className="hidden min-h-screen flex-col justify-center border-r px-10 py-12 lg:flex">
        <div className="mx-auto flex w-full max-w-md flex-col gap-10">
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

          <div className="aspect-[4/3] w-full">
            <MessagingCanvas />
          </div>
        </div>
      </section>

      <section className="flex min-h-screen items-center justify-center px-6 py-10">
        <div className="w-full max-w-md space-y-8">
          <div className="space-y-1 text-center lg:hidden">
            <p className="text-lg font-semibold text-foreground">
              Nexus Talk
            </p>
            <p className="text-sm text-muted-foreground">
              Messages and calls in one workspace.
            </p>
          </div>
          <Outlet />
        </div>
      </section>
    </div>
  );
}
