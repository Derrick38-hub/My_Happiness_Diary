# My Happiness Diary

A browser-local happiness diary with mood check-ins, editable same-day reflections, five-stage trees, a calendar, a monthly HP graph, and portable JSON backups. Built with HTML, CSS, and vanilla JavaScript. No build step or backend is required.

## Run

Open `index.html` in your preferred browser. You can also use VS Code Live Server or run `python -m http.server 8000` and open http://localhost:8000. Use the same browser profile and app address to access the same journal. Use **Backup & restore** when switching browsers or app addresses.

## Files

- `index.html`: tree progress, mood and journal form, calendar, monthly graph, backup controls, and garden.
- `style.css`: enchanted theme, responsive layouts and reduced-motion support.
- `script.js`: monthly lifecycle, safe migration, rewards, persistence and UI.
- `assets/happiness-tree.svg`: completed legacy tree artwork; current and monthly-record trees use the same original `treeSVG` generator.
- `test.js`: dependency-free automated checks, run with `node test.js`.

## Monthly trees and rewards

Each year-month (`YYYY-MM`) has one tree. All monthly trees, including historical records, reach full size at 1,000 HP. Monthly earned HP is capped at 1,000; visual growth stops at 100%. The tree and instruction goal follow the selected calendar month.

| Stage | Starts at |
| --- | ---: |
| Seed | 0 HP |
| Little Sprout | 152 HP |
| Growing Plant | 400 HP |
| Young Tree | 700 HP |
| Fully Grown Happiness Tree | 1,000 HP |

- Daily mood check-in: 5 HP once per local day for Happy, Grateful, Calm, Excited, or Neutral. All five receive the same reward. Journal text is optional.
- Daily written reflection: 10 HP once per local day. Mood-only saves do not consume this reward.
- Recognized positive words: 2 HP per unique word, maximum 3 rewarded words per day (+6 HP). Case and punctuation are ignored; repeated words do not earn more that day. Words become eligible again tomorrow. An explicit 1,195-word dictionary prevents arbitrary new words earning rewards.
- Happy memory: 7 HP once daily when the checkbox is selected and the reflection is at least 30 characters.
- Gratitude reflection: 8 HP once daily with a written reflection and the gratitude checkbox, Grateful mood, or an existing gratitude phrase.

Mood selection is required for all saves. Written reflection and mood rewards are independent. Nothing subtracts points for difficult emotions. After the tree reaches full size, the growth display stays at 100% and new reflections and mood check-ins are disabled for that month. Existing entries, calendar memories, graphs and backups remain available. The next calendar month starts at 0 HP and automatically re-enables the form.

A new month starts a separate seed at 0 HP using the browser's local date. An open app checks for rollover every minute and when you return to its tab. Previous trees, including partially grown ones, remain in the garden.

## Calendar and reflections

The Monday-first calendar shows up to three distinct mood emojis per day. Select a day to see its entries newest first, including mood-only check-ins. Historical moods remain visible.

For a written entry saved today, choose **Edit reflection** to change the text. The entry keeps its original date, time, mood, and earned HP. Earlier entries are read-only. The app checks the date again when saving an edit, so a draft left open past midnight cannot be saved.

## Monthly graph

Choose **Monthly graph** in the header to see the HP awarded on each day of the selected calendar month. Use the arrows to browse months and **View daily points** for exact values. The vertical axis goes up to 100 HP by default and expands if a day exceeds 100 HP.

Opening or refreshing the app starts the calendar and graph on the current month. If you leave the app open across a month boundary, the graph follows the month selected in the calendar until you navigate to another month. Earlier graphs remain available.

## Data preservation and migration

Monthly records adopt the shared `MONTHLY_HP_CAP = 1000`. Original over-limit balances are preserved in each record as `preCapHP`, while its current balance becomes 1,000. Original journal awards remain unchanged. The original pre-migration JSON is retained once at `myHappinessTrackerV1BeforeMonthlyCap`; existing backups are never overwritten. Graphs allocate historical awards chronologically up to the capped balance. Imported balances without matching journal awards are explicitly labelled in the daily panel. No journal entries are fabricated or rewards replayed. Earlier targets and completion dates are retained in `growthGoalHistory`; monthly trees below 1,000 HP now display partial growth. Legacy completed trees remain unchanged. Repeated loads do not duplicate records or migration history.

The main key remains `myHappinessTrackerV1`. Schema version 4 adds `monthlyTrees`, `activeMonth`, and `moodRewardedDates`. Every monthly record stores its own month, target, HP and completion date. The top-level HP remains a compatibility mirror of the active monthly tree.

Before persisting the first migration, the app saves the original raw JSON at `myHappinessTrackerV1BeforeMonthlyV4` if that backup key does not already exist. Existing backup keys are never replaced. No storage keys are deleted. Existing journals, entry rewards and completed legacy trees are preserved rather than having their HP recalculated.

The old active tree's indivisible HP balance is assigned once to its latest active reflection's month, falling back to its start date and then the current month. A balance belonging to an earlier month becomes a keepsake and does not increase the current month's HP. If the old active tree was already archived as a completed tree, its earned HP remains in that legacy garden record and is not copied into a second tree. `legacyProgress` retains the original balance metadata. Old entry rewards are never summed back into tree HP.

Existing daily reflection dates, memory/gratitude flags and word tracking prevent replaying earlier rewards. The new mood check-in has its own daily ledger because the old system did not award it. Reloading or revisiting a month reuses its unique monthly record.

LocalStorage failures leave the session usable and show a notice. Use **Backup & restore** to download a restorable copy of the current session. LocalStorage is browser-local and unencrypted. Changing origins or clearing browser data changes which garden is available.

## Backup and restore

1. In the original browser, open **Backup & restore** and choose **Download backup**. Save the JSON file in a private cloud drive folder.
2. Open the app in your other browser. If it has no saved journal, the app offers to restore one. You can also open **Backup & restore** any time.
3. Choose **Restore from file** and select the JSON file from your cloud drive or download it first. If the browser already has a journal, the app asks before replacing it. Download a backup of that journal first if you want to keep it.

The JSON includes entries, monthly trees, and reward history. Each download captures a snapshot, so download a fresh backup to carry over newer entries. The app uses browser storage and does not connect to your cloud drive.

## Verification

Run `node --check script.js` and `node test.js`. The 56 checks cover exact progress boundaries (including 999 HP = 99.9%), selected-month tree and guide navigation, universal goals across years, older backup compatibility, monthly growth and rollover, locked submissions after 1,000 HP and partial awards near the cap, calendar alignment, historical moods, same-day editing across midnight, monthly graph navigation, and backup and restore. UI tests use isolated browser-storage simulations and a simulated clock.

## Energy Color Palette

The presentation uses CSS variables for Deep Blue `#304F6D`, Sage Green `#899481`, Terracotta `#E07D54`, Soft Yellow `#FFE1A0`, Light Blue `#E2F3FD`, and Warm Gray `#E6E1DD`. All five tree stages and the legacy completed-tree SVG use the same palette. The layout includes keyboard focus and reduced-motion styles. System fonts are available offline.

Daily activity rewards total at most 36 HP (5 mood + 10 reflection + 6 positive words + 7 happy memory + 8 gratitude). `DAILY_ACTIVITY_CAP` also enforces the daily limit across multiple submissions and historical awards. No monthly completion bonus is introduced. Existing daily ledgers remain in force; prior rewarded words count toward the new three-word limit. Old backups are normalized safely on restore. The retained Excel workbook generator exports capped monthly balances and an explicit Original Pre-limit HP column; historical journal awards remain literal and unchanged. Its standalone tests run with `node export.test.js` when the existing SheetJS and fflate assets are available. The active HTML currently exposes JSON backup/restore rather than Excel export.

At the monthly limit, the form displays: "Your Happiness Tree is fully grown! Come back next month to grow a new tree." The shared reward function rejects locked submissions even when called outside the form. Month rollover follows the local calendar, checked on returning to the tab, each minute, and when saving. Browsing a historical tree does not change submission availability for the actual current month.

## Data-integrity safeguards

All application writes (new reflections, edits, migration, rollover, and restore) use one exclusive Web Lock. A writer reads and validates the latest saved document inside that lock, reapplies its operation, validates reward accounting, increments the revision, and confirms the stored result. New entries merge by replaying against the latest daily ledgers; edits compare their original journal text with the latest entry and block conflicting changes. Storage events refresh other tabs without clearing their drafts. Failed saves leave the draft, mood and checkboxes intact; retry IDs prevent duplicate awards if confirmation failed after the write.

Use HTTPS or localhost for saving. Browsers/addresses without Web Locks are read-only, rather than using a non-atomic localStorage fallback. Close or reload older versions of this app in every tab when upgrading: old code and external tools do not participate in this version's locking protocol. Local files, private browsing and disabled storage may restrict these APIs.

Unreadable or invalid saved data is never treated as permission to overwrite it. Open **Backup & restore**, choose **Download original data**, and keep the raw recovery file. Then select a valid backup. Restoration requires confirmation and archives the exact previous stored text under a unique `myHappinessTrackerV1BeforeRestore-*` key before replacement. If archival or persistence fails, restore stops. There is no automatic reset. When the browser denies storage reads altogether, return to a profile that can access the original data; the app cannot download data the browser refuses to expose.

Backup validation rejects duplicate IDs, negative/fractional HP, malformed dates/times, mismatched month associations, missing monthly records, unsupported structures, and inconsistent new accounting. Versions 2 and 3 can be imported as legacy raw JSON or wrapped backups. Version 4 uses the existing wrapper. An integrity migration preserves original raw data once at `myHappinessTrackerV1BeforeIntegrityV1`, without replacing earlier backup keys. Numeric legacy entry IDs and unknown metadata are retained.

Old balances cannot always be reconstructed from available journal entries. Each month therefore retains an explicit opening HP and historical entry/word baseline; original rewards are not replayed or changed. New entries record their immutable reward breakdown and awarded words. Validation checks the opening balance plus new awards against monthly HP, daily limits and duplicate activities. Legacy backups needing reconciliation require an explicit review prompt even in an empty browser. Unsupported or ambiguous records are rejected for recovery instead of silently discarded. These checks establish internal consistency, not cryptographic proof against someone deliberately rewriting their own backup or browser storage.

`node test.js` runs 56 asynchronous application and integrity checks, including concurrent saves, conflicting and independent edits, storage events, missing Web Locks, corrupt-data downloads, archival restore, denied storage, quota failure/retry, failed-confirmation idempotency, invalid backups, legacy preservation and restore races. The separate export dependency issue (F5) and automatic open-graph rollover issue (F6) are deferred; these fixes do not attempt to resolve them.
