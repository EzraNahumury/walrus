"use client";

import {
  ConnectModal,
  useCurrentAccount,
  useDisconnectWallet,
  useSuiClient,
} from "@mysten/dapp-kit";
import {
  ArrowUpRight,
  ChevronDown,
  Copy,
  ExternalLink,
  LogOut,
} from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";

import { cn } from "@/lib/cn";
import { shortAddr, suiObjectUrl } from "@/lib/sui";
import { toast } from "@/lib/toast";

const SUI_COIN_TYPE = "0x2::sui::SUI";

export function WalletButton() {
  const account = useCurrentAccount();
  const [connectOpen, setConnectOpen] = useState(false);

  if (!account) {
    return (
      <ConnectModal
        open={connectOpen}
        onOpenChange={setConnectOpen}
        trigger={
          <button
            type="button"
            onClick={() => setConnectOpen(true)}
            className="inline-flex items-center gap-2 rounded-full bg-[color:var(--color-ink-900)] px-4 h-10 text-[12px] font-semibold tracking-[0.18em] uppercase text-white transition hover:bg-[color:var(--color-ink-800)]"
          >
            Connect wallet
          </button>
        }
      />
    );
  }
  return <ConnectedButton address={account.address} />;
}

function ConnectedButton({ address }: { address: string }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!open) return;
    const onDoc = (e: MouseEvent) => {
      if (!ref.current) return;
      if (!ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, [open]);

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className={cn(
          "inline-flex items-center gap-2 rounded-full bg-white border border-[color:var(--color-line)] pl-1.5 pr-3 h-10 text-[12.5px] font-medium text-[color:var(--color-ink-900)] transition hover:border-[color:var(--color-ink-400)]",
          open && "border-[color:var(--color-ink-500)]",
        )}
      >
        <Avatar address={address} size={26} />
        <span className="font-mono text-[11.5px]">{shortAddr(address)}</span>
        <ChevronDown
          className={cn(
            "h-3.5 w-3.5 text-[color:var(--color-ink-400)] transition-transform",
            open && "rotate-180",
          )}
        />
      </button>
      {open ? <WalletPopover address={address} onClose={() => setOpen(false)} /> : null}
    </div>
  );
}

function WalletPopover({
  address,
  onClose,
}: {
  address: string;
  onClose: () => void;
}) {
  const { mutate: disconnect } = useDisconnectWallet();
  const client = useSuiClient();
  const [balance, setBalance] = useState<string>("…");

  useEffect(() => {
    let cancel = false;
    (async () => {
      try {
        const res = await client.getBalance({
          owner: address,
          coinType: SUI_COIN_TYPE,
        });
        if (cancel) return;
        const total = BigInt(res.totalBalance);
        const sui = Number(total) / 1e9;
        setBalance(`${sui.toFixed(sui >= 100 ? 2 : 4)} SUI`);
      } catch {
        if (!cancel) setBalance("— SUI");
      }
    })();
    return () => {
      cancel = true;
    };
  }, [address, client]);

  const onCopy = () => {
    navigator.clipboard.writeText(address);
    toast.success("Address copied");
  };

  const explorerUrl = useMemo(
    () => suiObjectUrl(address).replace("/object/", "/account/"),
    [address],
  );

  return (
    <div className="absolute right-0 top-12 z-40 w-[300px] rounded-2xl border border-[color:var(--color-line)] bg-white shadow-[0_24px_60px_-20px_rgba(10,10,10,0.35)] overflow-hidden">
      <div className="flex items-start justify-between px-5 pt-5">
        <div className="flex flex-col items-center w-full">
          <Avatar address={address} size={64} />
          <div className="mt-3 text-[15px] font-semibold text-[color:var(--color-ink-900)] font-mono tracking-tightish">
            {shortAddr(address)}
          </div>
          <div className="mt-0.5 text-[12px] text-[color:var(--color-ink-500)]">
            {balance}
          </div>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="-mr-1 -mt-1 inline-flex h-7 w-7 items-center justify-center rounded-full text-[color:var(--color-ink-400)] hover:bg-[color:var(--color-bg-soft)] hover:text-[color:var(--color-ink-900)]"
          aria-label="Close"
        >
          ×
        </button>
      </div>

      <div className="grid grid-cols-2 gap-2 px-5 mt-4">
        <button
          type="button"
          onClick={onCopy}
          className="inline-flex flex-col items-center justify-center gap-1.5 rounded-xl border border-[color:var(--color-line)] bg-white py-3 text-[12px] font-medium text-[color:var(--color-ink-900)] transition hover:bg-[color:var(--color-bg-soft)]"
        >
          <Copy className="h-3.5 w-3.5" />
          Copy address
        </button>
        <button
          type="button"
          onClick={() => {
            disconnect();
            onClose();
            toast.info("Wallet disconnected");
          }}
          className="inline-flex flex-col items-center justify-center gap-1.5 rounded-xl border border-[color:var(--color-line)] bg-white py-3 text-[12px] font-medium text-[color:var(--color-ink-900)] transition hover:bg-[color:var(--color-bg-soft)]"
        >
          <LogOut className="h-3.5 w-3.5" />
          Disconnect
        </button>
      </div>

      <div className="mt-4 mx-5 h-px bg-[color:var(--color-line)]" />

      <div className="px-5 py-4">
        <div className="text-[10px] tracking-[0.2em] uppercase text-[color:var(--color-ink-500)]">
          Transactions
        </div>
        <p className="mt-1.5 text-[12.5px] text-[color:var(--color-ink-500)]">
          Your SignalVault transactions appear in your wallet history.
        </p>
      </div>

      <a
        href={explorerUrl}
        target="_blank"
        rel="noreferrer"
        onClick={onClose}
        className="flex items-center justify-between border-t border-[color:var(--color-line)] px-5 py-3 text-[12.5px] font-medium text-[color:var(--color-ink-900)] hover:bg-[color:var(--color-bg-soft)]"
      >
        <span className="inline-flex items-center gap-2">
          View on Suiscan
          <ArrowUpRight className="h-3.5 w-3.5" />
        </span>
        <ExternalLink className="h-3.5 w-3.5 text-[color:var(--color-ink-500)]" />
      </a>
    </div>
  );
}

function Avatar({ address, size = 32 }: { address: string; size?: number }) {
  // Deterministic gradient blob from the wallet address — matches the
  // chunky purple style in the reference design.
  const seed = useMemo(() => addressSeed(address), [address]);
  const id = `wallet-grad-${seed.id}`;

  return (
    <span
      aria-hidden
      className="inline-block rounded-full overflow-hidden border border-[color:var(--color-line)] shadow-[0_2px_4px_rgba(10,10,10,0.06)]"
      style={{ width: size, height: size }}
    >
      <svg viewBox="0 0 64 64" width={size} height={size}>
        <defs>
          <linearGradient id={id} x1="0" y1="0" x2="64" y2="64" gradientUnits="userSpaceOnUse">
            <stop offset="0" stopColor={seed.c1} />
            <stop offset="1" stopColor={seed.c2} />
          </linearGradient>
          <radialGradient id={`${id}-hl`} cx="35%" cy="30%" r="60%">
            <stop offset="0" stopColor="rgba(255,255,255,0.55)" />
            <stop offset="1" stopColor="rgba(255,255,255,0)" />
          </radialGradient>
        </defs>
        <circle cx="32" cy="32" r="32" fill={`url(#${id})`} />
        <circle cx="32" cy="32" r="32" fill={`url(#${id}-hl)`} />
        <circle cx={20 + seed.bx} cy={26 + seed.by} r="6" fill="rgba(0,0,0,0.18)" />
        <circle cx={42 + seed.bx2} cy={36 + seed.by2} r="5" fill="rgba(0,0,0,0.16)" />
      </svg>
    </span>
  );
}

const PALETTE = [
  ["#9F7AEA", "#5B2BBE"],
  ["#5B8DEF", "#1E40AF"],
  ["#3FB68B", "#1A7A50"],
  ["#E8645B", "#9B2C2C"],
  ["#E8B14B", "#A06A14"],
  ["#7AA7FF", "#3B6BD3"],
  ["#E07A5F", "#9D2E1A"],
  ["#A78BFA", "#5B21B6"],
];

function addressSeed(addr: string): {
  id: string;
  c1: string;
  c2: string;
  bx: number;
  by: number;
  bx2: number;
  by2: number;
} {
  const clean = addr.replace(/^0x/, "").toLowerCase();
  let h = 2166136261;
  for (let i = 0; i < clean.length; i++) {
    h ^= clean.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  const idx = Math.abs(h) % PALETTE.length;
  const [c1, c2] = PALETTE[idx];
  const bx = (Math.abs(h >> 3) % 8) - 4;
  const by = (Math.abs(h >> 7) % 8) - 4;
  const bx2 = (Math.abs(h >> 11) % 8) - 4;
  const by2 = (Math.abs(h >> 15) % 8) - 4;
  return { id: clean.slice(0, 6), c1, c2, bx, by, bx2, by2 };
}
