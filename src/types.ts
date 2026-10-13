export type QuestionStatus = "verified" | "no_answer";

export type Question = {
  id: string;
  number: string;
  section: string;
  stem: string;
  options: string[];
  answer: string | null;
  status: QuestionStatus;
  /** Keyed by option text: why that option is right or wrong. */
  optionNotes?: Record<string, string>;
  explanation?: string;
  example?: string;
  citation?: string;
  sourceFile: string;
  note?: string;
};

export type Flashcard = {
  id: string;
  number?: string;
  section: string;
  front: string;
  back: string;
  explanation?: string;
  example?: string;
  citation?: string;
  sourceFile: string;
  note?: string;
};

export type Concept = {
  title: string;
  body?: string;
  points?: string[];
  example?: string;
  citation?: string;
  unconfirmed?: boolean;
};

export type LessonSection = {
  id: string;
  title: string;
  summary?: string;
  concepts: Concept[];
};

export type Module = {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  sourceFile: string;
  sections: LessonSection[];
  questions: Question[];
  flashcards: Flashcard[];
};
