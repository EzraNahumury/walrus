"use client";

import { useMemo } from "react";

type Node = { x: number; y: number; r: number; phase?: 1 | 2 | 3 | 4 | 5 | 6 };
type Edge = [number, number];

interface AnimatedNetworkProps {
  className?: string;
  /** Adds traveling pulses on a subset of edges. */
  pulses?: number;
}

const NODES: Node[] = [
  { x: 60,  y: 70,  r: 1.6, phase: 1 },
  { x: 145, y: 130, r: 2.2, phase: 2 },
  { x: 220, y: 80,  r: 1.4, phase: 3 },
  { x: 305, y: 135, r: 2.0, phase: 4 },
  { x: 380, y: 60,  r: 1.6, phase: 5 },
  { x: 440, y: 150, r: 2.2, phase: 6 },
  { x: 65,  y: 220, r: 1.4, phase: 4 },
  { x: 165, y: 240, r: 2.4, phase: 1 },
  { x: 245, y: 200, r: 1.6, phase: 5 },
  { x: 330, y: 250, r: 2.6, phase: 2 },
  { x: 410, y: 220, r: 1.6, phase: 3 },
  { x: 105, y: 330, r: 1.8, phase: 6 },
  { x: 200, y: 350, r: 1.5, phase: 4 },
  { x: 290, y: 320, r: 2.0, phase: 5 },
  { x: 375, y: 345, r: 1.5, phase: 1 },
  { x: 450, y: 300, r: 1.6, phase: 3 },
];

const EDGES: Edge[] = [
  [0, 1], [1, 2], [2, 3], [3, 4], [4, 5],
  [1, 6], [1, 7], [3, 8], [3, 9], [5, 10],
  [6, 11], [7, 8], [7, 12], [8, 9], [9, 10],
  [9, 13], [10, 14], [10, 15], [11, 12], [12, 13],
  [13, 14], [14, 15], [2, 8], [4, 9], [0, 6],
];

// Edges that get a traveling pulse along them (manually selected for visual balance).
const PULSE_EDGES: { edgeIdx: number; duration: number; delay: number }[] = [
  { edgeIdx: 1,  duration: 5.0, delay: 0 },
  { edgeIdx: 7,  duration: 4.5, delay: 1.2 },
  { edgeIdx: 13, duration: 6.0, delay: 0.6 },
  { edgeIdx: 17, duration: 5.4, delay: 2.4 },
];

export function AnimatedNetwork({ className, pulses = 4 }: AnimatedNetworkProps) {
  const pulseEdges = useMemo(
    () => PULSE_EDGES.slice(0, Math.max(0, Math.min(pulses, PULSE_EDGES.length))),
    [pulses],
  );

  return (
    <svg
      viewBox="0 0 500 400"
      className={className}
      preserveAspectRatio="xMidYMid slice"
      aria-hidden
    >
      <defs>
        <radialGradient id="net-bg" cx="50%" cy="50%" r="65%">
          <stop offset="0" stopColor="#1A1820" stopOpacity="1" />
          <stop offset="1" stopColor="#050507" stopOpacity="1" />
        </radialGradient>
        <radialGradient id="net-node-glow" cx="50%" cy="50%" r="50%">
          <stop offset="0" stopColor="#FFFFFF" stopOpacity="0.45" />
          <stop offset="1" stopColor="#FFFFFF" stopOpacity="0" />
        </radialGradient>
      </defs>

      <rect width="500" height="400" fill="url(#net-bg)" />

      {/* Background twinkling stars */}
      {STARS.map((s, i) => (
        <circle
          key={`s-${i}`}
          cx={s[0]}
          cy={s[1]}
          r={s[2]}
          fill="#FFFFFF"
          className="twinkle"
          style={{ animationDelay: `${(i % 7) * 0.4}s` }}
          opacity="0.6"
        />
      ))}

      <g className="net-drift">
        {/* Edges */}
        {EDGES.map(([a, b], i) => {
          const A = NODES[a];
          const B = NODES[b];
          // Alternate flowing vs static so the graph has rhythm without visual noise.
          const isFlowing = i % 3 === 0;
          return (
            <line
              key={`e-${i}`}
              x1={A.x}
              y1={A.y}
              x2={B.x}
              y2={B.y}
              stroke="#FFFFFF"
              strokeWidth={0.8}
              className={isFlowing ? "net-edge" : "net-edge-static"}
              style={isFlowing ? { animationDelay: `${(i % 5) * -0.7}s` } : undefined}
            />
          );
        })}

        {/* Node glows (drawn under nodes) */}
        {NODES.map((n, i) => (
          <circle
            key={`g-${i}`}
            cx={n.x}
            cy={n.y}
            r={Math.max(8, n.r * 5)}
            fill="url(#net-node-glow)"
            opacity="0.5"
          />
        ))}

        {/* Nodes */}
        {NODES.map((n, i) => (
          <circle
            key={`n-${i}`}
            cx={n.x}
            cy={n.y}
            fill="#FFFFFF"
            className={`net-node net-node-${n.phase ?? 1}`}
            style={{ ["--r" as string]: `${n.r}` }}
            r={n.r}
          />
        ))}

        {/* Traveling pulses on a few edges */}
        {pulseEdges.map((p, i) => {
          const [a, b] = EDGES[p.edgeIdx];
          const A = NODES[a];
          const B = NODES[b];
          const path = `M ${A.x} ${A.y} L ${B.x} ${B.y}`;
          return (
            <circle
              key={`p-${i}`}
              r={2.4}
              className="net-pulse"
              style={{
                offsetPath: `path('${path}')`,
                animationDuration: `${p.duration}s`,
                animationDelay: `${p.delay}s`,
              }}
            />
          );
        })}
      </g>
    </svg>
  );
}

const STARS: [number, number, number][] = [
  [40, 40, 0.6],
  [120, 35, 0.8],
  [240, 28, 0.5],
  [360, 30, 0.7],
  [470, 50, 0.6],
  [60, 180, 0.5],
  [180, 175, 0.8],
  [330, 165, 0.5],
  [430, 195, 0.7],
  [80, 290, 0.6],
  [220, 285, 0.8],
  [350, 290, 0.5],
  [470, 270, 0.7],
  [30, 380, 0.5],
  [260, 375, 0.7],
  [430, 380, 0.6],
];
