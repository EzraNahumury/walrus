import type { HTMLAttributes, ReactNode } from "react";

import { cn } from "@/lib/cn";

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
}

export function Card({ className, children, ...rest }: CardProps) {
  return (
    <div
      className={cn(
        "rounded-2xl border border-[color:var(--color-line)] bg-white shadow-card",
        className,
      )}
      {...rest}
    >
      {children}
    </div>
  );
}

export function CardHeader({ className, children }: CardProps) {
  return (
    <div className={cn("border-b border-[color:var(--color-line)] px-6 py-5", className)}>
      {children}
    </div>
  );
}

export function CardBody({ className, children }: CardProps) {
  return <div className={cn("px-6 py-5", className)}>{children}</div>;
}

export function CardFooter({ className, children }: CardProps) {
  return (
    <div className={cn("border-t border-[color:var(--color-line)] px-6 py-4", className)}>
      {children}
    </div>
  );
}
