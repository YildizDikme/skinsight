"use client";

import { useMemo, useState } from "react";
import { motion } from "motion/react";
import { Check, Copy } from "@phosphor-icons/react";
import type { TaskResponse } from "@/lib/skin";
import type { SentRequest } from "./SkinApp";
import { Bezel, SPRING } from "./ui";

type Tab = "response" | "request";

function shortenUrl(value: string) {
  try {
    const u = new URL(value);
    const file = u.pathname.split("/").pop() ?? "";
    return `${u.origin}/…/${file}${u.search ? "?…" : ""}`;
  } catch {
    return value;
  }
}

const TOKEN = /("(?:\\.|[^"\\])*")(\s*:)?|\b(true|false|null)\b|(-?\d+(?:\.\d+)?(?:[eE][+-]?\d+)?)/g;

function highlight(json: string) {
  const out: React.ReactNode[] = [];
  let last = 0;
  let i = 0;
  for (const m of json.matchAll(TOKEN)) {
    if (m.index > last) out.push(json.slice(last, m.index));
    const [whole, str, colon, literal, num] = m;
    if (str && colon) {
      out.push(<span key={i++} className="text-[#e7b99f]">{str}</span>, colon);
    } else if (str) {
      out.push(<span key={i++} className="text-[#d9cdb8]">{str}</span>);
    } else if (literal) {
      out.push(<span key={i++} className="text-[#c7a6d8]">{literal}</span>);
    } else if (num) {
      out.push(<span key={i++} className="text-[#9ed2b4]">{num}</span>);
    } else {
      out.push(whole);
    }
    last = m.index + whole.length;
  }
  out.push(json.slice(last));
  return out;
}

export default function RawJson({ response, sent }: { response: TaskResponse; sent: SentRequest | null }) {
  const [tab, setTab] = useState<Tab>("response");
  const [full, setFull] = useState(false);
  const [copied, setCopied] = useState(false);

  const value = tab === "response" ? response : sent?.body;
  const exact = useMemo(() => JSON.stringify(value, null, 2), [value]);
  const shown = useMemo(
    () =>
      full
        ? exact
        : JSON.stringify(
            value,
            (_k, v) => (typeof v === "string" && v.startsWith("https://") && v.length > 90 ? shortenUrl(v) : v),
            2,
          ),
    [value, exact, full],
  );

  const endpoint =
    tab === "response"
      ? `GET /s2s/v2.1/task/skin-analysis/${sent ? sent.taskId.slice(0, 10) + "…" : "{task_id}"}`
      : `${sent?.method ?? "POST"} ${sent?.endpoint ?? "/s2s/v2.1/task/skin-analysis"}`;

  return (
    <Bezel dark>
      <div className="flex flex-col gap-4 border-b border-white/[0.06] px-6 py-5 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="font-serif text-[26px] leading-none text-paper">Raw API Response</p>
          <p className="mt-2 font-mono text-[11px] text-paper/45">{endpoint}</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex rounded-full bg-white/[0.05] p-1 ring-1 ring-white/[0.08]">
            {(["response", "request"] as Tab[]).map((t) => (
              <button
                key={t}
                onClick={() => setTab(t)}
                disabled={t === "request" && !sent}
                className={`relative rounded-full px-4 py-1.5 text-[12px] capitalize transition-colors duration-300 disabled:opacity-40 ${
                  tab === t ? "text-ink" : "text-paper/60 hover:text-paper"
                }`}
              >
                {tab === t && (
                  <motion.span
                    layoutId="json-tab"
                    className="absolute inset-0 rounded-full bg-paper"
                    transition={{ duration: 0.5, ease: SPRING }}
                  />
                )}
                <span className="relative">{t}</span>
              </button>
            ))}
          </div>
          <button
            onClick={() => setFull((f) => !f)}
            className="rounded-full px-3.5 py-2 text-[12px] text-paper/60 ring-1 ring-white/[0.08] transition-colors hover:text-paper"
          >
            {full ? "Short URLs" : "Full URLs"}
          </button>
          <button
            onClick={async () => {
              await navigator.clipboard.writeText(exact);
              setCopied(true);
              setTimeout(() => setCopied(false), 1600);
            }}
            className="flex size-9 items-center justify-center rounded-full text-paper/70 ring-1 ring-white/[0.08] transition-colors hover:text-paper"
            aria-label="Copy JSON"
          >
            {copied ? <Check size={15} weight="light" /> : <Copy size={15} weight="light" />}
          </button>
        </div>
      </div>
      <pre className="json-scroll max-h-[560px] overflow-auto px-6 py-5 font-mono text-[12.5px] leading-[1.7] text-paper/70">
        <code>{highlight(shown)}</code>
      </pre>
    </Bezel>
  );
}
