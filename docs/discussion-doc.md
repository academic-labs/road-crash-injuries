# Discussion doc: road crash injuries data story (COS30045)

**Ground rule from the brief:** the BITRE Power BI dashboard is "contextual reference only", and "replication of its design or purpose is neither required nor encouraged". We are building a **data story**, not a redesigned dashboard. Therefore the critique is used for design *principles*, not as a feature list to rebuild.

**Numbers below** come from quick checks by genAI (GPT-6 Instant, Qwen-4-Max-Preview and Claude Sonnet 5.5) on the raw sheets (traffic rows only). Claude Sonnet 5.5 then re-checked the other two models' numbers against the raw sheets, the published summary tabs and the data dictionary (13 Nov 2026). Please still verify every one in KNIME before it goes into the Design Book.

---

## 1. Audience (decided) and options considered

| Audience | What they want to know | What we want them to know | Fit and risks |
|---|---|---|---|
| **A. General public (adults who drive, ride, walk)** | Is it getting safer? Am I at risk? | Non-fatal injuries are the bulk of the burden; who gets hurt is shifting; counts are not risk | Clearly different from the dashboard's analyst audience. Easy to recruit usability testers. Needs plain language (reading level 9 or lower) and careful caveats. |
| **B. Journalists and communicators** | A quotable, trustworthy number with context | The same, plus the limitations they must report | Good secondary audience. Needs a clear "about this data" page and per-chart downloadable tables. |
| **C. Council, state or advocacy staff** | Where and who? What changed? | Rates versus counts; series breaks | Least recommended: this is the dashboard's audience, so it invites replication. If chosen, the story must still lead. |
| **D. One road-user group (e.g. riders and cyclists)** | How do people like me get hurt? | Crashes with no other vehicle dominate | Compelling but narrow. Works better as a lens inside A. |

**Decision (18 Nov 2026):** the primary audience is the **general public**, to raise awareness. The secondary audience is **journalists, researchers and students** who want a place to start their own work. The table above is kept as the options we considered (option C is not selected; option D survives as the "how do you travel?" lens inside A).

**What this means for the design**
- Plain language (reading level 9 or lower) for public-facing text, with one short takeaway per chart.
- A personal way in: a guided "how do you travel?" choice (driver or passenger, motorcyclist, cyclist, pedestrian) that carries through the story. A fuller filter, if we build one, sits in the last chapter.
- For secondary users: an `about-data` page, a table view and download for every chart, and clearly stated limits (counts vs rates, series breaks).

**One-sentence message (proposed, to confirm):** many more people are hurt on Australian roads than killed, who is hurt is changing, and where you live changes the rate, so totals alone do not show how safe roads are.

---

## 2. Findings and story beats (to be verified)

**Sources and status.** M1 = GPT-6 Instant (`road_crash_hospitalisation_exploration_notes.md`), M2 = Qwen-4-Max-Preview (`data-exploration-findings.md`), C = Claude Sonnet 5.5 (quick checks, then a full re-check of both files). ✅ = re-verified by C against the raw sheets or published tabs. ⚠️ = check before use. 💡 = idea or hypothesis, not a data claim.

| Beat | What was found | Caveat or check | Chart idea |
|---|---|---|---|
| **Is it getting worse?** | ✅ 34,033 (2011) to 39,505 (2021), about +16%; peak 39,866 (2019). Raw Traffic totals match the published Table 1 in all 11 years. [M2, C] | Victoria 2012 and NSW 2017 series breaks; counts, not rates. ⚠️ The headline leaves out the separate "Unknown traffic" category (5,710 hospitalisations in 2021): see data notes. | Line with labelled break annotations |
| **Who is changing? (road user)** | ✅ Cyclists +51% (5,391 to 8,163); pedestrians -15% (2,754 to 2,334); car drivers +22%; motorcyclists +17%. [M2, C] | Counts only; no exposure data (how much people ride). 💡 Whether e-bikes play a part is a hypothesis. | Indexed lines (2011 = 100) or slope chart |
| **Ageing (age as the spine)** | ✅ Ages 65+ rose 3,874 to 5,476 (+41%), from 11.4% to 13.9% of cases (65-74: +53%; 75+: +29%). Among 65+: cyclists 327 to 1,034 (+216%), motorcyclists 203 to 514 (+153%), car drivers +40%, pedestrians -12%. The 65+ share of cyclist cases went from 6.1% to 12.7%. Cyclists aged 40+ went from 43% to 54% of cyclist cases. [M1, M2, C] | Counts, not rates (the population is also ageing). Keep 65-74 and 75+ separate. No causal claims. | 100% stacked area or heatmap of age by year; 65+ by road user |
| **2020 and the seasonal rhythm** | ✅ April 2020 vs April 2019: total -32%, pedestrians -60%, cyclists +16%. Cyclist cases were up 8-51% on 2019 in every month from April to December (annual 7,302 to 8,332, +14%). ✅ Normal seasonality (2017-19, 100 = own monthly average): cyclists peak in March (120) and bottom out June-August (81-82); pedestrians peak in June (122) and bottom out in January (74); car drivers and motorcyclists are flatter. Same pattern in 2011-13. [C, M1, M2] | The cause of the 2020 pattern needs literature; seasonal explanations are 💡 hypotheses. Adjust for month length (pooled, the lowest month overall is June, but per day it is August). | Monthly 2019 vs 2020 lines on a seasonal baseline; month x road-user heatmap |
| **How do people get hurt?** | ✅ "Non-collision transport accident": 45% of cyclist and 42% of motorcyclist cases; 88% of pedestrian cases involve a car, pick-up or van. The overall counterparty mix barely moved from 2011 to 2021 (car, pick-up or van 41.2% to 41.0%; non-collision 25.4% to 27.2%). [C, M1] | ⚠️ Check what "non-collision" and "fixed or stationary object" cover (parked vehicles?). Counterparty is not fault. | Sankey (custom); sorted bars |
| **Remoteness (where injured people live)** | ✅ 2021: Major Cities 26,355 (66.7%), Regional 11,407 (28.9%), Remote 1,114 (2.8%), unknown 629 (1.6%). Since 2011: Major Cities +20.5%, Remote -3.6%. Non-collision accidents are 49.4% of Remote cases vs 24.1% in Major Cities. Car occupants only (this controls for road-user mix): non-collision 8.3% (Major Cities), 24.6% (Regional), 57.3% (Remote, n = 602). [M2; car-occupant comparison by C] | Residence, not crash location; shares, not rates; Remote cases are few. ⚠️ Say "no other moving road user" until the fixed-object definition is checked. | 100% stacked bars (counterparty by remoteness, car occupants only) |
| **Severity (bed days)** | ✅ 2021 pedestrians: 5.9% of cases but 11.4% of bed days (9.7 bed days per case vs cyclists 3.3, motorcyclists 5.6, car drivers 4.6). Pedestrian stays: 3.2-3.5 per case for ages 0-16 vs 15.8-16.0 for 65+. Total 198,934 bed days in 2021 (about 545 beds' worth, all year). [M2, C] | Within-year comparisons only: the dictionary describes bed-day counting changes from 2015-16 (bed days per case: 4.06 in 2014, 5.62 in 2016). Includes transfers and readmissions. Pedestrian decline 11.7 to 9.7 (2017 to 2021) is parked. | Sorted dot plot of bed days per case; paired bars of case share vs bed-day share |
| **Who is most affected? (sex)** | ✅ Male share: 65.6% (2011), 65.3% (2021). By road user in 2021: motorcyclists 88.8%, cyclists 78.7%, pedestrians 59.5%, car drivers 50.5%, car passengers 40.0%. The female share of cyclist cases is flat (20.8-22.0%; 23.4% in 2020). [M1, M2, C] | Counts, not rates. The third sex category is tiny. | Dot plot, or age x sex small multiples |
| **Where? (states)** | ✅ 2011 to 2021: Qld +65%, Tas +63%, NT +56%, ACT +38%, Vic +19%, SA +12%, WA +4%, NSW -15%. ✅ The 470-case gap is resolved: the Australian total includes cases with residence unrecorded or migratory/offshore (state Table 1, footnote c). Cyclist share of 2021 cases: ACT 45.4%, Vic 24.2%, NSW 22.7%, SA 21.9%, WA 19.7%, Tas 15.1%, Qld 14.4%, NT 13.3%. [M1, C] | NSW and Vic breaks; rates need ABS population. ⚠️ State road-user and age blocks contain "n.p." cells (185 and 80), so shares use slightly smaller totals (e.g. ACT 733 vs 740). ⚠️ ACT cyclist cases jumped from 223 (2020) to 333 (2021) after sitting at 149-223: check before featuring ACT. | Tile-grid map with sparklines (custom); dot plot |
| **First Nations** (cut from scope on 20 Nov 2026; kept for the record) | ✅ (published Table 1) First Nations 1,167 to 2,220 (+90%); non-Indigenous 31,997 to 36,755 (+15%); status not stated 869 (2.6%) to 530 (1.3%). 2021 mix, First Nations vs non-Indigenous: pedestrians 10.6% vs 5.7%; cyclists 9.3% vs 21.6%; ages 0-16 17.0% vs 8.6%; ages 65+ 2.0% vs 14.6%; remote residence 23.0% vs 1.7%. First Nations people are 29.5% of remote-resident cases in 2011 and 45.6% in 2021. [M2, C] | The trend partly reflects better identification: "not stated" fell by about 340 while First Nations cases grew by about 1,050, and people recorded as non-Indigenous cannot be seen at all. Use Table 1 for totals (the raw age block loses about 2,600 cases in Jul-Dec 2014 to n.p. cells). Counts, not rates. ⚠️ Respectful framing. 💡 The First Nations population is younger and more remote: needs an ABS source. | Paired bars or dumbbell of 2021 composition; lead with composition, not the trend |
| **Kids lens (optional)** | ✅ 2021, ages 0-7: car passengers 288, cyclists 217, pedestrians 123. Ages 8-16: cyclists 1,250 (44% of 2,863), car passengers 603, motorcyclists 575 (88% male; 377 in 2018 to 575 in 2021). [M2, C] | ⚠️ The 8-16 band includes 16-year-olds; pillion riders may be coded as motorcyclists; check licensing ages and literature before any claim about children on motorbikes. | Small multiples by age band |

**New verified items (18 Nov 2026)**
- ✅ Road deaths: 1,123 in 2021 (BITRE, *Road trauma Australia 2021 statistical summary*, 2022; we opened the report). ✅ 39,505 hospitalised in 2021 is about 35 per death (different sources and definitions, so hedge the wording).
- ✅ Vulnerable road users (pedestrians, motorcyclists, cyclists): 49.1% of 2021 hospitalisations (19,380 of 39,505; 46.2% in 2011) vs 36.2% of 2021 deaths (407 of 1,123, from the report's Table 1.2). The report itself notes the gap (47% vs 36%).
- ✅ Rates method: our crude national rates (Traffic hospitalisations divided by June ABS population, times 100,000) match the report's Table 2.8 within 0.3 for 2012-2018 (e.g. 158.5 in 2018). For 2021 we get 153.5 with the report's June 2021 population (25,738 thousand) vs the dashboard's 153.8 (our critique): expect small differences from ABS revisions.
- ✅ Remote population check: the dashboard's 2017 Remote population (492,594, critique Figure 8) is consistent with the report's Remote plus Very Remote populations (about 493 thousand), so BITRE's "Remote" combines the two ABS classes. (Read from the PDF text: confirm in the PDF.)
- ✅ BITRE's report says the 2012 and 2017 admission-criteria changes reduced admissions by roughly 2-5% in total; the dictionary's estimate for Victoria is -5.6% in 2012-13. Quote both with attribution.
- ✅ "Unknown traffic": the report's glossary defines a hospitalised injury as a person admitted after a crash "in traffic", excluding off-road and unknown locations. This fits the exclusion, but the dictionary does not say it, so keep the ⚠️.
- ✅ "Non-collision transport accident" (tentative): in ICD-10 coding the cyclist category (V18) includes falls from the cycle and overturning without an antecedent collision. Plain-language wording: "no collision with another vehicle, person or object (for example a fall or loss of control)". ⚠️ Confirm in the Australian modification (ICD-10-AM) or the World Health Organization classification before it goes in the Design Book; do not cite coding websites.
- ✅ The BITRE 2022 report is licensed under Creative Commons Attribution 3.0 Australia (attribute to the Commonwealth). The dataset page itself states no licence.

**Corrections and resolved items from the verification**
- **First Nations figures (earlier version of this doc):** the earlier "1,153 to 2,183 (+89%)" and "about 1,100 unknown status" came from the remoteness block, which leaves out cases with unknown remoteness. They are replaced above with published Table 1 values.
- **First Nations "2014 spike" (M2):** a residual of 3,323 (9.4%) in 2014 is an artefact. Four "n.p." cells (ages 0-7 and 65+, Jul-Dec 2014) in the raw age block remove about 2,600 cases. Published Table 1 gives 1,456 First Nations, 33,361 non-Indigenous and 698 not stated (2.0%) for 2014. We have not confirmed why those cells are suppressed.
- **`Died_cases` (M2):** it is not blank in 2020: there are 88 cases (about half the usual 200 or so), and 2021 is blank. Still treat it as unreliable.
- **"Unknown traffic" (M2 left the size open):** 5,242 hospitalisations in 2011 and 5,710 in 2021.
- **Rates denominators (M1):** M1 says rates use only 2021 population counts. We could not verify this. The dictionary says annual ABS population counts by age, sex and remoteness (custom request, reference period 30 June 2021), and the BITRE dashboard shows year-specific populations (our critique, Figure 8). We do not hold these counts, so rates need ABS data. ⚠️
- **Resolved:** the 470 state-to-national gap; national Table 1 matches the raw Traffic total exactly; remoteness is usual residence; age is at admission; "died in care" means death within 30 days of admission.
- **Minor differences:** M2's pedestrian bed-day share is 11.5% (C gets 11.4%) and its car-driver case share is 33.8% (C gets 33.7%): rounding or denominators.

**Where this differs from the dashboard:** per the critique, its charts are annual snapshots with filters. The national raw data is monthly, so the 2020 beat and the change-over-time beats are narrative-led and not available there.

**Spine:** superseded by the selected plan in section 5 (four chapters: the hidden toll; who is getting hurt; how people get hurt; where you live and who you are). The earlier suggestion and the options considered are kept in section 6.

**Chapter pattern: one main chart plus supporting charts**

Each chapter has one main chart that carries the message, plus up to two supporting charts that cover its weaknesses or blind spots, or reinforce the message. The custom chart is the main chart of its own chapter.

1. **Cap it.** One main chart and at most two supporting charts per chapter. Three chapters is roughly 6-9 charts in total. Supporting charts should mostly reuse existing module types (line, bar, heatmap), so the extra cost is data prep rather than new code.
2. **Name the weakness.** Every supporting chart states what it covers (e.g. "hides absolute size", "can't show exact values", "series break"). If it can't name one, cut it. The same sentence becomes the justification in Design Book section 3.2.
3. **Keep the hierarchy obvious.** The main chart is larger and comes first, with one takeaway sentence per chapter. Supporting charts reuse the same colours and encodings (one colour, one meaning).
4. **Static by default.** Linking or highlighting between main and supporting charts is a stretch goal, because the critique showed that unpredictable cross-filtering is a real usability failure.
5. **Mind data density.** Each chart still needs its how-to-read note, table view and download, so a crowded page costs both users and build time.

Earlier candidate chapters (genAI-suggested; kept for the record, and the selected plan is in section 5):

| Chapter | Main chart | Supporting chart | Weakness it covers |
|---|---|---|---|
| Trend | Line with break annotations | State small multiples, or counts vs rates (needs ABS population) | One national line hides the Victoria and NSW breaks; counts are not risk |
| Who is changing | Indexed lines by road user | Counts for 2011 vs 2021 (sorted bars) | An index shows percentage change but hides scale: cyclists +51% is still smaller in absolute terms than car drivers |
| 2020 | Monthly 2019 vs 2020 lines | Diverging bars of % change by road user | Lines show timing but make magnitudes hard to compare |
| How people get hurt | Sankey (the custom chart) | Sorted bars for one road user's counterparties | Sankeys are weak for exact values |

**Data notes that affect every beat**
- The national raw sheet contains 6 cause categories. Filter to `Traffic` first; the result matches published Table 1 exactly.
- **"Unknown traffic"** is a separate cause category (5,710 hospitalisations in 2021, about 14% of the headline). The published road-crash totals leave it out. The dictionary lists it by external-cause code ranges without a plain-language definition, so state the exclusion in `about-data` and do not claim what those cases are. ⚠️
- `Hospitalisations` = `Count of cases` minus `Died_cases`. The 4,578 blank-count Traffic rows are bed-days-only rows (11,379 bed days in 2021): keep them for bed-day sums, but they add no cases.
- `Died_cases` is 194 (2019), 88 (2020) and blank (2021): treat as unreliable and avoid a mortality story.
- Bed days per case jump from 4.06 (2014) to 5.62 (2016) and the dictionary describes bed-day counting and rehabilitation-coding changes from 2015-16. Compare bed days within a year only.
- The national raw sheet is unsuppressed: about 60% of Traffic rows that report a count show 1-2 cases (48,681 of 81,562). Aggregate small cells before showing them (Five Safes "safe outputs").
- State and First Nations raw sheets are 6-monthly, in 5 side-by-side blocks. Block start columns (0-indexed): state 0, 7, 15, 23, 31; First Nations 0, 8, 16, 24, 32 (7 columns each). In the First Nations sheet the two "age" blocks (starting at columns 0 and 16) are identical duplicates.
- "n.p." (not published) cells: state road-user 185, age 80, sex 0, counterparty 0, annual totals 0; First Nations road-user 62, age 4, remoteness 0, counterparty 0. Never reconstruct them; show "suppressed" in table views.
- First Nations tables merge some categories (car driver, passenger and unknown position; heavy transport), cap age at 65+, and collapse counterparty to four groups. Do not join them 1:1 to the national categories.
- Remoteness is the patient's usual residence, not the crash location; age is at admission. Rates in the publication are crude (not age-standardised).
- Published totals in some tables may not match Table 1 because of unknown sex, age, road user or remoteness, and data is subject to revision (dictionary).
- BITRE's Transport Safety page reports about 36,000 hospitalised injuries for 2022, against about 39,500 for 2021 in our file. Check the basis before mixing sources.

**Checks to run before using the findings**
1. ⚠️ What "non-collision transport accident" and "fixed or stationary object" include (parked vehicles?); the dictionary lists the categories only.
2. ⚠️ What the "Unknown traffic" codes represent, and how we word the exclusion.
3. ⚠️ Why the raw First Nations age block has n.p. cells in Jul-Dec 2014. Use Table 1 for First Nations annual totals.
4. ⚠️ State n.p. cells when computing shares, and the ACT 2021 cyclist jump.
5. ⚠️ Which ABS population counts are available (annual or 2021 only; state, age, sex, remoteness, Indigenous status) before promising any rates.
6. ⚠️ Licensing ages, pillion coding and the age-band boundary for the 8-16 motorcyclist trend.
7. ⚠️ The AIHW statement on Indigenous identification in hospital data (cite it).
8. 💡 Literature: cycling exposure and seasonality; pedestrian winter darkness; e-bikes and older riders; remote single-vehicle crash research.
9. Reproduce the key numbers in KNIME and keep screenshots (the checks above were done in Python).

**Extra data to research:** ABS population estimates (state, age, sex, remoteness, First Nations) for rates; cycling or riding participation data as an exposure measure; BITRE's *Road Trauma Australia 2024* as a cross-check for rates.

---

## 3. Design principles carried over from the critique

These are principles for our charts (though feel free to reject or adjust any of them):

- One colour, one meaning; colourblind-safe palette; double-encode (colour plus shape or pattern).
- Label axes and units; mark series breaks with annotations, not line styles.
- Prefer sorted bars over pies; use position and length for quantities.
- Always show what is selected and what it is a share of.
- When counts and rates both matter, show them side by side.
- Every chart gets a "how to read this chart" note, a "view as table" option and a download.
- Keyboard-reachable controls and tooltips (not hover-only); no empty focus stops.
- Aggregate or suppress tiny counts rather than showing them exactly.
- An `about-data` page covering exclusions, series breaks, the 2015-17 external-cause caveat, the two-year lag and the counts-vs-rates limitation.

**Interaction principle:** every control, including richer filters, should serve the narrative. The brief asks for exploration of *selected dimensions* in a structured and meaningful way, supporting both exploratory analysis and explanatory communication.
- Narrative chapters use guided interactions with sensible defaults.
- A fuller filter (e.g. road user x age x sex x year) fits best in a dedicated explore chapter.
- Each control should answer a question the story raises, show its current state ("Showing: ..."), offer a reset, and handle small counts (aggregate or suppress).
- Predictable cross-filtering matters: users should be able to tell which views respond to which control (a weakness the critique found).

---

## 4. File structure (to be confirmed)

```
road-crash-injuries/
├── index.html                  intro only: why it matters, story overview, where to start
├── hidden-toll.html            chapter 1 (proposed name): trend, counts vs rates
├── who-is-hurt.html            chapter 2 (proposed): road user and age, "how do you travel?"
├── how-people-get-hurt.html    chapter 3 (proposed): Sankey and counterparties
├── where-you-live.html         chapter 4 (proposed): state map, remoteness
├── about-data.html             sources, governance, limitations, glossary
├── assets/
│   ├── css/
│   │   ├── styles.css          global: colour tokens, typography, layout, nav, focus styles
│   │   └── charts.css          chart layout, axes, tooltips, legends, annotations
│   ├── data/
│   │   ├── raw/                original xlsx files, data dictionary PDF, ABS population tables
│   │   └── processed/          CSVs for the charts, plus a README.md (columns, source tab, KNIME node)
│   ├── js/
│   │   ├── main.js             shared on every page: nav, skip link, settings
│   │   ├── pages/              one entry script per chapter page (hidden-toll.js, ...)
│   │   ├── visualizations/     line.js, bar.js, heatmap.js, sankey.js, tile-map.js, data-table.js (one per type)
│   │   └── utils/
│   │       ├── chart-card.js   wrapper for every chart: title, how to read, table toggle, download
│   │       ├── constants.js    margins, transition timing, minimum font sizes, palette
│   │       ├── d3.js           pins the D3 version in one place
│   │       ├── load-data.js    one cached loader per CSV
│   │       └── tooltip.js      single shared tooltip (hover and keyboard focus)
│   └── img/                    images, favicon, wireframe exports used on pages
├── knime/                      gicungdc_Hospitalised_Injuries.knwf (file and workflow names need the team name)
├── docs/                       wireframes, design-book drafts, usability materials
├── .gitignore
└── README.md
```

**Page names:** proposed on 18 Nov 2026 from the selected chapter plan (section 5); rename freely before many links exist. `index.html` and `about-data.html` are fixed. The tile map needs only a small layout file (state to grid position), so no boundary file is required; one would be needed only if the choropleth alternative were built.

**Import rule:** `visualizations/*` may import from `utils/*` but never from `chart-card.js`. `chart-card.js` imports `data-table.js` for the "view as table" view, and only `pages/*` import `chart-card.js`. This keeps the dependency direction one-way and avoids circular imports.

**What each chart block on a page contains:** a title saying what it shows, a one-line takeaway, a "how to read this chart" note (`<details>`), the chart, a legend, "view as table" and "download CSV", and a source or caveat line. Supporting charts also carry a one-line note on what they add (the weakness they cover).

**Notes on the structure**
1. Per-page entry scripts (`js/pages/`) instead of one `main.js` that wires every chart. Pages stay thin, no page loads code it does not use, and two people editing different pages rarely collide in Git.
2. A shared `chart-card.js` (in `utils/`) builds the "how to read", table toggle and download for every chart, so they are not re-written in each HTML file. The table itself is `visualizations/data-table.js`, since a table is a visualization type.
3. `load-data.js` should expose one cached loader per dataset, not load every CSV on every page.
4. Keep one source of truth for colours (CSS variables, read by JS via `getComputedStyle`, or the reverse), not two copies.
5. The shared tooltip must also open on keyboard focus (focusable marks), not only on hover.
6. `d3.js` can be one line, for example `export * from "https://cdn.jsdelivr.net/npm/d3@7.9.0/+esm";`. Alternatively vendor D3 locally so the site works if the CDN is down. Either way, pin an exact version.
7. `processed/README.md` documents each CSV (columns, source sheet, KNIME node). It feeds Design Book section 2.2 and keeps the data reproducible.
8. Pick one spelling for `visualizations` (the brief uses "visualisation") and use it everywhere, since imports break on a mismatch.
9. Keep all HTML files in the root so every path starts with `assets/...`. Open the site through a local server (for example VS Code Live Server), because D3's CSV loading fails from `file://`. GitHub Pages works as-is.

---

## 5. Selected beats and chapter plan (decided 18 Nov 2026)

**Selection criteria:** fit with the audience (awareness, personal relevance), data robustness (verified, low suppression, known breaks), rubric alignment (storytelling, complexity, visualisation and interaction design), and what two people can build in about three weeks.

### 5.1 Decisions

| Decision | Outcome | Why |
|---|---|---|
| Primary audience | General public (awareness) | Different from the dashboard's professional users; easy to test; supports a story-led design |
| Secondary audience | Journalists, researchers and students | They need a trustworthy starting point: `about-data`, tables, downloads, stated limits |
| ABS population data | State and territory population only (decided 20 Nov 2026) | Gives the national rate (chapter 1) and state rates (tile map) from one table; remoteness, age and sex populations are not collected, for time (see 6.0) |
| First Nations | Cut (20 Nov 2026) | Not enough time to do it with the care it needs; kept as future work (see 6.0) |
| Tier 3 charts | Cut (20 Nov 2026) | Not enough time; kept as future work (see 6.0) |
| Custom charts | Two: a Sankey chart and a state map | Each is the main chart of its own chapter, so each has its own story and justification. Cost: more build time (see 5.3) |
| Map type | Tile-grid map (recommended); choropleth kept as an alternative | Equal-sized tiles fix the area bias; the ACT and Tasmania stay visible; no boundary file (details in 6.5) |
| Counts and rates | Show both, labelled on every chart | Addresses the critique's finding that counts and rates on separate pages mislead |
| Wording guardrails and claim ladder (6.4) | Proposed: adopt (to confirm) | Keeps claims inside what the data supports |

### 5.2 Chapter plan

| # | Chapter (plain-language title) | Question | Main chart | Supporting charts and the weakness they cover | Why it fits the audience |
|---|---|---|---|---|---|
| 1 | **The hidden toll** | How many people are hurt, and is it getting worse? | Line of annual hospitalisations 2011-2021 with labelled series breaks, beside a "1,123 died, 39,505 hospitalised" comparison | Rate per 100,000 line (counts ignore population growth). Tier 3: deaths vs hospitalisations by road user (one total hides who is hurt vs who dies) | Opens with a surprising, true hook (about 35 hospitalised per death); low risk for both audiences |
| 2 | **Who is getting hurt?** | Who is hurt, and how is that changing? | Indexed lines by road user (2011 = 100) with the "how do you travel?" choice and an index/counts toggle | Age by year heatmap for the chosen road user (an index hides who is affected). Tier 2: monthly 2019 vs 2020 lines (annual lines hide within-year timing and the pandemic shift) | Personal relevance; the cyclist rise and the ageing pattern are the clearest changes in the data |
| 3 | **How do people get hurt?** | With whom or what are people hurt? | Sankey: road user to counterparty (2021 or a pooled period) (custom chart 1) | Sorted bars of counterparties for the chosen road user (a Sankey cannot show exact values). Tier 2: single-vehicle share for car occupants by remoteness (a Sankey cannot show place) | Explains the "how"; the no-other-vehicle share is surprising; secondary users get exact values |
| 4 | **Where you live** | Does the rate differ by place? | Tile-grid map of the 2021 rate per 100,000 by state and territory (custom chart 2) | Counts vs rates by state, as sorted bars or a dot plot (a map cannot show exact values or the gap between counts and rates); proposed, replaces counts vs rates by remoteness | The "so what" for awareness; shows counts and rates side by side |

### 5.3 Priority tiers and cut order

| Tier | Charts | Rule |
|---|---|---|
| 1 (core, 8 charts) | Trend; rate line; indexed road-user lines; age heatmap; Sankey; counterparty bars; tile map; state counts vs rates (proposed) | Must ship. Five module types: line, bar, heatmap, Sankey, tile map (plus the table view) |
| 2 (should) | 2020 monthly lines; single-vehicle share by remoteness | Build only if Tier 1 is on track at the end of week 2 |
| 3 (cut 20 Nov 2026) | Deaths vs hospitalisations by road user; First Nations composition; year animation on the map | Cut; kept as future work |

**Cut order if behind (decide at the end of week 2):** Tier 3 is already cut. Cut Tier 2 first, then the counterparty bars (the table view still gives exact values). **Never cut:** the four main charts, the rate line, the `about-data` page, table views and downloads, and the accessibility basics.

### 5.4 Guided interactions

- **"How do you travel?" choice** (chapter 2, carried into chapter 3): one visible control that drives the road-user line, the age heatmap and the counterparty bars, with a "Showing: ..." label and a reset.
- **Index / counts toggle** (chapter 2) and **counts / rate** labelling (chapters 1 and 4).
- **Year selector** on the tile map (default 2021).
- **Tooltips on hover and keyboard focus**, a table view and a download on every chart.
- No filter for every variable. Each control answers a question the chapter raises.

### 5.5 Rubric alignment (short)

- **Storytelling:** one message, four chapters, each main chart answering one question, with supporting charts that cover its weakness.
- **Complexity:** two custom charts; multiple datasets integrated (BITRE national and state workbooks, ABS population, BITRE deaths for context); derived rates; responsive and accessible code.
- **Visualisation design:** alternatives documented (choropleth vs tile grid; Sankey vs stacked bars; index vs counts), with marks and channels stated per chart.
- **Interaction design:** a small set of guided controls, each justified, with a table of interactions.
- **Iteration and validation:** plan one early feedback round (wireframes or prototype) and one formal usability test, plus a formal accessibility check.

### 5.6 Risks and mitigations

- **Time:** two custom charts in three weeks. Mitigation: tiers and the cut order above; start the Sankey and the tile map data early.
- **Denominators:** state and territory population estimates (June) must be recorded with release and access dates inside the KNIME file; the national rate uses the Australia total from the same table.
- **Crude rates:** rates are not age-standardised, so say so on the charts.
- **Wording:** "non-collision" and "Unknown traffic" need authoritative definitions before public wording is final.

### 5.7 Scope change (20 Nov 2026)

We cut the Tier 3 charts and the First Nations data because we cannot finish them on time. What stays: four chapters, eight core charts, two custom charts, and the Tier 2 charts as stretch goals. The freed time goes to usability testing, accessibility checks and polish, which the rubric rewards (Iteration and Validation, 5 points). The First Nations findings and the cut charts stay in section 2 and section 6 as future work.

---

## 6. Alternatives considered (earlier ideas, kept for the record)

These were the options on the table before the decisions in section 5. They are kept so that the Design Book can describe alternatives considered. Source tags are as in section 2 (M1 = GPT-6 Instant, M2 = Qwen-4-Max-Preview, C = Claude Sonnet 5.5). The outcome of each is in 6.0.

### 6.0 Outcome of the earlier ideas

| Earlier idea | Outcome | Where it went |
|---|---|---|
| Ageing as the spine of "Who is changing" | Selected | Chapter 2 supporting chart (age by year heatmap for the chosen road user) |
| Seasonality inside the 2020 chapter | Folded in (Tier 2) | Chapter 2 supporting chart (monthly 2019 vs 2020 lines) |
| Remoteness and single-vehicle crashes | Selected in part | Chapter 3 supporting chart (Tier 2, shares only). Counts vs rates by remoteness is not selected because remoteness population is not collected |
| Remoteness, age and sex population (ABS) | Not collected (20 Nov 2026) | Stretch only; rates are shown by state and for Australia |
| Severity lens (bed days per case) | Not selected | Bed-day caveats; future work |
| First Nations vs non-Indigenous | Cut (20 Nov 2026) | Future work; the workbook was explored but is not used |
| Deaths vs hospitalisations by road user (Tier 3) | Cut (20 Nov 2026) | The 1,123 deaths vs 39,505 hospitalised comparison stays as a text statistic in chapter 1 |
| Year animation on the map (Tier 3) | Cut (20 Nov 2026) | Static year selector only |
| Kids lens | Not selected | Several unchecked claims; low audience fit for the time cost |
| State and territory road-user profiles | Not selected | Table view only (n.p. cells, ACT anomaly) |
| Counterparty over time | Folded in | The Sankey (the mix barely changes) |
| Sex profile within road users | Not selected as a chart | Mentioned in tooltips and text |
| Option A, B or C | A, modified | Four chapters; remoteness and First Nations in chapter 4; 2020 as a supporting chart |
| Choropleth state map | Considered, not selected | See 6.5 |
| Claim ladder and wording guardrails | Proposed for adoption | See 6.4 |

### 6.1 Beat and chapter ideas

| Idea | Source | What it adds | Cost or risk | Possible slot |
|---|---|---|---|---|
| **Ageing as the spine of "Who is changing"** | M1, M2 | The clearest change in the data; both tools reached it independently; cyclists and motorcyclists aged 65+ roughly tripled and doubled | Counts, not rates; keep 65-74 and 75+ separate | Chapter 2 main chart |
| **Seasonality inside the 2020 chapter** | M2, M1 | Shows the normal rhythm first, so the 2020 anomaly lands harder; uses data we already have | Month-length adjustment; no causal claims | 2020 chapter or a supporting chart |
| **Remoteness and single-vehicle crashes** | M2 (controlled version by C) | A "where" story without a tile map; the car-occupant gradient (8.3%, 24.6%, 57.3%) is not explained by road-user mix | Residence, not crash location; Remote cases are few | Supporting chart in "How people get hurt", or a main chart |
| **Severity lens (bed days per case)** | M2 | A derived measure (helps the Complexity criterion); "pedestrians stay longer" | Within-year only; includes transfers | Supporting chart in "Who is changing" or a closing stat in Trend |
| **First Nations vs non-Indigenous (2021 composition)** | M2 | Genuine multi-dataset integration; built-in comparator | Needs the most care and time; lead with composition, use Table 1 | Optional explore chapter |
| **Kids lens** | M2 | Memorable contrasts by age band | Several unchecked claims | Probably cut |
| **State and territory road-user profiles** | M1 | Local relevance | Small counts, n.p. cells, series breaks, ACT anomaly | Sidebar or table only |
| **Counterparty over time** | M1 | Detail on how injuries happen | The mix barely changes, so weak as a trend | Fold into the Sankey instead |
| **Sex profile within road users** | M1 | Strong differences by road user | Overlaps "who" content | Fold into age x sex small multiples |

### 6.2 Chapter combinations (adapted from M2)

| Option | Chapters | For | Against |
|---|---|---|---|
| **A: keep the planned spine** | Trend; Who is changing (ageing spine; supporting: indexed road-user lines and bed days per case); How people get hurt (Sankey main; supporting: remoteness gradient); optional explore: First Nations | Fits the chapter pattern and the one-custom-chart budget; reuses the same data throughout | The explore chapter is the riskiest part |
| **B: remoteness as a main beat** | Replaces "Where?" (tile map) with remoteness; pair with First Nations in explore | Simpler than a custom tile map; strong, controlled finding | Two main charts need small-number care |
| **C: 2020-led** | Trend; 2020 with a seasonal baseline; Sankey; explore: First Nations | A memorable "natural experiment" story | Ageing and severity drop to supporting roles |

Claude's suggestion (for discussion, not a decision): Option A, with seasonality as a supporting chart in the 2020 material rather than a separate chapter, and First Nations only if time and care allow.

### 6.3 Chart ideas not yet in the plan

- 100% stacked area (or bars) of age-group shares over time (M1)
- Age x road-user heatmap using within-road-user shares (M1)
- Year x month heatmap per road user, to show whether seasonality is stable (M1)
- Sorted dot plot of bed days per case, with paired bars of case share vs bed-day share (M2)
- Dumbbell or paired bars of First Nations vs non-Indigenous composition (M2)
- Dot plot of male share by road user (M1)
- 100% stacked counterparty bars by remoteness, car occupants only (C)

### 6.4 Writing and process ideas

- **Claim ladder for each beat (M1):** Observed (what the table shows), Interpreted (what it may suggest), Unanswered (what this dataset cannot establish). It supports the rubric's "claims grounded in data" for Storytelling.
- **Wording guardrails (M1):** say "hospitalisations" or "people hospitalised", not "crashes" or "victims"; keep counts, shares and rates distinct; never call a state safer or more dangerous from road-user shares; never infer crash location from residence or fault from counterparty; no weather or holiday explanations without evidence; use respectful, source-aligned First Nations terminology.
- **Ten-question beat checklist (M1):** most of it is already in the reusable checklist (group A). "Alternative explanations" and "interpretation boundary" could be added explicitly.
- **KNIME build notes (M2, section 7):** column ranges, filters and group-by steps for each finding. These could become our KNIME build plan, and M2's suggested audit-log entries could go into the project audit log.
- **Possible First Nations references (M2):** the CARE principles and the AIATSIS Code of Ethics. Verify them before citing.
- **Gen AI log:** record the use of GPT-6 Instant, Qwen-4-Max-Preview and Claude Sonnet 5.5 with dates.

### 6.5 Map type alternatives

| Option | For | Against | Verdict |
|---|---|---|---|
| **Choropleth** (state boundaries, colour by rate) | Familiar to the public; geographic accuracy | Eight regions with very different areas: WA, NT and Queensland dominate, the ACT and Tasmania are hard to see; colour is a weak channel for comparing eight values; needs a boundary file and simplification; hard to tap on phones | Not selected; documented as an alternative |
| **Tile-grid map** (one equal tile per state) | Fixes area bias; every state is readable; custom chart; light data (a layout file); room for a number and a sparkline in each tile | Less geographic; unfamiliar to some readers; cannot show exact values by colour alone | **Selected** (colour plus printed value, with a table view) |
| **Sorted dot plot or bars** | Best for comparing eight values (position and length) | Not a map; less engaging | Fallback if the map slips; the table view covers it |
| **Small multiples of lines** | Show trend and series breaks per state | Eight panels; busy; weak on the 2021 comparison | Possible sparklines inside the tiles |

---

## 7. Open items and info to add later (side section)

The detailed checklist is in Part B of `design-book-draft-v1.md`. The ones that affect the plan most:

- [ ] Confirm the one-sentence message and the chapter titles (reading level 9 or lower)
- [ ] Confirm the tile map (vs choropleth) and the Tier 1 / 2 / 3 split
- [ ] ABS: exact tables and releases, (state and territory population)
- [ ] Authoritative definitions: "non-collision transport accident", "fixed or stationary object", "Unknown traffic"
- [ ] 2-4 credible sources for the introduction (at least one peer-reviewed), plus domain literature per chapter
- [ ] Decide how the "how do you travel?" choice persists across chapters
- [ ] Decide whether to adopt the claim ladder and wording guardrails
- [ ] Reproduce the key numbers in KNIME and keep screenshots
