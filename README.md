# Wazi — Property Verification MVP

**Verify a property before you pay.**

Wazi is an interactive prototype that lets anyone check whether a land or house
listing in Tanzania is real, safe and fairly priced **before** any money changes
hands. This is the TAREX demo build: it runs fully in the browser on **sample
data** for Dar es Salaam, Dodoma and Kilimanjaro — no server or build step needed.

> Demo with sample data. Records shown are illustrative, not real registry
> results. Wazi supports due diligence; it does not replace the land registry or
> legal advice.

---

## What the demo does

- **Search** by plot number, area, district, listing code or title-deed number.
- **Five verification checks** — owner identity, title deed, survey plan, disputes
  & mortgages, land use — each marked *Verified / Needs review / Flagged* with its
  source and date.
- **Score out of 100** with the official weights (owner 25, deed 25, disputes 20,
  survey 15, land use 15) and verdict bands: **85+ looks verified**, **60–84
  proceed with caution**, **below 60 high risk**.
- **Hard-stop rule** — a flagged owner, deed or dispute can never show “looks
  verified”, whatever the total.
- **Price check** — compares price per m² with the typical range (below / within /
  above market).
- **Plot map** — a simple boundary + pin and GPS on every report.
- **Report** — unique reference number, QR seal, plain next step and a legal
  disclaimer.
- **Share on WhatsApp** and **Download PDF** (browser print).
- **Guided demo** button — plays three sample reports in order (~60 seconds).
- **Request a verification** — returns a reference number to follow up.
- **English / Swahili** toggle and **one-tap feedback**.
- **Installable PWA** — works offline on weak networks after first load.

---

## Run it locally

It is plain HTML/CSS/JS, so just open `index.html`. For the service worker and
PWA install to work, serve over http:

```bash
# Python 3
python3 -m http.server 8080
# then open http://localhost:8080
```

---

## Deploy to GitHub Pages

1. Create a repository named **WAZI** (or reuse your existing one).
2. Put every file in this folder at the **root** of the repo, keeping the
   structure:

   ```
   index.html
   manifest.webmanifest
   sw.js
   .nojekyll
   css/styles.css
   js/i18n.js  js/data.js  js/app.js
   icons/icon.svg  icons/icon-192.png  icons/icon-512.png
   ```
3. Commit and push:

   ```bash
   git init
   git add .
   git commit -m "Wazi MVP — TAREX demo build"
   git branch -M main
   git remote add origin https://github.com/21tnyemo/WAZI.git
   git push -u origin main
   ```
4. On GitHub: **Settings → Pages → Build and deployment → Source: Deploy from a
   branch**, pick **main / root**, save.
5. Your live MVP will be at **https://21tnyemo.github.io/WAZI/** in a minute or two.

> The `.nojekyll` file tells GitHub Pages to serve the folders as-is.

---

## Try these samples

| Search | Region | What it shows |
|--------|--------|---------------|
| `124` or `Mbezi` | Dar es Salaam | Clean, looks verified |
| `7` or `Mikocheni` | Dar es Salaam | Caution — power of attorney + mortgage |
| `88` or `Nzuguni` | Dodoma | Caution — land-use permit needed |
| `310` or `Ihumwa` | Dodoma | Agricultural zoning flag |
| `14` or `Machame` | Kilimanjaro | High risk — deed + boundary dispute |
| `22` or `Kiboriloni` | Kilimanjaro | Clean, looks verified |

---

## Project structure

- `index.html` — layout and mounts.
- `css/styles.css` — full styling, responsive + print (PDF) rules.
- `js/i18n.js` — English & Swahili strings.
- `js/data.js` — sample dataset + search helper.
- `js/app.js` — scoring, verdict, price check, report rendering, PWA.
- `sw.js`, `manifest.webmanifest`, `icons/` — PWA / offline support.

## Roadmap (from the full requirements)

Real document upload + OCR, human verification console, accounts & payments
(mobile money), agent trust profiles, and official integrations (Ministry of
Lands, BRELA, NIDA, TRA, banks, courts) once data-sharing agreements are signed.

---

**Contact** — Nyemo Ramadhani Tuppa · EASTC · 0780345989 · tuppanyemo@gmail.com
