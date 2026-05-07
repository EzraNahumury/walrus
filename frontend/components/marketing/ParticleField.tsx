"use client";

import { useEffect, useRef } from "react";

interface ParticleFieldProps {
  className?: string;
  /** How many particles to spawn. Default 110. */
  count?: number;
  /** Max link distance in CSS pixels. Default 130. */
  linkDistance?: number;
  /** Base velocity magnitude. Default 0.25. */
  speed?: number;
  /** Background fill (CSS color) — usually a dark gradient on top of which we draw. */
  background?: string;
  /** Particle / link color. RGB triple "r,g,b". */
  rgb?: string;
  /** Whether the canvas reacts to pointer hover (subtle attract). */
  interactive?: boolean;
}

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  r: number;
  /** Phase offset for radius pulsing. */
  phase: number;
  /** Whether this particle is a "bright node" (slightly bigger + glow). */
  bright: boolean;
}

export function ParticleField({
  className,
  count = 110,
  linkDistance = 130,
  speed = 0.25,
  background = "transparent",
  rgb = "255,255,255",
  interactive = true,
}: ParticleFieldProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const wrapperRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const wrapper = wrapperRef.current;
    const canvas = canvasRef.current;
    if (!wrapper || !canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let dpr = Math.max(1, Math.min(window.devicePixelRatio || 1, 2));
    let w = wrapper.clientWidth;
    let h = wrapper.clientHeight;
    let particles: Particle[] = [];
    const pointer = { x: -10000, y: -10000, active: false };

    const reseed = () => {
      const target = Math.round(
        // Scale particle density slightly by area, so small panels don't get crowded.
        Math.min(count, Math.max(40, Math.round((w * h) / 7000))),
      );
      particles = Array.from({ length: target }, (): Particle => {
        const bright = Math.random() < 0.18;
        return {
          x: Math.random() * w,
          y: Math.random() * h,
          vx: (Math.random() - 0.5) * speed * 2,
          vy: (Math.random() - 0.5) * speed * 2,
          r: bright ? 1.6 + Math.random() * 1.4 : 0.6 + Math.random() * 0.9,
          phase: Math.random() * Math.PI * 2,
          bright,
        };
      });
    };

    const resize = () => {
      w = wrapper.clientWidth;
      h = wrapper.clientHeight;
      dpr = Math.max(1, Math.min(window.devicePixelRatio || 1, 2));
      canvas.width = Math.max(1, Math.round(w * dpr));
      canvas.height = Math.max(1, Math.round(h * dpr));
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      reseed();
    };

    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(wrapper);

    const onMove = (e: PointerEvent) => {
      const rect = wrapper.getBoundingClientRect();
      pointer.x = e.clientX - rect.left;
      pointer.y = e.clientY - rect.top;
      pointer.active = true;
    };
    const onLeave = () => {
      pointer.active = false;
      pointer.x = -10000;
      pointer.y = -10000;
    };
    if (interactive) {
      wrapper.addEventListener("pointermove", onMove);
      wrapper.addEventListener("pointerleave", onLeave);
    }

    let raf = 0;
    let last = performance.now();

    const tick = (t: number) => {
      const dt = Math.min(48, t - last); // cap dt for tab-switch resume
      last = t;

      // Background — leave transparent so the parent can layer gradients/colors.
      if (background === "transparent") {
        ctx.clearRect(0, 0, w, h);
      } else {
        ctx.fillStyle = background;
        ctx.fillRect(0, 0, w, h);
      }

      // Update particles
      for (const p of particles) {
        p.x += p.vx * (dt / 16);
        p.y += p.vy * (dt / 16);
        p.phase += 0.006 * (dt / 16);

        // Bounce off edges with a tiny inset so dots don't half-disappear
        if (p.x < 0) {
          p.x = 0;
          p.vx *= -1;
        } else if (p.x > w) {
          p.x = w;
          p.vx *= -1;
        }
        if (p.y < 0) {
          p.y = 0;
          p.vy *= -1;
        } else if (p.y > h) {
          p.y = h;
          p.vy *= -1;
        }

        // Pointer interaction — gentle attract within radius (Web3 vibes)
        if (interactive && pointer.active) {
          const dx = pointer.x - p.x;
          const dy = pointer.y - p.y;
          const d2 = dx * dx + dy * dy;
          const R = 140;
          if (d2 < R * R && d2 > 1) {
            const d = Math.sqrt(d2);
            const f = ((R - d) / R) * 0.04;
            p.vx += (dx / d) * f;
            p.vy += (dy / d) * f;
          }
        }

        // Damping so particles don't accelerate forever
        p.vx *= 0.995;
        p.vy *= 0.995;

        // Soft drift to keep motion alive even after damping
        const driftAccel = 0.002;
        if (Math.abs(p.vx) < speed * 0.3) p.vx += (Math.random() - 0.5) * driftAccel;
        if (Math.abs(p.vy) < speed * 0.3) p.vy += (Math.random() - 0.5) * driftAccel;
      }

      // Draw links
      for (let i = 0; i < particles.length; i++) {
        const a = particles[i];
        for (let j = i + 1; j < particles.length; j++) {
          const b = particles[j];
          const dx = a.x - b.x;
          const dy = a.y - b.y;
          const d2 = dx * dx + dy * dy;
          if (d2 < linkDistance * linkDistance) {
            const d = Math.sqrt(d2);
            const alpha = (1 - d / linkDistance) * 0.55;
            ctx.strokeStyle = `rgba(${rgb},${alpha.toFixed(3)})`;
            ctx.lineWidth = 0.6;
            ctx.beginPath();
            ctx.moveTo(a.x, a.y);
            ctx.lineTo(b.x, b.y);
            ctx.stroke();
          }
        }
      }

      // Draw particles
      for (const p of particles) {
        const pulse = Math.sin(p.phase) * 0.35 + 0.65; // 0.3..1.0
        const r = p.r * (p.bright ? 1 : pulse);
        const baseAlpha = p.bright ? 1 : 0.55 + 0.45 * pulse;

        if (p.bright) {
          // Outer halo
          const grd = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, r * 4.5);
          grd.addColorStop(0, `rgba(${rgb},${(baseAlpha * 0.55).toFixed(3)})`);
          grd.addColorStop(1, `rgba(${rgb},0)`);
          ctx.fillStyle = grd;
          ctx.beginPath();
          ctx.arc(p.x, p.y, r * 4.5, 0, Math.PI * 2);
          ctx.fill();
        }

        ctx.fillStyle = `rgba(${rgb},${baseAlpha.toFixed(3)})`;
        ctx.beginPath();
        ctx.arc(p.x, p.y, r, 0, Math.PI * 2);
        ctx.fill();
      }

      raf = requestAnimationFrame(tick);
    };

    raf = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      if (interactive) {
        wrapper.removeEventListener("pointermove", onMove);
        wrapper.removeEventListener("pointerleave", onLeave);
      }
    };
  }, [count, linkDistance, speed, background, rgb, interactive]);

  return (
    <div ref={wrapperRef} className={className}>
      <canvas ref={canvasRef} className="block h-full w-full" />
    </div>
  );
}
