# AfterPassing Guide — MVP Screens & Designer Instructions

This document defines the **exact MVP screens** and **designer instructions** for the AfterPassing Guide application. Use it for design handoff, QA, and UI consistency.

---

## Part 1: Exact MVP Screens

Screens are listed in **user-flow order**. Each screen has a unique **ID**, **name**, **purpose**, **entry**, **key elements**, and **variants** (if any).

---

### 1. Loading

| Field | Value |
|-------|--------|
| **ID** | `loading` |
| **Name** | Loading |
| **Purpose** | Shown while app initializes (license check, load saved data). |
| **Entry** | App launch only. |
| **Key elements** | Full-viewport; centered spinner (primary color); "Loading..." text (muted). |
| **Variants** | None. |

---

### 2. Marketing Landing (Pre-Entry)

| Field | Value |
|-------|--------|
| **ID** | `landing` |
| **Name** | Marketing Landing Page |
| **Purpose** | Public pre-entry: orient first-time visitors, explain value, CTA to open app or start trial. |
| **Entry** | When `showLandingPage` is true (e.g. first visit or dev override). |
| **Key elements** | Sticky nav (logo "AfterPassing Guide", "Get Started" button); hero (headline, subtext, stats chips, "Open the app" primary CTA, "Learn more" secondary); "What you'll find here" feature grid (4 cards); "You're in the right place" reassurance strip; "Your privacy comes first" trust block; final CTA block ("Ready to get organized?", "Start free trial"); footer disclaimer. |
| **Variants** | None. |

---

### 3. License Activation (Guard)

| Field | Value |
|-------|--------|
| **ID** | `license-activation` |
| **Name** | License Activation Screen |
| **Purpose** | Let user enter a license when not licensed (standalone mode). |
| **Entry** | When `showActivation && !isLicensed` (can be toggled off in dev). |
| **Key elements** | Full-screen form: title, description, license input, "Activate" primary button, optional "Start trial" / "Purchase" links. |
| **Variants** | None. |

---

### 4. Onboarding Wizard (4 steps)

| Field | Value |
|-------|--------|
| **ID** | `onboarding` |
| **Name** | Onboarding Wizard |
| **Purpose** | First-run orientation and minimal profile setup; emotionally safe, no pressure. |
| **Entry** | When `showOnboarding || !profile` (after landing dismissed or no profile). |
| **Key elements** | **Global:** Progress dots (4); single card with step header (icon, step title, optional subtitle); content area; footer (Back, Continue / Get Started). **Steps:** (1) **Welcome** — short intro copy. (2) **You're Not Alone** — reassurance copy. (3) **Optional Details** — "Add some details" vs "Skip for now"; if details: optional name input. (4) **Before We Begin** — disclaimer copy + required checkbox "I understand this tool provides organizational guidance only"; Continue becomes "Get Started". |
| **Variants** | Step index 0–3; optional-details expanded vs skipped. |

---

### 5. Main Shell (Logged-In App)

| Field | Value |
|-------|--------|
| **ID** | `main-shell` |
| **Name** | Main Application Shell |
| **Purpose** | Persistent chrome: sidebar + main content area. All in-app screens (6–13) render inside this shell. |
| **Entry** | After onboarding complete (profile exists); user stays here until logout/reset. |
| **Key elements** | **Sidebar (left):** Logo block (Heart icon, "AfterPassing Guide", "Guidance and Support"); nav list (Guidance, Documents, Templates, Executor Tools, Settings) with active state; footer ("Administrative guidance only"). **Main area:** Top-right "Preview" pill when edition = PREVIEW; optional Trial banner when TRIAL; optional Disclaimer at top (except on Guidance); scrollable content pane (tab-dependent). |
| **Variants** | Preview pill visible/hidden; Trial banner visible/hidden; active tab. |

---

### 6. Guidance — Focus View

| Field | Value |
|-------|--------|
| **ID** | `guidance-focus` |
| **Name** | Guidance — What Matters First (Focus View) |
| **Purpose** | Default guidance home: one clear next step and short "Now" list; low cognitive load. |
| **Entry** | Tab = Guidance and `!showFullChecklist`. |
| **Key elements** | Heading "What matters first"; subtext "Start with one thing…"; primary CTA "Open step by step guidance"; secondary "Go to documents"; "Now" section with 3–5 cards (left teal thread, title, supporting text, optional Details/Done/Skip); collapsible "Next" and "Later" sections; disclaimer block below. If no plan: same layout + fallback card "Your step-by-step list isn't ready yet" + "Create my guidance" button. |
| **Variants** | With plan / without plan (fallback card). Optional: Welcome-back state (returning user). |

---

### 7. Guidance — Checklist View

| Field | Value |
|-------|--------|
| **ID** | `guidance-checklist` |
| **Name** | Guidance — Step-by-Step (Checklist View) |
| **Purpose** | Full guided task list by phase; user marks items done or "I'll come back later". |
| **Entry** | Tab = Guidance, plan exists, and "Open step by step guidance" clicked (`showFullChecklist`). |
| **Key elements** | Heading "Guided support"; subtext; three collapsible sections: "What to focus on right now", "When you're ready", "Can wait for now". Each section: header (label + expand/collapse); task cards (title, "What this usually involves" expand, "I've handled this" / "I'll come back later"); in first section, "Show me what comes next" CTA. "Return to Focus View" link; disclaimer/disclaimer copy below. |
| **Variants** | Sections expanded/collapsed; tasks done/skipped. Empty state if no tasks. |

---

### 8. Documents

| Field | Value |
|-------|--------|
| **ID** | `documents` |
| **Name** | Documents |
| **Purpose** | Upload and organize document references; preview limit (e.g. 3) when not licensed. |
| **Entry** | Tab = Documents. |
| **Key elements** | Page title "Documents"; optional lock/preview copy; disclaimer (legal/organizational); preview progress "X of 3 documents" when preview; upload zone (dashed border, "Upload Document", "PDF, images, or documents"); list of document cards (icon, name/label, date, type selector, delete). Optional UpgradePrompt when at limit. |
| **Variants** | Licensed vs preview (limit messaging); empty list vs list with items. |

---

### 9. Templates (Scripts)

| Field | Value |
|-------|--------|
| **ID** | `templates` |
| **Name** | Templates |
| **Purpose** | Browse and use phone/letter/email templates; preview shows examples, full access allows copy/Word export. |
| **Entry** | Tab = Templates. |
| **Key elements** | Page title "Templates"; optional lock/preview copy; **left column:** template type groups (e.g. Phone Scripts, Letters, Email); list of template buttons (icon, title). **Right column:** If template selected — title, description, Copy + Word buttons, quick-fill fields, editable content area; if none selected — placeholder "Select a template to get started". Optional UpgradePrompt. |
| **Variants** | No selection vs template selected; licensed vs preview (Copy/Word enabled or upgrade prompt). |

---

### 10. Executor Tools — Checklist Tab

| Field | Value |
|-------|--------|
| **ID** | `executor-checklist` |
| **Name** | Executor Tools — Checklist |
| **Purpose** | Executor checklist by category; mark items done, open details (e.g. credit bureaus). |
| **Entry** | Tab = Executor Tools; sub-tab "Checklist". |
| **Key elements** | Back button (to Guidance); title "Executor Tools"; sub-tabs (Checklist, Contacts, Export Binder). Disclaimer strip; progress "Items addressed" + bar; accordion categories (e.g. Documents, Communication); per item: checkbox, title, optional "More info"; modal for details (e.g. credit bureau addresses). |
| **Variants** | Categories expanded/collapsed; items done/pending; details modal open/closed. |

---

### 11. Executor Tools — Contacts Tab

| Field | Value |
|-------|--------|
| **ID** | `executor-contacts` |
| **Name** | Executor Tools — Contacts |
| **Purpose** | Contact list with status (Not Contacted / In Progress / Completed). |
| **Entry** | Tab = Executor Tools; sub-tab "Contacts". |
| **Key elements** | Same chrome as Checklist; stats row (Total, In Progress, Completed); contact cards (name, type, status dropdown, phone/email/website, notes). Empty state if no contacts. Optional upgrade prompt for preview. |
| **Variants** | Empty vs list; licensed vs preview. |

---

### 12. Executor Tools — Export Binder Tab

| Field | Value |
|-------|--------|
| **ID** | `executor-export` |
| **Name** | Executor Tools — Export Binder |
| **Purpose** | Export a text/PDF binder (tasks, checklist, contacts, optional document summaries). |
| **Entry** | Tab = Executor Tools; sub-tab "Export Binder". |
| **Key elements** | Icon + title "Export Binder"; subtext; checkboxes (Include Task Plan, Checklist, Contact Directory, Document Summaries); primary button "Download PDF Binder" (or "Generating…" / "PDF Downloaded!"); short helper text. |
| **Variants** | Idle / generating / copied; plan present or not (button disabled when no plan). |

---

### 13. Settings

| Field | Value |
|-------|--------|
| **ID** | `settings` |
| **Name** | Settings |
| **Purpose** | Profile (Your Situation), data privacy copy, backup/restore, full-access/export (preview), regenerate guidance, reset data. |
| **Entry** | Tab = Settings. |
| **Key elements** | **Your Situation (main):** Name of deceased, relationship, country, state/region, will?, executor?, date of passing; "Save Changes"; optional "Refresh Guidance" strip. **Data Privacy & Saving:** Short copy. **Backup & Restore:** "Export Backup" / "Import Backup" + message. **Full access (preview):** Upgrade/export CTAs. **Regenerate tasks** option. **Reset Data** (start over). Optional User Guide / FAQs. |
| **Variants** | Edition (Preview / Trial / Full); has changes / saved; backup status; optional panels expanded. |

---

### 14. Preview Pill Modal (Overlay)

| Field | Value |
|-------|--------|
| **ID** | `preview-pill-modal` |
| **Name** | Preview Pill Modal |
| **Purpose** | Explain preview and offer trial or license entry. |
| **Entry** | User clicks "Preview" pill in main shell (when edition = PREVIEW). |
| **Key elements** | Modal overlay; title "Preview"; short copy; "Start trial" primary; "Enter license" secondary; "Not now" dismiss. |
| **Variants** | None. |

---

### 15. Trial Expired / Trial Banner (Inline & Modal-like)

| Field | Value |
|-------|--------|
| **ID** | `trial-expired` / `trial-banner` |
| **Name** | Trial Expired Block / Trial Status Banner |
| **Purpose** | When trial expired: block with Purchase + Export. When trial active: inline banner with time remaining, Purchase, Export. |
| **Entry** | Edition = TRIAL; expired shows block; active shows banner (e.g. below nav in main content). |
| **Key elements** | **Expired:** Alert style; "Trial Expired"; copy; Purchase License (primary); Export Data (secondary). **Active:** Compact bar with clock icon, "Trial: X days remaining", Purchase, Export. |
| **Variants** | Expired vs active; optional dismiss. |

---

### 16. Error (Fallback)

| Field | Value |
|-------|--------|
| **ID** | `error` |
| **Name** | Error Boundary Screen |
| **Purpose** | Catch React errors; reassure user, offer try again / reload. |
| **Entry** | When any child throws and ErrorBoundary catches. |
| **Key elements** | Full-viewport card; warning icon; "Something went wrong"; short copy (data is local, try again or reload); optional "Error details" expandable; "Try again" primary; "Reload app" secondary. |
| **Variants** | With/without error details expanded. |

---

### MVP Screen Summary Table

| # | ID | Name |
|---|----|------|
| 1 | `loading` | Loading |
| 2 | `landing` | Marketing Landing Page |
| 3 | `license-activation` | License Activation Screen |
| 4 | `onboarding` | Onboarding Wizard (4 steps) |
| 5 | `main-shell` | Main Application Shell |
| 6 | `guidance-focus` | Guidance — Focus View |
| 7 | `guidance-checklist` | Guidance — Checklist View |
| 8 | `documents` | Documents |
| 9 | `templates` | Templates |
| 10 | `executor-checklist` | Executor Tools — Checklist |
| 11 | `executor-contacts` | Executor Tools — Contacts |
| 12 | `executor-export` | Executor Tools — Export Binder |
| 13 | `settings` | Settings |
| 14 | `preview-pill-modal` | Preview Pill Modal |
| 15 | `trial-expired` / `trial-banner` | Trial Expired / Trial Banner |
| 16 | `error` | Error Boundary Screen |

---

## Part 2: Designer Instructions

Use these instructions for visual design, UX copy, and consistency. The app should feel **calm, professional, and cohesive** — part of the Local Legacy Vault suite without feeling salesy.

---

### 2.1 Design System Reference

- **Theme:** Single source is `src/styles/theme.css`. All UI must use these tokens; no one-off hex/slate/emerald/gold outside the system.
- **Colors:**
  - **Backgrounds:** `--bg-app`, `--bg-page`, `--bg-page-bottom`, `--bg-elevated` (warm dark neutrals, one family).
  - **Surfaces:** `--surface`, `--surface-hover`, `--surface-elevated` (cards, panels, inputs).
  - **Text:** `--text`, `--text-muted`, `--text-faint` (single hierarchy).
  - **Borders:** `--border`, `--border-strong`.
  - **Primary (teal):** `--primary`, `--primary-hover`, `--primary-pressed`, `--primary-soft`, `--primary-outline`, `--focus-ring`. Use for **all** primary actions, links, progress, and focus.
  - **Warmth (gold):** `--warm` / `--gold`, `--warm-muted`. Use **sparingly** (e.g. nav icon when inactive, small labels). Do not use for primary CTAs.
  - **Status:** `--success`, `--warning`, `--danger`.
- **Radius:** `--radius-sm` (8px), `--radius-md` (12px), `--radius-lg` (14px), `--radius-xl` (18px). Use consistently (e.g. cards = lg, buttons = md).
- **Shadows:** `--shadow-sm`, `--shadow-card`, `--shadow-card-hover`. Cards get subtle depth; avoid heavy shadows.
- **Motion:** `--transition-fast` (0.15s), `--transition-base` (0.2s), `--transition-smooth` (0.25s). Use for hover/focus; no decorative animations.

---

### 2.2 Global Principles

1. **One primary color (teal).** All buttons, links, progress bars, and active states use the primary family. No competing accent colors for actions.
2. **One warmth accent (gold).** Reserved for small, non-action elements (e.g. sidebar icon when not selected). Never for main CTAs.
3. **Cohesive neutrals.** All grays/backgrounds come from the theme; no ad-hoc slate/teal/blue.
4. **Calm, not flashy.** No auto-playing motion, no garish gradients, no pulse on CTAs. Subtle gradients and hover states are enough.
5. **Clear hierarchy.** Section titles and body text use the same scale and weights across screens; one "section title" and one "section subtitle" style.
6. **Flow.** Main content area uses a subtle vertical gradient (page top → page bottom) so the layout doesn’t feel flat. Cards have a subtle top highlight for depth.

---

### 2.3 Per-Screen Designer Notes

- **Loading:** Minimal. Spinner in primary; text muted. No branding flourish.
- **Landing:** Professional marketing, not loud. Nav and CTAs use primary; feature cards use card style and soft hovers; trust/CTA blocks use same card system. No mouse-follow effects or animated gradient text.
- **License Activation:** Simple form. Primary for "Activate"; secondary for trial/purchase links. Same input and button styles as rest of app.
- **Onboarding:** One card per step; progress dots in primary. Copy is short and reassuring. Buttons: primary for Continue/Get Started; secondary for Back. Optional-details inputs use standard input style.
- **Main Shell:** Sidebar: logo + nav; active nav item uses primary left border/indicator. Main area: optional preview pill (top-right), optional trial banner, then content. No competing chrome.
- **Guidance (Focus):** "What matters first" is the hero; one primary CTA, one secondary. Now cards: left-edge primary thread, no heavy shadows. Next/Later: collapsible, same card style.
- **Guidance (Checklist):** Sections are collapsible cards; task cards have clear "I've handled this" / "I'll come back later." One primary CTA per section where needed. "Return to Focus View" is a text link (primary).
- **Documents:** Upload zone: dashed border, surface background, hover = primary outline. Document cards: card style, primary icon tint, clear delete. Disclaimer: card, muted text.
- **Templates:** Left: list of template buttons; selected = primary-soft background. Right: card for editor; Copy = primary, Word = secondary. Placeholder when nothing selected: card, primary icon.
- **Executor (all tabs):** Same tab bar (Checklist, Contacts, Export Binder); active tab = primary-soft + primary text. Checklist: accordion categories, primary progress bar. Contacts: status badges use primary-soft/success/surface. Export: checkboxes in surface style; one primary button.
- **Settings:** Sections as cards. "Your Situation" is the main block; Save = primary. Backup buttons: primary-soft for export, surface for import. Preview-only block: primary for upgrade/export.
- **Preview Modal:** Small modal; primary for "Start trial," secondary for "Enter license." Copy short and neutral.
- **Trial Expired / Banner:** Expired: alert style (warning/danger family), primary for Purchase. Banner: compact bar, primary for actions.
- **Error:** Card in center; warning icon; primary "Try again," secondary "Reload app." No alarming imagery.

---

### 2.4 Component Conventions

- **Primary button:** Teal gradient (primary → primary-hover), dark text, slight shadow. Hover: brighten slightly. Use for single main action per block (e.g. "Open step by step guidance," "Save Changes," "Download PDF Binder").
- **Secondary button:** Surface background, border, muted text. Hover: surface-hover, primary-outline border. Use for secondary actions (e.g. "Go to documents," "Learn more," "Import Backup").
- **Card:** Surface background, subtle top highlight, border, radius-lg, shadow-card. Hover (when interactive): border-strong, shadow-card-hover, surface-hover.
- **Section title:** Semibold, text color, consistent size (e.g. 1.125rem). Section subtitle: muted, smaller, one line below.
- **Inputs:** Surface background, border, radius-md. Focus: primary border + primary-soft ring. Use `input-base` class for consistency.
- **Links / in-text CTAs:** Primary color, hover underline or primary-hover. No blue.

---

### 2.5 Don’ts

- Don’t introduce new accent colors (e.g. blue, purple, extra green) for buttons or links.
- Don’t use gold/amber for primary CTAs.
- Don’t use raw slate/teal/emerald hex outside theme tokens.
- Don’t add decorative animations (pulse, bounce, gradient shift) to buttons or headings.
- Don’t make cards or panels flat (no border, no shadow, no subtle gradient).
- Don’t mix competing button styles (e.g. filled gold vs outline teal) for the same action type.
- Don’t use marketing or salesy tone in the in-app UI (reserve that for the landing page only).

---

### 2.6 File Reference for Designers

| What | Where |
|------|--------|
| Theme tokens (colors, radius, shadow, motion) | `src/styles/theme.css` |
| Global layout, nav, buttons, cards, inputs | `src/index.css` |
| Tailwind theme extension | `tailwind.config.js` |
| Main shell + tab routing | `src/App.tsx` |
| Landing | `src/LAV/MarketingLandingPage.tsx` |
| Onboarding | `src/components/onboarding/OnboardingWizard.tsx` |
| Guidance Focus / Checklist | `src/components/tasks/FocusView.tsx`, `ChecklistView.tsx` |
| Documents | `src/components/documents/DocumentsView.tsx` |
| Templates | `src/components/scripts/ScriptsView.tsx` |
| Executor Tools | `src/components/executor/ExecutorTools.tsx` |
| Settings | `src/components/settings/SettingsView.tsx` |
| License / Preview / Trial | `src/components/license/*.tsx` |
| Error | `src/components/common/ErrorBoundary.tsx` |

---

*Document version: 1.0. Last updated to match current codebase (theme, navigation, and MVP screen set).*
