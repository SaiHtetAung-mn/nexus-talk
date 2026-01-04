import { NavLink } from "react-router-dom";

import { cn } from "@/lib/utils";
import { navigationItems } from "@/layouts/navigation";

type AppSidebarProps = {
  isOpen: boolean;
  onToggle: () => void;
};

export function AppSidebar({ isOpen, onToggle }: AppSidebarProps) {
  return (
    <aside
      className={cn(
        "hidden border-r bg-background/80 transition-[width] duration-300 md:flex md:flex-col",
        isOpen ? "w-72" : "w-20",
      )}
    >
      <div className="flex items-center justify-between border-b px-4 py-6">
        <button
          aria-label="Toggle navigation width"
          className="rounded-md border bg-background px-3 py-2 text-xs font-semibold hover:bg-accent"
          onClick={onToggle}
          type="button"
        >
          {isOpen ? "Collapse" : "Expand"}
        </button>
        {isOpen && (
          <span className="text-sm font-semibold">Nexus Talk</span>
        )}
      </div>
      <nav className="flex-1 space-y-1 px-2 py-4">
        {navigationItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              cn(
                "flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition hover:bg-accent",
                isActive
                  ? "bg-primary text-primary-foreground hover:bg-primary"
                  : "text-muted-foreground",
                !isOpen && "justify-center",
              )
            }
            end={item.to === "/"}
          >
            <item.icon className="h-4 w-4" />
            {isOpen && <span>{item.label}</span>}
          </NavLink>
        ))}
      </nav>
      {isOpen && (
        <div className="border-t px-4 py-6 text-xs text-muted-foreground">
          v0.1 – Core platform scaffolding
        </div>
      )}
    </aside>
  );
}
