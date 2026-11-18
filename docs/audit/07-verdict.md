# 07 · Judge's verdict

## Summary of the debate

Four brainstorm reports produced 53 ideas (UI-01…13, WF-01…13, RL-01…14, BG-01…13). The FOR paper merged them into 22 groups (G01–G22). The AGAINST paper listed 12 things the app already does well (K1–K12) and set a complexity budget.

In the rebuttal round the two sides ended up close together:
- **They agree on the headline.** Both chose G02: at the Saturday 9 am return, replace the one-click "Record return" with an in-row check of the label, plus Undo.
- **They agree on the core.** Both accept inline errors (G01), late flags (G03), model and shelf on loan rows (G04), request progress (G08), a prefilled return time (G06), and one message slot for every success, error and Undo (G09).
- **They agree on what to drop.** Neither wants guidance panels or checklists (G13), an authorised-collector list, a "looks the same" warning, a step back in time, condition tracking, a slip history log, or a staff name prompt.
- **They differ on a few points.** FOR, at the end, would not filter the unit list (to keep the type guard rail visible), would not sort, and held G07 "Plans changed" only in reserve. AGAINST, at the end, accepted filtering with a sticky form, a fixed oldest-due-first order, G07 with one optional `was` field, and "Brought back by".

## Principles I applied

The user's decisions bind me. This is a **full usability overhaul** for a **student with basic computer skills**. I ruled on these criteria, in this order:
1. Easy for a beginner.
2. Easy to correct mistakes.
3. Fits real counter situations.
4. Simple to build and coherent: vanilla HTML/CSS/JS, no build step, offline.

Both debaters shrank their sets a lot. I did not take the smallest set by default. I took the version of each group that does best on the four criteria, and I applied five constraints that both sides raised and that I agree with:

- **No pre-answering the scenario's judgment calls.** Four questions are the candidate's to answer: who may collect, whether the adapter is needed, what is still out, and which adapter came back. The app may show **facts** (late, model, shelf, what is out on a request). It must not show **conclusions** (an "allowed" list, "AD-15 looks the same", a to-do checklist).
- **One message slot.** Every error, success and Undo appears in the same place, one at a time, copied to the status bar.
- **No clashing designs.** There is one in-row panel pattern (used for both Return and Plans changed), one form layout, one Undo rule ("until you do something else"), and one wording list.
- **Temporary UI state is never saved.** Open panels, messages, Undo, the open form and focus targets live in a separate `ui` object that `commit()` never writes. No version bump is needed (I checked this against `restore()`).
- **Keep what the user asked to keep.** That means the 3-step time control, the sample data (requests, assets and people are unchanged), the Candidate brief, Restart sample shift, the wrong-type block, the second-unit-of-type block, and hidden in-repair/on-loan units.

Where I went beyond the smallest set, and why:
- **G07 Plans changed is in, not in reserve.** It is the only fix that puts "Leela has it, back Sat 9 am" on the record itself. It also uses the same panel pattern as the headline, so a beginner learns nothing new.
- **G05 filtering is in.** Filtering applies to the request-first path. The plain "Lend an item" path stays unfiltered, so the type guard rail can still be reached and stays as the backstop.
- **"Brought back by" is recorded.** It answers pain point 10 directly, and it costs no clicks because it is prefilled.
- **Undo covers return, lend and update.** These are the three things a beginner can get wrong, and Undo is the cheapest way to fix any of them.

## Ruling table (all 53 ideas)

Rulings: **Accept** (as proposed) · **Accept-modified** (the idea is in, changed as described in its group) · **Later** (good idea, not in this overhaul) · **Reject** (not wanted).

| ID | Group | Ruling | Reason |
|---|---|---|---|
| UI-01 | G01 | Accept-modified | The inline message above Save stays. No separate toast; success uses the shared message slot. |
| UI-02 | G03 | Accept-modified | Only two new badge looks (Late, Due today), each with words, instead of six colours and a legend. |
| UI-03 | G03 | Accept-modified | A fixed oldest-due-first order and a red edge on late rows. No summary chips. |
| UI-04 | G04 | Accept-modified | Model and shelf go into the existing row text. No new card layout, no look-alike note. |
| UI-05 | G02 | Accept-modified | The in-row confirm panel is the headline. No 10-second timer; Undo lasts until the next action. |
| UI-06 | G13 | Reject | A task card from live state pre-answers the steps and adds a second navigation. |
| UI-07 | G08 | Accept-modified | A progress badge and lines in words. No segmented bar, no extra "Issue this" button. |
| UI-08 | G05 | Accept-modified | Only the read-only "For RQ-214…" line with "Still to lend". No numbered steps, no side panel. |
| UI-09 | G20 | Accept-modified | Verb + item ID on buttons, flat badges. No global zebra/hover restyle. |
| UI-10 | G22 | Later | A bottom tab bar is a large restyle. The exercise is a desk browser; stacking rows is enough now. |
| UI-11 | G12 | Accept-modified | One-sentence empty states. No icon component, no legend. |
| UI-12 | G10 | Later | Note styling and linking come after Plans changed proves itself. Only the author label is renamed now (C11). |
| UI-13 | G15 | Reject | A stepper looks clickable, and relative hours duplicate the late badge; the clock already shows time. |
| WF-01 | G05 | Accept-modified | The "Lend items for this request" button is in. The "Change" link is dropped because "Lend an item" stays. |
| WF-02 | G05 | Later | The batch checklist form is a big rewrite. The sticky form gets most of the saving. |
| WF-03 | G06 | Accept-modified | Return by is prefilled with a hint. The authorised list is rejected. |
| WF-04 | G05 | Accept-modified | Filtered only on the request-first path, with no disabled "explanation" options. |
| WF-05 | G02 | Accept-modified | One-button label match. No typed ID field. |
| WF-06 | G14 | Reject | A global search box is a fifth always-visible control for 8 items. |
| WF-07 | G07 | Accept-modified | A 2-field in-row panel with one `was` record and Undo. No history array. |
| WF-08 | G10 | Later | Linking notes would be a second way to record "Leela has it" next to Plans changed. |
| WF-09 | G03 | Accept-modified | The late/due-today badge and the "returned late" stamp are in. "Due in 1 h" is dropped. |
| WF-10 | G08 | Accept | Derived from loans, text only, no new state. |
| WF-11 | G01 | Accept | An inline alert above Save, the wrong field marked and focused, and a generic message for unreachable branches. |
| WF-12 | G13 | Reject | A start-of-shift summary does the step 3 task for the candidate. |
| WF-13 | G15 | Reject | Stepping back breaks the one-way story (K11). Restart already exists. |
| RL-01 | G02 | Accept-modified | The label check is in. "Not this item" keeps the loan open, with no same-type dropdown. |
| RL-02 | G02 | Accept-modified | Who and when are recorded (prefilled, 0 extra clicks). No "Fix details" link on closed loans. |
| RL-03 | G02 | Accept-modified | Undo is in until the next action. Reopen with reasons is Later. |
| RL-04 | G03 | Accept-modified | The badge is in, with words. No count in the tab name. |
| RL-05 | G07 | Accept-modified | Merged into WF-07's panel. No `origDue` or history; the original is kept in `was`. |
| RL-06 | G06 | Reject | An "allowed to collect" list copies the Desk book answer into the data and gives away step 1. |
| RL-07 | G16 | Reject | Nothing in the story is damaged. It adds a decision to every return and puts K5 at risk. |
| RL-08 | G17 | Later | Void/swap is Later. The immediate case is covered by "Undo" after a lend (C10). |
| RL-09 | G10 | Later | Same reason as WF-08. |
| RL-10 | G19 | Reject | In a single-player sample the staff member is always the candidate. It is a prompt with no gain. |
| RL-11 | G13 | Reject | Same as WF-12. It pre-answers the morning question. |
| RL-12 | G08 | Accept | Per-item lines including "back at … from …", using the new `backAt`/`backBy`. |
| RL-13 | G14 | Later | Find-by-sticker on the Loans page could come later. With 2–4 open loans the list is the lookup. |
| RL-14 | G18 | Reject | A history nobody sees is pure cost. `was`, `backAt` and `backBy` give the visible part. |
| BG-01 | G11 | Accept-modified | Shown labels are plain (wording table in changes.md). Internal keys stay. Short tab label "Loans". |
| BG-02 | G13 | Reject | A "what to do now" checklist gives away the judgment, even when collapsed. |
| BG-03 | G01 | Accept-modified | Its fix-it wording is used for the two reachable errors. |
| BG-04 | G21 | Accept-modified | Focus rules for a fixed list of cases, plus `aria-current`. Focus never goes to a row the user did not choose. |
| BG-05 | G09 | Accept-modified | The success text with the shelf hint goes in the message slot. No banner, no "Lend another" button. |
| BG-06 | G12 | Accept-modified | Generic note placeholder and one-line empty states. No character counter, no answer-like example. |
| BG-07 | G04 | Accept-modified | Type, model and shelf on rows and options, without the "AD-15 looks similar" line. |
| BG-08 | G03 | Accept-modified | Text badge wording is used. Sorting is a fixed due-time order instead of "late floats up". |
| BG-09 | G02 | Accept-modified | Its "is this the item in your hand?" wording and prefilled "Brought back by" go in the single panel. |
| BG-10 | G15 | Accept-modified | The caption under the time button and a better status message. No move-on check, no step back. |
| BG-11 | G22 | Accept-modified | 14px dark status text, ≥40px controls, stacked rows on narrow screens. Contrast checked (passes). |
| BG-12 | G08 | Accept-modified | Merged into WF-10's lines. No "Lend this item" button per line. |
| BG-13 | G11 | Reject | Plain labels remove the need for a glossary. It would be a third `<details>` next to the Candidate brief. |

**Counts:** Accept 3 · Accept-modified 31 · Later 7 · Reject 12 (total 53).

## Rulings per group

### G01 · Inline errors (UI-01, WF-11, BG-03): Accept-modified
- **Design.** The issue form has one message slot (`<p data-msg>`) directly above the "Lend this item" button. A blocked save writes the message into that slot **without repainting**, so the form keeps its values (K3). It also marks the wrong `<select>` with `aria-invalid="true"`, moves focus to it, and copies the text to the status bar. The messages are:
  - Wrong type: "RQ-214 doesn't include a Digital camera. It covers: HDMI projector, Portable speaker, USB-C → HDMI adapter. Pick one of those."
  - Second unit of a type: "RQ-214 already has a Portable speaker out (SP-02, loan L-403). Each request gets one of each item."
  - Defensive fallback (not reachable from the UI): "Choose an item and a person from the lists."
- **Who won.** Both sides agreed. AGAINST's point decided the details: only two errors can be reached (K6) and repainting would wipe the form (K3). BG-03's wording was the best of the three.

### G02 · Return check with label, who/when, and Undo (UI-05, WF-05, RL-01, RL-02, RL-03, BG-09): Accept-modified, **headline**
- **Design.** Each open loan row has a "Return AD-12" button. Clicking it opens a panel inside that row (nothing else moves) that says:
  - "**Check the label on the item in your hand.** This loan is for:"
  - **AD-12 · USB-C → HDMI adapter · Belkin AVC002**
  - "Brought back by" [select, prefilled with the current holder]
  - [**Yes, it says AD-12**] [Not this item]

  **Yes** closes the loan and stamps `backAt` (the current time step) and `backBy`. The message slot then says "AD-12 (Belkin AVC002) is back. Put it on shelf C4. Loan L-404 closed. [Undo]". **Not this item** closes the panel and changes nothing. The message says "Nothing changed. Loan L-404 is still open. It is for AD-12 (Belkin AVC002). Don't take a different item as this return; ask where AD-12 is." Undo reopens the loan and clears the stamps, and it lasts until the next action. Only one panel can be open at a time.
- **Who won.** Both sides agreed on the direction. AGAINST won on the details: two buttons, no typed ID, no same-type dropdown, no timer, and no "looks the same" line. FOR won on "Brought back by" (prefilled, so 0 clicks), which AGAINST accepted in the end. Reopen is Later: Undo handles instant regret, and Restart covers the rest in a 3-step sample.

### G03 · Late / due-today flags (UI-02, UI-03, WF-09, RL-04, BG-08): Accept-modified
- **Design.**
  - A lookup turns due times into hours: Fri 8 pm = 20, Sat 9 am = 33, Sat 10 am = 34, Sat noon = 36. Each step's desk time also gets an hour: 15.75, 19.5, 33.
  - If an open loan's due time is earlier than now, the row gets the badge "Late · was due Fri 8 pm" and a red left edge.
  - If it is due on the same day (and not late), the badge is "Due today · Sat 10 am". Otherwise there is no badge.
  - Open loans are listed in a **fixed order**: oldest due first, then by loan number. Closing one row never reorders the others.
  - Closed loans read "returned Saturday · 9:00 am by Leela Das", with "· late" added when the return step's hour is past the due hour. Their badge is "Returned" or "Returned late".
- **Who won.** AGAINST's final version. A fixed order doesn't move rows the way a "late floats up" sort would, so pain point 7 isn't made worse. There are 2 new looks and no legend. FOR's "Late · was due" wording was kept.

### G04 · Item details on loan rows (UI-04, BG-07): Accept-modified
- **Design.**
  - Row title: "AD-12 · USB-C → HDMI adapter".
  - Row sub: "Loan L-404 · Belkin AVC002 · shelf C4 · Film Society (RQ-214) · with Kabir Sen · due Fri 8 pm".
  - Unit options read "AD-12 · USB-C → HDMI adapter · Belkin AVC002 · shelf C4".
  - The "Workshop" bin is shown as "in the workshop".
  - There is **no look-alike warning**.
- **Who won.** AGAINST. The label check in G02 already asks the user to compare the sticker with "AD-12 · Belkin AVC002". A permanent "AD-15 looks the same" would do the step 3 judgment for them.

### G05 · Lend a request's items (WF-01, WF-02, WF-04, UI-08): Accept-modified
- **Design.**
  - The request detail gets a primary button, "Lend items for this request". It opens the Loans form with the request fixed, shown as "For RQ-214 · Film Society · Courtyard screening" and "Still to lend: …". The item list shows only free units whose type is still to lend on that request.
  - After each successful lend, the form **stays open** on the same request. It keeps "Who is taking it?" and "Return by", and the lent type drops out of the list. When nothing is left to lend, the form closes and the message adds "All 3 items on RQ-214 are now out."
  - The plain "Lend an item" button stays. It opens the same form with a "Club request" dropdown and **all** free units (unfiltered), so the wrong-type block can still be reached and stays the backstop. After the first successful lend there, the form switches to the same request-first view.
  - The batch checklist (WF-02) is Later.
- **Who won.** AGAINST's final version (filtering + sticky form), plus FOR's concern about keeping the guard rail visible. I settled it by leaving the plain path unfiltered. Step 1 for RQ-214 drops from 3 blank forms and 12 choices to 1 form and 5 choices (item ×3, person, and nothing for Return by).

### G06 · Prefill return time / who may collect (WF-03, RL-06): Accept-modified
- **Design.**
  - On the request-first path, "Return by" is preselected from the request, with the hint "From the request."
  - On the plain path, choosing a request sets "Return by" through the change handler, with no repaint.
  - If the user picks a different time, the hint says "The request says Fri 8 pm. You can still choose a different time."
  - There is **no authorised-collector list.**
- **Who won.** Both sides, for the prefill. AGAINST for the collector list: FOR admitted it "partly answers a judgement question", and that question is the centre of step 1.

### G07 · Plans changed (WF-07, RL-05): Accept-modified
- **Design.**
  - Each open loan row has a second button, "Plans changed". It opens the same in-row panel pattern with "Now with" [people], "Expected back" [the 4 times], the fact line "Request says: return by Fri 8 pm.", and [Save change] [Cancel].
  - The first change stores `was: {who, due}` and never overwrites it. The row then shows "(was Kabir Sen · due Fri 8 pm)".
  - The message says "Loan L-404 updated: now with Leela Das, expected back Sat 9 am. [Undo]". Undo restores the previous holder and time.
- **Who won.** AGAINST's final shape (2 fields, one `was`, no history array). FOR's argument for including it: it is the only fix that puts the step 2 news on the record, and real desks change plans all the time. That decided it in favour of a full overhaul. It doesn't replace the handover note; the Desk book still matters.

### G08 · Request progress (UI-07, WF-10, RL-12, BG-12): Accept
- **Design.**
  - Each request row and the detail view show a badge: "Not started", "2 of 3 out", "1 of 3 still out", "All back", or "N of M back · K not lent". It turns red (`late`) when any open loan on it is late.
  - The detail view lists one line per approved item, for example "USB-C → HDMI adapter — AD-12 (Belkin AVC002) with Leela Das, due Sat 9 am · loan L-404", "HDMI projector — PR-04 back Friday · 7:30 pm from Kabir Sen · loan L-402", or "— not lent yet".
  - Everything is derived from loans. There is no bar and no per-line button.
- **Who won.** Both sides agreed. These are facts a real desk system shows, and they don't decide anything for the user.

### G09 · "It worked" confirmation (BG-05): Accept-modified
- **Design.** The confirmation is a message in the shared slot, not a banner. Lends read "PR-04 (BenQ MH550) lent to Kabir Sen, due back Fri 8 pm. Loan L-402. [Undo]". Returns include the shelf hint. The slot sits above Save while the form is open, and below the page heading otherwise.
- **Who won.** AGAINST: four success surfaces shrunk to one.

### G10 · Notes linked to loans (WF-08, RL-09, UI-12): Later
- **Who won.** Both sides, in the end. Once G07 records the facts, linking notes would be a second way to record the same thing.

### G11 · Labels and glossary (BG-01, BG-13): Accept-modified (labels), glossary rejected
- **Design.** Only the shown text changes. The internal keys (`"Loan register"` in `pages` and `screens`) stay the same so saved state still restores. Main renames:
  - Tab "Loans". "Lend an item". "Club request". "Item to hand over". "Who is taking it?". "Lend this item".
  - "Return AD-12". "Still out" / "All loans". "shelf C4".
  - "View request". "Save note". "Handover note".

  The full wording table is in changes.md, C11.
- **Who won.** AGAINST's short labels (the long ones would wrap in the 155px nav). FOR's full scope: every beginner-facing string is covered, not just three.

### G12 · Empty states (UI-11, BG-06): Accept-modified
- **Design.** Each empty state is one sentence:
  - "Nothing is out right now. Every item is back on the shelf."
  - "No items are "In repair" right now. Choose "All items" to see everything."

  The generic note placeholder is "Which item, who has it, when it will come back, and the loan number." There is no legend and no character counter.
- **Who won.** Both sides, shrunk.

### G13 · Guidance / summaries (UI-06, BG-02, WF-12, RL-11): Reject
- **Who won.** AGAINST, and FOR conceded. These panels give away the test. After G03, G07 and G08, they would only repeat what the screens already show.

### G14 · Find by sticker ID (WF-06, RL-13): Later (RL-13) / Reject (WF-06)
- **Who won.** AGAINST. With 2–4 open loans the list is the lookup, and a live input fights `paint()`'s `innerHTML` (focus is lost). As a cheap factual substitute, Inventory shows the loan number on an on-loan item ("On loan · L-404"), so a user starting from the item can find its loan.

### G15 · Time control (UI-13, WF-13, BG-10): Accept-modified (caption + status only)
- **Design.**
  - A caption sits under the time button: "Moves the story to Friday · 7:30 pm. Your records stay. Time only goes forward; Restart sample shift starts again."
  - After moving, the status says "Desk time is now Friday · 7:30 pm."
  - There is no stepper, no step back, and no "move on anyway?" check. The 3 steps and the story text are unchanged.
- **Who won.** AGAINST, and FOR conceded.

### G16 · Condition on return (RL-07): Reject
- **Who won.** Both sides, in the end. It is not in the story, it adds a decision to every return, and it risks K5.

### G17 · Void / swap (RL-08): Later
- **Who won.** AGAINST's alternative. The Undo in the message slot right after a lend removes that loan ("it never left the desk"). That covers the common slip of the finger without a `void` flag spreading through `out()`, the K2 check and progress.

### G18 · Slip history (RL-14): Reject
- **Who won.** AGAINST. State that nobody sees is cost with no benefit.

### G19 · Staff name (RL-10): Reject
- **Who won.** Both sides.

### G20 · Badges vs buttons (UI-09): Accept-modified
- **Design.** Buttons carry a verb and the item ID ("Return AD-12", "Plans changed"). Badges stay flat and are never clickable. Each open row has at most 2 buttons.
- **Who won.** AGAINST's shrunk version.

### G21 · Focus (BG-04): Accept-modified
- **Design.**
  - Changing tab focuses the page `<h2>`. Opening the form focuses its first select. Opening a panel focuses the panel's select.
  - After return, update, lend success, "Not this item" or Undo, focus goes to the message slot. After "Cancel" in a panel, focus goes back to that row's Return button.
  - A filter or scope change keeps focus on that control.
  - The active tab gets `aria-current="page"`, and the page section's `aria-label` follows the tab.
- **Who won.** AGAINST on the main limit: focus never goes to "the next row's button", somewhere the user didn't choose. FOR's list of cases, minus that one.

### G22 · Sizing and mobile (BG-11, UI-10): Accept-modified (BG-11) / Later (UI-10)
- **Design.**
  - The status bar is 14px in `--ink`. Badges are 13px.
  - Buttons and selects are at least 40px tall everywhere, and 44px on coarse pointers.
  - Under 420px, rows stack into one column and the buttons wrap.
  - Contrast: I measured `--quiet` on `--desk` at about 5.7:1 (light) and 9:1 (dark), which passes AA, so no change is needed there. The new late colours are about 7:1 (light) and 9:1 (dark).
- **Who won.** AGAINST on scope (no tab bar). FOR on applying the size minimum everywhere, which keeps one consistent control size.

## Headline change

**At Saturday 9:00 am, "Return AD-12" opens a label check inside the row ("This loan is for AD-12 · USB-C → HDMI adapter · Belkin AVC002") with "Brought back by" prefilled, and nothing closes until the user presses "Yes, it says AD-12". Undo is offered right after.**

Evidence from the walkthrough: at 9 am "Record return never asks which physical unit is being handed in". AD-15 (Anker) sits in the same bin C4 as AD-12. The slip showed only "AD-12". One click closed it with "no confirmation, no undo", and afterwards All slips said just "Returned", with no time and no name. A wrong unit taken back would put AD-12 "on shelf" while it is still missing. The only fix today is Restart, which wipes the shift. Every other accepted change supports this moment: G04 puts the model on the row, G03 shows why L-404 matters, and G07 makes the prefilled "Brought back by" say Leela.

## Real-counter observation

**Watch 20 returns at a real desk, and for each one note whether the staff member picks up the item and reads its label *before* pressing "Yes, it says …".** If the change helps, most staff will look at the sticker. If they press Yes without looking, the check has become a habit click and needs rethinking (for example, typing the last two digits).

To back this up with a number: compare the **end-of-day shelf check** for two weeks before and two weeks after. Count units the system says are "on the shelf" that are missing, or that have a different unit in their place. Also count how often "Not this item" and "Undo" are pressed. Each press is a mistake caught at the counter instead of found later.
