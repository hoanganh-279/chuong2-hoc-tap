# Responsive Desktop Scaling Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make the UI scale with the viewport on wide desktop screens while leaving mobile/tablet (< 1280px) unchanged.

**Architecture:** A fluid root font size (`clamp`) drives every rem-based Tailwind value. All hard-coded px values are converted to rem so they follow it, and the main page container moves from `max-w-6xl` to a new `max-w-page` (88rem) token.

**Tech Stack:** React 19, Vite 8, Tailwind CSS v4 (`@tailwindcss/vite`), `@phosphor-icons/react`, Chrome DevTools MCP for screenshots.

Spec: `docs/superpowers/specs/2026-10-13-responsive-desktop-scaling-design.md`

## Global Constraints

- Root font size: `clamp(16px, 0.4vw + 11px, 20px)`. Must equal 16px at <= 1280px viewport.
- Page container token: `--container-page: 88rem` (utility `max-w-page`).
- No layout restructuring, no new components, no color/font changes.
- Project is not a git repository: skip commit steps (or run `git init` first if the user wants history).
- Dev server: `npm run dev` (Vite, default http://localhost:5173).

---

### Task 1: Baseline screenshots

**Files:** none modified. Output: `docs/superpowers/screens/before/*.png`

- [ ] **Step 1:** Run `npm run dev` in background, wait for `Local: http://localhost:5173/`.
- [ ] **Step 2:** With Chrome DevTools MCP (`new_page`, `resize_page`, `take_screenshot` with `fullPage: true`), capture at widths 375, 768, 1280, 1920, 2560 (height 1000):
  - `/` (Home)
  - `/chu-de/<first module id>?tab=bai-hoc`
  - `/chu-de/<first module id>?tab=the`
  - Quiz runner: open `/chu-de/<id>?tab=lam-bai`, start a practice quiz.
- [ ] **Step 3:** Save as `before/<page>-<width>.png`. These are the reference for "unchanged on mobile".

### Task 2: Fluid root size and container token

**Files:**
- Modify: `src/index.css` (`@theme inline` block around line 51-72, `html` rule around line 74-77)

**Interfaces:**
- Produces: utility `max-w-page`, rem-based `--radius-ui`.

- [ ] **Step 1:** In `@theme inline`, replace `--radius-ui: 12px;` with:

```css
  --radius-ui: 0.75rem;
  --container-page: 88rem;
```

- [ ] **Step 2:** Replace the `html` rule with:

```css
html {
  -webkit-text-size-adjust: 100%;
  scroll-behavior: smooth;
  font-size: clamp(16px, 0.4vw + 11px, 20px);
}
```

- [ ] **Step 3:** Verify in DevTools (`evaluate_script`): `getComputedStyle(document.documentElement).fontSize` returns `"16px"` at width 1280 and `"20px"` at width 2560.

### Task 3: Wider page container

**Files:**
- Modify: `src/components/Layout.tsx:39`, `src/components/Layout.tsx:63`
- Modify: `src/pages/Home.tsx:60`, `:90`, `:100`
- Modify: `src/pages/ModulePage.tsx:47`
- Modify: `src/components/ui.tsx:58`

- [ ] **Step 1:** In each of these 7 class strings replace `max-w-6xl` with `max-w-page` and `sm:px-6` with `sm:px-6 lg:px-10`. Example for `Layout.tsx:39`:

```tsx
<div className="mx-auto flex h-16 max-w-page items-center justify-between gap-4 px-4 sm:px-6 lg:px-10">
```

- [ ] **Step 2:** Confirm no leftovers: Grep `max-w-6xl` in `src` returns 0 matches.

### Task 4: Convert px arbitrary values to rem

**Files:** `src/pages/Review.tsx`, `src/pages/ModulePage.tsx`, `src/components/LessonView.tsx`, `src/pages/Quiz.tsx`, `src/components/FlashcardDeck.tsx`, `src/components/ui.tsx`, `src/components/AnswerOption.tsx`, `src/components/QuizSetup.tsx`

- [ ] **Step 1:** Replace across `src` (replace_all per file):

| Find | Replace |
|---|---|
| `text-[15px]` | `text-[0.9375rem]` |
| `text-[16px]` | `text-base` |
| `sm:text-[17px]` | `sm:text-[1.0625rem]` |
| `sm:text-[28px]` | `sm:text-[1.75rem]` |
| `grid-cols-[260px_1fr]` | `grid-cols-[16rem_1fr]` |
| `w-[18px]` | `w-[1.125rem]` |
| `min-h-[300px]` | `min-h-[18.75rem]` |
| `sm:min-h-[340px]` | `sm:min-h-[21.25rem]` |

- [ ] **Step 2:** Grep `\[[\d.]+px` in `src` returns 0 matches.

### Task 5: Icon sizes in rem

**Files:** every `src/**/*.tsx` that renders a Phosphor icon with `size={N}`.

- [ ] **Step 1:** Run this one-off codemod from the project root:

```powershell
node -e "const fs=require('fs'),p=require('path');const walk=d=>fs.readdirSync(d,{withFileTypes:true}).flatMap(e=>e.isDirectory()?walk(p.join(d,e.name)):[p.join(d,e.name)]);for(const f of walk('src').filter(f=>f.endsWith('.tsx'))){const s=fs.readFileSync(f,'utf8');const o=s.replace(/size=\{(\d+)\}/g,(_,n)=>'size=\"'+(n/16)+'rem\"');if(o!==s){fs.writeFileSync(f,o);console.log(f)}}"
```

Expected: prints the changed files (Layout, ModulePage, LessonView, Quiz, FlashcardDeck, Home, Review, Result, QuizSetup, OptionReason, AnswerOption, NotFound as applicable).

- [ ] **Step 2:** Grep `size=\{\d+\}` in `src` returns 0 matches. Spot-check one file: `size={18}` became `size="1.125rem"`, `size={22}` became `size="1.375rem"`.

### Task 6: Build and visual verification

- [ ] **Step 1:** Run `npm run build`. Expected: validate passes, `tsc -b` has no errors, Vite build succeeds.
- [ ] **Step 2:** Repeat Task 1 screenshots into `docs/superpowers/screens/after/`, in light mode and dark mode (toggle via the header theme button).
- [ ] **Step 3:** Compare:
  - 375 and 768px: identical to `before/` (same font size, same layout).
  - 1280px: same layout, container slightly wider (88rem vs 72rem).
  - 1920 and 2560px: text visibly larger, content fills much more of the width, lesson table of contents and card readable.
  - No horizontal scrollbar (`document.documentElement.scrollWidth <= innerWidth` via `evaluate_script`), sticky header and sticky tab bar do not overlap content, quiz bottom bar fully visible.
- [ ] **Step 4:** Report results to the user with before/after screenshots at 1920px and 375px.
