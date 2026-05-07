"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";

import { cn } from "@/lib/cn";

interface RevealProps {
  children: ReactNode;
  delay?: number;
  className?: string;
  once?: boolean;
  as?: "div" | "section" | "article" | "li" | "span";
}

export function Reveal({
  children,
  delay = 0,
  className,
  once = true,
  as: Tag = "div",
}: RevealProps) {
  const ref = useRef<HTMLElement | null>(null);
  const [shown, setShown] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (typeof IntersectionObserver === "undefined") {
      setShown(true);
      return;
    }
    const obs = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) {
            window.setTimeout(() => setShown(true), delay);
            if (once) obs.disconnect();
          } else if (!once) {
            setShown(false);
          }
        }
      },
      { threshold: 0.12, rootMargin: "0px 0px -8% 0px" },
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [delay, once]);

  // Note: TS narrowing for arbitrary tag union — cast.
  const C = Tag as unknown as "div";
  return (
    <C
      ref={ref as React.RefObject<HTMLDivElement>}
      className={cn("reveal", shown && "is-visible", className)}
    >
      {children}
    </C>
  );
}
