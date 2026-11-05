"use client";

import { motion } from "motion/react";
import { Sparkle } from "@phosphor-icons/react";
import { SPRING } from "./ui";

export default function Splash() {
  return (
    <motion.div
      initial={false}
      exit={{ opacity: 0, scale: 1.03, filter: "blur(10px)" }}
      transition={{ duration: 0.7, ease: SPRING }}
      className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-ivory"
      role="status"
      aria-label="Loading"
    >
      <div className="splash-in flex flex-col items-center">
        <span className="relative flex size-16 items-center justify-center rounded-full bg-ink text-paper shadow-[0_20px_50px_-20px_rgba(27,22,19,0.6)]">
          <span className="splash-ring absolute inset-0 rounded-full ring-1 ring-accent/50" />
          <Sparkle size={26} weight="light" />
        </span>
        <p className="mt-6 font-serif text-[40px] leading-none tracking-tight">Skinsight</p>
        <p className="mt-3 text-[11px] uppercase tracking-[0.24em] text-ink-faint">AI Skin Analysis</p>
        <div className="mt-10 h-px w-40 overflow-hidden rounded-full bg-ink/10">
          <div className="splash-bar h-full w-1/3 rounded-full bg-accent" />
        </div>
      </div>
    </motion.div>
  );
}
