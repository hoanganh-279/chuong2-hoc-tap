import { useSyncExternalStore } from "react";

export type ModuleProgress = {
  answered: Record<string, boolean>;
  readSections: string[];
  flagged: string[];
  notes: Record<string, string>;
  bestScore?: number;
  attempts: number;
};

type Store = {
  modules: Record<string, ModuleProgress>;
  last?: { moduleId: string; path: string; label: string };
};

const KEY = "c2-progress-v1";
const listeners = new Set<() => void>();
let cache: Store | null = null;

function emptyModule(): ModuleProgress {
  return { answered: {}, readSections: [], flagged: [], notes: {}, attempts: 0 };
}

function read(): Store {
  if (cache) return cache;
  try {
    const raw = localStorage.getItem(KEY);
    cache = raw ? (JSON.parse(raw) as Store) : { modules: {} };
  } catch {
    cache = { modules: {} };
  }
  return cache;
}

function write(next: Store) {
  cache = next;
  try {
    localStorage.setItem(KEY, JSON.stringify(next));
  } catch {
    // Private mode or full storage: progress stays in memory for this session.
  }
  listeners.forEach((l) => l());
}

function update(moduleId: string, fn: (p: ModuleProgress) => ModuleProgress) {
  const s = read();
  const current = s.modules[moduleId] ?? emptyModule();
  write({ ...s, modules: { ...s.modules, [moduleId]: fn(current) } });
}

function subscribe(l: () => void) {
  listeners.add(l);
  const onStorage = (e: StorageEvent) => {
    if (e.key === KEY) {
      cache = null;
      l();
    }
  };
  window.addEventListener("storage", onStorage);
  return () => {
    listeners.delete(l);
    window.removeEventListener("storage", onStorage);
  };
}

export function useStore(): Store {
  return useSyncExternalStore(subscribe, read, read);
}

export function useModuleProgress(moduleId: string): ModuleProgress {
  const s = useStore();
  return s.modules[moduleId] ?? EMPTY;
}

const EMPTY = emptyModule();

export const progress = {
  recordAnswers(moduleId: string, results: Record<string, boolean>) {
    update(moduleId, (p) => ({ ...p, answered: { ...p.answered, ...results } }));
  },
  recordAttempt(moduleId: string, score: number) {
    update(moduleId, (p) => ({
      ...p,
      attempts: p.attempts + 1,
      bestScore: Math.max(p.bestScore ?? 0, score),
    }));
  },
  markRead(moduleId: string, sectionId: string) {
    update(moduleId, (p) =>
      p.readSections.includes(sectionId) ? p : { ...p, readSections: [...p.readSections, sectionId] },
    );
  },
  toggleFlag(moduleId: string, questionId: string) {
    update(moduleId, (p) => ({
      ...p,
      flagged: p.flagged.includes(questionId)
        ? p.flagged.filter((id) => id !== questionId)
        : [...p.flagged, questionId],
    }));
  },
  saveNote(moduleId: string, sectionId: string, text: string) {
    update(moduleId, (p) => ({ ...p, notes: { ...p.notes, [sectionId]: text } }));
  },
  setLast(moduleId: string, path: string, label: string) {
    const s = read();
    if (s.last?.path === path) return;
    write({ ...s, last: { moduleId, path, label } });
  },
  reset() {
    write({ modules: {} });
  },
};
