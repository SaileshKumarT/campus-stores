# Campus Stores · Planned changes

**Purpose.** This is a full usability overhaul of Campus Stores, the offline practice app for a campus equipment desk. It makes every tab easier for a first-time student, makes every common mistake fixable, and records what really happens at a counter. It stays a small vanilla HTML/CSS/JS app with no build step that works offline.

**Target user.** A student staff member with basic computer skills and no store training.

**Why these changes.** The reasons, the debate and the ruling on each of the 53 ideas are in [audit/07-verdict.md](audit/07-verdict.md).

**Files touched.** `app.js`, `index.html`, `styles.css`. Nothing else. The sample data (`requests`, `assets`, `people`), the story text in `shifts`, and the Candidate brief stay as they are.

---

## 1. Headline change

**The problem: Saturday 9:00 am, Leela walks in with an adapter.**
- The Loans list shows "L-404 · AD-12" with one "Record return" button. The slip doesn't say what AD-12 is (Belkin) or where it lives (bin C4). AD-15, an Anker adapter, sits in the same bin.
- One click closes the loan: "AD-12 returned to stock. Slip L-404 closed." The app never asks which physical item was handed in. There is no confirmation and no Undo.
- Afterwards, All slips just says "Returned", with no time and no name.
- If the item in Leela's hand were AD-15, the app would now say AD-12 is on the shelf while it's still missing. The only fix is "Restart sample shift", which throws away the whole shift.

The same one-click close at Friday 7:30 pm means a fast second click can close the wrong row, because the rows move up.

**The change.** "Return AD-12" opens a small check panel **inside that row**:

> **Check the label on the item in your hand.** This loan is for:
> **AD-12 · USB-C → HDMI adapter · Belkin AVC002**
> Brought back by: [Leela Das ▾]
> [**Yes, it says AD-12**] [Not this item]

Nothing closes until the user presses **Yes**. The app then records when the item came back and who brought it, and says: "AD-12 (Belkin AVC002) is back. Put it on shelf C4. Loan L-404 closed. [Undo]". **Not this item** leaves the loan open and says so.

**Why.**
- **It is easy for a beginner.** A memory-and-cross-checking task becomes "read the sticker and press the matching button".
- **It makes mistakes easy to correct.** The wrong-unit mistake is stopped before it is saved, and Undo replaces Restart as the fix.
- **It fits a real counter.** The desk learns who brought the item back and when (pain point 10).
- **It is simple to build.** It uses one panel pattern, one new click case group and two optional loan fields, with no version bump.

---

## 2. What we keep and why

| Keep | Why |
|---|---|
| **The "handles well" moment: the wrong-type block** (CA-03 can't go out on RQ-214) | It is the clearest strength in the shift. It stays in the submit handler as a backstop and can still be reached from the plain "Lend an item" form (that list is not filtered). The block now shows **next to the Save button** in plain words, instead of in a 12px footer. |
| Second-unit-of-type block | It stops a second speaker going out on RQ-214. It stays in the submit handler as a backstop and gets a clearer message. |
| The form keeps its values after a blocked save | Errors are still written into the page **without repainting**. |
| One loan per physical unit | The sticky form still creates one loan per item, so a split return can still be shown. |
| In-repair and on-loan units hidden from the item list | The `available` filter stays. PR-06 and MI-09 never appear. |
| Required selects | Empty saves stay impossible. |
| The 3-step, one-way time control | The same 3 steps and the same button. There is no step back. Only a caption is added. |
| Story text in the shift bar, sample data, Candidate brief | Unchanged. `shifts` gains two display-only fields (`at`, `caption`). |
| Restart sample shift | Unchanged. It is still the full reset, and it also clears the new temporary UI state. |
| Status bar with `aria-live="polite"` | It stays and mirrors every message that does not take focus or show as an inline error (B5), so nothing is announced twice. |
| 4 tabs and one row pattern | No new tabs or panels above the page. Rows still use `row()`. |
| One storage key, `version: 1`, strict `restore()` | No version bump. New loan fields are optional and checked (section 5). |
| No pre-answers | There is no "allowed to collect" list, no "looks the same" warning, no task checklist and no summary card. The candidate still has to read the Desk book, the request note and the label. |

---

## 3. Shared building blocks (do these first)

Several changes use these. Build them once.

### B1 · Temporary UI state lives outside `s`
- **app.js**: after `let s = original();` add:
  ```js
  const freshUi = () => ({ msg: null, panel: null, editing: false, keep: null, focus: "" });
  let ui = freshUi();
  ```
  - `ui.msg`: `null` or `{ kind: "ok" | "error" | "warn", text, undo }`. `undo` is `null` or `{ type: "return" | "lend" | "update", num, prev }`.
  - `ui.panel`: `null` or `{ num, kind: "return" | "update" }`. Only one panel can be open.
  - `ui.editing`: `false` (form closed), `true` (plain "Lend an item" form), or a request ID such as `"RQ-214"` (request-first form).
  - `ui.keep`: `null` or `{ who, due }`. These are the values to preselect in the sticky form.
  - `ui.focus`: a CSS selector to focus after the next `paint()`.
- **Remove `editing` from `original()`.** Replace every `s.editing` with `ui.editing` (in `register()`, the `tab`, `new` and `cancel` cases, and the submit handler).
- `commit()` still saves only `s`, so **nothing in `ui` is ever saved**.
- In the click handler, the `restart` case becomes `s = original(); ui = freshUi(); ui.focus = "[data-page] h2";`.

### B2 · Time lookup
- **app.js**, next to `shifts`:
  ```js
  const dueHours = { "Fri 8 pm": 20, "Sat 9 am": 33, "Sat 10 am": 34, "Sat noon": 36 };
  const dueTimes = Object.keys(dueHours);
  ```
- Add `at` to each shift: `at: 15.75`, `at: 19.5`, `at: 33`.
- Add a helper:
  ```js
  function dueState(l) {
    const now = shifts[s.phase].at, h = dueHours[l.due];
    if (l.back || h === undefined) return "";
    if (h < now) return "late";
    return Math.floor(h / 24) === Math.floor(now / 24) ? "today" : "";
  }
  const returnedLate = (l) =>
    l.back && Number.isInteger(l.backAt) && shifts[l.backAt].at > (dueHours[l.due] ?? 99);
  ```
- Replace the literal `["Fri 8 pm", "Sat 9 am", "Sat 10 am", "Sat noon"]` in `register()` with `dueTimes`.

### B3 · Item text helpers
```js
const where = (a) => (a.bin === "Workshop" ? "in the workshop" : "shelf " + a.bin);
const unitText = (a) => a.id + " · " + a.type + " · " + a.model + " · " + where(a);
const typeOf = (l) => getAsset(l.asset).type;
```

### B4 · Helpers that take more arguments
- `opts(list, chosen = "")`: add `(v === chosen ? " selected" : "")` inside each `<option>`.
- `row(label, sub, right, extra = "", cls = "")`: output `<div class="row CLS">…<div class="actions">RIGHT</div>EXTRA</div>`. `extra` is raw HTML shown full width under the row (used for panels).
- `badge(t, kind = "")`: `kind` is `"good" | "late" | "soon" | ""`. It outputs `class="tag KIND"`. Change the existing call in `inventory()` from `status === "On shelf"` to `status === "On shelf" ? "good" : ""`.
- `head(title, sub, control)`: give the `<h2>` `tabindex="-1"` (used for focus, C13).

### B5 · The single message slot
```js
const msgSlot = () =>
  ui.msg
    ? '<p class="msg ' + ui.msg.kind + '" data-msg tabindex="-1"' +
      (ui.msg.kind === "error" ? ' role="alert"' : "") + ">" + esc(ui.msg.text) +
      (ui.msg.undo ? " " + btn("Undo", "undo", "", "linkbtn") : "") + "</p>"
    : '<p class="msg" data-msg tabindex="-1" hidden></p>';
```
- Every screen renders `msgSlot()` **once**: directly under `head(…)`, or, while the issue form is open, directly above its Save button (C10).
- `commit(msg)`: after `if (msg) s.notice = msg;` add `if (ui.msg) s.notice = ui.focus === "[data-msg]" ? "" : ui.msg.text;`. Set `ui.msg` and `ui.focus` **before** calling `commit()`.
- **No double announcements (chosen rule).** When `ui.focus` targets `[data-msg]`, the focused slot is read out, so the status bar is **not** also given the text in the same paint (it is emptied, which is silent). Errors keep `role="alert"` on the slot and are **not** mirrored to the status bar either (`formError()` empties it). Only a message that neither takes focus nor is an error (for example a lend that keeps the form open, with focus on the item select) is mirrored to the status bar.
- In the click handler, right after `const v = b.dataset.val;` add `const act = b.dataset.action; if (act !== "undo") ui.msg = null;` and switch on `act`. **Rule: Undo and any message last until the user does something else.**

### B6 · Focus after paint
At the end of `paint()`:
```js
if (ui.focus) { const el = q(ui.focus); ui.focus = ""; if (el) el.focus(); }
```

---

## 4. Changes

### Loans and returns

#### C01 · Return check panel with Undo (headline)
- **Source IDs:** UI-05, WF-05, RL-01, RL-02, RL-03, BG-09 (plus UI-09 for the button label).
- **Problem:** Return is one click, with no check of which item came back, no confirmation, no undo, and no record of who or when (pain points 6, 7, 9, 10).
- **Solution:**
  - Each open loan row has the button **"Return AD-12"** (the item ID is in the label).
  - Clicking it opens a panel inside that row. Only one panel can be open at a time, and opening another closes the first. While a row's panel is open, that row's two buttons are hidden.
  - The panel shows:
    - "**Check the label on the item in your hand.** This loan is for:"
    - a large line: **"AD-12 · USB-C → HDMI adapter · Belkin AVC002"**
    - "Brought back by" [select of `people`, preselected with `l.who`]
    - buttons [**Yes, it says AD-12**] (primary) and [Not this item]
  - **Yes:** sets `l.back = true`, `l.backAt = s.phase`, and `l.backBy` = the chosen person (or `l.who` if the value is not in `people`). Closes the panel. The message (`ok`) says "AD-12 (Belkin AVC002) is back. Put it on shelf C4. Loan L-404 closed." with [Undo]. For PR-06-style items the wording is "Put it in the workshop".
  - **Not this item:** closes the panel and changes nothing. The message (`warn`) says "Nothing changed. Loan L-404 is still open. It is for AD-12 (Belkin AVC002). Don't take a different item as this return; ask where AD-12 is."
  - **Undo** (until the next action) sets `back = false` and deletes `backAt` and `backBy`. The message (`ok`, no Undo) says "Undone. Loan L-404 is open again."
- **Implementation:**
  1. `register()`, open-row branch: build `right` as `badge(...)` (C02) plus, when `!(ui.panel && ui.panel.num === l.num)`, the two buttons `btn("Return " + l.asset, "return", l.num)` and `btn("Plans changed", "update", l.num)` (C04).
  2. `register()`: when `ui.panel && ui.panel.num === l.num && ui.panel.kind === "return" && !l.back`, pass this `extra` to `row()`. **Both buttons carry `data-val = l.num`.**
     ```html
     <div class="panel" data-panel role="group" aria-labelledby="panel-h">
       <p id="panel-h"><b>Check the label on the item in your hand.</b> This loan is for:</p>
       <p class="labelcheck" id="panel-unit">AD-12 · USB-C → HDMI adapter · Belkin AVC002</p>
       <div class="form"><label><span>Brought back by</span>
         <select data-backby aria-describedby="panel-unit">…opts(people.map(p=>[p,p]), l.who)…</select></label></div>
       <div class="buttons">[Yes, it says AD-12 → data-action="confirm-return" data-val="404"] [Not this item → data-action="not-this" data-val="404"]</div>
     </div>
     ```
     Escape all text with `esc()`. Only one panel is open at a time, so the fixed ids `panel-h` / `panel-unit` are unique.
  3. Click switch: **replace** the old `return` case with:
     - `return`: `ui.panel = { num: Number(v), kind: "return" }; ui.focus = "[data-panel] select";`
     - `confirm-return` / `not-this`: first `const l = s.loans.find((x) => x.num === Number(v));` and stop if missing or `l.back`.
     - `confirm-return`: read `q("[data-backby]").value`, stamp the fields, set `ui.panel = null`, set `ui.msg` as above with `undo: { type: "return", num: l.num }`, and set `ui.focus = "[data-msg]"`.
     - `not-this`: `ui.panel = null; ui.msg = { kind: "warn", text: …(uses l)…, undo: null }; ui.focus = "[data-msg]";`
     - `close-panel` (shared with C04): `const k = ui.panel?.kind === "update" ? "update" : "return"; ui.panel = null; ui.focus = '[data-action="' + k + '"][data-val="' + v + '"]';` (focus goes back to the button that opened the panel).
     - `undo`: see C10.
  4. **styles.css** (all selectors prefixed `#campus-stores`, see C14): `#campus-stores .panel` (full width `grid-column: 1 / -1`, `background: var(--desk)`, `border-left: 3px solid var(--sel)`, padding 10px 12px, `display: grid; gap: 8px`); `#campus-stores .labelcheck` (16px, weight 700, `font-variant-numeric: tabular-nums`); `#campus-stores .msg.warn` (see C10).
- **State/storage:** adds optional loan fields `backAt` (a phase index 0–2) and `backBy` (a name in `people`). `ui.panel` is not saved. `restore()` checks these fields (section 5).
- **Acceptance check:**
  - At Fri 7:30 pm, press "Return PR-04". The panel opens inside the L-402 row and no other row changes order or closes.
  - Press "Yes, it says PR-04". L-402 leaves "Still out", the message shows the shelf A2 hint and Undo, and focus is on the message (the status bar is not given the same text, per B5).
  - Press Undo. L-402 is back in "Still out".
  - "Not this item" leaves the loan open with the warn text.
  - Reload during an open panel: the panel is gone and the loans are unchanged.

#### C02 · Late / due-today badges and a fixed order
- **Source IDs:** UI-02, UI-03, WF-09, RL-04, BG-08.
- **Problem:** At Sat 9 am, L-404 (due Fri 8 pm, 13 h late) looks the same as L-401 (due Sat 10 am). The list is newest-first, so the oldest loan sinks (pain point 8).
- **Solution:**
  - For open loans, `dueState(l)` gives:
    - `"late"`: badge **"Late · was due Fri 8 pm"** (kind `late`), plus row class `late` (red left edge).
    - `"today"`: badge **"Due today · Sat 10 am"** (kind `soon`).
    - `""`: no badge (the due time is still in the row text).
  - "Still out" lists open loans **oldest due first, then by loan number**. This order is fixed, so closing a row never reorders the others.
  - "All loans" lists the open loans (same order) followed by the returned loans, most recent return first.
  - A returned row has badge "Returned", or "Returned late" (kind `late`) when `returnedLate(l)`. Its sub text ends with "returned Saturday · 9:00 am by Leela Das" (just "returned" when old saves have no `backAt`), plus "· late" when late.
- **Implementation:**
  1. `register()`: replace `const shown = s.loans.filter(...).slice().reverse();` with:
     ```js
     const order = (a, b) => (dueHours[a.due] ?? 99) - (dueHours[b.due] ?? 99) || a.num - b.num;
     const open = s.loans.filter((l) => !l.back).sort(order);
     const done = s.onlyOpen ? [] : s.loans.filter((l) => l.back)
       .sort((a, b) => (b.backAt ?? -1) - (a.backAt ?? -1) || b.num - a.num);
     const shown = [...open, ...done];
     ```
     (`filter` returns a new array, so `s.loans` is never reordered.)
  2. Per row: `const st = dueState(l);` gives the badge text and kind as above, and `cls = st === "late" ? "late" : ""`.
  3. **styles.css:** in `#campus-stores` add `--late: light-dark(#8a2c12, #ffd2c2); --latebg: light-dark(#fbe3dc, #4a2a22);`. After the existing `#campus-stores .tag` and `#campus-stores .row` rules add `#campus-stores .tag.late { background: var(--latebg); color: var(--late); font-weight: 600 }`, `#campus-stores .tag.soon { background: var(--memo); color: var(--memotxt) }`, and `#campus-stores .row.late { border-left: 4px solid var(--late); padding-left: 8px }`.
- **State/storage:** none (derived).
- **Acceptance check:**
  - At Fri 3:45 pm, after issuing, L-402/403/404 show "Due today · Fri 8 pm" and L-401 has no badge.
  - At Sat 9 am, if L-404 was not updated, it shows "Late · was due Fri 8 pm" with a red edge and is listed first. L-401 shows "Due today · Sat 10 am".
  - Returning L-404 at Sat 9 am without an update shows "Returned late" in All loans.

#### C03 · Item details on every loan row, and clear button labels
- **Source IDs:** UI-04, BG-07, UI-09.
- **Problem:** A row shows only "L-404 · AD-12". The model and bin are only on Inventory, and every row has the same "Record return" button (pain points 7, 9).
- **Solution:**
  - Title: **"AD-12 · USB-C → HDMI adapter"**.
  - Sub for an open loan: **"Loan L-404 · Belkin AVC002 · shelf C4 · Film Society (RQ-214) · with Kabir Sen · due Fri 8 pm"**. When `l.was` exists, add **" (was Kabir Sen · due Fri 8 pm)"**.
  - Sub for a returned loan: "Loan L-402 · BenQ MH550 · shelf A2 · Film Society (RQ-214) · returned Friday · 7:30 pm by Kabir Sen".
  - Buttons: "Return AD-12" and "Plans changed". Badges stay flat and are never buttons.
  - **There is no look-alike warning.**
- **Implementation:** in `register()`, build `label = l.asset + " · " + a.type` and the sub from `a.model`, `where(a)`, `getReq(l.req).club`, `l.req`, `l.who`, `l.due` and `l.was`. `row()` already escapes the label and sub.
- **State/storage:** none.
- **Acceptance check:** at Sat 9 am the L-404 row shows Belkin AVC002 and shelf C4 without opening Inventory, and its button reads "Return AD-12".

#### C04 · "Plans changed" on an open loan
- **Source IDs:** WF-07, RL-05.
- **Problem:** At 7:30 pm, Kabir says Leela has the adapter and will bring it Sat 9 am. L-404 can't be changed, so at 9 am it shows the wrong person and time (pain point 11).
- **Solution:**
  - "Plans changed" opens the same in-row panel pattern with:
    - "**Plans changed?** Record who has it now and when it will come back."
    - "Now with" [people, preselected with `l.who`]
    - "Expected back" [`dueTimes`, preselected with `l.due`]
    - the fact line "Request says: return by Fri 8 pm." (from `getReq(l.req).due`)
    - [**Save change**] (primary) and [Cancel]
  - **Save change:**
    - If nothing changed, close the panel. The message (`ok`) says "Nothing changed."
    - Otherwise, set `prev = { who: l.who, due: l.due, was: l.was ? { ...l.was } : undefined }`. If `!l.was`, set `l.was = { who: l.who, due: l.due }`. Then set `l.who` and `l.due`. If the new values equal `l.was`, delete `l.was`.
    - The message (`ok`) says "Loan L-404 updated: now with Leela Das, expected back Sat 9 am." with [Undo] (`undo: { type: "update", num, prev }`).
  - **Cancel:** the `close-panel` case.
- **Implementation:**
  1. `register()`: when `ui.panel.kind === "update"` for this row, render the panel with `<select data-newwho>` and `<select data-newdue>`, and buttons `save-update` and `close-panel`, each with `data-val = l.num`. As in C01, the panel gets `role="group" aria-labelledby="panel-h"` with `id="panel-h"` on its intro line ("Plans changed? …"), and both selects get `aria-describedby="panel-unit"` pointing at a line naming the item (`id="panel-unit"`, e.g. "AD-12 · USB-C → HDMI adapter · Belkin AVC002").
  2. Click switch:
     - `update`: `ui.panel = { num: Number(v), kind: "update" }; ui.focus = "[data-panel] select";`
     - `save-update`: as above. Accept the values only if they are in `people` and `dueHours`, otherwise do nothing. Then `ui.panel = null; ui.focus = "[data-msg]";`
  3. The "Brought back by" in C01 now preselects the updated holder automatically, because it reads `l.who`.
- **State/storage:** adds the optional loan field `was: { who, due }`, checked in `restore()`.
- **Acceptance check:**
  - At Fri 7:30 pm, open "Plans changed" on L-404, choose Leela Das and Sat 9 am, and save. The row reads "with Leela Das · due Sat 9 am (was Kabir Sen · due Fri 8 pm)".
  - Undo restores Kabir and Fri 8 pm and removes the "(was …)" text.
  - At Sat 9 am L-404 shows "Due today · Sat 9 am", and its return panel preselects Leela Das.

### Issuing

#### C05 · "Lend items for this request" with a sticky form
- **Source IDs:** WF-01, WF-04, UI-08.
- **Problem:** Issuing RQ-214 took 3 blank forms and 12 choices. The item list showed every unit, and the request view was a dead end (pain points 1, 3).
- **Solution:**
  - **Request detail:** a primary button **"Lend items for this request"**. It appears when `toLend(r)` is not empty; otherwise the detail shows the line "Every item on this request has been lent (see progress above)."
    ```js
    const toLend = (r) => r.items.filter((t) => !s.loans.some((l) => l.req === r.id && typeOf(l) === t));
    ```
  - **The button** switches to the Loans tab with `ui.editing = r.id` and `ui.keep = null`.
  - **Request-first form** (`typeof ui.editing === "string"`):
    - A hidden input `name="req"` holds the request ID.
    - Render the header lines below as `<p>`s between `<form data-issue>` and `<div class="form">`, not inside the grid.
    - A header line: "**For RQ-214 · Film Society · Courtyard screening**", then the small line "Still to lend: Portable speaker, USB-C → HDMI adapter". If a type still to lend has no free unit, add "Not on the shelf right now: HDMI projector."
    - "Item to hand over": only `available` units whose type is in `toLend(r)`, labelled with `unitText(a)`.
    - "Who is taking it?": `people`, preselected with `ui.keep?.who`.
    - "Return by": `dueTimes`, preselected with `ui.keep?.due || r.due`, with the hint (C06).
    - The message slot sits above the button **"Lend this item"**.
  - **Plain form** ("Lend an item", `ui.editing === true`): today's form, with the "Club request" select (`[r.id, r.id + " · " + r.club + " · " + r.event]`) and **all** available units, labelled with `unitText(a)`, **not filtered**. This keeps the wrong-type block reachable.
  - **After a successful lend** (both forms):
    - `ui.keep = { who, due }`.
    - `ui.editing = toLend(r).length ? r.id : false`. The plain form therefore becomes the request-first form, and the form closes when nothing is left.
    - The message (`ok`) says "PR-04 (BenQ MH550) lent to Kabir Sen, due back Fri 8 pm. Loan L-402." If nothing is left, add " All 3 items on RQ-214 are now out." The message has [Undo] (`undo: { type: "lend", num }`).
  - The head control while the form is open is `btn("Close form", "cancel")`.
- **Implementation:**
  1. `requestPage()` detail: add the button `btn("Lend items for this request", "lend-for", r.id, "primary")` or the "Every item…" line.
  2. Click switch:
     - `lend-for`: `s.tab = "Loan register"; ui.editing = v; ui.keep = null; ui.panel = null; ui.focus = '[data-issue] select[name="asset"]';`
     - `new`: `ui.editing = true; ui.keep = null; ui.panel = null; ui.focus = "[data-issue] select";`
     - `cancel`: `ui.editing = false; ui.focus = '[data-action="new"]';`
     - `tab`: also `ui.editing = false; ui.panel = null;`
  3. `register()` form branch: a local `select(label, key, options, chosen = "", after = "")` that uses `opts(options, chosen)` and appends `after` (the hint) inside the `<label>`. **Both forms** render `<small data-duehint>` inside the Return by label. Its first text uses the same rule as the C06 change handler: empty when there is no request, "From the request." when the chosen due equals `r.due`, otherwise "The request says … You can still choose a different time." Build either form as described, and put `msgSlot()` **between** `</div>` (end of `.form`) and the submit button.
  4. Submit handler `[data-issue]`: read `req`, `asset`, `who` and `due` exactly as today (the hidden input has the same name). Keep both guard-rail checks in the same order, using C10's `formError()` for messages. On success, push the loan as today, then set `ui.keep`, `ui.editing`, `ui.msg` and `ui.focus` (`'[data-issue] select[name="asset"]'` if the form stays open, else `"[data-msg]"`), and call `commit()`.
- **State/storage:** `ui.editing` and `ui.keep` are temporary, never saved. Loans are unchanged in shape.
- **Acceptance check:**
  - From RQ-214, press "Lend items for this request". The item list shows only PR-04, SP-02, SP-05, AD-12 and AD-15, with models and shelves.
  - Lend PR-04 to Kabir. The form stays open with Kabir and Fri 8 pm kept and the projector gone from the list.
  - After the third item, the form closes with "All 3 items on RQ-214 are now out."
  - From "Lend an item", choose RQ-214 + CA-03 + Kabir and press "Lend this item". The wrong-type message appears above the button and the values stay.

#### C06 · Prefilled "Return by" with a hint
- **Source IDs:** WF-03 (the prefill half; the authorised list is rejected).
- **Problem:** Return by was blank even though the request says Fri 8 pm (pain point 2).
- **Solution:**
  - Request-first form: preselect from the request (or from `ui.keep.due`). Under the select show `<small data-duehint>` with the first text from C05 step 3 ("From the request." only when it equals `r.due`). The plain form has the same element (C05 step 3).
  - Plain form: when "Club request" changes, set "Return by" to that request's time and show "From the request." with no repaint.
  - If the user changes "Return by" to a different time, the hint says "The request says Fri 8 pm. You can still choose a different time." It is never blocked.
- **Implementation:** in the `change` handler, add:
  ```js
  const f = e.target.form;
  if (f && f.matches("[data-issue]")) {
    e.target.removeAttribute("aria-invalid");
    const r = getReq(f.elements.req.value), hint = f.querySelector("[data-duehint]");
    if (e.target.name === "req" && r) f.elements.due.value = r.due;
    if (hint) hint.textContent = !r ? "" : f.elements.due.value === r.due
      ? "From the request." : "The request says " + r.due + ". You can still choose a different time.";
  }
  ```
  No `commit()` is needed: nothing in `s` changes.
- **State/storage:** none.
- **Acceptance check:** in the plain form, choosing RQ-209 sets Return by to Sat 10 am. Changing it to Sat noon shows the "request says" hint.

### Requests

#### C07 · Request progress
- **Source IDs:** UI-07, WF-10, RL-12, BG-12.
- **Problem:** RQ-214 says "Approved" all shift. Nothing shows what is out or back (pain point 13).
- **Solution:**
  - **List rows:** title = event. Sub = "RQ-214 · Film Society · return by Fri 8 pm". Right = progress badge + "View request".
  - **Badge rules** (n items; out = items whose latest loan is open; back = items whose latest loan is closed):
    - out = 0 and back = 0: "Not started".
    - out > 0: "2 of 3 out", or "1 of 3 still out" when back > 0. Kind `late` if any open loan on the request is late.
    - back = n: "All back" (kind `good`).
    - otherwise: "1 of 3 back · 2 not lent".
  - **Detail:** keep "RQ-214 · Approved". Add the badge, and replace the plain items `<ul>` with one line per item:
    - not lent: "HDMI projector — not lent yet"
    - out: "USB-C → HDMI adapter — AD-12 (Belkin AVC002) with Leela Das, due Sat 9 am · loan L-404", plus a Late badge if late
    - back: "HDMI projector — PR-04 back Friday · 7:30 pm from Kabir Sen · loan L-402". The time and name are left out if the old save lacks them.
  - The note and the rest of the detail stay as they are.
- **Implementation:** add `progress(r)`, which returns `r.items.map(type => ({ type, l: latest loan of that type on r.id (highest num) }))`, and `progressBadge(r)` per the rules. Use both in `requestPage()`. Rename "View form" → "View request" and "Back to list" → "← All requests".
- **State/storage:** none (derived).
- **Acceptance check:**
  - At the start, RQ-214 reads "Not started" and RQ-209 "1 of 1 out".
  - After Friday's returns, RQ-214 reads "1 of 3 still out".
  - After the Saturday return, it reads "All back", and the adapter line says "back Saturday · 9:00 am from Leela Das".

### Inventory

#### C08 · Inventory wording, loan number, and empty filter
- **Source IDs:** BG-01, UI-11, BG-06 (and a cheap factual stand-in for RL-13).
- **Problem:** The bin shows as a bare "C4". An on-loan item doesn't say which loan it's on. A filter with no matches shows a blank area.
- **Solution:**
  - Sub: "BenQ MH550 · shelf A2", and "Epson EB-X49 · in the workshop" for the Workshop bin.
  - The on-loan badge reads "On loan · L-404".
  - Head sub: "Every physical item, where it lives, and whether it's here."
  - Empty filter: `<p class="empty">No items are "On loan" right now. Choose "All items" to see everything.</p>`, using the chosen filter's name.
- **Implementation:** in `inventory()`, use `where(a)`. Badge text is `status === "On loan" ? "On loan · L-" + out(a.id).num : status`. Count the rows shown and add the empty line when the count is 0. In the `change` handler, for the filter, set `ui.focus = "[data-filter]"` before `commit()`.
- **State/storage:** none.
- **Acceptance check:**
  - At Sat 9 am, Inventory shows AD-12 "On loan · L-404" and AD-15 "On shelf", both "shelf C4".
  - After the return, filtering "On loan" shows only MI-09.
  - Focus stays on the filter after changing it.

### Desk book

#### C09 · Desk book note form and labels
- **Source IDs:** BG-06, BG-01 (UI-12 linking is Later).
- **Problem:** Handover notes are signed "Counter handover", the box gives no hint, and "Handover note saved." appears only in the footer.
- **Solution:**
  - The author label for staff notes becomes **"Handover note"**.
  - The textarea has `rows="3"` and the placeholder "Which item, who has it, when it will come back, and the loan number."
  - The button is **"Save note"**.
  - After saving, the message slot (`ok`) under the heading says "Note saved. The next shift will see it at the top of the Desk book."
  - Club messages are unchanged.
- **Implementation:** in `deskbook()`, render `msgSlot()` after `head()`, use the new label, placeholder and button text, and change `"Counter handover"` to `"Handover note"`. In the submit handler `[data-note]`, set `ui.msg = { kind: "ok", text: …, undo: null }; ui.focus = "[data-msg]";` and call `commit()` (drop the string argument).
- **State/storage:** none (notes keep `{phase, text}`).
- **Acceptance check:** save a note at 7:30 pm. It appears at the top as "Handover note · Friday · 7:30 pm", and the message shows under the heading.

### Messages and feedback

#### C10 · One message slot: inline errors, success, and Undo for return, lend and update
- **Source IDs:** UI-01, WF-11, BG-03, BG-05, RL-03 (Undo), RL-08 (only the "undo last lend" part).
- **Problem:** Errors and successes appear only in a 12px footer, far from the button. Nothing can be undone (pain points 5, 6).
- **Solution:**
  - **One slot (B5)** per screen, at most one visible message, mirrored to the status bar only when it neither takes focus nor is an error (B5 rule, no double announcements).
  - **Form errors** are written into the slot without repainting, so the values stay:
    ```js
    function formError(f, text, field) {
      ui.msg = null; // drop any earlier lend Undo
      const m = f.querySelector("[data-msg]");
      m.hidden = false; m.className = "msg error"; m.setAttribute("role", "alert"); m.textContent = text;
      q("[data-status]").textContent = ""; // role="alert" announces it; no double read (B5)
      f.querySelectorAll("[aria-invalid]").forEach((x) => x.removeAttribute("aria-invalid"));
      const el = f.elements[field]; if (el && el.setAttribute) { el.setAttribute("aria-invalid", "true"); el.focus(); }
    }
    ```
    The submit handler calls it in this order:
    1. `!r || !unit || unit.repair || out(asset)` → `formError(f, "Choose an item and a person from the lists.", "asset")`; `!people.includes(who)` → the same text with field `"who"`.
    2. Type not on the request: `formError(f, r.id + " doesn't include a " + unit.type + ". It covers: " + r.items.join(", ") + ". Pick one of those.", "asset")`.
    3. Same type already out: find `x`, the open loan, then `formError(f, r.id + " already has a " + unit.type + " out (" + x.asset + ", loan L-" + x.num + "). Each request gets one of each item.", "asset")`.
  - **Undo**, a new `undo` click case. It reads `ui.msg?.undo` and stops if it is missing:
    - `return`: if the loan exists, is closed and `!out(l.asset)`, set `back = false` and delete `backAt` and `backBy`. Text: "Undone. Loan L-404 is open again."
    - `lend`: if the loan exists and is open, remove it from `s.loans` (`s.loans = s.loans.filter(l => l.num !== num)`). Text: "Undone. Loan L-405 was removed. AD-15 is available again." If the form is open, it re-renders with that type back in the list. Loan numbers are `max + 1`, so the number can be reused. That is fine because the loan never existed. L-401 can't be removed this way, so `s.loans` is never empty.
    - `update`: restore `l.who = prev.who; l.due = prev.due;`. If `prev.was` is set, `l.was = prev.was`, otherwise delete `l.was`. Text: "Undone. Loan L-404 is back to Kabir Sen · due Fri 8 pm."
    - After any Undo: `ui.msg = { kind: "ok", text, undo: null }; ui.focus = "[data-msg]";`
  - Messages and Undo are cleared by any other click (B5 rule). Changing tab and moving time are clicks, so they clear them too.
- **Implementation:** B5 + `formError()` + the `undo` case. Every success path sets `ui.msg` instead of passing a string to `commit()`.
- **styles.css** (all prefixed `#campus-stores`, placed after the rules they override; see C14):
  - `#campus-stores .msg { margin: 10px 0; padding: 9px 12px; border-radius: 6px; font-size: 14px; background: var(--desk); border-left: 4px solid var(--sel) }`
  - `#campus-stores .msg.ok { background: var(--ok); color: var(--oktxt); border-color: var(--oktxt) }`
  - `#campus-stores .msg.error { background: var(--latebg); color: var(--late); border-color: var(--late) }`
  - `#campus-stores .msg.warn { background: var(--memo); color: var(--memotxt); border-color: var(--memotxt) }`
  - `#campus-stores .linkbtn { background: transparent; border-color: transparent; text-decoration: underline; padding: 2px 6px }`. It keeps `min-height: 40px` (44px on coarse pointers, from C14). Only background, border and underline change.
  - `#campus-stores [aria-invalid="true"] { border-color: var(--late); box-shadow: 0 0 0 2px var(--latebg) }`
- **State/storage:** `ui.msg` is never saved. `s.notice` (already saved) keeps the last text.
- **Acceptance check:**
  - A blocked CA-03 lend shows the red message right above "Lend this item", focus is on the item select, and the request and person stay chosen.
  - Lend → Undo removes the loan.
  - Return → open another row's panel: the Undo is gone.
  - Reload: no message or Undo comes back.

### Language

#### C11 · Plain labels and empty states
- **Source IDs:** BG-01, UI-11, BG-06.
- **Problem:** Beginner-unfriendly terms: "slip", "register", "issue", "unit leaving the desk", "bin" (pain point 14). The empty states are minimal (pain point 15).
- **Solution:** change **shown text only**. The internal keys stay, including the `pages` key, the `screens` key `"Loan register"` and `s.tab` values.

  | Where | Old | New |
  |---|---|---|
  | Nav tab | Loan register | **Loans** |
  | Loans heading / sub | Loan register / One slip per physical unit | **Loans** / One loan = one item lent to one person. Close it when the item comes back. |
  | Head button | New issue slip | **Lend an item** |
  | Head button (form open) | Cancel | **Close form** |
  | Field | Approved request | **Club request** |
  | Field | Unit leaving the desk | **Item to hand over** |
  | Field | Collected by | **Who is taking it?** |
  | Field | Return by | Return by (unchanged) |
  | Submit | Save issue slip | **Lend this item** |
  | Row button | Record return | **Return AD-12** (with the item ID) |
  | Toggles | Outstanding / All slips | **Still out / All loans** |
  | Empty "Still out" | No outstanding slips. | **Nothing is out right now. Every lent item has come back.** |
  | Requests sub | Student Activities Office · 3 approved forms | **Club requests approved by the Student Activities Office. Open one to see what to hand out.** |
  | Requests buttons | View form / Back to list | **View request / ← All requests** |
  | Inventory row | BenQ MH550 · A2 | **BenQ MH550 · shelf A2** |
  | Desk book author | Counter handover | **Handover note** |
  | Desk book button | Add handover note | **Save note** |
  | Any message | "slip" | "loan" |

- **Implementation:** give all four `pages` entries a label, `[key, icon, label]`: `["Requests","clipboard-list","Requests"]`, `["Inventory","package","Inventory"]`, `["Loan register","book-open","Loans"]`, `["Desk book","messages-square","Desk book"]`, and use the label in the nav markup in `paint()`. Edit the strings in `register()`, `requestPage()`, `inventory()` and `deskbook()`.
- **State/storage:** none. `restore()` still checks `s.tab` against the unchanged `screens` keys.
- **Acceptance check:** no app-owned label, button, heading or message contains "slip", "issue", "unit leaving" or a bare bin code (club messages in the Desk book and an old saved status line are exempt). Reloading on the Loans tab still restores the Loans tab.

### Time control

#### C12 · Caption under the time button and a clearer status
- **Source IDs:** BG-10.
- **Problem:** "Move to return time" gives no warning that the story moves on and can't go back. The status says only "Shift time updated." (pain point 16).
- **Solution:**
  - Under the button there is a small caption:
    - step 0: "Moves the story to Friday · 7:30 pm. Your records stay. Time only goes forward; Restart sample shift starts again."
    - step 1: the same with "Saturday · 9:00 am".
    - step 2: no button and no caption.
  - After moving, the status says "Desk time is now Friday · 7:30 pm."
  - The button labels and the 3 steps are unchanged.
- **Implementation:**
  1. **index.html:** in `aside.shift`, wrap the button as `<div class="advance"><button type="button" data-action="advance"></button><small data-shift-caption></small></div>`.
  2. **app.js:** add `caption` to `shifts[0]` and `shifts[1]`. In `paint()`, set `q("[data-shift-caption]").textContent = phase.caption || ""` and `.hidden = !phase.next`. In the `advance` case, set `s.notice = "Desk time is now " + shifts[s.phase].time + "."`, `ui.panel = null`, `ui.editing = false`, `ui.keep = null` and `ui.focus = "[data-page] h2"`.
  3. **styles.css:** `#campus-stores .shift .advance { display: grid; gap: 4px; justify-items: end; max-width: 30ch; text-align: right }` (after the existing `#campus-stores .shift div` rule) and `#campus-stores .shift .advance small { color: var(--memotxt) }`. Inside the existing `@container (max-width:650px)` block add `#campus-stores .shift .advance { justify-items: start; text-align: left }`.
- **State/storage:** none.
- **Acceptance check:** the caption is visible at steps 1 and 2 and gone at step 3. The story text is unchanged at every step.

### Accessibility and layout

#### C13 · Focus and ARIA after re-render
- **Source IDs:** BG-04.
- **Problem:** Every `paint()` replaces the page, so focus falls to `<body>` and keyboard users are sent back to the top.
- **Solution:** set `ui.focus` in these cases (B6 applies it):

  | Action | Focus |
  |---|---|
  | `tab`, `advance`, `restart` | `[data-page] h2` |
  | `request` (open a request) | `.record h3` (give it `tabindex="-1"`) |
  | `close` (back to list) | `[data-action="request"][data-val="RQ-214"]` (the one just viewed; keep the ID in a local variable before clearing `s.selected`) |
  | `new` / `lend-for` | the form's first select / its item select |
  | `cancel` | `[data-action="new"]` |
  | `return`, `update` | `[data-panel] select` (the panel's `role="group"` label and the select's `aria-describedby` item line are read with it, C01/C04) |
  | `close-panel` | that row's opening button (Return or Plans changed) |
  | `confirm-return`, `save-update`, `not-this`, `undo`, successful lend that closes the form, note saved | `[data-msg]` |
  | successful lend that keeps the form open | `[data-issue] select[name="asset"]` |
  | `scope` | `[data-action="scope"][data-val="0" or "1"]` (the button pressed) |
  | filter change | `[data-filter]` |

  Also:
  - In `paint()`, nav buttons use `aria-current="page"` on the active tab instead of `aria-pressed`.
  - `paint()` sets `q("[data-page]").setAttribute("aria-label", label of s.tab)`.
- **Implementation:** as above. In **styles.css**, change `#campus-stores nav button[aria-pressed="true"]` to `#campus-stores nav button[aria-current="page"]`, and add `#campus-stores .msg:focus, #campus-stores h2:focus, #campus-stores h3:focus { outline: 2px solid var(--mark); outline-offset: 2px }`.
- **State/storage:** `ui.focus` is never saved.
- **Acceptance check:** using only the keyboard, return L-402. After pressing Enter on "Yes, it says PR-04", focus is on the message and Tab reaches Undo. Changing tab puts focus on the heading.

#### C14 · Counter-friendly sizing and narrow screens
- **Source IDs:** BG-11 (UI-10's tab bar is Later).
- **Problem:** The status text is 12px grey, buttons are about 30px on fine pointers, and rows squeeze at 375px.
- **Selector rule for the whole plan (R01).** Prefix **every** new or changed selector in this plan with `#campus-stores ` (for example `#campus-stores .tag.late`, `#campus-stores .msg`, `#campus-stores nav button[aria-current="page"]`, `#campus-stores .shift .advance`). Bare selectors lose to the existing ID-scoped rules. Place them after the rules they override. Edit the existing `.tag`, `.statusbar` and `.statusbar button` rules in place instead of adding new ones.
- **Solution and implementation (styles.css):**
  - Edit in place: `#campus-stores .statusbar { font-size: 14px; color: var(--ink) }` and `#campus-stores .statusbar button { font-size: 13px }`.
  - Edit in place: `#campus-stores .tag { font-size: 13px }`.
  - `#campus-stores button, #campus-stores select { min-height: 40px }` for all pointers. Keep the coarse-pointer rule at 44px and add `#campus-stores textarea` to it. Add `#campus-stores textarea { min-height: 72px }`.
  - `#campus-stores .row .actions { display: flex; flex-wrap: wrap; gap: 6px; align-items: center; justify-content: flex-end }`.
  - Inside `@container (max-width:420px)`: `#campus-stores .row { grid-template-columns: minmax(0, 1fr) }`, `#campus-stores .row .actions { justify-content: flex-start }`, `#campus-stores .panel .buttons button { flex: 1 1 100% }`.
  - Contrast: `--quiet` on `--desk` measures about 5.7:1 (light) and 9:1 (dark), so leave it. The new `--late` on `--latebg` is about 7:1 (light) and 9:1 (dark).
- **State/storage:** none.
- **Acceptance check:** at 375px wide, the L-404 row stacks with both buttons below the text and the panel buttons full width. Buttons measure at least 40px tall. The status text is dark and 14px.

---

## 5. State and storage summary

| Field | Where | Saved? | Notes |
|---|---|---|---|
| `backAt` | loan | Yes, optional | Phase index (0–2) when returned. Set by C01, removed by Undo. |
| `backBy` | loan | Yes, optional | A name from `people`. Set by C01, removed by Undo. |
| `was` | loan | Yes, optional | `{ who, due }`, the values before the first "Plans changed". Set by C04. |
| `editing` | was in `s` | **No longer in `s`** | Moved to `ui.editing`. Removed from `original()`. |
| `ui.msg`, `ui.panel`, `ui.editing`, `ui.keep`, `ui.focus` | `ui` object | **Never** | `commit()` only writes `s`. Restart and page load start with `freshUi()`. |

**Version bump: not needed.** I checked against `restore()`. It requires `version === 1`, a valid `tab`, `phase` and `selected`, valid notes, and loans with a known `req`, a known `asset` and an integer `num`. It then copies each loan with `{ ...l }`. New optional fields pass straight through, and old saves simply don't have them. Keep `storageKey = "campus-stores.shift.v1"` and `version: 1`.

**`restore()` edits** (defensive, so bad values are dropped and never break the app):
1. Drop the old `editing` key: `const { editing, ...rest } = d;` then spread `rest` instead of `d`.
2. Clean each loan:
   ```js
   loans: d.loans.map((l) => {
     const x = { ...l };
     if (!x.back || !(Number.isInteger(x.backAt) && shifts[x.backAt])) delete x.backAt;
     if (!x.back || !people.includes(x.backBy)) delete x.backBy;
     if (!(x.was && people.includes(x.was.who) && Object.hasOwn(dueHours, x.was.due))) delete x.was;
     return x;
   }),
   ```
3. Nothing else changes. Notes keep `{phase, text}`.

**How old saves behave:**
- A v1 save from today's app loads normally. Returned loans show "returned" with no time or name, and the badge "Returned".
- A stale `editing: true` is ignored, so the form starts closed.
- A save from the new app opened in the old app also loads: the old code ignores the extra fields.

---

## 6. Implementation order and dependencies

Each step leaves a working app.

1. **B1–B6 building blocks.** Move `editing` into `ui`, add the time lookup, item helpers, helper arguments, message slot and focus hook. Check that the app still behaves as today.
2. **C10 message slot and `formError()`.** Depends on B1 and B5. Add `undo` for `lend` first, because it is the simplest.
3. **C03 row details** and **C11 labels.** Pure text. Doing them early means later steps use the final wording.
4. **C02 badges and order.** Depends on B2 and B4.
5. **C01 return panel.** Depends on B1, B4, B5, C03 and C10. Add Undo for `return`.
6. **C04 Plans changed.** Depends on C01's panel pattern. Add Undo for `update`.
7. **C05 Lend for request** and **C06 prefill.** Depend on B3, B4 and C10.
8. **C07 request progress.** Depends on C01 (`backAt`/`backBy`) and C02 (`dueState`).
9. **C08 Inventory** and **C09 Desk book.**
10. **C12 time caption.**
11. **C13 focus** (go through the table) and **C14 CSS sizing.**
12. **`restore()` edits (section 5).** Then the full walkthrough in section 7, at 1060px and at 375px, in light and dark mode.

Estimated size: about 230 extra lines of JS and about 70 lines of CSS. There are no new files, libraries or network calls.

---

## 7. Same job, new design

Start with **Restart sample shift**. The Requests tab is open.

### Step 1 · Friday 3:45 pm, "Pickup at the counter"
1. **Requests** lists RQ-214 with "Not started", RQ-209 with "1 of 1 out" and RQ-217 with "Not started". Click **View request** on RQ-214.
2. The detail shows "RQ-214 · Approved · Not started", "Return by Fri 8 pm", three lines ending "— not lent yet", and the note "Playback is from a USB-C-only laptop. The host will collect at 4 pm."
3. *(Judgment, unchanged.)* Open **Desk book** and read Isha's 3:20 pm message: Kabir Sen may collect. Go back to **Requests** → RQ-214.
4. Click **Lend items for this request**. The Loans tab opens with the form:
   - "For RQ-214 · Film Society · Courtyard screening"
   - "Still to lend: HDMI projector, Portable speaker, USB-C → HDMI adapter"
   - Focus is on "Item to hand over". It lists PR-04 · BenQ MH550 · shelf A2, SP-02, SP-05, AD-12 · Belkin AVC002 · shelf C4, and AD-15 · Anker A8312 · shelf C4.
   - "Return by" already says Fri 8 pm, with "From the request."
5. Choose **PR-04**, then **Kabir Sen**, then click **Lend this item**. Above the button: "PR-04 (BenQ MH550) lent to Kabir Sen, due back Fri 8 pm. Loan L-402. [Undo]". The form stays open with Kabir and Fri 8 pm kept, and the projector is gone from the list.
6. Choose **SP-02** → **Lend this item** (L-403).
7. Choose **AD-12** → **Lend this item** (L-404). The form closes. The message says "… Loan L-404. All 3 items on RQ-214 are now out. [Undo]".
8. **Still out** lists L-402, L-403, L-404 (each "Due today · Fri 8 pm") and then L-401 MI-09 (due Sat 10 am, no badge).
9. *(Optional: show the "handles well" moment.)* Click **Lend an item**, choose RQ-209 · Debate Union, then CA-03, then Tara Shah. Return by fills in Sat 10 am. Click **Lend this item**. Right above the button, in red: "RQ-209 doesn't include a Digital camera. It covers: Wireless microphone. Pick one of those." The item select is marked and focused, and the values stay. Click **Close form**.
10. Under the yellow button, the caption says "Moves the story to Friday · 7:30 pm. Your records stay. …". Click **Move to return time**. The status says "Desk time is now Friday · 7:30 pm."

**Count for RQ-214:** 1 form, 4 choices and 3 saves. Before, it took 3 forms, 12 choices and 3 saves.

### Step 2 · Friday 7:30 pm, "The kit comes back in pieces"
1. Open **Loans**. Still out: L-402 PR-04, L-403 SP-02 and L-404 AD-12, each "Due today · Fri 8 pm", then L-401.
2. Kabir hands over the projector. Click **Return PR-04**. The L-402 row opens: "Check the label on the item in your hand. This loan is for: PR-04 · HDMI projector · BenQ MH550", with "Brought back by: Kabir Sen". Read the sticker and click **Yes, it says PR-04**. Message: "PR-04 (BenQ MH550) is back. Put it on shelf A2. Loan L-402 closed. [Undo]".
3. Click **Return SP-02** → **Yes, it says SP-02**. Message with shelf B1. (A fast click on a row that moved only opens a panel; nothing closes by accident.)
4. Kabir says Leela has the adapter until 9 am. On L-404 click **Plans changed**. Set "Now with" to **Leela Das** and "Expected back" to **Sat 9 am**. Note the fact line "Request says: return by Fri 8 pm." Click **Save change**. Message: "Loan L-404 updated: now with Leela Das, expected back Sat 9 am. [Undo]". The row reads "… with Leela Das · due Sat 9 am (was Kabir Sen · due Fri 8 pm)".
5. Open **Desk book** (Kabir's 7:30 pm message is now there). Write the handover in your own words. The placeholder suggests "Which item, who has it, when it will come back, and the loan number." Click **Save note**. Message: "Note saved. …"
6. Click **Move to next morning** (caption: "Moves the story to Saturday · 9:00 am …"). Status: "Desk time is now Saturday · 9:00 am."

### Step 3 · Saturday 9:00 am, "Morning shift"
1. *(Judgment, unchanged.)* Read the **Desk book**. Your handover note and Kabir's message are at the top.
2. Open **Requests**. RQ-214 shows "1 of 3 still out". Open it: projector "PR-04 back Friday · 7:30 pm from Kabir Sen · loan L-402", speaker back, and "USB-C → HDMI adapter — AD-12 (Belkin AVC002) with Leela Das, due Sat 9 am · loan L-404".
3. Open **Loans**. Still out lists L-404 AD-12 first ("Due today · Sat 9 am", "Belkin AVC002 · shelf C4 · … with Leela Das … (was Kabir Sen · due Fri 8 pm)"), then L-401 MI-09 ("Due today · Sat 10 am"). That is 2 rows, each with 1 badge and 2 buttons.
   - *If step 2's update was skipped:* L-404 reads "Late · was due Fri 8 pm" with a red edge, at the top.
4. Leela puts an adapter on the counter. Click **Return AD-12**. The panel says "Check the label on the item in your hand. This loan is for: **AD-12 · USB-C → HDMI adapter · Belkin AVC002**", with "Brought back by: Leela Das" (already set by the update).
5. *(Judgment.)* Turn the adapter over and read the sticker.
   - **It says AD-12 / Belkin:** click **Yes, it says AD-12**. Message: "AD-12 (Belkin AVC002) is back. Put it on shelf C4. Loan L-404 closed. [Undo]".
   - **It says something else:** click **Not this item**. Message: "Nothing changed. Loan L-404 is still open. It is for AD-12 (Belkin AVC002). Don't take a different item as this return; ask where AD-12 is."
6. If you pressed Yes by mistake, click **Undo**. "Undone. Loan L-404 is open again."
7. Check: **All loans** shows L-404 "Returned · … returned Saturday · 9:00 am by Leela Das" (with "Returned late" if there was no update). **Requests** shows RQ-214 "All back". **Inventory** shows AD-12 and AD-15 both "On shelf · shelf C4", and MI-09 "On loan · L-401".

---

## 8. Real-counter observation

**Watch 20 returns at a real desk. For each one, note whether the staff member picks up the item and reads its label *before* pressing "Yes, it says …".**
- If most do, the check is doing its job.
- If they press Yes without looking, it has become a habit click and needs a stronger version, such as typing the last two digits of the label.

To back it up, for two weeks before and two weeks after the change:
- **Count shelf-check mismatches at closing:** units the app says are on the shelf that are missing, or that have a different unit in their place.
- **Count "Not this item" and "Undo" presses.** Each one is a mistake caught at the counter instead of found later.

---

## 9. Later and rejected ideas

**Later:**
- **WF-02 batch checklist form.** The sticky form gets most of the saving, and a checklist rewrites the most-tested code path.
- **WF-08 / RL-09 / UI-12 notes linked to loans and styled entries.** "Plans changed" already records the facts. Revisit if notes and loans get out of step at a real desk.
- **RL-08 void/swap a loan.** "Undo" after a lend covers the immediate mistake. Void/swap is for mistakes found later.
- **RL-13 find by sticker ID on the Loans page.** Worth it only when there are many open loans. Inventory's "On loan · L-404" is the stopgap.
- **UI-10 phone bottom tab bar.** The stacked rows are enough for now.
- **RL-03's "Reopen" on closed loans.** Not needed while Undo plus Restart cover a 3-step sample.

**Rejected:**
- **UI-06, BG-02, WF-12, RL-11 guidance and summary panels.** They pre-answer the scenario's judgment calls.
- **RL-06 authorised-collector list.** It copies the Desk book answer into the data.
- **The look-alike warning ("AD-15 looks the same") from UI-04 / BG-07 / WF-05.** The label check is the check.
- **WF-06 global search.** An extra always-visible control for 8 items.
- **UI-13 stepper and relative times.** It looks clickable and duplicates the clock and the badge.
- **WF-13 / BG-10 step back in time.** It breaks the one-way story. Restart exists.
- **RL-07 condition on return.** Not in the story, adds a decision to every return, and risks the hidden in-repair rule.
- **RL-14 slip history.** State nobody sees.
- **RL-10 staff name prompt.** In a single-player sample it adds nothing.
- **BG-13 glossary.** Plain labels make it unnecessary, and it would sit next to the Candidate brief.

---

## 10. Revision notes

- R01 → Added the `#campus-stores ` prefix rule at the top of C14 (place after overridden rules; edit `.tag`, `.statusbar`, `.statusbar button` in place). Prefixed every CSS snippet in C01, C02, C10, C12, C13 and C14.
- R02 → C01 step 2: both panel buttons carry `data-val = l.num`. Step 3: `confirm-return` / `not-this` look up `l` with `s.loans.find((x) => x.num === Number(v))` and stop if it is missing or `l.back` (C01).
- R03 → C11 acceptance reworded to app-owned labels, buttons, headings and messages; Desk book club messages and an old saved status line are exempt (C11).
- R04 → All four `pages` entries get a third label element (C11 Implementation).
- R05 → Submit step 1 split: unit problems → field `"asset"`, unknown person → field `"who"`. `formError()` starts with `ui.msg = null;` (C10).
- R06 → Both forms render `<small data-duehint>` inside Return by, with first text from the change-handler rule (C05 step 3, C06).
- R07 → Request-first header lines are `<p>`s between `<form data-issue>` and `<div class="form">`, not inside the grid (C05 Solution).
- R08 → `close-panel` sends focus to the opening button (`update` or `return`) using `ui.panel.kind`. The C13 row now reads "that row's opening button" (C01 step 3, C13).
- R09 → Panels get `role="group" aria-labelledby="panel-h"`, and the selects get `aria-describedby="panel-unit"`, in both C01 and C04 (C01 step 2, C04 step 1, C13).
- R10 → Chose option 1: a message that takes focus, or an error (`role="alert"`), is not mirrored to the status bar in the same paint, so the status bar is emptied instead. `formError()` empties the status bar. Updated B5, C10, section 2 and the C01 acceptance check.
- R11 → `#campus-stores .linkbtn` keeps `min-height` 40px (44px on coarse pointers). Only background, border and underline change (C10).
- R12 → The narrow-screen caption rule goes inside the existing `@container (max-width:650px)` block (C12 step 3).
- R13 → `advance` also sets `ui.editing = false; ui.keep = null;` (C12 step 2).
- R14 → C01 acceptance now reads "no other row changes order or closes". Section 7 count is now "1 form, 4 choices and 3 saves" (C01, section 7).
- R15 → Empty Still out now reads "Nothing is out right now. Every lent item has come back." The request detail line now reads "Every item on this request has been lent (see progress above)." (C11 table, C05).
