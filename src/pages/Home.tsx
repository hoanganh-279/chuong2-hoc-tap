import { Link } from "react-router-dom";
import { ArrowRight, BookOpenText, Cards, Exam, FilePdf } from "@phosphor-icons/react";
import { modules, quizQuestions, studyCards, unansweredQuestions } from "../data";
import { useStore } from "../lib/progress";
import { ButtonLink, Meter } from "../components/ui";
import type { Module } from "../types";

const layout = [
  "lg:col-span-7",
  "lg:col-span-5",
  "lg:col-span-5",
  "lg:col-span-7",
];

function ModuleTile({ m, className }: { m: Module; className: string }) {
  const store = useStore();
  const p = store.modules[m.id];
  const quiz = quizQuestions(m);
  const cards = studyCards(m);
  const correct = quiz.filter((q) => p?.answered[q.id]).length;
  const read = p?.readSections.length ?? 0;
  const value = quiz.length
    ? (correct / quiz.length + read / m.sections.length) / 2
    : read / m.sections.length;

  return (
    <Link
      to={`/chu-de/${m.id}`}
      className={`group flex flex-col justify-between gap-6 rounded-[var(--radius-ui)] border border-line bg-surface p-6 shadow-soft transition-[border-color,transform] duration-200 hover:-translate-y-0.5 hover:border-accent sm:p-7 ${className}`}
    >
      <div className="flex flex-col gap-2">
        <p className="text-sm text-ink-faint">{m.subtitle}</p>
        <h3 className="text-xl font-semibold tracking-tight sm:text-2xl">{m.title}</h3>
        <p className="max-w-[56ch] leading-relaxed text-ink-soft">{m.description}</p>
      </div>
      <div className="flex flex-col gap-4">
        <ul className="flex flex-wrap gap-x-5 gap-y-2 text-sm text-ink-soft">
          <li className="inline-flex items-center gap-1.5">
            <BookOpenText size="1.125rem" aria-hidden /> {m.sections.length} phần
          </li>
          <li className="inline-flex items-center gap-1.5">
            <Exam size="1.125rem" aria-hidden /> {quiz.length ? `${quiz.length} câu trắc nghiệm` : "Học bằng thẻ"}
          </li>
          <li className="inline-flex items-center gap-1.5">
            <Cards size="1.125rem" aria-hidden /> {cards.length} thẻ
          </li>
        </ul>
        <Meter value={value} label={`Tiến độ ${m.title}`} />
      </div>
    </Link>
  );
}

export default function Home() {
  const { last } = useStore();
  const pending = modules.reduce((n, m) => n + unansweredQuestions(m).length, 0);

  return (
    <>
      <section className="mx-auto grid max-w-page items-center gap-10 px-4 pb-16 pt-10 sm:px-6 lg:px-10 md:grid-cols-[1.05fr_1fr] md:pt-16 lg:pt-20">
        <div className="flex flex-col items-start gap-6">
          <h1 className="text-4xl font-bold leading-[1.1] tracking-tight md:text-5xl">
            Học thẳng từ giáo trình, luyện đến khi nhớ.
          </h1>
          <p className="max-w-[44ch] text-lg leading-relaxed text-ink-soft">
            Đọc bài, lật thẻ ghi nhớ và làm trắc nghiệm từng câu một, với đáp án và trích dẫn trang sách.
          </p>
          <div className="flex flex-wrap gap-3">
            <ButtonLink to={last?.path ?? `/chu-de/${modules[0].id}`}>
              {last ? "Tiếp tục học" : "Bắt đầu học"} <ArrowRight size="1.125rem" weight="bold" aria-hidden />
            </ButtonLink>
            <ButtonLink to="/on-tap" variant="secondary">Ôn tập</ButtonLink>
          </div>
          {last && <p className="text-sm text-ink-faint">Lần trước: {last.label}</p>}
        </div>
        <div className="relative">
          <img
            src="/hero-study.webp"
            srcSet="/hero-study-640.webp 640w, /hero-study.webp 1024w"
            sizes="(min-width: 768px) 45vw, 100vw"
            alt="Bàn học với từ điển song ngữ, sổ ghi chép và tách trà"
            width={1024}
            height={768}
            fetchPriority="high"
            className="aspect-[4/3] w-full rounded-[var(--radius-ui)] object-cover shadow-soft"
          />
        </div>
      </section>

      <section id="chu-de" className="mx-auto max-w-page px-4 pb-20 sm:px-6 lg:px-10">
        <h2 className="mb-6 text-2xl font-semibold tracking-tight md:text-3xl">Chọn chủ đề</h2>
        <div className="grid grid-cols-1 gap-5 lg:grid-cols-12">
          {modules.map((m, i) => (
            <ModuleTile key={m.id} m={m} className={layout[i] ?? "lg:col-span-6"} />
          ))}
        </div>
      </section>

      <section className="border-t border-line bg-surface">
        <div className="mx-auto grid max-w-page gap-8 px-4 py-16 sm:px-6 lg:px-10 md:grid-cols-[1fr_1.4fr] md:items-start">
          <div className="flex flex-col gap-3">
            <h2 className="text-2xl font-semibold tracking-tight">Nội dung lấy từ đâu</h2>
            <p className="max-w-[48ch] leading-relaxed text-ink-soft">
              Mọi câu hỏi, đáp án và giải thích đều trích từ bốn tài liệu gốc. Câu nào tài liệu chưa ghi đáp án sẽ không được chấm điểm.
            </p>
            <Link to="/on-tap?tab=chua-co-dap-an" className="inline-flex items-center gap-1.5 font-medium text-accent hover:underline">
              Xem {pending} câu chưa có đáp án <ArrowRight size="1rem" weight="bold" aria-hidden />
            </Link>
          </div>
          <ul className="grid gap-3 sm:grid-cols-2">
            {modules.map((m) => (
              <li key={m.id} className="flex items-start gap-3 rounded-[var(--radius-ui)] bg-surface-muted p-4">
                <FilePdf size="1.375rem" className="mt-0.5 shrink-0 text-accent" aria-hidden />
                <div className="min-w-0">
                  <p className="truncate font-medium">{m.sourceFile}</p>
                  <p className="text-sm text-ink-soft">{m.subtitle}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </section>
    </>
  );
}
