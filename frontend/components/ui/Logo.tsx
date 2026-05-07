import { cn } from "@/lib/cn";

interface LogoProps {
  size?: number;
  className?: string;
}

export function Logo({ size = 22, className }: LogoProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      fill="none"
      className={cn("inline-block", className)}
      aria-label="SignalVault"
    >
      <defs>
        <linearGradient id="sv-drop" x1="16" y1="3" x2="16" y2="30" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#E07A5F" />
          <stop offset="1" stopColor="#9D2E1A" />
        </linearGradient>
      </defs>
      <path
        d="M16 3.5c0 0 8.5 9 8.5 15.5a8.5 8.5 0 1 1 -17 0C7.5 12.5 16 3.5 16 3.5z"
        fill="url(#sv-drop)"
      />
      <circle cx="13.6" cy="16.5" r="1.6" fill="#FFFFFF" opacity="0.55" />
      <path
        d="M11 20.5c1.4 1.6 3.6 2.4 5.5 2.2"
        stroke="#FFFFFF"
        strokeOpacity="0.55"
        strokeWidth="1.4"
        strokeLinecap="round"
        fill="none"
      />
    </svg>
  );
}
