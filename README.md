# Campus Stores: a safer return check

This fork changes how Campus Stores takes an item back: before a loan closes, the app asks you to check the label on the item in your hand, and you can undo the return straight after. Around that one change, the rest of the app is made easier for a first-time student at the desk.

Campus Stores is a Product Engineer work sample set at a fictional campus media equipment desk. You work through a club's screening, from equipment pickup to a partial return and the next morning's handover. Open **Candidate brief** in the app for the assignment.

**Where to look**

- The plan, with every change and how to check it: [docs/changes.md](docs/changes.md)
- Why each idea was kept, changed or dropped: [docs/audit/07-verdict.md](docs/audit/07-verdict.md)
- The shift I worked, step by step, with the problems I found: [docs/audit/00-walkthrough.md](docs/audit/00-walkthrough.md)
- The code: `app.js`, `index.html`, `styles.css`

## Quick start

Open `index.html` in a modern browser. The app includes its scripts, styles and icons and runs offline. There is no build step.

To serve it over local HTTP instead, run this from the repository folder and visit `http://localhost:8000`:

```sh
python3 -m http.server 8000 --bind 127.0.0.1
```

Each browser keeps its own sample shift in local storage when it is available. **Restart sample shift** brings back the fictional starting records.

To see the change, press **Restart sample shift**, then follow [Same job, new design](#same-job-new-design) below.

## The moment it handles well

**Friday 3:45 pm. I tried to lend camera CA-03 on request RQ-214, and the app refused.**

RQ-214 (Film Society) covers a projector, a speaker and an adapter. No camera. When I picked CA-03 in the issue form and saved, the app blocked it: "This equipment type is outside the approved request." The form kept everything I had chosen, so I only had to swap the item to AD-12 and save again. The app also stops a second item of the same type going out on one request, and it hides items that are on loan or in repair.

**Friday 7:30 pm. The kit came back in pieces, and the app coped.**

The app makes one slip per physical item (L-402 projector, L-403 speaker, L-404 adapter). So when Kabir brought back only the projector and speaker, I closed L-402 and L-403, and L-404 stayed open for the adapter Leela still had. A partial return needed no special handling.

The only weak spot here was the message: the block showed up in a small line in the bottom status bar, far from the Save button. The new design keeps the block and moves the message next to the button.

## The moment I would change

**Saturday 9:00 am. Leela walks in and hands over "an adapter".**

From the walkthrough:

- The open slip showed only "L-404 · AD-12". It did not say what AD-12 is (a Belkin AVC002) or where it lives. That was only on the Inventory tab.
- AD-15, an Anker adapter of the same type, sits in **the same shelf, C4**.
- I clicked **Record return** once and the loan closed: "AD-12 returned to stock. Slip L-404 closed." The app never asked which physical item was handed in. There was no confirmation and no Undo.
- Afterwards, **All slips** just said "Returned", with no time and no name.
- L-404 was 13 hours late (due Fri 8 pm), but it looked exactly like L-401, which was not yet due.

If the item in Leela's hand had been AD-15, the app would now say AD-12 is on the shelf while it is still missing. Nobody would find out until a later shelf check. The only way to fix it in the app is **Restart sample shift**, which throws away the whole shift.

The same one-click close causes trouble on Friday evening too: after each return the rows below move up, so a fast second click can close the wrong loan.

## The change (headline)

The **Return** button now opens a short label check inside the loan's row. Nothing closes until you confirm.

1. Each open loan has a button with the item ID on it: **Return AD-12**.
2. Clicking it opens a small panel inside that row. No other row moves. Only one panel is open at a time.
3. The panel says:
   > **Check the label on the item in your hand.** This loan is for:
   > **AD-12 · USB-C → HDMI adapter · Belkin AVC002**
   > Brought back by: [Leela Das ▾]
   > [**Yes, it says AD-12**] [Not this item]
4. "Brought back by" is already filled in with the person who has the loan, so the usual case costs no extra clicks.
5. **Yes, it says AD-12** closes the loan. The app records when the item came back and who brought it, and says: "AD-12 (Belkin AVC002) is back. Put it on shelf C4. Loan L-404 closed. [Undo]".
6. **Not this item** changes nothing. The loan stays open, and the app says: "Nothing changed. Loan L-404 is still open. It is for AD-12 (Belkin AVC002). Don't take a different item as this return; ask where AD-12 is."
7. **Undo** reopens the loan and clears the time and name. It stays available until you do something else.

Why this one: it turns a memory task ("which adapter was it again?") into "read the sticker and press the matching button". It stops the wrong-item mistake before it is saved, Undo replaces Restart as the fix, and the desk finally learns who brought the item back and when.

## Same job, new design

Start with **Restart sample shift**. The full click-by-click version is in [docs/changes.md, section 7](docs/changes.md#7-same-job-new-design).

**Step 1 · Friday 3:45 pm, pickup.** On **Requests**, RQ-214 shows "Not started". Open it and press **Lend items for this request**. The form opens for RQ-214 only, lists just the items still to lend (with model and shelf), and fills in "Return by: Fri 8 pm" from the request. Lend PR-04 to Kabir Sen. The form stays open with Kabir and the time kept, so SP-02 and AD-12 are one choice and one click each. After the third item the form closes: "All 3 items on RQ-214 are now out." That is 1 form and 5 choices instead of 3 forms and 12. *(Optional: use the plain **Lend an item** form to try CA-03 on a request. The wrong-type block now shows in red right above the button.)*

**Step 2 · Friday 7:30 pm, pieces come back.** On **Loans**, press **Return PR-04**, read the label, press **Yes, it says PR-04**, and the app says to put it on shelf A2. Do the same for SP-02. Kabir says Leela has the adapter until 9 am, so press **Plans changed** on L-404 and set "Now with: Leela Das", "Expected back: Sat 9 am". The row now reads "with Leela Das · due Sat 9 am (was Kabir Sen · due Fri 8 pm)". Write a handover note in the **Desk book** in your own words, then move to the next morning.

**Step 3 · Saturday 9:00 am, morning shift.** Read the Desk book. **Requests** shows RQ-214 "1 of 3 still out", with the adapter line "AD-12 (Belkin AVC002) with Leela Das". **Loans** lists L-404 first, with the model and shelf on the row. (If you skipped "Plans changed", it shows "Late · was due Fri 8 pm" with a red edge.) Leela hands over an adapter. Press **Return AD-12**; "Brought back by" already says Leela Das. Turn the adapter over and read the sticker. If it says AD-12, press **Yes**. If not, press **Not this item** and the loan stays open. Afterwards, **All loans** shows "returned Saturday · 9:00 am by Leela Das", RQ-214 shows "All back", and Inventory shows both AD-12 and AD-15 on shelf C4.

## All changes and why

The headline is C01. The other changes support it or fix problems found on the same shift. "FOR" and "AGAINST" are the two sides of the debate in the audit, and "Judge" is the final ruling ([07-verdict.md](docs/audit/07-verdict.md)).

| # | What changed | Why (debate and ruling) |
|---|---|---|
| **C01** | **Return check panel with Undo.** "Return AD-12" opens a label check in the row; "Yes, it says AD-12" closes the loan and records time and person; "Not this item" keeps it open; Undo until the next action. | Both sides picked this as the headline. FOR wanted more: a typed ID, a dropdown to pick the item actually returned, a 10-second Undo timer, and a "Reopen" button. AGAINST argued that two buttons are enough: a wrong item is fixed by *not closing* the loan, with no extra pickers. The judge took AGAINST's simple version and FOR's "Brought back by", which is prefilled so it costs no clicks. Reopen is left for later. |
| **C02** | **Late and due-today badges, fixed order.** "Late · was due Fri 8 pm" with a red edge; "Due today · Sat 10 am"; open loans listed oldest-due first; closed loans show "returned … by …" or "Returned late". | At 9 am L-404 was 13 hours late and looked the same as a loan that was not yet due. FOR first wanted late rows to float to the top, plus a legend and more colours. AGAINST objected that moving rows makes misclicks worse (the Friday problem). Judge: a fixed due-time order that never shifts when a row closes, two new badge looks, always with words. |
| **C03** | **Item details on every loan row.** Title "AD-12 · USB-C → HDMI adapter"; row text adds the model, shelf, club and person. Clear button labels ("Return AD-12", "Plans changed"). | The model and shelf were only on Inventory, so the label check had nothing to compare against. FOR also wanted a "AD-15 looks the same" warning. AGAINST objected: the label check *is* the check, and a permanent look-alike line would do the Saturday judgement for the user (and turn into noise). Judge sided with AGAINST: **no look-alike warning**, only facts. |
| **C04** | **"Plans changed" on an open loan.** A second in-row panel: "Now with", "Expected back", and the request's original time shown as a fact. Keeps one "(was …)" record; Undo. | At 7:30 pm Kabir said Leela had the adapter until 9 am, but the loan could not be changed, so at 9 am it showed the wrong person and time. AGAINST first rejected it, then accepted a two-field version with no history list. FOR held it in reserve. The judge put it in: it is the only fix that puts the news on the loan itself, and it reuses the same panel, so there is nothing new to learn. The Desk book note still matters. |
| **C05** | **"Lend items for this request" with a sticky form.** Lends from the request, lists only items still to lend, keeps person and time after each save. The plain "Lend an item" form stays unfiltered. | Lending RQ-214 took 3 blank forms and 12 choices. FOR worried that filtering the list would hide the wrong-type block, the moment the app handles well. AGAINST proposed the sticky form as a cheap way to cut the clicks. Judge: filter only the request path and keep the plain form unfiltered, so the block can still be reached. The full checklist form is left for later. |
| **C06** | **"Return by" prefilled from the request**, with the hint "From the request." Choosing a different time is allowed, with a gentle note. | The return time was blank even though the request says Fri 8 pm. Both sides agreed on the prefill. FOR also suggested a list of who is allowed to collect. AGAINST rejected it because it copies the Desk book answer into the data, and FOR admitted it "partly answers a judgement question". Judge: **no collector list**. Checking that Kabir may collect is the candidate's call. |
| **C07** | **Request progress.** Badges like "Not started", "2 of 3 out", "1 of 3 still out", "All back", and one line per item on the request. | RQ-214 said "Approved" all shift and never showed what was out or back. Both sides agreed. These are facts any desk system shows, worked out from the loans, with no new saved data. |
| **C08** | **Inventory wording.** "shelf A2", "in the workshop", "On loan · L-404", and a one-line message when a filter has no matches. | A bare "C4" means nothing to a beginner, and an item on loan didn't say which loan. A full search box was rejected (one more control for 8 items), so the loan number on Inventory is the cheap way to go from an item to its loan. |
| **C09** | **Desk book note form.** A hint in the box ("Which item, who has it, when it will come back, and the loan number"), "Save note", author "Handover note", and a confirmation under the heading. | Notes were signed "Counter handover" and gave no hint. FOR's example note was dropped because it looked like the answer. The hint is generic on purpose. |
| **C10** | **One message slot.** Errors appear right above the Save button without clearing the form; successes and Undo appear in the same place; the status bar copies them. Undo works for a return, a lend and a plan change. | Messages only appeared in a 12px footer, and nothing could be undone. AGAINST pointed out that only two errors can actually happen (wrong type, second item of a type) and that redrawing the page would wipe the form. Judge: one place for every message, one at a time, and one Undo rule ("until you do something else"). Undo after a lend replaces a separate "void loan" feature. |
| **C11** | **Plain labels.** "Loans", "Lend an item", "Item to hand over", "Who is taking it?", "Lend this item", "Still out / All loans", "shelf C4". | "Slip", "register", "issue" and "unit leaving the desk" are store jargon. AGAINST kept the labels short so they fit the side menu. A glossary was rejected: plain words make it unnecessary. Only the shown text changes, so saved shifts still load. |
| **C12** | **Caption under the time button** ("Moves the story to Friday · 7:30 pm. Your records stay. Time only goes forward…") and the status "Desk time is now …". | Nothing warned that time only moves forward. FOR's ideas of a step-back button, a stepper and a "2 of 3 lent, move on anyway?" check were dropped: stepping back breaks the one-way story, and the check pre-answers step 1. |
| **C13** | **Keyboard focus and screen readers.** After every action, focus goes to a sensible place (the heading, the panel, the message); the active tab is marked for screen readers. | Every redraw dropped focus back to the top of the page. AGAINST limited it so focus never jumps to "the next row", somewhere the user didn't choose. |
| **C14** | **Counter-friendly sizes.** 14px dark status text, buttons and selects at least 40px tall (44px on touch), rows that stack on narrow screens. | The status text was 12px grey and rows were cramped on a phone. FOR argued these add no new screens, so they cost a beginner nothing. A phone tab bar is left for later. |

The line the judge held throughout: the app may show **facts** (late, model, shelf, what is out). It must not show **conclusions** (who is allowed, which adapter looks the same, a to-do list). The scenario's judgement calls stay with the person at the desk.

## What I kept, and why

- **The wrong-type block** (CA-03 on RQ-214). It is the clearest strength of the shift. It stays as a backstop, still reachable from the plain "Lend an item" form, and its message now sits next to the button in plain words.
- **The second-item-of-a-type block.** It stops a second speaker going out on the same request.
- **The form keeps its values after a blocked save.** Errors are written into the page without redrawing it.
- **One loan per physical item.** This is what makes the Friday partial return easy.
- **Hidden in-repair and on-loan items** (PR-06, MI-09 never appear in the list), and **required fields**, so an empty save is impossible.
- **The 3-step, one-way time control, the story text, the sample data and the Candidate brief.** Unchanged. Only a caption is added under the time button.
- **Restart sample shift.** Still the full reset.
- **The same 4 tabs and the same row layout.** No new tabs and no new panels above the page.
- **The same saved-data format.** No version bump; the new loan fields are optional, and old saves still load.
- **The judgement calls.** The candidate still has to read the Desk book, the request note and the label.

## Ideas I rejected or left for later

**Rejected**

- **Guidance, checklists and summary panels.** They pre-answer the scenario's judgement calls.
- **A list of who is allowed to collect.** It copies the Desk book answer into the data.
- **An "AD-15 looks the same" warning.** The label check is the check.
- **A global search box.** One more always-visible control for 8 items.
- **Stepping back in time, or a time stepper.** It breaks the one-way story; Restart exists.
- **Recording item condition on return.** Not in the story, and it adds a decision to every return.
- **A hidden loan history, and a staff name prompt.** Data nobody sees, and a prompt that adds nothing in a one-person sample.
- **A glossary.** Plain labels make it unnecessary.

**Later**

- **One checklist form for a whole request.** The sticky form gets most of the benefit for far less change.
- **Linking Desk book notes to loans.** "Plans changed" already records the facts; revisit if notes and loans drift apart at a real desk.
- **Void or swap a loan, and Reopen a closed loan.** Undo covers the immediate mistake.
- **Find a loan by sticker ID on the Loans page.** Worth it only with many open loans.
- **A phone tab bar.** Stacked rows are enough for now.

## How I'd know it helped

**Watch 20 returns at a real desk. For each one, note whether the staff member picks up the item and reads its label *before* pressing "Yes, it says …".**

- If most do, the check is doing its job.
- If they press Yes without looking, it has become a habit click and needs a stronger version, such as typing the last two digits of the label.

To back it up with numbers, compare two weeks before and two weeks after the change:

- **Shelf-check mismatches at closing:** items the app says are on the shelf that are missing, or that have a different item in their place.
- **How often "Not this item" and "Undo" are pressed.** Each press is a mistake caught at the counter instead of found later.

## How this was decided

I used a staged review with AI agents, and kept every step in [docs/audit/](docs/audit/). The master record is [docs/audit/LOG.md](docs/audit/LOG.md).

1. **Walkthrough.** I played the full shift and wrote down facts and 16 pain points: [00-walkthrough.md](docs/audit/00-walkthrough.md).
2. **Brainstorm.** Four agents, each with a different focus, proposed 53 ideas, each tied to evidence from the walkthrough: [01-ui.md](docs/audit/01-ui.md), [02-workflow.md](docs/audit/02-workflow.md), [03-real-life.md](docs/audit/03-real-life.md), [04-beginner.md](docs/audit/04-beginner.md).
3. **Debate.** One agent argued FOR the ideas and grouped them into 22 groups; another argued AGAINST and listed what the app already does well. Each then answered the other in a rebuttal round: [05-debate-for.md](docs/audit/05-debate-for.md), [06-debate-against.md](docs/audit/06-debate-against.md).
4. **Judge.** A judge ruled on all 53 ideas (3 accepted, 31 accepted with changes, 7 later, 12 rejected) and chose the headline: [07-verdict.md](docs/audit/07-verdict.md).
5. **Coherence review.** A reviewer checked the plan for clashes, gaps and mistakes against the code.
6. **Plan correction.** The review's fixes were folded back into the final plan: [docs/changes.md](docs/changes.md).

The ground rules for every agent: the target user is a student with basic computer skills; keep the time control, sample data, Candidate brief and Restart; plain HTML/CSS/JS with no build step, working offline.

## Source

- `index.html` contains the desk layout, candidate brief, and bundled icons.
- `app.js` contains the sample records and interactions.
- `styles.css` defines the desktop and mobile layouts.
- `docs/` contains the plan and the audit behind it.

Icon license notices are in [third-party/lucide-LICENSE.txt](third-party/lucide-LICENSE.txt).
