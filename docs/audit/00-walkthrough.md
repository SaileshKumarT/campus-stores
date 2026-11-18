# 00 · Shift walkthrough (shared facts for all agents)

Facts only, recorded from a full playthrough of the app in a browser. Every later report cites this file.

## The app in one paragraph
Campus Stores is a single-page app for a fictional campus media equipment desk. A student staff member issues approved equipment to clubs and takes it back. There are 4 tabs (Requests, Inventory, Loan register, Desk book), a yellow "shift" bar telling the story, a time button that moves through 3 fixed time steps, and a bottom status bar with "Restart sample shift". It is plain HTML/CSS/JS with no build step, runs offline, and saves state in `localStorage` (`campus-stores.shift.v1`).

## Sample data (from `app.js`)
**Requests**
| ID | Club | Event | Filed by | Return by | Items | Note |
|---|---|---|---|---|---|---|
| RQ-214 | Film Society | Courtyard screening | Isha Rao | Fri 8 pm | HDMI projector, Portable speaker, USB-C → HDMI adapter | "Playback is from a USB-C-only laptop. The host will collect at 4 pm." |
| RQ-209 | Debate Union | Finals rehearsal | Tara Shah | Sat 10 am | Wireless microphone | "Rehearsal runs into the evening." |
| RQ-217 | Photo Circle | Street portrait walk | Dev Menon | Sat noon | Digital camera | "Collection on Saturday morning." |

**Assets (physical units)**
| ID | Type | Model | Bin | Note |
|---|---|---|---|---|
| PR-04 | HDMI projector | BenQ MH550 | A2 | |
| PR-06 | HDMI projector | Epson EB-X49 | Workshop | in repair |
| SP-02 | Portable speaker | JBL Eon One | B1 | |
| SP-05 | Portable speaker | Bose S1 | B2 | |
| AD-12 | USB-C → HDMI adapter | Belkin AVC002 | **C4** | |
| AD-15 | USB-C → HDMI adapter | Anker A8312 | **C4** | same bin as AD-12 |
| MI-09 | Wireless microphone | Shure BLX | B3 | on loan at start (slip L-401, Tara, due Sat 10 am) |
| CA-03 | Digital camera | Sony A6400 | D2 | |

**People** (the "Collected by" list): Isha Rao, Kabir Sen, Leela Das, Tara Shah, Dev Menon.

## Time step 1 — Friday 3:45 pm "Pickup at the counter"
Shift bar: "Kabir is here for the Film Society screening. The film starts at four. Can he leave with everything he needs?" Button: "Move to return time".

- **Requests tab**: list of 3 rows (event, ID · club, "View form"). Opening RQ-214 shows "RQ-214 · Approved", event, "Film Society · Filed by Isha Rao", "Return by Fri 8 pm", the 3 items, and the note. The note says "The host will collect", but Kabir (not Isha) is at the counter.
- **Desk book tab**: Isha (Fri 3:20 pm): "Kabir Sen is picking up our whole screening kit. Please issue it in his name." Tara (3:30 pm): mic stays with her overnight, back by 10 am Sat. Below that, a "Note for the next shift" textarea and "Add handover note".
- **Inventory tab**: a "Show" filter (All items / On shelf / On loan / In repair) and rows "ID · type", "model · bin", plus a badge. Everything is On shelf except PR-06 (In repair) and MI-09 (On loan).
- **Loan register tab**: header "One slip per physical unit", a "New issue slip" button, and "Outstanding / All slips" toggles. Each row reads "L-num · asset", "request · person · Due X", and a "Record return" button.
- **Issuing**: "New issue slip" opens a form with 4 empty dropdowns: Approved request, Unit leaving the desk (all available units of every type, not filtered by request), Collected by (any of 5 people), Return by (Fri 8 pm / Sat 9 am / Sat 10 am / Sat noon, **not prefilled from the request**). I did this 3 times:
  - L-402 PR-04, Kabir, Fri 8 pm → status: "Issued PR-04 to Kabir Sen on slip L-402."
  - L-403 SP-02, Kabir, Fri 8 pm.
  - Tried CA-03 camera on RQ-214 → blocked: "This equipment type is outside the approved request. Choose an approved unit." **The message appears only in the bottom status bar**, far from the Save button. The form keeps its values.
  - Changed the unit to AD-12 → L-404 saved.
- Other guard rails (from the code): you can't issue a second unit of the same type to the same request, in-repair and on-loan units are hidden, and the person must be in the list. You can pick **any** person (no check that Kabir was authorised) and **any** return time.
- After saving, the form closes. The next slip starts from a blank form again.

## Time step 2 — Friday 7:30 pm "The kit comes back in pieces"
Shift bar: Kabir returned the projector and speaker. "Leela still has the adapter. She'll drop it off tomorrow at nine." Button: "Move to next morning".
- Desk book gains Kabir's 7:30 pm message saying the same.
- Register (Outstanding) shows 4 identical-looking rows with identical "Record return" buttons.
- Clicked Record return on L-402 → closed immediately: "PR-04 returned to stock. Slip L-402 closed." **No confirmation, no undo, no record of who returned it or when.** The list re-renders and the rows below move up, so a fast second click can hit the wrong row.
- Closed L-403 the same way.
- L-404 (AD-12) stays open: "RQ-214 · Kabir Sen · Due Fri 8 pm". **There's no way to note on the slip that Leela now has it or that it's expected Sat 9 am**, and no way to edit the due time.
- Wrote a handover note in the Desk book (free text, max 400 chars). It's saved with the time step label ("Friday · 7:30 pm") and the author "Counter handover". **It isn't linked to slip L-404 or to AD-12, and doesn't record which staff member wrote it.**

## Time step 3 — Saturday 9:00 am "Morning shift"
Shift bar: "You've just taken over. Leela walks in with an adapter. Work out what was outstanding from the screening and close the loan for the right item." No more time button.
- To work out what's outstanding, the new staff member has to combine the Desk book (notes and messages) and the Loan register by hand.
- Register shows L-404 AD-12 "Kabir Sen · Due Fri 8 pm" (**13 h overdue, no overdue styling**) and L-401 MI-09 "Tara Shah · Due Sat 10 am", which looks the same.
- The slip shows only "AD-12". It doesn't show the model (Belkin) or the bin; that's only on the Inventory tab. AD-15 (Anker) is a look-alike in the same bin C4. **"Record return" never asks which physical unit is being handed in** and never checks that it matches.
- Closed L-404 → "AD-12 returned to stock. Slip L-404 closed."
- "All slips" afterwards: L-402/403/404 just say "Returned". **There's no return time, no returned-by name, and no late flag.**
- The Requests tab still says "RQ-214 · Approved". It never shows fulfilment progress (issued, partly returned, complete).

## Pain points observed (summary list)
1. Issuing a 3-item request takes 3 separate blank forms (12 dropdown choices).
2. "Return by" isn't prefilled from the request. A wrong date is easy to pick.
3. The unit dropdown lists every available unit, not just the types this request needs.
4. "Collected by" accepts anyone. The pickup authorisation lives only in the Desk book.
5. Error messages appear only in the bottom status bar, away from the action.
6. Return is one click, with no confirmation, no undo, and no correction path.
7. The list moves after each return, so a misclick is easy.
8. There's no overdue indicator anywhere.
9. A slip doesn't show the model or bin, and the AD-12/AD-15 look-alikes are in the same bin.
10. A return doesn't record who brought the item back or when.
11. A slip can't be edited (due time, holder) when plans change.
12. The handover note is free text, not linked to a slip or item, and has no staff name.
13. The Requests tab shows no progress for a request.
14. Jargon for a beginner: "slip", "register", "issue", "unit leaving the desk", "scope", "bin".
15. There's no "what to do now" guidance per time step besides the story text. Empty states are minimal ("No outstanding slips.").
16. Time can only move forward (only Restart goes back).

## Code map (`app.js`, single IIFE)
- Data: `requests`, `assets`, `people`, `shifts` (3 steps with `time`, `title`, `text`, `next`), `pages` (tab name + icon).
- State `original()`: `{version:1, tab, phase, selected, filter, loans:[{num, req, asset, who, due, back}], notes:[{phase,text}], editing, onlyOpen, notice}`.
- Helpers: `getAsset`, `getReq`, `out(id)` (open loan for asset), `esc`, `opts`, `btn(label, act, val, style)`, `head`, `row`, `badge`.
- Screens: `requestPage()`, `inventory()`, `register()` (also renders the issue form when `s.editing`), `deskbook()`. Map `screens`.
- `paint()` renders everything and `commit(msg)` = paint + save to localStorage.
- Click handler `switch(data-action)`: restart, advance, tab, close, request, new, cancel, scope, return.
- Change handler: the inventory filter.
- Submit handler: `[data-note]` → push note; `[data-issue]` → validates type is in request, not duplicate type, unit free → pushes loan, num = max+1.
- `restore(d)` validates the saved state shape (`version === 1`, loans non-empty, etc.). Invalid → fresh state.
- `index.html`: icon sprite (`<symbol>`s), exam strip with the Candidate brief `<details>`, masthead with the clock, shift `<aside>`, nav + page section, status bar.
- `styles.css`: desktop and mobile layouts (371 lines).
