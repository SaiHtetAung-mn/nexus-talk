import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Mail } from "lucide-react";

const providers = [
  {
    id: "google",
    label: "Continue with Google",
    icon: Mail,
  }
];

type OAuthButtonsProps = {
  className?: string;
};

export function OAuthButtons({ className }: OAuthButtonsProps) {
  return (
    <div className={cn("space-y-2", className)}>
      {providers.map((provider) => (
        <Button
          key={provider.id}
          type="button"
          variant="outline"
          className="w-full justify-start"
        >
          <provider.icon className="mr-3 h-4 w-4" />
          {provider.label}
        </Button>
      ))}
    </div>
  );
}
