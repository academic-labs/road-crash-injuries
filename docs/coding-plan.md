# Coding plan: architecture, requirements and data contract (COS30045) — v2

**Source note:** compiled by Claude Sonnet 5.5 from `discussion-doc.md` (restructured),
`design-book-working-draft.md` (rewritten), `data-workflow.md` (consolidates the old export spec and
data guide), `csv_headers.md` (actual exported headers) and the verified source run (dictionary, ABS
release, BITRE page/report, Data Hub, WHO ICD-10). Numbers quoted here were recomputed from the
exported files; the website must always read them from the data, never hard-code them.
**Status:** version 2, before any code is written. Update the decisions log (§15) whenever a decision changes.

## 0. How to use this file

This plan is written for the two team members **and** for AI coding assistants. Paste the sections an
assistant needs (Appendix A task template).

**Rules for any AI assistant working on this project**
- Use only vanilla JavaScript (ES modules), HTML and CSS, plus D3 and the D3 Sankey module from
  `assets/js/lib/`. No frameworks, bundlers or other chart libraries. The rubric requires D3 used directly.
- Never invent data, numbers or column names. Read everything from §5. If something is missing, say so and stop.
- Follow the module pattern, naming and comment conventions in §12.
- Mark AI-written code with the tag in §12.3; mark accessibility code with `// A11Y:`.
- Meet the accessibility rules in §9 for every element you create.
- Keep the change small: one task, the files named in the task, no unrelated edits.
- State assumptions at the end of your answer and list any decision that belongs in the decisions log.

**Authority rule:** `csv_headers.md` (actual headers) + this plan win over any companion document.
`data-workflow.md` is the upstream production/validation truth; this plan is the website-facing
contract. Companion docs mirror this plan's exact category strings and lookup values (Appendix D).

**Related documents:** `discussion-doc.md` (beats, chapter plan), `design-book-working-draft.md`
(§3 design rationale), `data-workflow.md` (sources, KNIME, exports, checks), `csv_headers.md`
(header tie-breaker), `reusable-dataviz-checklist.md` (audit checklist).

## 1. Project context

**Brief:** a data story about hospitalised road crash injuries in Australia, 2011–2021, as an
interactive D3 website. Clear narrative; structured exploration of selected dimensions; accessible;
must not replicate the Bureau of Infrastructure and Transport Research Economics dashboard.

**Audience:** primary, general public (awareness; plain language, reading level 9 or lower).
Secondary, journalists, researchers, students (tables, downloads, sources, limits).

**One-sentence message:** many more people are hurt on Australian roads than killed, who is hurt is
changing, and where you live changes the rate, so totals alone do not show how safe roads are.

**Chapters and charts**

| Chapter | Question | Charts (ID) |
|---|---|---|
| Introduction | Why does this matter? | Key statistics (text + cards) |
| 1. The hidden toll | How many people are hurt, and is it getting worse? | C1 trend line; C2 rate line |
| 2. Who is getting hurt? | Who is hurt, and how is that changing? | C3 indexed lines; C4 age heatmap; C5 2020 range band |
| 3. How do people get hurt? | With whom or what are people hurt? | C6 Sankey; C7 counterparty dot plot; C8 remoteness dot plot |
| 4. Where you live | Do rates differ between states and territories? | C9 tile-grid map; C10 counts/rates dot plots |
| About the data | Where do the numbers come from, and what can they not say? | Glossary, sources, limits, downloads |

(C0 unit chart **dropped**, 27 Nov 2026 — see decisions log.)

**What the rubric rewards:** D3 used directly; modular separation (loading, interaction, drawing,
styling, constants); comments identifying AI and accessibility code; robust loading and edge cases;
a custom non-standard chart and multiple datasets; coherent story balancing explanation and
exploration; formally checked accessibility.

## 2. Stack and non-negotiables

| Item | Decision |
|---|---|
| Language | HTML, CSS, vanilla JavaScript (ES modules, no transpiling) |
| Charts | D3 7.x pinned; d3-sankey for layout only (drawing/interaction/a11y written by us; tutor-approved) |
| Loading D3 | Local files in `assets/js/lib/`, classic `<script>` tags before the page module; `utils/d3.js` re-exports `window.d3`; check `d3.sankey` exists after download |
| Build step | None |
| Hosting | GitHub Pages (static); all HTML in repo root; **relative paths only, never a leading `/`** (project-Pages base path) |
| Local dev | Local server (Live Server or `python -m http.server`); CSV loading fails from `file://` |
| Browsers | Latest Chrome, Firefox, Safari, Edge; **phone widths from 320 px** (WCAG 1.4.10) |
| Licences | Keep each library's licence next to it in `assets/js/lib/`; credit d3-sankey in comments |
| No-JS fallback | Every page has a `<noscript>` block linking the CSV downloads |

## 3. Repository and file structure

```
road-crash-injuries/
├── index.html
├── chapter-1.html … chapter-4.html
├── about-data.html
├── stats-check.html            core QA page (statistics + data invariants, §5.6, §11)
├── assets/
│   ├── css/  styles.css, charts.css
│   ├── data/ raw/ (xlsx, dictionary PDF, ABS workbook), processed/ (CSVs + README.md)
│   ├── js/
│   │   ├── lib/  d3.min.js, d3-sankey.min.js, licences, README.md (versions)
│   │   ├── main.js
│   │   ├── pages/  index.js, chapter-1.js … chapter-4.js, about-data.js, stats-check.js
│   │   ├── visualizations/  line.js, band-line.js, heatmap.js, sankey.js, dot-plot.js,
│   │   │                    tile-map.js, data-table.js
│   │   └── utils/
│   │       ├── chart-card.js, chapter-controls.js, constants.js, d3.js, format.js,
│   │       ├── load-data.js, state.js, stats.js, tooltip.js, a11y.js, validate.js
│   └── img/
├── knime/  gicungdc_Hospitalised_Injuries.knwf
├── docs/
├── .gitignore
└── README.md
```

**Import rule:** `visualizations/*` import only from `utils/*` (never `chart-card.js`).
`chart-card.js` imports `data-table.js`. Only `pages/*` import `chart-card.js`, `load-data.js`,
`chapter-controls.js`, `state.js`. Prevents circular imports.

**Page names:** `chapter-N.html` stable; every page still has a descriptive `<title>`, one `<h1>`,
descriptive nav labels.

## 4. Page and layout specification

### 4.1 Shared template
Semantic elements, one `<h1>`: skip link → sticky `header.site-header` (title, nav, "Chapter n of 4")
→ sticky `div.chapter-controls` (chapters 2–4) → `main#main` (h1, takeaway, chart cards, take-away,
prev/next) → `footer` (data credit, about link, licence).

### 4.2 Sticky header and controls
- Header sticky, ≤64 px desktop. Controls sticky directly under it; header+controls ≤120 px desktop.
- **Measure header+controls with a ResizeObserver and set `--sticky-height` / `scroll-padding-top`
  dynamically** so focused elements and anchors are never hidden.
- Under 768 px nav collapses into `<details>`; controls become a compact wrapping row (radios wrap,
  no horizontal scroll at 320 px).
- Controls sit directly above the charts they change; status line "Showing: …" in `aria-live="polite"`.

### 4.3 Chart card
`<figure class="chart-card">` built by `chart-card.js`: `<h3>` title with units; one-line takeaway;
`<details>` "How to read this chart"; chart body; legend when needed; "View as table" + "Download CSV";
source line + one-line caveat; supporting charts add "What this adds: …".
States: **loading** (`aria-busy`), **error** (message + CSV link), **empty selection** (explanation).

### 4.4 Page content skeleton
Plain language (≤9). Numbers come from `stats.js` via `<span data-stat="ID" data-format="FORMAT">`;
`main.js` fills them. Tokens below use the canonical ids in §11.1.

**Introduction:** h1 "For every person killed on Australian roads in {latest_year}, about
{hosp_per_death_2021} were hospitalised." Cards: {hosp_2021} hospitalised; {deaths_2021} died;
{hosp_change_pct_2011_2021}% more than 2011; {vulnerable_hosp_share_2021}% of those hospitalised were
pedestrians, motorcyclists or cyclists vs {vulnerable_deaths_share_2021}% of those who died.
One-sentence message; who this is for; three reading tips; Start + About buttons. Caveat: deaths and
hospitalisations come from different sources/definitions.

**Chapter 1:** takeaway "Hospitalisations were higher in 2021 than in 2011: {hosp_2011} then,
{hosp_2021} in 2021. But the country has grown too: the rate was {rate_2011} in 2011 and {rate_2021} in
2021, so most of the rise is accounted for by population growth." C1+C2 side by side on wide screens;
2012/2017 break annotations. Take-away: counts vs rates; breaks need care. Next: "Who is getting hurt?"

**Chapter 2:** opening stat {vulnerable_hosp_share_2021}% vs {vulnerable_deaths_share_2021}%.
Own "How do you travel?" selector + Index/Counts toggle. C3, C4, C5. Takeaway uses
{cyclists_change_pct}, {pedestrians_change_pct}, age-65+ stats, April-2020 stats. Next: "How do people get hurt?"

**Chapter 3:** own selector. C6, C7, C8. Takeaway uses {noother_share_cyclists_2021},
{noother_share_motorcyclists_2021}, {car_share_pedestrians_2021}. Next: "Where you live".

**Chapter 4:** year slider (default 2021) + Sort toggle. C9, C10. Takeaway uses highest/lowest state
rate for the selected year + caveats (crude, breaks, residence). Next: About.

**About the data:** sources (full organisation names); licence; what counts as a road crash injury
(`Traffic`; `Unknown traffic` excluded); series breaks; data quality (latest statement 2017–18);
**ICD-10-AM editions 6th→11th across the series**; counts vs rates (crude; ABS June ERP, March 2026
release; BITRE published rates use a custom 30 June 2021 snapshot and stop at 2018);
**year = separation year; location = hospital, not crash; remoteness/state = usual residence**;
**vulnerable road users (this project) = pedestrians, motorcyclists, cyclists** (Data Hub definition
is broader); glossary (Appendix C); downloads table (file, contents, rows).

## 5. Data contract

All files in `assets/data/processed/`, produced by KNIME. Columns/types read from `csv_headers.md`.

### 5.1 Rules for reading data
- Explicit column schema per file in `load-data.js` (name+type). No `d3.autoType`.
- Validate on load: required columns exist, row count > 0, numerics are numbers; on failure throw
  `DataError` naming file+column; chart card shows error state.
- **Alias once in the loader:** `state_by_year_rates.csv` column `cases` → `hospitalisations`
  (comment the alias); use `hospitalisations` everywhere else.
- Absent category combinations = zero; fill zeros when a chart needs a complete grid.
- Skip `age_group === "Unknown"` rows (one per heatmap file).
- "All road users" = sum of the five groups, **except** `national_monthly_2020_baseline.csv` which
  already contains "All road users" rows (the usual range cannot be summed).
- Always compute shares from integer counts, never from rounded `_pct` columns.
- Missing numerics = empty cells → `null`, shown as a dash.
- Category strings must match §5.4 exactly.

### 5.2 Files used by charts

| File | Used by | Rows/grain | Columns (type) |
|---|---|---|---|
| national_by_year_derived.csv | C1,C2,C3(All),stats | 11/year | calendar_year,hospitalisations,bed_days,prev_year_hosp,yoy_change_hosp,yoy_change_pct_hosp,prev_year_bed_days,yoy_change_bed_days,yoy_change_pct_bed_days,baseline_2011,index_2011,bed_days_per_case,population,rate_per_100k |
| national_by_year_road_user_group.csv | C3,stats | 55/year×group(5) | road_user_group,hospitalisations,bed_days,calendar_year,annual_total,road_user_group_share_pct,road_user_group_baseline_2011,index_2011 |
| national_by_year_age.csv | C4(Everyone),stats | 78/year×age(7)+1 Unknown | calendar_year,age_group,age_order,hospitalisations,bed_days,annual_total,age_share_pct |
| national_by_age_road_user_group_year.csv | C4(named) | 386/year×age×group+1 Unknown | calendar_year,age_group,road_user_group,hospitalisations,bed_days,road_user_year_total,share_within_road_user_group_pct |
| national_monthly_2020_baseline.csv | C5,stats | 72/group(6 incl All)×month | month_name,month_num,road_user_group,baseline_mean,baseline_min,baseline_max,value_2019,value_2020,change_2020_vs_2019_pct |
| national_by_road_user_counterparty_year.csv | C6,C7,stats | 308/year×group×counterparty (zeros absent) | calendar_year,road_user_group,counterparty_group,hospitalisations,bed_days,road_user_year_total,share_within_road_user_group_pct |
| national_car_occupants_counterparty_remoteness.csv | C8,stats | 264/year×remoteness(4)×counterparty(6) | calendar_year,remoteness,counterparty_group,hospitalisations,bed_days,remoteness_total,share_within_remoteness_pct |
| state_by_year_rates.csv | C9,C10,stats | 88/state(8)×year(11) | state_code,state_name,calendar_year,cases(→hospitalisations),bed_days,population,series_break_flag,is_break_year,series_break_note,rate_per_100k |
| external_deaths_2021.csv | stats | 4 | year,road_user_group,deaths,source,note |

### 5.3 Files for table views, downloads, about-data (full headers)

| File | Columns | Use |
|---|---|---|
| national_by_road_user_counterparty_year_detail.csv | calendar_year,road_user,counterparty,hospitalisations,bed_days,road_user_year_total,share_within_road_user_pct | C6/C7 table+download (original 12×10) |
| national_monthly_road_user.csv | calendar_year,month,road_user,month_num,year_month,hospitalisations,bed_days,monthly_total,monthly_road_user_share_pct | C5 table (year_month int e.g. 201101) |
| national_by_year_remoteness.csv | calendar_year,**ABS_remoteness_area**,hospitalisations,bed_days,annual_total,remoteness_share_pct | downloads/about `[CONFIRM label values; Missing→Other or unknown?]` |
| national_by_road_user_sex.csv | sex,road_user,hospitalisations,bed_days,road_user_total,sex_share_within_road_user_pct | downloads/about; **no year column** `[CONFIRM grain: pooled 2011–2021 or single year?]` |
| national_age_65_plus.csv | calendar_year,hospitalisations_65_plus,bed_days_65_plus | downloads/about |
| road_user_groups.csv | road_user,road_user_group,2021_hospitalisations | glossary (bracket notation for digit-leading column) |
| counterparty_groups.csv | counterparty,counterparty_group,2021_hospitalisations | glossary |

**Not shipped:** `superseded_*.csv` (×3), `national_population.csv` (Australia,calendar_year),
`state_population.csv` (state,population,calendar_year). Keep in KNIME/raw.

### 5.4 Standard values and order (exact strings)

| Name | Values in display order |
|---|---|
| Road user groups | Car occupants; Motorcyclists; Cyclists; Pedestrians; Other road users (All road users calculated) |
| Counterparty groups | Car, pick-up truck or van; Heavy vehicle or bus; Cyclist, motorbike, pedestrian or animal; Fixed or stationary object; No other vehicle, person or object; Other or unspecified |
| Remoteness | Major Cities; Regional; Remote; Other or unknown |
| Age groups | 0-7; 8-16; 17-25; 26-39; 40-64; 65-74; 75+ |
| States (code,name,tile row,col) | NT Northern Territory (0,1); QLD Queensland (0,2); WA Western Australia (1,0); SA South Australia (1,1); NSW New South Wales (1,2); ACT Australian Capital Territory (1,3); VIC Victoria (2,2); TAS Tasmania (3,2) |
| Series breaks | Victoria 2012; New South Wales 2017 (June) |

UI must use these exact strings; prose may shorten but never the data/labels.

### 5.5 Selector keys (chapters 2 and 3)

| Key | Label | Road user group |
|---|---|---|
| all | Everyone | All road users (sum of five) |
| car | In a car | Car occupants (drivers+passengers; vans/utes/heavy/buses excluded) |
| motorbike | On a motorbike | Motorcyclists |
| bike | On a bike | Cyclists |
| foot | On foot | Pedestrians |

"Other road users" not selectable; appears in totals and Sankey.

### 5.6 Load-time invariants (`utils/validate.js`, surfaced on stats-check.html)
- Expected row counts: derived 11; road_user_group 55; age 78; age×group 386; baseline 72;
  counterparty 308; car×remoteness 264; state 88; deaths 4.
- Category strings ∈ §5.4; exactly one `Unknown` age row per heatmap file; baseline has 12 "All road
  users" rows + 60 group rows.
- Per year: Σ five road-user groups == `national_by_year_derived.hospitalisations`.
- 2021 counterparty matrix equals Appendix D; lookup 2021 sums == 39,505.
- State Σ vs national: gap **480 (2011)** and **470 (2021)** is *expected* (residence unrecorded /
  migratory/offshore), not an error.
- Report pass/fail per invariant; dev-only console table; stats-check.html renders it.

## 6. Shared modules

| Module | Responsibility / API |
|---|---|
| utils/d3.js | `export default window.d3;` only |
| utils/constants.js | COLORS (from CSS vars), ROAD_USER_GROUPS (key,label,colour var,marker,dash), COUNTERPARTY_GROUPS, REMOTENESS, AGE_GROUPS, STATES (tile positions), BREAK_EVENTS, BREAKPOINTS (480,768,1024), MIN_WIDTH_PX 320, MIN_FONT_PX (chart 12, other 16), DURATION_MS 300, FILES |
| utils/load-data.js | `loadCsv(fileKey)` cached typed rows; schemas+validation; `DataError`; `cases→hospitalisations` alias |
| utils/validate.js | `validateData(rowsByFile)` → invariant report (§5.6) |
| utils/state.js | `createState(initial)` → {get,set,subscribe,reset}; one per chapter, never shared |
| utils/format.js | formatInteger, formatPercent, formatRate, formatChange, formatNullable |
| utils/tooltip.js | showTooltip({title,rows,note},anchor), hideTooltip(); one shared element; hoverable; Escape; opened by focus; linked via `aria-describedby` when open |
| utils/a11y.js | announce(message) (polite, throttled for arrow moves), describeChart(svg,title,desc), makeRovingFocus(items,handlers), buildTable(columns,rows,caption) |
| utils/chapter-controls.js | createRadioGroup, createToggle, createYearSlider; wire aria-live status |
| utils/stats.js | §11 |
| utils/chart-card.js | createChartCard({id,title,takeaway,howToRead,source,caveat,adds,csvFile,tableColumns,getTableRows,render}) → {update,setLoading,setError}; handles table toggle + download |
| visualizations/data-table.js | createDataTable(container,columns,rows,caption) |

**Visualization contract:** `createX(container,options)` → {update(data,viewState),resize(),destroy()}.
Read container width; redraw at that pixel width (debounced ResizeObserver); do not scale whole SVG
via viewBox (text would shrink <12 px). No global state; no DOM outside container except shared
tooltip. D3 data join; transitions DURATION_MS (0 under reduced motion). Colours/margins/fonts from
constants+CSS only.

## 7. Chart specifications

**Colour tokens:** --color-car-occupants #0072B2; --color-motorcyclists #D55E00; --color-cyclists
#009E73; --color-pedestrians #CC79A7; --color-pedestrians-edge #9C5C82 (1 px darker outline for
markers/lines, keeps hue, lifts graphics contrast); --color-other-road-users #6B6B6B;
--color-all-road-users #222222; --color-text #1A1A1A; --color-muted #595959; --color-grid #D9D9D9;
--color-break #767676; --color-band #DCE6F2; --color-focus #0B5FFF. Sequential: d3.interpolateBlues
0.15–0.9. **Sequential-fill text:** compute luminance, pick #1A1A1A or #FFFFFF for ≥4.5:1; if neither
passes, print the value outside the tile/cell. **Focus ring:** dual-tone (white outer + --color-focus)
so it survives dark tiles. Contrast targets: graphics ≥3:1, text ≥4.5:1 (check each colour).

**Road user encodings:** Car circle/solid; Motorcyclists square/"6 3"; Cyclists triangle/"2 3";
Pedestrians diamond/"8 3 2 3" (+edge outline); All no marker/"4 4". Always a direct label too.

Common to all: accessible title/description, keyboard per §8, table view + CSV download, §11 text rules.

**C1 national trend line.** Data derived (calendar_year,hospitalisations,yoy_change_pct_hosp).
Line+circle markers; x linear 2011–2021 (tick every year, every 2nd <480 px); y from 0; title
"Hospitalisations per year". Dashed rules 2012/2017 with labels; direct labels 2011, 2019 (peak), 2021.
Tooltip year/count/prev-change (dash 2011)/break note. Accept 2011=34,033; 2019=39,866; 2021=39,505; y from 0.

**C2 rate line.** Same line.js config, same x scale/margins as C1; y from 0; title "Hospitalisations
per 100,000 people (crude rate)". Same break rules; labels 2011/2021. Tooltip year/rate/population.
Accept 2011=152.3; 2016=161.1 (highest); 2021=153.8.

**C3 indexed road-user lines.** Data road_user_group for Car/Motorcyclists/Cyclists/Pedestrians
(Other not drawn); All line from derived. View state roadUser + measure(index|counts). One line per
group; y index_2011 or hospitalisations; All = dark dashed reference; selected bold, others muted
0.35; Everyone → all normal, All bold. Index mode reference line at 100 "2011 = 100"; counts mode y
from 0. End labels with change since 2011 (min 14 px spacing). Break rules. Tooltip
year/group/count/index/change. **Footnote: "Everyone includes Other road users (not drawn
separately)."** Accept 2021 index Cyclists 151.4, Motorcyclists 117.4, Car 111.1, Pedestrians 84.7, All 116.1.

**C4 age heatmap.** Named group → age×group file; Everyone → national_by_year_age. Skip Unknown.
**[DECIDE] Recompute shares from integer counts over the seven known age bands** (so displayed shares
sum to 100); label denominator "share of cases with known age". Rectangles; x year; y seven bands
(0-7 top); sequential colour domain 0→max in current view + legend; print % when cell ≥30 px (text
contrast rule above). Callout "Aged 65 and over: X% in 2011, Y% in 2021" from 65-74+75+. Note "Age
groups have different widths". Tooltip age/year/share/count/group total. Accept Cyclists 65+ 327→1,034
(6.1%→12.7%); Everyone 65+ ≈11.4%→≈13.9% `[CONFIRM recompute vs annual_total]`.

**C5 2020 range band.** Data baseline for selected group (incl All). x month; band baseline_min→max
"Usual range, 2017 to 2019"; thin dashed baseline_mean; bold 2020 line+markers in group colour; y from
0 rescaled per selection; title "Hospitalisations per month". April annotation from
change_2020_vs_2019_pct; ring markers where 2020 outside band; caption says data cannot show why.
Tooltip month/2020/range/2019/change. Accept April Pedestrians 227–264, 2020=106 (−59.8%); Cyclists
619–668, 2020=773 (+15.9%); All 3,364–3,488, 2020=2,357 (−32.4%).

**C6 Sankey (custom).** Data counterparty file, 2021, links >0. d3.sankey(): nodes five road-user
(left) + six counterparty (right), ids `ru:…`/`cp:…`; nodeWidth 14, nodePadding 12, nodeAlign justify,
nodeSort by constants order; extent from container, height ~420; links d3.sankeyLinkHorizontal().
Link width=hospitalisations; link colour=road-user colour 0.45 (0.8 hover/focus); left nodes group
colours, right neutral; labels with totals. Selected group emphasised, others muted. Callout on "No
other vehicle, person or object" with cyclists/motorcyclists shares. Nodes focusable (roving, §8);
hover/focus highlights connected links + tooltip listing flows. **Responsive: below 640 px hide the
C6 card and promote the existing C7 card with a one-line message** ("Flows are hard to read on small
screens — showing exact shares instead"); single C7 instance, no duplicate ids/downloads. Accept
links equal Appendix D matrix (Cyclists→No-other 3,705; Pedestrians→Car 2,063); sum 39,505.

**C7 counterparty dot plot.** Same file, 2021, selected group (Everyone = sum five, recompute shares).
Six rows sorted by share desc; x % (0→max rounded up); filled dot selected + leader line + value
label; hollow grey "Everyone" reference dot when a named group selected. Tooltip
group/count/share/group total/Everyone share. Always all six rows incl zeros. Accept Cyclists
No-other 45.4%, Car 19.3%, Other 22.8%; Pedestrians Car 88.4%.

**C8 remoteness dot plot.** Data car×remoteness, 2021, counterparty="No other vehicle, person or
object", remoteness Major Cities/Regional/Remote (Other or unknown in footnote with count). Reuse
dot-plot.js; three rows in order; x share 0–100; print remoteness_total in row label ("Remote (602
cases)"). **Card note: "Car occupants only — does not change with your selection."** Caveat: where
people live, not crash; Remote few cases. Accept 8.3/24.6/57.3 (n=602).

**C9 tile-grid map (custom).** Data state for selected year. Eight equal squares at §5.4 positions
(4×4; tile = min(96, width/4), min 64); sequential fill **fixed domain across all years**; state code
bold + rate (1 dp) printed (text contrast rule); **"break" badge only when `is_break_year=1` for the
selected year; otherwise a footnote "comparisons across 2012/2017 need care"** [DECIDE]. Stepped
legend 5 steps "per 100,000 people". Native range year (2011–2021, default 2021) + `<output>`; tiles
focusable (roving). Tooltip/aria-label built from data incl population + break note when present.
Accept 2021 NT 286.1, QLD 200.3, VIC 170.0, ACT 163.5, SA 146.0, TAS 141.9, WA 129.8, NSW 111.2;
2011 NT 197.2, VIC 168.4, NSW 147.1, WA 146.3, ACT 145.9, SA 143.9, QLD 141.2, TAS 96.4.

**C10 counts & rates dot plots.** Same file/year as C9. Two aligned panels (**stacked <768 px**
[DECIDE]); left count, right rate; eight rows same order both; toggle "Sort by: rate | count"
(default rate desc); rows keyed state_code for smooth moves. Caption states highest/lowest for
selected measure. Tooltip state/year/count/population/rate. Accept 2021 by rate NT,QLD,VIC,ACT,SA,
TAS,WA,NSW; by count VIC,QLD,NSW,WA,SA,TAS,ACT,NT.

## 8. Interaction and state specification

**Principle:** each chapter owns its controls/state; no shared state; nothing stored between pages;
every control shows what it is doing and answers a question the chapter raises.

| Chapter | State (default) | Controls | What responds |
|---|---|---|---|
| 1 | none | none (hover/focus details) | C1,C2 tooltips |
| 2 | roadUser=all; measure=index | radio "How do you travel?"; toggle Index/Counts | C3 highlight+measure, C4 data, C5 data |
| 3 | roadUser=all | own radio | C7 data, C6 emphasis; C8 fixed |
| 4 | year=2021; sortBy=rate | year slider; Sort toggle | C9 year, C10 year+sort |

**Rules:** one createState per chapter; controls call state.set; charts subscribe→update; ignore
invalid values. Reset button per controlled chapter; "Showing: …" aria-live updated on change.
Transitions DURATION_MS, skipped under reduced motion (also disable smooth scroll). Hover details also
by focus and touch; table gives every value.

**Keyboard model (roving tabindex everywhere — one Tab stop per chart):**
Tab reaches skip link, header links, controls, then each chart (one stop), then chart buttons.
- Line/band: Left/Right year/month; Up/Down series (C3); Home/End first/last; Escape closes tooltip.
- Heatmap: arrows move cells (one tabbable cell, roving).
- **Sankey: one stop; arrows cycle the eleven nodes; Enter/focus highlights connected links** (not
  eleven Tab stops).
- Dot plots/tile map: arrows move rows/tiles in visual order.
Each move updates tooltip; `announce()` throttled (~150 ms) so arrow moves don't triple-read; tooltip
linked via `aria-describedby` when open; live region primarily for control changes.

## 9. Accessibility specification

Targets: unit notes + WCAG 2.1.
- **Structure:** one h1; ordered headings; landmarks; skip link; `<html lang="en-AU">`; descriptive title.
- **Text:** body ≥16 px; chart ≥12 px (MIN_FONT_PX); text ≥4.5:1; reading level ≤9 (check with tool).
- **Colour:** graphics ≥3:1; never colour alone (markers/dashes/labels/printed values); sequential
  scales show numbers; pedestrian edge outline; sequential-fill text rule; dual-tone focus ring.
- **Alternatives:** **interactive SVGs use `role="group"` + `aria-labelledby` (title+desc) with
  labelled focusable marks; static graphics use `role="img"`** (`role="img"` can hide focusable
  children from some screen readers). Every chart: table view + CSV link; table `<caption>`+`scope`.
- **Keyboard/focus:** everything reachable/usable; visible focus ≥3 px; focus never under sticky bars
  (dynamic scroll-padding-top); focus moves to table on open, back to button on close.
- **Tooltips:** hover+focus; stay while pointer over; Escape closes; `aria-describedby` when open.
- **Motion:** short transitions; off under reduced motion; nothing flashes.
- **Status:** one polite live region; throttled value announcements.
- **Touch/reflow:** targets ≥44 px; no horizontal scroll at 320 px; 200% zoom; larger browser text.
- **No-JS:** `<noscript>` links downloads.

**Acceptance (record with screenshots):** axe/Lighthouse 0 serious/critical on every page;
keyboard-only completes one task per chapter; NVDA/VoiceOver pass on one chapter; 200% zoom + 320 px;
contrast check every colour; reduced-motion check.

## 10. Responsive specification

| Width | Layout |
|---|---|
| <480 | one column; compact wrapping controls; x ticks every 2nd year; labels wrap |
| 480–767 | one column; supporting stacked; **C10 stacked** |
| 768–1023 | main full width; supporting side by side; C10 side by side |
| ≥1024 | content capped ~1100 px; C1+C2 side by side; supporting side by side |

Charts redraw to container width (debounced ResizeObserver); line heights ~half width clamped
260–420. **<640 px: hide C6 card, promote C7 with message.** Header/nav collapse <768. Min width 320.

## 11. Content, wording and key statistics

### 11.1 stats.js — canonical registry
`computeStats()` loads CSVs via loadCsv, returns map; `getStat(id)` → {id,label,value,unit,source,note};
`applyStatTokens(root)` fills spans (formats integer,percent0,percent1,ratio0,rate1,year,text).
Calculate from integer counts; All = sum five; guard divide-by-zero; uncomputable → "n/a" + console
log id. **Unknown token = console error in dev.** Single registry below; §4.4 uses these ids verbatim.

| id | Formula / source | Expected |
|---|---|---|
| latest_year | max calendar_year (derived) | 2021 |
| hosp_2011 / hosp_2021 | derived | 34,033 / 39,505 |
| hosp_change_pct_2011_2021 | (2021/2011−1)×100 | 16.1 |
| hosp_peak_value / hosp_peak_year | max | 39,866 / 2019 |
| deaths_2021 | deaths All row | 1,123 |
| rate_2011 / rate_2021 | derived | 152.3 / 153.8 |
| rate_change_pct | (rate2021/rate2011−1)×100 | 1.0 |
| rate_peak_value / rate_peak_year | max | 161.1 / 2016 |
| population_change_pct | derived population | 15.0 |
| hosp_per_death_2021 | hosp_2021/deaths_2021 | 35.2 |
| vulnerable_hosp_2021 / share_2021 | ped+moto+cyc; /total | 19,380 / 49.1 |
| vulnerable_hosp_share_2011 | same 2011 | 46.2 |
| vulnerable_deaths_2021 / share_2021 | 132+235+40; /1123 | 407 / 36.2 |
| cyclists_change_pct / pedestrians_change_pct / motorcyclists_change_pct / car_occupants_change_pct | group 2021/2011 | 51.4 / −15.3 / 17.4 / 11.1 |
| age65plus_2011 / 2021 + shares | 65-74+75+; /known-age total | 3,874 / 5,476; ≈11.4 / ≈13.9 |
| cyclists65plus_2011 / 2021 + shares | age×group | 327 / 1,034; 6.1 / 12.7 |
| noother_share_cyclists_2021 / noother_share_motorcyclists_2021 / car_share_pedestrians_2021 | counterparty | 45.4 / 42.3 / 88.4 |
| apr2020_change_all_pct / pedestrians / cyclists | baseline April | −32.4 / −59.8 / 15.9 |
| majorcities/regional/remote_noother_share_car_2021 | car×remoteness | 8.3 / 24.6 / 57.3 |
| state_highest_rate_{year} / state_lowest_rate_{year} (+names) | state file, selected year | 2021 NT 286.1 / NSW 111.2; 2011 NT 197.2 / TAS 96.4 |

**stats-check.html (core, M1):** lists each statistic with expected value + pass/fail, and renders the
`validate.js` invariant report (§5.6).

### 11.2 Wording guardrails
- "people hospitalised"/"hospitalisations", not "crashes"/"victims".
- Keep counts/shares/rates distinct; always say which a chart shows.
- Rates crude; never "safer"/"more dangerous".
- No causes; claim ladder (observed → interpreted hedged → unanswered).
- Remoteness/state = where people live; counterparty ≠ fault.
- **Year = separation year; location = hospital, not crash.**
- **Vulnerable road users (this project) = pedestrians, motorcyclists, cyclists** (state operational
  definition; Data Hub's is broader).
- **Non-collision wording (verified, [VERIFY-TEAM]):** "no collision with another vehicle, person or
  object — for example a fall or loss of control" (WHO ICD-10 includes fall/thrown without antecedent
  collision; overturning). "Fixed or stationary object" examples stay open [CONFIRM].
- Note series breaks wherever a comparison crosses 2012/2017.
- Plain language; define terms at first use; link glossary.

## 12. Coding conventions

### 12.1 Separation of concerns
Loading (load-data), calculation (stats + pure page functions), drawing (visualizations), interaction
(chapter-controls,state,a11y), styling (CSS) in separate files. Pages only wire. Pure data-prep
functions take rows→rows (testable without DOM).

### 12.2 Style/naming
2-space indent; semicolons; single quotes; const by default; no var; ~100 char lines. Files kebab-case;
functions/vars camelCase; constants UPPER_SNAKE_CASE; CSS block-element. No inline styles/colours in JS
(read CSS vars via constants). JSDoc on every export.

### 12.3 Comments, AI tagging, errors
File header comment (purpose/inputs/outputs). AI blocks:
`// AI-ASSISTED [tool, YYYY-MM-DD]: what; reviewed by <initials>` + Gen AI log. Accessibility:
`// A11Y: why`. Library credit: `// Layout by d3-sankey (version X)`. Loaders throw DataError; cards
catch→error state; no empty chart without message. §5.1 edge cases have code, not just comments.

### 12.4 Git
Branch per task; small clear commits; merge only working code; pull before push; no unrelated files.
Keep README current (run, versions, credits).

## 13. Build order and backlog

| Milestone | Tasks | Acceptance |
|---|---|---|
| M0 walking skeleton | repo, lib, utils/d3; styles tokens/layout; header+skip in main; load-data schemas+alias; format; tooltip; a11y; chart-card+data-table; line.js; chapter-1 C1 | local server runs; C1 matches checks; table+download+keyboard work; no console errors |
| M1 ch1+intro+QA | C2; stats.js+tokens; intro cards; break annotations; **stats-check.html + validate.js** | stats match expected; no hard-coded numbers; invariants pass |
| M2 ch4 | tile-map C9; dot-plot C10; year slider+sort | state values match; tiles/rows keyboard-reachable |
| M3 ch3 | sankey C6; C7; C8; selector | links equal Appendix D; <640 fallback promotes C7 (single instance) |
| M4 ch2 | C3+selector+toggle; heatmap C4; band C5 | index/band checks match; selector updates three charts |
| M5 about+polish | about-data glossary+downloads; nav text; reading-level check | all pages linked; glossary complete |
| M6 quality pass | §9 acceptance steps; responsive; cross-browser; fix list | results recorded with screenshots |
| M7 usability changes | fix issues; before/after screenshots | changes logged for Design Book |
| Stretch | deep links | only if M6 complete |

**Freeze features** before usability evaluation. **Cut order if behind:** C10 sort toggle → C5 → C8 →
C4. **Never cut:** C1,C2,C3,C6,C7,C9, table+download on every chart, about-data, accessibility basics.

## 14. Quality assurance and rubric traceability

**Manual test script (after each milestone):** load each page from local server, no console errors;
compare three tooltip values per chart with §7 acceptance; table vs tooltip; download CSV opens;
change every control, status/charts/table agree; keyboard only; **resize 320/360/480/768/1024/1280**;
200% zoom; page titles/heading order/link text; stats-check invariants pass.

| Rubric criterion | Evidence |
|---|---|
| Coding practice (5) | D3 direct (§2,6); modular (§3,6,12); AI+a11y tags (12.3); loading/validation/edge cases (5.1,5.6,12.3) |
| Complexity (5) | two custom charts (C6,C9); multiple datasets (BITRE workbooks, ABS, deaths); derived rates/stats; responsive redraw |
| Storytelling (5) | message/chapters/takeaways (1,4.4); default story + controls (8) |
| Visualisation (10) / Interaction (5) | chart specs+acceptance (7); interaction rules (8); Design Book |
| Iteration/validation (5) | test script, a11y acceptance, usability changes (9,13,14) |
| Website design (3) | template+skeletons (4) |
| Data processing (5) | data-workflow.md + KNIME workflow |

## 15. Decisions log and open items

| Decision | Outcome |
|---|---|
| Page names | chapter-1…4.html; descriptive titles/headings |
| Controls | per chapter; no shared state; no storage |
| Libraries | D3 7.x + d3-sankey local; layout from module, drawing ours; **tutor-approved** |
| Key statistics | browser stats.js; All = sum five; canonical registry §11.1 |
| Supporting charts | dot plots C7/C10; C8 reuses dot plot |
| Tile map | tile grid, not choropleth |
| Beats | C5/C8 core; ch2 opens with VRU statistic |
| **C0** | **dropped (27 Nov 2026)** |
| **Breakpoints** | C10 stacked <768; min width 320 [DECIDE] |
| **Sankey fallback** | <640 hide C6, promote single C7 [DECIDE] |
| **Keyboard** | roving tabindex, one stop per chart incl Sankey [DECIDE] |
| **C4 denominator** | recompute over known age bands [DECIDE/CONFIRM] |
| **C9 badge** | badge only is_break_year; footnote otherwise [DECIDE] |
| Privacy Act | 1988 (Cth) |
| ABS release | Table 4 310104.xlsx, ref March 2026, released 17 Sep 2026, accessed 20 Nov 2026 |
| Definitions | non-collision/unknown-traffic/died-in-care/residence/bed-day change verified vs dictionary/WHO [VERIFY-TEAM] |
| Companion sync | data-workflow §3 + design-book labels mirror Appendix D exact strings/values |

**Open items**
- [ ] Confirm `d3.sankey` exists in UMD; record exact versions+licences.
- [ ] [CONFIRM] national population basis (sum of 8 states vs Australia column) + Other Territories note.
- [ ] [CONFIRM] June-only ABS filter; sex-file grain; remoteness label values; state=usual-residence wording.
- [ ] [CONFIRM] rate tolerance re-test vs March 2026 release; C4 recompute vs annual_total.
- [ ] [CONFIRM] "fixed or stationary object" examples (parked vehicles?).
- [ ] [DECIDE] confirm defaults: C10 <768; min 320; sankey fallback; roving; C4 denominator; C9 badge.
- [ ] Check C9 badge/text rules in usability testing.
- [ ] Wireframes/sketches (Design Book figures) to match this plan.
- [ ] Literature (≥1 peer-reviewed) [FIND]; usability participants; Gen AI declaration format.
- [ ] Reading-level + contrast checks (pedestrian ≈3.0:1 borderline → edge outline).

## Appendix A. AI task template
```
TASK: <one sentence>
READ: sections <numbers> of coding-plan.md (always 0,5,6,12)
CREATE OR CHANGE: <file paths only>
DATA: <file names and columns from §5>
REQUIREMENTS: <bullets from chart spec>
ACCEPTANCE CRITERIA: <copy "Accept" line>
CONSTRAINTS: vanilla JS, D3 only, §12, tag AI code, no new deps, no hard-coded numbers
OUTPUT: complete files; then assumptions, open questions, decisions to log
```

## Appendix B. Page title and heading reference
| Page | <title> | <h1> |
|---|---|---|
| index.html | Road crash injuries in Australia: the hidden toll | For every person killed on Australian roads in {latest_year}, about {hosp_per_death_2021} were hospitalised |
| chapter-1.html | 1. The hidden toll: road crash injuries in Australia | The hidden toll |
| chapter-2.html | 2. Who is getting hurt? Road crash injuries in Australia | Who is getting hurt? |
| chapter-3.html | 3. How do people get hurt? Road crash injuries in Australia | How do people get hurt? |
| chapter-4.html | 4. Where you live: road crash injuries in Australia | Where you live |
| about-data.html | About the data: road crash injuries in Australia | About the data |

## Appendix C. Glossary (plain language, about-data)
- **Hospitalisation:** admitted to hospital after a road crash; people who died in hospital within 30
  days of admission are not counted.
- **Road crash (traffic):** a crash in traffic; off-road/unknown locations excluded.
- **Road user group:** in a car (driver/passenger), motorbike, bike, on foot, or other (vans/utes,
  heavy, buses, unknown).
- **Vulnerable road users (this project):** pedestrians, motorcyclists, cyclists.
- **Counterparty:** the other vehicle, person or object involved. "No other vehicle, person or object"
  = non-collision transport accidents (e.g. fall or loss of control). Not a statement about fault.
- **Rate per 100,000:** hospitalisations ÷ population ×100,000 (June ERP). Crude: not adjusted for age
  or travel.
- **Index (2011=100):** value ÷ 2011 value ×100.
- **Series break:** hospitals changed admission rules (Victoria 2012; NSW June 2017); comparisons
  across need care.
- **Remoteness area:** where the patient usually lives (Major Cities, Regional, Remote, Other or
  unknown) — not crash location.
- **Year / location:** year = separation year; location data = hospital, not crash.

## Appendix D. Lookup tables and 2021 counterparty matrix (authoritative)

**road_user_groups.csv** (12 rows): Car driver→Car occupants 13,327; Car passenger→Car occupants 4,495;
Car unknown position→Car occupants 717; Motorcyclist→Motorcyclists 8,883; Pedal cyclist→Cyclists 8,163;
Pedestrian→Pedestrians 2,334; Pick-up truck or van occupant→Other road users 341; Heavy transport
driver→Other 383; Heavy transport passenger→Other 56; Heavy transport unknown position→Other 36; Bus
occupant→Other 169; Other or unknown→Other 601. (Group totals: Car 18,539; Moto 8,883; Cyc 8,163; Ped
2,334; Other 1,586 = 39,505.)

**counterparty_groups.csv** (10 rows): Car, pick-up truck or van→same 16,192; Heavy transport vehicle
or bus→Heavy vehicle or bus 1,020; Pedal cycle→Cyclist, motorbike, pedestrian or animal 451; 2- or 3-
wheeled motor vehicle→same 300; Pedestrian or animal→same 481; Fixed or stationary object→same 5,596;
Non-collision transport accident→No other vehicle, person or object 10,728; Other and unspecified
transport accidents→Other or unspecified 4,644; Other non-motor vehicle→Other 64; Train→Other 29.
(Group totals: 16,192/1,020/1,232/5,596/10,728/4,737 = 39,505.)

**2021 matrix (counts):**
| road_user_group | Car… | Cyclist,motorbike,ped,animal | Fixed… | Heavy… | No other… | Other… |
|---|---|---|---|---|---|---|
| Car occupants | 10,009 | 185 | 4,059 | 711 | 2,810 | 765 |
| Motorcyclists | 2,317 | 426 | 920 | 66 | 3,759 | 1,395 |
| Cyclists | 1,575 | 505 | 466 | 49 | 3,705 | 1,863 |
| Pedestrians | 2,063 | 106 | 0 | 83 | 0 | 82 |
| Other road users | 228 | 10 | 151 | 111 | 454 | 632 |

Captions: pedestrians zero in "No other" and "Fixed" by category definition; cyclists 22.8% "Other or
unspecified" — do not overstate cyclist claims.