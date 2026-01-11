import { NavLink } from "react-router-dom";
import { Plus } from "lucide-react";

import { navigationItems } from "@/layouts/navigation";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ProfileAvatar } from "@/components/profile-avatar";
import { useAuthStore } from "@/features/auth/store/auth-store";

type AppRailProps = {
  onToggleSidebar: () => void;
};

export function AppRail({ onToggleSidebar }: AppRailProps) {
  const user = useAuthStore((state) => state.user);

  return (
    <aside className="hidden w-16 flex-col border-r bg-background/90 py-4 md:flex">
      <div className="flex flex-col items-center gap-4">
        <button
          type="button"
          onClick={onToggleSidebar}
          className="flex h-10 w-10 items-center justify-center rounded-full shadow"
          aria-label="Open workspace navigation"
        >
          <img
            src="./logo.png"
            alt="Nexus Talk"
            className="h-6 w-6 object-contain"
          />
        </button>
        <Button
          type="button"
          size="icon"
          variant="outline"
          className="h-10 w-10 rounded-xl"
          aria-label="New chat"
          onClick={onToggleSidebar}
        >
          <Plus className="h-4 w-4" />
        </Button>
      </div>

      <nav className="mt-6 flex-1 space-y-2">
        {navigationItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === "/"}
            className={({ isActive }) =>
              cn(
                "mx-auto flex h-10 w-10 items-center justify-center rounded-xl text-muted-foreground transition hover:bg-accent hover:text-accent-foreground",
                isActive && "bg-primary text-primary-foreground shadow",
              )
            }
          >
            <item.icon className="h-4 w-4" />
          </NavLink>
        ))}
      </nav>

      <div className="flex flex-col items-center gap-3">
        <ProfileAvatar
          name={user?.name}
          email={user?.email}
          className="h-10 w-10 border border-border"
        />
      </div>
    </aside>
  );
}
