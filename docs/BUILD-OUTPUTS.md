# Build outputs — Preview, Trial, and Paid (per OS)

You need three kinds of installers for each OS:

1. **Preview (limited)** — For the email link. Limited features only; no trial or license in-app.
2. **Full (trial + paid)** — Same file: user gets a 14-day trial or enters a license after purchase.

So you build **two variants** per OS: Preview and Full. The “paid” version is the **same file** as the full build; you give it to customers after purchase (they enter their license in the app).

---

## Build commands

Install deps once (includes `cross-env` for Windows):

```bash
npm install
```

### Preview build (limited — for email link)

| OS     | Command | Output folder |
|--------|--------|----------------|
| Windows | `npm run electron:build:preview:win` | `release-preview/` |
| macOS   | `npm run electron:build:preview:mac` | `release-preview/` |
| Linux   | `npm run electron:build:preview:linux` | `release-preview/` |
| All     | `npm run electron:build:preview:all` | `release-preview/` |

**Artifacts (typical names):**

- **Windows:** `release-preview/AfterPassing Guide (Preview) 1.0.0.exe` (portable), `... Setup 1.0.0.exe` (NSIS installer)
- **macOS:** `release-preview/AfterPassing Guide (Preview)-1.0.0.dmg`, `...-1.0.0-mac.zip`
- **Linux:** `release-preview/AfterPassing Guide (Preview)-1.0.0.AppImage`, `..._1.0.0_amd64.deb`

Use the **Preview** .exe / .dmg / .AppImage as the link you add to the email.

---

### Full build (trial + paid — same file)

| OS     | Command | Output folder |
|--------|--------|----------------|
| Windows | `npm run electron:build:win` | `dist/` |
| macOS   | `npm run electron:build:mac` | `dist/` |
| Linux   | `npm run electron:build:linux` | `dist/` |
| All     | `npm run electron:build:all` | `dist/` |

**Artifacts (typical names):**

- **Windows:** `dist/AfterPassing Guide 1.0.0.exe` (portable), `... Setup 1.0.0.exe` (NSIS)
- **macOS:** `dist/AfterPassing Guide-1.0.0.dmg`, `...-1.0.0-mac.zip`
- **Linux:** `dist/AfterPassing Guide-1.0.0.AppImage`, `..._1.0.0_amd64.deb`

- **Trial:** Give this same installer to users who “Start free trial” — they get 14 days, then can purchase.
- **Paid:** After purchase, give this **same** installer; they open it and enter their license key (no trial needed if they already have a key).

---

## Summary

| Use case | Which build | Where it lives |
|----------|-------------|----------------|
| Email link (limited) | Preview | `release-preview/` — use the .exe / .dmg / .AppImage for each OS |
| Trial (full app, 14-day) | Full | `dist/` — same installer as paid |
| Paid (full app, license) | Full | `dist/` — same installer as trial; customer enters license after purchase |

---

## Building for other OSes

- **Windows → Mac/Linux:** Building Mac or Linux installers from a Windows machine usually requires a Mac for `.dmg` and a Linux env for `.AppImage`/`.deb`, or a CI pipeline (e.g. GitHub Actions) that runs on each OS.
- **Mac → Windows:** Building Windows installers from a Mac often works with Electron Builder; run `npm run electron:build:win` (or `electron:build:all`) on the Mac.

If you only have one OS, build that OS first (e.g. `electron:build:preview:win` and `electron:build:win` on Windows), then use another machine or CI for the other platforms.
