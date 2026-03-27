"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, ChevronDown, ChevronUp, Loader2, ShieldAlert } from "lucide-react";
import { toast } from "sonner";
import { useCurrentUser } from "@/hooks/use-auth";
import {
  useUpdateProfile,
  useChangePassword,
  useDeleteAccount,
} from "@/hooks/use-profile";
import type { ApiError } from "@/lib/api";
import { validateEmail, validatePassword } from "@/lib/validation";
import {
  Button,
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  Input,
  Label,
  Separator,
} from "@/components/ui";
import { SectionHeader } from "@/components/dashboard/section-header";

function ProfileSection() {
  const { data: user } = useCurrentUser();
  const updateProfile = useUpdateProfile();

  const [name, setName] = useState(user?.name ?? "");
  const [email, setEmail] = useState(user?.email ?? "");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setFieldErrors({});

    const errors: Record<string, string> = {};
    if (!name.trim()) errors.name = "Name is required";
    if (email !== user?.email) {
      const emailErr = validateEmail(email);
      if (emailErr) errors.email = emailErr;
    }
    if (Object.keys(errors).length) {
      setFieldErrors(errors);
      toast.error("Please fix the errors below.");
      return;
    }

    const payload: { name?: string; email?: string } = {};
    if (name !== user?.name) payload.name = name;
    if (email !== user?.email) payload.email = email;

    if (!Object.keys(payload).length) {
      toast.info("No changes to save.");
      return;
    }

    updateProfile.mutate(payload, {
      onSuccess: () => {
        toast.success("Profile updated.");
      },
      onError: (err: Error) => {
        const apiErr = err as ApiError;
        if (apiErr.fieldErrors) {
          setFieldErrors(apiErr.fieldErrors);
        } else {
          toast.error(err.message || "Failed to update profile.");
        }
      },
    });
  }

  return (
    <Card className="border-white/18 bg-card/80 shadow-[0_2px_4px_rgba(0,_0,_0,_0.14),0_20px_42px_rgba(0,_0,_0,_0.2)] backdrop-blur-xl">
      <CardHeader>
        <CardTitle>Profile</CardTitle>
        <CardDescription>Update your name and email address.</CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit} noValidate>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="profile-name">Name</Label>
            <Input
              id="profile-name"
              type="text"
              autoComplete="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              disabled={updateProfile.isPending}
            />
            {fieldErrors.name && (
              <p className="text-sm text-destructive">{fieldErrors.name}</p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="profile-email">Email</Label>
            <Input
              id="profile-email"
              type="email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={updateProfile.isPending}
            />
            {fieldErrors.email ? (
              <p className="text-sm text-destructive">{fieldErrors.email}</p>
            ) : email !== user?.email ? (
              <p className="text-xs text-muted-foreground">
                Changing your email will require re-verification.
              </p>
            ) : null}
          </div>
        </CardContent>
        <CardFooter>
          <Button type="submit" disabled={updateProfile.isPending}>
            {updateProfile.isPending ? (
              <>
                <Loader2 className="size-4 animate-spin" />
                Saving…
              </>
            ) : (
              "Save changes"
            )}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}

function PasswordSection() {
  const changePassword = useChangePassword();
  const [expanded, setExpanded] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  function handleToggle() {
    if (expanded) {
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setFieldErrors({});
    }
    setExpanded((v) => !v);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setFieldErrors({});

    const errors: Record<string, string> = {};
    if (!currentPassword) errors.currentPassword = "Current password is required";
    const passwordErr = validatePassword(newPassword);
    if (passwordErr) errors.newPassword = passwordErr;
    if (!confirmPassword) {
      errors.confirmPassword = "Please confirm your new password";
    } else if (newPassword !== confirmPassword) {
      errors.confirmPassword = "New passwords do not match.";
    }

    if (Object.keys(errors).length) {
      setFieldErrors(errors);
      toast.error("Please fix the errors below.");
      return;
    }

    changePassword.mutate(
      { currentPassword, newPassword },
      {
        onSuccess: () => {
          toast.success("Password changed successfully.");
          setCurrentPassword("");
          setNewPassword("");
          setConfirmPassword("");
          setExpanded(false);
        },
        onError: (err: Error) => {
          const apiErr = err as ApiError;
          if (apiErr.fieldErrors) {
            setFieldErrors(apiErr.fieldErrors);
          } else {
            toast.error(err.message || "Failed to change password.");
          }
        },
      },
    );
  }

  return (
    <Card className="border-white/18 bg-card/80 shadow-[0_2px_4px_rgba(0,_0,_0,_0.14),0_20px_42px_rgba(0,_0,_0,_0.2)] backdrop-blur-xl">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Password</CardTitle>
            <CardDescription className="mt-1">
              {expanded
                ? "Enter your current password to set a new one."
                : "Keep your account secure with a strong password."}
            </CardDescription>
          </div>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={handleToggle}
          >
            {expanded ? (
              <>
                <ChevronUp className="size-4" />
                Cancel
              </>
            ) : (
              <>
                <ChevronDown className="size-4" />
                Change
              </>
            )}
          </Button>
        </div>
      </CardHeader>
      {expanded && (
        <form onSubmit={handleSubmit} noValidate>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="current-password">Current password</Label>
              <Input
                id="current-password"
                type="password"
                autoComplete="current-password"
                placeholder="••••••••"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                disabled={changePassword.isPending}
              />
              {fieldErrors.currentPassword && (
                <p className="text-sm text-destructive">{fieldErrors.currentPassword}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="new-password">New password</Label>
              <Input
                id="new-password"
                type="password"
                autoComplete="new-password"
                placeholder="••••••••"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                disabled={changePassword.isPending}
              />
              {fieldErrors.newPassword ? (
                <p className="text-sm text-destructive">{fieldErrors.newPassword}</p>
              ) : (
                <p className="text-xs text-muted-foreground">
                  Min 8 characters — include uppercase, lowercase, number, and special character (e.g. !@#$)
                </p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirm-password">Confirm new password</Label>
              <Input
                id="confirm-password"
                type="password"
                autoComplete="new-password"
                placeholder="••••••••"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                disabled={changePassword.isPending}
              />
              {fieldErrors.confirmPassword && (
                <p className="text-sm text-destructive">{fieldErrors.confirmPassword}</p>
              )}
            </div>
          </CardContent>
          <CardFooter>
            <Button type="submit" disabled={changePassword.isPending}>
              {changePassword.isPending ? (
                <>
                  <Loader2 className="size-4 animate-spin" />
                  Updating…
                </>
              ) : (
                "Update password"
              )}
            </Button>
          </CardFooter>
        </form>
      )}
    </Card>
  );
}

function DangerZoneSection() {
  const deleteAccount = useDeleteAccount();
  const [open, setOpen] = useState(false);

  function handleDelete() {
    deleteAccount.mutate(undefined, {
      onError: (err: Error) => {
        toast.error(err.message || "Failed to delete account.");
        setOpen(false);
      },
    });
  }

  return (
    <Card className="border-white/18 bg-card/80 shadow-[0_2px_4px_rgba(0,_0,_0,_0.14),0_20px_42px_rgba(0,_0,_0,_0.2)] backdrop-blur-xl">
      <CardHeader>
        <div className="flex items-center gap-2">
          <ShieldAlert className="size-4 text-destructive" />
          <CardTitle className="text-destructive">Danger zone</CardTitle>
        </div>
        <CardDescription>
          Permanently delete your account and all of your content. This action
          cannot be undone.
        </CardDescription>
      </CardHeader>
      <CardFooter>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger
            render={
              <Button variant="destructive" />
            }
          >
            Delete account
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Delete account?</DialogTitle>
              <DialogDescription>
                This will permanently delete your account and all associated
                posts. There is no way to recover your data after this.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button
                variant="destructive"
                disabled={deleteAccount.isPending}
                onClick={handleDelete}
              >
                {deleteAccount.isPending ? (
                  <>
                    <Loader2 className="size-4 animate-spin" />
                    Deleting…
                  </>
                ) : (
                  "Yes, delete my account"
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </CardFooter>
    </Card>
  );
}

export default function SettingsPage() {
  return (
    <div className="space-y-10">
      <SectionHeader
        title="Settings"
        description="Manage your account details and preferences."
        right={
          <Button variant="ghost" size="sm" render={<Link href="/dashboard" />}>
            <ArrowLeft className="size-4" />
            Back to Dashboard
          </Button>
        }
      />

      <Separator className="opacity-60" />

      <div className="mx-auto max-w-2xl space-y-6">
        <ProfileSection />
        <PasswordSection />
        <DangerZoneSection />
      </div>
    </div>
  );
}
