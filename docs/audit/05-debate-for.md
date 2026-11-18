# 05 · Debate: FOR the changes

The case for changing Campus Stores, built on the facts in `00-walkthrough.md` and a read of `app.js`. The judge's four tests are: (1) usability for a beginner student, (2) how easily mistakes get corrected, (3) fit with a real counter, and (4) simplicity and buildability (vanilla JS, no build, offline, keeping the 3-step time control, sample data, Candidate brief and Restart). I argue for a focused set of changes, not all 53 ideas. Where an idea is weak, duplicates another, or works against the exercise, I say so.

**Feasibility facts from `app.js` that the arguments below rely on**
- `restore()` already spreads each saved loan (`{ ...l }`) and spreads `d` over `original()`. New *optional* loan fields (`backBy`, `backAt`, `history`) therefore survive a reload without a breaking change. A version bump is only needed if we want `restore()` to *validate* them, and a v1→v2 migration that fills defaults is about 10 lines.
- The issue form's errors are already written straight to `q("[data-status]")` **without** repainting, so the form keeps its values. An inline error can use the exact same trick on a `<p data-form-error>` placed above the Save button. No new state and no lost form values.
- `register()` builds rows from `s.loans` in one place, and `badge()`, `row()` and `btn()` are tiny helpers. Overdue flags, richer slip rows and an in-row confirm all change one function each.
- Time already lives in three fixed steps (`shifts[0..2]`). Overdue needs only a 7-entry lookup (`Fri 3:45 pm`, `Fri 7:30 pm`, `Fri 8 pm`, `Sat 9 am`, `Sat 10 am`, `Sat noon`). The time control itself doesn't change.

## Merged groups

Every one of the 53 IDs appears in exactly one group.

| Group | Members | Merged proposal (one line) |
|---|---|---|
| **G01** | UI-01, WF-11, BG-03 | Show form errors inline above the Save button, in words that say how to fix them, and mark/focus the wrong field. Give silent failures a message too. |
| **G02** | UI-05, WF-05, RL-01, RL-02, RL-03, BG-09 | Make "Record return" an in-row, two-step check ("Check the label: AD-12 · Belkin AVC002"), with "Brought back by" prefilled and the desk time stamped. Add Undo right after, and "Reopen" on closed slips. |
| **G03** | UI-02, UI-03, WF-09, RL-04, BG-08 | Compare each slip's due time with the desk time. Show a "Late · was due Fri 8 pm" or "Due in 1 h" badge with text and icon, sort late slips first, and mark late returns in All slips. |
| **G04** | UI-04, BG-07 | Show the item type, model and shelf on every slip row and in the unit dropdown, plus a "look-alike in the same shelf" warning (AD-12 vs AD-15 in C4). |
| **G05** | WF-01, WF-02, WF-04, UI-08 | Add "Issue this request" on the request form. It opens one checklist form with a row per approved item, unit lists filtered to that type, and one Save that creates one slip per unit. |
| **G06** | WF-03, RL-06 | Prefill "Return by" from the request. Show who may collect (Isha, Kabir for RQ-214) and give a soft inline warning plus a confirm tick if someone else is picked. |
| **G07** | WF-07, RL-05 | Add "Plans changed" on an open slip to update the holder and expected return, keeping the original values visible ("was Kabir Sen · Fri 8 pm"). |
| **G08** | UI-07, WF-10, RL-12, BG-12 | Work out each request's progress from its slips and show it as a badge in the list ("2 of 3 back") plus per-item lines in the detail view ("Adapter AD-12 · still out with Leela"). |
| **G09** | BG-05 | Show a clear "Done" banner at the top of the Loans page after lending or returning, naming the item, the person and where to shelve it. |
| **G10** | WF-08, RL-09, UI-12 | Let a handover note be linked to a slip ("About L-404"), show it under that slip row, and style club messages, staff notes and system events differently. |
| **G11** | BG-01, BG-13 | Use plain-language labels ("Lend an item", "Who is taking it?", "Shelf C4", "Still out") while keeping internal keys and IDs, plus a small collapsed "How this desk works" glossary. |
| **G12** | UI-11, BG-06 | Give every empty list a helpful empty state with a next step, add a generic example hint for handover notes, and add a small badge legend. |
| **G13** | UI-06, BG-02, WF-12, RL-11 | Add per-step guidance: a factual "what's open / what's late" summary at the start of each step and an optional, collapsed "Need a hint?" checklist. |
| **G14** | WF-06, RL-13 | Add one "Type the sticker ID" box that finds the matching item or slip and flags look-alikes that aren't on loan. |
| **G15** | UI-13, WF-13, BG-10 | Make the time control clearer: a display-only 3-step stepper, a caption under the button ("Jumps to Fri 7:30 pm · your records stay"), a better status message, and an optional "step back" link. |
| **G16** | RL-07 | Record the condition on return (Good / Damaged). A damaged unit goes to "In repair" and can't be lent again. |
| **G17** | RL-08 | Allow "Fix this slip" within the same time step: swap to a same-type unit, or cancel because it never left the desk. |
| **G18** | RL-14 | Give each slip an append-only history timeline (issued, plans changed, returned, reopened). |
| **G19** | RL-10 | Ask for an optional staff first name per time step and stamp it on notes and actions. |
| **G20** | UI-09 | Set a clear visual grammar: badges are flat and never clickable, buttons carry a verb and the item ID ("Record return of AD-12"), and IDs line up in a column. |
| **G21** | BG-04 | Keep keyboard and screen-reader focus in a sensible place after each re-render. |
| **G22** | BG-11, UI-10 | Make the app fit a counter: 14px dark status text, at least 40px controls everywhere, rows that stack on narrow screens, and an optional bottom tab bar on phones. |

## Opening arguments

### G01 · Inline errors next to the button (UI-01, WF-11, BG-03)
- **Case for**: This is the most confusing moment in the walkthrough. In step 1, picking CA-03 for RQ-214 was blocked, but the message appeared "only in the bottom status bar, far from the Save button" (pain point 5), in 12px grey text. Worse, `app.js` line 442 `return`s **silently** when the person or unit is invalid, so some failures show no message anywhere. A beginner thinks the app is broken and clicks Save again. With this change the error appears where the student is looking and says how to fix it. That is the judge's "easy to correct" test in its purest form.
- **Best version**: BG-03's wording, which names what the request *does* cover ("RQ-214 covers: HDMI projector, Portable speaker, USB-C → HDMI adapter"). Add UI-01's `aria-invalid` and focus on the wrong field. Use WF-11's rule that every early `return` gets a message. Build it with the existing no-repaint trick (write `textContent` to a `<p role="alert">` above the button), so it needs no new state and the form keeps its values. Keep the status bar copy.
- **Priority**: **Must**. It's about 15 lines, has no risk, and helps every form.

### G02 · Return check with label, who and when, and Undo (UI-05, WF-05, RL-01, RL-02, RL-03, BG-09)
- **Case for**: Three pain points meet here, and they're the riskiest in the story. A return is one click with no confirmation and no undo (6). The list moves after each return, so a fast second click hits the wrong row (7). At 9 am, the app "never asks which physical unit is being handed in" while AD-15, the look-alike, sits in the same bin C4 (9). Also, closed slips say only "Returned", with no time and no name (10). If Leela hands over AD-15, today the app puts AD-12 back "on shelf" while it's still missing. That is the one error that **silently corrupts stock**. The only fix today is Restart, which wipes the whole shift. Every staff member benefits, and the beginner benefits most, because the fear of the irreversible button goes away.
- **Best version**: A combined version.
  - Clicking "Record return of AD-12" expands **that row in place** (UI-05, so nothing moves). It shows "Check the label: **AD-12 · Belkin AVC002** · Shelf C4" and two big buttons, "Yes, it says AD-12" and "No, it says something else" (RL-01; the one-button match is faster than typing).
  - "Brought back by" is prefilled with the holder and can be changed to Leela (RL-02/BG-09). The desk time is stamped as `backAt = s.phase`.
  - "Something else → AD-15" says "AD-15 was never lent out. Ask where AD-12 is," and the slip stays open.
  - Afterwards: "L-404 closed · Undo" until the next action (RL-03a). Closed slips in All slips get "Reopen", which is blocked if the unit is already out again, using the existing `out()` check.
  - Leave out WF-05's typed-ID field, because it's slower at a busy counter.
- **Priority**: **Must**. It costs one extra click per return, which I concede. That price buys protection against the worst mistake and a way to undo any mistake.

### G03 · Overdue and due-soon flags (UI-02, UI-03, WF-09, RL-04, BG-08)
- **Case for**: Five of the 53 ideas propose this independently, and the evidence is plain. At Sat 9 am, L-404 is "13 h overdue, no overdue styling" and looks exactly like L-401, which is due at 10 am (pain point 8). Step 3's whole task is "work out what was outstanding", and today the screen gives zero help. The register even lists newest-first, so the oldest, most urgent slip sinks. A real counter's first morning question is "what's late?"
- **Best version**: RL-04/BG-08's text badges ("Late · was due Fri 8 pm", "Due in 1 h"), so the meaning never relies on colour alone. Use WF-09's ordering lookup, sort Outstanding late-first within a stable order (UI-03), and add "returned late" on closed rows (WF-09, which shares G02's `backAt`). UI-02's full six-badge palette is nice but optional. Three looks (late, due soon, normal) are enough, so I concede UI-02's "purple striped repair" detail as gold-plating. Don't re-sort while a G02 confirm panel is open.
- **Priority**: **Must**. It's derived from existing data, needs no state change, and the effort is S.

### G04 · Model, shelf and look-alike warning on every slip (UI-04, BG-07)
- **Case for**: "The slip shows only 'AD-12'. It doesn't show the model (Belkin) or the bin; that's only on the Inventory tab" (pain point 9). A beginner doesn't even know AD-12 is an *adapter*. Matching the object in someone's hand to the record shouldn't need a tab switch. G02's label check also depends on this text being there.
- **Best version**: BG-07's simple text version: title "USB-C → HDMI adapter · AD-12", sub "Belkin AVC002 · Shelf C4 · Film Society (RQ-214) · With Kabir Sen · Due Fri 8 pm". Add model and shelf to the dropdown options too, plus the look-alike line "AD-15 (Anker) is also in C4: check the label." UI-04's sticker-style card layout is a later polish, not the core.
- **Priority**: **Must**. It's mostly string changes in `register()`.

### G05 · Issue a whole request from one form (WF-01, WF-02, WF-04, UI-08)
- **Case for**: Step 1 is the busiest moment, "The film starts at four". Issuing RQ-214 took "3 separate blank forms (12 dropdown choices)" (pain point 1), plus a detour to remember what was approved. The unit list shows "every available unit, not just the types this request needs" (3), which is how I got blocked trying CA-03. The request view is a dead end with no action button. This change cuts about 12 choices and 3 saves to about 3 choices and 1 save, and makes the wrong-type error impossible.
- **Best version**: WF-01 + WF-02. "Issue this request" on the open request opens a checklist with one row per approved type. Each row's unit dropdown is filtered to that type, shows model and shelf (WF-04 + G04), and is preselected when only one unit is free. One "Collected by", one "Return by", and one "Issue 3 items" button that **validates every row before writing any** (all-or-nothing). It still creates one slip per physical unit, so the register logic stays the same. Keep "New issue slip" for ad-hoc issues. UI-08's numbered-steps layout is only needed if WF-02 isn't built.
- **Concession**: This is the biggest build in the Must/Should set (M effort), and it touches the form and the submit handler. If the judge wants the smallest diff, WF-04 filtering alone (S) removes the wrong-type error. Even so, the step count stays at 3 forms.
- **Priority**: **Should**.

### G06 · Prefill return time and show who may collect (WF-03, RL-06)
- **Case for**: The shift bar's literal question is "Can he leave with everything he needs?". The answer lives only in the Desk book (Isha's 3:20 pm message), while the request note says "The host will collect" and "Collected by accepts anyone" (pain point 4). "Return by" isn't prefilled even though RQ-214 says Fri 8 pm (2), so a wrong date is easy to pick. Prefilling makes the normal case zero clicks. The collector check catches a wrong person at the counter, before the kit walks off.
- **Best version**: WF-03's prefill with the inline hint "Request says Fri 8 pm" when the time is changed, plus RL-06's static `allowed` list in the sample data and its soft warning with an "I checked with the club" tick. **Never a hard block**: real clubs send other members.
- **Concession**: Putting Kabir's name in the request data partly answers a judgement question the Candidate brief may be testing. Mitigation: show "Can collect" only *inside the issue form* as a warning, and keep the Desk book as the source.
- **Priority**: **Must** for prefilling "Return by" (one `selected` attribute). **Should** for the collector warning.

### G07 · "Plans changed" on an open slip (WF-07, RL-05)
- **Case for**: At 7:30 pm Kabir says Leela has the adapter and will bring it Sat 9 am, but "there's no way to note on the slip that Leela now has it… and no way to edit the due time" (pain point 11). So at 9 am the register shows the wrong person and the wrong time, and the morning shift has to rebuild the truth from free text. This is how a real counter works: plans change all the time.
- **Best version**: RL-05's in-row panel with "Now with" and "New return time", using the same in-row pattern as G02. The row then reads "Now with Leela Das · Due Sat 9 am (was Fri 8 pm)", so the overdue flag stays honest about the original date (WF-07's caveat). Store `origDue` and a short `history` entry, and show a soft warning when the new time is past the request's return time.
- **Priority**: **Should**.

### G08 · Request progress (UI-07, WF-10, RL-12, BG-12)
- **Case for**: Four reports propose it. "The Requests tab still says 'RQ-214 · Approved'" after everything was issued and returned (pain point 13). The step 3 question "what's still out from the screening?" is about a *request*, and today no screen answers it.
- **Best version**: RL-12/WF-10. A list badge ("2 of 3 back") and per-item lines in the detail view ("USB-C → HDMI adapter · AD-12 · still out with Leela Das"). It's derived from `s.loans`, so it needs no state change and changes only `requestPage()`. UI-07's segmented bar is optional. BG-12's "Lend this item" button belongs to G05.
- **Priority**: **Should**. It's S effort with a high payoff at step 3.

### G09 · "Done" confirmation at the place of action (BG-05)
- **Case for**: After saving, "the form closes" and the only proof is 12px grey text at the bottom. A beginner asks "did that work?". After a return, BG-05's banner also gives the physical next step ("Put it on shelf A2"), which is good counter coaching.
- **Best version**: BG-05. It also hosts G02's Undo link, so the two share one spot. Clear it on tab change.
- **Priority**: **Should**.

### G10 · Notes linked to slips (WF-08, RL-09, UI-12)
- **Case for**: The handover note "isn't linked to slip L-404 or to AD-12" (pain point 12), so step 3 means matching note to slip by hand.
- **Best version**: RL-09: an optional "About which slip?" dropdown, with the note shown as a small memo line under the slip row. UI-12's three-style Desk book is good polish.
- **Concession**: Once G07 exists, the *facts* (holder, time) live on the slip and notes become soft context. The value drops a lot, so this is honestly secondary.
- **Priority**: **Could**.

### G11 · Plain-language labels and glossary (BG-01, BG-13)
- **Case for**: Pain point 14 lists "slip", "register", "issue", "unit leaving the desk", "bin". The target user has *basic* computer skills and no store training. "Who is taking it?" and "Shelf C4" need no explanation.
- **Best version**: BG-01, changing **only the shown text**. Keep the internal `pages` key "Loan register" so `restore()` (which checks `s.tab` against `screens`) and saved state don't break. Keep the L-/RQ- IDs. BG-13's glossary stays collapsed and clearly separate from the Candidate brief.
- **Concession**: Renaming everything adds churn for anyone who learned the old labels, and the Candidate brief's wording must still match. Do the labels; the glossary is optional.
- **Priority**: **Should** (labels). The glossary is Could.

### G12 · Helpful empty states and a legend (UI-11, BG-06)
- **Case for**: "No outstanding slips." and blank filter results leave a beginner unsure whether the app is broken (pain point 15).
- **Best version**: UI-11's shared `empty()` helper with BG-06's wording. Use BG-06's **generic** note hint ("item, who has it, when it's due, loan number"), not the example that gives away the step 3 answer. Add the legend only if G03 adds more than 3 badge looks.
- **Priority**: **Could**. It's cheap but low impact.

### G13 · Per-step guidance and summary (UI-06, BG-02, WF-12, RL-11)
- **Case for**: Step 3 says "work out what was outstanding", and pain point 15 notes there's no "what to do now" guidance beyond the story.
- **Concession**: This is the group I'd defend least. A step-by-step checklist (BG-02) gives away the judgement the exercise is testing ("check who is authorised", "check the model"). Once G03, G07 and G08 ship, the register and the request view already answer "what's outstanding", so a summary card mostly repeats them.
- **Best version**: If anything, RL-11's purely *factual* card ("1 late: AD-12 · 1 due today: MI-09 · 1 note from last shift") shown when time moves forward, with BG-02's hints collapsed behind "Need a hint?". Leave the story text unchanged.
- **Priority**: **Could**.

### G14 · Find by sticker ID (WF-06, RL-13)
- **Case for**: A real counter starts from the object: "someone hands me a thing". RL-13's "AD-15 is not lent out… open adapter slip: L-404 · AD-12" catches look-alike swaps elegantly.
- **Concession**: With only 4 open slips in the sample shift, a list plus G04 + G02 already covers it. The live-typing re-render also fights `paint()`'s `innerHTML` (focus loss). It's worth doing only on Enter.
- **Best version**: RL-13, scoped to the Loans page and triggered on Enter.
- **Priority**: **Could**.

### G15 · A clearer time control (UI-13, WF-13, BG-10)
- **Case for**: "Move to return time" looks like any other button, nothing says it can't be undone (pain point 16), and the status says only "Shift time updated." A beginner who jumps early, with 2 of 3 items lent, must Restart.
- **Best version**: Keep the 3 steps and the button as they are. Add BG-10's caption and its better status ("It's now Friday 7:30 pm. Kabir is back at the counter."), plus UI-13's display-only stepper. Add BG-10's soft "You've lent 2 of 3 items, move on anyway?" note.
- **Concession**: The step-back link (WF-13) creates odd states (Kabir's 7:30 pm message disappears while returns stay closed), and the exercise may want time to feel one-way. Leave it out.
- **Priority**: **Should** for the caption, status and stepper. **Could** for step back.

### G16 · Condition on return (RL-07)
- **Case for**: Real counters get damaged kit back, and today a broken unit goes "On shelf" and straight out to the next club.
- **Concession**: None of the sample story needs it. It adds a decision to every return and new state (`s.repairs`) that has to merge with `a.repair`. It's real-life fit, not beginner usability.
- **Priority**: **Could**. If built, add "Good" as the default inside G02's panel.

### G17 · Void or swap a mistaken issue (RL-08)
- **Case for**: Picking AD-15 in the dropdown but handing over AD-12 is a plausible step 1 mistake. Today the only "fix" is a fake return, which leaves a false record.
- **Concession**: G02's Undo plus a fresh issue covers most of this, and the "same time step only" rule needs explaining.
- **Priority**: **Could**.

### G18 · Slip history (RL-14)
- **Case for**: It's a good foundation, because one `log()` helper makes G02, G07 and G17 honest and auditable.
- **Concession**: A full expandable timeline is more than a beginner needs. G07's "was Kabir · Fri 8 pm" line and G02's "Returned Sat 9 am by Leela · late" line give 90% of the value.
- **Priority**: **Could**. Store `history` quietly, and show it later if needed.

### G19 · Staff name per shift (RL-10)
- **Case for**: Handover notes are signed "Counter handover" (pain point 12). A first name makes the handover human.
- **Concession**: It's another prompt to type at every step change, in a single-user practice app where "who" is always the candidate.
- **Priority**: **Could**.

### G20 · Badges vs buttons, verbs with IDs (UI-09)
- **Case for**: In step 2 the register had "4 identical-looking rows with identical 'Record return' buttons" (pain point 7). "Record return of AD-12" says which row the button belongs to, which is a cheap defence against wrong-row clicks and helps screen-reader users too.
- **Best version**: UI-09's button labels and aligned ID column, plus a row hover highlight.
- **Priority**: **Should**. It's an S-effort change to `btn()` labels and a few CSS rules.

### G21 · Focus after re-render (BG-04)
- **Case for**: `paint()` replaces `[data-page]` via `innerHTML` on every click, so focus drops to `<body>`. A keyboard user returning L-402 is thrown back to the exam strip.
- **Best version**: BG-04 limited to its listed cases (tab change → `h2`, new form → first field, after return → next row's button).
- **Priority**: **Should**. It's accessibility, and it's small.

### G22 · Counter-friendly sizing and mobile (BG-11, UI-10)
- **Case for**: The status bar is 12px `--quiet` grey. Buttons are about 30px on fine pointers. On phones the status bar (where errors live today) is off screen.
- **Best version**: BG-11's 14px dark status text, ≥40px controls everywhere, and stacked rows under 420px. UI-10's fixed bottom tab bar is a bigger restyle. G01 already removes the "errors off screen" problem, so the tab bar is optional.
- **Priority**: **Should** (BG-11). UI-10's tab bar is Could.

### Priority summary
- **Must** (5): G01, G02, G03, G04, G06 (prefill "Return by"; the collector warning is Should).
- **Should** (9): G05, G07, G08, G09, G11, G15, G20, G21, G22.
- **Could** (8): G10, G12, G13, G14, G16, G17, G18, G19.

The Must set is all S effort, apart from G02 at M. It needs no build step, keeps the 3-step time control and the sample data, and leaves the Candidate brief and Restart unchanged. Only G02 adds loan fields (`backBy`, `backAt`), which `restore()` already passes through.

## Proposed headline change

**G02: Saturday 9:00 am, Leela puts an adapter on the counter.**

This is the moment I would change. The step 3 brief says "close the loan for the right item", but the app never checks *which* item. The slip shows only "AD-12". The model and shelf are on another tab, AD-15 is an identical-looking unit in the same bin C4, and "Record return" closes the slip in one click with no confirmation and no undo. The only recovery is Restart, which throws away the whole shift. It's the one point in the story where a beginner can make an error that is **silent, expensive in real life (a lost unit recorded as "on shelf"), and impossible to fix**.

The redesigned moment, which also uses G04's text and G03's flag:

> **L-404 · USB-C → HDMI adapter · AD-12** · ⚠ Late · was due Fri 8 pm
> Belkin AVC002 · Shelf C4 · With Kabir Sen
> *[Record return of AD-12]* → expands in place:
> "Check the label on the item. It should say **AD-12 · Belkin AVC002**. AD-15 (Anker) looks the same."
> Brought back by: [Kabir Sen ▾ → Leela Das]
> **[Yes, it says AD-12]** [No, it says something else]
> → "Done: AD-12 is back. Put it on shelf C4. Returned Sat 9 am by Leela Das · late · **Undo**"

Why this one wins on each test:
1. **Beginner usability**: It turns a memory and cross-referencing task into "read the sticker and press the matching button". The extra click is the only cost.
2. **Correcting mistakes**: It stops the wrong-unit mistake *before* saving. Undo and Reopen replace "Restart the whole shift" as the only fix, and the list no longer jumps under the cursor.
3. **Real-life fit**: It records who brought the item back and when, which the walkthrough shows is missing (pain point 10). The look-alike warning matches how real stores label kit.
4. **Buildability**: It changes one function (`register()`), splits one click case into `return-start`, `return-confirm` and `undo`, and adds two optional loan fields that `restore()` already keeps. It adds no dependency, keeps the time control unchanged, and leaves Restart as the full reset.

It's also the change that shows best: one screen, before and after, at the climax of the story.

## Rebuttal

The AGAINST paper is strong, and on most details I agree with it. We agree on the headline: its prototype pick (#4, the return panel with a label check and Undo) is my G02. We agree on the canonical versions of the errors (WF-11 slot with BG-03's wording), slip detail (BG-07), request progress (WF-10) and the late badge. Where we still differ, it's about scope, not direction.

### 1 · "The brief asks for one change"
The user has chosen an overhaul, but the brief's format still holds. An overhaul can be **presented** as one change if three rules apply:
- **One headline moment, shown before and after on the same job.** Replay the same Saturday 9 am return of L-404 twice. The first run uses today's one-click close. The second uses G02's label check, Undo and "Returned Sat 9 am" stamp. The other changes are listed as "supporting fixes that make the headline work" (G03 explains why L-404 is urgent, G04 puts the model on the row so the check makes sense). They aren't separate headlines.
- **The "handles well" moment must survive and stay visible.** The best one is the type guard rail (K1: CA-03 blocked on RQ-214), along with K2, K3 (the form keeps its values) and K4 (one slip per unit). I accept that my G05 *filtering* would make K1 unreachable, so I drop it (see G05). With G01, the guard rail actually shows *better*: the block now appears next to Save, in words, instead of in a 12px footer. So the candidate can say "this moment is handled well, and the overhaul kept it and made it visible."
- **Nothing may change the story, the 3-step time control, the sample data, the Candidate brief or Restart.** My final set below changes none of them.

### 2 · "Giving away the test"
I concede the pre-answers:
- the guidance panels and summaries (all of G13);
- the authorised-collector list (the collector half of G06);
- the "AD-15 looks the same" line (G04 and G02);
- BG-06's example note, and BG-10's "2 of 3 lent, move on anyway?" check.

These answer judgements the candidate is meant to make. I hold the line between **facts** and **conclusions**. A late badge, the model and shelf on a row, and a request's per-item status are records any real desk system shows. They make the evidence findable without deciding anything. The G02 label check is also a fact prompt: it shows what the slip says ("AD-12 · Belkin AVC002") and asks the user to compare it with the object in their hand. It doesn't name the look-alike or tell the user what the answer is. AGAINST itself chose this panel, so it accepts that a prompt to check isn't a giveaway.

### 3 · The complexity budget of about 8 changes
I accept the budget as a ceiling, with two clarifications:
- **CSS and accessibility fixes add no UI, so they shouldn't count against a "complexity for the beginner" budget.** That covers 14px status text, contrast, 44px targets on Save and Return (G22), and focusing the `h2` on tab change and the first select on form open (G21). They add no screens, controls or state, and they make the existing app *easier*. I keep them outside the 8, shrunk to AGAINST's own "simpler alternative" wording.
- **One reserved slot: G07 "Plans changed", shrunk.** Both papers call it the strongest new capability (it fixes the step 2→3 handover at the source). I don't add it on top. I propose it as the **first item to swap in** if the judge drops any of the 8, especially #6 or #8. Shrunk version: an "Update" button that opens the same in-row panel pattern as G02. It has 2 fields (now with, expected back) and no history array. The row shows "Request said Fri 8 pm" from `getReq(l.req).due`, and the late badge keeps comparing against that request time, so lateness stays honest.

### 4 · "Optional loan fields need no version bump"
**Agreed.** My opening already noted that `restore()` keeps extra loan fields; I drop "version bump" from every group. The real risk is the reverse: `commit()` saves the **whole** `s` and `restore()` spreads `d` back. So *transient* state (`confirming`, `formError`, `lastAction`) would be saved and come back after a reload as a half-open panel or a stale Undo. Also, a stored `editing: "RQ-214"` must still name a real request. The fix is 3 defensive lines in `restore()`, with no bump:
1. Reset the transient keys.
2. Set `editing` to `false` unless it is `true` or a valid request ID.
3. Ignore `backAt` unless `shifts[backAt]` exists.

I also concede K6: the selects are `required` and the people and unit options come from fixed lists, so the "silent return" branches can't be reached through the UI. G01 only needs messages for the 2 reachable errors.

### Final position per group
| Group | Position | Final version |
|---|---|---|
| G01 | **Shrink** | Inline `role="alert"` slot above Save for the 2 reachable errors (type, quantity), using BG-03's wording. Set by `textContent` without repainting, so K3 is kept. Not saved. No toast. |
| G02 | **Hold (headline), shrunk** | In-row panel "Check the label: AD-12 · Belkin AVC002 · shelf C4" with [Yes, AD-12 is back] and [Not this one]. Undo in the message slot until the next action. `backAt` stamped automatically. "Brought back by" is prefilled and shown as "Brought back by Kabir Sen · change", 0 clicks in the common case, kept because the story's real case is Leela. Dropped: typed ID, mismatch dropdown, 10-second timer, Reopen. |
| G03 | **Shrink** | One text badge, "Late · was due Fri 8 pm". No sort (2 open rows), no due-soon, no tab count, no legend. |
| G04 | **Shrink** | BG-07: type, model and shelf in the existing row sub text and the unit options. Look-alike line conceded. |
| G05 | **Shrink** | WF-01 "Issue this request" with the request fixed and Return by prefilled, using today's form. Units aren't filtered, so the K1 guard rail stays visible. WF-02's batch form is Later. |
| G06 | **Shrink** | Prefill Return by only (1 line). Collector list conceded. |
| G07 | **Shrink, reserve** | 2-field Update, no history. Original due comes from request data. First item to swap into the budget. |
| G08 | **Hold** | WF-10: a derived badge plus one text line per item. No bar, no new buttons. |
| G09 | **Shrink** | Merged into the single message slot ("PR-04 is back. Shelf A2. Undo."). No banner, no extra buttons. |
| G10 | **Concede** | Later. Free-text notes stay. |
| G11 | **Shrink** | 3 renames ("Item", "Who is taking it", "shelf"). Internal keys kept. Glossary conceded. |
| G12 | **Shrink, Could** | One-line empty states and a generic note placeholder. No legend, no counter. |
| G13 | **Concede** | Rejected. It gives away the test. |
| G14 | **Concede** | Later. With 2 open slips, the list is the lookup. |
| G15 | **Shrink** | A caption under the time button and a better status message only. Stepper, step back and move-on check conceded. K11 kept. |
| G16 | **Concede** | Rejected for this exercise. |
| G17 | **Concede** | Later. |
| G18 | **Concede** | Rejected. `backAt` is enough. |
| G19 | **Concede** | Rejected. |
| G20 | **Shrink** | Only the item ID in the return button label ("Return AD-12"), folded into G02. No global restyle. |
| G21 | **Shrink** | Focus the `h2` on tab change and the first select on form open, plus `aria-current="page"`. |
| G22 | **Shrink** | 14px `--ink` status bar, contrast fix, 44px Save and Return buttons. UI-10 is Later. |

**Net result:** the 8 behavioural changes in AGAINST's budget, which is my G01–G06 + G08 + G11/G15 shrunk, plus G21/G22 as no-new-UI fixes, plus G07 held in reserve. That is about 100–120 lines on a 496-line file, with no version bump and no new panels. It is still an overhaul in what it fixes, but it presents as one headline (G02), and it keeps the moment the app already handles well (K1).

