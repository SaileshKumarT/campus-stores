# 08 · Coherence review

**Verdict.** The plan holds together and can be built. The `ui`/`s` split is clean. The claim that no version bump is needed is true against `restore()`: new loan fields pass through `{ ...l }`, an old `editing` key is harmless, and Undo can never empty `s.loans` because the seeded L-401 can't be undone. The due/late logic gives the right badge at all three times, with and without "Plans changed". The wrong-type block stays reachable from the unfiltered plain form, and the 3-step story, sample data and Candidate brief are untouched. Undo semantics don't clash: any click clears the pending Undo, so a return, a lend and an update can never be undone across a tab change, a time advance or another row's panel. I found no blockers. There are two Major build traps: almost none of the new CSS will win against the existing `#campus-stores` rules, and the return panel's buttons have no defined way to find their loan. The rest are Minor wording, focus and edge-case fixes.

---

**R01 · New CSS rules lose to existing ID-scoped rules**
- **Severity:** Major
- **Where:** C02 step 3, C10 styles, C12 step 3, C13, C14, C01 step 4
- **Problem:** Every existing rule is scoped as `#campus-stores …` (specificity 1,x,x), but the plan writes bare selectors. The result:
  - `.tag.late` and `.tag.soon` lose to `#campus-stores .tag`, so late badges stay grey.
  - `.msg { margin }` loses to `#campus-stores p { margin: 0 }`.
  - `.linkbtn` loses to `#campus-stores button { background }`.
  - `[aria-invalid="true"]` loses to the select border rule.
  - `.row.late { padding-left }` loses to `#campus-stores .row { padding: 9px 0 }`.
  - C14's `.tag { font-size: 13px }` and `.statusbar { … }` don't apply.
  - `.shift .advance { max-width: 30ch }` loses to `#campus-stores .shift div { max-width: 67ch }`.
- **Fix:** Add to the top of C14: "Prefix **every** new or changed selector in this plan with `#campus-stores ` (for example `#campus-stores .tag.late`, `#campus-stores .msg`, `#campus-stores nav button[aria-current="page"]`, `#campus-stores .shift .advance`). Place them after the rules they override. Edit the existing `.tag`, `.statusbar` and `.statusbar button` rules in place instead of adding new ones."

**R02 · Return panel buttons have no loan number**
- **Severity:** Major
- **Where:** C01 Implementation steps 2–3
- **Problem:** The panel markup gives `confirm-return` and `not-this` no `data-val`, while C04 does give its buttons one. "Find `l`" is undefined. A literal build does `Number(v)` and gets `NaN`, so the headline Yes button silently does nothing. `not-this` also needs `l` for its message text.
- **Fix:** In C01 step 2 write: "both buttons carry `data-val = l.num`". In step 3 write: "`confirm-return` / `not-this`: `const l = s.loans.find((x) => x.num === Number(v));` stop if missing or `l.back`."

**R03 · C11 acceptance check fails on unchanged story text**
- **Severity:** Minor
- **Where:** C11 Acceptance check
- **Problem:** "No visible text contains 'issue'" fails, because Isha's unchanged Desk book message says "Please issue it in his name." A reloaded old save can also show the saved `s.notice` "…on slip L-402." in the status bar.
- **Fix:** Reword the check to: "no app-owned label, button, heading or message contains 'slip', 'issue', 'unit leaving' or a bare bin code (club messages in the Desk book and an old saved status line are exempt)."

**R04 · Nav labels show "undefined"**
- **Severity:** Minor
- **Where:** C11 Implementation
- **Problem:** Only the `"Loan register"` entry gets a third element. If `paint()` renders `label`, the other three tabs show "undefined".
- **Fix:** "Give all four `pages` entries a label: `["Requests","clipboard-list","Requests"]`, `["Inventory","package","Inventory"]`, `["Loan register","book-open","Loans"]`, `["Desk book","messages-square","Desk book"]`."

**R05 · `formError()` marks the wrong field and leaves a stale Undo**
- **Severity:** Minor
- **Where:** C10 Solution, submit order step 1
- **Problem:** For a unit that is out or in repair, `unit ? "who" : "asset"` marks **Who** instead of **Item**. Also, after a successful lend, a following blocked save overwrites the slot in the page, but `ui.msg` still holds the old lend Undo.
- **Fix:** Split step 1: "`!r || !unit || unit.repair || out(asset)` → field `"asset"`; `!people.includes(who)` → field `"who"`." Add as the first line of `formError()`: `ui.msg = null;`.

**R06 · Plain form has no hint element**
- **Severity:** Minor
- **Where:** C05 step 3, C06
- **Problem:** C06 writes the hint into `[data-duehint]` in the plain form, but C05 only adds that element to the request-first form. In the request-first form the hint is fixed as "From the request." even when `ui.keep.due` differs from `r.due`.
- **Fix:** C05 step 3: "Both forms render `<small data-duehint>` inside the Return by label. Its first text uses the same rule as the change handler: empty when there is no request, 'From the request.' when equal, otherwise 'The request says …'."

**R07 · Request-first header layout is unspecified**
- **Severity:** Minor
- **Where:** C05 Solution, request-first form
- **Problem:** The "For RQ-214 …" and "Still to lend …" lines have no stated place. If they go inside the 2-column `.form` grid, they take a single half-width cell.
- **Fix:** "Render the header lines as `<p>`s between `<form data-issue>` and `<div class="form">`, not inside the grid."

**R08 · "Cancel" in Plans changed sends focus to the wrong button**
- **Severity:** Minor
- **Where:** C01 step 3 `close-panel`, C13 table
- **Problem:** Cancel in the update panel sends focus to the row's **Return** button. Focus should go back to the **Plans changed** button that opened the panel.
- **Fix:** "`close-panel`: `const k = ui.panel?.kind === "update" ? "update" : "return"; ui.panel = null; ui.focus = '[data-action="' + k + '"][data-val="' + v + '"]';`". Update the C13 row to "that row's opening button".

**R09 · Screen-reader users skip the label check**
- **Severity:** Minor
- **Where:** C01 step 2, C13
- **Problem:** Focus jumps straight to the "Brought back by" select. A screen-reader user never hears "Check the label…" or the AD-12 line, which is the whole point of the panel.
- **Fix:** "Give the panel `role="group" aria-labelledby` pointing at the instruction `<p>` (id `panel-h`). Give the select `aria-describedby` pointing at the `.labelcheck` line (id `panel-unit`). Do the same for C04 with its intro line."

**R10 · Messages are announced twice**
- **Severity:** Minor
- **Where:** B5, C10
- **Problem:** An error slot has `role="alert"` and is also mirrored to the `aria-live` status bar. Success messages get focus and are also mirrored. Screen readers announce each message twice.
- **Fix:** In B5: "When `ui.focus` targets `[data-msg]`, or for `error`, don't also mirror to the status bar in the same paint. Alternatively, drop `role="alert"` from the slot and rely on focus plus the status bar." Pick one and state it.

**R11 · Undo tap target is too small on touch screens**
- **Severity:** Minor
- **Where:** C10 `.linkbtn`, C14
- **Problem:** `.linkbtn { min-height: 0 }` makes Undo a small target, against C14's 40/44px goal. Undo is the main recovery control.
- **Fix:** "`#campus-stores .linkbtn` keeps `min-height: 40px` (44px on coarse pointers). Only background, border and underline change."

**R12 · Caption breakpoint is ambiguous**
- **Severity:** Minor
- **Where:** C12 step 3
- **Problem:** "Under 650px" doesn't say whether to use a media query or the existing container query.
- **Fix:** "Put it inside the existing `@container (max-width:650px)` block."

**R13 · Moving time leaves the lend form open**
- **Severity:** Minor
- **Where:** C12 step 2
- **Problem:** `advance` clears `ui.panel` but not `ui.editing` or `ui.keep`. A form opened at 3:45 pm stays open at 7:30 pm with Kabir kept, which blurs the step boundary.
- **Fix:** "In `advance`, also set `ui.editing = false; ui.keep = null;`."

**R14 · Acceptance checks and walkthrough are slightly wrong**
- **Severity:** Minor
- **Where:** C01 acceptance, section 7 step 1 count
- **Problem:**
  - "No other row moves" is false: the open panel pushes the rows below it down.
  - "1 form, 5 choices" doesn't match the steps, which make 4 choices (PR-04, Kabir, SP-02, AD-12; Return by is prefilled).
- **Fix:** C01: "no other row changes order or closes." Section 7: "1 form, 4 choices and 3 saves."

**R15 · Two empty-state lines read wrong**
- **Severity:** Minor
- **Where:** C11 table, C05 request detail
- **Problem:**
  - "Every item is back on the shelf" is untrue, because PR-06 is in the workshop.
  - "Everything on this request has been lent." sits next to an "All back" badge on Saturday, which reads as a contradiction to a beginner.
- **Fix:** Empty Still out: "Nothing is out right now. Every lent item has come back." Detail line: "Every item on this request has been lent (see progress above)."
