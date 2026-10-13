import { useEffect, useMemo } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { ArrowRight, Cards, Flag, Question as QuestionIcon, XCircle } from "@phosphor-icons/react";
import { getModule, modules, sectionTitle, studyCards, unansweredQuestions } from "../data";
import { progress, useStore } from "../lib/progress";
import { reportHref } from "../config";
import FlashcardDeck from "../components/FlashcardDeck";
import { Badge, ButtonLink, EmptyState, btn } from "../components/ui";
import { LETTERS } from "../lib/quiz";
import type { Module, Question } from "../types";

const TABS = [
  { id: "the", label: "Thẻ ghi nhớ", icon: Cards },
  { id: "cau-sai", label: "Câu làm sai", icon: XCircle },
  { id: "danh-dau", label: "Câu đánh dấu", icon: Flag },
  { id: "chua-co-dap-an", label: "Chưa có đáp án", icon: QuestionIcon },
] as const;

function ModuleFilter({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  return (
    <div className="flex flex-col gap-2">
      <label htmlFor="review-module" className="text-sm font-medium text-ink-soft">Chủ đề</label>
      <select
        id="review-module"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="h-11 max-w-sm rounded-[var(--radius-ui)] border border-line bg-surface px-3 text-[0.9375rem] text-ink focus:border-accent focus:outline-none"
      >
        <option value="">Tất cả chủ đề</option>
        {modules.map((m) => (
          <option key={m.id} value={m.id}>{m.title}</option>
        ))}
      </select>
    </div>
  );
}

function QuestionList({ items, showAnswer, emptyTitle, emptyBody }: {
  items: { m: Module; q: Question }[]; showAnswer: boolean; emptyTitle: string; emptyBody: string;
}) {
  if (!items.length) {
    return <EmptyState icon={<Cards size="2rem" />} title={emptyTitle} body={emptyBody} action={<ButtonLink to="/">Chọn chủ đề</ButtonLink>} />;
  }
  return (
    <ul className="flex flex-col gap-4">
      {items.map(({ m, q }) => (
        <li key={q.id} className="flex flex-col gap-3 rounded-[var(--radius-ui)] border border-line bg-surface p-5">
          <div className="flex flex-wrap items-center gap-2 text-sm text-ink-faint">
            <span>{m.title}</span>
            <span aria-hidden>·</span>
            <Link to={`/chu-de/${m.id}?tab=bai-hoc&phan=${q.section}`} className="hover:text-accent hover:underline">
              {sectionTitle(m, q.section)}
            </Link>
            <Badge>Câu {q.number}</Badge>
            {!showAnswer && <Badge tone="warn">Chưa có đáp án trong tài liệu</Badge>}
          </div>
          <p className="font-semibold leading-snug">{q.stem}</p>
          <ol className="flex flex-col gap-1.5">
            {q.options.map((o, i) => (
              <li
                key={o}
                className={`flex gap-3 rounded-lg px-3 py-2 text-[0.9375rem] ${showAnswer && o === q.answer ? "bg-ok-soft font-medium text-ok" : "bg-surface-muted"}`}
              >
                <span className="font-semibold">{LETTERS[i]}.</span> <span>{o}</span>
              </li>
            ))}
          </ol>
          {q.example && <p className="text-[0.9375rem] leading-relaxed text-ink-soft"><span className="font-medium text-ink">Ví dụ trong tài liệu: </span>{q.example}</p>}
          {q.note && <p className="rounded-lg bg-warn-soft px-3 py-2 text-sm text-warn">{q.note}</p>}
          <div className="flex flex-wrap gap-x-5 gap-y-2 text-sm">
            {showAnswer && (
              <Link to={`/chu-de/${m.id}/lam-bai?start=1&mode=practice&ids=${q.id}`} className="inline-flex items-center gap-1.5 font-medium text-accent hover:underline">
                Làm lại câu này <ArrowRight size="0.875rem" weight="bold" aria-hidden />
              </Link>
            )}
            <a href={reportHref(`${m.title}, câu ${q.number}`)} className="text-ink-soft hover:text-ink">
              {showAnswer ? "Báo lỗi câu hỏi" : "Gửi đáp án cho câu này"}
            </a>
          </div>
        </li>
      ))}
    </ul>
  );
}

export default function Review() {
  const [params, setParams] = useSearchParams();
  const store = useStore();
  const tab = TABS.find((t) => t.id === params.get("tab"))?.id ?? "the";
  const moduleFilter = params.get("chu-de") ?? "";
  const scoped = useMemo(() => (moduleFilter ? modules.filter((m) => m.id === moduleFilter) : modules), [moduleFilter]);

  useEffect(() => {
    document.title = "Ôn tập | Chương 2";
  }, []);

  const setParam = (key: string, value: string) => {
    const next = new URLSearchParams(params);
    if (value) next.set(key, value);
    else next.delete(key);
    setParams(next, { replace: true });
  };

  const wrong = useMemo(
    () => scoped.flatMap((m) => {
      const answered = store.modules[m.id]?.answered ?? {};
      return m.questions.filter((q) => answered[q.id] === false).map((q) => ({ m, q }));
    }),
    [scoped, store],
  );

  const flagged = useMemo(
    () => scoped.flatMap((m) => {
      const ids = store.modules[m.id]?.flagged ?? [];
      return m.questions.filter((q) => ids.includes(q.id)).map((q) => ({ m, q }));
    }),
    [scoped, store],
  );

  const pending = useMemo(() => scoped.flatMap((m) => unansweredQuestions(m).map((q) => ({ m, q }))), [scoped]);

  const deck = useMemo(() => scoped.flatMap((m) => studyCards(m).map((c) => ({ ...c, section: m.id }))), [scoped]);

  const wrongRetryHref = () => {
    const first = getModule(wrong[0]?.m.id);
    if (!first) return "/";
    const ids = wrong.filter((w) => w.m.id === first.id).map((w) => w.q.id).join(",");
    return `/chu-de/${first.id}/lam-bai?start=1&mode=practice&ids=${ids}`;
  };

  const counts: Record<string, number> = { the: deck.length, "cau-sai": wrong.length, "danh-dau": flagged.length, "chua-co-dap-an": pending.length };

  return (
    <div className="mx-auto max-w-4xl px-4 pb-20 pt-10 sm:px-6">
      <header className="mb-8 flex flex-col gap-3">
        <h1 className="text-3xl font-bold tracking-tight md:text-4xl">Ôn tập</h1>
        <p className="max-w-[60ch] leading-relaxed text-ink-soft">
          Lật thẻ, làm lại câu sai và câu đã đánh dấu. Các câu tài liệu chưa ghi đáp án được liệt kê riêng.
        </p>
      </header>

      <div role="tablist" aria-label="Loại ôn tập" className="-mx-4 mb-6 flex gap-1 overflow-x-auto border-b border-line px-4 sm:mx-0 sm:px-0">
        {TABS.map((t) => {
          const active = t.id === tab;
          const Icon = t.icon;
          return (
            <button
              key={t.id}
              role="tab"
              aria-selected={active}
              onClick={() => setParam("tab", t.id)}
              className={`-mb-px inline-flex h-12 shrink-0 items-center gap-2 border-b-2 px-4 text-[0.9375rem] font-medium transition-colors ${
                active ? "border-accent text-accent" : "border-transparent text-ink-soft hover:text-ink"
              }`}
            >
              <Icon size="1.125rem" weight={active ? "fill" : "regular"} aria-hidden /> {t.label}
              <span className="tabular-nums text-ink-faint">{counts[t.id]}</span>
            </button>
          );
        })}
      </div>

      <div className="mb-6">
        <ModuleFilter value={moduleFilter} onChange={(v) => setParam("chu-de", v)} />
      </div>

      <div role="tabpanel">
        {tab === "the" && (
          <FlashcardDeck
            key={moduleFilter}
            cards={deck}
            groups={scoped.length > 1 ? scoped.map((m) => ({ id: m.id, label: `${m.title} (${deck.filter((c) => c.section === m.id).length})` })) : undefined}
          />
        )}

        {tab === "cau-sai" && (
          <div className="flex flex-col gap-4">
            {wrong.length > 0 && (
              <div className="flex flex-wrap items-center gap-3">
                <ButtonLink to={wrongRetryHref()}>Làm lại câu sai{scoped.length > 1 ? ` (${wrong[0].m.title})` : ""}</ButtonLink>
              </div>
            )}
            <QuestionList items={wrong} showAnswer emptyTitle="Chưa có câu làm sai" emptyBody="Các câu bạn trả lời sai sẽ được lưu ở đây để ôn lại." />
          </div>
        )}

        {tab === "danh-dau" && (
          <QuestionList items={flagged} showAnswer emptyTitle="Chưa có câu đánh dấu" emptyBody="Trong khi làm bài, bấm “Đánh dấu câu khó” để lưu câu vào đây." />
        )}

        {tab === "chua-co-dap-an" && (
          <div className="flex flex-col gap-4">
            <p className="rounded-[var(--radius-ui)] bg-warn-soft px-4 py-3 text-sm leading-relaxed text-warn">
              Tài liệu gốc không ghi đáp án cho các câu dưới đây, nên chúng không được chấm điểm. Nếu bạn có đáp án từ giảng viên, hãy gửi để bổ sung.
            </p>
            <QuestionList items={pending} showAnswer={false} emptyTitle="Không có câu nào" emptyBody="Chủ đề này đã có đáp án cho tất cả các câu." />
          </div>
        )}
      </div>

      <div className="mt-16 border-t border-line pt-6">
        <button
          type="button"
          className={`${btn.ghost} text-sm`}
          onClick={() => {
            if (confirm("Xóa toàn bộ tiến độ, ghi chú và câu đánh dấu trên thiết bị này?")) progress.reset();
          }}
        >
          Xóa tiến độ trên thiết bị này
        </button>
      </div>
    </div>
  );
}
