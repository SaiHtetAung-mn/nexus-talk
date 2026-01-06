import { LogOut, Menu } from "lucide-react";
import { useMemo } from "react";

import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme-toggle";
import { ProfileAvatar } from "@/components/profile-avatar";
import type { UserPayload } from "@/features/auth/api/types";

type DashboardHeaderProps = {
  sectionLabel?: string;
  onToggleSidebar: () => void;
  onLogout: () => void;
  currentUser?: UserPayload | null;
};

export function DashboardHeader({
  sectionLabel,
  onToggleSidebar,
  onLogout,
  currentUser,
}: DashboardHeaderProps) {
  const subtitle = useMemo(() => {
    if (currentUser?.username) {
      return `@${currentUser.username}`;
    }
    return currentUser?.email ?? "Signed in";
  }, [currentUser]);

  return (
    <header className="flex flex-col gap-4 border-b bg-background/80 px-6 py-6 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <p className="text-sm uppercase text-muted-foreground">
          Currently viewing
        </p>
        <h1 className="text-2xl font-semibold capitalize">
          {sectionLabel ?? "Overview"}
        </h1>
        <p className="text-sm text-muted-foreground">{subtitle}</p>
      </div>
      <div className="flex items-center gap-2">
        <Button
          type="button"
          className="md:hidden"
          variant="outline"
          onClick={onToggleSidebar}
        >
          <Menu className="mr-2 h-4 w-4" />
          Menu
        </Button>
        <Button type="button" variant="secondary" className="hidden md:inline-flex">
          Create Room
        </Button>
        <ThemeToggle />
        <Button
          type="button"
          variant="outline"
          className="hidden sm:inline-flex"
          onClick={onLogout}
        >
          <LogOut className="mr-2 h-4 w-4" />
          Logout
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="sm:hidden"
          onClick={onLogout}
          aria-label="Logout"
        >
          <LogOut className="h-5 w-5" />
        </Button>
        <ProfileAvatar name={currentUser?.name} email={currentUser?.email} />
      </div>
    </header>
  );
}
