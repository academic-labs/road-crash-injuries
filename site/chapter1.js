// Chapter 1: The hidden toll. Counts per year (main), rate per 100,000 and year-on-year change (supporting).
import * as d3 from "./d3.js";
import { attachTooltip } from "./tooltip.js";
import * as S from "./shared.js";

const $ = (sel) => document.querySelector(sel);
let derived = [];   // data/national_by_year_derived.csv (KNIME)
let rates = [];     // data/national_rate_per_100k.csv (cases / ABS June population)

async function init() {
  [derived, rates] = await Promise.all([
    d3.csv("data/national_by_year_derived.csv", d3.autoType),
    d3.csv("data/national_rate_per_100k.csv", d3.autoType),
  ]);
  S.initTableToggle();
  S.fillTable($("#flow-table"), "Traffic hospitalisations each year, Australia",
    [{ h: "Year" }, { h: "Hospital cases", num: true }, { h: "Change on year before", num: true }, { h: "Population (June)", num: true }, { h: "Cases per 100,000 people", num: true }],
    derived.map((d, i) => [String(d.calendar_year), S.fmt(d.hospitalisations),
      d.yoy_change_pct_hosp == null ? "n/a" : (d.yoy_change_pct_hosp > 0 ? "+" : "") + d.yoy_change_pct_hosp.toFixed(1) + "%",
      S.fmt(rates[i].population_june), rates[i].rate_per_100k.toFixed(1)]));
  S.onWidthChange($("#main-chart"), draw);
  draw();
}

function svgIn(host, label, height) {
  host.replaceChildren();
  const width = Math.max(280, host.clientWidth);
  const svg = d3.select(host).append("svg").attr("viewBox", `0 0 ${width} ${height}`).attr("role", "img").attr("aria-label", label);
  return { svg, width };
}

function draw() {
  drawMain();
  drawRate();
  drawChange();
}

function drawMain() {
  const height = 340, m = { top: 34, right: 24, bottom: 30, left: 62 };
  const { svg, width } = svgIn($("#main-chart"), "Line chart of road traffic hospital cases per year, 2011 to 2021. Cases rose from 34,033 to 39,505. The numbers are in the table.", height);
  const x = d3.scaleLinear(d3.extent(derived, (d) => d.calendar_year), [m.left, width - m.right]);
  const y = d3.scaleLinear([0, d3.max(derived, (d) => d.hospitalisations) * 1.08], [height - m.bottom, m.top]).nice();

  svg.append("g").attr("class", "gridline").selectAll("line").data(y.ticks(5)).join("line")
    .attr("x1", m.left).attr("x2", width - m.right).attr("y1", y).attr("y2", y);
  svg.append("g").attr("class", "axis").attr("transform", `translate(0,${height - m.bottom})`).call(d3.axisBottom(x).tickFormat(d3.format("d")).ticks(width < 520 ? 5 : 11));
  svg.append("g").attr("class", "axis").attr("transform", `translate(${m.left},0)`).call(d3.axisLeft(y).ticks(5).tickFormat(d3.format(",")));
  svg.append("path").datum(derived).attr("fill", "none").attr("stroke", "var(--ink)").attr("stroke-width", 3.5)
    .attr("d", d3.line().x((d) => x(d.calendar_year)).y((d) => y(d.hospitalisations)));

  const peak = d3.greatest(derived, (d) => d.hospitalisations);
  const dip = derived.find((d) => d.calendar_year === 2020);
  const first = derived[0], last = derived[derived.length - 1];
  const dots = svg.append("g").selectAll("circle").data(derived).join("circle")
    .attr("cx", (d) => x(d.calendar_year)).attr("cy", (d) => y(d.hospitalisations)).attr("r", (d) => (d === peak || d === dip ? 7 : 5))
    .attr("fill", (d) => (d === peak || d === dip ? "var(--accent)" : "var(--ink)"));
  attachTooltip(dots, (d) => ({ title: String(d.calendar_year), rows: [["Hospital cases", S.fmt(d.hospitalisations)], ["Bed days", S.fmt(d.bed_days)]] }));

  const note = (d, text, dy, anchor = "middle") => svg.append("text").attr("class", "annotation")
    .attr("x", x(d.calendar_year)).attr("y", y(d.hospitalisations) + dy).attr("text-anchor", anchor).text(text);
  note(first, S.fmt(first.hospitalisations), -14, "start");
  note(peak, `Peak ${S.fmt(peak.hospitalisations)}`, -14);
  note(dip, `2020: ${S.fmt(dip.hospitalisations)}`, 26);
  note(last, S.fmt(last.hospitalisations), -14, "end");
}

function drawRate() {
  const height = 260, m = { top: 22, right: 20, bottom: 28, left: 46 };
  const { svg, width } = svgIn($("#rate-chart"), "Line chart of cases per 100,000 people, 2011 to 2021. The rate stays between about 148 and 161. The numbers are in the table.", height);
  const x = d3.scaleLinear(d3.extent(rates, (d) => d.calendar_year), [m.left, width - m.right]);
  const y = d3.scaleLinear([0, 200], [height - m.bottom, m.top]);
  svg.append("g").attr("class", "axis").attr("transform", `translate(0,${height - m.bottom})`).call(d3.axisBottom(x).tickFormat(d3.format("d")).ticks(width < 420 ? 4 : 6));
  svg.append("g").attr("class", "axis").attr("transform", `translate(${m.left},0)`).call(d3.axisLeft(y).ticks(4));
  svg.append("path").datum(rates).attr("fill", "none").attr("stroke", "var(--accent)").attr("stroke-width", 3.5)
    .attr("d", d3.line().x((d) => x(d.calendar_year)).y((d) => y(d.rate_per_100k)));
  const dots = svg.append("g").selectAll("circle").data(rates).join("circle")
    .attr("cx", (d) => x(d.calendar_year)).attr("cy", (d) => y(d.rate_per_100k)).attr("r", 4.5).attr("fill", "var(--accent)");
  attachTooltip(dots, (d) => ({ title: String(d.calendar_year), rows: [["Cases per 100,000", d.rate_per_100k.toFixed(1)], ["Hospital cases", S.fmt(d.hospitalisations)], ["Population (June)", S.fmt(d.population_june)]] }));
  [rates[0], rates[rates.length - 1]].forEach((d, i) => svg.append("text").attr("class", "annotation")
    .attr("x", x(d.calendar_year)).attr("y", y(d.rate_per_100k) - 12).attr("text-anchor", i ? "end" : "start").text(d.rate_per_100k.toFixed(1)));
}

function drawChange() {
  const data = derived.filter((d) => d.yoy_change_pct_hosp != null);
  const height = 260, m = { top: 22, right: 12, bottom: 28, left: 46 };
  const { svg, width } = svgIn($("#change-chart"), "Bar chart of the change in hospital cases from the year before, 2012 to 2021. Cases fell in 2020 by 4.8 percent. The numbers are in the table.", height);
  const x = d3.scaleBand(data.map((d) => d.calendar_year), [m.left, width - m.right]).padding(0.25);
  const lim = Math.ceil(d3.max(data, (d) => Math.abs(d.yoy_change_pct_hosp)));
  const y = d3.scaleLinear([-lim, lim], [height - m.bottom, m.top]);
  svg.append("g").attr("class", "axis").attr("transform", `translate(${m.left},0)`).call(d3.axisLeft(y).ticks(5).tickFormat((v) => v + "%"));
  const bars = svg.append("g").selectAll("rect").data(data).join("rect")
    .attr("x", (d) => x(d.calendar_year)).attr("width", x.bandwidth())
    .attr("y", (d) => Math.min(y(0), y(d.yoy_change_pct_hosp))).attr("height", (d) => Math.abs(y(d.yoy_change_pct_hosp) - y(0)))
    .attr("fill", (d) => (d.yoy_change_pct_hosp >= 0 ? "var(--blue)" : "var(--accent)"));
  attachTooltip(bars, (d) => ({ title: String(d.calendar_year), rows: [["Change on year before", (d.yoy_change_pct_hosp > 0 ? "+" : "") + d.yoy_change_pct_hosp.toFixed(1) + "%"], ["Hospital cases", S.fmt(d.hospitalisations)]] }));
  svg.append("line").attr("x1", m.left).attr("x2", width - m.right).attr("y1", y(0)).attr("y2", y(0)).attr("stroke", "var(--ink)");
  svg.append("g").selectAll("text").data(data).join("text").attr("text-anchor", "middle")
    .attr("x", (d) => x(d.calendar_year) + x.bandwidth() / 2).attr("y", height - 8)
    .text((d, i) => (x.bandwidth() >= 22 || i % 2 === 0 ? String(d.calendar_year).slice(x.bandwidth() >= 34 ? 0 : 2) : ""));
}

init().catch((err) => { console.error(err); $("#main-chart").textContent = "Sorry, the chart data could not be loaded. Run the site from a local server."; });
