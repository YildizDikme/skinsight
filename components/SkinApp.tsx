"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { ArrowCounterClockwise, Sparkle } from "@phosphor-icons/react";
import { preload, prepareImage, type PreparedImage } from "@/lib/image";
import { defaultSelection, ENGINE_ERRORS, parseOutput, type TaskResponse } from "@/lib/skin";
import { PillButton, SPRING } from "./ui";
import Hero from "./Hero";
import Results from "./Results";
import Splash from "./Splash";

export type Stage = "idle" | "ready" | "analyzing" | "results" | "error";

export type SentRequest = {
  method: string;
  endpoint: string;
  body: Record<string, unknown>;
  taskId: string;
};

export type Failure = { message: string; code?: string };

const POLL_MS = 2500;
const TIMEOUT_MS = 180_000;
const MAX_POLL_FAILURES = 4;
const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

export default function SkinApp() {
  const [booted, setBooted] = useState(false);
  const [stage, setStage] = useState<Stage>("idle");
  const [image, setImage] = useState<PreparedImage | null>(null);
  const [sent, setSent] = useState<SentRequest | null>(null);
  const [response, setResponse] = useState<TaskResponse | null>(null);
  const [failure, setFailure] = useState<Failure | null>(null);
  const [elapsed, setElapsed] = useState<number | null>(null);
  const runId = useRef(0);

  useEffect(() => {
    let alive = true;
    Promise.all([document.fonts?.ready, sleep(900)]).finally(() => {
      if (alive) setBooted(true);
    });
    return () => {
      alive = false;
    };
  }, []);

  async function selectFile(file: File) {
    runId.current++;
    setFailure(null);
    setResponse(null);
    try {
      const prepared = await prepareImage(file);
      if (image) URL.revokeObjectURL(image.previewUrl);
      setImage(prepared);
      setStage("ready");
    } catch (e) {
      setFailure({ message: e instanceof Error ? e.message : "Couldn't read this photo." });
      setStage("error");
    }
  }

  function reset() {
    runId.current++;
    if (image) URL.revokeObjectURL(image.previewUrl);
    setImage(null);
    setSent(null);
    setResponse(null);
    setFailure(null);
    setElapsed(null);
    setStage("idle");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function analyze() {
    if (!image) return;
    const id = ++runId.current;
    const started = performance.now();
    setStage("analyzing");
    setFailure(null);
    setResponse(null);
    setSent(null);

    const live = () => id === runId.current;
    const fail = (f: Failure, raw?: TaskResponse | null) => {
      if (!live()) return;
      setResponse(raw ?? null);
      setFailure(f);
      setStage("error");
    };

    let taskId: string;
    try {
      const form = new FormData();
      form.append("image", image.file);
      form.append("mode", image.mode);
      const res = await fetch("/api/analyze", { method: "POST", body: form });
      const json = await res.json().catch(() => ({}));
      if (!live()) return;
      if (!res.ok || !json.taskId) {
        const raw = json.response as TaskResponse | undefined;
        const code = raw?.error_code;
        return fail(
          {
            message:
              (code && ENGINE_ERRORS[code]) ??
              raw?.error ??
              json.error ??
              (res.status === 429
                ? "Too many requests right now. Please wait a moment and try again."
                : "The analysis couldn't be started. Please try again."),
            code,
          },
          raw,
        );
      }
      taskId = json.taskId;
      setSent({ ...json.request, taskId });
    } catch {
      return fail({ message: "Network error — please check your connection and try again." });
    }

    let misses = 0;
    while (performance.now() - started < TIMEOUT_MS) {
      await sleep(POLL_MS);
      if (!live()) return;

      let body: TaskResponse;
      let ok: boolean;
      try {
        const poll = await fetch(`/api/analyze/${encodeURIComponent(taskId)}`, { cache: "no-store" });
        ok = poll.ok;
        body = (await poll.json()) as TaskResponse;
      } catch {
        if (++misses >= MAX_POLL_FAILURES) {
          return fail({ message: "Lost connection while waiting for results. Please try again." });
        }
        continue;
      }
      if (!live()) return;

      const status = body?.data?.task_status;
      if (status === "success") {
        const { concerns } = parseOutput(body.data?.results?.output ?? []);
        const first = defaultSelection(concerns);
        const mask = concerns.find((c) => c.type === first?.type)?.primary.maskUrl;
        await preload([image.previewUrl, mask]);
        if (!live()) return;
        setResponse(body);
        setElapsed((performance.now() - started) / 1000);
        setStage("results");
        window.scrollTo({ top: 0 });
        return;
      }
      if (status === "error") {
        const code = body?.data?.error ?? undefined;
        return fail(
          {
            message:
              (code && ENGINE_ERRORS[code]) ??
              body?.data?.error_message ??
              "The analysis didn't complete. Please try another photo.",
            code,
          },
          body,
        );
      }
      if (!ok) {
        if (++misses >= MAX_POLL_FAILURES) {
          return fail({ message: body?.error ?? "The analysis service didn't respond.", code: body?.error_code }, body);
        }
        continue;
      }
      misses = 0;
    }
    fail({ message: "The analysis is taking longer than expected. Please try again." });
  }

  const showResults = stage === "results" && image && response;

  return (
    <>
      <AnimatePresence>{!booted && <Splash key="splash" />}</AnimatePresence>

      {booted && (
        <div className="relative z-10 flex min-h-[100dvh] flex-col">
          <Nav onReset={stage === "idle" ? undefined : reset} />

          <AnimatePresence mode="wait">
            {showResults ? (
              <motion.main
                key="results"
                className="flex-1"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0, y: -12 }}
                transition={{ duration: 0.6, ease: SPRING }}
              >
                <Results image={image} sent={sent} response={response} elapsed={elapsed} />
              </motion.main>
            ) : (
              <motion.main
                key="hero"
                className="flex flex-1"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0, y: -12, filter: "blur(6px)" }}
                transition={{ duration: 0.6, ease: SPRING }}
              >
                <Hero
                  stage={stage}
                  image={image}
                  failure={failure}
                  onSelect={selectFile}
                  onAnalyze={analyze}
                  onReset={reset}
                />
              </motion.main>
            )}
          </AnimatePresence>
        </div>
      )}
    </>
  );
}

function Nav({ onReset }: { onReset?: () => void }) {
  return (
    <motion.header
      initial={{ opacity: 0, y: -16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, ease: SPRING }}
      className="sticky top-0 z-40 flex justify-center px-4 pt-5"
    >
      <nav className="flex w-full max-w-6xl items-center justify-between gap-4 rounded-full bg-paper/70 py-2 pl-3 pr-2 ring-1 ring-ink/[0.07] backdrop-blur-xl shadow-[0_10px_40px_-20px_rgba(80,50,30,0.25)]">
        <button onClick={onReset} className="flex items-center gap-2.5 rounded-full pr-2" aria-label="Skinsight home">
          <span className="flex size-8 items-center justify-center rounded-full bg-ink text-paper">
            <Sparkle size={15} weight="light" />
          </span>
          <span className="font-serif text-[22px] leading-none tracking-tight">Skinsight</span>
        </button>
        <div className="flex min-h-9 items-center gap-3">
          <span className="hidden text-[12px] tracking-wide text-ink-soft sm:inline">
            Powered by YouCam AI Skin Analysis
          </span>
          <AnimatePresence>
            {onReset && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.4, ease: SPRING }}
              >
                <PillButton
                  variant="ghost"
                  onClick={onReset}
                  className="!py-1 !pl-4 !pr-1 !text-[13px]"
                  icon={<ArrowCounterClockwise size={14} weight="light" />}
                >
                  New analysis
                </PillButton>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </nav>
    </motion.header>
  );
}
