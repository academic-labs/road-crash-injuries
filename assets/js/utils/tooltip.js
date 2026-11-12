// One shared tooltip element, created once and reused by every chart.
// Charts never create or delete tooltips: they only show, move and hide this one.
import * as d3 from "./d3.js";

let tip = null;

function getTip() {
  if (tip) return tip;
  tip = d3.select("body").append("div").attr("class", "tooltip").attr("role", "tooltip");
  tip.append("div").attr("class", "tooltip-title");
  tip.append("div").attr("class", "tooltip-rows");
  // The pointer stops moving while the page scrolls, so hide rather than leave it stranded
  window.addEventListener("scroll", hideTooltip, { passive: true });
  return tip;
}

/** Fill the tooltip with { title, rows: [[label, value], ...] }, show it and place it at the pointer. */
export function showTooltip(event, { title = "", rows = [] }) {
  const t = getTip();
  t.select(".tooltip-title").text(title).style("display", title ? null : "none");
  t.select(".tooltip-rows").selectAll("div").data(rows).join((enter) => {
    const row = enter.append("div");
    row.append("span").attr("class", "tooltip-label");
    row.append("span").attr("class", "tooltip-value");
    return row;
  }).each(function ([label, value]) {
    const row = d3.select(this);
    row.select(".tooltip-label").text(label);
    row.select(".tooltip-value").text(value);
  });
  t.classed("is-visible", true);
  moveTooltip(event);
}

/** Follow the pointer, flipping to the other side near the viewport edges. */
export function moveTooltip(event) {
  const node = getTip().node();
  const gap = 14;
  let x = event.clientX + gap;
  let y = event.clientY + gap;
  if (x + node.offsetWidth > window.innerWidth - 8) x = event.clientX - gap - node.offsetWidth;
  if (y + node.offsetHeight > window.innerHeight - 8) y = event.clientY - gap - node.offsetHeight;
  tip.style("transform", `translate(${Math.max(8, x)}px, ${Math.max(8, y)}px)`);
}

export function hideTooltip() {
  if (tip) tip.classed("is-visible", false);
}

/** Wire a selection of marks to the tooltip. getContent(d) returns { title, rows }. */
export function attachTooltip(selection, getContent) {
  selection
    .on("pointerenter.tooltip", (event, d) => showTooltip(event, getContent(d)))
    .on("pointermove.tooltip", moveTooltip)
    .on("pointerleave.tooltip", hideTooltip);
}
