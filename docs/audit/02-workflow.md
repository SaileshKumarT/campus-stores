# 02 · Workflow & functionality ideas

Ideas to cut steps, prefill from the request, filter choices, link records and make mistakes reversible. Evidence comes from `00-walkthrough.md`; all changes stay vanilla HTML/CSS/JS, offline, localStorage.

> **State note.** WF-03, WF-05, WF-06, WF-07, WF-08 and WF-09 add fields to `s.loans` or `s.notes`. Bundle them in one shape change: `version: 2`, a new `storageKey` (`campus-stores.shift.v2`) or a v1→v2 migration inside `restore()`, and extend the `restore()` checks for each new field (e.g. `returnedAt` is a valid phase index, `noteFor` points at an existing loan number). A v1 save that can't be migrated should fall back to `original()` as it does today.

## WF-01 · "Issue this request" from the request form
- **Problem**: Time step 1. Issuing RQ-214 took 3 separate blank forms, 12 dropdown choices, plus a detour to the Requests tab to remember what was approved (pain points 1, 2, 3). The request view has no action button at all; it's a dead end.
- **Proposed change**: Add a primary button "Issue this request" on the open request (`requestPage()` when `s.selected`). It switches to Loan register with the issue screen already tied to that request (`s.editing = "RQ-214"` instead of `true`). The "Approved request" dropdown becomes a fixed read-only line ("RQ-214 · Film Society · Courtyard screening"), with a small "Change" link for the rare case it's wrong.
- **User benefit**: Removes 1 dropdown per slip and the tab-hopping. The request becomes the natural start of the job.
- **Effort**: S
- **Files touched**: `requestPage()`, click handler (new `issue-request` action), `register()` form branch, submit handler reads `req` from `s.editing` when set.
- **Risks / trade-offs**: `s.editing` changes type (boolean → string); `restore()` must accept both or reset to `false`. Keep "New issue slip" for the case where staff start from the register.

## WF-02 · One checklist form for the whole request
- **Problem**: Pain point 1. The form closes after each save and the next slip starts blank. 3 items = 3 form opens + 3 saves + 9–12 choices.
- **Proposed change**: When the issue screen is tied to a request (WF-01), show one row per approved item type: "HDMI projector → [unit dropdown]", "Portable speaker → [unit]", "USB-C → HDMI adapter → [unit]". Each row's dropdown lists only free units of that type (WF-04) and is preselected when only one is free. Below: one "Collected by" and one "Return by" for the whole set. A single "Issue 3 items" button creates 3 loans (still one slip per physical unit, so the register logic stays the same). Rows for types already on loan for this request show "Already out on L-402" instead of a dropdown. A "Leave this one" tick lets staff skip an item (e.g. unit missing).
- **User benefit**: RQ-214: 3 forms / 12 choices / 3 saves → 1 form / about 3 choices (adapter unit, collector, confirm) / 1 save.
- **Effort**: M
- **Files touched**: `register()` form branch, submit handler `[data-issue]` (loop over rows, validate all before pushing any so it's all-or-nothing), status message ("Issued 3 items to Kabir Sen: L-402, L-403, L-404").
- **Risks / trade-offs**: Must validate every row before writing anything, or a half-issued request appears. Bigger form on mobile; rows should stack.

## WF-03 · Prefill "Return by" and "Collected by" from the request and Desk book
- **Problem**: Pain points 2 and 4. "Return by" is blank even though RQ-214 says "Fri 8 pm"; any time can be picked. "Collected by" accepts anyone; Isha's authorisation of Kabir lives only in the Desk book (3:20 pm message).
- **Proposed change**: Preselect `due` from `r.due`. If staff pick a different time, show an inline hint "Request says Fri 8 pm" (allowed, not blocked). Add an `authorised` list to each request in the sample data (RQ-214: Isha Rao, Kabir Sen; RQ-209: Tara Shah; RQ-217: Dev Menon), shown as "Allowed to collect: Isha Rao, Kabir Sen (per Desk book 3:20 pm)". Put authorised names first in the "Collected by" list; picking someone else shows an inline warning "Not named on the request — check with the club before issuing" and needs a second click to confirm.
- **User benefit**: Return time becomes 0 clicks in the normal case; wrong-collector mistakes get caught at the counter instead of afterwards.
- **Effort**: S
- **Files touched**: `requests` data (new `authorised` field, static data so no state bump), `register()` form (`selected` attribute on options), submit handler (soft check).
- **Risks / trade-offs**: Hard-blocking unknown people would break real situations (a club sends a different member); keep it a warning. The authorised list is a simplification of the Desk book message.

## WF-04 · Filter the unit list to what the request needs
- **Problem**: Time step 1. The unit dropdown listed every free unit; I picked CA-03 for RQ-214 and only learned it was wrong from the status bar (pain points 3, 5).
- **Proposed change**: Once a request is chosen, the unit dropdown shows only free units whose type is in `r.items` and not already out for this request. Group with `<optgroup>` by type and show model and bin in the option text: "AD-12 · Belkin AVC002 · bin C4". If no unit of a type is free, show a disabled option "No HDMI projector on the shelf (PR-06 in repair)".
- **User benefit**: The "outside the approved request" error becomes impossible; one failed save and retry removed. Staff see where to walk to fetch the item.
- **Effort**: S (the non-checklist version needs the form to re-render on request change, via the `change` handler)
- **Files touched**: `register()` `available` filter, `change` handler (new `[name=req]` case storing a draft request), `opts()` or a small optgroup helper.
- **Risks / trade-offs**: Re-rendering on change wipes other selected values unless a draft (`s.draft`) is kept; WF-01/WF-02 avoids this by fixing the request before the form opens. Keep the submit validation as a backstop.

## WF-05 · Confirm return with the physical unit, plus Undo
- **Problem**: Time steps 2–3. "Record return" closed slips with one click, no confirmation, no undo, and the list shifted so a fast second click hits the wrong row (pain points 6, 7). At 9 am it never asked whether the adapter in Leela's hand was AD-12 (Belkin) or AD-15 (Anker), same bin C4 (pain point 9).
- **Proposed change**: "Record return" expands the row in place (no list move) into a small check panel: "Check the label on the item: **AD-12 · Belkin AVC002** (bin C4). Watch out: AD-15 Anker looks the same." Fields: "Brought back by" (prefilled with the slip holder, editable), and a typed or picked "Item ID on the label" that must match `l.asset`, or a simple "Yes, it's AD-12" button if typing is too much. Then "Close loan". After closing, the status bar and the row show "L-404 closed · Undo" for the rest of the time step; Undo sets `back` back to `false` and clears the new fields.
- **User benefit**: 1 click → 2 clicks per return, but wrong-row and wrong-unit closes become catchable and fixable without restarting the shift.
- **Effort**: M
- **Files touched**: `register()` row rendering (expanded state, `s.returning = num`), click handler `return` (split into `return-start`, `return-confirm`, `undo-return`), state gains `returnedBy`, `returnedAt` (phase index) on loans → version bump + `restore()`.
- **Risks / trade-offs**: Extra click on every return; typing the ID may feel slow at a busy counter, so offer the one-button match too. If the ID typed is AD-15, say clearly "AD-15 isn't on loan; this slip is for AD-12" rather than a generic error.

## WF-06 · Look up by item ID ("What's this item?")
- **Problem**: Time step 3. Leela walks in with an adapter. The staff member must open the Loan register, read L-404 "AD-12", then go to Inventory to learn it's the Belkin in C4 (pain point 9, and the "combine by hand" note).
- **Proposed change**: A single search box at the top of the page (above the tabs, works on any tab): "Type an item, slip or request ID". Typing "AD-12" (case-insensitive, also "ad12") shows one card: model, bin, status, and if on loan "On slip L-404 · RQ-214 · held by Kabir Sen · due Fri 8 pm · [Record return]". "AD-15" shows "On shelf, bin C4 — not on loan". "L-404" and "RQ-214" jump to the slip or request.
- **User benefit**: Counter job "someone hands me a thing" goes from 2 tabs + reading to 1 typed ID + 1 click, and the look-alike problem is visible immediately.
- **Effort**: M
- **Files touched**: `index.html` (search input in the shell or masthead), new `lookup()` renderer, `input`/`submit` handler, `s.lookup` (transient; can be excluded from saved state, no bump needed if not saved).
- **Risks / trade-offs**: One more control on screen; keep it a single input. Real labels may have barcodes later, which the same box would accept.

## WF-07 · Edit an open slip: holder and expected return
- **Problem**: Time step 2. Leela now has the adapter and will bring it Sat 9 am, but L-404 still says "Kabir Sen · Due Fri 8 pm" with no way to change it (pain point 11). By step 3 it looks 13 h overdue for the wrong person.
- **Proposed change**: An "Update" button beside "Record return" on open slips. It opens the same in-row panel with "Now held by" (people list) and "Expected back" (the 4 times), plus an optional reason ("Kabir says Leela has it"). Saving keeps the old values in a small `history` array on the loan and shows "Updated: was Kabir Sen · Fri 8 pm" under the row.
- **User benefit**: The register itself tells the 9 am shift "Leela Das · expected Sat 9 am" without reading the Desk book. 0 extra notes needed.
- **Effort**: M
- **Files touched**: `register()` row, click handler (`edit-slip`, `save-slip`), new fields `history:[{who,due,phase,reason}]` on loans → version bump + `restore()` validation.
- **Risks / trade-offs**: Changing due time can hide a real late return; keep the original request due visible ("Request said Fri 8 pm") and let WF-09 still flag it as late vs. the original.

## WF-08 · Link handover notes to a slip
- **Problem**: Time step 2. The handover note was free text, not tied to L-404 or AD-12, signed only "Counter handover" (pain point 12). At step 3 the new staff member must match note to slip by hand.
- **Proposed change**: In the Desk book note form, add an optional "About" dropdown listing open slips ("L-404 · AD-12 · Kabir Sen") and a "Your name" field (remembered per browser via a simple `s.staff` value set once per shift). Linked notes show a chip "L-404" that jumps to the slip; on the Loan register, a slip with notes shows "1 note" that expands inline. Also offer a "Add note" shortcut in each open slip row that opens the Desk book form with "About" prefilled.
- **User benefit**: Morning shift sees the note right on the slip: 2 tabs → 1. Notes carry an author.
- **Effort**: M
- **Files touched**: `deskbook()` form and entry render, submit handler `[data-note]` (save `loan`, `by`), `register()` row, new `s.staff` → version bump + `restore()` (validate `loan` refers to an existing `num`).
- **Risks / trade-offs**: WF-07 overlaps (both capture "Leela has it"). If WF-07 ships, notes become optional context rather than the only record. Keep the note field optional so free-form handovers still work.

## WF-09 · Overdue and "due soon" against desk time
- **Problem**: Time step 3. L-404 was 13 h past "Fri 8 pm" with no styling, and looked the same as L-401 due at 10 am (pain point 8).
- **Proposed change**: Give each due option and each time step a sortable number (e.g. Fri 8 pm = 20, Sat 9 am = 33, Sat 10 am = 34; step times 15.75, 19.5, 33). In `register()`, compare `due` to the current step: show "Overdue" badge (and "13 h late") or "Due in 1 h". Sort Outstanding with overdue first, then soonest due. On returns, store `returnedAt` and show "Returned Sat 9 am · late" in All slips.
- **User benefit**: The morning shift sees what needs action at a glance, with no mental date maths.
- **Effort**: S
- **Files touched**: `shifts` (add `hour`), a `dueHour` map, `register()` sort + badge, `badge()` (add a warning style in `styles.css`). Display-only parts need no state bump; storing `returnedAt` shares the WF-05 bump.
- **Risks / trade-offs**: Stable sorting matters so rows don't jump while the staff member is looking (pair with WF-05's in-place panel).

## WF-10 · Request progress on the Requests tab
- **Problem**: Time step 3. RQ-214 still said "Approved" after everything was issued and returned (pain point 13). There's no single place showing "what's outstanding from the screening".
- **Proposed change**: Compute status from loans: "Not started", "Issued 3/3", "Back 2/3 · AD-12 still out", "Complete". Show it as a badge in the request list and, in the open request, list each approved item with its unit, slip and state ("USB-C → HDMI adapter · AD-12 · L-404 · out, held by Leela Das"). Each line links to the slip.
- **User benefit**: The 9 am question "what's outstanding from the screening?" is answered on one screen, 0 cross-referencing.
- **Effort**: S (derived from existing state, no bump)
- **Files touched**: `requestPage()`, a new `progress(reqId)` helper.
- **Risks / trade-offs**: None big; it relies on loans being correct, which WF-05/WF-07 help with.

## WF-11 · Inline errors next to the button
- **Problem**: Time step 1. "This equipment type is outside the approved request" appeared only in the bottom status bar; the form looked like nothing happened (pain point 5). The silent `return` for an invalid person/unit gives no message at all.
- **Proposed change**: Render form errors in a `<p class="formerror" role="alert">` directly above "Save issue slip" and mark the offending field (`aria-invalid`, focus it). Every early `return` in the submit handler gets a plain message. Keep the status bar copy as well.
- **User benefit**: Error seen in the same spot as the click; no hunting.
- **Effort**: S
- **Files touched**: submit handler `[data-issue]`, `register()` (render `s.formError`), `styles.css`.
- **Risks / trade-offs**: Overlaps with the language/accessibility agent; coordinate wording. `s.formError` should be cleared on cancel/tab change and need not be saved.

## WF-12 · "Start of shift" summary on step change
- **Problem**: Time step 3. "Work out what was outstanding" requires reading Desk book and register by hand (pain point 15). The time button just says "Shift time updated."
- **Proposed change**: When the time moves forward, show a short card at the top of the page: "Since 7:30 pm: 2 loans open — L-404 AD-12 (overdue, last note: Leela brings it 9 am), L-401 MI-09 (due 10 am). 1 handover note." Each line links to the slip. Dismissible; reappears via a "Shift summary" link.
- **User benefit**: Handover reading drops from 2 tabs to 1 card.
- **Effort**: S–M (derived from state; a `summaryDismissed` flag can stay unsaved)
- **Files touched**: click handler `advance`, `paint()` or a new `summary()` renderer.
- **Risks / trade-offs**: Must not replace the shift bar story text (keep it). Might do too much of the candidate's thinking for them in an exercise context; keep it factual.

## WF-13 · "Step back" on the time control (keeps 3 steps)
- **Problem**: Pain point 16. Time only moves forward; to retry the 7:30 pm return you must Restart and redo the whole pickup.
- **Proposed change**: Keep the same 3 steps and button. Add a small secondary "Back to Friday 3:45 pm" link next to it that lowers `s.phase` by one. Loans and notes stay as they are (it's a view of time, not a history rewind), with a status line saying so: "Time moved back. Records you made stay."
- **User benefit**: Retry a step in 1 click instead of Restart + full replay.
- **Effort**: S
- **Files touched**: `index.html` shift aside (second button), click handler (`rewind`), `paint()`.
- **Risks / trade-offs**: Records made "in the future" (e.g. a 9 am return) then appear before their time, which can confuse; WF-09's `returnedAt` makes that visible. Could be left out if the exercise wants time to feel one-way.

## Top 3 picks
1. **WF-02 (with WF-01)** · One checklist form for the whole request. Biggest step cut (12 choices / 3 forms → ~3 choices / 1 form) and it removes pain points 1–3 at once, at the busiest moment (film starts at four).
2. **WF-05** · Confirm return with the physical unit, plus Undo. Directly fixes the riskiest moment in the story (AD-12 vs AD-15 in bin C4) and makes the one-click mistake correctable, which is the "easy to correct mistakes" goal.
3. **WF-07** · Edit an open slip. Puts "Leela has it, back Sat 9 am" on the record itself, so the morning shift reads the truth from the register instead of reconstructing it from the Desk book; WF-09/WF-10 then become accurate for free.
