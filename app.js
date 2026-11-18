(() => {
  const storageKey = "campus-stores.shift.v1";
  const root = document.getElementById("campus-stores");
  const q = (selector) => root.querySelector(selector);
  const requests = [
    {
      id: "RQ-214",
      club: "Film Society",
      event: "Courtyard screening",
      owner: "Isha Rao",
      due: "Fri 8 pm",
      items: ["HDMI projector", "Portable speaker", "USB-C → HDMI adapter"],
      note: "Playback is from a USB-C-only laptop. The host will collect at 4 pm.",
    },
    {
      id: "RQ-209",
      club: "Debate Union",
      event: "Finals rehearsal",
      owner: "Tara Shah",
      due: "Sat 10 am",
      items: ["Wireless microphone"],
      note: "Rehearsal runs into the evening.",
    },
    {
      id: "RQ-217",
      club: "Photo Circle",
      event: "Street portrait walk",
      owner: "Dev Menon",
      due: "Sat noon",
      items: ["Digital camera"],
      note: "Collection on Saturday morning.",
    },
  ];
  const assets = [
    { id: "PR-04", type: "HDMI projector", model: "BenQ MH550", bin: "A2" },
    {
      id: "PR-06",
      type: "HDMI projector",
      model: "Epson EB-X49",
      bin: "Workshop",
      repair: true,
    },
    { id: "SP-02", type: "Portable speaker", model: "JBL Eon One", bin: "B1" },
    { id: "SP-05", type: "Portable speaker", model: "Bose S1", bin: "B2" },
    {
      id: "AD-12",
      type: "USB-C → HDMI adapter",
      model: "Belkin AVC002",
      bin: "C4",
    },
    {
      id: "AD-15",
      type: "USB-C → HDMI adapter",
      model: "Anker A8312",
      bin: "C4",
    },
    { id: "MI-09", type: "Wireless microphone", model: "Shure BLX", bin: "B3" },
    { id: "CA-03", type: "Digital camera", model: "Sony A6400", bin: "D2" },
  ];
  const people = [
    "Isha Rao",
    "Kabir Sen",
    "Leela Das",
    "Tara Shah",
    "Dev Menon",
  ];
  const shifts = [
    {
      time: "Friday · 3:45 pm",
      title: "Pickup at the counter",
      text: "Kabir is here for the Film Society screening. The film starts at four. Can he leave with everything he needs?",
      next: "Move to return time",
      at: 15.75,
      caption:
        "Moves the story to Friday · 7:30 pm. Your records stay. Time only goes forward; Restart sample shift starts again.",
    },
    {
      time: "Friday · 7:30 pm",
      title: "The kit comes back in pieces",
      text: "Kabir has brought back the projector and speaker. “Leela still has the adapter. She’ll drop it off tomorrow at nine.” Take the return and hand over to the morning shift.",
      next: "Move to next morning",
      at: 19.5,
      caption:
        "Moves the story to Saturday · 9:00 am. Your records stay. Time only goes forward; Restart sample shift starts again.",
    },
    {
      time: "Saturday · 9:00 am",
      title: "Morning shift",
      text: "You’ve just taken over. Leela walks in with an adapter. Work out what was outstanding from the screening and close the loan for the right item.",
      at: 33,
    },
  ];
  const dueHours = { "Fri 8 pm": 20, "Sat 9 am": 33, "Sat 10 am": 34, "Sat noon": 36 };
  const dueTimes = Object.keys(dueHours);
  const pages = [
    ["Requests", "clipboard-list", "Requests"],
    ["Inventory", "package", "Inventory"],
    ["Loan register", "book-open", "Loans"],
    ["Desk book", "messages-square", "Desk book"],
  ];
  const original = () => ({
    version: 1,
    tab: "Requests",
    phase: 0,
    selected: "",
    filter: "All items",
    loans: [
      {
        num: 401,
        req: "RQ-209",
        asset: "MI-09",
        who: "Tara Shah",
        due: "Sat 10 am",
        back: false,
      },
    ],
    notes: [],
    onlyOpen: true,
    notice: "Sample shift · All records are fictional.",
  });
  let s = original();
  const freshUi = () => ({ msg: null, panel: null, editing: false, keep: null, focus: "" });
  let ui = freshUi();
  const getAsset = (id) => assets.find((x) => x.id === id);
  const getReq = (id) => requests.find((x) => x.id === id);
  const out = (id) => s.loans.find((l) => l.asset === id && !l.back);
  const esc = (x) =>
    String(x).replace(
      /[&<>"']/g,
      (c) =>
        ({
          "&": "&amp;",
          "<": "&lt;",
          ">": "&gt;",
          '"': "&quot;",
          "'": "&#39;",
        })[c],
    );
  const opts = (list, chosen = "") =>
    list
      .map(
        ([v, t]) =>
          '<option value="' +
          esc(v) +
          '"' +
          (v === chosen ? " selected" : "") +
          ">" +
          esc(t) +
          "</option>",
      )
      .join("");
  const btn = (label, act, val = "", style = "") =>
    '<button type="button" data-action="' +
    act +
    '" data-val="' +
    esc(val) +
    '" class="' +
    style +
    '">' +
    esc(label) +
    "</button>";
  const head = (title, sub, control = "") =>
    '<div class="sectionhead"><div><h2 tabindex="-1">' +
    title +
    "</h2><small>" +
    sub +
    "</small></div>" +
    control +
    "</div>";
  const row = (label, sub, right, extra = "", cls = "") =>
    '<div class="row' +
    (cls ? " " + cls : "") +
    '"><div><strong>' +
    esc(label) +
    "</strong><small>" +
    esc(sub) +
    '</small></div><div class="actions">' +
    right +
    "</div>" +
    extra +
    "</div>";
  const badge = (t, kind = "") =>
    '<span class="tag' + (kind ? " " + kind : "") + '">' + esc(t) + "</span>";
  // B3 · Item text helpers
  const where = (a) => (a.bin === "Workshop" ? "in the workshop" : "shelf " + a.bin);
  const unitText = (a) =>
    a.id + " · " + a.type + " · " + a.model + " · " + where(a);
  const typeOf = (l) => getAsset(l.asset).type;
  // B2 · Time lookup
  function dueState(l) {
    const now = shifts[s.phase].at,
      h = dueHours[l.due];
    if (l.back || h === undefined) return "";
    if (h < now) return "late";
    return Math.floor(h / 24) === Math.floor(now / 24) ? "today" : "";
  }
  const returnedLate = (l) =>
    l.back &&
    Number.isInteger(l.backAt) &&
    shifts[l.backAt].at > (dueHours[l.due] ?? 99);
  // B5 · The single message slot
  const msgSlot = () =>
    ui.msg
      ? '<p class="msg ' +
        ui.msg.kind +
        '" data-msg tabindex="-1"' +
        (ui.msg.kind === "error" ? ' role="alert"' : "") +
        ">" +
        esc(ui.msg.text) +
        (ui.msg.undo ? " " + btn("Undo", "undo", "", "linkbtn") : "") +
        "</p>"
      : '<p class="msg" data-msg tabindex="-1" hidden></p>';
  // C10 · Inline form errors, written without repainting
  function formError(f, text, field) {
    ui.msg = null; // drop any earlier lend Undo
    const m = f.querySelector("[data-msg]");
    if (m) {
      m.hidden = false;
      m.className = "msg error";
      m.setAttribute("role", "alert");
      m.textContent = text;
    }
    q("[data-status]").textContent = ""; // role="alert" announces it; no double read (B5)
    f.querySelectorAll("[aria-invalid]").forEach((x) =>
      x.removeAttribute("aria-invalid"),
    );
    const el = f.elements[field];
    if (el && el.setAttribute) {
      el.setAttribute("aria-invalid", "true");
      el.focus();
    }
  }
  const toLend = (r) =>
    r.items.filter(
      (t) => !s.loans.some((l) => l.req === r.id && typeOf(l) === t),
    );
  const progress = (r) =>
    r.items.map((type) => ({
      type,
      l: s.loans
        .filter((l) => l.req === r.id && typeOf(l) === type)
        .reduce((m, l) => (!m || l.num > m.num ? l : m), null),
    }));
  function progressBadge(r) {
    const p = progress(r),
      n = p.length;
    const outN = p.filter((x) => x.l && !x.l.back).length;
    const backN = p.filter((x) => x.l && x.l.back).length;
    if (!outN && !backN) return badge("Not started");
    if (outN) {
      const late = s.loans.some(
        (l) => l.req === r.id && !l.back && dueState(l) === "late",
      );
      return badge(
        outN + " of " + n + (backN ? " still out" : " out"),
        late ? "late" : "",
      );
    }
    if (backN === n) return badge("All back", "good");
    return badge(backN + " of " + n + " back · " + (n - backN) + " not lent");
  }
  function progressLine({ type, l }) {
    if (!l) return esc(type + " — not lent yet");
    const a = getAsset(l.asset);
    if (!l.back)
      return (
        esc(
          type + " — " + l.asset + " (" + a.model + ") with " + l.who +
            ", due " + l.due + " · loan L-" + l.num,
        ) +
        (dueState(l) === "late"
          ? " " + badge("Late · was due " + l.due, "late")
          : "")
      );
    return esc(
      type + " — " + l.asset + " back" +
        (Number.isInteger(l.backAt) && shifts[l.backAt]
          ? " " + shifts[l.backAt].time
          : "") +
        (l.backBy ? " from " + l.backBy : "") +
        " · loan L-" + l.num,
    );
  }
  function requestPage() {
    let html = head(
      "Approved requests",
      "Student Activities Office · 3 approved forms",
    ) + msgSlot();
    if (s.selected) {
      const r = getReq(s.selected);
      html +=
        btn("← All requests", "close") +
        '<div class="record"><small>' +
        esc(r.id) +
        " · Approved</small> " +
        progressBadge(r) +
        '<h3 tabindex="-1">' +
        esc(r.event) +
        "</h3><p>" +
        esc(r.club) +
        " · Filed by " +
        esc(r.owner) +
        "</p><p><b>Return by</b> " +
        esc(r.due) +
        "</p><p><b>Approved equipment</b></p><ul>" +
        progress(r)
          .map((x) => "<li>" + progressLine(x) + "</li>")
          .join("") +
        "</ul><p>" +
        esc(r.note) +
        "</p>" +
        (toLend(r).length
          ? btn("Lend items for this request", "lend-for", r.id, "primary")
          : "<p>Every item on this request has been lent (see progress above).</p>") +
        "</div>";
    } else
      html += requests
        .map((r) =>
          row(
            r.event,
            r.id + " · " + r.club + " · return by " + r.due,
            progressBadge(r) + btn("View request", "request", r.id),
          ),
        )
        .join("");
    return html;
  }
  function inventory() {
    let html =
      head(
        "Inventory",
        "Every physical item, where it lives, and whether it's here.",
      ) + msgSlot();
    html +=
      '<div class="buttons"><label>Show <select data-filter>' +
      opts(
        ["All items", "On shelf", "On loan", "In repair"].map((f) => [f, f]),
      ) +
      "</select></label></div>";
    let count = 0;
    for (const a of assets) {
      const status = a.repair
        ? "In repair"
        : out(a.id)
          ? "On loan"
          : "On shelf";
      if (s.filter !== "All items" && s.filter !== status) continue;
      count++;
      html += row(
        a.id + " · " + a.type,
        a.model + " · " + where(a),
        badge(
          status === "On loan" ? "On loan · L-" + out(a.id).num : status,
          status === "On shelf" ? "good" : "",
        ),
      );
    }
    if (!count)
      html +=
        '<p class="empty">No items are "' +
        esc(s.filter) +
        '" right now. Choose "All items" to see everything.</p>';
    return html;
  }
  function register() {
    let html = head(
      "Loans",
      "One loan = one item lent to one person. Close it when the item comes back.",
      ui.editing
        ? btn("Close form", "cancel")
        : btn("Lend an item", "new", "", "primary"),
    );
    if (ui.editing) {
      const available = assets.filter((a) => !a.repair && !out(a.id));
      const select = (label, key, options, chosen = "", after = "") =>
        "<label><span>" +
        label +
        '</span><select name="' +
        key +
        '" required><option value="">Select…</option>' +
        opts(options, chosen) +
        "</select>" +
        after +
        "</label>";
      const hint = (r, due) =>
        "<small data-duehint>" +
        (!r
          ? ""
          : due === r.due
            ? "From the request."
            : esc(
                "The request says " +
                  r.due +
                  ". You can still choose a different time.",
              )) +
        "</small>";
      const fr = typeof ui.editing === "string" ? getReq(ui.editing) : null;
      const who = ui.keep?.who || "";
      let top = "",
        fields = "";
      if (fr) {
        const need = toLend(fr);
        const missing = need.filter(
          (t) => !available.some((a) => a.type === t),
        );
        const due = ui.keep?.due || fr.due;
        top =
          '<input type="hidden" name="req" value="' +
          esc(fr.id) +
          '"><p><b>' +
          esc("For " + fr.id + " · " + fr.club + " · " + fr.event) +
          "</b></p><p><small>" +
          esc("Still to lend: " + need.join(", ")) +
          "</small></p>" +
          (missing.length
            ? "<p><small>" +
              esc("Not on the shelf right now: " + missing.join(", ") + ".") +
              "</small></p>"
            : "");
        fields =
          select(
            "Item to hand over",
            "asset",
            available
              .filter((a) => need.includes(a.type))
              .map((a) => [a.id, unitText(a)]),
          ) +
          select("Who is taking it?", "who", people.map((p) => [p, p]), who) +
          select(
            "Return by",
            "due",
            dueTimes.map((d) => [d, d]),
            due,
            hint(fr, due),
          );
      } else
        fields =
          select(
            "Club request",
            "req",
            requests.map((r) => [r.id, r.id + " · " + r.club + " · " + r.event]),
          ) +
          select(
            "Item to hand over",
            "asset",
            available.map((a) => [a.id, unitText(a)]),
          ) +
          select("Who is taking it?", "who", people.map((p) => [p, p]), who) +
          select(
            "Return by",
            "due",
            dueTimes.map((d) => [d, d]),
            ui.keep?.due || "",
            hint(null, ""),
          );
      return (
        html +
        "<form data-issue>" +
        top +
        '<div class="form">' +
        fields +
        "</div>" +
        msgSlot() +
        '<button type="submit" class="primary">Lend this item</button></form>'
      );
    }
    html += msgSlot();
    html +=
      '<div class="buttons">' +
      ["Still out", "All loans"]
        .map(
          (v, i) =>
            '<button type="button" data-action="scope" data-val="' +
            i +
            '" aria-pressed="' +
            (s.onlyOpen === (i === 0)) +
            '">' +
            v +
            "</button>",
        )
        .join("") +
      "</div>";
    const order = (a, b) =>
      (dueHours[a.due] ?? 99) - (dueHours[b.due] ?? 99) || a.num - b.num;
    const open = s.loans.filter((l) => !l.back).sort(order);
    const done = s.onlyOpen
      ? []
      : s.loans
          .filter((l) => l.back)
          .sort((a, b) => (b.backAt ?? -1) - (a.backAt ?? -1) || b.num - a.num);
    const shown = [...open, ...done];
    if (!shown.length)
      html +=
        '<p class="empty">Nothing is out right now. Every lent item has come back.</p>';
    for (const l of shown) {
      const a = getAsset(l.asset);
      const base =
        "Loan L-" + l.num + " · " + a.model + " · " + where(a) + " · " +
        getReq(l.req).club + " (" + l.req + ")";
      const unitLine = l.asset + " · " + a.type + " · " + a.model;
      if (l.back) {
        const late = returnedLate(l);
        const when = Number.isInteger(l.backAt) && shifts[l.backAt]
          ? " " + shifts[l.backAt].time : "";
        const by = l.backBy ? " by " + l.backBy : "";
        html += row(
          l.asset + " · " + a.type,
          base + " · returned" + when + by + (late ? " · late" : ""),
          late ? badge("Returned late", "late") : badge("Returned"),
        );
        continue;
      }
      const st = dueState(l);
      const tag =
        st === "late"
          ? badge("Late · was due " + l.due, "late")
          : st === "today"
            ? badge("Due today · " + l.due, "soon")
            : "";
      const mine = ui.panel && ui.panel.num === l.num ? ui.panel : null;
      const right =
        tag +
        (mine
          ? ""
          : btn("Return " + l.asset, "return", l.num) +
            btn("Plans changed", "update", l.num));
      let extra = "";
      if (mine && mine.kind === "return")
        extra =
          '<div class="panel" data-panel role="group" aria-labelledby="panel-h">' +
          '<p id="panel-h"><b>Check the label on the item in your hand.</b> This loan is for:</p>' +
          '<p class="labelcheck" id="panel-unit">' + esc(unitLine) + "</p>" +
          '<div class="form"><label><span>Brought back by</span>' +
          '<select data-backby aria-describedby="panel-unit">' +
          opts(people.map((p) => [p, p]), l.who) +
          "</select></label></div>" +
          '<div class="buttons">' +
          btn("Yes, it says " + l.asset, "confirm-return", l.num, "primary") +
          btn("Not this item", "not-this", l.num) +
          "</div></div>";
      else if (mine && mine.kind === "update")
        extra =
          '<div class="panel" data-panel role="group" aria-labelledby="panel-h">' +
          '<p id="panel-h"><b>Plans changed?</b> Record who has it now and when it will come back.</p>' +
          '<p class="labelcheck" id="panel-unit">' + esc(unitLine) + "</p>" +
          '<div class="form"><label><span>Now with</span>' +
          '<select data-newwho aria-describedby="panel-unit">' +
          opts(people.map((p) => [p, p]), l.who) +
          "</select></label><label><span>Expected back</span>" +
          '<select data-newdue aria-describedby="panel-unit">' +
          opts(dueTimes.map((d) => [d, d]), l.due) +
          "</select></label></div>" +
          "<p>Request says: return by " + esc(getReq(l.req).due) + ".</p>" +
          '<div class="buttons">' +
          btn("Save change", "save-update", l.num, "primary") +
          btn("Cancel", "close-panel", l.num) +
          "</div></div>";
      html += row(
        l.asset + " · " + a.type,
        base + " · with " + l.who + " · due " + l.due +
          (l.was ? " (was " + l.was.who + " · due " + l.was.due + ")" : ""),
        right,
        extra,
        st === "late" ? "late" : "",
      );
    }
    return html;
  }
  function deskbook() {
    let html =
      head("Desk book", "Messages from clubs and notes for the next shift") +
      msgSlot();
    const entries = [
      [
        "Friday · 3:20 pm",
        "Isha Rao · Film Society",
        "Kabir Sen is picking up our whole screening kit. Please issue it in his name. I’m setting up in the courtyard.",
      ],
      [
        "Friday · 3:30 pm",
        "Tara Shah · Debate Union",
        "Our microphone stays with me overnight. I’ll return it by 10 am Saturday.",
      ],
    ];
    if (s.phase >= 1)
      entries.push([
        "Friday · 7:30 pm",
        "Kabir Sen · Film Society",
        "I brought the projector and speaker. Leela Das has our adapter. She’ll be at the counter at 9 am tomorrow.",
      ]);
    for (const n of s.notes)
      entries.push([shifts[n.phase].time, "Handover note", n.text]);
    for (const [t, author, body] of entries.slice().reverse())
      html +=
        '<article class="record"><small>' +
        esc(t) +
        "</small><h3>" +
        esc(author) +
        "</h3><p>" +
        esc(body) +
        "</p></article>";
    return (
      html +
      '<form data-note><div class="form"><label class="full"><span>Note for the next shift</span><textarea name="note" rows="3" maxlength="400" required placeholder="Which item, who has it, when it will come back, and the loan number."></textarea></label></div><button type="submit">Save note</button></form>'
    );
  }
  const screens = {
    Requests: requestPage,
    Inventory: inventory,
    "Loan register": register,
    "Desk book": deskbook,
  };
  function paint() {
    const phase = shifts[s.phase];
    q("[data-clock]").textContent = phase.time;
    q("[data-shift-title]").textContent = phase.title;
    q("[data-shift]").textContent = phase.text;
    const advance = q('[data-action="advance"]');
    advance.hidden = !phase.next;
    advance.textContent = phase.next || "";
    const caption = q("[data-shift-caption]");
    if (caption) {
      caption.textContent = phase.caption || "";
      caption.hidden = !phase.next;
    }
    q("[data-nav]").innerHTML = pages
      .map(
        ([n, icon, label]) =>
          '<button type="button" data-action="tab" data-val="' +
          n +
          '"' +
          (s.tab === n ? ' aria-current="page"' : "") +
          '><svg aria-hidden="true" class="store-icon"><use href="#icon-' +
          icon +
          '"></use></svg>' +
          esc(label || n) +
          "</button>",
      )
      .join("");
    const pg = pages.find((p) => p[0] === s.tab);
    q("[data-page]").setAttribute("aria-label", (pg && pg[2]) || s.tab);
    q("[data-page]").innerHTML = screens[s.tab]();
    if (q("[data-filter]")) q("[data-filter]").value = s.filter;
    q("[data-status]").textContent = s.notice;
    if (ui.focus) {
      const el = q(ui.focus);
      ui.focus = "";
      if (el) el.focus();
    }
  }
  // Saves only `s`; nothing in `ui` is ever saved.
  function commit(msg) {
    if (msg) s.notice = msg;
    if (ui.msg) s.notice = ui.focus === "[data-msg]" ? "" : ui.msg.text;
    paint();
    try {
      localStorage.setItem(storageKey, JSON.stringify(s));
    } catch {
      q("[data-status]").textContent +=
        " Browser storage is unavailable. Progress lasts for this visit.";
    }
  }
  root.addEventListener("click", (e) => {
    const b = e.target.closest("[data-action]");
    if (!b) return;
    const v = b.dataset.val;
    const act = b.dataset.action;
    if (act !== "undo") ui.msg = null;
    switch (act) {
      case "restart":
        s = original();
        ui = freshUi();
        ui.focus = "[data-page] h2";
        break;
      case "advance":
        if (s.phase < 2) s.phase++;
        s.notice = "Desk time is now " + shifts[s.phase].time + ".";
        ui.panel = null;
        ui.editing = false;
        ui.keep = null;
        ui.focus = "[data-page] h2";
        break;
      case "tab":
        s.tab = v;
        ui.editing = false;
        ui.panel = null;
        ui.focus = "[data-page] h2";
        break;
      case "close": {
        const was = s.selected;
        s.selected = "";
        if (was)
          ui.focus = '[data-action="request"][data-val="' + was + '"]';
        break;
      }
      case "request":
        s.selected = v;
        ui.focus = ".record h3";
        break;
      case "lend-for":
        if (!getReq(v)) return;
        s.tab = "Loan register";
        ui.editing = v;
        ui.keep = null;
        ui.panel = null;
        ui.focus = '[data-issue] select[name="asset"]';
        break;
      case "new":
        ui.editing = true;
        ui.keep = null;
        ui.panel = null;
        ui.focus = "[data-issue] select";
        break;
      case "cancel":
        ui.editing = false;
        ui.focus = '[data-action="new"]';
        break;
      case "scope":
        s.onlyOpen = v === "0";
        ui.focus = '[data-action="scope"][data-val="' + v + '"]';
        break;
      case "return":
        ui.panel = { num: Number(v), kind: "return" };
        ui.focus = "[data-panel] select";
        break;
      case "update":
        ui.panel = { num: Number(v), kind: "update" };
        ui.focus = "[data-panel] select";
        break;
      case "close-panel": {
        const k = ui.panel?.kind === "update" ? "update" : "return";
        ui.panel = null;
        ui.focus = '[data-action="' + k + '"][data-val="' + v + '"]';
        break;
      }
      case "confirm-return":
      case "not-this": {
        const l = s.loans.find((x) => x.num === Number(v));
        if (!l || l.back) return;
        const a = getAsset(l.asset);
        if (b.dataset.action === "confirm-return") {
          const sel = q("[data-backby]");
          const by = sel ? sel.value : "";
          l.back = true;
          l.backAt = s.phase;
          l.backBy = people.includes(by) ? by : l.who;
          ui.msg = {
            kind: "ok",
            text:
              l.asset + " (" + a.model + ") is back. " +
              (a.bin === "Workshop" ? "Put it in the workshop." : "Put it on " + where(a) + ".") +
              " Loan L-" + l.num + " closed.",
            undo: { type: "return", num: l.num },
          };
        } else
          ui.msg = {
            kind: "warn",
            text:
              "Nothing changed. Loan L-" + l.num + " is still open. It is for " +
              l.asset + " (" + a.model + "). Don't take a different item as this return; ask where " +
              l.asset + " is.",
            undo: null,
          };
        ui.panel = null;
        ui.focus = "[data-msg]";
        break;
      }
      case "save-update": {
        const l = s.loans.find((x) => x.num === Number(v));
        if (!l || l.back) return;
        const w = q("[data-newwho]"), d = q("[data-newdue]");
        const who = w ? w.value : "", due = d ? d.value : "";
        if (!people.includes(who) || !Object.hasOwn(dueHours, due)) return;
        if (who === l.who && due === l.due)
          ui.msg = { kind: "ok", text: "Nothing changed.", undo: null };
        else {
          const prev = { who: l.who, due: l.due, was: l.was ? { ...l.was } : undefined };
          if (!l.was) l.was = { who: l.who, due: l.due };
          l.who = who;
          l.due = due;
          if (l.was.who === who && l.was.due === due) delete l.was;
          ui.msg = {
            kind: "ok",
            text: "Loan L-" + l.num + " updated: now with " + who + ", expected back " + due + ".",
            undo: { type: "update", num: l.num, prev },
          };
        }
        ui.panel = null;
        ui.focus = "[data-msg]";
        break;
      }
      case "undo": {
        const u = ui.msg?.undo;
        if (!u) return;
        const l = s.loans.find((x) => x.num === u.num);
        let text = "";
        if (u.type === "return") {
          if (!l || !l.back || out(l.asset)) return;
          l.back = false;
          delete l.backAt;
          delete l.backBy;
          text = "Undone. Loan L-" + l.num + " is open again.";
        } else if (u.type === "lend") {
          if (!l || l.back) return;
          s.loans = s.loans.filter((x) => x.num !== u.num);
          text =
            "Undone. Loan L-" + l.num + " was removed. " + l.asset +
            " is available again.";
        } else if (u.type === "update") {
          if (!l || !u.prev) return;
          l.who = u.prev.who;
          l.due = u.prev.due;
          if (u.prev.was) l.was = u.prev.was;
          else delete l.was;
          text =
            "Undone. Loan L-" + l.num + " is back to " + l.who + " · due " +
            l.due + ".";
        } else return;
        ui.panel = null;
        ui.msg = { kind: "ok", text, undo: null };
        ui.focus = "[data-msg]";
        break;
      }
    }
    commit();
  });
  root.addEventListener("change", (e) => {
    if (e.target.matches("[data-filter]")) {
      s.filter = e.target.value;
      ui.focus = "[data-filter]";
      commit();
    }
    const f = e.target.form;
    if (f && f.matches("[data-issue]")) {
      e.target.removeAttribute("aria-invalid");
      const r = getReq(f.elements.req.value),
        hint = f.querySelector("[data-duehint]");
      if (e.target.name === "req" && r) f.elements.due.value = r.due;
      if (hint)
        hint.textContent = !r
          ? ""
          : f.elements.due.value === r.due
            ? "From the request."
            : "The request says " +
              r.due +
              ". You can still choose a different time.";
    }
  });
  root.addEventListener("submit", (e) => {
    e.preventDefault();
    const f = e.target;
    const form = new FormData(f);
    if (f.matches("[data-note]")) {
      const text = String(form.get("note")).trim();
      if (!text) return;
      s.notes.push({ phase: s.phase, text });
      ui.msg = {
        kind: "ok",
        text: "Note saved. The next shift will see it at the top of the Desk book.",
        undo: null,
      };
      ui.focus = "[data-msg]";
      commit();
      return;
    }
    if (!f.matches("[data-issue]")) return;
    const [req, asset, who, due] = ["req", "asset", "who", "due"].map((k) =>
      form.get(k),
    );
    const unit = getAsset(asset),
      r = getReq(req);
    if (!r || !unit || unit.repair || out(asset))
      return formError(f, "Choose an item and a person from the lists.", "asset");
    if (!people.includes(who))
      return formError(f, "Choose an item and a person from the lists.", "who");
    if (!r.items.includes(unit.type))
      return formError(
        f,
        r.id + " doesn't include a " + unit.type + ". It covers: " +
          r.items.join(", ") + ". Pick one of those.",
        "asset",
      );
    const x = s.loans.find(
      (l) => l.req === req && !l.back && getAsset(l.asset).type === unit.type,
    );
    if (x)
      return formError(
        f,
        r.id + " already has a " + unit.type + " out (" + x.asset +
          ", loan L-" + x.num + "). Each request gets one of each item.",
        "asset",
      );
    const num = Math.max(...s.loans.map((l) => l.num)) + 1;
    s.loans.push({ num, req, asset, who, due, back: false });
    ui.keep = { who, due };
    const left = toLend(r).length;
    ui.editing = left ? r.id : false;
    ui.panel = null;
    ui.msg = {
      kind: "ok",
      text:
        asset + " (" + unit.model + ") lent to " + who + ", due back " + due +
        ". Loan L-" + num + "." +
        (left
          ? ""
          : " All " + r.items.length + " items on " + r.id + " are now out."),
      undo: { type: "lend", num },
    };
    ui.focus = left ? '[data-issue] select[name="asset"]' : "[data-msg]";
    commit();
  });
  function restore(d) {
    if (
      !d ||
      d.version !== 1 ||
      !Object.hasOwn(screens, d.tab) ||
      !shifts[d.phase] ||
      (d.selected && !getReq(d.selected)) ||
      !Array.isArray(d.notes) ||
      !d.notes.every(
        (n) => n && shifts[n.phase] && typeof n.text === "string",
      ) ||
      !Array.isArray(d.loans) ||
      !d.loans.length ||
      !d.loans.every(
        (l) =>
          l && getReq(l.req) && getAsset(l.asset) && Number.isInteger(l.num),
      )
    )
      return;
    const { editing, ...rest } = d; // drop the old `editing` key (now in `ui`)
    s = {
      ...original(),
      ...rest,
      loans: d.loans.map((l) => {
        const x = { ...l };
        if (!x.back || !(Number.isInteger(x.backAt) && shifts[x.backAt]))
          delete x.backAt;
        if (!x.back || !people.includes(x.backBy)) delete x.backBy;
        if (
          !(
            x.was &&
            people.includes(x.was.who) &&
            Object.hasOwn(dueHours, x.was.due)
          )
        )
          delete x.was;
        return x;
      }),
      notes: d.notes.map((n) => ({ ...n })),
    };
    paint();
  }
  paint();
  try {
    restore(JSON.parse(localStorage.getItem(storageKey)));
  } catch {
    // Keep the fresh shift when storage is unavailable or the saved data is invalid.
  }
})();
