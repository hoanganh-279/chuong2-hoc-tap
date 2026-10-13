import type { ReactNode } from "react";
import { Link } from "react-router-dom";

const base =
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-[var(--radius-ui)] px-5 h-12 text-[0.9375rem] font-semibold transition-[background-color,color,border-color,transform] duration-200 active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none";

export const btn = {
  primary: `${base} bg-accent text-accent-ink hover:bg-accent-hover`,
  secondary: `${base} border border-line bg-surface text-ink hover:border-accent hover:text-accent`,
  ghost: `${base} px-3 text-ink-soft hover:text-ink hover:bg-surface-muted`,
};

export function ButtonLink({
  to,
  variant = "primary",
  children,
  className = "",
}: {
  to: string;
  variant?: keyof typeof btn;
  children: ReactNode;
  className?: string;
}) {
  return (
    <Link to={to} className={`${btn[variant]} ${className}`}>
      {children}
    </Link>
  );
}

export function Badge({ tone = "neutral", children }: { tone?: "neutral" | "warn" | "ok" | "accent"; children: ReactNode }) {
  const tones = {
    neutral: "bg-surface-muted text-ink-soft",
    warn: "bg-warn-soft text-warn",
    ok: "bg-ok-soft text-ok",
    accent: "bg-accent-soft text-accent",
  };
  return (
    <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium ${tones[tone]}`}>
      {children}
    </span>
  );
}

export function EmptyState({ icon, title, body, action }: { icon: ReactNode; title: string; body: string; action?: ReactNode }) {
  return (
    <div className="flex flex-col items-start gap-3 rounded-[var(--radius-ui)] border border-dashed border-line bg-surface px-6 py-10 sm:items-center sm:text-center">
      <div className="text-accent">{icon}</div>
      <h3 className="text-lg font-semibold">{title}</h3>
      <p className="max-w-[52ch] text-ink-soft leading-relaxed">{body}</p>
      {action}
    </div>
  );
}

export function PageSkeleton() {
  return (
    <div className="mx-auto flex max-w-page flex-col gap-4 px-4 py-10 sm:px-6 lg:px-10" aria-busy="true" aria-label="Đang tải">
      <div className="skeleton h-5 w-40 rounded-md" />
      <div className="skeleton h-10 w-2/3 max-w-xl rounded-lg" />
      <div className="skeleton h-4 w-full max-w-2xl rounded-md" />
      <div className="mt-6 grid gap-4 md:grid-cols-[16rem_1fr]">
        <div className="skeleton hidden h-64 rounded-xl md:block" />
        <div className="skeleton h-96 rounded-xl" />
      </div>
    </div>
  );
}

export function Meter({ value, label }: { value: number; label: string }) {
  const pct = Math.round(Math.min(1, Math.max(0, value)) * 100);
  return (
    <div className="flex items-center gap-3">
      <div
        className="h-1.5 flex-1 overflow-hidden rounded-full bg-surface-muted"
        role="progressbar"
        aria-label={label}
        aria-valuenow={pct}
        aria-valuemin={0}
        aria-valuemax={100}
      >
        <div className="h-full rounded-full bg-accent transition-[width] duration-500" style={{ width: `${pct}%` }} />
      </div>
      <span className="w-10 text-right text-sm tabular-nums text-ink-soft">{pct}%</span>
    </div>
  );
}
