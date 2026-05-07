import {
  ArrowUpRight,
  CheckCircle2,
  EyeOff,
  Globe,
  Lock,
  Receipt,
  ShieldCheck,
} from "lucide-react";

import { Container } from "@/components/layout/Container";
import {
  AggregateVisual,
  HistogramVisual,
  WalletVisual,
} from "@/components/marketing/GuaranteeVisuals";
import {
  EncryptedEnvelopeViz,
  IndexViz,
  MediaBlobViz,
  ReceiptViz,
  SchemaBlobViz,
} from "@/components/marketing/TouchpointVisuals";
import { Entropy } from "@/components/ui/entropy";
import { PillButton } from "@/components/ui/PillButton";
import { Reveal } from "@/components/ui/Reveal";

export default function LandingPage() {
  return (
    <>
      <Hero />
      <IntroSplit />
      <StatRow />
      <WhySection />
      <ReceiptSection />
      <IntegrationsSection />
      <ClosingCTA />
    </>
  );
}

/* -------------------------------------------------------------------------- */
/* Hero                                                                       */
/* -------------------------------------------------------------------------- */

function Hero() {
  return (
    <section className="px-6 pt-6">
      <div className="mx-auto max-w-7xl">
        <Reveal>
          <div className="relative overflow-hidden rounded-3xl bg-[color:var(--color-ink-950)] starfield border border-[color:var(--color-ink-900)]">
            <div className="absolute inset-0 pointer-events-none opacity-[0.07] mix-blend-screen">
              <div className="absolute inset-0 gridlines" />
            </div>

            <div className="relative grid gap-10 px-8 py-16 md:grid-cols-12 md:gap-8 md:px-16 md:py-24 lg:py-28">
              <div className="md:col-span-7 lg:col-span-7 z-10">
                <h1 className="text-[44px] sm:text-[56px] lg:text-[72px] leading-[1.02] tracking-tighter2 text-white font-semibold">
                  Private feedback,
                  <br />
                  <span className="serif-em text-[color:var(--color-accent-glow)]">public proof.</span>
                </h1>
                <p className="mt-6 max-w-xl text-[15.5px] leading-relaxed text-white/70">
                  SignalVault is an encrypted feedback OS built natively on Walrus.
                  Forms, responses, and receipts ride content-addressed blobs;
                  sensitive answers stay sealed; contributors keep verifiable
                  proof of submission.
                </p>
                <div className="mt-9 flex items-center gap-5">
                  <PillButton href="/welcome" variant="light" size="md">
                    Launch app
                  </PillButton>
                  <a
                    href="#how"
                    className="group inline-flex items-center gap-2 text-[12px] tracking-[0.18em] uppercase text-white/85 hover:text-white"
                  >
                    How it works
                    <span className="inline-flex h-7 w-7 items-center justify-center rounded-full border border-white/25 transition group-hover:bg-white/10">
                      <ArrowUpRight className="h-3.5 w-3.5" />
                    </span>
                  </a>
                </div>
              </div>

              <div className="md:col-span-5 lg:col-span-5 relative min-h-[260px] md:min-h-[420px]">
                <HeroVisual />
              </div>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

function HeroVisual() {
  return (
    <div className="absolute inset-0 flex items-center justify-center">
      {/* Orbit rings */}
      <div className="spin-slow absolute h-[440px] w-[440px] rounded-full border border-white/[0.06]" />
      <div className="absolute h-[320px] w-[320px] rounded-full border border-white/[0.10]" />
      <div className="absolute h-[200px] w-[200px] rounded-full border border-white/[0.16]" />

      {/* Glow halo behind mascot */}
      <div
        className="halo-pulse absolute h-[260px] w-[260px] rounded-full"
        style={{
          background:
            "radial-gradient(circle at 50% 45%, rgba(122,167,255,0.45), rgba(91,141,239,0.10) 40%, transparent 70%)",
          filter: "blur(8px)",
        }}
      />

      {/* Walrus mascot */}
      <div className="relative walrus-bob z-10">
        <img
          src="/image.png"
          alt="Walrus mascot"
          className="h-[260px] w-[260px] object-contain drop-shadow-[0_24px_36px_rgba(122,167,255,0.25)]"
          draggable={false}
        />
      </div>

      {/* Soft contact shadow on the floor */}
      <div
        className="shadow-drift absolute bottom-[14%] left-1/2 h-3 w-[180px] rounded-full"
        style={{
          background:
            "radial-gradient(ellipse at center, rgba(0,0,0,0.65), transparent 70%)",
        }}
      />

      {/* Small accent dots */}
      <div className="absolute top-[18%] right-[14%] h-2 w-2 rounded-full bg-[color:var(--color-accent-glow)] blink" />
      <div className="absolute bottom-[22%] left-[10%] h-1.5 w-1.5 rounded-full bg-white/70 twinkle" />
      <div className="absolute top-[42%] left-[8%] h-1.5 w-1.5 rounded-full bg-white/40 twinkle" style={{ animationDelay: "0.8s" }} />
      <div className="absolute bottom-[14%] right-[18%] h-1 w-1 rounded-full bg-white/60 twinkle" style={{ animationDelay: "1.4s" }} />
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Confidential intro split                                                   */
/* -------------------------------------------------------------------------- */

function IntroSplit() {
  return (
    <section id="how" className="py-24 md:py-32">
      <Container>
        <div className="grid gap-12 md:grid-cols-12 md:gap-12 lg:gap-16 items-start">
          <Reveal className="md:col-span-7" as="div">
            <h2 className="text-[40px] md:text-[52px] leading-[1.04] tracking-tighter2 font-semibold text-[color:var(--color-ink-900)]">
              <span className="text-[color:var(--color-ink-400)]">Encrypted</span>{" "}
              <span className="serif-em">feedback</span>
              <br />
              <span className="serif-em">infrastructure,</span>
              <br />
              native to Walrus.
            </h2>
            <p className="mt-6 max-w-lg text-[15.5px] leading-relaxed text-[color:var(--color-ink-600)]">
              Built on Walrus storage with a Sui-anchored access policy and
              Seal-encrypted private fields — every submission becomes a
              content-addressed artifact your community can verify on chain
              your wallet already speaks.
            </p>
            <div className="mt-8">
              <PillButton href="/welcome" size="md">
                Open app
              </PillButton>
            </div>
          </Reveal>

          <Reveal className="md:col-span-5" delay={120} as="div">
            <div className="relative aspect-square rounded-2xl border border-[color:var(--color-line)] overflow-hidden bg-black flex items-center justify-center">
              <Entropy size={460} className="rounded-2xl" />
              <div className="absolute bottom-0 inset-x-0 px-5 py-4 bg-gradient-to-t from-black via-black/50 to-transparent z-10">
                <div className="text-[10px] tracking-[0.22em] uppercase text-white/55">
                  Encrypted on Walrus
                </div>
                <div className="mt-1 text-[12px] font-mono text-white/85">
                  blob_a1c8b9f23f2eaab0cc5e7f81b1d9c4d5
                </div>
              </div>
              <div className="absolute top-3 left-3 z-10 inline-flex items-center gap-1.5 rounded-full bg-white/[0.06] border border-white/15 px-2.5 py-1 text-[9.5px] tracking-[0.2em] uppercase text-white/70">
                <span className="block h-1.5 w-1.5 rounded-full bg-white/60" />
                Order
              </div>
              <div className="absolute top-3 right-3 z-10 inline-flex items-center gap-1.5 rounded-full bg-white/[0.06] border border-white/15 px-2.5 py-1 text-[9.5px] tracking-[0.2em] uppercase text-white/70">
                Chaos
                <span className="block h-1.5 w-1.5 rounded-full bg-[color:var(--color-accent-glow)]" />
              </div>
            </div>
          </Reveal>
        </div>
      </Container>
    </section>
  );
}

/* -------------------------------------------------------------------------- */
/* Stat row                                                                   */
/* -------------------------------------------------------------------------- */

function StatRow() {
  const stats = [
    { value: "1", label: "Move package on Sui mainnet" },
    { value: "9", label: "Field types supported" },
    { value: "1:1", label: "Schema → Walrus blob" },
    { value: "0", label: "Plaintext leaks per response" },
  ];
  return (
    <section className="border-t border-b border-[color:var(--color-line)] bg-[color:var(--color-bg-soft)] py-14 md:py-20">
      <Container>
        <div className="grid gap-y-10 gap-x-6 sm:grid-cols-2 lg:grid-cols-4">
          {stats.map((s, i) => (
            <Reveal key={s.label} delay={i * 80}>
              <div className="text-[42px] md:text-[56px] leading-none font-serif italic tracking-tightish text-[color:var(--color-ink-900)]">
                {s.value}
              </div>
              <div className="mt-3 text-[11px] tracking-[0.18em] uppercase text-[color:var(--color-ink-500)] max-w-[200px]">
                {s.label}
              </div>
            </Reveal>
          ))}
        </div>
      </Container>
    </section>
  );
}

/* -------------------------------------------------------------------------- */
/* Why section — three guarantees                                             */
/* -------------------------------------------------------------------------- */

function WhySection() {
  return (
    <section id="why" className="py-24 md:py-32">
      <Container>
        <Reveal>
          <div className="eyebrow">Why SignalVault</div>
          <h2 className="mt-3 max-w-3xl text-[36px] md:text-[48px] leading-[1.06] tracking-tighter2 font-semibold text-[color:var(--color-ink-900)]">
            <span className="serif-em">Three guarantees</span> ordinary form vendors can&rsquo;t make.
          </h2>
        </Reveal>

        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {GUARANTEES.map((g, i) => (
            <Reveal key={g.title} delay={i * 90}>
              <div className="rounded-2xl border border-[color:var(--color-line)] bg-white shadow-card overflow-hidden h-full flex flex-col">
                <div className="aspect-[4/3] bg-white relative flex items-center justify-center border-b border-[color:var(--color-line)]">
                  <div className="absolute top-4 left-4 inline-flex h-9 w-9 items-center justify-center rounded-full bg-[color:var(--color-bg-soft)] border border-[color:var(--color-line)]">
                    <g.iconTL className="h-4 w-4 text-[color:var(--color-ink-700)]" />
                  </div>
                  <g.Visual />
                  <div className="absolute bottom-4 right-4 inline-flex h-9 w-9 items-center justify-center rounded-full bg-[color:var(--color-bg-soft)] border border-[color:var(--color-line)]">
                    <g.iconBR className="h-4 w-4 text-[color:var(--color-ink-700)]" />
                  </div>
                </div>
                <div className="px-6 py-6 flex flex-col gap-2">
                  <div className="eyebrow">{g.tag}</div>
                  <h3 className="text-[18px] font-semibold tracking-tightish text-[color:var(--color-ink-900)]">
                    {g.title}
                  </h3>
                  <p className="text-[13.5px] leading-relaxed text-[color:var(--color-ink-600)]">
                    {g.body}
                  </p>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </Container>
    </section>
  );
}

const GUARANTEES = [
  {
    tag: "Encrypted answers",
    title: "Sensitive fields stay sealed",
    body:
      "Each field marked sensitive is encrypted with Seal in the browser. The plaintext never leaves the contributor's device.",
    iconTL: Lock,
    iconBR: EyeOff,
    Visual: HistogramVisual,
  },
  {
    tag: "Public accountability",
    title: "Submissions stay verifiable",
    body:
      "Every response becomes a content-addressed Walrus blob. Anyone can fetch the bytes and check the hash matches the receipt.",
    iconTL: ShieldCheck,
    iconBR: CheckCircle2,
    Visual: AggregateVisual,
  },
  {
    tag: "Zero gatekeepers",
    title: "Self-sovereign submissions",
    body:
      "Anyone with a wallet can submit. The form owner controls the admin allowlist on chain — no vendor lock-in, no privileged backend.",
    iconTL: Globe,
    iconBR: ShieldCheck,
    Visual: WalletVisual,
  },
];

/* -------------------------------------------------------------------------- */
/* Receipt section                                                            */
/* -------------------------------------------------------------------------- */

function ReceiptSection() {
  return (
    <section id="receipt" className="py-24 md:py-32 border-t border-[color:var(--color-line)] bg-[color:var(--color-bg-soft)]">
      <Container>
        <div className="grid gap-14 md:grid-cols-2 md:items-center">
          <Reveal>
            <div className="eyebrow">Proof-of-Feedback</div>
            <h2 className="mt-3 text-[36px] md:text-[44px] leading-[1.08] tracking-tighter2 font-semibold text-[color:var(--color-ink-900)]">
              Every submission can produce a <span className="serif-em">receipt</span>
              <br />
              without revealing the submission.
            </h2>
            <p className="mt-5 text-[15px] text-[color:var(--color-ink-600)] leading-relaxed max-w-lg">
              Contributors hold a public, content-addressed receipt — form ID,
              response blob ID, content hash, timestamp. The body remains
              Seal-encrypted on Walrus. Useful for grant applicants, bug
              reporters, and anyone who needs to prove a submission without
              leaking what they wrote.
            </p>
            <div className="mt-8 flex items-center gap-5">
              <PillButton href="/receipt?id=demo" size="md">
                See an example receipt
              </PillButton>
              <a href="#how" className="text-[12px] tracking-[0.18em] uppercase text-[color:var(--color-ink-700)] hover:text-[color:var(--color-ink-900)]">
                Learn more ↗
              </a>
            </div>
          </Reveal>

          <Reveal delay={140}>
            <div className="rounded-2xl border border-[color:var(--color-line)] bg-white shadow-card overflow-hidden">
              <div className="px-6 py-4 border-b border-[color:var(--color-line)] flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Receipt className="h-4 w-4 text-[color:var(--color-ink-700)]" />
                  <span className="text-[11px] tracking-[0.2em] uppercase text-[color:var(--color-ink-500)]">
                    Feedback receipt
                  </span>
                </div>
                <Lock className="h-3.5 w-3.5 text-[color:var(--color-accent)]" />
              </div>
              <div className="px-6 py-5 space-y-3.5 text-[13px]">
                <Row k="Form" v="Mainnet bug intake" />
                <Row k="Response blob" v="walrus://demo_blob_…001" mono />
                <Row k="Content hash" v="f1c2b9aabbccddee…56778899" mono />
                <Row k="Submitted" v="2026-05-06 03:14 UTC" />
                <Row k="Wallet" v="0xc0ffee…ffee" mono />
              </div>
              <div className="border-t border-[color:var(--color-line)] px-6 py-3 flex items-center gap-2 text-[12px] text-[color:var(--color-ink-600)]">
                <Lock className="h-3.5 w-3.5 text-[color:var(--color-accent)]" />
                Body remains Seal-encrypted.
              </div>
            </div>
          </Reveal>
        </div>
      </Container>
    </section>
  );
}

function Row({ k, v, mono }: { k: string; v: string; mono?: boolean }) {
  return (
    <div className="flex items-baseline justify-between gap-4 border-b border-[color:var(--color-line)] pb-2 last:border-0">
      <span className="text-[color:var(--color-ink-500)]">{k}</span>
      <span className={mono ? "font-mono text-[color:var(--color-ink-900)]" : "text-[color:var(--color-ink-900)]"}>
        {v}
      </span>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Walrus integrations                                                        */
/* -------------------------------------------------------------------------- */

function IntegrationsSection() {
  return (
    <section className="py-24 md:py-32">
      <Container>
        <Reveal>
          <div className="eyebrow">Built on Walrus, end-to-end</div>
          <h2 className="mt-3 max-w-3xl text-[36px] md:text-[48px] leading-[1.06] tracking-tighter2 font-semibold text-[color:var(--color-ink-900)]">
            <span className="serif-em">Five Walrus</span> touchpoints — live.
          </h2>
          <p className="mt-5 max-w-xl text-[15px] text-[color:var(--color-ink-600)] leading-relaxed">
            Schemas, response envelopes, media uploads, indexes, and receipts —
            all stored as content-addressed Walrus blobs. Sui anchors ownership
            and access; Seal handles encryption.
          </p>
        </Reveal>

        <div className="mt-12 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
          {INTEGRATIONS.map((t, i) => (
            <Reveal key={t.title} delay={i * 70}>
              <div className="rounded-2xl border border-[color:var(--color-line)] bg-white shadow-card h-full flex flex-col overflow-hidden">
                <t.Viz />
                <div className="px-5 py-5 space-y-1.5">
                  <div className="eyebrow">{t.tag}</div>
                  <h3 className="text-[14px] font-semibold tracking-tightish text-[color:var(--color-ink-900)]">
                    {t.title}
                  </h3>
                  <p className="text-[12.5px] leading-relaxed text-[color:var(--color-ink-600)]">
                    {t.body}
                  </p>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </Container>
    </section>
  );
}

const INTEGRATIONS = [
  { tag: "Schema blob", title: "Form definitions", body: "Every form schema is published as a public Walrus blob. Forks become public goods.", Viz: SchemaBlobViz },
  { tag: "Response blob", title: "Encrypted envelopes", body: "Public + sealed payload travel together. The hash binds them on Walrus.", Viz: EncryptedEnvelopeViz },
  { tag: "Media blob", title: "Screenshots & video", body: "Per-attachment Walrus blob, referenced from the response envelope.", Viz: MediaBlobViz },
  { tag: "Index", title: "Form response index", body: "Lightweight index per form, mapping responses → blob IDs for the dashboard.", Viz: IndexViz },
  { tag: "Receipt", title: "Proof-of-Feedback", body: "Public artifact with form ID, blob ID, hash, timestamp, optional wallet.", Viz: ReceiptViz },
];

/* -------------------------------------------------------------------------- */
/* Closing CTA + ghost type                                                   */
/* -------------------------------------------------------------------------- */

function ClosingCTA() {
  return (
    <section className="border-t border-[color:var(--color-line)] py-24 md:py-32">
      <Container>
        <div className="grid gap-12 md:grid-cols-2 md:items-center">
          <Reveal>
            <h2 className="text-[36px] md:text-[44px] leading-[1.06] tracking-tighter2 font-semibold text-[color:var(--color-ink-900)]">
              Start collecting <span className="serif-em">privately.</span>
            </h2>
            <p className="mt-5 max-w-md text-[15px] text-[color:var(--color-ink-600)] leading-relaxed">
              Build a form in 90 seconds, share the link, decrypt only what your
              team is authorized for.
            </p>
            <div className="mt-7">
              <PillButton href="/welcome" size="lg">
                Launch app
              </PillButton>
            </div>
          </Reveal>
          <Reveal delay={120}>
            <div className="text-right">
              <span className="block text-[42px] md:text-[64px] leading-[1.0] tracking-tighter2 text-[color:var(--color-ink-300)] font-semibold">
                Encrypted feedback
              </span>
              <span className="block mt-2 text-[42px] md:text-[64px] leading-[1.0] tracking-tighter2 font-semibold text-[color:var(--color-ink-900)]">
                <span className="serif-em">native to</span> Walrus.
              </span>
            </div>
          </Reveal>
        </div>
      </Container>
    </section>
  );
}
