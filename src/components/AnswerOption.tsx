import { CheckCircle, XCircle } from "@phosphor-icons/react";

export type OptionState = "idle" | "selected" | "correct" | "wrong" | "muted";

const styles: Record<OptionState, string> = {
  idle: "border-line bg-surface hover:border-accent hover:bg-accent-soft/50",
  selected: "border-accent bg-accent-soft ring-1 ring-accent",
  correct: "border-ok bg-ok-soft ring-1 ring-ok",
  wrong: "border-bad bg-bad-soft ring-1 ring-bad",
  muted: "border-line bg-surface opacity-60",
};

const letterStyles: Record<OptionState, string> = {
  idle: "border-line text-ink-soft group-hover:border-accent group-hover:text-accent",
  selected: "border-accent bg-accent text-accent-ink",
  correct: "border-ok bg-ok text-surface",
  wrong: "border-bad bg-bad text-surface",
  muted: "border-line text-ink-faint",
};

export default function AnswerOption({
  letter, text, state, disabled, onSelect,
}: {
  letter: string; text: string; state: OptionState; disabled?: boolean; onSelect: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      disabled={disabled}
      aria-pressed={state === "selected"}
      className={`group flex min-h-14 w-full items-center gap-4 rounded-[var(--radius-ui)] border px-4 py-3.5 text-left text-base leading-snug transition-[background-color,border-color,transform] duration-150 active:scale-[0.99] disabled:cursor-default disabled:active:scale-100 sm:px-5 sm:text-[1.0625rem] ${styles[state]}`}
    >
      <span className={`grid size-8 shrink-0 place-items-center rounded-lg border text-sm font-semibold transition-colors ${letterStyles[state]}`}>
        {letter}
      </span>
      <span className="flex-1">{text}</span>
      {state === "correct" && <CheckCircle size="1.5rem" weight="fill" className="shrink-0 text-ok" aria-label="Đáp án đúng" />}
      {state === "wrong" && <XCircle size="1.5rem" weight="fill" className="shrink-0 text-bad" aria-label="Lựa chọn sai" />}
    </button>
  );
}
