import { readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

// Builds src/data/sel.json from sel-source.json. The source document has no questions,
// so the module only has lesson sections and flashcards copied verbatim from it.

type Item = { en: string; vi: string };
type Competency = { id: string; en: string; vi: string; definition: string; items: Item[] };
type Source = { sourceFile: string; intro: string; competencies: Competency[] };

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const src: Source = JSON.parse(readFileSync(join(root, "src/data/sel-source.json"), "utf8"));
const all = src.competencies;
const label = (c: Competency) => `${c.en} (${c.vi})`;

const flashcards = all.flatMap((comp) =>
  comp.items.map((item, ii) => ({
    id: `sel-${comp.id}-f${ii + 1}`,
    section: comp.id,
    front: item.en,
    back: item.vi,
    explanation: `Thuộc năng lực ${label(comp)}.`,
    sourceFile: src.sourceFile,
  })),
);

const sections = all.map((comp) => ({
  id: comp.id,
  title: label(comp),
  summary: comp.definition,
  concepts: [
    {
      title: "Các thành phần",
      points: comp.items.map((i) => `${i.en}: ${i.vi}`),
    },
  ],
}));

const moduleData = {
  id: "sel",
  title: "Social & Emotional Learning",
  subtitle: "Học tập Xã hội và Cảm xúc (SEL)",
  description: src.intro,
  sourceFile: src.sourceFile,
  sections,
  questions: [],
  flashcards,
};

writeFileSync(join(root, "src/data/sel.json"), JSON.stringify(moduleData, null, 2) + "\n", "utf8");
console.log(`sel.json: ${flashcards.length} thẻ, ${sections.length} phần`);
