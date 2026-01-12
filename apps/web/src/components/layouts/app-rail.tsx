import { NavLink } from "react-router-dom";

import { navigationItems } from "@/layouts/navigation";
import { cn } from "@/lib/utils";

export function AppRail() {

  return (
    <>
      <aside className="hidden w-24 flex-col border-r bg-background/90 py-4 md:flex">
        <div className="flex flex-col items-center gap-4">
          <img
            src="./logo.png"
            alt="Nexus Talk"
            className="h-12 w-12 rounded-full object-contain p-2"
          />
        </div>

        <nav className="mt-12 flex-1 space-y-3">
          {navigationItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === "/"}
              className={({ isActive }) =>
                cn(
                  "mx-auto flex h-16 w-16 flex-col items-center justify-center gap-1 rounded-2xl text-muted-foreground transition hover:bg-accent hover:text-accent-foreground",
                  isActive && "bg-primary text-primary-foreground shadow",
                )
              }
            >
              <item.icon className="h-4 w-4" />
              <span className="text-[10px] font-medium">{item.label}</span>
            </NavLink>
          ))}
        </nav>
      </aside>

      <nav className="fixed bottom-0 left-0 right-0 z-30 border-t bg-background/95 px-3 py-2 shadow-sm md:hidden">
        <div className="grid grid-cols-4 gap-1">
          {navigationItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === "/"}
              className={({ isActive }) =>
                cn(
                  "flex flex-col items-center justify-center rounded-md px-2 py-1.5 text-xs font-medium text-muted-foreground",
                  isActive && "bg-primary/10 text-primary",
                )
              }
            >
              <item.icon className="h-5 w-5" />
              <span>{item.label}</span>
            </NavLink>
          ))}
        </div>
      </nav>
    </>
  );
}
