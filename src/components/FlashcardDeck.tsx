import { useEffect, useMemo, useState } from "react";
import { motion, useReducedMotion } from "motion/react";
import { ArrowLeft, ArrowRight, ArrowsClockwise, BookOpen, Shuffle } from "@phosphor-icons/react";
import type { Flashcard } from "../types";
import { shuffle } from "../lib/quiz";
import { EmptyState, btn } from "./ui";

export default function FlashcardDeck({ cards, groups }: { cards: Flashcard[]; groups?: { id: string; label: string }[] }) {
  const [group, setGroup] = useState<string>("all");
  const [order, setOrder] = useState<Flashcard[]>(cards);
  const [index, setIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const reduce = useReducedMotion();

  const signature = cards.map((c) => c.id).join("|");
  const filtered = useMemo(() => (group === "all" ? cards : cards.filter((c) => c.section === group)), [signature, group]);

  useEffect(() => {
    setOrder(filtered);
    setIndex(0);
    setFlipped(false);
  }, [filtered]);

  const card = order[index];

  const go = (delta: number) => {
    setFlipped(false);
    setIndex((i) => (i + delta + order.length) % order.length);
  };

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      if (target.closest("input, textarea, select")) return;
      if (e.key === "ArrowRight") go(1);
      else if (e.key === "ArrowLeft") go(-1);
      else if (e.key === " " || e.key === "Enter") {
        if (target.tagName === "BUTTON" && !target.dataset.card) return;
        e.preventDefault();
        setFlipped((f) => !f);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  });

  if (!card) {
    return (
      <EmptyState
        icon={<BookOpen size="2rem" />}
        title="Chưa có thẻ ở phần này"
        body="Chọn một phần khác hoặc xem tất cả các thẻ."
        action={<button className={btn.secondary} onClick={() => setGroup("all")}>Xem tất cả</button>}
      />
    );
  }

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-5">
      <div className="flex flex-wrap items-end justify-between gap-3">
        {groups && groups.length > 1 && (
          <div className="flex flex-col gap-2">
            <label htmlFor="deck-group" className="text-sm font-medium text-ink-soft">Phần</label>
            <select
              id="deck-group"
              value={group}
              onChange={(e) => setGroup(e.target.value)}
              className="h-11 rounded-[var(--radius-ui)] border border-line bg-surface px-3 text-[0.9375rem] text-ink focus:border-accent focus:outline-none"
            >
              <option value="all">Tất cả ({cards.length} thẻ)</option>
              {groups.map((g) => (
                <option key={g.id} value={g.id}>{g.label}</option>
              ))}
            </select>
          </div>
        )}
        <button
          type="button"
          className={btn.ghost}
          onClick={() => {
            setOrder(shuffle(filtered));
            setIndex(0);
            setFlipped(false);
          }}
        >
          <Shuffle size="1.125rem" aria-hidden /> Trộn thẻ
        </button>
      </div>

      <div className="[perspective:1600px]">
        <motion.button
          type="button"
          data-card="1"
          onClick={() => setFlipped((f) => !f)}
          aria-label={flipped ? "Lật về mặt câu hỏi" : "Lật để xem đáp án"}
          animate={{ rotateY: flipped ? 180 : 0 }}
          transition={reduce ? { duration: 0 } : { type: "spring", stiffness: 140, damping: 20 }}
          className="relative grid min-h-[18.75rem] w-full text-left [transform-style:preserve-3d] sm:min-h-[21.25rem]"
        >
          <div className="col-start-1 row-start-1 flex flex-col justify-between gap-6 rounded-[var(--radius-ui)] border border-line bg-surface p-6 shadow-soft [backface-visibility:hidden] sm:p-8">
            <p className="text-sm text-ink-faint">
              Thẻ {index + 1} / {order.length}
              {card.number ? ` · Câu ${card.number}` : ""}
            </p>
            <p className="text-xl font-semibold leading-snug sm:text-2xl">{card.front}</p>
            <p className="inline-flex items-center gap-2 text-sm text-ink-soft">
              <ArrowsClockwise size="1rem" aria-hidden /> Chạm hoặc nhấn Space để lật
            </p>
          </div>
          <div className="col-start-1 row-start-1 flex flex-col gap-4 overflow-y-auto rounded-[var(--radius-ui)] border border-accent bg-surface p-6 shadow-soft [backface-visibility:hidden] [transform:rotateY(180deg)] sm:p-8">
            <p className="text-sm text-ink-faint">Đáp án</p>
            <p className="text-xl font-semibold leading-snug text-accent sm:text-2xl">{card.back}</p>
            {card.explanation && <p className="leading-relaxed text-ink-soft">{card.explanation}</p>}
            {card.example && (
              <p className="text-[0.9375rem] leading-relaxed"><span className="font-medium">Ví dụ: </span>{card.example}</p>
            )}
            {card.citation && (
              <p className="inline-flex items-start gap-2 text-sm text-ink-faint">
                <BookOpen size="1rem" className="mt-0.5 shrink-0" aria-hidden /> {card.citation}
              </p>
            )}
            {card.note && <p className="rounded-lg bg-warn-soft px-3 py-2 text-sm text-warn">{card.note}</p>}
          </div>
        </motion.button>
      </div>

      <div className="flex items-center justify-between gap-3">
        <button type="button" className={btn.secondary} onClick={() => go(-1)} aria-label="Thẻ trước">
          <ArrowLeft size="1.125rem" weight="bold" aria-hidden /> <span className="hidden sm:inline">Trước</span>
        </button>
        <p className="text-sm tabular-nums text-ink-soft">{index + 1} / {order.length}</p>
        <button type="button" className={btn.primary} onClick={() => go(1)} aria-label="Thẻ tiếp theo">
          <span className="hidden sm:inline">Tiếp theo</span> <ArrowRight size="1.125rem" weight="bold" aria-hidden />
        </button>
      </div>
    </div>
  );
}
