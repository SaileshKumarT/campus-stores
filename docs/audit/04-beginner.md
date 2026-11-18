# 04 · Beginner student usability ideas

Ideas for a first-time student staffer with basic computer skills: plain words, clear next steps, confidence that an action worked, and accessibility. Evidence is from `00-walkthrough.md` and the source files.

## BG-01 · Plain-language labels with the old term as a hint

- **Problem**: Pain point 14. The first-time user has to decode "Loan register", "One slip per physical unit", "New issue slip", "Unit leaving the desk", "Save issue slip", "Record return", "Outstanding / All slips" and "bin" (shown as a bare "C4" in Inventory: "Belkin AVC002 · C4"). In step 1 nothing explains that a "slip" is one item lent to one person.
- **Proposed change**: Rename the visible text and keep the old term only where staff may hear it at a real desk:
  - Tab "Loan register" → "Loans (who has what)"; heading sub "One slip per physical unit" → "Each loan is one item lent to one person."
  - "New issue slip" → "Lend an item"; "Save issue slip" → "Lend this item".
  - "Approved request" → "Which club request?"; "Unit leaving the desk" → "Which item are you handing over?"; "Collected by" → "Who is taking it?"; "Return by" → "When must it come back?"
  - "Record return" → "Mark as returned".
  - Toggles "Outstanding / All slips" → "Still out / All loans (incl. returned)".
  - Inventory row sub "BenQ MH550 · A2" → "BenQ MH550 · Shelf A2"; "Workshop" stays.
  - Keep loan numbers ("L-404") as reference IDs: "Loan L-404".
- **User benefit**: The screen reads like the job ("lend", "who has it", "shelf"). Less to learn before the first customer.
- **Effort**: S
- **Files touched**: `app.js`: `pages`, `register()` (`head`, `select` labels, submit button, scope toggle labels, `btn("Record return")`), `inventory()` row sub, status strings in the submit and `return` handlers.
- **Risks / trade-offs**: The tab label gets longer (the 155px nav column may wrap). The Candidate brief says "loan", so wording still matches. Reviewers who memorised the old labels must relearn them. Keep the `pages` key and the `screens` map in sync, since `restore()` checks `s.tab` against `screens`. Changing the key breaks saved state, so keep the internal key "Loan register" and change only the shown text.

## BG-02 · "What to do now" checklist in the shift bar

- **Problem**: Pain point 15. Each step's shift bar tells a story ("Can he leave with everything he needs?") but never says which tab to open or what done looks like. In step 3 the user has to "combine the Desk book … and the Loan register by hand".
- **Proposed change**: Add a short, collapsible "What to do now" list under the story text for each step, with each item ticking itself when the state shows it done:
  - Step 1: "1. Open Requests → RQ-214 to see what Film Society needs. 2. Check the Desk book: who may collect? 3. In Loans, lend each item to that person (3 items)." Ticks: count of open loans on RQ-214 out of 3.
  - Step 2: "1. Mark the projector and speaker as returned. 2. Leave the adapter open — it isn't back yet. 3. Write a note for the morning shift in the Desk book." Ticks: L-402/L-403 closed, adapter still open, note count > 0.
  - Step 3: "1. Read the last shift's note in the Desk book. 2. In Loans, find the adapter that is still out. 3. Check the item in Leela's hand matches the model on the loan, then mark it returned."
  - The ticks only report what happened; nothing blocks the user.
- **User benefit**: A beginner always knows the next move and when they are finished, without being told the answer in full.
- **Effort**: M
- **Files touched**: `app.js`: `shifts` (add `todo` array), `paint()` (render list into the `.shift` aside); `index.html`: a container in `aside.shift`; `styles.css`: `.shift` list styles.
- **Risks / trade-offs**: It can make the exercise too easy, which takes away the "work it out" judgement the Candidate brief tests. Mitigation: keep it collapsed by default behind a "Need a hint?" `<details>`. The story text itself stays as it is.

## BG-03 · Show errors next to the button, in words that say how to fix it

- **Problem**: Pain point 5. In step 1, picking CA-03 for RQ-214 shows "This equipment type is outside the approved request. Choose an approved unit." only in the bottom status bar, far from "Save issue slip". The duplicate-type message ("The approved quantity of this equipment type is already on loan.") has the same problem. Some failures (person not in list, unit already out) `return` silently with no message at all.
- **Proposed change**: Render an inline message block just above the submit button, with `role="alert"`, and move focus to the field that is wrong:
  - Wrong type: "RQ-214 doesn't include a Digital camera. It covers: HDMI projector, Portable speaker, USB-C → HDMI adapter. Pick one of those."
  - Duplicate: "RQ-214 already has a Portable speaker out (SP-02, loan L-403). Each request gets one of each item."
  - Silent cases: "That item is already lent out or in repair. Pick another." / "Choose who is taking it from the list."
  - Still copy the message to the status bar for the history.
- **User benefit**: The beginner sees the problem where they are looking, learns what the request allows, and knows exactly what to change.
- **Effort**: S
- **Files touched**: `app.js`: submit handler `[data-issue]` branch, `register()` (add `<p class="formerror" role="alert" data-form-error>`); `styles.css`: `.formerror`.
- **Risks / trade-offs**: `commit()`/`paint()` re-renders the form and would wipe the selected values and the inline error. Either set the error text without repainting (as now), or keep the form values in state. Overlaps with the error-scenarios and workflow agents (who may filter the dropdown so this error can't happen).

## BG-04 · Keep keyboard and screen-reader focus after each re-render

- **Problem**: Every click calls `commit()` → `paint()`, which replaces `[data-nav]` and `[data-page]` via `innerHTML`. Focus lands on `<body>`. A keyboard user who presses Enter on "Record return" for L-402 (step 2) is thrown back to the top of the page and has to Tab through the exam strip, shift button and nav again. A screen reader announces nothing about the new screen.
- **Proposed change**: After `paint()`, put focus somewhere sensible, based on the action:
  - Tab change → focus the new page `<h2>` (give it `tabindex="-1"`).
  - "Lend an item" (new) → focus the first select.
  - Cancel / successful save → focus the "Lend an item" button.
  - "Mark as returned" → focus the next row's return button, or the "Still out" toggle when none are left.
  - "View form" → focus the request `<h3>`; "Back to list" → focus the "View form" button of the request just viewed.
  - Use `aria-current="page"` on the active nav button instead of only `aria-pressed`, and rename the section's `aria-label="Selected register"` to the tab name (for example "Loans").
- **User benefit**: Keyboard and screen-reader users can do a full shift without getting lost. Mouse users don't notice anything.
- **Effort**: M
- **Files touched**: `app.js`: click handler (record a `focusTarget` selector), `paint()` (apply it after render), `head()` (add `tabindex="-1"` to `h2`), nav markup in `paint()`; `index.html`: the section's `aria-label` (or set it in `paint()`).
- **Risks / trade-offs**: Moving focus unexpectedly can confuse people if it's overdone. Keep it limited to the cases above. Focus targets must not be saved to `localStorage` (they aren't part of the state shape `restore()` checks).

## BG-05 · Clear "it worked" confirmation at the place of action

- **Problem**: In step 1 the only feedback after "Save issue slip" is the status bar text "Issued PR-04 to Kabir Sen on slip L-402." in 12px muted text (`--quiet`) at the very bottom. The form just disappears. In step 2, "PR-04 returned to stock. Slip L-402 closed." appears the same way while the rows shift up (pain point 7). A beginner asks "did that work?".
- **Proposed change**: Show a success banner at the top of the Loans page for the most recent action, e.g. a green box: "Done: Projector PR-04 (BenQ MH550) lent to Kabir Sen. Due back Fri 8 pm. Loan L-402." with a "Lend another item for RQ-214" button. For returns: "Done: PR-04 (BenQ MH550) is back. Put it on shelf A2." Briefly highlight the new or changed row. Keep the status bar message too, and keep `aria-live="polite"` on it.
- **User benefit**: Immediate, visible proof the action went through, plus a hint of the next physical task (where to shelve the item).
- **Effort**: S
- **Files touched**: `app.js`: submit `[data-issue]` handler and `return` case (store `s.lastDone`), `register()` (render banner); `styles.css`: `.done` banner using `--ok`/`--oktxt`.
- **Risks / trade-offs**: `s.lastDone` is new state. `restore()` spreads `d` over `original()`, so an extra field is tolerated, but clear it on tab change to avoid stale banners. Overlaps with UI-visuals ideas on row highlighting.

## BG-06 · Helpful empty states and first-visit hints

- **Problem**: Pain point 15. The empty state is just "No outstanding slips." The Inventory filter can show nothing (e.g. "In repair" shows only PR-06; any filter with no matches shows an empty area with no message). The Desk book note box has no hint about what a good handover note contains.
- **Proposed change**:
  - Loans, "Still out", nothing open: "Nothing is out right now. Every item is back on the shelf. To lend something, press Lend an item."
  - Inventory filter with no matches: "No items are [On loan] right now. Choose 'All items' to see everything."
  - Desk book textarea placeholder and helper text: "Who has what, and when will it come back? e.g. 'Adapter AD-12 (Belkin) is still with Leela Das. She'll bring it at 9 am Sat. Loan L-404 is still open.'" Add a live counter "0 / 400 characters".
  - Requests list sub: "Student Activities Office · 3 approved forms" → "Club requests approved by the Student Activities Office. Open one to see what to hand out."
- **User benefit**: No blank screens. Each empty state explains why it's empty and what to do next, and the handover example teaches what the next shift will need.
- **Effort**: S
- **Files touched**: `app.js`: `register()` empty branch, `inventory()` (count shown rows), `deskbook()` textarea markup, `requestPage()` `head` sub; small `input` listener for the counter.
- **Risks / trade-offs**: The example note nearly gives away the step 3 answer. A more generic example ("Item, who has it, when it's due back, loan number") avoids that.

## BG-07 · Show the item name and model on every loan row

- **Problem**: Pain point 9. A loan row reads "L-404 · AD-12" / "RQ-214 · Kabir Sen · Due Fri 8 pm". A beginner doesn't know AD-12 is an adapter, and in step 3 can't tell it from AD-15 (same bin C4) without going to Inventory. The same codes-only problem exists in the "Unit leaving the desk" dropdown ("AD-12 · USB-C → HDMI adapter" without model or shelf).
- **Proposed change**: Row title: "USB-C → HDMI adapter · AD-12". Row sub: "Belkin AVC002 · Shelf C4 · For Film Society (RQ-214) · With Kabir Sen · Due Fri 8 pm". Dropdown option: "AD-12 · USB-C → HDMI adapter · Belkin AVC002 · Shelf C4". Add a short reminder on open adapter loans in the same bin: "Check the label: AD-15 (Anker) looks similar."
- **User benefit**: The beginner can match the thing in someone's hand to the record without switching tabs or memorising codes.
- **Effort**: S
- **Files touched**: `app.js`: `register()` row building and asset `select` options; possibly a helper `describe(assetId)`.
- **Risks / trade-offs**: Longer rows wrap on mobile (the 420px breakpoint). Overlaps with the error-scenarios agent (confirming the returned unit) and UI-visuals agent (row layout).

## BG-08 · Overdue and "due soon" labels in words, not only colour

- **Problem**: Pain point 8. In step 3 (Sat 9:00 am), L-404 "Due Fri 8 pm" is 13 hours late but looks the same as L-401 "Due Sat 10 am". A beginner has no reason to notice.
- **Proposed change**: Compare each open loan's `due` with the current step's time (a small lookup: step 0 = Fri 3:45 pm, step 1 = Fri 7:30 pm, step 2 = Sat 9:00 am). Add a text badge: "Late — was due Fri 8 pm" (warm `--mark` colour plus a "!" icon) or "Due in 1 hour". Sort late loans to the top. Text is part of the badge so it works without colour and is read by screen readers.
- **User benefit**: The beginner sees what needs attention first and can speak to the club about it.
- **Effort**: S
- **Files touched**: `app.js`: add an ordinal map for due strings and shift times, `register()` (badge + sort); `styles.css`: `.tag.late`.
- **Risks / trade-offs**: Sorting changes row order, which slightly worsens pain point 7 (moving rows). Sort only on render of the tab, not after each return. Overlaps with the error-scenarios agent.

## BG-09 · Ask "Are you sure?" with details before marking returned, plus Undo

- **Problem**: Pain points 6 and 7. In step 2, "Record return" closes L-402 at once with no confirmation and no undo. The rows below move up, so a second quick click hits the wrong loan. A beginner who makes a mistake has no way back except "Restart sample shift", which wipes the whole shift.
- **Proposed change**: Clicking "Mark as returned" expands the row in place (nothing moves) with: "Is this the item in your hand? USB-C → HDMI adapter AD-12 · Belkin AVC002. Brought back by: [select person]." Buttons "Yes, it's back" / "Not this one". After confirming, the success banner (BG-05) offers "Undo" for that loan until the next action.
- **User benefit**: The beginner gets a safe pause to check, and an easy fix for the commonest slip of the finger. Confidence goes up.
- **Effort**: M
- **Files touched**: `app.js`: click handler (`return` becomes two steps: `confirmReturn`, `undoReturn`), `register()` (expanded row), state `s.confirming`.
- **Risks / trade-offs**: One extra click per return. Recording "brought back by" adds a field to loans (`restore()` tolerates extra fields). This overlaps strongly with the error-scenarios and workflow agents. My angle is the wording and the undo safety net.

## BG-10 · Explain what the time button does, and let the user step back

- **Problem**: Pain point 16. The yellow-bar button "Move to return time" gives no warning that the story moves on and the step can't be revisited. The status then says only "Shift time updated." A beginner who presses it early (before lending all three items) can't go back except via "Restart sample shift".
- **Proposed change**:
  - Under the button add small text: "Jumps the story to Fri 7:30 pm. Your records stay."
  - If the step's checklist (BG-02) isn't done, show an inline note before moving: "You've lent 2 of 3 items for RQ-214. Move on anyway?" with "Move on" / "Stay here".
  - Add a secondary "← Back to Fri 3:45 pm" link that only changes `s.phase` (records stay). Keep the 3 steps as they are.
  - Better status message: "It's now Friday 7:30 pm. Kabir is back at the counter."
- **User benefit**: No surprise jumps, and a beginner can safely recover from moving time too early.
- **Effort**: M
- **Files touched**: `app.js`: `shifts` (add `previous` label), `paint()` (back link, helper text), click handler (`advance` check, new `back` action); `index.html`: helper text slot in `aside.shift`.
- **Risks / trade-offs**: Stepping back while records stay can produce odd states (e.g. Kabir's 7:30 pm Desk book message disappears because it's gated on `s.phase >= 1`, but loans closed at 7:30 stay closed). This is acceptable for a practice tool but should be stated in the hint text. Still keeps exactly 3 time steps.

## BG-11 · Bigger, clearer text and controls for the counter

- **Problem**: The status bar (the only place feedback appears today) is `font-size: 12px` in `--quiet` grey on `--desk`. Badges are 12px. Buttons get `min-height: 44px` only under `@media (pointer: coarse)`, so on a touch-screen laptop that reports a fine pointer, "Record return" is about 30px tall. The textarea has no minimum height. A busy counter means quick glances and quick taps.
- **Proposed change**: Raise the status bar to 14px with `--ink` colour. Make all buttons, selects and the textarea at least 40px tall everywhere (44px on coarse pointers). Make "Mark as returned" and "Lend this item" full-width on narrow screens. Check `--quiet` on `--desk` (light: #526370 on #f3f5f5) and `.tag` text meets 4.5:1. If not, darken `--quiet` slightly.
- **User benefit**: Easier to read at arm's length and harder to miss-tap, which helps everyone, including users with low vision or motor difficulties.
- **Effort**: S
- **Files touched**: `styles.css`: `.statusbar`, `.tag`, button/select/textarea rules, `@container (max-width:420px)`.
- **Risks / trade-offs**: A slightly roomier layout means more scrolling on small screens. Overlaps with the UI-visuals agent. I limit this to readability and target size.

## BG-12 · Live "where am I" summary for each request

- **Problem**: Pain point 13. The Requests tab keeps saying "RQ-214 · Approved" after everything is lent and partly returned. In step 3 the new staffer must cross-check the Desk book and Loans by hand to learn what's still out.
- **Proposed change**: On each request row and detail view, show plain progress lines per item:
  - "HDMI projector — lent to Kabir Sen (L-402), back ✓"
  - "Portable speaker — lent to Kabir Sen (L-403), back ✓"
  - "USB-C → HDMI adapter — still out (L-404, Belkin AVC002), was due Fri 8 pm"
  - Row badge: "Not started" / "2 of 3 out" / "1 still out" / "All back".
  - Include a "Lend this item" button next to any approved item not yet lent, which opens the lend form with the request already chosen.
- **User benefit**: One screen answers "what's left for this club?". This is the exact question at step 3.
- **Effort**: M
- **Files touched**: `app.js`: `requestPage()` (compute from `s.loans`), click handler (prefill `s.editing` with a request id).
- **Risks / trade-offs**: It partly replaces the "work it out" moment in step 3, but it's the main fix a real desk would want. Overlaps with the workflow agent's ideas about lending from a request.

## BG-13 · Tiny built-in glossary and "?" tips

- **Problem**: Pain point 14. Even with plainer labels (BG-01), a beginner meets codes like "RQ-214", "L-404", "PR-04", "Workshop", "C4" with no explanation of the patterns.
- **Proposed change**: Add a "How this desk works" `<details>` at the top of the Requests page (closed after first open, remembered in `localStorage`):
  - "Request (RQ-…): a club's approved form listing what they may borrow and when it must come back."
  - "Item (PR-04, AD-12…): one physical thing with a label. Two items can look alike; check the label."
  - "Shelf (A2, C4…): where the item lives. 'Workshop' means it's being repaired."
  - "Loan (L-…): one item lent to one person. Close it when the item comes back."
  - "Desk book: messages from clubs and notes between shifts. Read it at the start of every shift."
- **User benefit**: Self-serve answers to "what does this mean?" without a supervisor.
- **Effort**: S
- **Files touched**: `app.js`: `requestPage()` (or a shared helper rendered by `paint()`); `styles.css`: reuse `.record` styling.
- **Risks / trade-offs**: Adds content above the request list. Keeping it collapsed avoids clutter. It must not be confused with the Candidate brief `<details>`, so use a different heading and place it inside the page area.

## Top 3 picks

1. **BG-03 · Errors next to the button**: the cheapest change with the largest effect on "easy to correct mistakes". Today a beginner pressing Save sees nothing change near them, and some failures are completely silent.
2. **BG-05 · Clear "it worked" confirmation** (with BG-09's undo as the next step): answers "did that work?" after every lend and return, and tells the user where to shelve the item. That matches a real counter.
3. **BG-02 · "What to do now" checklist** (hidden behind "Need a hint?"): fixes pain point 15 directly, gives a first-timer a path through all three time steps, and leaves the story text and the 3-step time control as they are.
