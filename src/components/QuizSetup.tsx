import { useState, type ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import { Lightning, Play, Timer } from "@phosphor-icons/react";
import type { Module } from "../types";
import { quizQuestions } from "../data";
import { btn } from "./ui";

export const SECONDS_PER_QUESTION = 45;

function Choice({
  name, value, checked, onChange, title, body, icon,
}: {
  name: string; value: string; checked: boolean; onChange: (v: string) => void; title: string; body: string; icon: ReactNode;
}) {
  return (
    <label
      className={`flex cursor-pointer items-start gap-3 rounded-[var(--radius-ui)] border p-4 transition-colors ${
        checked ? "border-accent bg-accent-soft" : "border-line bg-surface hover:border-ink-faint"
      }`}
    >
      <input type="radio" name={name} value={value} checked={checked} onChange={() => onChange(value)} className="sr-only" />
      <span className={`mt-0.5 ${checked ? "text-accent" : "text-ink-faint"}`}>{icon}</span>
      <span className="flex flex-col gap-1">
        <span className="font-semibold">{title}</span>
        <span className="text-sm leading-relaxed text-ink-soft">{body}</span>
      </span>
    </label>
  );
}

function Toggle({ id, checked, onChange, label }: { id: string; checked: boolean; onChange: (v: boolean) => void; label: string }) {
  return (
    <label htmlFor={id} className="flex cursor-pointer items-center justify-between gap-4 py-3">
      <span className="text-[0.9375rem]">{label}</span>
      <span className="relative inline-flex">
        <input id={id} type="checkbox" role="switch" checked={checked} onChange={(e) => onChange(e.target.checked)} className="peer sr-only" />
        <span className="h-7 w-12 rounded-full bg-line transition-colors peer-checked:bg-accent peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-accent" />
        <span className="absolute left-1 top-1 size-5 rounded-full bg-surface shadow transition-transform peer-checked:translate-x-5" />
      </span>
    </label>
  );
}

export default function QuizSetup({ m, defaultSection = "" }: { m: Module; defaultSection?: string }) {
  const navigate = useNavigate();
  const sectionsWithQuiz = m.sections.filter((s) => quizQuestions(m, s.id).length > 0);
  const [section, setSection] = useState(defaultSection);
  const [mode, setMode] = useState("practice");
  const [shuffleQ, setShuffleQ] = useState(true);
  const [shuffleO, setShuffleO] = useState(false);
  const [timer, setTimer] = useState(false);

  const count = quizQuestions(m, section || undefined).length;

  const start = () => {
    const params = new URLSearchParams({ start: "1", mode });
    if (section) params.set("section", section);
    if (shuffleQ) params.set("shuffle", "1");
    if (shuffleO) params.set("shuffleOptions", "1");
    if (mode === "exam" && timer) params.set("timer", "1");
    navigate(`/chu-de/${m.id}/lam-bai?${params}`);
  };

  return (
    <form
      className="flex flex-col gap-6"
      onSubmit={(e) => {
        e.preventDefault();
        start();
      }}
    >
      <div className="flex flex-col gap-2">
        <label htmlFor="quiz-section" className="text-sm font-medium text-ink-soft">Phạm vi</label>
        <select
          id="quiz-section"
          value={section}
          onChange={(e) => setSection(e.target.value)}
          className="h-12 rounded-[var(--radius-ui)] border border-line bg-surface px-3 text-[0.9375rem] text-ink focus:border-accent focus:outline-none"
        >
          <option value="">Toàn bộ chủ đề ({quizQuestions(m).length} câu)</option>
          {sectionsWithQuiz.map((s) => (
            <option key={s.id} value={s.id}>
              {s.title} ({quizQuestions(m, s.id).length} câu)
            </option>
          ))}
        </select>
      </div>

      <fieldset className="flex flex-col gap-2">
        <legend className="mb-2 text-sm font-medium text-ink-soft">Chế độ</legend>
        <div className="grid gap-3 sm:grid-cols-2">
          <Choice
            name="mode" value="practice" checked={mode === "practice"} onChange={setMode}
            icon={<Lightning size="1.375rem" weight="bold" />}
            title="Luyện tập"
            body="Biết đúng sai ngay sau mỗi câu, kèm giải thích và trích dẫn."
          />
          <Choice
            name="mode" value="exam" checked={mode === "exam"} onChange={setMode}
            icon={<Timer size="1.375rem" weight="bold" />}
            title="Kiểm tra"
            body="Làm hết rồi mới nộp bài và xem kết quả."
          />
        </div>
      </fieldset>

      <div className="divide-y divide-line rounded-[var(--radius-ui)] border border-line bg-surface px-4">
        <Toggle id="opt-shuffle-q" checked={shuffleQ} onChange={setShuffleQ} label="Trộn thứ tự câu hỏi" />
        <Toggle id="opt-shuffle-o" checked={shuffleO} onChange={setShuffleO} label="Trộn thứ tự đáp án" />
        {mode === "exam" && (
          <Toggle
            id="opt-timer" checked={timer} onChange={setTimer}
            label={`Bấm giờ (${Math.ceil((count * SECONDS_PER_QUESTION) / 60)} phút)`}
          />
        )}
      </div>

      <button type="submit" className={`${btn.primary} self-start`} disabled={count === 0}>
        <Play size="1.125rem" weight="fill" aria-hidden /> Bắt đầu làm bài
      </button>
    </form>
  );
}
