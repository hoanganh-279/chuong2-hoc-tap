import { useEffect, useId, useRef, type ReactNode } from "react";
import { btn } from "./ui";

export default function Dialog({
  open, title, body, confirmLabel, cancelLabel = "Quay lại", onConfirm, onCancel,
}: {
  open: boolean; title: string; body: ReactNode; confirmLabel: string; cancelLabel?: string;
  onConfirm: () => void; onCancel: () => void;
}) {
  const ref = useRef<HTMLDialogElement>(null);
  const titleId = useId();

  useEffect(() => {
    const d = ref.current;
    if (!d) return;
    if (open && !d.open) d.showModal();
    if (!open && d.open) d.close();
  }, [open]);

  return (
    <dialog
      ref={ref}
      onCancel={(e) => {
        e.preventDefault();
        onCancel();
      }}
      aria-labelledby={titleId}
      className="m-auto w-[min(92vw,440px)] rounded-[var(--radius-ui)] border border-line bg-surface p-0 text-ink shadow-soft backdrop:bg-black/40"
    >
      <div className="flex flex-col gap-4 p-6">
        <h2 id={titleId} className="text-lg font-semibold">{title}</h2>
        <div className="leading-relaxed text-ink-soft">{body}</div>
        <div className="mt-2 flex flex-wrap justify-end gap-3">
          <button type="button" className={btn.secondary} onClick={onCancel} autoFocus>{cancelLabel}</button>
          <button type="button" className={btn.primary} onClick={onConfirm}>{confirmLabel}</button>
        </div>
      </div>
    </dialog>
  );
}
