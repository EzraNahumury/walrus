import type { HTMLAttributes, ReactNode } from "react";

import { cn } from "@/lib/cn";

interface Props extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  size?: "sm" | "md" | "lg" | "xl";
}

export function Container({ className, children, size = "lg", ...rest }: Props) {
  const max =
    size === "sm"
      ? "max-w-3xl"
      : size === "md"
        ? "max-w-5xl"
        : size === "xl"
          ? "max-w-[1280px]"
          : "max-w-7xl";
  return (
    <div className={cn("mx-auto w-full px-6", max, className)} {...rest}>
      {children}
    </div>
  );
}
