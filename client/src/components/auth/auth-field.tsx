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
    <div className="space-y-2.5">
      <div className="flex items-end justify-between gap-3">
        <Label htmlFor={id} className="auth-microLabel">
          {label}
        </Label>
        {rightAccessory ? (
          <div className="shrink-0 text-right text-xs leading-none font-semibold text-muted-foreground/90 transition-colors hover:text-foreground">
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
          className={cn("auth-input", inputProps?.className)}
          {...inputProps}
        />
        {icon ? <div className="auth-inputIcon">{icon}</div> : null}
      </div>

      {error ? (
        <p id={`${id}-error`} className="text-sm text-destructive">
          {error}
        </p>
      ) : helper ? (
        <p id={`${id}-help`} className="text-xs leading-snug text-muted-foreground">
          {helper}
        </p>
      ) : null}
    </div>
  );
}

