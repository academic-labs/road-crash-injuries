# Data workflow — COS30045 (team gicungdc)

> Sources, KNIME processing, exports and validation for the Hospitalised Injury dashboard.
> Compiled by Claude Sonnet 5.5 from the BITRE workbooks + data dictionary, the ABS population
> release, the BITRE 2021 report, the exported CSV headers (csv_headers.md) and coding-plan.md.
> **This file supersedes `data-export-spec.md` and `data-files-guide.md`.** Ignore submission 1/2 drafts.

## §0 How to use this file

**Authority rule.** The actual exported CSV headers (`csv_headers.md`) and `coding-plan.md` §5 win
over anything inherited from the two old docs. This file is the *upstream* truth (how KNIME produces
and validates the data); the coding plan is the *website-facing* contract (how D3 reads it). Where a
column name or grain ever disagrees, the real CSV + coding plan win and this file is corrected.

**Marker legend**
- ✅ re-checked (arithmetic or against a source)
- `[KNIME: …]` node id / config / screenshot needed from the team (configs supplied later)
- `[CONFIRM: …]` a value or choice to verify in KNIME / the dictionary
- `[VERIFY-TEAM: …]` a citation found by search that the team must open and read themselves
- `[FILL]` blank to complete later (title-page-style)

**Locked decisions**
- Road users grouped 12→5; counterparties grouped 10→6 (lookups in §3).
- "All road users" is summed from the 5 groups **in the browser**; only the monthly baseline file
  ships an "All road users" row.
- C5 (2020 range band) and C8 (remoteness gradient) are **core**. **C0 unit chart dropped.**
- First Nations workbook explored but **cut** from the story (kept as reference, §6).
- ABS population: **state/territory only** (no age/sex/remoteness denominators collected).
- Privacy Act **1988** (Cth). d3-sankey approved by tutor as "D3 used directly".
- Rates are **crude**, per 100,000, using ABS **June** ERP (not age-standardised, not midpoint).

---

## §1 Sources and citation blocks

### 1.1 BITRE Hospitalised Injury data (primary)
- Page: **Hospitalised Injury** — Bureau of Infrastructure and Transport Research Economics (BITRE),
  released **22 September 2023**, calendar years **2011–2021**.
  URL: https://www.bitre.gov.au/resource/road-safety/hospitalised-injury  `[VERIFY-TEAM]`
  (The brief's `/publications/ongoing/hospitalised-injury` path is legacy; cite the live page above.)
- Files used (exact names):
  - `hospitalisation_injury_publication_sep2023.xlsx` (national; 5.5 MB)
  - `state-and-territory-hospitalisation-injury-publication-2023.xlsx` (1.69 MB)
  - `First-Nations-hospitalised-injuries-2023.xlsx` (238 KB; explored, cut)
  - `hospitalised-injury-data-dictionary-september-2023.pdf` (389 KB)
- Provenance: produced by the Road Safety Data Hub from AIHW **National Hospital Morbidity Database**
  separations; raw data included in the workbook. `[VERIFY-TEAM: BITRE page + dictionary]`
- Update frequency: **periodic, not strictly annual.** The 2011–2021 series is the Sep 2023 release;
  the Data Hub has since published a 2017–2023 series (release 30 Sep 2026). We use the Sep 2023
  files because they carry the full 2011–2021 raw + summary series and the matching dictionary.
  `[VERIFY-TEAM: datahub.roadsafety.gov.au/reporting/hospitalised-injuries-road-crashes]`
- Licence / enquiries: BITRE data page carries no explicit open licence; the dictionary points to
  www.infrastructure.gov.au/disclaimers. `[VERIFY-TEAM: site-wide licence/enquiry notice]`

### 1.2 Data dictionary (definitions authority)
BITRE (2023). *Hospitalised Injury Data Dictionary — September 2023.*
https://www.bitre.gov.au/sites/default/files/documents/hospitalised-injury-data-dictionary-september-2023.pdf  `[VERIFY-TEAM]`
Used for: scope/exclusions, cause categories, road user + counterparty lists, age at admission,
died-in-care (30 days), remoteness = usual residence, bed-day methodology change, series breaks.

### 1.3 ABS population (denominators)
Australian Bureau of Statistics (2026). *National, state and territory population*, Table 4
("Estimated resident population, states and territories"; download label **"Population – states and
territories"**, file `310104.xlsx`). Reference period **March 2026**, released **17 September 2026**,
accessed **20 November 2026**. Quarterly population by sex, by state and territory, June 1981 onwards.
URL: https://www.abs.gov.au/statistics/people/population/national-state-and-territory-population/mar-2026
File: https://www.abs.gov.au/statistics/people/population/national-state-and-territory-population/mar-2026/310104.xlsx  `[VERIFY-TEAM]`
- States used: **NSW, VIC, QLD, SA, WA, TAS, NT, ACT only.**
- `[CONFIRM: national population = sum of the 8 states (excludes Other Territories), or the ABS
  "Australia" series from 310101.xlsx? national_population.csv has an "Australia" column.]`
- `[KNIME: June-only filter on the quarterly series]`
- Note: all data after 30 June 2021 are subject to revision; estimates rebased on the 2021 Census.
  This is why our rates differ slightly from the 2022 report (see §7.3). ABS website licence
  `[VERIFY-TEAM: CC BY 4.0]`.

### 1.4 Road deaths (context only)
BITRE (2022). *Road trauma Australia 2021 statistical summary*, Table 1.2 (Deaths by road user).
https://www.bitre.gov.au/sites/default/files/documents/road_trauma_2021.pdf  `[VERIFY-TEAM]`
- ✅ 2021 total **1,123**; pedestrian **132**, motorcyclist **235** (includes pillion passengers),
  cyclist **40** → vulnerable deaths **407 = 36.2%** of 1,123. Total includes unknown road user.
- Licence: **CC BY 3.0 Australia**, attribution to the Commonwealth; recommended citation BITRE 2022.
- Hand-entered into KNIME (Table Creator) → `external_deaths_2021.csv` (§7.4).

### 1.5 Classification authority (glossary)
WHO ICD-10 (base classification); hospitals code in **ICD-10-AM** (Australian Modification), editions
6th→11th across 2011–2021 (dictionary). Non-collision (Vx8) "includes: fall or thrown from vehicle
(without antecedent collision); overturning NOS / without collision"; fixed or stationary object = Vx7.
`[VERIFY-TEAM: icd.who.int/browse10 ; classbrowser.nhs.uk/ICD-10-5TH-Edition/vol1/block-v20-v29.htm]`

---

## §2 Global rules (apply to every file)

1. **Raw tab = source of truth; summary tabs = reconciliation only.** Never build a chart from a
   summary tab; use them to check totals (T1–T4).
2. **Never mix granularities.** National = monthly; state/territory = 6-monthly; First Nations =
   6-monthly. Aggregate up to calendar year explicitly; do not join across granularities.
3. **`n.p.` = suppressed, not zero.** Parse to missing; never impute; never sum a suppressed cell as 0.
4. **Blank count cells** (national raw) are a known artefact (§13); handle explicitly, not silently.
5. **Absent combinations = zero** in grouped exports (e.g. pedestrian × "No other vehicle"), but
   suppressed (`n.p.`) ≠ absent.
6. **Label every number** as a count or a rate per 100,000 (crude). No unlabelled numbers in public copy.
7. **Every dataset lives inside the .knwf** (incl. ABS tables + deaths table) — brief requirement.
8. **Annotate every node** (purpose + source). Keep `processed/README.md` in sync with this file.
9. **Exact category strings** from the dictionary (§3); do not paraphrase in the data, only in labels.
10. **Year = separation year; location = hospital, not crash; remoteness/state = usual residence.**
    State these limitations wherever geography or time is discussed. `[VERIFY-TEAM: dictionary + Data Hub]`

---

## §3 Categories and lookups

### 3.1 Standard values (must equal coding-plan.md §5.4)
- `road_user_group` display order: **Car occupants, Motorcyclists, Cyclists, Pedestrians, Other road
  users** (+ "All road users" computed in browser).
- `counterparty_group` display order: **Car, Heavy vehicle, Vulnerable road user, Fixed or stationary
  object, No other vehicle or object involved, Other or unspecified**.
- `remoteness`: **Major cities, Regional, Remote, Other or unknown** (workbook "Missing" → "Other or
  unknown"). `[CONFIRM: relabel applied in national_by_year_remoteness.csv, which uses ABS_remoteness_area]`
- `age_group` order: **0–7, 8–16, 17–25, 26–39, 40–64, 65–74, 75+** (+ "Unknown" row, excluded from charts).
- Selector keys: `roadUser` default `all`; `year` default 2021; `sort` default `rate`.

### 3.2 Road user lookup — `road_user_groups.csv` (12 rows)
Columns: `road_user`, `road_user_group`, `2021_hospitalisations` `[CONFIRM exact names per csv_headers.md]`.
Note: `2021_hospitalisations` starts with a digit → access with bracket notation in JS.

| road_user (dictionary) | road_user_group | 2021 ✅ |
|---|---|---|
| Car driver | Car occupants | 13,327 |
| Car passenger | Car occupants | 4,495 |
| Car unknown position | Car occupants | 717 |
| Motorcyclist | Motorcyclists | 8,883 |
| Pedal cyclist | Cyclists | 8,163 |
| Pedestrian | Pedestrians | 2,334 |
| Heavy transport driver | Other road users | 341 |
| Heavy transport passenger | Other road users | 383 |
| Heavy transport unknown position | Other road users | 56 |
| Pick-up truck or van occupant | Other road users | 36 |
| Bus occupant | Other road users | 169 |
| Other or unknown | Other road users | 601 |

("Not applicable" — the 13th dictionary category — applies to non-transport causes and is excluded.)
✅ Car occupants 18,539; Other road users 1,586; group total 39,505.

### 3.3 Counterparty lookup — `counterparty_groups.csv` (10 rows)
Columns: `counterparty`, `counterparty_group`, `2021_hospitalisations` `[CONFIRM exact names]`.

| counterparty (dictionary) | counterparty_group |
|---|---|
| Car, pick-up truck or van | Car |
| Heavy transport vehicle or bus | Heavy vehicle |
| Pedal cycle | Vulnerable road user |
| Pedestrian or animal | Vulnerable road user |
| 2- or 3-wheeled motor vehicle | Vulnerable road user |
| Fixed or stationary object | Fixed or stationary object |
| Non-collision transport accident | No other vehicle or object involved |
| Other non-motor vehicle | Other or unspecified |
| Train | Other or unspecified |
| Other and unspecified transport accidents | Other or unspecified |

`[CONFIRM: membership + plain-language labels exactly as in the exported lookup CSV.]`
("Not applicable" excluded.) ✅ 2021 group totals: Car 16,192; Heavy 1,020; Vulnerable 1,232;
Fixed 5,596; No-other 10,728; Other 4,737 → 39,505.

### 3.4 "All road users" rule
Computed in the browser by summing the 5 groups. **Only** `national_monthly_2020_baseline.csv` ships
an "All road users" row. Do not add All rows to the road-user, age or counterparty files.

---

## §4 National workbook

### 4.1 Anatomy
`hospitalisation_injury_publication_sep2023.xlsx`. Raw tab ≈ **117,919 rows × 13 cols**; cause
category (a) **Traffic ≈ 86,140 rows**. Columns include year, month, road user, counterparty, age
group, sex, remoteness, count of cases, died cases, bed days. `[KNIME: Excel Reader + column list]`

### 4.2 Recipe (each step `[KNIME: nodes + config]`)
1. Read raw tab; keep cause category **(a) Road vehicle traffic accidents (traffic)** only.
   Excludes (b) non-traffic, (c) unknown traffic, (d) other transport, (e) other trauma, (f) medical.
2. Handle blank count cells (§13) and `n.p.` → missing.
3. Derive `hospitalisations = count_of_cases − died_cases` (died-in-care = mode 8, ≤30 days; §13).
4. Month number + month name; calendar year.
5. Join road-user + counterparty lookups (§3) → group columns.
6. Aggregate: by year; year×road_user_group; year×age; year×age×road_user_group;
   month×road_user (2017–2020 baseline + 2020); year×road_user_group×counterparty_group;
   car occupants × counterparty × remoteness; road_user×counterparty detail (original categories).
7. Join ABS June population (§7) → derived national file with rate + index + yoy + break flags.

### 4.3 Checks
| Check | Expected | Evidence |
|---|---|---|
| T1 national total vs summary, each year 2011–2021 | exact match | `[KNIME: screenshot]` |
| T2/T3/T4 (road user / age / remoteness summaries) | match within unknown-row tolerance | `[KNIME]` |
| Traffic row count | ≈86,140 | `[KNIME]` |
| Blank-count rows | 4,578 | `[KNIME]` |
| Died_cases | 194 (2019), 88 (2020), blank (2021) | `[KNIME]` |
| Unknown traffic (cause c, excluded) | ≈5,242 (2011) → ≈5,710 (2021) `[CONFIRM]` | `[KNIME]` |
| Duplicate rows | 0 | `[KNIME]` |
| Small cells (1–2 cases) | ≈60% of Traffic rows | `[KNIME]` |

---

## §5 State/territory workbook

### 5.1 Anatomy
`state-and-territory-hospitalisation-injury-publication-2023.xlsx`. **1,373 rows × 38 cols in 5
blocks** (start columns 0 / 7 / 15 / 23 / 31). 6-monthly granularity. `[KNIME: readers + slice config]`

### 5.2 Recipe `[KNIME: nodes + config per step]`
1. Slice the 5 blocks; promote headers; unpivot to long.
2. `n.p.` → missing (≈185 / 80 cells `[CONFIRM]`).
3. Half-year → calendar year aggregation.
4. Series-break flags: VIC from 2012, NSW from June 2017 (`series_break_flag`, `is_break_year`,
   `series_break_note`).
5. Add `state_code`, `state_name`.
6. Join ABS June state population → `rate_per_100k` (crude).

### 5.3 Checks
| Check | Expected | Evidence |
|---|---|---|
| T1 state totals vs national | gap 470 (2021) / 480 (2011) — unknown sex/age/road user/remoteness (dictionary Data Tables note) | `[KNIME]` |
| Category sums vs T1 | match within unknown tolerance | `[KNIME]` |
| ACT cyclist jump 223 (2020) → 333 (2021) | flagged, **not featured** | `[KNIME]` |
| State rates 2021 | NT 286.1 highest … NSW 111.2 lowest | `[KNIME]` |

---

## §6 First Nations workbook (explored; cut)

`First-Nations-hospitalised-injuries-2023.xlsx` (353 rows × 39 cols). Explored as an alternative
dimension; **cut from the story** on 20 Nov 2026 (scope + AIATSIS Indigenous data-governance
considerations; not collected with the same denominators). Retained as reference / future work.
Key findings kept for the design book's "alternatives considered":
- Duplicate age blocks; 2014 age-block gap (−49 / −2,576) is an `n.p.` artefact, not a real drop.
- Use T1 for totals; "Not stated" Indigenous status 869 (2011) → 530 (2021).
`[KNIME: exploration screenshots]` · Governance: AIATSIS Code of Ethics pp 6–7, 12–13, 15, 18
`[VERIFY-TEAM]`.

---

## §7 Supplementary data

### 7.1 ABS population — recipe `[KNIME: nodes]`
Download `310104.xlsx` → reshape wide→long (state × quarter × sex) → **filter June** → sum sex →
state × year ERP. National = `[CONFIRM: sum of 8 states vs Australia series]`. Keep
`national_population.csv` ("Australia", calendar_year) and `state_population.csv` (state, population,
calendar_year) as **source tables only — not shipped**.

### 7.2 Join + rates
Join June ERP to national + state annual counts → `rate_per_100k = hospitalisations / population ×
100,000` (crude). Other Territories excluded from the national basis `[CONFIRM]`; effect < 0.1 per
100,000 — document as a limitation.

### 7.3 Vintage note (why our rates ≠ the report's)
The 2022 report uses ABS **2022-vintage** June populations (2021 = 25,738k → rate 153.5) and its
published HI rates use a **custom ABS snapshot (30 June 2021), crude** (dictionary). We use the
**March 2026 release** (revised, 2021-Census-rebased) June ERP → 2021 rate **153.8**. Both are
defensible; record the release used and re-test the reconciliation tolerance (§12). The report's HI
rate series stops at 2018 (Table 2.8), so it is a cross-check only.

### 7.4 Deaths table `[KNIME: Table Creator]`
Hand-enter 2021: total 1,123; pedestrian 132; motorcyclist 235 (includes pillion); cyclist 40.
Annotation: "Source: BITRE Road trauma Australia 2021, Table 1.2 (CC BY 3.0 AU). Verified."
→ `external_deaths_2021.csv`.

---

## §8 Derived measures and formulas

| Measure | Formula | Notes |
|---|---|---|
| hospitalisations | cases − died_cases | died-in-care mode 8, ≤30 days |
| rate_per_100k | hosp / June ERP × 100,000 | crude |
| index_2011 | value / value_2011 × 100 | C3 |
| yoy_pct | (v_t / v_{t−1} − 1) × 100 | tooltips |
| share_within_road_user_group_pct | group hosp / road_user_group_year_total × 100 | C6/C7 |
| share_within_remoteness_pct | cell / remoteness_total × 100 | C8 |
| age65plus | sum(65–74 + 75+) | share of all |
| car_occupants | driver + passenger + unknown position | cars only; vans/utes → Other |
| bed_days_per_case | bed_days / hospitalisations | **within-year only** (methodology change, §13) |
| 2020 baseline band | min/max/mean of 2017–2019 per month×group | C5; value_2019, value_2020 |

Rounding: ≤1 decimal place in data; website formats per coding plan. Counts not adjusted for month length.

---

## §9 Export conventions + file inventory

CSV, UTF-8, snake_case headers; `_pct` = percentage points; `_per_100k` = crude rate; empty cell =
missing (never `n.p.` in exports). **21 files: 16 ship, 5 stay in workflow/raw.**

| File | Grain | Rows | Used by | Ship |
|---|---|---|---|---|
| national_by_year_derived.csv | year | 11 | C1, C2, stats | ✅ |
| national_by_year_road_user_group.csv | year×group | 55 | C3, stats | ✅ |
| national_by_year_age.csv | year×age | 78 | C4 (Everyone), downloads | ✅ |
| national_by_age_road_user_group_year.csv | year×age×group | 386 | C4 | ✅ |
| national_monthly_2020_baseline.csv | month×group | 72 | C5 | ✅ |
| national_by_road_user_counterparty_year.csv | year×group×counterparty | 308 | C6, C7 | ✅ |
| national_car_occupants_counterparty_remoteness.csv | year×remoteness×counterparty | 264 | C8 | ✅ |
| state_by_year_rates.csv | state×year | 88 | C9, C10, stats | ✅ |
| external_deaths_2021.csv | road user | 4 | intro hook, stats | ✅ |
| national_by_road_user_counterparty_year_detail.csv | year×road_user×counterparty (original) | — | table view | ✅ |
| national_monthly_road_user.csv | year×month×road_user | — | downloads | ✅ |
| national_by_year_remoteness.csv | year×remoteness | — | downloads | ✅ |
| national_by_road_user_sex.csv | road_user×sex (no year) | — | downloads | ✅ |
| national_age_65_plus.csv | year | 11 | downloads | ✅ |
| road_user_groups.csv | lookup | 12 | glossary | ✅ |
| counterparty_groups.csv | lookup | 10 | glossary | ✅ |
| national_population.csv | year | 11 | source only | ✗ |
| state_population.csv | state×year | 88 | source only | ✗ |
| superseded_*.csv (×3) | — | — | superseded | ✗ |

`[CONFIRM: row counts for the 4 "—" files against csv_headers.md / KNIME.]`

---

## §10 Per-file export specs

> Full headers live in `csv_headers.md` and `coding-plan.md` §5.2 (verified identical 20 Nov). Below:
> grain, consumers, key columns, recipe pointer, checks. The real CSV is the tie-breaker.

**Chart files**
1. **national_by_year_derived.csv** (11). C1/C2/stats. Key cols: calendar_year, hospitalisations,
   bed_days, population, rate_per_100k, bed_days_per_case, yoy/index helpers, break flags.
   `[CONFIRM: exact helper-column names per csv_headers.md]`. Recipe §4.2/§7. Check: 2011 rate 152.3,
   2016 peak 161.1, 2021 rate 153.8 ✅.
2. **national_by_year_road_user_group.csv** (55 = 11×5). C3/stats. Key cols: calendar_year,
   road_user_group, hospitalisations, bed_days, index_2011 (+ yoy/share helpers). No All row.
   Check: 2021 indices cyclists 151.4, motorcyclists 117.4, car occupants 111.1, pedestrians 84.7 ✅.
3. **national_by_year_age.csv** (78 = 11×7 + 1 Unknown). C4 Everyone column + downloads. Key cols:
   calendar_year, age_group, age_order, hospitalisations, bed_days. Unknown row excluded from charts.
4. **national_by_age_road_user_group_year.csv** (386 = 11×7×5 + 1 Unknown). C4. Key cols:
   calendar_year, age_group, age_order, road_user_group, hospitalisations, share helper.
   Check: Everyone 65+ share 11.4% (2011) → 13.9% (2021) ✅.
5. **national_monthly_2020_baseline.csv** (72 = 12×6 incl All). C5. Cols: month_name, month_num,
   road_user_group, baseline_min, baseline_max, baseline_mean, value_2019, value_2020.
   Check: April cyclists band 619–668, mean 651.3, 2019 = 667, 2020 = 773 (+15.9%) ✅.
6. **national_by_road_user_counterparty_year.csv** (308). C6/C7. Cols: calendar_year, road_user_group,
   counterparty_group, hospitalisations, bed_days, road_user_group_year_total,
   **share_within_road_user_group_pct**. Absent combos omitted (=0). Check: cyclists→No-other 3,705
   (45.4%); pedestrians→Car 2,063 (88.4%); total 39,505 ✅.
7. **national_car_occupants_counterparty_remoteness.csv** (264 = 11×4×6). C8. Cols: calendar_year,
   remoteness, counterparty_group, hospitalisations, **bed_days**, remoteness_total,
   share_within_remoteness_pct. Check: 2021 non-collision share Major cities 8.3%, Regional 24.6%,
   Remote 57.3% (n=602) ✅.
8. **state_by_year_rates.csv** (88 = 8×11). C9/C10/stats. Cols: state_code, state_name, calendar_year,
   hospitalisations, population, rate_per_100k, bed_days, series_break_flag, is_break_year,
   series_break_note (order differs from plan; read by name). Check: 2021 NT 286.1 … NSW 111.2;
   2011 NT 197.2 … TAS 96.4 ✅.
9. **external_deaths_2021.csv** (4). Cols: road_user, deaths, includes_pillion, source, note.
   Values §7.4 ✅.

**Table / glossary files**
10. **national_by_road_user_counterparty_year_detail.csv** — **7 cols**: calendar_year, road_user,
    counterparty, hospitalisations, bed_days, road_user_year_total, share_within_road_user_pct
    (original 12×10 categories; table view). `[KNIME: aggregation node]`
11. **national_monthly_road_user.csv** — calendar_year, month, month_num, year_month, road_user,
    hospitalisations, monthly_total, monthly_road_user_share_pct.
12. **national_by_year_remoteness.csv** — calendar_year, **ABS_remoteness_area**, hospitalisations,
    bed_days. `[CONFIRM: label values; "Missing" relabelled?]`
13. **national_by_road_user_sex.csv** — sex, road_user, hospitalisations, bed_days, road_user_total,
    sex_share_within_road_user_pct. **No year column.** `[CONFIRM: pooled 2011–2021 or single year?
    The about-data downloads table must describe the grain correctly.]`
14. **national_age_65_plus.csv** — calendar_year, hospitalisations_65_plus, bed_days_65_plus.
15. **road_user_groups.csv** / 16. **counterparty_groups.csv** — §3.

**Not shipped:** national_population.csv, state_population.csv (source tables), 3× superseded_*.csv.

---

## §11 Browser-computed statistics (stats.js — no key_stats.csv)

| stat_id | Formula / source | Expected ✅ |
|---|---|---|
| hosp_2011 / hosp_2021 | derived file | 34,033 / 39,505 |
| hosp_change_pct | (39505/34033−1)×100 | 16.1 |
| rate_2011 / rate_2021 | derived file | 152.3 / 153.8 |
| rate_change_pct | (153.8/152.3−1)×100 | 1.0 |
| population_change_pct | ERP 2021/2011 | 15.0 |
| peak_year / peak_rate | max rate | 2016 / 161.1 |
| deaths_2021 / hosp_per_death | deaths file; 39505/1123 | 1,123 / 35.2 |
| vulnerable_deaths_2021 / share | 132+235+40; /1123 | 407 / 36.2 |
| vulnerable_hosp_2021 / share | ped+moto+cyc; /39505 | 19,380 / 49.1 |
| vulnerable_hosp_share_2011 | same, 2011 | 46.2 |
| cyclists_change_pct | 8163/5391 | 51.4 |
| pedestrians_change_pct | 2334/2754 | −15.3 |
| motorcyclists_change_pct | 8883/7566 | 17.4 |
| car_occupants_change_pct | 18539/16687 | 11.1 |
| age65plus_2011 / 2021 / change | 3874→5476 | 41.4 |
| age65plus_share_2011 / 2021 | /all | 11.4 / 13.9 |
| cyclists65plus_2011 / 2021 | 327→1034 | share 6.1→12.7 |
| apr2020_pedestrians_change_pct | 106/264 | −59.8 |
| apr2020_cyclists_change_pct | 773/667 | 15.9 |
| apr2020_all_change_pct | 2357/3488 | −32.4 |
| cyclists_no_other_share_2021 | 3705/8163 | 45.4 |
| motorcyclists_no_other_share_2021 | 3759/8883 | 42.3 |
| pedestrians_car_share_2021 | 2063/2334 | 88.4 |
| car_noncollision_share by remoteness | C8 file | 8.3 / 24.6 / 57.3 |
| state_highest/lowest_rate_2021 | state file | NT 286.1 / NSW 111.2 |
| state_highest/lowest_rate_2011 | state file | NT 197.2 / TAS 96.4 |

`[CONFIRM: 2011 motorcyclist 7,566 and car-occupant 16,687 base values against KNIME.]`

---

## §12 Reconciliation checklist (single source)

| # | Check | Expected | Evidence |
|---|---|---|---|
| 1 | National T1 vs summary, all 11 years | exact | `[KNIME]` |
| 2 | National T2/T3/T4 | within unknown tolerance | `[KNIME]` |
| 3 | State T1 vs national | gap 470/480 (unknown rows) | `[KNIME]` |
| 4 | Group sums (road user, counterparty) | 39,505 (2021) | `[KNIME]` |
| 5 | Lookup 2021 totals vs grouped file | match | `[KNIME]` |
| 6 | Counterparty matrix row/col sums | §3.3 totals | `[KNIME]` |
| 7 | Monthly baseline band vs raw 2017–19 | min/max/mean | `[KNIME]` |
| 8 | National rate vs report Table 2.8 (2012–2018) | **re-baseline to March 2026 release**; report values 150.0/151.6/151.4/155.7/161.0/159.9/158.5; tolerance re-test `[CONFIRM]` | `[KNIME]` |
| 9 | Sum of state populations vs national | by construction if national = sum of 8 `[CONFIRM]`; Other Territories excluded | `[KNIME]` |
| 10 | Remote population (2017 ≈493k) | **only if remoteness denominators ever added** (stretch, not collected) | — |
| 11 | Deaths 407/1,123 = 36.2% | ✅ verified vs report Table 1.2 | `[KNIME]` |
| 12 | n.p. never summed as 0 | audit | `[KNIME]` |

---

## §13 Anomalies and how each was handled

- **`n.p.` suppression** → missing, never imputed (rule §2.3).
- **Blank count cells (4,578)** → explicit handling `[KNIME]`.
- **Died_cases** 194 (2019) / 88 (2020) / blank (2021); hospitalisations = cases − died (mode 8, ≤30 days).
- **Bed-day jump (4.06 in 2014 → 5.62 in 2016)** = ACS 2104 rehab-coding change from 1 July 2015 +
  transfer-counting rule (dictionary). → compare bed_days_per_case **within years only**.
- **Series breaks:** VIC from 2012 (ED-only excluded; NISU −5.6% 2012-13, ~−2.8% 2012); NSW from
  June 2017 (ED/urgent-care episodes no longer admissions). Flag + annotate; do not attribute to behaviour.
- **ICD-10-AM edition changes** 6th→11th across the series (dictionary) — minor comparability caveat.
- **Unknown traffic (cause c)** excluded by the Traffic filter; size reported as a scope limitation.
- **Unknown rows** (sex/age/road user/remoteness) → state T1 gap 470/480; "Unknown" age row excluded.
- **ACT cyclist jump** 223→333 — flagged, not featured.
- **Transfer split across months** — bed days may land in a different month than the case (dictionary).
- **Year = separation year; location = hospital not crash; remoteness/state = usual residence.**

---

## §14 Evidence + build order / status

**Evidence to capture for the design book** `[KNIME: screenshots]`: annotated workflow overview;
per-file Statistics/Row Count views; each §12 reconciliation; ABS + deaths tables inside the .knwf;
anomaly examples (n.p., blank cells, 2014 FN block).

**Build order (aligned to coding-plan M0–M7 data dependencies)**
1. Lookups (§3) → 2. National filter/derive (§4) → 3. State slice/flags (§5) → 4. ABS join (§7) →
5. Grouped exports + detail (§10) → 6. Baseline band + car×remoteness → 7. Deaths table →
8. Reconciliation (§12) → 9. processed/README.md sync.
`[KNIME: status per step — configs supplied later; leave open until confirmed.]`

---

## §15 Open items (live only)

- `[CONFIRM]` national population basis (sum of 8 vs Australia series); June-only filter.
- `[CONFIRM]` national_by_road_user_sex.csv grain (no year column).
- `[CONFIRM]` national_by_year_remoteness.csv label values (Missing → Other or unknown?).
- `[CONFIRM]` exact lookup membership/labels + helper-column names vs csv_headers.md.
- `[CONFIRM]` state/territory = usual residence (dictionary wording).
- `[CONFIRM]` rate reconciliation tolerance after re-baselining to March 2026 release.
- `[KNIME]` all node configs + screenshots (supplied later).
- `[VERIFY-TEAM]` open every cited source (§1) before it enters the design book.
- Keep processed/README.md in sync.

---

## Appendix A — Dictionary extract checklist (verified)
Scope: separations ending 1 Jan 2011–31 Dec 2021, ICD-10-AM; standard separations (excludes newborn
unqualified 7.3, organ procurement 9, boarder 10); excludes transfers (mode 1), non-acute statistical
admissions (2), non-acute Z50 rehab; excludes Y40–Y84, Y85–Y89, certain Y37. Principal diagnosis
S00–T98; first recorded external cause (skip U90.0, Y90–Y98). Cause (a) traffic = explicit V-code list
in dictionary Table 1; (c) unknown traffic code list `[VERIFY-TEAM]`. Road user = 13 categories;
counterparty = 11; age at admission; died-in-care mode 8 ≤30 days; remoteness = usual residence
(aggregated); bed-day methodology change 2015-16; rates crude using custom ABS 30 June 2021 snapshot.

## Appendix B — Alternatives considered (for design book)
Counts only (rejected: population growth confounds); published BITRE rates (cross-check only, stop at
2018, custom population); age-standardised rates (not collected; would need age-specific ERP);
per-distance/per-registration rates (no exposure data). Chosen: crude counts + crude June-ERP rates,
with limits stated.

## Appendix C — Old→new map / change log
- data-export-spec.md §1–2 → §3; §3–4 → §9–11; build order → §14; checks → §12.
- data-files-guide.md §0 → §2; §1–3 → §4–6; §4 → App A; §5 → §12; §6 → §14; §7 → §7 + App B; §8 → §14.
- Corrections locked: detail file 7 cols + `..._by_...` name; `share_within_road_user_group_pct`;
  `ABS_remoteness_area`; sex file has no year; `hospitalisations_65_plus`/`bed_days_65_plus`; E2 has
  bed_days; no All rows except monthly baseline; C0 dropped; Privacy Act 1988.