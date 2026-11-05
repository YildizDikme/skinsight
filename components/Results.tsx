"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "motion/react";
import { ArrowDown, ChartLineUp, Drop, ShoppingBagOpen } from "@phosphor-icons/react";
import type { PreparedImage } from "@/lib/image";
import {
  concernLabel,
  defaultSelection,
  parseOutput,
  regionLabel,
  type Concern,
  type Region,
  type TaskResponse,
} from "@/lib/skin";
import type { SentRequest } from "./SkinApp";
import { Bezel, Eyebrow, Reveal, SPRING } from "./ui";
import RawJson from "./RawJson";

type View = "original" | "heatmap" | "mask";
type Selection = { type: string; region: string | null };

export default function Results({
  image,
  sent,
  response,
  elapsed,
}: {
  image: PreparedImage;
  sent: SentRequest | null;
  response: TaskResponse;
  elapsed: number | null;
}) {
  const { concerns, overall, skinAge } = useMemo(
    () => parseOutput(response.data?.results?.output ?? []),
    [response],
  );

  const [view, setView] = useState<View>("heatmap");
  const [selected, setSelected] = useState<Selection | null>(() => defaultSelection(concerns));

  const current = useMemo(() => {
    if (!selected) return null;
    const concern = concerns.find((c) => c.type === selected.type);
    if (!concern) return null;
    const region =
      [concern.primary, ...concern.regions].find((r) => r.region === selected.region) ??
      concern.primary;
    return { concern, region };
  }, [concerns, selected]);

  useEffect(() => {
    for (const c of concerns)
      for (const r of [c.primary, ...c.regions]) if (r.maskUrl) new Image().src = r.maskUrl;
  }, [concerns]);

  return (
    <div className="mx-auto w-full max-w-6xl px-4 pb-10 pt-12 md:px-8 lg:pt-16">
      <Reveal>
        <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <div>
            <Eyebrow>Analysis complete</Eyebrow>
            <h2 className="mt-6 font-serif text-[clamp(3rem,7vw,5.75rem)] leading-[0.9] tracking-[-0.02em]">
              Your <span className="italic text-accent">Skin</span> Analysis
            </h2>
          </div>
          <div className="flex flex-wrap items-center gap-2 font-mono text-[11px] text-ink-soft">
            <Meta>
              {image.mode.toUpperCase()} · {concerns.length} concerns
            </Meta>
            {elapsed !== null && <Meta>Analyzed in {elapsed.toFixed(1)}s</Meta>}
            <a
              href="#raw-json"
              className="group flex items-center gap-1.5 rounded-full bg-ink px-3 py-1.5 text-paper transition-transform duration-500 ease-spring active:scale-[0.97]"
            >
              Raw JSON
              <ArrowDown size={12} weight="light" className="transition-transform duration-500 ease-spring group-hover:translate-y-0.5" />
            </a>
          </div>
        </div>
      </Reveal>

      <div className="mt-10 grid grid-cols-1 gap-6 lg:mt-12 lg:grid-cols-12 lg:gap-8">
        <Reveal delay={0.1} className="lg:col-span-7">
          <div className="lg:sticky lg:top-28">
            <Viewer
              base={image.previewUrl}
              width={image.width}
              height={image.height}
              view={view}
              setView={setView}
              maskUrl={current?.region.maskUrl}
              caption={
                current
                  ? `${concernLabel(current.concern.type)} · ${regionLabel(current.region.region)}`
                  : undefined
              }
            />
          </div>
        </Reveal>

        <div className="space-y-6 lg:col-span-5">
          {(overall !== undefined || skinAge !== undefined) && (
            <Reveal delay={0.18}>
              <Summary overall={overall} skinAge={skinAge} />
            </Reveal>
          )}
          <Reveal delay={0.26}>
            <ConcernList
              concerns={concerns}
              selected={selected}
              onSelect={(s) => {
                setSelected(s);
                if (view === "original") setView("heatmap");
              }}
            />
          </Reveal>
        </div>
      </div>

      <Reveal delay={0.34} className="mt-6 scroll-mt-28 lg:mt-8">
        <div id="raw-json" className="scroll-mt-28">
          <RawJson response={response} sent={sent} />
        </div>
      </Reveal>

      <UseCases />
    </div>
  );
}

function Meta({ children }: { children: React.ReactNode }) {
  return <span className="rounded-full bg-paper/70 px-3 py-1.5 ring-1 ring-ink/[0.07]">{children}</span>;
}

const VIEWS: { id: View; label: string }[] = [
  { id: "original", label: "Original" },
  { id: "heatmap", label: "Heatmap" },
  { id: "mask", label: "Mask" },
];

function Viewer({
  base,
  width,
  height,
  view,
  setView,
  maskUrl,
  caption,
}: {
  base: string;
  width: number;
  height: number;
  view: View;
  setView: (v: View) => void;
  maskUrl?: string;
  caption?: string;
}) {
  const showMask = view !== "original" && maskUrl;
  return (
    <Bezel
      coreClassName="bg-night"
      className="mx-auto lg:max-w-[calc((100dvh-9rem)*var(--ar))]"
      style={{ "--ar": width / height } as React.CSSProperties}
    >
      <div className="relative w-full" style={{ aspectRatio: `${width} / ${height}` }}>
        <motion.img
          src={base}
          alt="Analyzed selfie"
          animate={{ opacity: view === "mask" ? 0.12 : 1 }}
          transition={{ duration: 0.7, ease: SPRING }}
          className="absolute inset-0 size-full object-cover"
        />
        <AnimatePresence>
          {showMask && (
            <motion.img
              key={maskUrl}
              src={maskUrl}
              alt=""
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.6, ease: SPRING }}
              className="absolute inset-0 size-full object-cover"
            />
          )}
        </AnimatePresence>

        <div className="absolute left-3 top-3 flex rounded-full bg-night/55 p-1 ring-1 ring-white/10 backdrop-blur-md sm:left-4 sm:top-4">
          {VIEWS.map((v) => (
            <button
              key={v.id}
              onClick={() => setView(v.id)}
              className={`relative rounded-full px-3.5 py-1.5 text-[13px] transition-colors duration-300 sm:px-4 ${
                view === v.id ? "text-ink" : "text-paper/75 hover:text-paper"
              }`}
            >
              {view === v.id && (
                <motion.span
                  layoutId="view-pill"
                  className="absolute inset-0 rounded-full bg-paper"
                  transition={{ duration: 0.5, ease: SPRING }}
                />
              )}
              <span className="relative">{v.label}</span>
            </button>
          ))}
        </div>

        <AnimatePresence>
          {view !== "original" && caption && (
            <motion.div
              key={caption}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 4 }}
              transition={{ duration: 0.5, ease: SPRING }}
              className="absolute bottom-3 left-3 right-3 flex flex-wrap items-center justify-between gap-2 sm:bottom-4 sm:left-4 sm:right-4"
            >
              <span className="rounded-full bg-night/60 px-3.5 py-1.5 font-serif text-[18px] leading-none text-paper backdrop-blur-md">
                {caption}
              </span>
              <span className="hidden rounded-full bg-night/60 px-3 py-1.5 font-mono text-[10px] uppercase tracking-[0.14em] text-paper/70 backdrop-blur-md sm:inline">
                Real API visual result
              </span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </Bezel>
  );
}

function Summary({ overall, skinAge }: { overall?: number; skinAge?: number }) {
  const both = overall !== undefined && skinAge !== undefined;
  return (
    <Bezel dark coreClassName={`grid text-paper ${both ? "grid-cols-2" : "grid-cols-1"}`}>
      {overall !== undefined && (
        <div className="p-6">
          <p className="text-[12px] uppercase tracking-[0.18em] text-paper/50">Overall</p>
          <p className="mt-3 font-serif text-[64px] leading-none">
            {Math.round(overall)}
            <span className="ml-1 text-[22px] text-paper/40">/100</span>
          </p>
          <p className="mt-3 font-mono text-[10px] text-paper/40">all.score = {overall}</p>
        </div>
      )}
      {skinAge !== undefined && (
        <div className={`p-6 ${both ? "border-l border-white/[0.07]" : ""}`}>
          <p className="text-[12px] uppercase tracking-[0.18em] text-paper/50">Skin age</p>
          <p className="mt-3 font-serif text-[64px] leading-none">{skinAge}</p>
          <p className="mt-3 font-mono text-[10px] text-paper/40">skin_age = {skinAge}</p>
        </div>
      )}
    </Bezel>
  );
}

function ConcernList({
  concerns,
  selected,
  onSelect,
}: {
  concerns: Concern[];
  selected: Selection | null;
  onSelect: (s: Selection) => void;
}) {
  return (
    <Bezel>
      <div className="flex items-baseline justify-between px-6 pb-2 pt-6">
        <p className="text-[12px] uppercase tracking-[0.18em] text-ink-soft">Skin concerns</p>
        <p className="font-mono text-[10px] text-ink-faint">ui_score · 1–100</p>
      </div>
      <ul className="px-2 pb-2">
        {concerns.map((c, i) => {
          const active = selected?.type === c.type;
          return (
            <motion.li
              key={c.type}
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, ease: SPRING, delay: 0.35 + i * 0.05 }}
              className={`rounded-[1.25rem] transition-colors duration-500 ease-spring ${
                active ? "bg-accent-soft/45" : "hover:bg-ink/[0.025]"
              }`}
            >
              <button
                onClick={() => onSelect({ type: c.type, region: c.primary.region })}
                className="w-full px-4 pb-3 pt-3.5 text-left"
              >
                <div className="flex items-baseline justify-between gap-4">
                  <span className="font-serif text-[23px] leading-none">{concernLabel(c.type)}</span>
                  <span className="font-mono text-[21px] tabular-nums leading-none">{c.primary.uiScore}</span>
                </div>
                <ScoreBar value={c.primary.uiScore} active={active} delay={0.5 + i * 0.05} />
                {c.primary.rawScore !== undefined && (
                  <p className="mt-2 font-mono text-[10px] text-ink-faint">
                    {c.type} · raw_score {c.primary.rawScore.toFixed(2)}
                  </p>
                )}
              </button>
              <AnimatePresence initial={false}>
                {active && c.regions.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.5, ease: SPRING }}
                    className="overflow-hidden"
                  >
                    <div className="flex flex-wrap gap-1.5 px-4 pb-4">
                      {[c.primary, ...c.regions].map((r) => (
                        <RegionChip
                          key={r.region ?? "whole"}
                          region={r}
                          active={selected?.region === r.region}
                          onClick={() => onSelect({ type: c.type, region: r.region })}
                        />
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.li>
          );
        })}
      </ul>
      <p className="border-t border-ink/[0.06] px-6 py-4 text-[12px] leading-relaxed text-ink-soft">
        Higher scores indicate healthier-looking skin. Select a concern to view its mask.
      </p>
    </Bezel>
  );
}

function ScoreBar({ value, active, delay }: { value: number; active: boolean; delay: number }) {
  return (
    <div className="mt-3 h-[3px] w-full overflow-hidden rounded-full bg-ink/[0.07]">
      <motion.div
        className={`h-full origin-left rounded-full transition-colors duration-500 ${active ? "bg-accent" : "bg-ink/70"}`}
        initial={{ scaleX: 0 }}
        animate={{ scaleX: value / 100 }}
        transition={{ duration: 1.2, ease: SPRING, delay }}
      />
    </div>
  );
}

function RegionChip({ region, active, onClick }: { region: Region; active: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-2 rounded-full px-3 py-1.5 text-[12px] transition-all duration-500 ease-spring active:scale-[0.97] ${
        active ? "bg-ink text-paper" : "bg-paper text-ink-soft ring-1 ring-ink/10 hover:text-ink"
      }`}
    >
      {regionLabel(region.region)}
      <span className={`font-mono text-[11px] ${active ? "text-paper/60" : "text-ink-faint"}`}>
        {region.uiScore}
      </span>
    </button>
  );
}

const USE_CASES = [
  { icon: Drop, title: "Skincare Apps", text: "Personalized experiences" },
  { icon: ShoppingBagOpen, title: "Beauty E-commerce", text: "Product discovery experiences" },
  { icon: ChartLineUp, title: "Skin Tracking", text: "Track changes over time" },
];

function UseCases() {
  return (
    <footer className="mt-24 border-t border-ink/[0.07] pt-12 md:mt-32">
      <div className="flex flex-col gap-10 md:flex-row md:items-start md:justify-between">
        <div className="max-w-xs">
          <p className="text-[12px] uppercase tracking-[0.18em] text-ink-faint">Built with</p>
          <p className="mt-3 font-serif text-[30px] leading-[1.05]">YouCam AI Skin Analysis</p>
        </div>
        <ul className="grid flex-1 grid-cols-1 gap-3 sm:grid-cols-3 md:max-w-2xl">
          {USE_CASES.map(({ icon: Icon, title, text }) => (
            <li key={title} className="rounded-[1.5rem] bg-paper/60 p-5 ring-1 ring-ink/[0.06]">
              <Icon size={22} weight="light" className="text-accent" />
              <p className="mt-6 text-[15px] font-medium">{title}</p>
              <p className="mt-1 text-[13px] text-ink-soft">{text}</p>
            </li>
          ))}
        </ul>
      </div>
      <p className="mt-14 pb-4 text-[11px] text-ink-faint">
        Cosmetic skin analysis for informational purposes — not a medical diagnosis. ·{" "}
        <Link href="/privacy" target="_blank" className="underline decoration-ink/20 underline-offset-2 hover:text-ink-soft">
          Privacy notice · Aydınlatma metni
        </Link>
      </p>
    </footer>
  );
}
