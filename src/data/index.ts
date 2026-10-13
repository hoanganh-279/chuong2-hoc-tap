import type { Flashcard, Module, Question } from "../types";
import ch2 from "./ch2-word-level.json";
import ch4 from "./ch4-grammar-cohesion.json";
import ch9 from "./ch9-ethics.json";
import sel from "./sel.json";

export const modules = [ch2, ch4, ch9, sel] as Module[];

export function getModule(id: string | undefined): Module | undefined {
  return modules.find((m) => m.id === id);
}

export function quizQuestions(m: Module, sectionId?: string): Question[] {
  return m.questions.filter((q) => q.status === "verified" && (!sectionId || q.section === sectionId));
}

export function unansweredQuestions(m: Module): Question[] {
  return m.questions.filter((q) => q.status === "no_answer");
}

/** Module flashcards plus one card per verified question, so every module can be studied by card. */
export function studyCards(m: Module, sectionId?: string): Flashcard[] {
  const fromQuestions: Flashcard[] = quizQuestions(m).map((q) => ({
    id: `${q.id}-card`,
    number: q.number,
    section: q.section,
    front: q.stem,
    back: q.answer ?? "",
    explanation: q.explanation,
    example: q.example,
    citation: q.citation,
    sourceFile: q.sourceFile,
    note: q.note,
  }));
  const cards = m.id === "sel" ? m.flashcards : [...m.flashcards, ...fromQuestions];
  return sectionId ? cards.filter((c) => c.section === sectionId) : cards;
}

export function sectionTitle(m: Module, sectionId: string): string {
  return m.sections.find((s) => s.id === sectionId)?.title ?? sectionId;
}
