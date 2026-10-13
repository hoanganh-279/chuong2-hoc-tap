import type { Question } from "../types";

export type QuizMode = "practice" | "exam";

export type QuizResult = {
  moduleId: string;
  sectionId?: string;
  mode: QuizMode;
  questionIds: string[];
  choices: Record<string, string | null>;
  correct: number;
  total: number;
  durationSec: number;
  timedOut: boolean;
};

const RESULT_KEY = "c2-last-result";

export function shuffle<T>(list: T[]): T[] {
  const a = [...list];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export function prepare(questions: Question[], shuffleQuestions: boolean, shuffleOptions: boolean): Question[] {
  const ordered = shuffleQuestions ? shuffle(questions) : questions;
  return ordered.map((q) => (shuffleOptions ? { ...q, options: shuffle(q.options) } : q));
}

export function saveResult(r: QuizResult) {
  try {
    sessionStorage.setItem(RESULT_KEY, JSON.stringify(r));
  } catch {
    // ignore
  }
}

export function loadResult(): QuizResult | null {
  try {
    const raw = sessionStorage.getItem(RESULT_KEY);
    return raw ? (JSON.parse(raw) as QuizResult) : null;
  } catch {
    return null;
  }
}

export const LETTERS = ["A", "B", "C", "D", "E"];

export function formatTime(totalSec: number): string {
  const m = Math.floor(totalSec / 60);
  const s = totalSec % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}
