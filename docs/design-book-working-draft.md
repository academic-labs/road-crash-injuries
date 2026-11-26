# Design Book: working draft (COS30045) — team gicungdc

**Status:** full rewrite, 27 Nov 2026, compiled by Claude Sonnet 5.5 from the brief, unit notes,
extra-info, the verified data dictionary / ABS / BITRE sources, the critique, `data-workflow.md`,
`discussion-doc.md` (restructured) and `coding-plan.md`. This file supersedes the 18 Nov draft.
Submission 1/2 drafts are ignored. `coding-plan.md` wins on any technical/data-contract conflict.

**Markers:** ✅ re-checked · `[FILL]` blank to complete later · `[CONFIRM]` verify in KNIME/config ·
`[KNIME: …]` node id/config/screenshot needed · `[VERIFY-TEAM]` a citation the team must open and read
before submission (fake references = overall fail) · `[FIND]` information not yet obtained.

**Conventions:** organisations are written in full every time (no abbreviations). Final submission is
PDF with a word count on the title page. The `.knwf` file and workflow name must include `gicungdc`,
and the file must contain all datasets (including the Australian Bureau of Statistics tables and the
road-deaths table).

---

# Part A — Draft text

## Title page

- **Title:** Beyond the headline: who is hospitalised by road crashes in Australia, 2011–2021 `[CONFIRM]`
- **Team name:** gicungdc
- **Student names and IDs:** `[FILL]`
- **Tutorial day and time:** `[FILL]`
- **Year and semester:** `[FILL]`
- **Word count:** `[FILL: add at the end]`

## Table of contents
`[FILL: generate at the end]`

---

## 1 Introduction

### 1.1 Background and motivation

Injury is a major reason people are admitted to hospital in Australia. The Australian Institute of
Health and Welfare reports that transport is among the leading causes of injury hospitalisation
nationally `[VERIFY-TEAM: open https://www.aihw.gov.au/reports/injury/injury-in-australia/contents/ranked-causes
and insert the exact 2024–25 counts and rates for falls, contact with objects and transport; the
earlier draft's figures (253,800 / 82,283 / 66,890; 244.1 per 100,000) need re-checking against the
live page before use]`. "Transport" covers more than road crashes, so those figures are not directly
comparable with the road-crash data used here.

Road deaths receive most public attention. In 2021, **1,123** people died in road crashes in
Australia (Bureau of Infrastructure and Transport Research Economics, 2022). In the same year
✅ **39,505** people were hospitalised after a road traffic crash (Bureau of Infrastructure and
Transport Research Economics, 2023), about **35 for every death**. The two figures come from
different sources and definitions, so the ratio is an approximate guide. The burden is also uneven:
✅ pedestrians, motorcyclists and cyclists made up **36% of deaths but 49% of hospitalisations** in
2021 (our calculation from Bureau of Infrastructure and Transport Research Economics, 2022, and
2023). The Bureau of Infrastructure and Transport Research Economics (2022) reports a similar gap in
its own analysis (47% of hospitalised injuries against 36% of deaths).

Non-fatal injury is a policy target in its own right. The National Road Safety Strategy 2021–30 aims
for Vision Zero by 2050, with a 50% reduction in fatalities and a **30% reduction in serious
injuries** by 2030 (Infrastructure and Transport Ministers, 2021) `[VERIFY-TEAM: open
https://www.roadsafety.gov.au/sites/default/files/documents/National-Road-Safety-Strategy-2021-30.pdf
and confirm the targets and how "serious injury" is measured]`. Hospitalised injuries are the
available national proxy for that non-fatal burden.

The Bureau of Infrastructure and Transport Research Economics publishes a Power BI dashboard of
these data, which the brief treats as **contextual reference only**. Our critique found that it
serves professional users well but presents annual snapshots with filters, keeps counts and rates on
separate pages, encodes series breaks through legend styles, hides some controls on hover, and shows
very small counts exactly. This project takes a different approach: a **guided data story for the
general public**, built from the Bureau of Infrastructure and Transport Research Economics
hospitalised-injury files and Australian Bureau of Statistics population data, so that counts and
rates can be seen together and the limits are stated up front.

**Target audience**
- **Primary:** the general public (awareness) — adults who drive, ride, cycle or walk. They want to
  know whether roads are getting safer and how this affects people like them. We want them to leave
  knowing that far more people are hurt than killed, that who is hurt is changing, and that where you
  live changes the rate, so totals alone do not show how safe roads are.
- **Secondary:** journalists, researchers and students who want a trustworthy starting point. They
  need a headline number with its limits, plain explanations, and downloadable tables.

**Design consequences:** plain language (reading level 9 or lower) for public pages; a personal way
in ("how do you travel?") as a per-chapter guided choice; an `about-data` page with sources,
definitions and limitations; a table view and download for every chart; accessibility checked
formally.

**Why it matters** `[FIND: 2–4 credible sources, at least one peer-reviewed — see Part B search plan]`
Hospitalisations measure the non-fatal burden that deaths alone do not show (Infrastructure and
Transport Ministers, 2021) `[VERIFY-TEAM]`. Domain context for our chapters is still needed:
`[FIND: older people cycling and riding; road trauma during pandemic restrictions; single-vehicle
crashes by remoteness]`. A candidate peer-reviewed source found in an earlier search result is listed
in Part B but **has not been opened**; do not cite it until verified.

**Key tasks users will perform**
1. See how many people are hospitalised after road crashes, how this changed from 2011 to 2021, and
   what changes when population growth is taken into account.
2. Choose how they travel (in a car, on a motorbike, on a bike, on foot) and see how people like them
   are affected over time and by age.
3. Find out how people are hurt (with whom or what) and how this differs by the area they live in.
4. Compare rates by state and territory.

### 1.2 Visualisation purpose

**Questions users should be able to answer**

| # | Question | Chapter |
|---|---|---|
| Q1 | How many people are hospitalised after road crashes, how has this changed since 2011, and what changes once population growth is considered? | 1. The hidden toll |
| Q2 | Who is being hurt, by how they travel and by age, and how is that changing? | 2. Who is getting hurt? |
| Q3 | How do people get hurt, and does it differ depending on where they live? | 3. How do people get hurt? |
| Q4 | How do hospitalisation rates differ between states and territories? | 4. Where you live |

**Benefits and impact on decision-making**
- For the public: a clear picture of the hidden non-fatal toll and of who is most affected, with the
  limits stated up front, supporting informed conversations about road safety.
- For journalists, researchers and students: a verified starting point with definitions, series
  breaks and quality issues documented, so claims built on it stay within what the data can support.

**Limit stated to every audience:** the files report counts of hospitalisations. Rates per 100,000
people adjust for population size but not for how much people travel, and are **crude** (not
age-standardised), so a difference between groups is not proof that one group is "less safe".

---

## 2 Data

### 2.1 Data source and governance

**Data sources**

| Source | What we use it for | Notes |
|---|---|---|
| Bureau of Infrastructure and Transport Research Economics, *Hospitalised Injury* data (three Excel workbooks: national, state and territory, First Nations; 2011–2021) and *Data dictionary* (September 2023). https://www.bitre.gov.au/resource/road-safety/hospitalised-injury. Released 22 September 2023; accessed 8 October 2026. | Primary dataset: counts of hospitalisations and bed days. The First Nations workbook was explored but is **not used** in the visualisation. | Page title "Hospitalised Injury"; no licence statement on the page (departmental disclaimer applies). `[VERIFY-TEAM]` |
| Australian Institute of Health and Welfare National Hospital Morbidity Database | Original source of the hospital records (custom extract). | Described in the dictionary and Australian Institute of Health and Welfare (n.d.-a). |
| Australian Bureau of Statistics, *National, state and territory population*, Table 4 ("Population – states and territories", `310104.xlsx`). Reference period March 2026, released 17 September 2026, accessed 20 November 2026. https://www.abs.gov.au/statistics/people/population/national-state-and-territory-population/mar-2026 | Denominators for crude rates per 100,000 (state/territory and national). | States/territories only (NSW, VIC, QLD, SA, WA, TAS, NT, ACT). June values `[KNIME: confirm filter]`. National basis `[CONFIRM: sum of 8 states vs Australia series]`. Post-June-2021 data revised; 2021-Census rebased. `[VERIFY-TEAM]` |
| Bureau of Infrastructure and Transport Research Economics, *Road trauma Australia 2021 statistical summary* (2022), Table 1.2. https://www.bitre.gov.au/sites/default/files/documents/road_trauma_2021.pdf | Road deaths for context (1,123 in 2021; deaths by road user). | Creative Commons Attribution 3.0 Australia; attribute the Commonwealth. ✅ verified. |

All supplementary data used in analysis are included in the KNIME workflow.

**Data summary**

| File | Content | Granularity | Size of raw sheet | Period | Update frequency |
|---|---|---|---|---|---|
| National | Hospitalisations, bed days, died-in-care by cause, road user, age, sex, remoteness, counterparty | Monthly | ✅ 117,919 rows × 13 columns (86,140 Traffic rows) | 2011–2021 | Periodic; the 2011–2021 series is the Sep 2023 release. The Road Safety Data Hub has since published 2017–2023 (30 Sep 2026); we use the Sep 2023 files. `[VERIFY-TEAM]` |
| State and territory | Same measures for 8 jurisdictions | 6-monthly | ✅ 1,373 rows × 38 columns in 5 blocks | 2011–2021 | As above |
| First Nations (explored; not used) | First Nations people and non-Indigenous people | 6-monthly | ✅ 353 rows × 39 columns in 5 blocks (two identical age blocks) | 2011–2021 | As above |
| Australian Bureau of Statistics population | Estimated resident population | Annual (June) | `[KNIME: row count]` | 2011–2021 | Quarterly releases |

A "record" in the Bureau of Infrastructure and Transport Research Economics files is an aggregated
count for a combination of categories, not an individual patient. The underlying unit is a hospital
separation (a case).

**Data collection process.** The National Hospital Morbidity Database compiles episode-level records
from admitted-patient data supplied by Australian public and private hospitals (Australian Institute
of Health and Welfare, n.d.-a). The extract keeps separations ending between 1 January 2011 and
31 December 2021, coded in the International Statistical Classification of Diseases and Related
Health Problems, 10th Revision, Australian Modification (editions 6th→11th across the series), and
limits double counting by excluding transfers in, some statistical admissions, rehabilitation-coded
records and complications of care (Bureau of Infrastructure and Transport Research Economics, 2023)
✅ verified against the dictionary.

Road-crash cases are identified by external-cause codes. The published totals use cause category
**(a) Road vehicle traffic accidents (traffic)**. ✅ Our Traffic filter reproduces the published
Table 1 totals exactly in all 11 years. A separate **(c) Unknown traffic** category
(✅ 5,242 in 2011 → 5,710 in 2021) is excluded; the dictionary lists it by code range without a
plain-language definition, so we state the exclusion and do not claim what those cases are
`[VERIFY-TEAM: exact code list for category (c)]`. The Bureau of Infrastructure and Transport
Research Economics (2022) glossary defines a hospitalised injury as a person admitted after a crash
"in traffic", excluding off-road and unknown locations, which fits this exclusion.

"Hospitalisations" are cases minus people who died in hospital within 30 days of admission
(separation mode 8, separation ≤30 days after admission) ✅ verified against the dictionary.

**Data quality assessment**
- **Series breaks:** Victoria (2012) and New South Wales (June 2017) changed admission criteria.
  The dictionary estimates Victoria's change reduced national admissions by **5.6% in 2012–13**
  (~2.8% in 2012); the Bureau of Infrastructure and Transport Research Economics (2022) estimates
  the two changes together reduced admissions by roughly 2–5%. We mark both breaks on time series
  and avoid precise claims across them.
- **Older quality statement:** the most recent Australian Institute of Health and Welfare data
  quality statement for admitted patient care covers **2017–18**; there is none for 2020–21
  (Australian Institute of Health and Welfare, 2019). It notes a Western Australian change between
  2012–13 and 2013–14 and missing external causes for about 80% of injury separations in New South
  Wales private hospitals in 2015–16 and 2016–17. Later-year issues are not documented there; we
  state this limitation.
- **Residence, not crash location:** remoteness is the patient's usual residence, aggregated to
  Major cities / Regional / Remote / Other or unknown ✅ dictionary. State/territory is also
  residence-based `[CONFIRM: exact dictionary wording]`. The Data Hub notes that "year" is the year
  of **separation**, not crash, and location data refer to the **hospital**, not the crash
  `[VERIFY-TEAM]`. This differs from fatality data (by crash location).
- **Bed days:** counting and coding changed from 2015–16 (ACS 2104 rehabilitation coding + transfer
  counting) ✅ dictionary. ✅ Bed days per case rose from 4.06 (2014) to 5.62 (2016). We compare bed
  days **within a year only**.
- **`Died_cases`:** ✅ 194 (2019), 88 (2020), blank (2021) — unreliable; no mortality story.
- **Suppression:** "n.p." cells exist in the state data (road user 185, age 80). ✅ About 60% of
  Traffic rows with a count in the national sheet show only 1–2 cases (48,681 of 81,562), so we
  aggregate before showing small numbers (Five Safes "safe outputs").
- **Counts and rates:** the files report counts. We compute **crude** rates per 100,000 from
  Australian Bureau of Statistics **June** estimated resident population (March 2026 release).
  The Bureau of Infrastructure and Transport Research Economics' published rates use a **custom ABS
  snapshot (30 June 2021)** and stop at 2018 (Table 2.8), so they are a cross-check only. Our 2021
  rate is **153.8**; the report's 2022-vintage population (25,738k) gives 153.5. Both are defensible;
  the basis is stated in `about-data`. `[CONFIRM: re-test the "within 0.3 for 2012–2018" tolerance
  against the March 2026 release in KNIME]`.
- **Timeliness and revision:** the data lag by about two years and are subject to revision
  (dictionary).

**Security, privacy and ethics.** The Australian Institute of Health and Welfare releases data under
the Five Safes framework and states that its collections follow the **Privacy Act 1988 (Cth)** and
the Australian Institute of Health and Welfare Act 1987 (Cth), with each collection approved by the
Australian Institute of Health and Welfare Ethics Committee (Australian Institute of Health and
Welfare, n.d.-b; Desai et al., 2016) `[VERIFY-TEAM]`. (Note: `extra-info.md` contains a "1998"
transcription typo; the correct Act is 1988, confirmed against the Australian Institute of Health
and Welfare privacy policy. We do not edit `extra-info.md`.) The Bureau of Infrastructure and
Transport Research Economics files are aggregated, with small numbers suppressed in summary and
state tables. We make no attempt to identify individuals.

**First Nations data (scope decision, 20 Nov 2026).** The brief includes a First Nations workbook and
we explored it. We decided **not** to include it in the visualisation because of time and because
responsible use needs more care than we could give it. The Code of Ethics for Aboriginal and Torres
Strait Islander Research applies to existing datasets, cautions against assuming non-identifiable
data carries no risk (Australian Institute of Aboriginal and Torres Strait Islander Studies, 2020,
pp. 6–7), and expects engagement and free, prior and informed consent under Principle 1
(pp. 12–13, 15). We did not engage First Nations people or organisations, so we draw no conclusions
about First Nations people here; we note this as a limitation and future work. `[OPTIONAL: Indigenous
data sovereignty, p. 18, if revisited.]`

**Licence:** the dataset page states no licence (accessed 8 Oct 2026); the departmental disclaimer
applies (Department of Infrastructure, Transport, Regional Development, Communications and the
Arts, n.d.). We credit the Bureau of Infrastructure and Transport Research Economics, use the data
for this educational project only, and do not republish the raw files beyond what the project needs.
The 2022 report is CC BY 3.0 Australia (attribute the Commonwealth).

**How the data supports our questions**

| Question | Files and sheets | Columns | Limits |
|---|---|---|---|
| Q1 trend and rate | National raw, T1; Australian Bureau of Statistics national population | calendar_year, hospitalisations (Traffic); population | Series breaks; crude rates |
| Q2 who is changing | National raw, T2, T3 | road_user, age_group, sex | Unequal age bands; counts |
| Q3 how people get hurt | National raw; car occupants × counterparty × remoteness | counterparty, road_user, ABS_remoteness_area | Residence not crash location; category definitions |
| Q4 state rates | State workbook; Australian Bureau of Statistics state/territory population | state, year, cases; population | n.p. cells; merged categories; crude rates; series breaks |

### 2.2 Data processing and analysis

**Key attributes and data types**

| Attribute | Type | Notes |
|---|---|---|
| Calendar year | Interval | 2011–2021 |
| Month / 6-monthly | Ordinal | Month names → numbers; Jan–Jun / Jul–Dec |
| ABS remoteness area | Ordinal | Major Cities, Regional, Remote, Other or unknown |
| Cause of injury | Categorical (nominal) | Six categories; we use Traffic |
| Age group | Ordinal | 0–7, 8–16, 17–25, 26–39, 40–64, 65–74, 75+ (unequal widths); age at admission |
| Sex | Categorical (nominal) | Third category tiny |
| Road user, counterparty | Categorical (nominal) | Grouped via lookups (12→5; 10→6); state file merges some categories |
| State or territory | Categorical (nominal) | 8 jurisdictions |
| Count of cases, Bed days, Died_cases, Hospitalisations | Ratio | Blanks have meaning |
| Australian Bureau of Statistics population (June) | Ratio | By year and geography |
| Road deaths (2022 report) | Ratio | 2021 total and by road user, context only |
| Derived: rate per 100,000, yoy, index (2011=100), shares | Ratio | Denominators recorded for every share and rate |

**Data cleaning**
- Missing values: blank `Died_cases` → 0; blank `Count of cases` rows are bed-days-only
  (✅ 4,578 Traffic rows; 11,379 bed days in 2021) kept for bed-day sums, adding no cases; "n.p." →
  missing, never imputed; "Missing" remoteness → "Other or unknown".
- Duplicates: ✅ no duplicated rows in the national raw sheet (0 exact, 0 duplicate category
  combinations) `[KNIME: confirm]`.
- Filtering: national raw → Traffic; state raw split into five blocks, headers promoted.
- Transformation/derived: month name→number; half-years→calendar years; yoy; index; shares within
  group; 65+ combined; car occupants combined (cars only; vans/utes → Other); series-break flags;
  2017–19 monthly baseline band.
- Joining: Australian Bureau of Statistics June population joined by year and geography; lookups
  joined to raw categories.
- Normalisation: crude rate = hospitalisations ÷ June estimated resident population × 100,000.
- Reconciliation: ✅ national raw vs Table 1 exact; state vs Table 1 gap 470 (2021)/480 (2011)
  explained by residence unrecorded or migratory/offshore.

**Workflow steps and node annotations** `[KNIME: configs supplied later; statuses left open]`

| # | Stage | Typical node(s) | What it does and why | Evidence |
|---|---|---|---|---|
| 1 | National | Excel Reader | Read raw sheet (117,919×13); summary tabs only for checks | `[KNIME]` |
| 2 | National | Row Filter | Keep Cause = Traffic (86,140 rows); exclude Unknown traffic etc. | `[KNIME]` |
| 3 | National | Rule Engine / Missing Value | Blank Died_cases→0; blank case count = bed-days-only | `[KNIME]` |
| 4 | National | String Manipulation | Month→number; year-month key; remoteness relabel; age order | `[KNIME]` |
| 5 | National | GroupBy / Pivoting | Tidy aggregations behind charts | `[KNIME]` |
| 6 | National | Math Formula | Derived: yoy, index, shares, 65+, car occupants, bed_days_per_case | `[KNIME]` |
| 7 | National | Joiner / Table Difference Finder | Reconcile vs T1–T4 | `[KNIME]` |
| 8 | State | Excel Reader ×5 | Read five blocks (start cols 0/7/15/23/31) | `[KNIME]` |
| 9 | State | Column Filter / Rename | Promote headers, drop spacers, consistent names | `[KNIME]` |
| 10 | State | String to Number | "n.p."→missing | `[KNIME]` |
| 11 | State | GroupBy / Rule Engine | Half-years→years; series-break flags | `[KNIME]` |
| 12 | State | Joiner / Table Difference Finder | Reconcile vs state T1; gap 470/480 | `[KNIME]` |
| 13–15 | First Nations (explored; cut) | Excel Reader ×5; Table Difference Finder; GroupBy | Duplicate age blocks; T1 totals; not-stated residual | `[KNIME]` |
| 16 | Exploration | Statistics / Histogram / Line Plot | EDA for §2.3 | `[KNIME]` |
| 17 | Output | CSV Writer | 16 shipped CSVs (see `data-workflow.md` §9–10) | `[KNIME]` |
| 18 | Additional data | Excel Reader / Joiner / Math Formula | ABS June population → rates; deaths Table Creator | `[KNIME]` |

`[KNIME: insert annotated workflow screenshot here. The .knwf (file and workflow name include
gicungdc) must contain all datasets, including the Australian Bureau of Statistics tables and the
deaths table.]`

### 2.3 Data exploration

`[KNIME: insert summary-statistics screenshots (Statistics node), a histogram of counts per row,
line plots of annual totals by road user, a month×road-user heatmap, and age×year tables.]`

Verified early observations (full list in `discussion-doc.md`):
- ✅ Hospitalisations rose from 34,033 (2011) to 39,505 (2021), about +16%, peak 39,866 (2019);
  the crude rate rose only ~1% (152.3 → 153.8), so most of the rise reflects population growth.
- ✅ Cyclists +51%, pedestrians −15%; ages 65+ +41%, with 65+ cyclists roughly tripling (counts, not rates).
- ✅ April 2020 vs April 2019: all −32%, pedestrians −60%, cyclists +16%.
- ✅ 45% of cyclist and 42% of motorcyclist cases are "non-collision" (no collision with another
  vehicle, person or object — for example a fall or loss of control; WHO ICD-10 includes wording
  verified) `[VERIFY-TEAM]`.
- ✅ Among car occupants, non-collision share rises 8.3% (Major Cities) → 24.6% (Regional) →
  57.3% (Remote, n=602).
- ✅ State rates differ from counts: 2021 NT 286.1 highest … NSW 111.2 lowest, while NSW has the
  third-most cases.

**Challenges:** unequal age bands; suppressed cells; series breaks; merged categories; Australian
Bureau of Statistics denominators that differ slightly from the Bureau of Infrastructure and
Transport Research Economics' custom snapshot; the bed-day methodology change; and the
separation-year / hospital-location limitations.

---

## 3 Visualisation Design

### 3.1 Website Design

**Navigation structure.** Six pages: an introduction, four chapter pages in story order, and an
`about-data` page. A sticky header on every page shows the site title, links to the four chapters
with a "Chapter n of 4" progress marker, and a link to `about-data`. A "skip to content" link comes
first for keyboard users. Each chapter ends with previous/next links; the next link states the
question the next chapter answers. Page files are `chapter-1.html` … `chapter-4.html` (stable names)
with descriptive `<title>` and `<h1>`.

| Page | Purpose | Main content | Main audience |
|---|---|---|---|
| Introduction | Hook the reader; how to read the site | "About 35 hospitalised for every death" statistic; one-sentence message; who this is for; three reading tips; Start button | General public |
| 1. The hidden toll | How many are hurt, and is it getting worse? | C1 national trend line with break annotations; C2 rate line | General public |
| 2. Who is getting hurt? | Who is hurt, and how is that changing? | "How do you travel?" choice; C3 indexed road-user lines; C4 age heatmap; C5 2020 range band | General public |
| 3. How do people get hurt? | With whom or what? | C6 Sankey (custom); C7 counterparty dot plot; C8 remoteness gradient dot plot | General public |
| 4. Where you live | Do rates differ by state/territory? | C9 tile-grid map (custom); C10 counts & rates dot plots | General public |
| About the data | Sources, governance, limits, glossary | Sources, series breaks, definitions, how rates are calculated, downloads | Journalists, researchers, students |

**Wireframes.** All chapter pages share one template. Controls sit directly above the charts they
change (a sticky controls bar under the header), responding to the critique's finding that a header
and filter bar used a third of the page and controls were far from the charts.

```
CHAPTER PAGE TEMPLATE
+--------------------------------------------------------------+
| Header (sticky): title | Intro | 1 | 2 | 3 | 4 | About         |
| Chapter 2 of 4                                               |
+--------------------------------------------------------------+
| Controls (sticky): How do you travel? (o Everyone o Car ...)   |
| Showing: Cyclists, index 2011 = 100                 [Reset]    |
+--------------------------------------------------------------+
| H1: Who is getting hurt?                                     |
| Takeaway: one plain-language sentence                        |
+--------------------------------------------------------------+
| MAIN CHART CARD (largest, first)                             |
|  Title | takeaway | [How to read this chart >]               |
|  [ chart ................................................ ]  |
|  Legend | [View as table] [Download CSV] | Source | Caveat    |
+------------------------------+-------------------------------+
| SUPPORTING CHART CARD A      | SUPPORTING CHART CARD B       |
|  "What this adds: ..."       |  "What this adds: ..."        |
+------------------------------+-------------------------------+
| What to take away: 2–3 short bullets                         |
| < Previous chapter                  Next: [question] >       |
+--------------------------------------------------------------+
```

`[FILL: Figure 3.1 — wireframes of introduction, chapter and about-data pages (Figma/Miro/PowerPoint
or hand-drawn); Figure 3.2 — storyboard frames. Tool and owner: [FILL].]`

**Storyboard**

| Frame | User goal | What they see | What they do | What they learn |
|---|---|---|---|---|
| 1. Introduction | Decide whether this is for me | Hook statistic; one-sentence message | Reads, selects Start | Far more people are hospitalised than killed |
| 2. The hidden toll | See how big / how fast | C1 line with 2012/2017 break markers; C2 rate line | Hovers/focuses a year | Counts rose ~16%; the rate view shows population growth matters |
| 3. Who is getting hurt? | Find "people like me" | "How do you travel?" choice; C3 indexed lines | Selects "On a bike" | Cyclist hospitalisations rose ~51%; C4 shows older riders growing; C5 shows the 2020 timing |
| 4. How do people get hurt? | Understand what they are hurt by | C6 Sankey; this chapter's **own** selector | Selects a group; focuses a flow; checks C7 dot plot | Many cyclist/motorcyclist cases are non-collision; C8 shows the remoteness gradient |
| 5. Where you live | Compare places | C9 tile map of rates | Changes year; sorts C10 by count then rate | Counts and rates rank differently |
| 6. Wrap-up | Remember main points | "What to take away" bullets | Selects About the data | Where numbers come from and what they cannot say |
| 7. About the data | Find a quotable number with limits | Sources, glossary, limits | Opens a table view; downloads CSV | How to use the data responsibly |

**Transitions.** Between pages, a one-sentence bridge links the question just answered to the next.
The "how do you travel?" choice is **per chapter** and does **not** carry between pages; there is no
shared state and nothing is stored between pages. Within pages, charts draw in on first scroll and
change smoothly (~300 ms) when a selection changes. All animation is off when the device asks to
reduce motion.

**Responsive layout.** Content width capped ~1100 px on wide screens; supporting charts side by side
≥768 px, stacked below. The Sankey is replaced by the C7 dot plot below 640 px. C10 panels stack on
narrow screens `[CONFIRM: coding plan says <640 px in §7 but <768 px in §10 — pick one]`. No
horizontal scrolling at 320 px `[CONFIRM: coding plan §2 says phone widths from 360 px; WCAG 1.4.10
reflow target is 320 px]`. Tap targets ≥44 px. Charts redraw to container width (debounced
ResizeObserver), not scaled via viewBox, so text never shrinks below 12 px.

### 3.2 Visualisation Design

**Approach.** We choose marks and channels by how accurately people read them (Munzner, 2014,
Ch. 5), prefer position and length for quantities, and avoid decoration that carries no data
(Tufte, 2001, pp. 91–105). Each chapter has one main chart and at most two supporting charts; each
supporting chart names the weakness of the main chart it covers.

| Chapter | Chart | Type | Weakness it covers | Priority |
|---|---|---|---|---|
| 1 | C1 National trend | Line | Main chart | Core |
| 1 | C2 Rate per 100,000 | Line | Counts ignore population growth | Core |
| 2 | C3 Road-user index | Indexed lines | Main chart | Core |
| 2 | C4 Age by year | Heatmap | An index hides who is affected | Core |
| 2 | C5 2020 range band | Band + line | Annual lines hide within-year timing | **Core** |
| 3 | C6 Road user → counterparty | Sankey (custom) | Main chart | Core |
| 3 | C7 Counterparties for one road user | Dot plot | A Sankey cannot show exact values | Core |
| 3 | C8 No-other-party share by remoteness | Dot plot | A Sankey cannot show place | **Core** |
| 4 | C9 Rate by state/territory | Tile-grid map (custom) | Main chart | Core |
| 4 | C10 Counts and rates by state | Two dot plots | A map cannot show exact values or the counts-vs-rates gap | Core |

(C0 unit chart **dropped**, 27 Nov 2026; the introduction keeps the text statistic and cards.)

**Chart-by-chart design**

- **C1 national trend line.** Task: see change 2011–2021 and where breaks fall. Marks/channels: line
  with circle markers; position for year (x) and count (y); dashed vertical rules at 2012 and 2017
  with text labels; direct labels at 2011, 2019 (peak), 2021. Why: a line is the standard idiom for
  an ordered time series; position on a common scale is the most accurate channel (Munzner, 2014).
  Alternatives: bar (implies separate years, harder to mark breaks); area (adds ink); sparkline (too
  small to annotate). Integrity: y starts at 0 (Tufte, 2001, pp. 53–76). Accept: 2011=34,033;
  2019=39,866; 2021=39,505.
- **C2 rate line.** Same idiom, same x scale/margins as C1 so they align; y from 0; axis title
  "Hospitalisations per 100,000 people (crude rate)". Alternative: dual axes (rejected — can suggest
  relationships not in the data). Accept: 2011=152.3; 2016=161.1 (highest); 2021=153.8.
- **C3 indexed road-user lines.** Task: compare groups of very different size. One line per group;
  position for year and index (2011=100); hue + marker + line style per group; end labels; reference
  line at 100. Selected group bold, others muted (0.35); "Everyone" shows all lines normal with the
  All line bold. Index/counts toggle on the same chart; tooltips give both. Alternatives: raw counts
  (small groups look flat); slope chart (hides 2020 dip/breaks); small multiples (harder cross-group
  comparison); stacked areas (composition, not change). Accept 2021 indices: Cyclists 151.4,
  Motorcyclists 117.4, Car occupants 111.1, Pedestrians 84.7, All 116.1. "Other road users" is not
  drawn (small counts) but appears in totals and the Sankey.
- **C4 age-by-year heatmap.** Rectangles; x=year, y=seven age groups (0–7 top); single-hue sequential
  colour for share; percentage printed when cell ≥30 px; callout "Aged 65 and over: X% in 2011, Y%
  in 2021"; note "Age groups have different widths". Alternatives: 100% stacked area (exact values
  hard); seven lines (clutter); paired bars (loses the path). Weakness: colour is imprecise and
  shares hide size → printed values + tooltips with counts. Accept: Everyone 65+ 11.4%→13.9%;
  Cyclists 65+ 327→1,034 (6.1%→12.7%).
- **C5 2020 range band.** x=month; shaded band = 2017–19 min–max ("Usual range, 2017 to 2019"); thin
  dashed mean; bold 2020 line with markers; y from 0, rescaled per selection; April annotation
  "April 2020: X% compared with April 2019"; ring markers where 2020 is outside the band. Caption
  says the data cannot show why (claim ladder). Alternatives: two lines 2019 vs 2020 (replaced —
  the band shows the normal range); month×road-user heatmap (busier). Accept: April Pedestrians
  range 227–264, 2020=106 (−59.8%); April Cyclists range 619–668, 2020=773 (+15.9%); April All
  3,364–3,488, 2020=2,357 (−32.4%).
- **C6 Sankey (custom).** Node rectangles + curved links; link width = hospitalisations; hue = road
  user; left/right position for the two categories. Ten counterparty categories grouped into six
  plain-language groups; table view keeps originals. Layout by the official d3-sankey module
  (**tutor-approved as "D3 used directly"**); drawing, interaction and accessibility written by us.
  Alternatives: 100% stacked bars (kept as C7); parallel sets/chord (harder for general audience);
  treemap (hides the link). Weakness: link widths hard to compare exactly; small flows clutter →
  C7 + table give exact values; tiny flows grouped. Below 640 px, replaced by C7 with a message.
  Accept: link values equal the matrix (Cyclists→No-other 3,705; Pedestrians→Car 2,063); sum 39,505.
- **C7 counterparty dot plot.** Six rows sorted by share; x = percentage (0 to max rounded up);
  filled dot for the selected group, leader line, value labels; hollow grey "Everyone" reference dot
  when a named group is selected. Always shows all six rows including zeros. Gives exact values the
  Sankey cannot. Accept: Cyclists No-other 45.4%, Car 19.3%, Other 22.8%; Pedestrians Car 88.4%.
- **C8 remoteness gradient dot plot.** Reuses dot-plot.js; three rows Major Cities / Regional /
  Remote; x = share 0–100; case count printed in each row label ("Remote (602 cases)"); Other or
  unknown in a footnote. Caveat: where people live, not where the crash happened; Remote has few
  cases. Accept: 8.3% / 24.6% / 57.3% (n=602).
- **C9 tile-grid map (custom).** Eight equal squares approximating geography; single-hue sequential
  colour for rate with a **fixed domain across all years** so colours are comparable when the year
  changes; state code + rate printed; "break" badge where series_break_flag=1; stepped legend with
  unit. Native range slider for year (default 2021). Alternatives: choropleth (area bias — WA/NT/QLD
  dominate, ACT/Tas invisible; colour-only; needs boundary file); sorted dot plot (used as C10);
  proportional symbols (encode counts, not rates). Weakness: less geographic, colour imprecise →
  printed values + C10. Accept 2021: NT 286.1 … NSW 111.2; 2011: NT 197.2 … TAS 96.4.
- **C10 counts & rates dot plots.** Two aligned panels (count left, rate right), same state order;
  "Sort by: rate | count" toggle (default rate); rows keyed by state_code so they move smoothly.
  Shows directly that count order differs from rate order. Accept 2021 by rate: NT, QLD, VIC, ACT,
  SA, TAS, WA, NSW; by count: VIC, QLD, NSW, WA, SA, TAS, ACT, NT.

`[FILL: Figures 3.3–3.10 — sketches of each chart; Figure 3.11 — annotated sketch of one chart with
its tooltip.]`

**Graphical integrity.** Bars and count axes start at zero; indexed charts show the baseline year
and reference line at 100; related charts share horizontal scales; every axis has a label and units;
every chart says whether it shows counts, shares or rates; series breaks are annotations, not line
styles; shares always state their denominator; very small counts are combined or suppressed;
captions describe what the data show and avoid causes (claim ladder: observed → interpreted, hedged
→ unanswered).

**Accessibility.** Graphic colours ≥3:1 contrast on white (WCAG 2.1 SC 1.4.11); no meaning by colour
alone (1.4.1) — road users also differ by marker, line style and direct label. Chart text ≥12 px,
other text ≥16 px; text contrast ≥4.5:1 (1.4.3); public text reading level ≤9. Every SVG has
`role="img"` with `<title>` and `<desc>`; every chart has a table view and CSV download. Everything
keyboard-reachable with a visible focus ring ≥3 px (2.1.1, 2.4.7); tooltips on hover **and** focus,
dismissible with Escape (1.4.13). Motion off for reduced motion. Layouts reflow to one column
without sideways scrolling (1.4.10); respects browser text size. (The cited SC numbers are correct.)

**Colour, labelling and layout decisions**

| Meaning | Colour token | Why |
|---|---|---|
| Car occupants | #0072B2 (blue) | Colour-blind-safe set; same group on every chart |
| Motorcyclists | #D55E00 (vermillion) | As above |
| Cyclists | #009E73 (bluish green) | As above |
| Pedestrians | #CC79A7 (reddish purple) | Chosen over the set's orange (<3:1 on white); ≈3.0:1 borderline — check |
| Other road users | #6B6B6B | Distinct from "All" |
| All road users | #222222 | Dark dashed reference |
| Series-break rules | #767676 | Visible but not competing |
| Sequential scale | d3.interpolateBlues, 0.15–0.9 | Darker = more; works in greyscale |
| Focus ring | #0B5FFF | ≥3 px |

One colour, one meaning across the site. Labels sit next to the data (end labels, values in tiles
and cells); titles say what is shown, e.g. "Hospitalisations per 100,000 people, 2021".
`[VERIFY-TEAM: palette reference — Okabe, M., & Ito, K. (2008). Color Universal Design (CUD).
https://jfly.uni-koeln.de/color/ — open and confirm; run each colour through a contrast checker.]`

**Annotations and tooltips**

| Chart | Annotation | Purpose |
|---|---|---|
| C1/C2 | Labelled dashed rules at 2012/2017; label at 2020 | Warn about comparisons across breaks |
| C3 | Reference line at 100; end labels with % change | Direction and size without legend lookup |
| C4 | Callout for 65+ share 2011/2021 | Ageing pattern |
| C5 | April change label; out-of-band rings | 2020 timing |
| C6 | Callout on "No other vehicle, person or object" | Surprising finding |
| C9 | Break badges; stepped legend | Prevent over-reading across breaks |

Tooltips follow one pattern: item name, value (count and, where relevant, share/rate), short note
(e.g. "series break"). They open on hover, focus or tap and close with Escape.

### 3.3 Interaction Design

**Approach.** Interactions support both explanation and exploration. The default state of every
chapter tells its story without interaction; a small number of purposeful controls let readers
explore selected dimensions. We do not offer a filter for every variable (the critique found many
controls, unpredictable cross-filtering and hidden toolbars made it hard to tell what was shown).
Each control answers a question the chapter raises, shows its state ("Showing: …"), responds
predictably and can be reset. **Each chapter owns its controls and state; chapters do not share
state; nothing is stored between pages.**

**Table of interactions**

| # | Interaction | Where | Method | Expected user behaviour | System response | Purpose |
|---|---|---|---|---|---|---|
| 1 | "How do you travel?" choice | Chapters 2 and 3 (each its own) | Click/tap; arrow keys within group | Picks one group or Everyone | C3 highlight/measure, C4/C5 data (ch2); C6 emphasis, C7 data (ch3); "Showing: …" updates; **does not persist to other pages** | Personal relevance; guided exploration |
| 2 | Index/counts toggle | Ch2 main | Click/tap/keyboard | Switches measure | Values and axis label change (~300 ms) | Covers hidden size of an index |
| 3 | Details on hover/focus | All charts | Hover, focus, tap | Moves over/focuses a mark | Tooltip with exact values and notes; Escape closes | Details on demand |
| 4 | Highlight | Lines, Sankey | Hover/focus | Moves over a line/flow | Item + label emphasised, rest muted | Focus without losing context |
| 5 | Year selector | Ch4 | Native range slider; arrow keys | Chooses year (default 2021) | C9 colours/values update; C10 updates; break badges appear | See change without animation |
| 6 | Sort by count/rate | Ch4 C10 | Click/tap/keyboard | Chooses sort (default rate) | Rows reorder smoothly | Counts and rates rank differently |
| 7 | View as table | Every chart | Button | Switches to table | Chart replaced by accessible table; focus moves there; "Back to chart" returns | Exact values; accessibility |
| 8 | Download CSV | Every chart | Button/link | Downloads data | CSV downloads | Secondary audience |
| 9 | How to read this chart | Every chart | Disclosure | Expands note | Note opens in place | Understandability |
| 10 | Reset | Chapters with controls | Button | Restores defaults | Controls return to defaults | Error tolerance; visible state |
| 11 | Chapter navigation | All pages | Links, keyboard | Moves to next/previous | Page changes; **road-user choice does not persist** | Narrative flow |
| 12 | Reduced motion | All pages | Device setting | None | Animations off | Accessibility |

**Keyboard model.** Tab reaches skip link, header links, chapter controls, then each chart (one
stop), then the chart's buttons. Line/band charts: Left/Right move year/month, Up/Down change series
(C3), Home/End jump, Escape closes tooltip; each move updates the tooltip and announces a sentence.
Heatmap: arrows move between cells. Sankey: Tab visits the eleven nodes; Enter/focus highlights
connected links. Dot plots/tile map: arrows move between rows/tiles in visual order.

**Alternatives considered.** Full filter panel (rejected: state explosion, unpredictable results,
tiny counts); zoom/brush on time axis (rejected: only 11 points); animated play button (left out for
time and to avoid unnecessary motion); linked highlighting across all charts (limited to the single
per-chapter choice).

**How interaction supports or hinders the story.** Controls can hinder when state is hidden, when
they change charts the reader did not expect, or when information is hover-only. We reduce these
risks with one visible choice per chapter, a "Showing: …" live region, a reset, keyboard/touch
alternatives to hover, and a table view of every chart. We will test these in the usability
evaluation (§4.2).

---

## 4 Iteration and Validation

### 4.1 Testing and refinements

`[FILL: this section records what actually happened; the plan below is the protocol we follow.]`

We test after each coding-plan milestone (M0–M7). The manual test script: load each page from a
local server (no console errors); for each chart compare three tooltip values with the acceptance
values; open the table view and compare with the tooltip; download the CSV and open it; change every
control and check the status line, charts and table agree; use keyboard only; resize to 320, 768 and
1280 px; zoom to 200%; check page titles, heading order and link text.

**Accessibility test steps** (record results with screenshots): keyboard-only pass of each page;
screen-reader pass (NVDA or VoiceOver) of one chapter; 200% zoom and 320 px width; contrast check of
every colour; automated audit (axe or Lighthouse) of every page; reduced-motion check.

**Before-and-after comparisons:** `[FILL: screenshots/sketches showing each refinement, e.g.
Sankey mobile fallback, dot-plot sorting, sticky-controls height, tooltip focus behaviour.]`

**Adjustments due to programming issues:** `[FILL: e.g. d3-sankey UMD check; ResizeObserver redraw
vs viewBox scaling; C10 breakpoint decision; any data-contract fixes.]`

| Round | When | What we tested | Feedback / issue | Change made | Evidence |
|---|---|---|---|---|---|
| 1 | `[FILL]` | `[FILL]` | `[FILL]` | `[FILL]` | `[FILL]` |
| 2 | `[FILL]` | `[FILL]` | `[FILL]` | `[FILL]` | `[FILL]` |

### 4.2 Usability evaluation

`[FILL: not yet conducted. The brief requires a usability evaluation; the unit notes require tasks
written in the user's language, clear completion criteria, and no instructions about how to use the
interface.]`

**Plan.** Likely self-testing plus lecturer feedback `[CONFIRM]`. Note: self-testing alone is weak
evidence for the rubric; we recommend at least **2–3 participants who are not on the team** (peers
from the target audience) plus a lecturer feedback round. If only self-test + lecturer feedback is
possible, we document that as a limitation.

**Example tasks** (goal in user language; no interface instructions):
1. "Find out whether more people were hospitalised after road crashes in 2021 than in 2011, and
   whether the picture changes when population growth is taken into account." Completion: states the
   count change and the rate change (or that the rate barely changed).
2. "Imagine you usually ride a bicycle. Find out how people who ride bikes have been affected over
   time, and whether older riders are becoming a bigger share." Completion: selects the bike group
   and reports the cyclist rise and the older-rider share change.
3. "Find out what cyclists are most often hurt in a crash with — or whether there is no other
   vehicle involved." Completion: identifies "no other vehicle, person or object" as the largest
   share for cyclists.
4. "Compare the rate of hospitalisations between the Northern Territory and New South Wales in
   2021, and say which has more cases." Completion: reports NT higher rate, NSW more cases (or
   third-most), recognising counts ≠ rates.

**Measures:** task completion (yes/no against criteria), time on task, errors/misreadings,
think-aloud comments, and a short satisfaction question. **Rounds:** one early (wireframes/prototype)
and one formal (working site), then fixes logged for §4.1. **Materials:** task sheet, consent note,
recording/notes sheet → Appendix B. `[FILL: participants, dates, results.]`

---

## 5 Conclusion and Future Improvements

**Key findings (verified).** Far more people are hospitalised than killed (~35:1). Counts rose ~16%
from 2011 to 2021 but the crude rate rose only ~1%, so most of the rise reflects population growth.
Who is hurt is changing: cyclists +51%, pedestrians −15%, and people aged 65+ grew from 11.4% to
13.9% of cases (65+ cyclists roughly tripled). How people are hurt differs by road user and place:
non-collision events dominate cyclist and motorcyclist cases, and among car occupants the
non-collision share rises sharply with remoteness. Rates by state differ from counts, so totals
alone do not show risk.

**Lessons learnt:** `[FILL: after build — e.g. per-chapter state simpler than shared state; dot
plots reused across three charts; dictionary definitions resolved wording; crude-rate vintage
matters; accessibility needs early testing.]`

**Future improvements.** First Nations composition (with proper engagement and AIATSIS/CARE
governance); exposure-adjusted rates (distance travelled/registrations); age-standardised rates;
remoteness rates (needs remoteness population); severity lens (bed days, within-year only); newer
2017–2023 Data Hub series; optional unit chart; deep links; stats-check page.

---

## References (APA 7; every entry must be opened and read by the team)

- Australian Institute of Aboriginal and Torres Strait Islander Studies. (2020). *AIATSIS code of
  ethics for Aboriginal and Torres Strait Islander research*.
  https://aiatsis.gov.au/sites/default/files/2020-10/aiatsis-code-ethics.pdf `[VERIFY-TEAM]`
- Australian Institute of Health and Welfare. (2026, June 18). *Injury in Australia*. Retrieved
  November 13, 2026, from
  https://www.aihw.gov.au/reports/injury/injury-in-australia/contents/ranked-causes
  `[VERIFY-TEAM: exact 2024–25 figures]`
- Australian Institute of Health and Welfare. (n.d.-a). *National hospitals data collection*.
  https://www.aihw.gov.au/about-our-data/our-data-collections/national-hospitals-data-collection
- Australian Institute of Health and Welfare. (n.d.-b). *Data governance* (Five Safes).
  https://www.aihw.gov.au/about-our-data/data-governance
- Australian Institute of Health and Welfare. (2019). *Data quality statement: Admitted patient care
  2017–18*. METEOR. https://meteor.aihw.gov.au/content/724188
- Australian Bureau of Statistics. (2026). *National, state and territory population* (Table 4,
  "Population – states and territories", 310104.xlsx; reference period March 2026, released
  17 September 2026). Accessed 20 November 2026.
  https://www.abs.gov.au/statistics/people/population/national-state-and-territory-population/mar-2026
  `[VERIFY-TEAM]`
- Bureau of Infrastructure and Transport Research Economics. (2023). *Hospitalised Injury* [Data
  set]. Released 22 September 2023; accessed 8 October 2026.
  https://www.bitre.gov.au/resource/road-safety/hospitalised-injury `[VERIFY-TEAM]`
- Bureau of Infrastructure and Transport Research Economics. (2023). *Data dictionary: Hospitalised
  Injury (September 2023)*.
  https://www.bitre.gov.au/sites/default/files/documents/hospitalised-injury-data-dictionary-september-2023.pdf
  `[VERIFY-TEAM: confirm authorship — BITRE vs Department]`
- Bureau of Infrastructure and Transport Research Economics. (2022). *Road trauma Australia 2021
  statistical summary*. https://www.bitre.gov.au/sites/default/files/documents/road_trauma_2021.pdf
- Department of Infrastructure, Transport, Regional Development, Communications and the Arts. (n.d.).
  *Disclaimers*. https://www.infrastructure.gov.au/disclaimers
- Desai, T., Ritchie, F., & Welpton, R. (2016). *Five Safes: Designing data access for research*
  (Economics Working Paper Series). University of the West of England.
  https://ideas.repec.org/p/uwe/wpaper/20161601.html
- Infrastructure and Transport Ministers. (2021). *National Road Safety Strategy 2021–30*.
  Commonwealth of Australia.
  https://www.roadsafety.gov.au/sites/default/files/documents/National-Road-Safety-Strategy-2021-30.pdf
  `[VERIFY-TEAM]`
- Munzner, T. (2014). *Visualization analysis and design*. CRC Press.
  https://doi.org/10.1201/b17511
- Nielsen, J. (1994). *10 usability heuristics for user interface design*. Nielsen Norman Group.
  https://www.nngroup.com/articles/ten-usability-heuristics/
- Okabe, M., & Ito, K. (2008). *Color Universal Design (CUD): How to make figures and presentations
  that are friendly to colorblind people*. https://jfly.uni-koeln.de/color/ `[VERIFY-TEAM]`
- Tufte, E. R. (2001). *The visual display of quantitative information* (2nd ed.). Graphics Press.
- World Wide Web Consortium. (2018). *Web content accessibility guidelines (WCAG) 2.1*.
  https://www.w3.org/TR/WCAG21/
- World Health Organization. (n.d.). *ICD-10 browser* (transport accidents, V01–V99).
  https://icd.who.int/browse10/2019/en `[VERIFY-TEAM]`
- National Road Safety Data Hub. (2026). *Hospitalised injuries from road crashes* (30 Sep 2026;
  2017–2023). https://datahub.roadsafety.gov.au/reporting/hospitalised-injuries-road-crashes
  `[VERIFY-TEAM]`

`[FIND: 2–4 domain sources for §1.1, at least one peer-reviewed — see Part B. Do not cite the
candidate below until opened.]`

---

## Appendices

### Appendix A — Gen AI declaration
`[FILL: unit's declaration format, later.]`
**AI use log (to date):** GPT-6 Instant and Qwen-4-Max-Preview (early exploration checks, 13 Nov
2026); Claude Sonnet 5.5 (re-check, drafting, this rewrite, 13–27 Nov 2026); AI coding assistants
(to be used during build). AI-written code is tagged
`// AI-ASSISTED [tool, YYYY-MM-DD]: …; reviewed by <initials>` and accessibility code `// A11Y: …`.

### Appendix B — Usability evaluation materials
`[FILL: task sheet, consent note, notes/recording sheet, results. See §4.2.]`

### Appendix C — Glossary (plain language, for about-data)
- **Hospitalisation:** a person admitted to hospital after a road crash. People who died in hospital
  within 30 days of admission are not counted.
- **Road crash (traffic):** a crash in traffic; crashes off the road or at unknown locations are not
  included.
- **Road user group:** how a person was travelling — in a car (driver or passenger), on a motorbike,
  on a bike, on foot, or other (vans/utes, heavy vehicles, buses, unknown).
- **Vulnerable road users (this project):** pedestrians, motorcyclists and cyclists. (The Data Hub's
  published definition is broader; we state our operational definition.)
- **Counterparty:** the other vehicle, person or object involved. "No other vehicle, person or
  object" covers crashes recorded as non-collision transport accidents — for example a fall or loss
  of control (WHO ICD-10 includes wording verified). A counterparty is not a statement about fault.
- **Rate per 100,000 people:** hospitalisations ÷ population × 100,000, using June population
  estimates. Crude: not adjusted for age or how much people travel.
- **Index (2011 = 100):** a value ÷ its 2011 value × 100.
- **Series break:** a year hospitals changed how they admit patients (Victoria 2012; New South Wales
  June 2017), so comparisons across that year need care.
- **Remoteness area:** where the patient usually lives (Major Cities, Regional, Remote, Other or
  unknown) — not where the crash happened.

---

# Part B — Working side section (not for submission)

## Open items
- `[FILL]` Title page fields; word count; TOC; GitHub repo + GitHub Pages URLs.
- `[KNIME]` Configs + screenshots; annotated workflow; reconciliation evidence; EDA screenshots.
- `[CONFIRM]` ABS: June-only filter; national population basis (sum of 8 states vs Australia series);
  Other Territories effect; rate tolerance re-test against March 2026 release.
- `[CONFIRM]` `national_by_road_user_sex.csv` grain (no year column); `national_by_year_remoteness.csv`
  label values (Missing → Other or unknown?); exact lookup membership/labels; helper-column names.
- `[CONFIRM]` State = usual residence (dictionary exact wording).
- `[CONFIRM]` Coding-plan refinements: C10 stacking breakpoint (<640 vs <768); minimum width (320 vs
  360); record exact D3/d3-sankey versions and licences; check `d3.sankey` exists in the UMD file.
- `[VERIFY-TEAM]` Open every reference above before submission; confirm dictionary authorship;
  AIHW ranked-causes exact figures; NRSS targets; Okabe–Ito palette; WHO ICD-10 wording; Data Hub
  limitations; ABS licence.
- `[FIND]` Literature for §1.1 (2–4 sources, ≥1 peer-reviewed) + chapter domain literature.
- `[FILL]` Wireframes/storyboard/sketches (Figures 3.1–3.11): tool and owner.
- `[FILL]` Usability participants, rounds, results; Gen AI declaration format.
- `[FILL]` Reading-level check (≤9) and contrast check (reddish purple ≈3.0:1 borderline).
- Keep `processed/README.md` and `reusable-dataviz-checklist.md` in sync (checklist not yet uploaded).

## Literature search plan (search for real papers; do not ask an AI tool to list citations)
| Need | Example terms | Where to look |
|---|---|---|
| Why non-fatal road injuries matter | non-fatal road trauma Australia; serious injury road crash hospitalisation; burden of road injury | Australian Institute of Health and Welfare / Bureau of Infrastructure and Transport Research Economics reports; National Road Safety Strategy 2021–30; WHO global status report; library databases; Google Scholar |
| Older cyclists and riders | older cyclists injury hospitalisation Australia; e-bike injuries older adults | Accident Analysis & Prevention; Journal of Transport & Health; Injury Prevention |
| Pandemic and road trauma | pandemic lockdown road trauma cyclists pedestrians; road injury hospital admissions 2020 | PubMed; Scopus/Web of Science; Google Scholar |
| Remote areas and single-vehicle crashes | rural remote road trauma Australia; single-vehicle crash remoteness | Monash University Accident Research Centre; QUT Centre for Accident Research and Road Safety; journals above |
| First Nations road trauma (only if revisited) | Aboriginal and Torres Strait Islander road injury hospitalisation | Australian Institute of Health and Welfare reports; peer-reviewed work preferably by/with Aboriginal and Torres Strait Islander authors; read the Code of Ethics first |

**Candidate peer-reviewed source (UNVERIFIED — do not cite until opened):** Soltani, A. et al.
(2025). "Human cost, machine insight: A data-driven analysis of Australian road …" *Case Studies on
Transport Policy* (ScienceDirect PII S2213624X2500077X).
https://www.sciencedirect.com/science/article/pii/S2213624X2500077X
`[VERIFY-TEAM: open, read abstract/intro/conclusion, confirm full title/authors/DOI and that the
claim you cite is actually in it.]`

**Choosing sources:** peer-reviewed or authoritative; recent (~last 10 years); Australian where
possible; open the paper, read abstract/introduction/conclusion, check the claim is in it, confirm
DOI/URL, record each in the Sources sheet.