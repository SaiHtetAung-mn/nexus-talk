import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { isApiError } from "@/lib/api-error";
import { verifyEmailToken } from "@/features/auth/api/verify-email";
import { resendVerificationEmail } from "@/features/auth/api/resend-verification";
import {
  resendVerificationSchema,
  type ResendVerificationValues,
} from "@/features/auth/schemas/resend-verification-schema";

type VerificationState = "idle" | "verifying" | "success" | "error";

export function VerifyEmailPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get("token");
  const defaultEmail = searchParams.get("email") ?? "";
  const [verificationState, setVerificationState] =
    useState<VerificationState>(token ? "verifying" : "idle");
  const [verificationMessage, setVerificationMessage] = useState<string | null>(
    null,
  );
  const [verificationError, setVerificationError] = useState<string | null>(
    null,
  );

  const {
    register,
    handleSubmit,
    setValue,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<ResendVerificationValues>({
    resolver: zodResolver(resendVerificationSchema),
    defaultValues: {
      email: defaultEmail,
    },
  });

  useEffect(() => {
    setValue("email", defaultEmail);
  }, [defaultEmail, setValue]);

  useEffect(() => {
    if (!token) {
      return;
    }

    let active = true;

    async function verify() {
      setVerificationState("verifying");
      setVerificationMessage(null);
      setVerificationError(null);

      try {
        const res = await verifyEmailToken(token);
        if (!active) return;
        setVerificationState("success");
        setVerificationMessage(res.message);
        toast.success(res.message);
      } catch (error) {
        if (!active) return;
        const message =
          error instanceof Error
            ? error.message
            : "We couldn’t verify the link. Request a new one below.";
        setVerificationState("error");
        setVerificationError(message);
        toast.error(message);
      }
    }

    void verify();

    return () => {
      active = false;
    };
  }, [token]);

  async function handleResend(values: ResendVerificationValues) {
    try {
      const res = await resendVerificationEmail(values.email);
      toast.success(res.message);
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Unable to send verification email right now.";
      if (isApiError(error) && error.fieldErrors?.email) {
        setError("email", { message: error.fieldErrors.email });
      } else {
        setError("email", { message });
      }
      toast.error(message);
    }
  }

  const statusCopy = useMemo(() => {
    switch (verificationState) {
      case "verifying":
        return "Hang tight while we confirm your email.";
      case "success":
        return verificationMessage ?? "Your email is confirmed.";
      case "error":
        return verificationError ?? "Verification link is invalid or expired.";
      default:
        return defaultEmail
          ? `We sent a verification link to ${defaultEmail}.`
          : "We sent you a verification link. Check your inbox.";
    }
  }, [verificationState, verificationMessage, verificationError, defaultEmail]);

  return (
    <div className="space-y-6">
      <div className="space-y-1 text-center">
        <h1 className="text-2xl font-semibold text-foreground">
          Verify your email
        </h1>
        <p className="text-sm text-muted-foreground">
          Confirm your address to unlock chats, calls, and more.
        </p>
      </div>

      <div className="rounded-lg border bg-muted/40 p-4 text-sm">
        <p
          className={
            verificationState === "error"
              ? "text-destructive"
              : "text-muted-foreground"
          }
        >
          {statusCopy}
        </p>
        {verificationState === "success" && (
          <p className="mt-2 text-sm text-foreground">
            You can safely close this tab or head back to sign in.
          </p>
        )}
      </div>

      <form
        className="space-y-4 rounded-lg border p-4"
        onSubmit={handleSubmit(handleResend)}
      >
        <div className="space-y-1">
          <Label>Email</Label>
          <Input
            type="email"
            placeholder="you@nexus.chat"
            autoComplete="email"
            {...register("email")}
          />
          {errors.email && (
            <p className="text-xs text-destructive">{errors.email.message}</p>
          )}
        </div>
        <Button
          type="submit"
          className="w-full"
          disabled={isSubmitting}
        >
          {isSubmitting ? "Sending..." : "Resend verification email"}
        </Button>
        <p className="text-xs text-muted-foreground">
          Lost the email or the link expired? Enter your email above and we&apos;ll send a fresh one.
        </p>
      </form>

      {verificationState === "success" && (
        <Button
          type="button"
          variant="secondary"
          className="w-full"
          onClick={() => navigate("/auth")}
        >
          Go to sign in
        </Button>
      )}

      <p className="text-center text-sm text-muted-foreground">
        Remembered your password?{" "}
        <Link to="/auth" className="font-medium text-primary">
          Back to sign in
        </Link>
      </p>
    </div>
  );
}
