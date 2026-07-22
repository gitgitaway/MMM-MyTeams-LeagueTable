# AI Agent Instructions for MMM-MyTeams-LeagueTable Module Development

## General Coding Principles

My preference is for minimal chat but good real life language explanations of why existing code is incorrect should be given alongside the production of any improved script. AI should use Python scripts in preference to PowerShell scripts for all editing/fix operations as this minimises the risk of file corruption/truncating. All code blocks produced are to be fully annotated in real life English language. All .js code and scripts should contain robust error handling and logging to assist in debugging. All scripts produced should be fully annotated and path agnostic to allow them to be used by any user on PC, Raspberry Pi or Mac. Additional suggested or recommended performance enhancements or UI improvements should be made at the end of the response.

---

## Critical Security Standards (Based on v1.9.0 Learnings)

### 1. DOM Manipulation Security

**Problem**: innerHTML usage creates XSS vulnerabilities when displaying scraped web content.

**Mandatory Practices**:

- ❌ **NEVER** use `innerHTML` for dynamic content
- ✅ **ALWAYS** use `createElement()` + `textContent` or `appendChild()`
- ✅ Create helper functions for repetitive patterns:

  ```javascript
  // Helper for safe icon creation
  createIcon(iconClass) {
    const icon = document.createElement("i");
    icon.className = iconClass;
    return icon;
  }

  // Helper for table cells with ARIA
  createTableCell(content = "", className = "") {
    const td = document.createElement("td");
    if (content) td.textContent = content; // textContent, not innerHTML
    if (className) td.className = className;
    td.setAttribute("role", "cell");
    return td;
  }
  ```

### 2. Input Validation

**Problem**: User-provided config values (dates, URLs, strings) can cause crashes or exploits.

**Mandatory Practices**:

- ✅ Validate ALL user inputs from config
- ✅ Check for NaN, null, undefined, empty strings
- ✅ Validate ranges for numeric inputs (e.g., years 1900-2100)
- ✅ Log warnings for invalid inputs with clear messages
- ✅ Provide safe fallbacks (don't crash)
  ```javascript
  validateDateTimeOverride(dateString) {
    if (!dateString || typeof dateString !== "string") {
      Log.warn(`Invalid dateTimeOverride type: ${typeof dateString}`);
      return null;
    }
    const override = new Date(dateString);
    if (isNaN(override.getTime())) {
      Log.warn(`Invalid dateTimeOverride format: ${dateString}`);
      return null;
    }
    const year = override.getFullYear();
    if (year < 1900 || year > 2100) {
      Log.warn(`Year out of range (1900-2100): ${year}`);
      return null;
    }
    return override;
  }
  ```

### 3. Production Logging

**Problem**: Console logging in production degrades performance on low-power devices (Raspberry Pi).

**Mandatory Practices**:

- ❌ **NEVER** use raw `console.log()` without debug checks
- ✅ **ALWAYS** wrap in conditional: `if (this.config.debug) { Log.info(...) }`
- ✅ Use MagicMirror's `Log` helper for consistency
- ✅ Reserve unconditional logging only for critical errors
- ✅ **ALWAYS** Implementing log level system (ERROR, WARN, INFO, DEBUG)

  ```javascript
  // WRONG
  console.log(`Fetching data for ${leagueType}`);

  // CORRECT
  if (this.config.debug) {
  	Log.info(`Fetching data for ${leagueType}`);
  }
  ```

---

## Data Quality & Parsing Standards (Based on v1.8.1-v1.8.4 Learnings)

### 4. Web Scraping Robustness

**Problem**: BBC Sport HTML changes cause data corruption, truncation, and duplicates.

**Mandatory Practices**:

#### A. Multi-Strategy Extraction

- ✅ **ALWAYS** implement fallback extraction methods
- ✅ Priority order: 1) ARIA labels, 2) Specific selectors, 3) Regex scanning
- ✅ Never rely on a single HTML structure

  ```javascript
  // Strategy 1: ARIA label (most reliable)
  let score = element.getAttribute("aria-label")?.match(/(\d+)\s*-\s*(\d+)/);

  // Strategy 2: Specific class selectors
  if (!score) {
  	const homeScore = element.querySelector(".home-score")?.textContent;
  	const awayScore = element.querySelector(".away-score")?.textContent;
  	if (homeScore && awayScore) score = [null, homeScore, awayScore];
  }

  // Strategy 3: Regex fallback
  if (!score) {
  	score = element.textContent.match(/(\d+)\s*-\s*(\d+)/);
  }
  ```

#### B. Team Name Normalization

**Problem**: Over-aggressive normalization removes essential identity words, causing false matches.

**Mandatory Practices**:

- ❌ **NEVER** strip words like "United", "City", "Atletico", "Dortmund"
- ✅ Only normalize: case, whitespace, diacritics, special characters
- ✅ Preserve all meaningful words

  ```javascript
  // WRONG - Too aggressive
  normalize(str) {
    return str.toLowerCase()
      .replace(/\b(united|city|atletico|real|fc|sc)\b/g, '') // Strips identity!
      .replace(/[^a-z0-9]/g, '');
  }

  // CORRECT - Preserves identity
  normalize(str) {
    return removeDiacritics(str)  // café → cafe
      .toLowerCase()               // Case insensitive
      .replace(/\s+/g, ' ')        // Normalize spaces
      .trim()
      .replace(/[.,]/g, '');       // Remove punctuation only
  }
  ```

#### C. Duplicate Detection & Fuzzy Matching

**Problem**: Truncated team names create duplicates; need intelligent deduplication.

**Mandatory Practices**:

- ✅ Implement bidirectional substring matching
- ✅ Compare within reasonable time windows (14 days for two-legged ties)
- ✅ Prefer longer/complete names when choosing between duplicates
- ✅ Log all deduplication decisions for debugging
  ```javascript
  areSimilarTeams(name1, name2) {
    const norm1 = this.normalize(name1);
    const norm2 = this.normalize(name2);

    // Exact match
    if (norm1 === norm2) return true;

    // Bidirectional substring (handles "Newcastle" vs "Newcastle United")
    if (norm1.includes(norm2) || norm2.includes(norm1)) {
      const minLength = Math.min(norm1.length, norm2.length);
      if (minLength >= 5) return true; // Minimum 5 chars to avoid false matches
    }

    return false;
  }
  ```

#### D. Defensive Data Checking

**Problem**: Malformed data causes crashes; need comprehensive guards.

**Mandatory Practices**:

- ✅ Check for null/undefined before accessing properties
- ✅ Validate data types (is it really an array? a number? a string?)
- ✅ Provide default values for missing data
- ✅ Log warnings for unexpected data shapes

  ```javascript
  // WRONG - No checks
  const teamName = fixture.teams.home.name.toUpperCase();

  // CORRECT - Defensive
  const teamName = fixture?.teams?.home?.name
  	? String(fixture.teams.home.name).toUpperCase()
  	: "Unknown Team";

  if (!teamName || teamName === "Unknown Team") {
  	if (this.config.debug) {
  		Log.warn(`Missing team name in fixture:`, fixture);
  	}
  }
  ```

---

## Accessibility Standards (Based on v1.9.0 Learnings)

### 5. WCAG 2.1 Level AA Compliance

**Problem**: Missing ARIA attributes and keyboard navigation exclude screen reader and keyboard-only users.

**Mandatory Practices**:

#### A. Table Accessibility

- ✅ Add `role="table"` and descriptive `aria-label` to tables
- ✅ Add `role="row"` and `aria-rowindex` to rows
- ✅ Add `role="columnheader"` and `aria-sort` to headers
- ✅ Add `role="cell"` to data cells

  ```javascript
  const table = document.createElement("table");
  table.setAttribute("role", "table");
  table.setAttribute("aria-label", `${leagueName} Standings Table`);

  const row = document.createElement("tr");
  row.setAttribute("role", "row");
  row.setAttribute("aria-rowindex", index + 1);

  const header = document.createElement("th");
  header.setAttribute("role", "columnheader");
  header.setAttribute("aria-sort", "none");
  ```

#### B. Keyboard Navigation

- ✅ All interactive elements must support keyboard (Enter/Space)
- ✅ Add `tabindex="0"` to make elements focusable
- ✅ Create helper for consistent keyboard support

  ```javascript
  addKeyboardNavigation(element, callback) {
    if (!element) return;
    element.setAttribute("tabindex", "0");
    element.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " " || e.key === "Spacebar") {
        e.preventDefault();
        if (callback) callback(e);
      }
    });
  }

  // Usage
  refreshBtn.addEventListener("click", refreshHandler);
  this.addKeyboardNavigation(refreshBtn, refreshHandler);
  ```

#### C. Interactive Element Labels

- ✅ Add both `aria-label` and `title` for tooltips
- ✅ Use `aria-pressed` for toggle buttons
- ✅ Provide descriptive labels (not just "Button" or "Icon")
  ```javascript
  const pinBtn = document.createElement("button");
  pinBtn.setAttribute("aria-label", "Pin (pause auto-cycling)");
  pinBtn.setAttribute("aria-pressed", "false");
  pinBtn.title = "Pin (pause auto-cycling)";
  ```

---

## Display Logic Standards (Based on v1.8.1-v1.8.3 Learnings)

### 6. State Detection & Display Logic

**Problem**: Confusion between showing times vs scores leads to incorrect displays (e.g., "0-0" when should show "15:00").

**Mandatory Practices**:

#### A. Clear State Flags

- ✅ Use explicit boolean flags for state (isLive, isUpcoming, isFinished)
- ✅ Don't infer state from ambiguous data (e.g., "0-0" could be live or upcoming)
- ✅ Prioritize reliable indicators: `live` flag, `status` field, `time` field
  ```javascript
  // Explicit state detection
  const hasKickoffTime =
  	fix.time && fix.time !== "vs" && /\d{1,2}:\d{2}/.test(fix.time);
  const hasScore = fix.homeScore !== undefined && fix.awayScore !== undefined;
  const isLive =
  	fix.live === true || (fix.status && !fix.status.match(/FT|Full/i));
  const isFinished = fix.status?.match(/FT|Full/i);
  const isUpcoming = hasKickoffTime && !hasScore && !isLive;
  ```

#### B. Conditional Display Logic

- ✅ Use clear if/else chains based on states
- ✅ Log display decisions in debug mode
- ✅ Always have a fallback display

  ```javascript
  let displayText = "";

  if (isUpcoming) {
  	displayText = fix.time || "TBD";
  	if (this.config.debug) Log.info(`Upcoming: showing time "${displayText}"`);
  } else if (isLive) {
  	displayText = `${fix.homeScore} - ${fix.awayScore}`;
  	if (this.config.debug) Log.info(`Live: showing score "${displayText}"`);
  } else if (isFinished) {
  	displayText = `${fix.homeScore} - ${fix.awayScore}`;
  	if (this.config.debug) Log.info(`Finished: showing score "${displayText}"`);
  } else {
  	displayText = fix.time || fix.score || "vs"; // Fallback
  	if (this.config.debug)
  		Log.warn(`Unknown state: defaulting to "${displayText}"`);
  }
  ```

#### C. Status Tag Display

- ✅ Never show status tags (FT, HT, 85') for upcoming fixtures
- ✅ Only show for live or finished matches
- ✅ Validate status field exists before displaying

  ```javascript
  // WRONG - Shows status for upcoming matches
  if (fix.status) {
  	statusDiv.textContent = fix.status;
  }

  // CORRECT - Only for live/finished
  if (fix.status && !isUpcoming) {
  	statusDiv.textContent = fix.status;
  	if (isLive) statusDiv.classList.add("live-tag");
  }
  ```

---

## UI/UX Consistency Standards (Based on v1.8.2-v1.8.4 Learnings)

### 7. Layout Stability

**Problem**: Dynamic sizing and flex layouts cause inconsistent heights and layout shifts.

**Mandatory Practices**:

#### A. Fixed Heights for Predictability

- ❌ **AVOID** dynamic flex sizing that grows/shrinks unpredictably
- ✅ **USE** fixed heights for consistent display
- ✅ Enable scrolling when content exceeds fixed height

  ```css
  /* WRONG - Unpredictable sizing */
  .section-wrapper {
  	flex: 1 1 50%; /* Can grow/shrink */
  	max-height: 600px;
  }

  /* CORRECT - Fixed sizing */
  .section-wrapper {
  	height: 165px; /* Exact height */
  	overflow-y: auto; /* Scroll if needed */
  }
  ```

#### B. Scoped CSS Changes

- ✅ Use specific selectors to limit scope of CSS changes
- ✅ Don't let changes affect unrelated components
- ✅ Test multiple views to ensure no side effects

  ```css
  /* WRONG - Too broad, affects everything */
  .fixture-row-v2 td {
  	padding: 6px 4px;
  }

  /* CORRECT - Scoped to specific section */
  .uefa-section-scroll .fixture-row-v2 td {
  	padding: 6px 4px;
  }
  ```

#### C. Scroll Behavior Consistency

- ✅ Ensure all similar sections have identical scroll behavior
- ✅ Use same scroll heights across related views
- ✅ Maintain scroll position when data updates

  ```javascript
  // Store scroll position before update
  const scrollPos = container.scrollTop;

  // Update content
  this.updateDOM();

  // Restore scroll position
  setTimeout(() => {
  	container.scrollTop = scrollPos;
  }, 100);
  ```

---

## Performance Optimization Standards (Based on v1.7.5 Learnings)

### 8. Raspberry Pi Optimization

**Problem**: Raspberry Pi has limited CPU/memory; need optimization for low-power devices.

**Mandatory Practices**:

#### A. Lazy Loading

- ✅ Use `loading="lazy"` for images
- ✅ Only load visible content initially
- ✅ Defer non-critical operations
  ```javascript
  const img = document.createElement("img");
  img.loading = "lazy"; // Browser-native lazy loading
  img.src = logoPath;
  ```

#### B. Minimize DOM Operations

- ✅ Batch DOM updates using DocumentFragment
- ✅ Minimize reflows by updating off-screen elements
- ✅ Use CSS containment for layout optimization

  ```javascript
  // WRONG - Multiple reflows
  container.innerHTML = "";
  teams.forEach((team) => {
  	const row = createRow(team);
  	container.appendChild(row); // Reflow each time!
  });

  // CORRECT - Single reflow
  const fragment = document.createDocumentFragment();
  teams.forEach((team) => {
  	const row = createRow(team);
  	fragment.appendChild(row);
  });
  container.innerHTML = "";
  container.appendChild(fragment); // Single reflow
  ```

#### C. Caching Strategy

- ✅ Implement multi-tier caching (memory + disk)
- ✅ Use appropriate TTLs (time-to-live)
- ✅ Clean up stale cache automatically

  ```javascript
  // Memory cache for speed
  this.memoryCache = new Map();

  // Disk cache for persistence
  this.diskCache = new CacheManager(__dirname);

  // Check memory first, then disk, then fetch
  let data = this.memoryCache.get(key);
  if (!data) {
  	data = this.diskCache.get(key);
  	if (data) this.memoryCache.set(key, data);
  }
  if (!data) {
  	data = await this.fetchData(url);
  	this.memoryCache.set(key, data);
  	this.diskCache.set(key, data);
  }
  ```

---

## Testing & Documentation Standards

### 9. Diagnostic Logging for Debugging

**Mandatory Practices**:

- ✅ Use tagged logging for easy filtering: `[BBCParser-DEDUP]`, `[FIXTURE-DISPLAY]`
- ✅ Log key decision points (what was chosen and why)
- ✅ Include data context in logs (team names, dates, states)
- ✅ Always wrap in debug checks for production
  ```javascript
  if (this.config.debug) {
  	Log.info(`[BBCParser-DEDUP] Found duplicate: "${name1}" vs "${name2}"`);
  	Log.info(
  		`[BBCParser-DEDUP] Choosing "${longerName}" (length: ${longerName.length})`
  	);
  }
  ```

### 10. Documentation Requirements

**Mandatory Practices**:

- ✅ Update CHANGELOG.md with every significant change
- ✅ Include "why" explanations, not just "what"
- ✅ Document known issues and workarounds
- ✅ Provide before/after examples for bug fixes
- ✅ List all modified files with line ranges

  ```markdown
  ## [v1.x.x] - Fix Description

  ### Problem

  - **What was wrong**: Newcastle showing as "Newcastle" instead of "Newcastle United"
  - **Why it happened**: Over-aggressive normalization stripped "United"
  - **Impact**: Logo lookup failed, duplicate entries created

  ### Solution

  - Preserve identity words in normalization
  - Implement bidirectional substring matching
  - Select longer name when duplicates detected

  ### Files Modified

  - `BBCParser.js` (Lines 755-763): Simplified normalization
  - `BBCParser.js` (Lines 992-1050): Added partial name detection
  ```

---

## Code Review Checklist

Before submitting any code changes, verify:

### Security ✅

- [ ] No innerHTML usage (use createElement + textContent)
- [ ] All config inputs validated
- [ ] Console logging wrapped in debug checks

### Accessibility ✅

- [ ] ARIA attributes on tables (role, aria-label, aria-rowindex)
- [ ] Keyboard navigation on interactive elements (Enter/Space)
- [ ] Descriptive labels on all controls (aria-label, title)

### Data Quality ✅

- [ ] Multi-strategy parsing with fallbacks
- [ ] Defensive null/undefined checks
- [ ] Fuzzy matching for duplicates
- [ ] Normalization preserves identity words

### Display Logic ✅

- [ ] Clear state detection (isLive, isUpcoming, isFinished)
- [ ] Conditional display based on states
- [ ] Logging of display decisions (in debug mode)

### UI/UX ✅

- [ ] Fixed heights for layout stability
- [ ] Scoped CSS changes
- [ ] Consistent scroll behavior

### Performance ✅

- [ ] Lazy loading for images
- [ ] Batched DOM updates (DocumentFragment)
- [ ] Multi-tier caching (memory + disk)

### Documentation ✅

- [ ] CHANGELOG.md updated with problem/solution/files
- [ ] Tagged diagnostic logging for debugging
- [ ] Comments explain "why", not just "what"

---

## Summary: Learn from History

This module has repeatedly encountered issues in these areas:

1. **Security**: innerHTML XSS, missing input validation
2. **Data Quality**: Aggressive normalization, poor fuzzy matching
3. **Accessibility**: Missing ARIA, no keyboard support
4. **Display Logic**: State confusion (time vs score)
5. **UI Stability**: Dynamic sizing causing layout shifts
6. **Parsing**: Single-strategy extraction breaking on HTML changes
7. **Performance**: Unchecked logging degrading Raspberry Pi performance

**Every future code change MUST address these known failure patterns proactively.**

---

description: Repository Information Overview
alwaysApply: true

---

# MMM-MyTeams-LeagueTable Information

## Summary

A **MagicMirror²** module that displays football league standings from multiple competitions including FIFA World Cup 2026, UEFA Champions League, English Premier League, and various European leagues. It features a resilient parsing system from BBC Sport and FIFA, intelligent caching, and automated team logo mapping.

## Structure

- `.cache/`: Local storage for fetched league standings JSON files.
- `documentation/`: Detailed guides for caching, configuration, and league pages.
- `images/crests/`: Directory containing team logo images organized by country.
- `screenshots/`: Visual previews of the module in different configurations.
- `tools/`: Bash and PowerShell utility scripts for image management and mapping template generation.
- `translations/`: Localization files for EN, DE, ES, FR, GA, GD, IT, NL, and PT.
- `MMM-MyTeams-LeagueTable.js`: Main client-side module file for MagicMirror.
- `node_helper.js`: Backend helper responsible for fetching, parsing, and caching league data.
- `cache-manager.js`: Logic for managing memory and disk persistence of league data.
- `team-logo-mappings.js`: Data mapping for normalized team names to logo image paths.

## Language & Runtime

**Language**: JavaScript  
**Version**: Node.js >= 14.0.0  
**Build System**: None (Standard Node.js module)  
**Package Manager**: npm

## Dependencies

**Main Dependencies**:

- `node-fetch`: ^2.7.0 (Used for server-side HTTP requests in node_helper)

**Development Dependencies**:

- `eslint`: ^8.0.0
- `prettier`: ^2.0.0

## Build & Installation

```bash
# Navigate to MagicMirror modules directory
cd ~/MagicMirror/modules/

# Clone the repository
git clone https://github.com/gitgitaway/MMM-MyTeams-LeagueTable.git

# Install dependencies
cd MMM-MyTeams-LeagueTable
npm install

# Lint code
npm run lint

# Format code
npm run format
```

## Main Files & Resources

- **Entry Point**: `MMM-MyTeams-LeagueTable.js`
- **Backend Helper**: `node_helper.js`
- **Data Cache**: `.cache/*.json`
- **Logo Mappings**: `team-logo-mappings.js`
- **Configuration**: Managed within the MagicMirror `config/config.js` file.

## Testing & Validation

**Quality Checks**:

- ESLint is used for static code analysis.
- Prettier is used for code formatting.

**Run Command**:

```bash
npm run lint
```
