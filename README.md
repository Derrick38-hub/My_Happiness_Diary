# My Happiness Tracker — Enchanted Monthly Garden

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

Each year-month (`YYYY-MM`) has one tree. Current and future trees reach full size at 600 HP. Past trees keep their recorded growth targets. The five illustrated growth stages scale proportionally to each tree's target.

| Stage | Starts at |
| --- | ---: |
| Seed | 0 HP |
| Little Sprout | 91 HP |
| Growing Plant | 240 HP |
| Young Tree | 420 HP |
| Fully Grown Happiness Tree | 600 HP |

- Daily mood check-in: 5 HP once per local day for Happy, Grateful, Calm, Excited, or Neutral. All five receive the same reward. Journal text is optional.
- Daily written reflection: 10 HP once per local day. Mood-only saves do not consume this reward.
- Recognized positive words: 5 HP per unique word per day. Case and punctuation are ignored; repeated words do not earn more that day. Words become eligible again tomorrow. An explicit 1,195-word dictionary prevents arbitrary new words earning rewards.
- Happy memory: 10 HP once daily when the checkbox is selected and the reflection is at least 30 characters.
- Gratitude reflection: 10 HP once daily with a written reflection and the gratitude checkbox, Grateful mood, or an existing gratitude phrase.

Mood selection is required for all saves. Written reflection and mood rewards are independent. Nothing subtracts points for difficult emotions. After the tree reaches full size, the growth display stays at 100% and eligible check-ins continue adding to the month's HP total.

A new month starts a separate seed at 0 HP using the browser's local date. An open app checks for rollover every minute and when you return to its tab. Previous trees, including partially grown ones, remain in the garden.

## Calendar and reflections

The Monday-first calendar shows up to three distinct mood emojis per day. Select a day to see its entries newest first, including mood-only check-ins. Historical moods remain visible.

For a written entry saved today, choose **Edit reflection** to change the text. The entry keeps its original date, time, mood, and earned HP. Earlier entries are read-only. The app checks the date again when saving an edit, so a draft left open past midnight cannot be saved.

## Monthly graph

Choose **Monthly graph** in the header to see the HP awarded on each day of the selected calendar month. Use the arrows to browse months and **View daily points** for exact values. The vertical axis goes up to 100 HP by default and expands if a day exceeds 100 HP.

Opening or refreshing the app starts the calendar and graph on the current month. If you leave the app open across a month boundary, the graph follows the month selected in the calendar until you navigate to another month. Earlier graphs remain available.

## Data preservation and migration

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

Run `node --check script.js` and `node test.js`. The checks cover monthly growth and rollover, rewards above 600 HP, calendar alignment, historical moods, same-day editing across midnight, monthly graph navigation, and backup and restore. UI tests use isolated browser-storage simulations and a simulated clock.

## Energy Color Palette

The presentation uses CSS variables for Deep Blue `#304F6D`, Sage Green `#899481`, Terracotta `#E07D54`, Soft Yellow `#FFE1A0`, Light Blue `#E2F3FD`, and Warm Gray `#E6E1DD`. All five tree stages and the legacy completed-tree SVG use the same palette. The layout includes keyboard focus and reduced-motion styles. System fonts are available offline.
