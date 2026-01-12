import { useState } from "react";

import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme-toggle";
import { ProfileAvatar } from "@/components/profile-avatar";
import type { UserPayload } from "@/features/auth/api/types";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

type DashboardHeaderProps = {
  sectionLabel?: string;
  onLogout: () => void;
  onNavigateProfile?: () => void;
  currentUser?: UserPayload | null;
};

export function DashboardHeader({
  sectionLabel,
  onLogout,
  onNavigateProfile,
  currentUser,
}: DashboardHeaderProps) {
  const [confirmOpen, setConfirmOpen] = useState(false);

  const displayName = currentUser?.name ?? currentUser?.email ?? "Account";
  const subtitle =
    currentUser?.username ? `@${currentUser.username}` : currentUser?.email ?? "";

  function handleProfileSelect() {
    onNavigateProfile?.();
  }

  function handleLogoutSelect() {
    setConfirmOpen(true);
  }

  function handleConfirmLogout() {
    setConfirmOpen(false);
    onLogout();
  }

  return (
    <header className="flex h-16 items-center border-b bg-background/80 px-4 sm:px-6">
      <div className="flex flex-1 items-center gap-3">
        <div className="flex flex-col">
          <span className="text-sm font-semibold text-muted-foreground">
            Nexus Talk
          </span>
          <span className="text-base font-medium capitalize">
            {sectionLabel ?? "Workspace"}
          </span>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <ThemeToggle />
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              type="button"
              variant="ghost"
              className="group flex items-center gap-2 rounded-full px-2 py-1.5"
            >
              <ProfileAvatar
                name={currentUser?.name}
                email={currentUser?.email}
              />
              <div className="hidden text-left sm:flex sm:flex-col">
                <span className="text-sm font-semibold leading-tight">
                  {displayName}
                </span>
                {subtitle && (
                  <span className="text-xs text-muted-foreground">
                    {subtitle}
                  </span>
                )}
              </div>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>Signed in as</DropdownMenuLabel>
            <p className="px-2 text-sm text-muted-foreground">{displayName}</p>
            <DropdownMenuSeparator />
            <DropdownMenuItem onSelect={handleProfileSelect}>
              Profile
            </DropdownMenuItem>
            <DropdownMenuItem onSelect={handleLogoutSelect}>
              Logout
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <AlertDialog open={confirmOpen} onOpenChange={setConfirmOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Sign out?</AlertDialogTitle>
              <AlertDialogDescription>
                You will need to sign in again to access your conversations.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={handleConfirmLogout}>
                Logout
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </header>
  );
}
