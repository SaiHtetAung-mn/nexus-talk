import { ChevronsLeft, ChevronsRight } from "lucide-react";
import { NavLink } from "react-router-dom";

import { cn } from "@/lib/utils";
import { navigationItems } from "@/layouts/navigation";

type AppSidebarProps = {
  isOpen: boolean;
  onToggle: () => void;
};

export function AppSidebar({ isOpen, onToggle }: AppSidebarProps) {
  function renderNavigation(closeOnSelect = false) {
    return navigationItems.map((item) => (
      <NavLink
        key={item.to}
        to={item.to}
        onClick={closeOnSelect ? onToggle : undefined}
        className={({ isActive }) =>
          cn(
            "flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition hover:bg-accent",
            isActive
              ? "bg-primary text-primary-foreground hover:bg-primary"
              : "text-muted-foreground",
            !isOpen && !closeOnSelect && "justify-center",
          )
        }
        end={item.to === "/"}
      >
        <item.icon className="h-4 w-4" />
        {(isOpen || closeOnSelect) && <span>{item.label}</span>}
      </NavLink>
    ));
  }

  return (
    <>
      <aside
        className={cn(
          "hidden border-r bg-background/80 transition-[width] duration-300 md:flex md:flex-col",
          isOpen ? "w-72" : "w-20",
        )}
      >
        <div className="flex items-center justify-center border-b px-4 py-4">
          <span
            className={cn(
              "inline-flex items-center justify-center transition-opacity duration-200",
            )}
          >
            <img
              src="./logo.png"
              alt="Nexus Talk Logo"
              className="h-8 w-auto max-w-full sm:h-9"
            />
          </span>
        </div>
        <nav className="flex-1 space-y-1 px-2 py-4">{renderNavigation()}</nav>
        <div className="border-t px-4 py-6">
          <button
            aria-label={isOpen ? "Collapse navigation" : "Expand navigation"}
            className="flex w-full items-center justify-center gap-2 rounded-md border border-dashed border-border bg-background px-3 py-2 text-xs font-semibold hover:bg-accent"
            onClick={onToggle}
            type="button"
          >
            {isOpen ? (
              <>
                <ChevronsLeft className="h-3.5 w-3.5" />
              </>
            ) : (
              <>
                <ChevronsRight className="h-3.5 w-3.5" />
              </>
            )}
          </button>
        </div>
      </aside>

      <div
        className={cn(
          "fixed inset-0 z-40 flex md:hidden",
          isOpen ? "pointer-events-auto" : "pointer-events-none",
        )}
        aria-hidden={!isOpen}
      >
        <div
          className={cn(
            "absolute inset-0 bg-black/40 transition-opacity",
            isOpen ? "opacity-100" : "opacity-0",
          )}
          onClick={onToggle}
        />
        <aside
          className={cn(
            "relative flex h-full w-72 flex-col border-r bg-background/95 backdrop-blur transition-transform duration-300",
            isOpen ? "translate-x-0" : "-translate-x-full",
          )}
        >
          <div className="flex items-center justify-between border-b px-4 py-6">
            <span className="text-base font-semibold">Nexus Talk</span>
            <button
              type="button"
              className="rounded-md border bg-background px-3 py-2 text-xs font-semibold hover:bg-accent"
              onClick={onToggle}
            >
              Close
            </button>
          </div>
          <nav className="flex-1 space-y-1 px-2 py-4">
            {renderNavigation(true)}
          </nav>
          <div className="border-t px-4 py-6 text-xs text-muted-foreground">
            <button
              type="button"
              className="flex w-full items-center justify-center gap-2 rounded-md border border-dashed border-border bg-background px-3 py-2 text-xs font-semibold hover:bg-accent"
              onClick={onToggle}
            >
              <ChevronsLeft className="h-3.5 w-3.5" />
              Close menu
            </button>
          </div>
        </aside>
      </div>
    </>
  );
}
