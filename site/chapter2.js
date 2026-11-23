// Chapter 2: Who is getting hurt?  Indexed lines (main), age heatmap and women/men split (supporting).
import * as d3 from "./d3.js";
import { attachTooltip } from "./tooltip.js";
import * as S from "./shared.js";

const $ = (sel) => document.querySelector(sel);
const state = { travel: S.loadTravel(), mode: "index" };
const AGES = ["0-7", "8-16", "17-25", "26-39", "40-64", "65-74", "75+"]; // "Unknown" (1 case) is left out of the heatmap
const COLOURS = { "Car driver": "#C2571A", "Car passenger": "#8A3E10", "Motorcyclist": "#1B2A3A", "Cyclist": "#2F6F8F", "Pedestrian": "#5B7C5A", "Other road users": "#8A9BA8" };
const DASH = { "Car driver": null, "Car passenger": "8 5", "Motorcyclist": null, "Cyclist": null, "Pedestrian": "2 5", "Other road users": "10 4 2 4" };
let series = [], ageRows = [], sexRows = [];
const users = () => S.TRAVEL[state.travel].users;

async function init() {
  const [ru, age, sex] = await Promise.all([
    d3.csv("data/national_by_year_road_user.csv", d3.autoType),
    d3.csv("data/national_by_age_road_user_year.csv", d3.autoType),
    d3.csv("data/national_by_road_user_sex.csv", d3.autoType),
  ]);
  // Group the 12 road users into 6, then index each group to 2011 = 100
  const byGroup = d3.rollup(ru, (v) => d3.sum(v, (d) => d.hospitalisations), (d) => S.userGroup(d.road_user), (d) => d.calendar_year);
  series = S.USER_GROUPS.map((name) => {
    const m = byGroup.get(name);
    const years = [...m.keys()].sort(d3.ascending);
    return { name, values: years.map((year) => ({ year, value: m.get(year), index: (m.get(year) / m.get(years[0])) * 100 })) };
  });
  ageRows = age.map((d) => ({ year: d.calendar_year, age: d.age_group, group: S.userGroup(d.road_user), value: d.hospitalisations }));
  sexRows = sex.map((d) => ({ sex: d.sex, group: S.userGroup(d.road_user), value: d.hospitalisations }));

  S.initTravelBar(state, draw);
  S.initTableToggle();
  document.querySelectorAll("[data-mode]").forEach((b) => b.addEventListener("click", () => { state.mode = b.dataset.mode; draw(); }));
  S.onWidthChange($("#main-chart"), draw);
  draw();
}

const isChosen = (name) => !users() || users().includes(name);

function draw() {
  const label = S.TRAVEL[state.travel].label, who = S.TRAVEL[state.travel].who;
  S.markTravel(state.travel);
  document.querySelectorAll("[data-mode]").forEach((b) => b.setAttribute("aria-pressed", String(b.dataset.mode === state.mode)));
  $("#travel-showing").textContent = `Showing: ${label}`;
  $("#main-title").textContent = state.mode === "index" ? "How each group changed since 2011 (2011 = 100)" : "Hospital cases each year, by group";
  $("#age-title").textContent = `Ages of ${who}, by year`;
  $("#sex-title").textContent = `Women and men: ${who}, 2011 to 2021`;
  drawMain();
  drawAge();
  drawSex();
  drawTable();
}

function drawMain() {
  const host = $("#main-chart"); host.replaceChildren();
  const width = Math.max(320, host.clientWidth), narrow = width < 640, height = 380;
  const m = { top: 14, right: narrow ? 128 : 160, bottom: 30, left: 54 };
  const key = state.mode === "index" ? "index" : "value";
  const svg = d3.select(host).append("svg").attr("viewBox", `0 0 ${width} ${height}`).attr("role", "img")
    .attr("aria-label", "Line chart of hospital cases by road user group from 2011 to 2021. Cyclists rose by about 51 percent and pedestrians fell by about 15 percent. The numbers are in the table.");
  const x = d3.scaleLinear([2011, 2021], [m.left, width - m.right]);
  const all = series.flatMap((s) => s.values.map((v) => v[key]));
  const y = d3.scaleLinear(state.mode === "index" ? [Math.min(70, d3.min(all)), d3.max(all)] : [0, d3.max(all)], [height - m.bottom, m.top]).nice();

  svg.append("g").attr("class", "gridline").selectAll("line").data(y.ticks(6)).join("line").attr("x1", m.left).attr("x2", width - m.right).attr("y1", y).attr("y2", y);
  svg.append("g").attr("class", "axis").attr("transform", `translate(0,${height - m.bottom})`).call(d3.axisBottom(x).tickFormat(d3.format("d")).ticks(narrow ? 5 : 11));
  svg.append("g").attr("class", "axis").attr("transform", `translate(${m.left},0)`).call(d3.axisLeft(y).ticks(6).tickFormat(d3.format(",")));
  if (state.mode === "index") {
    svg.append("line").attr("x1", m.left).attr("x2", width - m.right).attr("y1", y(100)).attr("y2", y(100)).attr("stroke", "var(--ink)").attr("stroke-dasharray", "2 4");
    svg.append("text").attr("x", m.left + 6).attr("y", y(100) - 6).text("2011 = 100");
  }

  const line = d3.line().x((d) => x(d.year)).y((d) => y(d[key]));
  // Selected groups are bold; the others fade back
  [...series].sort((a, b) => isChosen(a.name) - isChosen(b.name)).forEach((s) => {
    const on = isChosen(s.name);
    svg.append("path").datum(s.values).attr("fill", "none").attr("stroke", COLOURS[s.name]).attr("stroke-dasharray", DASH[s.name])
      .attr("stroke-width", on ? (users() ? 5 : 3.5) : 2).attr("stroke-opacity", on ? 1 : 0.3).attr("d", line);
    const dots = svg.append("g").selectAll("circle").data(s.values).join("circle").attr("cx", (d) => x(d.year)).attr("cy", (d) => y(d[key]))
      .attr("r", 4).attr("fill", COLOURS[s.name]).attr("opacity", on ? 1 : 0.3);
    attachTooltip(dots, (d) => ({ title: `${s.name}, ${d.year}`, rows: [["Hospital cases", S.fmt(d.value)], ["Index (2011 = 100)", d.index.toFixed(0)]] }));
  });

  // Direct labels at the line ends, nudged apart so they do not overlap
  const ends = series.map((s) => ({ s, y: y(s.values[s.values.length - 1][key]) })).sort((a, b) => a.y - b.y);
  for (let i = 1; i < ends.length; i++) if (ends[i].y - ends[i - 1].y < 16) ends[i].y = ends[i - 1].y + 16;
  svg.append("g").selectAll("text").data(ends).join("text").attr("x", width - m.right + 8).attr("y", (d) => d.y).attr("dominant-baseline", "middle")
    .style("font-weight", (d) => (isChosen(d.s.name) ? 700 : 400)).attr("opacity", (d) => (isChosen(d.s.name) ? 1 : 0.6))
    .text((d) => { const last = d.s.values[d.s.values.length - 1]; return `${d.s.name} ${state.mode === "index" ? last.index.toFixed(0) : S.fmt(last.value)}`; });
}

function drawAge() {
  const host = $("#age-chart"); host.replaceChildren();
  const rows = ageRows.filter((r) => r.age !== "Unknown" && (!users() || users().includes(r.group)));
  const years = d3.range(2011, 2022);
  const cell = d3.rollup(rows, (v) => d3.sum(v, (d) => d.value), (d) => d.year, (d) => d.age);
  const total = (yr) => d3.sum(AGES, (a) => cell.get(yr)?.get(a) || 0);
  const width = Math.max(300, host.clientWidth), m = { top: 6, right: 6, bottom: 26, left: 50 }, rowH = 30;
  const height = m.top + m.bottom + rowH * AGES.length;
  const x = d3.scaleBand(years, [m.left, width - m.right]).padding(0.04), y = d3.scaleBand(AGES, [m.top, height - m.bottom]).padding(0.04);
  const data = years.flatMap((yr) => AGES.map((age) => { const v = cell.get(yr)?.get(age) || 0; return { yr, age, v, share: total(yr) ? v / total(yr) : 0 }; }));
  const max = d3.max(data, (d) => d.share) || 1;
  const colour = d3.scaleLinear([0, max], ["#F4F1EA", "#1B2A3A"]);
  const svg = d3.select(host).append("svg").attr("viewBox", `0 0 ${width} ${height}`).attr("role", "img")
    .attr("aria-label", `Heatmap of the age mix of ${S.TRAVEL[state.travel].who} for each year. Darker means a bigger share. The numbers are in the table.`);
  const rects = svg.append("g").selectAll("rect").data(data).join("rect").attr("x", (d) => x(d.yr)).attr("y", (d) => y(d.age))
    .attr("width", x.bandwidth()).attr("height", y.bandwidth()).attr("fill", (d) => colour(d.share)).attr("stroke", "var(--rule)").attr("stroke-width", 0.5);
  attachTooltip(rects, (d) => ({ title: `Ages ${d.age}, ${d.yr}`, rows: [["Share of cases", S.pct(d.share)], ["Hospital cases", S.fmt(d.v)]] }));
  if (x.bandwidth() >= 34) svg.append("g").selectAll("text").data(data).join("text").attr("x", (d) => x(d.yr) + x.bandwidth() / 2).attr("y", (d) => y(d.age) + y.bandwidth() / 2)
    .attr("text-anchor", "middle").attr("dominant-baseline", "middle").attr("fill", (d) => (d.share > max * 0.55 ? "#F4F1EA" : "#1B2A3A")).text((d) => Math.round(d.share * 100) + "%");
  svg.append("g").selectAll("text").data(AGES).join("text").attr("x", m.left - 6).attr("y", (d) => y(d) + y.bandwidth() / 2).attr("text-anchor", "end").attr("dominant-baseline", "middle").text((d) => d);
  svg.append("g").selectAll("text").data(years).join("text").attr("x", (d) => x(d) + x.bandwidth() / 2).attr("y", height - 8).attr("text-anchor", "middle")
    .text((d, i) => (x.bandwidth() >= 30 || i % 2 === 0 ? (x.bandwidth() >= 30 ? d : String(d).slice(2)) : ""));
}

function drawSex() {
  const host = $("#sex-chart"); host.replaceChildren();
  const rows = sexRows.filter((r) => !users() || users().includes(r.group));
  const totals = d3.rollup(rows, (v) => d3.sum(v, (d) => d.value), (d) => d.sex);
  const all = d3.sum(totals.values());
  const data = ["Female", "Male"].map((sex) => ({ sex: sex === "Female" ? "Women" : "Men", value: totals.get(sex) || 0, share: (totals.get(sex) || 0) / all }));
  const width = Math.max(280, host.clientWidth), m = { top: 6, right: 110, bottom: 6, left: 64 }, barH = 44, height = m.top + m.bottom + barH * 2;
  const x = d3.scaleLinear([0, 1], [m.left, width - m.right]), y = d3.scaleBand(data.map((d) => d.sex), [m.top, height - m.bottom]).padding(0.25);
  const svg = d3.select(host).append("svg").attr("viewBox", `0 0 ${width} ${height}`).attr("role", "img")
    .attr("aria-label", `Bar chart of the share of cases that were women and men. Men ${S.pct(data[1].share)}, women ${S.pct(data[0].share)}.`);
  const bars = svg.append("g").selectAll("rect").data(data).join("rect").attr("x", m.left).attr("y", (d) => y(d.sex)).attr("height", y.bandwidth())
    .attr("width", (d) => x(d.share) - m.left).attr("fill", (d) => (d.sex === "Men" ? "var(--ink)" : "var(--accent)"));
  attachTooltip(bars, (d) => ({ title: d.sex, rows: [["Hospital cases", S.fmt(d.value)], ["Share", S.pct(d.share)]] }));
  svg.append("g").selectAll("text.n").data(data).join("text").attr("x", m.left - 8).attr("y", (d) => y(d.sex) + y.bandwidth() / 2).attr("text-anchor", "end").attr("dominant-baseline", "middle").text((d) => d.sex);
  svg.append("g").selectAll("text.v").data(data).join("text").attr("x", (d) => x(d.share) + 6).attr("y", (d) => y(d.sex) + y.bandwidth() / 2).attr("dominant-baseline", "middle").text((d) => `${S.pct(d.share)}`);
}

function drawTable() {
  const rows = series.flatMap((s) => s.values.map((v) => ({ s: s.name, ...v }))).filter((r) => isChosen(r.s));
  S.fillTable($("#flow-table"), `Hospital cases by group: ${S.TRAVEL[state.travel].label}`,
    [{ h: "Group" }, { h: "Year" }, { h: "Hospital cases", num: true }, { h: "Index (2011 = 100)", num: true }],
    rows.map((r) => [r.s, String(r.year), S.fmt(r.value), r.index.toFixed(0)]));
}

init().catch((err) => { console.error(err); $("#main-chart").textContent = "Sorry, the chart data could not be loaded. Run the site from a local server."; });
