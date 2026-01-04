import { Link } from "react-router-dom";

import { Button } from "@/components/ui/button";

export function NotFoundRoute() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-6 bg-background px-6 text-center">
      <div className="space-y-2">
        <p className="text-sm uppercase tracking-wide text-muted-foreground">
          404
        </p>
        <h1 className="text-3xl font-semibold text-foreground">
          This page got lost in space
        </h1>
        <p className="text-sm text-muted-foreground">
          The route you tried doesn&apos;t exist yet. Head back to home and keep
          chatting.
        </p>
      </div>
      <Button asChild>
        <Link to="/">Return home</Link>
      </Button>
    </div>
  );
}
