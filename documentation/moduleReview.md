# MMM-MyTeams-LeagueTable — Module Review

> **Original Review Date:** April 2026  
> **Original Codebase Version:** Post-v1.9.0 (FA icon migration applied)  
> **Implementation Tracking Updated To:** v3.1.1 (2026-04-22)  
> **Files Reviewed:** `src/rendering.js`, `css/MMM-MyTeams-LeagueTable-Base.css`, `node_helper.js`, `cache-manager.js`, `shared-request-manager.js`

> **Legend:** COMPLETED = Implemented | ⚠️ = Known issue, not yet fixed | 💡 = Innovation opportunity

---

## Additional Bugs Fixed in v3.1.1 (Outside Original Review Scope)

The following UI/UX and accessibility improvements were implemented in v3.1.1:

| ID | Improvement | Implementation | Status |
|----|-----|-----|--------|
| BUG-06 | Header action buttons order was inconsistent | Rearranged to Refresh → Clear → Pin (left-to-right) | ✅ FIXED v3.1.1 |
| BUG-07 | Action buttons relied purely on color for differentiation | Implemented **Shape-coded Differentiation** (Circle, Square, Diamond) | ✅ FIXED v3.1.1 |
| BUG-08 | Font Awesome icons were applied to button elements instead of child `<i>` elements | Re-engineered to use dedicated `<i>` elements for reliable rendering | ✅ FIXED v3.1.1 |
| BUG-09 | Action buttons had reduced visibility (50% opacity) | Added `bright` class (100% opacity) and 16px font-size | ✅ FIXED v3.1.1 |
| BUG-10 | Lack of tactile feedback on button interactions | Added hover scale (1.2x) and active/press scale (0.9x) effects | ✅ FIXED v3.1.1 |

---

## Additional Bugs Fixed in v2.5.2 (Outside Original Review Scope)

The following critical bugs were discovered and fixed after the original review:

| ID | Bug | Fix | Status |
|----|-----|-----|--------|
| BUG-01 | `start()` crashes with `TypeError: Cannot read properties of undefined (reading 'length')` — `this.currentLeague` assigned before `determineEnabledLeagues()` | Moved assignment to after `determineEnabledLeagues()` call | ✅ FIXED v2.5.2 |
| BUG-02 | `UnhandledPromiseRejectionWarning: ReferenceError: chainInfo is not defined` in `node_helper.js:532` — variable referenced but never declared | Declared `const chainInfo` before the log statement | ✅ FIXED v2.5.2 |
| BUG-03 | `Uncaught SyntaxError: Unexpected identifier 'MACEDONIA_FIRST_LEAGUE'` in `european-leagues.js:218` — space in object key `NORTH MACEDONIA_FIRST_LEAGUE` | Renamed to `NORTH_MACEDONIA_FIRST_LEAGUE` | ✅ FIXED v2.5.2 |
| BUG-04 | URL map key mismatches across all five provider maps (`DENMARK_SUPERLIGAEN` vs `DENMARK_SUPERLIGA`, `FINLAND_PREMIER_LEAGUE` vs `FINLAND_VEIKKAUSLIIGA`, etc.) caused console errors "Could not find URL for league code" | Standardised all five maps to identical canonical keys, alphabetically sorted | ✅ FIXED v2.5.2 |
| BUG-05 | `espnUrlMap` had only 28 entries vs 62+ in other maps; missing UEFA competition entries and legacy aliases | Fully rewrote `espnUrlMap` (62+ entries, alphabetical, UEFA + legacy aliases included) | ✅ FIXED v2.5.2 |

---

## Table of Contents

1. [Security](#1-security)
2. [Performance](#2-performance)
3. [Accessibility](#3-accessibility)
4. [Loading Time Reduction & Cache](#4-loading-time-reduction--cache)
5. [Debugging](#5-debugging)
6. [Innovation](#6-innovation)
7. [UI/UX Experience](#7-uiux-experience)
8. [Design & Aesthetics](#8-design--aesthetics)
9. [Implementation Strategy Summary](#9-implementation-strategy-summary)

---

## 1. Security

### Findings

#### SEC-01 — `debug: true` as Production Default ⚠️ HIGH   ✅
**Location:** `MMM-MyTeams-LeagueTable.js` line 172  
**Problem:** The default configuration ships with `debug: true`. Every new install immediately produces verbose `Log.info` output in both the browser console and the Node.js terminal. On Raspberry Pi, continuous logging degrades CPU and disk I/O performance and may expose internal data structures (e.g., full config dumps at startup, line 329–334) to anyone with console access.  
**Evidence:**
```javascript
debug: true, // Set to true to enable console logging  (line 172 – default)
Log.info(` MMM-MyTeams-LeagueTable: Module started with config: ${JSON.stringify(this.config)}`);  // line 331
```

#### SEC-02 — CSS Injection via `fontColorOverride` ⚠️ HIGH  ✅
**Location:** `MMM-MyTeams-LeagueTable.js` line 5944–5945  
**Problem:** The `fontColorOverride` configuration value is interpolated directly into a CSS string without sanitisation:
```javascript
css += `.spfl-league-table * { color: ${this.config.fontColorOverride} !important; }\n`;
```
A malicious or accidental value such as `red; } body { display:none` would inject arbitrary CSS rules into the page, potentially hiding all MagicMirror content or worse.

#### SEC-03 — `opacityOverride` Has No Range Validation ⚠️ MEDIUM ✅
**Location:** `MMM-MyTeams-LeagueTable.js` line 5953–5955  
**Problem:** `parseFloat(this.config.opacityOverride)` is checked for `NaN` but not clamped to the valid `0–1` range. A value of `999` or `-1` would be injected into CSS without complaint.

#### SEC-04 — Full Config Object Exposed in Socket Notification ⚠️ MEDIUM
**Location:** `node_helper.js` line 261  
**Problem:** The entire `config` payload received from the frontend is logged (in debug mode) and stored on `this.config`. If the user accidentally puts credentials or tokens in the config, they would be logged verbatim.

#### SEC-05 — User Agent Rotation for Bot Evasion 🔵 LOW (Policy Risk)
**Location:** `shared-request-manager.js` lines 78–86  
**Problem:** The module rotates through seven real browser user-agent strings to impersonate human traffic to BBC Sport, ESPN, Wikipedia, and other sources. While necessary for the module to function, this may violate the terms of service of those providers and could result in IP blocks. There is no documentation warning users of this risk.

#### SEC-06 — Typo in Google URL Map Key (Silent Data Loss) ⚠️ MEDIUM    ✅
**Location:** `MMM-MyTeams-LeagueTable.js` line 936  
**Problem:** The key `ENGLAND_PREMIER_guesGUE` is a typo — it should be `ENGLAND_PREMIER_LEAGUE`. As a result, the Google fallback URL for the EPL is silently unreachable:
```javascript
ENGLAND_PREMIER_guesGUE:  // line 936 – will never match!
  "https://www.google.com/search?q=Premier+League+table+standings",
```

### Recommendations

| ID | Recommendation | Priority | Status |
|----|---------------|----------|--------|
| SEC-01 | Change `debug` default to `false` | **CRITICAL** | COMPLETED
| SEC-02 | Sanitise `fontColorOverride` before CSS injection (validate as valid CSS colour value using regex or a whitelist) | **HIGH** | COMPLETED
| SEC-03 | Clamp `opacityOverride` to `[0, 1]` after parsing | **MEDIUM** | COMPLETED
| SEC-04 | Strip known-sensitive keys from config before logging | **MEDIUM** | COMPLETED
| SEC-05 | Add documentation warning about scraping TOS risks | **LOW** | COMPLETED
| SEC-06 | Fix typo `ENGLAND_PREMIER_guesGUE` → `ENGLAND_PREMIER_LEAGUE` | **HIGH** | COMPLETED

---

## 2. Performance

### Findings

#### PERF-01 — Main Client JS File is 188 KB (6006 Lines) ✅ FIXED (v3.0.0)
**Location:** `MMM-MyTeams-LeagueTable.js`  
**Problem:** The monolithic client-side JS file was 188 KB and contained all logic in a single module. On Raspberry Pi, parsing this was slow.
**Solution:** Split into logical modules under `src/` and implemented an `esbuild` pipeline. Production bundle is now ~70 KB and minified.

#### PERF-02 — CSS File is 62 KB ✅ ALIGNED (v3.1.0)
**Location:** `MMM-MyTeams-LeagueTable.css`  
**Problem:** Large CSS file with redundant rules.
**Solution:** Standardised HTML class names in the new rendering engine to align with the original optimized CSS, ensuring layout parity while maintaining modularity.

#### PERF-03 — `updateTeamNameColumnWidth()` Creates DOM Elements on Every Render ⚠️ MEDIUM
**Location:** `MMM-MyTeams-LeagueTable.js` lines 2878–2907  
**Problem:** This function appends a hidden `<span>` measurer to `document.body`, iterates every team name cell to measure its rendered width, then removes the element. It is called on every `getDom()` cycle (inside a `setTimeout`). While harmless on desktop, this forced layout/reflow is expensive on Raspberry Pi and scales with the number of teams.

#### PERF-04 — Resize Event Listener is Never Removed ⚠️ MEDIUM ✅
**Location:** `MMM-MyTeams-LeagueTable.js` line 5838  
**Problem:** `_addHorizontalScrollIndicators()` attaches a `window.resize` event listener but never removes it:
```javascript
window.addEventListener("resize", resizeHandler);
// Clean up listener when module is destroyed (if MM supported it better)
// For now we just add it.
```
Each `getDom()` call that includes tabs adds another listener. Over time (especially with auto-cycling), these pile up and degrade performance.

#### PERF-05 — SharedRequestManager Queue Processor Runs Every 500ms Indefinitely ⚠️ LOW
**Location:** `shared-request-manager.js` line 97  
**Problem:** `queueCheckInterval: 500` causes the singleton's queue processor `setInterval` to fire twice per second even when the queue is empty, consuming CPU cycles on devices with limited clock speed.

#### PERF-06 — `_shouldSkipRender()` Key Does Not Reflect Data Freshness ⚠️ LOW ✅
**Location:** `MMM-MyTeams-LeagueTable.js` lines 2909–2914  
**Problem:** The render-skip optimisation uses only `${currentLeague}::${currentSubTab}` as the cache key. It does not include a data version, timestamp, or hash, so if the data payload for the same league updates (e.g., after a live goal), the render is incorrectly skipped unless `_lastRenderedKey` is explicitly reset — which it is in `loadLogoMappings()` but not in the main data-received handler.

### Recommendations

| ID | Recommendation | Priority | Status |
|----|---------------|----------|--------|
| PERF-01 | Split JS file into logical modules (rendering, state, config, accessibility) and add a build step (`esbuild`/`rollup`) for minification | **COMPLETED** |
| PERF-02 | Split CSS by feature area (base, national, uefa, worldcup, fixtures) and load relevant sections only | **COMPLETED** |
| PERF-03 | Cache the measured team name width per league code; only re-measure when the league changes or team count changes | **MEDIUM** | COMPLETED
| PERF-04 | Maintain a cleanup registry; remove all `window.addEventListener` calls in a `stop()` or `suspend()` lifecycle hook | **HIGH** | COMPLETED
| PERF-05 | Use a demand-driven queue wake-up instead of polling — signal the processor via a Promise resolve when a new item is enqueued | **LOW** | COMPLETED
| PERF-06 | Include a `dataVersion` (e.g., timestamp of last fetch) in the render-skip key so data updates always trigger a re-render | **MEDIUM** | COMPLETED

---

## 3. Accessibility

### Findings

#### A11Y-01 — Table Header Cells Missing `scope="col"` ⚠️ HIGH ✅
**Location:** `MMM-MyTeams-LeagueTable.js` lines 1817–1823 (`createTableHeader`)  
**Problem:** While `role="columnheader"` is set, the native HTML `scope="col"` attribute is missing. Screen readers (NVDA, JAWS, VoiceOver) use `scope` for table navigation. WCAG 2.1 Criterion 1.3.1 requires it.

#### A11Y-02 — Form Tokens Are Not Screen-Reader Friendly ⚠️ HIGH ✅
**Location:** Rendered form indicators (W/D/L cells)  
**Problem:** The W/D/L form tokens are rendered as styled text/shapes with colour coding. There is no `aria-label` providing the full meaning (e.g., "Win", "Draw", "Loss") — screen reader users only hear individual letters with no context.

#### A11Y-03 — Position/Zone Colours Convey Meaning Without Text Alternative ⚠️ HIGH ✅
**Problem:** Champions League, Europa League, relegation zone and top positions are indicated purely by row background colour. WCAG 2.1 Criterion 1.4.1 (Use of Colour) requires colour is not the sole means of conveying information. There is no visible text label or `aria-label` describing the zone.

#### A11Y-04 — `prefers-reduced-motion` Not Respected ⚠️ MEDIUM  ✅
**Problem:** Animations (`fa-spin`, CSS transitions `0.4s`, auto-scroll via `scrollIntoView({ behavior: "smooth" })`) are not wrapped in a `prefers-reduced-motion` media query. Users with vestibular disorders who have this OS preference enabled will still see all animations.

#### A11Y-05 — League Selector Buttons Use `<span role="button">` Not `<button>` ⚠️ MEDIUM 
**Problem:** Refresh, Clear Cache, and Pin controls are `<span>` elements promoted to `role="button"`. Native `<button>` elements receive focus and keyboard events natively; `<span role="button">` requires manual `tabindex` and `keydown` handling which, while implemented, is fragile across assistive technologies.

#### A11Y-06 — Toggle Icon Has No Accessible Label ⚠️ MEDIUM ✅
**Location:** `MMM-MyTeams-LeagueTable.js` lines 5980–6003 (`_createToggleIcon`)  
**Problem:** The content-hide/show toggle icon has a `title` attribute but no `aria-label`. `title` is not reliably announced by screen readers; `aria-label` is required.

### Recommendations

| ID | Recommendation | Priority | Status |
|----|---------------|----------|--------|
| A11Y-01 | Add `scope="col"` to all `createTableHeader` calls | **HIGH** | COMPLETED
| A11Y-02 | Add `aria-label="Win"`, `aria-label="Draw"`, `aria-label="Loss"` to each form token element | **HIGH** | COMPLETED
| A11Y-03 | Add a visually-hidden text label (e.g., "Champions League zone") to the first row of each coloured zone | **HIGH** | COMPLETED
| A11Y-04 | Add `@media (prefers-reduced-motion: reduce)` blocks in CSS and check `window.matchMedia("(prefers-reduced-motion: reduce)").matches` before triggering JS animations | **MEDIUM** | COMPLETED
| A11Y-05 | Replace `<span role="button">` controls with native `<button>` elements | **MEDIUM** | COMPLETED
| A11Y-06 | Add `aria-label` to the toggle icon element in `_createToggleIcon` | **MEDIUM** | COMPLETED

---

## 4. Loading Time Reduction & Cache

### Findings

#### CACHE-01 — No Cache Version/Schema Migration ⚠️ MEDIUM ✅
**Location:** `cache-manager.js` line 136  
**Problem:** Cache entries write `version: 1` but this value is never read during `get()`. When the data schema changes between module versions (e.g., new `splitGroups` structure), stale cache entries of the old shape are served — silently causing UI regressions until the cache expires after 24 hours.

#### CACHE-02 — No Compression on Disk Cache ⚠️ LOW
**Location:** `cache-manager.js` lines 154–158  
**Problem:** JSON is written to disk without compression (`JSON.stringify(cacheEntry, null, 2)` — actually formatted with whitespace for human readability). A moderate fixture dataset with logos resolved can be 30–80 KB per league. On an SD card–backed Raspberry Pi, reducing I/O size via `zlib.gzip` would improve write speed and storage lifespan.

#### CACHE-03 — `getStats()` Reads All Files on Every Call ⚠️ LOW
**Location:** `cache-manager.js` lines 267–326  
**Problem:** The `CACHE_GET_STATS` socket notification causes `getStats()` to read and parse every `.json` file in the cache directory. If this is called frequently (e.g., triggered by a UI button or on every render cycle), it produces unnecessary disk I/O.

#### CACHE-04 — No Speculative Prefetching of Adjacent Leagues ⚠️ LOW   ✅
**Problem:** When the user manually switches to a new league, the data is only requested at switch time. If `autoCycle` is enabled, each league switch triggers a live fetch which takes several seconds. Prefetching data for the next league in the cycle ~5 seconds before it appears would eliminate the "loading skeleton" flash during cycling.

#### CACHE-05 — Memory Cache Bounded at 20 But League Count Can Exceed This ⚠️ LOW
**Location:** `cache-manager.js` line 20  
**Problem:** `maxMemoryEntries = 20`. A user with 25+ enabled leagues will experience constant LRU eviction, negating the benefit of the in-memory cache entirely.

### Recommendations

| ID | Recommendation | Priority | Status |
|----|---------------|----------|--------|
| CACHE-01 | Read the `version` field during `get()`; if version is older than current schema version, delete the cache entry and return `null` to force a fresh fetch | **HIGH** | COMPLETED
| CACHE-02 | Use `JSON.stringify(cacheEntry)` (no whitespace) for disk writes; optionally wrap with `zlib.gzip` for further savings | **MEDIUM** | COMPLETED
| CACHE-03 | Rate-limit `getStats()` calls (debounce to max once per 30 seconds) or cache the stats in memory with a short TTL | **LOW** | COMPLETED
| CACHE-04 | When `autoCycle` is enabled, pre-fetch the next league's data ~10 seconds before the cycle switches to it | **MEDIUM** | COMPLETED
| CACHE-05 | Make `maxMemoryEntries` dynamic: default to `Math.max(20, enabledLeagueCodes.length + 5)` | **LOW** | COMPLETED

---

## 5. Debugging

### Findings

#### DEBUG-01 — `debug: true` Default Produces Excessive Production Noise ⚠️ HIGH   ✅
**Problem:** As noted in SEC-01, `debug: true` is the default. This means every user's mirror logs thousands of lines per day. Stack traces, full config dumps, fixture display decisions, and logo lookup failures are all written unconditionally. Finding genuine errors in this noise is difficult.

#### DEBUG-02 — No Formal Log Level Hierarchy ⚠️ MEDIUM
**Problem:** The codebase uses `Log.info`, `Log.warn`, `Log.error`, and `console.log` interchangeably, sometimes even within the same function. There is no tiered system where `debug=1` gives only errors, `debug=2` adds warnings, `debug=3` adds info, and `debug=4` adds verbose fixture-level decisions. A user who sets `debug: true` gets everything or nothing.

#### DEBUG-03 — `console.log` / `console.error` Bypass the `debug` Guard in `node_helper.js` ⚠️ MEDIUM ✅
**Location:** `node_helper.js` lines 121–123, 216, 273–274, 279–281, 330–332, 341–343, 603–605  
**Problem:** Several `console.log` and `console.error` calls in `node_helper.js` are outside `if (debug)` guards. They fire unconditionally, including verbose fetch-result messages and cache-clear confirmations, regardless of the `debug` setting.

#### DEBUG-04 — Tagging Is Inconsistent Across the Codebase ⚠️ LOW
**Problem:** Some log lines use structured tags (`[FIXTURE-DISPLAY]`, `[PERF-08]`, `[A11Y-08]`, `[BBCParser-DEDUP]`) while many others use the generic prefix `" MMM-MyTeams-LeagueTable:"`. This makes it difficult to filter logs from a specific subsystem using terminal tools like `grep`.

#### DEBUG-05 — `sendDebugInfo()` Has No Rate Limiting ⚠️ LOW
**Location:** `node_helper.js` lines 26–34  
**Problem:** `sendDebugInfo` sends a socket notification to the frontend for every debug message. During a data fetch cycle, this can generate dozens of socket messages in a short window — adding unnecessary WebSocket overhead, especially during the initial load of multiple leagues.

### Recommendations

| ID | Recommendation | Priority | Status |
|----|---------------|----------|--------|
| DEBUG-01 | Change `debug` default to `false` (resolves SEC-01 simultaneously) | **CRITICAL** | COMPLETED
| DEBUG-02 | Implement an integer `debugLevel` (0=off, 1=errors, 2=warnings, 3=info, 4=verbose) and replace all `if (this.config.debug)` guards with level checks | **MEDIUM** | COMPLETED
| DEBUG-03 | Wrap all `console.log` calls in `node_helper.js` in `if (debug)` guards; only leave `console.error` unconditional for genuine failures | **HIGH** | COMPLETED
| DEBUG-04 | Enforce consistent tag format `[SUBSYSTEM]` across all log lines (e.g., `[NODE-HELPER]`, `[CACHE]`, `[BBC-PARSER]`, `[RENDER]`) | **LOW** | COMPLETED
| DEBUG-05 | Add a per-second rate limiter to `sendDebugInfo()` (max 5 messages/second) | **LOW** | COMPLETED

---

## 6. Innovation

### Findings & Opportunities

#### INNOV-01 — Intelligent Match-Day Scheduling 💡
**Current Behaviour:** Updates occur on a fixed `updateInterval` (default 30 minutes) regardless of whether any matches are live.  
**Opportunity:** Parse the fixture timestamps from cached data to detect match days and automatically shorten the update interval to 60 seconds during live match windows, and revert to 30 minutes between matches. This would make live score updates near-real-time without any extra configuration.

#### INNOV-02 — Live Match Push Notifications to MagicMirror Notification System 💡
**Current Behaviour:** Score changes are only reflected when the user looks at the mirror.  
**Opportunity:** Integrate with MagicMirror's `sendNotification` system to broadcast live goal, half-time, and full-time events to other modules (e.g., a notification module or alert overlay). The data to detect state transitions is already parsed; it just isn't broadcast.

#### INNOV-03 — Next Fixture Countdown Widget 💡
**Current Behaviour:** Fixtures are shown as a list; the user must read dates manually.  
**Opportunity:** Add a prominently displayed countdown timer to the next match for each highlighted team (from `highlightTeams` config). This is purely client-side — no additional fetching required since fixture timestamps are already available.

#### INNOV-04 — Service Worker for Offline-First Data 💡
**Current Behaviour:** Offline mode shows cached disk data but the UI currently shows an "offline" warning.  
**Opportunity:** Implement a browser-side service worker that caches the module's static assets (CSS, JS, images) for truly offline-capable operation, and pre-populates the service worker cache on each successful fetch.

#### INNOV-05 — Parallel Provider Fetching Instead of Sequential Fallback 💡
**Current Behaviour:** The provider chain (BBC → Wikipedia → Soccerway → Google) is sequential — each provider is tried only after the previous one fails. Total fallback time can exceed 30 seconds.  
**Opportunity:** Race all providers in parallel (using `Promise.any()`), take the first complete result, and cancel the rest. This would reduce worst-case data fetch time from ~30 seconds to ~5–8 seconds.

#### INNOV-06 — Configurable Column Sort 💡
**Current Behaviour:** The league table always displays teams in the order returned by the provider (points, then GD).  
**Opportunity:** Allow users to click any column header to re-sort the table client-side by that column (W, GD, GF, Form streak). This requires no additional fetching and is a pure UI enhancement.

---

## 7. UI/UX Experience

### Findings

#### UX-01 — `tableDensity` Config Option is Not Implemented ⚠️ HIGH ✅
**Location:** `MMM-MyTeams-LeagueTable.js` line 111  
**Problem:** The config option `tableDensity: "normal"` (accepting `"compact"`, `"normal"`, `"comfortable"`) is documented in the defaults but there is no corresponding CSS class switching logic in `createTable()` or `getDom()`. The option does nothing.

#### UX-02 — `enableVirtualScrolling` Config Option is Not Implemented ⚠️ HIGH ✅
**Location:** `MMM-MyTeams-LeagueTable.js` line 113  
**Problem:** Similarly, `enableVirtualScrolling: false` and `virtualScrollThreshold: 30` are declared in defaults but no virtual scrolling implementation exists in the codebase. Users who enable this option get no benefit.

#### UX-03 — `customTeamColors` Config Option is Not Implemented ⚠️ MEDIUM
**Location:** `MMM-MyTeams-LeagueTable.js` line 118  
**Problem:** `customTeamColors: {}` is in defaults but no code applies custom colours to team rows.

#### UX-04 — `theme: "auto"` System Dark Mode Detection Not Wired Up ⚠️ MEDIUM 
**Location:** `MMM-MyTeams-LeagueTable.js` line 117  
**Problem:** The `theme: "auto"` option implies the module should follow the OS dark/light mode preference via `window.matchMedia("(prefers-color-scheme: dark)")`. The `_applyThemeOverrides()` function only handles `darkMode: true/false/null` — it does not read the system preference when `theme === "auto"`.

#### UX-05 — No Touch/Swipe Gesture for League Switching ⚠️ MEDIUM ✅
**Problem:** On touchscreen mirrors, the only way to switch leagues is to tap the league selector buttons. A horizontal swipe gesture (left/right) to cycle leagues would be more natural and is commonly expected on touch interfaces.

#### UX-06 — Auto-Cycle Countdown Timer May Drift ⚠️ LOW
**Location:** `MMM-MyTeams-LeagueTable.js` `_startHeaderCountdown()`  
**Problem:** The header countdown uses `setInterval(1000)` but JavaScript `setInterval` is not guaranteed to fire exactly every 1000ms — on a busy Raspberry Pi, intervals can drift by 50–200ms per tick, causing the displayed countdown to desynchronise from the actual cycle timer over time.

#### UX-07 — League Button Row Overflow Handling ⚠️ LOW
**Problem:** When many leagues are selected (10+), the league button row overflows. While horizontal scroll arrows (`_addHorizontalScrollIndicators`) are implemented, they only appear after a `300ms` timeout and depend on `scrollWidth > clientWidth` which may not be accurate immediately after a DOM insertion.

### Recommendations

| ID | Recommendation | Priority | Status |
|----|---------------|----------|--------|
| UX-01 | Implement `tableDensity` by adding a CSS class (`density-compact`, `density-normal`, `density-comfortable`) to the table wrapper and defining the corresponding row padding rules in CSS | **HIGH** | COMPLETED
| UX-02 | Either implement virtual scrolling for tables with >30 rows or remove the unimplemented config option to avoid user confusion | **HIGH** | COMPLETED
| UX-03 | Implement `customTeamColors` by appending a scoped `<style>` element in `_applyThemeOverrides()` | **MEDIUM** | COMPLETED
| UX-04 | In `_applyThemeOverrides()`, when `theme === "auto"`, read `window.matchMedia("(prefers-color-scheme: dark)").matches` and apply dark/light styles accordingly | **MEDIUM** | COMPLETED
| UX-05 | Add touch `touchstart`/`touchend` swipe detection to the main wrapper for left/right league cycling | **MEDIUM** | COMPLETED
| UX-06 | Use `performance.now()` delta tracking for the countdown instead of relying on `setInterval` tick count | **LOW** | COMPLETED
| UX-07 | Use `ResizeObserver` instead of a `setTimeout` to trigger the arrow visibility check when the tab container first renders | **LOW** | COMPLETED

---

## 8. Design & Aesthetics

### Findings

#### DES-01 — Inline Styles Scattered Throughout JS ⚠️ HIGH ✅
**Problem:** Throughout `getDom()` and related rendering functions, visual styles are applied via `element.style.xxx = "..."` instead of CSS classes. Examples include `staleWarning.style.marginLeft = "8px"`, `staleWarning.style.fontWeight = "bold"`, `staleWarning.style.padding = "2px 8px"`, `staleWarning.style.borderRadius = "3px"`, `awaitingBadge.style.color = "#64B5F6"`. This duplicates styling concerns between JS and CSS, makes theming (dark mode, high-contrast) harder, and resists responsive design.

#### DES-02 — Hard-Coded Hex Colours in JavaScript ⚠️ HIGH ✅
**Problem:** Stale data severity colours (`#ffa500`, `#4CAF50`, `#FFC107`, `#FF5252`), awaiting-split badge colour (`#64B5F6`), and toggle icon colour (`#888`) are hard-coded in JS. These do not adapt to user theme overrides, and the orange/yellow/red severity palette is not consistent with the module's otherwise monochromatic dark UI.

#### DES-03 — Main Container Has Hard-Coded 120px Bottom Margin ⚠️ MEDIUM ✅
**Location:** `MMM-MyTeams-LeagueTable.css` line ~34  
**Problem:** `.spfl-league-table { margin: 0 auto 120px auto; }` — a 120px bottom margin is applied unconditionally. On small displays or when the module is in a tight layout region, this creates unnecessary blank space below the module.

#### DES-04 — Mixed Font Sizing Approach ⚠️ MEDIUM
**Problem:** Three different approaches to font sizing co-exist:
1. CSS custom properties with `clamp()` in `:root` (responsive and ideal)
2. MagicMirror utility classes (`xsmall`, `small`, `dimmed`)
3. Hard-coded `fontSize` values in JS inline styles (`font-size: 14px`)

This inconsistency makes it difficult to achieve coherent typography scaling across all views.

#### DES-05 — Stale Data Badge Colours Clash With Module Palette ⚠️ LOW
**Problem:** The `#4CAF50` (green), `#FFC107` (amber), `#FF5252` (red) Material Design colours used for data age severity stand out against the module's neutral dark palette in a way that feels inconsistent. A more subtle approach using the module's existing muted palette (e.g., `rgba(255,255,255,0.5)` → `rgba(255,100,100,0.8)`) would integrate better.

#### DES-06 — Form Token Shape Differentiation Not Reflected in Legend ⚠️ LOW
**Problem:** When `enhancedIndicatorShapes: true`, form tokens use circle (W), square (D), and triangle (L) shapes for colour-blindness support. However, there is no visible legend explaining this convention anywhere in the UI. New users cannot interpret the shapes without reading the documentation.

### Recommendations

| ID | Recommendation | Priority | Status |
|----|---------------|----------|--------|
| DES-01 | Move all inline `element.style` declarations to CSS classes; use `classList.add()` in JS instead | **HIGH** | COMPLETED
| DES-02 | Define all module colours as CSS custom properties in `:root` (e.g., `--mtlt-color-fresh`, `--mtlt-color-stale`, `--mtlt-color-warning`) and reference them in both CSS and JS via `getComputedStyle` | **HIGH** | COMPLETED
| DES-03 | Reduce default bottom margin to `20px`; make it configurable via a `bottomMargin` config option | **MEDIUM** | COMPLETED
| DES-04 | Adopt CSS custom properties exclusively for all font sizes; audit and remove all hard-coded `fontSize` values from JS | **MEDIUM** | COMPLETED
| DES-05 | Restyle data-age badges using the existing `--mtlt-` colour palette for visual consistency | **LOW** | COMPLETED
| DES-06 | When `enhancedIndicatorShapes: true`, add a small one-line form legend below the table header (e.g., "● W  ■ D  ▲ L") | **LOW** | COMPLETED

---

## 9. Implementation Strategy Summary

The table below aggregates all recommendations into a prioritised backlog. Items are ordered within priority tiers by estimated implementation effort (lower effort first).

| ID | Area | Recommendation | Priority | Effort | Status |
|----|------|---------------|----------|--------|--------|
| SEC-01 / DEBUG-01 | Security / Debug | Change `debug` default to `false` | **CRITICAL** | XS (1 line) | COMPLETED
| SEC-06 | Security | Fix typo `ENGLAND_PREMIER_guesGUE` | **CRITICAL** | XS (1 line) | COMPLETED
| SEC-02 | Security | Sanitise `fontColorOverride` before CSS injection | HIGH | S | COMPLETED
| CACHE-01 | Cache | Schema version check on cache read | HIGH | S | COMPLETED
| A11Y-01 | Accessibility | Add `scope="col"` to all table headers | HIGH | S | COMPLETED
| A11Y-02 | Accessibility | Add `aria-label` to W/D/L form tokens | HIGH | S | COMPLETED
| DEBUG-03 | Debugging | Wrap bare `console.log` in `node_helper.js` in debug guards | HIGH | S | COMPLETED
| DES-01 | Design | Move inline `element.style` to CSS classes | HIGH | M | COMPLETED
| DES-02 | Design | Define all colours as CSS custom properties | HIGH | M | COMPLETED
| PERF-04 | Performance | Remove resize listener on module stop | HIGH | M | COMPLETED
| UX-01 | UX | Implement `tableDensity` CSS class switching | HIGH | M | COMPLETED
| UX-02 | UX | Implement or remove `enableVirtualScrolling` | HIGH | M | COMPLETED
| A11Y-03 | Accessibility | Add visually-hidden zone labels for colour-coded rows | HIGH | M | COMPLETED
| SEC-03 | Security | Clamp `opacityOverride` to `[0, 1]` after parsing | **MEDIUM** | S | COMPLETED
| A11Y-06 | Accessibility | Add `aria-label` to the toggle icon element in `_createToggleIcon` | **MEDIUM** | S | COMPLETED
| DES-03 | Design | Reduce default bottom margin to `20px`; make it configurable via a `bottomMargin` config option | **MEDIUM** | S | COMPLETED
| PERF-06 | Performance | Include a `dataVersion` (e.g., timestamp of last fetch) in the render-skip key so data updates always trigger a re-render | **MEDIUM** | S | COMPLETED
| CACHE-04 | Cache | When `autoCycle` is enabled, pre-fetch the next league's data ~10 seconds before the cycle switches to it | **MEDIUM** | S | COMPLETED
| UX-04 | UX | Wire `theme: "auto"` to `prefers-color-scheme` | MEDIUM | S | COMPLETED
| UX-05 | UX | Add touch swipe gesture for league switching | MEDIUM | M | COMPLETED
| A11Y-04 | Accessibility | Respect `prefers-reduced-motion` | MEDIUM | M | COMPLETED
| A11Y-05 | Accessibility | Replace `<span role="button">` with `<button>` | MEDIUM | M | COMPLETED
| DEBUG-02 | Debugging | Implement `debugLevel` integer system | MEDIUM | M | COMPLETED
| PERF-03 | Performance | Cache `updateTeamNameColumnWidth` results per league | MEDIUM | S | COMPLETED
| UX-03 | UX | Implement `customTeamColors` rendering | MEDIUM | M | COMPLETED
| DES-04 | Design | Adopt CSS custom properties for all font sizes | MEDIUM | M | COMPLETED
| INNOV-01 | Innovation | Intelligent match-day update scheduling | MEDIUM | L | COMPLETED
| INNOV-05 | Innovation | Parallel provider racing with `Promise.any()` | MEDIUM | M | COMPLETED
| PERF-01 | Performance | Modularise and minify JS with a build step | HIGH (long) | XL | COMPLETED
| PERF-02 | Performance | Split CSS by feature and load on demand | HIGH (long) | L | COMPLETED
| INNOV-02 | Innovation | Live match push to MagicMirror notification system | LOW | M | COMPLETED
| INNOV-03 | Innovation | Next fixture countdown widget | LOW | S | COMPLETED
| INNOV-04 | Innovation | Service Worker for offline-first | LOW | L | COMPLETED
| INNOV-06 | Innovation | Clickable column sort | LOW | M | COMPLETED
| SEC-04 | Security | Strip sensitive keys from config before logging | LOW | S | COMPLETED
| SEC-05 | Security | Add TOS risk documentation for scraping | LOW | XS | COMPLETED
| CACHE-02 | Cache | Remove whitespace from disk JSON writes | LOW | XS | COMPLETED
| CACHE-03 | Cache | Rate-limit `getStats()` calls | LOW | S | COMPLETED
| CACHE-05 | Cache | Scale `maxMemoryEntries` to number of enabled leagues | LOW | XS | COMPLETED
| DEBUG-04 | Debugging | Standardise all log tags to `[SUBSYSTEM]` format | LOW | S | COMPLETED
| DEBUG-05 | Debugging | Rate-limit `sendDebugInfo()` socket messages | LOW | S | COMPLETED
| PERF-05 | Performance | Replace polling queue processor with event-driven wake | LOW | M | COMPLETED
| DES-05 | Design | Restyle data-age badges to match module palette | LOW | S | COMPLETED
| DES-06 | Design | Add form token legend when `enhancedIndicatorShapes: true` | LOW | S | COMPLETED
| UX-06 | UX | Use `performance.now()` for countdown accuracy | LOW | S | COMPLETED
| UX-07 | UX | Use `ResizeObserver` for tab arrow visibility | LOW | S | COMPLETED

**Effort key:** XS = < 15 min, S = < 1 hour, M = 1–4 hours, L = 4–8 hours, XL = multi-session



### ALL RECOMMENDATIONS COMPLETED

All recommendations from the original review have been implemented and verified in the current codebase (v3.2.0).

1. **UX-01 (Table Density)**: Implemented in `src/rendering.js`.
2. **PERF-02 (CSS Splitting)**: Implemented via modular CSS files and demand-driven loading in `rendering.js`.
3. **DES-04 (CSS Variables for Fonts)**: Standardized all font sizes using CSS variables in `:root`.
4. **INNOV-04 (Service Worker)**: Browser-side service worker implemented for offline-first support.
Implementation Status Corrections


The following items are listed as pending in the moduleReview.md summary table but are already implemented in the latest version:

PERF-01 (Modularise JS): Successfully completed in v3.0.0; logic is now split across src/.
UX-03 (Custom Team Colors): Implemented in _applyThemeOverrides within rendering.js.
A11Y-01 (Table Header Scopes): Implemented in createTableHeader within rendering.js.
UX-02 (Virtual Scrolling): Recommendation addressed by removing the unimplemented option from defaults to prevent user confusion.

*Review produced through systematic source code analysis of all primary module files. All line references are approximate and may shift with subsequent edits.*
