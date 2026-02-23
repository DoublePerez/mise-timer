# Pomodoro Timer — Project Brief & AI Prompt

> **Single source of truth.** Drop in project root. Cursor/Claude Code reads this every session.

---

## Project Overview

**What:** A Pomodoro Timer that feels like it was designed by a Berlin design agency.
**Aesthetic:** Editorial. Reduced. Dieter Rams. Grid-obsessed. Every pixel intentional.
**Stack:** Vite + React + TypeScript + Tailwind CSS + shadcn/ui.
**Deploy:** Vercel.
**Repo:** Git-controlled, feature branches per stage.

---

## Design Direction

### Mood

Dieter Rams' 10 principles applied to a web app. A Braun clock rendered in code. The typography of a Swiss poster. The restraint of a Berlin studio portfolio. Not "minimal for aesthetics" — minimal because every element has earned its place.

**References:** I will provide visual references. Before starting any UI work, **ask me for them** and study them closely. Match the tone, spacing, and typographic confidence. Never design without references.

### Typography

- **Primary typeface — propose one of these (or argue for another):**
  - **Söhne** (Klim) — the Helvetica heir, used by OpenAI/Stripe
  - **Neue Haas Grotesk** — the original Helvetica, more refined
  - **Suisse Int'l** (Swiss Typefaces) — very Berlin-agency
  - **Akkurat** (Lineto) — clean, geometric, European
  - **IBM Plex Sans** — open source, excellent, free
  - **Geist** (Vercel) — modern, free, pairs perfectly with the stack
  - **Space Grotesk** — geometric, slightly distinctive, free
  - **Instrument Sans** — clean, contemporary, free on Google Fonts

- **Monospace (timer display) — propose a pairing:**
  - **Geist Mono**, **IBM Plex Mono**, **JetBrains Mono**, **Space Mono**, **SF Mono**

- **Base size:** `12px`. Intentional — the UI should feel refined and compact.
- **Letter spacing:** `-0.01em` globally (~-1px). Tighter tracking = more editorial.
- **Type scale:** Strict. Propose exact sizes for: caption, body, label, heading, timer display. The timer is the hero — dramatically large.
- **Line height:** Tight. `1.2`–`1.4` body. `1.0`–`1.1` timer.
- **Weight:** Regular (400) and Medium (500) only. Hierarchy comes from size and space, not weight.

### Grid & Spacing

- **Everything aligns to a base grid.** 4px or 8px base unit — propose and justify.
- **Pixel-perfect.** No "close enough." 1px off-grid = fix it.
- **Consistent gaps.** Same spacing rhythm across all components. No ad-hoc values.
- **Generous whitespace.** Space between elements carries meaning. Let the timer breathe.

### Color

- **Restrained palette.** Maximum 4–5 colors total.
- **Near-black + near-white base.** Not pure `#000`/`#FFF` — slightly warm or cool.
- **One accent for Work mode.** Subtle but present.
- **One accent for Break mode.** Distinct from work, same tonal family.
- **No gradients, no shadows, no glows.** Flat and confident.
- **Mode shift = quiet transformation.** Color shift, not animation fireworks.

### Layout

- **Centered, single-column.** Timer is focal point. Everything orbits it.
- **Visual hierarchy (strict order):**
  1. Timer display (hero — dominates)
  2. Mode indicator (secondary — context)
  3. Controls (tertiary — actions)
  4. Duration selectors (quaternary)
  5. Settings/meta (background)
- **Nothing competes with the timer.** Controls recede until needed.
- **Responsive:** Desktop = centered in viewport. Mobile = full-width, grid-aligned.

### Interactions

- **Transitions:** 150–200ms max. Ease-out. No bouncing, no spring physics.
- **Hover:** Subtle opacity shift or underline. No color explosions.
- **Active:** Scale 98–99% on press, or quick opacity dip.
- **Focus:** Visible, accessible ring that respects the palette.

### UI Engineering Process (this order, every time)

1. **Skeleton** — Elements on screen, functional only.
2. **Grid & layout** — Position everything. Verify alignment. No styling.
3. **Tokens** — Encode: colors, spacing, type scale, radii.
4. **Base styles** — Apply tokens. Consistent repeated elements.
5. **Variants** — Work vs break. Primary vs secondary controls.
6. **Polish** — Icons, transitions, micro-interactions.
7. **Pixel audit** — Screenshot. Verify grid. Check hierarchy. Fix strays.
8. **If stuck** — Simplify. A simpler element done perfectly > complex done poorly.

---

## Architecture

### Code Quality — 10/10, non-negotiable

- Separation of concerns: components render, hooks manage logic, utils are pure.
- No magic numbers. Every value traces to a token, constant, or type.
- Small components. One component = one job.
- Custom hooks for all logic (`usePomodoro`, `useNotification`, `useKeyboardShortcuts`).
- TypeScript strict. No `any`. Proper types for everything.
- Readable over clever. Code explains itself.
- Comments only for "why."

### File Structure

```
src/
  components/
    timer-display.tsx
    mode-indicator.tsx
    controls.tsx
    time-selector.tsx
    session-tracker.tsx
    settings-panel.tsx
  hooks/
    use-pomodoro.ts
    use-notification.ts
    use-keyboard.ts
  lib/
    constants.ts
    types.ts
    utils.ts
  App.tsx
  main.tsx
  index.css
```

### AI Collaboration Rules

- **Plan first.** Confirm what we're building before writing code.
- **Never assume.** If ambiguous, ask. Especially design decisions.
- **Follow my references.** Match the energy, spacing, and confidence.
- **Follow the design system.** Tokens, grid, type scale — no exceptions, no hardcoded values.
- **Suggest, don't surprise.** Ideas welcome. Silent additions not.
- **Commit granularly.** One logical change per commit.
- **Pixel-perfect output.** Verify alignment before showing results.

---

## Features & Stages

### Stage 1: Core Timer (Branch: `stage-1-core-timer`)

**Goal:** A working, beautiful timer. Shippable as-is.

#### Features
- [ ] Timer display — `MM:SS`, hero-sized monospace, centerpiece
- [ ] Mode indicator — "Work" / "Break", understated
- [ ] Start / Pause toggle — single button, state-aware label or icon
- [ ] Reset — returns to selected work duration
- [ ] Work mode and Break mode with auto-switch on completion
- [ ] Visual mode shift — color/accent changes between modes
- [ ] **Work duration selector** — `5 | 10 | 15 | 20 | 25` minutes
- [ ] **Break duration selector** — `5 | 10 | 15` minutes
- [ ] Duration selectors: clean, minimal (pill buttons, segmented control, or similar — propose the best UX pattern)

#### State
```typescript
type Mode = 'work' | 'break';
type WorkDuration = 5 | 10 | 15 | 20 | 25;
type BreakDuration = 5 | 10 | 15;

interface TimerState {
  timeRemaining: number;
  isRunning: boolean;
  currentMode: Mode;
  workDuration: WorkDuration;
  breakDuration: BreakDuration;
}
```

#### Commit Plan
1. `Project scaffolding: Vite + React + TS + Tailwind + shadcn/ui`
2. `Design tokens: colors, typography, spacing, grid`
3. `Timer display and layout skeleton`
4. `Controls: start/pause, reset`
5. `Mode indicator and work/break switching`
6. `Duration selectors (work + break)`
7. `Timer logic: usePomodoro hook`
8. `Visual polish: transitions, pixel audit, alignment`

---

### Stage 2: Make It Mine (Branch: `stage-2-make-it-mine`)

**Goal:** Personalization + feedback. The timer becomes a companion, not just a clock.

#### Core Features
- [ ] **Long break cycle** — After N sessions (default 4), trigger long break (15–30 min)
- [ ] **Session tracker** — Visual dots or progress marks showing completed pomodoros
- [ ] **Completion notification** — Browser notification + audio tone
- [ ] **Auto-start toggle** — Automatically begin next session after break

#### Creative Feature Menu (pick what resonates — or propose your own)

| Feature | What | Why it's interesting |
|---------|------|---------------------|
| **Daily intention** | "What are you focusing on?" displayed during work sessions | Connects the tool to purpose, not just time |
| **Breath pauses** | Breathing animation during breaks (expanding/contracting circle) | Turns a break into recovery, not just waiting |
| **Session journal** | One-line note after each pomodoro: "What did you accomplish?" | Micro-journal. Surprisingly motivating |
| **Streak counter** | Consecutive days with ≥1 completed pomodoro | Gentle gamification without noise |
| **Sound design** | Ambient tones for work vs break (soft noise, rain, lo-fi tick) | Timer becomes an environment, not just a clock |
| **Keyboard-first** | `Space` start/pause, `R` reset, `S` skip, `1-5` quick duration | Power-user feel. Makes the app feel serious |
| **Time awareness** | "Good morning. First pomodoro." / "2 hours focused today." | Human, contextual. Not a chatbot — just awareness |
| **Minimal dashboard** | End-of-day: total focus time, sessions, break time | Accountability without complexity |
| **Ambient mode** | While running, dim everything except the countdown | Maximum focus. The UI gets out of the way |
| **Task tagging** | Label each pomodoro with a project or category | See where your time actually goes |

**Before building:** Present these options. Recommend a combination that creates a cohesive experience. Ask me to choose.

---

### Stage 3: Polish & Personality (Branch: `stage-3-polish`)

**Goal:** Craft. The difference between "works" and "feels right."

#### Extensions (ranked by impact before starting)
- [ ] **Dark / light theme** — Both beautiful. Not an afterthought.
- [ ] **Circular progress ring** — SVG, thin, elegant. Depletes with the timer.
- [ ] **localStorage** — Settings, sessions, streak survive refresh.
- [ ] **Dynamic favicon** — Shows time remaining or mode color in browser tab.
- [ ] **PWA** — Installable. Works offline.
- [ ] **Export data** — Daily/weekly log as markdown or CSV.
- [ ] **Responsive perfection** — Desktop, tablet, mobile — all grid-aligned.
- [ ] **Accessibility** — Screen reader, reduced motion, high contrast.
- [ ] **Easter egg** — Something small and delightful. (Suggest ideas.)

**Before building:** Rank by impact ÷ effort. Ask me to pick.

---

## Design Tokens

```
GRID
  --grid-unit              4px (or 8px — justify)

COLORS
  --color-bg               near-white or near-black
  --color-fg               inverse of bg
  --color-muted            subdued text
  --color-border           structural, very subtle
  --color-work             work accent
  --color-break            break accent

TYPOGRAPHY
  --font-sans              [chosen face], fallbacks
  --font-mono              [chosen mono], fallbacks
  --text-xs                10px (caption)
  --text-sm                12px (body — the base)
  --text-base              14px (labels, UI)
  --text-lg                18px (section headings)
  --text-xl                24px (page headings)
  --text-timer             72–120px (propose exact)
  --tracking               -0.01em
  --leading-tight          1.2
  --leading-normal         1.4
  --leading-timer          1.0

SPACING (grid multiples)
  --space-1                4px
  --space-2                8px
  --space-3                12px
  --space-4                16px
  --space-6                24px
  --space-8                32px
  --space-12               48px
  --space-16               64px

RADIUS
  --radius-sm              2px
  --radius-md              4px
  --radius-lg              8px
  --radius-full            9999px

MOTION
  --duration-fast          100ms
  --duration-normal        150ms
  --ease                   cubic-bezier(0.16, 1, 0.3, 1)
```

---

## Deployment

- **Platform:** Vercel
- **Build command:** `pnpm build`
- **Output directory:** `dist`
- **Framework preset:** Vite
- Auto-deploys from `main`

---

## Git Workflow

```
main (stable → Vercel)
 ├── stage-1-core-timer
 ├── stage-2-make-it-mine
 └── stage-3-polish
```

New stage → new branch → new chat → merge → delete branch.

---

## Starting Each Chat

### Stage 1
```
@POMODORO-PROJECT-PROMPT.md

Stage 1: Core Timer. Read the full brief.
Before any code:
1. Ask for my visual references
2. Propose typeface pairing (sans + mono) with reasoning
3. Propose color palette
4. Confirm full plan
Wait for approval.
```

### Stage 2
```
@POMODORO-PROJECT-PROMPT.md

Stage 2: Make It Mine. Read the full brief.
1. Review current codebase
2. Present feature options with recommendations
3. Ask me which I want
4. Plan, then wait for approval
```

### Stage 3
```
@POMODORO-PROJECT-PROMPT.md

Stage 3: Polish. Read the full brief.
1. Review codebase
2. Rank extensions by impact ÷ effort
3. Ask me to pick
4. Plan, wait for approval
```

---

## Questions AI Must Ask Before Every Stage

1. **Can I see your visual references?** (Never design without them.)
2. **Typeface preference?** (Propose, wait for selection.)
3. **Dark, light, or both?**
4. **Colors you love or hate?**
5. **Must-haves vs nice-to-haves for this stage?**
6. **Anything from the previous stage to change?**
7. **Primary device?** (Affects layout priority.)
