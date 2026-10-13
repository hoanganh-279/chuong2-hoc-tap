import { CheckCircle, XCircle } from "@phosphor-icons/react";

export default function OptionReason({ tone, heading, option, reason }: {
  tone: "ok" | "bad";
  heading: string;
  option: string;
  reason?: string;
}) {
  const Icon = tone === "ok" ? CheckCircle : XCircle;
  return (
    <div className="flex gap-3">
      <Icon size="1.25rem" weight="fill" className={`mt-0.5 shrink-0 ${tone === "ok" ? "text-ok" : "text-bad"}`} aria-hidden />
      <div className="flex min-w-0 flex-col gap-1">
        <p className={`text-sm font-semibold ${tone === "ok" ? "text-ok" : "text-bad"}`}>{heading}</p>
        <p className="font-semibold leading-snug">{option}</p>
        {reason && <p className="leading-relaxed text-ink-soft">{reason}</p>}
      </div>
    </div>
  );
}
