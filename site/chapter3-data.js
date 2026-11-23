// Chapter 3 data helpers. Pure functions, no DOM, so they are easy to test.
// Input rows come from data/national_by_road_user_counterparty_year.csv (KNIME output).
import { USER_GROUPS, userGroup, TRAVEL, fmt, pct } from "./shared.js";
export { USER_GROUPS, userGroup, TRAVEL, fmt, pct };

// Right side of the Sankey: what they were hit by or crashed into (10 counterparties grouped into 5)
export const HIT_GROUPS = ["Car, pick-up or van", "Non-collision", "Fixed object", "Other or unspecified", "Other collisions"];
const HIT_MAP = {
  "Car, pick-up truck or van": "Car, pick-up or van",
  "Non-collision transport accident": "Non-collision",
  "Fixed or stationary object": "Fixed object",
  "Other and unspecified transport accidents": "Other or unspecified",
};
// Everything else (heavy vehicle or bus, pedestrian or animal, pedal cycle, 2-3 wheelers, train...) is "Other collisions"
export const hitGroup = (name) => HIT_MAP[name] ?? "Other collisions";

const sum = (arr, f) => arr.reduce((t, d) => t + f(d), 0);

/** One row per (road user group, what they hit) for a year. */
export function groupFlows(rows, year) {
  const m = new Map();
  for (const r of rows) {
    if (+r.calendar_year !== year) continue;
    const key = userGroup(r.road_user) + "|" + hitGroup(r.counterparty);
    m.set(key, (m.get(key) || 0) + Number(r.hospitalisations));
  }
  return [...m].map(([k, value]) => { const [user, hit] = k.split("|"); return { user, hit, value }; });
}

/** Adds `share`: the part of that road user group's cases that went to this counterparty. */
export function withShares(flows) {
  const totals = new Map();
  for (const f of flows) totals.set(f.user, (totals.get(f.user) || 0) + f.value);
  return flows.map((f) => ({ ...f, share: f.value / totals.get(f.user) }));
}

/** Sorted totals by what they hit, for the selected travel group (users = null means everyone). */
export function hitTotals(flows, users) {
  const chosen = users ? flows.filter((f) => users.includes(f.user)) : flows;
  const total = sum(chosen, (f) => f.value);
  return HIT_GROUPS.map((hit) => {
    const value = sum(chosen.filter((f) => f.hit === hit), (f) => f.value);
    return { hit, value, share: total ? value / total : 0 };
  }).sort((a, b) => b.value - a.value);
}

/** Hospitalisations per year for the selected travel group. */
export function yearTotals(rows, users) {
  const m = new Map();
  for (const r of rows) {
    if (users && !users.includes(userGroup(r.road_user))) continue;
    m.set(+r.calendar_year, (m.get(+r.calendar_year) || 0) + Number(r.hospitalisations));
  }
  return [...m].map(([year, value]) => ({ year, value })).sort((a, b) => a.year - b.year);
}
