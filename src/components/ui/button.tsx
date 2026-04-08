"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "ghost" | "danger";
};

export function Button({
  className,
  variant = "primary",
  type = "button",
  ...props
}: ButtonProps) {
  return (
    <button
      type={type}
      className={cn(
        "inline-flex items-center justify-center rounded-lg border px-3 py-2 text-sm transition-colors disabled:cursor-not-allowed disabled:opacity-50",
        variant === "primary" &&
          "border-neutral-700 bg-neutral-100 text-neutral-900 hover:bg-white",
        variant === "secondary" &&
          "border-neutral-700 bg-neutral-900 text-neutral-100 hover:border-neutral-600 hover:bg-neutral-800",
        variant === "ghost" &&
          "border-transparent bg-transparent text-neutral-300 hover:bg-neutral-900 hover:text-white",
        variant === "danger" &&
          "border-red-700/40 bg-red-500/10 text-red-300 hover:bg-red-500/20",
        className,
      )}
      {...props}
    />
  );
}
