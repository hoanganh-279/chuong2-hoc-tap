# Responsive desktop scaling - Design

## Problem

On wide desktop screens (1920px and above, or a browser zoomed out) the app renders as a small column in the middle of the viewport. Every page is capped at `max-w-6xl` (72rem, about 1152px) and the root font size is fixed at 16px, so text, spacing and the lesson column look tiny and most of the screen is empty.

Mobile and tablet layouts already work and must not change.

## Goal

The UI stretches with the viewport: the wider the window, the larger text, spacing and content containers become, so the page always fills the window width. Below 1440px everything renders exactly as today.

## Design

### 1. Fluid root font size

In `src/index.css`, the `html` rule gets:

```css
font-size: max(16px, 1.1111vw);
```

No upper cap: the layout always stretches to the window width (user decision, 2026-10-13). Browser zoom therefore has little effect on desktop widths.

| Viewport width | Root font size |
|---|---|
| <= 1440px | 16px (unchanged) |
| 1920px | ~21.3px |
| 2560px | ~28.4px |

Tailwind v4 sizes text, spacing, heights, `max-w-*` containers and `sticky top-*` offsets in `rem`, so all of them scale together.

### 2. Convert fixed px values to rem

Values written in px do not follow the root size and must be converted:

| Current | Replacement |
|---|---|
| `text-[15px]` | `text-[0.9375rem]` |
| `text-[16px]` | `text-base` |
| `sm:text-[17px]` | `sm:text-[1.0625rem]` |
| `sm:text-[28px]` | `sm:text-[1.75rem]` |
| `lg:grid-cols-[260px_1fr]` / `md:grid-cols-[260px_1fr]` | `...-[16rem_1fr]` |
| `w-[18px]` | `w-[1.125rem]` |
| `min-h-[300px]` / `sm:min-h-[340px]` | `min-h-[18.75rem]` / `sm:min-h-[21.25rem]` |
| `--radius-ui: 12px` | `--radius-ui: 0.75rem` |
| Phosphor icon `size={N}` | `size="{N/16}rem"` (e.g. `size={18}` becomes `size="1.125rem"`) |

### 3. Wider shared page container

Add a Tailwind v4 container token `--container-page: 88rem` inside `@theme inline`, which generates the `max-w-page` utility. At 16px root it is 1408px, at 20px root it is 1760px.

Replace every `max-w-6xl` (in `Layout.tsx`, `Home.tsx`, `ModulePage.tsx`, `ui.tsx` `PageSkeleton`) with `max-w-page`, and add `lg:px-10` next to the existing `px-4 sm:px-6` on those containers.

Reading-focused pages keep their narrower caps (`max-w-2xl`, `max-w-3xl`, `max-w-4xl`, `max-w-xl` in Quiz, FlashcardDeck, Review, Result, NotFound). Those are rem-based and grow with the root font size, which keeps line length comfortable.

## Out of scope

- No layout restructuring (no third column, no new components).
- No visual restyle (colors, fonts, radii stay the same values).
- Mobile and tablet behavior unchanged.

## Verification

- `npm run build` passes (validate, type-check, vite build).
- Screenshots via Chrome DevTools at 375, 768, 1280, 1920 and 2560px for Home, Module lesson tab, Flashcards tab, Quiz runner, in light and dark mode.
- At 375 and 768px the screenshots match the current UI.
- At 1920 and 2560px content fills noticeably more of the viewport and text is visibly larger, with no horizontal scrollbar and no overlapping sticky header/tabs.
