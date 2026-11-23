// Shared pieces used by every page: travel groups, remembered travel choice, table helpers.
export const USER_GROUPS = ["Car driver", "Car passenger", "Motorcyclist", "Cyclist", "Pedestrian", "Other road users"];
const USER_MAP = { "Car driver": "Car driver", "Car passenger": "Car passenger", "Motorcyclist": "Motorcyclist", "Pedal cyclist": "Cyclist", "Pedestrian": "Pedestrian" };
export const userGroup = (name) => USER_MAP[name] ?? "Other road users";

// The travel bar in the wireframe
export const TRAVEL = {
  everyone: { label: "Everyone", who: "everyone", users: null },
  car: { label: "Car", who: "car drivers and passengers", users: ["Car driver", "Car passenger"] },
  bike: { label: "Bike", who: "cyclists", users: ["Cyclist"] },
  motorbike: { label: "Motorbike", who: "motorcyclists", users: ["Motorcyclist"] },
  foot: { label: "Foot", who: "pedestrians", users: ["Pedestrian"] },
};

export const fmt = (n) => n.toLocaleString("en-AU");
export const pct = (x) => (x * 100).toFixed(1) + "%";

// The travel choice is remembered while the tab is open, so chapters 2 and 3 follow the intro.
export function loadTravel() {
  try { const k = sessionStorage.getItem("travel"); return k in TRAVEL ? k : "everyone"; } catch { return "everyone"; }
}
export function saveTravel(key) { try { sessionStorage.setItem("travel", key); } catch { /* storage can be blocked */ } }

/** Builds the buttons inside #travel-options and wires #travel-reset (if present). */
export function initTravelBar(state, onChange) {
  const host = document.querySelector("#travel-options");
  host.textContent = "";
  for (const [key, t] of Object.entries(TRAVEL)) {
    const b = document.createElement("button");
    b.type = "button";
    b.className = "travel-option";
    b.dataset.key = key;
    b.textContent = t.label;
    b.addEventListener("click", () => { state.travel = key; saveTravel(key); onChange(); });
    host.append(b);
  }
  const reset = document.querySelector("#travel-reset");
  if (reset) reset.addEventListener("click", () => { state.travel = "everyone"; saveTravel("everyone"); onChange(); });
  markTravel(state.travel);
}
export function markTravel(key) {
  document.querySelectorAll("#travel-options button").forEach((b) => b.setAttribute("aria-pressed", String(b.dataset.key === key)));
}

/** "View as table" button: <button data-table-toggle="table-id" aria-expanded="false">. */
export function initTableToggle() {
  document.querySelectorAll("[data-table-toggle]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const table = document.getElementById(btn.dataset.tableToggle);
      const open = table.hidden;
      table.hidden = !open;
      btn.setAttribute("aria-expanded", String(open));
      btn.textContent = open ? "Hide table" : "View as table";
    });
  });
}

/** Fills a .chart-table container with a table. cols: [{h, num}], rows: arrays of strings. */
export function fillTable(host, caption, cols, rows) {
  const t = document.createElement("table");
  const cap = document.createElement("caption"); cap.textContent = caption; t.append(cap);
  const tr = document.createElement("tr");
  cols.forEach((c) => { const th = document.createElement("th"); th.scope = "col"; if (c.num) th.className = "num"; th.textContent = c.h; tr.append(th); });
  const thead = document.createElement("thead"); thead.append(tr); t.append(thead);
  const tbody = document.createElement("tbody");
  rows.forEach((r) => {
    const row = document.createElement("tr");
    r.forEach((v, i) => { const td = document.createElement("td"); if (cols[i].num) td.className = "num"; td.textContent = v; row.append(td); });
    tbody.append(row);
  });
  t.append(tbody);
  host.replaceChildren(t);
}

/** Calls fn when the element's width changes, so chart text never shrinks below 12px. */
export function onWidthChange(el, fn) {
  let last = 0;
  new ResizeObserver(() => { const w = Math.round(el.clientWidth); if (w !== last) { last = w; fn(); } }).observe(el);
}
