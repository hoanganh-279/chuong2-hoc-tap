import { useEffect, useRef, useState } from "react";
import { Link, useLocation, useSearchParams } from "react-router-dom";
import { ArrowLeft, ArrowRight, BookOpen, CheckCircle, Circle, Exam, Info, ListBullets, NotePencil } from "@phosphor-icons/react";
import type { Concept, LessonSection, Module } from "../types";
import { quizQuestions } from "../data";
import { progress, useModuleProgress } from "../lib/progress";
import { Badge, btn } from "./ui";

function ConceptBlock({ c }: { c: Concept }) {
  return (
    <div className="flex flex-col gap-3 border-t border-line pt-5 first:border-t-0 first:pt-0">
      <div className="flex flex-wrap items-center gap-2">
        <h4 className="text-lg font-semibold">{c.title}</h4>
        {c.unconfirmed && (
          <Badge tone="warn">
            <Info size="0.875rem" weight="bold" aria-hidden /> Tài liệu chưa ghi đáp án
          </Badge>
        )}
      </div>
      {c.body && <p className="max-w-[68ch] leading-relaxed text-ink-soft">{c.body}</p>}
      {c.points && (
        <ul className="grid gap-2 sm:grid-cols-2">
          {c.points.map((p) => (
            <li key={p} className="rounded-lg bg-surface-muted px-3.5 py-2.5 text-[0.9375rem] leading-relaxed">
              {p}
            </li>
          ))}
        </ul>
      )}
      {c.example && (
        <p className="max-w-[68ch] rounded-lg border-l-2 border-accent bg-accent-soft/60 px-4 py-3 leading-relaxed">
          <span className="font-medium">Ví dụ: </span>
          {c.example}
        </p>
      )}
      {c.citation && (
        <p className="inline-flex items-start gap-2 text-sm text-ink-faint">
          <BookOpen size="1rem" className="mt-0.5 shrink-0" aria-hidden />
          <span>{c.citation}</span>
        </p>
      )}
    </div>
  );
}

function Notes({ moduleId, sectionId }: { moduleId: string; sectionId: string }) {
  const saved = useModuleProgress(moduleId).notes[sectionId] ?? "";
  const [text, setText] = useState(saved);
  const [status, setStatus] = useState<"idle" | "saved">("idle");

  useEffect(() => setText(saved), [saved]);

  useEffect(() => {
    if (text === saved) return;
    const t = setTimeout(() => {
      progress.saveNote(moduleId, sectionId, text);
      setStatus("saved");
    }, 600);
    return () => clearTimeout(t);
  }, [text, saved, moduleId, sectionId]);

  const id = `note-${sectionId}`;
  return (
    <details className="group rounded-[var(--radius-ui)] border border-line" open={!!saved}>
      <summary className="flex cursor-pointer list-none items-center gap-2 px-4 py-3 text-sm font-medium text-ink-soft hover:text-ink">
        <NotePencil size="1.125rem" aria-hidden /> Ghi chú của bạn
        {saved && <span className="text-ink-faint">(đã có ghi chú)</span>}
      </summary>
      <div className="flex flex-col gap-2 px-4 pb-4">
        <label htmlFor={id} className="text-sm text-ink-soft">
          Ghi chú chỉ lưu trên thiết bị này.
        </label>
        <textarea
          id={id}
          rows={3}
          value={text}
          onChange={(e) => {
            setText(e.target.value);
            setStatus("idle");
          }}
          className="w-full resize-y rounded-lg border border-line bg-bg px-3 py-2 text-[0.9375rem] text-ink placeholder:text-ink-faint focus:border-accent focus:outline-none"
        />
        <p className="text-xs text-ink-faint" aria-live="polite">
          {status === "saved" ? "Đã lưu" : " "}
        </p>
      </div>
    </details>
  );
}

const lessonHref = (sectionId: string) => `?tab=bai-hoc&phan=${encodeURIComponent(sectionId)}`;
const pagerLink =
  "flex min-h-14 items-center gap-3 rounded-[var(--radius-ui)] border border-line bg-surface px-4 py-3 text-[0.9375rem] font-semibold text-ink transition-colors hover:border-accent hover:text-accent";

function SectionBlock({ m, s, index, prev, next }: {
  m: Module; s: LessonSection; index: number; prev?: LessonSection; next?: LessonSection;
}) {
  const p = useModuleProgress(m.id);
  const read = p.readSections.includes(s.id);
  const count = quizQuestions(m, s.id).length;

  return (
    <section id={s.id} className="rounded-[var(--radius-ui)] border border-line bg-surface p-5 sm:p-8">
      <header className="mb-6 flex flex-col gap-2">
        <p className="text-sm text-ink-faint">Phần {index + 1}</p>
        <h3 className="text-2xl font-semibold tracking-tight">{s.title}</h3>
        {s.summary && <p className="max-w-[68ch] leading-relaxed text-ink-soft">{s.summary}</p>}
      </header>
      <div className="flex flex-col gap-5">
        {s.concepts.map((c) => (
          <ConceptBlock key={c.title} c={c} />
        ))}
      </div>
      <div className="mt-8 flex flex-col gap-4">
        <Notes moduleId={m.id} sectionId={s.id} />
        <div className="flex flex-wrap gap-3">
          {count > 0 && (
            <Link to={`/chu-de/${m.id}/lam-bai?section=${s.id}`} className={btn.primary}>
              <Exam size="1.125rem" weight="bold" aria-hidden /> Làm bài phần này ({count})
            </Link>
          )}
          <button
            type="button"
            onClick={() => progress.markRead(m.id, s.id)}
            disabled={read}
            className={btn.secondary}
            aria-pressed={read}
          >
            {read ? <CheckCircle size="1.125rem" weight="fill" className="text-ok" aria-hidden /> : <Circle size="1.125rem" aria-hidden />}
            {read ? "Đã đọc" : "Đánh dấu đã đọc"}
          </button>
        </div>
      </div>
      <nav aria-label="Chuyển bài" className="mt-8 flex flex-col gap-3 border-t border-line pt-6">
        <div className="grid gap-3 sm:grid-cols-2">
          {prev ? (
            <Link to={lessonHref(prev.id)} className={`${pagerLink} justify-start text-left`}>
              <ArrowLeft size="1.125rem" className="shrink-0" aria-hidden />
              <span className="flex min-w-0 flex-col">
                <span className="text-xs font-normal text-ink-faint">Bài trước</span>
                <span className="truncate">{prev.title}</span>
              </span>
            </Link>
          ) : <span className="hidden sm:block" />}
          {next && (
            <Link to={lessonHref(next.id)} className={`${pagerLink} justify-end text-right`}>
              <span className="flex min-w-0 flex-col">
                <span className="text-xs font-normal text-ink-faint">Bài sau</span>
                <span className="truncate">{next.title}</span>
              </span>
              <ArrowRight size="1.125rem" className="shrink-0" aria-hidden />
            </Link>
          )}
        </div>
        <p className="text-center text-sm tabular-nums text-ink-faint">Phần {index + 1} / {m.sections.length}</p>
      </nav>
    </section>
  );
}

export default function LessonView({ m }: { m: Module }) {
  const p = useModuleProgress(m.id);
  const [params, setParams] = useSearchParams();
  const { hash } = useLocation();
  const wrapRef = useRef<HTMLDivElement>(null);
  const tocRef = useRef<HTMLDetailsElement>(null);
  const shownRef = useRef<string | undefined>(undefined);

  const requested = params.get("phan") ?? (hash ? decodeURIComponent(hash.slice(1)) : null);
  const fromUrl = m.sections.findIndex((s) => s.id === requested);
  const fallback = Math.max(0, m.sections.findIndex((s) => !p.readSections.includes(s.id)));
  const index = fromUrl >= 0 ? fromUrl : fallback;
  const current = m.sections[index];

  useEffect(() => {
    if (current && params.get("phan") !== current.id) {
      setParams({ tab: "bai-hoc", phan: current.id }, { replace: true });
    }
  }, [current, params, setParams]);

  useEffect(() => {
    if (!current) return;
    if (shownRef.current && shownRef.current !== current.id) {
      wrapRef.current?.scrollIntoView({ block: "start" });
    }
    shownRef.current = current.id;
    if (tocRef.current) tocRef.current.open = false;
  }, [current]);

  if (!current) return null;

  const toc = (
    <ol className="flex flex-col gap-1">
      {m.sections.map((s, i) => {
        const read = p.readSections.includes(s.id);
        const active = s.id === current.id;
        return (
          <li key={s.id}>
            <Link
              to={lessonHref(s.id)}
              aria-current={active ? "page" : undefined}
              className={`flex items-start gap-2.5 rounded-lg px-3 py-2 text-sm transition-colors ${
                active ? "bg-accent-soft text-accent" : "text-ink-soft hover:bg-surface-muted hover:text-ink"
              }`}
            >
              {read ? (
                <CheckCircle size="1.125rem" weight="fill" className="mt-px shrink-0 text-ok" aria-label="Đã đọc" />
              ) : (
                <span className="mt-px w-[1.125rem] shrink-0 text-center tabular-nums">{i + 1}</span>
              )}
              <span>{s.title}</span>
            </Link>
          </li>
        );
      })}
    </ol>
  );

  return (
    <div ref={wrapRef} className="grid scroll-mt-32 gap-8 lg:grid-cols-[16rem_1fr]">
      <aside className="lg:sticky lg:top-32 lg:self-start">
        <details ref={tocRef} className="rounded-[var(--radius-ui)] border border-line bg-surface lg:hidden">
          <summary className="flex cursor-pointer list-none items-center gap-2 px-4 py-3 font-medium">
            <ListBullets size="1.125rem" aria-hidden /> Mục lục ({p.readSections.length}/{m.sections.length} đã đọc)
          </summary>
          <div className="px-2 pb-3">{toc}</div>
        </details>
        <div className="hidden lg:block">
          <p className="mb-3 px-3 text-sm font-medium text-ink-faint">
            Mục lục · {p.readSections.length}/{m.sections.length} đã đọc
          </p>
          {toc}
        </div>
      </aside>
      <div className="min-w-0">
        <SectionBlock
          key={current.id}
          m={m}
          s={current}
          index={index}
          prev={m.sections[index - 1]}
          next={m.sections[index + 1]}
        />
      </div>
    </div>
  );
}
