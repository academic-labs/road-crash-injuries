// Chapter 3: How do people get hurt?  Sankey (main), sorted bars and a trend line (supporting).
import * as d3 from "./d3.js";
import { sankey as makeSankey, sankeyLinkHorizontal } from "https://cdn.jsdelivr.net/npm/d3-sankey@0.12.3/+esm";
import { attachTooltip } from "./tooltip.js";
import * as M from "./chapter3-data.js";
import * as S from "./shared.js";

const DATA_URL = "data/national_by_road_user_counterparty_year.csv";
const state = { year: 2021, travel: S.loadTravel() };
let rows = [];

const $ = (sel) => document.querySelector(sel);
const selectedUsers = () => M.TRAVEL[state.travel].users;

async function init() {
  rows = await d3.csv(DATA_URL, d3.autoType);

  const years = [...new Set(rows.map((r) => r.calendar_year))].sort(d3.ascending);
  d3.select("#year").selectAll("option").data(years).join("option").attr("value", (d) => d).text((d) => d);
  $("#year").value = state.year;
  $("#year").addEventListener("change", (e) => { state.year = +e.target.value; draw(); });

  S.initTravelBar(state, draw);

  $("#table-toggle").addEventListener("click", (e) => {
    const table = $("#flow-table");
    const open = table.hidden;
    table.hidden = !open;
    e.currentTarget.setAttribute("aria-expanded", String(open));
    e.currentTarget.textContent = open ? "Hide table" : "View as table";
  });

  // Redraw the charts when their width changes so text never shrinks below 12px
  let lastWidth = 0;
  new ResizeObserver(() => {
    const w = Math.round($("#sankey").clientWidth);
    if (w !== lastWidth) { lastWidth = w; draw(); }
  }).observe($("#sankey"));

  draw();
}

function draw() {
  const flows = M.withShares(M.groupFlows(rows, state.year));
  const users = selectedUsers();
  const label = M.TRAVEL[state.travel].label;

  S.markTravel(state.travel);
  $("#travel-showing").textContent = `Showing: ${label} in ${state.year}`;
  $("#main-title").textContent = `How people were hurt in ${state.year}`;
  $("#bars-title").textContent = `What ${M.TRAVEL[state.travel].who} hit in ${state.year}`;
  $("#trend-title").textContent = `Hospitalisations each year: ${label}`;

  drawSankey(flows, users);
  drawBars(flows, users);
  drawTrend();
  drawTable(flows, users);
}

// ---------- Sankey ----------
function drawSankey(flows, users) {
  const host = d3.select("#sankey");
  host.selectAll("*").remove();
  const width = Math.max(320, host.node().clientWidth);
  const narrow = width < 640;
  const height = narrow ? 460 : 420;
  const m = { top: 8, bottom: 8, left: narrow ? 100 : 150, right: narrow ? 140 : 190 };

  const svg = host.append("svg").attr("viewBox", `0 0 ${width} ${height}`).attr("role", "img")
    .attr("aria-labelledby", "sankey-svg-title sankey-svg-desc");
  svg.append("title").attr("id", "sankey-svg-title").text(`How people were hurt in ${state.year}`);
  svg.append("desc").attr("id", "sankey-svg-desc").text(
    "Sankey chart. Left: how people were travelling. Right: what they were hit by or crashed into. Band width shows hospitalisations. The same numbers are in the table below."
  );

  const order = [...M.USER_GROUPS.map((n) => "u:" + n), ...M.HIT_GROUPS.map((n) => "h:" + n)];
  const links = flows.filter((f) => f.value > 0).map((f) => ({ ...f, source: "u:" + f.user, target: "h:" + f.hit }));
  const used = new Set(links.flatMap((l) => [l.source, l.target]));
  const nodes = order.filter((id) => used.has(id)).map((id) => ({ id, name: id.slice(2), side: id[0], order: order.indexOf(id) }));

  const layout = makeSankey()
    .nodeId((d) => d.id)
    .nodeWidth(16)
    .nodePadding(14)
    .nodeSort((a, b) => a.order - b.order)
    .extent([[m.left, m.top], [width - m.right, height - m.bottom]]);
  const graph = layout({ nodes, links });

  const isSelected = (d) => !users || users.includes(d.user);
  const linkColour = (d) => (!users ? "var(--blue)" : isSelected(d) ? "var(--accent)" : "var(--rule)");
  const linkOpacity = (d) => (!users ? 0.45 : isSelected(d) ? 0.85 : 0.25);

  const link = svg.append("g").attr("fill", "none").selectAll("path").data(graph.links).join("path")
    .attr("d", sankeyLinkHorizontal())
    .attr("stroke", linkColour)
    .attr("stroke-opacity", linkOpacity)
    .attr("stroke-width", (d) => Math.max(1, d.width));
  attachTooltip(link, (d) => ({
    title: `${d.user} → ${d.hit}`,
    rows: [["Hospitalisations", M.fmt(d.value)], [`Share of ${d.user.toLowerCase()} cases`, M.pct(d.share)]],
  }));

  const node = svg.append("g").selectAll("rect").data(graph.nodes).join("rect")
    .attr("x", (d) => d.x0).attr("y", (d) => d.y0)
    .attr("width", (d) => d.x1 - d.x0).attr("height", (d) => Math.max(1, d.y1 - d.y0))
    .attr("fill", "var(--ink)");
  attachTooltip(node, (d) => ({ title: d.name, rows: [["Hospitalisations", M.fmt(d.value)]] }));

  // Labels: name on the first line, count on the second. Text is never below 12px.
  const label = svg.append("g").selectAll("text").data(graph.nodes).join("text")
    .attr("x", (d) => (d.side === "u" ? d.x0 - 8 : d.x1 + 8))
    .attr("y", (d) => (d.y0 + d.y1) / 2)
    .attr("text-anchor", (d) => (d.side === "u" ? "end" : "start"))
    .attr("dominant-baseline", "middle");
  label.append("tspan").attr("x", (d) => (d.side === "u" ? d.x0 - 8 : d.x1 + 8)).attr("dy", "-0.55em").style("font-weight", 600).text((d) => d.name);
  label.append("tspan").attr("x", (d) => (d.side === "u" ? d.x0 - 8 : d.x1 + 8)).attr("dy", "1.2em").text((d) => M.fmt(d.value));
}

// ---------- Supporting chart A: sorted bars ----------
function drawBars(flows, users) {
  const host = d3.select("#bars");
  host.selectAll("*").remove();
  const data = M.hitTotals(flows, users);
  const width = Math.max(280, host.node().clientWidth);
  const barH = 34, m = { top: 6, right: 120, bottom: 6, left: 140 };
  const height = m.top + m.bottom + barH * data.length;

  const svg = host.append("svg").attr("viewBox", `0 0 ${width} ${height}`).attr("role", "img")
    .attr("aria-label", `Bar chart of what ${M.TRAVEL[state.travel].who} hit in ${state.year}, largest first. Values are in the table.`);
  const x = d3.scaleLinear([0, d3.max(data, (d) => d.value) || 1], [m.left, width - m.right]);
  const y = d3.scaleBand(data.map((d) => d.hit), [m.top, height - m.bottom]).padding(0.25);

  const bar = svg.append("g").selectAll("rect").data(data).join("rect")
    .attr("x", m.left).attr("y", (d) => y(d.hit)).attr("height", y.bandwidth())
    .attr("width", (d) => Math.max(0, x(d.value) - m.left)).attr("fill", "var(--accent)");
  attachTooltip(bar, (d) => ({ title: d.hit, rows: [["Hospitalisations", M.fmt(d.value)], ["Share", M.pct(d.share)]] }));

  svg.append("g").selectAll("text.name").data(data).join("text")
    .attr("x", m.left - 8).attr("y", (d) => y(d.hit) + y.bandwidth() / 2).attr("text-anchor", "end").attr("dominant-baseline", "middle")
    .text((d) => d.hit);
  svg.append("g").selectAll("text.value").data(data).join("text")
    .attr("x", (d) => x(d.value) + 6).attr("y", (d) => y(d.hit) + y.bandwidth() / 2).attr("dominant-baseline", "middle")
    .text((d) => `${M.fmt(d.value)} (${M.pct(d.share)})`);
}

// ---------- Supporting chart B: trend for the selected group ----------
function drawTrend() {
  const host = d3.select("#trend");
  host.selectAll("*").remove();
  const data = M.yearTotals(rows, selectedUsers());
  const width = Math.max(280, host.node().clientWidth), height = 240;
  const m = { top: 14, right: 16, bottom: 28, left: 56 };

  const svg = host.append("svg").attr("viewBox", `0 0 ${width} ${height}`).attr("role", "img")
    .attr("aria-label", `Line chart of hospitalisations each year, 2011 to 2021, for ${M.TRAVEL[state.travel].label.toLowerCase()}.`);
  const x = d3.scaleLinear(d3.extent(data, (d) => d.year), [m.left, width - m.right]);
  const y = d3.scaleLinear([0, d3.max(data, (d) => d.value)], [height - m.bottom, m.top]).nice();

  svg.append("g").attr("class", "axis").attr("transform", `translate(0,${height - m.bottom})`)
    .call(d3.axisBottom(x).tickFormat(d3.format("d")).ticks(width < 420 ? 4 : 6));
  svg.append("g").attr("class", "axis").attr("transform", `translate(${m.left},0)`)
    .call(d3.axisLeft(y).ticks(5).tickFormat(d3.format(",")));
  svg.append("path").datum(data).attr("fill", "none").attr("stroke", "var(--ink)").attr("stroke-width", 3)
    .attr("d", d3.line().x((d) => x(d.year)).y((d) => y(d.value)));

  const dots = svg.append("g").selectAll("circle").data(data).join("circle")
    .attr("cx", (d) => x(d.year)).attr("cy", (d) => y(d.value))
    .attr("r", (d) => (d.year === state.year ? 7 : 4))
    .attr("fill", (d) => (d.year === state.year ? "var(--accent)" : "var(--ink)"));
  attachTooltip(dots, (d) => ({ title: String(d.year), rows: [["Hospitalisations", M.fmt(d.value)]] }));
}

// ---------- Table view (the accessible alternative to the charts) ----------
function drawTable(flows, users) {
  const chosen = flows.filter((f) => !users || users.includes(f.user));
  const order = (f) => M.USER_GROUPS.indexOf(f.user) * 10 + M.HIT_GROUPS.indexOf(f.hit);
  chosen.sort((a, b) => order(a) - order(b));
  const table = d3.select("#flow-table");
  table.selectAll("*").remove();
  const t = table.append("table");
  t.append("caption").text(`Hospitalisations in ${state.year}: ${M.TRAVEL[state.travel].label}`);
  const head = t.append("thead").append("tr");
  ["Travelling as", "What they hit", "Hospitalisations", "Share of group"].forEach((h, i) =>
    head.append("th").attr("scope", "col").attr("class", i > 1 ? "num" : null).text(h));
  const body = t.append("tbody");
  chosen.forEach((f) => {
    const tr = body.append("tr");
    tr.append("td").text(f.user);
    tr.append("td").text(f.hit);
    tr.append("td").attr("class", "num").text(M.fmt(f.value));
    tr.append("td").attr("class", "num").text(M.pct(f.share));
  });
}

init().catch((err) => {
  console.error(err);
  $("#sankey").textContent = "Sorry, the chart data could not be loaded. Check that you are running a local server (not opening the file directly).";
});
