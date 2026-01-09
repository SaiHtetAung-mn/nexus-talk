import {
  MessageCircle,
  Phone,
  UsersRound,
  Settings,
  type LucideIcon,
} from "lucide-react";

export type NavigationItem = {
  label: string;
  to: string;
  icon: LucideIcon;
};

export const navigationItems: NavigationItem[] = [
  { label: "Inbox", icon: MessageCircle, to: "/" },
  { label: "Calls", icon: Phone, to: "/calls" },
  { label: "Contacts", icon: UsersRound, to: "/contacts" },
  { label: "Account", icon: Settings, to: "/profile" },
];

export function resolveSection(pathname: string) {
  if (pathname === "/") return navigationItems[0];
  return navigationItems.find((item) => pathname.startsWith(item.to));
}
