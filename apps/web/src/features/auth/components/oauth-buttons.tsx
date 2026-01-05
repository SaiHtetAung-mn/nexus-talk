import { GoogleLogin } from "@react-oauth/google";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

import { cn } from "@/lib/utils";
import { loginWithGoogle } from "@/features/auth/api/google-login";
import { useAuthStore } from "@/features/auth/store/auth-store";

type OAuthButtonsProps = {
  className?: string;
};

export function OAuthButtons({ className }: OAuthButtonsProps) {
  const navigate = useNavigate();
  const setAuthUser = useAuthStore((state) => state.setUser);

  return (
    <div className={cn("space-y-2", className)}>
      <div className="flex w-full justify-center">
        <GoogleLogin
          onSuccess={async (credentialResponse) => {
            try {
              if (!credentialResponse.credential) {
                throw new Error("Missing Google credential");
              }
              const data = await loginWithGoogle(credentialResponse.credential);
              setAuthUser(data.user);
              navigate("/", { replace: true });
              toast.success("Signed in with Google");
            } catch (error) {
              const message =
                error instanceof Error
                  ? error.message
                  : "Google login failed";
              toast.error(message);
            }
          }}
          onError={() => toast.error("Google login failed")}
        />
      </div>
    </div>
  );
}
