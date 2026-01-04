import { Menu } from "lucide-react";

import { Button } from "@/components/ui/button";

type DashboardHeaderProps = {
  sectionLabel?: string;
  onToggleSidebar: () => void;
};

export function DashboardHeader({
  sectionLabel,
  onToggleSidebar,
}: DashboardHeaderProps) {
  return (
    <header className="flex flex-col gap-4 border-b bg-background/80 px-6 py-6 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <p className="text-sm uppercase text-muted-foreground">
          Currently viewing
        </p>
        <h1 className="text-2xl font-semibold capitalize">
          {sectionLabel ?? "Overview"}
        </h1>
        <p className="text-sm text-muted-foreground">
          Base React system wired with Tailwind, shadcn/ui, and Zustand.
        </p>
      </div>
      <div className="flex items-center gap-3">
        <Button
          type="button"
          className="md:hidden"
          variant="outline"
          onClick={onToggleSidebar}
        >
          <Menu className="mr-2 h-4 w-4" />
          Menu
        </Button>
        <Button type="button" variant="secondary">
          Create Room
        </Button>
      </div>
    </header>
  );
}
