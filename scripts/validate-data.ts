import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const files = ["ch2-word-level", "ch4-grammar-cohesion", "ch9-ethics", "sel"];
const pdfs = new Set(["Chương 2_.pdf", "Chương 2_ (1).pdf", "Chương 2_ (2).pdf", "Chương 2_ (3).pdf"]);

type Q = {
  id: string; number: string; section: string; stem: string; options: string[];
  answer: string | null; status: string; sourceFile: string; note?: string;
  optionNotes?: Record<string, string>;
};
type F = { id: string; section: string; front: string; back: string; sourceFile: string; note?: string };

const errors: string[] = [];
const review: string[] = ["# Danh sách cần duyệt", "", "Tự động tạo bởi `npm run validate`. Các câu dưới đây chưa có đáp án trong tài liệu hoặc có ghi chú sai lệch.", ""];
const seenIds = new Set<string>();
let totalVerified = 0;

for (const name of files) {
  const path = join(root, "src/data", `${name}.json`);
  const data = JSON.parse(readFileSync(path, "utf8"));
  const sectionIds = new Set<string>((data.sections ?? []).map((s: { id: string }) => s.id));
  if (sectionIds.size === 0) errors.push(`${name}: thiếu sections (bài học)`);
  if (!pdfs.has(data.sourceFile)) errors.push(`${name}: sourceFile không hợp lệ "${data.sourceFile}"`);

  const noAnswer: string[] = [];
  const notes: string[] = [];
  const stems = new Map<string, string>();

  for (const q of data.questions as Q[]) {
    const where = `${name}/${q.id}`;
    if (seenIds.has(q.id)) errors.push(`${where}: trùng id`);
    seenIds.add(q.id);
    if (!pdfs.has(q.sourceFile)) errors.push(`${where}: thiếu/sai sourceFile`);
    if (!sectionIds.has(q.section)) errors.push(`${where}: section "${q.section}" không tồn tại`);
    if (!q.stem?.trim()) errors.push(`${where}: thiếu stem`);
    if (!Array.isArray(q.options) || q.options.length < 2) errors.push(`${where}: cần ít nhất 2 phương án`);
    if (new Set(q.options).size !== q.options.length) errors.push(`${where}: phương án bị trùng`);
    if (q.status === "verified") {
      totalVerified++;
      if (!q.answer || !q.options.includes(q.answer)) errors.push(`${where}: đáp án không nằm trong options`);
    } else if (q.status === "no_answer") {
      if (q.answer !== null) errors.push(`${where}: no_answer nhưng có answer`);
      noAnswer.push(`- Câu ${q.number}: ${q.stem}`);
    } else {
      errors.push(`${where}: status không hợp lệ`);
    }
    for (const [k, v] of Object.entries(q.optionNotes ?? {})) {
      if (!q.options.includes(k)) errors.push(`${where}: optionNotes có khóa lạ "${k}"`);
      if (!v.trim()) errors.push(`${where}: optionNotes rỗng cho "${k}"`);
    }
    const key = q.stem + "|" + q.options.join("|");
    if (stems.has(key)) errors.push(`${where}: trùng nội dung với ${stems.get(key)}`);
    stems.set(key, q.id);
    if (q.note) notes.push(`- Câu ${q.number}: ${q.note}`);
  }

  for (const f of data.flashcards as F[]) {
    const where = `${name}/${f.id}`;
    if (seenIds.has(f.id)) errors.push(`${where}: trùng id`);
    seenIds.add(f.id);
    if (!pdfs.has(f.sourceFile)) errors.push(`${where}: thiếu/sai sourceFile`);
    if (!sectionIds.has(f.section)) errors.push(`${where}: section "${f.section}" không tồn tại`);
    if (!f.front?.trim() || !f.back?.trim()) errors.push(`${where}: thẻ thiếu mặt trước/sau`);
    if (f.note) notes.push(`- Thẻ ${f.id}: ${f.note}`);
  }

  if (noAnswer.length || notes.length) {
    review.push(`## ${data.title} (${data.sourceFile})`, "");
    if (noAnswer.length) review.push(`### Chưa có đáp án trong tài liệu (${noAnswer.length})`, "", ...noAnswer, "");
    if (notes.length) review.push(`### Ghi chú sai lệch (${notes.length})`, "", ...notes, "");
  }
  console.log(`${name}: ${data.questions.length} câu, ${data.flashcards.length} thẻ, ${sectionIds.size} phần`);
}

const reviewPath = join(root, "REVIEW.md");
const content = review.join("\n");
if (!existsSync(reviewPath) || readFileSync(reviewPath, "utf8") !== content) writeFileSync(reviewPath, content, "utf8");

if (errors.length) {
  console.error(`\n${errors.length} lỗi dữ liệu:\n` + errors.map((e) => "  " + e).join("\n"));
  process.exit(1);
}
console.log(`\nOK: ${totalVerified} câu có đáp án đã kiểm chứng. Danh sách cần duyệt: REVIEW.md`);
