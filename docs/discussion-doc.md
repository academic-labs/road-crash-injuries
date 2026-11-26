# Discussion doc: road crash injuries data story (COS30045)

**Source note:** decisions and verified findings for the project. Restructured 27 Nov 2026 by
Claude Sonnet 5.5 from the 18 Nov version, the 20 Nov scope decisions, the 27 Nov decisions, and a
verification search run (26–27 Nov). Early exploration numbers came from quick checks by three
models — tagged **M1** = GPT-6 Instant, **M2** = Qwen-4-Max-Preview, **C** = Claude Sonnet 5.5
(re-check) — whose separate exploration notes are superseded and consolidated here. Verify every
number in KNIME before it enters the Design Book.

**Related documents:** `data-workflow.md` (sources, KNIME processing, exports, checks — supersedes
the old export spec and data guide), `coding-plan.md` (architecture and data contract),
`design-book-working-draft.md` (Design Book sections 1–3 + Part B).

**Ground rule from the brief:** the BITRE Power BI dashboard is "contextual reference only";
replication of its design or purpose is neither required nor encouraged. We are building a data
story, not a redesigned dashboard. The critique is used for design principles, not as a feature list.

---

## 1. Audience and message (decided)

### 1.1 Decision (18 Nov 2026)
Primary audience: **the general public** (awareness). Secondary: **journalists, researchers and
students** who want a trustworthy place to start their own work.

### 1.2 Options considered

| Audience | What they want to know | What we want them to know | Fit and risks |
|---|---|---|---|
| A. General public (adults who drive, ride, walk) | Is it getting safer? Am I at risk? | Non-fatal injuries are the bulk of the burden; who gets hurt is shifting; counts are not risk | Clearly different from the dashboard's analyst audience; easy to test; needs plain language (reading level 9 or lower) and careful caveats |
| B. Journalists and communicators | A quotable, trustworthy number with context | The same, plus the limitations they must report | Good secondary audience; needs `about-data`, per-chart tables and downloads |
| C. Council, state or advocacy staff | Where and who? What changed? | Rates versus counts; series breaks | Not selected: this is the dashboard's audience, so it invites replication |
| D. One road-user group (e.g. riders and cyclists) | How do people like me get hurt? | Crashes with no other vehicle dominate | Compelling but narrow; survives as the "how do you travel?" lens inside A |

### 1.3 Design implications
- Plain language (reading level 9 or lower) for public-facing text; one short takeaway per chart.
- A personal way in: "how do you travel?" — as a per-chapter guided choice, not a global filter.
- For secondary users: an `about-data` page, a table view and download for every chart, stated limits.
- Every control answers a question the chapter raises, shows its state ("Showing: …"), and resets.

### 1.4 One-sentence message (working)
Many more people are hurt on Australian roads than killed, who is hurt is changing, and where you
live changes the rate, so totals alone do not show how safe roads are.

---

## 2. Verified findings and story beats

**Tags:** ✅ re-verified by C against the raw sheets, published tabs or the dictionary · ⚠️ check
before use · 💡 idea or hypothesis, not a data claim · `[VERIFY-TEAM]` a citation found by search
that the team must open and read · `[CONFIRM]` to confirm in KNIME.

### 2.1 Beats

| Beat | What was found | Caveat / status | Chart (final) |
|---|---|---|---|
| Is it getting worse? | ✅ 34,033 (2011) → 39,505 (2021), about +16%; peak 39,866 (2019). Raw Traffic totals match published Table 1 in all 11 years. [M2, C] | Victoria 2012 and NSW June 2017 series breaks; counts, not rates. Headline excludes the `Unknown traffic` cause category (5,710 in 2021; §2.5). | C1 trend line + C2 rate line |
| Who is changing? | ✅ Cyclists +51% (5,391→8,163); pedestrians −15% (2,754→2,334); car drivers +22%; motorcyclists +17%. [M2, C] | Counts only; no exposure data. 💡 e-bikes hypothesis. | C3 indexed lines (2011 = 100) |
| Ageing | ✅ 65+ rose 3,874→5,476 (+41%), 11.4%→13.9% of cases. Among 65+: cyclists 327→1,034, motorcyclists 203→514; 65+ share of cyclist cases 6.1%→12.7%. [M1, M2, C] | Counts, not rates (population also ageing); keep 65–74 and 75+ separate; no causal claims. | C4 age-by-year heatmap |
| 2020 and seasonality | ✅ April 2020 vs April 2019: all −32%, pedestrians −60%, cyclists +16%. Cyclists up on 2019 every month April–December. Normal seasonality stable 2017–19 and 2011–13. [C, M1, M2] | Causes need literature; seasonal explanations are 💡. Counts not adjusted for month length. | C5 2020 range band (2017–19 min–max + 2020 line) — core |
| How do people get hurt? | ✅ Non-collision: 45.4% of cyclist and 42.3% of motorcyclist cases; 88.4% of pedestrian cases involve a car, pick-up or van. Counterparty mix barely moved 2011→2021. [C, M1] | "Non-collision" wording now has an authoritative basis (§2.3). Counterparty is not fault. | C6 Sankey + C7 dot plot |
| Remoteness (where injured people live) | ✅ 2021: Major Cities 26,355 (66.7%), Regional 11,407 (28.9%), Remote 1,114 (2.8%), unknown 629. Car occupants only: non-collision 8.3% / 24.6% / 57.3% (Remote, n=602). [M2; car-occupant comparison by C] | Residence, not crash location; shares, not rates (remoteness population not collected); Remote has few cases. | C8 remoteness dot plot — core |
| Severity (bed days) | ✅ 2021 pedestrians: 5.9% of cases, 11.4% of bed days (9.7 per case vs cyclists 3.3, motorcyclists 5.6, car drivers 4.6). [M2, C] | Within-year only: the jump 4.06 (2014)→5.62 (2016) is the 1 July 2015 ACS 2104 rehab-coding change + transfer counting (§2.3). | Not selected; caveats + future work |
| Sex | ✅ Male share 65.6% (2011), 65.3% (2021); motorcyclists 88.8% male, cyclists 78.7%. [M1, M2, C] | Counts, not rates; third sex category tiny. | Not selected as a chart; mentioned in text/tooltips |
| Where? (states) | ✅ 2011→2021 counts: Qld +65%, Tas +63%, NT +56%, ACT +38%, Vic +19%, SA +12%, WA +4%, NSW −15%. The 470/480 gap = residence unrecorded or migratory/offshore (state Table 1 footnote c). 2021 rates: NT 286.1 highest … NSW 111.2 lowest. [M1, C] | NSW/Vic breaks; rates crude; n.p. cells shrink category sums (ACT 733 vs 740); ACT cyclist jump 223→333 not featured. | C9 tile-grid map + C10 counts/rates dot plots |
| First Nations (cut 20 Nov 2026; kept for the record) | ✅ (Table 1) First Nations 1,167→2,220 (+90%); non-Indigenous 31,997→36,755; not stated 869 (2.6%)→530 (1.3%). 2021 composition differences (pedestrians 10.6% vs 5.7%; remote residence 23.0% vs 1.7%). [M2, C] | Trend partly reflects better identification; use Table 1 for totals (the 2014 age block loses ~2,600 cases to n.p.); counts, not rates; respectful framing; AIATSIS Code applies. | Cut — future work |
| Kids lens | ✅ 2021 ages 8–16: cyclists 1,250 (44% of 2,863); motorcyclists 575 (88% male). [M2, C] | ⚠️ 8–16 includes 16-year-olds; pillion coding; licensing ages unchecked. | Not selected |

### 2.2 Newly verified (26–27 Nov 2026, search run) `[VERIFY-TEAM: open each source before citing]`
- **Definitions (dictionary, September 2023):** cause categories are (a) traffic / (b) non-traffic /
  (c) unknown traffic / (d) other transport / (e) other trauma / (f) medical; we use (a). Road user
  (13 categories incl. "Not applicable") and counterparty (11) lists confirmed. Age = at admission.
  Died in care = separation mode 8 within 30 days. Remoteness = usual residence, aggregated to
  Major cities / Regional / Remote / Other or unknown. Bed-day methodology change from 2015-16.
  ICD-10-AM editions 6th→11th across the series. Scope: separations 1 Jan 2011–31 Dec 2021 with
  the double-counting exclusions.
- **"Non-collision transport accident" (WHO ICD-10, base of ICD-10-AM):** includes fall or thrown
  from the vehicle without antecedent collision, and overturning without collision. Plain-language
  wording for the site: "no collision with another vehicle, person or object — for example a fall
  or loss of control". "Fixed or stationary object" is the Vx7 category (e.g. roadside objects).
  The exact ICD-10-AM code list for category (c) still `[VERIFY-TEAM]`.
- **Rates method:** BITRE's published rates use a **custom ABS population snapshot (30 June 2021),
  crude** (dictionary). Ours use the **ABS March 2026 release, June ERP** → 2021 rate 153.8 vs
  153.5 on the report's 2022-vintage population (25,738k). Both defensible; the basis is stated in
  `about-data`. Report HI rates stop at 2018 (Table 2.8) → cross-check only.
- **ABS source:** *National, state and territory population*, Table 4 ("Population – states and
  territories", `310104.xlsx`), reference March 2026, released 17 Sep 2026, accessed 20 Nov 2026;
  states/territories only; June values `[CONFIRM in KNIME]`; post-June-2021 data revised,
  2021-Census rebased.
- **BITRE data page:** title "Hospitalised Injury", released 22 Sep 2023; exact source filenames
  confirmed (incl. the dictionary PDF); no licence statement on the page (departmental disclaimer
  applies); the Data Hub has since published 2017–2023 (30 Sep 2026) — we use the Sep 2023 files.
- **Road deaths (report Table 1.2):** 1,123 total; pedestrian 132, motorcyclist 235 (incl. pillion),
  cyclist 40 → 407 = 36.2%. CC BY 3.0 AU, attribute the Commonwealth.
- **Data Hub limitations (carry into `about-data`):** year = year of **separation**, not crash;
  location data = hospital location, not crash location (remoteness/state = usual residence);
  transfers use protocols to limit double counting.
- **VRU wording caution:** the Data Hub's published "vulnerable road user" definition is broader
  (can include children ≤7, the elderly, mobility-device users). Ours is operational: **pedestrians,
  motorcyclists and cyclists** — say so where the term is used.

### 2.3 Corrections and resolved items (from verification)
- First Nations figures: earlier remoteness-block values replaced with published Table 1 values.
- First Nations "2014 spike": artefact of four n.p. cells (Jul–Dec 2014, ages 0–7 and 65+).
- `Died_cases`: 194 (2019), 88 (2020), blank (2021) — unreliable; no mortality story.
- `Unknown traffic`: 5,242 (2011) → 5,710 (2021); cause category (c), excluded (see §2.2).
- Rates denominators: resolved — ABS state/territory ERP joined in KNIME; national and state rates
  exported (`data-workflow.md` §7).
- Resolved earlier: the 470/480 state-to-national gap; national Table 1 matches raw Traffic exactly;
  remoteness = usual residence; age at admission; died-in-care = within 30 days.
- Minor: M2's pedestrian bed-day share 11.5% vs C 11.4%, car-driver case share 33.8% vs 33.7%
  (rounding/denominators).

### 2.4 Data notes that affect every beat
- Filter national raw to cause (a) `Traffic`; matches published Table 1 exactly.
- `Hospitalisations` = Count of cases − Died_cases. The 4,578 blank-count Traffic rows are
  bed-days-only (11,379 bed days in 2021): kept for bed-day sums, add no cases.
- National raw is unsuppressed: ~60% of counted Traffic rows hold 1–2 cases (48,681 of 81,562) —
  aggregate before showing (Five Safes "safe outputs").
- "n.p." cells (state road-user 185, age 80; First Nations road-user 62, age 4): never reconstruct;
  show "suppressed" in table views.
- State and First Nations raw sheets are 6-monthly, five side-by-side blocks; First Nations tables
  merge categories — no 1:1 joins to national categories (details in `data-workflow.md`).
- Remoteness and state describe where people **live**, not where the crash happened; year is the
  year of separation; counterparty is not a statement about fault.
- Rates are crude (not age-standardised, not exposure-adjusted); denominators are ABS June ERP.
- Published totals in some tables differ from Table 1 because of unknown sex/age/road user/
  remoteness; data is subject to revision.
- BITRE's Transport Safety reporting mentions ~36,000 hospitalised injuries for 2022 against our
  39,505 for 2021 — do not mix sources without checking the basis.

---

## 3. Selected plan (decided)

### 3.1 Decisions

| Decision | Outcome | Why / when |
|---|---|---|
| Audiences | Public primary; journalists/researchers/students secondary | 18 Nov |
| ABS population | State/territory ERP only; **joined; national + state rates exported** | Decided 20 Nov; joined 26 Nov (`data-workflow.md` §7) |
| First Nations | Cut; explored; future work | 20 Nov |
| C0 unit chart | **Dropped** | 27 Nov |
| Custom charts | Two: Sankey (C6) and tile-grid map (C9). **d3-sankey approved by tutor** as "D3 used directly" (layout only; drawing/interaction/accessibility ours) | 27 Nov |
| Supporting chart forms | **Dot plots** (C7, C10) instead of sorted bars; C8 reuses the dot plot | Coding plan |
| Beats | C5 range band and C8 remoteness gradient **core**; chapter 2 opens with the vulnerable-road-user statistic (49% vs 36%) | Export decision, adopted |
| Controls | Per chapter; **no state shared between chapters; nothing stored between pages** | 27 Nov (supersedes "carries into chapter 3") |
| Claim ladder + wording guardrails | **Adopted** (coding plan §11.2) | 27 Nov |
| Counts and rates | Both shown and labelled; counts never presented as risk | 18 Nov |
| Map type | Tile-grid map; choropleth documented as alternative (§5) | 18 Nov |

### 3.2 Chapter plan (chart IDs per coding-plan.md)

| # | Chapter | Question | Main chart | Supporting charts (weakness covered) |
|---|---|---|---|---|
| Intro | — | Why does this matter? | Hook statistic (~35 hospitalised per death; 1,123 died / 39,505 hospitalised as text/cards) | — |
| 1 | The hidden toll | How many are hurt, and is it getting worse? | C1 trend line with break annotations | C2 rate line (counts ignore population growth) |
| 2 | Who is getting hurt? | Who is hurt, and how is that changing? | C3 indexed road-user lines with "How do you travel?" + index/counts toggle | C4 age heatmap (an index hides who is affected); C5 2020 range band (annual lines hide within-year timing) |
| 3 | How do people get hurt? | With whom or what? | C6 Sankey (custom), 2021 | C7 counterparty dot plot (a Sankey can't show exact values); C8 remoteness gradient (a Sankey can't show place) |
| 4 | Where you live | Do rates differ by state/territory? | C9 tile-grid map (custom), year selector | C10 counts & rates dot plots, sort toggle (a map can't show exact values or the counts-vs-rates gap) |
| About | About the data | What can the numbers not say? | Glossary, sources, limits, downloads | — |

Chapter pattern (unchanged): one main chart plus at most two supporting charts; every supporting
chart names the weakness it covers; static by default (no cross-filtering); main chart larger/first.

### 3.3 Cut order (from coding-plan.md §13)
If behind: C0 (already dropped) → C10 sort toggle → C5 → C8 → C4.
**Never cut:** C1, C2, C3, C6, C7, C9, table view + download on every chart, `about-data`,
accessibility basics. Freeze features before usability evaluation.

### 3.4 Guided interactions (decided 27 Nov)
- "How do you travel?" is a **per-chapter** radio group (chapters 2 and 3 each own one; default
  Everyone). It does **not** carry between chapters; there is no shared state and no storage.
- Index/counts toggle (ch 2); year slider default 2021 and sort-by toggle default rate (ch 4).
- Every control shows "Showing: …" (`aria-live`), has a reset, and works by keyboard and touch.
- Tooltips on hover **and** focus; table view + CSV download on every chart.
- No filter for every variable (rejected: state explosion, unpredictable cross-filtering, tiny counts).

### 3.5 Rubric alignment (short)
Storytelling (message, chapter questions, takeaways) · Complexity (two custom charts; BITRE
national/state + ABS population + deaths integrated; derived rates; responsive) · Visualisation
design (alternatives documented per chart) · Interaction design (small set of justified controls +
interaction table) · Iteration and validation (test script, accessibility steps, usability round).

### 3.6 Risks
Time (two custom charts) → cut order + early Sankey/tile-map data. Wording → definitions now have
an authoritative basis (§2.2); final public wording still `[VERIFY-TEAM]`. Crude rates → stated on
charts. Small counts → aggregated; Remote n=602 shown with its count.

### 3.7 Scope changes
- **20 Nov 2026:** cut First Nations and Tier 3 charts; freed time → usability, accessibility, polish.
- **27 Nov 2026:** dropped C0; per-chapter controls adopted; C5/C8 confirmed core; dot plots adopted.

---

## 4. Design principles carried over from the critique

- One colour, one meaning; colourblind-safe palette; double-encode (colour + marker/line style + label).
- Label axes and units; mark series breaks with annotations, not line styles.
- Position/length for quantities; sorted/dot views over pies; zero-based count axes.
- Always show what is selected and what it is a share of; a visible "Showing: …" state.
- Counts and rates side by side when both matter ("eyes beat memory").
- Every chart: how-to-read note, table view, download, source/caveat line.
- Keyboard-reachable controls and tooltips; no empty focus stops; no hidden toolbars.
- Aggregate or suppress tiny counts; controls sit directly above the charts they change.
- `about-data` covers exclusions, series breaks, the 2015–17 external-cause caveat, the two-year
  lag, separation-year/hospital-location limits, and counts-vs-rates.

---

## 5. Alternatives considered (outcomes; feeds Design Book)

| Earlier idea | Outcome | Where it went |
|---|---|---|
| Ageing as the spine of "who is changing" | Selected | C4 heatmap |
| Seasonality / 2020 timing | **Core** | C5 range band (2017–19 min–max band + 2020 line) — replaces "two lines 2019 vs 2020" |
| Remoteness and single-vehicle crashes | **Core** | C8 dot plot (shares only; remoteness population not collected) |
| Remoteness/age/sex population (ABS) | Not collected (20 Nov) | Stretch only; rates by state and Australia |
| Severity lens (bed days per case) | Not selected | Caveats; future work |
| First Nations vs non-Indigenous | Cut (20 Nov) | Future work; explored, not used |
| Deaths vs hospitalisations by road user (chart) | Cut as chart | Stays as intro text statistic (1,123 vs 39,505; 36% vs 49%) |
| Year animation on the map | Cut | Static year slider |
| Kids lens | Not selected | Unchecked claims; low fit for time |
| State road-user profiles | Not selected | Table view only (n.p., ACT anomaly) |
| Counterparty over time | Folded in | Sankey (the mix barely changes) |
| Sex profile | Not selected as chart | Tooltips/text |
| Choropleth state map | Considered, not selected | Area bias (WA/NT/Qld dominate; ACT/Tas invisible); boundary file; colour-only; tile grid chosen instead |
| Sorted bars (C7/C10) | Replaced | Dot plots (better accuracy, shared module with C8) |
| C0 unit chart (35 squares vs 1) | **Dropped (27 Nov)** | Intro keeps the text statistic + cards |
| Full filter panel / zoom+brush / play button / linked highlighting | Rejected | State explosion; 11 points to zoom; unnecessary motion; unpredictable response |
| Claim ladder + wording guardrails | **Adopted** | coding-plan.md §11.2 |

Per-chart encoding alternatives (bars vs line vs area vs small multiples; slope charts; 100% stacked;
parallel sets; treemap; proportional symbols) are documented in `design-book-working-draft.md` §3.2.

---

## 6. Verified sources pool `[VERIFY-TEAM: open each before citing]`

| Source | What it supports |
|---|---|
| BITRE (2023). *Hospitalised Injury Data Dictionary — September 2023*. https://www.bitre.gov.au/sites/default/files/documents/hospitalised-injury-data-dictionary-september-2023.pdf | Scope/exclusions; cause categories incl. (c) unknown traffic; road user + counterparty lists; age at admission; died-in-care 30 days; remoteness = usual residence; bed-day 2015-16 change; crude rates on custom ABS 30 June 2021 snapshot; VIC/NSW breaks (−5.6%) |
| BITRE data page "Hospitalised Injury", released 22 Sep 2023. https://www.bitre.gov.au/resource/road-safety/hospitalised-injury | Primary dataset citation; source filenames; no licence statement (departmental disclaimer) |
| BITRE (2022). *Road trauma Australia 2021 statistical summary*. https://www.bitre.gov.au/sites/default/files/documents/road_trauma_2021.pdf | Deaths 1,123; 132/235/40 = 407 (36.2%); 47% vs 36% gap; Table 2.8 rates (stop 2018); Table 4.1/4.3 populations; CC BY 3.0 AU; "in traffic" glossary |
| ABS (2026). *National, state and territory population*, Table 4 (`310104.xlsx`), ref. March 2026, released 17 Sep 2026, accessed 20 Nov 2026. https://www.abs.gov.au/statistics/people/population/national-state-and-territory-population/mar-2026 | Population denominators; revision/rebasing note |
| WHO ICD-10 browser (noncollision Vx8; fixed/stationary object Vx7) + NHS ICD-10 class browser block V20–V29. https://icd.who.int/browse10/2019/en ; https://classbrowser.nhs.uk/ICD-10-5TH-Edition/vol1/block-v20-v29.htm | "Non-collision" includes wording; counterparty category basis |
| National Road Safety Data Hub, "Hospitalised injuries from road crashes" (30 Sep 2026; 2017–2023). https://datahub.roadsafety.gov.au/reporting/hospitalised-injuries-road-crashes | Definitions (hospitalisation, bed days, VRU, rate, remoteness); limitations (separation year; hospital location); VRU-definition nuance |
| Departmental disclaimer. https://www.infrastructure.gov.au/disclaimers | Licence/enquiry fallback for the BITRE data page |

Still to verify by the team: exact ICD-10-AM code list for cause category (c); ABS licence wording;
whether "state" is explicitly usual residence in the dictionary's exact wording `[CONFIRM]`.

---

## 7. Open items (live only)

- `[VERIFY-TEAM]` Open every source in §6 before it enters the Design Book references.
- `[CONFIRM]` KNIME: June-only ABS filter; national population basis (sum of 8 states vs Australia
  series); sex-file grain; remoteness label values; state = residence wording.
- Literature for Design Book §1.1 (2–4 sources, ≥1 peer-reviewed) + chapter domain literature —
  next stage (search plan in `design-book-working-draft.md` Part B).
- Wireframes, storyboard and chart sketches (Figures 3.1–3.11) redrawn to match coding-plan layout.
- Usability evaluation plan (likely self-testing + lecturer feedback): tasks in user language,
  completion criteria, no interface instructions (unit notes); before/after evidence for §4.
- Reading-level check (≤ grade 9) and contrast check (reddish purple ≈3.0:1 borderline).
- Gen AI declaration format (unit, later); Gen AI log: GPT-6 Instant, Qwen-4-Max-Preview,
  Claude Sonnet 5.5 (and coding assistants) with dates.
- KNIME screenshots + annotated workflow for Design Book §2.2/2.3 (configs to be supplied).
- Keep `processed/README.md` and `reusable-dataviz-checklist.md` in sync.

---

## Appendix: change log (18 Nov → 27 Nov 2026)

- File references: `data-export-spec.md` + `data-files-guide.md` → **`data-workflow.md`**; AI
  exploration filenames removed (models still credited M1/M2/C); old §4 file structure → coding
  plan §3; submission 1/2 drafts ignored.
- Persistence "ch2 → ch3" removed → per-chapter controls, no storage (updates Design Book §3.1/3.3).
- C5/C8: stretch → core; C5 form = range band; C7/C10 = dot plots; C0 dropped.
- Cut order replaced (old: Tier 2 then counterparty bars; new: C10 toggle → C5 → C8 → C4, C7 never cut).
- Rates: ABS joined and exported; vintage explanation added (153.5 vs 153.8).
- Definitions (non-collision, fixed/stationary object, unknown traffic, died-in-care, residence,
  bed-day change) resolved against the dictionary/WHO ICD-10 — all `[VERIFY-TEAM]`.
- New limitations recorded: separation year; hospital location; VRU definition nuance.
- Beat-idea tables (§6.1–6.3 old) compressed into §5 outcomes.