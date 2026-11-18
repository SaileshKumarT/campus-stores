# 06 · Debate: AGAINST the changes

The skeptic's case. The four brainstorm reports hold 53 ideas. If all of them shipped, a 3-step sample shift with 3 requests, 8 units and 5 people would get: a global search box, a checklist panel, two summary cards, a stepper, a legend, a glossary, a staff-name prompt, a bottom tab bar, four return-panel variants, three undo designs, a slip history timeline, condition tracking, void/swap, slip editing, note linking and a v1→v2 migration. Each idea is reasonable on its own. Together they would turn a 496-line app that a beginner can read in a minute into a small ERP.

Two facts from the brief drive this whole paper:

1. **The brief is "Would you keep this product? Show one moment the product handles well and one moment you would change … Sketch or prototype your change."** It asks for *one* change, walked through the *same job*. A plan that changes 30 things can no longer show "the same job using it", and it removes the "handles well" moments the candidate is meant to find.
2. **The scenario tests judgment**: is Kabir allowed to collect (Desk book 3:20 pm), does the USB-C-only laptop need the adapter (request note), what is still out after the split return, and is the adapter in Leela's hand AD-12 or AD-15. Any idea that answers those questions *for* the user (checklists, authorised lists, look-alike warnings, "what's waiting for you" cards) makes the product nicer but makes the exercise empty.

## What must be kept

These are strengths of the current app, with evidence. Each change below is judged on whether it keeps them.

| # | Strength | Evidence |
|---|---|---|
| K1 | **Type guard rail.** You can't issue a unit whose type isn't on the request. | `app.js` submit handler: `if (!r.items.includes(unit.type))` blocks CA-03 on RQ-214 (walkthrough step 1). It's the most obvious "handles well" moment a candidate can cite. |
| K2 | **Quantity guard rail.** Only one unit of each approved type per request. | `s.loans.some(l => l.req === req && !l.back && type === unit.type)`. It stops a second speaker going out on RQ-214. |
| K3 | **The form keeps its values after a blocked save.** | The error is written with `q("[data-status]").textContent = …` with no `paint()`, so the selects keep their values (walkthrough: "The form keeps its values"). Any inline-error design that calls `commit()` would wipe the form and lose this. |
| K4 | **One slip per physical unit.** | Loans are `{num, req, asset, …}`, one per asset. "Record return" closes exactly one unit, which is why the split return (2 back, adapter out) can be shown at all. Batch ideas must still write one loan per unit. |
| K5 | **Unavailable units are hidden, not just disabled.** | `available = assets.filter(a => !a.repair && !out(a.id))`. PR-06 (in repair, "Workshop") and MI-09 (on loan) never appear in the dropdown. That's zero-error design for free. |
| K6 | **The required selects stop empty saves.** | Every `<select>` is `required` with a "Select…" placeholder, and the people/unit options come from fixed lists. So the "silent return" branches (unknown person, unit not free) can't be reached through the UI. They are defensive code, not a user-facing bug (contrary to BG-03 and WF-11). |
| K7 | **Status line with `role="status" aria-live="polite"`.** | `index.html` status bar. Screen readers already hear every success message. |
| K8 | **Tiny, honest state.** One `localStorage` key, `version: 1`, and a strict `restore()` that falls back to a fresh shift when the data is bad. | `restore()` checks tab, phase, notes and loans, then spreads `{...original(), ...d}`. Also "Restart sample shift" is a guaranteed full reset. |
| K9 | **The story drives the work and doesn't give it away.** | `shifts[i].text` poses a question ("Can he leave with everything he needs?") and the evidence is spread over the Requests note, the Desk book and Inventory. That spread *is* the test. |
| K10 | **Four tabs, one list pattern.** | `row()`/`badge()`/`btn()` give every screen the same two-line row. A beginner learns one layout once. |
| K11 | **One-way time with 3 fixed steps.** | `advance` only does `s.phase++`, and the Desk book gates Kabir's 7:30 pm message on `s.phase >= 1`. The story can never be in a contradictory state. |
| K12 | **Fast returns.** One click closes one slip. | It's the risk in pain point 6, but it's also why step 2 takes seconds. Any confirm must stay at about 2 clicks, not become a form. |

**A cost the reports overstate:** several ideas say "version bump + migration". That isn't true for *additive, optional* loan fields. `restore()` only checks `req`, `asset` and `num` on each loan and copies the rest with `{...l}`, so an extra `backAt` survives a reload, and an old save without it just reads as `undefined`. The cheap rule: **no version bump; new fields must be optional and have defaults where they are read.** A real v1→v2 migrator for a sample shift that "Restart" resets in one click is over-engineering. Bumping the key (fresh start) is the fallback if a field is ever required.

## Conflicts and duplicates

| Cluster | Ideas | The clash | Least harmful version |
|---|---|---|---|
| A · Form errors | UI-01, WF-11, BG-03 | Three specs for the same `<p role="alert">`. UI-01 adds a toast and red borders. BG-03 adds focus moves and claims silent cases that can't be reached (K6). | **WF-11 markup + BG-03's fix-it wording** for the 2 reachable errors (type, quantity). Set the text without `paint()` (keeps K3). No toast. |
| B · Success feedback | UI-01 (green toast), BG-05 (banner + "Lend another" button + row highlight), UI-05 (greyed "Returned just now" row), RL-03a (Undo in status bar) | Four places to say "it worked". The student would see a toast, a banner, a greyed row and a status line all at once. | **One line in the same inline message slot** at the top of the Loan register, also mirrored to the existing status bar (K7). It holds the Undo link (cluster C). No extra buttons. |
| C · Return confirm + undo | UI-05, WF-05, RL-01, BG-09, RL-03, RL-02 (+ RL-13's panel) | Four different panels: a typed label ID (WF-05), Yes / "No, something else" with a dropdown (RL-01), a "Brought back by" select (UI-05, BG-09) and 2 buttons. Three undo lifetimes: 10 seconds (UI-05), until the next action (RL-03a, BG-09) and the rest of the time step (WF-05). Plus Reopen with reasons (RL-03b). | **One in-row panel**: "Check the label: AD-12 · Belkin AVC002 · bin C4", then **[Yes, AD-12 is back]** and **[Not this one]** (cancel). Undo lasts until the next action. No typed ID, no timer, no reason picker, no "brought back by" select. Stamp the desk time automatically (0 clicks). |
| D · Overdue | UI-02, UI-03, WF-09, RL-04, BG-08, UI-13 (relative times) | Six badge colours plus a legend (UI-02 and UI-11), sorting (UI-03, WF-09, RL-04, BG-08), a nav count "(1 late)" (RL-04), "13 h overdue" relative times (UI-13) and summary chips (UI-03). Sorting goes against pain point 7, because rows move. | **One text badge "Late · was due Fri 8 pm"** on open slips, derived from a 6-entry time lookup. No sort (2 open rows at step 3), no count in the tab name, no relative hours, no legend. |
| E · Slip detail | UI-04, BG-07, WF-04 (option text) | A card redesign (UI-04) vs. a text change (BG-07). Both add a look-alike warning. | **BG-07's text**: model and bin in the row sub and in the unit option. **Drop the look-alike warning** (cluster K). |
| F · Request progress | UI-07, WF-10, RL-12, BG-12 | A 3-segment bar, 5 states, per-item lines, and an "Issue this" or "Lend this item" button in two of them. | **WF-10**: a derived badge plus one plain line per item in the detail view. No bar, no new buttons. |
| G · Issue entry points | WF-01, WF-02, UI-07 "Issue this", BG-12 "Lend this item", BG-05 "Lend another item for RQ-214", UI-08 panel | Up to 5 ways into the issue form, and 2 form layouts (checklist vs. numbered steps + side panel). | **WF-01's single "Issue this request" button** plus "New issue slip" kept as it is. One form layout: today's, with the request fixed. |
| H · "What now" guidance | UI-06, BG-02, WF-12, RL-11, BG-13, BG-10 (move-on check) | Two checklists (UI-06, BG-02), two summary cards (WF-12, RL-11), a glossary, and a "Move on anyway?" pre-check. That's up to 4 new panels stacked above the page. | **None.** If one must ship, **BG-01's label renames** do the beginner job without panels. At most a one-line caption under the time button. |
| I · Plans changed | WF-07, RL-05 (+ RL-14 history, WF-08 notes) | Two edit designs with different fields ("reason" vs "who told you"). Both clash with cluster D: changing the due time clears the late flag. | **One "Update" (WF-07) with 2 fields, no history array.** The original due time is already `getReq(l.req).due`, so "Request said Fri 8 pm" can be shown from data that exists. Or Later (see the verdict). |
| J · Notes and staff | UI-12, WF-08, RL-09, RL-10 | Three note-to-slip link designs (chips, dropdown, per-row button) and two staff-name designs (WF-08 field, RL-10 prompt each step). | **Later.** The free-text note is what step 2 asks for. Linking makes it a second slip-edit path next to cluster I. |
| K · Giving away the test | UI-06, BG-02, WF-03/RL-06 authorised list, UI-04/BG-07 look-alike line, WF-12/RL-11, BG-06 example note | Each one pre-answers a judgment the story asks the candidate to make (K9). | Keep only the factual displays (late badge, model and bin, progress). Reject the pre-answers. |
| L · Item lookup | WF-06 (global), RL-13 (register only) | Two search boxes. | **Later, RL-13 scope** if ever. With 2 open slips, the list is already the lookup. |
| M · Time back | WF-13, BG-10 | Both add a back link. It breaks K11: Kabir's message vanishes while his returns stay closed. | **Reject both.** "Restart sample shift" is the existing, honest back button. |
| N · Labels | BG-01 ("Mark as returned"), UI-09 ("↩ Record return of AD-12"), UI-05 ("Yes, AD-12 is back"), BG-09 ("Yes, it's back") | Four different words for the same button. | **One wording list**, owned by BG-01, used by every other change. |
| O · Size and mobile | UI-10, BG-11 | A bottom tab bar and a collapsible shift bar vs. bigger targets. | **BG-11's CSS-only part.** Later for UI-10. |

## Opening arguments

Format: **Objection** · **Simpler alternative** · **Verdict suggestion**.

### UI · visual design

**UI-01 · Messages next to the button**
- **Objection:** The inline error is right, but this bundles a green toast, red borders, `aria-invalid`, a focus move and two new state keys (`s.formError`, `s.flash`). Saving `formError` in state means it gets persisted (the `{...d}` spread) and comes back after a reload. A rendered error also needs `paint()`, which wipes the form (K3).
- **Simpler alternative:** One `<p class="formerror" role="alert">` above Save, filled by `textContent` the same way the status bar is today. No toast.
- **Verdict:** Shrink (merge into WF-11).

**UI-02 · Six colour-coded badges with icons**
- **Objection:** It goes from 2 looks to 6, plus an SVG wrench, light-dark pairs and a legend (UI-11) to explain them. A legend is proof the code isn't obvious. Only one badge is missing from the story: late.
- **Simpler alternative:** Add one `.tag.late` with the word "Late" in it, and keep the rest.
- **Verdict:** Shrink.

**UI-03 · Overdue rows float to the top + summary chips**
- **Objection:** At step 3 the Outstanding list has 2 rows. Sorting 2 rows gives no benefit and goes against pain point 7 (rows moving). The "1 overdue · 1 due today · 0 on time" chip row is a third summary (clusters D and H).
- **Simpler alternative:** The late badge alone.
- **Verdict:** Reject.

**UI-04 · Slip cards with a sticker tag and a look-alike note**
- **Objection:** A new `slipRow()` breaks K10 (one row pattern), makes rows taller, and needs its own mobile stacking. The amber "Look-alike: AD-15 is also in C4" line hands over the step 3 answer (cluster K).
- **Simpler alternative:** BG-07: put model and bin into the existing `row()` sub text.
- **Verdict:** Shrink (to BG-07).

**UI-05 · Two-step in-row confirm with a 10-second Undo**
- **Objection:** The direction is right. The details are not: a "Brought back by" dropdown on every return (extra choice), a 10-second timer (a beginner reading slowly loses Undo, and timers need `setTimeout` plus a repaint), and "Returned just now" rows that stay until a tab switch (a ghost state that isn't saved).
- **Simpler alternative:** Cluster C: 2 buttons, and Undo until the next action.
- **Verdict:** Shrink.

**UI-06 · "Start here" task card in the shift bar**
- **Objection:** It builds a task list from live state with jump links. That's a second navigation system. Step 1's "Issue projector, speaker, adapter" spells out the request, and step 3's "1 item still out (AD-12, overdue)" answers the morning question. It duplicates BG-02. The "Can't go back" caption is the only useful part.
- **Simpler alternative:** Keep the story text. Optionally add the one-line caption under the time button (BG-10 shrunk).
- **Verdict:** Reject.

**UI-07 · Request progress bar + "Issue this"**
- **Objection:** A 3-segment colour bar and 5 states duplicate WF-10, and "Issue this" adds a third issue entry point (cluster G). Colour bars on a 1-item request (RQ-209, RQ-217) look odd.
- **Simpler alternative:** WF-10's text badge and per-item lines.
- **Verdict:** Shrink (to WF-10).

**UI-08 · Numbered-step form with a request summary panel**
- **Objection:** A second panel next to a 4-field form needs a `change` handler that repaints on request change, which needs draft state to avoid wiping the form (the report admits this). The panel repeats what WF-01 already fixes at the top.
- **Simpler alternative:** WF-01 shows the request as one read-only line. Prefill "Return by" (WF-03 part).
- **Verdict:** Shrink.

**UI-09 · Visual grammar for info vs. action rows**
- **Objection:** This is a global restyle of all four screens and both themes (zebra stripes, hover rows, ID column grid) to fix one real problem: identical "Record return" buttons.
- **Simpler alternative:** Put the asset in the button label ("Return AD-12"), worded under cluster N.
- **Verdict:** Shrink.

**UI-10 · Phone layout with a bottom tab bar**
- **Objection:** The setting is a counter desk, and the exercise is run in a desktop browser. A fixed bottom bar, a collapsible story and count bubbles are a big CSS/JS rewrite with risks (covered content, Restart hard to reach). A mobile layout already exists (`@container` 650px/420px).
- **Simpler alternative:** BG-11's minimum target sizes.
- **Verdict:** Later.

**UI-11 · Empty states + legend**
- **Objection:** The empty-state text is fine. The legend only exists because of UI-02's 6 colours.
- **Simpler alternative:** One-sentence empty states, no legend, no `empty()` component with icon and action.
- **Verdict:** Shrink.

**UI-12 · Three Desk book entry styles + "About" chips**
- **Objection:** The chips are a third note-linking design (cluster J). Adding "system events" to the Desk book turns it into an activity log, which RL-14 also proposes.
- **Simpler alternative:** Show "Handover" as the author label instead of "Counter handover" (a one-word change).
- **Verdict:** Later.

**UI-13 · Stepper + bigger clock + relative due times**
- **Objection:** The masthead clock already shows "Desk time Friday · 3:45 pm". A 3-dot stepper is new UI that looks clickable (the report admits this), and "13 h overdue" duplicates the late badge with a second time calculation.
- **Simpler alternative:** None needed beyond the late badge.
- **Verdict:** Reject.

### WF · workflow

**WF-01 · "Issue this request" from the request form**
- **Objection:** `s.editing` changes from boolean to string, so `restore()` has to accept both. It's a small cost. The "Change" link is not needed, because "New issue slip" stays.
- **Simpler alternative:** As proposed, minus the "Change" link.
- **Verdict:** No objection.

**WF-02 · One checklist form for the whole request**
- **Objection:** This is the biggest rewrite in the set: per-type rows, preselection, "Already out" rows, a "Leave this one" tick, and all-or-nothing validation over N rows. It changes the shape of the most tested code path and weakens K1/K2 as visible moments (you can no longer *see* the guard rail work). The time saved is about 2 form opens in a 3-item shift. It also removes a judgment point: the beginner no longer chooses the adapter on purpose, it just gets issued.
- **Simpler alternative:** WF-01 + WF-04 + prefilled Return by. After a save, keep the form open on the same request with "Collected by" and "Return by" kept. That's about 1 choice per extra item, with no new form.
- **Verdict:** Later.

**WF-03 · Prefill Return by + authorised collectors**
- **Objection:** Prefilling Return by: no objection, it's one `selected` attribute. The `authorised` list copies the Desk book message into request data. That pre-answers "Can he leave with everything?" (cluster K) and adds a warning with a second-click confirm, which is one more modal pattern.
- **Simpler alternative:** Prefill the due time only, and keep the authorisation in the Desk book.
- **Verdict:** Shrink.

**WF-04 · Filter units to what the request needs**
- **Objection:** The filtering is good, but without WF-01 it needs a re-render on request change and draft state. It also makes K1's error unreachable, so keep the check as a backstop (it's free). The disabled "No HDMI projector (PR-06 in repair)" option goes against K5's hide-don't-disable.
- **Simpler alternative:** Filter only when the request is fixed by WF-01. Add model and bin to the option text (BG-07). No disabled explanation options.
- **Verdict:** Shrink.

**WF-05 · Return confirm with typed unit ID + Undo**
- **Objection:** Typing an ID on every return is slow and error-prone for a beginner, and the report itself offers the one-button fallback. "Brought back by" plus the typed ID makes a return a 3-field form (against K12).
- **Simpler alternative:** Cluster C's 2-button panel.
- **Verdict:** Shrink.

**WF-06 · Global "What's this item?" search**
- **Objection:** It's a fifth always-visible control above the tabs, a new renderer and an input handler (with the focus-loss problem RL-13 points out). The data set is 8 units and 2 open slips. It duplicates RL-13.
- **Simpler alternative:** Model and bin on the slip row (BG-07). The list is the lookup.
- **Verdict:** Reject.

**WF-07 · Edit an open slip (holder, expected return)**
- **Objection:** This is the strongest of the "new capability" ideas, because it fixes the step 2→3 handover at the source. But it adds an "Update" button to every open row (cluster N gets a 3rd button), a `history` array, and a conflict with the late flag (moving the due time to Sat 9 am hides lateness). It also competes with the free-text note, which is exactly what the brief asks the candidate to leave.
- **Simpler alternative:** If shipped: 2 fields, no history array, and show "Request said Fri 8 pm" from `getReq(l.req).due` (existing data) so lateness stays honest.
- **Verdict:** Shrink.

**WF-08 · Link notes to a slip + staff name**
- **Objection:** It adds a dropdown, a name field, chips, an inline expand on register rows and a per-row "Add note" shortcut. That's 4 new controls for a handover that is one sentence. It overlaps WF-07 (both record "Leela has it").
- **Simpler alternative:** WF-07 shrunk, or nothing.
- **Verdict:** Later.

**WF-09 · Overdue and due soon against desk time**
- **Objection:** The derived badge is cheap and right. Sorting and "Due in 1 h" add churn (cluster D). `returnedAt` is fine as an optional field (no version bump needed, see "What must be kept").
- **Simpler alternative:** Late badge only. Stamp `backAt` on return and show "Returned Sat 9 am" in All slips.
- **Verdict:** Shrink.

**WF-10 · Request progress on the Requests tab**
- **Objection:** It's derived from `s.loans` with no new state, one helper and text only. It risks answering "what's outstanding" for step 3, but it shows facts, not a decision.
- **Simpler alternative:** None. This is the canonical version of cluster F.
- **Verdict:** No objection.

**WF-11 · Inline errors next to the button**
- **Objection:** Only two errors can be reached (K6). The "silent `return`" cases can't be hit through the UI, so don't write messages for them.
- **Simpler alternative:** As proposed, for the 2 reachable errors, set without `paint()`, and not saved.
- **Verdict:** No objection (canonical for cluster A).

**WF-12 · Start-of-shift summary card**
- **Objection:** It does the step 3 task ("work out what was outstanding") for the candidate, it's a second summary next to RL-11, and it adds a dismiss state.
- **Simpler alternative:** WF-10 and the late badge make the answer easy to find without stating it.
- **Verdict:** Reject.

**WF-13 · Step back on the time control**
- **Objection:** It breaks K11. Kabir's 7:30 pm message disappears while his returns stay closed, and a 9 am return shows up at 3:45 pm. The fix needs a status explanation that is itself confusing. "Restart sample shift" already exists.
- **Simpler alternative:** A caption "Can't go back. Restart resets the shift."
- **Verdict:** Reject.

### RL · real-life scenarios

**RL-01 · "Which unit is in your hand?" check**
- **Objection:** Right target (the AD-12/AD-15 moment), but the "No, it says something else" branch, with a same-type dropdown and a mismatch message, is a whole sub-flow, and it's the third return-panel design.
- **Simpler alternative:** Cluster C: show model and bin in the panel, [Yes, AD-12 is back] / [Not this one]. "Not this one" just closes the panel and leaves the slip open.
- **Verdict:** Shrink (canonical return panel, minus the mismatch branch).

**RL-02 · Record who brought it back and when**
- **Objection:** "When" is free (stamp the phase). "Who" adds a select to every return, and the "Fix details" link adds an edit path to closed slips.
- **Simpler alternative:** Stamp `backAt` only, and show "Returned Sat 9 am" in All slips. Leave "who" for later.
- **Verdict:** Shrink.

**RL-03 · Undo / reopen a mistaken return**
- **Objection:** Undo is right. Reopen with a reason picker and a reissue check is a second correction path for a 3-step shift that has Restart.
- **Simpler alternative:** Undo until the next action, shown in the inline message slot.
- **Verdict:** Shrink.

**RL-04 · Overdue and due-soon flags**
- **Objection:** Same as WF-09. The "Loan register (1 late)" tab label makes the narrowest nav label longer, and the label is computed in `paint()`.
- **Simpler alternative:** Late badge only.
- **Verdict:** Shrink (merge into the single badge).

**RL-05 · "Plans changed" on an open slip**
- **Objection:** It duplicates WF-07 with different field names ("Who told you?"), plus `origDue` and `history`. `origDue` isn't needed, because the request already holds the due time.
- **Simpler alternative:** WF-07 shrunk.
- **Verdict:** Reject (duplicate of WF-07).

**RL-06 · Authorised collectors on the request**
- **Objection:** Same as WF-03's second half. It pre-answers the step 1 judgment, adds an "I checked with the club" checkbox (a new form pattern), and copies a message into static data.
- **Simpler alternative:** None. The Desk book is the evidence the candidate should find.
- **Verdict:** Reject.

**RL-07 · Condition on return (damaged, lost)**
- **Objection:** Nothing in the story is damaged or lost. It adds a decision to every return, new `s.repairs`/`s.missing` arrays that must merge with the static `a.repair` flag (risking K5: PR-06's hidden in-repair state), "Report lost", "Back in service" and "Found it". That's 5 new actions.
- **Simpler alternative:** None for this exercise.
- **Verdict:** Reject.

**RL-08 · Void or swap a mistaken issue slip**
- **Objection:** It adds a "same time step only" rule that needs explaining, a `void` flag every loan query must respect (`out()`, the K2 check, progress), and a swap that re-runs the guard rails. It's not in the story.
- **Simpler alternative:** The same Undo slot right after "Issued PR-04…" (undo the last issue), until the next action.
- **Verdict:** Later.

**RL-09 · Link a handover note to a slip**
- **Objection:** It's the third note-link design (cluster J), plus edit and remove notes within a step. That's more state rules.
- **Simpler alternative:** Free text, as now.
- **Verdict:** Later.

**RL-10 · Staff name per shift**
- **Objection:** A prompt at every time step is a typing task that interrupts the story 3 times, and stamping it into every handler touches all actions. In a single-player sample, the "staff" is always the candidate.
- **Simpler alternative:** None.
- **Verdict:** Reject.

**RL-11 · "What's waiting for you" summary**
- **Objection:** It duplicates WF-12 and does the step 3 thinking. "Go to slip" adds scroll-and-highlight behaviour.
- **Simpler alternative:** The late badge plus WF-10.
- **Verdict:** Reject.

**RL-12 · Request kit status**
- **Objection:** It's the same as WF-10, with return time and name lines that depend on RL-02.
- **Simpler alternative:** WF-10. Show "Returned" plus the time only if `backAt` exists.
- **Verdict:** Shrink (merge into WF-10).

**RL-13 · Find the slip from the item in hand**
- **Objection:** It's better scoped than WF-06, but it's still a live-filter input with focus-loss problems (it needs a partial render, which this app doesn't do anywhere). With 2 open slips, it's a tool without a job.
- **Simpler alternative:** BG-07.
- **Verdict:** Later.

**RL-14 · Slip history timeline**
- **Objection:** It's infrastructure for features this paper suggests rejecting or delaying (reopen, void, swap, plan changes). It adds a `log()` call to every handler and an expander on every slip. It's only cheap if everything else ships.
- **Simpler alternative:** `backAt` on return (one field).
- **Verdict:** Reject.

### BG · beginner usability

**BG-01 · Plain-language labels**
- **Objection:** The direction is right, but "Loans (who has what)" and "Still out / All loans (incl. returned)" are long labels in a 155px nav, and renaming every string at once makes it impossible to compare before and after in the walkthrough. "Slip" and "issue" are real desk words. The brief itself says "loan".
- **Simpler alternative:** Rename the 3 worst: "Unit leaving the desk" → "Item", "Collected by" → "Who is taking it", and "bin" → "shelf". Keep the `pages` keys.
- **Verdict:** Shrink.

**BG-02 · "What to do now" checklist**
- **Objection:** Step 2's "Leave the adapter open, it isn't back yet" and step 3's "Check the item … matches the model" are the answers. Hiding it behind "Need a hint?" still adds a third panel to the shift bar and per-step `todo` data with tick logic. It duplicates UI-06.
- **Simpler alternative:** None. The story text is the guide.
- **Verdict:** Reject.

**BG-03 · Errors next to the button with fix-it wording**
- **Objection:** The wording is the best of the three error ideas. But two of its four messages are for cases that can't be reached (K6), and it rightly warns that `paint()` would wipe the form.
- **Simpler alternative:** Use its wording for the type and quantity errors, inside WF-11's slot.
- **Verdict:** Shrink (merge into WF-11).

**BG-04 · Focus management after re-render**
- **Objection:** The rules for six cases ("focus the next row's return button…") are a hidden behaviour layer to maintain, and moving focus unexpectedly can disorient people. Tab change and form open are the cases that matter.
- **Simpler alternative:** Focus the page `<h2>` on tab change and the first select when the form opens. Add `aria-current="page"` to the active tab.
- **Verdict:** Shrink.

**BG-05 · "It worked" banner**
- **Objection:** It's the fourth success surface (cluster B), with a "Lend another item for RQ-214" button (another entry point) and row highlighting. The "Put it on shelf A2" hint is the one valuable line.
- **Simpler alternative:** The same inline message slot: "PR-04 (BenQ MH550) is back. Shelf A2. Undo."
- **Verdict:** Shrink.

**BG-06 · Empty states and first-visit hints**
- **Objection:** The 400-character counter needs a new input listener. The example note gives away step 3 (the report admits this). The Requests sub rewrite is fine.
- **Simpler alternative:** One-line empty states plus a generic placeholder ("Item, who has it, when it's due back").
- **Verdict:** Shrink.

**BG-07 · Item name and model on every loan row**
- **Objection:** It's text-only in the existing `row()`, no state, and it fixes pain point 9 without tab switching. Drop the "AD-15 looks similar" reminder (cluster K). Reading the model and spotting the look-alike is the candidate's job.
- **Simpler alternative:** None.
- **Verdict:** No objection (without the look-alike line).

**BG-08 · Overdue in words**
- **Objection:** It's the right form (text, not colour). It admits that sorting makes pain point 7 worse.
- **Simpler alternative:** The badge, no sort.
- **Verdict:** Shrink (canonical badge wording for cluster D).

**BG-09 · "Are you sure?" with details + Undo**
- **Objection:** It's the fourth return-panel spec. The "Brought back by" select adds a choice to every return.
- **Simpler alternative:** Use its wording ("Is this the item in your hand?") in RL-01's 2-button panel.
- **Verdict:** Shrink (merge into cluster C).

**BG-10 · Explain the time button + step back + move-on check**
- **Objection:** The step back breaks K11 (see WF-13). "You've lent 2 of 3 items. Move on anyway?" pre-checks the step 1 task, so it gives away the adapter, and it adds a confirm dialog pattern. The caption is good.
- **Simpler alternative:** Only the caption "Jumps the story to Fri 7:30 pm. Your records stay." plus a better status message.
- **Verdict:** Shrink.

**BG-11 · Bigger text and controls**
- **Objection:** It's CSS-only and low risk, but a global 40px minimum changes the density of every screen. The contrast check is valuable.
- **Simpler alternative:** Status bar at 14px in `--ink`, the contrast fix, and 44px targets on the return and save buttons only.
- **Verdict:** Shrink.

**BG-12 · Live per-request summary**
- **Objection:** It duplicates WF-10, plus a "Lend this item" button (cluster G).
- **Simpler alternative:** WF-10.
- **Verdict:** Shrink (merge into WF-10).

**BG-13 · Glossary and "?" tips**
- **Objection:** It's a third `<details>` on screen next to the Candidate brief, plus `localStorage` "remember closed" state outside the main state key. If BG-01 (shrunk) ships, the remaining codes explain themselves (RQ-, L-, shelf).
- **Simpler alternative:** BG-01 shrunk.
- **Verdict:** Reject.

### Tally

| Verdict | Count | IDs |
|---|---|---|
| Reject | 14 | UI-03, UI-06, UI-13, WF-06, WF-12, WF-13, RL-05, RL-06, RL-07, RL-10, RL-11, RL-14, BG-02, BG-13 |
| Shrink | 28 | UI-01, UI-02, UI-04, UI-05, UI-07, UI-08, UI-09, UI-11, WF-03, WF-04, WF-05, WF-07, WF-09, RL-01, RL-02, RL-03, RL-04, RL-12, BG-01, BG-03, BG-04, BG-05, BG-06, BG-08, BG-09, BG-10, BG-11, BG-12 |
| Later | 7 | UI-10, UI-12, WF-02, WF-08, RL-08, RL-09, RL-13 |
| No objection | 4 | WF-01, WF-10, WF-11, BG-07 |

Total: 14 + 28 + 7 + 4 = 53. Many of the Shrink verdicts are merges, so the 28 collapse into about 8 actual changes (see the complexity budget).

## Complexity budget

This is the most I would accept before the app gets harder, not easier, for a beginner. It's a **ceiling**, not a wish list. The candidate's prototype should pick **one** item from it, as the brief asks.

**Hard limits**
- **0 new tabs, 0 new panels** above the page or in the shift bar. No checklist, summary card, stepper, legend, glossary, search box or name prompt.
- **At most 1 new button per open slip row** (the return button opens the panel). At most 2 buttons in that panel.
- **1 message slot** for errors, successes and Undo, mirrored to the existing status bar.
- **1 form layout** for issuing, and at most 1 new entry point into it.
- **0 version bumps.** New loan fields must be optional (`backAt` only, maybe `who`/`due` edits). Transient UI state (`confirming`, `formError`, `lastAction`) is never saved, or is reset in `restore()`.
- **0 new time logic** beyond one 6-entry lookup. No relative hours, no sorting.
- **Keep K1–K12**, in particular both guard rails as backstops, one loan per unit, hidden in-repair and on-loan units, one-way time, and Restart.
- **No pre-answers** to the 4 judgments (who may collect, the adapter is needed, what's still out, which adapter came back).

**The allowed set (8 changes, in priority order)**

| # | Change | Source ideas | New state | Approx. size |
|---|---|---|---|---|
| 1 | Inline message above Save for the 2 reachable errors, with fix-it wording, set without repainting | WF-11 + BG-03 wording | none | ~10 lines |
| 2 | Model and shelf on slip rows and in unit options | BG-07 | none | ~4 lines |
| 3 | "Late · was due Fri 8 pm" text badge on open slips | BG-08 / WF-09 / RL-04 / UI-02 | none (derived) | ~12 lines + 1 CSS rule |
| 4 | Return panel in the row: "Check the label: AD-12 · Belkin AVC002 · shelf C4", [Yes, AD-12 is back] / [Not this one]; then "Returned · Undo" in the message slot until the next action; stamp `backAt` | RL-01 + BG-09 + RL-03 (Undo) + RL-02 (time only) | `backAt` (optional); `confirming`/`lastAction` not saved | ~35 lines |
| 5 | Prefill "Return by" from the request | WF-03 (first half) | none | 1 line |
| 6 | Request progress: derived badge + one line per item | WF-10 (+RL-12, BG-12) | none | ~20 lines |
| 7 | "Issue this request" button that opens today's form with the request fixed and units filtered to that request | WF-01 + WF-04 | `editing` may be a request ID | ~20 lines |
| 8 | Rename 3 labels + a caption under the time button | BG-01, BG-10 (shrunk) | none | text only |

Total: about 100 lines on a 496-line file, with no new screens and no migration. Anything past this, in particular WF-02 (batch form), WF-07/RL-05 (slip editing), any note-linking, or any guidance panel, should have to prove that it's worth more than the one-change prototype the brief asks for. Those items should also come *instead of* something above, not on top of it.

**Which one I'd prototype for the brief:** #4, the return panel with the label check and Undo. It's the "moment to change" (one-click close, AD-12/AD-15 in bin C4). It keeps the "moment handled well" intact (the type and quantity guard rails at issue time). And it gives a clear real-counter observation: how often does a returned unit's label not match the slip?

## Rebuttal

The user has chosen a full overhaul, so I drop the "one change only" argument. The question now is which overhaul still feels like *one* simple app to a beginner. The FOR side and I already agree on most of it: the top four Musts, no step back, no hint checklist, notes as secondary. The gaps that remain are about **pre-answering the judgments** (G04's look-alike line, G06's collector list), **extra surfaces** (G13, G15's stepper, G09's separate banner), and **state that nobody sees** (G18).

One factual correction first. FOR says that `app.js` line 442 "`return`s **silently**" for an invalid person or unit. That's true in the code, but the UI can't reach it: every select is `required`, the people list is fixed, and the unit list already hides on-loan and in-repair units (K5, K6). A generic fallback message there costs nothing, but it's not a user-facing bug.

### Final position per group

| Group | Position | How / answer to FOR's best argument |
|---|---|---|
| **G01** Inline errors | **Accept-shrunk** | Agreed: BG-03 wording, `aria-invalid` and focus, and the no-repaint trick (K3). For the unreachable branches, one generic line ("Choose an item and a person from the lists"), not per-case copy. |
| **G02** Return check + Undo | **Accept-shrunk** | FOR's best argument is that a wrong unit silently corrupts stock. I agree, and it's fixed by *not closing* the slip. **"No, it says something else"** keeps the slip open and shows one line: "This slip is for AD-12 (Belkin). Keep it open and ask where AD-12 is." No same-type dropdown. "Brought back by" is accepted as a prefilled select (0 clicks in the normal case), and `backAt` is stamped. Undo lasts until the next action. **Reopen is Later**: Undo covers instant regret, and Restart covers the rest of a 3-step sample. Never show the look-alike sentence in the panel (see G04). |
| **G03** Overdue | **Accept-shrunk** | I concede the sort: sorting Outstanding **by due time, oldest first** is a fixed order that doesn't move when another row closes, so pain point 7 isn't made worse. Use 3 looks only (Late, Due today, plain), all with text. No relative "13 h", no count in the tab name, no legend. Add "returned late" on closed rows, using `backAt`. |
| **G04** Model + shelf | **Accept-shrunk** | Accept the text on rows and in unit options (BG-07). **Reject the look-alike line.** FOR says real stores label kit, but the label *is* the check: G02's panel already shows "AD-12 · Belkin AVC002", which the user compares against the sticker. A permanent "AD-15 looks the same" line does step 3's judgment for the candidate. On every adapter row it also becomes noise people learn to ignore. |
| **G05** Issue a whole request | **Accept-shrunk** | Accept WF-01 + WF-04: "Issue this request" opens today's form with the request fixed and units filtered (model and shelf shown, one option preselected when only one is free). FOR's best argument is "12 choices → 3, the film starts at four". I'd get most of that more cheaply with a **sticky form**: after Save, stay on the same request, keep "Collected by" and "Return by", and drop the issued type from the list. That's about 4 choices and 3 saves, with no new form shape and no all-or-nothing validation, and K1/K2 stay visible. **WF-02's checklist form is Later.** |
| **G06** Prefill + who may collect | **Accept-shrunk** | Prefill "Return by" with the "Request says Fri 8 pm" hint: accept. **Reject the `allowed` list.** FOR concedes it "partly answers a judgement question". Moving it into the issue form doesn't change that, because it's still the Desk book's answer copied into data, plus a new tick-to-confirm pattern. |
| **G07** Plans changed | **Accept-shrunk** | Accept. It's the strongest "real counter" argument, and in an overhaul it beats note-linking. Use 2 fields in the same in-row panel pattern as G02. Store one optional `was: {who, due}`, **not** a `history` array or `origDue` (the request already holds the original due). The badge follows the agreed time, and the row shows "(was Kabir Sen · Fri 8 pm)". The soft warning past the request's return time is fine. |
| **G08** Request progress | **Accept** | Derived, text only: list badge plus per-item lines. No segmented bar, no "Lend this item" button (G05 is the single entry point). |
| **G09** Done confirmation | **Accept-shrunk** | It isn't a separate banner. It goes in the **same message slot** as G01's error and G02's Undo, at the top of the Loans page and mirrored to the status bar. Keep the shelf hint ("Put it on shelf C4"). No "Lend another" button (the G05 sticky form does that). |
| **G10** Notes linked to slips | **Later** | FOR concedes its value "drops a lot" once G07 ships. Two ways to record "Leela has it" would confuse a beginner. |
| **G11** Labels + glossary | **Accept-shrunk** | Accept relabelling the shown text only, with short labels: tab "Loans", "Lend an item", "Who is taking it?", "Shelf C4", "Still out / All loans". Keep the `pages`/`screens` keys. **Reject the glossary**: plain labels make it unnecessary, and it would be a third `<details>` next to the Candidate brief. |
| **G12** Empty states + legend | **Accept-shrunk** | One-sentence empty states and the generic note placeholder. No `empty()` component with icons, no legend (3 badge looks need none), no character counter. |
| **G13** Guidance / summary | **Reject** | FOR "would defend [it] least". After G03 + G07 + G08, a summary card only repeats the register, and a checklist gives away the test. The story text stays the guide. |
| **G14** Find by sticker ID | **Later** | FOR rates it Could. With 2 to 4 open slips, G04's text plus G02 is the lookup. |
| **G15** Time control | **Accept-shrunk** | Accept the caption ("Jumps the story to Fri 7:30 pm. Your records stay.") and the better status message. **Reject** the stepper (the clock already shows the desk time, and the stepper looks clickable), the "2 of 3 lent, move on anyway?" check (it pre-answers step 1 and adds a dialog), and step back (both sides agree, K11). |
| **G16** Condition on return | **Reject** | Nothing in the story needs it, it adds a decision to every return, and it risks K5 (merging with PR-06's static `repair` flag). Revisit only if a damage scenario is added. |
| **G17** Void / swap issue | **Later** | Extend G02's Undo slot to cover the last *issue* as well ("Issued PR-04 · Undo"). That fixes the step 1 slip of the finger with no `void` flag spread through `out()`, K2 and progress. |
| **G18** Slip history | **Reject** | FOR: "store `history` quietly, show it later". State nobody sees is cost with no benefit, and every handler gains a `log()` call. G07's `was` and G02's `backAt`/`backBy` give the visible 90%. |
| **G19** Staff name | **Reject** | FOR concedes that "who" is always the candidate. It's a prompt at every step for no gain. |
| **G20** Badges vs buttons | **Accept-shrunk** | Accept verb + ID labels ("Return AD-12") and keep badges flat, never clickable. Skip zebra stripes and row hover. The aligned ID column is fine if it's one `grid-template-columns` rule. |
| **G21** Focus | **Accept-shrunk** | Accept 3 cases: tab change → `h2`, form open → first field, after return/Undo → the message slot (not "next row's button", which jumps somewhere the user didn't choose). Add `aria-current="page"`. |
| **G22** Sizing / mobile | **Accept-shrunk** | Accept BG-11: 14px `--ink` status text, the contrast fix, ≥40px buttons and selects, rows stacked under 420px. **Bottom tab bar: Later.** |

**Tally (22 groups):**
- **Accept (1):** G08.
- **Accept-shrunk (14):** G01, G02, G03, G04, G05, G06, G07, G09, G11, G12, G15, G20, G21, G22.
- **Later (3):** G10, G14, G17.
- **Reject (4):** G13, G16, G18, G19.

Within the accepted groups, these parts are rejected or delayed: G02's Reopen, G04's look-alike line, G05's batch form, G06's collector list, G11's glossary, G15's stepper, move-on check and step back, and G22's tab bar.

### Revised complexity budget (full overhaul)

The aim is an app that does more but has **the same shape**: the same 4 tabs, the same row pattern, the same one-way 3-step story.

**Hard limits**
1. **0 new tabs, 0 new panels** above the page or in the shift bar (no summary, checklist, stepper, search or glossary).
2. **One message slot** (top of the Loans page, mirrored to the status bar) for every error, success and Undo. Exactly one message is visible at a time.
3. **One in-row panel at a time** (`s.panel = {num, kind: "return" | "update"}`). Opening one closes any other.
4. **At most 2 buttons per open slip row**: "Return AD-12" and "Update". At most 2 primary choices inside a panel.
5. **3 badge looks**: Late, Due today, plain (plus the existing On shelf/On loan/In repair/Returned, unchanged in style).
6. **One issue form layout** and one new entry point ("Issue this request"). "New issue slip" (renamed "Lend an item") stays.
7. **Saved state grows by at most 3 optional loan fields**: `backAt`, `backBy`, `was`. **No version bump.** All readers default missing fields. Transient UI state (`panel`, `formError`, `lastAction`, the sticky form's `editing` request) is **removed before saving** or reset in `restore()`, because the `{...d}` spread would otherwise persist it.
8. **One time lookup** (6 entries). No relative times.
9. **Keep K1–K12**: both guard rails stay as backstops behind the filtered list, one loan per unit, hidden unavailable units, one-way time, Restart as the full reset.
10. **No pre-answers**: no authorised-collector list, no look-alike sentence, no task checklist, no "move on anyway?" count.

**Build order (each step leaves a working app)**

| # | Change | Groups | Approx. lines |
|---|---|---|---|
| 1 | Message slot: inline errors, success with shelf hint, Undo of last return/issue | G01, G09, (G17 shrunk) | ~30 |
| 2 | Model + shelf on rows and options; verb + ID button labels | G04, G20 | ~10 |
| 3 | Late / Due today badge, oldest-due-first order, "returned late" | G03 | ~20 |
| 4 | In-row return panel: label check, prefilled "Brought back by", `backAt`, "something else" keeps the slip open | G02 | ~40 |
| 5 | "Issue this request" + filtered units + prefilled Return by + sticky form | G05, G06 (prefill) | ~35 |
| 6 | In-row "Update" panel with `was` | G07 | ~30 |
| 7 | Request progress lines and badge | G08 | ~20 |
| 8 | Plain labels, empty states, time-button caption, status wording | G11, G12, G15 | text + ~10 |
| 9 | Focus (3 cases), `aria-current`, BG-11 sizing and contrast | G21, G22 | ~15 + CSS |

That's about 210 lines of JS on a 496-line file, plus about 40 lines of CSS. **The beginner check**: at Sat 9:00 am, the Loans tab should show at most 2 open rows, each with at most 2 buttons and 1 badge, plus 1 message. If any planned change pushes past that, it goes to Later.
