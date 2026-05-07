"use client";

import { Star } from "lucide-react";

import { cn } from "@/lib/cn";

interface StarRatingProps {
  value: number;
  onChange?: (next: number) => void;
  max?: number;
  readOnly?: boolean;
  size?: "sm" | "md" | "lg";
}

const SIZE: Record<NonNullable<StarRatingProps["size"]>, string> = {
  sm: "h-4 w-4",
  md: "h-5 w-5",
  lg: "h-6 w-6",
};

export function StarRating({
  value,
  onChange,
  max = 5,
  readOnly,
  size = "md",
}: StarRatingProps) {
  return (
    <div className="flex items-center gap-1">
      {Array.from({ length: max }).map((_, i) => {
        const filled = i < value;
        return (
          <button
            type="button"
            key={i}
            disabled={readOnly}
            onClick={() => onChange?.(i + 1)}
            className={cn(
              "rounded transition focus:outline-none",
              !readOnly && "hover:scale-110",
              readOnly && "cursor-default",
            )}
            aria-label={`${i + 1} out of ${max}`}
          >
            <Star
              className={cn(
                SIZE[size],
                filled
                  ? "text-[color:var(--color-signal-warn)] fill-[color:var(--color-signal-warn)]"
                  : "text-ink-400",
              )}
            />
          </button>
        );
      })}
    </div>
  );
}
