# How This Module Works

The **MMM-MyTeams-LeagueTable** is a comprehensive football data module for MagicMirror². It uses a distributed architecture to provide live updates while remaining efficient on low-power devices.

## 1. Architecture: The Backend (node_helper.js)
The core logic resides in the `node_helper.js`. This is the "brain" of the module that runs on your MagicMirror server (e.g., Raspberry Pi).

*   **Fetching**: The module uses a **Shared Request Manager** to fetch HTML from BBC Sport and FIFA. It includes "jitter" and rate-limiting to comply with fair-use policies and avoid being blocked.
*   **Parsing**: Instead of relying on expensive APIs, it uses specialized parsers (`BBCParser.js`, `FIFAParser.js`) to extract league standings, fixtures, and results directly from website HTML using high-performance regular expressions.
*   **Logo Resolution**: Over 1,700 team logos are managed on the backend. When data is parsed, the helper automatically attaches the correct local image path for each team, saving your browser from doing thousands of string lookups.
*   **World Cup Engine**: A dynamic resolution engine converts tournament placeholders (like "Winner Group A") into real team names as results come in.

## 2. Multi-Source Parsing Engine
The module uses a **Provider Factory** pattern to select the most appropriate parser based on the data source. Each parser uses unique heuristics to navigate different website structures:

### A. BBC Sport Parser (`BBCParser.js`)
*   **Heuristics**: Primarily looks for `<table>` elements and validates them by checking for headers like "Team", "Played", and "Points".
*   **Modern Layout Support**: If no tables are found, it switches to a secondary strategy that targets ARIA-labeled `role="row"` elements within `<div>` or `<article>` tags.
*   **UEFA Group Detection**: Uses a 300-character backward-looking buffer from the table to identify nearby "Group A" headers for Champions League and similar tournaments.
*   **Fixture Logic**: Implements a complex header-based splitting system to separate fixtures by date and competition stage.

### B. ESPN Parser (`ESPNParser.js`)
*   **Split-Table Strategy**: ESPN often uses a "dual-table" approach (one for team names, one for stats). The parser identifies these by the `Table--fixed` and `Table--ls` classes and joins them by row index.
*   **Single-Table Fallback**: If the dual-table layout is missing, it searches for any table containing "GP" (Games Played) and "PTS" (Points) headers.
*   **Heuristics**: Uses specific class names like `TeamLink` and `hide-mobile` to locate team names within rows.

### C. Soccerway Parser (`SoccerwayParser.js`)
*   **Class-Targeted Parsing**: Focuses on tables with the `leaguetable` class.
*   **Statistical Heuristics**: Uses a specialized `_extractStat` method that looks for cells with classes like `number mp` (matches played), `number won`, etc.
*   **Row Filtering**: Explicitly skips `<thead>` and `<th>` blocks to ensure only data rows are processed.

### D. Wikipedia Parser (`WikipediaParser.js`)
*   **"Best Table" Heuristic**: Wikipedia pages often have multiple tables. The parser calculates the row count of every `wikitable` and selects the largest one that contains "Team" or "Pos" keywords.
*   **Multi-Group Support**: For leagues with mid-season splits (e.g., Romania, Scotland, Austria, etc.), the parser uses a robust multi-strategy approach to extract ALL group tables (Championship, Relegation, etc.) simultaneously.
*   **Heading Keyword Match**: Scans each table's nearest preceding heading for specific keywords (e.g., "Championship round", "Play-off Group", "Bottom Six").
*   **Size-Based Fallback**: If headings are missing or non-standard, it uses a size-based match (within ±2 tolerance) based on the league's defined split group sizes.
*   **Deduplication**: Uses a `usedIndices` tracking system to ensure each table is only claimed by one group, preventing data duplication.
*   **Stat Normalization**: Wikipedia uses a non-standard minus character (`−`, U+2212) for goal difference. The parser normalizes this to a standard hyphen before numeric conversion.
*   **Identity Extraction**: Prioritizes `<a>` tag `title` attributes for team names to avoid superscript citation numbers (e.g., "[1]") often found in plain text cells.

### E. Google Search Parser (`GoogleParser.js`)
*   **Snippet-Targeted Parsing**: Optimized for Google's "sports snippets" which often appear at the top of search results.
*   **Resilient Heuristics**: Uses a multi-pass approach to identify standard table structures (P, W, D, L, GD, Pts) even when class names are obfuscated or dynamic.
*   **Safe Data Extraction**: Prioritizes `aria-label` and `title` attributes for team names to ensure accuracy and accessibility compliance.
*   **Dynamic Column Mapping**: Automatically detects and maps columns based on header content, ensuring compatibility with varying Google layout updates.

## 3. League Split System
To handle the complexity of European leagues that split into Championship and Relegation groups mid-season, the module implements a robust **Split Configuration** system:

*   **Split Configuration**: The `LEAGUE_SPLITS` constant in `MMM-MyTeams-LeagueTable.js` defines the mechanics for leagues like the Romanian Liga I, Scottish Premiership, Austrian Bundesliga, Belgian Pro League, Greece Super League, Cyprus First Division, and Israel Premier League. This includes regular season game counts, group sizes, and point carryover rules.
*   **Awaiting Split Resilience**: A specialized state detection system handles the "limbo" period when the first phase of a split-season league has finished but the split groups haven't been officially announced. The module prevents 404 errors by detecting the completed game count and displaying a **⏳ AWAITING SPLIT** badge in the header.
*   **Multi-Group Rendering**: When a split is detected, the module creates a `splitGroups` data structure that allows the frontend to render multiple tables simultaneously.
*   **Labeled Separators**: The UI inserts centered, uppercase separator rows between groups to clearly label the "Championship Group", "Relegation Group", etc.
*   **Group-Aware Coloring**: Promotion and relegation zone coloring is applied independently within each group (e.g., the top 2 teams in the Championship group get promotion colors, while the bottom 2 teams in the Relegation group get relegation colors).
*   **Smart Escalation**: If the primary provider (e.g., BBC Sport) returns only the Championship group (a common occurrence post-split), the module automatically detects the missing data and escalates to Wikipedia to fetch the complete multi-group standings.
*   **Cache Integrity**: The `isDataComplete` logic ensures that if a league is configured for multiple groups, cached data without the `splitGroups` structure is rejected as stale, forcing a fresh fetch for the complete post-split view.

## 4. Smart Fallback & Data Resilience

The module implements a robust decision-making engine to ensure that the user always sees the most complete and accurate data, even during provider transitions or outages.

```mermaid
flowchart TD
    Start([Start Data Fetch]) --> Primary{Fetch Primary Provider\n(e.g., BBC Sport)}
    
    Primary -- Success --> Validate{Validate Data\n(isDataComplete)}
    Primary -- Error --> CacheCheck{Check Local Cache}
    
    Validate -- Complete --> Save[Save to Cache & Display]
    Validate -- Incomplete --> CacheCheck
    
    CacheCheck -- Has Valid Cache --> ServeCache[Serve Cached Data\n+ STALE Badge]
    CacheCheck -- No Cache --> Secondary{Fetch Secondary Provider\n(Wikipedia/Soccerway)}
    
    Secondary -- Success --> Save
    Secondary -- Fail --> FinalFallback[Display Error / Stub Data]

    subgraph "Validation Logic"
    V1[Check for All-Zero Stats]
    V2[Check for Missing Form]
    V3[Identify Stub Pages]
    end
```

### Key Resilience Features:
- **Pre-Split Deduplication**: During pre-season, the module detects when providers return multiple empty "split" tables and automatically deduplicates them into a single, clean standings view.
- **Calendar-Year Awareness**: The system distinguishes between "new season" zeros (expected in July for EPL) and "mid-season" zeros (indicating a parsing failure for leagues like Norway Eliteserien that play through the summer).
- **Stat Header Enforcement**: The Wikipedia parser now requires statistical headers (Pld, Pts) to avoid accidental extraction from stadium or personnel lists.
- **Boundary-Aware Column Mapping**: Regex boundaries prevent short labels (like "P") from incorrectly matching and duplicating data from other columns.

## 5. Smart Caching System
To ensure speed and reliability, the module implements a multi-tier caching strategy:
*   **Memory Cache**: Data is stored in RAM for near-instant access during league switching.
*   **Disk Persistence**: Data is saved to the `.cache/` folder. If your mirror restarts or loses internet, it can load the last known standings immediately.
*   **Proactive Caching**: When you switch leagues, the module serves the cached version *first* so you see data instantly, then fetches a live update in the background.
*   **Stale Fallback**: If a live update fails, the module continues to display the cached data but adds a "STALE" indicator to the header.

## 5. Architecture: The Frontend (MMM-MyTeams-LeagueTable.js)
The frontend is responsible for the visual presentation and user interaction.

*   **DOM Batching**: It uses `DocumentFragment` to update the screen in one go, preventing flickering and reducing CPU usage.
*   **Horizontal Navigation**: A thin, styled scrollbar and directional arrow indicators enable effortless navigation when more leagues are selected than can fit in the header.
*   **Vertical Scroll Within Tables**: The standings table for every league is wrapped in `.league-body-scroll`, a `flex` child of `.league-content-container` that has `max-height: var(--mtlt-max-table-height)` (450px by default) and `overflow-y: auto`. A thin custom scrollbar (`scrollbar-width: thin` plus `::-webkit-scrollbar` rules) lets users reach every team in the table, even on 36-team UEFA league-phase standings.
*   **UEFA View Layout Contract**: For UEFA competitions, `createUEFAView()` in `src/rendering.js` produces a nested wrapper `.uefa-view` that contains the sub-tab bar (`.sub-tab-navigation`) and a `.league-body-scroll` holding the standings `.spfl-table`. To preserve the vertical scrollbar above, `css/MMM-MyTeams-LeagueTable-UEFA.css` promotes `.league-mode-uefa .uefa-view` into a flex column (`display: flex; flex-direction: column; flex: 1 1 auto; min-height: 0`) and pins the tab bar via `flex: 0 0 auto`, leaving `.league-body-scroll`'s existing `flex: 1 1 auto` to receive the remaining height.
*   **Enhanced Header Interaction**: Redesigned, high-contrast buttons for Refresh, Clear Cache, and Pin, using **shape-coded differentiation** (Circle, Square, Diamond) and tactical animations (spin, fill, and thumbtack tilt). Buttons are arranged in a logical left-to-right sequence (Refresh → Clear → Pin).
*   **Responsive UI**: The layout adapts to your mirror's size using CSS `clamp()` for fluid typography and flexible containers.
*   **Interactivity**: The module supports touch and mouse interaction for switching leagues, viewing fixtures, and manual refreshing.
*   **Auto-Cycling**: If configured, the module automatically rotates through your selected leagues at a set interval.

## 5. Modular Architecture & Build Process
The module uses a modern, modular JavaScript structure located in the `src/` directory. This improves maintainability and allows for a clean separation of concerns.

### A. Source Files (`src/`)
*   **`index.js`**: The entry point. It handles module registration, default configurations, and lifecycle hooks (`start`, `getHeader`, `getScripts`). It merges all other functional modules into the main MagicMirror module object.
*   **`rendering.js`**: The visual engine. Contains `getDom()`, `createTable()`, and all logic related to building the HTML structure, including league-specific views (UEFA, World Cup) and split league support.
*   **`state.js`**: Manages the module's internal data, including league data storage, update scheduling, cycling logic, and socket notification handling.
*   **`logos.js`**: Handles team logo resolution and mapping logic on the client side.
*   **`utils.js`**: A collection of shared helper functions for logging, date validation, color verification, and string normalization.
*   **`accessibility.js`**: Dedicated logic for ARIA live regions and screen-reader announcements.
*   **`config.js`**: Centralized default configuration values.
*   **`constants.js`**: Shared constants like league headers, tab abbreviations, and team aliases.

### B. Build Process (`esbuild`)
To ensure optimal performance on Raspberry Pi and other low-power devices, the source files are bundled and minified into a single file:
*   **Target**: `MMM-MyTeams-LeagueTable.js`
*   **Command**: `npm run build`
*   **Tool**: Uses `esbuild` to merge all `src/*.js` files into a high-performance, 13-line production bundle.

**Note**: You should never edit `MMM-MyTeams-LeagueTable.js` directly. Always make changes in the `src/` directory and run the build command to update the production file.

## 6. Logo Mapping Logic
Team crests are resolved using a multi-step process:
1.  **Direct Map**: Check the pre-defined `team-logo-mappings.js`.
2.  **Normalized Match**: Case-insensitive matching (e.g., "St Mirren" matches "st-mirren.png").
3.  **Diacritic Removal**: Handles accented characters (e.g., "Bodø" matches "bodo").
4.  **Alphanumeric Stripping**: Removes special characters to find the best match.

## 6. Security & Stability
*   **Sanitization**: All dynamic data is sanitized before being displayed to prevent security vulnerabilities.
*   **Rate Limiting**: The module intelligently backs off if it encounters errors or high latency from data sources.
*   **ReDoS Protection**: All regular expressions are audited to ensure they cannot cause "Regular Expression Denial of Service" when processing large amounts of data.
