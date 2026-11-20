# My Happiness Tracker — Enchanted Monthly Garden

A browser-local happiness diary with original five-stage SVG trees, mood check-ins, a compact Monday-first calendar, journal pop-ups, and an enchanted garden theme. Built with HTML, CSS and vanilla JavaScript; no build or backend required.

## Run

Open `index.html`, or use VS Code Live Server. Alternatively run `python -m http.server 8000` and open http://localhost:8000. Use the same browser and address to retain the same LocalStorage.

## Files

- `index.html`: tree progress, mood/journal form, instruction modal, calendar and garden.
- `style.css`: enchanted theme, responsive layouts and reduced-motion support.
- `script.js`: monthly lifecycle, safe migration, rewards, persistence and UI.
- `assets/happiness-tree.svg`: completed legacy tree artwork; current and monthly-record trees use the same original `treeSVG` generator.
- `test.js`: dependency-free automated checks, run with `node test.js`.

## Monthly trees and rewards

Each year-month (`YYYY-MM`) has one tree. Its target is the number of calendar days multiplied by 15: 420 for 28 days, 435 for 29, 450 for 30, and 465 for 31. JavaScript date calculations handle leap years and year transitions. The five illustrated growth stages scale proportionally to each target.

- Daily mood check-in: 5 HP once per local day for Happy, Grateful, Calm, Excited, or Neutral. All five receive the same reward. Journal text is optional.
- Daily written reflection: 10 HP once per local day. Mood-only saves do not consume this reward.
- Recognized positive words: 5 HP per unique word per day. Case and punctuation are ignored; repeated words do not earn more that day. Words become eligible again tomorrow. An explicit 1,195-word dictionary prevents arbitrary new words earning rewards.
- Happy memory: 10 HP once daily when the checkbox is selected and the reflection is at least 30 characters.
- Gratitude reflection: 10 HP once daily with a written reflection and the gratitude checkbox, Grateful mood, or an existing gratitude phrase.

Mood selection is required for all saves. Written reflection and mood rewards are independent. Nothing subtracts points for difficult emotions. Each award is capped at the month's remaining target HP. At full growth the tree celebrates; users can continue journaling with zero additional HP until the new month.

A new month starts a new seed automatically. A timer and returning to the page synchronize the active month; saving also routes rewards by the entry's local date. Previous full or partial trees remain monthly garden records. Missed months with no activity do not create artificial journal entries or award points. There is no manual second seed within a month.

## Data preservation and migration

The main key remains `myHappinessTrackerV1`. Schema version 4 adds `monthlyTrees`, `activeMonth`, and `moodRewardedDates`. Every monthly record stores its own month, target, HP and completion date. The top-level HP remains a compatibility mirror of the active monthly tree.

Before persisting the first migration, the app saves the original raw JSON at `myHappinessTrackerV1BeforeMonthlyV4` if that backup key does not already exist. Existing backup keys are never replaced. No storage keys are deleted. Existing journals, entry rewards and completed legacy trees are preserved rather than having their HP recalculated.

The old active tree's indivisible HP balance is assigned once to its latest active reflection's month, falling back to its start date and then the current month. A balance belonging to an earlier month becomes a keepsake and does not increase the current month's HP. If the old active tree was already archived as a completed tree, its earned HP remains in that legacy garden record and is not copied into a second tree. `legacyProgress` retains the original balance metadata. Old entry rewards are never summed back into tree HP.

Existing daily reflection dates, memory/gratitude flags and word tracking prevent replaying earlier rewards. The new mood check-in has its own daily ledger because the old system did not award it. Reloading or revisiting a month reuses its unique monthly record.

LocalStorage failures leave the session usable and show a notice; use Export to Excel to retain a readable workbook copy. LocalStorage is browser-local and unencrypted. There is no import or cloud sync. Changing origins or clearing browser data changes which garden is available.

## Calendar, accessibility and verification

The 850px compact calendar keeps up to three distinct mood emojis per day. Its modal shows all entries newest first, including mood-only check-ins. Native dialogs support Escape, backdrop closing, focus restoration and background scroll locking. The instruction modal shows the current monthly target. User journal text is rendered with `textContent`; SVG markup is internally authored. Keyboard focus and reduced-motion styles are included.

Run `node --check script.js`, `node test.js`, and `node export.test.js`. All 22 checks pass: monthly targets, all moods, independent daily rewards, positive-word limits, memory/gratitude limits, target capping, full-tree journaling, month/year rollover, cross-month isolation, preservation of legacy 255 HP, backup safety, repeat migration, existing calendar dates, and UI/modal handlers. Calendar alignment is checked across all 492 months from 2000 through 2040.

UI tests use an isolated DOM/storage adapter and a simulated clock, without touching personal browser data. Actual browser visual verification remains unavailable in this environment. Google Fonts requires a connection; system fallbacks work offline. Calendar, theme and animations remain in place.


New check-ins offer only Happy (??), Grateful (??), Calm (??), Excited (??), and Neutral (??). Previously saved moods remain unchanged in journal history and retain read-only calendar/modal emoji support. Removed moods are rejected for new submissions without changing HP or entries. Tests cover the five options, equal once-daily rewards, next-day reuse, and preservation/display of historical Sad, Stressed, Angry and Difficult entries. Responsive mood-grid styles, tree animations and compact calendar dimensions are unchanged.


## Energy Color Palette

The presentation uses CSS variables for Deep Blue `#304F6D`, Sage Green `#899481`, Terracotta `#E07D54`, Soft Yellow `#FFE1A0`, Light Blue `#E2F3FD`, and Warm Gray `#E6E1DD`. White/near-white surfaces and palette-derived tints provide readable text, soft shadows, and consistent states. Primary actions use Terracotta; secondary controls and progress use Sage; headings and focus rings use Deep Blue. Dark text derived from Deep Blue provides at least 4.5:1 contrast on both action colors. All five tree stages and the saved completed-tree SVG use the same palette. Geometry, animation timing, application behavior, and storage are unchanged. The 22 automated checks pass; actual browser/mobile appearance remains unverified because browser preview access is unavailable.


## Export to Excel

The header?s Export to Excel button downloads `My_Happiness_Tracker_YYYY-MM-DD.xlsx` with three worksheets in the requested order:

1. Happiness Journal: every saved entry?s date, original time, mood, reflection text and awarded HP, including historical moods and mood-only check-ins.
2. Monthly Tree Progress: every stored month, target, actual HP, growth percentage and completion status. Legacy completed trees appear as clearly labelled additional records retaining their original targets.
3. Happiness Summary: journal entry count, unique entry/check-in days, lifetime saved tree HP, completed-tree count and most frequent mood. Tied moods are listed together. Total HP adds monthly tree balances and legacy completed-tree balances; it does not also add entry rewards or the top-level current-HP mirror.

The export reads the latest saved data without writing, migrating, clearing or resetting LocalStorage. If storage cannot be read, the current session can be exported instead, with a notice. Empty data generates column headings and zero counts. Failed exports restore the button and show a readable error. The workbook is a readable archive, not an importable application-state backup.

SheetJS Community Edition 0.20.3 and fflate 0.8.2 are vendored locally so the export works offline. `excel-export.js` uses SheetJS to build the workbook and fflate to apply native OpenXML styles for bold Energy Palette headings, text wrapping, row heights, frozen headers and readable column widths. Dates and growth percentages are typed numeric cells with Excel formats; all user-written strings are explicit string cells, never formulas. Reflections longer than Excel?s 32,767-character cell limit produce a clear error rather than silent truncation. Excel limits maximum row height; exceptionally long reflections remain stored in full but may require opening the cell to read all text.

The nine export checks verify real XLSX write/read, historical records, summary totals, number formats, style XML, formula-injection protection, empty exports, failures, filename/MIME, and no storage writes in the handler. All 22 existing application checks still pass. The generated workbook XML also parses successfully. Actual native browser download and visual Excel rendering remain unverified in this environment.

Library sources and licenses: SheetJS from https://cdn.sheetjs.com/xlsx-0.20.3/package/dist/xlsx.full.min.js (Apache-2.0); fflate from https://cdn.jsdelivr.net/npm/fflate@0.8.2/umd/index.js (MIT). License copies are included under `assets/vendor/`.
