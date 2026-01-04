import { useState } from "react";
import { Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  registerSchema,
  type RegisterValues,
} from "@/features/auth/schemas/register-schema";

export function RegisterForm() {
  const [status, setStatus] = useState<"idle" | "loading" | "success">("idle");
  const [step, setStep] = useState<"email" | "details">("email");
  const {
    register,
    handleSubmit,
    trigger,
    getValues,
    formState: { errors, isSubmitting },
  } = useForm<RegisterValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      displayName: "",
      handle: "",
      email: "",
      password: "",
    },
  });

  async function onSubmit(values: RegisterValues) {
    void values;
    setStatus("loading");
    await new Promise((resolve) => setTimeout(resolve, 900));
    setStatus("success");
    setTimeout(() => setStatus("idle"), 1800);
  }

  async function handleEmailContinue() {
    const valid = await trigger("email");
    if (valid) {
      setStep("details");
    }
  }

  const emailValue = getValues("email");

  return (
    <form className="space-y-5" onSubmit={handleSubmit(onSubmit)}>
      {step === "email" ? (
        <div className="space-y-3">
          <div>
            <Label htmlFor="reg-email">Email</Label>
            <p className="text-xs text-muted-foreground">
              We&apos;ll use this to send magic links and alerts.
            </p>
          </div>
          <Input
            id="reg-email"
            type="email"
            autoComplete="email"
            placeholder="you@nexus.chat"
            autoFocus
            {...register("email")}
          />
          {errors.email && (
            <p className="text-xs text-destructive">{errors.email.message}</p>
          )}
        </div>
      ) : (
        <>
          <div className="flex items-center justify-between rounded-lg border bg-muted/50 px-3 py-2 text-sm">
            <span>{emailValue}</span>
            <button
              type="button"
              className="text-xs font-semibold text-primary"
              onClick={() => setStep("email")}
            >
              Change
            </button>
          </div>
          <div className="space-y-2">
            <Label htmlFor="displayName">Display name</Label>
            <Input
              id="displayName"
              placeholder="Sai Htet"
              {...register("displayName")}
            />
            {errors.displayName && (
              <p className="text-xs text-destructive">
                {errors.displayName.message}
              </p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="handle">Username</Label>
            <div className="flex rounded-md border border-input bg-transparent">
              <span className="flex items-center px-3 text-sm text-muted-foreground">
                nexus.chat/
              </span>
              <Input
                id="handle"
                className="border-0"
                placeholder="sai"
                {...register("handle")}
              />
            </div>
            {errors.handle && (
              <p className="text-xs text-destructive">{errors.handle.message}</p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="reg-password">Password</Label>
            <Input
              id="reg-password"
              type="password"
              autoComplete="new-password"
              placeholder="••••••••"
              {...register("password")}
            />
            {errors.password && (
              <p className="text-xs text-destructive">
                {errors.password.message}
              </p>
            )}
          </div>
        </>
      )}
      {step === "email" ? (
        <Button
          type="button"
          className="w-full"
          onClick={handleEmailContinue}
        >
          Continue
        </Button>
      ) : (
        <Button
          type="submit"
          className="w-full"
          disabled={isSubmitting || status === "loading"}
        >
          {status === "loading" ? "Creating..." : "Join Nexus Talk"}
        </Button>
      )}
      <p className="text-center text-sm text-muted-foreground">
        Already part of the community?{" "}
        <Link to="/auth" className="font-medium text-primary">
          Sign in
        </Link>
      </p>
      {status === "success" && (
        <p className="rounded-md bg-indigo-100 px-3 py-2 text-center text-sm font-medium text-indigo-900">
          Account drafted! Connect this to your NestJS API to persist users.
        </p>
      )}
    </form>
  );
}
