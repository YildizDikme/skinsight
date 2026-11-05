"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "motion/react";
import {
  ArrowRight,
  ArrowsClockwise,
  Check,
  Eyeglasses,
  SmileyBlank,
  SunDim,
  UploadSimple,
  WarningCircle,
} from "@phosphor-icons/react";
import type { PreparedImage } from "@/lib/image";
import type { Failure, Stage } from "./SkinApp";
import { Bezel, Eyebrow, PillButton, Reveal, SPRING } from "./ui";

const LOADING_LINES = [
  "Analyzing skin texture…",
  "Detecting skin concerns…",
  "Generating visual overlays…",
];

export default function Hero({
  stage,
  image,
  failure,
  onSelect,
  onAnalyze,
  onReset,
}: {
  stage: Stage;
  image: PreparedImage | null;
  failure: Failure | null;
  onSelect: (file: File) => void;
  onAnalyze: () => void;
  onReset: () => void;
}) {
  const input = useRef<HTMLInputElement>(null);
  const openPicker = () => input.current?.click();
  const [agreed, setAgreed] = useState(false);

  return (
    <section className="mx-auto grid w-full max-w-6xl flex-1 grid-cols-1 items-center gap-14 px-4 py-14 md:px-8 lg:grid-cols-12 lg:gap-10 lg:py-20">
      <input
        ref={input}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) onSelect(f);
          e.target.value = "";
        }}
      />

      <div className="lg:col-span-6">
        <Reveal>
          <Eyebrow>AI Skin Analysis</Eyebrow>
        </Reveal>
        <Reveal delay={0.08}>
          <h1 className="mt-7 font-serif text-[clamp(3.6rem,9vw,7.5rem)] leading-[0.88] tracking-[-0.02em]">
            Analyze
            <br />
            <span className="italic text-accent">Your</span> Skin
          </h1>
        </Reveal>
        <Reveal delay={0.16}>
          <p className="mt-7 max-w-md text-[17px] leading-relaxed text-ink-soft">
            Upload a clear, front-facing photo to generate your skin analysis.
          </p>
        </Reveal>

        <Reveal delay={0.24} className="mt-10 min-h-[168px]">
          <AnimatePresence mode="wait">
            {stage === "analyzing" ? (
              <LoadingLines key="loading" />
            ) : stage === "error" && failure ? (
              <motion.div
                key="error"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.5, ease: SPRING }}
                className="max-w-md"
              >
                <div className="flex gap-3 rounded-[1.25rem] bg-paper/80 p-4 ring-1 ring-accent/25">
                  <WarningCircle size={22} weight="light" className="mt-0.5 shrink-0 text-accent" />
                  <div>
                    <p className="text-[15px] leading-relaxed text-ink">{failure.message}</p>
                    {failure.code && (
                      <p className="mt-2 font-mono text-[11px] text-ink-faint">{failure.code}</p>
                    )}
                  </div>
                </div>
                <div className="mt-6 flex flex-wrap gap-3">
                  <PillButton onClick={openPicker} icon={<UploadSimple size={16} weight="light" />}>
                    Try another photo
                  </PillButton>
                  {image && (
                    <PillButton
                      variant="ghost"
                      onClick={onAnalyze}
                      disabled={!agreed}
                      icon={<ArrowsClockwise size={16} weight="light" />}
                    >
                      Retry
                    </PillButton>
                  )}
                </div>
                {image && <Consent agreed={agreed} onChange={setAgreed} />}
              </motion.div>
            ) : (
              <motion.div
                key={stage}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.5, ease: SPRING }}
              >
                <div className="flex flex-wrap items-center gap-3">
                  {stage === "ready" ? (
                    <>
                      <PillButton
                        onClick={onAnalyze}
                        disabled={!agreed}
                        icon={<ArrowRight size={16} weight="light" />}
                      >
                        Analyze Skin
                      </PillButton>
                      <button
                        onClick={openPicker}
                        className="rounded-full px-4 py-3 text-[14px] text-ink-soft transition-colors duration-300 hover:text-ink"
                      >
                        Change photo
                      </button>
                    </>
                  ) : (
                    <PillButton onClick={openPicker} icon={<UploadSimple size={16} weight="light" />}>
                      Upload Photo
                    </PillButton>
                  )}
                </div>
                {stage === "ready" && <Consent agreed={agreed} onChange={setAgreed} />}
                <ul className="mt-10 flex flex-wrap gap-x-6 gap-y-3 text-[13px] text-ink-soft">
                  <Tip icon={<SmileyBlank size={16} weight="light" />}>Face the camera</Tip>
                  <Tip icon={<SunDim size={16} weight="light" />}>Even, bright light</Tip>
                  <Tip icon={<Eyeglasses size={16} weight="light" />}>No glasses or bangs</Tip>
                </ul>
              </motion.div>
            )}
          </AnimatePresence>
        </Reveal>
      </div>

      <div className="lg:col-span-6">
        <Reveal delay={0.2} className="relative mx-auto w-full max-w-[440px]">
          <div className="absolute inset-0 hidden translate-x-6 translate-y-5 rotate-[4deg] rounded-[2rem] bg-accent-soft/70 ring-1 ring-ink/[0.05] md:block" />
          <PhotoFrame stage={stage} image={image} onPick={openPicker} onDrop={onSelect} onReset={onReset} />
        </Reveal>
      </div>
    </section>
  );
}

function Consent({ agreed, onChange }: { agreed: boolean; onChange: (v: boolean) => void }) {
  return (
    <div className="mt-6 max-w-md space-y-3 text-[13px] leading-relaxed text-ink-soft">
      <p className="rounded-[1rem] bg-paper/60 px-4 py-3 ring-1 ring-ink/[0.06]">
        Before analyzing, please read the{" "}
        <Link
          href="/privacy"
          target="_blank"
          className="text-ink underline decoration-ink/30 underline-offset-2 transition-colors hover:decoration-ink"
        >
          Privacy Notice · Aydınlatma Metni
        </Link>
        .
      </p>
      <label className="flex cursor-pointer items-start gap-3">
        <input
          type="checkbox"
          checked={agreed}
          onChange={(e) => onChange(e.target.checked)}
          className="peer sr-only"
        />
        <span
          className={`mt-0.5 flex size-[18px] shrink-0 items-center justify-center rounded-[6px] ring-1 transition-colors duration-300 ease-spring peer-focus-visible:ring-2 peer-focus-visible:ring-accent ${
            agreed ? "bg-ink text-paper ring-ink" : "bg-paper ring-ink/25"
          }`}
        >
          {agreed && <Check size={11} weight="bold" />}
        </span>
        <span>
          <span className="block text-ink">
            <span className="font-medium">Açık rıza:</span> Fotoğrafımın cilt analizi yapılması
            amacıyla YouCam&apos;e (Perfect Corp., ABD) gönderilmesine açık rıza veriyorum.
          </span>
          <span className="mt-1 block">
            I consent to my photo being sent to YouCam (Perfect Corp., USA) for skin analysis.
          </span>
        </span>
      </label>
    </div>
  );
}

function Tip({ icon, children }: { icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <li className="flex items-center gap-2">
      <span className="text-ink-faint">{icon}</span>
      {children}
    </li>
  );
}

function LoadingLines() {
  const [active, setActive] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setActive((i) => Math.min(i + 1, LOADING_LINES.length - 1)), 2200);
    return () => clearInterval(t);
  }, []);

  return (
    <motion.ul
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.5, ease: SPRING }}
      className="space-y-4"
    >
      {LOADING_LINES.map((line, i) => {
        const done = i < active;
        const current = i === active;
        return (
          <motion.li
            key={line}
            animate={{ opacity: done ? 0.45 : current ? 1 : 0.22, x: current ? 0 : 0 }}
            transition={{ duration: 0.7, ease: SPRING }}
            className="flex items-center gap-4"
          >
            <span className="flex size-7 items-center justify-center rounded-full bg-paper ring-1 ring-ink/10">
              {done ? (
                <Check size={13} weight="light" />
              ) : (
                <span className={`size-1.5 rounded-full bg-accent ${current ? "breathe" : "opacity-40"}`} />
              )}
            </span>
            <span className="font-serif text-[28px] leading-none tracking-tight">{line}</span>
          </motion.li>
        );
      })}
    </motion.ul>
  );
}

function PhotoFrame({
  stage,
  image,
  onPick,
  onDrop,
  onReset,
}: {
  stage: Stage;
  image: PreparedImage | null;
  onPick: () => void;
  onDrop: (file: File) => void;
  onReset: () => void;
}) {
  const [over, setOver] = useState(false);
  const analyzing = stage === "analyzing";

  return (
    <Bezel className="relative" coreClassName="aspect-[3/4]">
      {image ? (
        <>
          <motion.img
            key={image.previewUrl}
            src={image.previewUrl}
            alt="Your selfie"
            initial={{ opacity: 0, scale: 1.04 }}
            animate={{ opacity: 1, scale: analyzing ? 1.015 : 1 }}
            transition={{ duration: 1.1, ease: SPRING }}
            className="absolute inset-0 size-full object-cover"
          />
          <AnimatePresence>
            {analyzing && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.8, ease: SPRING }}
                className="absolute inset-0"
              >
                <div className="absolute inset-0 bg-gradient-to-b from-night/10 via-night/25 to-night/55" />
                <div
                  className="absolute inset-0 opacity-30"
                  style={{
                    backgroundImage:
                      "linear-gradient(rgba(255,255,255,0.18) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.18) 1px, transparent 1px)",
                    backgroundSize: "36px 36px",
                  }}
                />
                <div className="scan-beam absolute inset-x-0 top-0 h-1/4 bg-gradient-to-b from-transparent via-[rgba(255,214,190,0.35)] to-transparent">
                  <div className="absolute inset-x-0 bottom-1/2 h-px bg-[rgba(255,228,210,0.9)] shadow-[0_0_24px_4px_rgba(255,190,150,0.6)]" />
                </div>
                <Corners />
              </motion.div>
            )}
          </AnimatePresence>
          {!analyzing && (
            <div className="absolute inset-x-0 bottom-0 flex items-center justify-between gap-3 p-4">
              <span className="rounded-full bg-night/55 px-3 py-1.5 font-mono text-[11px] text-paper/90 backdrop-blur-md">
                {image.mode.toUpperCase()} · {image.width}×{image.height}
              </span>
              <button
                onClick={onReset}
                className="rounded-full bg-night/55 px-3 py-1.5 text-[12px] text-paper/90 backdrop-blur-md transition-colors hover:bg-night/75"
              >
                Remove
              </button>
            </div>
          )}
        </>
      ) : (
        <button
          onClick={onPick}
          onDragOver={(e) => {
            e.preventDefault();
            setOver(true);
          }}
          onDragLeave={() => setOver(false)}
          onDrop={(e) => {
            e.preventDefault();
            setOver(false);
            const f = e.dataTransfer.files?.[0];
            if (f) onDrop(f);
          }}
          className={`group absolute inset-0 flex flex-col items-center justify-center gap-6 transition-colors duration-500 ease-spring ${
            over ? "bg-accent-soft/50" : "bg-paper hover:bg-[#f8f2ea]"
          }`}
        >
          <FaceGuide />
          <div className="text-center">
            <p className="font-serif text-[26px] leading-none">Drop a selfie here</p>
            <p className="mt-2 text-[13px] text-ink-soft">or click to browse · JPG or PNG</p>
          </div>
        </button>
      )}
    </Bezel>
  );
}

function Corners() {
  const c = "absolute size-8 border-paper/80";
  return (
    <>
      <span className={`${c} left-5 top-5 rounded-tl-xl border-l border-t`} />
      <span className={`${c} right-5 top-5 rounded-tr-xl border-r border-t`} />
      <span className={`${c} bottom-5 left-5 rounded-bl-xl border-b border-l`} />
      <span className={`${c} bottom-5 right-5 rounded-br-xl border-b border-r`} />
    </>
  );
}

function FaceGuide() {
  return (
    <svg
      width="150"
      height="190"
      viewBox="0 0 150 190"
      fill="none"
      className="text-ink/25 transition-transform duration-700 ease-spring group-hover:scale-[1.03]"
      aria-hidden
    >
      <ellipse cx="75" cy="92" rx="56" ry="74" stroke="currentColor" strokeWidth="1" strokeDasharray="3 5" />
      <path d="M52 80c5-4 13-4 18 0M80 80c5-4 13-4 18 0" stroke="currentColor" strokeWidth="1" strokeLinecap="round" />
      <path d="M75 92v18c0 3-3 5-7 5" stroke="currentColor" strokeWidth="1" strokeLinecap="round" />
      <path d="M62 132c8 5 18 5 26 0" stroke="currentColor" strokeWidth="1" strokeLinecap="round" />
      <path d="M10 22V10h12M140 22V10h-12M10 168v12h12M140 168v12h-12" stroke="currentColor" strokeWidth="1" />
    </svg>
  );
}
