"use client";

import { cn } from "@/lib/utils";
import { Input, Label } from "@/components/ui";

export function AuthField({
  id,
  label,
  type,
  placeholder,
  autoComplete,
  value,
  onChange,
  disabled,
  icon,
  rightAccessory,
  error,
  helper,
  inputProps,
}: {
  id: string;
  label: string;
  type?: React.ComponentProps<"input">["type"];
  placeholder?: string;
  autoComplete?: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  disabled?: boolean;
  icon?: React.ReactNode;
  rightAccessory?: React.ReactNode;
  error?: string;
  helper?: React.ReactNode;
  inputProps?: Omit<
    React.ComponentProps<"input">,
    "id" | "type" | "value" | "onChange" | "disabled" | "placeholder" | "autoComplete"
  >;
}) {
  const describedById = error ? `${id}-error` : helper ? `${id}-help` : undefined;

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <Label htmlFor={id} className="auth-microLabel">
          {label}
        </Label>
        {rightAccessory ? (
          <div className="text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors">
            {rightAccessory}
          </div>
        ) : null}
      </div>

      <div className="relative">
        <Input
          id={id}
          type={type}
          placeholder={placeholder}
          autoComplete={autoComplete}
          value={value}
          onChange={onChange}
          disabled={disabled}
          aria-invalid={Boolean(error) || undefined}
          aria-describedby={describedById}
          className={cn("auth-input pr-11", inputProps?.className)}
          {...inputProps}
        />
        {icon ? <div className="auth-inputIcon">{icon}</div> : null}
      </div>

      {error ? (
        <p id={`${id}-error`} className="text-sm text-destructive">
          {error}
        </p>
      ) : helper ? (
        <p id={`${id}-help`} className="text-xs text-muted-foreground">
          {helper}
        </p>
      ) : null}
    </div>
  );
}

