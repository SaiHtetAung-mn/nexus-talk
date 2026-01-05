import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";

import { isApiError } from "@/lib/api-error";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  loginSchema,
  type LoginValues,
} from "@/features/auth/schemas/login-schema";
import { login } from "@/features/auth/api/login";
import { useAuthStore } from "@/features/auth/store/auth-store";

export function LoginForm() {
  const [status, setStatus] = useState<"idle" | "loading" | "success">("idle");
  const navigate = useNavigate();
  const setAuthUser = useAuthStore((state) => state.setUser);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setError,
  } = useForm<LoginValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  async function onSubmit(values: LoginValues) {
    setStatus("loading");
    try {
      const data = await login(values);
      setAuthUser(data.user);
      navigate("/", { replace: true });
      setStatus("success");
      setTimeout(() => setStatus("idle"), 1500);
      toast.success("Signed in successfully");
    } catch (error) {
      if (isApiError(error) && error.fieldErrors) {
        Object.entries(error.fieldErrors).forEach(([field, message]) => {
          setError(field as keyof LoginValues, { message });
        });
      }

      const message =
        error instanceof Error
          ? error.message
          : "Something went wrong. Please try again.";
      setError("root", { message });
      setStatus("idle");
      toast.error(message);
    }
  }

  return (
    <form className="space-y-5" onSubmit={handleSubmit(onSubmit)}>
      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          type="email"
          autoComplete="email"
          placeholder="you@nexus.chat"
          {...register("email")}
        />
        {errors.email && (
          <p className="text-xs text-destructive">{errors.email.message}</p>
        )}
      </div>
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label htmlFor="password">Password</Label>
          <button className="text-xs text-muted-foreground" type="button">
            Forgot?
          </button>
        </div>
        <Input
          id="password"
          type="password"
          autoComplete="current-password"
          placeholder="••••••••"
          {...register("password")}
        />
        {errors.password && (
          <p className="text-xs text-destructive">{errors.password.message}</p>
        )}
      </div>
      <Button
        type="submit"
        className="w-full"
        disabled={isSubmitting || status === "loading"}
      >
        {status === "loading" ? "Checking..." : "Sign in"}
      </Button>
      <p className="text-center text-sm text-muted-foreground">
        No account?{" "}
        <Link to="/auth/register" className="font-medium text-primary">
          Create one
        </Link>
      </p>
      {status === "success" && (
        <p className="rounded-md bg-emerald-100 px-3 py-2 text-center text-sm font-medium text-emerald-900">
          Signed in successfully!
        </p>
      )}
    </form>
  );
}
