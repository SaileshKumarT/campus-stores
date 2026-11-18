# 03 · Real-life scenarios & error ideas

What really happens at a counter (wrong look-alike unit, someone else returning, proxy pickup, late or damaged kit, plans changing, shift changes), and how Campus Stores should record it, check it, and let a beginner fix a mistake. Evidence refers to `00-walkthrough.md`.

> **State note (applies to every idea that adds fields):** the saved shape is `campus-stores.shift.v1` and `restore()` rejects anything that isn't `version === 1`. Any new loan/note/asset field means bumping to `version: 2` (new key `campus-stores.shift.v2`, or the same key with a version check). `restore()` must accept v2, check the new fields, and ideally migrate a v1 save by filling defaults (`backBy: ""`, `backAt: null`, `condition: "ok"`, `history: []`) rather than throwing it away. `original()` gets the same defaults. "Restart sample shift" stays as the full reset.
>
> **Time note:** several ideas compare times. Add one small lookup, e.g. `const clockOrder = {"Fri 3:45 pm":0,"Fri 7:30 pm":1,"Fri 8 pm":1.5,"Sat 9 am":2,"Sat 10 am":2.5,"Sat noon":3}`, plus `phaseLabel = ["Fri 3:45 pm","Fri 7:30 pm","Sat 9 am"]`. This works with the fixed 3-step time control, with no real clock needed.

## RL-01 · "Which unit is in your hand?" check on return
- **Scenario / problem:** Step 3, Loan register. Leela hands over "an adapter". The slip says only "AD-12". AD-15 (Anker) looks the same and sits in the same bin C4. "Record return" closes the slip without asking which physical unit came back (pain points 6, 9). If she actually hands in AD-15 (which was never lent out), the app would put AD-12 "on shelf" while it is still missing.
- **Proposed change:** Clicking "Record return" opens a small inline panel on that row: "Check the sticker on the item. It should say **AD-12 · Belkin AVC002** (shelf C4)." Two big buttons follow: "Yes, it says AD-12" / "No, it says something else". "Something else" shows a dropdown of same-type units (AD-12, AD-15) with their models. If the user picks a unit that isn't on loan (AD-15): "AD-15 was never lent out. Don't take it as this return. Ask the borrower where AD-12 is." The slip stays open, and you can add a linked note (RL-09).
- **How a mistake gets corrected:** Nothing is closed until the unit is confirmed, so the classic wrong-unit mistake is stopped before it's saved. If the wrong unit was confirmed anyway, use RL-03 Undo.
- **User benefit:** Stops the most expensive counter error (a lost unit hidden as "returned"). It turns a memory task into a "read the sticker" task that a beginner can do.
- **Effort:** S–M
- **Files touched:** `app.js`: `register()` (inline confirm panel when `s.confirming === num`), click handler `return` → split into `return-start` / `return-confirm` / `return-mismatch`. Optional transient `s.confirming` (don't persist it, or default it in `restore()`). `styles.css`: confirm panel style.
- **Risks / trade-offs:** Adds one click per return. Keep "Yes, it says AD-12" as the big default button so a correct return is still fast. Without a barcode scanner this depends on the user honestly reading the sticker.

## RL-02 · Record who brought it back and when
- **Scenario / problem:** Step 2/3. Kabir returns 2 items and Leela returns the third, but "All slips" just says "Returned", with no name, time, or late flag (pain point 10). If a unit later turns up damaged, nobody knows who handled it.
- **Proposed change:** The return panel (RL-01) has "Returned by" prefilled with the slip holder, and you can change it to anyone in `people` (Leela). The current desk time is stamped automatically. The closed row reads: "Returned Sat 9 am by Leela Das · 13 h late".
- **How a mistake gets corrected:** If the name was wrong, the closed slip has a "Fix details" link that lets you edit `backBy` only, and the change is logged in the slip's history (RL-14).
- **User benefit:** Gives you a real paper trail. It answers "who had it last?" without searching the Desk book.
- **Effort:** S
- **Files touched:** `app.js`: loan gets `backBy`, `backAt` (phase index); `register()` row text; return handler. **Needs a version bump + `restore()` update.**
- **Risks / trade-offs:** One more field in the panel. Prefilling it keeps the common case at zero extra choices.

## RL-03 · Undo / reopen a mistaken return
- **Scenario / problem:** Step 2. Returns are one click, the list moves up after each one, and a fast second click can close the wrong row (pain points 6, 7). Today the only fix is "Restart sample shift", which wipes the whole shift.
- **Proposed change:** (a) After any return, the status bar (and a toast beside the list) shows "L-402 closed · **Undo**" until the next action. (b) Every closed slip in "All slips" has "Reopen slip", which asks for a one-tap reason ("Closed by mistake" / "Wrong unit" / "Other"). The slip goes back to open with its original holder and due time.
- **How a mistake gets corrected:** This idea *is* the correction path. Undo covers instant regret, and Reopen covers mistakes found later (for example, the morning shift finds AD-12 still missing).
- **User benefit:** Makes it safe to try things. Beginners stop fearing the "Record return" button.
- **Effort:** S
- **Files touched:** `app.js`: `s.lastAction` (transient), click handler cases `undo`, `reopen`; `register()` adds the button on returned rows; `paint()` shows the Undo button in the status bar. History entry via RL-14.
- **Risks / trade-offs:** If a unit has been reissued since, Reopen must be blocked ("AD-12 is out again on L-406. Close that first."). The check is easy because `out(id)` already exists.

## RL-04 · Overdue and "due soon" flags
- **Scenario / problem:** Step 3. L-404 is 13 h overdue but looks exactly like L-401 (due in an hour) (pain point 8). The new shift can't tell what to chase first.
- **Proposed change:** Compare `clockOrder[l.due]` with the current phase time. Open slips get a badge: red **"Late · was due Fri 8 pm"** or amber **"Due today 10 am"**. Overdue slips are sorted to the top of Outstanding. The Loan register tab label shows a count, e.g. "Loan register (1 late)". On return, a late item is stamped "returned late" (RL-02).
- **How a mistake gets corrected:** If an item is late only because plans changed and that was agreed (Leela at 9 am), the staff member uses RL-05 to change the due time. The flag then clears honestly, with history showing the original due time.
- **User benefit:** Makes the morning shift's first job obvious. It also makes it clear that agreed changes must be recorded.
- **Effort:** S
- **Files touched:** `app.js`: `clockOrder` lookup, `register()` sort + badge, `paint()` nav label. `styles.css`: `.tag.late`, `.tag.soon` (with text, not color only). No state change needed (it's derived).
- **Risks / trade-offs:** It's a coarse fixed-step clock. Labels must match the option strings exactly. Don't make "late" look like an accusation; say "Late" as a fact.

## RL-05 · "Plans changed": change the holder or return time on an open slip
- **Scenario / problem:** Step 2. Kabir says "Leela has the adapter, back Sat 9 am", but L-404 can't be edited, so it still says "Kabir Sen · Due Fri 8 pm" (pain point 11). That fact lives only in free text.
- **Proposed change:** Each open slip has a "Plans changed" button with two fields: "Now with" (people list) and "New return time" (the same option list). It also has an optional "Who told you?" (prefilled with the current holder). Saving updates the slip and adds a history line: "Fri 7:30 pm · Kabir said Leela Das has it, back Sat 9 am." The row then reads "Now with Leela Das · Due Sat 9 am (was Fri 8 pm)".
- **How a mistake gets corrected:** You can open "Plans changed" again to correct it. The history keeps both versions, so nothing is silently overwritten.
- **User benefit:** The register tells the truth on its own, and the morning shift doesn't need to read the Desk book to know Leela is coming.
- **Effort:** M
- **Files touched:** `app.js`: loan gets `history: []` and `origDue`; `register()` inline edit form; submit handler `[data-replan]`. **Version bump + `restore()`.**
- **Risks / trade-offs:** If someone extends a due time past the request's "Return by" (RQ-214 is Fri 8 pm), show a soft warning: "This is later than the club's approved return time." Don't block it, because the desk often has to accept reality.

## RL-06 · Pickup by someone else: authorised collectors on the request
- **Scenario / problem:** Step 1. Kabir collects for Isha. The authorisation exists only as a Desk book message, and "Collected by" accepts anyone (pain point 4). A stranger named in the list could walk off with the kit, and the request note ("The host will collect") is ambiguous.
- **Proposed change:** Give each request an `allowed` list in the fictional data: RQ-214 `["Isha Rao","Kabir Sen"]` (from Isha's 3:20 pm message), RQ-209 `["Tara Shah"]`, RQ-217 `["Dev Menon"]`. The request view shows "Can collect: Isha Rao, Kabir Sen (per message Fri 3:20 pm)". In the issue form, picking someone not on the list shows an inline warning beside the field: "Leela Das isn't listed for RQ-214. Only continue if the club has told you." Continuing needs a tick: "I checked with the club".
- **How a mistake gets corrected:** A wrong collector picked by accident is caught by the warning before saving. If someone was wrongly issued to, RL-08 Void fixes it.
- **User benefit:** Gives the beginner a clear answer to "Can he leave with it?" without reading another tab. It matches the real counter question in the shift bar.
- **Effort:** S
- **Files touched:** `app.js`: `requests[].allowed` (static sample data, no state change), `requestPage()`, `register()` form, `[data-issue]` submit validation (soft check + checkbox).
- **Risks / trade-offs:** Hard-coding the list from a message is a simplification. In real life the desk would add a name when a message arrives, which could be a later "Add collector" button. Keep it as a warning, not a block.

## RL-07 · Condition on return: OK / damaged / parts missing / lost
- **Scenario / problem:** Not covered at all. A projector comes back with a cracked lens, an adapter is never found, or a speaker is missing its power cable. "Record return" only knows "back on the shelf", so a broken unit becomes "On shelf" and gets lent out to the Photo Circle next.
- **Proposed change:** The return panel adds "Condition" with two big choices: **Good** (default) / **Damaged or missing parts** (short note required). Loss is a separate action: an open slip gets a "Report lost" button. Damaged → the slip closes, and the unit is set to "In repair" (an override in `s.repairs`), so it disappears from the issue dropdown just like PR-06. Lost → the slip is marked "Lost · reported by X", and the unit shows "Missing" in Inventory.
- **How a mistake gets corrected:** In Inventory, a damaged or missing unit gets "Back in service" or "Found it", which logs who and when. A wrong condition on return can be fixed with RL-03 Reopen.
- **User benefit:** Stops broken kit going straight back out. It also gives the store manager a record to follow up with the club.
- **Effort:** M
- **Files touched:** `app.js`: loan `condition`, `conditionNote`; `s.repairs` / `s.missing` arrays of asset IDs; `inventory()` status logic (today it's `a.repair`, which must merge with the state override); `register()` available-units filter; return handler. **Version bump + `restore()` validation of new arrays.**
- **Risks / trade-offs:** Adds a decision to every return. The default "Good" keeps it one tap. Don't build a fine or charge workflow.

## RL-08 · Void or swap a mistaken issue slip
- **Scenario / problem:** Step 1. The beginner picks AD-15 in the dropdown but hands over AD-12 from bin C4, or picks the wrong request, or the wrong person (pain points 3, 9). Today the only "fix" is to record a return for an item that never came back, which leaves a false history.
- **Proposed change:** On an open slip created in the **current** time step, show "Fix this slip" with two options: **"Wrong unit: swap to…"** (same-type units only, so AD-12 ↔ AD-15) and **"Cancel: it never left the desk"** (marks it `void`, not "Returned"). Slips from earlier steps can't be voided; use return or "Plans changed" instead.
- **How a mistake gets corrected:** Directly. The register then shows what physically left the desk, and the voided slip stays visible as "Cancelled at issue" in All slips for honesty.
- **User benefit:** You can correct mistakes without faking a return. It also prevents the AD-12/AD-15 mix-up from spreading into the morning shift.
- **Effort:** M
- **Files touched:** `app.js`: loan `void: true`, `issuedAt` (phase); `register()` buttons; click/submit handlers `swap`, `void`; `out()` must ignore void slips. **Version bump + `restore()`.**
- **Risks / trade-offs:** The "only in the same step" rule needs a short explanation in the UI. A swap must re-run the "same type already on loan" guard.

## RL-09 · Link a handover note to a slip
- **Scenario / problem:** Step 2. The handover note "Leela has the adapter…" isn't linked to L-404 or AD-12 (pain point 12). In step 3, the new staff member has to piece the Desk book and the register together by hand.
- **Proposed change:** Each open slip gets "Add note for next shift", which reuses the same textarea but saves `{phase, text, loan: 404}`. The note then appears in two places: in the Desk book with a tag "About L-404 · AD-12", and **under the slip row itself** as a small yellow memo line. The general Desk book form also gets an optional "About which slip?" dropdown.
- **How a mistake gets corrected:** Notes get "Edit" and "Remove" within the same time step. After that they're locked and you add a follow-up note instead, so the trail stays honest.
- **User benefit:** The information is where the work happens. When Leela walks in, the slip already says why.
- **Effort:** S–M
- **Files touched:** `app.js`: note gains optional `loan`; `deskbook()` tag + dropdown; `register()` shows the memo under the row; `[data-note]` submit. **Version bump + `restore()` (validate that `loan` refers to an existing slip).**
- **Risks / trade-offs:** RL-05 history covers part of this. Keep notes for "soft" information (for example, "she might be late, call her") and RL-05 for facts.

## RL-10 · "Who's on the desk?" name per shift (no login)
- **Scenario / problem:** Step 2 → 3. The note author is always "Counter handover" and actions have no staff name (pain point 12). At a real desk, the morning staff member wants to ask "who took this return last night?"
- **Proposed change:** When the time moves to a new step (and on first load), a tiny prompt in the shift bar asks "Your first name for this shift:" with a text input and a "Start shift" button, which can be skipped. That name is stamped on issues, returns, plan changes and notes ("Note from Priya · Fri 7:30 pm"). It is not a login, has no password, and is just a label.
- **How a mistake gets corrected:** Typed the wrong name? Click it in the shift bar to change it. Changing it doesn't rewrite past stamps.
- **User benefit:** Makes the handover accountable and human. The next shift knows whom to message.
- **Effort:** S
- **Files touched:** `app.js`: `s.staff` (per phase: `{0:"",1:"",2:""}`); `paint()` shift bar; stamps in the return/issue/note handlers; `deskbook()` author. `index.html`: no change (rendered into the shift `<aside>` via JS, with the existing advance button kept). **Version bump + `restore()`.**
- **Risks / trade-offs:** It's one more thing to type. Make it optional and default the label to "Desk staff". Names are fictional or user-typed and stay local.

## RL-11 · Start-of-shift summary ("What's waiting for you")
- **Scenario / problem:** Step 3. "You've just taken over… work out what was outstanding." Right now that means combining two tabs by hand (walkthrough step 3, pain point 15).
- **Proposed change:** When the phase changes, the Loan register (or a card above every tab, which can be dismissed) shows an auto-built list: "**1 late:** AD-12 (Belkin, shelf C4), RQ-214, now with Leela Das, expected Sat 9 am · see note. **Due today:** MI-09 with Tara, 10 am. **Notes from last shift:** 1." Each line has a "Go to slip" button that scrolls to and highlights the row.
- **How a mistake gets corrected:** It's derived from the slips, so fixing a slip (RL-05, RL-08) fixes the summary automatically. Nothing new is stored.
- **User benefit:** A beginner gets a to-do list instead of a puzzle. It mirrors how a good human handover sounds.
- **Effort:** M
- **Files touched:** `app.js`: new `summary()` helper used in `register()` (or in `paint()` above `[data-page]`); uses RL-04 `clockOrder`; `s.summaryDismissed` per phase (transient or persisted).
- **Risks / trade-offs:** It overlaps with the workflow agent's "what to do now" guidance. Keep it purely about records, not instructions. It's only useful if RL-05/RL-09 data exists, but it still works with just overdue/due-today.

## RL-12 · Request kit status: "what's still out for this event"
- **Scenario / problem:** Step 2/3. RQ-214 always says "Approved" (pain point 13). When Kabir brings back "the kit", the desk can't see at a glance that 2 of 3 items are back and the adapter isn't.
- **Proposed change:** In the request view, each approved item line shows its live state: "HDMI projector: PR-04 · Returned Fri 7:30 pm by Kabir ✓", "USB-C → HDMI adapter: AD-12 · **Still out** with Leela Das, due Sat 9 am", "Not issued yet" for anything missing. The header badge changes from "Approved" to "Partly returned (2 of 3)" and then "Complete". The list view shows the same badge per row.
- **How a mistake gets corrected:** It's derived, so it updates after any Undo or Reopen. A "Not issued yet" line right before the event warns the desk that the kit is incomplete (for example, they forgot the adapter that the USB-C-only laptop needs).
- **User benefit:** Answers both counter questions ("Does he have everything?" and "Is the event's kit all back?") on one screen.
- **Effort:** S
- **Files touched:** `app.js`: `requestPage()` only (reads `s.loans`). No state change.
- **Risks / trade-offs:** None major. Use plain words ("Still out", "Back") per the language agent.

## RL-13 · Find the slip from the item in hand
- **Scenario / problem:** Step 3. Leela puts an item on the counter. The user has to scan a list of look-alike rows ("L-404 · AD-12" vs "L-401 · MI-09") and click the right identical button (pain points 7, 9).
- **Proposed change:** Put one box at the top of the Loan register: "Item on the counter? Type the sticker ID". Typing `ad-15` or `15` filters live. If a matching open slip exists, it shows that slip's return panel directly (RL-01). If the unit isn't on loan, it says: "AD-15 is not lent out. It should be on shelf C4. Is this really ours?" and also lists open slips of the **same type** ("Open adapter slip: L-404 · AD-12 · with Leela"). That catches look-alike swaps.
- **How a mistake gets corrected:** A wrong ID typed returns "No slip found", which is harmless. The look-alike hint points the user to the real open slip and RL-01 confirms it.
- **User benefit:** Starting from the object is how a counter actually works. There's no need to hunt the list, so no misclicks.
- **Effort:** S–M
- **Files touched:** `app.js`: `register()` search input; `input` event listener (new, alongside the `change` handler); transient `s.find`. No persistent state change (or add `find` to `restore()` defaults if saved).
- **Risks / trade-offs:** The workflow agent may propose something similar. Re-rendering on every keypress via `paint()` loses input focus, so update only the results container, or render on `change`/Enter.

## RL-14 · Slip history (one timeline per slip)
- **Scenario / problem:** It's a foundation for RL-02/03/05/07/08. Today a slip holds only its current values, so there's no way to see "issued to Kabir → said to be with Leela → returned by Leela late" (pain points 10, 11).
- **Proposed change:** Each loan gets `history: [{phase, staff, text}]`, appended by every action (issue, plan change, note link, return, reopen, void, swap). In "All slips", each row expands ("Show history") into a short list in plain sentences.
- **How a mistake gets corrected:** You never edit history. Corrections add a new line ("Reopened: closed by mistake"), so a beginner can always see what happened and the manager can always trust it.
- **User benefit:** Gives the whole story of a unit in one place, which makes shift handovers and disputes with clubs easy.
- **Effort:** S (on its own) and it makes the other ideas cheaper
- **Files touched:** `app.js`: a `log(loan, text)` helper called from all handlers; `register()` expandable row (`<details>`, so no JS state). **Version bump + `restore()` (validate `history` is an array of `{phase, text}`, default `[]` when migrating v1).**
- **Risks / trade-offs:** The saved state grows slightly, which is fine for localStorage at this scale. Keep the sentences generated from templates so they stay consistent.

## Top 3 picks
1. **RL-01 · "Which unit is in your hand?" check on return.** It's the scenario the brief's step 3 actually tests (AD-12 vs AD-15, same bin), and it's the only error that silently corrupts stock. It's small and very visible in a demo.
2. **RL-05 · "Plans changed" (holder and return time).** Real counters run on changed plans. This fixes the step 2 → 3 handover at its source, so the register itself says "with Leela, due Sat 9 am". It also makes RL-04's overdue flag honest.
3. **RL-03 · Undo / reopen a mistaken return.** It's the cheapest way to make the app forgiving for a beginner, and today the only correction path is "Restart sample shift". Together with RL-14 history it gives every mistake a recorded, reversible fix.
