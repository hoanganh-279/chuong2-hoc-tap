import { useEffect, useMemo } from "react";
import { Link } from "react-router-dom";
import { ArrowCounterClockwise, BookOpenText, ClipboardText } from "@phosphor-icons/react";
import { getModule, sectionTitle } from "../data";
import OptionReason from "../components/OptionReason";
import { formatTime, loadResult } from "../lib/quiz";
import { ButtonLink, EmptyState } from "../components/ui";

function verdict(ratio: number) {
  if (ratio >= 0.9) return "Rất tốt. Bạn đã nắm chắc phần này.";
  if (ratio >= 0.7) return "Khá tốt. Ôn lại các câu sai để chắc hơn.";
  if (ratio >= 0.5) return "Đạt một nửa. Nên đọc lại bài học trước khi làm lại.";
  return "Cần ôn thêm. Hãy đọc lại bài học rồi làm lại các câu sai.";
}

export default function Result() {
  const result = useMemo(loadResult, []);
  const m = getModule(result?.moduleId);

  useEffect(() => {
    document.title = "Kết quả | Chương 2";
  }, []);

  if (!result || !m) {
    return (
      <div className="mx-auto max-w-xl px-4 py-20">
        <EmptyState
          icon={<ClipboardText size="2.25rem" />}
          title="Chưa có kết quả"
          body="Kết quả bài làm gần nhất sẽ hiện ở đây. Hãy chọn một chủ đề và làm bài."
          action={<ButtonLink to="/">Chọn chủ đề</ButtonLink>}
        />
      </div>
    );
  }

  const questions = result.questionIds
    .map((id) => m.questions.find((q) => q.id === id))
    .filter((q): q is NonNullable<typeof q> => !!q);
  const wrong = questions.filter((q) => result.choices[q.id] !== q.answer);
  const ratio = result.total ? result.correct / result.total : 0;
  const wrongSections = [...new Set(wrong.map((q) => q.section))];
  const retryParams = new URLSearchParams({ start: "1", mode: "practice", ids: wrong.map((q) => q.id).join(",") });

  return (
    <div className="mx-auto max-w-3xl px-4 pb-20 pt-10 sm:px-6">
      <section className="flex flex-col gap-6 rounded-[var(--radius-ui)] border border-line bg-surface p-6 shadow-soft sm:p-10">
        <div className="flex flex-col gap-2">
          <p className="text-ink-faint">
            {m.title}
            {result.sectionId ? `, ${sectionTitle(m, result.sectionId)}` : ""}
          </p>
          <h1 className="text-5xl font-bold tabular-nums tracking-tight sm:text-6xl">
            {result.correct}<span className="text-ink-faint">/{result.total}</span>
          </h1>
          <p className="text-lg text-ink-soft">{verdict(ratio)}</p>
        </div>
        <dl className="grid grid-cols-3 gap-4 border-t border-line pt-6 text-sm">
          <div>
            <dt className="text-ink-faint">Tỉ lệ đúng</dt>
            <dd className="text-xl font-semibold tabular-nums">{Math.round(ratio * 100)}%</dd>
          </div>
          <div>
            <dt className="text-ink-faint">Thời gian</dt>
            <dd className="text-xl font-semibold tabular-nums">{formatTime(result.durationSec)}</dd>
          </div>
          <div>
            <dt className="text-ink-faint">Chế độ</dt>
            <dd className="text-xl font-semibold">{result.mode === "exam" ? "Kiểm tra" : "Luyện tập"}</dd>
          </div>
        </dl>
        {result.timedOut && (
          <p className="rounded-lg bg-warn-soft px-4 py-3 text-sm text-warn">Hết giờ, bài đã được nộp tự động.</p>
        )}
        <div className="flex flex-wrap gap-3">
          {wrong.length > 0 ? (
            <ButtonLink to={`/chu-de/${m.id}/lam-bai?${retryParams}`}>
              <ArrowCounterClockwise size="1.125rem" weight="bold" aria-hidden /> Làm lại câu sai
            </ButtonLink>
          ) : (
            <ButtonLink to={`/chu-de/${m.id}?tab=lam-bai`}>Làm bài khác</ButtonLink>
          )}
          <ButtonLink to={`/chu-de/${m.id}?tab=bai-hoc${wrongSections[0] ? `&phan=${wrongSections[0]}` : ""}`} variant="secondary">
            <BookOpenText size="1.125rem" aria-hidden /> Xem lại bài học
          </ButtonLink>
        </div>
      </section>

      <section className="mt-10 flex flex-col gap-4">
        <h2 className="text-xl font-semibold">
          {wrong.length ? `Các câu cần xem lại (${wrong.length})` : "Bạn trả lời đúng tất cả các câu"}
        </h2>
        {wrong.map((q) => {
          const picked = result.choices[q.id];
          return (
            <article key={q.id} className="flex flex-col gap-3 rounded-[var(--radius-ui)] border border-line bg-surface p-5">
              <p className="text-sm text-ink-faint">
                Câu {q.number} ·{" "}
                <Link to={`/chu-de/${m.id}?tab=bai-hoc&phan=${q.section}`} className="hover:text-accent hover:underline">
                  {sectionTitle(m, q.section)}
                </Link>
              </p>
              <p className="font-semibold leading-snug">{q.stem}</p>
              <OptionReason
                tone="bad"
                heading={!picked ? "Bạn bỏ trống câu này" : q.optionNotes?.[picked] ? "Bạn chọn, vì sao sai" : "Bạn chọn"}
                option={picked ?? "Chưa chọn đáp án"}
                reason={picked ? q.optionNotes?.[picked] : undefined}
              />
              {q.answer && (
                <OptionReason tone="ok" heading="Đáp án đúng" option={q.answer} reason={q.optionNotes?.[q.answer]} />
              )}
              {q.explanation && (
                <p className="leading-relaxed text-ink-soft"><span className="font-medium text-ink">Giải thích trong tài liệu: </span>{q.explanation}</p>
              )}
              {q.citation && <p className="text-sm text-ink-faint">{q.citation}</p>}
            </article>
          );
        })}
      </section>
    </div>
  );
}
