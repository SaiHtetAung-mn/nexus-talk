import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { ProfileAvatar } from "@/components/profile-avatar";
import { isApiError } from "@/lib/api-error";
import { getAccountProfile } from "@/features/account/api/get-profile";
import {
  profileSchema,
  type ProfileFormValues,
} from "@/features/account/schemas/profile-schema";
import {
  changePasswordSchema,
  type ChangePasswordValues,
} from "@/features/account/schemas/change-password-schema";
import { updateAccountProfile } from "@/features/account/api/update-profile";
import { changePassword } from "@/features/account/api/change-password";
import { useAuthStore } from "@/features/auth/store/auth-store";
import type { UserPayload } from "@/features/auth/api/types";
import {
  setPasswordSchema,
  type SetPasswordValues,
} from "@/features/account/schemas/set-password-schema";
import { createPassword } from "@/features/account/api/create-password";

export function ProfilePage() {
  const setAuthUser = useAuthStore((state) => state.setUser);
  const user = useAuthStore((state) => state.user);
  const [profile, setProfile] = useState<UserPayload | null>(user);
  const [isProfileLoading, setIsProfileLoading] = useState(false);
  const [isPasswordLoading, setIsPasswordLoading] = useState(false);
  const [isCreatePasswordLoading, setIsCreatePasswordLoading] = useState(false);

  const profileForm = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: user?.name ?? "",
      username: user?.username ?? "",
    },
  });

  const passwordForm = useForm<ChangePasswordValues>({
    resolver: zodResolver(changePasswordSchema),
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  });

  const createPasswordForm = useForm<SetPasswordValues>({
    resolver: zodResolver(setPasswordSchema),
    defaultValues: {
      newPassword: "",
      confirmPassword: "",
    },
  });

  useEffect(() => {
    let active = true;
    setIsProfileLoading(true);
    (async () => {
      try {
        const data = await getAccountProfile();
        if (!active) return;
        setProfile(data);
        setAuthUser(data);
        profileForm.reset({
          name: data.name ?? "",
          username: data.username ?? "",
        });
      } catch (error) {
        if (!active) return;
        const message =
          error instanceof Error
            ? error.message
            : "Unable to load profile information.";
        toast.error(message);
      } finally {
        if (active) {
          setIsProfileLoading(false);
        }
      }
    })();

    return () => {
      active = false;
    };
  }, [profileForm, setAuthUser]);

  async function onProfileSubmit(values: ProfileFormValues) {
    setIsProfileLoading(true);
    try {
      const data = await updateAccountProfile(values);
      setProfile(data);
      setAuthUser(data);
      toast.success("Profile updated");
    } catch (error) {
      if (isApiError(error) && error.fieldErrors) {
        Object.entries(error.fieldErrors).forEach(([field, message]) => {
          profileForm.setError(field as keyof ProfileFormValues, { message });
        });
      } else {
        const message =
          error instanceof Error
            ? error.message
            : "Unable to update profile right now.";
        toast.error(message);
      }
    } finally {
      setIsProfileLoading(false);
    }
  }

  async function onPasswordSubmit(values: ChangePasswordValues) {
    setIsPasswordLoading(true);
    try {
      await changePassword({
        currentPassword: values.currentPassword,
        newPassword: values.newPassword,
      });
      toast.success("Password updated");
      passwordForm.reset();
    } catch (error) {
      if (isApiError(error) && error.fieldErrors) {
        Object.entries(error.fieldErrors).forEach(([field, message]) => {
          passwordForm.setError(field as keyof ChangePasswordValues, {
            message,
          });
        });
      } else {
        const message =
          error instanceof Error
            ? error.message
            : "Unable to update password.";
        toast.error(message);
      }
    } finally {
      setIsPasswordLoading(false);
    }
  }

  async function onCreatePasswordSubmit(values: SetPasswordValues) {
    setIsCreatePasswordLoading(true);
    try {
      const response = await createPassword({
        newPassword: values.newPassword,
      });
      toast.success(response.message);
      createPasswordForm.reset();
      const fresh = await getAccountProfile();
      setProfile(fresh);
      setAuthUser(fresh);
    } catch (error) {
      if (isApiError(error) && error.fieldErrors) {
        Object.entries(error.fieldErrors).forEach(([field, message]) => {
          createPasswordForm.setError(field as keyof SetPasswordValues, {
            message,
          });
        });
      } else {
        const message =
          error instanceof Error
            ? error.message
            : "Unable to create password.";
        toast.error(message);
      }
    } finally {
      setIsCreatePasswordLoading(false);
    }
  }

  const hasLocalPassword = profile?.provider === "local";

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-6">
      <div>
        <h2 className="text-2xl font-semibold">Account</h2>
        <p className="text-muted-foreground">
          Update your profile details and keep your credentials secure.
        </p>
      </div>

      <section className="rounded-xl border bg-card p-6 shadow-sm">
        <div className="mb-6 flex items-center gap-4">
          <ProfileAvatar name={profile?.name} email={profile?.email} />
          <div>
            <p className="text-base font-semibold">{profile?.name || "—"}</p>
            <p className="text-sm text-muted-foreground">
              @{profile?.username || "username"}
            </p>
          </div>
        </div>
        <form
          className="space-y-5"
          onSubmit={profileForm.handleSubmit(onProfileSubmit)}
        >
          <div className="space-y-2">
            <Label htmlFor="profile-name">Name</Label>
            <Input
              id="profile-name"
              placeholder="Your name"
              {...profileForm.register("name")}
              disabled={isProfileLoading}
            />
            {profileForm.formState.errors.name && (
              <p className="text-sm text-destructive">
                {profileForm.formState.errors.name.message}
              </p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="profile-username">Username</Label>
            <Input
              id="profile-username"
              placeholder="username"
              {...profileForm.register("username")}
              disabled={isProfileLoading}
            />
            {profileForm.formState.errors.username && (
              <p className="text-sm text-destructive">
                {profileForm.formState.errors.username.message}
              </p>
            )}
          </div>
          <Button
            type="submit"
            disabled={isProfileLoading}
            className="inline-flex items-center"
          >
            {isProfileLoading ? "Saving..." : "Save changes"}
          </Button>
        </form>
      </section>

      <section className="rounded-xl border bg-card p-6 shadow-sm">
        <h3 className="text-lg font-semibold">Email</h3>
        <p className="text-sm text-muted-foreground">
          Your email is used for login and notifications.
        </p>
        <div className="mt-4">
          <Label className="text-xs uppercase text-muted-foreground">
            Email address
          </Label>
          <p className="text-base font-medium">{profile?.email ?? "—"}</p>
        </div>
      </section>

      {hasLocalPassword ? (
        <section className="rounded-xl border bg-card p-6 shadow-sm">
          <h3 className="text-lg font-semibold">Change password</h3>
          <p className="text-sm text-muted-foreground">
            Must be at least 8 characters long.
          </p>
          <form
            className="mt-4 space-y-4"
            onSubmit={passwordForm.handleSubmit(onPasswordSubmit)}
          >
            <div className="space-y-2">
              <Label htmlFor="current-password">Current password</Label>
              <Input
                id="current-password"
                type="password"
                autoComplete="current-password"
                {...passwordForm.register("currentPassword")}
                disabled={isPasswordLoading}
              />
              {passwordForm.formState.errors.currentPassword && (
                <p className="text-sm text-destructive">
                  {passwordForm.formState.errors.currentPassword.message}
                </p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="new-password">New password</Label>
              <Input
                id="new-password"
                type="password"
                autoComplete="new-password"
                {...passwordForm.register("newPassword")}
                disabled={isPasswordLoading}
              />
              {passwordForm.formState.errors.newPassword && (
                <p className="text-sm text-destructive">
                  {passwordForm.formState.errors.newPassword.message}
                </p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirm-password">Confirm password</Label>
              <Input
                id="confirm-password"
                type="password"
                autoComplete="new-password"
                {...passwordForm.register("confirmPassword")}
                disabled={isPasswordLoading}
              />
              {passwordForm.formState.errors.confirmPassword && (
                <p className="text-sm text-destructive">
                  {passwordForm.formState.errors.confirmPassword.message}
                </p>
              )}
            </div>
            <Button type="submit" disabled={isPasswordLoading}>
              {isPasswordLoading ? "Updating..." : "Update password"}
            </Button>
          </form>
        </section>
      ) : (
        <section className="rounded-xl border bg-card p-6 shadow-sm">
          <h3 className="text-lg font-semibold">Create a password</h3>
          <p className="text-sm text-muted-foreground">
            You currently sign in with {profile?.provider ?? "a social login"}.
            Set a password to enable email + password sign in.
          </p>
          <form
            className="mt-4 space-y-4"
            onSubmit={createPasswordForm.handleSubmit(onCreatePasswordSubmit)}
          >
            <div className="space-y-2">
              <Label htmlFor="create-password">New password</Label>
              <Input
                id="create-password"
                type="password"
                autoComplete="new-password"
                {...createPasswordForm.register("newPassword")}
                disabled={isCreatePasswordLoading}
              />
              {createPasswordForm.formState.errors.newPassword && (
                <p className="text-sm text-destructive">
                  {createPasswordForm.formState.errors.newPassword.message}
                </p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="create-confirm-password">Confirm password</Label>
              <Input
                id="create-confirm-password"
                type="password"
                autoComplete="new-password"
                {...createPasswordForm.register("confirmPassword")}
                disabled={isCreatePasswordLoading}
              />
              {createPasswordForm.formState.errors.confirmPassword && (
                <p className="text-sm text-destructive">
                  {createPasswordForm.formState.errors.confirmPassword.message}
                </p>
              )}
            </div>
            <Button type="submit" disabled={isCreatePasswordLoading}>
              {isCreatePasswordLoading ? "Saving..." : "Create password"}
            </Button>
          </form>
        </section>
      )}
    </div>
  );
}
