# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
# Serve locally (http://localhost:3456/appian-cert-pwa)
npm start

# Live-reload during development (opens browser automatically)
npm run dev

# Run Playwright test suite (requires headless browser at /opt/pw-browsers)
PLAYWRIGHT_BROWSERS_PATH=/opt/pw-browsers node verify.js

# Without npm: Python fallback
python -m http.server 3456
```

## Architecture

**Everything lives in a single file: `appian-cert-pwa.html`** — HTML, CSS, and JS are all inline. There is no build step, no bundler, no framework. Changes go directly into that one file.

### Data layer (`_D` object, line ~182)

All app content is in the constant `_D` at the top of the `<script>` block:
- `_D.CONTENT` — lesson body HTML keyed by lesson ID (e.g. `"1.1"`, `"3.2"`)
- `_D.CHAPTERS` — array of 8 chapters, each with `lessons[]` (quiz questions), `cQuiz[]` (chapter test), `docs` URL, `map`, `summary`
- `_D.EXAM` — flat array of 112 exam questions `{q, opts[], ans}` (0-indexed answer)
- `_D.ACHS` — achievement definitions

These are aliased at lines 234–237: `const CONTENT`, `const CH`, `const EXAM`, `const ACHS_DEF`.

### State management

Two `localStorage` keys:
- `apc_v8` — user progress: `{xp, streak, ls[] (lesson IDs), ch[] (chapter IDs), earned[], ea (exam attempts), ep (passed), gDone, notif, ...}`. Loaded by `loadS()`, saved by `saveS()`.
- `apc_uq` — community questions contributed via the SHARE tab. Loaded into `UQ[]` array. Managed by `saveUQ()` / `loadUQ()`.

### Screen rendering

The HTML has 6 empty `<div class="screen">` elements (`#s-home`, `#s-road`, `#s-learn`, `#s-ai`, `#s-exam`, `#s-contrib`). Navigation calls `go(tab)` (line 312) which toggles the active screen and calls the render function for that tab.

| Tab | Nav `data-t` | Render function |
|-----|-------------|-----------------|
| Home | `home` | `rHome()` |
| Roadmap | `road` | `rRoad()` |
| Learn | `learn` | `rLearn()` → `oCh(id)` → `oLs(chId, lsId)` |
| AI Tutor | `ai` | `rAI()` |
| Exam | `exam` | `rExam()` → `renderEX()` |
| Share | `contrib` | `rContrib()` |

All render functions build innerHTML strings and set `sc.innerHTML = h`. No virtual DOM.

### Quiz engine (line ~345)

`startQuiz(qs, containerId, onDone, title)` renders an interactive quiz into any container div. Used for both lesson quizzes and chapter tests. State is stored in `QS[containerId]`.

### Exam flow (line ~880)

`stEX()` → shuffles `EXAM.concat(UQ)` to 60 questions, starts countdown timer → `renderEX()` renders current question → `exP(i)` records answer → `exN(d)` navigates → `subEX()` calculates score and shows result. State in the `EX` object: `{ph: 'intro'|'exam'|'result', qs[], ans{}, cur, left, tmr}`.

### Key CSS classes

`.qopt` — quiz/exam answer buttons; `.qopt.sel` — selected; `.qopt.correct` / `.qopt.wrong` — after reveal. `.qtext` — question text. `#ex-t` — exam timer. `.ci` — text input fields in SHARE form. `.btn.bp` — primary orange button. `.card` — card container.

### Doc link base URL

All Appian documentation links use `https://docs.appian.com/suite/help/26.4/`. When updating lesson `docs` fields, use this base. Broken URL patterns to avoid: `Appian_Designer`, `Deployment.html`, `Working_with_Data`, `Read-Only_Grid`, `Object_Security.html`, `Appian_AI_Overview`, `Appian_RPA`.

### Adding exam questions

Append to the `"EXAM":[...]` array inside `_D` (ends just before `],"ACHS":`). Format: `{"q":"...","opts":["A","B","C","D"],"ans":N}` where `ans` is 0-indexed. Validate with the EXAM JSON check in `verify.js`.

### Testing

`verify.js` drives the app with Playwright (Chromium). All 6 tabs are exercised end-to-end. Key selectors: `#s-home .sg` (stats), `.card` (chapter/lesson cards with `onclick` containing `oCh`/`oLs`), `.qopt` (quiz options), `[onclick="stEX()"]` (exam start), `#ex-t` (timer), `#cq-q` (SHARE textarea), `.ans-btn` (answer selector). After `cqAns()` is called, the SHARE form re-renders — always re-fetch DOM references.
