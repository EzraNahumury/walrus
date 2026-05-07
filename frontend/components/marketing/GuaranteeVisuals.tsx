"use client";

import { ArrowUpRight, Wallet } from "lucide-react";
import { useEffect, useRef, useState } from "react";

import { cn } from "@/lib/cn";

/* ========================================================================== */
/* HistogramVisual — bars rise + breathe in a staggered loop.                 */
/* ========================================================================== */

const BAR_HEIGHTS = [22, 30, 38, 28, 46, 52, 62, 70, 80, 92];

export function HistogramVisual() {
  return (
    <div className="px-10 w-full flex items-end justify-center gap-1.5 h-[110px]">
      {BAR_HEIGHTS.map((h, i) => (
        <span
          key={i}
          className="histo-bar block w-3 rounded-sm bg-[color:var(--color-ink-300)]"
          style={{
            ["--target" as string]: `${h}%`,
            animationDelay: `${i * 110}ms`,
          }}
        />
      ))}
    </div>
  );
}

/* ========================================================================== */
/* AggregateVisual — dots cycle + counter ticks up + soft pulse.              */
/* ========================================================================== */

export function AggregateVisual() {
  return (
    <div className="text-center">
      <div className="flex items-center justify-center gap-2 dots-cycle">
        <span className="agg-dot agg-dot-1" />
        <span className="agg-dot agg-dot-2" />
        <span className="agg-dot agg-dot-3" />
        <span className="agg-dot agg-dot-4" />
      </div>
      <div className="mt-3 text-[40px] font-serif italic leading-none text-[color:var(--color-ink-900)]">
        <PercentCounter />
        <span className="text-[18px] align-top text-[color:var(--color-ink-500)]">%</span>
      </div>
      <div className="mt-2 text-[11px] tracking-[0.18em] uppercase text-[color:var(--color-ink-500)]">
        Aggregate verifiable
      </div>
    </div>
  );
}

function PercentCounter() {
  const [n, setN] = useState(0);
  const ref = useRef<HTMLSpanElement | null>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    let started = false;
    const obs = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting && !started) {
            started = true;
            const start = performance.now();
            const dur = 1600;
            const tick = (t: number) => {
              const k = Math.min(1, (t - start) / dur);
              const eased = 1 - Math.pow(1 - k, 3);
              setN(Math.round(eased * 100));
              if (k < 1) requestAnimationFrame(tick);
              else setN(100);
            };
            requestAnimationFrame(tick);
          }
        }
      },
      { threshold: 0.4 },
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  return <span ref={ref}>{n}</span>;
}

/* ========================================================================== */
/* WalletVisual — dot travels left ↔ right between pills, submit pulses.      */
/* ========================================================================== */

export function WalletVisual() {
  return (
    <div className="flex items-center gap-2">
      <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white border border-[color:var(--color-line)] text-[12px] wallet-pulse">
        <Wallet className="h-3.5 w-3.5" /> Wallet
      </span>
      <span className="relative block h-px w-12 bg-[color:var(--color-ink-300)] overflow-visible">
        <span
          className="absolute -top-[3px] block h-2 w-2 rounded-full bg-[color:var(--color-ink-900)] travel-dot"
          aria-hidden
        />
      </span>
      <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[color:var(--color-ink-900)] text-white text-[12px] submit-bounce">
        Submit
        <ArrowUpRight className="h-3 w-3 submit-arrow" />
      </span>
    </div>
  );
}

/* ========================================================================== */
/* Re-exporting Dot helper used by some other compositions.                   */
/* ========================================================================== */

export function Dot({ tone, size = 14 }: { tone: string; size?: number }) {
  return (
    <span
      className={cn("block rounded-full")}
      style={{ background: tone, height: size, width: size }}
    />
  );
}
