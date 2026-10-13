import { useEffect } from "react";
import { Link, useSearchParams, useParams } from "react-router-dom";
import { ArrowLeft, BookOpenText, Cards, Exam, Info, Trophy } from "@phosphor-icons/react";
import { getModule, quizQuestions, studyCards, unansweredQuestions } from "../data";
import { progress, useModuleProgress } from "../lib/progress";
import LessonView from "../components/LessonView";
import FlashcardDeck from "../components/FlashcardDeck";
import QuizSetup from "../components/QuizSetup";
import { ButtonLink, EmptyState } from "../components/ui";
import NotFound from "./NotFound";

const TABS = [
  { id: "bai-hoc", label: "Bài học", icon: BookOpenText },
  { id: "the", label: "Thẻ ghi nhớ", icon: Cards },
  { id: "lam-bai", label: "Làm bài", icon: Exam },
] as const;

export default function ModulePage() {
  const { moduleId } = useParams();
  const [params, setParams] = useSearchParams();
  const m = getModule(moduleId);
  const p = useModuleProgress(moduleId ?? "");
  const tab = TABS.find((t) => t.id === params.get("tab"))?.id ?? "bai-hoc";
  const phan = tab === "bai-hoc" ? params.get("phan") : null;

  useEffect(() => {
    if (!m) return;
    const lesson = phan ? m.sections.find((s) => s.id === phan) : undefined;
    if (lesson) {
      progress.setLast(m.id, `/chu-de/${m.id}?tab=bai-hoc&phan=${encodeURIComponent(lesson.id)}`, `${m.title}, ${lesson.title}`);
    } else {
      progress.setLast(m.id, `/chu-de/${m.id}?tab=${tab}`, `${m.title}, ${TABS.find((t) => t.id === tab)?.label}`);
    }
  }, [m, tab, phan]);

  useEffect(() => {
    if (m) document.title = `${m.title} | Chương 2`;
  }, [m]);

  if (!m) return <NotFound />;

  const quiz = quizQuestions(m);
  const cards = studyCards(m);
  const pending = unansweredQuestions(m).length;

  return (
    <div className="mx-auto max-w-page px-4 pb-20 pt-8 sm:px-6 lg:px-10">
      <Link to="/" className="mb-6 inline-flex items-center gap-1.5 text-sm text-ink-soft hover:text-ink">
        <ArrowLeft size="1rem" aria-hidden /> Tất cả chủ đề
      </Link>
      <header className="mb-8 flex flex-col gap-3">
        <p className="text-ink-faint">{m.subtitle}</p>
        <h1 className="text-3xl font-bold tracking-tight md:text-4xl">{m.title}</h1>
        <p className="max-w-[65ch] leading-relaxed text-ink-soft">{m.description}</p>
        {p.bestScore !== undefined && (
          <p className="inline-flex items-center gap-2 text-sm text-ink-soft">
            <Trophy size="1.125rem" className="text-accent" aria-hidden /> Điểm cao nhất: {Math.round(p.bestScore * 100)}% sau {p.attempts} lần làm bài
          </p>
        )}
      </header>

      <div role="tablist" aria-label="Chế độ học" className="sticky top-16 z-20 -mx-4 mb-8 flex gap-1 overflow-x-auto border-b border-line bg-bg/90 px-4 backdrop-blur-md sm:mx-0 sm:px-0">
        {TABS.map((t) => {
          const active = t.id === tab;
          const Icon = t.icon;
          return (
            <button
              key={t.id}
              role="tab"
              aria-selected={active}
              aria-controls={`panel-${t.id}`}
              onClick={() => setParams({ tab: t.id }, { replace: true })}
              className={`-mb-px inline-flex h-12 shrink-0 items-center gap-2 border-b-2 px-4 text-[0.9375rem] font-medium transition-colors ${
                active ? "border-accent text-accent" : "border-transparent text-ink-soft hover:text-ink"
              }`}
            >
              <Icon size="1.125rem" weight={active ? "fill" : "regular"} aria-hidden /> {t.label}
            </button>
          );
        })}
      </div>

      <div id={`panel-${tab}`} role="tabpanel">
        {tab === "bai-hoc" && <LessonView m={m} />}

        {tab === "the" && (
          <FlashcardDeck
            cards={cards}
            groups={m.sections
              .map((s) => ({ id: s.id, label: `${s.title} (${cards.filter((c) => c.section === s.id).length})` }))
              .filter((g) => cards.some((c) => c.section === g.id))}
          />
        )}

        {tab === "lam-bai" && (
          <div className="mx-auto flex max-w-2xl flex-col gap-6">
            {quiz.length > 0 ? (
              <QuizSetup m={m} />
            ) : (
              <EmptyState
                icon={<Info size="2rem" />}
                title="Chủ đề này học bằng thẻ ghi nhớ"
                body="Tài liệu gốc không có bộ câu hỏi trắc nghiệm đủ các phương án A, B, C cho chủ đề này, nên không tạo bài làm."
                action={<ButtonLink to={`/chu-de/${m.id}?tab=the`}>Mở thẻ ghi nhớ</ButtonLink>}
              />
            )}
            {pending > 0 && (
              <p className="flex items-start gap-2 rounded-[var(--radius-ui)] bg-warn-soft px-4 py-3 text-sm leading-relaxed text-warn">
                <Info size="1.125rem" className="mt-0.5 shrink-0" aria-hidden />
                <span>
                  {pending} câu trong tài liệu chưa có đáp án nên không được đưa vào bài làm.{" "}
                  <Link to={`/on-tap?tab=chua-co-dap-an&chu-de=${m.id}`} className="font-medium underline">Xem các câu này</Link>
                </span>
              </p>
            )}
            {p.flagged.length > 0 && (
              <p className="text-sm text-ink-soft">
                Bạn đã đánh dấu {p.flagged.length} câu khó trong chủ đề này.{" "}
                <Link to="/on-tap?tab=danh-dau" className="font-medium text-accent hover:underline">Ôn lại</Link>
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
