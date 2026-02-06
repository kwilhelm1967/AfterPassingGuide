# AfterPassing Guide — 3 Editions

The app runs in one of three modes (not embedded). This keeps Preview, Trial, and Purchased straight in the system.

| Edition   | Meaning                    | Features        | UI / Banner                          |
|-----------|----------------------------|-----------------|--------------------------------------|
| **PREVIEW** | Limited version            | **Limited features:** e.g. 3 documents, capped contacts, script copy/download disabled | Preview banner: "Get full app when you purchase Legacy" |
| **TRIAL**   | Full app, 14-day trial     | Full features (same as purchased) | Trial banner: time remaining, Purchase CTA |
| **FULL**    | Purchased (licensed)       | Full features   | No banner                            |

- **Preview**: What users get by default (e.g. added in email). Limited features. If they want to purchase, they get a discount when they purchase Legacy.
- **Trial**: User started the 14-day trial; they get full app access until expiry. Then they drop back to Preview (or purchase Legacy for a discount on the full app).
- **Full**: User has a valid license (purchased; full app — discount when they purchase Legacy).

**Detection (in App):**

- If `licenseService.isLicensed()` → **FULL**
- Else if trial active (and not expired) → **TRIAL**
- Else → **PREVIEW**

**Feature gates:** App passes `isLicensed` to views. Only **PREVIEW** gets `isLicensed = false`; Trial and Full get `true`. So:
- **Preview** (`isLicensed = false`): DocumentsView (3-doc limit), ExecutorTools (contact limit), ScriptsView (copy/download disabled).
- **Trial & Full** (`isLicensed = true`): No limits; full features.
