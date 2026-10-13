import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Link, useNavigate, useParams, useSearchParams } from "react-router-dom";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import {
  ArrowLeft, ArrowRight, BookOpen, CheckCircle, Flag, Timer as TimerIcon, Warning, X, XCircle,
} from "@phosphor-icons/react";
import { getModule, quizQuestions, sectionTitle } from "../data";
import { LETTERS, formatTime, prepare, saveResult, type QuizMode } from "../lib/quiz";
import { progress, useModuleProgress } from "../lib/progress";
import { reportHref } from "../config";
import AnswerOption, { type OptionState } from "../components/AnswerOption";
import OptionReason from "../components/OptionReason";
import Dialog from "../components/Dialog";
import QuizSetup, { SECONDS_PER_QUESTION } from "../components/QuizSetup";
import { ThemeToggle } from "../components/Layout";
import { btn } from "../components/ui";
import NotFound from "./NotFound";
import type { Module, Question } from "../types";

function useCountdown(totalSec: number | null, onEnd: () => void) {
  const [left, setLeft] = useState(totalSec ?? 0);
  const endRef = useRef(onEnd);
  endRef.current = onEnd;

  useEffect(() => {
    if (totalSec === null) return;
    const deadline = Date.now() + totalSec * 1000;
    const id = setInterval(() => {
      const remaining = Math.max(0, Math.round((deadline - Date.now()) / 1000));
      setLeft(remaining);
      if (remaining === 0) {
        clearInterval(id);
        endRef.current();
      }
    }, 1000);
    return () => clearInterval(id);
  }, [totalSec]);

  return left;
}

function Feedback({ q, choice }: { q: Question; choice: string }) {
  const correct = choice === q.answer;
  const letterOf = (opt: string) => LETTERS[q.options.indexOf(opt)];
  const others = q.options.filter((o) => o !== choice && o !== q.answer && q.optionNotes?.[o]);
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
      className={`flex flex-col gap-4 rounded-[var(--radius-ui)] border p-5 ${correct ? "border-ok/40 bg-ok-soft" : "border-bad/40 bg-bad-soft"}`}
      role="status"
    >
      <p className={`inline-flex items-center gap-2 font-semibold ${correct ? "text-ok" : "text-bad"}`}>
        {correct ? <CheckCircle size="1.375rem" weight="fill" aria-hidden /> : <XCircle size="1.375rem" weight="fill" aria-hidden />}
        {correct ? "Chính xác" : "Chưa đúng"}
      </p>
      <OptionReason
        tone={correct ? "ok" : "bad"}
        heading={q.optionNotes?.[choice] ? `Vì sao ${letterOf(choice)} ${correct ? "đúng" : "sai"}` : `Bạn chọn ${letterOf(choice)}`}
        option={choice}
        reason={q.optionNotes?.[choice]}
      />
      {!correct && q.answer && (
        <OptionReason
          tone="ok"
          heading={`Đáp án đúng là ${letterOf(q.answer)}`}
          option={q.answer}
          reason={q.optionNotes?.[q.answer]}
        />
      )}
      {others.length > 0 && (
        <details className="group rounded-lg border border-line/70 bg-surface/60 px-4 py-3">
          <summary className="cursor-pointer text-sm font-medium text-ink-soft">
            Vì sao {others.map(letterOf).join(", ")} sai
          </summary>
          <ul className="mt-3 flex flex-col gap-3">
            {others.map((o) => (
              <li key={o} className="text-sm leading-relaxed">
                <span className="font-semibold">{letterOf(o)}. {o}</span>
                <span className="block text-ink-soft">{q.optionNotes?.[o]}</span>
              </li>
            ))}
          </ul>
        </details>
      )}
      {q.explanation && (
        <p className="leading-relaxed text-ink-soft"><span className="font-medium text-ink">Giải thích trong tài liệu: </span>{q.explanation}</p>
      )}
      {q.example && (
        <p className="leading-relaxed text-ink-soft"><span className="font-medium text-ink">Ví dụ: </span>{q.example}</p>
      )}
      {q.citation && (
        <p className="inline-flex items-start gap-2 text-sm text-ink-faint">
          <BookOpen size="1rem" className="mt-0.5 shrink-0" aria-hidden /> {q.citation}
        </p>
      )}
      {q.note && <p className="rounded-lg bg-warn-soft px-3 py-2 text-sm text-warn">{q.note}</p>}
    </motion.div>
  );
}

function Runner({ m, questions, mode, timed, sectionId }: {
  m: Module; questions: Question[]; mode: QuizMode; timed: boolean; sectionId?: string;
}) {
  const navigate = useNavigate();
  const reduce = useReducedMotion();
  const flagged = useModuleProgress(m.id).flagged;
  const [index, setIndex] = useState(0);
  const [choices, setChoices] = useState<Record<string, string | null>>({});
  const [confirmExit, setConfirmExit] = useState(false);
  const [confirmSubmit, setConfirmSubmit] = useState(false);
  const startedAt = useRef(Date.now());
  const finished = useRef(false);

  const q = questions[index];
  const choice = choices[q.id] ?? null;
  const revealed = mode === "practice" && choice !== null;
  const isLast = index === questions.length - 1;
  const answeredCount = Object.values(choices).filter((c) => c !== null).length;

  const finish = useCallback((timedOut = false) => {
    if (finished.current) return;
    finished.current = true;
    const results: Record<string, boolean> = {};
    let correct = 0;
    for (const item of questions) {
      const ok = choices[item.id] === item.answer;
      if (ok) correct++;
      if (choices[item.id] != null || mode === "exam") results[item.id] = ok;
    }
    progress.recordAnswers(m.id, results);
    progress.recordAttempt(m.id, correct / questions.length);
    saveResult({
      moduleId: m.id,
      sectionId,
      mode,
      questionIds: questions.map((x) => x.id),
      choices,
      correct,
      total: questions.length,
      durationSec: Math.round((Date.now() - startedAt.current) / 1000),
      timedOut,
    });
    navigate("/ket-qua", { replace: true });
  }, [questions, choices, mode, m.id, sectionId, navigate]);

  const left = useCountdown(timed ? questions.length * SECONDS_PER_QUESTION : null, () => finish(true));

  const select = useCallback((opt: string) => {
    if (mode === "practice" && choices[q.id] != null) return;
    setChoices((c) => ({ ...c, [q.id]: opt }));
  }, [mode, choices, q.id]);

  const next = useCallback(() => {
    if (isLast) {
      if (mode === "exam") setConfirmSubmit(true);
      else finish();
      return;
    }
    setIndex((i) => Math.min(i + 1, questions.length - 1));
  }, [isLast, mode, finish, questions.length]);

  const prev = () => setIndex((i) => Math.max(0, i - 1));
  const canAdvance = mode === "exam" || revealed;

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (confirmExit || confirmSubmit || e.metaKey || e.ctrlKey || e.altKey) return;
      const k = e.key.toLowerCase();
      const byNumber = Number(k) - 1;
      const byLetter = LETTERS.map((l) => l.toLowerCase()).indexOf(k);
      const pick = byNumber >= 0 && byNumber < q.options.length ? byNumber : byLetter;
      if (pick >= 0 && pick < q.options.length) {
        e.preventDefault();
        select(q.options[pick]);
      } else if ((k === "enter" || k === "arrowright") && canAdvance) {
        if ((e.target as HTMLElement).tagName === "BUTTON" && k === "enter") return;
        e.preventDefault();
        next();
      } else if (k === "arrowleft" && mode === "exam") {
        prev();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [q, select, next, canAdvance, mode, confirmExit, confirmSubmit]);

  const stateFor = (opt: string): OptionState => {
    if (revealed) {
      if (opt === q.answer) return "correct";
      if (opt === choice) return "wrong";
      return "muted";
    }
    return opt === choice ? "selected" : "idle";
  };

  const isFlagged = flagged.includes(q.id);
  const pct = ((index + (canAdvance && choice ? 1 : 0)) / questions.length) * 100;
  const lowTime = timed && left <= 60;

  return (
    <div className="flex min-h-[100dvh] flex-col">
      <header className="sticky top-0 z-20 border-b border-line bg-bg/90 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-3xl items-center justify-between gap-3 px-4 sm:px-6">
          <button
            type="button"
            onClick={() => setConfirmExit(true)}
            className="grid size-10 place-items-center rounded-[var(--radius-ui)] text-ink-soft hover:bg-surface-muted hover:text-ink"
            aria-label="Thoát bài làm"
          >
            <X size="1.375rem" weight="bold" />
          </button>
          <p className="text-[0.9375rem] font-semibold tabular-nums" aria-live="polite">
            Câu {index + 1} / {questions.length}
          </p>
          <div className="flex items-center gap-1">
            {timed && (
              <span
                className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-sm font-medium tabular-nums ${lowTime ? "bg-warn-soft text-warn" : "text-ink-soft"}`}
                aria-label={`Còn lại ${formatTime(left)}`}
              >
                <TimerIcon size="1rem" weight="bold" aria-hidden /> {formatTime(left)}
              </span>
            )}
            <ThemeToggle />
          </div>
        </div>
        <div className="h-1 bg-surface-muted" role="progressbar" aria-label="Tiến độ bài làm" aria-valuenow={Math.round(pct)} aria-valuemin={0} aria-valuemax={100}>
          <div className="h-full bg-accent transition-[width] duration-300" style={{ width: `${pct}%` }} />
        </div>
      </header>

      <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col px-4 pb-32 pt-8 sm:px-6 sm:pt-12">
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={q.id}
            initial={reduce ? false : { opacity: 0, x: 16 }}
            animate={{ opacity: 1, x: 0 }}
            exit={reduce ? { opacity: 0 } : { opacity: 0, x: -16 }}
            transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className="flex flex-col gap-7"
          >
            <div className="flex flex-col gap-3">
              <p className="text-sm text-ink-faint">
                {sectionTitle(m, q.section)} · Câu {q.number} trong tài liệu
              </p>
              <h1 className="text-2xl font-semibold leading-snug tracking-tight sm:text-[1.75rem]">{q.stem}</h1>
            </div>

            <div className="flex flex-col gap-3" role="group" aria-label="Các phương án trả lời">
              {q.options.map((opt, i) => (
                <AnswerOption
                  key={opt}
                  letter={LETTERS[i]}
                  text={opt}
                  state={stateFor(opt)}
                  disabled={revealed}
                  onSelect={() => select(opt)}
                />
              ))}
            </div>

            {revealed && choice && <Feedback q={q} choice={choice} />}

            <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-sm">
              <button
                type="button"
                onClick={() => progress.toggleFlag(m.id, q.id)}
                aria-pressed={isFlagged}
                className={`inline-flex items-center gap-1.5 ${isFlagged ? "text-warn" : "text-ink-soft hover:text-ink"}`}
              >
                <Flag size="1rem" weight={isFlagged ? "fill" : "regular"} aria-hidden />
                {isFlagged ? "Đã đánh dấu câu khó" : "Đánh dấu câu khó"}
              </button>
              <a href={reportHref(`${m.title}, câu ${q.number}`)} className="inline-flex items-center gap-1.5 text-ink-soft hover:text-ink">
                <Warning size="1rem" aria-hidden /> Báo lỗi câu hỏi
              </a>
            </div>
          </motion.div>
        </AnimatePresence>
      </main>

      <footer className="fixed inset-x-0 bottom-0 z-20 border-t border-line bg-bg/95 pb-[env(safe-area-inset-bottom)] backdrop-blur-md">
        <div className="mx-auto flex h-20 max-w-3xl items-center justify-between gap-3 px-4 sm:px-6">
          {mode === "exam" ? (
            <button type="button" className={btn.secondary} onClick={prev} disabled={index === 0}>
              <ArrowLeft size="1.125rem" weight="bold" aria-hidden /> <span className="hidden sm:inline">Câu trước</span>
            </button>
          ) : (
            <p className="hidden text-sm text-ink-faint sm:block">Phím 1, 2, 3 để chọn · Enter để tiếp</p>
          )}
          {mode === "exam" && (
            <p className="text-sm text-ink-soft tabular-nums">Đã làm {answeredCount}/{questions.length}</p>
          )}
          <button type="button" className={`${btn.primary} ml-auto`} onClick={next} disabled={!canAdvance}>
            {isLast ? (mode === "exam" ? "Nộp bài" : "Xem kết quả") : "Tiếp theo"}
            {!isLast && <ArrowRight size="1.125rem" weight="bold" aria-hidden />}
          </button>
        </div>
      </footer>

      <Dialog
        open={confirmExit}
        title="Thoát bài làm?"
        body="Các câu đã trả lời trong lần này sẽ không được lưu."
        confirmLabel="Thoát"
        cancelLabel="Làm tiếp"
        onCancel={() => setConfirmExit(false)}
        onConfirm={() => navigate(`/chu-de/${m.id}?tab=lam-bai`, { replace: true })}
      />
      <Dialog
        open={confirmSubmit}
        title="Nộp bài?"
        body={
          answeredCount < questions.length
            ? `Bạn còn ${questions.length - answeredCount} câu chưa trả lời. Câu bỏ trống được tính là sai.`
            : "Bạn đã trả lời tất cả các câu."
        }
        confirmLabel="Nộp bài"
        cancelLabel="Kiểm tra lại"
        onCancel={() => setConfirmSubmit(false)}
        onConfirm={() => finish()}
      />
    </div>
  );
}

export default function Quiz() {
  const { moduleId } = useParams();
  const [params] = useSearchParams();
  const m = getModule(moduleId);
  const search = params.toString();

  const config = useMemo(() => {
    if (!m) return null;
    const ids = params.get("ids")?.split(",").filter(Boolean);
    const section = params.get("section") ?? undefined;
    const pool = ids
      ? quizQuestions(m).filter((q) => ids.includes(q.id))
      : quizQuestions(m, section);
    return {
      started: params.get("start") === "1",
      section,
      mode: (params.get("mode") === "exam" ? "exam" : "practice") as QuizMode,
      timed: params.get("timer") === "1" && params.get("mode") === "exam",
      questions: prepare(pool, params.get("shuffle") === "1", params.get("shuffleOptions") === "1"),
    };
  }, [m, search]);

  useEffect(() => {
    if (m) document.title = `Làm bài: ${m.title} | Chương 2`;
  }, [m]);

  if (!m || !config) return <NotFound />;

  if (!config.started || config.questions.length === 0) {
    return (
      <div className="min-h-[100dvh]">
        <header className="border-b border-line">
          <div className="mx-auto flex h-16 max-w-2xl items-center justify-between px-4 sm:px-6">
            <Link to={`/chu-de/${m.id}`} className="inline-flex items-center gap-1.5 text-sm text-ink-soft hover:text-ink">
              <ArrowLeft size="1rem" aria-hidden /> {m.title}
            </Link>
            <ThemeToggle />
          </div>
        </header>
        <main className="mx-auto flex max-w-2xl flex-col gap-6 px-4 py-10 sm:px-6">
          <h1 className="text-3xl font-bold tracking-tight">Thiết lập bài làm</h1>
          {config.started && (
            <p className="rounded-[var(--radius-ui)] bg-warn-soft px-4 py-3 text-sm text-warn">
              Không tìm thấy câu hỏi phù hợp. Hãy chọn lại phạm vi.
            </p>
          )}
          <QuizSetup m={m} defaultSection={config.section ?? ""} />
        </main>
      </div>
    );
  }

  return <Runner key={search} m={m} questions={config.questions} mode={config.mode} timed={config.timed} sectionId={config.section} />;
}
