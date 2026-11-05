"use client";

import { motion } from "motion/react";
import type { ComponentProps, ReactNode } from "react";

export const SPRING = [0.32, 0.72, 0, 1] as const;

export function Bezel({
  children,
  className = "",
  coreClassName = "",
  dark = false,
  style,
}: {
  children: ReactNode;
  className?: string;
  coreClassName?: string;
  dark?: boolean;
  style?: React.CSSProperties;
}) {
  return (
    <div
      style={style}
      className={`rounded-[2rem] p-1.5 ${
        dark ? "bg-night/90 ring-1 ring-white/10" : "bg-ink/[0.035] ring-1 ring-ink/[0.06]"
      } ${className}`}
    >
      <div
        className={`relative overflow-hidden rounded-[calc(2rem-0.375rem)] ${
          dark
            ? "bg-night-2 shadow-[inset_0_1px_1px_rgba(255,255,255,0.06)]"
            : "bg-paper shadow-[inset_0_1px_1px_rgba(255,255,255,0.9),0_30px_60px_-30px_rgba(80,50,30,0.18)]"
        } ${coreClassName}`}
      >
        {children}
      </div>
    </div>
  );
}

export function Eyebrow({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <span
      className={`inline-flex items-center gap-2 rounded-full bg-paper/70 px-3 py-1 text-[10px] font-medium uppercase tracking-[0.22em] text-ink-soft ring-1 ring-ink/[0.07] ${className}`}
    >
      <span className="size-1.5 rounded-full bg-accent" />
      {children}
    </span>
  );
}

export function PillButton({
  children,
  icon,
  variant = "primary",
  className = "",
  ...props
}: ComponentProps<"button"> & { icon?: ReactNode; variant?: "primary" | "ghost" }) {
  const primary = variant === "primary";
  return (
    <button
      {...props}
      className={`group inline-flex items-center gap-3 rounded-full py-2 pl-6 pr-2 text-[15px] font-medium transition-all duration-500 ease-spring active:scale-[0.98] disabled:pointer-events-none disabled:opacity-50 ${
        primary
          ? "bg-ink text-paper shadow-[0_14px_30px_-12px_rgba(27,22,19,0.55)] hover:bg-[#2a221d]"
          : "bg-paper/80 text-ink ring-1 ring-ink/10 hover:bg-paper"
      } ${className}`}
    >
      <span>{children}</span>
      {icon && (
        <span
          className={`flex size-9 items-center justify-center rounded-full transition-transform duration-500 ease-spring group-hover:translate-x-0.5 group-hover:-translate-y-px group-hover:scale-105 ${
            primary ? "bg-paper/12 text-paper" : "bg-ink/[0.06] text-ink"
          }`}
        >
          {icon}
        </span>
      )}
    </button>
  );
}

export function Reveal({
  children,
  delay = 0,
  className = "",
}: {
  children: ReactNode;
  delay?: number;
  className?: string;
}) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: 28, filter: "blur(8px)" }}
      animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
      transition={{ duration: 0.9, ease: SPRING, delay }}
    >
      {children}
    </motion.div>
  );
}
