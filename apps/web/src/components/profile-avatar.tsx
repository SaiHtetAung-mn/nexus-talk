import { cn } from "@/lib/utils";

type ProfileAvatarProps = {
  name?: string | null;
  email?: string | null;
  className?: string;
};

function getInitials(name?: string | null, email?: string | null) {
  if (name && name.trim().length > 0) {
    const parts = name
      .trim()
      .split(/\s+/)
      .filter(Boolean);
    if (parts.length === 1) {
      return parts[0].slice(0, 2).toUpperCase();
    }
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  }

  if (email && email.length > 0) {
    return email.slice(0, 2).toUpperCase();
  }

  return "US";
}

export function ProfileAvatar({ name, email, className }: ProfileAvatarProps) {
  const initials = getInitials(name, email);

  return (
    <div
      className={cn(
        "flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold uppercase text-primary",
        className,
      )}
    >
      {initials}
    </div>
  );
}
