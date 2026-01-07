import { useCallback, useState } from "react";
import { GoogleLogin, type CredentialResponse } from "@react-oauth/google";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

import { cn } from "@/lib/utils";
import { loginWithGoogle } from "@/features/auth/api/google-login";
import { useAuthStore } from "@/features/auth/store/auth-store";
import type { UserPayload } from "@/features/auth/api/types";

type OAuthButtonsProps = {
  className?: string;
};

export function OAuthButtons({ className }: OAuthButtonsProps) {
  const navigate = useNavigate();
  const setAuthUser = useAuthStore((state) => state.setUser);
  const [isAuthenticating, setIsAuthenticating] = useState(false);

  const completeLogin = useCallback(
    (user: UserPayload) => {
      setAuthUser(user);
      navigate("/", { replace: true });
      toast.success("Successfully signed in");
    },
    [navigate, setAuthUser],
  );

  const showGoogleError = useCallback((message?: string) => {
    toast.error(message ?? "Google login failed. Please try again.");
  }, []);

  const handleSuccess = useCallback(
    async (credentialResponse: CredentialResponse) => {
      if (isAuthenticating) {
        return;
      }

      if (!credentialResponse?.credential) {
        showGoogleError("Missing Google credential. Please try again.");
        return;
      }

      setIsAuthenticating(true);
      try {
        const data = await loginWithGoogle(credentialResponse.credential);
        completeLogin(data.user);
      } catch (error) {
        const message =
          error instanceof Error
            ? error.message
            : "Google login failed. Please try again.";
        showGoogleError(message);
      } finally {
        setIsAuthenticating(false);
      }
    },
    [completeLogin, isAuthenticating, showGoogleError],
  );

  const handleError = useCallback(() => {
    showGoogleError();
  }, [showGoogleError]);

  return (
    <div className={cn("space-y-2", className)}>
      <div className="relative flex w-full justify-center">
        <GoogleLogin
          onSuccess={handleSuccess}
          onError={handleError}
          useOneTap
        />
        {isAuthenticating && (
          <div className="absolute inset-0 flex items-center justify-center rounded-md bg-background/80 text-sm text-muted-foreground">
            Signing in…
          </div>
        )}
      </div>
    </div>
  );
}
