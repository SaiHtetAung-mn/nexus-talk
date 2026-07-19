import { Outlet } from "react-router-dom";
import { MessageCircle } from "lucide-react";

import { MessagingCanvas } from "@/features/auth/components/messaging-canvas";

export function AuthLayout() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[whitesmoke] px-4 py-6 sm:px-6 lg:px-10 lg:py-10">
      <div className="hidden w-full max-w-6xl overflow-hidden rounded-[2rem] lg:grid lg:grid-cols-[minmax(0,0.92fr)_minmax(440px,520px)]">
        <section className="p-8">
          <div className="flex h-full flex-col gap-8">
            <div className="flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl border bg-background text-foreground">
                <MessageCircle className="h-5 w-5" />
              </span>
              <div>
                <p className="text-sm font-semibold text-foreground">Nexus Talk</p>
                <p className="text-xs text-muted-foreground">Messaging workspace</p>
              </div>
            </div>

            <div className="flex flex-1">
              <div className="w-full overflow-hidden rounded-[1.5rem]">
                  <div className="aspect-[16/10] w-full">
                    <MessagingCanvas />
                  </div>
                </div>
            </div>
          </div>
        </section>

        <section className="rounded-lg border bg-white flex items-center justify-center p-8 xl:p-10">
          <div className="w-full max-w-md">
            <Outlet />
          </div>
        </section>
      </div>

      <section className="w-full max-w-md rounded-3xl border bg-card/60 p-6 shadow-sm backdrop-blur sm:p-8 lg:hidden">
        <div className="mb-8 space-y-2">
          <div className="flex items-center gap-3">
            <span className="flex h-9 w-9 items-center justify-center rounded-lg border bg-background text-foreground">
              <MessageCircle className="h-5 w-5" />
            </span>
            <div>
              <p className="text-sm font-semibold text-foreground">Nexus Talk</p>
              <p className="text-xs text-muted-foreground">Messaging workspace</p>
            </div>
          </div>
        </div>
        <Outlet />
      </section>
    </div>
  );
}
